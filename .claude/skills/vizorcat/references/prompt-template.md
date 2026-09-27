# Prompt and spec templates

## Option sheet prompt

Replace the angle-bracket parts. Keep the order: proportions, references, character, moments, rules, background. The reference list must match the `--ref` order exactly.

```text
Use case: a pose option sheet for the embed Vizorcat "<Name>", so the user can choose one. Draw exactly three full-body figures of the SAME character side by side on one landscape canvas (1536 × 1024), left to right 1–3, clearly separated with wide empty space between them, each turned three-quarters toward screen-left with its head and gaze toward screen-left.

Proportions come FIRST. Build the character on the same chubby chibi body as the print Vizorcats in the proportion reference:
- The head (chin to the top of the ears, without headwear) is as tall as the entire body below the chin; head and body are each about half of the figure's height.
- The head is as wide as, or wider than, the shoulders; big round eyes.
- A short, round, stocky body; very short stubby legs with small round feet.

References (attached in this order):
1. <An identity reference — a head crop, an outfit crop with legs removed, or a full figure whose paws and proportions you have checked. Say what to take from it and what NOT to copy.>
2–3. The print Samurai and Classic Guardian — the finished drawing style (outline weight, stepped pixel-art-adjacent edges, cel shading, rich detail).
4. The Vizorcat proportion reference — the body proportions to match exactly.
5. The approved Vizorcat paw sheet.

The character (keep exactly): <coat and markings, eye colours by side, one permanent feature, outfit pieces, props and where each prop is carried without a paw holding it>.

Three different moments that show <personality>:
1 — <moment with a pose only this character would strike>
2 — <…>
3 — <…>

For all three: both arms clearly visible, never one-armed; both feet visible on the ground. Every visible paw has exactly four toe beans (two at the top, one lower on each side) around one palm pad, like panel A of the paw sheet, drawn large and clearly readable; no paw grips or rests on anything; no fingers, thumbs, knuckles, pointed or blob-like paws. Exactly two cat ears, each drawn once at normal length, through or in front of any headwear; nothing else looks like an ear. Non-sexual chibi animal mascot. No text, letters, numbers, runes, religious or occult symbols, logos, QR codes, frames, motion lines, ground shadow or scenery.
Background: transparent alpha if available; otherwise one perfectly flat pure #00FF00 chroma-key green. One image.
```

Variations that worked:

- Design sheets: make each of the three figures a different cat (coat plus one feature) in the same moment, to choose a design before choosing a pose.
- A thin handle: "held in one smooth mitten paw exactly like panel C", and add to reference 2–3 that the Samurai's fan paw is the model.
- Symmetric hides: "both paws tucked into the fur cuffs held together like a muff", "arms folded with both paws tucked under the opposite arms", "both arms folded under the capelet so it covers both evenly".

## Review spec (one per figure)

```text
<Name> (<context>): <coat, eyes by side, outfit, props with "(intended prop; no paw touches it)" where true>.
Pose: <the moment, including intended closed eyes or winks: "eyes closed (intended; closed eyes are correct)">.
Both arms clearly visible (fail if the figure reads as one-armed); both feet visible.
Every paw shown must have exactly four toe beans and one palm pad; no paw grips, holds or rests on anything; fail for finger segments, thumbs, knuckle lines, pointed paws and featureless blob paws.
Proportions: head about half of the full height, short stocky body, very short legs, like the print Vizorcats.
Decorative trims are not extra props. Known false positive: in a three-quarter view the nearer eye may look slightly larger than the farther one.
```

State every prop that belongs in the image, or the review fails it as extra; state every intended oddity (floating, a raised heel, a creature in a pocket), or the review fails it as a defect.
