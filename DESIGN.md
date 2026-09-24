---
name: Zcash QR Card Studio
description: A quiet stationer's desk for composing Zcash support cards.
colors:
  forest: "#334b2e"
  fern: "#466743"
  moss-focus: "#54793e"
  bark-ink: "#242922"
  lichen: "#596154"
  sage-stroke: "#aeb7a6"
  dry-sage-line: "#c9cec2"
  sprout-tint: "#e9eee2"
  stage-linen: "#f3f4ed"
  pale-linen: "#eeefe8"
  cream-paper: "#fffef9"
  field-white: "#ffffff"
  parchment: "#f6efdc"
  parchment-ink: "#4d3b12"
  brick: "#9a3328"
typography:
  display:
    fontFamily: "Geist, \"Geist Fallback\", Arial, sans-serif"
    fontSize: "clamp(26px, 3.8vw, 52px)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Geist, \"Geist Fallback\", Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist, \"Geist Fallback\", Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  lead:
    fontFamily: "Geist, \"Geist Fallback\", Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, \"Geist Fallback\", Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Geist, \"Geist Fallback\", Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  field:
    fontFamily: "Geist, \"Geist Fallback\", Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  control:
    fontFamily: "Geist, \"Geist Fallback\", Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  hint:
    fontFamily: "Geist, \"Geist Fallback\", Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Geist, \"Geist Fallback\", Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "GeistMono, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  thumb: "5px"
  control: "8px"
  panel: "12px"
  workspace: "18px"
  pill: "999px"
spacing:
  field-gap: "20px"
  group: "24px"
  panel: "28px"
  gutter: "40px"
  touch: "44px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.cream-paper}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    height: "46px"
  button-secondary:
    backgroundColor: "{colors.cream-paper}"
    textColor: "{colors.bark-ink}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    height: "46px"
  input-field:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.bark-ink}"
    typography: "{typography.field}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
    height: "46px"
  option-selected:
    backgroundColor: "{colors.sprout-tint}"
    textColor: "{colors.bark-ink}"
    rounded: "{rounded.control}"
    padding: "14px 10px"
  panel:
    backgroundColor: "{colors.cream-paper}"
    rounded: "{rounded.panel}"
    padding: "24px"
  workspace:
    backgroundColor: "{colors.cream-paper}"
    rounded: "{rounded.workspace}"
  preview-stage:
    backgroundColor: "{colors.stage-linen}"
    padding: "28px 32px"
  notice:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.parchment-ink}"
    rounded: "{rounded.control}"
    padding: "12px"
---

# Design System: Zcash QR Card Studio

## Overview

**Creative North Star: "The Stationer's Desk"**

The Embed editor is a quiet desk for composing one small card. Everything around the card is cream paper, linen and dry sage, set in Geist with tight editorial headlines and Geist Mono for code. The card itself is the only object allowed real colour: its eight styles, the Vizorcat character and the QR carry the personality, while the desk stays calm enough that a creator can judge the card as it will look in a README.

Density is moderate and form-led: a 340px column of three numbered steps (details, design, share) beside a preview stage that stays in view while the steps scroll, generous 44px touch targets, and hints in 13px muted text directly under the controls they explain. Depth comes from tonal layering (linen page, paper workspace, linen stage) rather than shadows. The Print studio is a secondary tool with its own photo-editor chrome (neutral greys and a crimson brand in `styles.css`); this document governs the Embed family: the Embed editor, the support cards, and the `/pay` launch page.

**Key Characteristics:**
- Cream and linen surfaces, one deep forest accent, no decorative gradients in the chrome.
- The support card is the most saturated thing on screen.
- Geist throughout, Geist Mono only for embed code and addresses.
- Tonal layers instead of elevation; shadows only under the card and floating pills.
- 44px minimum interactive height, visible 3px focus outline.

## Colors

A low-chroma sage and cream palette with a single deep forest accent, so the colourful card reads as the subject.

