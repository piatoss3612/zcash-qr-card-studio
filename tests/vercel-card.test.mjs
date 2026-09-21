import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import image from "../api/card.js";
import health from "../api/health.js";
import { DEFAULT_CARD, COMPANIONS, CARD_LOGOS, serializeCard } from "../src/online/card-data.js";
const { addresses } = JSON.parse(await readFile(new URL("./fixtures/online-addresses.json", import.meta.url)));
const card = { ...DEFAULT_CARD, name: "Vercel test", address: addresses[0] };

test("Vercel health and image functions handle the public endpoints", async () => {
  assert.equal((await (await health.fetch(new Request("https://cards.example/api/health"))).json()).service, "zcash-support-cards");
  for (const route of ["card", "card.svg"]) {
    const url = `https://cards.example/api/${route}?${serializeCard(card)}`;
    const response = await image.fetch(new Request(url));
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /image\/svg\+xml/);
    assert.match(await response.text(), /Vercel test/);
    assert.equal(await (await image.fetch(new Request(url, { method: "HEAD" }))).text(), "");
    assert.equal((await image.fetch(new Request(url, { method: "POST" }))).status, 405);
    assert.equal((await image.fetch(new Request(url + "&v=1"))).status, 400);
  }
});

test("every deployed artwork/logo combination renders below Vercel response limits", async () => {
  for (const companion of Object.keys(COMPANIONS)) {
    for (const logo of Object.keys(CARD_LOGOS)) {
      const response = await image.fetch(new Request(`https://cards.example/api/card?${serializeCard({ ...card, companion, logo })}`));
      assert.equal(response.status, 200, `${companion}/${logo}`);
      const body = await response.text();
      assert.ok(Buffer.byteLength(body) < 4_500_000, `${companion}/${logo} exceeds response limit`);
      if (logo === "zakura") assert.match(body, /data:image\/svg\+xml;base64,/);
    }
  }
});
