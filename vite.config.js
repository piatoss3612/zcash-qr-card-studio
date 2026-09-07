import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

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
  plugins: [react(), copyRuntimeFiles()],
  build: {
    target: "es2022",
    assetsInlineLimit: 0,
  },
});
