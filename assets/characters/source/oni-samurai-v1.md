# Oni Samurai v1

Superseded by the user-selected compact, lighter concept J in `oni-samurai-v2.md`. This file and its PNG remain as historical evidence; the live catalog uses v2.

- User accepted concept I and requested pairing it with the sakura background, Blossom Drift, on 2026-09-06. The user subsequently explicitly approved local background extraction to preserve the selected artwork.
- Live catalog id: `oni`; asset: `../oni-samurai-v1.png`; theme background: `blossom`.
- Approved source: `concepts/oni-samurai-20260906/concept-i.png`, SHA-256 `151f30277f8ef73c6ce71a41ce43b6da1b02f8e623af21738de0be65ba6563b8`.
- Generation history, exact built-in image_gen prompt and review: `concepts/oni-samurai-20260906/concept-i.md` and `concept-i-prompt.txt`. Earlier rejected variants remain in that concept directory.
- Exact approved Variant reference used in generation: `/Users/rowan/keplr-workspace/vizorcat/variants/one-eyed-boss/model-sheet.png`, SHA-256 `1017c652a883eda33f436f13c851cfe5d763ddf89a8b4abe971d7119bd615672`.
- Costume-specific original Samurai eye reference: `../samurai.png`, SHA-256 `1e6bada864d0be0d13034df48ba7fe0618350a131a65348b2c550e224390d18d`.
- Final PNG SHA-256: `ce6b96bdcafe385c0fffb78145d18a1bf4be62c1604e4988836c55a647b4c592`.

## Approved design

One-eyed charcoal cat with the familiar healed scar and compact angled amber eye, dark crimson sculpted oni half-mask, crescent kabuto, navy armor, short indigo jinbaori with gold wave hem and red lining, one upright naginata and a palm-up inviting forepaw. The current concept was accepted after explicit eye and paw corrections. The concept record's prior production-fidelity concerns remain historical review notes; registration preserves the user's selected design rather than claiming a newly redrawn Standard match. Four small pads are visible on the open paw; the fifth anatomical digit is not separately resolved from this angle.

## Local alpha preparation and QA

No creative regeneration or image resizing. ImageMagick 7 enabled alpha and flood-filled only the border-connected checkerboard with 12% fuzz, trimmed transparent margins and added 24px transparent padding. A one-pixel Diamond:1 erosion of the alpha mask removes the remaining light matte fringe without altering retained RGB artwork. The alpha mask was copied back to the image and the result encoded as PNG32/RGBA.

- PNG dimensions: 955 × 1372, genuine RGBA.
- Alpha bounds: (25, 25, 930, 1347); silhouette: 905 × 1322.
- `defaultScale`: 1.32. The user rejected the small 1.07 event rendering and again requested enlargement. This increases the current event rendering by 23.36% over 1.07, while preserving the PNG and its proportions.
- Required 500 × 650 reference display height: `min(500*1.32/955, 650*1.32/1372)*1322 = 826.73px`. Role-specific scale exception: the user requested enlarging this character after viewing its initial registration and identifying the long weapon as the cause of the small body. The taller weapon-inclusive silhouette is intentional. After the repeated enlargement request, body height from ears to feet (excluding the pole above the ears) is about 568.84px in the event card, while weapon-inclusive height is 699.54px.
- Current Centered box is 457 × 585: expected weapon-inclusive silhouette height 744.06px before integer rounding.
- Event card replacement now honors relative catalog scales rather than cancelling them during fitting. The scaled box is 620.4 × 726 at (664.8, 994); silhouette height 699.54px. The blade extends beside the QR into transparent space above the ears; the body starts below the QR. Repeated selection does not accumulate scale, and changing back restores the prior user-adjusted size.
- QA composite: `qa/oni-samurai-v1-alpha-qa.jpg`. Light, dark and magenta composites inspected serially. Silver blade and eye highlights remain; outer matte fringe is cleared. Tail/body gap, feet gap and body/weapon gap are transparent. Both ears, all limbs, entire tail, blade tip, pole butt and tassel are inside the frame. No duplicated limbs or props.
- Runtime code references only repository-local relative assets. The original Samurai retains its other theme pairings.

## Runtime verification

Verified in Safari Technology Preview at `http://127.0.0.1:4173/`: Blossom Drift selected, Oni Samurai rendered larger with clean transparency, whole naginata, both ears, feet and tail inside the card. The card was a payment preview with no address entered; no QR decoding claim is made. Screenshot: `qa/oni-samurai-v1-runtime.jpg` (1100px wide JPEG). A fresh verification tab briefly stalled at asset loading; after reload the user-visible preview rendered. Root cause of that transient browser state was not established.

All three event modes pair Blossom Drift with `oni`; their default enlarged character boxes do not intersect the payment QR or installation guidance, and preflight returns no warnings with a representative QR stub. Event-card and preflight checks pass 16/16, including the new repeated-selection/scale-restoration regression test. The additional scene suite run had one pre-existing failure: template count expects 14, while the pre-task catalog already contained 15 themes including First Journey. That unrelated expectation was left unchanged. Manual layout switching and actual QR scanning were not tested.


## Larger-body verification (1.32)

The user requested a substantially larger character after seeing the 1.07 version. The catalog now records two conservative opaque rectangles measured from the unchanged RGBA image: (812,25,118,235) and (25,260,886,1087), using x/y/width/height in the 955 × 1372 source. All 580201 nontransparent pixels were checked and fall inside those rectangles. Preflight maps these rectangles through the same centered contain geometry, horizontal flip and rotation as the renderer. It excludes only transparent space beside the tall blade; actual blade/body intrusion still raises a warning. Other assets retain their existing layer-box coverage checks.

Verified in Chrome on a real Link card encoding `https://vizor.cash`, with Get Vizor enabled and Blossom Drift selected. The enlarged body, complete pole, tail and feet fit visibly, both QR areas remain clear, and the UI reports `Print checks: Ready to print`. Screenshot: `qa/oni-samurai-v1-runtime-large.jpg`. Safari Technology Preview again stalled on first rendering during this verification; Chrome supplied the completed visual check. No scanner decoding test was run.

Focused event-card and preflight suites: 17/17 passed. Regression cases cover transparent-space exclusion and actual body, blade, flipped and rotated QR overlaps; all three default event modes pass preflight. The earlier unrelated scene-suite template-count mismatch remains unchanged. No additional image generation, rescaling of PNG pixels or asset-hash change occurred.
