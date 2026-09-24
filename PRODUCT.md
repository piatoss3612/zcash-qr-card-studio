# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: developers and creators who want voluntary Zcash support.** They put a support card on a GitHub README, profile or personal website. In the Embed editor (the home page, `/`) they enter a display name and receiving address, pick a layout, style and Vizorcat, then copy Markdown/HTML (live embed) or commit a PNG next to their README (static embed). Embed cards are the flagship feature (confirmed 2026-09-24); design and effort decisions serve this job first.
- **Supporters.** They meet a card on someone else's page, scan its QR or click it, land on the `/pay` launch page, compare the receiving address, and hand the ZIP-321 request to their own wallet.
- **Secondary: people making printed cards.** The Print editor makes A6 payment-request, Vizor gift and link cards for events, onboarding, education and promotion. It is a secondary feature: kept working, but not the front door or the lead of navigation, copy or investment.

## Product Purpose

Let anyone make a Zcash card that gets the exact payment request they intended into a supporter's wallet. No account, card database or tracking is involved. Success means a supporter's wallet opens the right recipient, amount and memo, and the creator has shared nothing beyond what they chose to publish.

## Positioning

A Zcash community tool. It does not funnel users into any single wallet. Its mechanism is privacy by construction:

- Print designs never leave the browser.
- Embed settings live only in the URL, and no card database is kept.
- The launch page reads card details from the URL fragment, so the server never learns who is paying whom.
- A static embed takes the service out of the QR path entirely.

Wallet-neutral ZIP-321 requests, plus the Vizorcat character library, set it apart from generic QR generators.

## Operating Context

- **GitHub READMEs.** GitHub strips `zcash:` links and serves images through its Camo proxy. QR layouts therefore carry the payment, and the card image links to the HTTPS launch page.
- **Other sites.** Personal websites and other Markdown/HTML renderers may allow `zcash:` links directly.
- **Hosting.** Vercel hosts the editors, the image service (`/api/card.svg`) and the static launch page (`/pay`). Pushes to `main` deploy production.
- **Wallets.** Supporters use any ZIP-321-compatible wallet on desktop or mobile. Opening a wallet does not send funds; the wallet shows its own confirmation.
- **Print.** Printed output is A6 cards and A4 sheets, used at events and onboarding sessions.

## Capabilities and Constraints

- **Embed cards:**
  - Layouts: Signature, Compact, Portrait and Profile (Profile has no QR).
  - Eight styles and 19 Vizorcats.
  - Corner logos: Zcash, Vizor, Vizorcat, Zakura and Tachyon (Valar Group is withdrawn from the picker but still renders on existing cards).
  - Output: live or static embed and PNG download. Editing links keep settings in the URL fragment.
- **Public card contract.** Card links are versioned (`v=1`) and immutable. Changing rendered output or fields for an existing version breaks deployed cards, so it needs a new version.
- **Validation:**
  - Mainnet addresses only, with no TEX addresses.
  - Checksum spelling checks run on client and server.
  - Name is limited to 32 characters, introduction to 80, memo to 80.
  - Memos are allowed only for Sapling and unified addresses.
- **Print cards:**
  - Card types: payment request (ZIP-321), Vizor gift card and link.
  - Editing: templates, layers, text, QR styling, batch ZIP export and design files.
  - Current output: A6 PNG at 1311×1819 px, 300 ppi, with 35 px bleed, printed to 105×148 mm trim.
- **Gift links are secrets.** Anyone holding the link can claim the funds. They never go into file names, logs, saved designs or drafts.
- **Assets.**
  - Runtime assets are repository-local.
  - Character, alpha, scale and QR-composition gates in `AGENTS.md` govern new artwork.
  - The QR, its quiet zone and the installation guidance area must never be covered by default placements.
- **UI copy** is currently English only. This is a current state, not a binding commitment.

## Brand Commitments

- **Name and lines.** Name: Zcash QR Card Studio. Existing lines: "Print A6 QR cards or create personal Zcash support cards for the web." and "A little card for the things you build."
- **Vizorcat.** Vizorcat is the character library, and the Classic Guardian head is the app icon (`assets/vizorcat-icon.png`, `assets/logos/vizorcat-classic-head.png`). Character identity rules in `AGENTS.md` are binding.
- **Vizor.** Vizor appears where its mechanism is the product (gift cards and their install layer), as the Vizorcat art, and as an optional logo. Payment cards carry no wallet install prompt.
- **Third-party marks.** These follow `THIRD_PARTY_NOTICES.md` and `assets/logos/source/partner-logos.md`.
- **Artwork licence.** Character and background artwork is AI-assisted. It may be used in exported cards for lawful event, onboarding, educational and promotional use, but not redistributed as a standalone collection.

## Evidence on Hand

- **Live README examples.** They use the maintainer's receiving address in the Airmail, Aurora and Blueprint styles (`README.md`).
- **Artwork.** Character and logo assets have source records under `assets/characters/source/` and `assets/logos/source/`. Editorial concept images are in `design-plans/support-card-concepts/`.
- **Absences.** There are no testimonials, adoption numbers, usage analytics (none are collected, by design) or published wallet-compatibility results. Wallet handoff on physical devices has not been verified. Do not fabricate any of these.

## Product Principles

1. **Privacy by construction.** Collect nothing the job does not need. There are no accounts, card database, analytics or payment tracking. Card details stay out of server requests wherever the browser can do the work. Any feature that needs the server to learn more must justify it explicitly.
2. **Wallet-neutral payments.** Payment cards use standard ZIP-321 requests any compatible wallet can open, and never push a particular wallet.
3. **Verification over trust.** Give supporters ways to check what they are paying: address comparison on the launch page, static embeds, and immutable versioned card links. Do not ask them to trust the service.
4. **Embed first.** Embed cards are the product; Print is a secondary tool. When the two compete for attention, placement or effort, the creator making a support card and the supporter acting on it win. Print stays supported.
