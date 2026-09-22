import qrcode from "qrcode-generator";
import { STYLES, COMPANIONS, LAYOUTS, CARD_LOGOS, escapeXml, paymentUri } from "./card-data.js";

export const CARD_FONTS = {
  editorial: "assets/fonts/zarathustra-v01.woff2",
  terminal: "assets/fonts/geist-mono-variable.woff2",
  paper: "assets/fonts/geist-bold.woff2",
  midnight: "assets/fonts/geist-bold.woff2",
  pixel: "assets/fonts/silkscreen-regular.woff2",
  aurora: "assets/fonts/geist-bold.woff2",
  blueprint: "assets/fonts/space-grotesk-variable.woff2",
  airmail: "assets/fonts/geist-bold.woff2",
};
const MONO_BIO = new Set(["terminal", "blueprint"]);
/** Variable name faces declare their range so the requested weight is real, not synthesized. */
const VARIABLE_NAME_WEIGHT = { blueprint: 700 };
// Low-opacity outlines take their tone from the surface, never a tinted neutral.
const LIGHT_EDGE = "rgba(0,0,0,.1)";
const DARK_EDGE = "rgba(255,255,255,.12)";

/** One inset aligns the QR tile, text column and corner logo in every layout. */
export function cardGeometry(layout) {
  const { width, height } = LAYOUTS[layout];
  const compact = layout === "compact";
  const inset = compact ? 24 : 20;
  const qr = layout === "profile"
    ? null
    : { x: inset, y: compact ? inset : height - inset - 160, size: 160 };
  return {
    width,
    height,
    qr,
    textX: compact ? qr.x + qr.size + 20 : inset,
    textWidth: layout === "portrait" ? 320 : compact ? 270 : layout === "profile" ? 272 : 330,
    logo: { x: width - 20 - 30, y: 20, size: 30 },
  };
}

function isLight(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
}

