import { test } from "node:test";
import assert from "node:assert/strict";
import { SpatialHash, circleRect, moveWithCollision } from "../src/physics.ts";
import { WORLD, SPAWN, buildings, colliders, landmarks } from "../src/world.ts";

test("the player spawns outdoors and every landmark has a reachable, unobstructed center", () => {
  const grid = new SpatialHash(colliders);
  assert.equal(grid.blocked(SPAWN, 7.5), false);
  for (const l of landmarks) assert.equal(grid.blocked(l, 7.5), false, l.name);
});
test("continuous movement cannot tunnel through a building", () => {
  const wall = { x: 100, y: 0, w: 80, h: 300 },
    grid = new SpatialHash([wall]);
  const p = moveWithCollision({ x: 30, y: 50 }, { x: 400, y: 0 }, 8, grid, {
    w: 500,
    h: 500,
  });
  assert.ok(p.x <= 92);
  assert.equal(p.y, 50);
  assert.equal(grid.blocked(p, 8), false);
});
test("diagonal movement slides along walls and respects the world perimeter", () => {
  const grid = new SpatialHash([{ x: 100, y: 20, w: 80, h: 300 }]);
  const p = moveWithCollision({ x: 90, y: 50 }, { x: 30, y: 60 }, 8, grid, {
    w: 500,
    h: 500,
  });
  assert.ok(p.x <= 92);
  assert.ok(Math.abs(p.y - 110) < 0.01);
  assert.deepEqual(
    moveWithCollision(
      { x: 10, y: 10 },
      { x: -100, y: -100 },
      8,
      new SpatialHash([]),
      WORLD,
    ),
    { x: 8, y: 8 },
  );
});
test("the spatial index finds large buildings across cell boundaries", () => {
  const b = buildings.find((b) => b.id === "station-main")!,
    grid = new SpatialHash(buildings);
  assert.ok(grid.query({ x: b.x + b.w - 1, y: b.y + b.h - 1 }, 8).includes(b));
  assert.equal(circleRect({ x: b.x + 20, y: b.y + 20 }, 7.5, b), true);
});
test("all seven landmark centers are connected to the spawn by walkable space", () => {
  const grid = new SpatialHash(colliders),
    step = 16,
    cols = Math.ceil(WORLD.w / step),
    rows = Math.ceil(WORLD.h / step);
  const start = {
    x: Math.round(SPAWN.x / step),
    y: Math.round(SPAWN.y / step),
  };
  const seen = new Set<string>([`${start.x},${start.y}`]),
    queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const x = p.x + dx,
        y = p.y + dy,
        key = `${x},${y}`;
      if (
        x < 1 ||
        x >= cols - 1 ||
        y < 1 ||
        y >= rows - 1 ||
        seen.has(key) ||
        grid.blocked({ x: x * step, y: y * step }, 8)
      )
        continue;
      seen.add(key);
      queue.push({ x, y });
    }
  }
  for (const l of landmarks)
    assert.ok(
      queue.some((p) => Math.hypot(p.x * step - l.x, p.y * step - l.y) < 30),
      `${l.name} is disconnected`,
    );
});

test("dynamic bodies stop movement and removing a body frees the route", () => {
  const grid = new SpatialHash([]);
  grid.setDynamic([{ x: 100, y: 50, w: 120, h: 28 }]);
  const blocked = moveWithCollision(
    { x: 60, y: 65 },
    { x: 80, y: 0 },
    8,
    grid,
    WORLD,
  );
  assert.ok(blocked.x <= 92);
  grid.setDynamic([]);
  assert.ok(
    moveWithCollision(blocked, { x: 80, y: 0 }, 8, grid, WORLD).x > 150,
  );
});
