# Commons Guide v2 — Visor Up

## Status

- Approved live asset.
- Registered in the QR Card Studio character catalog as `commons` / `Commons Guide`.
- The final PNG has a genuine alpha channel and passed a light/dark background edge check.

## Files

- Input v1: `imagegen/commons-guide-v1-original.png`
- Edited v2: `imagegen/commons-guide-v2-visor-up-original.png`
- Rejected extraction v1: `imagegen/commons-guide-v2-background-extraction-v1-rejected.png`
- Cyan-key intermediate v1: `imagegen/commons-guide-v2-cyan-key-v1.png`
- Rejected extraction v2: `imagegen/commons-guide-v2-background-extraction-v2-rejected.png`
- Live asset: `../commons-guide.png`
- Final QA: `qa/commons-guide-alpha-check-v3.png`

## SHA-256

- Input v1: `2774507bbf86b7f5f2e40de5b4b1e6446923ee2947ea0602a7d9cf1a56c66f60`
- Edited v2: `a62b880d7d56b6b10f54e43e3902b97ad60be7a0a8b05b7ebb84b5a1594b0617`
- Rejected extraction v1: `7ed2b52401ff95127544a8f6b80c1b84709d123824d8a140b620df508bb6d424`
- Cyan-key intermediate v1: `82b254a552c63180698db52906dc86f47de3a334953f0af4675ceb874151426e`
- Rejected extraction v2: `32d8a5cbcc7308d571543e60f37cf1923ad6785064ae7045b2fea59383debc04`
- Live asset: `fbd1a0bc037eacded8d26a3b18476803279f123f1b12f3b047b2a8e00c86fbdb`

## Generation

- Tool: built-in `image_gen`
- Mode: `precise-object-edit`
- Output size: `1087x1447`
- Output color space: `sRGB`
- Output alpha: none; checkerboard is baked into the pixels

## Prompt

```text
Use case: precise-object-edit
Asset type: transparent pixel-art character sticker for the Vizor QR Card Studio
Primary request: Edit only the ambiguous red headgear so it unmistakably reads as a functional Vizor device, not a hat brim or headband.
Input image: the supplied Brazilian Shorthair Vizorcat is the edit target.
Subject: Preserve this exact friendly brown Brazilian Shorthair cat, its face, large green eyes, proportions, expression, cream travel jacket, black crossbody satchel, walking/welcoming pose, tail, paws, palette, and crisp pixel-art rendering.
Headgear edit: replace the existing broad red brim-like band with a clearly engineered two-part device. Keep a slim dark graphite mounting band around the forehead. Attach a separate translucent ruby-crimson eye shield to visible compact circular hinges at both temples. The shield is currently rotated UP and rests above the eyebrows, following the forehead curve; show a small physical gap and dark underside between mounting band and shield so the parts read as separate layers. Its lower edge should have a recognizable eye-shield contour, and the hinges must make it visually obvious that it can rotate down over the eyes. Keep both eyes fully visible and unobstructed in the raised state. Add only restrained glossy highlights consistent with the existing Vizor visual language.
Style/medium: polished chunky pixel art, consistent pixel grid and black outline weight throughout; friendly original Vizorcat character, not realistic, not anime.
Composition/framing: preserve the full-body composition, scale, pose, margins, and transparent canvas.
Constraints: change only the headgear; preserve character identity and every non-headgear element; genuine transparent background; clean opaque silhouette edges; no floor shadow; no backdrop; no text; no logo; no watermark.
Avoid: ordinary hat brim, baseball cap, sun visor, goggles, eyewear sitting over the eyes, evil expression, extra accessories, altered anatomy, elongated body, soft painterly rendering, checkerboard baked into the image.
```

## Review note

The red shield is visually separated from the dark mounting band, and both temple hinges communicate a rotate-down mechanism. The eyes remain unobstructed in the raised state.

## Background extraction attempt 1 — rejected

- Tool: built-in `image_gen`
- Mode: `background-extraction`
- Output size: `1086x1448`
- Output channels: `sRGB`, 3 channels
- Output opacity: fully opaque (`opaque=True`)
- Rejection reason: the checkerboard remained baked into the image and no alpha channel was produced.

```text
Use case: background-extraction
Asset type: transparent pixel-art character sticker for the Vizor QR Card Studio
Input image: Image 1 is the sole edit target.
Primary request: Remove only the baked light-gray-and-white checkerboard background and replace it with genuine transparent alpha.
Subject: Preserve the Brazilian Shorthair Vizorcat exactly as supplied, including every character pixel, outline, facial feature, green eyes, raised articulated ruby visor, graphite mounting band and temple hinges, cream jacket, red trim, satchel, paws, tail, pose, scale, and canvas placement.
Edge treatment: produce a clean tight cutout around the existing black pixel-art silhouette. Preserve intentional white fur and white highlight pixels inside the silhouette. Keep hard pixel-art edges with no antialias blur, gray fringe, white halo, feathering, shadow, or regenerated details.
Composition/framing: preserve the exact original 1087x1447 portrait composition and margins.
Constraints: background only must change; character design and pixels must not change; output must contain a real alpha channel with fully transparent pixels outside the character; no checkerboard pattern baked into pixels; no floor shadow; no text; no logo; no watermark.
Avoid: redrawing, restyling, recoloring, smoothing, cropping, moving, resizing, changing the visor, changing expression or anatomy, deleting white fur or glossy highlight pixels.
```

