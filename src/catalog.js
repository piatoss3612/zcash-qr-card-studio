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
  workshop: { id: "workshop", label: "Alchemist Workshop", image: "./assets/backgrounds/alchemist-workshop-v1.png", fill: "#f6efe2" },
  rampart: { id: "rampart", label: "Brass Rampart", image: "./assets/backgrounds/brass-rampart-v3.png", fill: "#f2e4c7" },
  lunar: { id: "lunar", label: "Lunar Orbit", image: "./assets/backgrounds/lunar-orbit-v2.png", fill: "#edf3f6" },
  astral: { id: "astral", label: "Astral Chart", image: "./assets/backgrounds/astral-chart-v2.png", fill: "#eee3cf" },
  crimson: { id: "crimson", label: "Crimson Core", image: "./assets/backgrounds/crimson-core-v3.png", fill: "#fbf4f1" },
  dark: { id: "dark", label: "Dark Core", image: "./assets/backgrounds/dark-core-v3.png", fill: "#f1f2f2" },
  commons: { id: "commons", label: "Modernist Commons", image: "./assets/backgrounds/modernist-commons-v1.png", fill: "#f3ead5" },
  paper: { id: "paper", label: "Quiet Paper", image: null, fill: "#f7f3ec" },
  journey: { id: "journey", label: "First Journey", image: "./assets/backgrounds/first-journey-v1.png", fill: "#f7f3ec" },
  moonlit: { id: "moonlit", label: "Moonlit Village", image: "./assets/backgrounds/moonlit-village-v1.png", fill: "#f7efdf" },
});

// `thumbBackground` is only used by the library thumbnails (some characters are drawn for dark scenes).
export const CHARACTERS = Object.freeze({
  classic: { id: "classic", label: "Classic Guardian", image: "./assets/characters/classic-guardian.png" },
  samurai: { id: "samurai", label: "Samurai", image: "./assets/characters/samurai.png", thumbBackground: "#111d2b" },
  oni: {
    id: "oni", label: "Oni Samurai", image: "./assets/characters/oni-samurai-v2.png",
    thumbBackground: "#111d2b", defaultScale: 1.2,
    // Conservative bounds of all opaque pixels, split above the ears so the
    // transparent space beside the tall blade is not treated as QR coverage.
    coverage: { width: 1035, height: 1289, regions: [
      { x: 889, y: 25, width: 121, height: 226 },
      { x: 25, y: 251, width: 957, height: 1013 },
    ] },
  },
  orbital: { id: "orbital", label: "Orbital Ranger", image: "./assets/characters/orbital-rescue-ranger.png", thumbBackground: "#0d3156" },
  astral: { id: "astral", label: "Astral Wayfinder", image: "./assets/characters/astral-wayfinder-v2.png", thumbBackground: "#2f2857" },
  commons: { id: "commons", label: "Commons Guide", image: "./assets/characters/commons-guide.png", defaultScale: 0.91 },
  grove: { id: "grove", label: "Crimson Grove Ranger", image: "./assets/characters/crimson-grove-ranger.png", defaultScale: 1.08 },
  snow: { id: "snow", label: "Snow Surveyor", image: "./assets/characters/siberian-snow-surveyor-v2.png" },
  stonehold: { id: "stonehold", label: "Stonehold Warden", image: "./assets/characters/stonehold-warden-v5.png" },
  hearthlight: { id: "hearthlight", label: "Hearthlight Host", image: "./assets/characters/hearthlight-host-v2.png", defaultScale: 0.9 },
  alchemist: { id: "alchemist", label: "Workshop Alchemist", image: "./assets/characters/workshop-alchemist-v1.png", defaultScale: 0.9 },
  swordsman: { id: "swordsman", label: "Wandering Swordsman", image: "./assets/characters/wandering-swordsman-v1.png", defaultScale: 0.9 },
  strongman: {
    id: "strongman", label: "Tal Strongman", image: "./assets/characters/tal-strongman-v1.png", defaultScale: 1.1,
    coverage: { width: 1088, height: 1145, regions: [
      { x: 25, y: 25, width: 1038, height: 1095 },
    ] },
  },
});

