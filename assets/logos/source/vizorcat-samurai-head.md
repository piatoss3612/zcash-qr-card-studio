# Vizorcat Samurai head mark

- Finalized: 2026-09-05
- Tool path: built-in image generation with three local authoring references, followed by deterministic checkerboard-color extraction and ImageMagick alpha and canvas normalization
- Tool/model: `image_gen.imagegen` (called through `tools.image_gen__imagegen`); the built-in tool did not expose its underlying model identifier
- Normalization tool: ImageMagick 7.1.1-47 Q16-HDRI; Pillow 12.2.0 and in-memory Python flood fills were used for checkerboard extraction, measurements, component checks, and QA composites
- Use case: Vizorcat logo mark for a card sticker and a QR centre emblem
- Variant identity: `one-eyed-boss`
- Theme: `shogun-samurai`
- Generation attempts: 1 of a maximum of 2 for this frontal revision
- Generation source: `/Users/rowan/.codex/generated_images/01a071cf-4b81-7383-9b91-24809d48f49c/exec-82816d57-ba1d-4a19-9017-5d06ef4cace1.png`
- Generation source SHA-256: `2c6d9ce4b0e9af60398935436ddaa94123e9dd040f591010baf66a8cb1d80c80`

**Revision:** Replaces the previous three-quarter head mark, SHA-256 `a2ce8cbeb57e766dc6e709e5e67f97673cc648673ac6ff92d42f9ab2d3a08bff`, because the coordinator requested a strictly frontal, symmetrical head-on view instead of three-quarter. The new composition centres the crescent, nose, and hanbo on the vertical axis, mirror-matches the ears, and directs the single golden eye toward the viewer. The permanent closed eye and scar remain the one-eyed Boss identity's intentional asymmetry.

## References

1. `/Users/rowan/keplr-workspace/zcash-qr-card-studio/assets/characters/samurai.png` — exact Samurai identity and pixel-art rendering reference, including the fitted hanbo
2. `/Users/rowan/keplr-workspace/vizorcat/variants/one-eyed-boss/model-sheet.png` — approved one-eyed Boss face, screen-right golden eye, screen-left scarred closed eye, ear, muzzle, outline, and pixel-density authority
3. `/Users/rowan/keplr-workspace/vizorcat/themes/shogun-samurai/model-sheet.png` — approved kabuto helmet, gold crescent crest, hanbo lower-face mask, and material authority

All three input images were passed in this order using `referenced_image_paths`. Every requested path existed; no fallback substitutions were made. The Classic head mark and its source record remained process and visual references and were not added to the three generator inputs.

## Generation prompt

