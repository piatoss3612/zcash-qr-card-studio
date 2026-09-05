// Canvas interaction: zoom, pointer move/resize/rotate with snapping guides,
// selection overlay, hit testing and keyboard shortcuts.

import { OUTPUT } from "./catalog.js";
import {
  constrainLayer,
  duplicateLayer,
  movableLayers,
  removeLayer,
  selectLayer,
  selectedLayer,
} from "./scene.js";
import { syncTextLayerHeight } from "./render.js";
import { computeSnap } from "./snapping.js";

const SVG_NS = "http://www.w3.org/2000/svg";
// 100% zoom ≈ physical A6 at 96dpi. Height follows the output aspect ratio.
const BASE_WIDTH = 397;
const BASE_HEIGHT = Math.round((BASE_WIDTH * OUTPUT.height) / OUTPUT.width);
const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2];
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const ROTATABLE = ["character", "logo", "text"];

/** @returns {boolean} whether the event target is a text-entry control. */
function isTextEditingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLSelectElement) return true;
  return (
    target instanceof HTMLInputElement
    && ["text", "url", "number", "search", "email", "tel", "color"].includes(target.type)
  );
}

/**
 * Axis-aligned bounding box of a (possibly rotated) layer.
 * @param {any} layer
 * @returns {{ id: string, x: number, y: number, width: number, height: number }}
 */
