import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import jsQR from "jsqr";
import {
  DEFAULT_CARD,
  STYLES,
  LAYOUTS,
  validateAddress,
  validateCard,
  serializeCard,
  parseCard,
  paymentUri,
  cardLinks,
  escapeXml,
} from "../src/online/card-data.js";
import { renderCard, qrMatrix, companionBox } from "../src/online/card-render.js";
import { cardApi } from "../server/card-api.js";
import worker from "../server/worker.js";

const vectors = JSON.parse(
  await fs.readFile(
    new URL("./fixtures/online-addresses.json", import.meta.url),
  ),
);
const base = {
  ...DEFAULT_CARD,
  name: "A builder",
  bio: "Tools for everyday privacy.",
  address: vectors.addresses[0],
};
const loadAsset = async (path) =>
  `data:${path.endsWith(".png") ? "image/png" : path.endsWith(".svg") ? "image/svg+xml" : "font/woff2"};base64,${(await fs.readFile(new URL(`../${path}`, import.meta.url))).toString("base64")}`;

test("official Unified Address vectors pass; single-character corruption fails", async () => {
  for (const address of vectors.addresses) {
    assert.equal((await validateAddress(address)).kind, "unified");
    await assert.rejects(
      validateAddress(
        address.slice(0, -1) + (address.at(-1) === "q" ? "p" : "q"),
      ),
      /checksum/,
    );
  }
});

test("Base58Check validates a Zcash transparent address and rejects corruption", async () => {
  // Public receiver from the first upstream UA vector, encoded independently.
  const payload = Buffer.from(
    "1cb87bb83570b8fae146e03c5331a020b1e0892f631d",
    "hex",
  );
  const checksum = createHash("sha256")
    .update(createHash("sha256").update(payload).digest())
    .digest()
    .subarray(0, 4);
  let integer = BigInt(
    `0x${Buffer.concat([payload, checksum]).toString("hex")}`,
  );
  let address = "";
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  while (integer) {
    address = alphabet[Number(integer % 58n)] + address;
    integer /= 58n;
  }
  assert.equal((await validateAddress(address)).kind, "transparent");
  await assert.rejects(
    validateAddress(
      address.slice(0, -1) + (address.at(-1) === "1" ? "2" : "1"),
    ),
    /checksum/,
  );
  await assert.rejects(
    validateCard({ ...base, address, memo: "hello" }),
    /cannot carry a memo/,
  );
});

test("mainnet-only boundary rejects testnet and payment/gift URLs", async () => {
  await assert.rejects(validateAddress(`utest1${"q".repeat(80)}`), /mainnet/);
  for (const address of [
    "https://link.vizor.cash/claim#secret",
    `zcash:${base.address}`,
    "",
    "u1" + "q".repeat(80),
  ])
    await assert.rejects(validateAddress(address));
});

test("Unicode details round trip without losing amount or memo", async () => {
  const card = await validateCard({
    ...base,
    name: "로완 & tools",
    bio: "Privacy <3",
    memo: "고마워요 ☕",
    amount: "00.01000000",
  });
  assert.equal(card.amount, "0.01");
  assert.deepEqual(await parseCard(serializeCard(card)), card);
  const query = new URLSearchParams(paymentUri(card).split("?")[1]);
  assert.equal(query.get("label"), card.name);
  assert.equal(
    Buffer.from(query.get("memo"), "base64url").toString(),
    card.memo,
  );
});

test("invalid or ambiguous links cannot create a payment request", async () => {
  for (const patch of [
    { v: "2" },
    { style: "__proto__" },
    { companion: "../../private" },
    { layout: "other" },
    { name: "a".repeat(33) },
    { name: "fake\u202eidentity" },
    { amount: "NaN" },
    { amount: "0" },
    { amount: "1.000000001" },
  ])
    await assert.rejects(validateCard({ ...base, ...patch }));
  await assert.rejects(
    parseCard(serializeCard(base) + "&address=" + vectors.addresses[1]),
    /repeated/,
  );
  await assert.rejects(
    parseCard(serializeCard(base) + "&image=https://example.com"),
    /unknown/,
  );
  await assert.rejects(parseCard("x".repeat(4097)), /too long/);
});

test("supporter amount is optional; a fixed request cannot be overridden", async () => {
  const open = await validateCard(base);
  assert.doesNotMatch(paymentUri(open), /amount=/);
  assert.match(paymentUri(open, ".125"), /amount=0.125/);
  await assert.rejects(validateCard({ ...base, amount: "-1" }));
  const fixed = await validateCard({ ...base, amount: "0.5" });
  assert.match(paymentUri(fixed, "100"), /amount=0.5&/);
});

