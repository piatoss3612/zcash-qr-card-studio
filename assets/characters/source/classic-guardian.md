# Classic Guardian source

- Finalized: 2026-09-01
- Tool path: built-in image generation, one precise weapon edit, then deterministic local alpha extraction
- Use case: event QR-card frame character presenting the protected QR area
- Variant identity: `vizorcat-standard`
- Final file: `../classic-guardian.png`
- Final dimensions: 906 × 1106, RGBA
- Final SHA-256: `c15f477731974f5aa4af731dcb020bbbce36a390f8b66341c03d8da0ec700237`
- Final generation source: `/Users/rowan/.codex/generated_images/01a029bd-4e7a-7793-87fe-50854f11ce8b/exec-19974e64-f593-4867-8e3f-c039f1140155.png`
- Rejected static reuse: `archive/qr-card-studio-rejected/classic-guardian-static-reuse-v1/`

## References

1. `originals/vizorcat-standard/model-sheet.png` — approved face, proportions, and pixel-art rendering language
2. `themes/classic-knight/model-sheet.png` — armor silhouette, colors, shield, and material language
3. `themes/classic-knight/elements/dagger.png` — exact dagger and scabbard design used by the final correction

## Final generation contract

```text
Create a compact Vizorcat pixel-art campaign pose rather than reusing an existing action frame. Keep the Classic Knight armor and round shield consistent with the approved theme. Turn the face and raised open paw toward the empty QR area so the character reads as a friendly guide.

The hip equipment must exactly match the approved dagger element: exactly one short dagger fully seated in exactly one brown scabbard, with one gold pommel, brown grip, and gold guard. No blade may be visible. Do not add a second handle, second scabbard, sword, spear, text, logo, QR block, frame, or background.
```

## Alpha extraction

The generation baked a checkerboard into RGB pixels. A deterministic local classifier separated the checker colors, kept the largest connected character component, filled only enclosed interior holes, pasted the result onto a fresh transparent canvas to zero hidden RGB, trimmed the bounds, and added 24 px transparent padding. No blur or edge expansion was applied.

## QA

- The approved Classic Knight dagger design is preserved and appears only once, fully sheathed.
- The shield and armor remain visually consistent with the theme references.
- The open paw points toward the QR area without entering its protected rectangle.
- Brand, light, and dark matte checks found no neutral-light or magenta fringe pixels on the alpha boundary.
- The full right paw remains inside the actual A6 card render.