### Primary
- **Deep Forest** (#334b2e): primary buttons, selected-option rings, action links in the share panel, format icons. One primary action per group.
- **Fern** (#466743): the Paper card's accent and the navigation focus outline; the lighter sibling of Deep Forest.
- **Moss Focus** (#54793e): the 3px focus outline on every button, link, field and summary.

### Neutral
- **Bark Ink** (#242922): headings, field text, body copy.
- **Lichen** (#596154): hints, captions, secondary labels, inactive options.
- **Sage Stroke** (#aeb7a6): field and secondary-button borders, where an edge must be seen.
- **Dry Sage Line** (#c9cec2): panel and workspace hairlines, where an edge only separates.
- **Sprout Tint** (#e9eee2): background of a selected option.
- **Stage Linen** (#f3f4ed): the preview stage behind the card.
- **Pale Linen** (#eeefe8): the page ground.
- **Cream Paper** (#fffef9): workspace, panels, secondary buttons, primary-button text.
- **Field White** (#ffffff): text-field interiors, so inputs read as writable against cream.

### Semantic
- **Parchment** (#f6efdc) with **Parchment Ink** (#4d3b12): informational notices, such as the "this address came from a link" warning.
- **Brick** (#9a3328): field errors, invalid borders and error validation text.

### Named Rules
**The Card Owns the Colour Rule.** Chrome stays within the sage, linen and cream neutrals plus Deep Forest. Saturated hues belong to the card styles, not to the editor around them.

**The No New Greys Rule.** Reuse the neutral tokens above. The incumbent CSS carries a dozen near-duplicate one-off greens and greys (for example #f1f4eb, #f0f2ed, #e1e8d5); new work must not add more, and touched code should fold them into the nearest token.

## Typography

**Display Font:** Geist (with a metric-matched Arial fallback)
**Label/Mono Font:** Geist Mono (with monospace)

**Character:** A single neo-grotesk carries everything, tightened at display sizes for an editorial masthead feel; Geist Mono is reserved for the literal things a creator copies: embed code and addresses. Geist stays because the cards themselves are set in it under the immutable v=1 card contract, so the desk and the card read as one voice.

Geist ships as three static files: Regular (400), Medium (500) and Bold (600–800), so there are three real weights and 600 renders as Bold. "Geist Fallback" is Arial scaled to Geist's width and line box, so the swap barely reflows. Every role sets an explicit line height.

### Hierarchy
- **Display** (500, clamp(26px, 3.8vw, 52px), 1.08, −0.035em, balanced): the page heading, once per page.
- **Headline** (500, 22px, 1.2, −0.03em; 17px on phones): preview-area heading ("Your card").
- **Title** (700, 17px, 1.3, −0.015em): numbered step titles in the settings column.
- **Lead** (400, 16px, 1.5; 14px on phones): the line under the page heading.
- **Label** (500, 14px, 1.4): field labels, legends and summaries; buttons use the same size and weight.
- **Body** (400, 14px, 1.6): explanations and panel copy, in Lichen when secondary.
- **Field** (400, 15px, 1.5; 16px on phones so fields do not zoom): text inside inputs, selects and textareas.
- **Control** (500, 13px, 1.4): small controls and text actions (segments, preview toggles, Open wallet, Reset).
- **Hint** (400, 13px, 1.5): helper text, status, notices and errors; tone comes from colour, not from a size step.
- **Caption** (400, 12px, 1.5): option descriptions, footer, the "Made for Zcash" note and the Match badge (at 700).
- **Mono** (Geist Mono 400, 13px, 1.5): embed code and the receiving address; step badges use Geist Mono 12px with tabular figures.

### Named Rules
**The One Face Rule.** Chrome is set in Geist and Geist Mono only. Card-only faces (Silkscreen, Zarathustra, Space Grotesk) never appear in editor chrome except inside style thumbnails that preview a card.

## Layout

A centred page up to 1440px with a 40px gutter (24px below 1100px, 16px below 760px). The page heading sits above a single bordered workspace: a 340px settings column (310px below 1100px) holding the three steps, and a flexible preview area whose stage is sticky (24px from the top) on screens at least 761px wide and 640px tall. Below 760px the workspace becomes one column, and a compact preview leads the editable fields.

Vertical rhythm inside the control column: 20px between fields, 24px between fieldsets, 30px above each numbered section title, 28px panel padding. Every interactive element is at least 44px tall; coarse pointers get 44px even on compact controls.

## Elevation & Depth

Flat by default. Depth is tonal: Pale Linen page, Cream Paper workspace, Stage Linen preview area, Cream Paper panels inside it. Shadows are reserved for objects that float above the desk.

### Shadow Vocabulary
- **Card lift** (`filter: drop-shadow(0 12px 18px #26301c14)`): under the card preview only.
- **Pill lift** (`box-shadow: 0 1px 3px #17231f14`): the active segment of the Embed/Print switch.
- **Sheet lift** (`box-shadow: 0 2px 4px #24292208, 0 24px 60px #2429220c`): the support-page panel.

### Named Rules
**The Only the Card Floats Rule.** Panels, fields and buttons sit flat on their surface; a shadow means "this is the card or floats over the desk".

## Shapes

Gently rounded, with the radius growing with the size of the surface: 5px style thumbnails, 8px controls and notices, 12px panels, 18px for the workspace frame, full pills for the navigation switch. Hairline 1px borders define every container; there are no thick frames in the chrome. The Pixel card style is the deliberate exception, with square corners and a hard offset shadow on its support page.

## Components

### Buttons
Calm and solid, never loud.
- **Shape:** 8px radius, 46px tall, 14px Geist Medium, 14px gap between icon and label.
- **Primary:** Deep Forest fill with Cream Paper text; one per action group (for example Copy Markdown).
- **Secondary:** Cream Paper fill, Sage Stroke border, Bark Ink text.
- **Text actions:** Deep Forest text links at 12–13px and 44px tall (small actions, Open wallet).
- **Disabled:** 45% opacity with a not-allowed cursor.
- **Focus:** 3px Moss Focus outline, 3px offset.

### Option Tiles
Format, layout and style choices are pressable tiles (`aria-pressed`).
- **Rest:** Sage Stroke border, Lichen text, 8px radius.
- **Selected:** Deep Forest border plus a 1px inset Deep Forest ring on a Sprout Tint fill.
- **Style thumbnails:** a 76px mini card drawn in that style's own colours, framed with a 5px radius; the selected thumbnail gets a Deep Forest outline.

### Inputs / Fields
- **Style:** Field White interior, Sage Stroke border, 8px radius, 46px minimum height, 11px 12px padding, 15px Field text.
- **Label:** 14px Bark Ink above the field; optional fields add a Lichen "Optional" tag.
- **Error:** Brick border and Brick error text beneath.
- **Focus:** 3px Moss Focus outline.

### Navigation
- **Embed/Print switch:** Embed first, since it is the home page. A 9px-radius tray in #edf0e7 with 36px Geist segments (44px on coarse pointers). The current segment is a Cream Paper chip with Pill lift.
- **Topbar:** 76px tall on Cream Paper with a hairline bottom border; the Vizorcat head mark and "QR Card Studio / Made for Zcash" lead.

### Notices
Parchment background, Parchment Ink text, 8px radius, 13px copy, with an underlined inline action in the same ink.

### Preview Stage (signature)
The card is shown on Stage Linen, in a stage that stays in view while the steps scroll, in one of two contexts. README mode is a mock README page; canvas mode is a dotted linen or dark ground (14px dot grid) that isolates the card. The card carries Card lift, and the Vizorcat can be dragged and resized in place.

### Support Card (signature)
The product itself: an SVG in four layouts (Signature, Compact, Portrait, Profile) and eight styles: Paper, Midnight, Pixel, Editorial, Terminal, Aurora, Blueprint and Airmail. Each style owns its palette in `STYLES` in `src/online/card-data.js` (the source of truth) and one signature surface (for example the Airmail envelope stripes and postmark stamp, or the Blueprint drafting grid). Every QR sits on a white square with its four-module quiet zone; companions, logos and surfaces never overlap the QR or its quiet zone.

## Do's and Don'ts

### Do:
- **Do** keep the card the most colourful element on screen; chrome stays in the neutral tokens plus Deep Forest.
- **Do** use one Deep Forest primary button per action group; everything else is secondary or a text action.
- **Do** make every interactive element at least 44px tall and keep the 3px Moss Focus outline visible.
- **Do** put helper text in 13px Lichen directly under the control it explains.
- **Do** separate surfaces by tone (linen, paper, stage) and hairlines before reaching for a shadow.
- **Do** keep the card in view while the creator makes design choices; the preview stage is sticky beside the steps.

### Don't:
- **Don't** add new one-off greys or greens; use the neutral tokens (The No New Greys Rule).
- **Don't** set chrome text in Arial or card-only faces.
- **Don't** put a kicker or eyebrow label above a heading; the heading carries its own weight.
- **Don't** let any card layer, surface or companion cover the QR or its four-module quiet zone.
- **Don't** add decorative shadows to panels, fields or buttons (The Only the Card Floats Rule).
