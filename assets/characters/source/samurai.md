# Samurai source

- Finalized: 2026-09-01
- Tool path: built-in image generation, one precise gunbai edit, then deterministic local alpha extraction
- Use case: shogun-like event QR-card frame character directing attention toward the protected QR area
- Variant identity: `one-eyed-boss`
- Final file: `../samurai.png`
- Final dimensions: 1185 × 1299, RGBA
- Final SHA-256: `1e6bada864d0be0d13034df48ba7fe0618350a131a65348b2c550e224390d18d`
- Preserved live migration snapshot: `imagegen/samurai-live-v4-migration-snapshot.png`
- Migration snapshot SHA-256: `1e6bada864d0be0d13034df48ba7fe0618350a131a65348b2c550e224390d18d`
- Rejected white-gap v3 source: `/Users/rowan/.codex/generated_images/01a029bd-4e7a-7793-87fe-50854f11ce8b/exec-ffcaf2ee-29c9-4256-a492-e91a04e85b7f.png`
- Rejected static reuse: `archive/qr-card-studio-rejected/samurai-static-reuse-v1/`
- Clean pre-gunbai intermediate: `archive/qr-card-studio-rejected/samurai-presenting-no-gunbai-v2/`
- Rejected white-gap cutout: `archive/qr-card-studio-rejected/samurai-gunbai-white-gap-v3/`

## References

1. `variants/one-eyed-boss/model-sheet.png` — one-eyed face, black coat, compact proportions, and permanent identity
2. `themes/shogun-samurai/model-sheet.png` — ornate navy-and-crimson armor, kabuto, and material language
3. `themes/shogun-samurai/elements/hanbo.png` — fitted lower-face mask that leaves the eye line visible
4. `themes/shogun-samurai/elements/katana.png` — the single approved katana and scabbard design

## Final generation contract

```text
Create a compact Vizorcat pixel-art campaign pose for the one-eyed Boss in the approved Shogun Samurai theme. Equip the lower-face hanbo without covering the eyes. Keep exactly one katana fully seated in exactly one waist scabbard. The screen-left paw opens toward the empty QR area.

In the far screen-right paw, add one compact shogun command fan: black and deep-navy lacquer, a thin aged-gold outer rim and ribs, and a short wrapped handle. It must read as a gunbai-like command object, not a folding fan or a weapon. Do not add text, crests, religious symbols, QR blocks, frames, environments, or a second sword.
```

## Alpha extraction

The generation baked a checkerboard into RGB pixels. A deterministic local classifier separated the checker colors, kept the largest connected character component, filled only enclosed interior holes, pasted the result onto a fresh transparent canvas to zero hidden RGB, trimmed the bounds, and added 24 px transparent padding. No blur or edge expansion was applied.

## QA

- The one-eyed Boss identity, compact feline proportions, and sharp expression remain intact.
- The hanbo covers only the lower face and does not hide the eye line.
- There is exactly one katana, fully seated in exactly one scabbard.
- The gunbai remains on the outside shoulder while the opposite paw presents the QR area.
- Brand, light, and dark matte checks found no neutral-light or magenta fringe pixels on the alpha boundary.
- The character and gunbai stay outside the protected QR rectangle in the actual A6 card render.
