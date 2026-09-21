import { parseCard, paymentUri, escapeXml } from "../src/online/card-data.js";

const headers = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

export async function paymentLaunch(request) {
  if (!["GET", "HEAD"].includes(request.method))
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  let card;
  try { card = await parseCard(new URL(request.url).search.slice(1)); }
  catch { return new Response("Invalid payment link. Ask the creator for a new card link.", { status: 400, headers }); }
  const uri = escapeXml(paymentUri(card));
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Open Zcash wallet</title>
<style>body{margin:0;background:#f8f6ed;color:#171916;font:16px/1.5 system-ui;display:grid;min-height:100svh;place-items:center}main{width:min(420px,calc(100% - 48px));padding:32px 0}h1{font-size:28px}a{display:inline-block;padding:14px 22px;background:#304b2b;color:white;border-radius:8px;text-decoration:none}textarea{box-sizing:border-box;width:100%;margin-top:20px;padding:12px;font:13px/1.5 monospace}p{color:#50574b}a:focus-visible{outline:3px solid #b27a00;outline-offset:4px}</style>
<main><h1>Open your Zcash wallet</h1><p>Payment request for ${escapeXml(card.name)}${card.amount ? ` · ${escapeXml(card.amount)} ZEC` : ""}.</p><p>Trying to open your wallet. If nothing happens, use the button below.</p><a id="wallet" href="${uri}">Open wallet</a><label for="request"><p>Or copy the payment request into a compatible wallet.</p></label><textarea id="request" rows="4" readonly>${uri}</textarea><p>Opening a wallet does not send funds. Review the request in your wallet.</p></main>
<script>window.addEventListener('load',()=>{try{window.location.assign(document.getElementById('wallet').href)}catch{}} ,{once:true});</script></html>`;
  return new Response(request.method === "HEAD" ? null : html, { headers });
}
