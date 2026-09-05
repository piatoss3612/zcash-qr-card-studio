// Canvas rendering: scene drawing, text measurement, logo tint, PNG export (pHYs), print, thumbnails, batch.
// Ported from the pre-overhaul root editor.js. No DOM lookups: everything comes in as arguments.
/* global qrcode */

import {
  OUTPUT,
  INSTALL_URL,
  QUIET_MODULES,
  BACKGROUNDS,
  CHARACTERS,
  LOGOS,
  QR_STYLES,
  INSTALL_LAYER,
  FONTS,
} from "./catalog.js";
import { createZip } from "./zip.js";

const TINT_CACHE_LIMIT = 64;
const TINT_MAX_EDGE = 2048;
const PLACEHOLDER_CAPTION = "Fill in the QR content to generate the code";

/** @type {Map<string, HTMLCanvasElement>} */
const tintCache = new Map();

/** @type {CanvasRenderingContext2D|null} */
let measureContext = null;
/** @type {HTMLCanvasElement|null} */
let thumbSource = null;
/** @type {unknown} */
let sampleCode = null;

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/**
 * Load an image, resolving to `null` on error or a missing source.
 * @param {string|null|undefined} source
 * @returns {Promise<HTMLImageElement|null>}
 */
function loadImage(source) {
  if (!source) return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

/**
 * Load the webfonts and every catalog image (sequentially, like the old editor).
 * @param {(loaded: number, total: number) => void} [onProgress]
 * @returns {Promise<{ backgrounds: Record<string, HTMLImageElement|null>, characters: Record<string, HTMLImageElement|null>, logos: Record<string, HTMLImageElement|null> }>}
 */
export async function loadAssets(onProgress) {
  await Promise.all([
    document.fonts.load('500 16px "Geist"'),
    document.fonts.load('700 16px "Geist"'),
    document.fonts.load('400 30px "Zarathustra"'),
  ]);

  const assets = { backgrounds: {}, characters: {}, logos: {} };
  const jobs = [
    ...Object.values(BACKGROUNDS).map((entry) => ["backgrounds", entry]),
    ...Object.values(CHARACTERS).map((entry) => ["characters", entry]),
    ...Object.values(LOGOS).map((entry) => ["logos", entry]),
  ];

  let loaded = 0;
  for (const [bucket, entry] of jobs) {
    assets[bucket][entry.id] = await loadImage(entry.image);
    loaded += 1;
    if (onProgress) onProgress(loaded, jobs.length);
  }
  return assets;
}

/**
 * True when every image the scene references has decoded.
 * Text, QR and install layers are always ready.
 * @param {any} scene
 * @param {any} assets
 * @returns {boolean}
 */
export function assetsReady(scene, assets) {
  if (!scene || !assets) return false;
  return scene.order.every((layerId) => {
    const layer = scene.layers[layerId];
    if (!layer) return true;
    if (layer.kind === "background") {
      const background = BACKGROUNDS[layer.assetId];
      if (!background || !background.image) return true;
      return Boolean(assets.backgrounds?.[layer.assetId]?.naturalWidth);
    }
    if (layer.kind === "character") return Boolean(assets.characters?.[layer.assetId]?.naturalWidth);
    if (layer.kind === "logo") return Boolean(assets.logos?.[layer.assetId]?.naturalWidth);
    return true;
  });
}

// ---------------------------------------------------------------------------
// QR
// ---------------------------------------------------------------------------

/**
 * Build a QR code (auto type number, ECC level 'M'). Throws when the value cannot be encoded.
 * @param {string} value
 * @returns {any} qrcode object
 */
export function makeQr(value) {
  const code = qrcode(0, "M");
  code.addData(value, "Byte");
  code.make();
  return code;
}

/**
 * Memoized sample QR for thumbnails and template previews.
 * @returns {any}
 */
export function sampleQrCode() {
  if (!sampleCode) sampleCode = makeQr("https://vizor.cash");
  return sampleCode;
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/**
 * Trace a rounded rectangle path.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x @param {number} y @param {number} width @param {number} height @param {number} radius
 */
function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

/**
 * Draw an image contained (aspect preserved, centred) in a box.
 * @param {CanvasRenderingContext2D} ctx
 * @param {CanvasImageSource & { naturalWidth?: number, naturalHeight?: number, width?: number, height?: number }} image
 * @param {number} x @param {number} y @param {number} width @param {number} height
 */
function drawContain(ctx, image, x, y, width, height) {
  const sourceWidth = image?.naturalWidth ?? image?.width;
  const sourceHeight = image?.naturalHeight ?? image?.height;
  if (!sourceWidth || !sourceHeight) return;
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = Math.round(sourceWidth * scale);
  const drawHeight = Math.round(sourceHeight * scale);
  const drawX = Math.round(x + (width - drawWidth) / 2);
  const drawY = Math.round(y + (height - drawHeight) / 2);
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

/**
 * Draw an image contained inside a layer box, honouring rotation and horizontal flip.
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} image
 * @param {{ x: number, y: number, width: number, height: number, rotation?: number, flipX?: boolean }} transform
 */
function drawContainTransformed(ctx, image, transform) {
  const sourceWidth = image?.naturalWidth ?? image?.width;
  if (!sourceWidth) return;
  ctx.save();
  ctx.translate(transform.x + transform.width / 2, transform.y + transform.height / 2);
  ctx.rotate(((transform.rotation ?? 0) * Math.PI) / 180);
  ctx.scale(transform.flipX ? -1 : 1, 1);
  drawContain(ctx, image, -transform.width / 2, -transform.height / 2, transform.width, transform.height);
  ctx.restore();
}

/**
 * Fill the card with the background colour, then the background artwork if it has one.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ id: string, fill: string, image: string|null }} background
 * @param {HTMLImageElement|null} image
 */
function drawBackground(ctx, background, image) {
  ctx.fillStyle = background.fill;
  ctx.fillRect(0, 0, OUTPUT.width, OUTPUT.height);
  if (image?.naturalWidth) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, OUTPUT.width, OUTPUT.height);
  }
}

/**
 * Draw the QR panel and its modules.
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} code
 * @param {{ x: number, y: number, size: number, padding?: number, radius?: number }} geometry
 * @param {any} style
 */
function drawQr(ctx, code, geometry, style) {
  const { x, y, size, padding = 0 } = geometry;

  drawQrPanel(ctx, geometry, style);

  const count = code.getModuleCount();
  const totalModules = count + QUIET_MODULES * 2;
  const moduleSize = Math.max(1, Math.floor((size - padding * 2) / totalModules));
  const renderSize = totalModules * moduleSize;
  const fieldX = x + Math.floor((size - renderSize) / 2);
  const fieldY = y + Math.floor((size - renderSize) / 2);
  const originX = fieldX + QUIET_MODULES * moduleSize;
  const originY = fieldY + QUIET_MODULES * moduleSize;

  ctx.fillStyle = style.modules;
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (code.isDark(row, col)) {
        ctx.fillRect(originX + col * moduleSize, originY + row * moduleSize, moduleSize, moduleSize);
      }
    }
  }
}

