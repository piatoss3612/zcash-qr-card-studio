// DOM-free QR payload helpers: ZIP-321 builder, Zcash address classification,
// URL / gift-link validation, batch parsing.

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;
const BECH32 = /^[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/;
const BASE64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const MAX_MEMO_BYTES = 512;
const MAX_AMOUNT = 21000000;
const CAPACITY_LIMIT = 300;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** base64url without padding, from raw bytes. */
function toBase64Url(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += BASE64URL_ALPHABET[b0 >> 2];
    out += BASE64URL_ALPHABET[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    if (b1 === undefined) break;
    out += BASE64URL_ALPHABET[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)];
    if (b2 === undefined) break;
    out += BASE64URL_ALPHABET[b2 & 0x3f];
  }
  return out;
}

/** @returns {Uint8Array|null} decoded bytes, or null when the input is not base64url. */
function fromBase64Url(value) {
  const clean = String(value ?? "").replace(/=+$/, "");
  if (!clean) return new Uint8Array(0);
  const bytes = [];
  let buffer = 0;
  let bits = 0;
  for (const char of clean) {
    const index = BASE64URL_ALPHABET.indexOf(char);
    if (index < 0) return null;
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

/**
 * Classify a Zcash address by prefix, charset and length (no checksum verification).
 * @returns {{ kind: 'transparent'|'sapling'|'unified'|'tex', testnet: boolean }|null}
 */
export function describeZcashAddress(address) {
  const value = String(address ?? "").trim();
  if (!value) return null;

  const body58 = value.slice(2);
  if (/^tm/.test(value) && body58.length === 33 && BASE58.test(body58)) {
    return { kind: "transparent", testnet: true };
  }
  if (/^t[13]/.test(value) && body58.length === 33 && BASE58.test(body58)) {
    return { kind: "transparent", testnet: false };
  }

  if (value !== value.toLowerCase()) return null;

  const bech32Body = (prefix) => {
    const body = value.slice(prefix.length);
    return BECH32.test(body) ? body : null;
  };

  if (value.startsWith("tex1")) {
    const body = bech32Body("tex1");
    return body && body.length >= 20 ? { kind: "tex", testnet: false } : null;
  }
  if (value.startsWith("ztestsapling1")) {
    const body = bech32Body("ztestsapling1");
    return body && body.length >= 60 ? { kind: "sapling", testnet: true } : null;
  }
  if (value.startsWith("zs1")) {
    const body = bech32Body("zs1");
    return body && value.length === 78 ? { kind: "sapling", testnet: false } : null;
  }
  if (value.startsWith("utest1")) {
    const body = bech32Body("utest1");
    return body && value.length >= 60 ? { kind: "unified", testnet: true } : null;
  }
  if (value.startsWith("u1")) {
    const body = bech32Body("u1");
    return body && value.length >= 60 ? { kind: "unified", testnet: false } : null;
  }
  return null;
}

/** @returns {'transparent'|'sapling'|'unified'|'tex'|null} */
export function classifyZcashAddress(address) {
  return describeZcashAddress(address)?.kind ?? null;
}

/** @returns {string|null} canonical decimal amount, or null when empty. */
function normalizeAmount(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;
  if (!/^\d*(?:\.\d*)?$/.test(trimmed) || !/\d/.test(trimmed)) {
    throw new Error("Amount must be a plain number, like 1.5.");
  }
  const [intRaw = "", fracRaw = ""] = trimmed.split(".");
  if (fracRaw.length > 8) throw new Error("Amount can have at most 8 decimal places.");

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) throw new Error("Amount must be a plain number, like 1.5.");
  if (numeric <= 0) throw new Error("Amount must be greater than zero.");
  if (numeric > MAX_AMOUNT) throw new Error("Amount cannot exceed 21000000 ZEC.");

  const int = intRaw.replace(/^0+/, "") || "0";
  const frac = fracRaw.replace(/0+$/, "");
  return frac ? `${int}.${frac}` : int;
}

/**
 * Build a ZIP-321 payment URI.
 * @param {{address: string, amount?: string, memo?: string, label?: string, message?: string}} content
 * @returns {string} `zcash:<address>[?amount=..&memo=..&label=..&message=..]`
 */
export function buildZip321({ address, amount, memo, label, message } = {}) {
  const trimmedAddress = String(address ?? "").trim();
  if (!trimmedAddress) throw new Error("Enter a Zcash address.");

  const described = describeZcashAddress(trimmedAddress);
  if (!described) throw new Error("That does not look like a Zcash address.");

  const params = [];

  const canonicalAmount = normalizeAmount(amount);
  if (canonicalAmount) params.push(`amount=${canonicalAmount}`);

  const memoText = String(memo ?? "").trim();
  if (memoText) {
    if (described.kind === "transparent" || described.kind === "tex") {
      throw new Error("Transparent addresses cannot carry a memo. Use a shielded or unified address.");
    }
    const bytes = encoder.encode(memoText);
    if (bytes.length > MAX_MEMO_BYTES) {
      throw new Error(`The memo is ${bytes.length} bytes; the limit is ${MAX_MEMO_BYTES}.`);
    }
    params.push(`memo=${toBase64Url(bytes)}`);
  }

  const labelText = String(label ?? "").trim();
  if (labelText) params.push(`label=${encodeURIComponent(labelText)}`);

  const messageText = String(message ?? "").trim();
  if (messageText) params.push(`message=${encodeURIComponent(messageText)}`);

  return params.length > 0 ? `zcash:${trimmedAddress}?${params.join("&")}` : `zcash:${trimmedAddress}`;
}

/**
 * Best-effort decode of a ZIP-321 URI, for the read-only preview field.
 * @returns {{address: string, amount: string, memoText: string, label: string, message: string}}
 */
export function decodeZip321ForPreview(uri) {
  const empty = { address: "", amount: "", memoText: "", label: "", message: "" };
  const value = String(uri ?? "").trim();
  if (!value) return empty;

  const rest = value.replace(/^zcash:/i, "");
  const separator = rest.indexOf("?");
  const address = separator === -1 ? rest : rest.slice(0, separator);
  const query = separator === -1 ? "" : rest.slice(separator + 1);
  const params = new URLSearchParams(query);

  let memoText = "";
  const memoParam = params.get("memo");
  if (memoParam) {
    const bytes = fromBase64Url(memoParam);
    memoText = bytes ? decoder.decode(bytes) : memoParam;
  }

  return {
    address: decodeURIComponent(address),
    amount: params.get("amount") ?? "",
    memoText,
    label: params.get("label") ?? "",
    message: params.get("message") ?? "",
  };
}

/** Normalize a user-typed link: adds https:// when the scheme is missing. */
export function normalizeUrl(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) throw new Error("Enter a link.");
  if (/^\s*(javascript|data|vbscript|file):/i.test(trimmed)) {
    throw new Error("Only http and https links are supported.");
  }

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("That link is not valid.");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only http and https links are supported.");
  }
  if (!parsed.hostname) throw new Error("That link is not valid.");
  return parsed.toString();
}

