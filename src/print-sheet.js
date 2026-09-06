// Two full-size A6 cards on landscape A4, with room for ordinary printer margins.
import { OUTPUT } from "./catalog.js";
export const SHEET = Object.freeze({
  width: 1754,
  height: 1240,
  cardWidth: 620,
  cardHeight: 874,
  y: 183,
  x: [222, 912],
});
export function sheetSlots(count) {
  return Array.from({ length: Math.ceil(count / 2) }, (_, page) =>
    SHEET.x.slice(0, Math.min(2, count - page * 2)).map((x, slot) => ({
      index: page * 2 + slot,
      x,
      y: SHEET.y,
      width: SHEET.cardWidth,
      height: SHEET.cardHeight,
    })),
  );
}
export function drawSheetCard(ctx, source, slot) {
  ctx.drawImage(
    source,
    OUTPUT.bleed,
    OUTPUT.bleed,
    OUTPUT.trimWidth,
    OUTPUT.trimHeight,
    slot.x,
    slot.y,
    slot.width,
    slot.height,
  );
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  for (const x of [slot.x, slot.x + slot.width])
    for (const y of [slot.y, slot.y + slot.height]) {
      const dx = x === slot.x ? -1 : 1,
        dy = y === slot.y ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(x + dx * 4, y);
      ctx.lineTo(x + dx * 16, y);
      ctx.moveTo(x, y + dy * 4);
      ctx.lineTo(x, y + dy * 16);
      ctx.stroke();
    }
}
