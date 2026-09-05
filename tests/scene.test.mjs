import test from "node:test";
import assert from "node:assert/strict";

import {
  History,
  addLayer,
  applyLayout,
  applyTemplate,
  constrainLayer,
  createScene,
  describe,
  duplicateLayer,
  installState,
  makeCharacterLayer,
  makeLogoLayer,
  makeTextLayer,
  movableLayers,
  qrLevelFor,
  removeLayer,
  reorderLayer,
  restore,
  roleLayer,
  selectLayer,
  selectedLayer,
  setLayerOrder,
  setIncludeInstall,
  setLayerProps,
  setMode,
  setPaymentSummary,
  setQrDesign,
  snapshot,
  syncBoundText,
} from "../src/scene.js";
import { CAPTIONS, INSTALL_LAYER, LAYOUTS, OUTPUT, TEMPLATES } from "../src/catalog.js";

test("createScene builds background, qr and template layers", () => {
  const scene = createScene({ mode: "link" });
  assert.equal(scene.mode, "link");
  assert.equal(scene.templateId, "link-rampart");
  assert.equal(scene.order[0], "background");
  assert.equal(scene.order[1], "qr");
  assert.equal(scene.order[2], "install");
  assert.equal(scene.selectedLayerId, "qr");
  assert.equal(scene.layers.background.locked, true);
  assert.equal(scene.layers.background.deletable, false);
  assert.equal(scene.layers.background.width, OUTPUT.width);
  assert.equal(scene.layoutId, TEMPLATES["link-rampart"].layoutId);
  assert.equal(scene.layers.qr.width, LAYOUTS[scene.layoutId].qr.size);
  assert.deepEqual(scene.content, {
    url: "", giftLink: "", address: "", amount: "", memo: "", label: "", message: "",
  });

  const template = TEMPLATES["link-rampart"];
  const added = scene.order.slice(3);
  assert.equal(added.length, template.layers.length);
  assert.equal(added[0], "logo-1");
  assert.equal(added[1], "character-2");
  assert.equal(added[2], "text-3");
  assert.equal(scene.nextLayerId, 4);
  const caption = scene.layers["text-3"];
  assert.equal(caption.role, "caption");
  assert.equal(caption.text, CAPTIONS.link);
  assert.equal(caption.x, LAYOUTS[scene.layoutId].caption.x);
});

test("template logo layers take size from the catalog and pair the themed character", () => {
  const scene = createScene({ templateId: "giftcard-forest" });
  assert.equal(scene.mode, "giftcard");
  const logo = scene.layers["logo-1"];
  assert.equal(logo.width, LAYOUTS.center.logo.width);
  assert.equal(logo.height, LAYOUTS.center.logo.height);
  assert.equal(logo.color, null);
  assert.equal(scene.layers["character-2"].assetId, "grove");
  assert.equal(TEMPLATES["payment-forest"].layers[0].assetId, "zcash", "payment cards carry the Zcash mark");
});

test("every card type gets one template per theme, Brass Rampart + Classic first", () => {
  for (const mode of ["payment", "link", "giftcard"]) {
    const ids = Object.values(TEMPLATES).filter((t) => t.mode === mode).map((t) => t.id);
    assert.equal(ids.length, 13);
    assert.equal(ids[0], `${mode}-rampart`);
    assert.equal(TEMPLATES[ids[0]].layers[1].assetId, "classic");
  }
});

test("payment scenes have no install layer, giftcard scenes require one", () => {
  const payment = createScene({ mode: "payment" });
  assert.equal(installState(payment), "none");
  assert.equal(payment.layers.install, undefined);

  const gift = createScene({ mode: "giftcard" });
  assert.equal(installState(gift), "required");
  assert.ok(gift.layers.install);
});

