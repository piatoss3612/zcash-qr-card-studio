import test from "node:test";
import assert from "node:assert/strict";

import {
  buildQrValue,
  buildZip321,
  classifyZcashAddress,
  decodeZip321ForPreview,
  describeZcashAddress,
  giftLinkWarning,
  maskGiftLink,
  normalizeUrl,
  parseBatchLines,
  qrCapacityWarning,
  validateGiftLink,
} from "../src/qr-content.js";
import { createScene } from "../src/scene.js";

const T_ADDRESS = `t1${"a".repeat(33)}`;
const T3_ADDRESS = `t3${"b".repeat(33)}`;
const TESTNET_T = `tm${"c".repeat(33)}`;
const SAPLING = `zs1${"q".repeat(75)}`;
const UNIFIED = `u1${"q".repeat(70)}`;
const TEX = `tex1${"q".repeat(38)}`;
const GIFT = "https://link.vizor.cash/payment-links/open#v1=word word word";

test("classifyZcashAddress recognises each address family", () => {
  assert.equal(classifyZcashAddress(T_ADDRESS), "transparent");
  assert.equal(classifyZcashAddress(T3_ADDRESS), "transparent");
  assert.equal(classifyZcashAddress(SAPLING), "sapling");
  assert.equal(classifyZcashAddress(UNIFIED), "unified");
  assert.equal(classifyZcashAddress(TEX), "tex");
  assert.equal(classifyZcashAddress(""), null);
  assert.equal(classifyZcashAddress("bc1qxyz"), null);
  assert.equal(classifyZcashAddress(`t1${"a".repeat(20)}`), null, "wrong length");
  assert.equal(classifyZcashAddress(`zs1${"q".repeat(20)}`), null, "wrong length");
  assert.equal(classifyZcashAddress(`t1${"0".repeat(33)}`), null, "0 is not base58");
  assert.equal(classifyZcashAddress(`zs1${"b".repeat(75)}`), null, "b is not bech32");
});

test("describeZcashAddress flags testnet prefixes", () => {
  assert.deepEqual(describeZcashAddress(TESTNET_T), { kind: "transparent", testnet: true });
  assert.deepEqual(describeZcashAddress(`ztestsapling1${"q".repeat(76)}`), { kind: "sapling", testnet: true });
  assert.deepEqual(describeZcashAddress(`utest1${"q".repeat(70)}`), { kind: "unified", testnet: true });
  assert.deepEqual(describeZcashAddress(SAPLING), { kind: "sapling", testnet: false });
});

test("buildZip321 emits a bare uri without a trailing question mark", () => {
  assert.equal(buildZip321({ address: `  ${T_ADDRESS}  ` }), `zcash:${T_ADDRESS}`);
});

test("buildZip321 requires and validates the address", () => {
  assert.throws(() => buildZip321({ address: "  " }), /Enter a Zcash address/);
  assert.throws(() => buildZip321({ address: "not-an-address" }), /does not look like a Zcash address/);
});

test("buildZip321 normalises the amount", () => {
  const uri = (amount) => buildZip321({ address: T_ADDRESS, amount });
  assert.equal(uri("1"), `zcash:${T_ADDRESS}?amount=1`);
  assert.equal(uri("0.5"), `zcash:${T_ADDRESS}?amount=0.5`);
  assert.equal(uri(".5"), `zcash:${T_ADDRESS}?amount=0.5`);
  assert.equal(uri("1.500"), `zcash:${T_ADDRESS}?amount=1.5`);
  assert.equal(uri("01.20"), `zcash:${T_ADDRESS}?amount=1.2`);
  assert.equal(uri("0.00000001"), `zcash:${T_ADDRESS}?amount=0.00000001`);
  assert.equal(uri("   "), `zcash:${T_ADDRESS}`, "empty amount is optional");
});

