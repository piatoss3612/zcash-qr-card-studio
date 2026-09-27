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
  frost: "assets/fonts/space-grotesk-variable.woff2",
  washi: "assets/fonts/geist-bold.woff2",
  ticket: "assets/fonts/geist-bold.woff2",
  receipt: "assets/fonts/geist-mono-variable.woff2",
  meadow: "assets/fonts/geist-bold.woff2",
  bigtop: "assets/fonts/space-grotesk-variable.woff2",
  velvet: "assets/fonts/zarathustra-v01.woff2",
};
const MONO_BIO = new Set(["terminal", "blueprint", "receipt"]);
/** Variable name faces declare their range so the requested weight is real, not synthesized. */
const VARIABLE_NAME_WEIGHT = { blueprint: 700, frost: 700, receipt: 700, bigtop: 700 };
// Low-opacity outlines take their tone from the surface, never a tinted neutral.
const LIGHT_EDGE = "rgba(0,0,0,.1)";
const DARK_EDGE = "rgba(255,255,255,.12)";

/** One inset aligns the QR tile, text column and corner logo in every layout. */
export function cardGeometry(layout) {
  const { width, height } = LAYOUTS[layout];
  const compact = layout === "compact";
  const inset = compact ? 24 : 20;
  // Signature keeps a 12px gap under its QR: the card is short, and the extra
  // room above goes to the name.
  const bottom = layout === "qr" ? 12 : inset;
  const qr = layout === "profile"
    ? null
    : { x: inset, y: compact ? inset : height - bottom - 160, size: 160 };
  return {
    width,
    height,
    qr,
    textX: compact ? qr.x + qr.size + 20 : inset,
    // Portrait keeps 30px between the name and the corner logo.
    textWidth: layout === "portrait" ? 300 : compact ? 270 : layout === "profile" ? 272 : 330,
    logo: { x: width - 20 - 30, y: 20, size: 30 },
  };
}

function isLight(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
}

