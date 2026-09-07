// React mount boundary for the scene, render scheduler and imperative editor
// services. The DOM-free modules remain reusable outside the UI.
import { createEventScene } from "./event-card.js";
import { createStudio } from "./studio.js";
import { INSTALL_URL } from "./catalog.js";
import { History, qrLevelFor, restore, snapshot, syncBoundText } from "./scene.js";
import { buildQrValue } from "./qr-content.js";
import { assetsReady, loadAssets, makeQr, renderScene } from "./render.js";
import { createEditor } from "./editor.js";
import { createPanels } from "./panels.js";

/** Mount the editor after React has committed the UI tree. */
export function mountApp({ onStepChange } = {}) {
  window.__lastErrors = [];
  const onError = (event) => {
    const message = String(event.message ?? event.error ?? "error");
    if (!message.startsWith("ResizeObserver loop")) window.__lastErrors.push(message);
  };
  const onRejection = (event) => window.__lastErrors.push(String(event.reason));
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  const canvas = document.getElementById("card-canvas");
  const cardLoading = document.getElementById("card-loading");
  const cardLoadingTitle = document.getElementById("card-loading-title");
  const cardLoadingDetail = document.getElementById("card-loading-detail");
  const cardLoadingProgress = document.getElementById("card-loading-progress");
  const statusOutput = document.getElementById("render-status");
  let assetLoadFailed = false;
  let mounted = true;
  let frame = 0;
  let stickyUntil = 0;
  canvas.setAttribute("aria-busy", "true");
  const context = canvas.getContext("2d", { alpha: false });
  const scene = createEventScene("payment");
  const history = new History();

  function writeStatus(text, state) {
    statusOutput.textContent = text;
    statusOutput.dataset.state = state;
    statusOutput.title = state === "error" ? "Click to jump to the QR content" : "";
  }
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
    compositionDirty: false,
    takeSnapshot: () => snapshot(scene),
    commit(before) { history.push(before); },
    requestRender: schedule,
    setStatus,
    undo,
    redo,
    canExport: () => app.assetsLoaded && assetsReady(scene, app.assets) && Boolean(app.qrCode),
    onStepChange,
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
  function autoStatus() {
    if (Date.now() < stickyUntil || !app.assetsLoaded) return;
    const contentKey = scene.mode === "payment" ? "address" : scene.mode === "giftcard" ? "giftLink" : "url";
    if (!scene.content[contentKey].trim()) writeStatus("Add QR content", "ready");
    else if (app.qr.error) writeStatus("Check the QR content", "error");
    else if (!assetsReady(scene, app.assets)) writeStatus("Some artwork is missing", "error");
    else writeStatus("Ready", "ready");
  }
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
    renderScene(context, scene, { assets: app.assets, qrCode: code, installCode: app.installCode });
    if (app.assetsLoaded) {
      const missing = assetLoadFailed || !assetsReady(scene, app.assets);
      cardLoading.hidden = !missing;
      canvas.setAttribute("aria-busy", "false");
      if (missing) {
        cardLoading.dataset.state = "error";
        cardLoadingTitle.textContent = "Artwork couldn’t load";
        cardLoadingDetail.textContent = "Check your connection and reload the page to try again.";
        cardLoadingProgress.hidden = true;
      }
    }
    editor.sync();
    panels.sync();
    studio.sync();
    autoStatus();
  }
  function schedule() {
    if (!mounted || frame) return;
    frame = requestAnimationFrame(draw);
  }

  panels.setDrawer(!window.matchMedia("(max-width: 899px)").matches);
  panels.syncTemplates();
  schedule();
  writeStatus("Loading assets…", "busy");
  loadAssets((loaded, total) => {
    if (!mounted) return;
    writeStatus(`Loading assets ${loaded}/${total}`, "busy");
    cardLoadingDetail.textContent = `${loaded} of ${total} assets loaded`;
    cardLoadingProgress.max = total;
    cardLoadingProgress.value = loaded;
  })
    .then((assets) => {
      if (!mounted) return;
      app.assets = assets;
      app.assetsLoaded = true;
      panels.syncTemplates();
      schedule();
    })
    .catch((error) => {
      if (!mounted) return;
      assetLoadFailed = true;
      app.assetsLoaded = true;
      setStatus(`Asset loading failed: ${error.message}`, "error");
      schedule();
    });

  return {
    showStep: app.showStep,
    destroy() {
      mounted = false;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      editor.destroy?.();
      panels.destroy?.();
      studio.destroy?.();
    },
  };
}
