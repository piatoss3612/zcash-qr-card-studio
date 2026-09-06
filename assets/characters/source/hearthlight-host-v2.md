# Hearthlight Host v2 — approved readability refinement

- Approved by user: 2026-09-06, "오케이 교체하자".
- Live id: `hearthlight`; final file: `../hearthlight-host-v2.png`.
- Final SHA-256: `419bd0bcf69b37ffced808a7e5d999bae246121f81b75b8f79e50c9c4a519318` (matches asset manifest).
- PNG: 1100 x 1381, RGBA; genuine alpha.
- Alpha bounds: (24, 24, 1076, 1357); silhouette: 1052 x 1333.
- `defaultScale`: 0.90, unchanged.
- Centered 500 x 650 reference: `min(500 * 0.9 / 1100, 650 * 0.9 / 1381) * 1333 = 545.32px`; passes 510–590px scale gate.
- Current event box 470 x 550: expected silhouette height 530.88px.
- Approved generation source: `concepts/hearthlight-20260906/concept-a.png`.
- Prompt: `concepts/hearthlight-20260906/prompt.txt`.
- Approved geometry/pixel reference: `/Users/rowan/keplr-workspace/vizorcat/originals/vizorcat-standard/model-sheet.png`.
- Previous live file and record retained: `../hearthlight-host.png`, `hearthlight-host.md`.
- Alpha QA: `qa/hearthlight-host-v2-alpha-qa.jpg`.

## Alpha extraction and QA

No creative regeneration after approval. ImageMagick 7 enabled alpha and removed the 12%-fuzz border-connected checker field, plus the enclosed bow loops and gift/face pocket using original-coordinate seeds (325,583), (267,591), (154,570). Trimmed and added 24px transparent padding. No resizing, smoothing, blur or broad white-color deletion.

Light, dark and magenta matte checks confirm the ribbon holes and face/gift gap are clear. Cream gift paper, bright eye highlights, inner ears and all character pixels remain. Both ears, both front paws, feet, curved tail and whole parcel stay inside the frame. Runtime verification follows below.

## Runtime verification

Verified at `http://127.0.0.1:4173/` in Safari Technology Preview on 2026-09-06. Selected Hearthlight in the catalog and inspected the actual card canvas: the approved new coat/fur shading renders, the cream parcel remains whole, background is visible through the gift/face pocket, and ears, paws and tail remain within the card. Downscaled capture: `/tmp/hearthlight-v2-live-small.jpg`.
