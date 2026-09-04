# Astral Wayfinder source v2

- Finalized: 2026-09-01
- Tool path: built-in image edit, then deterministic local flood-fill alpha extraction
- Use case: friendly celestial navigator campaign pose with stronger equipment silhouette
- Variant identity: `lithe-scout`
- Final file: `../astral-wayfinder-v2.png`
- Final dimensions: 1168 × 1239, RGBA
- Final SHA-256: `6242514b0211fc7cd94a3741605b2b918a94d00ea6cae73bf48489a5ce558574`
- Final generation source: `/Users/rowan/.codex/generated_images/01a029bd-4e7a-7793-87fe-50854f11ce8b/exec-7aa07341-b007-475c-8402-4a7cbd441c58.png`
- Final generation source SHA-256: `540ea0f84941f6c9189f5fffb3452187a01b85e55573ced210d96c06516a5017`
- Previous accepted version: `../astral-wayfinder.png`
- Rejected sharp-face edit: `archive/qr-card-studio-rejected/astral-wayfinder-sharp-face-v2/`

## References

1. `assets/characters/astral-wayfinder.png` — Lithe Scout identity and approved friendly face
2. `originals/vizorcat-standard/model-sheet.png` — authoritative Vizorcat facial anatomy, expression grammar, proportions, and pixel-art language

## Final generation contract

```text
Preserve the orange tabby, exactly three forehead stripes, cream muzzle and paw tips, large round green eyes, tiny pink triangular nose, short whiskers, round cheeks, and small friendly cat mouth. Do not add eyebrows, narrow the eyes, create a smirk, or make the face aggressive.

Strengthen only the role and action: one stubby paw raises one brass astrolabe beside the head, the other round paw presents the QR area, one foot takes a small jaunty step, and the tail balances the pose. Keep the open-face aubergine hood, raised sea-glass visor, short shoulder flap, and one map pouch. Use authentic hard-edged Vizorcat sprite art on a genuinely transparent background.
```

## Alpha extraction and QA

The generated source baked a light checkerboard into opaque RGB pixels. A 12 percent border-connected flood fill removed the exterior checker field. Ten enclosed checker regions inside and around the astrolabe were cleared individually. The image was trimmed and given 24px transparent padding without blur or edge expansion.

- The face remains round, warm, and consistent with the Vizorcat Standard.
- Both eyes remain fully visible; there are no eyebrows, fangs, or sharp eye corners.
- Exactly one brass astrolabe is present and all of its open rings are transparent.
- The full character uses compact feline anatomy with round paws and no fingers.
- Magenta-matte inspection found no checkerboard regions or white cutout blocks outside the character.
