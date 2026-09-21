// Decode an exported card or a screenshot of its QR using an independent reader.
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { PNG } from "pngjs";
import jsQR from "jsqr";

const [filename, expectedUri] = process.argv.slice(2);
if (!filename) {
  console.error(
    "Usage: node scripts/verify-online-png.mjs <png> [expected-zcash-uri]",
  );
  process.exit(1);
}
const image = PNG.sync.read(await fs.readFile(filename));
const decoded = jsQR(
  new Uint8ClampedArray(image.data),
  image.width,
  image.height,
);
assert.ok(decoded, "No readable QR was found in the image.");
assert.ok(
  decoded.data.startsWith("zcash:"),
  "The QR is not a Zcash payment request.",
);
if (expectedUri)
  assert.equal(
    decoded.data,
    expectedUri,
    "The QR destination or payment details differ.",
  );
console.log(
  `Decoded ZIP-321 (${image.width} × ${image.height}): ${decoded.data}`,
);
