# Support card: editorial concept 01

2026-09-21. Visual exploration only, not a production payment card. The user rejected the previous framed SVG card designs and requested reference-led image concepts before further implementation.

## References and direction

- Pentagram / Super Peach: https://www.pentagram.com/work/super-peach — strong type, sparse palette, and free-standing illustration. Composition principles only; no copied artwork or wordmarks.
- Read.cv profile archive: https://www.saasui.design/pattern/profile/read-cv — reference for restrained profile information and whitespace, not a claim about the current service.
- Exact character authority: `/Users/rowan/keplr-workspace/vizorcat/originals/vizorcat-standard/model-sheet.png`, SHA-256 `a3e66263b046c92391f691a7a3613f555faba67c05a6d91373990e624d84b303`. Inspected before generation and provided to the built-in tool. This is an authoring-only reference; no runtime code references the sibling repository.

One continuous ivory surface, large name, two-line introduction, free-standing standard Vizorcat, unframed QR placeholder, and a plain text support link. No internal panel, avatar circle, orbital ring, or pill button.

## Generation and QA

Built-in image generation was used serially. Exact prompts are in `source/editorial-01-prompt.txt` and `source/editorial-01-background-fix.txt`.

The first output unexpectedly had a transparent background, making black type difficult to see on a dark viewer. It is retained only as `source/editorial-01-transparent-draft.png`. A targeted image-tool edit added an opaque ivory background. Final visual: `editorial-01.png`.

Final file: 1681 × 936 pixels; all pixels fully opaque; SHA-256 `cb79b7823784e9b82370a690ade8f85a410d79f7f58d0822015a623b25e15365`.

The final render was inspected: all ears, paws and tail are in frame; the character and text do not overlap the QR region; internal containers are absent; the name and supporting copy are legible. The character follows the supplied Standard's compact proportions and face at concept level, but this is not a newly approved production character asset. No live asset registration or editor scale claim is made.

The QR is generated placeholder artwork and must never be used for payments. Production would replace it with the existing deterministic ZIP-321 QR, reserve its true quiet zone, and size it for the actual payload. At a 480px embed width this concept's QR is too small for some address payloads; enlarge it or retain click-through support as the primary action. Production typography and the exact approved character PNG must be composed separately instead of shipping this entire raster as the payment card.

No application code was changed in this concept round. The existing implementation is not treated as design-approved.

## Revision 02: identity and one action

`editorial-02.png` uses the existing repository `assets/logos/zcash-coin.png` as the logo reference, replacing the wordmark. One `Support ↗` action sits beside the QR; both redundant previous labels are removed. Generated via built-in image editing from revision 01; reference roles and edit instructions are recorded in `source/editorial-02-prompt.txt`.

Identity contract for implementation: a required public display name accepts either a full name or a nickname verbatim; an optional handle is a separate secondary field. Do not infer or require legal/given/family names, split nicknames, or force all names into two lines. Line wrapping follows available width. When display name and handle are redundant, omit the optional handle. The `rowan` / `@rowan` text is illustrative, not an assertion about account ownership.

Visual QA: one logo and one action are present; original cat pose and complete silhouette are retained; no internal frame was added; QR space remains separate. The generated QR remains non-production. For implementation, use the exact repository logo asset rather than a generated approximation. No application code changes in this round.

## Revision 03: reading size and QR allocation

`editorial-03.png` was generated with the built-in image editing tool from revision 02. Exact requested edits are in `source/editorial-03-prompt.txt`. Removed the duplicate handle, enlarged the bio, action and QR placeholder, and reduced the character while retaining the borderless ivory surface and Zcash logo.

Visual inspection: one name, one action, no internal frames, complete character silhouette and separated QR region. The generated output did not precisely follow every requested dimension: the QR is approximately 19% rather than the requested 28% of image width, and the heading stayed close to its prior width. It is a composition draft, not a resolved production QR layout. QR scanning, real payment content, long-name adaptation and final embed-size typography remain unverified. No runtime code or live assets changed.

## Revision 04: direct payment and separate project link

Built-in image edit from editorial-03.png; exact prompt in source/editorial-04-prompt.txt. Output editorial-04.png is a composition preview of the card PLUS a separate project link row, not a single image to ship as the embed.

User clarification supersedes the earlier support-page contract: activating the payment card should invoke its ZIP-321 zcash: URI directly. The QR encodes the same request. A featured GitHub project is a separate link beneath the card. No intermediary donation/support page is intended. Existing application code has NOT yet been updated to this corrected interaction contract; GitHub sanitization and OS wallet handoff remain unverified.

Removed Support text; retained one small arrow as the card-level affordance. Typeface reference requested Space Grotesk Medium for the name and Geist Regular for body; generated lettering is illustrative, not verification of actual font usage. rowan/privacy-tools is a fictional example, not a selected real repository. QR is a non-production placeholder.

Visual inspection: one name, no duplicate handle or Support label, one Zcash logo, unframed QR/cat, separate project row outside the ivory payment surface. Character remains fully in frame. The generated QR is again smaller than requested; production must allocate size from the real payload and preserve its quiet zone. No code changes or new live asset registration in this round.

## Revision 05: repository as card information

User accepted presenting the featured repository as identity information rather than a separately clickable link. This supersedes revision 04's external link row. Built-in image edit from editorial-04.png; exact prompt in source/editorial-05-prompt.txt; output editorial-05.png.

Composition: one display name, introduction, GitHub icon with plain owner/repository credit inside the card, QR, free-standing Vizorcat, Zcash logo and one small corner arrow. The project has no underline or adjacent arrow. Whole-card intended activation remains direct ZIP-321, and QR represents the same request. No intermediary support page. The fictional rowan/privacy-tools credit and generated QR are concept-only.

Visual QA: external row removed; repository is below bio and separated from QR; all cat ears, paws and tail are visible; no inner frame or Support copy. The generated QR is approximately 19% of image width despite requesting 25%; final implementation must size the real encoded QR independently. Generated font appearance is not proof of a particular font file. No application code or live assets changed in this concept round; current app still requires the previously identified interaction-contract update.

## Revision 06: redistribute information

Built-in image edit of editorial-05.png. Exact prompt: source/editorial-06-prompt.txt. Output: editorial-06.png. Reduced bio prominence, retained the name/bio at upper left, and moved the plain GitHub repository credit beside the lower-left QR. The QR and character retain their approximate size and placement. Visual inspection confirms the repository is no longer in the upper text stack, no element overlaps the QR data area, and the full character remains visible. Small-size repository legibility and a real QR quiet zone still require implementation testing; this is a concept, not a scannable payment card. The repository credit is not a separate link. Intended card-level action remains direct ZIP-321. No app code changed.

## Revision 07: remove featured work

User explicitly removed featured repository information because the README already contains it. This supersedes revisions 04–06: no repository name, GitHub icon, external project row, or featured-work field is planned for this card.

Built-in precise removal edit from editorial-06.png; exact prompt source/editorial-07-prompt.txt; output editorial-07.png. Visually inspected: project text and icon removed, empty space retained, remaining name/bio, QR placeholder, full Vizorcat, Zcash logo and corner arrow preserved. Concept only, no app-code changes; QR is not a real payment request. Intended whole-card interaction remains direct ZIP-321.