/** Validate a Vizor gift link: https, with a non-empty fragment. @returns {string} trimmed link */
/** Host that every Vizor gift link is issued on. */
export const GIFT_LINK_HOST = "link.vizor.cash";

export function validateGiftLink(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) throw new Error("Paste the Vizor gift link.");

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("That gift link is not a valid URL.");
  }
  if (parsed.protocol !== "https:") throw new Error("Gift links must start with https://.");
  if (parsed.hostname !== GIFT_LINK_HOST) {
    throw new Error(`Vizor gift links start with https://${GIFT_LINK_HOST}/.`);
  }
  if (!parsed.hash || parsed.hash === "#") {
    throw new Error("Paste the full Vizor gift link, including the part after #.");
  }
  return trimmed;
}

/** @returns {string|null} a soft warning when the fragment is not a versioned gift payload. */
export function giftLinkWarning(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (parsed.hash.startsWith("#v1=")) return null;
  return "This does not look like a current Vizor gift link — the part after # usually starts with v1=.";
}

/** @returns {string} the link with its secret fragment replaced by dots. */
export function maskGiftLink(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    return `${parsed.origin}${parsed.pathname}#v1=••••••`;
  } catch {
    return "••••••";
  }
}

/** @returns {string|null} a warning when the payload is long enough to make a dense QR. */
export function qrCapacityWarning(value) {
  const text = String(value ?? "");
  if (text.length <= CAPACITY_LIMIT) return null;
  return `This value is ${text.length} characters long, so the QR will be dense. Use a shorter link or a larger QR.`;
}

/**
 * Build the QR payload for the current scene.
 * @returns {{ value: string|null, error: string|null, warnings: string[] }}
 */
export function buildQrValue(scene) {
  const warnings = [];
  try {
    let value;
    if (scene.mode === "payment") {
      value = buildZip321(scene.content);
      const described = describeZcashAddress(scene.content.address);
      if (described?.testnet) warnings.push("This is a testnet address. Funds sent to it are not real ZEC.");
    } else if (scene.mode === "giftcard") {
      value = validateGiftLink(scene.content.giftLink);
      const warning = giftLinkWarning(value);
      if (warning) warnings.push(warning);
    } else {
      value = normalizeUrl(scene.content.url);
    }
    const capacity = qrCapacityWarning(value);
    if (capacity) warnings.push(capacity);
    return { value, error: null, warnings };
  } catch (error) {
    return { value: null, error: error.message, warnings };
  }
}

/**
 * Parse one QR value per non-empty line, using the scene's mode validator.
 * @returns {{ items: {index: number, value: string}[], errors: {line: number, message: string}[] }}
 */
export function parseBatchLines(scene, text) {
  const items = [];
  const errors = [];
  const duplicates = [];
  const seen = new Map();
  const lines = String(text ?? "").split(/\r?\n/);

  lines.forEach((raw, position) => {
    const line = raw.trim();
    if (!line) return;
    try {
      let value;
      if (scene.mode === "payment") {
        value = buildZip321({ ...scene.content, address: line });
      } else if (scene.mode === "giftcard") {
        value = validateGiftLink(line);
      } else {
        value = normalizeUrl(line);
      }
      if (scene.mode === "giftcard" && seen.has(value)) {
        duplicates.push({ line: position + 1, firstLine: seen.get(value) });
        return;
      }
      seen.set(value, position + 1);
      items.push({ index: items.length, value });
    } catch (error) {
      errors.push({ line: position + 1, message: error.message });
    }
  });

  return { items, errors, duplicates };
}
