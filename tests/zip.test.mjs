import test from "node:test";
import assert from "node:assert/strict";

import { createZip, crc32 } from "../src/zip.js";

const encoder = new TextEncoder();

async function readZip(files) {
  const blob = createZip(files);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return { blob, bytes, view: new DataView(bytes.buffer) };
}

function findSignature(view, signature) {
  const offsets = [];
  for (let offset = 0; offset + 4 <= view.byteLength; offset += 1) {
    if (view.getUint32(offset, true) === signature) offsets.push(offset);
  }
  return offsets;
}

test("crc32 matches the known value for 'hello'", () => {
  assert.equal(crc32(encoder.encode("hello")), 0x3610a686);
  assert.equal(crc32(new Uint8Array(0)), 0);
});

test("createZip returns an application/zip Blob", async () => {
  const { blob } = await readZip([{ name: "a.txt", data: encoder.encode("hello") }]);
  assert.equal(blob.type, "application/zip");
  assert.ok(blob.size > 0);
});

test("createZip writes local headers, a central directory and an EOCD", async () => {
  const { bytes, view } = await readZip([
    { name: "card-001.png", data: encoder.encode("hello"), lastModified: new Date(2026, 8, 3, 20, 24, 30) },
    { name: "card-002.png", data: encoder.encode("second file"), lastModified: new Date(2026, 8, 3, 20, 24, 30) },
  ]);

  assert.equal(view.getUint32(0, true), 0x04034b50);
  assert.equal(findSignature(view, 0x02014b50).length, 2);

  const eocdOffset = bytes.length - 22;
  assert.equal(view.getUint32(eocdOffset, true), 0x06054b50);
  assert.equal(view.getUint16(eocdOffset + 8, true), 2, "entries on this disk");
  assert.equal(view.getUint16(eocdOffset + 10, true), 2, "total entries");

  const centralSize = view.getUint32(eocdOffset + 12, true);
  const centralOffset = view.getUint32(eocdOffset + 16, true);
  assert.equal(centralOffset + centralSize, eocdOffset);
  assert.equal(view.getUint32(centralOffset, true), 0x02014b50);
});

test("createZip stores the payload uncompressed with its crc and sizes", async () => {
  const payload = encoder.encode("hello");
  const { bytes, view } = await readZip([{ name: "a.txt", data: payload }]);

  assert.equal(view.getUint16(8, true), 0, "method 0 = store");
  assert.equal(view.getUint32(14, true), 0x3610a686, "crc32 of hello");
  assert.equal(view.getUint32(18, true), payload.length, "compressed size");
  assert.equal(view.getUint32(22, true), payload.length, "uncompressed size");
  assert.equal(view.getUint16(26, true), "a.txt".length);
  assert.equal(view.getUint16(28, true), 0, "no extra field");

  const nameStart = 30;
  const name = new TextDecoder().decode(bytes.slice(nameStart, nameStart + 5));
  assert.equal(name, "a.txt");
  const dataStart = nameStart + 5;
  assert.deepEqual([...bytes.slice(dataStart, dataStart + payload.length)], [...payload]);
});

test("central directory entries point at their local headers", async () => {
  const { view } = await readZip([
    { name: "one.bin", data: new Uint8Array([1, 2, 3]) },
    { name: "two.bin", data: new Uint8Array([4, 5]) },
  ]);
  const [first, second] = findSignature(view, 0x02014b50);

  assert.equal(view.getUint32(first + 42, true), 0);
  const secondOffset = view.getUint32(second + 42, true);
  assert.equal(secondOffset, 30 + "one.bin".length + 3);
  assert.equal(view.getUint32(secondOffset, true), 0x04034b50);
  assert.equal(view.getUint32(second + 16, true), crc32(new Uint8Array([4, 5])));
});

test("createZip encodes the DOS timestamp and flags non-ascii names", async () => {
  const stamp = new Date(2026, 8, 3, 20, 24, 30);
  const { view } = await readZip([{ name: "카드.png", data: encoder.encode("x"), lastModified: stamp }]);
  assert.equal(view.getUint16(6, true), 0x0800, "utf-8 name flag");
  assert.equal(view.getUint16(10, true), (20 << 11) | (24 << 5) | 15);
  assert.equal(view.getUint16(12, true), ((2026 - 1980) << 9) | (9 << 5) | 3);
});

test("createZip handles an empty file list", async () => {
  const { bytes, view } = await readZip([]);
  assert.equal(bytes.length, 22);
  assert.equal(view.getUint32(0, true), 0x06054b50);
  assert.equal(view.getUint16(8, true), 0);
});