/** Style surfaces stay clear of the QR tile, its quiet zone and the text column. */
function surface(style, theme, geo, { amount = false } = {}) {
  const { width: W, height: H, qr, textX, textWidth, logo } = geo;
  const portrait = W < H;
  // The Vizorcat's zone: right of the text column, or right of the QR in Portrait.
  const zx = portrait ? qr.x + qr.size + 16 : textX + textWidth + 10;
  const zy = portrait ? qr.y - 10 : 0;
  if (style === "paper") {
    // Fine paper grain inside the inset print panel.
    return {
      radius: 16,
      qrRadius: 6,
      defs: `<filter id="pp-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .2  0 0 0 .09 0"/></filter>`,
      back: `<rect width="${W}" height="${H}" filter="url(#pp-grain)"/><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="10" fill="none" stroke="${theme.border}" stroke-width="1.5"/>`,
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
      // Three orbits and two lights read at README size; each light carries a soft halo.
      back: `<g clip-path="url(#md-zone)" fill="none" stroke="${theme.accent}" stroke-width="1.5"><circle cx="${W}" cy="${H}" r="${r * 0.32}" stroke-opacity=".5"/><circle cx="${W}" cy="${H}" r="${r * 0.47}" stroke-opacity=".38"/><circle cx="${W}" cy="${H}" r="${r * 0.62}" stroke-opacity=".22"/><g fill="${theme.accent}" stroke="none"><circle cx="${W - r * 0.62 * 0.8}" cy="${H - r * 0.62 * 0.6}" r="9" fill-opacity=".14"/><circle cx="${W - r * 0.62 * 0.8}" cy="${H - r * 0.62 * 0.6}" r="3" fill-opacity=".95"/><circle cx="${W - r * 0.47 * 0.28}" cy="${H - r * 0.47 * 0.96}" r="6" fill-opacity=".12"/><circle cx="${W - r * 0.47 * 0.28}" cy="${H - r * 0.47 * 0.96}" r="2" fill-opacity=".8"/></g></g>`,
      edge: DARK_EDGE,
    };
  }
  if (style === "pixel") {
    const notched = (i, n) => `M${i + n},${i}H${W - i - n}V${i + n}H${W - i}V${H - i - n}H${W - i - n}V${H - i}H${i + n}V${H - i - n}H${i}V${i + n}H${i + n}Z`;
    return {
      clip: notched(0, 6),
      // An 8-bit cloud under the corner logo and a checkered floor behind the Vizorcat's feet.
      defs: `<pattern id="px-floor" width="16" height="16" patternUnits="userSpaceOnUse" x="${zx}" y="${H - 22}"><rect width="8" height="8" fill="${theme.accent}" fill-opacity=".4"/><rect x="8" y="8" width="8" height="8" fill="${theme.accent}" fill-opacity=".4"/><rect x="8" width="8" height="8" fill="${theme.accent}" fill-opacity=".18"/><rect y="8" width="8" height="8" fill="${theme.accent}" fill-opacity=".18"/></pattern>`,
      back: `<path d="${notched(0, 6)} ${notched(4, 6)}" fill="${theme.accent}" fill-rule="evenodd"/><rect x="${zx + 8}" y="${H - 22}" width="${W - zx - 18}" height="16" fill="url(#px-floor)"/>${(() => {
        const cx = Math.round((zx + W) / 2 - 40);
        const cy = Math.max(zy + 18, logo.y + logo.size + 16);
        const cloud = (x, y, u, o) => `<path d="M${x + 2 * u},${y}h${4 * u}v${u}h${2 * u}v${u}h${2 * u}v${2 * u}H${x}v${-2 * u}h${2 * u}Z" fill="#fff" fill-opacity="${o}" stroke="${theme.accent}" stroke-opacity=".35" stroke-width="2"/>`;
        return cloud(cx, cy, 6, 0.95) + cloud(cx + 58, cy + 30, 4, 0.85);
      })()}`,
    };
  }
  if (style === "editorial") {
    return {
      radius: 12,
      qrRadius: 4,
      // Masthead bar with a hairline under it, and a column rule between the copy and the Vizorcat.
      back: `<rect width="${W}" height="5" fill="${theme.accent}"/><rect y="8" width="${W}" height="1" fill="${theme.accent}" fill-opacity=".45"/>${portrait ? `<path d="M${zx - 6},${zy + 10}V${H - 20}" stroke="${theme.border}" stroke-width="1"/>` : `<path d="M${zx - 4},24V${H - 20}" stroke="${theme.border}" stroke-width="1"/>`}`,
      edge: LIGHT_EDGE,
    };
  }
  if (style === "terminal") {
    return {
      radius: 10,
      qrRadius: 4,
      cursor: true,
      defs: `<pattern id="tm-scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" fill-opacity=".075"/></pattern><radialGradient id="tm-glow" cx="${(zx + W) / 2}" cy="${(zy + H) / 2}" r="${Math.min(W - zx, H - zy) * 0.6}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${theme.accent}" stop-opacity=".16"/><stop offset="1" stop-color="${theme.accent}" stop-opacity="0"/></radialGradient><radialGradient id="tm-vignette" cx="50%" cy="50%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>`,
      back: `<rect width="${W}" height="${H}" fill="url(#tm-glow)"/><rect width="${W}" height="${H}" fill="url(#tm-scan)"/><rect width="${W}" height="${H}" fill="url(#tm-vignette)"/>`,
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
  // Frost, Washi and Ticket draw behind the Vizorcat in the same zone as Midnight's orbits.
  const zoneX = portrait ? qr.x + qr.size + 16 : textX + textWidth + 10;
  const zoneY = portrait ? qr.y - 10 : 0;
  if (style === "frost") {
    // Survey contours around a low rise under the Vizorcat; they stop below the corner logo.
    const cx = zoneX + (W - zoneX) * 0.55;
    const cy = portrait ? H - 40 : H * 0.86;
    const step = (cy - Math.max(zoneY, logo.y + logo.size + 10)) / 6.8;
    const ring = (k) => {
      const pts = Array.from({ length: 40 }, (_, i) => {
        const t = (i / 40) * 2 * Math.PI;
        const r = k * step * (1 + 0.08 * Math.sin(3 * t + k * 0.7) + 0.05 * Math.sin(5 * t + 1.3 + k * 0.4));
        return [cx + 1.3 * r * Math.cos(t), cy + r * Math.sin(t)];
      });
      // Closed Catmull-Rom spline through the points, as cubic Béziers.
      let d = `M${pts[0].map((v) => v.toFixed(1))}`;
      for (let i = 0; i < pts.length; i++) {
        const [p0, p1, p2, p3] = [-1, 0, 1, 2].map((o) => pts[(i + o + pts.length) % pts.length]);
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += `C${c1.map((v) => v.toFixed(1))} ${c2.map((v) => v.toFixed(1))} ${p2.map((v) => v.toFixed(1))}`;
      }
      // Every third line is an index contour, as on a survey map.
      return `<path d="${d}Z" stroke-width="${k % 3 === 0 ? 2.4 : 1.6}" stroke-opacity="${(0.9 - k * 0.07).toFixed(2)}"/>`;
    };
    // The contours fade in from the zone's left and top edges instead of stopping at a hard line.
    const ramp = (id, a, from, to) => `<linearGradient id="${id}" ${a}1="${from}" ${a}2="${to}" ${a === "x" ? 'y1="0" y2="0"' : 'x1="0" x2="0"'} gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="${id}-m"><rect x="${zoneX}" y="${zoneY}" width="${W - zoneX}" height="${H - zoneY}" fill="url(#${id})"/></mask>`;
    return {
      radius: 14,
      qrRadius: 6,
      defs: ramp("fr-x", "x", zoneX, zoneX + 64) + ramp("fr-y", "y", zoneY, zoneY + 48) + `<radialGradient id="fr-glow" cx="${cx}" cy="${cy}" r="${step * 7}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#cfe2f3" stop-opacity=".9"/><stop offset="1" stop-color="#cfe2f3" stop-opacity="0"/></radialGradient>`,
      // Ice glints: small four-point sparkles scattered over the upper contours.
      back: `<g mask="url(#fr-x-m)"><g mask="url(#fr-y-m)"><rect x="${zoneX}" y="${zoneY}" width="${W - zoneX}" height="${H - zoneY}" fill="url(#fr-glow)"/><g fill="none" stroke="${theme.accent}">${[1, 2, 3, 4, 5, 6, 7].map(ring).join("")}</g><g fill="${theme.accent}" fill-opacity=".55">${[[0.3, 0.35, 5], [0.72, 0.22, 4], [0.5, 0.55, 3.5]].map(([u, v, r]) => { const x = zoneX + (W - zoneX) * u; const y = Math.max(zoneY, logo.y + logo.size + 10) + (H - zoneY) * v * 0.6; return `<path d="M${x.toFixed(1)},${(y - r).toFixed(1)}L${(x + r * 0.28).toFixed(1)},${(y - r * 0.28).toFixed(1)}L${(x + r).toFixed(1)},${y.toFixed(1)}L${(x + r * 0.28).toFixed(1)},${(y + r * 0.28).toFixed(1)}L${x.toFixed(1)},${(y + r).toFixed(1)}L${(x - r * 0.28).toFixed(1)},${(y + r * 0.28).toFixed(1)}L${(x - r).toFixed(1)},${y.toFixed(1)}L${(x - r * 0.28).toFixed(1)},${(y - r * 0.28).toFixed(1)}Z"/>`; }).join("")}</g></g></g>`,
      edge: LIGHT_EDGE,
    };
  }
  if (style === "washi") {
    // Seigaiha: rows of wave fans painted top to bottom so each row overlaps the one above.
    // The field rises from the bottom-right corner and fades out before the zone's edges.
    const R = 18;
    const reach = Math.min(W - zoneX, H - zoneY);
    const top = H - reach;
    let fans = "";
    for (let row = 0, y = top; y < H + R; row++, y += R / 2)
      for (let x = zoneX - (row % 2 ? 0 : R); x < W + R; x += 2 * R)
        fans += `<use href="#wa-fan" x="${x}" y="${y}"/>`;
    return {
      radius: 6,
      qrRadius: 3,
      defs: `<g id="wa-fan"><circle r="${R}" fill="${theme.bg}"/><circle r="${R * 0.75}"/><circle r="${R * 0.5}"/><circle r="${R * 0.25}"/></g><radialGradient id="wa-fade" cx="${W}" cy="${H}" r="${reach}" gradientUnits="userSpaceOnUse"><stop offset=".58" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="wa-mask"><rect x="${zoneX}" y="${top}" width="${W - zoneX}" height="${reach}" fill="url(#wa-fade)"/></mask>`,
      back: `<g mask="url(#wa-mask)" fill="none" stroke="${theme.ink}" stroke-opacity=".46" stroke-width="1.3">${fans}</g>`,
      edge: LIGHT_EDGE,
    };
  }
  if (style === "ticket") {
    // A tear-off stub: notches cut the card edge where a dotted perforation crosses it.
    const r = 10;
    const c = 12;
    let clip;
    let perforation;
    let stub;
    if (portrait) {
      // Portrait tears off below the copy, so the stub carries the QR, its amount and the Vizorcat.
      const y = amount ? qr.y - 38 : qr.y - 8;
      clip = `M${c},0H${W - c}A${c},${c} 0 0 1 ${W},${c}V${y - r}A${r},${r} 0 0 0 ${W},${y + r}V${H - c}A${c},${c} 0 0 1 ${W - c},${H}H${c}A${c},${c} 0 0 1 0,${H - c}V${y + r}A${r},${r} 0 0 0 0,${y - r}V${c}A${c},${c} 0 0 1 ${c},0Z`;
      perforation = `M${r + 8},${y}H${W - r - 8}`;
      stub = `<rect y="${y}" width="${W}" height="${H - y}"/>`;
    } else {
      const x = textX + textWidth + 18;
      clip = `M${c},0H${x - r}A${r},${r} 0 0 0 ${x + r},0H${W - c}A${c},${c} 0 0 1 ${W},${c}V${H - c}A${c},${c} 0 0 1 ${W - c},${H}H${x + r}A${r},${r} 0 0 0 ${x - r},${H}H${c}A${c},${c} 0 0 1 0,${H - c}V${c}A${c},${c} 0 0 1 ${c},0Z`;
      perforation = `M${x},${r + 8}V${H - r - 8}`;
      stub = `<rect x="${x}" width="${W - x}" height="${H}"/>`;
    }
    return {
      clip,
      qrRadius: 6,
      back: `<g fill="#000" fill-opacity=".16">${stub}</g><path d="${perforation}" fill="none" stroke="${theme.accent}" stroke-opacity=".85" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="0.1 7"/>`,
      edge: DARK_EDGE,
    };
  }
  if (style === "receipt") {
    // Torn thermal paper: teeth 5px deep stay inside the 12px margin below the QR.
    const t = 7;
    const d = 5;
    let clip = `M0,${d}`;
    for (let x = 0; x < W; x += 2 * t) clip += `L${Math.min(x + t, W)},0L${Math.min(x + 2 * t, W)},${d}`;
    clip += `L${W},${H - d}`;
    for (let x = W; x > 0; x -= 2 * t) clip += `L${Math.max(x - t, 0)},${H}L${Math.max(x - 2 * t, 0)},${H - d}`;
    // Item rows with dotted leaders sit behind the Vizorcat, below the corner logo.
    const x0 = zoneX + 12;
    const x1 = W - 20;
    const y0 = Math.max(zoneY + 20, logo.y + logo.size + 22);
    const y1 = H - 24;
    const n = Math.max(3, Math.floor((y1 - y0) / 24));
    let rows = `<path d="M${x0},${y0 - 12}H${x1}" stroke-dasharray="5 4"/>`;
    for (let i = 0; i < n; i++) {
      const y = (y0 + i * ((y1 - y0) / (n - 1))).toFixed(1);
      const w = 18 + ((i * 23) % 34);
      rows += `<path d="M${x0},${y}h${w}M${x1 - 18},${y}h18" stroke-width="3"/><path d="M${x0 + w + 8},${y}H${x1 - 26}" stroke-dasharray="0.1 5"/>`;
    }
    return {
      clip,
      qrRadius: 2,
      back: `<g id="rc-rows" fill="none" stroke="${theme.ink}" stroke-opacity=".3" stroke-width="1.5" stroke-linecap="round">${rows}</g>`,
      edge: LIGHT_EDGE,
    };
  }
  // Meadow, Big Top and Velvet fade out from the bottom-right corner like Washi.
  const reach = Math.min(W - zoneX, H - zoneY);
  const fade = (id, from = 0.45) => `<radialGradient id="${id}" cx="${W}" cy="${H}" r="${reach}" gradientUnits="userSpaceOnUse"><stop offset="${from}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="${id}-m"><rect x="${zoneX}" y="${H - reach}" width="${W - zoneX}" height="${reach}" fill="url(#${id})"/></mask>`;
  if (style === "meadow") {
    // Botanical line drawing: slender olive-like sprigs lean in from the corner. Each leaf is a
    // pointed almond with a midrib, set in pairs that shrink toward a single tip leaf.
    const leaf = (x, y, deg, len, wid) => {
      const a = (deg * Math.PI) / 180;
      const [dx, dy, px, py] = [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a)];
      const [tx, ty] = [x + dx * len, y + dy * len];
      const [mx, my] = [x + (dx * len) / 2, y + (dy * len) / 2];
      const f = (v) => v.toFixed(1);
      return `<path d="M${f(x)},${f(y)}Q${f(mx + px * wid)},${f(my + py * wid)} ${f(tx)},${f(ty)}Q${f(mx - px * wid)},${f(my - py * wid)} ${f(x)},${f(y)}Z"/><path d="M${f(x)},${f(y)}L${f(x + dx * len * 0.85)},${f(y + dy * len * 0.85)}" fill="none"/>`;
    };
    const sprig = (angle, len, bend) => {
      const a = (angle * Math.PI) / 180;
      const [bx, by] = [W - 4, H + 2];
      const [ex, ey] = [bx + len * Math.cos(a), by + len * Math.sin(a)];
      const [cx, cy] = [(bx + ex) / 2 + bend * Math.sin(a), (by + ey) / 2 - bend * Math.cos(a)];
      const at = (u) => [(1 - u) ** 2 * bx + 2 * (1 - u) * u * cx + u ** 2 * ex, (1 - u) ** 2 * by + 2 * (1 - u) * u * cy + u ** 2 * ey];
      let leaves = "";
      for (let k = 1; k <= 5; k++) {
        const u = 0.18 + k * 0.14;
        const [x, y] = at(u);
        const [x2, y2] = at(u + 0.01);
        const dir = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
        const size = 1 - u * 0.5;
        leaves += leaf(x, y, dir - 38, 22 * size, 5.2 * size) + leaf(x, y, dir + 38, 22 * size, 5.2 * size);
      }
      const [tx, ty] = at(1);
      const [tx0, ty0] = at(0.97);
      leaves += leaf(tx, ty, (Math.atan2(ty - ty0, tx - tx0) * 180) / Math.PI, 14, 3.6);
      return `<path d="M${bx},${by}Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" fill="none"/>${leaves}`;
    };
    return {
      radius: 16,
      qrRadius: 6,
      defs: fade("mw-fade", 0.78),
      back: `<g mask="url(#mw-fade-m)" stroke="${theme.accent}" stroke-width="1.1" stroke-opacity=".7" stroke-linejoin="round" stroke-linecap="round" fill="${theme.accent}" fill-opacity=".14">${sprig(-100, reach * 0.95, -10)}${sprig(-124, reach * 1.02, 14)}${sprig(-150, reach * 0.8, -12)}${sprig(-172, reach * 0.6, 8)}</g>`,
      edge: LIGHT_EDGE,
    };
  }
  if (style === "bigtop") {
    // A striped tent curtain hangs below a scalloped valance behind the Vizorcat; it fades in from
    // the zone's left edge. The stripes run straight down, never as rays from a point.
    const vy = Math.max(zoneY + 8, logo.y + logo.size + 14);
    const w = 12;
    let stripes = "";
    for (let x = W - w; x > zoneX - w; x -= 2 * w) stripes += `<rect x="${x}" y="${vy}" width="${w}" height="${H - vy}"/>`;
    let valance = `M${zoneX},${vy}`;
    for (let x = zoneX; x < W; x += w) valance += `A${w / 2},${w / 2} 0 0 0 ${x + w},${vy}`;
    return {
      radius: 14,
      qrRadius: 6,
      defs: `<linearGradient id="bt-fade" x1="${zoneX}" x2="${zoneX + 70}" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="bt-fade-m"><rect x="${zoneX}" y="${vy - 8}" width="${W - zoneX}" height="${H - vy + 8}" fill="url(#bt-fade)"/></mask>`,
      back: `<g mask="url(#bt-fade-m)" fill="${theme.accent}"><g fill-opacity=".16">${stripes}</g><path d="${valance}V${vy - 5}H${zoneX}Z" fill-opacity=".38"/></g><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="8" fill="none" stroke="${theme.accent}" stroke-opacity=".35" stroke-dasharray="1 6" stroke-width="3" stroke-linecap="round"/>`,
      edge: LIGHT_EDGE,
    };
  }
  if (style === "velvet") {
    // A lace hem of scallops and eyelets runs under the Vizorcat, inside a fine frame.
    const s = 18;
    const hem = Math.min(32, reach * 0.22);
    return {
      radius: 12,
      qrRadius: 6,
      defs: `<pattern id="vl-lace" width="${s}" height="${hem}" patternUnits="userSpaceOnUse" x="${zoneX}" y="${H - hem}"><path d="M0,${hem}V${s / 2}A${s / 2},${s / 2} 0 0 1 ${s},${s / 2}V${hem}Z" fill="${theme.accent}" fill-opacity=".34"/><circle cx="${s / 2}" cy="${s / 2 + 1}" r="2.4" fill="${theme.bg}"/><circle cx="${s / 2}" cy="${s / 2 - 5}" r="1.2" fill="${theme.accent}" fill-opacity=".5"/></pattern><pattern id="vl-damask" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M11,4l4,7-4,7-4-7ZM0,-3l3,3-3,3-3-3ZM22,-3l3,3-3,3-3-3ZM0,19l3,3-3,3-3-3ZM22,19l3,3-3,3-3-3Z" fill="${theme.accent}" fill-opacity=".13"/></pattern>` + fade("vl-fade", 0.7),
      back: `<g mask="url(#vl-fade-m)"><rect x="${zoneX}" y="${H - reach}" width="${W - zoneX}" height="${reach - hem}" fill="url(#vl-damask)"/><rect x="${zoneX}" y="${H - hem}" width="${W - zoneX}" height="${hem}" fill="url(#vl-lace)"/></g><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="6" fill="none" stroke="${theme.accent}" stroke-opacity=".3"/>`,
      edge: DARK_EDGE,
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
    em += isWide(char) ? 1 : style === "pixel" ? 0.85 : style === "terminal" || style === "receipt" ? 0.65 : /[MW@]/.test(char) ? 0.95 : /[ilI .]/.test(char) ? 0.3 : 0.65;
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
  // A handle with no space or hyphen stays whole to a smaller size before it is cut mid-word.
  const breakable = /[\s-]/.test(name.trim());
  const nameRows = single >= Math.min(oneRowMax, breakable ? 30 : 20) ? [name] : splitName(name, nameMeasure);
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
export async function renderCard(card, loadAsset, { demo = false, qrHint = ["Add your address", "to create a QR"] } = {}) {
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
  const decor = surface(card.style, theme, geo, { amount: Boolean(card.amount) });
  const amount = card.amount ? `${card.amount} ZEC` : "";

  // Text boxes end above the QR (Signature, Portrait), beside it (Compact) or above the call to action (Profile).
  const box = {
    qr: { top: 20, bottom: qr?.y - 12, nameCap: 72, bioSizes: [20, 19, 18, 17, 16, 15, 14] },
    compact: { top: 24, bottom: 184 - (amount ? 26 : 0), center: true, nameCap: 36, bioSizes: [17, 16, 15, 14, 13] },
    // Portrait centres its copy in the tall space above the QR instead of leaving an empty band.
    portrait: { top: 20, bottom: qr?.y - 12 - (amount ? 28 : 0), center: true, nameCap: 72, bioSizes: [20, 19, 18, 17, 16, 15] },
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
      qrSvgMarkup = `${tile}<text x="${qr.x + 80}" y="${qr.y + 79}" text-anchor="middle" font-size="13" style="fill:#17231f">${escapeXml(qrHint[0])}</text><text x="${qr.x + 80}" y="${qr.y + 100}" text-anchor="middle" font-size="13" style="fill:#17231f">${escapeXml(qrHint[1])}</text>`;
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
${decor.edge && decor.clip ? `<path d="${decor.clip}" fill="none" stroke="${decor.edge}" stroke-width="2" clip-path="url(#card-shape)"/>` : ""}${decor.edge && !decor.clip ? `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}"${decor.radius ? ` rx="${decor.radius - 0.5}"` : ""} fill="none" stroke="${decor.edge}"/>` : ""}
</svg>`;
}
