# Online support cards

Online cards are for developers to receive voluntary support for their work.
They are separate from the A6 print editor and use repository-local approved
Vizorcat assets, including the documented Standard cutout.

## Creator flow

Open `online.html` or select **Online cards** in the print studio. Enter a display
name and a mainnet receiving address. Add an optional introduction, select
Signature, Compact, Portrait or Profile, a style, and a companion. The preview
uses the same self-contained SVG renderer as the image API. PNG downloads are
rendered at twice the card dimensions.

The default is an open-amount support request. An optional fixed amount is
preserved in both the QR and clickable ZIP-321 request. Memos are limited to 80 characters and are
allowed for Sapling and unified addresses. Name and introduction are limited to
32 and 80 characters; long copy is wrapped and may be visually truncated to fit.
The full name is retained in the payment request.

**Copy Markdown** and **Copy HTML** become available after the image service's
health check succeeds. On a static-only host they remain unavailable; PNG
downloads and payment requests still work. Link a manually uploaded PNG to the
copied `zcash:` request on hosts that permit custom URI schemes. **Save editing link** preserves the current settings in a
URL fragment so they can be reopened without an account or local storage.

All card details in shared URLs are public. The image API receives them through
the query string. Never include gift links or confidential memos. The name is
creator-supplied and is not a verified identity. Cards are not GitHub Sponsors
transactions or evidence of GitHub endorsement.

## Supporter flow

The card preview, copied Markdown/HTML, and **Copy payment request** all use
exactly the same `zcash:` ZIP-321 request as the QR. They do not open an
intermediary support page. A compatible installed wallet and browser/OS support
are required; a click does not prove a payment succeeded.

GitHub strips `zcash:` anchors. This was checked against GitHub's public
`POST /markdown` API: both a text link and an image-wrapped link lost their
payment target. Use the QR format for GitHub READMEs. The profile format has no
QR and therefore provides no payment interaction there. Direct clickable embeds
are for websites and Markdown renderers that permit custom wallet schemes.
The editor displays this limitation next to the embed code.

The QR has four quiet modules on each edge and no emblem. QR cards reject
payloads that would render below two pixels per module at their nominal size.
Avoid shrinking a README image until the QR becomes hard to scan.

The existing standalone `support.html` route is not used by generated links.

## Data and validation

`src/online/card-data.js` owns the versioned field allowlist and URL codec.
Unknown and duplicate fields, unsupported versions, control characters,
testnet addresses, TEX addresses, oversized data, invalid amounts, and address
checksum errors are rejected. Base58Check, Sapling Bech32, and unified Bech32m
spelling checks run on both the client and API. Unified receiver decoding,
F4Jumble validation, and curve-point validity remain the sending wallet's
responsibility; these spelling checks are not a full ZIP-316 address parser.

Image and payment links carry the same immutable card settings. Changes produce
new links; existing links keep their original recipient and amount. The version
is part of the cache key. Preserve deployed version behavior, or explicitly add
a new renderer version, when changing the public card contract.

`src/online/card-render.js` generates SVG with allowlisted artwork and fonts
embedded as data URIs. It accepts no arbitrary asset URL, uploaded SVG, or HTML.
`server/card-api.js` accepts GET/HEAD, bounds query size, and returns images with
cache and content-type headers. The asset cache contains only the fixed local
asset catalog; no user-specific cache or persistent card database is used.

## Run locally

```sh
npm ci
npm run dev
```

Open `/online.html`. Vite serves the image API through the same handler as the
Worker. All generated links point to the current local host until deployed;
they cannot be used in a public GitHub README.

To test the production bundle and Worker together:

```sh
npm run build
npm run preview:worker
```

To validate the Worker bundle without deploying:

```sh
npm run check:worker
```

## Hosting

Vercel serves the editors, `/api/health`, `/api/card.svg`, and `/pay` from one
origin. GitHub Actions is CI only; GitHub Pages is no longer a deployment target.
See [Vercel deployment](vercel-deployment.md).

The local Worker adapter remains available for existing local checks and is not
required by Vercel. Same-origin builds need no `VITE_CARD_SERVICE_URL`. Public
image and launch URLs must be accessible without login.