/** Style surfaces stay clear of the QR tile, its quiet zone and the text column. */
function surface(style, theme, geo) {
  const { width: W, height: H, qr, textX, textWidth, logo } = geo;
  const portrait = W < H;
  if (style === "paper") {
    return {
      radius: 16,
      qrRadius: 6,
      back: `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="10" fill="none" stroke="${theme.border}"/>`,
      edge: LIGHT_EDGE,
    };
  }
  if (style === "midnight") {
    // Two quiet orbits and one small light sit behind the Vizorcat, never behind copy or the QR.
    const zoneX = portrait ? qr.x + qr.size + 16 : textX + textWidth + 10;
    const zoneY = portrait ? qr.y - 10 : 0;
    const r = Math.min(W, H);
    return {
      radius: 16,
      qrRadius: 6,
      defs: `<clipPath id="md-zone"><rect x="${zoneX}" y="${zoneY}" width="${W - zoneX}" height="${H - zoneY}"/></clipPath>`,
      back: `<g clip-path="url(#md-zone)" fill="none" stroke="${theme.accent}" stroke-width="1.5"><circle cx="${W}" cy="${H}" r="${r * 0.47}" stroke-opacity=".3"/><circle cx="${W}" cy="${H}" r="${r * 0.62}" stroke-opacity=".16"/><circle cx="${W - r * 0.62 * 0.8}" cy="${H - r * 0.62 * 0.6}" r="2.5" fill="${theme.accent}" fill-opacity=".85" stroke="none"/></g>`,
      edge: DARK_EDGE,
    };
  }
  if (style === "pixel") {
    const notched = (i, n) => `M${i + n},${i}H${W - i - n}V${i + n}H${W - i}V${H - i - n}H${W - i - n}V${H - i}H${i + n}V${H - i - n}H${i}V${i + n}H${i + n}Z`;
    return {
      clip: notched(0, 6),
      back: `<path d="${notched(0, 6)} ${notched(4, 6)}" fill="${theme.accent}" fill-rule="evenodd"/>`,
    };
  }
  if (style === "editorial") {
    return {
      radius: 12,
      qrRadius: 4,
      back: `<rect width="${W}" height="5" fill="${theme.accent}"/>`,
      edge: LIGHT_EDGE,
    };
  }
  if (style === "terminal") {
    return {
      radius: 10,
      qrRadius: 4,
      cursor: true,
      defs: `<pattern id="tm-scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" fill-opacity=".045"/></pattern>`,
      back: `<rect width="${W}" height="${H}" fill="url(#tm-scan)"/>`,
      edge: DARK_EDGE,
    };
  }
  if (style === "aurora") {
    const glow = (id, color, cx, cy, r, opacity) =>
      `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
    const reach = Math.max(W, H);
    return {
      radius: 20,
      qrRadius: 12,
      defs: glow("au-gold", "#f4b728", W * 0.86, H * 0.92, reach * 0.5, 0.42) +
        glow("au-violet", "#7a5cff", W * 0.62, H * 0.08, reach * 0.55, 0.38) +
        glow("au-teal", "#1fc8b4", W * 0.38, H, reach * 0.38, 0.34),
      back: `<rect width="${W}" height="${H}" fill="url(#au-violet)"/><rect width="${W}" height="${H}" fill="url(#au-teal)"/><rect width="${W}" height="${H}" fill="url(#au-gold)"/>`,
      edge: DARK_EDGE,
    };
  }
  if (style === "blueprint") {
    const mark = (x, y, dx, dy) => `M${x + dx * 12},${y}H${x}V${y + dy * 12}`;
    return {
      defs: `<pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M10 0V40M20 0V40M30 0V40M0 10H40M0 20H40M0 30H40" stroke="#fff" stroke-opacity=".07" stroke-width="1"/><path d="M0 0V40M0 0H40" stroke="#fff" stroke-opacity=".16" stroke-width="1"/></pattern>`,
      back: `<rect width="${W}" height="${H}" fill="url(#bp-grid)"/><path d="${mark(8, 8, 1, 1)}${mark(W - 8, 8, -1, 1)}${mark(8, H - 8, 1, -1)}${mark(W - 8, H - 8, -1, -1)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>`,
      edge: DARK_EDGE,
    };
  }
  if (style === "airmail") {
    const band = 6;
    // The stamp frames the corner logo slot.
    const sx = logo.x - 7;
    const sy = logo.y - 7;
    const size = logo.size + 14;
    let holes = "";
    for (let t = 1; t < size; t += 6)
      for (const [cx, cy] of [[sx + t, sy], [sx + t, sy + size], [sx, sy + t], [sx + size, sy + t]])
        holes += `M${cx - 2},${cy}a2,2 0 1,0 4,0a2,2 0 1,0 -4,0`;
    const stamp = `<g filter="url(#am-shadow)"><rect x="${sx}" y="${sy}" width="${size}" height="${size}" fill="#fff" mask="url(#am-perf)"/></g><rect x="${sx + 4.5}" y="${sy + 4.5}" width="${size - 9}" height="${size - 9}" fill="#e4ecf8" stroke="${theme.border}"/>`;
    const waves = [0, 1, 2]
      .map((i) => {
        let d = `M${sx - 78},${sy + 14 + i * 8}`;
        for (let x = sx - 78; x < sx - 18; x += 12) d += `q3,-3 6,0t6,0`;
        return d;
      })
      .join("");
    const postmark = portrait
      ? ""
      : `<g fill="none" stroke="${theme.ink}" stroke-opacity=".42" stroke-width="1.3"><circle cx="${sx + 2}" cy="${sy + 30}" r="17"/><circle cx="${sx + 2}" cy="${sy + 30}" r="13" stroke-dasharray="2 3"/><path d="${waves}"/></g>`;
    return {
      radius: 10,
      qrRadius: 6,
      defs: `<pattern id="am-stripes" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="10" height="28" fill="${theme.accent}"/><rect x="14" width="10" height="28" fill="${theme.border}"/></pattern><mask id="am-perf"><rect x="${sx}" y="${sy}" width="${size}" height="${size}" fill="#fff"/><path d="${holes}" fill="#000"/></mask><filter id="am-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#1d2a44" flood-opacity=".28"/></filter>`,
      back: `<path d="M0 0H${W}V${H}H0Z M${band} ${band}V${H - band}H${W - band}V${band}Z" fill="url(#am-stripes)" fill-rule="evenodd"/>${stamp}`,
      front: postmark,
      edge: LIGHT_EDGE,
    };
  }
  return {};
}

export function qrMatrix(uri) {
  const qr = qrcode(0, "M");
  qr.addData(uri, "Byte");
  qr.make();
  return qr;
}

