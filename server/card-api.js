import { MAX_QUERY_LENGTH, parseCard } from "../src/online/card-data.js";
import { renderCard } from "../src/online/card-render.js";

const BASE_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};

export async function cardApi(request, loadAsset) {
  const url = new URL(request.url);
  if (!["GET", "HEAD"].includes(request.method))
    return new Response("Method not allowed", {
      status: 405,
      headers: { ...BASE_HEADERS, Allow: "GET, HEAD" },
    });
  if (url.pathname.endsWith("/api/health"))
    return Response.json(
      { service: "zcash-support-cards", version: 1 },
      { headers: { ...BASE_HEADERS, "Cache-Control": "no-store" } },
    );
  if (!url.pathname.endsWith("/api/card.svg"))
    return new Response("Not found", { status: 404, headers: BASE_HEADERS });
  if (url.search.length > MAX_QUERY_LENGTH + 1)
    return new Response("Card link is too long", {
      status: 414,
      headers: BASE_HEADERS,
    });
  let card;
  try {
    card = await parseCard(url.search.slice(1));
  } catch (error) {
    return new Response(error.message, {
      status: 400,
      headers: { ...BASE_HEADERS, "Cache-Control": "no-store" },
    });
  }
  try {
    const svg = await renderCard(card, loadAsset);
    return new Response(request.method === "HEAD" ? null : svg, {
      headers: {
        ...BASE_HEADERS,
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
        "Content-Security-Policy":
          "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; sandbox",
      },
    });
  } catch (error) {
    if (error.message.startsWith("This QR is too dense"))
      return new Response(error.message, {
        status: 400,
        headers: BASE_HEADERS,
      });
    return new Response(
      "Card images are temporarily unavailable. Try again shortly.",
      {
        status: 503,
        headers: { ...BASE_HEADERS, "Cache-Control": "no-store" },
      },
    );
  }
}