// `recolorable`: single-colour marks that can be tinted with any colour (source-in tint).
// Multi-colour marks are always drawn as-is.
export const LOGOS = Object.freeze({
  vizor: { id: "vizor", label: "Vizor", image: "./assets/vizor-logo-dark.svg", width: 317, height: 92, recolorable: true, wordmark: true },
  "vizor-mark": { id: "vizor-mark", label: "Vizor Mark", image: "./assets/vizor-icon.svg", width: 110, height: 132, recolorable: true, defaultColor: "#141818" },
  "vizorcat-head": { id: "vizorcat-head", label: "Vizorcat Classic", image: "./assets/logos/vizorcat-classic-head.png", width: 150, height: 150, recolorable: false, pixelArt: true },
  "vizorcat-samurai-head": { id: "vizorcat-samurai-head", label: "Vizorcat Samurai", image: "./assets/logos/vizorcat-samurai-head.png", width: 150, height: 150, recolorable: false, pixelArt: true },
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

export const QR_SHAPES = Object.freeze({
  square: { id: "square", label: "Square" },
  rounded: { id: "rounded", label: "Rounded" },
  dots: { id: "dots", label: "Dots" },
});

// Emblems sit in the QR centre; the code is generated at error-correction level H
// when one is present so the covered area (about 8%) stays well inside the 30% budget.
export const QR_EMBLEMS = Object.freeze({
  none: { id: "none", label: "None", logoId: null },
  vizorcat: { id: "vizorcat", label: "Vizorcat", logoId: "vizorcat-head" },
  samurai: { id: "samurai", label: "Samurai", logoId: "vizorcat-samurai-head" },
  zcash: { id: "zcash", label: "Zcash", logoId: "zcash" },
  "vizor-mark": { id: "vizor-mark", label: "Vizor mark", logoId: "vizor-mark", tint: "#141818" },
});
export const QR_EMBLEM_FRACTION = 0.28;

/** @returns {string} the emblem a fresh card of this type starts with. */
export function defaultQrEmblem(mode) {
  if (mode === "payment") return "zcash";
  // Gift links are long, so the code is dense; an emblem on top hurts scanning.
  if (mode === "giftcard") return "none";
  return "vizorcat";
}

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

// Module colours. All are dark enough to scan on the white/cream QR panels.
export const QR_MODULE_PALETTE = Object.freeze([
  { id: "ink", label: "Ink", value: null },
  { id: "indigo", label: "Indigo", value: "#1d2c3a" },
  { id: "forest", label: "Forest", value: "#1f3d2b" },
  { id: "crimson", label: "Crimson", value: "#8f0838" },
]);

export const TEXT_PALETTE = Object.freeze([
  { id: "ink", label: "Ink", value: COLORS.ink },
  { id: "secondary", label: "Graphite", value: COLORS.secondary },
  { id: "white", label: "White", value: COLORS.white },
  { id: "crimson", label: "Crimson", value: COLORS.crimson },
  { id: "gold", label: "Zcash Gold", value: COLORS.gold },
  { id: "indigo", label: "Indigo", value: COLORS.indigo },
]);

// `captionSize`: heading size that reads at the same optical weight across faces.
// `uppercase`: the face is designed to be set in capitals (pixel display type).
export const FONTS = Object.freeze({
  Zarathustra: { id: "Zarathustra", label: "Zarathustra (serif)", stack: '"Zarathustra", Georgia, serif', weights: [400], captionSize: 56 },
  Geist: { id: "Geist", label: "Geist (sans)", stack: '"Geist", Arial, sans-serif', weights: [500, 700], captionSize: 52 },
  SpaceGrotesk: { id: "SpaceGrotesk", label: "Space Grotesk (geometric)", stack: '"Space Grotesk", "Geist", Arial, sans-serif', weights: [500, 700], captionSize: 52 },
  Silkscreen: { id: "Silkscreen", label: "Silkscreen (pixel)", stack: '"Silkscreen", "Courier New", monospace', weights: [400, 700], captionSize: 34, uppercase: true },
  GeistMono: { id: "GeistMono", label: "Geist Mono", stack: '"Geist Mono", ui-monospace, Menlo, monospace', weights: [500, 700], captionSize: 44 },
});

/** @returns {number} the closest weight a font actually ships. */
export function fontWeightFor(fontId, wanted) {
  const weights = FONTS[fontId]?.weights ?? [500];
  if (weights.includes(wanted)) return wanted;
  return weights.reduce((best, weight) => (Math.abs(weight - wanted) < Math.abs(best - wanted) ? weight : best), weights[0]);
}

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
  event: {
    id: "event", label: "Event card",
    qr: { x:340, y:500, size:630 },
    logo: { x:140, y:105, width:180, height:52 },
    mark: { x:140, y:105, size:70 },
    caption: { x:140, y:425, width:1030, align:"center" },
    summary: { x:140, y:1235, width:500, align:"left" },
    character: { x:740, y:1170, width:470, height:550 },
    install: { x:140, y:1460, width:500, height:190 },
  },
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
  caption: { fontFamily: "Zarathustra", fontWeight: 700, lineHeight: 1.15, color: COLORS.ink },
  summary: { fontFamily: "GeistMono", fontSize: 30, fontWeight: 700, lineHeight: 1.3, color: COLORS.secondary },
});

