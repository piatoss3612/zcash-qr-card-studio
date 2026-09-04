# Astral Wayfinder source

- Finalized: 2026-09-01
- Tool path: built-in image generation, then deterministic local alpha extraction
- Use case: compact-proportion redesign in the approved pixel-art language
- Variant identity: `lithe-scout`
- Final file: `../astral-wayfinder.png`
- Final SHA-256: `3dd31052001179f4045436546d9060b2c230929380091ed119da2ac628fb65b9`
- Final generation source: `/Users/rowan/.codex/generated_images/01a029bd-4e7a-7793-87fe-50854f11ce8b/exec-8772b339-0add-4331-920c-a3ddb2dbeb02.png`
- Rejected elongated source: `archive/qr-card-studio-rejected/astral-wayfinder-elongated-v1/`
- Rejected gray-standard reuse: `archive/qr-card-studio-rejected/astral-wayfinder-og-reuse-v1/`

## References

1. `variants/lithe-scout/model-sheet.png` — coat, three forehead stripes, green eyes, proportions, and permanent identity
2. `assets/characters/orbital-rescue-ranger.png` — approved compact campaign-character proportions and pixel density
3. `themes/classic-knight/actions/visor-toggle/fit/open.png` — original Vizorcat pixel-art rendering language

## Final generation contract

```text
Preserve the orange tabby Lithe Scout identity, exactly three forehead stripes, cream muzzle and paw tips, green eyes, pink nose, aubergine and indigo celestial-wayfinder theme, raised sea-glass visor, compact brass astrolabe, lifted foot, screen-right presentation gesture, and balancing tail.

Rebuild the anatomy as a compact Vizorcat: giant round head, very short barrel torso, stubby limbs, oversized round cat paws, no human joints or fingers, and an approximately 2.15-head-height near-square silhouette. Replace the long ornate fantasy coat with a short observatory hood, cropped plain jacket, one belt, one satchel, and short boots. Remove most buckles, trim, panels, jewelry, and decorative seams.

Render as authentic sprite art with a visible square pixel grid, hard aliased staircase contours, dark pixel outlines, limited four-to-six-shade ramps, and hand-placed clusters. Avoid smooth 3D, painterly rendering, vector curves, glossy toy materials, generic mobile-RPG styling, religious or occult symbols, text, logos, QR elements, frames, environments, shadows, or spell effects.
```

## Alpha extraction

The final generation baked a checkerboard into RGB pixels. No network retry was made. The same local hard-edge silhouette process used for Orbital removed the background, trimmed the bounds, and added 24 px transparent padding without blurring the pixel grid.

## QA

- Orange tabby fur, three forehead stripes, green eyes, and cream muzzle remain Lithe Scout-specific.
- The long human-like body, separated fingers, ornate coat, and excess trim are gone.
- The astrolabe and raised visor remain legible without introducing religious or franchise marks.
- Pixel stair-steps and clustered shading remain visible in the actual QR-card canvas render.
- The presenting paw remains outside the protected QR area.
- Final PNG: 991 × 1099, RGBA, transparent corners.
