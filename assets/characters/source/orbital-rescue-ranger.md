# Orbital Rescue Ranger source

- Finalized: 2026-09-01
- Tool path: built-in image generation, then deterministic local alpha extraction
- Use case: compact-proportion edit followed by strict pixel-art style transfer
- Variant identity: `moonpoint-watcher`
- Final file: `../orbital-rescue-ranger.png`
- Final SHA-256: `29ce194a4dc573536b74a88ac3d55a7f9fe06855cac5820d7aeca1f8dc2c5507`
- Final generation source: `/Users/rowan/.codex/generated_images/01a029bd-4e7a-7793-87fe-50854f11ce8b/exec-89d8716e-4be0-4264-a2b7-1c1ca2b06f0c.png`
- Rejected elongated source: `archive/qr-card-studio-rejected/orbital-rescue-ranger-elongated-v1/`
- Rejected smooth 3D correction: `archive/qr-card-studio-rejected/orbital-rescue-ranger-smooth-3d-v2/`

## References

1. `variants/moonpoint-watcher/model-sheet.png` — coat, face, eyes, and permanent identity
2. `themes/classic-knight/actions/visor-toggle/fit/open.png` — approved Vizorcat pixel-art rendering language
3. The compact smooth-3D correction — anatomy and pose only; its rendering finish was explicitly rejected

## Final generation contract

```text
Preserve the compact corrected anatomy, pose, costume silhouette, Moonpoint identity, rescue-suit palette, raised visor, backpack, waving paw, presenting paw, bent floating legs, and feline tail.

Redraw as authentic Vizorcat sprite art: a clearly visible square pixel grid, deliberate one- and two-pixel staircase contours, hard aliased edges, crisp dark pixel outlines, hand-placed clusters, limited four-to-six-shade color ramps, and simple sprite-readable lighting. Work on an approximately 192–256 px logical sprite canvas and upscale nearest-neighbor. Do not apply a pixelation filter to a smooth render.

Keep the giant round head, very short barrel torso, stubby limbs, oversized round cat paws, short boots, and compact near-square floating silhouette. Do not introduce human fingers, human leg anatomy, smooth 3D surfaces, painterly shading, vector curves, glossy toy materials, text, logos, QR elements, frames, environments, or shadows.
```

## Alpha extraction

The final generation baked a checkerboard into RGB pixels. No network retry was made. A local mask kept the largest non-background component, applied a small morphological close, filled character-interior holes, preserved hard pixel edges without blur, trimmed the transparent bounds, and added 24 px transparent padding.

## QA

- The cream coat, chocolate mask and extremities, blue eyes, and pink nose remain Moonpoint-specific.
- Total anatomy reads as a compact cat mascot rather than a human astronaut body.
- Both hands are round cat paws with paw pads; there are no fingers.
- Pixel stair-steps and clustered shading remain visible in the actual QR-card canvas render.
- The character stays outside the protected QR area.
- Final PNG: 1044 × 1288, RGBA, transparent corners.