test("buildZip321 rejects bad amounts", () => {
  const uri = (amount) => () => buildZip321({ address: T_ADDRESS, amount });
  assert.throws(uri("-1"), /plain number/);
  assert.throws(uri("abc"), /plain number/);
  assert.throws(uri("1e3"), /plain number/);
  assert.throws(uri("0"), /greater than zero/);
  assert.throws(uri("0.000"), /greater than zero/);
  assert.throws(uri("0.000000001"), /8 decimal places/);
  assert.throws(uri("21000001"), /21000000/);
});

test("buildZip321 encodes the memo as unpadded base64url", () => {
  assert.equal(buildZip321({ address: SAPLING, memo: "hello" }), `zcash:${SAPLING}?memo=aGVsbG8`);
  assert.equal(buildZip321({ address: UNIFIED, memo: "hi" }), `zcash:${UNIFIED}?memo=aGk`);
  const emoji = buildZip321({ address: SAPLING, memo: "지갑 🎁" });
  assert.match(emoji, /^zcash:[a-z0-9]+\?memo=[A-Za-z0-9_-]+$/);
  assert.equal(decodeZip321ForPreview(emoji).memoText, "지갑 🎁");
});

test("buildZip321 refuses memos on transparent addresses and oversized memos", () => {
  assert.throws(
    () => buildZip321({ address: T_ADDRESS, memo: "hi" }),
    /Transparent addresses cannot carry a memo/,
  );
  assert.throws(() => buildZip321({ address: TEX, memo: "hi" }), /Transparent addresses cannot carry a memo/);
  assert.doesNotThrow(() => buildZip321({ address: SAPLING, memo: "x".repeat(512) }));
  assert.throws(() => buildZip321({ address: SAPLING, memo: "x".repeat(513) }), /limit is 512/);
  assert.throws(() => buildZip321({ address: SAPLING, memo: "가".repeat(171) }), /limit is 512/);
});

test("buildZip321 keeps the amount, memo, label, message order", () => {
  const uri = buildZip321({
    address: SAPLING,
    amount: "2.5",
    memo: "hello",
    label: "Coffee & Tea",
    message: "Thanks!",
  });
  assert.equal(
    uri,
    `zcash:${SAPLING}?amount=2.5&memo=aGVsbG8&label=Coffee%20%26%20Tea&message=Thanks!`,
  );
});

test("decodeZip321ForPreview reads a uri back", () => {
  const uri = buildZip321({ address: SAPLING, amount: "1.25", memo: "gm", label: "Tip jar", message: "Hi" });
  assert.deepEqual(decodeZip321ForPreview(uri), {
    address: SAPLING,
    amount: "1.25",
    memoText: "gm",
    label: "Tip jar",
    message: "Hi",
  });
  assert.deepEqual(decodeZip321ForPreview(`zcash:${T_ADDRESS}`), {
    address: T_ADDRESS, amount: "", memoText: "", label: "", message: "",
  });
  assert.equal(decodeZip321ForPreview("").address, "");
});

test("normalizeUrl adds https and rejects unsafe schemes", () => {
  assert.equal(normalizeUrl("  example.com/path  "), "https://example.com/path");
  assert.equal(normalizeUrl("http://example.com"), "http://example.com/");
  assert.throws(() => normalizeUrl(""), /Enter a link/);
  assert.throws(() => normalizeUrl("javascript:alert(1)"), /http and https/);
  assert.throws(() => normalizeUrl("JavaScript:alert(1)"), /http and https/);
  assert.throws(() => normalizeUrl("data:text/html,<b>x</b>"), /http and https/);
  assert.throws(() => normalizeUrl("zcash:t1abc"), /http and https/);
  assert.throws(() => normalizeUrl("https://"), /not valid/);
});

