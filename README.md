# Zcash QR Card Studio

Zcash QR Card Studio is a fully static web app for designing event-ready A6 QR cards. It works like a lightweight photo editor: an icon tool rail and drawer on the left, a zoomable canvas in the middle, and a properties panel on the right. Pick a template, background, Vizorcat, logo, text box and QR style, then move, resize, rotate and stack layers on the canvas. Everything stays in the browser and is never sent to a server.

## Vizorcat

Vizorcat is the mascot family of the Vizor wallet: a set of pixel-art cat companions that share one recognisable character DNA. Every Vizorcat is built from two layers — a **Variant** (the bare cat: body form, coat pattern, eyes, ears, tail and permanent traits) and a **Theme** (role, clothing, equipment and world applied on top). A Theme may change what the cat wears and carries, but never its head-to-body ratio, face, ears, tail or coat identity, and no Vizorcat is forced to wear a mechanical visor just because the product is called Vizor.

The first Vizorcat, the grey-and-white knight, is the **Classic Guardian**. Its head is the studio's own mark: the favicon, the top-bar logo and the `Vizorcat Classic` logo sticker.

This studio ships ten Vizorcats, each drawn for a matching background theme. The template gallery pairs themed characters and backgrounds where available, and the Vizorcat drawer lets you place any of them on any background.

| Vizorcat | Theme | Home background |
|---|---|---|
| Classic Guardian | Knight of the stonehold | Brass Rampart, Quiet Paper |
| Samurai | Shogun samurai, the one-eyed boss | Indigo Wave, Blossom Drift, Crimson Core, Dark Core |
| Stonehold Warden | Compact stonehold guardian with hammer and cape | Dragon Flight |
| Crimson Grove Ranger | Crimson-hooded forest ranger | Whispering Grove |
| Snow Surveyor | White-and-silver polar surveyor | Frost Archive |
| Hearthlight Host | Warm gift-exchange host | Hearthlight Exchange |
| Orbital Ranger | Orbital rescue ranger | Lunar Orbit |
| Astral Wayfinder | Hooded navigator with an astrolabe | Astral Chart |
| Commons Guide | Community meetup guide | Modernist Commons |
| Nightglass Rider | Cybernetic shadow rider | Any custom composition |

Vizorcats are authored in the separate `vizorcat` project (variant kits, model sheets, turnarounds and expression references). Only approved stickers are copied into this repository under `assets/characters/`, each with a source record in `assets/characters/source/` that names the Variant, the Theme, the generation prompt, the alpha-extraction steps and the file hash. New characters must pass the identity, scale and alpha gates described in `AGENTS.md` before they are registered in `src/catalog.js`.

## Run locally

```bash
python3 -m http.server 4173 --directory .
```

Then open `http://127.0.0.1:4173`.

## Card types

The card type (top bar) decides what the main QR encodes and whether the Get Vizor install card is part of the composition.

| Card type | QR payload | Get Vizor card |
|---|---|---|
| Payment request | A ZIP-321 `zcash:` URI built from an address plus optional amount, memo, label and message. Opens in any Zcash wallet. | Never included |
| Link | Any `http`/`https` link. | Optional, on by default |
| Vizor gift card | A Vizor payment link. | Always included |

Payment requests validate the address by prefix, charset and length (`t1`/`t3`, `zs1`, `u1`, `tex1`, plus testnet prefixes with a warning). Memos are base64url-encoded and limited to 512 bytes, and are rejected for transparent addresses. Amounts allow at most 8 decimal places.

A Vizor gift link starts with `https://link.vizor.cash/` and carries a secret in its URL fragment: whoever scans the card can claim the funds. In gift card mode the app shows a warning banner, masks the fragment in the encoded-value preview, and never writes the link into an exported file name.

## Editing

- **Templates** — three per card type. Applying one replaces the background and every layer but keeps the QR content you have already typed.
- **Backgrounds, Vizorcat, logos** — clicking a Vizorcat or logo card replaces the selected layer of that kind, or adds a new layer when nothing of that kind is selected. `Add as new layer` always adds.
- **Logo colour** — every logo layer carries its own colour, so the same mark can appear several times in different colours. Single-colour marks offer Original / Ink / White / Crimson / Zcash Gold / custom; multi-colour artwork is always drawn as-is.
- **Text boxes** — heading (Zarathustra) and body (Geist) presets with editable text, font, size, weight, alignment and colour. Corner-resizing a text box scales its font size and width together. Double-click a text layer on the canvas to jump to its text field.
- **Arrangement and QR style** — Centered / QR left / QR right live at the top of the Templates panel with live previews of the current card. Clean / Ink / Soft QR panels are set in the QR layer's properties.
- **Snapping** — while dragging, layers snap to the canvas centre lines, the safe-area edges and other layers' edges and centres, drawing guide lines. Hold `Alt` to bypass snapping, or switch `Snap` off in the stage footer.
- **Zoom** — fit plus 25/50/75/100/150/200%. `Cmd/Ctrl+wheel` zooms around the pointer, `Cmd/Ctrl+0` fits, `Cmd/Ctrl+=` / `Cmd/Ctrl+-` step.
- **Help** — the `?` button in the top bar (or the `?` key) opens a shortcuts and tips sheet.
- **Keyboard** — arrows nudge by 1px (`Shift` 10px), `Delete`/`Backspace` removes the selected deletable layer, `Cmd/Ctrl+D` duplicates, `Escape` deselects, `Cmd/Ctrl+Z` undoes and `Cmd/Ctrl+Shift+Z` or `Cmd/Ctrl+Y` redoes. Native browser undo remains available inside text, URL and numeric fields.
- **Design files** — the `⋯` menu next to the document name saves the current design as a `.json` file (`Cmd/Ctrl+S`) and opens one back (`Cmd/Ctrl+O`). Opening replaces the composition as one undo step. Gift links are never written to the file; paste them again after opening. `New card` resets to the current card type's default template.
- **Export preflight** — opening `Export` runs a print check first: QR content, module size on paper (below 0.45 mm warns), anything drawn over the main or install QR, text and logos outside the safe area, and empty text boxes. Warnings never block export. Clicking a warning selects the offending layer.
- **Layer menu** — right-click a layer row or the canvas, or use the `⋯` button, for Duplicate, Lock/Unlock, horizontal flip, front/back and one-step ordering, and Delete. From a layer row press `Shift+F10` to open the menu, then navigate with the arrow keys, Home/End and Escape.
- **Batch export** — one QR value per line (addresses, links or gift links, depending on the card type) rendered into a single ZIP of PNGs named `card-001.png`, `card-002.png`, … The document name in the top bar is used, sanitised, for export file names.

