<p align="center">
  <img src="assets/logos/vizorcat-classic-head.png" width="128" height="128" alt="Vizorcat Classic Guardian head mark" />
</p>

<h1 align="center">Zcash QR Card Studio</h1>

<p align="center">
  Design and print A6 QR cards for Zcash payments, Vizor gift links and web links.<br />
  A static web app. Everything stays in your browser.
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#card-types">Card types</a> ·
  <a href="#editing">Editing</a> ·
  <a href="#vizorcat">Vizorcat</a> ·
  <a href="#output-contract">Output contract</a> ·
  <a href="#project-layout">Project layout</a>
</p>

---

The studio starts with Content → Design → Review & print. Enter an event name, heading and QR content, then choose a theme and Vizorcat. Theme changes preserve your content and wording. Enable **Free positioning & layers** for the full editing tools. Export a print-ready PNG, print A6 or A4 sheets, display the card on screen, or batch-render a ZIP. On mobile the preview can be expanded, and undo/redo remain accessible.

## Quick start

```bash
python3 -m http.server 4173 --directory .
```

Open `http://127.0.0.1:4173`. There is no build step.

Tests cover the DOM-free modules and run from the repository root:

```bash
node --test
```

## Card types

Pick the card type at the top of the QR content panel. Payment requests are the default.

| Card type | QR payload | Get Vizor card |
|---|---|---|
| Payment request | A ZIP-321 `zcash:` URI built from an address plus optional amount, memo, label and message. Opens in any Zcash wallet. | Never included |
| Vizor gift card | A Vizor payment link (`https://link.vizor.cash/…#v1=…`). | Always included |
| Link | Any `http`/`https` link. | Optional, on by default |

Payment requests validate the address by prefix, charset and length (`t1`/`t3`, `zs1`, `u1`, `tex1`, plus testnet prefixes with a warning). Memos are base64url-encoded, limited to 512 bytes, and rejected for transparent addresses. Amounts allow at most 8 decimal places.

A gift link carries a secret in its URL fragment: whoever scans the card can claim the funds. In gift card mode the app shows a warning banner, masks the fragment in the encoded-value preview, and never writes the link into an exported file name or a saved design file.

## Editing

### Composition

