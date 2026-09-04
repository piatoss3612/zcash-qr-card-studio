# Siberian Snow Surveyor source v2

- Finalized: 2026-09-03
- Status: registered in the QR Card Studio character catalog as `snow` / `Snow Surveyor`
- Tool path: one built-in precise image edit, then deterministic local border-connected alpha extraction
- Use case: movable QR Card Studio character sticker
- Character identity: the same Siberian-cat Vizorcat-family character as v1
- Final file: `../siberian-snow-surveyor-v2.png`
- Final dimensions: 1146 × 1234px, RGBA
- Final SHA-256: `3ecc4f38f60e5b6542175b879e073570fb850f1b8f8b84e93a72864cc80b291c`
- Editor default scale: `1.0`, reduced from v1's `1.12`
- Preserved edit source: `imagegen/siberian-snow-surveyor-v2-original.png`
- Edit-source SHA-256: `a14b9122fb609e783364e0364e32db8f9b0fbac6ae33918ab6a06cbb19896139`
- Built-in edit source: `/Users/rowan/.codex/generated_images/01a029bd-4e7a-7793-87fe-50854f11ce8b/exec-6565c124-2270-4d30-b621-6e8cabfc6c03.png`
- Alpha QA: `qa/siberian-snow-surveyor-v2-alpha-qa.png`
- Alpha QA SHA-256: `eed93f94ecfb38533e967cb44910498eb4e22632e1c7f5b2497b465d9675f1c0`
- Superseded v1: `../../../../../archive/qr-card-studio-rejected/snow-surveyor-v1-superseded/`

## References

- Image 1: the previous live Siberian Snow Surveyor, used as the sole character identity and edit target
- Image 2: `originals/vizorcat-standard/turnaround/front.png`, used only for canonical eye, proportion, paw, outline, pixel-grid, and flat-shading language

## Final edit prompt

```text
Use case: precise-object-edit
Asset type: reworked transparent movable character sticker for the Vizor QR Card Studio
Input images:
- Image 1 is the sole character edit target and identity source.
- Image 2 is an authoritative supporting reference only for canonical Vizorcat eye construction, head-to-body ratio, paw construction, pixel grid, outline, and flat shading language.

Primary request: Rework the existing Siberian Snow Surveyor so the action clearly reads as surveying terrain rather than generically waving, while preserving the same individual cat, winter identity, and one-lantern equipment count.

Preserve exactly from Image 1:
- the same Siberian-cat individual: silver-blue tabby forehead and cheek markings, white muzzle, compact white chest ruff, white paw tips, warm golden eyes, pink nose, tufted pointed ears, friendly calm expression
- the same normal compact Vizorcat head-to-body ratio and short mascot anatomy
- exactly one full bushy silver-gray striped tail
- pearl-white, obsidian, and vivid Vizor-crimson expedition palette
- exactly one compact crimson-and-brass lantern
- exactly one small charcoal survey backpack
- no weapon
- one isolated full-body character and no background

Change only the role action, headgear mechanics, and silhouette organization:
- replace the ski-goggle-like forehead piece with one clearly articulated ice-blue survey visor mounted to a slim obsidian-and-crimson helmet band with visible side hinges and ear openings
- keep that single visor raised above both eyes, tilted upward on its hinges; it must read as a movable Vizor device rather than goggles, eyewear, or a hat brim
- move the currently presenting empty paw to touch exactly one side hinge as if the cat has just lifted the visor to inspect the route
- move the lantern-holding paw slightly forward and upward so its light leads the direction of travel; keep exactly one lantern
- retain a gentle three-quarter walking step and turn the gaze slightly toward the route ahead, with both pupils aligned
- reorganize the full tail behind the lower body in a compact upward curve so it remains visible but no longer sprawls far sideways
- shorten and simplify the parka hem and boots so the small Vizorcat body remains readable
- keep the backpack compact and close to the back
- use larger, cleaner pixel clusters and reduced micro-detail so the result shares Image 2's Vizorcat design language

Canonical face constraints:
- very large matched dark pupils filling most of the eye openings, narrow gold iris rims, one small matched highlight in each pupil
- no visible white sclera, no independently aimed pupils, no cross-eyed gaze
- preserve the tiny triangular nose and short curved mouth
- the hinge-touching paw must remain outside the eye silhouettes and never cover the face

Composition:
- exactly one character, centered, with all ear tufts, raised visor, paws, lantern, backpack, compact tail, and feet fully inside the canvas
- strong compact sticker silhouette suitable beside an A6 payment QR
- no cast shadow, ground, snow, scenery, weather effects, frame, text, logo, QR code, watermark, or extra object

Style:
- authentic crisp chunky 2D Vizorcat pixel art: stepped hard edges, strong dark outline, limited flat cel shading, large deliberate pixel clusters
- no photorealism, 3D, smooth vector art, anime, painterly fur, glossy gradients, scratches, grime, or battle damage

Background:
- genuine transparent alpha preferred; do not intentionally draw a checkerboard
- if alpha cannot be emitted, use one simple border-connected near-white exterior field with no enclosed background pockets so deterministic extraction can remove it without changing the character.
```

## Alpha extraction

The edit rendered a pale checker field into opaque RGB pixels. ImageMagick enabled alpha, removed only the exterior field connected to the top-left border at 12% color fuzz, trimmed transparent bounds, added 24px transparent padding, and stripped metadata. No network retry, global light-color deletion, blur, edge expansion, or creative redraw was used.

## QA

- Light, dark, and magenta matte inspection shows no exterior checker blocks or obvious fringe.
- The white coat, muzzle, paws, ear tufts, visor highlights, and lantern light remain opaque.
- The open region inside the upward tail curl is correctly transparent (`alpha=0`), while the adjacent white tail fur remains opaque (`alpha=1`).
- Both eyes retain matched dark pupils, narrow gold iris rims, matched highlights, and a shared forward-route gaze.
- Exactly one hinged raised visor, one lantern, one compact backpack, and one full tail remain.
- The hinge-touching paw stays outside the eyes and the lantern leads the walking direction.
- No weapon, scene, floor shadow, snow effect, text, logo, QR, frame, or watermark is present.