## Cyan-key replacement v1 — accepted intermediate

- Tool: built-in `image_gen`
- Mode: `precise-object-edit`
- Output size: `1087x1447`
- Output channels: `sRGB`, 3 channels
- Output opacity: fully opaque (`opaque=True`), as intended for this intermediate
- Review: the checkerboard was removed and the character remains visually intact. The cyan is not mathematically uniform; sampled corner pixels ranged approximately from `rgb(2,225,254)` to `rgb(12,219,249)`. This is acceptable only as a high-contrast input for the next background-extraction round, not as a live asset.

```text
Use case: precise-object-edit
Asset type: intermediate chroma-key source for a transparent pixel-art character sticker
Input image: Image 1 is the sole edit target.
Primary request: Replace only the baked light-gray-and-white checkerboard background with one perfectly flat, uniform, fully opaque bright cyan background color (#00E5FF).
Subject: Preserve the Brazilian Shorthair Vizorcat exactly as supplied, including every character pixel, black outline, face, green eyes, expression, raised articulated ruby visor, graphite mounting band, temple hinges, cream jacket, red trim, satchel, paws, tail, pose, scale, and canvas placement.
Background: solid #00E5FF from edge to edge outside the character; no texture, checker pattern, gradient, vignette, lighting, noise, objects, floor, or shadow.
Edge treatment: preserve the existing hard pixel-art silhouette without halo, feathering, smoothing, or color spill. Do not replace any intentional white fur or white highlight pixels inside the character.
Composition/framing: preserve the exact portrait composition and margins.
Constraints: change only the background; keep all character content unchanged; no transparency is required in this intermediate; no text; no logo; no watermark.
Avoid: redrawing, restyling, recoloring, smoothing, cropping, moving, resizing, changing the visor, changing expression or anatomy, adding scenery, retaining any checkerboard squares.
```

## Background extraction attempt 2 — rejected

- Tool: built-in `image_gen`
- Mode: `background-extraction`
- Input: accepted cyan-key intermediate v1
- Output size: `1087x1447`
- Output channels: `sRGB`, 3 channels
- Output opacity: fully opaque (`opaque=True`)
- Rejection reason: the cyan was removed, but the tool again rendered an opaque checkerboard instead of an alpha channel.
- Decision: do not spend another network round repeating the same built-in extraction. The cyan-key intermediate is the preferred deterministic extraction source.

```text
Use case: background-extraction
Asset type: final transparent pixel-art character sticker for the Vizor QR Card Studio
Input image: Image 1 is the sole edit target and contains a Brazilian Shorthair Vizorcat on a bright cyan chroma-key background.
Primary request: Remove every cyan background pixel outside the character and replace it with genuine transparent alpha.
Subject invariants: Preserve the complete Brazilian Shorthair Vizorcat exactly as supplied—every character pixel, hard black outline, green eyes, friendly expression, raised articulated ruby-crimson visor, graphite mounting band, both temple hinges, cream jacket, red trim, satchel, paws, tail, pose, scale, and canvas position.
Edge treatment: create a clean, tight alpha cutout immediately outside the existing black silhouette. Preserve thin black whiskers and all black outline pixels. Preserve intentional cyan-free highlights, white fur, and glossy visor highlights. No colored fringe, cyan spill, white halo, feathering, blur, smoothing, or shadow.
Composition/framing: retain the same 1087x1447 portrait canvas and margins.
Constraints: background pixels must have alpha 0; character pixels must remain opaque; output must be RGBA PNG with real transparency; change the background only; no checkerboard drawn into the image; no floor shadow; no text; no logo; no watermark.
Avoid: redrawing, restyling, recoloring, cropping, moving, resizing, changing anatomy, expression, clothing, satchel, or visor design; do not add any background color or pattern.
```

## Deterministic local extraction — accepted final

- Input: cyan-key intermediate v1
- Tool: ImageMagick 7
- Method: border-connected flood-fill from `#00E5FF`, alpha enabled, `60%` fuzz, original canvas preserved
- Output size: `1087x1447`
- Output channels: `sRGBA`, 4 channels
- Output opacity: mixed (`opaque=False`), with transparent corners and opaque character pixels
- Rejected local candidates: `imagegen/commons-guide-cutout-v1-cyan-fringe-rejected.png`, `imagegen/commons-guide-cutout-v2-cyan-fringe-rejected.png`
- QA: final cutout composited at 50% scale on `#f7f3ec` and `#16191d`; no visible cyan fringe, white fur loss, or missing whiskers in `qa/commons-guide-alpha-check-v3.png`

## Editor default scale

- The shared character box is `500x650`, but this portrait-oriented source filled its height more aggressively than the other live characters.
- `defaultScale: 0.91` gives new Commons Guide layers a `455x592` box, keeps the original bottom edge anchored, and reduces the measured visible silhouette height from about `610px` to about `555px`.
- Existing character defaults are unchanged.
