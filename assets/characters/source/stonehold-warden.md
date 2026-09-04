# Stonehold Warden source

- Finalized: 2026-09-03
- Status: registered in the QR Card Studio character catalog as `stonehold` / `Stonehold Warden`
- Tool path: built-in raster edits followed by deterministic local border-connected alpha extraction
- Use case: movable QR Card Studio character sticker
- Character identity: a naturally short-tailed Manx-inspired Vizorcat-family character with restrained Celtic-fantasy equipment
- Final file: `../stonehold-warden.png`
- Final dimensions: 1061 x 1221px, RGBA
- Trimmed alpha silhouette: 1013 x 1173px with 24px transparent padding
- Final SHA-256: `39712cf0d211489c45c15ecc3bb4826757876899c2719e50b7de8163dc041dd9`
- Editor default scale: `1.0`, bottom-anchored by the shared character placement logic
- Expected centered-layout silhouette height: approximately 553px (`min(500 / 1061, 650 / 1221) x 1173`)
- Preserved approved edit source: `imagegen/stonehold-warden-v4-ear-fit-original.png`
- Approved edit-source SHA-256: `b159ae8de84dff7423254c4219de6a508ec4d56414d462cb9aa4fd39402fd508`
- Built-in approved source: `/Users/rowan/.codex/generated_images/01a029bd-4e7a-7793-87fe-50854f11ce8b/exec-9f288c2f-e76a-430b-a928-46ad6d57dcdc.png`
- Alpha QA: `qa/stonehold-warden-alpha-qa-v4.png`
- Alpha QA SHA-256: `e36509abe936fb7f5bbe634353ed2a1bbfe278c3c670bafc784201055d1bf701`

## Approved design

- The role is a compact Manx-inspired stonehold guardian rather than a generic dwarf or Viking.
- The naturally short rounded tail is intact and has no injury or amputation cue.
- The helmet is a practical hornless open-face iron skullcap. Restrained Celtic character comes from the narrow knotwork brow trim rather than national symbols or oversized ornament.
- Both biological ears emerge through fitted tapered helmet openings; the iron rims visibly wrap their roots so the ears do not float behind the helmet.
- The heavy moustache and two-braid beard provide the requested seasoned, weighty expression while the large yellow eyes remain readable.
- Exactly one grounded square-headed hammer is present. There is no shield, sword, horn, visor plate, goggles, faceguard, or extra weapon.

## Iteration record

The previously registered raised-visor v3 asset and its source/QA were preserved under `archive/stonehold-warden-rejected/qr-card-v3-superseded/` before replacement.

The v4 concept sequence is preserved under `archive/stonehold-warden-rejected/qr-card-v4-horn-iterations/`:

- `horned-v1.png`: first bearded heavy-warden direction; rejected helmet treatment
- `horned-v2.png`: horn placement adjustment; rejected
- `horned-v3.png`: final horn-placement attempt; rejected
- `hornless-floating-ears-v1.png`: horns and sockets removed; rejected because the ear roots appeared detached from the helmet

The final approved edit keeps the hornless helmet and corrects only the ear-to-helmet fit with explicit tapered openings.

## Final ear-fit edit prompt

```text
Use case: precise-object-edit
Asset type: Stonehold Warden Vizorcat ear-and-helmet fit correction

Correct only the anatomical and structural fit between the cat's two biological ears and the iron helmet. Keep two compact natural feline ears and make their roots emerge plausibly through fitted tapered openings in the helmet shell. The iron rim must visibly wrap each ear base. Match the three-quarter perspective while preserving the hornless helmet, Celtic knotwork brow trim, open face, facial features, beard, raised paw, hammer, clothing, cape, body, tail, pose, proportions, palette, pixel-art rendering, and full-body composition.

Avoid horns, antlers, spikes, metallic ear covers, floating ears, oversized or malformed ears, visor, goggles, faceguard, nose guard, new symbols, new costume pieces, or any redesign outside the ear-and-helmet fit.
```

## Alpha extraction

The approved edit rendered a pale checker field into opaque RGB pixels. ImageMagick enabled alpha and flood-filled only the top-left border-connected exterior at 12 percent color fuzz. The result was trimmed, given 24px transparent padding, and stripped of metadata. No global light-color deletion, creative redraw, blur, or edge expansion was used.

## QA

- Light, dark, and magenta matte inspection shows no exterior checker blocks, white cutout fringe, or missing pale fur/highlight regions.
- Both biological ears remain complete and connect to the skull through fitted helmet openings.
- Both eyes, the muzzle, moustache, braided beard, raised paw, cape, short tail, feet, and hammer remain fully inside the canvas.
- The 553px expected editor silhouette height is within the required 510-590px range, so `defaultScale: 1.0` remains appropriate.
- The default sticker contains no background, floor shadow, text, logo, QR code, border, watermark, horn, or extra weapon.
