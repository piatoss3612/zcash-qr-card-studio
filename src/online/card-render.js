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

/** Style surfaces stay clear of the QR tile, its quiet zone and the text column. */
function surface(style, theme, { width, height, portrait }) {
  const W = width;
  const H = height;
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
      edge: "rgba(255,255,255,.14)",
    };
  }
  if (style === "blueprint") {
    const mark = (x, y, dx, dy) => `M${x + dx * 12},${y}H${x}V${y + dy * 12}`;
    return {
      radius: 0,
      defs: `<pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M10 0V40M20 0V40M30 0V40M0 10H40M0 20H40M0 30H40" stroke="#fff" stroke-opacity=".07" stroke-width="1"/><path d="M0 0V40M0 0H40" stroke="#fff" stroke-opacity=".16" stroke-width="1"/></pattern>`,
      back: `<rect width="${W}" height="${H}" fill="url(#bp-grid)"/><path d="${mark(8, 8, 1, 1)}${mark(W - 8, 8, -1, 1)}${mark(8, H - 8, 1, -1)}${mark(W - 8, H - 8, -1, -1)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>`,
      edge: "rgba(255,255,255,.14)",
    };
  }
  if (style === "airmail") {
    const band = 6;
    // The stamp frames the corner logo slot (W - 56, 20, 30 × 30).
    const sx = W - 63;
    const sy = 13;
    const size = 44;
    let holes = "";
    for (let t = 1; t < size; t += 6)
      for (const [cx, cy] of [[sx + t, sy], [sx + t, sy + size], [sx, sy + t], [sx + size, sy + t]])
        holes += `M${cx - 2},${cy}a2,2 0 1,0 4,0a2,2 0 1,0 -4,0`;
    const stamp = `<g filter="url(#am-shadow)"><rect x="${sx}" y="${sy}" width="${size}" height="${size}" fill="#fff" mask="url(#am-perf)"/></g><rect x="${sx + 4.5}" y="${sy + 4.5}" width="${size - 9}" height="${size - 9}" fill="#e4ecf8" stroke="${theme.border}"/>`;
    const waves = [0, 1, 2]
      .map((i) => {
        let d = `M${sx - 78},${27 + i * 8}`;
        for (let x = sx - 78; x < sx - 18; x += 12) d += `q3,-3 6,0t6,0`;
        return d;
      })
      .join("");
    const postmark = portrait
      ? ""
      : `<g fill="none" stroke="${theme.ink}" stroke-opacity=".42" stroke-width="1.3"><circle cx="${sx + 2}" cy="43" r="17"/><circle cx="${sx + 2}" cy="43" r="13" stroke-dasharray="2 3"/><path d="${waves}"/></g>`;
    return {
      radius: 10,
      qrRadius: 6,
      defs: `<pattern id="am-stripes" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="10" height="28" fill="${theme.accent}"/><rect x="14" width="10" height="28" fill="${theme.border}"/></pattern><mask id="am-perf"><rect x="${sx}" y="${sy}" width="${size}" height="${size}" fill="#fff"/><path d="${holes}" fill="#000"/></mask><filter id="am-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#1d2a44" flood-opacity=".28"/></filter>`,
      back: `<path d="M0 0H${W}V${H}H0Z M${band} ${band}V${H - band}H${W - band}V${band}Z" fill="url(#am-stripes)" fill-rule="evenodd"/>${stamp}`,
      front: postmark,
      edge: "rgba(0,0,0,.1)",
    };
  }
  return { radius: 0, defs: "", back: "", front: "", edge: "" };
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

