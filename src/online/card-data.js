import { buildZip321, describeZcashAddress } from "../qr-content.js";

export const CARD_VERSION = "1";
export const MAX_QUERY_LENGTH = 4096;
/** A style's `companion` is the Vizorcat drawn for it; the editor suggests the pair. */
export const STYLES = {
  paper: {
    label: "Paper",
    description: "Warm paper. A personal touch.",
    bg: "#f8f6ed",
    ink: "#171916",
    muted: "#62685b",
    accent: "#466743",
    border: "#d9d6c8",
  },
  midnight: {
    label: "Midnight",
    description: "Quiet dark. A little gold.",
    bg: "#182322",
    ink: "#f5f0df",
    muted: "#adbcb2",
    accent: "#d9e8a0",
    border: "#3d4b43",
  },
  pixel: {
    label: "Pixel",
    description: "Small pixels. Big personality.",
    bg: "#e7edfa",
    ink: "#252b54",
    muted: "#616887",
    accent: "#565cb6",
    border: "#bfc8e2",
    companion: "gamer",
  },
  editorial: {
    label: "Editorial", description: "Warm ivory with an expressive serif.",
    bg: "#f5eee4", ink: "#392d28", muted: "#746258",
    accent: "#9a513a", border: "#d8c8ba", companion: "writer",
  },
  terminal: {
    label: "Terminal", description: "Monospace on deep green.",
    bg: "#101c18", ink: "#c6efd4", muted: "#9eb8a7",
    accent: "#9ad6b0", border: "#3c5849", companion: "sysadmin",
  },
  aurora: {
    label: "Aurora", description: "Soft northern lights behind your name.",
    bg: "#0f1124", ink: "#f6f4ff", muted: "#c9c6e6",
    accent: "#f4b728", border: "#2c2d4d", companion: "photographer",
  },
  blueprint: {
    label: "Blueprint", description: "Drafting grid with crop marks.",
    bg: "#1b4a8a", ink: "#ffffff", muted: "#dce6f6",
    accent: "#8fb8ff", border: "#4f78b5", companion: "architect",
  },
  airmail: {
    label: "Airmail", description: "Striped envelope with a postage stamp.",
    bg: "#fbf8f1", ink: "#1d2a44", muted: "#586377",
    accent: "#c8413a", border: "#2f5da8", companion: "courier",
  },
};
export const COMPANIONS = {
  classic: {
    label: "Vizorcat",
    path: "assets/characters/classic-guardian-embed-v1.png",
  },
  standard: {
    label: "Surprised",
    path: "assets/characters/vizorcat-surprised.png",
  },
  courier: { label: "Airmail Courier", path: "assets/characters/airmail-courier-v1.png" },
  architect: { label: "Blueprint Architect", path: "assets/characters/blueprint-architect-v1.png" },
  photographer: { label: "Aurora Photographer", path: "assets/characters/aurora-photographer-v2.png" },
  sysadmin: { label: "Terminal Sysadmin", path: "assets/characters/terminal-sysadmin-v1.png" },
  writer: { label: "Editorial Writer", path: "assets/characters/editorial-writer-v2.png" },
  gamer: { label: "Pixel Gamer", path: "assets/characters/pixel-gamer-v2.png" },
  samurai: { label: "Samurai", path: "assets/characters/samurai-embed-v2.png" },
  astral: {
    label: "Wayfinder",
    path: "assets/characters/astral-wayfinder-v2.png",
  },
  orbital: { label: "Orbital Ranger", path: "assets/characters/orbital-rescue-ranger.png" },
  grove: { label: "Grove Ranger", path: "assets/characters/crimson-grove-ranger.png" },
  oni: { label: "Oni Samurai", path: "assets/characters/oni-samurai-v2.png" },
  commons: { label: "Commons Guide", path: "assets/characters/commons-guide.png" },
  snow: { label: "Snow Surveyor", path: "assets/characters/siberian-snow-surveyor-v2.png" },
  stonehold: { label: "Stonehold Warden", path: "assets/characters/stonehold-warden-v5.png" },
  hearthlight: { label: "Hearthlight Host", path: "assets/characters/hearthlight-host-v2.png" },
  alchemist: { label: "Alchemist", path: "assets/characters/workshop-alchemist-v1.png" },
  swordsman: { label: "Wandering Swordsman", path: "assets/characters/wandering-swordsman-v1.png" },
  strongman: { label: "Tal Strongman", path: "assets/characters/tal-strongman-v1.png" },
  none: { label: "No Vizorcat", path: null },
};
export const CARD_LOGOS = {
  zcash: { label: "Zcash", path: "assets/logos/zcash-coin.png" },
  vizor: { label: "Vizor", path: "assets/vizor-icon.svg" },
  vizorcat: { label: "Vizorcat", path: "assets/logos/vizorcat-classic-head.png" },
  valar: { label: "Valar Group", path: "assets/logos/valar-group.png" },
  zakura: { label: "Zakura", path: "assets/logos/zakura.svg" },
  tachyon: { label: "Tachyon", path: "assets/logos/tachyon.png" },
};

