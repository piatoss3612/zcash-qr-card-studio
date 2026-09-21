# Samurai — embed v2 (localized edit)

- Generated: 2026-09-21 after the user rejected v1 ("samurai 비율이 이상한데", "턱 마스크 같은게 왜 갑옷으로 들어간거야?"; v1 archived at `archive/qr-card-studio-rejected/samurai-embed-v1-proportion-hanbo/`).
- Why an edit: v2 edits the print Samurai instead of redrawing it, so the approved pose, silhouette and one-eyed Boss proportions stay locked. The print pose already offers its open paw toward screen-left, where the embed QR sits.
- Live catalog id: `samurai` in `src/online/card-data.js` only; file `../samurai-embed-v2.png`. The print catalog keeps `../samurai.png` unchanged.
- Final SHA-256: `f9fe0d8f730bb96d408c8a660ed6e72e6115e0c9668b2894a35e22baa95fd0db`.
- Variant: `one-eyed-boss`; Theme: Shogun Samurai.
- Tool path: Codex CLI 0.155.1 under the `codex2` account, `codex2 exec -s read-only`, built-in image generation as one localized edit.
- Exact prompt: `concepts/samurai-embed-20260921/concept-b-prompt.txt`.
- Original: `/Users/rowan/.codex-homes/codex2/generated_images/01a0c39f-7584-7082-86ce-81bde852504c/exec-71dbff7f-fdee-419f-b90e-5670506b4321.png`, copied unchanged to `concepts/samurai-embed-20260921/concept-b.png` (1198 × 1313 RGBA, SHA-256 `45deccdd4902a25dce3c612a63364ca001cfa10c9dc923447bee70e7caf561ef`).

## References (attached in this order)

1. `../samurai.png`, SHA-256 `1e6bada864d0be0d13034df48ba7fe0618350a131a65348b2c550e224390d18d` — edit target.
2. `/Users/rowan/keplr-workspace/vizorcat/variants/one-eyed-boss/model-sheet.png`, SHA-256 `1017c652a883eda33f436f13c851cfe5d763ddf89a8b4abe971d7119bd615672` — identity check.

## Gates

- Proportion lock: compared with the print Samurai trimmed to equal height on #182322. Pose, head size, head-to-body ratio, leg length, command fan, katana and tail match.
- Changes: the hanbo is gone from the face, neck and chest (the breastplate now starts at the neck); a small closed-mouth smile and softer brow replace the stern mask; subtle gray rim highlights outline the ears, head, paws and tail. Armor plates stay navy with crimson and gold as in the theme.
- Equipment: exactly one sheathed katana, one command fan; no text or crests beyond the theme's approved gold flower studs.
- Alpha: the same deterministic local normalization as `airmail-courier-v1.md`; the source already had real transparency. QA `qa/samurai-embed-v2-alpha-qa.jpg` over #fbf8f1, #0f1124, #ff00ff: no fringe, checkerboard or green residue; ears, crest, fan, paws, tail and scabbard inside the frame.
- Scale: PNG 1199 × 1312, alpha bounds (24,24)–(1175,1288), silhouette 1151 × 1264. Centered 500 × 650 at `defaultScale` 1.0: `min(500/1199, 650/1312) × 1264 = 527.1px` (510–590px). Online Signature box 130 × 162 at 100%: alpha height 137.0px (print Samurai 137.2px).
