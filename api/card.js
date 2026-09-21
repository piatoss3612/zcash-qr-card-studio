import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cardApi } from "../server/card-api.js";

const assets = new Map();
async function loadAsset(path) {
  if (!assets.has(path)) {
    const bytes = await readFile(join(process.cwd(), path));
    const type = path.endsWith(".png") ? "image/png" : path.endsWith(".svg") ? "image/svg+xml" : "font/woff2";
    assets.set(path, `data:${type};base64,${bytes.toString("base64")}`);
  }
  return assets.get(path);
}

export default {
  fetch(request) {
    // Preserve all card parameters whether called directly or through the SVG rewrite.
    const url = new URL(request.url);
    url.pathname = "/api/card.svg";
    return cardApi(new Request(url, { method: request.method }), loadAsset);
  },
};
