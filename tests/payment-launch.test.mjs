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
