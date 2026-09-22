# Online support card redesign

Scope: React editor, deterministic SVG card renderer, and support page styles. Reviewed against repository `AGENTS.md` and the six `interfaces:better-*` domain skills. Existing approved character assets, payment schema, and print editor behavior are preserved.

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | Native controls, accessible names and pressed states, inline errors, keyboard activation, focus styles | Two systemic issues fixed; real screen reader not verified |
| Layout | Desktop 1280px, mobile 390px and 320px, CSS 200% zoom, long names, QR composition | Card-first preview and responsive layout implemented |
| Writing | Editor labels, empty state, validation, sharing instructions | Vague instructions replaced with explicit actions |
| Typography | Local font files, UI text sizes, SVG text wrapping | Larger UI text; pixel headings separated from readable body text |
| Colors | Semantic UI tokens and measured card text/background pairs | All measured body text pairs exceed 4.5:1 |
| UI | Three card styles, native input controls, selected states, icons, support page | Distinct frames and treatments; consistent SVG control icons |

## Resolved findings

| Severity | Domain | Location | Before | After | Why |
| --- | --- | --- | --- | --- | --- |
| HIGH | Accessibility | `src/online/OnlineStudio.jsx:160` | Disabled exports left users to find errors beneath the preview | An export attempt shows inline name/address errors, associates descriptions, and focuses the missing field | Make recovery discoverable and operable |
| MEDIUM | Layout | `src/online/OnlineStudio.jsx:401` | A large mock README competed with the card | Card canvas by default; optional README, narrow width, and dark context controls | The designed output gets visual priority |
| MEDIUM | Layout | `src/online/online.css:1475` | Mobile preview came after the entire form | Preview appears before the form | Let users see the card before configuring it |
| MEDIUM | Typography | `src/online/online.css:928` | Most labels and help were 9–11px | Labels 14px, supporting copy 12–14px, mobile inputs 16px | Improve reading and interaction at normal scale |
| MEDIUM | Colors | `src/online/online.css:928` | Many low-contrast olive text shades | Shared ink, muted, line, paper and action tokens | Maintain readable hierarchy without faint text |
| MEDIUM | UI | `src/online/card-render.js:86` | Styles mostly changed color and font | Paper inset print panel; Midnight orbital frame; Pixel hard borders and game-like header | Give each style an identifiable composition |
| MEDIUM | Typography | `src/online/card-render.js:77` | Pixel font used for all content | Pixel display text with Geist body and action text | Preserve personality without sacrificing small-text readability |
| LOW | Writing | `src/online/OnlineStudio.jsx:213` | “Your little corner”, “Give it a home” | Explicit card purpose, “Your details”, “Share your card” | Reduce interpretation while creating and sharing |
| LOW | UI | `src/online/OnlineStudio.jsx:16` | Unicode glyphs used as toolbar icons | Shared stroked SVG icons; controls at least 44px high | Consistent appearance and usable targets |

## Verification

Passed:

- `npm test`: 99 tests passed, including ZIP-321, independent QR decoding, and API tests.
- `npm run build`: production build passed. Existing classic-script warning for print editor `vendor/qrcode.js` remains.
- `npm run check:worker`: local deployment dry run passed; no deployment performed.
- `git diff --check`: passed.
- Local Worker browser: Paper, Midnight, Pixel, profile/QR layouts, long names, inline validation, and support page visually inspected.
- Keyboard Space activated the focused Paper style button and changed `aria-pressed` to `true`.
- 320px and 390px editor/support views had no horizontal overflow. CSS zoom 200% at a 1280px viewport had no horizontal overflow; this is not a claim about native browser zoom.
- PNG export independently decoded with `node scripts/verify-online-png.mjs output/playwright/redesign-qr-export.png`; receiving address and `label=Rowan Park` matched the configured public test vector.
- Measured sRGB contrast ratios: Paper body 12.39:1 / secondary 5.06:1; Midnight 14.14:1 / 8.15:1; Pixel 11.53:1 / 4.66:1; UI secondary on paper 6.37:1, on canvas 5.82:1; primary action 9.42:1; inline errors 7.23:1; focus ring on paper 4.97:1.

Visual evidence lives in ignored `output/playwright/redesign-*.png`: before, desktop, midnight, pixel, QR, mobile, support, long-name, and zoom captures.

Not verified: real VoiceOver/screen-reader walkthrough, native browser zoom, real wallet handoff, deployed GitHub Camo rendering, and a complete automated accessibility audit. No remote changes or production deployment were performed.

## Verdict

Approve within the inspected local visual and interaction scope. No known HIGH findings remain; the unverified environments above are not covered by this verdict.

## 2026-09-21 card artwork review

Scope: the SVG card artwork from `src/online/card-render.js` in all styles and
layouts, reviewed with `interfaces:better-interface` and its six domain skills
against rendered cards (long, short and CJK copy; fixed amounts). Verdict before
fixes: Block (one HIGH). All findings below are fixed.

| Severity | Domain | Finding | Fix |
| --- | --- | --- | --- |
| HIGH | Typography | A 32-character name and an 80-character introduction were cut mid-word with an ellipsis although both were within the input limits | Width-based wrapping and size stepping fit the full copy; word-boundary truncation only as a flagged last resort with an editor note |
| MEDIUM | UI | Five styles were one composition recolored; Paper≈Editorial, Midnight≈Terminal | One signature surface per style (inset panel, orbits, pixel frame, masthead bar, scanlines and cursor) |
| MEDIUM | Colors | `muted`, `accent` and `border` tokens were never rendered; the introduction used `ink` | Introduction uses `muted` (≥4.5:1 on every surface; Blueprint muted lightened to pass on grid lines) |
| MEDIUM | UI | Sharp, edgeless cards vanished on a README of the same tone (Paper on white 1.08:1) | Rounded or notched card shape with a low-opacity edge |
| MEDIUM | Typography | The fixed amount was 13px | 16px with tabular figures |
| MEDIUM | Layout | The amount floated away from the QR | Grouped with the QR in each layout |
| MEDIUM | Writing | Profile had no QR and no words naming the action | "Support with Zcash" line in Profile only |
| LOW | Layout | Stray edges (QR 20px, text 28px, logo 26px, QR bottom 12px) | Shared 20px inset (24px Compact, 12px under Signature's QR so the name keeps its size); QR tile outlined on light styles |

Verification: `npm test` (116, including a length-limit test across every style and
layout), `npm run build`, `npm run check:worker`, rendered sheets for all styles
and layouts, and QR decoding of rasterized editor previews (Paper, Pixel,
Terminal). Not verified: screen readers, physical wallet scanning.
