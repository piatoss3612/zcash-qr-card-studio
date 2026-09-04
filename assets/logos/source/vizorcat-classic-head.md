# Vizorcat Classic head mark

- Finalized: 2026-09-03
- Tool path: built-in image generation with three local authoring references, followed by deterministic ImageMagick alpha and canvas normalization
- Use case: Vizorcat logo mark for favicon, 512px app icon, and movable card sticker
- Variant identity: `vizorcat-standard` version 1
- Theme: `classic-knight`
- Generation source: `/Users/rowan/.codex/generated_images/01a06738-c4e8-7ba3-ab7b-3fd5ea5fba8c/exec-83b6fda6-8c4b-4c0b-8f00-facd40e69d6c.png`
- Generation source SHA-256: `6a79441bb18d0fbb7875f846a9e49ae9abafd0b4318963541a37a0646ec1e650`

## References

1. `/Users/rowan/keplr-workspace/zcash-qr-card-studio/assets/characters/classic-guardian.png` — exact Classic Guardian identity and rendering reference
2. `/Users/rowan/keplr-workspace/vizorcat/originals/vizorcat-standard/model-sheet.png` — approved face, ear, eye, muzzle, outline, and pixel-density authority
3. `/Users/rowan/keplr-workspace/vizorcat/themes/classic-knight/model-sheet.png` — approved open-face helmet design and material authority

## Generation prompt

```text
Use case: logo-brand
Asset type: scalable square mascot logo mark for favicon, 512px app icon, and card sticker
Input images: Image 1 is the exact Classic Guardian identity and pixel-art rendering reference; Image 2 is the authoritative Vizorcat Standard face, ear, eye, muzzle, outline, and pixel-density reference; Image 3 is the authoritative Classic Knight helmet design and materials reference.
Primary request: Generate one head-only logo mark of the Classic Guardian Vizorcat. Preserve exactly the same grey-and-white cat identity, rounded softly squared cheeks, large round golden-yellow eyes, small pink triangular nose, short white muzzle, simple happy cat mouth, cheek marks, both triangular ears, and the exact open-face Classic Knight helmet from the references. No mechanical visor.
Composition/framing: front-facing or only a very slight three-quarter view; centered and optically balanced in a square canvas; helmet, both ears, full cheeks, chin, and a clean curved neck cutoff all fully inside the frame; generous even transparent padding, approximately 18–22% around the silhouette. The bottom must end cleanly at the neck. Strong compact silhouette readable at 16px.
Style/medium: match the approved chunky pixel-art-adjacent mascot rendering exactly: stepped dark outline, controlled pixel clusters, limited grey/white/pink/gold palette, three tonal levels, clean hard silhouette. Do not modernize, vectorize, smooth, or add detail.
Scene/backdrop: genuinely transparent RGBA background.
Constraints: exactly one cat head; helmet, both ears, face, chin, and short neck cutoff only. Preserve identity and helmet geometry. No text, no logo lettering, no watermark.
Avoid: shoulders, torso, chest, paws, shield, sword, dagger, scabbard, body fragments, cropped ears, cropped helmet, frame contact, circular badge, border, glow, shadow, checkerboard pattern, colored background, halo, stray pixels, mechanical visor, face guard, extra accessories.
```

No retry or edit prompt was used.

## Alpha extraction and normalization

The built-in result was a 1254 × 1254 RGBA PNG with genuine transparency, so no chroma-key extraction was required.

1. Measured the non-trivial alpha silhouette at 1009 × 975, offset +124 +110 in the generated canvas.
2. Cropped that silhouette, resized it to 800px wide with Lanczos filtering, and centred it on a fresh 1024 × 1024 transparent canvas.
3. Thresholded the final alpha at 50% to remove subpixel ringing and produce one connected, hard-edged pixel-art silhouette. Fully transparent pixels were reset against a transparent background to avoid hidden matte colors.
4. Downscaled the same normalized mark to 256 × 256 with Lanczos filtering for the favicon, then applied the same 50% alpha threshold.

## Final files

- `assets/logos/vizorcat-classic-head.png`: 1024 × 1024, 8-bit RGBA, alpha silhouette 795 × 769 at +114 +127, SHA-256 `40fcb92ccf090b3e8756c0ec8172cddd9a4d569d1bea4759a4e38337e09023ef`
- `assets/vizorcat-icon.png`: 256 × 256, 8-bit RGBA, alpha silhouette 199 × 192 at +28 +32, SHA-256 `6079625675124bb0af1f0462d3f53755272c7309dedeb61aff3d38b04b830dcc`

## QA

- Composited a 320px downscale over white, dark `#141818`, and magenta `#FF00FF` backgrounds.
- No residual edge pixels, halo, baked checkerboard, or trapped background fragments were visible on any matte.
- The final alpha mask contains one connected foreground component in both deliverables.
- Both ears, the full helmet, side fasteners, cheeks, chin, and neck cutoff remain inside the frame with transparent padding.
- No shoulders, paws, shield, weapon, torso, or other body fragments are present.
- A 16 × 16 downscale retains the ear–helmet–face silhouette and the central white facial blaze.
