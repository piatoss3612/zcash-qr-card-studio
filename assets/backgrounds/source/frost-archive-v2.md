# Frost Archive background v2

- Role: A6 portrait background layer for the QR card editor
- Generator: built-in image generation tool, precise-object-edit mode
- Edit target: `../frost-archive-v1.png`
- Generated source: `/Users/rowan/.codex/generated_images/01a029bd-4e7a-7793-87fe-50854f11ce8b/exec-6c3cb3c5-f26b-4bf1-988b-f82e43aa6e1d.png`
- Preserved source: `imagegen/frost-archive-v2-original.png`
- Preserved source dimensions: 1065 × 1477px
- Preserved source SHA-256: `375d419d7271cb7e47ebc58f26e8f345f3907f1adfada7eee2af6ad1510ecdf9`
- Project asset: `../frost-archive-v2.png`
- Project asset dimensions: 1311 × 1819px
- Project asset SHA-256: `5d81644fbced809b96146cdf633b81a96d0be477daf51f8feca7129e8c58ceee`
- QA preview: `qa/frost-archive-v2-preview.png`
- QA preview SHA-256: `d60f1f60ac2892c394bc67660fa934e08389b0206df8afeb633b9e09620e86a3`
- Transform: Lanczos cover resize to 1311 × 1819px, center crop, metadata stripped

## Prompt

```text
Use case: precise-object-edit
Asset type: A6 portrait background layer for the Vizor QR Card Studio
Input image: the supplied Frost Archive background is the edit target.

Primary request: keep the same “ancient polar survey archive inside a pale glacier” concept and overall composition, but reduce its visual force by about 35–40 percent. Make the background feel quieter, lighter, and more spacious while retaining a distinct identity.

Change only these details:
- reduce the upper-left brass theodolite to a smaller, more tightly cropped corner accent with simpler linework and lower contrast
- narrow and soften the right glacier cutaway so it occupies no more than roughly the outer 16–18 percent of the page; use fewer internal cracks, strata, and ruler marks
- remove the large dark-blue survey case entirely
- reduce the ice-core equipment to one small low-contrast brass-and-glass sample near the lower-right edge
- replace the jagged crystalline ridge across the bottom with a shallow, soft wind-carved snowbank and only two or three restrained ice facets in the extreme bottom-right corner
- lighten cobalt blues toward pale powder blue and soften brass toward muted champagne
- simplify faint snow contour lines; keep only a few broad, barely visible contours near the perimeter
- preserve the distant ridge as a very thin quiet horizon

Hard invariants:
- preserve the bright pearl-white paper and large central frozen-map-table negative space
- the central payment-QR safe zone must remain completely unobstructed and high contrast
- the lower-left installation-copy region must remain nearly blank and unobstructed
- retain enough pale-blue edge separation near the lower-right for a white-and-silver character overlay
- background scenery only; do not add a cat, character, text, logo, QR code, border, UI, shadow panel, symbols, flags, or watermark
- keep portrait framing and low-ink print-friendly treatment
- do not redesign into a generic mountain postcard, blizzard, dark scene, aurora scene, or photorealistic landscape.

Style: polished restrained storybook concept art, tactile screen-print paper, limited flat colors, crisp but sparse linework, subtle pixel-art-adjacent stepped edges. The result should look intentionally quieter, not faded or unfinished.
```

## Local QA

- The upper-left theodolite remains recognizable at thumbnail size without dominating the page.
- The right glacier wall is narrower and materially lighter than v1.
- The dark survey case and jagged full-width bottom ridge are absent.
- The central payment-QR region and lower-left installation-copy region remain pale and unobstructed.
- Peripheral ice and brass accents preserve the Frost Archive identity at low print density.
- No character, text, QR code, logo, border, national or religious symbol, or recognizable franchise element is present.