## Verification

`npm test` includes official public Zcash address vectors, corruption checks,
amount/memo preservation, template escaping, API/Worker routing, and independent
QR decoding. The fixtures contain public addresses only, not the upstream seed
or private-key fields.

To independently decode an exported QR card or screenshot, run
`node scripts/verify-online-png.mjs path/to/card.png 'zcash:expected-request'`.
The optional second argument asserts the exact recipient, amount and memo.

Before public release, also verify the deployed image in a real GitHub README
(including Camo), mobile layouts, and ZIP-321 handoff with the intended wallets
on physical devices. Local browser rendering and QR decoding alone do not prove
GitHub proxy behavior or OS wallet handoff. No actual payment is needed for the
handoff check.

## Editorial card and character size

The default is the unframed Paper QR layout based on editorial concept 03:
repository Zcash logo, public display name, introduction,
real ZIP-321 QR, and the Standard Vizorcat. Names may be real names or nicknames;
wrapping follows length, not assumed first/last-name semantics. No duplicated
handle is inserted. Midnight and Pixel retain the same uncluttered composition.

`companionScale` is a serialized integer percentage from 50 through 130. The
editor slider steps by 5 and Reset returns it to 100. The size follows preview,
PNG export, API image, and saved editing links. It does not alter payment data.
Choosing no companion hides the size control and preserves its previous value.
The character's entire contain box remains in a separate region at every size;
QR, quiet zone, identity text, logo are never overlaid. The setting
controls the embedded card artwork, not the support page's identity thumbnail.

The Standard cutout and its source/provenance record live under
`assets/characters/`; no deployed asset points at the authoring repository.

## Current visual refinement

The card has no visible Support label or arrow. Name typography is unchanged;
descriptions use local Geist Regular. Companion anchors are raised by 18px in QR
format and 12px in profile format while preserving the allowed size range.

## Editor navigation and drafts

Both editors share compact `Print` / `Embed` navigation inside the existing
header. Each keeps its own draft in same-tab session storage, including
incomplete online-card fields. Reloading or switching editors restores the
latest draft; an explicit editing-link fragment takes precedence. This is not
cross-device or permanent storage. Save an editing link or design file for
longer-term use. A6 session drafts use the existing design-file serializer,
which omits gift links; leaving a design containing a gift link retains the
existing unsaved-work warning.

On small screens, a compact preview precedes the editable fields. Preview
context controls follow the settings. GitHub versus website compatibility is
explained at the format selector, before sharing.

## Layout and companion choices

- **Signature** (`qr`, 560 × 320): the approved spacious card composition.
- **Compact** (`compact`, 640 × 208): a 160px QR at the left, identity in the
  middle, and companion at the right. Suitable for short README sections.
- **Portrait** (`portrait`, 400 × 480): vertical identity above a QR and companion.
- **Profile** (`profile`, 480 × 260): no QR; opens the wallet through the HTTPS launch link.

All four layouts support Paper, Midnight, Pixel, Editorial, Terminal, Aurora,
Blueprint and Airmail. Editorial uses a warm ivory surface and Zarathustra
serif; Terminal uses Geist Mono on deep green. Aurora is a rounded dark card
with violet, teal and Zcash-gold glows. Blueprint draws a drafting grid and
corner crop marks, with a Space Grotesk name and Geist Mono introduction.
Airmail edges the card with red and blue envelope stripes and turns the corner
logo into a perforated stamp with a postmark (the postmark is omitted in
Portrait, where it would meet long names). These surfaces stay outside the
QR, its quiet zone and the text column. Every QR sits on a white square,
including its four-module quiet zone; Aurora and Airmail round the square's
corners inside the quiet zone. Compact shares the same
ZIP-321 request and density checks as Signature, and its dimensions flow through
preview, PNG export and HTML embeds. Layouts are saved in editing links.

