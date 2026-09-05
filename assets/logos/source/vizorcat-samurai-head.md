# Vizorcat Samurai head mark

- Finalized: 2026-09-05
- Tool path: built-in image generation with three local authoring references, followed by deterministic ImageMagick alpha and canvas normalization
- Tool/model: `image_gen.imagegen` (called through `tools.image_gen__imagegen`); the built-in tool did not expose its underlying model identifier
- Normalization tool: ImageMagick 7.1.1-47 Q16-HDRI; Pillow 12.2.0 was used for in-memory measurements, component checks, and QA composites
- Use case: Vizorcat logo mark for a card sticker and a QR centre emblem
- Variant identity: `one-eyed-boss`
- Theme: `shogun-samurai`
- Generation attempts: 1 of a maximum of 2
- Generation source: `/Users/rowan/.codex/generated_images/01a071cf-4b81-7383-9b91-24809d48f49c/exec-0650f534-9321-4588-855c-20284debcc3a.png`
- Generation source SHA-256: `ae227bd958a9bc792b762cead058baec7dbf494c7a06a9f04b0bbf5c4e2be2b1`

## References

1. `/Users/rowan/keplr-workspace/zcash-qr-card-studio/assets/characters/samurai.png` — exact Samurai identity and pixel-art rendering reference, including the fitted hanbo
2. `/Users/rowan/keplr-workspace/vizorcat/variants/one-eyed-boss/model-sheet.png` — approved one-eyed Boss face, screen-right golden eye, screen-left scarred closed eye, ear, muzzle, outline, and pixel-density authority
3. `/Users/rowan/keplr-workspace/vizorcat/themes/shogun-samurai/model-sheet.png` — approved kabuto helmet, gold crescent crest, hanbo lower-face mask, and material authority

All three input images were passed in this order using `referenced_image_paths`. Every requested path existed; no fallback substitutions were made. The Classic head mark and its source record were inspected as process and visual references, but were not added to the three generator inputs.

## Generation prompt

```text
Use case: logo-brand
Asset type: scalable square mascot logo mark for a card sticker and a QR centre emblem
Input images: Image 1 is the exact Samurai Vizorcat identity and pixel-art rendering reference; Image 2 is the authoritative one-eyed Boss face, single eye and scarred closed-eye side, ear, muzzle, outline, and pixel-density reference; Image 3 is the authoritative Shogun Samurai kabuto helmet, hanbo lower-face mask, and materials reference.
Primary request: Generate one head-only logo mark of the Samurai Vizorcat. Preserve exactly the same black cat one-eyed Boss identity, rounded softly squared cheeks, single large round golden-yellow eye on screen-right, permanently closed eye with its vertical scar on screen-left as shown in the references, small pink triangular nose, short muzzle, stern cat expression, both triangular ears, and the exact deep-navy Shogun Samurai kabuto helmet with its gold crescent crest. Fit the approved navy, crimson-edged, gold-trimmed hanbo around only the lower face as shown in Image 1 and the hanbo element in Image 3; keep the eye line, scar, nose, and central muzzle visible. The closed eye is scarred, not a second golden eye or an invented eyepatch. No mechanical visor.
Composition/framing: front-facing or only a very slight three-quarter view; centered and optically balanced in a square canvas; kabuto, crescent crest, both ears, full cheeks, hanbo, chin, and a clean curved neck cutoff all fully inside the frame; generous even transparent padding, approximately 18–22% around the silhouette. The bottom must end cleanly at the neck directly beneath the hanbo. Strong compact silhouette readable at 16px.
Style/medium: match the approved chunky pixel-art-adjacent mascot rendering exactly: stepped dark outline, controlled pixel clusters, limited black/navy/crimson/gold palette with the reference's small pink nose and ear accents, three tonal levels, clean hard silhouette. Do not modernize, vectorize, smooth, or add detail.
Scene/backdrop: genuinely transparent RGBA background.
Constraints: exactly one cat head; kabuto helmet with crest, both ears, one-eyed face, fitted hanbo covering only the lower face, chin, and short neck cutoff only. Preserve the one-eyed Boss identity, eye-side orientation, and helmet and hanbo geometry. Helmet side flaps belong to the head; no shoulder or torso armor plates. No text, no logo lettering, no watermark.
Avoid: shoulders, torso, chest, shoulder armor, body armor plates, paws, katana, gunbai, command fan, shield, sword, dagger, scabbard, body fragments, cropped ears, cropped helmet, cropped crest, frame contact, circular badge, border, glow, drop shadow, shadow, checkerboard pattern, colored background, halo, stray pixels, mechanical visor, extra accessories.
```

