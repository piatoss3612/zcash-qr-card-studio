// Static catalog: output contract, assets, palettes, fonts, modes, layouts, templates.
// Pure data. No DOM, no side effects.

export const OUTPUT = Object.freeze({
  width: 1311,
  height: 1819,
  bleed: 35,
  trimWidth: 1240,
  trimHeight: 1748,
  safeInset: 94,
  dpi: 300,
});

export const INSTALL_URL = "https://vizor.cash/get";
export const QUIET_MODULES = 4;

export const BACKGROUNDS = Object.freeze({
  wave: { id: "wave", label: "Indigo Wave", image: "./assets/backgrounds/samurai-wave-v1.png", fill: "#f7f1e7" },
  blossom: { id: "blossom", label: "Blossom Drift", image: "./assets/backgrounds/blossom-drift-v1.png", fill: "#f8f1e7" },
  forest: { id: "forest", label: "Whispering Grove", image: "./assets/backgrounds/whispering-grove-v1.png", fill: "#f6efdf" },
  dragon: { id: "dragon", label: "Dragon Flight", image: "./assets/backgrounds/dragon-flight-v1.png", fill: "#f5eddd" },
  frost: { id: "frost", label: "Frost Archive", image: "./assets/backgrounds/frost-archive-v2.png", fill: "#f5f5f1" },
  hearth: { id: "hearth", label: "Hearthlight Exchange", image: "./assets/backgrounds/hearthlight-exchange-v2.png", fill: "#f6efe2" },
  rampart: { id: "rampart", label: "Brass Rampart", image: "./assets/backgrounds/brass-rampart-v3.png", fill: "#f2e4c7" },
  lunar: { id: "lunar", label: "Lunar Orbit", image: "./assets/backgrounds/lunar-orbit-v2.png", fill: "#edf3f6" },
  astral: { id: "astral", label: "Astral Chart", image: "./assets/backgrounds/astral-chart-v2.png", fill: "#eee3cf" },
  crimson: { id: "crimson", label: "Crimson Core", image: "./assets/backgrounds/crimson-core-v3.png", fill: "#fbf4f1" },
  dark: { id: "dark", label: "Dark Core", image: "./assets/backgrounds/dark-core-v3.png", fill: "#f1f2f2" },
  commons: { id: "commons", label: "Modernist Commons", image: "./assets/backgrounds/modernist-commons-v1.png", fill: "#f3ead5" },
  paper: { id: "paper", label: "Quiet Paper", image: null, fill: "#f7f3ec" },
});

// `thumbBackground` is only used by the library thumbnails (some characters are drawn for dark scenes).
export const CHARACTERS = Object.freeze({
  samurai: { id: "samurai", label: "Samurai", image: "./assets/characters/samurai.png", thumbBackground: "#111d2b" },
  classic: { id: "classic", label: "Classic Guardian", image: "./assets/characters/classic-guardian.png" },
  orbital: { id: "orbital", label: "Orbital Ranger", image: "./assets/characters/orbital-rescue-ranger.png", thumbBackground: "#0d3156" },
  astral: { id: "astral", label: "Astral Wayfinder", image: "./assets/characters/astral-wayfinder-v2.png", thumbBackground: "#2f2857" },
  commons: { id: "commons", label: "Commons Guide", image: "./assets/characters/commons-guide.png", defaultScale: 0.91 },
  grove: { id: "grove", label: "Crimson Grove Ranger", image: "./assets/characters/crimson-grove-ranger.png", defaultScale: 1.08 },
  snow: { id: "snow", label: "Snow Surveyor", image: "./assets/characters/siberian-snow-surveyor-v2.png" },
  stonehold: { id: "stonehold", label: "Stonehold Warden", image: "./assets/characters/stonehold-warden.png" },
  hearthlight: { id: "hearthlight", label: "Hearthlight Host", image: "./assets/characters/hearthlight-host.png", defaultScale: 0.9 },
  nightglass: { id: "nightglass", label: "Nightglass Rider", image: "./assets/characters/nightglass-rider.png", defaultScale: 1.3 },
});

