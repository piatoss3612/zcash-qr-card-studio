// Bootstrap: scene + history, the render scheduler, and the editor/panel wiring.

import { createEventScene } from "./event-card.js";
import { createStudio } from "./studio.js";
import { INSTALL_URL } from "./catalog.js";
import { History, qrLevelFor, restore, snapshot, syncBoundText } from "./scene.js";
import { buildQrValue } from "./qr-content.js";
import { assetsReady, loadAssets, makeQr, renderScene } from "./render.js";
import { createEditor } from "./editor.js";
import { createPanels } from "./panels.js";

/** Collected page errors, kept for browser QA. */
window.__lastErrors = [];
window.addEventListener("error", (event) => {
  const message = String(event.message ?? event.error ?? "error");
  if (message.startsWith("ResizeObserver loop")) return; // benign browser notice
  window.__lastErrors.push(message);
});
window.addEventListener("unhandledrejection", (event) => {
  window.__lastErrors.push(String(event.reason));
});

const canvas = document.getElementById("card-canvas");
const context = canvas.getContext("2d", { alpha: false });
const statusOutput = document.getElementById("render-status");

const scene = createEventScene("payment");

const history = new History();

let frame = 0;
let stickyUntil = 0;

function writeStatus(text, state) {
  statusOutput.textContent = text;
  statusOutput.dataset.state = state;
  statusOutput.title = state === "error" ? "Click to jump to the QR content" : "";
}

/** Show a message that survives the next few renders. */
function setStatus(text, state = "ready") {
  writeStatus(text, state);
  stickyUntil = Date.now() + 3000;
}

const app = {
  scene,
  history,
  assets: { backgrounds: {}, characters: {}, logos: {} },
  installCode: makeQr(INSTALL_URL),
  qrCode: null,
  qr: { value: null, error: null, warnings: [] },
  assetsLoaded: false,
  /** True once layers/assets/layout were edited by hand (not just QR content). */
  compositionDirty: false,
  /** @returns {object} a deep copy of the scene, for history. */
  takeSnapshot: () => snapshot(scene),
  /** Record a "before" snapshot as one undo step. */
  commit(before) {
    history.push(before);
  },
  requestRender: schedule,
  setStatus,
  undo,
  redo,
  /** @returns {boolean} whether the card can be exported right now. */
  canExport: () => app.assetsLoaded && assetsReady(scene, app.assets) && Boolean(app.qrCode),
};

const editor = createEditor(app);
const panels = createPanels(app);
const studio = createStudio(app, panels);
app.closeMenus = panels.closeMenus;
app.openLayerMenu = panels.openLayerMenu;

function undo() {
  const previous = history.undo(snapshot(scene));
  if (!previous) return;
  restore(scene, previous);
  schedule();
}

function redo() {
  const next = history.redo(snapshot(scene));
  if (!next) return;
  restore(scene, next);
  schedule();
}

/** Derive the idle status line from the scene state. */
function autoStatus() {
  if (Date.now() < stickyUntil || !app.assetsLoaded) return;
  const contentKey = scene.mode === "payment" ? "address" : scene.mode === "giftcard" ? "giftLink" : "url";
  if (!scene.content[contentKey].trim()) writeStatus("Add QR content", "ready");
  else if (app.qr.error) writeStatus("Check the QR content", "error");
  else if (!assetsReady(scene, app.assets)) writeStatus("Some artwork is missing", "error");
  else writeStatus("Ready", "ready");
}

/** Draw the card, then re-sync overlay, panels and status. */
function draw() {
  frame = 0;
  syncBoundText(scene);
  app.qr = buildQrValue(scene);
  let code = null;
  if (app.qr.value) {
    try {
      code = makeQr(app.qr.value, qrLevelFor(scene));
    } catch {
      app.qr = { ...app.qr, error: "This value is too long to fit in one QR code." };
    }
  }
  app.qrCode = code;
  renderScene(context, scene, {
    assets: app.assets,
    qrCode: code,
    installCode: app.installCode,
  });
  editor.sync();
  panels.sync();
  studio.sync();
  autoStatus();
}

/** Coalesce render requests into one animation frame. */
function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(draw);
}

panels.setDrawer(!window.matchMedia("(max-width: 899px)").matches);
panels.syncTemplates();
schedule();

writeStatus("Loading assets…", "busy");
loadAssets((loaded, total) => writeStatus(`Loading assets ${loaded}/${total}`, "busy"))
  .then((assets) => {
    app.assets = assets;
    app.assetsLoaded = true;
    panels.syncTemplates();
    schedule();
  })
  .catch((error) => {
    app.assetsLoaded = true;
    setStatus(`Asset loading failed: ${error.message}`, "error");
    schedule();
  });
