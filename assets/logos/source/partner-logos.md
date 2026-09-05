# Partner and integration logo sources

Most logo copies came from local Vizor and Keplr repositories. Valar Group, Zakura, CipherScan, ZecHub, Project Tachyon, and Cypherpunk were fetched individually from their official sites or repositories because no reusable local brand asset was available.

- NEAR Intents: copied from `vizor-wallet-website/assets/svg/near-logo.svg`; Vizor surfaces it as the payment route provider.
- Keystone: copied from `vizor-wallet-website/assets/svg/keystone.svg`; Vizor surfaces it as supported hardware.
- Ledger: copied from `vizor-wallet/assets/icons/ledger_brand.svg`; Vizor surfaces it as supported hardware.
- Zcash Mark: copied from `vizor-wallet/assets/icons/zcash_currency.svg`; Vizor uses Zcash as its primary network and currency surface.
- Zcash Coin: copied from `vizor-wallet/assets/icons/network_zec.png`; this is the 96×96 yellow coin mark used by Vizor Wallet's network UI.
- ZecHub: downloaded from `https://zechub.wiki/zechubLogo.png`; the deployed wiki asset is byte-identical to `ZecHubBlue.png` in the official `ZecHub/zechub` repository. The source is a transparent 4500×4500 PNG licensed under the repository's CC BY-SA 4.0 license and was downscaled to 512×512 without changing its geometry or colors.
- Cypherpunk: the live logo was downloaded on 2026-09-03 from `https://www.cypherpunk.com/icon.svg?icon.2i947yu28iyj0.svg`, the official site's 240×242 rounded-square icon. The original is preserved as `cypherpunk-square-official.svg`; the live `cypherpunk.svg` is byte-identical. The separately fetched 136×20 header wordmark is preserved as `cypherpunk-wordmark-official.svg` but is not registered in the editor. A rasterized render check is preserved as `qa/cypherpunk-square-preview.png`. The official site states that CYPHERPUNK, CYPHERPUNK MINING, and CYPHERPUNK TECHNOLOGIES are trademarks of Cypherpunk Technologies Inc.
- Project Tachyon: downloaded on 2026-09-03 from `https://tachyon.z.cash/assets/tachyon/v1/logo-1000x1000.png`, the logo file served by the project's official website linked from the `tachyon-zcash` GitHub organization. The 1000×1000 source is preserved as `tachyon-logo-1000x1000.png`; the editor copy was downscaled to 512×512 without changing its geometry, colors, or transparency.
- Keplr: copied from `keplr-wallet/docs/static/img/keplr-logo.svg`; the source geometry and brand colors are unchanged.
- Valar Group: downloaded from `https://valargroup.dev/apple-touch-icon.png`; the official 180×180 site mark is unchanged.
- Zakura: downloaded from `https://zakura.com/zakura-flower-v1.svg`; path geometry and brand colors are unchanged, with whitespace-only formatting applied in the project copy.
- CipherScan: downloaded from `https://github.com/Kenbak/cipherscan/blob/main/public/icon-512.png`; the repository manifest designates it as the 512×512 PWA app icon. The image is unchanged and its MIT license notice is preserved in `cipherscan-license.txt`.

The QR Card Studio copies preserve the original geometry. Fixed near-white fills in the Keystone and Ledger copies were changed to `#141818`. The Zcash Mark copy also changes its near-white app fill to `#141818`. The Zcash Coin and CipherScan copies are unchanged raster assets. The ZecHub and Project Tachyon copies are resolution-reduced only. The Cypherpunk live copy is byte-identical to the official square SVG and keeps its own black field, neon-green border, and glow; it therefore does not use the editor's white rendering mode. The NEAR Intents copy keeps its path geometry but replaces the website-only responsive sizing, preserves the native aspect ratio, and sets its existing fill variable to `#141818`. These adjustments keep the monochrome marks visible and undistorted on print-card backgrounds. Source repository assets were not modified.

Brand names and logos remain the property of their respective owners. Inclusion in the editor library indicates a Vizor relationship, integration, supported device, network, or adjacent ecosystem project, not a general endorsement of every generated card.

## Usage-terms check (2026-09-05)

Checked the public brand pages and policies of every third-party mark in the editor. This is a documentation-level review, not legal advice.

| Mark | Basis found | Standing | Notes |
|---|---|---|---|
| Zcash Mark, Zcash Coin | Zcash Foundation trademark policy (`https://zfnd.org/zcash-trademark-policy/`) | Allowed | Logos may be used "to indicate that you accept payment in the Zcash cryptocurrency" or that a product "supports Zcash"; merchandise is allowed. Your own branding must stay more prominent. Colour changes are not addressed. |
| ZecHub | Repository license CC BY-SA 4.0 | Allowed with attribution | Attribution is carried in `THIRD_PARTY_NOTICES.md`. Downscaled only. |
| CipherScan | Repository license MIT | Allowed | License text preserved in `cipherscan-license.txt`. |
| Keplr | Own company asset | Allowed | — |
| Ledger | `brand.ledger.com` and the press kit (`https://www.ledger.com/press`) | Conditional | Public assets are addressed to "a Ledger partner, affiliate"; permission and colour rules live in the press-kit PDF and were not verified. The editor copy changes the near-white fill to ink. |
| Keystone | Public media kit (Google Drive linked from `blog.keyst.one`) | Conditional | No usage terms published. The editor copy changes the near-white fill to ink. |
| NEAR Intents | `near.org/brand` and `pages.near.org/about/*` redirect to docs as of this check | Unverified | Only basis is Vizor's payment-route relationship. The editor copy changes the fill variable to ink. |
| Cypherpunk | Site footer: "CYPHERPUNK, CYPHERPUNK MINING, and CYPHERPUNK TECHNOLOGIES are all trademarks of Cypherpunk Technologies Inc." | Unverified | No usage guidelines published. Copy is byte-identical to the official icon. |
| Project Tachyon | `tachyon.z.cash`: "actively developed by community members" | Unverified (low risk) | No trademark holder or license stated. |
| Valar Group | `valargroup.dev` | Unverified | No legal, brand or press information on the site. |
| Zakura | `zakura.com` | Unverified | No legal, brand or press information on the site. |

Consequences applied in the editor:

- The Logos drawer separates "Vizor & Zcash" marks from a folded "Partner logos" section that carries a caution note (check with the brand owner before printing; keep original colours).
- For a public deployment that is not run by Vizor, the partner section should be reviewed mark by mark; marks whose fill was changed to ink (Ledger, Keystone, NEAR Intents) should be restored to their original colours or removed until confirmed.