// `recolorable`: single-colour marks that can be tinted with any colour (source-in tint).
// Multi-colour marks are always drawn as-is.
export const LOGOS = Object.freeze({
  vizor: { id: "vizor", label: "Vizor", image: "./assets/vizor-logo-dark.svg", width: 317, height: 92, recolorable: true, wordmark: true },
  "vizorcat-head": { id: "vizorcat-head", label: "Vizorcat Classic", image: "./assets/logos/vizorcat-classic-head.png", width: 150, height: 150, recolorable: false, pixelArt: true },
  "zcash-coin": { id: "zcash-coin", label: "Zcash Coin", image: "./assets/logos/zcash-coin.png", width: 130, height: 130, recolorable: false },
  zcash: { id: "zcash", label: "Zcash Mark", image: "./assets/logos/zcash.svg", width: 130, height: 130, recolorable: true },
  zechub: { id: "zechub", label: "ZecHub", image: "./assets/logos/zechub.png", width: 150, height: 150, recolorable: false },
  cypherpunk: { id: "cypherpunk", label: "Cypherpunk", image: "./assets/logos/cypherpunk.svg", width: 150, height: 150, recolorable: false },
  tachyon: { id: "tachyon", label: "Project Tachyon", image: "./assets/logos/tachyon.png", width: 150, height: 150, recolorable: false },
  near: { id: "near", label: "NEAR Intents", image: "./assets/logos/near-intents.svg", width: 320, height: 48, recolorable: true, wordmark: true },
  keystone: { id: "keystone", label: "Keystone", image: "./assets/logos/keystone.svg", width: 130, height: 130, recolorable: true },
  ledger: { id: "ledger", label: "Ledger", image: "./assets/logos/ledger.svg", width: 130, height: 130, recolorable: true },
  keplr: { id: "keplr", label: "Keplr", image: "./assets/logos/keplr.svg", width: 130, height: 130, recolorable: false },
  cipherscan: { id: "cipherscan", label: "CipherScan", image: "./assets/logos/cipherscan.png", width: 150, height: 150, recolorable: false, thumbBackground: "#11110f" },
  valar: { id: "valar", label: "Valar Group", image: "./assets/logos/valar-group.png", width: 150, height: 150, recolorable: false, thumbBackground: "#11110f" },
  zakura: { id: "zakura", label: "Zakura", image: "./assets/logos/zakura.svg", width: 140, height: 140, recolorable: false },
});

export const QR_STYLES = Object.freeze({
  clean: { id: "clean", label: "Clean", panel: "#ffffff", modules: "#151919", radius: 24, shadow: true, stroke: null },
  ink: { id: "ink", label: "Ink", panel: "#fffdf8", modules: "#101414", radius: 8, shadow: false, stroke: "rgba(20, 24, 24, 0.72)" },
  soft: { id: "soft", label: "Soft", panel: "#ffffff", modules: "#1d2c3a", radius: 34, shadow: true, stroke: "rgba(85, 118, 164, 0.36)" },
});

export const COLORS = Object.freeze({
  ink: "#141818",
  secondary: "#5d6262",
  white: "#ffffff",
  crimson: "#b90a4a",
  gold: "#f4b728",
  indigo: "#1d2c3a",
});

// Swatches offered for logos. `value: null` means "original artwork".
export const LOGO_PALETTE = Object.freeze([
  { id: "original", label: "Original", value: null },
  { id: "ink", label: "Ink", value: COLORS.ink },
  { id: "white", label: "White", value: COLORS.white },
  { id: "crimson", label: "Crimson", value: COLORS.crimson },
  { id: "gold", label: "Zcash Gold", value: COLORS.gold },
]);

export const TEXT_PALETTE = Object.freeze([
  { id: "ink", label: "Ink", value: COLORS.ink },
  { id: "secondary", label: "Graphite", value: COLORS.secondary },
  { id: "white", label: "White", value: COLORS.white },
  { id: "crimson", label: "Crimson", value: COLORS.crimson },
  { id: "gold", label: "Zcash Gold", value: COLORS.gold },
  { id: "indigo", label: "Indigo", value: COLORS.indigo },
]);

export const FONTS = Object.freeze({
  Geist: { id: "Geist", label: "Geist", stack: '"Geist", Arial, sans-serif', weights: [500, 700] },
  Zarathustra: { id: "Zarathustra", label: "Zarathustra", stack: '"Zarathustra", Georgia, serif', weights: [400] },
});