The Vizorcat gallery (labeled **Vizorcat** in the editor; the serialized field
remains `companion`) includes 19 characters plus No Vizorcat: Vizorcat,
Airmail Courier, Blueprint Architect, Aurora Photographer, Terminal Sysadmin,
Editorial Writer, Pixel Gamer, Samurai, Wayfinder, Orbital Ranger, Grove Ranger, Oni Samurai,
Commons Guide, Snow Surveyor, Stonehold Warden, Hearthlight Host, Alchemist,
Wandering Swordsman and Tal Strongman. Six are shown initially; Explore all
reveals the full collection. Airmail Courier (Standard), Blueprint Architect
(Lithe Scout), Aurora Photographer (Fluffy Warden), Terminal Sysadmin (Round
Guardian), Editorial Writer (Moonpoint Watcher) and Pixel Gamer (one-eyed Boss)
are online-only Vizorcats made to pair with the
Airmail, Blueprint, Aurora, Terminal, Editorial and Pixel styles. Online cards use embed-specific versions of Vizorcat (the
Classic Guardian, now waving toward the QR) and Samurai (hanbo removed, smiling,
rim-lit for dark cards); the print editor keeps the original files. The selected character remains visible when the
gallery is collapsed or a saved link is restored. Existing approved local
assets are reused without edits.
The existing 50–400% size control applies in every layout. Compact reserves a
separate character region at every allowed scale.

## Current mascot and corner logos

The armored Guardian is labeled **Vizorcat** and is the default companion.
**Surprised** is hidden from the companion picker but remains supported in existing shared cards. Its asset is the full-body cat with three yellow accent
marks extracted from the approved editorial-07 concept, replacing the temporary
Happy portrait. Other companions remain unchanged.

Corner logos are limited to **Zcash, Vizorcat, Valar Group, Zakura, Tachyon**.
These are repository-local assets; Zakura is embedded with SVG MIME type in both
the development image API and Worker. Logo choice is serialized into card links
and does not change the ZIP-321 payment request.

## Companion positioning

Drag the companion in the preview, or focus it and use arrow keys (1 card pixel;
Shift + arrow for 10). Reset position restores the layout default. The entire
contain box stays inside the card. QR overlap warnings include the quiet zone;
sharing remains available, so resolve the warning before exporting a scannable
card. Text and logo overlap are left to the creator's placement choice.

`companionX` and `companionY` are optional percentages of available travel in
each axis, with up to three decimals. Empty values use the layout default. They
persist through session drafts, editing links, image API and PNG exports, and
never alter payment data. Preview pointer interactions edit the card; the
separate Open wallet link tests the ZIP-321 request. Shared HTML and Markdown
still link directly to that request.

The companion also has a bottom-right resize handle, shown on hover/focus and
always available on touch devices. Drag it to resize proportionally between
50–400%, synchronized with the 1% size slider. Arrow keys on the resize handle
adjust by 1%, Shift by 5%, and Home/End select the limits. Resizing preserves the
top-left corner unless moving inward is necessary to stay inside the card.

## HTTPS wallet launch (current sharing behavior)

Shared Markdown/HTML now point to `/pay?…` on the image-service origin. The
Vercel rewrite invokes `api/pay.js`; Vite and the local Worker route to the same
validated handler. The QR and Copy payment request still use direct ZIP-321.

The launch response is a minimal HTML document, not an HTTP 302. It attempts
`location.assign(zcashUri)` once on load and leaves an Open wallet anchor and
copyable exact request available if navigation is blocked. This avoids relying
on a rejected external-protocol redirect to display a fallback body. It does
not detect wallet installation or payment success. Address, label, amount and
memo are validated before rendering; arbitrary redirect targets are rejected.

GitHub Markdown API verification preserves both HTTPS anchors (card and text).
Local browser verification confirms the launch page and exact wallet href.
Actual wallet opening on desktop/mobile and public Vercel routing remain to be
verified after deployment. The route must be publicly accessible without login
for shared cards to work.

## Cropped companions

Upper body enlarges and places the companion at the lower-right edge for each
format. Drag beyond any card edge to crop; the preview, PNG and SVG share the
same clipping. Reset restores the full character at 100%. The size slider stays
available when a resize handle is outside the card. QR overlap is a conservative
bounding-box warning and does not prevent sharing.

Existing links retain their fit-relative coordinates. New gestures use
`companionPosition=canvas` and signed canvas percentages, avoiding zero or
negative travel when the character exceeds the card size. A small visible strip
is retained so the character can still be dragged back.
