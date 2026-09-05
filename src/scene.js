// DOM-free scene model: layer factories, constraints, layout/template/mode application, history.
// Pure data manipulation. No DOM, no window, no document.

import {
  BACKGROUNDS,
  CHARACTERS,
  INSTALL_LAYER,
  LAYOUTS,
  LOGOS,
  MODES,
  OUTPUT,
  QR_STYLES,
  TEMPLATES,
  TEXT_PRESETS,
  TEXT_ROLES,
  CAPTIONS,
  fontWeightFor,
  QR_SHAPES,
  QR_EMBLEMS,
  defaultQrEmblem,
} from "./catalog.js";

const VISIBLE_EDGE = 72;
const MIN_SIZE = Object.freeze({
  logo: { width: 80, height: 40 },
  character: { width: 120, height: 120 },
  text: { width: 120, height: 0 },
});

const QR_LABELS = Object.freeze({ payment: "Payment QR", link: "Link QR", giftcard: "Gift QR" });

/** @returns {string} label shown for the QR layer in the given mode. */
function qrLabel(mode) {
  return QR_LABELS[mode] ?? "QR code";
}

/** @returns {string} short label derived from a text layer's content. */
function textLabel(text) {
  const line = String(text ?? "").split("\n")[0].trim();
  if (!line) return "Text";
  return line.length > 24 ? `${line.slice(0, 24)}…` : line;
}

