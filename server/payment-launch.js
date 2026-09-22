import { parseCard, paymentUri, escapeXml } from "../src/online/card-data.js";

export const LAUNCH_SCRIPT = "window.addEventListener('load',()=>{try{window.location.assign(document.getElementById('wallet').href)}catch{}},{once:true});";
// SHA-256 of LAUNCH_SCRIPT; tests recompute it so the policy cannot drift from the script.
export const LAUNCH_SCRIPT_HASH = "sha256-l6Eqvq1gif1XYfqyKn5fLnP+aOa8bk1n9YZbRjwuZxg=";

const headers = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": `default-src 'none'; style-src 'unsafe-inline'; script-src '${LAUNCH_SCRIPT_HASH}'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
};

/**
 * Groups of four for reading aloud or comparing; the first and last eight
 * characters are emphasized because wallets commonly shorten to those.
 * Inline blocks keep copied text contiguous.
 */
function addressGroups(address) {
  const chunk = (text, tag) => (text.match(/.{1,4}/g) ?? []).map((group) => `<${tag}>${escapeXml(group)}</${tag}>`).join("");
  return chunk(address.slice(0, 8), "b") + chunk(address.slice(8, -8), "span") + chunk(address.slice(-8), "b");
}

export async function paymentLaunch(request) {
  if (!["GET", "HEAD"].includes(request.method))
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  let card;
  try { card = await parseCard(new URL(request.url).search.slice(1)); }
  catch { return new Response("Invalid payment link. Ask the creator for a new card link.", { status: 400, headers }); }
  const uri = escapeXml(paymentUri(card));
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Open Zcash wallet</title>
<style>body{margin:0;background:#f8f6ed;color:#171916;font:16px/1.5 system-ui;display:grid;min-height:100svh;place-items:center}main{width:min(420px,calc(100% - 48px));padding:32px 0}h1{font-size:28px}a{display:inline-block;padding:14px 22px;background:#304b2b;color:white;border-radius:8px;text-decoration:none}textarea{box-sizing:border-box;width:100%;margin-top:20px;padding:12px;font:13px/1.5 monospace}p{color:#50574b}a:focus-visible{outline:3px solid #b27a00;outline-offset:4px}.check{margin-top:28px;padding:16px 18px;border:1px solid #d9d6c8;border-radius:12px;background:#fffdf7}.check h2{margin:0 0 6px;font-size:17px;line-height:1.3}.check p{margin:0 0 14px;font-size:14px}.ends{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 14px}.ends dt{font-size:12px;color:#50574b}.ends dd{margin:2px 0 0;font:600 18px/1.3 ui-monospace,monospace;overflow-wrap:anywhere}.addr{margin:0;font:13px/1.9 ui-monospace,monospace;color:#50574b}.addr b,.addr span{display:inline-block;margin-right:.5em}.addr b{color:#171916}</style>
<main><h1>Open your Zcash wallet</h1><p>Payment request for ${escapeXml(card.name)}${card.amount ? ` · ${escapeXml(card.amount)} ZEC` : ""}.</p><p>Trying to open your wallet. If nothing happens, use the button below.</p><a id="wallet" href="${uri}">Open wallet</a><section class="check" aria-labelledby="check-title"><h2 id="check-title">Check the address before you confirm</h2><p>Compare these characters with the address the creator published where you found this card, and with the address your wallet shows. This page alone cannot prove who owns the address.</p><dl class="ends"><div><dt>Starts with</dt><dd>${escapeXml(card.address.slice(0, 8))}</dd></div><div><dt>Ends with</dt><dd>${escapeXml(card.address.slice(-8))}</dd></div></dl><p class="addr" aria-label="Full receiving address">${addressGroups(card.address)}</p></section><label for="request"><p>Or copy the payment request into a compatible wallet.</p></label><textarea id="request" rows="4" readonly>${uri}</textarea><p>Opening a wallet does not send funds. Review the request in your wallet.</p></main>
<script>${LAUNCH_SCRIPT}</script></html>`;
  return new Response(request.method === "HEAD" ? null : html, { headers });
}
