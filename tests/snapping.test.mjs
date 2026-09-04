import test from "node:test";
import assert from "node:assert/strict";

import { computeSnap } from "../src/snapping.js";

const canvas = { width: 1311, height: 1819, bleed: 35, safeInset: 94 };
const CENTER_X = 1311 / 2;
const CENTER_Y = 1819 / 2;

test("returns no snap when nothing is within the threshold", () => {
  const result = computeSnap({ box: { x: 300, y: 400, width: 100, height: 100 }, targets: [], canvas });
  assert.deepEqual(result, { dx: 0, dy: 0, guides: [] });
});

test("snaps the box centre to the canvas centre on both axes", () => {
  const box = { x: CENTER_X - 200 + 5, y: CENTER_Y - 150 - 4, width: 400, height: 300 };
  const result = computeSnap({ box, targets: [], canvas });
  assert.equal(result.dx, -5);
  assert.equal(result.dy, 4);
  assert.deepEqual(result.guides, [
    { axis: "x", position: CENTER_X, kind: "center" },
    { axis: "y", position: CENTER_Y, kind: "center" },
  ]);
});

test("snaps an edge to the safe area", () => {
  const result = computeSnap({ box: { x: 100, y: 400, width: 200, height: 100 }, targets: [], canvas });
  assert.equal(result.dx, -6);
  assert.deepEqual(result.guides, [{ axis: "x", position: 94, kind: "safe" }]);

  const right = computeSnap({
    box: { x: 1311 - 94 - 200 + 3, y: 400, width: 200, height: 100 },
    targets: [],
    canvas,
  });
  assert.equal(right.dx, -3);
  assert.deepEqual(right.guides, [{ axis: "x", position: 1311 - 94, kind: "safe" }]);
});

test("snaps to another layer's edge", () => {
  const targets = [{ id: "other", x: 500, y: 700, width: 200, height: 200 }];
  const result = computeSnap({ box: { x: 494, y: 400, width: 90, height: 100 }, targets, canvas });
  assert.equal(result.dx, 6);
  assert.deepEqual(result.guides, [{ axis: "x", position: 500, kind: "edge" }]);
});

test("reports every line that matches the applied offset", () => {
  // box left ↔ target left (500) and box right ↔ target centre (600) both need dx = 6.
  const targets = [{ id: "other", x: 500, y: 700, width: 200, height: 200 }];
  const result = computeSnap({ box: { x: 494, y: 400, width: 100, height: 100 }, targets, canvas });
  assert.equal(result.dx, 6);
  assert.deepEqual(result.guides, [
    { axis: "x", position: 600, kind: "center" },
    { axis: "x", position: 500, kind: "edge" },
  ]);
});

test("prefers a centre line over an edge line on a tie", () => {
  const targets = [{ id: "other", x: 145, y: 700, width: 100, height: 200 }];
  const result = computeSnap({ box: { x: 200, y: 400, width: 50, height: 50 }, targets, canvas });
  assert.equal(result.dx, -5);
  assert.equal(result.guides[0].kind, "center");
  assert.equal(result.guides[0].position, 195);
  assert.deepEqual(
    result.guides.map((guide) => guide.kind),
    ["center", "edge"],
  );
});

test("takes the nearest candidate when several are in range", () => {
  const targets = [
    { id: "near", x: 508, y: 700, width: 400, height: 100 },
    { id: "far", x: 513, y: 700, width: 600, height: 100 },
  ];
  const result = computeSnap({ box: { x: 505, y: 400, width: 90, height: 100 }, targets, canvas });
  assert.equal(result.dx, 3);
  assert.deepEqual(result.guides, [{ axis: "x", position: 508, kind: "edge" }]);
});

test("honours a custom threshold", () => {
  const box = { x: CENTER_X - 200 + 9, y: 400, width: 400, height: 100 };
  assert.equal(computeSnap({ box, targets: [], canvas, threshold: 12 }).dx, -9);
  const tight = computeSnap({ box, targets: [], canvas, threshold: 4 });
  assert.equal(tight.dx, 0);
  assert.deepEqual(tight.guides, []);
});

test("snaps each axis independently", () => {
  const targets = [{ id: "other", x: 200, y: 1000, width: 100, height: 100 }];
  const result = computeSnap({ box: { x: 700, y: 1003, width: 120, height: 120 }, targets, canvas });
  assert.equal(result.dx, 0);
  assert.equal(result.dy, -3);
  assert.deepEqual(result.guides, [{ axis: "y", position: 1000, kind: "edge" }]);
});

test("deduplicates guides that share a position and kind", () => {
  const targets = [
    { id: "a", x: CENTER_X - 50, y: 700, width: 100, height: 100 },
    { id: "b", x: CENTER_X - 100, y: 700, width: 200, height: 100 },
  ];
  const result = computeSnap({
    box: { x: CENTER_X - 60, y: 400, width: 120, height: 100 },
    targets,
    canvas,
  });
  assert.equal(result.dx, 0);
  const centres = result.guides.filter((guide) => guide.axis === "x" && guide.position === CENTER_X);
  assert.equal(centres.length, 1);
});

test("targets default to an empty list", () => {
  const result = computeSnap({ box: { x: 94, y: 94, width: 100, height: 100 }, canvas });
  assert.equal(result.dx, 0);
  assert.equal(result.dy, 0);
  assert.deepEqual(result.guides, [
    { axis: "x", position: 94, kind: "safe" },
    { axis: "y", position: 94, kind: "safe" },
  ]);
});
