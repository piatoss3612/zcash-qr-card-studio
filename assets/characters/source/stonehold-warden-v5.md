# Stonehold Warden v5 — approved readability refinement

- Approved by user: 2026-09-06, "수정안 그대로 넣자".
- Live id: `stonehold`; file: `../stonehold-warden-v5.png`.
- Final SHA-256: `f5fe6ee431871d103cbb963799b64676c62ea48dc30f089c1d1e32728443f98c` (matches asset manifest).
- PNG: 1148 x 1307, RGBA; true alpha.
- Alpha bounds: (24, 24, 1124, 1283); silhouette: 1100 x 1259.
- `defaultScale`: 1.0. Centered reference: 500 x 650.
- Expected centered silhouette height: `min(500 / 1148, 650 / 1307) * 1259 = 548.34px`, within 510–590px gate.
- Current event box: 470 x 550; expected silhouette height: 515.44px. This smaller event placement is separate from the Centered gate.
- Approved generation source: `concepts/stonehold-20260906/concept-a.png`.
- Prompt: `concepts/stonehold-20260906/prompt.txt`.
- Approved geometry/pixel reference: `/Users/rowan/keplr-workspace/vizorcat/originals/vizorcat-standard/model-sheet.png`.
- Old source and asset retained: `stonehold-warden.md` and `../stonehold-warden.png`.
- QA: `qa/stonehold-warden-v5-alpha-qa.jpg`.

## Alpha extraction

No creative redraw was used after approval. ImageMagick 7 enabled alpha, flood-filled the border-connected checkerboard with 12% color fuzz and cleared enclosed checker regions from original-coordinate seeds (285,980), (820,855), (845,846), (858,840). Trimmed and added 24px transparent padding. No resizing, blur, color remapping or broad white deletion.

## Visual QA

Light, dark and magenta mattes confirm the hammer/body gap and tiny cape/tail pockets are transparent. White paws, cream muzzle, eye highlights and ear interiors remain intact. Both biological ears, all paws, short tail, cape and complete hammer remain inside frame. The larger beard clusters and simpler metal shading preserve the approved candidate. Runtime verification is recorded separately below.

## Runtime verification

Verified in Safari Technology Preview at `http://127.0.0.1:4173/` on 2026-09-06: selected Stonehold in the Vizorcat catalog and inspected the actual card canvas. New beard clusters and armor render correctly; the hammer/body gap shows the card background and all anatomy stays visible. Downscaled capture: `/tmp/stonehold-v5-live-small.jpg`.