// Themes: every background paired with the Vizorcat it was drawn for (see
// assets/backgrounds/source/*.md). Order = template order; the first is the default.
// Templates are generated from this table for each card type and never include text layers.
// `headingFont` sets the caption face so the type matches the world of each background.
export const THEMES = Object.freeze([
  { background: "rampart", character: "classic", qrStyle: "ink", layoutId: "qr-right", headingFont: "Zarathustra" },
  { background: "paper", character: "classic", qrStyle: "ink", headingFont: "Zarathustra" },
  { background: "wave", character: "samurai", qrStyle: "clean", headingFont: "Silkscreen" },
  { background: "blossom", character: "oni", qrStyle: "soft", headingFont: "Zarathustra" },
  { background: "dragon", character: "stonehold", qrStyle: "clean", headingFont: "Silkscreen" },
  { background: "forest", character: "grove", qrStyle: "soft", headingFont: "Zarathustra" },
  { background: "frost", character: "snow", qrStyle: "soft", headingFont: "SpaceGrotesk" },
  { background: "hearth", character: "hearthlight", qrStyle: "clean", layoutId: "qr-right", headingFont: "Zarathustra" },
  { background: "workshop", character: "alchemist", qrStyle: "clean", layoutId: "center", headingFont: "Zarathustra" },
  { background: "lunar", character: "orbital", qrStyle: "clean", headingFont: "SpaceGrotesk" },
  { background: "astral", character: "astral", qrStyle: "soft", headingFont: "SpaceGrotesk" },
  { background: "commons", character: "commons", qrStyle: "ink", layoutId: "qr-right", headingFont: "SpaceGrotesk" },
  { background: "crimson", character: "samurai", qrStyle: "clean", headingFont: "Silkscreen" },
  { background: "dark", character: "samurai", qrStyle: "ink", headingFont: "Silkscreen" },
  { id: "swordsman", label: "First Journey", background: "journey", character: "swordsman", qrStyle: "ink", headingFont: "Zarathustra" },
  { background: "moonlit", character: "strongman", qrStyle: "ink", layoutId: "event", headingFont: "Zarathustra" },
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

function themeCaptionLayer(mode, layout, theme) {
  const role = TEXT_ROLES.caption;
  const font = FONTS[theme.headingFont] ?? FONTS[role.fontFamily];
  return {
    kind: "text",
    role: "caption",
    text: CAPTIONS[mode],
    fontFamily: font.id,
    fontSize: font.captionSize,
    fontWeight: fontWeightFor(font.id, role.fontWeight),
    uppercase: Boolean(font.uppercase),
    lineHeight: role.lineHeight,
    color: role.color,
    align: layout.caption.align,
    x: layout.caption.x,
    y: layout.caption.y,
    width: layout.caption.width,
    height: Math.round(font.captionSize * role.lineHeight),
  };
}

function buildTemplates() {
  const templates = {};
  for (const mode of Object.keys(MODES)) {
    for (const theme of THEMES) {
      const id = `${mode}-${theme.id ?? theme.background}`;
      const layout = LAYOUTS[theme.layoutId] ?? LAYOUTS.center;
      templates[id] = {
        id,
        mode,
        label: theme.label ?? BACKGROUNDS[theme.background].label,
        background: theme.background,
        layoutId: layout.id,
        qrStyle: theme.qrStyle,
        layers: [
          themeLogoLayer(mode, layout),
          themeCharacterLayer(theme.character, layout),
          themeCaptionLayer(mode, layout, theme),
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