test("setMode adds and removes the install layer without touching artwork", () => {
  const scene = createScene({ mode: "link" });
  const artwork = movableLayers(scene).filter((layer) => layer.kind === "character").length;
  scene.selectedLayerId = "install";

  setMode(scene, "payment");
  assert.equal(scene.layers.install, undefined);
  assert.equal(scene.order.includes("install"), false);
  assert.equal(scene.selectedLayerId, "qr");
  assert.equal(scene.templateId, "link-rampart", "template is not auto-applied");
  assert.equal(movableLayers(scene).filter((layer) => layer.kind === "character").length, artwork);

  setMode(scene, "giftcard");
  assert.ok(scene.layers.install);
  assert.equal(scene.layers.install.x, LAYOUTS[scene.layoutId].install.x);
  assert.equal(scene.order.at(-1), "install");
});

test("setIncludeInstall only applies in link mode", () => {
  const scene = createScene({ mode: "link" });
  setIncludeInstall(scene, false);
  assert.equal(installState(scene), "none");
  assert.equal(scene.layers.install, undefined);
  setIncludeInstall(scene, true);
  assert.equal(installState(scene), "optional");
  assert.ok(scene.layers.install);

  const gift = createScene({ mode: "giftcard" });
  setIncludeInstall(gift, false);
  assert.ok(gift.layers.install, "giftcard install cannot be turned off");
});

test("applyLayout moves qr, install and the primary character", () => {
  const scene = createScene({ mode: "link" });
  applyLayout(scene, "qr-left");
  assert.equal(scene.layoutId, "qr-left");
  assert.equal(scene.layers.qr.x, LAYOUTS["qr-left"].qr.x);
  assert.equal(scene.layers.qr.width, LAYOUTS["qr-left"].qr.size);
  assert.equal(scene.layers.install.x, LAYOUTS["qr-left"].install.x);
  const character = movableLayers(scene).find((layer) => layer.kind === "character");
  assert.equal(character.x, LAYOUTS["qr-left"].character.x);
  assert.equal(character.height, LAYOUTS["qr-left"].character.height);
});

test("applyTemplate keeps content and replaces layers", () => {
  const scene = createScene({ mode: "link" });
  scene.content.url = "https://example.com";
  addLayer(scene, makeLogoLayer("zcash", {}, scene));

  applyTemplate(scene, "payment-frost");
  assert.equal(scene.content.url, "https://example.com");
  assert.equal(scene.mode, "payment");
  assert.equal(scene.layoutId, "center");
  assert.equal(scene.qrStyle, "soft");
  assert.equal(scene.layers.background.assetId, "frost");
  assert.equal(scene.layers.install, undefined);
  assert.equal(movableLayers(scene).filter((layer) => layer.kind === "logo").length, 1);
});

test("factories cascade and addLayer assigns ids", () => {
  const scene = createScene({ mode: "link" });
  const first = addLayer(scene, makeCharacterLayer("samurai", scene));
  const second = addLayer(scene, makeCharacterLayer("samurai", scene));
  assert.equal(first.id, "character-4");
  assert.equal(second.id, "character-5");
  assert.notEqual(first.x, second.x, "cascade offset applied");
  assert.equal(scene.selectedLayerId, second.id);
  assert.equal(scene.order.at(-1), second.id);

  const heading = addLayer(scene, makeTextLayer("heading", scene));
  assert.equal(heading.kind, "text");
  assert.equal(heading.fontFamily, "Zarathustra");
  assert.equal(heading.fontWeight, 400);

  assert.equal(makeCharacterLayer("nope", scene), null);
  assert.equal(makeTextLayer("nope", scene), null);
});

test("makeLogoLayer only keeps colour for recolorable marks", () => {
  const scene = createScene({ mode: "link" });
  const tinted = makeLogoLayer("zcash", { color: "#b90a4a" }, scene);
  assert.equal(tinted.color, "#b90a4a");
  const fixed = makeLogoLayer("zechub", { color: "#b90a4a" }, scene);
  assert.equal(fixed.color, null);
  assert.equal(makeLogoLayer("missing", {}, scene), null);
});

