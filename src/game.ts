import { Terrain, drawPerson, drawProp, drawTram } from "./art";
import {
  buildings,
  colliders,
  landmarks,
  locationAt,
  props,
  SPAWN,
  WORLD,
  type Landmark,
  type Point,
} from "./world";
import { circleRect, moveWithCollision, SpatialHash } from "./physics";

export type GameState = {
  location: string;
  fps: number;
  distance: number;
  nearby: Landmark | null;
  discovered: number;
  running: boolean;
  paused: boolean;
  zoom: number;
};
export class Game {
  private ctx: CanvasRenderingContext2D;
  readonly terrain = new Terrain();
  readonly grid = new SpatialHash(colliders);
  player = { ...SPAWN, angle: 0, step: 0 };
  camera = { ...SPAWN };
  zoom = 0.82;
  paused = false;
  labels = true;
  keys = new Set<string>();
  touch = { x: 0, y: 0, sprint: false };
  private velocity = { x: 0, y: 0 };
  private width = 1;
  private height = 1;
  private lastTime = 0;
  private tick = 0;
  private accumulator = 0;
  private renderScale = 1;
  private minimapTime = -1;
  private trams = [
    { x: 720, y: 1403, min: 350, max: 1680, speed: 30, angle: 0 },
    { x: 1200, y: 2105, min: 400, max: 3180, speed: -28, angle: Math.PI },
  ];
  private raf = 0;
  private frames = 0;
  private elapsed = 0;
  private fps = 60;
  private distance = 0;
  private found = new Set<string>();
  private resizeObserver: ResizeObserver;
  private pedestrians = Array.from({ length: 20 }, (_, i) => ({
    x: 1300 + ((i * 53) % 300),
    y: 940 + ((i * 79) % 350),
    angle: ((i % 4) * Math.PI) / 2,
    color: ["#bca27a", "#748776", "#7e8994", "#aa826b", "#536e67"][i % 5],
    phase: i * 1.9,
  }));
  onState: (s: GameState) => void = () => {};
  onDiscover: (l: Landmark) => void = () => {};
  onInteract: (l: Landmark) => void = () => {};
  onMap: () => void = () => {};
  onPause: () => void = () => {};
  private onKeyDown = (e: KeyboardEvent) => {
    if (
      e.target instanceof HTMLElement &&
      e.target.closest("input, textarea, dialog, [contenteditable]")
    )
      return;
    const key = e.key.toLowerCase();
    if (
      [
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        " ",
        "shift",
        "+",
        "-",
        "=",
      ].includes(key)
    )
      e.preventDefault();
    if (e.repeat) {
      this.keys.add(key);
      return;
    }
    if (key === "m") {
      this.onMap();
      return;
    }
    if (key === "escape") {
      e.preventDefault();
      this.onPause();
      return;
    }
    if (key === "e" && !this.paused) {
      const nearby = this.nearest();
      if (nearby) this.onInteract(nearby);
    }
    if (key === "+" || key === "=") this.setZoom(this.zoom + 0.12);
    if (key === "-") this.setZoom(this.zoom - 0.12);
    this.keys.add(key);
  };
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());
  private onBlur = () => {
    this.keys.clear();
    this.touch = { x: 0, y: 0, sprint: false };
    this.velocity = { x: 0, y: 0 };
  };
  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.setZoom(this.zoom + (e.deltaY < 0 ? 0.06 : -0.06));
  };
  constructor(
    readonly canvas: HTMLCanvasElement,
    readonly mini: HTMLCanvasElement,
  ) {
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    canvas.addEventListener("wheel", this.onWheel, { passive: false });
    this.resize();
    this.grid.setDynamic(
      this.trams.map((t) => ({ x: t.x - 60, y: t.y - 14, w: 120, h: 28 })),
    );
    this.restore();
    this.camera = { x: this.player.x - 155, y: this.player.y - 15 };
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }
  private restore() {
    try {
      const saved = JSON.parse(
        localStorage.getItem("gta-finland:exploration") ?? "null",
      );
      if (
        saved?.version === 1 &&
        Number.isFinite(saved.x) &&
        Number.isFinite(saved.y) &&
        saved.x > 8 &&
        saved.y > 8 &&
        saved.x < WORLD.w - 8 &&
        saved.y < WORLD.h - 8 &&
        !this.grid.blocked(saved, 8)
      ) {
        this.player.x = saved.x;
        this.player.y = saved.y;
        this.distance = Number.isFinite(saved.distance)
          ? Math.max(0, saved.distance)
          : 0;
        this.found = new Set(
          (Array.isArray(saved.found) ? saved.found : []).filter((id: string) =>
            landmarks.some((l) => l.id === id),
          ),
        );
      }
    } catch {
      /* Private browsing and older saves should never prevent play. */
    }
  }
  save() {
    try {
      localStorage.setItem(
        "gta-finland:exploration",
        JSON.stringify({
          version: 1,
          x: this.player.x,
          y: this.player.y,
          distance: this.distance,
          found: [...this.found],
        }),
      );
    } catch {
      /* Storage is optional. */
    }
  }
  private resize() {
    this.width = Math.max(1, this.canvas.clientWidth);
    this.height = Math.max(1, this.canvas.clientHeight);
    this.renderScale = Math.min(1, 1100 / this.width, 800 / this.height);
    this.canvas.width = Math.round(this.width * this.renderScale);
    this.canvas.height = Math.round(this.height * this.renderScale);
    this.ctx.imageSmoothingEnabled = false;
    this.setZoom(this.zoom);
  }
  get minimumZoom() {
    return Math.max(0.52, this.width / WORLD.w, this.height / WORLD.h);
  }
  setZoom(value: number) {
    this.zoom = Math.max(this.minimumZoom, Math.min(1.6, value));
  }
  setPaused(value: boolean) {
    this.paused = value;
    this.accumulator = 0;
    this.onBlur();
  }
  recenter() {
    this.camera = {
      x: this.player.x - (this.width / this.zoom) * 0.12,
      y: this.player.y,
    };
  }
  reset() {
    this.player = { ...SPAWN, angle: 0, step: 0 };
    this.velocity = { x: 0, y: 0 };
    this.recenter();
    this.save();
  }
  nearest(): Landmark | null {
    let closest: Landmark | null = null,
      dist = 105;
    for (const l of landmarks) {
      const d = Math.hypot(l.x - this.player.x, l.y - this.player.y);
      if (d < dist) {
        dist = d;
        closest = l;
      }
    }
    return closest;
  }
  private frame(time: number) {
    const dt = Math.min((time - (this.lastTime || time)) / 1000, 0.2);
    this.lastTime = time;
    if (!this.paused) {
      this.accumulator += dt;
      while (this.accumulator >= 1 / 60) {
        this.tick += 1 / 60;
        this.update(1 / 60);
        this.accumulator -= 1 / 60;
      }
    }
    this.frames++;
    this.elapsed += dt;
    if (this.elapsed > 0.5) {
      this.fps = Math.round(this.frames / this.elapsed);
      this.frames = 0;
      this.elapsed = 0;
      this.onState({
        location: locationAt(this.player),
        fps: this.fps,
        distance: this.distance,
        nearby: this.nearest(),
        discovered: this.found.size,
        running: this.isRunning,
        paused: this.paused,
        zoom: this.zoom,
      });
      if (Math.floor(this.tick) % 5 === 0) this.save();
    }
    const viewW = this.width / this.zoom,
      viewH = this.height / this.zoom;
    const target = { x: this.player.x - viewW * 0.12, y: this.player.y - 15 };
    const blend = 1 - Math.exp(-7 * dt);
    this.camera.x += (target.x - this.camera.x) * blend;
    this.camera.y += (target.y - this.camera.y) * blend;
    this.camera.x = Math.max(
      viewW / 2,
      Math.min(WORLD.w - viewW / 2, this.camera.x),
    );
    this.camera.y = Math.max(
      viewH / 2,
      Math.min(WORLD.h - viewH / 2, this.camera.y),
    );
    this.draw();
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }
  get isRunning() {
    return (
      (this.keys.has("shift") || this.touch.sprint) &&
      Math.hypot(this.velocity.x, this.velocity.y) > 10
    );
  }
  private update(dt: number) {
    let x =
      Number(this.keys.has("d") || this.keys.has("arrowright")) -
      Number(this.keys.has("a") || this.keys.has("arrowleft")) +
      this.touch.x;
    let y =
      Number(this.keys.has("s") || this.keys.has("arrowdown")) -
      Number(this.keys.has("w") || this.keys.has("arrowup")) +
      this.touch.y;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    const speed = this.keys.has("shift") || this.touch.sprint ? 205 : 112;
    const smoothing = 1 - Math.exp(-20 * dt);
    this.velocity.x += (x * speed - this.velocity.x) * smoothing;
    this.velocity.y += (y * speed - this.velocity.y) * smoothing;
    // Stop ambient trams before a pedestrian, then include their bodies in collision queries.
    for (const t of this.trams) {
      let x = t.x + t.speed * dt;
      if (x > t.max) x = t.min;
      if (x < t.min) x = t.max;
      if (
        !circleRect(this.player, 19, { x: x - 63, y: t.y - 16, w: 126, h: 32 })
      )
        t.x = x;
    }
    this.grid.setDynamic(
      this.trams.map((t) => ({ x: t.x - 60, y: t.y - 14, w: 120, h: 28 })),
    );
    const next = moveWithCollision(
      this.player,
      { x: this.velocity.x * dt, y: this.velocity.y * dt },
      7.5,
      this.grid,
      WORLD,
    );
    const moved = Math.hypot(next.x - this.player.x, next.y - this.player.y);
    this.distance += moved * 0.4;
    if (moved > 0.05) {
      this.player.angle = Math.atan2(this.velocity.x, -this.velocity.y);
      this.player.step += moved * 0.23;
    } else this.player.step = 0;
    Object.assign(this.player, next);
    for (const l of landmarks) {
      if (
        !this.found.has(l.id) &&
        Math.hypot(l.x - this.player.x, l.y - this.player.y) < 100
      ) {
        this.found.add(l.id);
        this.onDiscover(l);
      }
    }
  }
  private draw() {
    const c = this.ctx,
      viewW = this.width / this.zoom,
      viewH = this.height / this.zoom;
    const left = Math.round(this.camera.x - viewW / 2),
      top = Math.round(this.camera.y - viewH / 2);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = "#89907a";
    c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const scale = this.zoom * this.renderScale;
    c.setTransform(scale, 0, 0, scale, -left * scale, -top * scale);
    this.terrain.draw(c, left, top, viewW, viewH);
    const visible = (p: Point, margin = 90) =>
      p.x > left - margin &&
      p.x < left + viewW + margin &&
      p.y > top - margin &&
      p.y < top + viewH + margin;
    const drawables: { y: number; draw: () => void }[] = [];
    for (const p of props)
      if (p.kind === "tree" && visible(p))
        drawables.push({ y: p.y, draw: () => drawProp(c, p) });
    for (const p of this.pedestrians) {
      const x = p.x + Math.sin(this.tick * 0.15 + p.phase) * 24,
        y = p.y + Math.cos(this.tick * 0.18 + p.phase) * 24;
      if (visible({ x, y }))
        drawables.push({
          y,
          draw: () =>
            drawPerson(
              c,
              x,
              y,
              p.angle,
              this.tick * 3 + p.phase,
              false,
              p.color,
            ),
        });
    }
    drawables.push({
      y: this.player.y,
      draw: () =>
        drawPerson(
          c,
          this.player.x,
          this.player.y,
          this.player.angle,
          this.player.step,
          true,
        ),
    });
    drawables.sort((a, b) => a.y - b.y);
    for (const d of drawables) d.draw();
    for (const t of this.trams)
      if (visible(t, 130)) drawTram(c, t.x, t.y, t.angle);
    // A small marker distinguishes the player from the people on the square.
    if (!this.paused) {
      c.fillStyle = "#263d33e8";
      c.fillRect(this.player.x - 14, this.player.y - 39, 28, 13);
      c.fillStyle = "#f3d0a2";
      c.font = "bold 8px monospace";
      c.textAlign = "center";
      c.fillText("YOU", this.player.x, this.player.y - 30);
      c.beginPath();
      c.moveTo(this.player.x - 3, this.player.y - 26);
      c.lineTo(this.player.x + 3, this.player.y - 26);
      c.lineTo(this.player.x, this.player.y - 22);
      c.fill();
    }
    if (this.labels) {
      for (const l of landmarks)
        if (visible(l)) {
          const d = Math.hypot(l.x - this.player.x, l.y - this.player.y);
          c.save();
          c.translate(l.x, l.y);
          c.fillStyle = d < 105 ? "#e4ad75" : "#203f39dd";
          c.beginPath();
          c.arc(0, -8, 6, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = d < 105 ? "#384d3f" : "#d6ddbf";
          c.fillRect(-1.5, -10, 3, 4);
          c.restore();
        }
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    // The vignette is a static CSS overlay; the minimap only needs 10 updates/second.
    if (this.tick - this.minimapTime >= 0.1 || !this.minimapImage) {
      this.drawMinimap();
      this.minimapTime = this.tick;
    }
  }
  private minimapImage: HTMLCanvasElement | null = null;
  private drawMinimap() {
    const c = this.mini.getContext("2d")!,
      w = this.mini.width,
      h = this.mini.height;
    if (!this.minimapImage) this.minimapImage = this.terrain.overview(420);
    c.clearRect(0, 0, w, h);
    c.drawImage(this.minimapImage, 0, 0, w, h);
    c.fillStyle = "#173d3559";
    c.fillRect(0, 0, w, h);
    const sx = w / WORLD.w,
      sy = h / WORLD.h;
    c.strokeStyle = "#d5ddba88";
    c.lineWidth = 1;
    c.strokeRect(
      (this.camera.x - this.width / this.zoom / 2) * sx,
      (this.camera.y - this.height / this.zoom / 2) * sy,
      (this.width / this.zoom) * sx,
      (this.height / this.zoom) * sy,
    );
    c.fillStyle = "#f0bc82";
    c.strokeStyle = "#263d33";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(this.player.x * sx, this.player.y * sy, 4, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
  mapImage() {
    return this.minimapImage ?? this.terrain.overview(800);
  }
  get discovered() {
    return this.found;
  }
  debugState() {
    return {
      player: { ...this.player },
      camera: { ...this.camera },
      distance: this.distance,
      found: [...this.found],
      chunks: this.terrain.count,
      paused: this.paused,
      zoom: this.zoom,
      colliding: this.grid.blocked(this.player, 7.5),
      buildings: buildings.length,
    };
  }
  destroy() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    this.canvas.removeEventListener("wheel", this.onWheel);
    this.save();
  }
}