/** Conservative wrapping also reserves room for wide CJK and emoji glyphs. */
function lines(text, units, maxLines) {
  const rows = [];
  let row = "";
  const measure = (value) =>
    [...value].reduce(
      (total, char) => total + (char.codePointAt(0) > 255 ? 2 : 1),
      0,
    );
  for (const word of text.split(/\s+/)) {
    if (row && measure(`${row} ${word}`) > units) {
      rows.push(row);
      row = "";
    }
    if (measure(word) <= units) {
      row = row ? `${row} ${word}` : word;
      continue;
    }
    for (const char of word) {
      if (measure(row + char) > units) {
        rows.push(row);
        row = "";
      }
      row += char;
    }
  }
  if (row) rows.push(row.trim());
  if (rows.length > maxLines)
    rows[maxLines - 1] = rows[maxLines - 1].slice(0, -2) + "…";
  if (rows.length === 2 && !rows[1].endsWith("…")) {
    while (measure(rows[0]) > measure(rows[1]) * 1.5 && rows[0].includes(" ")) {
      const words = rows[0].split(" ");
      const candidate = `${words.at(-1)} ${rows[1]}`;
      if (measure(candidate) > units) break;
      words.pop();
      rows[0] = words.join(" ");
      rows[1] = candidate;
    }
  }
  return rows.slice(0, maxLines);
}

function textBlock(text, x, y, size, width, count, color) {
  return lines(text, width, count)
    .map(
      (line, i) =>
        `<text class="bio" x="${x}" y="${y + i * size * 1.4}" font-size="${size}" fill="${color}">${escapeXml(line)}</text>`,
    )
    .join("");
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
  const { width, height } = LAYOUTS[card.layout];
  const companionScale = card.layout === "portrait" ? "160" : card.layout === "compact" ? "220" : "240";
  const enlarged = { ...card, companionScale };
  const box = companionBox(enlarged);
  const x = Math.max(card.layout === "profile" ? 0 : 192, width - box.w);
  return { companionScale, ...positionCompanion(enlarged, x, height - box.h * .7) };
}

