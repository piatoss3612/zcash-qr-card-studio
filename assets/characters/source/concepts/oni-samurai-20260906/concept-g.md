# Oni Samurai G — restore the original Samurai eye

- Status: concept for user review only, not registered live.
- User rejected F's enlarged round eye because it broke the existing character concept. Scope of correction: restore the original Samurai eye and relax excessive tension, while keeping F's clothes, equipment and pose.
- Tool: built-in image_gen, one serial precise-object edit. Exact prompt: `concept-g-prompt.txt`.
- Edit target: `concept-f.png`, SHA-256 `773ede97e63f8d1abb16ea6f0cfeb6072f4411fb4329c79c5ff2f21b35627db1`; inspected and supplied as `/tmp/oni-samurai-f-reference.png`, maximum edge 800px.
- Costume-specific eye reference: `../../../samurai.png`, SHA-256 `1e6bada864d0be0d13034df48ba7fe0618350a131a65348b2c550e224390d18d`; inspected and supplied as `/tmp/oni-samurai-edit-reference.png`, maximum edge 800px.
- Approved identity reference: `/Users/rowan/keplr-workspace/vizorcat/variants/one-eyed-boss/model-sheet.png`, SHA-256 `1017c652a883eda33f436f13c851cfe5d763ddf89a8b4abe971d7119bd615672`; inspected and supplied as `/tmp/oni-samurai-identity-reference.png`, maximum edge 900px.
- Original output: `/Users/rowan/.codex/generated_images/01a07595-b366-7450-b807-9ca394a21a63/exec-140cebef-b288-4752-943e-527be5fc6e92.png`.
- Preserved candidate: `concept-g.png`, 1122 × 1402, RGB.
- SHA-256: `1d8a4d40bfe0ca55f7b9997f86f6cb45a832d69e501015f660468b66deabde93`.

## Visual review

The oversized oval eye has been replaced with a more compact amber eye and an angled upper lid covering the top of the iris, restoring a composed, stern impression closer to the original Samurai. The eye remains somewhat narrower than the original reference, and subtle inner-eye fur lines remain; this is a review candidate, not an exact pixel restoration. The scarred closed eye, sculpted crimson oni mask, crescent helmet, open jinbaori with wave hem, naginata with tassel, extended paw and overall stance remain recognizable. Minor texture and fitting differences occurred in generation, so unchanged costume should be understood as design continuity rather than pixel-identical preservation. All limbs, ears, tail and weapon are in frame.

The generated image is RGB with a baked checkerboard. It is not a production cutout. The existing body-proportion and fine-texture departures from the approved model sheet also remain unresolved. Alpha, scale and editor-composition gates have not passed; do not register this candidate live. No catalog, manifest or runtime changes were made. F is preserved as the user-rejected eye variant.