/** Initial height for a text layer before render.measureTextLayer refines it. */
function initialTextHeight({ fontSize, lineHeight = 1.2 }, lines = 1) {
  return Math.round(fontSize * lineHeight * lines);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function putLayer(scene, layer) {
  scene.layers[layer.id] = layer;
  scene.order.push(layer.id);
  return layer;
}

function makeBackgroundLayer(assetId) {
  const asset = BACKGROUNDS[assetId] ?? BACKGROUNDS.wave;
  return {
    id: "background",
    kind: "background",
    assetId: asset.id,
    label: "Background",
    x: 0,
    y: 0,
    width: OUTPUT.width,
    height: OUTPUT.height,
    rotation: 0,
    locked: true,
    deletable: false,
  };
}

function makeQrLayer(mode, layout) {
  return {
    id: "qr",
    kind: "qr",
    label: qrLabel(mode),
    x: layout.qr.x,
    y: layout.qr.y,
    width: layout.qr.size,
    height: layout.qr.size,
    rotation: 0,
    locked: false,
    deletable: false,
  };
}

function makeInstallLayer(layout) {
  return {
    id: "install",
    kind: "install",
    label: "Get Vizor",
    x: layout.install.x,
    y: layout.install.y,
    width: layout.install.width,
    height: layout.install.height,
    rotation: 0,
    locked: false,
    deletable: false,
  };
}

/** Cascade offset so repeatedly added layers of one kind do not stack exactly. */
function cascadeOffset(scene, kind) {
  const count = scene.order.filter((id) => scene.layers[id]?.kind === kind).length;
  return (count % 5) * 24;
}

function layoutOf(scene) {
  return LAYOUTS[scene.layoutId] ?? LAYOUTS.center;
}

/**
 * Build a layer object for a template layer definition.
 * @returns {object} layer without an id (assigned by addLayer).
 */
function templateLayer(def) {
  if (def.kind === "text") {
    const lineHeight = def.lineHeight ?? 1.2;
    return {
      kind: "text",
      label: textLabel(def.text),
      text: def.text,
      fontFamily: def.fontFamily ?? "Geist",
      fontSize: def.fontSize ?? 30,
      fontWeight: fontWeightFor(def.fontFamily ?? "Geist", def.fontWeight ?? 500),
      uppercase: Boolean(def.uppercase),
      color: def.color ?? "#141818",
      align: def.align ?? "left",
      lineHeight,
      x: def.x,
      y: def.y,
      width: def.width,
      height: def.height ?? initialTextHeight({ fontSize: def.fontSize ?? 30, lineHeight }, 2),
      rotation: def.rotation ?? 0,
      role: def.role ?? null,
      bound: def.bound ?? null,
      locked: false,
      deletable: true,
    };
  }

  if (def.kind === "logo") {
    const asset = LOGOS[def.assetId];
    return {
      kind: "logo",
      assetId: def.assetId,
      label: asset?.label ?? "Logo",
      x: def.x,
      y: def.y,
      width: def.width ?? asset?.width ?? 130,
      height: def.height ?? asset?.height ?? 130,
      rotation: def.rotation ?? 0,
      flipX: def.flipX ?? false,
      color: def.color ?? null,
      locked: false,
      deletable: true,
    };
  }

  const asset = CHARACTERS[def.assetId];
  return {
    kind: "character",
    assetId: def.assetId,
    label: asset?.label ?? "Vizorcat",
    x: def.x,
    y: def.y,
    width: def.width,
    height: def.height,
    rotation: def.rotation ?? 0,
    flipX: def.flipX ?? false,
    locked: false,
    deletable: true,
  };
}

function emptyContent() {
  return { url: "", giftLink: "", address: "", amount: "", memo: "", label: "", message: "" };
}

/**
 * Resolve which template a scene should start from.
 * @returns {object} template definition
 */
function resolveTemplate(mode, templateId) {
  if (templateId && TEMPLATES[templateId]) return TEMPLATES[templateId];
  const fallbackId = MODES[mode]?.defaultTemplate ?? MODES.link.defaultTemplate;
  return TEMPLATES[fallbackId];
}

/** Rebuild every layer of `scene` from a template. Keeps `content` and `includeInstall`. */
function buildFromTemplate(scene, template) {
  scene.mode = template.mode;
  scene.templateId = template.id;
  scene.layoutId = LAYOUTS[template.layoutId] ? template.layoutId : "center";
  scene.qrStyle = QR_STYLES[template.qrStyle] ? template.qrStyle : "clean";
  scene.qrDesign = { shape: "square", color: null, emblem: defaultQrEmblem(scene.mode) };
  scene.order = [];
  scene.layers = {};
  scene.nextLayerId = 1;

  const layout = layoutOf(scene);
  putLayer(scene, makeBackgroundLayer(template.background));
  putLayer(scene, makeQrLayer(scene.mode, layout));
  if (installState(scene) !== "none") putLayer(scene, makeInstallLayer(layout));
  for (const def of template.layers) addLayer(scene, templateLayer(def));

  scene.selectedLayerId = "qr";
  return scene;
}

/**
 * Create a fresh scene from a mode and (optionally) a template id.
 * @param {{ mode?: string, templateId?: string }} [options]
 * @returns {object} scene
 */
export function createScene({ mode = "link", templateId } = {}) {
  const safeMode = MODES[mode] ? mode : "link";
  const template = resolveTemplate(safeMode, templateId);
  const scene = {
    mode: safeMode,
    content: emptyContent(),
    includeInstall: true,
    templateId: template.id,
    layoutId: template.layoutId,
    qrStyle: template.qrStyle,
    qrDesign: { shape: "square", color: null, emblem: defaultQrEmblem(safeMode) },
    selectedLayerId: "qr",
    order: [],
    nextLayerId: 1,
    layers: {},
  };
  return buildFromTemplate(scene, template);
}

/** @returns {object} deep clone of the scene, for history. */
export function snapshot(scene) {
  return JSON.parse(JSON.stringify(scene));
}

/** Restore a snapshot into `scene` in place. @returns {object} scene */
export function restore(scene, snap) {
  const clone = JSON.parse(JSON.stringify(snap));
  scene.mode = clone.mode;
  scene.content = clone.content;
  scene.includeInstall = clone.includeInstall;
  scene.templateId = clone.templateId;
  scene.layoutId = clone.layoutId;
  scene.qrStyle = clone.qrStyle;
  scene.qrDesign = clone.qrDesign ?? { shape: "square", color: null, emblem: defaultQrEmblem(clone.mode) };
  scene.selectedLayerId = clone.selectedLayerId;
  scene.order = clone.order;
  scene.nextLayerId = clone.nextLayerId;
  scene.layers = clone.layers;
  return scene;
}

/** Undo/redo stack of "before" snapshots. */
export class History {
  #past = [];
  #future = [];
  #limit;

  constructor(limit = 100) {
    this.#limit = limit;
  }

  /** Record a "before" snapshot; clears the redo stack. */
  push(before) {
    this.#past.push(before);
    while (this.#past.length > this.#limit) this.#past.shift();
    this.#future.length = 0;
  }

  /** @returns {object|null} the previous snapshot, or null when there is nothing to undo. */
  undo(current) {
    if (this.#past.length === 0) return null;
    this.#future.push(current);
    return this.#past.pop();
  }

  /** @returns {object|null} the next snapshot, or null when there is nothing to redo. */
  redo(current) {
    if (this.#future.length === 0) return null;
    this.#past.push(current);
    return this.#future.pop();
  }

  get canUndo() {
    return this.#past.length > 0;
  }

  get canRedo() {
    return this.#future.length > 0;
  }

  get size() {
    return this.#past.length;
  }

  clear() {
    this.#past.length = 0;
    this.#future.length = 0;
  }
}

/**
 * Whether the Get Vizor card applies to this scene.
 * @returns {'none'|'optional'|'required'}
 */
export function installState(scene) {
  const rule = MODES[scene.mode]?.install ?? "none";
  if (rule === "optional") return scene.includeInstall ? "optional" : "none";
  return rule;
}

function ensureInstallLayer(scene) {
  const wanted = installState(scene) !== "none";
  const present = Boolean(scene.layers.install);
  if (wanted && !present) {
    putLayer(scene, makeInstallLayer(layoutOf(scene)));
  } else if (!wanted && present) {
    delete scene.layers.install;
    scene.order = scene.order.filter((id) => id !== "install");
    if (scene.selectedLayerId === "install") scene.selectedLayerId = "qr";
  }
  return scene;
}

/** Switch card type. Adds/removes the install layer; never replaces the artwork. */
export function setMode(scene, mode) {
  if (!MODES[mode]) return scene;
  const previous = scene.mode;
  scene.mode = mode;
  if (scene.layers.qr) scene.layers.qr.label = qrLabel(mode);

  // An untouched default caption follows the card type; edited text is kept.
  const caption = roleLayer(scene, "caption");
  if (caption && caption.text === CAPTIONS[previous] && CAPTIONS[mode]) {
    caption.text = CAPTIONS[mode];
    caption.label = textLabel(caption.text);
  }
  // The bound amount · label line only makes sense on payment cards.
  if (mode !== "payment") setPaymentSummary(scene, false);
  // A default emblem follows the card type; a chosen one is kept.
  if (scene.qrDesign && scene.qrDesign.emblem === defaultQrEmblem(previous)) {
    scene.qrDesign.emblem = defaultQrEmblem(mode);
  }
  return ensureInstallLayer(scene);
}

/**
 * Update the QR module design. Unknown values are ignored.
 * @param {object} scene
 * @param {{ shape?: string, color?: string|null, emblem?: string }} patch
 * @returns {boolean} whether anything changed
 */
export function setQrDesign(scene, patch) {
  const next = { ...scene.qrDesign };
  if (patch.shape !== undefined && QR_SHAPES[patch.shape]) next.shape = patch.shape;
  if (patch.emblem !== undefined && QR_EMBLEMS[patch.emblem]) next.emblem = patch.emblem;
  if (patch.color !== undefined) next.color = typeof patch.color === "string" ? patch.color : null;
  const changed = JSON.stringify(next) !== JSON.stringify(scene.qrDesign);
  scene.qrDesign = next;
  return changed;
}

/** @returns {"M"|"H"} the error-correction level the design needs. */
export function qrLevelFor(scene) {
  return scene.qrDesign?.emblem && scene.qrDesign.emblem !== "none" ? "H" : "M";
}

/** Toggle the optional Get Vizor card (link mode only). */
export function setIncludeInstall(scene, include) {
  if (scene.mode !== "link") return scene;
  scene.includeInstall = Boolean(include);
  return ensureInstallLayer(scene);
}

/** Reposition QR, install card and the primary character for a layout preset. */
export function applyLayout(scene, layoutId) {
  const layout = LAYOUTS[layoutId] ?? LAYOUTS.center;
  scene.layoutId = layout.id;

  if (scene.layers.qr) {
    Object.assign(scene.layers.qr, {
      x: layout.qr.x,
      y: layout.qr.y,
      width: layout.qr.size,
      height: layout.qr.size,
      rotation: 0,
    });
  }

  const primaryCharacterId = scene.layers["character-1"]
    ? "character-1"
    : scene.order.find((id) => scene.layers[id]?.kind === "character");
  if (primaryCharacterId) {
    Object.assign(scene.layers[primaryCharacterId], { ...layout.character, rotation: 0 });
  }

  if (scene.layers.install) {
    Object.assign(scene.layers.install, {
      x: layout.install.x,
      y: layout.install.y,
      width: layout.install.width,
      height: layout.install.height,
      rotation: 0,
    });
  }

  // The primary logo follows the logo band; the Zcash mark uses the square slot.
  const primaryLogoId = scene.layers["logo-1"]
    ? "logo-1"
    : scene.order.find((id) => scene.layers[id]?.kind === "logo");
  const logo = primaryLogoId ? scene.layers[primaryLogoId] : null;
  if (logo) {
    const slot = LOGOS[logo.assetId]?.wordmark ? layout.logo : layout.mark;
    const ratio = logo.height / Math.max(1, logo.width);
    const width = slot.width ?? slot.size;
    Object.assign(logo, { x: slot.x, y: slot.y, width, height: Math.round(width * ratio), rotation: 0 });
  }

  for (const role of ["caption", "summary"]) {
    const slot = layout[role];
    const layer = roleLayer(scene, role);
    if (layer && slot) {
      Object.assign(layer, { x: slot.x, y: slot.y, width: slot.width, align: slot.align, rotation: 0 });
    }
  }
  placeSummaryUnderCaption(scene);
  return scene;
}

/** Keep the bound summary line just below the caption, whatever the caption's wrapped height. */
function placeSummaryUnderCaption(scene) {
  const caption = roleLayer(scene, "caption");
  const summary = roleLayer(scene, "summary");
  if (!caption || !summary) return;
  const gap = Math.round(summary.fontSize * 0.5);
  summary.y = Math.round(caption.y + (caption.height ?? 0) + gap);
}

/** @returns {object|null} the text layer carrying a layout role. */
export function roleLayer(scene, role) {
  const id = scene.order.find((layerId) => scene.layers[layerId]?.role === role);
  return id ? scene.layers[id] : null;
}

/** @returns {string} the summary line for a payment card: "0.05 ZEC · Coffee stand". */
export function paymentSummaryText(content) {
  const amount = String(content.amount ?? "").trim();
  const label = String(content.label ?? "").trim();
  return [amount ? `${amount} ZEC` : "", label].filter(Boolean).join(" · ");
}

/**
 * Refresh text layers bound to the QR content. Call before rendering.
 * @returns {boolean} whether any text changed
 */
export function syncBoundText(scene) {
  let changed = false;
  for (const id of scene.order) {
    const layer = scene.layers[id];
    if (layer?.kind !== "text" || layer.bound !== "payment-summary") continue;
    const text = paymentSummaryText(scene.content);
    if (layer.text !== text) {
      layer.text = text;
      layer.label = "Amount · label";
      changed = true;
    }
  }
  return changed;
}

/**
 * Show or hide the bound "amount · label" line on payment cards.
 * @returns {boolean} whether the scene changed
 */
export function setPaymentSummary(scene, show) {
  const existing = roleLayer(scene, "summary");
  if (!show) {
    if (!existing) return false;
    scene.order = scene.order.filter((id) => id !== existing.id);
    delete scene.layers[existing.id];
    if (scene.selectedLayerId === existing.id) scene.selectedLayerId = "qr";
    return true;
  }
  if (existing) return false;
  const layout = layoutOf(scene);
  const role = TEXT_ROLES.summary;
  const layer = addLayer(scene, {
    kind: "text",
    role: "summary",
    bound: "payment-summary",
    label: "Amount · label",
    text: paymentSummaryText(scene.content),
    fontFamily: role.fontFamily,
    fontSize: role.fontSize,
    fontWeight: role.fontWeight,
    uppercase: false,
    color: role.color,
    align: layout.summary.align,
    lineHeight: role.lineHeight,
    x: layout.summary.x,
    y: layout.summary.y,
    width: layout.summary.width,
    height: Math.round(role.fontSize * role.lineHeight),
    rotation: 0,
    locked: false,
    deletable: true,
  });
  scene.selectedLayerId = layer.id;
  placeSummaryUnderCaption(scene);
  return true;
}

/** Replace background, layout, QR style, mode and every movable layer. Keeps `scene.content`. */
export function applyTemplate(scene, templateId) {
  const template = TEMPLATES[templateId];
  if (!template) return scene;
  return buildFromTemplate(scene, template);
}

/**
 * Insert a layer: assigns `${kind}-${n}`, appends to the top of the stack, selects and constrains it.
 * @returns {object} the inserted layer
 */
export function addLayer(scene, layer) {
  const serial = scene.nextLayerId;
  scene.nextLayerId += 1;
  const placed = { ...layer, id: `${layer.kind}-${serial}` };
  putLayer(scene, placed);
  scene.selectedLayerId = placed.id;
  constrainLayer(scene, placed);
  return placed;
}

/** @returns {object|null} a character layer positioned like the layout's character slot. */
export function makeCharacterLayer(assetId, scene) {
  const asset = CHARACTERS[assetId];
  if (!asset) return null;
  const layout = layoutOf(scene);
  const offset = cascadeOffset(scene, "character");
  const scale = asset.defaultScale ?? 1;
  const width = Math.round(layout.character.width * scale);
  const height = Math.round(layout.character.height * scale);
  return {
    kind: "character",
    assetId: asset.id,
    label: asset.label,
    x: layout.character.x + Math.round((layout.character.width - width) / 2) + offset,
    y: layout.character.y + layout.character.height - height + offset,
    width,
    height,
    rotation: 0,
    flipX: false,
    locked: false,
    deletable: true,
  };
}

/** @returns {object|null} a logo layer at the top-right cascade position. */
export function makeLogoLayer(assetId, { color = null } = {}, scene) {
  const asset = LOGOS[assetId];
  if (!asset) return null;
  const offset = cascadeOffset(scene, "logo");
  return {
    kind: "logo",
    assetId: asset.id,
    label: asset.label,
    x: OUTPUT.width - 150 - asset.width - offset,
    y: 110 + offset,
    width: asset.width,
    height: asset.height,
    rotation: 0,
    flipX: false,
    // Light-on-dark source marks carry a defaultColor so they read on cream cards.
    color: asset.recolorable ? (color ?? asset.defaultColor ?? null) : null,
    locked: false,
    deletable: true,
  };
}

/** @returns {object|null} a text layer from a TEXT_PRESETS key ('heading' | 'body'). */
export function makeTextLayer(preset, scene) {
  const definition = TEXT_PRESETS[preset];
  if (!definition) return null;
  const offset = cascadeOffset(scene, "text");
  return {
    kind: "text",
    label: definition.label,
    text: definition.text,
    fontFamily: definition.fontFamily,
    fontSize: definition.fontSize,
    fontWeight: fontWeightFor(definition.fontFamily, definition.fontWeight),
    uppercase: false,
    color: definition.color,
    align: definition.align,
    lineHeight: definition.lineHeight,
    x: OUTPUT.safeInset + offset,
    y: Math.round(OUTPUT.height * 0.58) + offset,
    width: definition.width,
    height: initialTextHeight(definition),
    rotation: 0,
    locked: false,
    deletable: true,
  };
}

/** Remove a deletable, unlocked layer. @returns {boolean} whether it was removed. */
export function removeLayer(scene, id) {
  const layer = scene.layers[id];
  if (!layer || layer.locked || !layer.deletable) return false;
  const index = scene.order.indexOf(id);
  scene.order.splice(index, 1);
  delete scene.layers[id];
  if (scene.selectedLayerId === id) {
    scene.selectedLayerId = scene.order[Math.min(index, scene.order.length - 1)] ?? "background";
  }
  return true;
}

/** Duplicate a character/logo/text layer 24px down-right. @returns {object|null} the copy. */
export function duplicateLayer(scene, id) {
  const source = scene.layers[id];
  if (!source || source.locked) return null;
  if (!["character", "logo", "text"].includes(source.kind)) return null;

  const serial = scene.nextLayerId;
  scene.nextLayerId += 1;
  const copy = { ...source, id: `${source.kind}-${serial}`, x: source.x + 24, y: source.y + 24 };
  scene.layers[copy.id] = copy;
  scene.order.splice(scene.order.indexOf(source.id) + 1, 0, copy.id);
  scene.selectedLayerId = copy.id;
  constrainLayer(scene, copy);
  return copy;
}

/** Move a layer within the stack. `background` never moves and nothing goes below it. */
export function reorderLayer(scene, id, direction) {
  const layer = scene.layers[id];
  if (!layer || layer.locked || id === "background") return scene;
  const index = scene.order.indexOf(id);
  const floor = scene.order[0] === "background" ? 1 : 0;

  if (direction === "up" || direction === "down") {
    const nextIndex = index + (direction === "up" ? 1 : -1);
    if (nextIndex < floor || nextIndex >= scene.order.length) return scene;
    [scene.order[index], scene.order[nextIndex]] = [scene.order[nextIndex], scene.order[index]];
    return scene;
  }

  const targetIndex = direction === "front" ? scene.order.length - 1 : floor;
  if (index === targetIndex) return scene;
  scene.order.splice(index, 1);
  scene.order.splice(direction === "front" ? scene.order.length : floor, 0, id);
  return scene;
}

/**
 * Replace the draw order with `ids` (bottom first). Rejects sets that do not
 * match the scene's layers exactly; the background is always forced to the bottom.
 * @param {object} scene
 * @param {string[]} ids
 * @returns {boolean} whether the order changed
 */
export function setLayerOrder(scene, ids) {
  if (!Array.isArray(ids) || ids.length !== scene.order.length) return false;
  const known = new Set(scene.order);
  if (ids.some((id) => !known.has(id)) || new Set(ids).size !== ids.length) return false;
  const next = ids.filter((id) => id !== "background");
  if (known.has("background")) next.unshift("background");
  if (next.every((id, index) => id === scene.order[index])) return false;
  scene.order = next;
  return true;
}

/** Shallow-merge props into a layer, then constrain it. @returns {object|null} the layer. */
export function setLayerProps(scene, id, props) {
  const layer = scene.layers[id];
  if (!layer) return null;
  Object.assign(layer, props);
  if (layer.kind === "text" && typeof props.text === "string") layer.label = textLabel(layer.text);
  constrainLayer(scene, layer);
  return layer;
}

/** Clamp a layer's geometry to its kind's rules. Mutates and returns the layer. */
export function constrainLayer(scene, layer) {
  const safe = OUTPUT.safeInset;

  if (layer.kind === "qr") {
    const size = clamp(Math.min(layer.width, layer.height), 420, 900);
    layer.width = size;
    layer.height = size;
    layer.rotation = 0;
    layer.x = clamp(layer.x, safe, OUTPUT.width - safe - size);
    layer.y = clamp(layer.y, safe, OUTPUT.height - safe - size);
    return layer;
  }

  if (layer.kind === "install") {
    const ratio = INSTALL_LAYER.block.width / INSTALL_LAYER.block.height;
    layer.width = clamp(layer.width, 420, 760);
    layer.height = layer.width / ratio;
    layer.rotation = 0;
    layer.x = clamp(layer.x, safe, OUTPUT.width - safe - layer.width);
    layer.y = clamp(layer.y, safe, OUTPUT.height - safe - layer.height);
    return layer;
  }

  if (layer.kind === "background") {
    layer.x = 0;
    layer.y = 0;
    layer.width = OUTPUT.width;
    layer.height = OUTPUT.height;
    layer.rotation = 0;
    return layer;
  }

  const minimum = MIN_SIZE[layer.kind] ?? MIN_SIZE.character;
  layer.width = clamp(layer.width, minimum.width, OUTPUT.width * 1.5);
  if (layer.kind !== "text") {
    layer.height = clamp(layer.height, minimum.height, OUTPUT.height * 1.5);
  }
  const height = layer.height ?? 0;
  layer.x = clamp(layer.x, -layer.width + VISIBLE_EDGE, OUTPUT.width - VISIBLE_EDGE);
  layer.y = clamp(layer.y, -height + VISIBLE_EDGE, OUTPUT.height - VISIBLE_EDGE);
  return layer;
}

/** Select a layer by id (ignored when the id is unknown). */
export function selectLayer(scene, id) {
  if (scene.layers[id]) scene.selectedLayerId = id;
  return scene;
}

/** @returns {object[]} every layer except the background, bottom → top. */
export function movableLayers(scene) {
  return scene.order.filter((id) => id !== "background").map((id) => scene.layers[id]).filter(Boolean);
}

/** @returns {object} the selected layer, falling back to the QR (then background). */
export function selectedLayer(scene) {
  return scene.layers[scene.selectedLayerId] ?? scene.layers.qr ?? scene.layers.background;
}

/** @returns {string} human summary, e.g. "Indigo Wave · 1 cat · 2 logos". */
export function describe(scene) {
  const background = BACKGROUNDS[scene.layers.background?.assetId]?.label ?? "Custom";
  const count = (kind) => scene.order.filter((id) => scene.layers[id]?.kind === kind).length;
  const cats = count("character");
  const logos = count("logo");
  return `${background} · ${cats} cat${cats === 1 ? "" : "s"} · ${logos} logo${logos === 1 ? "" : "s"}`;
}
