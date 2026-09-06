import test from "node:test";
import assert from "node:assert/strict";
import {
  createEventScene,
  applyEventTheme,
  setEventText,
  eventText,
  replaceEventCharacter,
  numberedCard,
} from "../src/event-card.js";
import { designToJson, parseDesign } from "../src/design-file.js";
import { preflight } from "../src/preflight.js";
import { parseBatchLines } from "../src/qr-content.js";
import { SHEET, sheetSlots } from "../src/print-sheet.js";
import { CHARACTERS } from "../src/catalog.js";

test("theme character scale survives replacement without accumulating on repeated selection", () => {
  const scene = createEventScene("link");
  const cat = Object.values(scene.layers).find((layer) => layer.kind === "character");
  const original = { x: cat.x, y: cat.y, width: cat.width, height: cat.height };
  applyEventTheme(scene, "link-blossom");
  assert.equal(cat.assetId, "oni");
  assert.ok(Math.abs(cat.height - original.height * CHARACTERS.oni.defaultScale) < 0.01);
  const scaled = { ...cat };
  applyEventTheme(scene, "link-blossom");
  assert.deepEqual(cat, scaled);
  replaceEventCharacter(scene, "classic");
  for (const key of ["x", "y", "width", "height"]) {
    assert.ok(Math.abs(cat[key] - original[key]) < 0.01, key);
  }
});

test("event cards keep QR and install areas clear in each mode", () => {
  for (const mode of ["payment", "giftcard", "link"]) {
    const scene = createEventScene(mode);
    const issues = preflight(scene, {
      qr: { value: "https://example.com", error: null, warnings: [] },
      qrCode: { getModuleCount: () => 33 },
    }).filter((check) => check.level !== "pass");
    assert.deepEqual(issues, [], mode);
  }
});
test("theme changes keep destination, custom wording and QR geometry", () => {
  const scene = createEventScene("payment");
  scene.content.address = "sample";
  scene.content.amount = "0.05";
  setEventText(scene, "event-name", "Community Day");
  setEventText(scene, "event-heading", "Coffee Booth");
  const qr = { ...scene.layers.qr };
  applyEventTheme(scene, "payment-hearth");
  assert.deepEqual(scene.layers.qr, qr);
  assert.equal(scene.content.address, "sample");
  assert.equal(eventText(scene, "event-name"), "Community Day");
  assert.equal(eventText(scene, "event-heading"), "Coffee Booth");
  assert.equal(scene.layers.background.assetId, "hearth");
});
test("catalog selection while QR is selected replaces one character and respects locks", () => {
  const scene = createEventScene();
  const cats = () =>
    scene.order
      .map((id) => scene.layers[id])
      .filter((layer) => layer.kind === "character");
  const box = { ...cats()[0] };
  scene.selectedLayerId = "qr";
  assert.equal(replaceEventCharacter(scene, "classic"), true);
  assert.equal(cats().length, 1);
  assert.equal(cats()[0].assetId, "classic");
  assert.ok(cats()[0].y >= box.y);
  assert.ok(cats()[0].y + cats()[0].height <= box.y + box.height + 0.01);
  cats()[0].locked = true;
  assert.equal(replaceEventCharacter(scene, "samurai"), false);
  assert.equal(cats()[0].assetId, "classic");
});
test("event wording survives save/open without including a gift secret", () => {
  const scene = createEventScene("giftcard");
  setEventText(scene, "event-name", "Community Day");
  setEventText(scene, "event-heading", "Welcome");
  scene.content.giftLink =
    "https://link.vizor.cash/payment-links/open#v1=private-secret";
  const json = designToJson(scene);
  assert.ok(!json.includes("private-secret"));
  const restored = parseDesign(json).scene;
  assert.equal(restored.layoutId, "event");
  assert.equal(eventText(restored, "event-name"), "Community Day");
  assert.equal(eventText(restored, "event-heading"), "Welcome");
  const numbered = numberedCard(scene, 4);
  assert.ok(
    numbered.order.some((id) => numbered.layers[id].text === "GIFT 005"),
  );
  assert.ok(!scene.order.some((id) => scene.layers[id].text === "GIFT 005"));
});
test("gift batches report source rows for repeats without leaking gift values", () => {
  const scene = createEventScene("giftcard"),
    gift = "https://link.vizor.cash/payment-links/open#v1=alpha";
  const parsed = parseBatchLines(
    scene,
    `${gift}\n\n${gift}\ninvalid\n${gift}2`,
  );
  assert.equal(parsed.items.length, 2);
  assert.deepEqual(parsed.duplicates, [{ line: 3, firstLine: 1 }]);
  assert.equal(parsed.errors[0].line, 4);
  assert.ok(!JSON.stringify(parsed.duplicates).includes("alpha"));
  const links = createEventScene("link");
  assert.equal(
    parseBatchLines(links, "example.com\nexample.com").items.length,
    2,
    "ordinary duplicate links may be intentional",
  );
});
test("A4 placement keeps full A6 proportions and space for cut marks", () => {
  const pages = sheetSlots(3);
  assert.deepEqual(
    pages.map((page) => page.length),
    [2, 1],
  );
  assert.equal(pages[1][0].index, 2);
  assert.deepEqual(sheetSlots(0), []);
  for (const slot of pages.flat()) {
    assert.ok(Math.abs(slot.width / slot.height - 105 / 148) < 0.001);
    assert.ok(slot.x > 16 && slot.y > 16);
    assert.ok(slot.x + slot.width + 16 < SHEET.width);
    assert.ok(slot.y + slot.height + 16 < SHEET.height);
  }
  assert.ok(pages[0][0].x + pages[0][0].width + 32 < pages[0][1].x);
});