```text
Use case: logo-brand
Asset type: scalable square mascot logo mark for a card sticker and a QR centre emblem
Input images: Image 1 is the exact Samurai Vizorcat identity and pixel-art rendering reference; Image 2 is the authoritative one-eyed Boss face, single eye and scarred closed-eye side, ear, muzzle, outline, and pixel-density reference; Image 3 is the authoritative Shogun Samurai kabuto helmet, hanbo lower-face mask, and materials reference. Use the frontal views for construction; do not copy a turned pose from any reference.
Primary request: Generate one strictly frontal, symmetrical, head-on head-only logo mark of the Samurai Vizorcat. Preserve exactly the same black cat one-eyed Boss identity, rounded softly squared cheeks, single large round golden-yellow eye on screen-right, permanently closed eye with its vertical scar on screen-left as shown in the references, small pink triangular nose, short muzzle, stern cat expression, both triangular ears, and the exact deep-navy Shogun Samurai kabuto helmet with its gold crescent crest. The single golden eye must look directly at the viewer: center its round black pupil within the golden iris, with no sideways gaze. Fit the approved navy, crimson-edged, gold-trimmed hanbo around only the lower face as shown in Image 1 and the hanbo element in Image 3; keep the eye line, scar, nose, and central muzzle visible. The closed eye is scarred, not a second golden eye or an invented eyepatch. No mechanical visor.
Composition/framing: strictly frontal orthographic-style head-on view, zero yaw, zero tilt, zero three-quarter turn. Build a mirror-symmetrical head, helmet, ears, and hanbo silhouette around the canvas vertical centreline. Both ears must be mirror-matched in height, width, angle, and distance from the centreline. Both cheeks, helmet side flaps, and hanbo buckles must have equal apparent size with no perspective foreshortening. Align the midpoint of the gold crescent, helmet central ornament, nose, mouth centre, hanbo centre ornament, and curved chin/neck cutoff on the exact same vertical axis. The intentional one-eyed face and scar remain asymmetric; do not duplicate the golden eye to make the face symmetrical. Center and optically balance the head in a square canvas; kabuto, crescent crest, both ears, full cheeks, hanbo, chin, and a clean curved neck cutoff all fully inside the frame; generous even transparent padding, approximately 18–22% around the silhouette. The bottom must end cleanly at the neck directly beneath the hanbo. Strong compact silhouette readable at 16px.
Style/medium: match the approved chunky pixel-art-adjacent mascot rendering exactly: stepped dark outline, controlled pixel clusters, limited black/navy/crimson/gold palette with the reference's small pink nose and ear accents, three tonal levels, clean hard silhouette. Do not modernize, vectorize, smooth, or add detail.
Scene/backdrop: genuinely transparent RGBA background.
Constraints: exactly one strictly frontal cat head; kabuto helmet with centered crescent crest, both symmetrical ears, one-eyed face looking straight at the viewer, centered fitted hanbo covering only the lower face, chin, and short neck cutoff only. Preserve the one-eyed Boss identity, eye-side orientation, and helmet and hanbo geometry. Head geometry is bilaterally symmetrical; the permanent scar and closed eye are the identity exception. Helmet side flaps belong to the head; no shoulder or torso armor plates. No text, no logo lettering, no watermark.
Avoid: any three-quarter view, profile view, head rotation, sideways gaze, off-centre nose, off-centre crescent, tilted helmet, mismatched ears, one cheek closer to the camera, perspective asymmetry, shoulders, torso, chest, shoulder armor, body armor plates, paws, katana, gunbai, command fan, shield, sword, dagger, scabbard, body fragments, cropped ears, cropped helmet, cropped crest, frame contact, circular badge, border, glow, drop shadow, shadow, checkerboard pattern, colored background, halo, stray pixels, mechanical visor, extra accessories.
```

No retry or edit prompt was used for this revision.

## Alpha extraction and normalization

The built-in result was a 1254 × 1254, 8-bit RGB PNG with a checkerboard baked into its pixels and no alpha channel. The deterministic extraction procedure in `assets/characters/source/samurai.md` was therefore applied before the head-mark normalization. The original generator cache file was left unchanged.

1. Classified light neutral checker colors using `min(R,G,B) >= 180 && max(R,G,B) - min(R,G,B) <= 24`. This identified 646,337 background-colored pixels. The remaining candidate foreground had one 926,178-pixel component and one isolated pixel; kept only the largest 8-connected component.
2. Flood-filled the exterior background using 4-neighbour connectivity and filled only enclosed interior holes, restoring 1,513 pixels. This preserved enclosed white highlights, including the eye highlight, while leaving the exterior checkerboard removed. Copied the retained original RGB pixels onto a fresh transparent RGBA canvas, leaving hidden RGB at zero. No blur or edge expansion was applied.
3. Measured the extracted silhouette at 1184 × 1130, offset +35 +56 in the generated image. Following the Samurai source procedure, trimmed it and added 24px transparent padding in memory, producing a 1232 × 1178 RGBA intermediate with silhouette bounds `1184x1130+24+24`. No intermediate file was saved.
4. Measured the padded intermediate using ImageMagick `-fuzz 1% -trim`, cropped to `1184x1130+24+24`, reset the virtual canvas, and resized to 800px wide with Lanczos filtering (800 × 764). Composited it at the centre of a fresh 1024 × 1024 transparent canvas.
5. Thresholded the final alpha at 50% to remove resampling ringing and produce a hard-edged silhouette. Reset the RGB values of fully transparent pixels to zero with `-background black -alpha background`. The exported PNG has only alpha values 0 and 255, and zero fully transparent pixels with nonzero RGB.
6. Counted the normalized foreground components using both 4-neighbour and 8-neighbour flood fills: exactly one component under either definition, containing 423,763 opaque pixels.

