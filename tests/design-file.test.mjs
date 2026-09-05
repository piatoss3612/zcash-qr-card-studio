import test from "node:test";
import assert from "node:assert/strict";

import { addLayer, createScene, makeLogoLayer, makeTextLayer, setLayerProps } from "../src/scene.js";
import { designToJson, parseDesign, serializeDesign } from "../src/design-file.js";

test("round-trips layers, content and settings", () => {
  const scene = createScene({ mode: "payment", templateId: undefined });
  scene.content.address = "t1abc";
  scene.content.amount = "0.5";
  const text = addLayer(scene, makeTextLayer("heading", scene));
  setLayerProps(scene, text.id, { text: "Hello", rotation: 12 });
  const logo = addLayer(scene, makeLogoLayer("vizor", { color: "#ff0000" }, scene));
  const { scene: loaded, name } = parseDesign(designToJson(scene, { name: "My card" }));
  assert.equal(name, "My card");
  assert.equal(loaded.mode, "payment");
  assert.equal(loaded.content.address, "t1abc");
  assert.equal(loaded.content.amount, "0.5");
  assert.deepEqual(loaded.order, scene.order);
  assert.equal(loaded.layers[text.id].text, "Hello");
  assert.equal(loaded.layers[text.id].rotation, 12);
  assert.equal(loaded.layers[logo.id].color, "#ff0000");
  assert.equal(loaded.nextLayerId, scene.nextLayerId);
});

test("gift links never reach the file", () => {
  const scene = createScene({ mode: "giftcard" });
  scene.content.giftLink = "https://link.vizor.cash/x#v1=secret words";
  const json = designToJson(scene);
  assert.ok(!json.includes("secret"));
  assert.equal(serializeDesign(scene).scene.content.giftLink, "");
  const { scene: loaded } = parseDesign(json);
  assert.equal(loaded.content.giftLink, "");
  assert.ok(loaded.order.includes("install"), "gift cards always carry the install card");
});

test("rejects foreign or newer files with a readable message", () => {
  assert.throws(() => parseDesign("{"), /not valid JSON/);
  assert.throws(() => parseDesign('{"hello":1}'), /not a QR Card Studio design/);
  const future = { ...serializeDesign(createScene()), version: 99 };
  assert.throws(() => parseDesign(JSON.stringify(future)), /newer version/);
});

test("drops layers with unknown assets and clamps geometry", () => {
  const data = serializeDesign(createScene({ mode: "link" }));
  data.scene.layers["character-9"] = { kind: "character", assetId: "nope", x: 0, y: 0, width: 100, height: 100 };
  data.scene.order.push("character-9");
  data.scene.layers.qr.width = 5;
  data.scene.layers.qr.height = 5;
  const { scene, dropped } = parseDesign(JSON.stringify(data));
  assert.equal(dropped, 1);
  assert.ok(!scene.order.includes("character-9"));
  assert.equal(scene.layers.qr.width, 420);
});

test("install card follows the card type, not the file", () => {
  const data = serializeDesign(createScene({ mode: "link" }));
  data.scene.includeInstall = false;
  const { scene } = parseDesign(JSON.stringify(data));
  assert.ok(!scene.order.includes("install"));
});
