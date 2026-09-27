# Tal Strongman — embed pose v1

- Generated: 2026-09-25, requested by the user to recompose the print-derived Vizorcats for embed cards with gpt-6-sol.
- Why: the print Tal Strongman (`../tal-strongman-v1.png`) wears its tal mask pushed up beside the head and carries an oversized mace whose head is larger than the cat's own head, so the face is crowded and nothing addresses the embed QR.
- Live catalog id: `strongman` (label "Tal Strongman") in `src/online/card-data.js` only; file `../tal-strongman-embed-v1.png`. The print catalog keeps `../tal-strongman-v1.png` unchanged.
- Final SHA-256: `5c0638c920be38f6ff824ae8b2c600a63a5e974eee120c6aa2c79d5cf445ada6`.
- Variant: `korean-domestic-shorthair-tabby-standard-geometry` (no model sheet in the Vizorcat project; the print Strongman is the identity authority); Theme: Tal Strongman.
- Tool path: Codex CLI 0.156.0, model `gpt-6-sol`, `codex exec -s read-only`, built-in image generation, one generation, no edits.
- Exact prompt: `concepts/tal-strongman-embed-20260925/concept-a-prompt.txt`.
- Original: `/Users/rowan/.codex/generated_images/01a0d8a5-9461-7ed3-924f-8c4543194c87/exec-2d3cab15-0730-4be7-9f21-e4fb87b7234d.png`, copied unchanged to `concepts/tal-strongman-embed-20260925/concept-a.png` (1122 × 1402 RGBA, SHA-256 `07f51786bcc0a166ec3c8781e693c185673a1339ae413acec055015a7091bef9`).

## References (attached in this order)

1. `../tal-strongman-v1.png`, SHA-256 `8bf5fa7007ed2c0775d98208c9f84656cd62b595f357fa7869ad2c92bc4f852d` — character, outfit and rendering authority.
2. `/Users/rowan/keplr-workspace/vizorcat/originals/vizorcat-standard/model-sheet.png`, SHA-256 `a3e66263b046c92391f691a7a3613f555faba67c05a6d91373990e624d84b303` — proportion authority.

## Gates

- Identity: compared with the print Strongman at equal height on #fbf8f1. Same gray-brown tabby with forehead stripes, the same confident half-lidded amber eyes (as drawn in the print character), pink nose and grin; banded tail; short legs and round paws.
- Equipment: teal jacket and trousers with red sash and ivory wraps, exactly one carved wooden tal mask held in the paw (not worn), exactly one iron mace with a round studded head no larger than the cat's head and a wrapped handle.
- Pose: three-quarters toward screen-left, mask presented toward the QR side at chest height, mace over the far shoulder, feet planted, tail curled up behind.
- Alpha: deterministic local normalization as in `airmail-courier-v1.md`; the source already had real transparency. QA `qa/tal-strongman-embed-v1-alpha-qa.jpg` over #fbf8f1, #0f1124, #ff00ff: no fringe, checkerboard or green residue; the gaps under the raised arm, between the legs and inside the tail curve are transparent; ears, mask, mace, paws and tail inside the frame.
- Scale: PNG 1137 × 1185, alpha bounds (24,24)–(1112,1160), silhouette 1089 × 1137. The silhouette stays nearly square because of the mask and mace. Centered 500 × 650 at `defaultScale` 1.0: `min(500/1137, 650/1185) × 1137 = 500.0px`, just below the 510–590px print range (the print Strongman uses `defaultScale` 1.1); the online renderer has no per-character scale. Online Signature box 130 × 162 at 100%: alpha height 130.0px (print Strongman: 130.8px).
