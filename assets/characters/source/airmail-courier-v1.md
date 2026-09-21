# Airmail Courier v1

- Generated: 2026-09-21, requested by the user for new embed-card companion poses ("codex2를 호출해서 이미지를 만들어도돼").
- Live catalog id: `courier` (online embed cards only; print catalog unchanged); file: `../airmail-courier-v1.png`.
- Final SHA-256: `b2bf397d16570978239d9f7de0dd1a16782216c63f5eca45b8ed794775f368b3`.
- Variant: `vizorcat-standard`. Theme: Airmail Courier — navy courier cap, red neckerchief, brown messenger satchel, one sealed red-and-blue striped airmail envelope with a red wax seal raised toward screen-left (the QR side in Signature, Compact and Portrait). Pairs with the Airmail card style.
- Tool path: Codex CLI 0.155.1 under the `codex2` account, `codex2 exec -s read-only`, built-in image generation, one generation, no edits.
- Exact prompt: `concepts/airmail-courier-20260921/concept-a-prompt.txt` (wrapped with a one-paragraph instruction to generate exactly one image and not touch repository files).
- Original: `/Users/rowan/.codex-homes/codex2/generated_images/01a0c38b-f900-7901-9b2f-d2a50c38d5da/exec-952cf2da-fe62-4372-829c-7809136ccce0.png`, copied unchanged to `concepts/airmail-courier-20260921/concept-a.png` (1135 × 1386 RGBA, SHA-256 `cf445e2921e5ba8bce413fd0238b41d632de79045be42cff05f9596d4dfda5ed`).

## References

1. `/Users/rowan/keplr-workspace/vizorcat/originals/vizorcat-standard/model-sheet.png`, SHA-256 `a3e66263b046c92391f691a7a3613f555faba67c05a6d91373990e624d84b303` — identity authority, attached to the generation.
2. `../classic-guardian.png`, SHA-256 `c15f477731974f5aa4af731dcb020bbbce36a390f8b66341c03d8da0ec700237` — pixel density, outline and framing only, attached to the generation.

## Identity gate

Compared side by side with the Standard front turnaround and Classic Guardian at equal height. Face grid, golden eyes, pink nose, white blaze and muzzle, cheek whiskers, ear construction, white chest patch, paw tips and tail tip, short limbs and round paws match the Standard. The head reads slightly smaller relative to the body than the bare Standard sheet, in line with the approved Classic Guardian. No text, logo or QR in the artwork.

## Alpha and scale

The generation already returned transparent RGBA (flat green was requested but not used). The body alpha was 253 rather than 255, and a faint dark haze (average alpha 7) surrounded the silhouette. Deterministic local normalization only: alpha < 24 → 0, alpha ≥ 240 → 255, intermediate edge values kept, RGB zeroed under fully transparent pixels, trimmed and padded by 24 px. No resizing, smoothing, recoloring or regeneration.

- PNG: 1020 × 1151, genuine RGBA.
- Alpha bounds: (24,24)–(996,1127); silhouette 972 × 1103.
- Centered 500 × 650 reference at `defaultScale` 1.0: `min(500/1020, 650/1151) × 1103 = 540.7px`, within 510–590px. The online renderer has no per-character scale; this value is recorded for a future print registration.
- Online Signature box 130 × 162 at 100%: contain factor 0.1275, alpha height 140.6px (Classic Guardian: 151.8px).
- QA: `qa/airmail-courier-v1-alpha-qa.jpg`, composited over #fbf8f1, #0f1124 and #ff00ff. No checkerboard, green residue or edge fringe; white paws, envelope and tail tip intact; transparent gaps between legs and inside the tail curve are clear; ears, cap, paws, satchel, tail and envelope are fully inside the frame.
