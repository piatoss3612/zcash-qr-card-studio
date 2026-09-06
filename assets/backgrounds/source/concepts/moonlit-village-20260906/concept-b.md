# Moonlit Village B — wider open card field

- Status: background candidate for user review, not registered in the live catalog.
- Tool: built-in image_gen, one serial composition edit after reviewing and retaining A. Exact prompt: `concept-b-prompt.txt`.
- Input: `concept-a.png`, SHA-256 `9da8d9806971c247d982e5e04023afd65d26066fe0213f9737580ffbd354d555`; inspected and supplied as `/tmp/moonlit-village-a-clearance-edit.png`, maximum 700 x 1000px. Original character and rendering references are recorded in `concept-a.md`.
- Requested change: move the connected pine, gate and wall toward the right edge to clear the payment QR and lower-left installation field, preserving the moon and warm ivory paper.
- Original output: `/Users/rowan/.codex/generated_images/01a07595-b366-7450-b807-9ca394a21a63/exec-6af7c719-35da-43b2-a12a-277443e7fae2.png`.
- Preserved candidate: `concept-b.png`, 1065 x 1477 opaque RGB.
- Candidate SHA-256: `dd4af51a5f3894ee3b4d9d4c96dacc1d012efd11f5996a45160d2a762d70a538`.

## Local composition QA

The background retains a warm fibrous paper field, faint outlined moon, blue-green pine, tiled wooden gate and pale stone wall. The art is moved farther right, the wall is cropped at the edge, and the lower-left remains broadly open. There are no baked characters, weapons, QR codes, text, guides or labels in the candidate.

`concept-b-event-clearance-qa.jpg` is a separate 700px diagnostic overlay, made locally with ImageMagick using current scene coordinates after mapping the background to 1311 x 1819. Blue rectangles mark the Event QR box (340,500..970,1130), Event installation box (140,1460..640,1650), and heading box (140,235..1170,325). These guides are NOT part of the background asset.

Visual inspection of that overlay shows the Event QR and installation rectangles free of illustrated objects. A roof edge approaches the QR's bottom-right corner closely, and a pine cluster reaches the far right of the heading box. The generator did not follow the stricter x>=84 percent upper-art boundary exactly: branches reach about 75 percent. Thus this candidate is not certified for the wider Centered QR box or all custom text/layout placements. It needs real editor review with the selected character and actual content before promotion; long headings may require a further branch adjustment.

The accepted character F still requires alpha extraction before pairing in the live editor. No catalog, template, live PNG, manifest or browser state was changed. No runtime tests were rerun for background-only image/source work. The original and candidate are retained separately for review.
