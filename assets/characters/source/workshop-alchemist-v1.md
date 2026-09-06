# Workshop Alchemist v1

- Approved concept: `concepts/workshop-alchemist-20260906/concept-g.png`; user accepted its facial markings, then explicitly requested service registration on 2026-09-06.
- Live catalog id: `alchemist`; file: `../workshop-alchemist-v1.png`.
- Final SHA-256: `df668be70a07fb2e5504ec1862c6731508062528183cbcc4b6af3dce44cf08c1`.
- Variant: bronze Egyptian Mau-inspired coat within approved Vizorcat Standard geometry. Theme: workshop alchemist with goggles, apron and a dry flask containing one black homunculus.
- Exact anatomy reference: `/Users/rowan/keplr-workspace/vizorcat/originals/vizorcat-standard/model-sheet.png`, SHA-256 `a3e66263b046c92391f691a7a3613f555faba67c05a6d91373990e624d84b303`. Supplied during concept generation. All runtime assets are repository-local.
- Generation history and exact prompts: `concepts/workshop-alchemist-20260906/`, final `concept-g.md` and `concept-g-prompt.txt`. Approved source SHA-256: `82b9113db6c531e1978f8cc060c1307cee9f7d77a97f3df73595ad4fcfb03f46`.

## Alpha and scale

Following the existing character asset preparation, ImageMagick 7 enabled alpha and cleared only the border-connected checkerboard at 12% fuzz (`-fill none -draw 'alpha 0,0 floodfill'`), trimmed transparent margins and added 24px transparent padding. No creative regeneration, resizing, smoothing or broad white-color deletion. The first attempt used obsolete `matte` syntax and produced no output; corrected to ImageMagick 7 `alpha` syntax before validation.

- PNG: 710 x 1086, genuine RGBA.
- Alpha bounds: (24,24,686,1062); silhouette: 662 x 1038.
- `defaultScale`: 0.9.
- Centered 500 x 650 reference: `min(500*0.9/710, 650*0.9/1086)*1038 = 559.14px`, within 510–590px gate.
- Current event box 470 x 550: contain silhouette height 525.69px (event replacement fits the existing event box).
- QA: `qa/workshop-alchemist-v1-alpha-qa.jpg`. Light, dark and magenta mattes inspected serially: cream muzzle/sleeves, eye and flask highlights remain intact; outside silhouette, feet gap and tail/body opening are clear. Ears, paws, feet, tail and complete flask remain in frame. Pixel density and anatomy are retained from the user-approved concept.

## Runtime

Verified in Safari Technology Preview at `http://127.0.0.1:4173/` on 2026-09-06. Created a Link event card using `https://vizor.cash` with installation guidance enabled, selected Templates → Alchemist Workshop, and inspected the actual card. Approved coat/face and black homunculus render with clean transparency; all ears, paws, feet and tail fit on the card; neither QR region is covered. Vizorcat panel exposes Workshop Alchemist and reports it selected. Shared downscaled screenshot: `../../backgrounds/source/qa/alchemist-workshop-v1-runtime.jpg`.

Focused event-card, scene and preflight tests: 41 passed. Additional checks confirm all three modes pair `workshop` with `alchemist`, source/manifest/file hashes match, assets return HTTP 200, and the default event and Centered compositions keep QR/install regions clear. The shared Centered payment layout retains its pre-existing Zcash logo safe-inset warning (y=86 versus safeInset=94); unrelated layout behavior was not changed.