test("validateGiftLink demands https and a fragment", () => {
  assert.equal(validateGiftLink(`  ${GIFT}  `), GIFT);
  assert.throws(() => validateGiftLink(""), /Paste the Vizor gift link/);
  assert.throws(() => validateGiftLink("not a url"), /not a valid URL/);
  assert.throws(() => validateGiftLink("http://link.vizor.cash/payment-links/open#v1=x"), /must start with https/);
  assert.throws(() => validateGiftLink("https://vizor.cash/payment-links/open#v1=x"), /link\.vizor\.cash/);
  assert.throws(() => validateGiftLink("https://evil.example/#v1=x"), /link\.vizor\.cash/);
  assert.throws(
    () => validateGiftLink("https://link.vizor.cash/payment-links/open"),
    /including the part after #/,
  );
  assert.throws(() => validateGiftLink("https://link.vizor.cash/payment-links/open#"), /including the part after #/);
});

test("giftLinkWarning only fires on an unversioned fragment", () => {
  assert.equal(giftLinkWarning(GIFT), null);
  assert.equal(giftLinkWarning("https://link.vizor.cash/claim#v1=x"), null);
  assert.match(giftLinkWarning("https://link.vizor.cash/claim#abc"), /v1=/);
  assert.equal(giftLinkWarning(""), null);
});

test("maskGiftLink never leaks the fragment", () => {
  const masked = maskGiftLink(GIFT);
  assert.equal(masked, "https://link.vizor.cash/payment-links/open#v1=••••••");
  assert.equal(masked.includes("word"), false);
  assert.equal(maskGiftLink(""), "");
  assert.equal(maskGiftLink("nonsense#secret"), "••••••");
});

test("qrCapacityWarning warns past 300 characters", () => {
  assert.equal(qrCapacityWarning("x".repeat(300)), null);
  assert.match(qrCapacityWarning("x".repeat(301)), /301 characters/);
  assert.equal(qrCapacityWarning(""), null);
});

test("buildQrValue per mode", () => {
  const link = createScene({ mode: "link" });
  assert.deepEqual(buildQrValue(link), {
    value: null,
    error: "Enter a link.",
    warnings: [],
  });
  link.content.url = "example.com";
  assert.equal(buildQrValue(link).value, "https://example.com/");

  const payment = createScene({ mode: "payment" });
  payment.content.address = TESTNET_T;
  const paid = buildQrValue(payment);
  assert.equal(paid.value, `zcash:${TESTNET_T}`);
  assert.match(paid.warnings[0], /testnet/);

  const gift = createScene({ mode: "giftcard" });
  gift.content.giftLink = "https://link.vizor.cash/claim#abc";
  const gifted = buildQrValue(gift);
  assert.equal(gifted.value, "https://link.vizor.cash/claim#abc");
  assert.match(gifted.warnings[0], /v1=/);
});

test("buildQrValue surfaces the capacity warning", () => {
  const link = createScene({ mode: "link" });
  link.content.url = `https://example.com/${"a".repeat(320)}`;
  const result = buildQrValue(link);
  assert.equal(result.error, null);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /dense/);
});

test("parseBatchLines collects values and per-line errors", () => {
  const payment = createScene({ mode: "payment" });
  payment.content.amount = "1.5";
  payment.content.label = "Market";
  const result = parseBatchLines(payment, `\n  ${T_ADDRESS}  \nnope\n${SAPLING}\n\n`);
  assert.deepEqual(result.items, [
    { index: 0, value: `zcash:${T_ADDRESS}?amount=1.5&label=Market` },
    { index: 1, value: `zcash:${SAPLING}?amount=1.5&label=Market` },
  ]);
  assert.deepEqual(result.errors, [{ line: 3, message: "That does not look like a Zcash address." }]);
});

test("parseBatchLines validates links and gift links", () => {
  const link = createScene({ mode: "link" });
  const links = parseBatchLines(link, "example.com\njavascript:alert(1)");
  assert.deepEqual(links.items, [{ index: 0, value: "https://example.com/" }]);
  assert.equal(links.errors[0].line, 2);

  const gift = createScene({ mode: "giftcard" });
  const gifts = parseBatchLines(gift, `${GIFT}\nhttps://vizor.cash/payment-links/open#v1=x`);
  assert.equal(gifts.items.length, 1);
  assert.equal(gifts.errors[0].line, 2);
  assert.equal(parseBatchLines(gift, "").items.length, 0);
});