No retry or edit prompt was used.

## Alpha extraction and normalization

The built-in result was a 1254 × 1254, 8-bit RGBA PNG with genuine transparency, so the checkerboard-color extraction procedure in `assets/characters/source/samurai.md` was not required. The original generator cache file was left unchanged.

1. Measured the non-trivial silhouette using ImageMagick `-fuzz 1% -trim`: 1186 × 1111, offset +34 +70. This measured crop excludes negligible generator alpha specks; it does not threshold or expand the artwork before resampling. For completeness, the raw alpha-greater-than-zero bounds were 1234 × 1247 at +0 +7, and the raw 50% alpha bounds were 1180 × 1105 at +37 +73.
2. Cropped to `1186x1111+34+70`, reset the virtual canvas, resized to 800px wide with Lanczos filtering (800 × 749), and composited it at the centre of a fresh 1024 × 1024 transparent canvas.
3. Thresholded the final alpha at 50% to remove subpixel ringing and produce a hard-edged silhouette. Reset the RGB values of fully transparent pixels to zero with `-background black -alpha background`. The exported PNG has only alpha values 0 and 255, and zero fully transparent pixels with nonzero RGB.
4. Counted the final foreground components using both 4-neighbour and 8-neighbour flood fills: exactly one component under either definition, containing 412,588 opaque pixels. No fragment removal, hole filling, blur, or edge expansion was needed.

The normalization command was executed with an argument list; `PNG32:-` was captured in memory and written only to the final PNG path:

```sh
magick -size 1024x1024 xc:none \
  \( "/Users/rowan/.codex/generated_images/01a071cf-4b81-7383-9b91-24809d48f49c/exec-0650f534-9321-4588-855c-20284debcc3a.png" \
     -crop 1186x1111+34+70 +repage -filter Lanczos -resize 800x \) \
  -gravity center -compose Over -composite \
  -channel A -threshold 50% +channel \
  -background black -alpha background -depth 8 PNG32:-
```

There was no deviation from the Classic 1024 × 1024 head-mark normalization pipeline. The separate 256 × 256 favicon derivative described in the Classic record was intentionally omitted because this task requests only the Samurai head PNG and this source record.

## Final files

- `assets/logos/vizorcat-samurai-head.png`: 1024 × 1024, 8-bit RGBA (PNG color type 6), alpha silhouette 796 × 745 at +114 +139, SHA-256 `a2ce8cbeb57e766dc6e709e5e67f97673cc648673ac6ff92d42f9ab2d3a08bff`
- `assets/logos/source/vizorcat-samurai-head.md`: generation provenance, exact prompt, normalization measurements, and QA record

All bounding boxes use pixel coordinates with inclusive left/top and exclusive right/bottom:

- Raw nonzero alpha: `[0, 7, 1234, 1254)`
- Pre-normalization crop: `[34, 70, 1220, 1181)`
- Raw alpha at the 50% cutoff: `[37, 73, 1217, 1178)`
- Final hard-alpha silhouette: `[114, 139, 910, 884)`

The final silhouette has transparent margins of 114px left, 114px right, 139px top, and 140px bottom, resulting from the required 800px crop width and centred 1024px canvas.

## QA

- Created and visually inspected a 320 × 320 Lanczos downscale composited over solid white, dark `#141818`, and magenta `#FF00FF`. The three composites were displayed together in a QA sheet.
- No residual edge pixels, halo, baked checkerboard, or trapped background fragments were visible on any matte.
- The final alpha mask contains exactly one connected foreground component under both 4-neighbour and 8-neighbour connectivity. Hidden RGB is zero in every fully transparent pixel.
- Both ears, the complete crescent-crested kabuto, helmet side flaps, cheeks, hanbo, chin, and clean curved neck cutoff remain inside the frame with transparent padding.
- The screen-right golden eye and screen-left scarred closed eye match the one-eyed Boss reference. The hanbo follows the lower cheeks and chin while leaving the eye line, nose, and central muzzle visible.
- No shoulders, torso armor, paws, katana, gunbai, other weapons, or body fragments are present.
- Created and visually inspected a 16 × 16 Lanczos downscale on all three mattes, at its actual size and enlarged 10× with nearest-neighbour sampling. The paired ears, navy helmet with gold crest, and face remain distinguishable; fine scar and mask ornament details naturally merge at this size.
- QA images were kept in memory and displayed directly; no QA images, scripts, favicon derivatives, or registration files were added to the repository. No editor, catalog, HTML, CSS, or test files were changed.

