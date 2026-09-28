# Oni Samurai — embed pose v1

- Generated: 2026-09-25, requested by the user to recompose the print-derived Vizorcats for embed cards with gpt-6-sol.
- Why: the print Oni Samurai (`../oni-samurai-v2.png`) already invites toward screen-left, but its oni half-mask hides the muzzle and its naginata rises well above the ears. At embed size (a 130 × 162 box) the pole shrinks the cat, and the mask leaves only one eye readable.
- Live catalog id: `oni` in `src/online/card-data.js` only, labelled "Samurai" since 2026-09-25 (it replaced the earlier embed Samurai in the picker; first registered as "Oni Samurai"); file `../oni-samurai-embed-v1.png`. The print catalog keeps `../oni-samurai-v2.png` unchanged.
- Final SHA-256: `9473e8c4e73d3c41aef81b51ee3611fe85517b55fc8cd05e9e82d5fa97a9b93b`.
- Variant: `one-eyed-boss`; Theme: Shogun Samurai (Oni).
- Approach: recomposition from the print Oni as the character and rendering authority, with the Variant sheet for the closed-eye side; the inviting paw is kept, not mirrored.
- Tool path: Codex CLI 0.156.0, model `gpt-6-sol`, `codex exec -s read-only`, built-in image generation, one generation, no edits.
- Exact prompt: `concepts/oni-samurai-embed-20260925/concept-a-prompt.txt`.
- Original: `/Users/rowan/.codex/generated_images/01a0d895-0381-7872-aec4-9e24cb7f6a3b/exec-243c8da4-f9b2-4a8f-ad5e-4cefccae4af9.png`, copied unchanged to `concepts/oni-samurai-embed-20260925/concept-a.png` (1122 × 1402 RGBA, SHA-256 `2921d642dfac9b7819a61ce2703d3d26e08c6ef544b8bd8a3bfa4d05df56e657`).

## References (attached in this order)

1. `../oni-samurai-v2.png`, SHA-256 `4b1dc1239536ffde5091adde9a038afed059f1f08542d51381e540d127782fbd` — character, armor and rendering authority.
2. `/Users/rowan/keplr-workspace/vizorcat/variants/one-eyed-boss/model-sheet.png`, SHA-256 `1017c652a883eda33f436f13c851cfe5d763ddf89a8b4abe971d7119bd615672` — Variant identity.

## Gates

- Identity: charcoal one-eyed Boss with the screen-left eye closed under its short scar and one amber eye on screen-right, as in the print Oni; pink inner ears and pads; stocky short body and long tail. Small closed-mouth smile now visible.
- Equipment: navy kabuto with gold crescent crest, navy lacquered armor with gold scrollwork, crimson cords, knots and tassels. The red oni half-mask is held at the hip in the screen-right paw. No naginata or other weapon.
- Pose: inviting open paw toward the QR side at chest height, head turned slightly toward screen-left, feet planted, tail curled behind. A thin cool-gray rim separates the fur and armor from dark cards.
- Alpha: deterministic local normalization as in `airmail-courier-v1.md` (archived on 2026-09-28; alpha < 24 → 0, ≥ 240 → 255, RGB zeroed under transparent pixels, trimmed, 24 px padding); the source already had real transparency. QA `qa/oni-samurai-embed-v1-alpha-qa.jpg` over #fbf8f1, #0f1124, #ff00ff: no fringe, checkerboard or green residue; ears, crest, paws, mask and tail inside the frame; the gap inside the tail curve is transparent.
- Scale: PNG 1045 × 1258, alpha bounds (24,24)–(1020,1233), silhouette 997 × 1210. Centered 500 × 650 at `defaultScale` 1.0: `min(500/1045, 650/1258) × 1210 = 578.9px` (510–590px). Online Signature box 130 × 162 at 100%: alpha height 150.5px.
