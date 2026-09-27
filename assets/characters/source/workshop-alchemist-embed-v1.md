# Workshop Alchemist — embed pose v1

- Generated: 2026-09-25, requested by the user to recompose the print-derived Vizorcats for embed cards with gpt-6-sol.
- Why: the print Workshop Alchemist (`../workshop-alchemist-v1.png`) stands frontal with the flask held low in both paws, so nothing points toward the embed QR and the flask reads small at embed size.
- Live catalog id: `alchemist` (label "Alchemist") in `src/online/card-data.js` only; file `../workshop-alchemist-embed-v1.png`. The print catalog keeps `../workshop-alchemist-v1.png` unchanged.
- Final SHA-256: `a0cdea83055518022ca4d455bb0c33ec1a81eaebf18f25a38d4fa4bc6f59e3f9`.
- Variant: `bronze-egyptian-mau-inspired-standard-geometry` (no model sheet in the Vizorcat project; the print Alchemist is the identity authority); Theme: Workshop Alchemist.
- Tool path: Codex CLI 0.156.0, model `gpt-6-sol`, `codex exec -s read-only`, built-in image generation. Within the one run Codex generated two images and reported the second as its answer; that one is used. The unreported first image stays in the Codex folder only (`/Users/rowan/.codex/generated_images/01a0d89f-c441-7233-a50e-aff5d6aba228/exec-feb0d71e-fc41-4796-97a0-d5f74244fce6.png`, SHA-256 `36a89d65589669b66f60e91fc9e015ac2bd433c845d6fa503615dcc52bdbde1f`).
- Exact prompt: `concepts/workshop-alchemist-embed-20260925/concept-a-prompt.txt`.
- Original: `/Users/rowan/.codex/generated_images/01a0d89f-c441-7233-a50e-aff5d6aba228/exec-8161b464-322b-4fae-a603-94d83a4e7153.png`, copied unchanged to `concepts/workshop-alchemist-embed-20260925/concept-a.png` (1122 × 1402 RGBA, SHA-256 `f561c71425cd033466f5e4e9b732bd09c1b64ba18cb672e8a7880617f5b10485`).

## References (attached in this order)

1. `../workshop-alchemist-v1.png`, SHA-256 `df668be70a07fb2e5504ec1862c6731508062528183cbcc4b6af3dce44cf08c1` — character, outfit and rendering authority.
2. `/Users/rowan/keplr-workspace/vizorcat/originals/vizorcat-standard/model-sheet.png`, SHA-256 `a3e66263b046c92391f691a7a3613f555faba67c05a6d91373990e624d84b303` — proportion authority.

## Gates

- Identity: bronze spotted Mau-inspired tabby with forehead markings, green eyes, pink nose, cream muzzle and banded tail; small open smile. Short legs and round paws.
- Equipment: brass goggles pushed up between the ears, cream shirt with rolled sleeves, green vest, brown leather apron, exactly one corked glass flask with one black homunculus (two white dot eyes). No symbols, labels or sparkles.
- Pose: three-quarters toward screen-left, flask raised at shoulder height toward the QR side, other paw on the apron, feet planted, tail curled up behind. A thin warm rim separates the fur from dark cards.
- Alpha: deterministic local normalization as in `airmail-courier-v1.md`; the source already had real transparency. QA `qa/workshop-alchemist-embed-v1-alpha-qa.jpg` over #fbf8f1, #0f1124, #ff00ff: no fringe, checkerboard or green residue; the flask glass stays opaque with its highlights; ears, goggles, paws, feet and tail inside the frame.
- Scale: PNG 1040 × 1353, alpha bounds (24,24)–(1015,1328), silhouette 992 × 1305. Centered 500 × 650 at `defaultScale` 1.0: `min(500/1040, 650/1353) × 1305 = 626.9px`, above the 510–590px print range (the print Alchemist uses `defaultScale` 0.9); the online renderer has no per-character scale. Online Signature box 130 × 162 at 100%: alpha height 156.3px.
