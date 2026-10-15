import type { Point, Rect } from "./world";

/** Static broad phase. A query only visits the cells touching the player's circle. */
export class SpatialHash {
  private cells = new Map<string, Rect[]>();
  private dynamic: Rect[] = [];
  setDynamic(rects: Rect[]) {
    this.dynamic = rects;
  }
  constructor(
    rects: Rect[],
    private size = 128,
  ) {
    for (const r of rects) {
      for (
        let y = Math.floor(r.y / size);
        y <= Math.floor((r.y + r.h) / size);
        y++
      ) {
        for (
          let x = Math.floor(r.x / size);
          x <= Math.floor((r.x + r.w) / size);
          x++
        ) {
          const key = `${x},${y}`;
          if (!this.cells.has(key)) this.cells.set(key, []);
          this.cells.get(key)!.push(r);
        }
      }
    }
  }
  query(p: Point, radius: number): Rect[] {
    const result = new Set<Rect>();
    for (
      let y = Math.floor((p.y - radius) / this.size);
      y <= Math.floor((p.y + radius) / this.size);
      y++
    ) {
      for (
        let x = Math.floor((p.x - radius) / this.size);
        x <= Math.floor((p.x + radius) / this.size);
        x++
      ) {
        for (const r of this.cells.get(`${x},${y}`) ?? []) result.add(r);
      }
    }
    return [...result, ...this.dynamic];
  }
  blocked(p: Point, radius: number): boolean {
    return this.query(p, radius).some((r) => circleRect(p, radius, r));
  }
}

export function circleRect(p: Point, radius: number, r: Rect): boolean {
  const x = Math.max(r.x, Math.min(p.x, r.x + r.w));
  const y = Math.max(r.y, Math.min(p.y, r.y + r.h));
  return (p.x - x) ** 2 + (p.y - y) ** 2 < radius ** 2;
}

/** Substeps prevent tunneling; independent axes let the player slide along walls. */
export function moveWithCollision(
  p: Point,
  delta: Point,
  radius: number,
  grid: SpatialHash,
  bounds: { w: number; h: number },
): Point {
  const steps = Math.max(
    1,
    Math.ceil(Math.max(Math.abs(delta.x), Math.abs(delta.y)) / (radius * 0.5)),
  );
  const next = { ...p };
  for (let i = 0; i < steps; i++) {
    const x = Math.max(
      radius,
      Math.min(bounds.w - radius, next.x + delta.x / steps),
    );
    if (!grid.blocked({ x, y: next.y }, radius)) next.x = x;
    const y = Math.max(
      radius,
      Math.min(bounds.h - radius, next.y + delta.y / steps),
    );
    if (!grid.blocked({ x: next.x, y }, radius)) next.y = y;
  }
  return next;
}
