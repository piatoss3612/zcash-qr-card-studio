# Oni Samurai v2 — compact proportions and brighter original palette

- User selected concept J for live replacement, after rejecting the elongated proportions and dark coloring of v1. The existing authorization for local alpha extraction continues to apply.
- Catalog id: `oni`; asset: `../oni-samurai-v2.png`; paired background: `blossom` / Blossom Drift.
- Approved concept: `concepts/oni-samurai-20260906/concept-j.png`, SHA-256 `705adcadf23b4b380dbb05be89f47b693ccb79891aab57e7fef0dba152fb267f`.
- Built-in image_gen prompt and generation references: `concepts/oni-samurai-20260906/concept-j-prompt.txt` and `concept-j.md`.
- Exact approved Variant reference: `/Users/rowan/keplr-workspace/vizorcat/variants/one-eyed-boss/model-sheet.png`, SHA-256 `1017c652a883eda33f436f13c851cfe5d763ddf89a8b4abe971d7119bd615672`.
- Original Samurai costume/proportion/color reference: `../samurai.png`, SHA-256 `1e6bada864d0be0d13034df48ba7fe0618350a131a65348b2c550e224390d18d`.
- Final PNG SHA-256: `4b1dc1239536ffde5091adde9a038afed059f1f08542d51381e540d127782fbd`.

## Preparation and scale

ImageMagick 7 enabled alpha and removed only the border-connected checkerboard at 12% fuzz. Transparent margins were trimmed and 24px padding added. A one-pixel Diamond:1 erosion of the alpha mask removed the residual matte fringe. Retained RGB artwork was not recolored, resized or regenerated.

- PNG: 1035 × 1289, genuine RGBA.
- Alpha bounds: (25,25,1010,1264); silhouette: 985 × 1239.
- Body excluding the pole above the ears: y=251..1264, height 1013px.
- `defaultScale`: 1.2. After viewing J at 1.32, the user found the compact body visually too large. The display scale was reduced by 9.09%, without changing the approved proportions or colors.
- Required 500 × 650 reference: `min(500*1.2/1035,650*1.2/1289)*1239 = 718.26px` including the weapon. The role-specific polearm scale exception continues from the user's repeated enlargement requests documented in v1.
- Current Centered box (457 × 585): full silhouette 656.49px, body 536.74px before rounding.
- Event box (470 × 550) at this scale: 564 × 660 at (693,1060); full silhouette 634.40px, body 518.68px before rounding. The initial J registration used 1.32 and 570.55px body height; the current 1.2 setting responds to the subsequent perceived-size correction.
- Conservative opaque regions for preflight, in source pixels: (889,25,121,226) and (25,251,957,1013), using x/y/width/height. These replace v1's measurements.

## Local QA

`qa/oni-samurai-v2-alpha-qa.jpg` was inspected over light, dark and magenta backgrounds. The shorter torso/legs and lighter charcoal fur/navy armor remain as in approved J. Complete ears, round paws, feet, tail and naginata are contained. Blade highlights remain opaque; outside silhouette and gaps by the tail, feet, arm and pole are transparent. No duplicated limbs or props. The selected J paw angle and small facial/equipment differences remain as approved; no further creative edits were introduced.

## Verification

Focused event-card and preflight suites passed 17/17 with the new asset metadata. All three event modes pair Blossom Drift with `oni` and pass preflight with representative QR data. Every one of the 598350 nontransparent pixels is contained by the recorded coverage rectangles. Final file, manifest and this source record have matching SHA-256; the static character selector references v2.

Verified in Safari Technology Preview at `http://127.0.0.1:4173/?preview=oni-132` after refresh: Blossom Drift selected and the compact J character visibly replaces v1. Short torso/legs, lighter face and navy armor, complete naginata, tail and feet are visible with clean transparency. The blade stands to the right of the reserved payment QR area; no character pixels intrude on it. Screenshot: `qa/oni-samurai-v2-runtime.jpg` (1100px JPEG). This was a payment preview without an address; actual QR decoding was not tested. Chrome verification attempts were interrupted by concurrent UI changes, so the completed visual evidence is from Safari. No unrelated browser data was edited.

The previous v1 PNG and records remain as history. Runtime and catalog reference v2 only. No additional creative edits, commit or deployment were performed.


## Display-size refinement after J replacement

Only the catalog scale changed from 1.32 to 1.2; the v2 PNG, color, anatomy, alpha and coverage metadata are unchanged. Safari's refreshed Blossom Drift preview visibly shows the smaller footprint with complete ears, tail, paws and naginata and no QR-area intrusion. Screenshot: `qa/oni-samurai-v2-runtime-scale120.jpg`. Focused suites passed 17/17 and all three default event modes pass preflight. The collision test now uses a fixed 620.4 × 726 test transform so its intentional overlap cases do not vary whenever the catalog's presentation scale is adjusted. The first test run exposed that coupling; no overlap checks were disabled to accommodate it.