- **Templates** — one per background theme and card type. Each ships a logo, the themed Vizorcat and a call-to-action heading under the QR ("Scan to pay with Zcash" / "Scan to open" / "Scan to claim your gift"). Choosing one changes the background and primary character while keeping the QR, event name, heading and other layers. The initial event layout reserves separate areas for the QR, text, character and installation instructions.
- **Arrangement** — Centered / QR left / QR right, with live thumbnails of the current card at the top of the Templates panel. Themes whose artwork sits bottom-right (Brass Rampart, Hearthlight Exchange, Modernist Commons) default to QR right.
- **Backgrounds, Vizorcat, logos** — a character choice replaces the selected character or the primary character, and a locked character stays unchanged. Logo choices replace the selected logo or add one when no logo is selected. `Add as new layer` always adds.
- **Logo colour** — every logo layer carries its own colour. Single-colour marks offer Original / Ink / White / Crimson / Zcash Gold / custom; multi-colour artwork is drawn as-is. The Logos drawer lists Vizor and Zcash marks first; partner logos sit in a folded section with a caution note (see [Third-party marks](#third-party-marks)).
- **Layers** — drag rows in the layer list to reorder, or use the `⋯` menu / right-click for Duplicate, Lock, Flip, Bring to front / Send to back and Delete. From a layer row, `Shift+F10` opens the menu.

### Type

- **Text boxes** — heading and body presets with editable text, font, size, weight, alignment, uppercase and colour. Corner-resizing scales font size and width together. Double-click text on the canvas to edit it.
- **Faces** — five bundled fonts: Zarathustra (serif), Geist (sans), Space Grotesk (geometric), Silkscreen (pixel, set in capitals) and Geist Mono. Each theme picks its heading face: pixel on Indigo Wave, Dragon Flight, Crimson Core and Dark Core; geometric on Frost Archive, Lunar Orbit, Astral Chart and Modernist Commons; serif elsewhere.
- **Amount and label line** — payment cards can show a "0.05 ZEC · Coffee stand" line under the heading that follows the form fields. It behaves like any text layer for position, size and colour, but its text is bound to the fields.

### QR

- **Panel style** — Clean / Ink / Soft, set in the QR layer's properties.
- **Modules** — square, rounded or dots (finder eyes stay solid) and a module colour (ink, indigo, forest, crimson or custom; preflight warns below 4:1 contrast).
- **Centre emblem** — none, Vizorcat, Samurai, Vizor mark or Zcash. Defaults: Zcash on payment cards, Vizorcat on link cards, none on gift cards because long links make dense codes. Any emblem switches the code to error-correction level H and covers about 8% of it; preflight warns if an emblem sits on a dense code.

### Canvas

- **Snapping** — layers snap to the centre lines, the safe-area edges and other layers' edges and centres. Hold `Alt` to bypass, or switch `Snap` off in the stage footer.
- **Print guides** — trim, safe-area and QR-zone outlines are an editor overlay and never print. They are off by default, appear while you drag or resize, and can be pinned on with the `Print guides` switch.
- **Zoom** — fit plus 25/50/75/100/150/200%. `Cmd/Ctrl+wheel` zooms around the pointer, `Cmd/Ctrl+0` fits, `Cmd/Ctrl+=` / `Cmd/Ctrl+-` step.
- **Keyboard** — arrows nudge by 1 px (`Shift` 10 px), `Delete` removes the selected layer, `Cmd/Ctrl+D` duplicates, `Escape` deselects, `Cmd/Ctrl+Z` / `Cmd/Ctrl+Shift+Z` undo and redo. The `?` key opens the shortcuts sheet.

### Files and output

- **Design files** — the `File` menu saves the design as `.json` (`Cmd/Ctrl+S`) and opens one back (`Cmd/Ctrl+O`). Opening replaces the composition as one undo step. Gift links are never written to the file.
- **Export preflight** — opening `Export` runs a print check: QR content, module size on paper, layers covering the main or install QR, text and logos outside the safe area, module contrast, emblem density and empty text boxes. Warnings never block export; clicking one selects the offending layer.
- **Download PNG** — 300 ppi with 3 mm bleed, for a print shop.
- **Print / PDF** — the trimmed A6 card. In the print dialog pick A6 paper, 100% scale, no margins; on A4, print at actual size and cut.
- **Office printer** — landscape A4 sheets with space for two full-size A6 cards and cut marks. The sheet preview uses 150 ppi raster images; print-shop PNGs retain 300 ppi. Use 100% scale and disable browser headers and footers.
- **Display on screen** — shows the current card without editor controls.
- **Batch export** — paste one QR value per line or append a `.txt` list, then choose a ZIP of PNGs or A4 print sheets in the same dialog. Output counts and file names update as you edit. Click a problem row to select it in the input; duplicate gift links and invalid rows require an explicit choice to skip them. Progress and failures appear in the dialog, and the list stays available after a ZIP download. Gift copies receive `GIFT 001` identifiers, which identify printed copies and do not track claims. PNGs are named `card-001.png`, `card-002.png`, … The document name, sanitised, names the export files.

## Vizorcat

Vizorcat is the mascot family of the Vizor wallet: pixel-art cat companions that share one character DNA. Every Vizorcat is a **Variant** (the bare cat: body, coat, eyes, ears, tail) plus a **Theme** (role, clothing, equipment, world). A Theme changes what the cat wears and carries, never its proportions, face or coat, and no Vizorcat is forced to wear a mechanical visor because the product is called Vizor.

The Classic Guardian's head is the studio's own mark: favicon, top-bar logo, the `Vizorcat Classic` logo sticker and a QR emblem. The Samurai's head is available as a second sticker and emblem.

| Vizorcat | Theme | Home background |
|---|---|---|
| Classic Guardian | Knight of the stonehold | Brass Rampart, Quiet Paper |
| Samurai | Shogun samurai, the one-eyed boss | Indigo Wave, Crimson Core, Dark Core |
| Oni Samurai | One-eyed samurai with an oni mask, naginata and an inviting palm-up paw | Blossom Drift |
| Stonehold Warden | Compact stonehold guardian with hammer and cape | Dragon Flight |
| Crimson Grove Ranger | Crimson-hooded forest ranger | Whispering Grove |
| Snow Surveyor | White-and-silver polar surveyor | Frost Archive |
| Hearthlight Host | Warm gift-exchange host | Hearthlight Exchange |
| Workshop Alchemist | Bronze Mau alchemist with a black homunculus in a dry flask | Alchemist Workshop |
| Tal Strongman | Gray-brown tabby in teal with a laughing wooden mask and a shoulder-carried iron mace | Moonlit Village |
| Orbital Ranger | Orbital rescue ranger | Lunar Orbit |
| Astral Wayfinder | Hooded navigator with an astrolabe | Astral Chart |
| Commons Guide | Community meetup guide | Modernist Commons |

Vizorcats are authored in the separate `vizorcat` project. Only approved stickers are copied into `assets/characters/`, each with a record in `assets/characters/source/` naming the Variant, the Theme, the generation prompt, the alpha-extraction steps and the file hash. New characters must pass the identity, scale and alpha gates in `AGENTS.md` before they are registered in `src/catalog.js`.

## Output contract

- Final trim size: A6 portrait, 105 × 148 mm
- PNG: 1311 × 1819 px with 300 ppi `pHYs` metadata and 3 mm bleed
- Print / PDF: the 105 × 148 mm trim area without the bleed
- QR: error correction level M, or H when a centre emblem is set; four-module quiet zone on every side
- The QR layer can be moved and resized proportionally, cannot be rotated, and stays between 420 and 900 px
- The Get Vizor card can be moved and resized proportionally but cannot be rotated or deleted
- Exactly one fixed, bottommost background layer fills the canvas
- Character, logo and text layers share the stacking order with the QR and Get Vizor layers; preflight warns about overlaps but does not block them
- Logo library: Vizor, Vizor Mark, Vizorcat Classic, Vizorcat Samurai, Zcash Coin, Zcash Mark, ZecHub, Keplr, CipherScan, and the partner marks Cypherpunk, Project Tachyon, NEAR Intents, Keystone, Ledger, Valar Group and Zakura
- The editor UI uses Geist; card headings use the theme's face

## Project layout

`index.html` loads `vendor/qrcode.js` as a classic script and `src/main.js` as an ES module; every path is repository-relative.

```
src/studio.js       Content / Design / Review shell, live checks, display and A4 preview
src/event-card.js   event composition, theme preservation, character replacement, gift numbering
src/print-sheet.js  A4 sheet placement and crop marks
src/catalog.js      assets, palettes, fonts, card types, layouts, templates (pure data)
src/scene.js        DOM-free scene model: layers, constraints, templates, history
src/qr-content.js   DOM-free ZIP-321 builder, address classification, link validation, batch parsing
src/preflight.js    DOM-free export checks
src/design-file.js  DOM-free design-file serializer and validator
src/zip.js          DOM-free store-only ZIP writer
src/snapping.js     DOM-free snap computation
src/render.js       canvas drawing, text, QR modules and emblems, PNG export, print, thumbnails, batch
src/editor.js       canvas interaction: zoom, pointer transforms, snapping guides, shortcuts
src/panels.js       DOM binding for the rail, drawer, properties panel, layer list, menus, dialogs
src/main.js         bootstrap and render scheduler
tests/              node:test suites for the DOM-free modules
```

### Asset conventions

- Store generation prompts, reference files, transformation notes and hashes in the relevant asset type's `source/` directory. Keep rejected generations and intermediate corrections under `archive/qr-card-studio-rejected/`.
- Backgrounds should leave generous paper areas unprinted, use one or two spot colours and a few distinctive objects, and avoid full-page dark fills, washes and heavy gradients. A background supports the theme without competing with the QR or the Vizorcat.
- Fonts are bundled as woff2 and never loaded from the network; see `THIRD_PARTY_NOTICES.md`.

### Third-party marks

Partner logos remain the property of their owners. `assets/logos/source/partner-logos.md` records where each copy came from, which fills were changed, and a usage-terms check per mark. Before a public deployment, review that section: marks without a published usage policy should be confirmed with the brand owner or removed, and recoloured copies restored to their original colours.

## Deployment

Prepare a hosting-independent static bundle from the repository root:

```bash
node --test
python3 scripts/prepare-static-site.py
```

The script prints a fresh `output/static-site-*/site` directory and `site.zip`, with `SHA256SUMS` beside it. Upload the contents of `site/` as the hosting root. There is no application build step or server runtime. The bundle includes runtime assets, bundled license texts and `.nojekyll`; authoring concepts, QA images, tests and Git metadata are excluded. Each run creates a separate directory and leaves earlier bundles intact.

Preview the printed directory with `python3 -m http.server 4173 --directory <site-directory>`. Verify theme selection, a populated QR with Get Vizor guidance, mobile preview and PNG export before publishing. Relative paths support hosting under a project subdirectory. `vendor/qrcode.js` is a pinned copy of `qrcode-generator` (see `vendor/LICENSE`).

As checked on 2026-09-06, the GitHub repository is private and its Pages API returns 404; no active Pages configuration was confirmed. Packaging does not enable hosting, change repository visibility or trigger a deployment. Choose the hosting destination and resolve the existing [third-party mark review](#third-party-marks) before public publication.

## Assets and privacy

Original character and background assets were created with OpenAI image-generation tools, then selected, edited, composited and curated for this project. They are not represented as exclusively human-made or guaranteed unique. Third-party logos, fonts and libraries remain subject to their owners' terms; see `THIRD_PARTY_NOTICES.md` and the provenance records under each asset's `source/` directory.

The application runs entirely in the browser. It does not collect, store or transmit QR contents, card designs or personal information, and it uses no accounts, analytics, cookies or browser storage. Gift-link fragments never leave the page and are never written to exported or saved files. OpenAI services are used only during asset production, never by the deployed application.

Links encoded in QR codes are governed by the privacy practices of their destinations. A static hosting provider may process ordinary request information under its own policy; this project does not receive it.

## License

Source code and documentation are available under the [MIT License](LICENSE).

Original character, background and decorative image assets may be used as part of cards exported from this application for lawful event, onboarding, educational and promotional use. This does not include redistributing, selling or repackaging the raw image files as a standalone collection. Third-party logos, fonts and vendored libraries remain subject to the terms in `THIRD_PARTY_NOTICES.md`.
