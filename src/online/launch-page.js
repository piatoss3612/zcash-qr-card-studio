import { escapeXml, paymentUri } from "./card-data.js";

export const INVALID_LINK = "Invalid payment link. Ask the creator for a new card link.";

/**
 * Card details follow `#`, which browsers never send to the server. Links
 * made before that switch carried them in the query string; they still open.
 */
export function launchQuery({ hash, search }) {
  return hash.length > 1 ? hash.slice(1) : search.slice(1);
}

/**
 * Groups of four for reading aloud or comparing; the first and last eight
 * characters are emphasized because wallets commonly shorten to those.
 * Inline blocks keep copied text contiguous.
 */
function addressGroups(address) {
  const chunk = (text, tag) => (text.match(/.{1,4}/g) ?? []).map((group) => `<${tag}>${escapeXml(group)}</${tag}>`).join("");
  return chunk(address.slice(0, 8), "b") + chunk(address.slice(8, -8), "span") + chunk(address.slice(-8), "b");
}

/** Contents of the launch page's `<main>` for a validated card. */
export function launchMarkup(card) {
  const uri = escapeXml(paymentUri(card));
  return `<h1>Open your Zcash wallet</h1><p>Payment request for ${escapeXml(card.name)}${card.amount ? ` · ${escapeXml(card.amount)} ZEC` : ""}.</p><p>Trying to open your wallet. If nothing happens, use the button below.</p><a id="wallet" href="${uri}">Open wallet</a><section class="check" aria-labelledby="check-title"><h2 id="check-title">Check the address before you confirm</h2><p>Compare these characters with the address the creator published where you found this card, and with the address your wallet shows. This page alone cannot prove who owns the address.</p><dl class="ends"><div><dt>Starts with</dt><dd>${escapeXml(card.address.slice(0, 8))}</dd></div><div><dt>Ends with</dt><dd>${escapeXml(card.address.slice(-8))}</dd></div></dl><p class="addr" aria-label="Full receiving address">${addressGroups(card.address)}</p></section><label for="request"><p>Or copy the payment request into a compatible wallet.</p></label><textarea id="request" rows="4" readonly>${uri}</textarea><p>Opening a wallet does not send funds. Review the request in your wallet.</p>`;
}
