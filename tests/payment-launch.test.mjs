import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { paymentLaunch } from "../server/payment-launch.js";
import { DEFAULT_CARD, cardLinks, paymentUri, escapeXml } from "../src/online/card-data.js";
const { addresses } = JSON.parse(await readFile(new URL("./fixtures/online-addresses.json", import.meta.url)));
const card = { ...DEFAULT_CARD, name: "<Builder>", address: addresses[0], amount: "0.125", memo: "Thank you" };

test("HTTPS launch preserves exact payment intent and escapes creator text", async () => {
  const links = cardLinks(card, "https://site.example/online.html", "https://cards.example/");
  assert.equal(new URL(links.launch).protocol, "https:");
  assert.equal(new URL(links.launch).pathname, "/pay");
  assert.equal(links.markdown, `[![Support with Zcash](${links.image})](${links.launch})`);
  const response = await paymentLaunch(new Request(links.launch));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const html = await response.text();
  assert.ok(html.includes(`href="${escapeXml(paymentUri(card))}"`));
  assert.match(html, /&lt;Builder&gt;/);
  assert.doesNotMatch(html, /<Builder>/);
  assert.match(html, /window.location.assign/);
  assert.equal((await paymentLaunch(new Request(links.launch + "&url=https://evil.example"))).status, 400);
  assert.equal((await paymentLaunch(new Request(links.launch, {method:"POST"}))).status, 405);
  assert.equal(await (await paymentLaunch(new Request(links.launch, {method:"HEAD"}))).text(), "");
});

test("launch page allows only its own script and cannot be framed", async () => {
  const { createHash } = await import("node:crypto");
  const { LAUNCH_SCRIPT, LAUNCH_SCRIPT_HASH } = await import("../server/payment-launch.js");
  assert.equal(`sha256-${createHash("sha256").update(LAUNCH_SCRIPT).digest("base64")}`, LAUNCH_SCRIPT_HASH);
  const links = cardLinks(card, "https://site.example/online.html", "https://cards.example/");
  const response = await paymentLaunch(new Request(links.launch));
  const policy = response.headers.get("content-security-policy");
  assert.match(policy, /default-src 'none'/);
  assert.match(policy, /frame-ancestors 'none'/);
  assert.ok(policy.includes(`script-src '${LAUNCH_SCRIPT_HASH}'`));
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  const scripts = [...(await response.text()).matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.deepEqual(scripts, [LAUNCH_SCRIPT]);
});

test("launch page shows the receiving address for comparison without new scripts", async () => {
  const links = cardLinks(card, "https://site.example/online.html", "https://cards.example/");
  const html = await (await paymentLaunch(new Request(links.launch))).text();
  const address = card.address;
  assert.match(html, /Check the address before you confirm/);
  assert.ok(html.includes(`<dt>Starts with</dt><dd>${address.slice(0, 8)}</dd>`));
  assert.ok(html.includes(`<dt>Ends with</dt><dd>${address.slice(-8)}</dd>`));
  const groups = [...html.matchAll(/<(?:b|span)>([^<]*)<\/(?:b|span)>/g)].map((m) => m[1]);
  assert.equal(groups.join(""), address);
  const emphasized = [...html.matchAll(/<b>([^<]*)<\/b>/g)].map((m) => m[1]).join("");
  assert.equal(emphasized, address.slice(0, 8) + address.slice(-8));
  assert.equal([...html.matchAll(/<script>/g)].length, 1);
});