test("image, direct payment and editing links preserve the same immutable details under a subpath", async () => {
  const card = await validateCard(base);
  const links = cardLinks(
    card,
    "https://example.com/studio/online.html",
    "https://images.example.com/cards/",
  );
  assert.equal(new URL(links.image).pathname, "/cards/api/card.svg");
  assert.equal(new URL(links.edit).pathname, "/studio/online");
  assert.equal(links.payment, paymentUri(card));
  assert.ok(links.markdown.endsWith(`](${links.launch})`));
  assert.ok(links.html.startsWith(`<a href="${escapeXml(links.launch)}">`));
  assert.deepEqual(
    await parseCard(new URL(links.image).search.slice(1)),
    card,
  );
  assert.deepEqual(await parseCard(new URL(links.edit).hash.slice(1)), card);
  assert.notEqual(
    cardLinks(
      { ...card, address: vectors.addresses[1] },
      "https://example.com/",
    ).image,
    links.image,
  );
  assert.match(links.html, /&amp;/);
});

test("all layout and color combinations render self-contained SVG and escape untrusted copy", async () => {
  const card = await validateCard({
    ...base,
    name: "<script>bad</script>",
    bio: '" & < >',
  });
  for (const style of Object.keys(STYLES))
    for (const layout of Object.keys(LAYOUTS)) {
      const svg = await renderCard({ ...card, style, layout }, loadAsset);
      assert.match(svg, /data:image\/png;base64,/);
      assert.match(svg, /data:font\/woff2;base64,/);
      assert.doesNotMatch(svg, /<script>|href="https?:|foreignObject/);
      assert.match(svg, /&lt;script&gt;/);
    }
});

test("QR is independently decodable to the exact ZIP-321 request", async () => {
  const uri = paymentUri(
    await validateCard({ ...base, amount: "0.125", memo: "고마워요" }),
  );
  const matrix = qrMatrix(uri);
  const count = matrix.getModuleCount();
  const scale = 4;
  const width = (count + 8) * scale;
  const pixels = new Uint8ClampedArray(width * width * 4).fill(255);
  for (let y = 0; y < count; y++)
    for (let x = 0; x < count; x++)
      if (matrix.isDark(y, x)) {
        for (let dy = 0; dy < scale; dy++)
          for (let dx = 0; dx < scale; dx++) {
            const i =
              (((y + 4) * scale + dy) * width + (x + 4) * scale + dx) * 4;
            pixels[i] = pixels[i + 1] = pixels[i + 2] = 0;
          }
      }
  assert.equal(jsQR(pixels, width, width)?.data, uri);
});

test("API serves images, rejects invalid input before loading assets, and handles missing assets", async () => {
  const request = new Request(
    `https://cards.example.com/api/card.svg?${serializeCard(base)}`,
  );
  const response = await cardApi(request, loadAsset);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /image\/svg\+xml/);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.match(response.headers.get("content-security-policy"), /sandbox/);
  assert.match(await response.text(), /A builder/);
  const head = await cardApi(
    new Request(request, { method: "HEAD" }),
    loadAsset,
  );
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  const bad = await cardApi(new Request(request.url + "&v=1"), () =>
    assert.fail("must not load assets"),
  );
  assert.equal(bad.status, 400);
  assert.equal(
    (await cardApi(new Request(request.url, { method: "POST" }), loadAsset))
      .status,
    405,
  );
  assert.equal(
    (
      await cardApi(request, async () => {
        throw new Error("Internal path or secret");
      })
    ).status,
    503,
  );
});

test("Worker routes static documents to assets and generates API images without remote URLs", async () => {
  const requested = [];
  const env = {
    ASSETS: {
      async fetch(request) {
        requested.push(request.url);
        const path = new URL(request.url).pathname.slice(1);
        if (path === "online.html") return new Response("studio");
        return new Response(
          await fs.readFile(new URL(`../${path}`, import.meta.url)),
        );
      },
    },
  };
  assert.equal(
    await (
      await worker.fetch(new Request("https://example.com/online.html"), env)
    ).text(),
    "studio",
  );
  const image = await worker.fetch(
    new Request(`https://example.com/api/card.svg?${serializeCard(base)}`),
    env,
  );
  assert.equal(image.status, 200);
  assert.ok(requested.every((url) => url.startsWith("https://example.com/")));
});

