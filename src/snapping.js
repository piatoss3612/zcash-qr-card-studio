// DOM-free snap computation for the drag interaction: canvas centre, safe area, other layers.

const KIND_PRIORITY = { center: 0, edge: 1, safe: 2 };

/** @returns {{position: number, kind: string}[]} candidate lines on one axis. */
function candidateLines(axis, targets, canvas) {
  const size = axis === "x" ? canvas.width : canvas.height;
  const inset = canvas.safeInset ?? 94;
  const lines = [
    { position: size / 2, kind: "center" },
    { position: inset, kind: "safe" },
    { position: size - inset, kind: "safe" },
  ];

  for (const target of targets ?? []) {
    const start = axis === "x" ? target.x : target.y;
    const extent = axis === "x" ? target.width : target.height;
    lines.push({ position: start, kind: "edge" });
    lines.push({ position: start + extent / 2, kind: "center" });
    lines.push({ position: start + extent, kind: "edge" });
  }
  return lines;
}

function bestForAxis(axis, box, targets, canvas, threshold) {
  const start = axis === "x" ? box.x : box.y;
  const extent = axis === "x" ? box.width : box.height;
  const boxLines = [start, start + extent / 2, start + extent];

  const hits = [];
  for (const line of candidateLines(axis, targets, canvas)) {
    for (const boxLine of boxLines) {
      const delta = line.position - boxLine;
      if (Math.abs(delta) <= threshold) hits.push({ ...line, delta });
    }
  }
  if (hits.length === 0) return { delta: 0, guides: [] };

  hits.sort((a, b) => {
    const distance = Math.abs(a.delta) - Math.abs(b.delta);
    if (Math.abs(distance) > 1e-9) return distance;
    return KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind];
  });

  const { delta } = hits[0];
  const seen = new Set();
  const guides = hits
    .filter((hit) => Math.abs(hit.delta - delta) < 1e-9)
    .filter((hit) => {
      const key = `${hit.position}:${hit.kind}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind])
    .map((hit) => ({ axis, position: hit.position, kind: hit.kind }));

  return { delta, guides };
}

/**
 * Snap a moving box to canvas centre lines, the safe area and other layers.
 * @param {{ box: object, targets?: object[], canvas: object, threshold?: number }} options
 * @returns {{ dx: number, dy: number, guides: {axis: 'x'|'y', position: number, kind: string}[] }}
 */
export function computeSnap({ box, targets = [], canvas, threshold = 12 }) {
  const x = bestForAxis("x", box, targets, canvas, threshold);
  const y = bestForAxis("y", box, targets, canvas, threshold);
  return { dx: x.delta, dy: y.delta, guides: [...x.guides, ...y.guides] };
}
