# Oni Samurai H — open forepaw pad correction

- Status: review concept, not registered live.
- User feedback on G: design is good, but the forepaw count needs correction. Interpreted as visible toes/pads on the extended forepaw.
- Tool: built-in image_gen, one serial precise-object edit. Exact prompt: `concept-h-prompt.txt`.
- Edit target: `concept-g.png`, SHA-256 `1d8a4d40bfe0ca55f7b9997f86f6cb45a832d69e501015f660468b66deabde93`; inspected and supplied at maximum edge 800px as `/tmp/oni-samurai-g-reference.png`.
- Paw construction reference: `../../../samurai.png`, SHA-256 `1e6bada864d0be0d13034df48ba7fe0618350a131a65348b2c550e224390d18d`; the inspected `/tmp/oni-original-paw-qa.png` is a 205 × 200 crop from its 800px reference derivative, at x=0, y=330.
- Approved identity reference: `/Users/rowan/keplr-workspace/vizorcat/variants/one-eyed-boss/model-sheet.png`, SHA-256 `1017c652a883eda33f436f13c851cfe5d763ddf89a8b4abe971d7119bd615672`; supplied as the previously inspected 900px `/tmp/oni-samurai-identity-reference.png`.
- Original output: `/Users/rowan/.codex/generated_images/01a07595-b366-7450-b807-9ca394a21a63/exec-0c98912e-9338-4256-b180-7f02b89bbbf4.png`.
- Preserved candidate: `concept-h.png`, 1122 × 1402, RGB.
- SHA-256: `08dc517d93384aca8c30dd2f4c86fbafaf2ac1dfe9ecef892ab572ef31434176`.

## Visual review

The extended paw now has four small toe pads and one visibly unified round central pad, matching the original Samurai's simplified construction. The previous divided-looking center has been removed. Two forelimbs remain: the extended paw and the naginata-gripping paw. The compact angled amber eye, healed scar, mask, jinbaori, armor, weapon and stance preserve G's design direction. Minor generated changes in outlines, textures and fittings remain, so this is not a pixel-identical edit outside the paw. Both ears, all limbs, tail and full weapon remain in frame.

The output is opaque RGB with a baked checkerboard, not a usable live cutout. Alpha and editor-scale gates remain pending, as do the prior anatomy/pixel-density fidelity concerns. No production approval, manifest registration or runtime changes were made. No runtime tests or browser screenshots apply to this concept-only edit.