test("duplicateLayer offsets by 24 and refuses non-duplicable layers", () => {
  const scene = createScene({ mode: "link" });
  const source = movableLayers(scene).find((layer) => layer.kind === "character");
  const copy = duplicateLayer(scene, source.id);
  assert.equal(copy.x, source.x + 24);
  assert.equal(copy.y, source.y + 24);
  assert.equal(scene.order[scene.order.indexOf(source.id) + 1], copy.id);
  assert.equal(scene.selectedLayerId, copy.id);

  assert.equal(duplicateLayer(scene, "qr"), null);
  assert.equal(duplicateLayer(scene, "background"), null);
  assert.equal(duplicateLayer(scene, "install"), null);
  scene.layers[copy.id].locked = true;
  assert.equal(duplicateLayer(scene, copy.id), null);
});

test("removeLayer respects deletable and locked, and reselects", () => {
  const scene = createScene({ mode: "link" });
  const target = movableLayers(scene).find((layer) => layer.kind === "logo");
  selectLayer(scene, target.id);
  assert.equal(removeLayer(scene, target.id), true);
  assert.equal(scene.layers[target.id], undefined);
  assert.equal(scene.order.includes(target.id), false);
  assert.notEqual(scene.selectedLayerId, target.id);

  assert.equal(removeLayer(scene, "qr"), false);
  assert.equal(removeLayer(scene, "background"), false);
  assert.equal(removeLayer(scene, "install"), false);
});

test("reorderLayer never moves background or goes below it", () => {
  const scene = createScene({ mode: "link" });
  const id = movableLayers(scene).at(-1).id;
  reorderLayer(scene, id, "back");
  assert.equal(scene.order[0], "background");
  assert.equal(scene.order[1], id);
  reorderLayer(scene, id, "down");
  assert.equal(scene.order[1], id, "cannot go below the background");
  reorderLayer(scene, id, "front");
  assert.equal(scene.order.at(-1), id);
  reorderLayer(scene, id, "up");
  assert.equal(scene.order.at(-1), id);

  reorderLayer(scene, "background", "front");
  assert.equal(scene.order[0], "background");
});

test("constrainLayer clamps the qr and install layers", () => {
  const scene = createScene({ mode: "link" });
  const qr = constrainLayer(scene, { ...scene.layers.qr, width: 2000, height: 2000, x: -400, y: 5000, rotation: 40 });
  assert.equal(qr.width, 900);
  assert.equal(qr.height, 900);
  assert.equal(qr.rotation, 0);
  assert.equal(qr.x, OUTPUT.safeInset);
  assert.equal(qr.y, OUTPUT.height - OUTPUT.safeInset - 900);

  const small = constrainLayer(scene, { ...scene.layers.qr, width: 100, height: 100 });
  assert.equal(small.width, 420);

  const install = constrainLayer(scene, { ...scene.layers.install, width: 900, rotation: 15 });
  assert.equal(install.width, 760);
  assert.equal(
    Math.round(install.height),
    Math.round(760 * INSTALL_LAYER.block.height / INSTALL_LAYER.block.width),
  );
  assert.equal(install.rotation, 0);
});

test("constrainLayer keeps 72px of art visible and enforces minimum sizes", () => {
  const scene = createScene({ mode: "link" });
  const logo = constrainLayer(scene, { kind: "logo", x: -5000, y: -5000, width: 10, height: 10, rotation: 30 });
  assert.equal(logo.width, 80);
  assert.equal(logo.height, 40);
  assert.equal(logo.x, -80 + 72);
  assert.equal(logo.y, -40 + 72);
  assert.equal(logo.rotation, 30, "logos stay rotatable");

  const character = constrainLayer(scene, { kind: "character", x: 9000, y: 9000, width: 10, height: 10 });
  assert.equal(character.width, 120);
  assert.equal(character.height, 120);
  assert.equal(character.x, OUTPUT.width - 72);
  assert.equal(character.y, OUTPUT.height - 72);

  const text = constrainLayer(scene, { kind: "text", x: 10, y: 10, width: 10, height: 999999 });
  assert.equal(text.width, 120);
  assert.equal(text.height, 999999, "text height is derived from the wrapped text");

  const huge = constrainLayer(scene, { kind: "character", x: 0, y: 0, width: 99999, height: 99999 });
  assert.equal(huge.width, OUTPUT.width * 1.5);
  assert.equal(huge.height, OUTPUT.height * 1.5);
});

