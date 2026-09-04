# Hearthlight Host source

- Finalized: 2026-09-03
- Status: registered in the QR Card Studio character catalog as `hearthlight` / `Hearthlight Host`
- Tool path: one built-in character generation, one rejected alpha retry, one built-in headwear edit, then deterministic local border-connected alpha extraction
- Use case: movable secular winter-holiday character sticker
- Character identity: Burmese-inspired sable Vizorcat using standard compact geometry
- Final file: `../hearthlight-host.png`
- Final dimensions: 893 × 1163px, RGBA
- Final SHA-256: `5cc4014ce6f93a67a48ef169f57982c00b9a51e45044db6894b0baf375cb15a0`
- Editor default scale: `0.90`, yielding an approximately 561px visible silhouette height in the centered layout
- Preserved final edit source: `imagegen/hearthlight-host-hooded-original.png`
- Final edit-source SHA-256: `79765b1964410d334971568c745f84bb3ca72dd70aeee1fe298688fe27267789`
- Built-in final edit source: `/Users/rowan/.codex/generated_images/01a029bd-4e7a-7793-87fe-50854f11ce8b/exec-873673f1-a994-4432-95d1-3f4994e5acd3.png`
- Alpha QA: `qa/hearthlight-host-alpha-qa.png`
- Alpha QA SHA-256: `98380bad423936d39abf513e478e5a8caf91608f50ed3766c9695e4a3ae2f1f1`
- Rejected mechanical-visor candidate: `../../../../../archive/qr-card-studio-rejected/hearthlight-host-mechanical-visor-v1/`

## References

- Image 1: `originals/vizorcat-standard/model-sheet.png`, authoritative for compact geometry, face placement, paws, tail, and pixel-art grammar
- Image 2: `assets/characters/commons-guide.png`, used only for campaign-cutout density, transparent padding, and readable welcoming gesture
- Edit target: the rejected mechanical-visor Hearthlight Host generation, used only to preserve the new sable cat, coat, parcel, and pose while replacing the headwear

## Final headwear edit prompt

```text
Use case: precise-object-edit
Asset type: holiday-season Vizorcat character sticker for the Vizor QR Card Studio
Input image: the supplied Hearthlight Host character is the sole edit target.

Primary request: remove the literal mechanical visor design from the cat’s head. The holiday host concept must lead; do not force a visor or eyewear onto the character.

Change only the headwear:
- completely remove the large amber lens, all forehead glass, side hinges, ear-mounted disks, mechanical band, goggles, and every piece of head hardware
- replace them with a simple tailored dark-evergreen quilted winter hood and cowl integrated into the coat
- the hood is worn loosely behind and around the head, with both ears emerging naturally through clean tailored openings
- keep the forehead and entire face open and unobstructed
- use only a narrow muted-antique-brass clasp at the throat; no metal on the head
- the hood should feel like a secular storybook winter host garment, not a Santa cap, elf hat, crown, helmet, bonnet, halo, or religious costume

Preserve exactly:
- the same single compact Burmese-inspired Vizorcat identity, sable-brown coat, gently darker face/ears/paws/tail, golden eyes, warm smile, whiskers, nose, standard compact proportions, all four paws, and full curved tail
- the same three-quarter standing pose
- the same one-paw welcoming presentation of exactly one warm-ivory parcel with one crimson ribbon
- the other paw’s relaxed position
- the tailored deep-cranberry quilted coat, evergreen facing and shoulder mantle, three brass toggles, restrained brass piping
- the crisp stepped pixel-art silhouette, limited flat palette, shading, scale, and full-body framing
- no changes to anatomy, expression, parcel, coat, pose, tail, or body scale

Background:
- genuine transparent RGBA is preferred
- if true alpha cannot be emitted, use one simple border-connected near-white exterior field with no checkerboard and no enclosed background pockets, so deterministic local extraction can remove it safely
- no floor, cast shadow, snow, scenery, frame, glow, border, or watermark

Avoid:
- any visor, goggles, glasses, mask, lens, head mechanism, weapon, lantern, bag, extra parcel, extra limb, covered eye
- Christmas tree, Santa, elf, reindeer, holly, bells, candy cane, turkey, pilgrim imagery, Indigenous stereotype, national flag, religious symbol
- text, logo, QR code, copyrighted character
- elongated anatomy, realistic fur, painterly rendering, 3D toy style, anime, soft vector art.
```

## Alpha extraction

The final edit again rendered a pale checker field into opaque RGB pixels. ImageMagick enabled alpha, removed only the exterior field connected to the top-left border at 12% color fuzz, trimmed the transparent bounds, added 24px transparent padding, and stripped metadata. No further image-generation retry, global light-color deletion, blur, edge expansion, or creative redraw was used.

## QA

- Light, dark, and magenta matte inspection shows no exterior checker blocks or obvious light fringe.
- The warm-ivory parcel, crimson ribbon, eye highlights, whiskers, hood edges, paws, and full tail remain intact.
- Exactly one cat and one parcel are present; both eyes, both ears, all four paws, and the entire tail are visible.
- The mechanical visor, lens, hinges, and head hardware are absent.
- The evergreen hood and cowl remain integrated with the cranberry winter coat and leave the face open.
- No floor shadow, scenery, text, logo, QR code, national or religious symbol, or recognizable franchise element is present.
- At `defaultScale: 0.90`, its centered-layout alpha silhouette is approximately 561px high, within the established live-character range rather than the unscaled 623px result.