function axisBounds(layer) {
  const height = layer.height ?? 0;
  if (!layer.rotation) {
    return { id: layer.id, x: layer.x, y: layer.y, width: layer.width, height };
  }
  const radians = (layer.rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  const width = layer.width * cos + height * sin;
  const boxHeight = layer.width * sin + height * cos;
  return {
    id: layer.id,
    x: layer.x + layer.width / 2 - width / 2,
    y: layer.y + height / 2 - boxHeight / 2,
    width,
    height: boxHeight,
  };
}

/** @returns {boolean} whether a canvas-space point falls inside a layer's rotated box. */
function pointInsideLayer(point, layer) {
  if (layer.kind === "background") return true;
  const height = layer.height ?? 0;
  const centerX = layer.x + layer.width / 2;
  const centerY = layer.y + height / 2;
  const angle = (-(layer.rotation ?? 0) * Math.PI) / 180;
  const deltaX = point.x - centerX;
  const deltaY = point.y - centerY;
  const localX = deltaX * Math.cos(angle) - deltaY * Math.sin(angle);
  const localY = deltaX * Math.sin(angle) + deltaY * Math.cos(angle);
  return Math.abs(localX) <= layer.width / 2 && Math.abs(localY) <= height / 2;
}

/**
 * Wire the canvas workspace: zoom, pointer transforms, snapping and shortcuts.
 * @param {any} app  shared application context created in main.js
 * @returns {{ sync: () => void, zoomIn: () => void, zoomOut: () => void, zoomFit: () => void }}
 */
export function createEditor(app) {
  const el = {
    stage: document.getElementById("canvas-stage"),
    frame: document.getElementById("canvas-frame"),
    canvas: document.getElementById("card-canvas"),
    overlay: document.getElementById("editor-overlay"),
    selectionBox: document.getElementById("selection-box"),
    selectionRect: document.getElementById("selection-rect"),
    rotationStem: document.getElementById("rotation-stem"),
    rotationHandle: document.getElementById("rotation-handle"),
    resizeHandles: [...document.querySelectorAll(".resize-handle")],
    snapGuides: document.getElementById("snap-guides"),
    proofGuides: document.getElementById("proof-guides"),
    qrGuide: document.getElementById("qr-guide"),
    guideToggle: document.getElementById("guide-toggle"),
    snapToggle: document.getElementById("snap-toggle"),
    zoomLabel: document.getElementById("zoom-label"),
    zoomIn: document.getElementById("zoom-in-button"),
    zoomOut: document.getElementById("zoom-out-button"),
    zoomFit: document.getElementById("zoom-fit-button"),
    textContent: document.getElementById("text-content"),
  };

  let zoom = 1;
  let fitMode = true;
  /** @type {any} */
  let transform = null;

  // ------------------------------------------------------------------ zoom

  /** @returns {number} the zoom that fits the card inside the stage. */
  function fitZoom() {
    const style = getComputedStyle(el.stage);
    const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const width = Math.max(80, el.stage.clientWidth - padX);
    const height = Math.max(80, el.stage.clientHeight - padY);
    const value = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
  }

  /** Write the zoom into the frame size and the label. */
  function applyZoom(value) {
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
    const width = Math.round(BASE_WIDTH * zoom);
    el.frame.style.width = `${width}px`;
    el.frame.style.height = `${Math.round((width * OUTPUT.height) / OUTPUT.width)}px`;
    el.zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
  }

  /** Set an explicit zoom level (leaves fit mode). */
  function setZoom(value) {
    fitMode = false;
    applyZoom(value);
  }

  /** Recompute and apply the fit zoom. */
  function zoomFit() {
    fitMode = true;
    applyZoom(fitZoom());
  }

  function zoomIn() {
    setZoom(ZOOM_STEPS.find((step) => step > zoom + 0.001) ?? MAX_ZOOM);
  }

  function zoomOut() {
    setZoom([...ZOOM_STEPS].reverse().find((step) => step < zoom - 0.001) ?? MIN_ZOOM);
  }

  /** Zoom keeping the canvas point under the pointer in place. */
  function zoomAround(value, clientX, clientY) {
    const before = el.frame.getBoundingClientRect();
    const ratioX = before.width ? (clientX - before.left) / before.width : 0.5;
    const ratioY = before.height ? (clientY - before.top) / before.height : 0.5;
    setZoom(value);
    const after = el.frame.getBoundingClientRect();
    el.stage.scrollLeft += after.left + ratioX * after.width - clientX;
    el.stage.scrollTop += after.top + ratioY * after.height - clientY;
  }

  // ------------------------------------------------------- canvas geometry

  /** @returns {{x: number, y: number}} pointer position in canvas units. */
  function canvasPoint(event) {
    const bounds = el.frame.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * OUTPUT.width,
      y: ((event.clientY - bounds.top) / bounds.height) * OUTPUT.height,
    };
  }

  /** @returns {any|undefined} the top-most layer under a canvas point. */
  function hitTestLayer(point) {
    const scene = app.scene;
    return [...scene.order]
      .reverse()
      .map((id) => scene.layers[id])
      .filter(Boolean)
      .find((layer) => pointInsideLayer(point, layer));
  }

  // ------------------------------------------------------------- overlay

  function setSvgRect(rect, x, y, width, height) {
    rect.setAttribute("x", String(x));
    rect.setAttribute("y", String(y));
    rect.setAttribute("width", String(width));
    rect.setAttribute("height", String(height));
  }

  /** Position the selection box, handles and rotation stem over the selected layer. */
  function syncSelectionOverlay() {
    const layer = selectedLayer(app.scene);
    const hide = !layer || layer.kind === "background";
    el.selectionBox.toggleAttribute("hidden", hide);
    if (hide) return;

    const height = layer.height ?? 0;
    const halfWidth = layer.width / 2;
    const halfHeight = height / 2;
    el.selectionBox.setAttribute(
      "transform",
      `translate(${layer.x + halfWidth} ${layer.y + halfHeight}) rotate(${layer.rotation ?? 0})`,
    );
    setSvgRect(el.selectionRect, -halfWidth, -halfHeight, layer.width, height);

    const positions = {
      "resize-nw": [-halfWidth, -halfHeight],
      "resize-ne": [halfWidth, -halfHeight],
      "resize-se": [halfWidth, halfHeight],
      "resize-sw": [-halfWidth, halfHeight],
    };
    for (const handle of el.resizeHandles) {
      const [x, y] = positions[handle.dataset.handle] ?? [0, 0];
      setSvgRect(handle, x - 14, y - 14, 28, 28);
      handle.toggleAttribute("hidden", Boolean(layer.locked));
    }

    const stemY = -halfHeight - 76;
    el.rotationStem.setAttribute("x1", "0");
    el.rotationStem.setAttribute("y1", String(-halfHeight));
    el.rotationStem.setAttribute("x2", "0");
    el.rotationStem.setAttribute("y2", String(stemY));
    el.rotationHandle.setAttribute("cx", "0");
    el.rotationHandle.setAttribute("cy", String(stemY));
    const canRotate = !layer.locked && ROTATABLE.includes(layer.kind);
    el.rotationStem.toggleAttribute("hidden", !canRotate);
    el.rotationHandle.toggleAttribute("hidden", !canRotate);
  }

  /** Keep the QR proof rectangle and the guide toggle in sync. */
  function syncProofGuides() {
    const qr = app.scene.layers.qr;
    if (qr) setSvgRect(el.qrGuide, qr.x, qr.y, qr.width, qr.height);
    // Guides are off by default; they appear while a layer is being moved or resized.
    el.proofGuides.toggleAttribute("hidden", !(el.guideToggle.checked || transform));
  }

  function clearSnapGuides() {
    el.snapGuides.replaceChildren();
  }

  /** Draw one full-canvas line per snap guide. */
  function drawSnapGuides(guides) {
    el.snapGuides.replaceChildren(
      ...guides.map((guide) => {
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("class", "snap-guide");
        if (guide.axis === "x") {
          line.setAttribute("x1", String(guide.position));
          line.setAttribute("x2", String(guide.position));
          line.setAttribute("y1", "0");
          line.setAttribute("y2", String(OUTPUT.height));
        } else {
          line.setAttribute("x1", "0");
          line.setAttribute("x2", String(OUTPUT.width));
          line.setAttribute("y1", String(guide.position));
          line.setAttribute("y2", String(guide.position));
        }
        line.dataset.kind = guide.kind;
        return line;
      }),
    );
  }

  // ---------------------------------------------------------- transforms

  /** Snap the moving layer and draw its guides. */
  function applySnap(layer, bypass) {
    if (bypass || !el.snapToggle.checked) {
      clearSnapGuides();
      return;
    }
    const targets = movableLayers(app.scene)
      .filter((other) => other.id !== layer.id)
      .map(axisBounds);
    const { dx, dy, guides } = computeSnap({
      box: axisBounds(layer),
      targets,
      canvas: {
        width: OUTPUT.width,
        height: OUTPUT.height,
        bleed: OUTPUT.bleed,
        safeInset: OUTPUT.safeInset,
      },
      // About 10 screen pixels, expressed in canvas units at the current zoom.
      threshold: Math.min(60, Math.max(10, (10 * OUTPUT.width) / (BASE_WIDTH * zoom))),
    });
    layer.x += dx;
    layer.y += dy;
    drawSnapGuides(guides);
  }

  function beginPointerTransform(event) {
    if (event.button !== 0) return;
    const point = canvasPoint(event);
    let handle = event.target instanceof Element ? event.target.dataset.handle : null;

    if (!handle) {
      const hit = hitTestLayer(point);
      if (!hit) return;
      selectLayer(app.scene, hit.id);
      app.requestRender();
      if (hit.locked || hit.kind === "background") return;
      handle = "move";
    }

    const layer = selectedLayer(app.scene);
    if (!layer || layer.locked || layer.kind === "background") return;
    const center = { x: layer.x + layer.width / 2, y: layer.y + (layer.height ?? 0) / 2 };
    transform = {
      pointerId: event.pointerId,
      handle,
      startPoint: point,
      startLayer: { ...layer },
      center,
      startDistance: Math.max(1, Math.hypot(point.x - center.x, point.y - center.y)),
      startAngle: Math.atan2(point.y - center.y, point.x - center.x),
      before: app.takeSnapshot(),
    };
    el.frame.setPointerCapture(event.pointerId);
    event.preventDefault();
    syncProofGuides();
  }

  function updatePointerTransform(event) {
    if (!transform || event.pointerId !== transform.pointerId) return;
    const point = canvasPoint(event);
    const layer = selectedLayer(app.scene);
    const start = transform.startLayer;

    if (transform.handle === "move") {
      layer.x = start.x + point.x - transform.startPoint.x;
      layer.y = start.y + point.y - transform.startPoint.y;
      applySnap(layer, event.altKey);
    } else if (transform.handle.startsWith("resize")) {
      const distance = Math.max(
        1,
        Math.hypot(point.x - transform.center.x, point.y - transform.center.y),
      );
      const scale = Math.max(0.2, Math.min(4, distance / transform.startDistance));
      if (layer.kind === "text") {
        layer.width = start.width * scale;
        layer.fontSize = Math.max(8, Math.round(start.fontSize * scale));
        syncTextLayerHeight(layer);
      } else {
        layer.width = start.width * scale;
        layer.height = start.height * scale;
      }
      layer.x = transform.center.x - layer.width / 2;
      layer.y = transform.center.y - (layer.height ?? 0) / 2;
    } else if (transform.handle === "rotate" && ROTATABLE.includes(layer.kind)) {
      const angle = Math.atan2(point.y - transform.center.y, point.x - transform.center.x);
      layer.rotation = start.rotation + ((angle - transform.startAngle) * 180) / Math.PI;
      if (event.shiftKey) layer.rotation = Math.round(layer.rotation / 15) * 15;
    }

    constrainLayer(app.scene, layer);
    app.requestRender();
    event.preventDefault();
  }

  function finishPointerTransform(event) {
    if (!transform || event.pointerId !== transform.pointerId) return;
    if (el.frame.hasPointerCapture(event.pointerId)) {
      el.frame.releasePointerCapture(event.pointerId);
    }
    clearSnapGuides();
    app.commit(transform.before);
    transform = null;
    syncProofGuides();
    app.requestRender();
  }

  // ----------------------------------------------------------- shortcuts

  const NUDGES = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };

  function handleKeydown(event) {
    const modifier = event.metaKey || event.ctrlKey;
    const editing = isTextEditingTarget(event.target);
    const key = event.key.toLowerCase();

    if (event.key === "?" && !modifier && !editing) {
      event.preventDefault();
      app.openHelp?.();
      return;
    }

    if (modifier && !event.altKey) {
      if (key === "z" && !editing) {
        event.preventDefault();
        app.closeMenus?.();
        if (event.shiftKey) app.redo();
        else app.undo();
        return;
      }
      if (key === "s" && !event.shiftKey) {
        event.preventDefault();
        app.closeMenus?.();
        app.saveDesign?.();
        return;
      }
      if (key === "o" && !event.shiftKey) {
        event.preventDefault();
        app.closeMenus?.();
        app.openDesign?.();
        return;
      }
      if (key === "y" && !event.shiftKey && !editing) {
        event.preventDefault();
        app.closeMenus?.();
        app.redo();
        return;
      }
      if (key === "0") {
        event.preventDefault();
        zoomFit();
        return;
      }
      if (key === "=" || key === "+") {
        event.preventDefault();
        zoomIn();
        return;
      }
      if (key === "-" || key === "_") {
        event.preventDefault();
        zoomOut();
        return;
      }
      if (key === "d" && !editing) {
        event.preventDefault();
        const before = app.takeSnapshot();
        if (duplicateLayer(app.scene, app.scene.selectedLayerId)) app.commit(before);
        app.requestRender();
        return;
      }
    }

    if (event.key === "Escape") {
      const closed = app.closeMenus?.();
      if (!closed) {
        selectLayer(app.scene, "background");
        app.requestRender();
      }
      return;
    }

    if (editing) return;

    if (event.key === "Delete" || event.key === "Backspace") {
      const before = app.takeSnapshot();
      if (removeLayer(app.scene, app.scene.selectedLayerId)) {
        app.commit(before);
        app.requestRender();
        event.preventDefault();
      }
      return;
    }

    const offset = NUDGES[event.key];
    if (!offset) return;
    const layer = selectedLayer(app.scene);
    if (!layer || layer.locked || layer.kind === "background") return;
    const before = app.takeSnapshot();
    const distance = event.shiftKey ? 10 : 1;
    layer.x += offset[0] * distance;
    layer.y += offset[1] * distance;
    constrainLayer(app.scene, layer);
    app.commit(before);
    app.requestRender();
    event.preventDefault();
  }

  // -------------------------------------------------------------- wiring

  el.frame.addEventListener("pointerdown", beginPointerTransform);
  el.frame.addEventListener("pointermove", updatePointerTransform);
  el.frame.addEventListener("pointerup", finishPointerTransform);
  el.frame.addEventListener("pointercancel", finishPointerTransform);
  el.frame.addEventListener("dblclick", (event) => {
    const hit = hitTestLayer(canvasPoint(event));
    if (!hit || hit.kind !== "text") return;
    selectLayer(app.scene, hit.id);
    app.requestRender();
    requestAnimationFrame(() => {
      el.textContent.focus();
      el.textContent.select();
    });
  });
  el.frame.addEventListener("contextmenu", (event) => {
    const hit = hitTestLayer(canvasPoint(event));
    if (!hit) return;
    event.preventDefault();
    app.openLayerMenu?.(hit.id, event.clientX, event.clientY);
  });

  // Clicking the empty stage around the card clears the selection.
  el.stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target !== el.stage) return;
    const current = selectedLayer(app.scene);
    if (!current || current.kind === "background") return;
    selectLayer(app.scene, "background");
    app.requestRender();
  });

  el.stage.addEventListener(
    "wheel",
    (event) => {
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      const factor = Math.exp(-event.deltaY / 320);
      zoomAround(zoom * factor, event.clientX, event.clientY);
    },
    { passive: false },
  );

  el.zoomIn.addEventListener("click", zoomIn);
  el.zoomOut.addEventListener("click", zoomOut);
  el.zoomFit.addEventListener("click", zoomFit);
  el.guideToggle.addEventListener("change", syncProofGuides);
  window.addEventListener("keydown", handleKeydown);
  const refit = () => {
    if (fitMode) applyZoom(fitZoom());
  };
  window.addEventListener("resize", refit);
  // The stage is content-sized until the grid settles, so follow its real size.
  if (typeof ResizeObserver === "function") new ResizeObserver(refit).observe(el.stage);

  zoomFit();

  return {
    /** Refresh the overlay and proof guides after a render. */
    sync() {
      syncSelectionOverlay();
      syncProofGuides();
    },
    zoomIn,
    zoomOut,
    zoomFit,
  };
}