/**
 * Panel (card + optional shadow/stroke) shared by drawQr and the placeholder.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, size: number, radius?: number }} geometry
 * @param {any} style
 */
function drawQrPanel(ctx, geometry, style) {
  const { x, y, size } = geometry;
  const radius = geometry.radius ?? style.radius;

  ctx.save();
  if (style.shadow) {
    ctx.shadowColor = "rgba(20, 24, 24, 0.11)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 7;
  }
  ctx.fillStyle = style.panel;
  roundedRect(ctx, x, y, size, size, radius);
  ctx.fill();
  ctx.restore();

  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = 2;
    roundedRect(ctx, x + 1, y + 1, size - 2, size - 2, Math.max(0, radius - 1));
    ctx.stroke();
  }
}

/**
 * Placeholder drawn in place of the QR when the content is empty or invalid:
 * the panel, a light diagonal hatch and a centred caption.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, size: number, radius?: number }} geometry
 * @param {any} style
 */
function drawQrPlaceholder(ctx, geometry, style) {
  const { x, y, size } = geometry;
  const radius = geometry.radius ?? style.radius;

  drawQrPanel(ctx, geometry, style);

  // Ghost of a sample QR so the composition reads as finished while the
  // content is still empty. Exports stay gated on a real code (canExport).
  ctx.save();
  roundedRect(ctx, x, y, size, size, radius);
  ctx.clip();
  ctx.globalAlpha = 0.14;
  drawQr(ctx, sampleQrCode(), { ...geometry, radius }, { ...style, panel: "transparent", shadow: false, stroke: null });
  ctx.restore();

  ctx.save();
  ctx.font = `600 ${Math.round(size * 0.034)}px ${FONTS.Geist.stack}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const padX = Math.round(size * 0.03);
  const pillH = Math.round(size * 0.075);
  const textW = ctx.measureText(PLACEHOLDER_CAPTION).width;
  const pillW = Math.min(size - padX * 2, textW + padX * 2);
  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.shadowColor = "rgba(20, 24, 24, 0.14)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  roundedRect(ctx, cx - pillW / 2, cy - pillH / 2, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#5d6262";
  ctx.fillText(PLACEHOLDER_CAPTION, cx, cy, pillW - padX * 2);
  ctx.restore();
}

/**
 * Draw the "Get Vizor" install card. `transform` is the install layer box.
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} code
 * @param {{ x: number, y: number, width: number, height: number }} transform
 */
function drawInstallLayer(ctx, code, transform) {
  const scaleX = transform.width / INSTALL_LAYER.block.width;
  const scaleY = transform.height / INSTALL_LAYER.block.height;

  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.scale(scaleX, scaleY);
  ctx.fillStyle = "#fffdf8";
  roundedRect(ctx, 0, 0, INSTALL_LAYER.block.width, INSTALL_LAYER.block.height, INSTALL_LAYER.block.radius);
  ctx.fill();
  ctx.strokeStyle = "rgba(20, 24, 24, 0.22)";
  ctx.lineWidth = 2;
  roundedRect(
    ctx,
    1,
    1,
    INSTALL_LAYER.block.width - 2,
    INSTALL_LAYER.block.height - 2,
    INSTALL_LAYER.block.radius - 1,
  );
  ctx.stroke();

  drawQr(
    ctx,
    code,
    {
      ...INSTALL_LAYER.qr,
      x: INSTALL_LAYER.qr.x - INSTALL_LAYER.block.x,
      y: INSTALL_LAYER.qr.y - INSTALL_LAYER.block.y,
    },
    {
      ...QR_STYLES.clean,
      radius: INSTALL_LAYER.qr.radius,
      shadow: false,
      stroke: "rgba(20, 24, 24, 0.16)",
    },
  );

  ctx.fillStyle = "#b90a4a";
  roundedRect(ctx, 202, 49, 4, 92, 2);
  ctx.fill();

  ctx.fillStyle = "#141818";
  ctx.font = `400 34px ${FONTS.Zarathustra.stack}`;
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Get Vizor", 226, 88);
  ctx.fillStyle = "#5d6262";
  ctx.font = `500 20px ${FONTS.Geist.stack}`;
  ctx.fillText("Scan to install Vizor first.", 226, 130);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Tinting
// ---------------------------------------------------------------------------

/**
 * Draw a single-colour mark recoloured to `color`, using an offscreen
 * `source-in` fill. Results are cached by asset, colour and draw size.
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} image
 * @param {string} color
 * @param {{ x: number, y: number, width: number, height: number, rotation?: number, flipX?: boolean, assetId?: string }} transform
 */
export function drawTintedImage(ctx, image, color, transform) {
  const sourceWidth = image?.naturalWidth ?? image?.width;
  if (!sourceWidth) return;

  const boxWidth = Math.max(1, Math.round(transform.width));
  const boxHeight = Math.max(1, Math.round(transform.height));
  const longEdge = Math.max(boxWidth, boxHeight);
  const scale = longEdge > TINT_MAX_EDGE ? TINT_MAX_EDGE / longEdge : 1;
  const canvasWidth = Math.max(1, Math.round(boxWidth * scale));
  const canvasHeight = Math.max(1, Math.round(boxHeight * scale));

  const key = `${transform.assetId ?? "?"}|${color}|${canvasWidth}x${canvasHeight}`;
  let tinted = tintCache.get(key);
  if (!tinted) {
    tinted = document.createElement("canvas");
    tinted.width = canvasWidth;
    tinted.height = canvasHeight;
    const tintCtx = tinted.getContext("2d");
    tintCtx.imageSmoothingEnabled = true;
    tintCtx.imageSmoothingQuality = "high";
    drawContain(tintCtx, image, 0, 0, canvasWidth, canvasHeight);
    tintCtx.globalCompositeOperation = "source-in";
    tintCtx.fillStyle = color;
    tintCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    tintCtx.globalCompositeOperation = "source-over";

    if (tintCache.size >= TINT_CACHE_LIMIT) {
      const oldest = tintCache.keys().next().value;
      if (oldest !== undefined) tintCache.delete(oldest);
    }
    tintCache.set(key, tinted);
  } else {
    // Refresh recency for the simple LRU eviction above.
    tintCache.delete(key);
    tintCache.set(key, tinted);
  }

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(transform.x + transform.width / 2, transform.y + transform.height / 2);
  ctx.rotate(((transform.rotation ?? 0) * Math.PI) / 180);
  ctx.scale(transform.flipX ? -1 : 1, 1);
  ctx.drawImage(tinted, -transform.width / 2, -transform.height / 2, transform.width, transform.height);
  ctx.restore();
}

/**
 * Draw a character or logo layer.
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} layer
 * @param {any} assets
 */
function drawVisualLayer(ctx, layer, assets) {
  const image = layer.kind === "character"
    ? assets.characters?.[layer.assetId]
    : assets.logos?.[layer.assetId];
  if (!image?.naturalWidth) return;

  if (layer.kind === "logo" && layer.color && LOGOS[layer.assetId]?.recolorable) {
    drawTintedImage(ctx, image, layer.color, { ...layer, assetId: layer.assetId });
    return;
  }

  ctx.save();
  const crisp = layer.kind === "character" || Boolean(LOGOS[layer.assetId]?.pixelArt);
  ctx.imageSmoothingEnabled = !crisp;
  if (!crisp) ctx.imageSmoothingQuality = "high";
  drawContainTransformed(ctx, image, layer);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

/**
 * CSS font string for a text layer (Zarathustra is always weight 400).
 * @param {any} layer
 * @returns {string}
 */
export function textFont(layer) {
  const font = FONTS[layer.fontFamily] ?? FONTS.Geist;
  const weight = font.id === "Zarathustra" ? 400 : (layer.fontWeight ?? 500);
  return `${weight} ${layer.fontSize}px ${font.stack}`;
}

/**
 * Greedy word wrap. Explicit newlines split first; over-long words break by character.
 * @param {CanvasRenderingContext2D} ctx  context with `font` already set
 * @param {string} text
 * @param {number} maxWidth
 * @returns {string[]}
 */
export function wrapText(ctx, text, maxWidth) {
  const limit = Math.max(1, maxWidth);
  const lines = [];

  for (const paragraph of String(text ?? "").split("\n")) {
    const words = paragraph.split(/\s+/).filter((word) => word.length > 0);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && ctx.measureText(candidate).width > limit) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
      // Break a single word that still overflows on its own.
      while (ctx.measureText(current).width > limit && current.length > 1) {
        let cut = current.length - 1;
        while (cut > 1 && ctx.measureText(current.slice(0, cut)).width > limit) cut -= 1;
        lines.push(current.slice(0, cut));
        current = current.slice(cut);
      }
    }
    lines.push(current);
  }

  return lines;
}

/**
 * Shared offscreen 2d context used for measurement only.
 * @returns {CanvasRenderingContext2D}
 */
function getMeasureContext() {
  if (!measureContext) {
    measureContext = document.createElement("canvas").getContext("2d");
  }
  return measureContext;
}

/**
 * Wrap a text layer and derive its box height.
 * @param {any} layer
 * @returns {{ lines: string[], height: number }}
 */
export function measureTextLayer(layer) {
  const ctx = getMeasureContext();
  ctx.font = textFont(layer);
  const lines = wrapText(ctx, layer.text, layer.width);
  const height = Math.max(lines.length, 1) * layer.fontSize * (layer.lineHeight ?? 1.2);
  return { lines, height };
}

/**
 * Set `layer.height` from the measured wrapped text. Mutates and returns the layer.
 * @param {any} layer
 * @returns {any}
 */
export function syncTextLayerHeight(layer) {
  layer.height = measureTextLayer(layer).height;
  return layer;
}

/**
 * Draw a text layer: centred origin, rotated, one baseline per wrapped line.
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} layer
 */
export function drawTextLayer(ctx, layer) {
  const { lines, height } = measureTextLayer(layer);
  const lineStep = layer.fontSize * (layer.lineHeight ?? 1.2);
  const align = layer.align ?? "left";

  ctx.save();
  ctx.translate(layer.x + layer.width / 2, layer.y + height / 2);
  ctx.rotate(((layer.rotation ?? 0) * Math.PI) / 180);
  ctx.font = textFont(layer);
  ctx.fillStyle = layer.color;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = align === "center" ? "center" : align === "right" ? "right" : "left";

  const x = align === "center" ? 0 : align === "right" ? layer.width / 2 : -layer.width / 2;
  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillText(lines[i], x, -height / 2 + i * lineStep + layer.fontSize * 0.8);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

/**
 * Draw the full 1311×1819 card. Text layer heights are re-derived (and mutated) first
 * so stale template heights never affect placement.
 * @param {CanvasRenderingContext2D} ctx
 * @param {any} scene
 * @param {{ assets: any, qrCode: any|null, installCode: any }} options
 */
export function renderScene(ctx, scene, { assets, qrCode, installCode }) {
  ctx.clearRect(0, 0, OUTPUT.width, OUTPUT.height);

  for (const layerId of scene.order) {
    const layer = scene.layers[layerId];
    if (!layer) continue;

    if (layer.kind === "background") {
      const background = BACKGROUNDS[layer.assetId] ?? BACKGROUNDS.paper;
      drawBackground(ctx, background, assets.backgrounds?.[layer.assetId] ?? null);
    } else if (layer.kind === "character" || layer.kind === "logo") {
      drawVisualLayer(ctx, layer, assets);
    } else if (layer.kind === "text") {
      syncTextLayerHeight(layer);
      drawTextLayer(ctx, layer);
    } else if (layer.kind === "qr") {
      const style = QR_STYLES[scene.qrStyle] ?? QR_STYLES.clean;
      const geometry = {
        x: layer.x,
        y: layer.y,
        size: Math.min(layer.width, layer.height),
        padding: 0,
      };
      if (qrCode) drawQr(ctx, qrCode, geometry, style);
      else drawQrPlaceholder(ctx, geometry, style);
    } else if (layer.kind === "install") {
      drawInstallLayer(ctx, installCode, layer);
    }
  }
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * CRC-32 over a byte array (PNG chunk checksum).
 * @param {Uint8Array} bytes
 * @returns {number}
 */
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Build a PNG chunk (length + type + data + crc).
 * @param {string} type
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
function pngChunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  const crcInput = new Uint8Array(typeBytes.length + data.length);
  crcInput.set(typeBytes);
  crcInput.set(data, typeBytes.length);
  view.setUint32(8 + data.length, crc32(crcInput));
  return chunk;
}

/**
 * Rewrite a PNG blob with a pHYs chunk declaring `dpi`.
 * @param {Blob} blob
 * @param {number} dpi
 * @returns {Promise<Blob>}
 */
async function setPngDpi(blob, dpi) {
  const source = new Uint8Array(await blob.arrayBuffer());
  const signature = source.slice(0, 8);
  const chunks = [];
  const pixelsPerMeter = Math.round(dpi / 0.0254);
  const density = new Uint8Array(9);
  const densityView = new DataView(density.buffer);
  densityView.setUint32(0, pixelsPerMeter);
  densityView.setUint32(4, pixelsPerMeter);
  density[8] = 1;
  const physicalChunk = pngChunk("pHYs", density);

  let offset = 8;
  while (offset < source.length) {
    const length = new DataView(source.buffer, source.byteOffset + offset, 4).getUint32(0);
    const end = offset + 12 + length;
    const type = new TextDecoder().decode(source.slice(offset + 4, offset + 8));
    if (type !== "pHYs") chunks.push(source.slice(offset, end));
    if (type === "IHDR") chunks.push(physicalChunk);
    offset = end;
  }

  return new Blob([signature, ...chunks], { type: "image/png" });
}

/**
 * Promise wrapper around canvas.toBlob.
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Blob>}
 */
function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG encoding failed."));
    }, "image/png");
  });
}

/**
 * Create a fresh offscreen card-sized canvas.
 * @returns {HTMLCanvasElement}
 */
function createCardCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT.width;
  canvas.height = OUTPUT.height;
  return canvas;
}

/**
 * Render the scene at full size and return a print-ready PNG (pHYs 300ppi).
 * @param {any} scene
 * @param {{ assets: any, qrCode: any|null, installCode: any }} options
 * @returns {Promise<Blob>}
 */
export async function exportPngBlob(scene, { assets, qrCode, installCode }) {
  const canvas = createCardCanvas();
  const ctx = canvas.getContext("2d", { alpha: false });
  renderScene(ctx, scene, { assets, qrCode, installCode });
  const blob = await canvasToBlob(canvas);
  return setPngDpi(blob, OUTPUT.dpi);
}

/**
 * Crop the bleed off `sourceCanvas` into the 1240×1748 trim print canvas.
 * @param {HTMLCanvasElement} printCanvas
 * @param {HTMLCanvasElement} sourceCanvas
 */
export function drawPrintCanvas(printCanvas, sourceCanvas) {
  const printContext = printCanvas.getContext("2d", { alpha: false });
  printContext.clearRect(0, 0, OUTPUT.trimWidth, OUTPUT.trimHeight);
  printContext.drawImage(
    sourceCanvas,
    OUTPUT.bleed,
    OUTPUT.bleed,
    OUTPUT.trimWidth,
    OUTPUT.trimHeight,
    0,
    0,
    OUTPUT.trimWidth,
    OUTPUT.trimHeight,
  );
}

/**
 * Render a scaled-down preview canvas of the scene.
 * @param {any} scene
 * @param {{ assets: any, qrCode?: any|null, installCode?: any, width?: number }} options
 * @returns {HTMLCanvasElement}
 */
export function renderThumbnail(scene, { assets, qrCode = null, installCode, width = 180 }) {
  if (!thumbSource) thumbSource = createCardCanvas();
  const sourceCtx = thumbSource.getContext("2d");
  renderScene(sourceCtx, scene, { assets, qrCode, installCode });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width);
  canvas.height = Math.round((width * OUTPUT.height) / OUTPUT.width);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(thumbSource, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Render one PNG per item and pack them into a store-only ZIP.
 * @param {any} scene
 * @param {{ index: number, value: string }[]} items  `value` is the final QR string
 * @param {{ assets: any, installCode: any, onProgress?: (done: number, total: number) => void, setContent?: (scene: any, item: any) => any }} options
 * @returns {Promise<Blob>}
 */
export async function exportBatch(scene, items, { assets, installCode, onProgress, setContent }) {
  const files = [];
  const lastModified = new Date();

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const target = setContent ? (setContent(scene, item) ?? scene) : scene;
    const code = makeQr(item.value);
    const blob = await exportPngBlob(target, { assets, qrCode: code, installCode });
    files.push({
      name: `card-${String(item.index + 1).padStart(3, "0")}.png`,
      data: new Uint8Array(await blob.arrayBuffer()),
      lastModified,
    });
    if (onProgress) onProgress(i + 1, items.length);
    await new Promise((resolve) => setTimeout(resolve));
  }

  return createZip(files);
}

export { INSTALL_URL };
