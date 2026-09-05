// Export preflight: pure checks over a scene that tell the user what may go
// wrong in print before they export. No DOM, no rendering.

import { OUTPUT, QUIET_MODULES } from "./catalog.js";

/**
 * Recommended minimum size of one QR module on paper. The scene already keeps
 * the QR side above 420 px (about 36 mm), so density is what remains to check:
 * a long ZIP-321 payload with a memo can push a 36 mm code below this.
 */
export const QR_MIN_MODULE_MM = 0.45;
/** Module count (per side) from which a centre emblem starts to hurt scanning. */
export const QR_DENSE_MODULES = 69;

const MM_PER_PX = 25.4 / OUTPUT.dpi;

/** @typedef {{ id: string, level: "pass"|"warn"|"error", title: string, detail: string, layerId?: string }} Check */

/**
 * Axis-aligned bounding box of a (possibly rotated) layer.
 * @param {any} layer
 */
function axisBounds(layer) {
  const height = layer.height ?? 0;
  if (!layer.rotation) {
    return { x: layer.x, y: layer.y, width: layer.width, height };
  }
  const radians = (layer.rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  const width = layer.width * cos + height * sin;
  const boxHeight = layer.width * sin + height * cos;
  return {
    x: layer.x + layer.width / 2 - width / 2,
    y: layer.y + height / 2 - boxHeight / 2,
    width,
    height: boxHeight,
  };
}

/** Area of the intersection of two boxes, 0 when they do not touch. */
function overlapArea(a, b) {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return width > 0 && height > 0 ? width * height : 0;
}

function outsideSafeArea(box) {
  const safe = OUTPUT.safeInset;
  return (
    box.x < safe
    || box.y < safe
    || box.x + box.width > OUTPUT.width - safe
    || box.y + box.height > OUTPUT.height - safe
  );
}

function relativeLuminance(hex) {
  const value = /^#?([0-9a-f]{6})$/i.exec(hex)?.[1];
  if (!value) return 0;
  const channel = (i) => {
    const c = parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** WCAG contrast ratio between two hex colours. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function mm(px) {
  return Math.round(px * MM_PER_PX);
}

/** Layers in draw order (bottom first). */
function orderedLayers(scene) {
  return scene.order.map((id) => scene.layers[id]).filter(Boolean);
}

/**
 * Layers drawn above `target` whose box overlaps it by more than a sliver.
 * @returns {any[]}
 */
function coveringLayers(layers, target) {
  const index = layers.indexOf(target);
  if (index < 0) return [];
  const box = axisBounds(target);
  const minimum = Math.max(400, box.width * box.height * 0.01);
  return layers.slice(index + 1).filter((layer) => {
    if (layer.kind === "background") return false;
    if (layer.kind === "text" && !layer.text?.trim()) return false;
    return overlapArea(box, axisBounds(layer)) > minimum;
  });
}

/**
 * Run every preflight check.
 * @param {any} scene
 * @param {{ qr?: { value: string|null, error: string|null, warnings?: string[] }, qrCode?: { getModuleCount(): number }|null }} state
 * @returns {Check[]}
 */
export function preflight(scene, { qr = { value: null, error: null, warnings: [] }, qrCode = null } = {}) {
  /** @type {Check[]} */
  const checks = [];
  const layers = orderedLayers(scene);
  const qrLayer = layers.find((layer) => layer.kind === "qr");
  const installLayer = layers.find((layer) => layer.kind === "install");

  // 1. Content
  if (qr.error) {
    checks.push({ id: "content", level: "error", title: "QR content", detail: qr.error });
  } else {
    checks.push({ id: "content", level: "pass", title: "QR content", detail: "Encodes and scans." });
  }
  for (const warning of qr.warnings ?? []) {
    checks.push({ id: "content-warning", level: "warn", title: "Content warning", detail: warning });
  }

  // 2. QR print size
  if (qrLayer) {
    const side = Math.min(qrLayer.width, qrLayer.height);
    const sideMm = side * MM_PER_PX;
    const modules = qrCode ? qrCode.getModuleCount() + QUIET_MODULES * 2 : null;
    const moduleMm = modules ? sideMm / modules : null;
    const sizeText = moduleMm
      ? `${mm(side)} mm wide, ${moduleMm.toFixed(2)} mm modules.`
      : `${mm(side)} mm wide.`;
    if (moduleMm !== null && moduleMm < QR_MIN_MODULE_MM) {
      checks.push({
        id: "qr-size",
        level: "warn",
        title: "QR modules are very fine",
        detail: `${sizeText} Enlarge the QR or shorten the memo so each module is at least ${QR_MIN_MODULE_MM} mm.`,
        layerId: qrLayer.id,
      });
    } else {
      checks.push({ id: "qr-size", level: "pass", title: "QR print size", detail: sizeText, layerId: qrLayer.id });
    }

    // 3. QR covered
    const covering = coveringLayers(layers, qrLayer);
    if (covering.length) {
      const names = covering.map((layer) => layer.label).join(", ");
      checks.push({
        id: "qr-covered",
        level: "warn",
        title: "Something overlaps the QR",
        detail: `${names} sits on top of the QR. Move it or send it to the back.`,
        layerId: covering[0].id,
      });
    } else {
      checks.push({ id: "qr-covered", level: "pass", title: "QR is unobstructed", detail: "Nothing is drawn over it.", layerId: qrLayer.id });
    }
  }

  // 4. Install card covered
  if (installLayer) {
    const covering = coveringLayers(layers, installLayer);
    if (covering.length) {
      const names = covering.map((layer) => layer.label).join(", ");
      checks.push({
        id: "install-covered",
        level: "warn",
        title: "Something overlaps the Get Vizor card",
        detail: `${names} sits on top of the install QR.`,
        layerId: covering[0].id,
      });
    }
  }

  // 5. Text and logos outside the safe area
  const clipped = layers.filter(
    (layer) => (layer.kind === "text" || layer.kind === "logo") && outsideSafeArea(axisBounds(layer)),
  );
  if (clipped.length) {
    const names = clipped.map((layer) => layer.label).join(", ");
    checks.push({
      id: "safe-area",
      level: "warn",
      title: "Outside the safe area",
      detail: `${names} may be cut when the card is trimmed.`,
      layerId: clipped[0].id,
    });
  } else {
    checks.push({ id: "safe-area", level: "pass", title: "Text and logos inside the safe area", detail: "Nothing will be trimmed." });
  }

  // 6. Emblem on a dense code: the emblem eats into the error-correction budget
  //    that a long payload already needs, so phones start to miss it.
  const emblem = scene.qrDesign?.emblem;
  if (emblem && emblem !== "none" && qrCode && qrCode.getModuleCount() >= QR_DENSE_MODULES) {
    checks.push({
      id: "qr-emblem-dense",
      level: "warn",
      title: "Emblem on a dense code",
      detail: `${qrCode.getModuleCount()} modules per side. Long links scan better without a centre emblem.`,
      layerId: qrLayer?.id,
    });
  }

  // 7. Module colour contrast against the panel (scanners want dark on light)
  const moduleColor = scene.qrDesign?.color;
  if (moduleColor) {
    const ratio = contrastRatio(moduleColor, "#ffffff");
    if (ratio < 4) {
      checks.push({
        id: "qr-contrast",
        level: "warn",
        title: "QR modules are too light",
        detail: `Contrast ${ratio.toFixed(1)}:1 against the panel. Use a darker module colour (4:1 or more).`,
        layerId: qrLayer?.id,
      });
    }
  }

  // 7. Empty text boxes
  const emptyText = layers.filter((layer) => layer.kind === "text" && !layer.text?.trim());
  if (emptyText.length) {
    checks.push({
      id: "empty-text",
      level: "warn",
      title: `${emptyText.length} empty text box${emptyText.length === 1 ? "" : "es"}`,
      detail: "Empty boxes print as nothing. Fill or delete them.",
      layerId: emptyText[0].id,
    });
  }

  return checks;
}

/**
 * One-line verdict for a set of checks.
 * @param {Check[]} checks
 * @returns {{ level: "pass"|"warn"|"error", text: string }}
 */
export function summarize(checks) {
  const errors = checks.filter((check) => check.level === "error").length;
  const warns = checks.filter((check) => check.level === "warn").length;
  if (errors) return { level: "error", text: `Fix ${errors} issue${errors === 1 ? "" : "s"} before exporting` };
  if (warns) return { level: "warn", text: `${warns} warning${warns === 1 ? "" : "s"}. Export anyway if intended` };
  return { level: "pass", text: "Ready to print" };
}