export const TEXT_PRESETS = Object.freeze({
  heading: { label: "Heading", text: "Your headline", fontFamily: "Zarathustra", fontSize: 64, fontWeight: 400, color: COLORS.ink, align: "left", lineHeight: 1.15, width: 560 },
  body: { label: "Body text", text: "Add a short line of text.", fontFamily: "Geist", fontSize: 34, fontWeight: 500, color: COLORS.secondary, align: "left", lineHeight: 1.3, width: 560 },
});

// install: 'none' | 'optional' | 'required'
export const MODES = Object.freeze({
  payment: {
    id: "payment",
    label: "Payment request",
    short: "Pay",
    description: "A ZIP-321 zcash: URI that opens in any Zcash wallet.",
    install: "none",
    batchHint: "One Zcash address per line. Amount, memo and label from the form apply to every card.",
    batchPlaceholder: "u1…\nzs1…",
    defaultTemplate: "payment-rampart",
  },
  link: {
    id: "link",
    label: "Link",
    short: "Link",
    description: "Any web link.",
    install: "optional",
    batchHint: "One URL per line.",
    batchPlaceholder: "https://example.com/one\nhttps://example.com/two",
    defaultTemplate: "link-rampart",
  },
  giftcard: {
    id: "giftcard",
    label: "Vizor gift card",
    short: "Gift",
    description: "A Vizor payment link. The Get Vizor card is always included.",
    install: "required",
    batchHint: "One gift link per line. Links are never written to file names.",
    batchPlaceholder: "https://link.vizor.cash/…#v1=…\nhttps://link.vizor.cash/…#v1=…",
    defaultTemplate: "giftcard-rampart",
  },
});

export const INSTALL_LAYER = Object.freeze({
  block: Object.freeze({ x: 90, y: 1520, width: 500, height: 190, radius: 18 }),
  qr: Object.freeze({ x: 100, y: 1530, size: 170, padding: 0, radius: 10 }),
  copy: Object.freeze({ x: 316, y: 1650 }),
});

// Vertical grid (card 1819px, safe area 94..1725): logo band → QR → caption →
// summary → character + Get Vizor footer. `logo` boxes are for the wordmark; the
// square `mark` box is used by payment cards (Zcash mark).
export const LAYOUTS = Object.freeze({
  center: {
    id: "center",
    label: "Centered",
    qr: Object.freeze({ x: 286, y: 290, size: 740 }),
    logo: Object.freeze({ x: 446, y: 104, width: 420, height: 122 }),
    mark: Object.freeze({ x: 571, y: 86, size: 170 }),
    caption: Object.freeze({ x: 286, y: 1064, width: 740, align: "center" }),
    summary: Object.freeze({ x: 286, y: 1150, width: 460, align: "left" }),
    character: Object.freeze({ x: 760, y: 1140, width: 457, height: 585 }),
    install: Object.freeze({ x: 286, y: 1550, width: 460, height: 175, radius: 18 }),
  },
  "qr-left": {
    id: "qr-left",
    label: "QR left",
    qr: Object.freeze({ x: 120, y: 290, size: 650 }),
    logo: Object.freeze({ x: 120, y: 104, width: 420, height: 122 }),
    mark: Object.freeze({ x: 120, y: 86, size: 170 }),
    caption: Object.freeze({ x: 120, y: 975, width: 650, align: "left" }),
    summary: Object.freeze({ x: 120, y: 1065, width: 650, align: "left" }),
    character: Object.freeze({ x: 770, y: 1085, width: 447, height: 640 }),
    install: Object.freeze({ x: 120, y: 1535, width: 500, height: 190, radius: 18 }),
  },
  "qr-right": {
    id: "qr-right",
    label: "QR right",
    qr: Object.freeze({ x: 541, y: 290, size: 650 }),
    logo: Object.freeze({ x: 541, y: 104, width: 420, height: 122 }),
    mark: Object.freeze({ x: 541, y: 86, size: 170 }),
    caption: Object.freeze({ x: 541, y: 975, width: 650, align: "left" }),
    summary: Object.freeze({ x: 541, y: 1065, width: 650, align: "left" }),
    character: Object.freeze({ x: 94, y: 1085, width: 427, height: 640 }),
    install: Object.freeze({ x: 541, y: 1535, width: 500, height: 190, radius: 18 }),
  },
});