export const LAYOUTS = {
  qr: { label: "Signature", description: "QR card · GitHub & web", width: 560, height: 320 },
  compact: { label: "Compact", description: "Low profile · QR included", width: 640, height: 208 },
  portrait: { label: "Portrait", description: "Vertical card · QR included", width: 400, height: 480 },
  profile: { label: "Profile", description: "Websites with wallet links", width: 480, height: 260 },
};

export const DEFAULT_CARD = Object.freeze({
  v: CARD_VERSION,
  name: "",
  bio: "",
  address: "",
  style: "paper",
  layout: "qr",
  companion: "classic",
  logo: "zcash",
  companionScale: "100",
  companionPosition: "fit",
  companionX: "",
  companionY: "",
  amount: "",
  memo: "",
});
export function validPosition(value, mode = "fit") {
  if (mode === "canvas") return value === "" || (typeof value === "string" && /^-?\d{1,3}(?:\.\d{1,3})?$/.test(value) && Math.abs(Number(value)) <= 200);
  return value === "" || (typeof value === "string" && /^(?:\d{1,2}(?:\.\d{1,3})?|100(?:\.0{1,3})?)$/.test(value));
}

/** Restore editable text while discarding selections absent from the current catalog. */
export function restoreDraft(saved) {
  if (!saved || saved.v !== CARD_VERSION) return { ...DEFAULT_CARD };
  const draft = Object.fromEntries(Object.entries(DEFAULT_CARD).map(([key, value]) =>
    [key, typeof saved[key] === "string" ? saved[key] : value],
  ));
  for (const [key, catalog] of Object.entries({ style: STYLES, layout: LAYOUTS, companion: COMPANIONS, logo: CARD_LOGOS })) {
    if (!Object.hasOwn(catalog, draft[key])) draft[key] = DEFAULT_CARD[key];
  }
  if (!/^(?:[5-9][0-9]|[1-3][0-9]{2}|400)$/.test(draft.companionScale))
    draft.companionScale = DEFAULT_CARD.companionScale;
  if (!["fit", "canvas"].includes(draft.companionPosition)) draft.companionPosition = "fit";
  for (const key of ["companionX", "companionY"])
    if (!validPosition(draft[key], draft.companionPosition)) draft[key] = "";
  return draft;
}

const FIELDS = Object.keys(DEFAULT_CARD);
const BECH32 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Check spelling and network; the receiving wallet still validates receivers. */
export async function validateAddress(address) {
  if (address.length > 1024)
    throw new Error("This address is too long for an online card.");
  const kind = describeZcashAddress(address);
  if (!kind)
    throw new Error(
      "Enter a Zcash receiving address, not a payment link or a key.",
    );
  if (kind.testnet)
    throw new Error("Online support cards use mainnet addresses only.");
  if (kind.kind === "tex")
    throw new Error(
      "Use a unified, Sapling, or regular transparent receiving address.",
    );
  if (kind.kind === "transparent") {
    let number = 0n;
    for (const char of address)
      number = number * 58n + BigInt(BASE58.indexOf(char));
    const bytes = [];
    while (number) {
      bytes.unshift(Number(number & 255n));
      number >>= 8n;
    }
    for (const char of address) {
      if (char !== "1") break;
      bytes.unshift(0);
    }
    if (
      bytes.length !== 26 ||
      bytes[0] !== 0x1c ||
      ![0xb8, 0xbd].includes(bytes[1])
    )
      throw new Error("Invalid Zcash address encoding.");
    const first = await crypto.subtle.digest(
      "SHA-256",
      new Uint8Array(bytes.slice(0, -4)),
    );
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", first));
    if (!bytes.slice(-4).every((byte, i) => byte === hash[i]))
      throw new Error(
        "Address checksum does not match. Copy the address from your wallet again.",
      );
  } else {
    const separator = address.lastIndexOf("1");
    const hrp = address.slice(0, separator);
    const data = [...address.slice(separator + 1)].map((char) =>
      BECH32.indexOf(char),
    );
    const values = [...hrp]
      .map((char) => char.charCodeAt(0) >> 5)
      .concat(
        0,
        [...hrp].map((char) => char.charCodeAt(0) & 31),
        data,
      );
    let checksum = 1;
    const generators = [
      0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3,
    ];
    for (const value of values) {
      const top = checksum >>> 25;
      checksum = ((checksum & 0x1ffffff) << 5) ^ value;
      for (let i = 0; i < 5; i++)
        if ((top >>> i) & 1) checksum ^= generators[i];
    }
    if (checksum >>> 0 !== (kind.kind === "unified" ? 0x2bc830a3 : 1))
      throw new Error(
        "Address checksum does not match. Copy the address from your wallet again.",
      );
    const payload = data.slice(0, -6);
    const remainder = (payload.length * 5) % 8;
    if (remainder >= 5 || payload.at(-1) & ((1 << remainder) - 1))
      throw new Error("Invalid address padding.");
    const length = Math.floor((payload.length * 5) / 8);
    if (kind.kind === "sapling" ? length !== 43 : length < 48)
      throw new Error("Invalid address length.");
  }
  return kind;
}

