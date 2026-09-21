# Aurora Photographer v2 (Fluffy Warden)

- Generated: 2026-09-21 after the user asked to move the Standard-based style Vizorcats to other Variants ("좋아 다른 바리에이션들도 좀 수정해보자"). Supersedes v1 (gray-and-white Standard), archived at `archive/qr-card-studio-rejected/aurora-photographer-v1-superseded/`.
- Live catalog id: `photographer` (online embed cards only; print catalog unchanged); file: `../aurora-photographer-v2.png`.
- Final SHA-256: `a449ac6402cf3d18c737c47206760a254df3b0c7fdf1db0ddcdc26a77fee4fd2`.
- Variant: `fluffy-warden` (Norwegian-Forest-inspired silver mackerel tabby long hair, moss-green eyes, ear-tip tufts, neck ruff, bushy tail) — a northern cat for an aurora chaser, and a silver coat that reads on the dark card. Theme unchanged from v1: teal beanie with cream pom-pom, violet parka with cream collar, teal-and-gold scarf, vintage camera angled toward screen-left.
- Tool path: Codex CLI 0.155.1 under the `codex2` account, `codex2 exec -s read-only`, built-in image generation, one generation, no edits.
- Exact prompt: `concepts/aurora-photographer-20260921/concept-b-prompt.txt`.
- Original: `/Users/rowan/.codex-homes/codex2/generated_images/01a0c3d4-b50f-7d10-8798-564fafb8e377/exec-eca17f8c-3c15-407c-bb0c-338d1dab532d.png`, copied unchanged to `concepts/aurora-photographer-20260921/concept-b.png` (1122 × 1402 RGBA, SHA-256 `2a1222f3e9266b84302e103391587dcc15b4fc60c301eb8205d02fbb025c2f29`).

## References (attached in this order)

1. `/Users/rowan/keplr-workspace/vizorcat/variants/fluffy-warden/model-sheet.png`, SHA-256 `8d63947b6fa5a8bb1651de8edbcad9043591e0cea6d05e2870bc75793ec52d2c` — identity authority.
2. v1 `aurora-photographer-v1.png`, SHA-256 `1e19752d1c59c221e649da5bc32a3dce41491458e04c7f98b81ceaf4940b0aa6` — outfit, props, pose and rendering only.

## Gates

- Identity: compared at equal height with the Fluffy Warden front turnaround. Silver mackerel stripes on head, legs and tail, forehead markings, white muzzle and ruff, moss-green eyes, ear tufts, cheek tufts and bushy tail match; no gray-and-white Standard coat carried over. Round skull; both ears visible beside the beanie.
- Alpha: the same deterministic local normalization as `airmail-courier-v1.md`; the source already had real transparency. QA `qa/aurora-photographer-v2-alpha-qa.jpg` over #fbf8f1, #0f1124, #ff00ff: no fringe or checkerboard. The 1376 pixels matching the green-residue heuristic are the moss-green eyes.
- Scale: PNG 920 × 1348, alpha bounds (24,24)–(896,1324), silhouette 872 × 1300. Centered 500 × 650 at `defaultScale` 1.0 gives 626.9px (above 510–590px because of the pom-pom); `defaultScale` 0.9 gives 564.2px for any future print registration. Online Signature box 130 × 162 at 100%: alpha height 156.2px.
