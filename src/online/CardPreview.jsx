import { useRef } from "react";
import { COMPANIONS, LAYOUTS } from "./card-data.js";
import { cardGeometry, companionBox, resizeCompanion, positionCompanion } from "./card-render.js";
import { svgUrl } from "./browser.js";

export function companionOverlapsQr(card) {
  const { qr } = cardGeometry(card.layout);
  if (card.companion === "none" || !qr) return false;
  const b = companionBox(card);
  return b.x < qr.x + qr.size && b.x + b.w > qr.x && b.y < qr.y + qr.size && b.y + b.h > qr.y;
}

export default function CardPreview({ card, svg, onPosition, onResize }) {
  const surface = useRef(null);
  const gesture = useRef(null);
  const box = companionBox(card);
  const { width, height } = LAYOUTS[card.layout];
  const path = COMPANIONS[card.companion].path;
  function move(x, y) {
    onPosition(positionCompanion(card, x, y));
  }
  return <div ref={surface} className="oc-editable-card" style={{ aspectRatio: `${width}/${height}` }}>
    <img src={svgUrl(svg.replace(/<image class="companion"[^>]*\/>/, ""))} alt={`Card preview for ${card.name || "your name"}`} width={width} draggable="false" />
    {path && <div className="oc-companion-selection" style={{ left: `${box.x / width * 100}%`, top: `${box.y / height * 100}%`, width: `${box.w / width * 100}%`, height: `${box.h / height * 100}%` }}><button
      type="button"
      className="oc-companion-handle"
      aria-label="Move Vizorcat"
      aria-describedby="oc-position-help"
      onPointerDown={event => {
        if (event.button !== 0) return;
        const rect = surface.current.getBoundingClientRect();
        gesture.current = { id: event.pointerId, px: event.clientX, py: event.clientY, x: box.x, y: box.y, sx: width / rect.width, sy: height / rect.height };
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus({ preventScroll: true });
      }}
      onPointerMove={event => {
        const g = gesture.current;
        if (g?.id === event.pointerId) move(g.x + (event.clientX - g.px) * g.sx, g.y + (event.clientY - g.py) * g.sy);
      }}
      onPointerUp={() => { gesture.current = null; }}
      onPointerCancel={() => { gesture.current = null; }}
      onLostPointerCapture={() => { gesture.current = null; }}
      onKeyDown={event => {
        const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
        if (!delta) return;
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        move(box.x + delta[0] * step, box.y + delta[1] * step);
      }}
    ><img src={`./${path}`} alt="" draggable="false" /></button>
    <button type="button" className="oc-companion-resize" aria-label="Resize Vizorcat" aria-describedby="oc-position-help"
      onPointerDown={event => {
        if (event.button !== 0) return;
        const rect = surface.current.getBoundingClientRect();
        gesture.current = { id: event.pointerId, card, px: event.clientX, py: event.clientY, sx: width / rect.width, sy: height / rect.height, w: box.w, h: box.h };
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus({ preventScroll: true });
      }}
      onPointerMove={event => {
        const g = gesture.current;
        if (g?.id !== event.pointerId) return;
        const dx = (event.clientX - g.px) * g.sx;
        const dy = (event.clientY - g.py) * g.sy;
        const ratio = 1 + (dx * g.w + dy * g.h) / (g.w * g.w + g.h * g.h);
        onResize(resizeCompanion(g.card, Number(g.card.companionScale) * ratio));
      }}
      onPointerUp={() => { gesture.current = null; }}
      onPointerCancel={() => { gesture.current = null; }}
      onLostPointerCapture={() => { gesture.current = null; }}
      onKeyDown={event => {
        const direction = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
        if (!direction && !["Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const scale = event.key === "Home" ? 50 : event.key === "End" ? 400 : Number(card.companionScale) + direction * (event.shiftKey ? 5 : 1);
        onResize(resizeCompanion(card, scale));
      }}
    ><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6M4 6v6h6" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></button>
    </div>}
  </div>;
}
