---
name: vizorcat
description: Create, redraw or retire Vizorcat character art for Zcash QR Card Studio's embed cards, from option sheet to registered asset. Use when someone wants a new Vizorcat, a new pose or coat for an existing one, a proportion or paw fix, or to check that the character assets are consistent ("make a Vizorcat", "redraw the Bard", "Vizorcat 만들기", "새 고양이 캐릭터", "check the Vizorcat assets").
---

# Vizorcat

Vizorcats are the chibi cat mascots on embed cards (`src/online/card-data.js` → `COMPANIONS`). Each one is a PNG under `assets/characters/`, a source record, an alpha QA sheet and a manifest entry. This skill turns a character idea into a registered, reviewed asset with one tool: `scripts/vizorcat/vizorcat.py`.

Read `AGENTS.md` first; its identity, alpha and QR gates apply. Then read `references/lessons.md` — most failures below were learned the expensive way.

## Prerequisites

- Python 3 with Pillow (`python3 -m pip install pillow`) and Node (already needed by the repo).
- For `generate` and `review`: the Codex CLI signed in, with an image-capable model. The model defaults to `gpt-6-sol`; override with `VIZORCAT_IMAGE_MODEL` and `VIZORCAT_REVIEW_MODEL`. Without Codex you can still bring a sheet from any image tool and use every other step.
- Work in a folder outside the repo (or under the git-ignored `archive/`). Only what `register` copies belongs in git.

## Phases

1. **Brief.** Write down the role, a natural cat coat plus one permanent feature (not a coat another Vizorcat already uses — check the manifest's `variant`s), the outfit silhouette, the props and three different moments that show the character's personality. Poses must suit this character, not "both paws raised" by default. Follow the cultural rules in `lessons.md`.
2. **Option sheet.** Fill `references/prompt-template.md` and run:
   ```
   python3 scripts/vizorcat/vizorcat.py generate --prompt brief.txt --out ~/vizorcat-work --name bard-r1 --count 3 \
     --ref <identity crop> --ref assets/characters/samurai.png --ref assets/characters/classic-guardian.png \
     --ref assets/characters/source/qa/vizorcat-proportion-reference.png --ref assets/characters/source/qa/vizorcat-paw-reference.png
   ```
   It saves the sheet, a `.meta.json`, isolated figures (`-N-fig.png`), normalized figures (`-N-norm.png`) and a `-view.jpg`. Add `--attach 40`–`90` when props float apart from the body (stars, a hat on the ground).
3. **Pre-screen.** Look at `-view.jpg` yourself. Drop figures with closed or winking eyes that hide the eye colour when the spec needs it, one-armed poses, coats that drifted, text or symbols. Reviews take minutes each; do not spend them on obvious failures.
4. **Review.** Write a spec per figure (template in `prompt-template.md`) and run `review <fig-norm.png> --spec spec.txt --out <name>-<N>.review.json` one at a time. A figure is a candidate only with `pass: true` and no issues. Never waive an anatomy finding; you may correct a spec that was itself wrong (see `lessons.md`) and must say so in the record.
5. **Human check.** `check <norm.png> view.jpg` and zoom into every paw, ear and eye. Show only passing figures to the requester and let them choose. If nothing passes after two rounds, change the approach (pose, reference crop), not just the wording.
6. **Register.** Follow `references/registration.md`: run `register`, fill the QA line after looking at the QA sheet, update docs, then `verify` and `npm test`.
7. **Card check.** Render the character on its paired style and at least one dark style in all four layouts (see `registration.md`) and look at it on the real editor before calling it done.

## Hard rules

- Never edit, patch or composite pixels. A chosen sample is used exactly as generated; a fix means a fresh generation.
- Companion ids are part of the immutable `v=1` card link. Swap `path`, never rename or delete an id; retire through `RETIRED`.
- Both arms visible, both feet visible, exactly two ears, facing screen-left (the QR side), head about half the height.
- One image job at a time; no parallel generations or reviews.
