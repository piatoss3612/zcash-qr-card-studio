# Third-party notices

## Rare UI Gooey Nav

- Project: <https://github.com/swamimalode07/rare-ui>
- Registry component: `gooey-nav` (adapted for this Vite React app by removing the Next.js pathname/link adapter)
- License: MIT
- Source file: `src/components/GooeyNav.tsx`
- Copyright: Swami Malode, 2026
- Full license text: `vendor/rare-ui-LICENSE.txt`

The component keeps the registry's Motion spring geometry and Gooey seam
animation. Its app-specific adapter uses local buttons because this studio is
a single static page without Next.js routing.

## React static build

- React and React DOM: MIT, <https://github.com/facebook/react>
- Vite: MIT, <https://github.com/vitejs/vite>
- Motion: MIT, <https://github.com/motiondivision/motion>
- Tailwind CSS: MIT, <https://github.com/tailwindlabs/tailwindcss>

## qrcode-generator

- Project: <https://github.com/kazuhikoarase/qrcode-generator>
- Version: 2.0.4
- License: MIT
- Vendored file: `vendor/qrcode.js`

The full license text is preserved in `vendor/LICENSE`.

## CipherScan app icon

- Project: <https://github.com/Kenbak/cipherscan>
- Source: `public/icon-512.png`
- License: MIT
- Vendored file: `assets/logos/cipherscan.png`

The source repository's license text is preserved in `assets/logos/source/cipherscan-license.txt`.

## Fonts

| Font | Files | License | Source |
|---|---|---|---|
| Geist, Geist Mono | `assets/fonts/geist-*.woff2` | SIL Open Font License 1.1 | <https://github.com/vercel/geist-font> |
| Space Grotesk | `assets/fonts/space-grotesk-variable.woff2` | SIL Open Font License 1.1 | <https://github.com/floriankarsten/space-grotesk> |
| Silkscreen | `assets/fonts/silkscreen-*.woff2` | SIL Open Font License 1.1 | <https://github.com/kottke/silkscreen> |
| Zarathustra | `assets/fonts/zarathustra-v01.woff2` | Vizor brand typeface | Bundled with the Vizor brand kit |

Google Fonts builds of Space Grotesk, Silkscreen and Geist Mono are vendored as woff2 (latin subset) so the studio never loads fonts from the network.

## Brand marks

NEAR, Keystone, Ledger, Zcash, Keplr, Valar Group, Zakura, and CipherScan names and logos remain the property of their respective owners. The editor includes copies used for a Vizor relationship, integration, supported hardware, network, or adjacent ecosystem surface. See `assets/logos/source/partner-logos.md` for provenance and local display adjustments.
