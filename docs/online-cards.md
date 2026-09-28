# Online support cards

Online cards are for developers to receive voluntary support for their work.
They are separate from the A6 print editor and use repository-local approved
Vizorcat assets, including the documented Standard cutout.

## Creator flow

Open the home page (`/`; older `/online` links open the same editor) or select
**Embed** in the print editor's header. Enter a display
name and a mainnet receiving address. Add an optional introduction, select
Signature, Compact, Portrait or Profile, a style, and a companion. The preview
uses the same self-contained SVG renderer as the image API. PNG downloads are
rendered at twice the card dimensions.

The default is an open-amount support request. An optional fixed amount is
preserved in both the QR and clickable ZIP-321 request. Memos are limited to 80 characters and are
allowed for Sapling and unified addresses. Name and introduction are limited to
32 and 80 characters. The renderer fits the full copy by wrapping and stepping
the name and introduction sizes down; names never truncate, and a name with no
space or hyphen stays on one row down to 20px before it is split. Only extreme
introductions (for example 80 wide CJK characters in Signature) are shortened at
a word boundary with an ellipsis, and the editor then shows a note under the
introduction field. The full name is retained in the payment request.

The share step asks two separate questions. **Image** chooses who serves the
card: **Hosted** (this image service draws it on each view) or **PNG file** (a
file committed to your repository, so the QR never changes). **Code** chooses **Markdown** or **HTML**;
both use the same alt text, "Support {name} with Zcash", with Markdown
punctuation escaped. **Copy Markdown** and **Copy HTML** become available after
the image service's health check succeeds. On a static-only host they remain unavailable; PNG
downloads and payment requests still work. Link a manually uploaded PNG to the
copied `zcash:` request on hosts that permit custom URI schemes. **Save editing link** preserves the current settings in a
URL fragment so they can be reopened without an account or local storage.