test("setLayerProps merges then constrains", () => {
  const scene = createScene({ mode: "link" });
  const layer = setLayerProps(scene, "qr", { width: 4000, height: 4000 });
  assert.equal(layer.width, 900);
  const text = addLayer(scene, makeTextLayer("body", scene));
  setLayerProps(scene, text.id, { text: "Hello there" });
  assert.equal(scene.layers[text.id].label, "Hello there");
  assert.equal(setLayerProps(scene, "missing", {}), null);
});

test("selection helpers", () => {
  const scene = createScene({ mode: "link" });
  selectLayer(scene, "missing");
  assert.equal(scene.selectedLayerId, "qr");
  selectLayer(scene, "background");
  assert.equal(selectedLayer(scene).id, "background");
  assert.equal(movableLayers(scene).some((layer) => layer.id === "background"), false);
  assert.equal(movableLayers(scene).length, scene.order.length - 1);
});

test("describe summarises the composition", () => {
  const scene = createScene({ templateId: "link-wave" });
  assert.equal(describe(scene), "Indigo Wave · 1 cat · 1 logo");
  addLayer(scene, makeLogoLayer("zcash", {}, scene));
  assert.equal(describe(scene), "Indigo Wave · 1 cat · 2 logos");
});

test("snapshot and restore round-trip without sharing references", () => {
  const scene = createScene({ mode: "link" });
  const snap = snapshot(scene);
  scene.layers.qr.x = 999;
  scene.content.url = "https://example.com";
  removeLayer(scene, movableLayers(scene).find((layer) => layer.kind === "logo").id);

  restore(scene, snap);
  assert.equal(scene.layers.qr.x, LAYOUTS[scene.layoutId].qr.x);
  assert.equal(scene.content.url, "");
  assert.equal(movableLayers(scene).filter((layer) => layer.kind === "logo").length, 1);

  snap.layers.qr.x = 1;
  assert.notEqual(scene.layers.qr.x, 1, "restore deep clones");
});

test("History pushes befores and walks undo/redo", () => {
  const history = new History();
  assert.equal(history.canUndo, false);
  assert.equal(history.canRedo, false);
  assert.equal(history.undo({ step: "current" }), null);
  assert.equal(history.redo({ step: "current" }), null);

  history.push({ step: 0 });
  history.push({ step: 1 });
  assert.equal(history.size, 2);
  assert.equal(history.canUndo, true);

  const back = history.undo({ step: 2 });
  assert.deepEqual(back, { step: 1 });
  assert.equal(history.canRedo, true);
  const forward = history.redo({ step: 1 });
  assert.deepEqual(forward, { step: 2 });
  assert.equal(history.canRedo, false);

  history.push({ step: 3 });
  assert.equal(history.canRedo, false, "push clears the redo stack");
  history.clear();
  assert.equal(history.size, 0);
  assert.equal(history.canUndo, false);
});

test("History honours its limit", () => {
  const history = new History(3);
  for (let step = 0; step < 10; step += 1) history.push({ step });
  assert.equal(history.size, 3);
  assert.deepEqual(history.undo({ step: 10 }), { step: 9 });
});

