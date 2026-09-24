import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cardApi } from "./server/card-api.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function cardApiDev() {
  const cache = new Map();
  const middleware = async (req, res, next) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/pay") {
      req.url = `/pay.html${url.search}`;
      return next();
    }
    if (!url.pathname.startsWith("/api/")) return next();
    try {
      const response = await cardApi(new Request(url, { method: req.method }), async (asset) => {
        if (!cache.has(asset)) {
          const bytes = await fs.promises.readFile(path.join(projectRoot, asset));
          cache.set(asset, `data:${asset.endsWith(".png") ? "image/png" : asset.endsWith(".svg") ? "image/svg+xml" : "font/woff2"};base64,${bytes.toString("base64")}`);
        }
        return cache.get(asset);
      });
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch { res.writeHead(500); res.end("Card service unavailable"); }
  };
  return { name: "support-card-api", configureServer(server) { server.middlewares.use(middleware); }, configurePreviewServer(server) { server.middlewares.use(middleware); } };
}

function copyRuntimeFiles() {
  const sourceRoot = path.join(projectRoot, "assets");
  const files = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!["source", "qa", "concepts", "imagegen"].includes(entry.name)) visit(fullPath);
        continue;
      }
      const relative = path.relative(projectRoot, fullPath).split(path.sep).join("/");
      files.push([relative, fullPath]);
    }
  }
  visit(sourceRoot);
  files.push(["vendor/qrcode.js", path.join(projectRoot, "vendor/qrcode.js")]);
  files.push(["vendor/rare-ui-LICENSE.txt", path.join(projectRoot, "vendor/rare-ui-LICENSE.txt")]);
  files.push(["LICENSE", path.join(projectRoot, "LICENSE")]);
  files.push(["THIRD_PARTY_NOTICES.md", path.join(projectRoot, "THIRD_PARTY_NOTICES.md")]);
  files.push(["vendor/LICENSE", path.join(projectRoot, "vendor/LICENSE")]);
  files.push(["assets/logos/source/partner-logos.md", path.join(projectRoot, "assets/logos/source/partner-logos.md")]);
  for (const entry of fs.readdirSync(path.join(sourceRoot, "logos", "source"), { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".txt")) {
      files.push([`assets/logos/source/${entry.name}`, path.join(sourceRoot, "logos", "source", entry.name)]);
    }
  }
  return {
    name: "copy-runtime-files",
    generateBundle() {
      for (const [fileName, filePath] of files) {
        this.emitFile({ type: "asset", fileName, source: fs.readFileSync(filePath) });
      }
      this.emitFile({ type: "asset", fileName: ".nojekyll", source: "" });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), copyRuntimeFiles(), cardApiDev()],
  build: {
    target: "es2022",
    assetsInlineLimit: 0,
    rollupOptions: { input: { studio: path.join(projectRoot, "index.html"), online: path.join(projectRoot, "online.html"), support: path.join(projectRoot, "support.html"), pay: path.join(projectRoot, "pay.html") } },
  },
});