## Output contract

- Final trim size: A6 portrait, 105 × 148mm
- PNG: 1311 × 1819px with 300ppi `pHYs` metadata and 3mm bleed
- Print/PDF: browser printing outputs the 105 × 148mm trim area without the bleed
- QR: error correction level M with a four-module quiet zone on every side
- Multiple character, logo and text layers can be added or removed, moved, resized, rotated and reordered
- Payment/link/gift QR layers can be moved and resized proportionally, cannot be rotated, and stay between 420 and 900px
- Get Vizor cards can be moved and resized proportionally but cannot be rotated or deleted
- Each card has exactly one fixed, bottommost background layer that fills the canvas
- Character and logo layers share the unrestricted stacking order used by the QR and Get Vizor layers; users are responsible for preserving QR scannability in custom compositions
- The installation step is composed as a separate `Get Vizor` utility card rather than being baked into theme backgrounds
- The logo library includes Vizor, Vizorcat Classic (the mascot head, also the app icon), Zcash Coin, Zcash Mark, ZecHub, Cypherpunk, Tachyon, NEAR Intents, Keystone, Ledger, Keplr, CipherScan, Valar Group, and Zakura
- The editor UI uses Geist; display headings and installation copy use Zarathustra

## Source layout

There is no build step. `index.html` loads `vendor/qrcode.js` as a classic script and `src/main.js` as an ES module; every path is repository-relative.

```
src/catalog.js     assets, palettes, fonts, card types, layouts, templates (pure data)
src/scene.js       DOM-free scene model: layers, constraints, templates, history
src/qr-content.js  DOM-free ZIP-321 builder, address classification, link validation, batch parsing
src/zip.js         DOM-free store-only ZIP writer
src/snapping.js    DOM-free snap computation
src/render.js      canvas drawing, text measurement, logo tint, PNG export, print, thumbnails, batch
src/editor.js      canvas interaction: zoom, pointer transforms, snapping guides, shortcuts
src/panels.js      DOM binding for the rail, drawer, properties panel, layer list, menus, dialogs
src/main.js        bootstrap and render scheduler
tests/             node:test suites for the DOM-free modules
```

Run the tests from the repository root:

```bash
node --test
```

Store generation prompts, reference files, transformation notes, and hashes in the relevant asset type's `source/` directory. Preserve rejected generations and intermediate corrections under `archive/qr-card-studio-rejected/`.

Print-oriented backgrounds should leave generous paper areas genuinely unprinted. Differentiate themes with one or two spot colors and a small set of distinctive objects. Avoid full-page dark fills, washes, and heavy gradients in default backgrounds because they consume too much ink. A background should support the theme without competing visually with the QR or the Vizorcat.

## Static deployment

Deploy the entire repository root as the static hosting root. GitHub Pages can serve the root `index.html` and its relative asset paths directly.

`vendor/qrcode.js` is a pinned copy of `qrcode-generator`. See `vendor/LICENSE` and `THIRD_PARTY_NOTICES.md` for license details.

## Assets and privacy

Original character and background assets were created with OpenAI image-generation tools, then selected, edited, composited, and curated for this project. These assets are not represented as exclusively human-made or guaranteed to be unique. Third-party logos, fonts, and libraries remain subject to their respective owners and licenses; see `THIRD_PARTY_NOTICES.md` and the provenance records under each asset's `source/` directory.

The application runs entirely in the browser. It does not collect, store, or transmit QR contents, card designs, uploaded assets, or personal information, and it does not use accounts, analytics, tracking cookies, or browser storage. Gift-link fragments never leave the page and are never written to exported file names. OpenAI services are used only during asset production and are not called by the deployed application.

Links encoded in QR codes or opened from the application are governed by the privacy practices of their destination websites. A static hosting provider may process ordinary request information under its own privacy policy; this project does not receive or use that information.

## License

The source code and project documentation are available under the [MIT License](LICENSE).

Original character, background, and decorative image assets may be used as part of cards exported from this application for lawful event, onboarding, educational, and promotional use. This permission does not include redistributing, selling, or repackaging the raw image files as a standalone asset collection. Third-party logos, fonts, and vendored libraries remain subject to the terms listed in `THIRD_PARTY_NOTICES.md`.
