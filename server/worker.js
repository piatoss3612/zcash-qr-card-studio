import { LAUNCH_HEADERS } from "./payment-launch.js";
import { cardApi } from "./card-api.js";

const assets = new Map();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/pay") {
      // Assets serve pay.html for /pay; only the headers are added here.
      const page = await env.ASSETS.fetch(request);
      const response = new Response(page.body, page);
      for (const [key, value] of Object.entries(LAUNCH_HEADERS)) response.headers.set(key, value);
      return response;
    }
    // /online predates Embed becoming the home page; old editing links still use it.
    if (url.pathname === "/online" || url.pathname === "/online.html")
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    return cardApi(request, async (path) => {
      if (assets.has(path)) return assets.get(path);
      const response = await env.ASSETS.fetch(
        new Request(new URL(`/${path}`, url.origin)),
      );
      if (!response.ok) throw new Error("Missing card asset");
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 8192)
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      const data = `data:${path.endsWith(".png") ? "image/png" : path.endsWith(".svg") ? "image/svg+xml" : "font/woff2"};base64,${btoa(binary)}`;
      assets.set(path, data);
      return data;
    });
  },
};