test("Vizorcat size round trips through shared links without changing payment", async () => {
  const small = await validateCard({ ...base, companionScale: "50" });
  const large = await validateCard({ ...base, companionScale: "130" });
  assert.equal(paymentUri(small), paymentUri(large));
  const links = cardLinks(large, "https://example.com/online.html");
  assert.equal(
    (await parseCard(new URL(links.image).search.slice(1))).companionScale,
    "130",
  );
  assert.equal(
    (await parseCard(new URL(links.edit).hash.slice(1))).companionScale,
    "130",
  );
  for (const companionScale of [
    "0",
    "49",
    "401",
    "1000",
    "NaN",
    "75.5",
    "<script>",
  ])
    await assert.rejects(validateCard({ ...base, companionScale }), /size/);
});

test("all allowed sizes reserve QR, text, logo and full character bounds", async () => {
  const { companionBox } = await import("../src/online/card-render.js");
  for (const layout of ["qr", "profile"]) {
    for (let size = 50; size <= 130; size++) {
      const box = companionBox({
        ...base,
        layout,
        companionScale: String(size),
      });
      assert.ok(box.x >= (layout === "qr" ? 365 : 315));
      assert.ok(box.y >= 50);
      assert.ok(box.x + box.w <= (layout === "qr" ? 540 : 460));
      assert.ok(box.y + box.h <= (layout === "qr" ? 308 : 245));
    }
  }
});


test("Compact keeps QR and companion apart at every allowed scale and survives sharing", async () => {
  const { companionBox } = await import("../src/online/card-render.js");
  const card = await validateCard({ ...base, layout: "compact", amount: "0.125" });
  const links = cardLinks(card, "https://example.com/online.html");
  assert.equal((await parseCard(new URL(links.edit).hash.slice(1))).layout, "compact");
  assert.match(links.html, /width="640"/);
  assert.equal(links.payment, paymentUri(card));
  const response = await cardApi(new Request(links.image), loadAsset);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /width="640" height="208"/);
  for (let scale = 50; scale <= 130; scale++) {
    const box = companionBox({ ...card, companionScale: String(scale) });
    assert.ok(box.x >= 480);
    assert.ok(box.y >= 50);
    assert.ok(box.x + box.w <= 624);
    assert.ok(box.y + box.h <= 200);
  }
});

test("corner logo survives sharing, never changes payment, and rejects arbitrary assets", async () => {
  const { CARD_LOGOS } = await import("../src/online/card-data.js");
  const initial = await validateCard(base);
  for (const logo of Object.keys(CARD_LOGOS)) {
    const card = await validateCard({ ...base, logo });
    const links = cardLinks(card, "https://example.com/online.html");
    assert.equal((await parseCard(new URL(links.edit).hash.slice(1))).logo, logo);
    assert.equal((await parseCard(new URL(links.image).search.slice(1))).logo, logo);
    assert.equal(paymentUri(card), paymentUri(initial));
    const paths = [];
    await renderCard(card, async path => { paths.push(path); return loadAsset(path); });
    if (logo !== "none") assert.ok(paths.includes(CARD_LOGOS[logo].path));
  }
  await assert.rejects(validateCard({ ...base, logo: "https://example.com/image.svg" }));
  assert.equal(DEFAULT_CARD.companion, "classic");
});


test("corner logos expose the selected six brands, including SVG Zakura", async () => {
  const { CARD_LOGOS } = await import("../src/online/card-data.js");
  assert.deepEqual(Object.keys(CARD_LOGOS), ["zcash", "vizor", "vizorcat", "valar", "zakura", "tachyon"]);
  const card = await validateCard({ ...base, logo: "zakura" });
  const response = await worker.fetch(new Request(`https://example.com/api/card.svg?${serializeCard(card)}`), {
    ASSETS: { async fetch(request) { return new Response(await fs.readFile(new URL(`../${new URL(request.url).pathname.slice(1)}`, import.meta.url))); } },
  });
  assert.equal(response.status, 200);
  assert.match(await response.text(), /data:image\/svg\+xml;base64,/);
});


test("restoring a draft repairs removed catalog choices without losing payment fields", async () => {
  const { restoreDraft } = await import("../src/online/card-data.js");
  for (const logo of ["zechub", "samurai", "none", "unknown"]) {
    const draft = restoreDraft({ ...base, logo, bio: "Keep my introduction", amount: "0.125", memo: "Keep my memo" });
    assert.equal(draft.logo, DEFAULT_CARD.logo);
    assert.equal(draft.address, base.address);
    assert.equal(draft.bio, "Keep my introduction");
    assert.equal(draft.amount, "0.125");
    assert.equal(draft.memo, "Keep my memo");
    await renderCard(draft, loadAsset, { demo: true });
  }
  const repaired = restoreDraft({ ...base, style: "missing", layout: "missing", companion: "missing", companionScale: "999" });
  for (const key of ["style", "layout", "companion", "companionScale"])
    assert.equal(repaired[key], DEFAULT_CARD[key]);
  assert.equal(restoreDraft({ ...base, logo: "zakura" }).logo, "zakura");
});