export function qrSvg(uri, background = "#fff") {
  const qr = qrMatrix(uri);
  const count = qr.getModuleCount();
  const size = count + 8;
  let path = "";
  for (let y = 0; y < count; y++)
    for (let x = 0; x < count; x++) {
      if (qr.isDark(y, x)) path += `M${x + 4},${y + 4}h1v1h-1z`;
    }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size * 4}" height="${size * 4}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="${background}"/><path d="${path}" fill="#17231f"/></svg>`;
}

/** Approximate advance widths in em, erring wide; CJK and emoji glyphs take a full em. */
const isWide = (char) => char.codePointAt(0) > 0x2e7f;
function bioEm(text, mono) {
  let em = 0;
  for (const char of text)
    em += isWide(char) ? 1 : mono ? 0.6 : char === " " ? 0.3 : /[mwMW@]/.test(char) ? 0.82 : /[iljtfr.,:;'!|I]/.test(char) ? 0.32 : 0.57;
  return em;
}
function nameEm(text, style) {
  let em = 0;
  for (const char of text)
    em += isWide(char) ? 1 : style === "pixel" ? 0.85 : style === "terminal" ? 0.65 : /[MW@]/.test(char) ? 0.95 : /[ilI .]/.test(char) ? 0.3 : 0.65;
  return em;
}

/** Greedy wrap by measured width; long tokens break after hyphens, then between characters. */
function wrap(text, maxEm, measure) {
  const rows = [];
  let row = "";
  const push = () => {
    if (row) rows.push(row);
    row = "";
  };
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const joined = row ? `${row} ${word}` : word;
    if (measure(joined) <= maxEm) {
      row = joined;
      continue;
    }
    push();
    for (const piece of word.split(/(?<=-)/)) {
      if (measure(row + piece) <= maxEm) {
        row += piece;
        continue;
      }
      push();
      if (measure(piece) <= maxEm) {
        row = piece;
        continue;
      }
      for (const char of piece) {
        if (row && measure(row + char) > maxEm) push();
        row += char;
      }
    }
  }
  push();
  // Pretty wrapping: pull words down so the last row is not a short orphan.
  while (rows.length > 1) {
    const words = rows.at(-2).split(" ");
    const moved = `${words.at(-1)} ${rows.at(-1)}`;
    if (words.length < 2 || measure(rows.at(-2)) < 1.6 * measure(rows.at(-1)) || measure(moved) > maxEm) break;
    rows[rows.length - 2] = words.slice(0, -1).join(" ");
    rows[rows.length - 1] = moved;
  }
  return rows;
}

/** Split a long name into the two most even rows, preferring spaces and hyphens. */
function splitName(name, measure) {
  const chars = [...name];
  let best = null;
  for (let i = 1; i < chars.length; i++) {
    const breakable = chars[i - 1] === " " || chars[i - 1] === "-";
    const a = chars.slice(0, i).join("").trimEnd();
    const b = chars.slice(i).join("").trimStart();
    const score = Math.max(measure(a), measure(b)) + (breakable ? 0 : 1000);
    if (a && b && (!best || score < best.score)) best = { score, rows: [a, b] };
  }
  return best ? best.rows : [name];
}

/**
 * Fit the full name and introduction into the text box. Sizes step down before any
 * copy is dropped; truncation at a word boundary is the last resort and is flagged.
 */
function layoutText({ name, bio, style, width, top, bottom, center, nameCap, bioSizes }) {
  const nameMeasure = (text) => nameEm(text, style);
  const bioMeasure = (text) => bioEm(text, MONO_BIO.has(style));
  const count = [...name].length;
  const oneRowMax = Math.min(nameCap, style === "pixel" ? 44 : count <= 8 ? 72 : count <= 11 ? 48 : 40);
  const single = width / nameMeasure(name);
  const nameRows = single >= Math.min(oneRowMax, 30) ? [name] : splitName(name, nameMeasure);
  const nameFit = Math.min(nameRows.length > 1 ? Math.min(nameCap, 34) : oneRowMax, width / Math.max(...nameRows.map(nameMeasure)));
  const avail = bottom - top;
  // Rows without descenders need less room below the baseline, which keeps short
  // names large when an introduction shares the box.
  const drop = (row, size, full, flat) => (/[gjpqy]/.test(row) ? full : flat) * size;
  const measureBlock = (size, bioRows, b) => {
    const nameHeight = 0.74 * size + (nameRows.length - 1) * 1.12 * size + drop(nameRows.at(-1), size, 0.22, 0.06);
    const gap = bioRows.length ? Math.max(8, 0.2 * size) : 0;
    const bioHeight = bioRows.length
      ? 0.74 * b + (bioRows.length - 1) * 1.4 * b + drop(bioRows.at(-1), b, 0.26, 0.1)
      : 0;
    return { gap, height: nameHeight + gap + bioHeight };
  };
  // The introduction keeps its size first and wraps; the name gives way before it.
  let best = null;
  for (const b of bioSizes) {
    const bioRows = bio ? wrap(bio, width / b, bioMeasure) : [];
    for (const scale of [1, 0.94, 0.88, 0.82, 0.76, 0.7]) {
      const block = measureBlock(nameFit * scale, bioRows, b);
      if (block.height <= avail) {
        best = { size: nameFit * scale, bioRows, b, ...block };
        break;
      }
    }
    if (best) break;
  }
  let truncated = false;
  if (!best && !bio) {
    const size = nameFit * 0.7;
    best = { size, bioRows: [], b: 0, gap: 0, height: 0.74 * size + (nameRows.length - 1) * 1.12 * size + drop(nameRows.at(-1), size, 0.22, 0.06) };
  } else if (!best) {
    const size = nameFit * 0.7;
    const b = bioSizes.at(-1);
    const nameHeight = 0.74 * size + (nameRows.length - 1) * 1.12 * size + drop(nameRows.at(-1), size, 0.22, 0.06);
    const gap = Math.max(8, 0.2 * size);
    const room = Math.max(1, Math.floor((avail - nameHeight - gap - b) / (1.4 * b)) + 1);
    const bioRows = wrap(bio, width / b, bioMeasure).slice(0, room);
    let last = bioRows.at(-1);
    while (last.includes(" ") && bioMeasure(`${last}…`) > width / b) last = last.slice(0, last.lastIndexOf(" "));
    while (bioMeasure(`${last}…`) > width / b) last = [...last].slice(0, -1).join("");
    bioRows[bioRows.length - 1] = `${last.replace(/[\s,.;:–-]+$/, "")}…`;
    truncated = true;
    best = { size, bioRows, b, gap, height: nameHeight + gap + 0.74 * b + (bioRows.length - 1) * 1.4 * b + drop(bioRows.at(-1), b, 0.26, 0.1) };
  }
  const y = center ? top + (avail - best.height) / 2 : top;
  const nameBaselines = nameRows.map((_, i) => y + 0.74 * best.size + i * 1.12 * best.size);
  const bioStart = nameBaselines.at(-1) + drop(nameRows.at(-1), best.size, 0.22, 0.06) + best.gap + 0.74 * best.b;
  return {
    truncated,
    name: nameRows.map((row, i) => ({ row, y: nameBaselines[i], size: best.size })),
    bio: best.bioRows.map((row, i) => ({ row, y: bioStart + i * 1.4 * best.b, size: best.b })),
  };
}

/** Geometry reserves the QR, text, logo and full character independently. */
export function companionBox(card) {
  const isQr = card.layout === "qr" || card.layout === "portrait";
  const portrait = card.layout === "portrait";
  const compact = card.layout === "compact";
  const scale = Number(card.companionScale ?? 100) / 100;
  const w = (compact ? 88 : isQr ? 130 : 108) * scale;
  const h = (compact ? 108 : isQr ? 162 : 135) * scale;
  const { width, height } = LAYOUTS[card.layout];
  const x = card.companionX ? Number(card.companionX) / 100 * (width - w) : (portrait ? 300 : compact ? 552 : isQr ? 450 : 387) - w / 2;
  const y = card.companionY ? Number(card.companionY) / 100 * (height - h) : (portrait ? 448 : compact ? 194 : isQr ? 284 : 227) - h;
  if (card.companionPosition === "canvas") return {
    x: Math.max(24 - w, Math.min(width - 24, Number(card.companionX || 0) / 100 * width)),
    y: Math.max(24 - h, Math.min(height - 24, Number(card.companionY || 0) / 100 * height)), w, h,
  };
  return { x: Math.max(0, Math.min(width - w, x)), y: Math.max(0, Math.min(height - h, y)), w, h };
}

/** Canvas percentages remain stable even when the artwork is larger than the card. */
export function positionCompanion(card, x, y) {
  const box = companionBox(card);
  const { width, height } = LAYOUTS[card.layout];
  const percent = (value, extent, size) => (100 * Math.max(24 - extent, Math.min(size - 24, value)) / size).toFixed(3);
  return { companionPosition: "canvas", companionX: percent(x, box.w, width), companionY: percent(y, box.h, height) };
}

export function resizeCompanion(card, scale) {
  const old = companionBox(card);
  const companionScale = String(Math.max(50, Math.min(400, Math.round(scale))));
  return { companionScale, ...positionCompanion({ ...card, companionScale }, old.x, old.y) };
}

export function upperBodyCompanion(card) {
  const { width, height, qr } = cardGeometry(card.layout);
  const companionScale = card.layout === "portrait" ? "160" : card.layout === "compact" ? "220" : "240";
  const enlarged = { ...card, companionScale };
  const box = companionBox(enlarged);
  const x = Math.max(qr ? qr.x + qr.size + 12 : 0, width - box.w);
  return { companionScale, ...positionCompanion(enlarged, x, height - box.h * .7) };
}

/** loadAsset returns data URIs from repository assets only. */
export async function renderCard(card, loadAsset, { demo = false } = {}) {
  const theme = STYLES[card.style];
  const geo = cardGeometry(card.layout);
  const { width, height, qr, textX, textWidth, logo: slot } = geo;
  const light = isLight(theme.bg);
  const font = await loadAsset(CARD_FONTS[card.style]);
  const bodyFont = await loadAsset("assets/fonts/geist-medium.woff2");
  const bioFont = await loadAsset(MONO_BIO.has(card.style) ? "assets/fonts/geist-mono-variable.woff2" : "assets/fonts/geist-regular.woff2");
  const logoPath = CARD_LOGOS[card.logo ?? "zcash"].path;
  const logo = logoPath ? await loadAsset(logoPath) : null;
  const character = COMPANIONS[card.companion].path;
  const art = character ? await loadAsset(character) : null;
  const artBox = companionBox(card);
  const decor = surface(card.style, theme, geo);
  const amount = card.amount ? `${card.amount} ZEC` : "";

  // Text boxes end above the QR (Signature, Portrait), beside it (Compact) or above the call to action (Profile).
  const box = {
    qr: { top: 20, bottom: qr?.y - 12, nameCap: 72, bioSizes: [20, 19, 18, 17, 16, 15, 14] },
    compact: { top: 24, bottom: 184 - (amount ? 26 : 0), center: true, nameCap: 36, bioSizes: [17, 16, 15, 14, 13] },
    portrait: { top: 20, bottom: qr?.y - 12 - (amount ? 28 : 0), nameCap: 72, bioSizes: [20, 19, 18, 17, 16, 15] },
    profile: { top: 20, bottom: height - 50, nameCap: 72, bioSizes: [20, 19, 18, 17, 16, 15, 14] },
  }[card.layout];
  const text = layoutText({
    name: card.name || "Your name",
    bio: card.bio || (demo ? "Building tools for a more private web." : ""),
    style: card.style,
    width: textWidth,
    ...box,
  });
  const nameSvg = text.name
    .map(({ row, y, size }) => `<text class="name" x="${textX}" y="${y}" font-size="${size}">${escapeXml(row)}</text>`)
    .join("");
  const bioSvg = text.bio
    .map(({ row, y, size }) => `<text class="bio" x="${textX}" y="${y}" font-size="${size}" fill="${theme.muted}">${escapeXml(row)}</text>`)
    .join("");
  const last = text.bio.at(-1);
  const cursor = decor.cursor && last
    ? `<rect x="${textX + bioEm(last.row, true) * last.size + 3}" y="${last.y - 0.74 * last.size}" width="${0.55 * last.size}" height="${0.9 * last.size}" fill="${theme.accent}" fill-opacity=".85"/>`
    : "";

  let qrSvgMarkup = "";
  if (qr) {
    // Keep the QR and its four-module quiet zone on white in every style; light cards outline the tile.
    const tile = `<rect x="${qr.x}" y="${qr.y}" width="${qr.size}" height="${qr.size}" rx="${decor.qrRadius ?? 0}" fill="#fff"${light ? ` stroke="${LIGHT_EDGE}"` : ""}/>`;
    if (demo) {
      qrSvgMarkup = `${tile}<text x="${qr.x + 80}" y="${qr.y + 79}" text-anchor="middle" font-size="13" style="fill:#17231f">Add your address</text><text x="${qr.x + 80}" y="${qr.y + 100}" text-anchor="middle" font-size="13" style="fill:#17231f">to create a QR</text>`;
    } else {
      const uri = paymentUri(card);
      if (qr.size / (qrMatrix(uri).getModuleCount() + 8) < 2)
        throw new Error(
          "This QR is too dense at card size. Shorten the memo or use the profile format.",
        );
      qrSvgMarkup = tile + qrSvg(uri, "none")
        .replace("<svg ", `<svg x="${qr.x}" y="${qr.y}" `)
        .replace(/width="\d+" height="\d+"/, `width="${qr.size}" height="${qr.size}"`);
    }
  }

  // The amount belongs to the payment request, so it sits with the QR; Profile names the action instead.
  let action = "";
  if (card.layout === "profile") {
    const label = amount ? `Support with ${amount}` : "Support with Zcash";
    action = `<text class="action" x="${textX}" y="${height - 24}" font-size="15">${escapeXml(label)}</text><rect x="${textX}" y="${height - 17}" width="${bioEm(label, false) * 15}" height="2" fill="${theme.accent}"/>`;
  } else if (amount) {
    const [x, y] = card.layout === "qr"
      ? [qr.x + qr.size + 16, qr.y + qr.size - 6]
      : card.layout === "compact"
        ? [textX, qr.y + qr.size - 6]
        : [qr.x, qr.y - 12];
    action = `<text class="amount" x="${x}" y="${y}" font-size="16">${escapeXml(amount)}</text>`;
  }

  const weight = VARIABLE_NAME_WEIGHT[card.style];
  const shape = decor.clip
    ? `<path d="${decor.clip}"/>`
    : decor.radius ? `<rect width="${width}" height="${height}" rx="${decor.radius}"/>` : "";
  const logoMarkup = logo
    ? card.logo === "vizor"
      ? `<defs><mask id="vizor-logo" mask-type="alpha"><image href="${logo}" x="${slot.x}" y="${slot.y}" width="${slot.size}" height="${slot.size}" preserveAspectRatio="xMidYMid meet"/></mask></defs><rect x="${slot.x}" y="${slot.y}" width="${slot.size}" height="${slot.size}" fill="${theme.ink}" mask="url(#vizor-logo)"/>`
      : `<image href="${logo}" x="${slot.x}" y="${slot.y}" width="${slot.size}" height="${slot.size}" preserveAspectRatio="xMidYMid meet"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" overflow="hidden" role="img" aria-label="${escapeXml(`Support ${card.name} with Zcash`)}"${text.truncated ? ' data-truncated="true"' : ""}>
