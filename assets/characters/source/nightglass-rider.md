# Nightglass Rider source

- Finalized: 2026-09-04
- Status: removed from the selectable QR Card Studio catalog on 2026-09-06 at the user's request. Original and exploration candidates are retained as authoring records.
- Tool path: serial built-in image exploration, one approved precise head edit, then deterministic local alpha extraction
- Use case: movable QR Card Studio character sticker
- Character identity: an original Vizorcat-inspired cybernetic masked rider; feline silhouette cues remain in the armored ears, paws, and segmented tail
- Final file: `../nightglass-rider.png`
- Final dimensions: 1050 x 935px, RGBA
- Trimmed alpha silhouette: 1002 x 887px with 24px transparent padding
- Editor default scale: `1.30`
- Expected Centered-layout display height: `549.10px` inside the `500 x 650px` reference box
- Final SHA-256: `bca2f34764ca126866ae609da448fdd622884ac649c7bf3c190c619d5ebcb66c`
- Preserved generated source: `imagegen/nightglass-rider-original.png`
- Generated-source SHA-256: `84ed1b6258150ec5d12e7c77e23ac9b4303c0860f3367527045accb3c3fc0111`
- Preserved direct edit target: `imagegen/nightglass-rider-body-reference.png`
- Direct-edit-target SHA-256: `2e072d7f978b289b5c3c8bc14090b8ea540e1ad3bfc189641aafb198e653b8d7`
- Built-in output: `/Users/rowan/.codex/generated_images/01a029bd-4e7a-7793-87fe-50854f11ce8b/exec-6cfc6112-1ad5-4bf0-a645-f1d869dec4dc.png`
- Alpha QA: `qa/nightglass-rider-alpha-qa.png`
- Alpha QA SHA-256: `dba35c4d12e71659975b806f25d709e18d67833270929edfbea0912a3f252d00`

## References

- Direct edit target: `imagegen/nightglass-rider-body-reference.png`, used as the body, pose, palette, and compact-proportion authority.
- Upstream geometry reference: `/Users/rowan/keplr-workspace/vizorcat/originals/vizorcat-standard/model-sheet.png`, used during the body exploration for Vizorcat scale, paw, ear, tail, and pixel-density language.
- External inspiration was limited to the general visual principle of a rider helmet enclosing an unknowable dark interior. No existing character's colors, markings, exact helmet shape, costume, or iconography were copied.

## Approved edit prompt

```text
Use case: precise-object-edit
Asset type: transparent full-body Nightglass Rider character concept for Zcash QR Card Studio.

Image 1 is the edit target and body-design authority. Preserve its approved compact approximately three-head-tall proportions, exact stance, asymmetric shoulder armor, diagonal crimson shutter core, graphite/gunmetal/deep-violet palette, restrained red joint seams, one-sided rear energy fins, segmented mechanical tail, paw-like hands and feet, screen-right open palm, circular interface ring, and chunky pixel-art rendering.

Replace only the head/helmet. Undo the industrial sensor-pod direction. The result must clearly read as a mysterious feline masked rider hero wearing an authored transformation helmet, not a camera-headed robot and not a literal cat in ordinary armor.

Keep a compact rounded feline skull volume appropriate to the three-head-tall mascot body. Add two clearly readable triangular armored cat-ear shells as major silhouette features. Both ears must be visible and balanced in perspective, integrated into the helmet crown, fully armored, and neither tiny nor exaggerated. Shape the crown from three large overlapping armor shells: matte graphite center, dark-violet rear-side plate, and one asymmetric deep-crimson temple plate. Avoid a smooth motorcycle helmet dome: use deliberate brow, cheek, temple, and lower-jaw armor masses with clean separations. Retain a small armored muzzle/chin guard that subtly echoes feline facial structure without showing a nose, mouth, whiskers, or exposed fur.

Inside the armored helmet frame is a deep, perfectly black void rather than glass, machinery, or a visible face. The void spans the face opening but has almost no highlight or reflection, so it reads as unknowable interior darkness rather than a conventional visor. Floating within that darkness is exactly one narrow diagonal crimson holographic sight slash, positioned slightly off-center. It is a single luminous glyph, not a physical lens or eyeball. The slash has one brighter leading pixel cluster and a short fading tail, suggesting it can track within the void. No second eye, paired marks, circular sensor, pupil, iris, mouth display, or facial UI.

The helmet should feel wearable, agile, charismatic, and iconic: a supernatural masked rider with feline ancestry. Preserve enough neck separation to read as a helmet on a character, not a robot sensor block. Add only two tiny wisps of black digital-shadow vapor escaping at the rear collar connection, contained tightly around the neck and not obscuring the body.

Use only the general design principle of a cat-eared rider helmet hiding an impossible empty interior. Do not copy any existing character's exact helmet shape, color scheme, ear geometry, decorative markings, bodysuit, smoke silhouette, or franchise iconography. Specifically avoid bright yellow shell colors and blue flame or tribal markings.

Authentic chunky low-resolution pixel art matching Image 1: coarse consistent grid, stepped near-black outlines, clean pixel clusters, limited palette, and only 2-3 value steps per material. No smooth 3D rendering, painterly gradients, scratches, grime, tiny noisy greebles, or photorealism.

One full-body edited character only, entirely within frame, genuinely transparent background with clean alpha edges and no pale halo. No environment, floor, platform, cast shadow, text, logo, QR code, border, checkerboard, extra views, or additional objects.

Do not redesign or recolor the torso, shoulder, arms, hands, legs, feet, tail, back fins, chest core, pose, or hand interface. No sensor pod, camera box, full-width reflective visor, human face, exposed cat face, horns, antennae, V crest, weapon, cape, or recognizable franchise resemblance.
```

## Alpha extraction

The approved generation rendered its checkerboard preview as opaque near-white RGB pixels. A deterministic ImageMagick pass enabled alpha and removed only the exterior field connected to the top-left border at 12 percent color fuzz. The closed background regions inside the hand interface and between the bent arm and torso were cleared with two additional seeded flood fills. The result was trimmed, given 24px transparent padding, and stripped of metadata. No image-generation retry, creative redraw, global light-color deletion, blur, edge expansion, or character recoloring was used.

## QA

- Light, dark, and magenta matte inspection shows no exterior checker blocks or pale fringe.
- The closed spaces inside the hand interface and between the bent arm and torso are transparent.
- Both armored ears, the full segmented tail, every limb, both large paws, the rear fins, and the complete interface ring remain inside the frame.
- The intentionally retained black shadow wisps remain attached to the rear helmet and collar; they are character pixels rather than background residue.
- Exactly one diagonal crimson holographic sight remains inside the otherwise empty black face cavity.
- No exposed face, second eye, weapon, floor shadow, text, logo, QR code, or background is present.
