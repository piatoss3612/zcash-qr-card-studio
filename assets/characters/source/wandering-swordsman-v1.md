# Wandering Swordsman v1

- Registration requested on 2026-09-06, continuing session `01a07425-bbf0-7380-a974-953f4682c7b0`.
- Approved concept: `concepts/wandering-swordsman-20260906/concept-h.png`; generation record and prompt: `concept-h.md` and `concept-h-prompt.txt` in that directory.
- Source SHA-256: `cd441bae8189aeed152aa0f620cadb028a82d28822e59a3b50f6b104f18a32b8`.
- Exact anatomy reference used during generation: `/Users/rowan/keplr-workspace/vizorcat/originals/vizorcat-standard/model-sheet.png`, SHA-256 `a3e66263b046c92391f691a7a3613f555faba67c05a6d91373990e624d84b303`.
- Character: brown mackerel-tabby beginner swordsman with straw hat, indigo robe, travel bundle, sheathed sword and a small manual. No grass in the mouth.
- Live catalog id: `swordsman`; repository-local asset: `../wandering-swordsman-v1.png`.
- Final SHA-256: `2b441f4dd5a36dd762c51032b46c62fa36e2d6822767cf451eb1be9599645653`.

## Asset preparation

Used the existing Workshop Alchemist preparation: ImageMagick alpha enabled, border-connected checkerboard cleared with 12% fuzz and `alpha 0,0 floodfill`, transparent margins trimmed, 24px transparent padding added. No redraw or resize of the approved character.

- PNG dimensions: 805 x 1161, RGBA.
- Alpha silhouette: 757 x 1113, offset (24, 24).
- `defaultScale`: 0.9.
- Centered reference display height: `min(500 * 0.9 / 805, 650 * 0.9 / 1161) * 1113 = 560.81px`.
- Tests, alpha-composite QA and browser verification were skipped at the user's explicit request to only add the character. Actual rendering and enclosed checkerboard cleanup are not certified.
- Existing concept records retain their historical review status. This record documents the subsequent registration request.

## Selection UI follow-up

The initial catalog entry omitted the static character button in `index.html` and a theme pairing. The user subsequently requested connecting the approved First Journey landscape and placing the swordsman after the existing collection. The character button is last, and the final First Journey template pairs it with `journey`. Classic Guardian is first and is the default character for new event cards.