All card details in shared URLs are public. The image API receives them through
the query string; the launch link keeps them after `#` (see
[HTTPS wallet launch](#https-wallet-launch-current-sharing-behavior)). Never include gift links or confidential memos. The name is
creator-supplied and is not a verified identity. Cards are not GitHub Sponsors
transactions or evidence of GitHub endorsement.

## Trust model and static embeds

Hosted embeds are rendered on request by the image service, so whoever controls
that deployment (or its GitHub and Vercel accounts) could change the QR and the
launch page of every hosted card. Outsiders cannot: card settings live only in the
URL, unknown or repeated fields are rejected, addresses are checksum-validated,
the label and memo are encoded so they cannot add ZIP-321 parameters, and the
launch page only emits the validated `zcash:` request.

To remove the dependency on the service for the QR, choose **PNG file** under
**Image**, download the PNG and commit it next to the README as
`zcash-support-card.png`. The static snippet (Markdown or HTML) embeds that file and adds a
`Zcash address:` line served by the README host, which supporters can compare
with the address their wallet shows. The image link still opens the launch page.

The launch page also shows the receiving address for comparison: the first and
last eight characters large, then the full address in groups of four (copying it
yields the contiguous address). It tells supporters to compare those characters
with the address published where they found the card and with their wallet's
confirmation screen, because the launch page itself cannot prove ownership.

The launch page is served with `Content-Security-Policy` (only its own bundled
script and stylesheet, `frame-ancestors 'none'`) and `X-Frame-Options: DENY`,
set in `vercel.json`. The
repository's default branch rejects force pushes and deletion; pushes to it
deploy production on Vercel.

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

Open `/`. Vite serves the image API through the same handler as the
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

Vercel serves the editors, the static `/pay` launch page, `/api/health` and
`/api/card.svg` from one origin. GitHub Actions is CI only; GitHub Pages is no longer a deployment target.
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

QR cards have no Support label or arrow; the QR carries the action. Profile has
no QR, so it ends with a short "Support with Zcash" line (with a fixed
amount, for example "Support with 0.5 ZEC") and an accent underline. Introductions use each style's muted
color and local Geist Regular (Geist Mono in Terminal and Blueprint). A fixed
amount renders at 16px with tabular figures beside the QR (Signature), under the
introduction at the QR's baseline (Compact) or directly above the QR (Portrait).
Companion anchors are raised by 18px in QR format and 12px in profile format
while preserving the allowed size range.

The QR tile, text column and corner logo share one 20px inset (24px in
Compact); only Signature keeps a 12px gap under its QR, so its short card has
room for a large name above. Every style has a rounded or notched shape with a low-opacity edge so
the card stays visible on a README of the same tone, and light styles outline
the white QR tile. Each style carries one signature surface: Paper an inset
print panel over a fine paper grain,
Midnight three orbits with two small lights behind the Vizorcat, Pixel a notched
pixel frame with 8-bit clouds under the corner logo and a checkered floor,
Editorial a terracotta masthead bar with a hairline under it and a column rule
beside the Vizorcat, Terminal scanlines, a phosphor glow, a CRT vignette and a
cursor after the introduction, plus the Aurora, Blueprint, Airmail, Frost, Washi,
Ticket, Receipt, Meadow, Big Top and Velvet surfaces described below.

## Editor navigation and drafts

Both editors share compact `Embed` / `Print` navigation inside the existing
header; Embed is the home page and Print lives at `/print`. Each keeps its own draft in same-tab session storage, including
incomplete online-card fields. Reloading or switching editors restores the
latest draft. Opening an editing link replaces the draft once and then removes
the fragment from the address bar, so a later reload keeps the edits. While the
receiving address still matches the opened link, the Embed editor notes that
payments go to that address until it is replaced or confirmed with
**It’s my address**. This is not
cross-device or permanent storage. Save an editing link or design file for
longer-term use. A6 session drafts use the existing design-file serializer,
which omits gift links; leaving a design containing a gift link retains the
existing unsaved-work warning.

The steps read top to bottom in the settings column: 01 Your details, 02 Card
design, 03 Share your card. On wider screens the preview stays in view beside
them while the steps scroll. On small screens, a compact preview precedes the
editable fields. GitHub versus website compatibility is explained at the layout
selector, before sharing. The share status sits above the copy buttons; a
Vizorcat overlapping the QR or its quiet zone turns it into a warning (sharing
stays available, as the overlap check is conservative).

## Layout and companion choices

- **Signature** (`qr`, 560 × 320): the approved spacious card composition.
- **Compact** (`compact`, 640 × 208): a 160px QR at the left, identity in the
  middle, and companion at the right. Suitable for short README sections.
- **Portrait** (`portrait`, 400 × 480): vertical identity above a QR and companion; the name and introduction are centred in the space above the QR and keep 30px clear of the corner logo.
- **Profile** (`profile`, 480 × 260): no QR; opens the wallet through the HTTPS launch link.

All four layouts support Paper, Midnight, Pixel, Editorial, Terminal, Aurora,
Blueprint, Airmail, Frost, Washi, Ticket, Receipt, Meadow, Big Top and Velvet. Editorial uses a warm ivory surface and Zarathustra
serif; Terminal uses Geist Mono on deep green. Aurora is a rounded dark card
with violet, teal and Zcash-gold glows. Blueprint draws a drafting grid and
corner crop marks, with a Space Grotesk name and Geist Mono introduction.
Airmail edges the card with red and blue envelope stripes and turns the corner
logo into a perforated stamp with a postmark (the postmark is omitted in
Portrait, where it would meet long names). Frost is pale ice with bold survey
contour lines (every third one an index line) around a rise under the Vizorcat,
with a cool glow over the rise and a few small ice glints,
fading in from the edges of the Vizorcat zone and stopping below the corner
logo; its name is set in Space Grotesk. Washi is ivory paper whose indigo
seigaiha waves rise from the bottom-right corner and fade out before the zone's
edges, with a vermilion accent. Ticket is a deep-teal ticket with a tear-off
stub: a mustard dotted perforation with notches cut into the card edge
separates the Vizorcat stub in Signature, Compact and Profile, and runs across
the card under the copy in Portrait, so the stub carries the QR, a fixed
amount and the Vizorcat. Receipt (added 2026-09-27, like the next three) is
thermal paper torn along the top and bottom edges, with dashed item rows and
dotted leaders behind the Vizorcat and a Geist Mono name and introduction.
Meadow is soft sage with four slender botanical sprigs, drawn as fine line art
(pointed leaves with midribs, in pairs that shrink toward a tip leaf), leaning
in from the bottom-right corner. Big Top is cream with a red-striped tent
curtain hanging straight down below a scalloped valance, inside a dotted marquee
frame, with a Space Grotesk name; its stripes never radiate from a point, so
the card cannot read as the Rising Sun flag. Velvet is deep plum
with a faint diamond damask and a scalloped lace hem with eyelets under the
Vizorcat, inside a fine frame, with a Zarathustra name. These surfaces stay outside the
QR, its quiet zone and the text column. Every QR sits on a white square,
including its four-module quiet zone; Aurora and Airmail round the square's
corners inside the quiet zone. Compact shares the same
ZIP-321 request and density checks as Signature, and its dimensions flow through
preview, PNG export and HTML embeds. Layouts are saved in editing links.

The Vizorcat gallery (labeled **Vizorcat** in the editor; the serialized field
remains `companion`) includes 20 characters plus No Vizorcat: Vizorcat,
Airmail Courier, Blueprint Architect, Aurora Photographer, Terminal Sysadmin,
Pixel Gamer, Wayfinder, Orbital Ranger, Grove Ranger, Samurai,
Commons Guide, Snow Surveyor, Stonehold Warden, Hearthlight Host, Alchemist,
Wandering Swordsman, Bard, Arcane Scholar, Gothic Belle and Patchwork Jester. Six are shown initially; Explore all
reveals the full collection. Airmail Courier (Standard), Blueprint Architect
(Lithe Scout), Aurora Photographer (Fluffy Warden), Terminal Sysadmin (Round
Guardian) and Pixel Gamer (a ginger-and-white bicolor since 2026-09-27)
are online-only Vizorcats made to pair with the
Airmail, Blueprint, Aurora, Terminal and Pixel styles; Bard pairs with
Editorial, Snow
Surveyor pairs with Frost, Samurai with Washi, Commons Guide with Ticket, Grove
Ranger with Meadow, Patchwork Jester with Big Top, Gothic Belle with Velvet and
Arcane Scholar with Midnight. The gallery marks the selected style's pair with
**Match**, and all thirteen pairs stay in the collapsed gallery.

Bard, Arcane Scholar and Gothic Belle (added 2026-09-25) are online-only
Vizorcats that also introduce three new coats on the Standard geometry: a
calico, a split-face tortoiseshell and an odd-eyed white. They take class and
fashion archetypes (a D&D-style bard, a star-keeping scholar, goth street
fashion) without copying any specific character, and carry no religious or
occult symbols. On 2026-09-27 all three were redrawn on the print Vizorcats'
chibi proportions (head about half the height, short body and legs), and the
Arcane Scholar was redesigned from a generic Russian Blue wizard into the Night
Academic: a split-face tortoiseshell in a flat academic cap with a star tassel
who traces a small gold constellation. Their records (`bard-v12.md`,
`arcane-scholar-v4.md`, `gothic-belle-v7.md`) define each coat, since the
Vizorcat project has no model sheet for them.

Patchwork Jester (added 2026-09-27) is an online-only Vizorcat grown from a
patchwork outfit the user liked on an early Bard concept. It is a friendly
clown, not a musician: a black-and-white bicolor (a fourth new coat on the
Standard geometry) in big cross-stitched patches of orange, charcoal, cream and
olive, a floppy cone hood with a tassel and long sleeves that cover its paws,
balancing on a patchwork ball. No face paint and no playing-card suits. Its
record is `patchwork-jester-v1.md`.

Every Vizorcat that also appears in the print editor has an embed-specific
pose; the print editor keeps the original files. The Classic Guardian waves
toward the QR. The eleven print-derived characters were recomposed on 2026-09-25:
Wayfinder, Orbital Ranger, Grove Ranger, Samurai (the oni-armoured one, id
`oni`), Commons Guide, Snow
Surveyor, Stonehold Warden, Hearthlight Host, Alchemist, Wandering Swordsman and
Tal Strongman. Each turns three-quarters toward the QR side and gestures or
presents its prop there, keeps props close to the body, shows the whole face
(the Samurai's oni half-mask is held at the hip and its naginata removed), and gets a
thin rim light where a dark coat or outfit would merge into dark cards. Source
records are the `*-embed-v*.md` files under `assets/characters/source/`.
On 2026-09-27 Wayfinder (v5), Orbital Ranger (v5), Commons Guide (v2),
Wandering Swordsman (v3), Grove Ranger (v5), Snow Surveyor (v2), Stonehold
Warden (v2) and Hearthlight Host (v2) were redrawn from poses the user chose on an option
sheet, with no paw gripping anything: Wayfinder leans forward to scout with both
paws behind its back, Orbital Ranger floats with the rescue cord across its body
and waves with both paws, Commons Guide raises one paw in a follow-me gesture
with a pennant tucked behind its satchel strap, and the Wandering Swordsman
stands with its arms folded into its sleeves, bundle on its back and sheathed
sword in view; the Grove Ranger leans in with both paws raised in a warm hello;
the Snow Surveyor catches snowflakes on its tongue with its paws in its fur
cuffs and its lantern on the backpack strap; the Stonehold Warden folds its
arms with the hammer slung on its back; and the Hearthlight Host welcomes with
both paws, its gift box at its feet. The Alchemist keeps its v1 pose (holding
up the flask with its homunculus): the user preferred it to the grip-free
redraws.
The Pixel Gamer was redesigned the same day with its console on a lanyard and
both paws raised in a level-up pose. Each is a chosen sample used exactly as
generated.
On 2026-09-28 the paw standard was relaxed: paws may hold props, curl or tuck,
toe beans are not counted, and only a paw that reads as a human hand at card
size fails (see `.claude/skills/vizorcat/references/lessons.md`). The grip-free
redraws above stay. The same day the Blueprint Architect (v2) holds a
half-unrolled blueprint up with its pencil tucked behind its ear, the Airmail
Courier (v2) holds an envelope up beside its face to check the address, and the
Aurora Photographer (v3) looks up at the sky with its camera lowered in both
paws; the user chose each pose from an option sheet (records
`blueprint-architect-v2.md`, `airmail-courier-v2.md`,
`aurora-photographer-v3.md`). The Terminal Sysadmin keeps its v1 pose, which the
user liked.
Because the catalog ids are unchanged, cards that were already shared with
these Vizorcats show the new poses. The earlier embed Samurai (id `samurai`:
hanbo removed, smiling, rim-lit) left the picker on 2026-09-25 when the oni
Samurai took its name, and Tal Strongman (id `strongman`) and Editorial Writer
(id `writer`, whose gripping paws and Siamese coat duplicated other Vizorcats)
left it on 2026-09-27; like Surprised, they still render on cards that were
already shared with them. The selected character remains visible
when the gallery is collapsed or a saved link is restored.
The existing 50–400% size control applies in every layout. Compact reserves a
separate character region at every allowed scale.

## Current mascot and corner logos

The armored Guardian is labeled **Vizorcat** and is the default companion.
**Surprised** is hidden from the companion picker but remains supported in existing shared cards. Its asset is the full-body cat with three yellow accent
marks extracted from the approved editorial-07 concept, replacing the temporary
Happy portrait. Other companions remain unchanged.

The corner-logo picker offers **Zcash, Vizor, Vizorcat, Zakura, Tachyon**. Valar Group is withdrawn from the picker; existing cards that use it still render, and the picker shows it only while such a card is open.
These are repository-local assets; Zakura is embedded with SVG MIME type in both
the development image API and Worker. Logo choice is serialized into card links
and does not change the ZIP-321 payment request.

## Companion positioning

Drag the companion in the preview, or focus it and use arrow keys (1 card pixel;
Shift + arrow for 10). The size slider, Upper body and Reset sit under the
preview; Reset restores 100% and the layout default position. The entire
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

Shared Markdown/HTML point to `/pay#…` on the image-service origin. Card
details follow `#`, which browsers never send in HTTP requests, so the server
(and its request logs) only sees that `/pay` was opened, not which card or
recipient. `pay.html` is a static page: its script reads the fragment, validates
it with the same `parseCard` as the image API and renders the page in the
browser. Links made before this change use `/pay?…`; the page reads the query
string when there is no fragment, so they still open, but their requests carry
the card details. Vercel rewrites `/pay` to `pay.html` and adds the security
headers; Vite and the local Worker serve the same file. The QR and Copy payment
request still use direct ZIP-321.

The launch page is a minimal HTML document, not an HTTP 302. It attempts
`location.assign(zcashUri)` once on load and leaves an Open wallet anchor and
copyable exact request available if navigation is blocked. This avoids relying
on a rejected external-protocol redirect to display a fallback body. It does
not detect wallet installation or payment success. Address, label, amount and
memo are validated before rendering; arbitrary redirect targets are rejected.

GitHub Markdown API verification preserves both HTTPS anchors (card and text),
including the `#` fragment.
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

## Entry shortcuts and inline checks

Pasting a whole `zcash:` payment request into the address field keeps only its
address; the request's amount and memo fill the payment fields only when those
are empty, and a note under the field says what was taken. Amount and memo
errors appear under their own fields (with `aria-invalid`), and the share status
then reads "Check the payment details." In README preview mode the card is shown
at its real embed width (560px for Signature), left-aligned as GitHub shows it.
Step 03 sits below every design control, so a **Share your card** button in the
preview toolbar (which stays on screen with the card) jumps to it; on phones the
same link sits under the preview. Neither changes the URL fragment that editing
links use.
