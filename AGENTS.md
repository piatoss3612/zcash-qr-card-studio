# Zcash QR Card Studio Rules

These rules apply to image generation, image editing, asset registration, and editor changes across the entire repository. This project is deployed independently as a static site, so all runtime assets referenced by HTML, CSS, or JavaScript must use repository-local relative paths.

When an original Vizorcat or Theme asset is needed, use the separate local `vizorcat` project only as an authoring reference. Copy approved assets used by the card editor, along with their generation records, into this repository under `assets/`. Deployed code must never reference a sibling repository directly.

## Serial visual work

- Do not run image generation or editing, large image loads, and browser screenshot verification concurrently.
- Complete one image at a time: generate or edit it, run local QA, organize source and rejected variants, and register the live asset before starting the next image.
- Capture browser screenshots only at round boundaries and use downscaled images. Do not declare a visual change complete until it has been checked on the user-visible surface.

## Character identity gate

- Before generating a character, use the approved Vizorcat Standard or the relevant Variant model sheet from the source Vizorcat project, and record the exact reference in the asset's `source/` notes.
- Reject results that depart from the Standard's head-to-body ratio, short limbs, round paws, ear, eye, and tail construction, or pixel density.
- A Theme may change clothing, equipment, props, and actions only. It must not alter the cat's height, body shape, facial structure, permanent features, or Variant identity.
- Do not force a mechanical visor onto every character merely because the product is named Vizor. If an approved Theme is already expressed through a hood, helmet, mask, or other clothing, the face may remain free of additional equipment.

## Editor scale gate

- Before registering a character in the live catalog, measure both its actual alpha bounds and its `contain` render size in the editor.
- The reference box for the Centered layout is `500 × 650px`. Given a `defaultScale` of `s`, PNG dimensions of `w × h`, and a trimmed alpha silhouette height of `alphaHeight`, calculate the expected display height as `min(500s / w, 650s / h) × alphaHeight`.
- New characters should normally render between `510–590px` high. If a role-specific prop requires a value outside that range, document the reason in the source record and obtain user approval before registration.
- When a character falls outside the range, adjust its `defaultScale` in `src/catalog.js`; do not overwrite the PNG with an arbitrary resized copy.
- Record the PNG dimensions, alpha silhouette dimensions, `defaultScale`, and expected display height in the asset's source notes.

## Alpha and visual QA gate

- Every live character PNG must use genuine RGBA transparency. Never register an image with a checkerboard baked into its RGB pixels.
- Composite a downscaled candidate over light, dark, and magenta backgrounds to check for residual edge pixels, lost white props, and checkerboard fragments trapped inside enclosed spaces.
- The full character, every limb, both ears, the tail, and all role-specific props must remain inside the frame without accidental duplication.
- The source record, final file SHA-256, and manifest SHA-256 must match.

## QR composition gate

- Backgrounds and default templates must not intrude on the payment QR data area, its quiet zone, or the lower-left installation guidance area.
- Character and logo layers remain movable, but their default placement must not cover either QR code or the installation guidance.
