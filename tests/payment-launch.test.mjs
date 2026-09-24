import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { LAUNCH_HEADERS } from "../server/payment-launch.js";
import worker from "../server/worker.js";
import { DEFAULT_CARD, cardLinks, paymentUri, escapeXml, parseCard, serializeCard } from "../src/online/card-data.js";
import { launchMarkup, launchQuery } from "../src/online/launch-page.js";
const { addresses } = JSON.parse(await readFile(new URL("./fixtures/online-addresses.json", import.meta.url)));
const card = { ...DEFAULT_CARD, name: "<Builder>", address: addresses[0], amount: "0.125", memo: "Thank you" };

test("launch links keep card details after # so requests carry none of them", async () => {
  const links = cardLinks(card, "https://site.example/online.html", "https://cards.example/");
  const launch = new URL(links.launch);
  assert.equal(launch.protocol, "https:");
  assert.equal(launch.pathname, "/pay");
  assert.equal(launch.search, "");
  assert.ok(!launch.href.split("#")[0].includes(card.address));
  assert.equal(links.markdown, `[![Support with Zcash](${links.image})](${links.launch})`);
  assert.deepEqual(await parseCard(launchQuery(launch)), await parseCard(serializeCard(card)));
});

test("launch page still opens links made with the query string", async () => {
  const legacy = new URL(`https://cards.example/pay?${serializeCard(card)}`);
  assert.equal(launchQuery(legacy), serializeCard(card));
  assert.equal(launchQuery(new URL("https://cards.example/pay#")), "");
  await assert.rejects(parseCard(launchQuery(new URL("https://cards.example/pay"))));
  const links = cardLinks(card, "https://site.example/online.html", "https://cards.example/");
  await assert.rejects(parseCard(launchQuery(new URL(links.launch + "&url=https://evil.example"))));
});

test("launch markup preserves exact payment intent and escapes creator text", () => {
  const html = launchMarkup(card);
  assert.ok(html.includes(`href="${escapeXml(paymentUri(card))}"`));
  assert.match(html, /&lt;Builder&gt;/);
  assert.doesNotMatch(html, /<Builder>/);
  assert.match(html, /0\.125 ZEC/);
});

test("launch markup shows the receiving address for comparison", () => {
  const html = launchMarkup(card);
  const address = card.address;
  assert.match(html, /Check the address before you confirm/);
  assert.ok(html.includes(`<dt>Starts with</dt><dd>${address.slice(0, 8)}</dd>`));
  assert.ok(html.includes(`<dt>Ends with</dt><dd>${address.slice(-8)}</dd>`));
  const groups = [...html.matchAll(/<(?:b|span)>([^<]*)<\/(?:b|span)>/g)].map((m) => m[1]);
  assert.equal(groups.join(""), address);
  const emphasized = [...html.matchAll(/<b>([^<]*)<\/b>/g)].map((m) => m[1]).join("");
  assert.equal(emphasized, address.slice(0, 8) + address.slice(-8));
  assert.doesNotMatch(html, /<script/);
});

test("launch page runs only its bundled script and cannot be framed", async () => {
  const page = await readFile(new URL("../pay.html", import.meta.url), "utf8");
  const scripts = [...page.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  assert.match(scripts[0][1], /type="module" src="\.\/src\/online\/pay\.js"/);
  assert.equal(scripts[0][2].trim(), "");
  assert.doesNotMatch(page, /\sstyle=|<style/);
  const policy = LAUNCH_HEADERS["Content-Security-Policy"];
  assert.match(policy, /default-src 'none'/);
  assert.match(policy, /script-src 'self';/);
  assert.match(policy, /frame-ancestors 'none'/);
  assert.doesNotMatch(policy, /unsafe-inline/);
  assert.equal(LAUNCH_HEADERS["X-Frame-Options"], "DENY");
});

test("Vercel and the local Worker serve the static launch page with the same headers", async () => {
  const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.deepEqual(vercel.rewrites.find((rule) => rule.source === "/pay"), { source: "/pay", destination: "/pay.html" });
  for (const source of ["/pay", "/pay.html"]) {
    const rule = vercel.headers.find((entry) => entry.source === source);
    assert.deepEqual(Object.fromEntries(rule.headers.map(({ key, value }) => [key, value])), LAUNCH_HEADERS, source);
  }
  const requested = [];
  const env = { ASSETS: { async fetch(request) { requested.push(request.url); return new Response("launch page", { headers: { "Content-Type": "text/html" } }); } } };
  const response = await worker.fetch(new Request(`https://example.com/pay?${serializeCard(card)}`), env);
  assert.equal(await response.text(), "launch page");
  assert.equal(new URL(requested[0]).pathname, "/pay");
  for (const [key, value] of Object.entries(LAUNCH_HEADERS)) assert.equal(response.headers.get(key), value);
});
