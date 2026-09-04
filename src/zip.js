// DOM-free store-only ZIP writer (method 0): local headers + central directory + EOCD.

const LOCAL_SIGNATURE = 0x04034b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const EOCD_SIGNATURE = 0x06054b50;
const VERSION = 20;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? (value >>> 1) ^ 0xedb88320 : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

/** @returns {number} CRC-32 of the bytes, as an unsigned 32-bit integer. */
export function crc32(bytes) {
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[index]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** @returns {{ time: number, date: number }} MS-DOS timestamp fields. */
function dosTimestamp(date) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function isAscii(bytes) {
  for (const byte of bytes) if (byte > 0x7f) return false;
  return true;
}

/**
 * Build a store-only ZIP archive.
 * @param {{ name: string, data: Uint8Array, lastModified?: Date }[]} files
 * @returns {Blob} `application/zip`
 */
export function createZip(files) {
  const encoder = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data);
    const stamp = dosTimestamp(file.lastModified instanceof Date ? file.lastModified : new Date());
    const checksum = crc32(data);
    const flags = isAscii(nameBytes) ? 0 : 0x0800;

    const local = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, LOCAL_SIGNATURE, true);
    localView.setUint16(4, VERSION, true);
    localView.setUint16(6, flags, true);
    localView.setUint16(8, 0, true); // method: store
    localView.setUint16(10, stamp.time, true);
    localView.setUint16(12, stamp.date, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true); // extra field length
    local.set(nameBytes, 30);

    const entry = new Uint8Array(46 + nameBytes.length);
    const entryView = new DataView(entry.buffer);
    entryView.setUint32(0, CENTRAL_SIGNATURE, true);
    entryView.setUint16(4, VERSION, true);
    entryView.setUint16(6, VERSION, true);
    entryView.setUint16(8, flags, true);
    entryView.setUint16(10, 0, true);
    entryView.setUint16(12, stamp.time, true);
    entryView.setUint16(14, stamp.date, true);
    entryView.setUint32(16, checksum, true);
    entryView.setUint32(20, data.length, true);
    entryView.setUint32(24, data.length, true);
    entryView.setUint16(28, nameBytes.length, true);
    entryView.setUint16(30, 0, true); // extra
    entryView.setUint16(32, 0, true); // comment
    entryView.setUint16(34, 0, true); // disk number
    entryView.setUint16(36, 0, true); // internal attributes
    entryView.setUint32(38, 0, true); // external attributes
    entryView.setUint32(42, offset, true);
    entry.set(nameBytes, 46);

    parts.push(local, data);
    central.push(entry);
    offset += local.length + data.length;
  }

  const centralSize = central.reduce((total, entry) => total + entry.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, EOCD_SIGNATURE, true);
  endView.setUint16(4, 0, true); // this disk
  endView.setUint16(6, 0, true); // disk with central directory
  endView.setUint16(8, central.length, true);
  endView.setUint16(10, central.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  endView.setUint16(20, 0, true); // comment length

  return new Blob([...parts, ...central, end], { type: "application/zip" });
}
