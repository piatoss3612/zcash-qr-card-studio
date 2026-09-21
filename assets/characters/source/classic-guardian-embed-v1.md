# Classic Guardian — embed pose v1

- Generated: 2026-09-21. The user authorized replacing the Guardian or Samurai with a different pose or expression if needed ("과감하게 교체할 수 있도록").
- Why: the print Classic Guardian (`../classic-guardian.png`) was posed for print cards and raises its open paw toward screen-right. On embed cards the QR is on the screen-left of the companion in Signature, Compact and Portrait, so the gesture pointed away from the QR.
- Live catalog id: `classic` (label "Vizorcat") in `src/online/card-data.js` only; file `../classic-guardian-embed-v1.png`. The print catalog (`src/catalog.js`) keeps `../classic-guardian.png` unchanged.
- Final SHA-256: `5b62030d2ccc30912f50aefbe5f29ce86efb549c607eafad1ad22fbaaab9edd6`.
- Variant: `vizorcat-standard`; Theme: Classic Knight.
- Tool path: Codex CLI 0.155.1 under the `codex2` account, `codex2 exec -s read-only`, built-in image generation, one generation, no edits.
- Exact prompt: `concepts/classic-guardian-embed-20260921/concept-a-prompt.txt`.
- Original: `/Users/rowan/.codex-homes/codex2/generated_images/01a0c394-91f5-7a91-b596-f7c482a82cb9/exec-e4dd9054-ffa5-4f5b-bc5e-18497342d75b.png`, copied unchanged to `concepts/classic-guardian-embed-20260921/concept-a.png` (1122 × 1402 RGBA, SHA-256 `cd8ed1f8003a558e700114119dd2937fa2c85be959e7294305d67ae3766345f7`).

## References (attached in this order)

1. `../classic-guardian.png`, SHA-256 `c15f477731974f5aa4af731dcb020bbbce36a390f8b66341c03d8da0ec700237` — character and equipment.
2. `/Users/rowan/keplr-workspace/vizorcat/originals/vizorcat-standard/model-sheet.png`, SHA-256 `a3e66263b046c92391f691a7a3613f555faba67c05a6d91373990e624d84b303` — identity authority.
3. `/Users/rowan/keplr-workspace/vizorcat/themes/classic-knight/model-sheet.png`, SHA-256 `ce511a228db99725c370113835591a225da6498639715e794d096c2c19cc6f3f`.
4. `/Users/rowan/keplr-workspace/vizorcat/themes/classic-knight/elements/dagger.png`, SHA-256 `0ca5070f51d503c7b1c227bddedd1cff8c637ea38c15e70fc4b116bd91b4a562`.

## Gates

- Identity: same face grid, golden eyes, white blaze, ears, short limbs and proportions as the print Guardian; visor raised, whole face visible; happy open smile.
- Equipment: helmet, pauldrons, gauntlets, cream tabard, harness, round wooden shield with steel rim (now on the screen-right arm) and boots match the print Guardian. Exactly one dagger, fully sheathed: gold pommel, brown grip, gold guard, brown scabbard. Deviation: the scabbard's steel chape is pointed rather than the reference's rounded cap; no blade is shown.
- Pose: open paw raised on the screen-left side toward the QR.
- Alpha: the same deterministic local normalization as `airmail-courier-v1.md` (alpha < 24 → 0, ≥ 240 → 255, hidden RGB zeroed, trimmed, 24 px padding). The source already had real transparency. QA `qa/classic-guardian-embed-v1-alpha-qa.jpg` over #fbf8f1, #0f1124, #ff00ff: no fringe, checkerboard or green residue; ears, paws, tail, shield and boots inside the frame.
- Scale: PNG 1077 × 1270, alpha bounds (24,24)–(1053,1246), silhouette 1029 × 1222. Centered 500 × 650 at `defaultScale` 1.0: `min(500/1077, 650/1270) × 1222 = 567.3px` (510–590px). Online Signature box 130 × 162 at 100%: alpha height 147.5px (print Guardian 151.8px).