test("companion positions round trip and remain inside every layout without changing payment", async () => {
  const { companionBox } = await import("../src/online/card-render.js");
  for (const layout of Object.keys(LAYOUTS)) {
    for (const position of ["0", "50.125", "100"]) {
      const card = await validateCard({ ...base, layout, companionX: position, companionY: position, companionScale: "130" });
      const links = cardLinks(card, "https://example.com/online.html");
      assert.deepEqual(await parseCard(new URL(links.edit).hash.slice(1)), card);
      assert.equal(links.payment, paymentUri(base));
      const box = companionBox(card);
      assert.ok(box.x >= 0 && box.y >= 0);
      assert.ok(box.x + box.w <= LAYOUTS[layout].width);
      assert.ok(box.y + box.h <= LAYOUTS[layout].height);
      const svg = await renderCard(card, loadAsset);
      assert.ok(svg.includes(`x="${box.x}" y="${box.y}" width="${box.w}"`));
    }
  }
  for (const value of ["NaN", "-1", "101", "1e2", "0.0001", 50])
    await assert.rejects(validateCard({ ...base, companionX: value }));
});

test("resizing preserves the top-left position except when constrained by a card edge", async () => {
  const { companionBox, resizeCompanion } = await import("../src/online/card-render.js");
  for (const layout of Object.keys(LAYOUTS)) {
    const card = { ...base, layout, companionX: "20", companionY: "20" };
    const before = companionBox(card);
    const resized = { ...card, ...resizeCompanion(card, 120) };
    const after = companionBox(resized);
    assert.ok(Math.abs(after.x - before.x) < .01);
    assert.ok(Math.abs(after.y - before.y) < .01);
    assert.equal(resized.companionScale, "120");
    const edge = { ...card, companionX: "100", companionY: "100" };
    const bounded = companionBox({ ...edge, ...resizeCompanion(edge, 500) });
    assert.ok(bounded.x < LAYOUTS[layout].width);
    assert.ok(bounded.y < LAYOUTS[layout].height);
    assert.equal(resizeCompanion(card, -50).companionScale, "50");
  }
});

test("portrait defaults keep the companion clear of QR and text at every allowed scale", () => {
  for (let companionScale = 50; companionScale <= 130; companionScale++) {
    const box = companionBox({ ...base, layout: "portrait", companionScale: String(companionScale) });
    assert.ok(box.x >= 180, "companion must remain right of the QR quiet zone");
    assert.ok(box.y >= 220, "companion must remain below the introduction");
    assert.ok(box.x + box.w <= 400);
    assert.ok(box.y + box.h <= 480);
  }
});

test("new styles and portrait round-trip without changing the payment request", async () => {
  const original = await validateCard(base);
  for (const style of ["editorial", "terminal"]) {
    const card = await validateCard({ ...base, style, layout: "portrait" });
    assert.deepEqual(await parseCard(serializeCard(card)), card);
    assert.equal(paymentUri(card), paymentUri(original));
    const svg = await renderCard(card, loadAsset);
    assert.match(svg, /width="400" height="480"/);
    assert.match(svg, /fill="#fff"/);
  }
});

test("names and introductions at their length limits render in full on every card", async () => {
  const name = "Maximilian Alexander-Worthington";
  const bio = "Maintainer of zcash-light-client tools, docs, and a very long list of side proje";
  assert.equal([...name].length, 32);
  assert.equal([...bio].length, 80);
  const rows = (svg, kind) => [...svg.matchAll(new RegExp(`<text class="${kind}"[^>]*>([^<]*)</text>`, "g"))].map((m) => m[1]);
  for (const style of Object.keys(STYLES))
    for (const layout of Object.keys(LAYOUTS)) {
      const card = await validateCard({ ...base, name, bio, style, layout, amount: "0.5" });
      const svg = await renderCard(card, loadAsset);
      assert.doesNotMatch(svg, /data-truncated/, `${style}/${layout}`);
      assert.equal(rows(svg, "name").join(" ").replace("- ", "-"), name, `${style}/${layout}`);
      assert.equal(rows(svg, "bio").join(" ").replace(/-\s/g, "-"), bio, `${style}/${layout}`);
    }
  const wide = await validateCard({ ...base, layout: "qr", name, bio: "가".repeat(80), amount: "0.5" });
  const svg = await renderCard(wide, loadAsset);
  assert.match(svg, /data-truncated="true"/);
  assert.match(rows(svg, "bio").at(-1), /…$/);
});