/** loadAsset returns data URIs from repository assets only. */
export async function renderCard(card, loadAsset, { demo = false } = {}) {
  const theme = STYLES[card.style];
  const portrait = card.layout === "portrait";
  const compact = card.layout === "compact";
  const isQr = card.layout !== "profile";
  const { width, height } = LAYOUTS[card.layout];
  const textX = compact ? 192 : 28;
  const qrX = compact ? 16 : 20;
  const qrY = portrait ? 288 : compact ? 24 : 148;
  const font = await loadAsset(CARD_FONTS[card.style]);
  const bodyFont = await loadAsset("assets/fonts/geist-medium.woff2");
  const bioFont = await loadAsset(MONO_BIO.has(card.style) ? "assets/fonts/geist-mono-variable.woff2" : "assets/fonts/geist-regular.woff2");
  const logoPath = CARD_LOGOS[card.logo ?? "zcash"].path;
  const logo = logoPath ? await loadAsset(logoPath) : null;
  const character = COMPANIONS[card.companion].path;
  const art = character ? await loadAsset(character) : null;
  const artBox = companionBox(card);
  const name = card.name || "Your name";
  const nameRows = lines(name, 20, 2);
  const nameSize =
    nameRows.length > 1
      ? 30
      : [...name].length > 11
        ? 34
        : card.style === "pixel"
          ? 44
          : [...name].length <= 8
            ? 72
            : 48;
  const nameY = portrait ? (nameRows.length > 1 ? 80 : 100) : compact ? 64 : nameRows.length > 1 ? 48 : 75;
  const bioY = portrait ? 160 : compact ? 128 : 110;
  const textLimit = portrait ? 320 : compact ? 270 : isQr ? 330 : 272;
  const measureName = (row) =>
    [...row].reduce(
      (n, c) =>
        n +
        (c.codePointAt(0) > 255
          ? 1
          : card.style === "pixel"
            ? 0.85
            : card.style === "terminal"
              ? 0.65
            : /[MW@]/.test(c)
              ? 0.95
              : /[ilI .]/.test(c)
                ? 0.3
                : 0.65),
      0,
    );
  const fittedSize = Math.min(
    compact ? Math.min(nameSize, 36) : nameSize,
    textLimit / Math.max(...nameRows.map(measureName)),
  );
  const fittedName = nameRows
    .map(
      (row, i) =>
        `<text class="name" x="${textX}" y="${nameY + i * fittedSize * 1.15}" font-size="${fittedSize}">${escapeXml(row)}</text>`,
    )
    .join("");
  const decor = surface(card.style, theme, { width, height, portrait });
  const qrSize = 160;
  const tile = decor.qrRadius ? `<rect x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" rx="${decor.qrRadius}" fill="#fff"/>` : "";
  let qr = "";
  if (isQr) {
    if (demo) {
      qr = `<rect x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" rx="${decor.qrRadius ?? 0}" fill="#fff"/><text x="${qrX + 80}" y="${qrY + 79}" text-anchor="middle" font-size="13" style="fill:#17231f">Add your address</text><text x="${qrX + 80}" y="${qrY + 100}" text-anchor="middle" font-size="13" style="fill:#17231f">to create a QR</text>`;
    } else {
      const uri = paymentUri(card);
      if (qrSize / (qrMatrix(uri).getModuleCount() + 8) < 2)
        throw new Error(
          "This QR is too dense at card size. Shorten the memo or use the profile format.",
        );
      // Keep the QR and its four-module quiet zone on white in every style.
      qr = tile + qrSvg(uri, tile ? "none" : "#fff")
        .replace("<svg ", `<svg x="${qrX}" y="${qrY}" `)
        .replace(
          /width="\d+" height="\d+"/,
          `width="${qrSize}" height="${qrSize}"`,
        );
    }
  }
  const weight = VARIABLE_NAME_WEIGHT[card.style];
  const shape = decor.radius ? ` rx="${decor.radius}"` : "";
  const actionX = portrait ? 28 : compact ? textX : isQr ? 200 : 28;
  const actionY = portrait ? 288 : compact ? 213 : isQr ? 247 : 223;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" overflow="hidden" role="img" aria-label="${escapeXml(`Support ${card.name} with Zcash`)}">
<title>${escapeXml(`${card.name} · Support with Zcash`)}</title>
<defs><style>@font-face{font-family:Card;src:url('${font}') format('woff2')${weight ? ";font-weight:300 700" : ""}}@font-face{font-family:Body;src:url('${bodyFont}') format('woff2')}@font-face{font-family:Bio;src:url('${bioFont}') format('woff2');font-weight:400}text{font-family:Body,Arial,sans-serif;fill:${theme.ink}}text.name{font-family:Card,Arial,sans-serif${weight ? `;font-weight:${weight}` : ""}}text.bio{font-family:Bio,Arial,sans-serif;font-weight:400}</style>${decor.defs}${decor.radius ? `<clipPath id="card-shape"><rect width="${width}" height="${height}"${shape}/></clipPath>` : ""}</defs>
<g${decor.radius ? ' clip-path="url(#card-shape)"' : ""}>
<rect width="${width}" height="${height}" fill="${theme.bg}"/>
${decor.back}
${logo ? card.logo === "vizor" ? `<defs><mask id="vizor-logo" mask-type="alpha"><image href="${logo}" x="${width - 56}" y="20" width="30" height="30" preserveAspectRatio="xMidYMid meet"/></mask></defs><rect x="${width - 56}" y="20" width="30" height="30" fill="${theme.ink}" mask="url(#vizor-logo)"/>` : `<image href="${logo}" x="${width - 56}" y="20" width="30" height="30" preserveAspectRatio="xMidYMid meet"/>` : ""}
${decor.front ?? ""}
${fittedName}
${textBlock(card.bio || (demo ? "Building tools for a more private web." : ""), textX, bioY, compact ? 17 : 20, portrait ? 26 : compact ? 27 : isQr ? 29 : 24, 2, theme.ink)}
${qr}
${art ? `<image class="companion" href="${art}" x="${artBox.x}" y="${artBox.y}" width="${artBox.w}" height="${artBox.h}" preserveAspectRatio="xMidYMid meet"/>` : ""}
${card.amount ? `<text x="${actionX}" y="${actionY - 28}" font-size="13">${escapeXml(card.amount)} ZEC</text>` : ""}
</g>
${decor.edge ? `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}"${decor.radius ? ` rx="${decor.radius - 0.5}"` : ""} fill="none" stroke="${decor.edge}"/>` : ""}
</svg>`;
}