test("setLayerOrder replaces the draw order and pins the background", () => {
  const scene = createScene({ mode: "link" });
  const a = addLayer(scene, makeTextLayer("heading", scene));
  const b = addLayer(scene, makeTextLayer("body", scene));
  const before = [...scene.order];
  assert.equal(setLayerOrder(scene, [a.id]), false, "wrong size is rejected");
  assert.equal(setLayerOrder(scene, [...before].map((id) => (id === a.id ? "nope" : id))), false, "unknown id is rejected");
  assert.equal(setLayerOrder(scene, before), false, "identical order reports no change");
  const swapped = before.map((id) => (id === a.id ? b.id : id === b.id ? a.id : id));
  assert.equal(setLayerOrder(scene, swapped), true);
  assert.deepEqual(scene.order, swapped);
  const bgLast = [...swapped.filter((id) => id !== "background"), "background"];
  assert.equal(setLayerOrder(scene, bgLast), false, "background is pinned, so this is the same order");
  assert.equal(scene.order[0], "background");
});

test("applyLayout moves the logo band, caption and summary with the QR", () => {
  const scene = createScene({ mode: "payment", templateId: "payment-wave" });
  assert.equal(scene.layoutId, "center");
  setPaymentSummary(scene, true);
  applyLayout(scene, "qr-left");
  const layout = LAYOUTS["qr-left"];
  assert.equal(scene.layers["logo-1"].x, layout.mark.x, "Zcash mark uses the square slot");
  assert.equal(scene.layers["logo-1"].width, layout.mark.size);
  const caption = roleLayer(scene, "caption");
  assert.equal(caption.x, layout.caption.x);
  assert.equal(caption.align, layout.caption.align);
  const summary = roleLayer(scene, "summary");
  assert.equal(summary.x, layout.summary.x);
  assert.ok(summary.y >= caption.y + caption.height, "summary sits under the caption's real height");
});

test("payment summary is bound to amount and label", () => {
  const scene = createScene({ mode: "payment" });
  assert.equal(setPaymentSummary(scene, true), true);
  assert.equal(setPaymentSummary(scene, true), false, "idempotent");
  const summary = roleLayer(scene, "summary");
  assert.equal(summary.bound, "payment-summary");
  assert.equal(summary.text, "");
  scene.content.amount = "0.05";
  scene.content.label = "Coffee stand";
  assert.equal(syncBoundText(scene), true);
  assert.equal(summary.text, "0.05 ZEC · Coffee stand");
  assert.equal(syncBoundText(scene), false, "no change reports false");
  scene.content.amount = "";
  syncBoundText(scene);
  assert.equal(summary.text, "Coffee stand");
  assert.equal(setPaymentSummary(scene, false), true);
  assert.equal(roleLayer(scene, "summary"), null);
  assert.equal(scene.selectedLayerId, "qr");
});

test("setMode swaps an untouched caption and drops the payment summary", () => {
  const scene = createScene({ mode: "payment" });
  setPaymentSummary(scene, true);
  setMode(scene, "link");
  assert.equal(roleLayer(scene, "caption").text, CAPTIONS.link);
  assert.equal(roleLayer(scene, "summary"), null);
  roleLayer(scene, "caption").text = "Custom words";
  setMode(scene, "giftcard");
  assert.equal(roleLayer(scene, "caption").text, "Custom words", "edited captions are kept");
});

test("QR design defaults follow the card type and can be edited", () => {
  const scene = createScene({ mode: "payment" });
  assert.deepEqual(scene.qrDesign, { shape: "square", color: null, emblem: "zcash" });
  assert.equal(qrLevelFor(scene), "H");
  setMode(scene, "giftcard");
  assert.equal(scene.qrDesign.emblem, "vizor-mark", "default emblem follows the card type");
  setMode(scene, "link");
  assert.equal(scene.qrDesign.emblem, "vizorcat");
  assert.equal(setQrDesign(scene, { emblem: "none", shape: "dots", color: "#1d2c3a" }), true);
  assert.equal(qrLevelFor(scene), "M");
  setMode(scene, "payment");
  assert.equal(scene.qrDesign.emblem, "none", "a chosen emblem is kept across card types");
  assert.equal(setQrDesign(scene, { shape: "hexagons" }), false, "unknown values are ignored");
  assert.equal(scene.qrDesign.shape, "dots");
});
