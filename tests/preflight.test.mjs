import test from "node:test";
import assert from "node:assert/strict";

import { addLayer, createScene, makeLogoLayer, makeTextLayer, setLayerProps } from "../src/scene.js";
import { preflight, summarize } from "../src/preflight.js";
import { createEventScene, applyEventTheme } from "../src/event-card.js";

const okQr = { value: "https://vizor.cash", error: null, warnings: [] };
const code = { getModuleCount: () => 25 };
const byId = (checks, id) => checks.find((check) => check.id === id);

test("large polearm art ignores transparent space but still detects body, blade and flipped overlap", () => {
  const scene = createEventScene("link");
  applyEventTheme(scene, "link-blossom");
  const cat = Object.values(scene.layers).find((layer) => layer.kind === "character");
  // Keep collision fixtures independent of the catalog's adjustable default scale.
  Object.assign(cat, { x: 664.8, y: 994, width: 620.4, height: 726 });
  const check = () => byId(preflight(scene, { qr: okQr, qrCode: code }), "qr-covered").level;
  assert.equal(check(), "pass", "blade stands beside the QR; empty space is transparent");
  cat.y -= 160;
  assert.equal(check(), "warn", "moving the body over the QR is still detected");
  cat.y += 160;
  cat.flipX = true;
  assert.equal(check(), "warn", "flipped blade now crosses the QR");
  cat.flipX = false;
  Object.assign(scene.layers.qr, { x: 1160, y: 1015, width: 80, height: 100 });
  assert.equal(check(), "warn", "blade itself remains protected");
  cat.rotation = 180;
  Object.assign(scene.layers.qr, { x: 820, y: 1020, width: 100, height: 100 });
  assert.equal(check(), "warn", "rotated artwork still participates in coverage checks");
});

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

test("light module colours warn on contrast", () => {
  const scene = createScene({ mode: "link" });
  scene.qrDesign = { shape: "square", color: "#f4b728", emblem: "none" };
  const check = byId(preflight(scene, { qr: okQr, qrCode: code }), "qr-contrast");
  assert.equal(check.level, "warn");
  scene.qrDesign.color = "#1d2c3a";
  assert.equal(byId(preflight(scene, { qr: okQr, qrCode: code }), "qr-contrast"), undefined);
});

test("an emblem on a dense code warns", () => {
  const scene = createScene({ mode: "giftcard" });
  scene.qrDesign.emblem = "vizor-mark";
  const dense = { getModuleCount: () => 81 };
  assert.equal(byId(preflight(scene, { qr: okQr, qrCode: dense }), "qr-emblem-dense").level, "warn");
  assert.equal(byId(preflight(scene, { qr: okQr, qrCode: code }), "qr-emblem-dense"), undefined);
});
