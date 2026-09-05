// Design files: save a scene to JSON and load it back with validation.
// Pure: no DOM. Gift links are secrets and are never written to a file.

import { BACKGROUNDS, CHARACTERS, LAYOUTS, LOGOS, MODES, QR_STYLES, TEMPLATES } from "./catalog.js";
import { constrainLayer, createScene, snapshot } from "./scene.js";

export const DESIGN_FILE_APP = "zcash-qr-card-studio";
export const DESIGN_FILE_VERSION = 1;

const LAYER_KINDS = new Set(["background", "qr", "install", "character", "logo", "text"]);

/**
 * Serialize a scene and its document name into a plain object.
 * The gift link is dropped: the fragment is the secret that controls the funds.
 * @param {object} scene
 * @param {{ name?: string }} [options]
 * @returns {object}
 */
export function serializeDesign(scene, { name = "Untitled card" } = {}) {
  const copy = snapshot(scene);
  copy.content = { ...copy.content, giftLink: "" };
  return {
    app: DESIGN_FILE_APP,
    version: DESIGN_FILE_VERSION,
    savedAt: new Date().toISOString(),
    name: String(name || "Untitled card"),
    scene: copy,
  };
}

/** @returns {string} the design as pretty JSON text. */
export function designToJson(scene, options) {
  return JSON.stringify(serializeDesign(scene, options), null, 2);
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Validate one layer from a file. Returns a cleaned layer or null to drop it.
 * @param {any} raw
 */
function cleanLayer(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (!LAYER_KINDS.has(raw.kind) || typeof raw.id !== "string") return null;
  if (![raw.x, raw.y, raw.width].every(isFiniteNumber)) return null;

  const layer = {
    id: raw.id,
    kind: raw.kind,
    label: typeof raw.label === "string" ? raw.label : raw.kind,
    x: raw.x,
    y: raw.y,
    width: raw.width,
    height: isFiniteNumber(raw.height) ? raw.height : raw.width,
    rotation: isFiniteNumber(raw.rotation) ? raw.rotation : 0,
    locked: Boolean(raw.locked),
    deletable: raw.deletable !== false,
  };

  if (raw.kind === "background") {
    layer.assetId = BACKGROUNDS[raw.assetId] ? raw.assetId : "paper";
    layer.locked = true;
    layer.deletable = false;
  } else if (raw.kind === "character") {
    if (!CHARACTERS[raw.assetId]) return null;
    layer.assetId = raw.assetId;
    layer.flipX = Boolean(raw.flipX);
  } else if (raw.kind === "logo") {
    if (!LOGOS[raw.assetId]) return null;
    layer.assetId = raw.assetId;
    layer.flipX = Boolean(raw.flipX);
    layer.color = typeof raw.color === "string" ? raw.color : null;
  } else if (raw.kind === "text") {
    layer.text = typeof raw.text === "string" ? raw.text : "";
    layer.fontFamily = typeof raw.fontFamily === "string" ? raw.fontFamily : "Geist";
    layer.fontSize = isFiniteNumber(raw.fontSize) ? raw.fontSize : 34;
    layer.fontWeight = isFiniteNumber(raw.fontWeight) ? raw.fontWeight : 500;
    layer.color = typeof raw.color === "string" ? raw.color : "#141818";
    layer.align = ["left", "center", "right"].includes(raw.align) ? raw.align : "left";
    layer.lineHeight = isFiniteNumber(raw.lineHeight) ? raw.lineHeight : 1.2;
    layer.role = ["caption", "summary"].includes(raw.role) ? raw.role : null;
    layer.bound = raw.bound === "payment-summary" ? raw.bound : null;
  } else if (raw.kind === "qr" || raw.kind === "install") {
    layer.deletable = false;
  }
  return layer;
}

/**
 * Parse design-file text into a scene and name. Throws on anything that is not
 * a design file; tolerates unknown assets by dropping those layers.
 * @param {string} text
 * @returns {{ name: string, scene: object, dropped: number }}
 */
export function parseDesign(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  if (!data || data.app !== DESIGN_FILE_APP || typeof data.scene !== "object" || !data.scene) {
    throw new Error("This is not a QR Card Studio design file.");
  }
  if (typeof data.version !== "number" || data.version > DESIGN_FILE_VERSION) {
    throw new Error("This design was saved by a newer version of the studio.");
  }

  const raw = data.scene;
  const mode = MODES[raw.mode] ? raw.mode : "link";
  const templateId = TEMPLATES[raw.templateId] ? raw.templateId : undefined;
  const scene = createScene({ mode, templateId });
  scene.layoutId = LAYOUTS[raw.layoutId] ? raw.layoutId : scene.layoutId;
  scene.qrStyle = QR_STYLES[raw.qrStyle] ? raw.qrStyle : scene.qrStyle;
  scene.includeInstall = raw.includeInstall !== false;

  const content = raw.content && typeof raw.content === "object" ? raw.content : {};
  for (const key of Object.keys(scene.content)) {
    if (key === "giftLink") continue;
    if (typeof content[key] === "string") scene.content[key] = content[key];
  }

  const order = Array.isArray(raw.order) ? raw.order : [];
  const layers = raw.layers && typeof raw.layers === "object" ? raw.layers : {};
  const cleaned = [];
  let dropped = 0;
  for (const id of order) {
    if (typeof id !== "string") continue;
    const layer = cleanLayer({ ...layers[id], id });
    if (layer) cleaned.push(layer);
    else dropped += 1;
  }

  const hasBackground = cleaned.some((layer) => layer.kind === "background");
  const hasQr = cleaned.some((layer) => layer.kind === "qr");
  if (!hasBackground || !hasQr) {
    throw new Error("This design file is missing its background or QR layer.");
  }
  // The install card is derived from the card type, never from the file.
  const wantsInstall = mode === "giftcard" || (mode === "link" && scene.includeInstall);
  const finalLayers = cleaned.filter((layer) => layer.kind !== "install" || wantsInstall);
  if (wantsInstall && !finalLayers.some((layer) => layer.kind === "install")) {
    const template = scene.layers.install;
    if (template) finalLayers.push(template);
  }

  scene.order = finalLayers.map((layer) => layer.id);
  scene.layers = Object.fromEntries(finalLayers.map((layer) => [layer.id, layer]));
  for (const layer of finalLayers) constrainLayer(scene, layer);

  const maxNumeric = finalLayers.reduce((max, layer) => {
    const match = /-(\d+)$/.exec(layer.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  scene.nextLayerId = Math.max(isFiniteNumber(raw.nextLayerId) ? raw.nextLayerId : 1, maxNumeric + 1);
  scene.selectedLayerId = scene.layers[raw.selectedLayerId] ? raw.selectedLayerId : "qr";

  return {
    name: typeof data.name === "string" && data.name.trim() ? data.name.trim() : "Untitled card",
    scene,
    dropped,
  };
}
