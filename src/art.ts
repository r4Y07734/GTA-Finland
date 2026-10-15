import {
  buildings,
  props,
  roads,
  WORLD,
  type Building,
  type Prop,
  type Rect,
} from "./world";

type Ctx = CanvasRenderingContext2D;
const rect = (
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) => {
  c.fillStyle = color;
  c.fillRect(Math.round(x), Math.round(y), w, h);
};
const line = (c: Ctx, points: number[][], color: string, width = 1) => {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.stroke();
};
const poly = (c: Ctx, points: number[][], color: string) => {
  c.fillStyle = color;
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fill();
};
const hash = (x: number, y: number) => {
  let n = Math.imul(x + 19, 374761393) + Math.imul(y + 71, 668265263);
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
function makePattern(
  color: string,
  accent: string,
  stone: boolean,
): HTMLCanvasElement {
  const el = document.createElement("canvas");
  el.width = 96;
  el.height = 96;
  const c = el.getContext("2d")!;
  rect(c, 0, 0, 96, 96, color);
  if (stone) {
    for (let y = 0; y < 96; y += 8)
      for (let x = -8; x < 96; x += 16) {
        rect(
          c,
          x + (y % 16 ? 8 : 0),
          y,
          15,
          7,
          hash(x, y) > 0.5 ? color : accent,
        );
        rect(c, x + (y % 16 ? 8 : 0), y, 15, 1, "#ffffff0a");
      }
  } else {
    for (let i = 0; i < 300; i++)
      rect(c, hash(i, 2) * 96, hash(i, 3) * 96, 1 + (i % 2), 1, accent);
  }
  return el;
}

const treeSprites = new Map<number, HTMLCanvasElement>();
function treeSprite(variant: number): HTMLCanvasElement {
  if (treeSprites.has(variant)) return treeSprites.get(variant)!;
  const s = document.createElement("canvas");
  s.width = 110;
  s.height = 112;
  const c = s.getContext("2d")!;
  const tones =
    variant % 3 === 0
      ? ["#354e38", "#45613e", "#557548", "#65844e", "#789457", "#8d9c62"]
      : variant % 3 === 1
        ? ["#3d5037", "#4c633c", "#647c46", "#7b8b50", "#929a5f", "#a3a967"]
        : ["#2f4d3e", "#3f6249", "#4c7650", "#638759", "#749360", "#8a9c6c"];
  c.fillStyle = "#23352a32";
  c.beginPath();
  c.ellipse(66, 81, 36, 21, -0.3, 0, Math.PI * 2);
  c.fill();
  rect(c, 52, 53, 6, 36, "#665542");
  rect(c, 52, 60, 2, 28, "#9a8661");
  const blobs = [
    [52, 40, 28],
    [32, 44, 19],
    [72, 43, 22],
    [48, 23, 22],
    [33, 26, 16],
    [69, 24, 17],
    [48, 59, 23],
    [70, 57, 16],
  ];
  for (const [x, y, r] of blobs) {
    for (let yy = -r; yy < r; yy += 4)
      for (let xx = -r; xx < r; xx += 4) {
        if (xx * xx + yy * yy < r * r * (0.84 + hash(xx + x, yy + y) * 0.3)) {
          const light =
            1 +
            Math.floor(
              ((-xx - yy) / (r * 3) + 0.5) * 3 + hash(xx * 3 + x, yy + y) * 1.5,
            );
          rect(c, x + xx, y + yy, 4, 4, tones[Math.max(0, Math.min(5, light))]);
        }
      }
  }
  for (let i = 0; i < 34; i++)
    rect(c, 22 + hash(i, 9) * 57, 10 + hash(i, 4) * 56, 2, 2, "#b1b47a40");
  treeSprites.set(variant, s);
  return s;
}

export function drawProp(c: Ctx, p: Prop) {
  const { x, y } = p;
  if (p.kind === "tree") {
    c.drawImage(treeSprite(p.variant ?? Math.round(x) % 3), x - 55, y - 82);
    return;
  }
  c.fillStyle = "#303b302b";
  c.fillRect(x - 10, y, 30, 12);
  switch (p.kind) {
    case "bench":
      rect(c, x - 15, y - 7, 30, 13, "#37463b");
      for (let i = 0; i < 4; i++)
        rect(c, x - 14, y - 7 + i * 3, 28, 2, i === 0 ? "#b09065" : "#927952");
      rect(c, x - 12, y + 5, 3, 4, "#3c4239");
      rect(c, x + 10, y + 5, 3, 4, "#3c4239");
      break;
    case "lamp":
      rect(c, x - 4, y - 3, 8, 6, "#5a6156");
      rect(c, x - 1, y - 32, 3, 33, "#394b43");
      rect(c, x - 7, y - 34, 15, 3, "#354b44");
      rect(c, x - 6, y - 32, 5, 6, "#ddd1a2");
      rect(c, x + 3, y - 32, 5, 6, "#ddd1a2");
      break;
    case "planter":
      rect(c, x - 14, y - 10, 28, 20, "#6c7464");
      rect(c, x - 12, y - 11, 24, 15, "#c1bd9c");
      rect(c, x - 10, y - 9, 20, 12, "#4e6748");
      for (let i = 0; i < 9; i++)
        rect(
          c,
          x - 9 + ((i * 7) % 18),
          y - 8 + ((i * 3) % 10),
          3,
          3,
          i % 2 ? "#cb9569" : "#d4c78b",
        );
      break;
    case "kiosk":
      rect(c, x - 23, y - 15, 46, 39, "#69796b");
      rect(c, x - 21, y - 12, 42, 27, "#a3b3a2");
      rect(c, x - 18, y + 5, 36, 13, "#364e45");
      rect(c, x - 26, y - 19, 52, 25, "#3e6a56");
      line(
        c,
        [
          [x - 25, y - 17],
          [x, y - 24],
          [x + 25, y - 17],
        ],
        "#91a38a",
        3,
      );
      rect(c, x - 21, y + 1, 42, 4, "#d2d1b0");
      rect(c, x - 7, y + 5, 14, 10, "#d8bc7c");
      break;
    case "statue":
      rect(c, x - 17, y - 4, 34, 24, "#7e8171");
      rect(c, x - 15, y - 8, 30, 20, "#b9b9a1");
      rect(c, x - 10, y - 14, 20, 16, "#c5c3a9");
      rect(c, x - 4, y - 36, 9, 24, "#415d4f");
      rect(c, x - 6, y - 42, 12, 10, "#426150");
      line(
        c,
        [
          [x - 3, y - 26],
          [x - 14, y - 20],
          [x - 9, y - 14],
        ],
        "#3a5549",
        5,
      );
      break;
    case "bicycle":
      c.strokeStyle = "#465e59";
      c.lineWidth = 2;
      c.strokeRect(x - 5, y - 9, 10, 6);
      c.strokeRect(x - 5, y + 6, 10, 6);
      line(
        c,
        [
          [x, y - 6],
          [x + 4, y + 7],
          [x - 4, y],
          [x, y - 6],
        ],
        "#b39a6d",
        2,
      );
      break;
  }
}

function building(c: Ctx, b: Building) {
  const { x, y, w, h, roof, wall } = b;
  // Warm, consistent afternoon shadows, baked once into terrain chunks.
  poly(
    c,
    [
      [x + 9, y + 10],
      [x + w + 22, y + 17],
      [x + w + 22, y + h + 31],
      [x + 20, y + h + 31],
      [x, y + h],
    ],
    "#343f3536",
  );
  rect(c, x - 2, y - 2, w + 4, h + 20, "#535c51");
  rect(c, x, y, w, h + 14, wall);
  for (let xx = x + 8; xx < x + w - 9; xx += 16) {
    rect(c, xx, y + h + 3, 7, 8, "#47534a");
    rect(c, xx, y + h + 3, 3, 6, "#77867b");
    rect(c, xx - 1, y + h + 12, 10, 2, "#ede2be");
  }
  rect(c, x, y + h - 2, w, 4, "#e0d5b4");
  rect(c, x + 4, y + 4, w - 8, h - 8, "#c7bba0");
  rect(c, x + 8, y + 8, w - 16, h - 16, roof);
  // Mansard roof slopes and individual metal roof seams.
  poly(
    c,
    [
      [x + 8, y + 8],
      [x + w - 8, y + 8],
      [x + w - 25, y + 25],
      [x + 25, y + 25],
    ],
    "#ffffff1c",
  );
  poly(
    c,
    [
      [x + w - 8, y + 8],
      [x + w - 8, y + h - 8],
      [x + w - 25, y + h - 25],
      [x + w - 25, y + 25],
    ],
    "#1c302e25",
  );
  poly(
    c,
    [
      [x + 8, y + h - 8],
      [x + w - 8, y + h - 8],
      [x + w - 25, y + h - 25],
      [x + 25, y + h - 25],
    ],
    "#273b342b",
  );
  for (let xx = x + 15; xx < x + w - 8; xx += 9)
    line(
      c,
      [
        [xx, y + 9],
        [xx, y + h - 10],
      ],
      "#253c3420",
    );
  line(
    c,
    [
      [x + 25, y + h / 2],
      [x + w - 25, y + h / 2],
    ],
    "#c5c5a76b",
    3,
  );
  if (b.courtyard && w > 150 && h > 140) {
    rect(c, x + 54, y + 46, w - 108, h - 87, "#4c594b");
    rect(c, x + 59, y + 51, w - 118, h - 97, "#a5a38b");
    rect(c, x + 67, y + 58, w - 135, h - 113, "#8a9773");
    for (let i = 0; i < 4; i++)
      rect(c, x + 68 + i * 20, y + 59, 10, 7, "#5d7352");
    line(
      c,
      [
        [x + 54, y + 46],
        [x + 54, y + h - 41],
        [x + w - 54, y + h - 41],
      ],
      "#d6cbae",
      3,
    );
  }
  for (let xx = x + 24; xx < x + w - 20; xx += 32) {
    rect(c, xx, y + 11, 12, 11, "#455c54");
    rect(c, xx + 1, y + 11, 10, 5, "#a3b3a0");
    rect(c, xx, y + h - 21, 12, 10, "#3e5149");
    rect(c, xx + 1, y + h - 22, 10, 4, "#bfbea4");
  }
  for (let i = 0; i < Math.floor(w / 80); i++) {
    const xx = x + 29 + i * 71,
      yy = y + 35 + (i % 2) * (h - 90);
    rect(c, xx + 3, yy + 4, 17, 14, "#31483e47");
    rect(c, xx, yy, 14, 13, "#b0b19a");
    rect(c, xx + 2, yy + 2, 10, 2, "#d8d6ba");
    for (let n = 0; n < 3; n++)
      rect(c, xx + 3, yy + 5 + n * 2, 8, 1, "#637568");
  }
  rect(c, x + w * 0.5 - 9, y + h + 1, 18, 15, "#364d43");
  rect(c, x + w * 0.5 - 11, y + h + 14, 22, 3, "#c7c3a6");
  if (!b.courtyard && !b.id.startsWith("station") && !b.style) {
    const rx = x + w * 0.35,
      ry = y + h * 0.4;
    rect(c, rx + 5, ry + 7, 42, 29, "#31463b44");
    rect(c, rx, ry, 40, 25, "#b2b59e");
    rect(c, rx + 3, ry + 3, 34, 16, "#566c5e");
    for (let i = 0; i < 4; i++)
      rect(c, rx + 5 + i * 8, ry + 4, 2, 14, "#a6b69e");
  }
  if (b.id !== "station-shed") {
    for (let i = 0; i < Math.floor(w / 95); i++) {
      const xx = x + 35 + i * 85,
        yy = y + Math.min(h - 46, 42 + (i % 2) * 23);
      rect(c, xx + 4, yy + 4, 12, 13, "#334b3c55");
      rect(c, xx, yy, 10, 12, "#9b8870");
      rect(c, xx - 2, yy - 2, 14, 4, "#c3b49a");
      rect(c, xx + 1, yy - 1, 8, 2, "#485d4d");
    }
    for (let yy = y + 36; yy < y + h - 35; yy += 35) {
      rect(c, x + 9, yy, 9, 12, "#435c50");
      rect(c, x + 7, yy - 2, 12, 4, "#a4ac92");
      rect(c, x + w - 18, yy, 9, 12, "#3f594e");
      rect(c, x + w - 19, yy - 2, 12, 4, "#a4ac92");
    }
    line(
      c,
      [
        [x + 5, y + 5],
        [x + 5, y + h - 4],
        [x + w - 5, y + h - 4],
      ],
      "#e0d5b156",
      2,
    );
  }
  if (b.style === "station") station(c, b);
  if (b.style === "museum") museum(c, b);
  if (b.style === "theatre") theatre(c, b);
  if (b.style === "cathedral") cathedral(c, b);
  if (b.id === "station-shed") {
    rect(c, x + 15, y + 10, w - 30, h - 20, "#75908b");
    for (let xx = x + 18; xx < x + w - 12; xx += 12)
      rect(c, xx, y + 12, 3, h - 24, "#bac1aa");
    for (let yy = y + 20; yy < y + h - 10; yy += 45)
      rect(c, x + 15, yy, w - 30, 3, "#485e57");
    rect(c, x + w / 2 - 3, y + 10, 6, h - 20, "#c2c7b0");
  }
  if (b.id === "station-tower") {
    rect(c, x + 5, y + 5, w - 10, h + 20, "#ac8d71");
    rect(c, x + 10, y - 6, w - 20, h, "#bd9e7c");
    rect(c, x + 13, y - 18, w - 26, 17, "#5c7a65");
    rect(c, x + 20, y - 26, w - 40, 9, "#7d9a7c");
    rect(c, x + 24, y - 30, w - 48, 5, "#d6c7a0");
    c.fillStyle = "#dedac2";
    c.beginPath();
    c.arc(x + w / 2, y + h - 6, 15, 0, Math.PI * 2);
    c.fill();
    line(
      c,
      [
        [x + w / 2, y + h - 17],
        [x + w / 2, y + h - 6],
        [x + w / 2 + 8, y + h - 2],
      ],
      "#384b40",
      2,
    );
  }
  if (b.name && b.style !== "cathedral") {
    const yy = y + h - 29;
    c.font = `600 ${b.style ? 11 : 9}px monospace`;
    c.textAlign = "center";
    const tw = c.measureText(b.name).width;
    rect(c, x + w / 2 - tw / 2 - 7, yy - 10, tw + 14, 16, "#283f39c9");
    c.fillStyle = "#e2d8b6";
    c.fillText(b.name, x + w / 2, yy + 1);
  }
}
function station(c: Ctx, b: Building) {
  const { x, y, w, h } = b;
  rect(c, x + 120, y + 18, w - 240, h - 42, "#8fa18a");
  for (let xx = x + 124; xx < x + w - 120; xx += 12)
    rect(c, xx, y + 20, 2, h - 48, "#48665a4a");
  for (const xx of [x + 28, x + w - 76]) {
    rect(c, xx, y + h - 68, 48, 76, "#b69a7b");
    rect(c, xx + 4, y + h - 72, 40, 12, "#d1bb95");
    rect(c, xx + 12, y + h - 93, 24, 22, "#719078");
    rect(c, xx + 18, y + h - 99, 12, 7, "#a6b293");
    rect(c, xx + 7, y + h - 52, 34, 38, "#3f564d");
    for (let n = 0; n < 3; n++)
      rect(c, xx + 9 + n * 11, y + h - 49, 2, 32, "#bcb79b");
  }
  for (let i = 0; i < 3; i++) {
    const xx = x + w / 2 - 61 + i * 46;
    rect(c, xx, y + h - 17, 30, 28, "#394e43");
    rect(c, xx + 3, y + h - 16, 24, 3, "#9ba48b");
    rect(c, xx + 10, y + h + 6, 10, 5, "#bdad8b");
  }
  for (const xx of [x + 131, x + w - 137]) {
    rect(c, xx, y + h - 8, 7, 22, "#786e57");
    rect(c, xx - 3, y + h - 13, 13, 6, "#d4c2a0");
  }
}
function museum(c: Ctx, b: Building) {
  const { x, y, w, h } = b;
  rect(c, x + 80, y + 38, w - 160, h - 73, "#728680");
  rect(c, x + 110, y + 58, w - 220, 34, "#a1b4a6");
  for (let xx = x + 113; xx < x + w - 112; xx += 14)
    rect(c, xx, y + 58, 2, 34, "#d1d1b3");
  rect(c, x + 100, y + h - 5, w - 200, 25, "#d8c6a3");
  for (let i = 0; i < 6; i++)
    rect(c, x + 107 + i * 24, y + h - 1, 6, 22, "#eee1bd");
  poly(
    c,
    [
      [x + 90, y + h - 7],
      [x + w / 2, y + h - 45],
      [x + w - 90, y + h - 7],
    ],
    "#e3d1a9",
  );
  poly(
    c,
    [
      [x + 110, y + h - 12],
      [x + w / 2, y + h - 33],
      [x + w - 110, y + h - 12],
    ],
    "#ad9b7b",
  );
  rect(c, x + w / 2 - 11, y + h - 24, 22, 11, "#d3bc90");
  for (let i = 0; i < 5; i++)
    rect(
      c,
      x + 90 - i * 7,
      y + h + 20 + i * 3,
      w - 180 + i * 14,
      3,
      i % 2 ? "#b5ab91" : "#d8ceb1",
    );
}
function theatre(c: Ctx, b: Building) {
  const { x, y, w, h } = b;
  rect(c, x + 55, y + 26, w - 110, h - 48, "#8d6454");
  for (let yy = y + 30; yy < y + h - 24; yy += 7)
    line(
      c,
      [
        [x + 60, yy],
        [x + w - 60, yy],
      ],
      "#d0a37e35",
      2,
    );
  for (const xx of [x + 5, x + w - 49]) {
    rect(c, xx, y + h - 51, 44, 54, "#9f9680");
    rect(c, xx - 3, y + h - 55, 50, 9, "#b2a88d");
    poly(
      c,
      [
        [xx - 4, y + h - 57],
        [xx + 22, y + h - 106],
        [xx + 48, y + h - 57],
      ],
      "#5d7160",
    );
    line(
      c,
      [
        [xx + 22, y + h - 105],
        [xx + 22, y + h - 60],
      ],
      "#9aab8d",
      2,
    );
    rect(c, xx + 12, y + h - 36, 20, 19, "#3f5145");
  }
  rect(c, x + w / 2 - 35, y + h - 28, 70, 34, "#aea48e");
  for (let i = 0; i < 3; i++)
    rect(c, x + w / 2 - 26 + i * 20, y + h - 16, 12, 24, "#3c4c41");
}
function cathedral(c: Ctx, b: Building) {
  const { x, y, w, h } = b;
  rect(c, x + 16, y + 10, w - 32, h - 20, "#dddfcc");
  rect(c, x + 75, y - 8, w - 150, h + 18, "#ececdb");
  rect(c, x - 14, y + 90, w + 28, 80, "#ebead8");
  for (let i = 0; i < 9; i++)
    rect(
      c,
      x - 16 - i * 4,
      y + h + 10 + i * 4,
      w + 32 + i * 8,
      4,
      i % 2 ? "#b6baa7" : "#d6d8c1",
    );
  for (const [xx, yy, r] of [
    [x + w / 2, y + h / 2, 47],
    [x + 32, y + 40, 18],
    [x + w - 32, y + 40, 18],
    [x + 32, y + h - 40, 18],
    [x + w - 32, y + h - 40, 18],
  ]) {
    rect(c, xx - r - 4, yy - r - 4, r * 2 + 8, r * 2 + 8, "#f1edda");
    c.fillStyle = "#547c67";
    c.beginPath();
    c.arc(xx, yy, r, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#83a38a";
    c.beginPath();
    c.arc(xx - 5, yy - 5, r - 7, 0, Math.PI * 2);
    c.fill();
    rect(c, xx - 4, yy - 7, 8, 14, "#c6bf87");
    rect(c, xx - 7, yy - 3, 14, 4, "#d8cc91");
  }
}

export class Terrain {
  readonly chunkSize = 512;
  private chunks = new Map<string, HTMLCanvasElement>();
  private stone: CanvasPattern;
  private asphalt: CanvasPattern;
  private lawn: CanvasPattern;
  constructor() {
    const c = document.createElement("canvas").getContext("2d")!;
    this.stone = c.createPattern(
      makePattern("#b3b19d", "#a6a793", true),
      "repeat",
    )!;
    this.asphalt = c.createPattern(
      makePattern("#777b70", "#929387", false),
      "repeat",
    )!;
    this.lawn = c.createPattern(
      makePattern("#75835b", "#8f9768", false),
      "repeat",
    )!;
  }
  get count() {
    return this.chunks.size;
  }
  private paint(c: Ctx, bounds?: Rect) {
    const visible = (x: number, y: number, w: number, h: number) =>
      !bounds ||
      (x < bounds.x + bounds.w &&
        x + w > bounds.x &&
        y < bounds.y + bounds.h &&
        y + h > bounds.y);
    c.fillStyle = this.stone;
    c.fillRect(0, 0, WORLD.w, WORLD.h);
    // Kaisaniemi and the Esplanadi promenade.
    c.fillStyle = this.lawn;
    c.fillRect(1200, 0, 570, 780);
    c.fillRect(650, 2445, 2710, 210);
    c.fillRect(0, 0, 480, 380);
    line(
      c,
      [
        [1280, 0],
        [1280, 310],
        [1420, 430],
        [1660, 760],
      ],
      "#beb99b",
      25,
    );
    line(
      c,
      [
        [1200, 530],
        [1440, 420],
        [1730, 420],
      ],
      "#c1b99b",
      24,
    );
    line(
      c,
      [
        [710, 2550],
        [3360, 2550],
      ],
      "#c6bda0",
      47,
    );
    line(
      c,
      [
        [1410, 30],
        [1410, 760],
      ],
      "#b1b190",
      14,
    );
    // Small pond at Kaisaniemi's southern garden.
    c.fillStyle = "#567b77";
    c.beginPath();
    c.ellipse(1460, 420, 63, 43, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#bec1a4";
    c.lineWidth = 7;
    c.stroke();
    for (let i = 0; i < 10; i++)
      line(
        c,
        [
          [1420 + i * 9, 399],
          [1435 + i * 7, 402],
        ],
        "#a6b5a160",
        2,
      );
    // Rails entering the station from the north.
    rect(c, 800, 0, 300, 300, "#7d8273");
    if (visible(800, 0, 300, 300))
      for (let x = 815; x < 1090; x += 35) {
        for (let y = 0; y < 300; y += 12) rect(c, x - 7, y, 23, 3, "#525a50");
        rect(c, x, 0, 2, 300, "#c1c2aa");
        rect(c, x + 10, 0, 2, 300, "#c1c2aa");
      }
    // Roads are layered so crossings remain continuous.
    c.lineJoin = "round";
    c.lineCap = "butt";
    for (const r of roads) line(c, r.points, "#d1c9af", r.width + 38);
    for (const r of roads) line(c, r.points, "#969c88", r.width + 29);
    for (const r of roads) line(c, r.points, "#bfbca5", r.width + 25);
    for (const r of roads) {
      c.strokeStyle = r.pedestrian ? "#b5b099" : this.asphalt;
      c.lineWidth = r.width;
      c.beginPath();
      r.points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.stroke();
      if (!r.pedestrian) {
        c.setLineDash([15, 18]);
        line(c, r.points, "#d2cbb36b", 2);
        c.setLineDash([]);
      }
      if (r.tram) this.tracks(c, r.points);
    }
    // Cobblestone plaza, edged with a precise granite border.
    rect(c, 1280, 900, 332, 410, "#b9b49b");
    c.strokeStyle = "#cbc4aa";
    c.lineWidth = 3;
    c.strokeRect(1280, 900, 332, 410);
    if (visible(1280, 900, 332, 410))
      for (let y = 905; y < 1305; y += 10)
        for (let x = 1285; x < 1607; x += 18) {
          rect(
            c,
            x + (y % 20 ? 0 : 8),
            y,
            16,
            8,
            hash(x, y) > 0.5 ? "#b1ad95" : "#bfbaa1",
          );
        }
    for (const y of [943, 1020, 1097, 1174, 1251])
      line(
        c,
        [
          [1290, y],
          [1600, y],
        ],
        "#d0c8af",
        2,
      );
    for (const x of [1290, 1368, 1446, 1524, 1600])
      line(
        c,
        [
          [x, 910],
          [x, 1300],
        ],
        "#d0c8af",
        2,
      );
    // The statue and open paving in Senate Square.
    rect(c, 2900, 1730, 450, 300, "#b8b19a");
    for (let y = 1740; y < 2020; y += 13)
      line(
        c,
        [
          [2910, y],
          [3340, y],
        ],
        "#aaa891",
        1,
      );
    rect(c, 3078, 1865, 42, 42, "#8c917c");
    rect(c, 3083, 1857, 32, 39, "#c1bba0");
    rect(c, 3094, 1831, 10, 39, "#506e59");
    const crossings: [number, number, boolean, number][] = [
      [1220, 1420, true, 86],
      [1530, 1420, true, 86],
      [1650, 1468, false, 65],
      [1590, 1770, false, 60],
      [2020, 1770, false, 48],
      [2390, 1765, false, 64],
      [1540, 2090, true, 76],
      [1973, 2090, true, 76],
      [2340, 2090, true, 76],
      [2800, 2090, true, 76],
      [2850, 1780, false, 78],
      [2850, 2370, false, 78],
      [2390, 2360, false, 64],
      [910, 1420, true, 86],
      [1790, 1145, false, 72],
    ];
    for (const [x, y, vertical, size] of crossings) {
      for (let i = -20; i <= 20; i += 10) {
        if (vertical) rect(c, x + i, y - size / 2 + 4, 5, size - 8, "#ded9bd");
        else rect(c, x - size / 2 + 4, y + i, size - 8, 5, "#ded9bd");
      }
    }
    // Tram stops, road drains, bollards and blue street-name signs.
    for (const x of [1025, 1715, 2520]) {
      rect(c, x, 1387, 85, 5, "#d4c598");
      rect(c, x + 5, 1362, 71, 16, "#6c8e81");
      rect(c, x + 8, 1365, 65, 8, "#abb9a5");
      rect(c, x + 10, 1378, 3, 13, "#536251");
      rect(c, x + 70, 1378, 3, 13, "#536251");
    }
    for (let x = 400; x < 1650; x += 120) {
      rect(c, x, 1469, 13, 5, "#5c6b5b");
      for (let n = 0; n < 4; n++) rect(c, x + 2 + n * 3, 1469, 1, 5, "#9a9e88");
    }
    for (const [x, y] of [
      [1545, 1370],
      [1547, 1848],
      [1975, 2045],
      [2338, 1845],
      [2800, 2045],
    ]) {
      rect(c, x, y - 17, 2, 23, "#56695a");
      rect(c, x - 16, y - 20, 36, 9, "#356272");
      rect(c, x - 13, y - 17, 27, 1, "#dae2cb");
    }
    // Parked cars stay solid, separate from the ambient trams.
    for (let i = 0; i < 6; i++) this.car(c, 2318, 1200 + i * 28, i % 4, true);
    for (let i = 0; i < 4; i++) this.car(c, 1735 + i * 48, 1848, i % 4, false);
    for (const b of buildings)
      if (visible(b.x - 100, b.y - 110, b.w + 220, b.h + 220)) building(c, b);
    for (const p of props)
      if (p.kind !== "tree" && visible(p.x - 60, p.y - 60, 120, 120))
        drawProp(c, p);
    // Subtle street lettering belongs to the world, rather than the HUD.
    this.street(c, "KAIVOKATU", 715, 1424, 0);
    this.street(c, "MIKONKATU", 1590, 1650, -Math.PI / 2);
    this.street(c, "KLUUVIKATU", 2020, 1640, -Math.PI / 2);
    this.street(c, "ALEKSANTERINKATU", 1890, 2094, 0);
    this.street(c, "YLIOPISTONKATU", 2200, 1814, 0);
    this.street(c, "POHJOISESPLANADI", 1990, 2404, 0);
    this.street(c, "RAUTATIENTORI", 1446, 1195, 0, "#777d666b", 14);
  }
  private tracks(c: Ctx, points: number[][]) {
    c.save();
    for (const offset of [-18, -8, 8, 18]) {
      const p = points.map(([x, y], i) => {
        const a = points[Math.max(0, i - 1)],
          b = points[Math.min(points.length - 1, i + 1)],
          angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
        return [x - Math.sin(angle) * offset, y + Math.cos(angle) * offset];
      });
      line(c, p, "#4d6055", 3);
      line(c, p, "#a7b09b", 1);
    }
    c.restore();
  }
  private car(
    c: Ctx,
    x: number,
    y: number,
    variant: number,
    vertical: boolean,
  ) {
    c.save();
    c.translate(x, y);
    if (vertical) c.rotate(Math.PI / 2);
    rect(c, -15, -8, 34, 19, "#35463d40");
    rect(
      c,
      -17,
      -9,
      34,
      17,
      ["#466b6b", "#b3b2a0", "#a36a55", "#d2c8a4"][variant],
    );
    rect(c, -5, -7, 14, 13, "#b2b8a3");
    rect(c, -7, -6, 4, 11, "#3c5b55");
    rect(c, 8, -6, 4, 11, "#3b5952");
    rect(c, 14, -7, 2, 4, "#e9dab1");
    rect(c, 14, 4, 2, 3, "#e9dab1");
    rect(c, -17, -7, 2, 3, "#bd755a");
    c.restore();
  }
  private street(
    c: Ctx,
    text: string,
    x: number,
    y: number,
    angle: number,
    color = "#e3ddbf7d",
    size = 10,
  ) {
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.font = `600 ${size}px monospace`;
    c.textAlign = "center";
    c.fillStyle = color;
    c.fillText(text, 0, 0);
    c.restore();
  }
  private chunk(x: number, y: number): HTMLCanvasElement {
    const key = `${x},${y}`;
    const hit = this.chunks.get(key);
    if (hit) return hit;
    const el = document.createElement("canvas");
    el.width = this.chunkSize;
    el.height = this.chunkSize;
    const c = el.getContext("2d", { alpha: false })!;
    c.translate(-x * this.chunkSize, -y * this.chunkSize);
    this.paint(c, {
      x: x * this.chunkSize,
      y: y * this.chunkSize,
      w: this.chunkSize,
      h: this.chunkSize,
    });
    // Bounded cache: at most 48 MiB of terrain, independent of future map size.
    if (this.chunks.size >= 48)
      this.chunks.delete(this.chunks.keys().next().value!);
    this.chunks.set(key, el);
    return el;
  }
  draw(c: Ctx, left: number, top: number, w: number, h: number) {
    const n = this.chunkSize;
    for (
      let y = Math.max(0, Math.floor(top / n));
      y <= Math.min(Math.ceil(WORLD.h / n) - 1, Math.floor((top + h) / n));
      y++
    ) {
      for (
        let x = Math.max(0, Math.floor(left / n));
        x <= Math.min(Math.ceil(WORLD.w / n) - 1, Math.floor((left + w) / n));
        x++
      )
        c.drawImage(this.chunk(x, y), x * n, y * n);
    }
  }
  overview(size = 500): HTMLCanvasElement {
    const el = document.createElement("canvas");
    el.width = size;
    el.height = Math.round((size * WORLD.h) / WORLD.w);
    const c = el.getContext("2d")!;
    c.scale(size / WORLD.w, size / WORLD.w);
    this.paint(c);
    for (const p of props) if (p.kind === "tree") drawProp(c, p);
    return el;
  }
}

export function drawPerson(
  c: Ctx,
  x: number,
  y: number,
  angle: number,
  step: number,
  player = false,
  color = "#c0a16d",
) {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  if (player) c.scale(1.15, 1.15);
  c.fillStyle = "#1b352f40";
  c.beginPath();
  c.ellipse(3, 4, 9, 5, 0, 0, Math.PI * 2);
  c.fill();
  if (player) {
    c.strokeStyle = "#ebc59b";
    c.lineWidth = 1.5;
    c.beginPath();
    c.ellipse(0, 2, 14, 9, 0, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = "#efd2a7";
    c.beginPath();
    c.arc(0, 2, 2, 0, Math.PI * 2);
    c.fill();
  }
  c.rotate(angle);
  const stride = Math.sin(step) * 3;
  rect(c, -5 + stride, -3, 4, 8, "#2d4641");
  rect(c, 1 - stride, -3, 4, 8, "#263a36");
  rect(c, -7, -6 + stride * 0.6, 3, 6, "#c3a17b");
  rect(c, 5, -6 - stride * 0.6, 3, 6, "#c3a17b");
  rect(c, -5, -9, 10, 9, player ? "#c37f50" : color);
  rect(c, -4, -9, 8, 2, player ? "#e5a471" : "#c1b897");
  rect(c, -3, -15, 6, 8, "#c4a17c");
  rect(c, -4, -16, 8, 5, "#3c3d30");
  rect(c, -3, -16, 6, 2, "#5a5640");
  rect(c, -3, -6, 6, 5, player ? "#e2b07d" : "#9f9473");
  c.restore();
}

export function drawTram(c: Ctx, x: number, y: number, angle: number) {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.rotate(angle);
  rect(c, -58, -10, 122, 31, "#293d3033");
  rect(c, -59, -14, 118, 28, "#2c5344");
  rect(c, -60, -9, 120, 18, "#d6c895");
  rect(c, -57, -10, 114, 4, "#e4d9b0");
  rect(c, -53, -11, 106, 22, "#567e60");
  for (let i = 0; i < 9; i++) {
    rect(c, -49 + i * 12, -8, 9, 5, "#b3c2b0");
    rect(c, -49 + i * 12, 5, 9, 4, "#344f42");
  }
  rect(c, -13, -12, 26, 24, "#a5b39a");
  rect(c, -9, -8, 18, 16, "#6f8d77");
  line(
    c,
    [
      [-8, -7],
      [4, -20],
      [14, -7],
    ],
    "#d9d7b5",
    2,
  );
  rect(c, 52, -8, 4, 16, "#b3c2ab");
  rect(c, 57, -6, 2, 4, "#ead5a0");
  rect(c, 57, 3, 2, 4, "#ead5a0");
  rect(c, -61, -6, 2, 4, "#bd7960");
  rect(c, -61, 3, 2, 4, "#bd7960");
  c.restore();
}