/** Default call-to-action under the QR, per card type. */
export const CAPTIONS = Object.freeze({
  payment: "Scan to pay with Zcash",
  link: "Scan to open",
  giftcard: "Scan to claim your gift",
});

/** Text layer roles a layout can position: `caption` (CTA) and `summary` (bound amount · label). */
export const TEXT_ROLES = Object.freeze({
  caption: { fontFamily: "Zarathustra", fontSize: 56, lineHeight: 1.15, color: COLORS.ink },
  summary: { fontFamily: "Geist", fontSize: 38, fontWeight: 700, lineHeight: 1.3, color: COLORS.secondary },
});

// Themes: every background paired with the Vizorcat it was drawn for (see
// assets/backgrounds/source/*.md). Order = template order; the first is the default.
// Templates are generated from this table for each card type and never include text layers.
export const THEMES = Object.freeze([
  { background: "rampart", character: "classic", qrStyle: "ink", layoutId: "qr-right" },
  { background: "paper", character: "classic", qrStyle: "ink" },
  { background: "wave", character: "samurai", qrStyle: "clean" },
  { background: "blossom", character: "samurai", qrStyle: "soft" },
  { background: "dragon", character: "stonehold", qrStyle: "clean" },
  { background: "forest", character: "grove", qrStyle: "soft" },
  { background: "frost", character: "snow", qrStyle: "soft" },
  { background: "hearth", character: "hearthlight", qrStyle: "clean", layoutId: "qr-right" },
  { background: "lunar", character: "orbital", qrStyle: "clean" },
  { background: "astral", character: "astral", qrStyle: "soft" },
  { background: "commons", character: "commons", qrStyle: "ink", layoutId: "qr-right" },
  { background: "crimson", character: "samurai", qrStyle: "clean" },
  { background: "dark", character: "samurai", qrStyle: "ink" },
]);

// Character box for a layout, honouring the asset's defaultScale (same maths as makeCharacterLayer).
function themeCharacterLayer(characterId, layout) {
  const asset = CHARACTERS[characterId];
  const box = layout.character;
  const scale = asset?.defaultScale ?? 1;
  const width = Math.round(box.width * scale);
  const height = Math.round(box.height * scale);
  return {
    kind: "character",
    assetId: characterId,
    x: box.x + Math.round((box.width - width) / 2),
    y: box.y + box.height - height,
    width,
    height,
  };
}

// Payment cards are wallet-agnostic, so they carry the Zcash mark; Vizor cards carry the Vizor wordmark.
function themeLogoLayer(mode, layout) {
  if (mode === "payment") {
    const { x, y, size } = layout.mark;
    return { kind: "logo", assetId: "zcash", x, y, width: size, height: size, color: null };
  }
  const { x, y, width, height } = layout.logo;
  return { kind: "logo", assetId: "vizor", x, y, width, height, color: null };
}

function themeCaptionLayer(mode, layout) {
  const role = TEXT_ROLES.caption;
  return {
    kind: "text",
    role: "caption",
    text: CAPTIONS[mode],
    fontFamily: role.fontFamily,
    fontSize: role.fontSize,
    lineHeight: role.lineHeight,
    color: role.color,
    align: layout.caption.align,
    x: layout.caption.x,
    y: layout.caption.y,
    width: layout.caption.width,
    height: Math.round(role.fontSize * role.lineHeight),
  };
}

function buildTemplates() {
  const templates = {};
  for (const mode of Object.keys(MODES)) {
    for (const theme of THEMES) {
      const id = `${mode}-${theme.background}`;
      const layout = LAYOUTS[theme.layoutId] ?? LAYOUTS.center;
      templates[id] = {
        id,
        mode,
        label: BACKGROUNDS[theme.background].label,
        background: theme.background,
        layoutId: layout.id,
        qrStyle: theme.qrStyle,
        layers: [
          themeLogoLayer(mode, layout),
          themeCharacterLayer(theme.character, layout),
          themeCaptionLayer(mode, layout),
        ],
      };
    }
  }
  return Object.freeze(templates);
}

export const TEMPLATES = buildTemplates();

export function templatesForMode(mode) {
  return Object.values(TEMPLATES).filter((template) => template.mode === mode);
}