The following normalization command was executed with an argument list. The in-memory extracted and padded RGBA PNG was supplied through standard input; `PNG32:-` output was captured in memory before the final file was overwritten:

```sh
magick -size 1024x1024 xc:none \
  \( PNG32:- -crop 1184x1130+24+24 +repage \
     -filter Lanczos -resize 800x \) \
  -gravity center -compose Over -composite \
  -channel A -threshold 50% +channel \
  -background black -alpha background -depth 8 PNG32:-
```

The checkerboard extraction is the explicitly permitted Samurai fallback. The subsequent 1024 × 1024 head-mark normalization follows the same Classic process. The separate 256 × 256 favicon derivative in the Classic record remains outside this task's scope.

## Final files

- `assets/logos/vizorcat-samurai-head.png`: 1024 × 1024, 8-bit RGBA (PNG color type 6), alpha silhouette 800 × 764 at +112 +130, SHA-256 `2619070ec9f04e79b8817122001038bedd7de3e29824f7670a9998a07139d5fd`
- `assets/logos/source/vizorcat-samurai-head.md`: revision note, generation provenance, exact prompt, extraction and normalization measurements, and QA record

All bounding boxes use pixel coordinates with inclusive left/top and exclusive right/bottom:

- Generated RGB source: no alpha bounding box; the checkerboard occupied the background
- Extracted silhouette in the original generated canvas, before normalization: `[35, 56, 1219, 1186)`
- Pre-normalization crop in the 24px-padded intermediate: `[24, 24, 1208, 1154)`
- Final hard-alpha silhouette: `[112, 130, 912, 894)`

The final silhouette has transparent margins of 112px left, 112px right, 130px top, and 130px bottom, resulting from the required 800px crop width and centred 1024px canvas.

## QA

- Created and visually inspected a 320 × 320 Lanczos downscale composited over solid white, dark `#141818`, and magenta `#FF00FF`. The three composites were displayed together in an in-memory QA sheet.
- No residual checkerboard, trapped background fragments, light halo, or stray edge pixels were visible on any matte. The white eye highlight and gold highlights remained intact.
- The final alpha mask contains exactly one connected foreground component under both 4-neighbour and 8-neighbour connectivity. Hidden RGB is zero in every fully transparent pixel.
- Confirmed a strictly frontal head-on composition with no three-quarter turn: the ears match in apparent size and angle, both cheeks and helmet side flaps have equal apparent size, and the crescent centre, nose, mouth, hanbo centre ornament, and chin align on the vertical axis.
- As a supporting geometric check, the final alpha silhouette and its horizontal mirror have 99.54% intersection-over-union. The permanent scar, closed eye, single golden eye, and material highlights are intentionally not duplicated by mirroring.
- The screen-right golden eye looks toward the viewer; the screen-left scarred closed eye preserves the one-eyed Boss identity. The hanbo follows the lower cheeks and chin while leaving the eye line, nose, and central muzzle visible.
- Both ears, the complete crescent-crested kabuto, helmet side flaps, cheeks, hanbo, chin, and clean curved neck cutoff remain inside the frame with transparent padding. No shoulders, torso armor, paws, katana, gunbai, other weapons, or body fragments are present.
- Created and visually inspected a 16 × 16 Lanczos downscale on all three mattes, at its actual size and enlarged 10× with nearest-neighbour sampling. The paired ears, navy helmet with gold crest, and face remain distinguishable; fine scar and mask ornament details naturally merge at this size.
- QA images and extraction intermediates were kept in memory. Only the two Samurai head deliverables were updated; the existing local changes to README, editor/catalog, HTML, and CSS were preserved. No test files were changed.
