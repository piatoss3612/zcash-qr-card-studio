# Vercel deployment

## Repository setup

- Repository root: this project, not `dist`.
- Framework: Vite (configured in `vercel.json`).
- Node.js: 22.
- Install: `npm ci`.
- Build: `npm test && npm run build`.
- Static output: `dist`.
- Environment: no required variables. Remove an old `VITE_CARD_SERVICE_URL`
  override when the editor, image API and launch route share this deployment.
- Import the intended branch. Current development work is not on `main` until
  explicitly merged; importing the unchanged remote branch will not include it.

## Routes

| Public route | Implementation |
| --- | --- |
| `/` | Embed-card editor, `dist/index.html` |
| `/online` or `/online.html` | rewrite to `dist/index.html`, for links made before Embed became the home page |
| `/print` | rewrite to `dist/print.html`, the A6 print editor |
| `/api/health` | `api/health.js` |
| `/api/card.svg?...` | rewrite to `api/card.js` |
| `/pay#...` | rewrite to `dist/pay.html`, with headers from `vercel.json` |

The image function includes local PNG/SVG artwork and WOFF2 fonts explicitly.
Asset source/license records are needed during the Vite build, so do not exclude
those build inputs. No database, upload storage or external image service is
required. Shared card data is public. The launch page is static: it reads the
card from the link's `#` fragment in the browser, validates it and attempts to
open a ZIP-321 URI once, leaving a manual Open wallet link available.

## Account connection

Use the Vercel dashboard to import the GitHub repository, or authenticate the
installed CLI with `vercel login`, then link the intended account/project.
`vercel pull` and `vercel build` require a valid project connection. Do not treat
a local Vite build as proof of Vercel's production packaging.

For public use, the production card image and launch route must be accessible
without Vercel authentication. Use a stable production domain in READMEs, not an
expiring or protected preview URL.

## After deployment

1. Open `/api/health` without signing in; expect the card-service JSON.
2. Open `/`, enter a public test address, and copy Markdown.
3. Open its image URL in a separate signed-out session; expect an SVG image,
   not a login page, HTML document or missing-font/asset error.
4. Paste Markdown into GitHub's README preview; verify the image and HTTPS link.
5. Click the card: `/pay#…` attempts wallet launch and leaves the fallback
   button. Verify recipient, amount and memo in the intended desktop/mobile
   wallets. No transfer is necessary. `curl -I` on `/pay` should show the
   `Content-Security-Policy` and `X-Frame-Options` headers from `vercel.json`.
6. Download a PNG and independently decode its QR with
   `node scripts/verify-online-png.mjs path/to/card.png`.

GitHub Pages deployment has been removed from the repository. The remaining
GitHub Actions workflow verifies tests and the static build only.
