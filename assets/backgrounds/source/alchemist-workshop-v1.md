# Alchemist Workshop v1

- Approved by user after concept B: "그래 이정도면 됐다"; service registration explicitly requested on 2026-09-06.
- Live catalog id: `workshop`; file: `../alchemist-workshop-v1.png`.
- Final dimensions: 1311 x 1819, opaque RGB.
- Final SHA-256: `ba81d7b05d469804c305de7633454ee84c0d53cdb7e5eed8017ed22727163646`.
- Approved source: `concepts/alchemist-workshop-20260906/concept-b.png`, 1065 x 1477, SHA-256 `0fe9906f228b7a1fcfc27859a0f463dc24861b9133533740515fd9bb4a4602e6`.
- Exact generation and edit prompts, collection references, and earlier QA caveats: `concepts/alchemist-workshop-20260906/source.md`, `prompt.txt`, `concept-b.md`, `concept-b-prompt.txt`.
- Production transform: ImageMagick proportional cover resize to 1311 x 1819, center crop, metadata stripped. No creative changes after approval.
- Theme pairing: Workshop Alchemist (`alchemist`), clean QR and Zarathustra caption, Centered layout. Templates generated for payment, link and giftcard. Event theme selection preserves the event layout.
- Art: restrained warm limestone workshop with one corner distillation apparatus, two recessed jars and a small ceramic dish holding a gray-to-gold transmutation specimen at the extreme bottom-right.

## Verification

Source, manifest and final file hashes match; both new assets return HTTP 200 from the local server. Verified in Safari Technology Preview at `http://127.0.0.1:4173/` on 2026-09-06: selected the Alchemist Workshop template for a Link event card using `https://vizor.cash`, with Get Vizor enabled. Actual canvas shows the background and transparent alchemist together, unobstructed main QR and installation guidance, and the gray/gold stone visible beside the cat at bottom-right. Print check status reads Ready to print. Downscaled screenshot: `qa/alchemist-workshop-v1-runtime.jpg`.

Focused event-card, scene and preflight tests: 41 passed. Additional preflight checks cover payment, link and giftcard with both event and Centered template compositions; QR/install clearance passes. The shared Centered payment logo has an inherited safe-inset warning (y=86 versus 94), unrelated to these assets. Arbitrary manually selected layouts are not certified. In the event layout the top-left wordmark partly overlays the corner glass apparatus; QR and installation zones are unaffected. No source art was redrawn during registration.
