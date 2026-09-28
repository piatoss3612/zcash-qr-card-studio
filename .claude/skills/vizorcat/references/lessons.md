# Lessons from the 2026-09 Vizorcat redraws

Each point cost several rounds to learn. Apply them before the first generation.

## References get copied — defects included

- The model copies whatever the references show, including their flaws. Inspect every reference at zoom before attaching it.
- A full-body Bard reference carried its long body into every redraw; a head-and-hat crop fixed the proportions (`concepts/bard-20260925/proportion-r3-head-reference.png`). Same for the Gothic Belle: head crop plus an outfit crop with the legs removed.
- A patchwork style swatch that still showed the source cat's calico face turned a black-and-white cat calico. Erase faces and coats from style swatches.
- A pose you liked on an earlier sheet is a scene idea, not a reference to attach, if something in it failed: the new figures reproduce the flaw.

## Proportions

- State proportions first in the prompt and attach `qa/vizorcat-proportion-reference.png`: the head (chin to ear tips, without headwear) as tall as the whole body below the chin, the head as wide as the shoulders, a short round body, very short legs.
- Long stockings, tall boots and long robes make legs read long; puffy shorts or a hem close to the feet keep them short.
- Judge a character against its own print original when that original is in the proportion reference (the Grove Ranger's legs are a little longer than the Samurai's).

## Paws and poses

- Paws may hold, grip, curl or tuck. From 2026-09-25 to 2026-09-27 the reviews failed every gripping paw and demanded four toe beans on every pad; redraws drifted to open pads facing the viewer, and on 2026-09-28 the requester dropped that rule: the holding and curled paws in the earlier art were fine ("기존 손디자인도 별 문제 없긴 하잖아. 뭔갈 쥐고 있다던가 움추리고 있다던가").
- The only paw failure is a paw that reads as a human hand at card size (about 150 px tall): long separated fingers, a pointing index finger, nails. A crease or a thumb-like bump that shows only when zoomed in is fine; judge the paws at card size before you regenerate.
- Do not pick poses just to show the pads. Open pads toward the viewer everywhere make the roster look the same as "both paws up" does.
- Hiding one arm reads as one-armed. Never do it.
- Holding the character's own prop is often the most natural pose (a pencil, a camera, a mug). Slinging, hanging or pocketing a prop is an option when the pose needs free paws, not a requirement.
- A whole roster of "both paws up" looks generic. Give each character an action of its own (catching snowflakes, arms folded like a warden, balancing on a ball) — the requester notices sameness quickly.
- The requester's preference wins over a clean review. The Alchemist kept its v1 flask pose because the requester preferred it; record that choice instead of hiding it.

## Sheets, reviews and choices

- Three figures of the same character on one sheet beat single constrained regenerations, and the chosen sample is better than a regeneration of it.
- Editing a figure to fix one detail degrades the rest. Regenerate instead.
- Pre-screen the sheet before review: closed eyes that hide an eye colour the spec requires, a wink, a gaze toward screen-right, one foot hidden behind a curtsy.
- Review variance is real: the same pixels can pass once and fail once. Record both reviews when you accept a figure after a disputed finding.
- Correct a spec only when the spec was wrong, and write the correction in the record. Examples: the original design already had dark trousers or an ECG chest display; a bat's feet are not cat forepaws; a partly hidden bow on the back is normal. Human-hand paws and extra ears are never spec errors.
- Show the requester only passing figures and let them pick. Ask before swapping a scene they chose for a different one.

## Tooling traps

- The isolation step once keyed every chroma-green pixel and punched holes in green eyes; it now clears only background connected to the sheet border. Check eyes over magenta in the QA sheet.
- Column-split cropping clipped tails where neighbours overlapped; isolation now labels blobs over the whole sheet.
- A detached prop can attach to the wrong figure; pieces go only to their nearest figure within `--attach`.
- An empty prompt file makes the model draw something unrelated; the tool refuses empty prompts.

## Culture and taste

- No religious or occult symbols (crosses, pentagrams, skulls), no runes, no text or numbers on props.
- No rays or stripes radiating from a point in red and cream or red and white: it reads as the Rising Sun flag, which Korean users will object to.
- Nothing that reads as smoking: a "bubble pipe" came out as a tobacco pipe.
- Clowns stay friendly: no face paint, no red nose. Jester hoods are cloth, never extra ears.
- Draw from archetypes (D&D classes, street fashion, trades) without copying a specific character.