<title>${escapeXml(`${card.name} · Support with Zcash`)}</title>
<defs><style>@font-face{font-family:Card;src:url('${font}') format('woff2')${weight ? ";font-weight:300 700" : ""}}@font-face{font-family:Body;src:url('${bodyFont}') format('woff2')}@font-face{font-family:Bio;src:url('${bioFont}') format('woff2');font-weight:400}text{font-family:Body,Arial,sans-serif;fill:${theme.ink}}text.name{font-family:Card,Arial,sans-serif${weight ? `;font-weight:${weight}` : ""}}text.bio{font-family:Bio,Arial,sans-serif;font-weight:400}text.amount,text.action{font-variant-numeric:tabular-nums}</style>${decor.defs ?? ""}${shape ? `<clipPath id="card-shape">${shape}</clipPath>` : ""}</defs>
<g${shape ? ' clip-path="url(#card-shape)"' : ""}>
<rect width="${width}" height="${height}" fill="${theme.bg}"/>
${decor.back ?? ""}
${logoMarkup}
${decor.front ?? ""}
${nameSvg}
${bioSvg}${cursor}
${qrSvgMarkup}
${art ? `<image class="companion" href="${art}" x="${artBox.x}" y="${artBox.y}" width="${artBox.w}" height="${artBox.h}" preserveAspectRatio="xMidYMid meet"/>` : ""}
${action}
</g>
${decor.edge ? `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}"${decor.radius ? ` rx="${decor.radius - 0.5}"` : ""} fill="none" stroke="${decor.edge}"/>` : ""}
</svg>`;
}
