# Event Studio screen concept

Open `http://127.0.0.1:4173/design-plans/event-studio-concept/` while the repository's static server is running. `app.html` opens the concept without the review controls.

This is a separate design artifact. The current application and live catalog are unchanged. All fonts, artwork and the QR library use repository-local relative paths.

## Surfaces

- Content and design views, with desktop and 390px mobile presentations.
- Payment sign and gift card, both at an A6 aspect ratio.
- Single-card and gift-batch output review. The sample batch has 100 rows: 97 valid unique items, 2 repeated rows and 1 invalid row. The exclusion checkbox enables the mock final action.

Event name, booth name and amount update the preview. Theme and character selection preserve those fields; character selection replaces one character. Undo and redo cover content, purpose, theme and character edits. Mobile keeps these buttons visible and allows the card preview to expand.

## Design direction and feedback

The first pass was rejected as feeling like AI slop. The second pass removes promotional headings, repeated rounded containers and circular step indicators, and restores the existing background art. Keep the accepted input-first workflow; this feedback concerns its visual and editorial expression, not a reversal of the event-use direction.

Use plain task labels and compact controls. The existing illustrations carry the personality. Do not cover most of the artwork with generic white panels or add explanatory banners where a clear label would do.

## Boundaries

- Every QR encodes `https://example.com/qr-card-preview`. Payment addresses and gift links entered in the mockup do not generate real QR payloads.
- Print checks and batch counts are explicitly illustrative. There is no live validation, batch ingestion, claim tracking, print generation or download.
- Source artwork is reused without editing, new generation or catalog registration.
- A6 is the card aspect ratio, not a physical print-size guarantee. Long real gift-link density and printed readability still require production validation.
- Gift creation instructions and the ordering of installation/claim steps are proposed copy, to verify against the intended wallet flow before implementation.

## Visual inspection

Reviewed in Chrome: desktop screens, both card layouts including their lower instruction areas, and the 390px mobile content view. Character bounds are below the main QR and beside the installation panel. No physical printing or wallet scan test was performed.
