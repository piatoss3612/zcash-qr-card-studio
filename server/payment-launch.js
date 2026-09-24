/**
 * The launch page (`pay.html`) is static and reads card details after `#` in
 * the browser, so these headers are its only server-side part. vercel.json
 * repeats them; tests keep the two in sync.
 */
export const LAUNCH_HEADERS = {
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};
