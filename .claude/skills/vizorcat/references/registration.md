# Registration and the card catalog

## The card contract

- Card links are versioned (`v=1`) and immutable, and every link names its companion id explicitly. Changing a companion's `path` updates cards already shared with it — that is how redraws reach deployed cards — so never rename or delete an id.
- To stop offering a Vizorcat, add its id to `RETIRED` in `src/online/OnlineStudio.jsx` and put `// Retired from the picker on <date>; existing shared cards still render it.` above its entry in `COMPANIONS`. Its file stays in the repo.
- New companions go just before `none` in `COMPANIONS`. The picker shows the first six plus the selected one and every style's pair; the rest sit behind "Explore all".
- A style's `companion` in `STYLES` is only the editor's suggestion ("Match"); pairing never changes existing cards. Every pair must name a companion with a path.

## Register a chosen figure

```
python3 scripts/vizorcat/vizorcat.py register --sheet-dir ~/vizorcat-work --name snow-r2 --index 1 \
  --id snow-surveyor-embed --file snow-surveyor-embed-v3.png --replace snow-surveyor-embed-v2.png \
  --label "Snow Surveyor" --variant siberian-snowfield-explorer \
  --usage "online embed Snow Surveyor v3: <pose>, facing the screen-left QR; pairs with Frost" \
  --concept-dir snow-surveyor-embed-20260925 --tag character-r3 \
  --intro "<why the redraw exists and what the requester chose, quoting them>" \
  --summary "<rounds tried, why the others failed, what the human check saw at zoom>" \
  --ref-note "siberian-snow-surveyor-v2.png|the print Snow Surveyor for identity and drawing style"
```

For a new character use `--catalog-id <id>` instead of `--replace`. The command:

1. copies the sheet, prompt, isolated figure and review into `assets/characters/source/concepts/<dir>/`;
2. moves the superseded PNG, QA sheet and record to the git-ignored `archive/qr-card-studio-rejected/<stem>-superseded/`;
3. writes the normalized PNG, the alpha QA sheet and `source/<stem>.md`, and replaces the manifest entry;
4. swaps the path in `src/online/card-data.js` (or adds the new companion before `none`).

Then, by hand:

- Open `source/qa/<stem>-alpha-qa.jpg` and finish the record's QA line (fringe, green residue, holes, eyes over magenta). `holes <png>` lists enclosed transparent gaps; gaps between an arm and the body are fine, holes in eyes are not.
- Update `docs/online-cards.md` (roster, pairs, what changed and why) and the Vizorcat count in `PRODUCT.md` if the picker's roster changed.
- Run `python3 scripts/vizorcat/vizorcat.py verify` and `npm test`.

## Look at it on cards

Render the character with the repo's own renderer on its paired style and one dark style in all four layouts (Signature `qr`, `compact`, `portrait`, `profile`), and check the editor picker. The Vizorcat must not touch the QR tile, its quiet zone or the copy, and dark coats need to stay readable on dark cards.

## What goes in the commit

- The live PNG, its record, its QA sheet, the manifest and catalog changes, docs, and only the concept files the records cite. `verify` fails if a record cites a missing concept file.
- Failed attempts stay local (in your work folder or `archive/`).
- The print editor (`src/catalog.js`) is a separate catalog with its own `defaultScale` and the 510–590px Centered-height gate in `AGENTS.md`; embed redraws do not change it.
