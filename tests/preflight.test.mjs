import test from "node:test";
import assert from "node:assert/strict";

import { addLayer, createScene, makeLogoLayer, makeTextLayer, setLayerProps } from "../src/scene.js";
import { preflight, summarize } from "../src/preflight.js";

const okQr = { value: "https://vizor.cash", error: null, warnings: [] };
const code = { getModuleCount: () => 25 };
const byId = (checks, id) => checks.find((check) => check.id === id);

test("a fresh link card passes every check", () => {
  const checks = preflight(createScene({ mode: "link" }), { qr: okQr, qrCode: code });
  assert.ok(checks.every((check) => check.level === "pass"), JSON.stringify(checks));
  assert.equal(summarize(checks).level, "pass");
});

test("content errors block export", () => {
  const checks = preflight(createScene({ mode: "payment" }), {
    qr: { value: null, error: "Enter a Zcash address.", warnings: [] },
  });
  assert.equal(byId(checks, "content").level, "error");
  assert.equal(summarize(checks).level, "error");
  assert.match(summarize(checks).text, /Fix 1 issue/);
});

test("content warnings surface as warn rows", () => {
  const checks = preflight(createScene({ mode: "payment" }), {
    qr: { value: "zcash:t1x", error: null, warnings: ["This is a testnet address."] },
    qrCode: code,
  });
  assert.equal(byId(checks, "content-warning").level, "warn");
});

test("the QR size row reports millimetres at the scene's minimum size", () => {
  const scene = createScene({ mode: "link" });
  setLayerProps(scene, "qr", { width: 10, height: 10 });
  const check = byId(preflight(scene, { qr: okQr, qrCode: code }), "qr-size");
  assert.equal(check.level, "pass");
  assert.match(check.detail, /^36 mm wide/);
});

test("dense QR with tiny modules warns even at a normal size", () => {
  const scene = createScene({ mode: "link" });
  setLayerProps(scene, "qr", { width: 400, height: 400 });
  const dense = { getModuleCount: () => 97 };
  assert.equal(byId(preflight(scene, { qr: okQr, qrCode: dense }), "qr-size").level, "warn");
});

test("a logo drawn over the QR is reported and points at the logo", () => {
  const scene = createScene({ mode: "link" });
  const qr = scene.layers.qr;
  const logo = addLayer(scene, makeLogoLayer("vizor", {}, scene));
  setLayerProps(scene, logo.id, { x: qr.x + 50, y: qr.y + 50 });
  const check = byId(preflight(scene, { qr: okQr, qrCode: code }), "qr-covered");
  assert.equal(check.level, "warn");
  assert.equal(check.layerId, logo.id);
  assert.match(check.detail, /Vizor/);
});

test("text outside the safe area and empty text boxes warn", () => {
  const scene = createScene({ mode: "link" });
  const text = addLayer(scene, makeTextLayer("body", scene));
  setLayerProps(scene, text.id, { text: "   " });
  let checks = preflight(scene, { qr: okQr, qrCode: code });
  assert.equal(byId(checks, "empty-text").level, "warn");
  setLayerProps(scene, text.id, { text: "Hello", x: 10 });
  checks = preflight(scene, { qr: okQr, qrCode: code });
  assert.equal(byId(checks, "empty-text"), undefined);
  assert.equal(byId(checks, "safe-area").level, "warn");
  assert.equal(byId(checks, "safe-area").layerId, text.id);
});