function field(value, max, label) {
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const text = value.trim();
  if ([...text].length > max)
    throw new Error(`${label} must be ${max} characters or fewer.`);
  if (/[\p{Cc}\p{Cs}\u202a-\u202e\u2066-\u2069]/u.test(text))
    throw new Error(`${label} contains unsupported control characters.`);
  return text;
}

export async function validateCard(raw) {
  if (!raw || typeof raw !== "object") throw new Error("Missing card details.");
  if (raw.v !== CARD_VERSION)
    throw new Error("This card version is not supported.");
  const card = {
    v: CARD_VERSION,
    name: field(raw.name, 32, "Name"),
    bio: field(raw.bio ?? "", 80, "Introduction"),
    address: field(raw.address, 1024, "Address"),
    style: raw.style,
    layout: raw.layout,
    companion: raw.companion,
    logo: raw.logo ?? "zcash",
    companionScale: field(raw.companionScale ?? "100", 3, "Vizorcat size"),
    companionPosition: raw.companionPosition ?? "fit",
    companionX: raw.companionX ?? "",
    companionY: raw.companionY ?? "",
    amount: field(raw.amount ?? "", 32, "Amount"),
    memo: field(raw.memo ?? "", 80, "Memo"),
  };
  if (!["fit", "canvas"].includes(card.companionPosition) || !validPosition(card.companionX, card.companionPosition) || !validPosition(card.companionY, card.companionPosition))
    throw new Error("Choose a supported Vizorcat position.");
  if (!card.name) throw new Error("Enter your name.");
  if (
    !Object.hasOwn(STYLES, card.style) ||
    !Object.hasOwn(COMPANIONS, card.companion) ||
    !Object.hasOwn(CARD_LOGOS, card.logo) ||
    !Object.hasOwn(LAYOUTS, card.layout)
  )
    throw new Error("Choose a supported card style, format, and Vizorcat.");
  if (!/^(?:[5-9][0-9]|[1-3][0-9]{2}|400)$/.test(card.companionScale))
    throw new Error("Vizorcat size must be between 50 and 400 percent.");
  await validateAddress(card.address);
  const uri = buildZip321({ ...card, label: card.name });
  card.amount =
    new URLSearchParams(uri.split("?")[1] || "").get("amount") || "";
  if (serializeCard(card).length > MAX_QUERY_LENGTH)
    throw new Error(
      "Card details are too long. Shorten the introduction or memo.",
    );
  return card;
}

export function serializeCard(card) {
  return new URLSearchParams(
    FIELDS.map((key) => [key, card[key] ?? ""]),
  ).toString();
}

export async function parseCard(query) {
  if (query.length > MAX_QUERY_LENGTH)
    throw new Error("Card link is too long.");
  const params = new URLSearchParams(query);
  for (const key of params.keys()) {
    if (!FIELDS.includes(key) || params.getAll(key).length !== 1)
      throw new Error("The card link contains unknown or repeated fields.");
  }
  return validateCard(Object.fromEntries(params));
}

export function paymentUri(card, amount = card.amount) {
  return buildZip321({
    address: card.address,
    amount: card.amount || amount,
    memo: card.memo,
    label: card.name,
  });
}

export function escapeXml(text) {
  return String(text).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char],
  );
}

/** File name shared by the PNG download and the static Markdown snippet. */
export const STATIC_IMAGE = "zcash-support-card.png";

/** Both targets carry the same immutable payment details. */
export function cardLinks(card, pageUrl, apiBase = pageUrl) {
  const query = serializeCard(card);
  const image = new URL("api/card.svg", apiBase);
  image.search = query;
  const payment = paymentUri(card);
  // After `#`, the details stay in the browser; the server only sees that /pay opened.
  const launch = new URL("pay", apiBase);
  launch.hash = query;
  const edit = new URL("online", pageUrl);
  edit.hash = query;
  return {
    image: image.href,
    payment: payment,
    launch: launch.href,
    edit: edit.href,
    markdown: `[![Support with Zcash](${image.href})](${launch.href})`,
    html: `<a href="${escapeXml(launch.href)}"><img src="${escapeXml(image.href)}" alt="Support ${escapeXml(card.name)} with Zcash" width="${LAYOUTS[card.layout].width}" style="max-width:100%;height:auto" /></a>`,
    // A committed PNG keeps the QR fixed even if the image service changes; the
    // address line gives supporters a copy served by the README host to compare.
    static: `[![Support with Zcash](${STATIC_IMAGE})](${launch.href})\n\nZcash address: \`${card.address}\``,
  };
}