test("surface styles draw local artwork around a white QR tile without changing payment", async () => {
  const original = await validateCard(base);
  const surfaces = { aurora: /id="au-violet"/, blueprint: /id="bp-grid"/, airmail: /id="am-stripes"/ };
  for (const [style, marker] of Object.entries(surfaces))
    for (const layout of Object.keys(LAYOUTS)) {
      const card = await validateCard({ ...base, style, layout });
      assert.deepEqual(await parseCard(serializeCard(card)), card);
      assert.equal(paymentUri(card), paymentUri(original));
      const svg = await renderCard(card, loadAsset);
      assert.match(svg, marker);
      if (layout !== "profile") assert.match(svg, /width="160" height="160" rx="\d+" fill="#fff"/);
    }
});

test("every companion shares and renders using a bundled local asset without changing payment", async () => {
  const { COMPANIONS } = await import("../src/online/card-data.js");
  const initial = await validateCard(base);
  for (const [companion, asset] of Object.entries(COMPANIONS)) {
    const card = await validateCard({ ...base, companion });
    assert.deepEqual(await parseCard(serializeCard(card)), card);
    assert.equal(paymentUri(card), paymentUri(initial));
    const paths = [];
    const svg = await renderCard(card, async path => { paths.push(path); return loadAsset(path); });
    if (asset.path) {
      assert.ok(paths.includes(asset.path));
      assert.match(svg, /class="companion"/);
    } else {
      assert.doesNotMatch(svg, /class="companion"/);
    }
  }
});

test("cropped companions round-trip, resize beyond the card, and retain a visible drag area", async () => {
  const { upperBodyCompanion, positionCompanion, resizeCompanion } = await import("../src/online/card-render.js");
  for (const layout of Object.keys(LAYOUTS)) {
    const card = await validateCard({ ...base, layout, ...upperBodyCompanion({ ...base, layout }) });
    assert.deepEqual(await parseCard(serializeCard(card)), card);
    assert.equal(paymentUri(card), paymentUri(base));
    const box = companionBox(card);
    assert.ok(box.y + box.h > LAYOUTS[layout].height);
    if (layout !== "profile") assert.ok(box.x >= 180);
    const large = { ...card, ...resizeCompanion(card, 400) };
    const moved = await validateCard({ ...large, ...positionCompanion(large, -9999, -9999) });
    const cropped = companionBox(moved);
    assert.ok(cropped.x + cropped.w >= 23.99);
    assert.ok(cropped.y + cropped.h >= 23.99);
    assert.deepEqual(await parseCard(serializeCard(moved)), moved);
    assert.match(await renderCard(moved, loadAsset), /overflow="hidden"/);
  }
});

test("static Markdown uses the committed PNG and publishes the address for comparison", async () => {
  const { STATIC_IMAGE } = await import("../src/online/card-data.js");
  const card = await validateCard(base);
  const links = cardLinks(card, "https://example.com/online.html", "https://cards.example/");
  const [image, , address] = links.static.split("\n");
  assert.equal(image, `[![Support with Zcash](${STATIC_IMAGE})](${links.launch})`);
  assert.equal(address, `Zcash address: \`${card.address}\``);
  assert.doesNotMatch(links.static, /api\/card\.svg/);
});

test("every suggested style pair names a bundled Vizorcat", async () => {
  const { COMPANIONS } = await import("../src/online/card-data.js");
  const pairs = Object.values(STYLES).map(style => style.companion).filter(Boolean);
  assert.ok(pairs.length > 0);
  for (const companion of pairs) assert.ok(COMPANIONS[companion]?.path, companion);
});

test("an incomplete card explains its QR placeholder without drawing a payment code", async () => {
  const draft = { ...DEFAULT_CARD, name: "A builder", address: "zcash:u1<bad>" };
  const svg = await renderCard(draft, loadAsset, { demo: true, qrHint: ["Check your", "<receiving> address"] });
  assert.match(svg, />Check your</);
  assert.match(svg, />&lt;receiving&gt; address</);
  assert.doesNotMatch(svg, /zcash:/);
});
