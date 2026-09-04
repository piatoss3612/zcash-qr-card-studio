# Crimson Grove Ranger source v4

- Finalized: 2026-09-04
- Tool path: two rejected built-in generations, one approved built-in generation, one targeted built-in edit, then deterministic local alpha extraction
- Use case: movable QR Card Studio character sticker presenting an invitation toward protected QR space
- Variant identity: `fluffy-warden`
- Authoritative reference: `../../../../vizorcat/variants/fluffy-warden/model-sheet.png`
- Authoritative reference SHA-256: `8d63947b6fa5a8bb1651de8edbcad9043591e0cea6d05e2870bc75793ec52d2c`
- Final file: `../crimson-grove-ranger.png`
- Final dimensions: 1158 × 1283px, RGBA
- Alpha silhouette: 1110 × 1235px
- Final SHA-256: `30c6c342f0a59f4a1d1d4540fbedf547a9c4230d056c3f00e9c28dec57b75d83`
- Preserved edit source: `imagegen/crimson-grove-ranger-v4-original.png`
- Edit source dimensions: 1198 × 1313px, opaque RGB
- Edit source SHA-256: `ac865f5a7e41fc376438b56c0cdd7a2ad40f7e84d9110885ad39c122a25c3309`
- Final edit target: `../../../archive/qr-card-studio-rejected/crimson-grove-ranger-rework-2026-09-04-rejected/lively-pose-front-paw-ambiguous-alpha.png`
- Final edit-target SHA-256: `e5238542f06c9b29d32f1d3ba9c4e4d1001ef248a28167a907f1f2ff9a42abac`
- Alpha QA: `qa/crimson-grove-ranger-alpha-qa-v4.png`
- Alpha QA SHA-256: `962d04827ec5b6dbc95ff4658924e070c0697d26bff56398bc0989a91bc222d7`
- Superseded v2: `../../../archive/qr-card-studio-rejected/crimson-grove-ranger-v2-superseded/`
- Rejected rework candidates: `../../../archive/qr-card-studio-rejected/crimson-grove-ranger-rework-2026-09-04-rejected/`

## Editor scale

- Catalog `defaultScale`: 1.08
- Centered reference box: 500 × 650px
- Expected rendered silhouette height: `min(500 × 1.08 / 1158, 650 × 1.08 / 1283) × 1235 = 575.91px`
- Gate result: pass; expected height is within the 510–590px target range

## Final edit prompt

```text
Use case: precise-object-edit
Asset type: transparent movable Vizorcat character sticker for Zcash QR Card Studio
Input images: Image 1 is the sole edit target and already-approved lively Crimson Grove Ranger composition. Image 2 is an identity and anatomy reference only.
Primary request: Make exactly two corrections to Image 1 and preserve everything else.
Correction 1 — free paw pose: Move only the paw that is NOT holding the invitation—the free screen-left paw currently hanging beside the belt pouch—behind the character's lower back in a small, polite hands-behind-back gesture. It must clearly read as the arm being tucked behind the torso, not as a paw entering a pocket, gripping the pouch, resting on the belt, or missing. Keep the shoulder natural and the short rounded Vizorcat limb anatomy from Image 2. The free paw may be mostly hidden behind the cape and torso, with at most a small rounded paw edge visible behind the body. Do not add another arm or paw. Leave the belt and closed pouch visible and unobstructed.
Correction 2 — negative space cleanup: Remove any stray white, pale checkerboard, white wedge, or accidental light shape in the negative space between the stowed bow/bowstring and the head, hood, or cape. That entire gap must be genuine transparent alpha except for the single dark bowstring itself. Do not remove or redraw the bow, bowstring, ear, hood, cape, fur, or quiver.
Preserve exactly: the same Fluffy Warden identity and compact Vizorcat proportions; the same face, bright confident smile, moss-green eyes, head tilt, tabby markings, ear tufts, hood, scalloped capelet, leaf clasp, tunic, belt, pouch, tail, lifted front foot, body pose, palette, pixel grid, outline weight, and framing; exactly one blank invitation in the raised screen-right paw; exactly one stowed bow with one bowstring; exactly one capped quiver with no visible arrows. Keep the lively storybook princess-ranger feeling unchanged.
Style/medium: preserve the existing authentic chunky low-resolution pixel art with crisp stepped outlines, limited flat palette, and consistent coarse pixel clusters. No new microtexture, smooth painting, 3D rendering, antialias-heavy edges, or anatomy drift.
Background: genuine transparent RGBA only, including every enclosed negative-space region. No checkerboard baked into RGB, no white matte, no ground, no cast shadow.
Constraints: no text, logo, QR code, scenery, extra props, extra limbs, human hands, fingers, duplicated equipment, crown, gown, visor, mask, or watermark. Change only the free-paw pose and the stray white negative-space remnant.
```

## Alpha extraction

The final edit baked a pale checker field into opaque RGB pixels. A deterministic local pass classified neutral pixels with every RGB channel at least 205 and channel spread no greater than 24. It cleared the eight-connected component reaching the canvas border plus the checker component enclosed by the bow, bowstring, and hood from source coordinate `(243,490)`. Only the largest remaining connected foreground component was retained to remove isolated edge flecks. The result was trimmed to its alpha bounds, padded with 24 transparent pixels on every side, and saved as RGBA without blur, outline expansion, or recoloring.

## QA

- The round adult-neutral face, moss-green eyes, silver tabby markings, short ruff, compact torso, short limbs, rounded paws, and bushy tail remain consistent with Fluffy Warden.
- The head tilt, raised invitation, lifted front foot, swept tail, scalloped capelet, and leaf clasp preserve the lively storybook princess-ranger character without a crown or gown.
- The free paw now turns behind the lower back and no longer appears inserted into or resting on the belt pouch.
- Exactly one blank invitation, one stowed bow with one bowstring, one capped quiver, and one closed belt pouch are present.
- The entire space between the bow, bowstring, and head is transparent. No baked checkerboard, exterior white matte, isolated edge flecks, ground, or cast shadow remains.
- Downscaled light, dark, and magenta matte inspection passed, followed by an enlarged magenta inspection of the bow–head gap.
