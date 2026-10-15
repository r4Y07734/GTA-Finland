export type Point = { x: number; y: number };
export type Rect = Point & { w: number; h: number };
export type Building = Rect & {
  id: string;
  name?: string;
  roof: string;
  wall: string;
  style?: "station" | "museum" | "theatre" | "cathedral";
  courtyard?: boolean;
};
export type Prop = Point & {
  kind: "tree" | "bench" | "lamp" | "planter" | "kiosk" | "statue" | "bicycle";
  variant?: number;
};
export type Road = {
  name: string;
  points: [number, number][];
  width: number;
  tram?: boolean;
  pedestrian?: boolean;
};
export type Landmark = Point & {
  id: string;
  name: string;
  finnish: string;
  category: string;
  description: string;
};

export const WORLD = { w: 3360, h: 2900 };
export const SPAWN = { x: 1370, y: 1260 };
export const roads: Road[] = [
  {
    name: "Kaivokatu",
    points: [
      [300, 1420],
      [1650, 1420],
    ],
    width: 86,
    tram: true,
  },
  {
    name: "Kaisaniemenkatu",
    points: [
      [1650, 1420],
      [1780, 1140],
      [1780, 830],
      [1920, 440],
    ],
    width: 76,
    tram: true,
  },
  {
    name: "Mikonkatu",
    points: [
      [1590, 1435],
      [1590, 2390],
    ],
    width: 60,
    pedestrian: true,
  },
  {
    name: "Aleksanterinkatu",
    points: [
      [410, 2090],
      [3290, 2090],
    ],
    width: 76,
    tram: true,
  },
  {
    name: "Kluuvikatu",
    points: [
      [2020, 1510],
      [2020, 2380],
    ],
    width: 48,
    pedestrian: true,
  },
  {
    name: "Yliopistonkatu",
    points: [
      [1580, 1810],
      [3230, 1810],
    ],
    width: 56,
  },
  {
    name: "Fabianinkatu",
    points: [
      [2390, 1120],
      [2390, 2810],
    ],
    width: 64,
  },
  {
    name: "Unioninkatu",
    points: [
      [2850, 500],
      [2850, 2810],
    ],
    width: 78,
  },
  {
    name: "Pohjoisesplanadi",
    points: [
      [600, 2400],
      [3300, 2400],
    ],
    width: 74,
  },
  {
    name: "Eteläesplanadi",
    points: [
      [600, 2700],
      [3300, 2700],
    ],
    width: 70,
  },
  {
    name: "Mannerheimintie",
    points: [
      [550, 600],
      [450, 1220],
      [590, 1700],
      [800, 2100],
      [960, 2440],
      [1080, 2840],
    ],
    width: 104,
    tram: true,
  },
  {
    name: "Vilhonkatu",
    points: [
      [1220, 870],
      [1780, 870],
    ],
    width: 44,
  },
  {
    name: "Kaisaniemenranta",
    points: [
      [900, 400],
      [1550, 400],
      [1920, 440],
      [2360, 520],
      [2870, 560],
    ],
    width: 44,
  },
];

export const buildings: Building[] = [
  {
    id: "station-main",
    name: "HELSINKI CENTRAL",
    x: 720,
    y: 1070,
    w: 470,
    h: 240,
    roof: "#6f827a",
    wall: "#ad9276",
    style: "station",
  },
  {
    id: "station-west",
    x: 720,
    y: 470,
    w: 110,
    h: 600,
    roof: "#7d8b80",
    wall: "#ae9478",
  },
  {
    id: "station-east",
    x: 1060,
    y: 520,
    w: 130,
    h: 550,
    roof: "#73847e",
    wall: "#af9277",
  },
  {
    id: "station-shed",
    x: 850,
    y: 310,
    w: 190,
    h: 750,
    roof: "#6b7e7c",
    wall: "#918e7b",
  },
  {
    id: "station-tower",
    x: 1150,
    y: 1000,
    w: 64,
    h: 94,
    roof: "#5b7969",
    wall: "#b09173",
  },
  {
    id: "theatre",
    name: "KANSALLISTEATTERI",
    x: 1280,
    y: 670,
    w: 370,
    h: 160,
    roof: "#826c61",
    wall: "#aa8b7a",
    style: "theatre",
  },
  {
    id: "ateneum",
    name: "ATENEUM",
    x: 1130,
    y: 1520,
    w: 350,
    h: 200,
    roof: "#707c7a",
    wall: "#d5be92",
    style: "museum",
  },
  {
    id: "sokos",
    name: "SOKOS",
    x: 580,
    y: 1495,
    w: 260,
    h: 200,
    roof: "#898a7b",
    wall: "#c6bca3",
    courtyard: true,
  },
  {
    id: "post",
    name: "POSTITALO",
    x: 210,
    y: 885,
    w: 200,
    h: 275,
    roof: "#848a7e",
    wall: "#b6a488",
  },
  {
    id: "sanoma",
    x: 190,
    y: 430,
    w: 220,
    h: 350,
    roof: "#688181",
    wall: "#8caba7",
    courtyard: true,
  },
  {
    id: "forum",
    x: 250,
    y: 1820,
    w: 290,
    h: 220,
    roof: "#7b786b",
    wall: "#b49b80",
    courtyard: true,
  },
  {
    id: "west-1",
    x: 710,
    y: 1800,
    w: 180,
    h: 220,
    roof: "#8c7970",
    wall: "#c4a393",
  },
  {
    id: "west-2",
    x: 940,
    y: 1790,
    w: 195,
    h: 230,
    roof: "#707e7a",
    wall: "#c1b294",
    courtyard: true,
  },
  {
    id: "west-3",
    x: 1190,
    y: 1790,
    w: 300,
    h: 230,
    roof: "#8a7b70",
    wall: "#bba28c",
    courtyard: true,
  },
  {
    id: "fennia",
    name: "FENNIA",
    x: 1700,
    y: 1190,
    w: 260,
    h: 165,
    roof: "#867972",
    wall: "#cfb69b",
  },
  {
    id: "kaisa",
    name: "KAISA-TALO",
    x: 1865,
    y: 900,
    w: 330,
    h: 220,
    roof: "#796e63",
    wall: "#c1aa91",
    courtyard: true,
  },
  {
    id: "north-1",
    x: 1850,
    y: 650,
    w: 260,
    h: 190,
    roof: "#8b7c6d",
    wall: "#ceb18f",
    courtyard: true,
  },
  {
    id: "north-2",
    x: 2170,
    y: 640,
    w: 300,
    h: 190,
    roof: "#75837c",
    wall: "#b6b99f",
    courtyard: true,
  },
  {
    id: "north-3",
    x: 2510,
    y: 650,
    w: 270,
    h: 190,
    roof: "#967d70",
    wall: "#d2b59c",
    courtyard: true,
  },
  {
    id: "north-4",
    x: 2250,
    y: 920,
    w: 510,
    h: 170,
    roof: "#737f77",
    wall: "#c9bea4",
    courtyard: true,
  },
  {
    id: "east-1",
    x: 2070,
    y: 1190,
    w: 245,
    h: 160,
    roof: "#73847c",
    wall: "#c9b498",
    courtyard: true,
  },
  {
    id: "east-2",
    x: 2460,
    y: 1170,
    w: 310,
    h: 220,
    roof: "#857467",
    wall: "#c1ac8e",
    courtyard: true,
  },
  {
    id: "east-3",
    x: 2460,
    y: 1460,
    w: 310,
    h: 270,
    roof: "#7f8680",
    wall: "#c2baa5",
    courtyard: true,
  },
  {
    id: "block-a",
    x: 1660,
    y: 1515,
    w: 285,
    h: 220,
    roof: "#78817d",
    wall: "#cdbaa2",
    courtyard: true,
  },
  {
    id: "block-b",
    x: 2090,
    y: 1485,
    w: 225,
    h: 250,
    roof: "#9b8072",
    wall: "#c6a58c",
    courtyard: true,
  },
  {
    id: "kaemp",
    name: "HOTEL KÄMP",
    x: 2090,
    y: 2150,
    w: 220,
    h: 180,
    roof: "#7e8c7d",
    wall: "#dfc7a4",
  },
  {
    id: "galleria",
    x: 1660,
    y: 1870,
    w: 285,
    h: 150,
    roof: "#887e73",
    wall: "#d0b9a1",
    courtyard: true,
  },
  {
    id: "kluuvi",
    name: "KLUUVI",
    x: 2090,
    y: 1870,
    w: 225,
    h: 150,
    roof: "#7b8780",
    wall: "#c7b89e",
  },
  {
    id: "university",
    name: "HELSINGIN YLIOPISTO",
    x: 2460,
    y: 1870,
    w: 310,
    h: 150,
    roof: "#85897f",
    wall: "#e2d5af",
  },
  {
    id: "stockmann",
    name: "STOCKMANN",
    x: 910,
    y: 2160,
    w: 580,
    h: 170,
    roof: "#7d887e",
    wall: "#b7ab91",
    courtyard: true,
  },
  {
    id: "south-a",
    x: 1660,
    y: 2150,
    w: 285,
    h: 180,
    roof: "#8a7e73",
    wall: "#cab196",
    courtyard: true,
  },
  {
    id: "south-b",
    x: 2460,
    y: 2150,
    w: 310,
    h: 180,
    roof: "#747f78",
    wall: "#cbb698",
    courtyard: true,
  },
  {
    id: "cathedral",
    name: "HELSINGIN TUOMIOKIRKKO",
    x: 2970,
    y: 1390,
    w: 270,
    h: 260,
    roof: "#81a799",
    wall: "#e6e2c7",
    style: "cathedral",
  },
  {
    id: "senate-east",
    x: 2960,
    y: 1870,
    w: 290,
    h: 150,
    roof: "#877a6f",
    wall: "#d3bc91",
  },
  {
    id: "south-c",
    x: 2930,
    y: 2150,
    w: 320,
    h: 180,
    roof: "#8b7c6a",
    wall: "#d2b59a",
    courtyard: true,
  },
  {
    id: "south-d",
    x: 1200,
    y: 2770,
    w: 300,
    h: 120,
    roof: "#7d8a80",
    wall: "#b2ad96",
  },
  {
    id: "south-e",
    x: 1590,
    y: 2770,
    w: 390,
    h: 120,
    roof: "#957e70",
    wall: "#d0b99b",
    courtyard: true,
  },
  {
    id: "south-f",
    x: 2070,
    y: 2770,
    w: 290,
    h: 120,
    roof: "#7f887c",
    wall: "#c9b49b",
  },
];

export const landmarks: Landmark[] = [
  {
    id: "station",
    name: "Helsinki Central Station",
    finnish: "Helsingin päärautatieasema",
    category: "LANDMARK · 1919",
    x: 1000,
    y: 1350,
    description:
      "Granite giants, a copper clock tower, and a city on the move. Eliel Saarinen’s station has welcomed Helsinki home for over a century.",
  },
  {
    id: "square",
    name: "Rautatientori",
    finnish: "The Railway Square",
    category: "CITY SQUARE",
    x: 1420,
    y: 1100,
    description:
      "The city’s meeting place. Trams glide past the square, between the National Theatre and Ateneum’s ornate stone façade.",
  },
  {
    id: "ateneum",
    name: "Ateneum",
    finnish: "Suomen taiteen koti",
    category: "ART MUSEUM · 1887",
    x: 1305,
    y: 1498,
    description:
      "The home of Finnish art, with a richly decorated neo-Renaissance façade. For now, take it in from the street; interiors will come later.",
  },
  {
    id: "theatre",
    name: "Finnish National Theatre",
    finnish: "Suomen Kansallisteatteri",
    category: "THEATRE · 1902",
    x: 1450,
    y: 855,
    description:
      "A castle-like National Romantic landmark at the north end of Rautatientori, built in Finnish granite with red tiled roofs.",
  },
  {
    id: "park",
    name: "Kaisaniemi Park",
    finnish: "Kaisaniemen puisto",
    category: "PARK · 1829",
    x: 1410,
    y: 550,
    description:
      "A green escape just beyond the station. Gravel paths, old trees, and a quieter side of central Helsinki.",
  },
  {
    id: "esplanadi",
    name: "Esplanadi",
    finnish: "Esplanadin puisto",
    category: "CITY PARK · 1812",
    x: 2170,
    y: 2600,
    description:
      "Helsinki’s leafy living room. A long green promenade between two busy streets, lined with lindens and places to sit.",
  },
  {
    id: "cathedral",
    name: "Helsinki Cathedral",
    finnish: "Helsingin tuomiokirkko",
    category: "LANDMARK · 1852",
    x: 3110,
    y: 1775,
    description:
      "The white cathedral rises above Senate Square on the eastern edge of this first map section. A glimpse of the Helsinki still to come.",
  },
];

export const props: Prop[] = [];
const add = (kind: Prop["kind"], x: number, y: number, variant = 0) =>
  props.push({ kind, x, y, variant });
// The square is deliberately open, with furniture along its perimeter.
for (let y = 940; y < 1330; y += 86) {
  add("tree", 1250, y);
  add("tree", 1640, y);
}
for (let x = 1310; x < 1630; x += 94) {
  add("bench", x, 910);
  add("lamp", x, 1326);
}
add("statue", 1450, 911);
add("kiosk", 1220, 1330);
add("kiosk", 1688, 1372);
for (let x = 1280; x < 1600; x += 110) add("planter", x, 1350);
for (let x = 1180; x < 1500; x += 125) {
  add("tree", x, 1474);
  add("bench", x + 34, 1480);
}
for (let y = 1560; y < 2360; y += 125) {
  add("lamp", 1540, y);
  add("tree", 1990, y);
  add("planter", 2053, y + 45);
  if (y < 1770) add("bench", 1540, y + 48);
}
for (let x = 700; x < 3250; x += 180) {
  add("tree", x, 2456);
  add("tree", x, 2646);
  add("bench", x + 45, 2460);
  add("bench", x + 45, 2640);
}
add("statue", 2180, 2550);
add("kiosk", 2710, 2550);
for (let i = 0; i < 45; i++) {
  const x = 1230 + ((i * 163) % 490),
    y = 70 + ((i * 107) % 620);
  if (y < 620 && (x > 1210 || y < 290) && Math.hypot(x - 1430, y - 420) > 70)
    add("tree", x, y, i % 3);
}
for (let i = 0; i < 12; i++)
  add("tree", 60 + ((i * 137) % 340), 70 + ((i * 103) % 285));
for (let x = 1730; x < 3300; x += 170) {
  add("lamp", x, 2040);
  add("lamp", x, 2140);
}
for (let y = 1550; y < 2350; y += 180) {
  add("lamp", 2340, y);
  add("tree", 2810, y);
}
for (let i = 0; i < 5; i++) add("bicycle", 860 + i * 17, 1344);

export const propBounds = (p: Prop): Rect | null => {
  switch (p.kind) {
    case "tree":
      return { x: p.x - 6, y: p.y - 6, w: 12, h: 12 };
    case "lamp":
      return { x: p.x - 3, y: p.y - 3, w: 6, h: 6 };
    case "bench":
      return { x: p.x - 14, y: p.y - 5, w: 28, h: 10 };
    case "planter":
      return { x: p.x - 13, y: p.y - 9, w: 26, h: 18 };
    case "kiosk":
      return { x: p.x - 23, y: p.y - 18, w: 46, h: 36 };
    case "statue":
      return { x: p.x - 14, y: p.y - 14, w: 28, h: 28 };
    case "bicycle":
      return { x: p.x - 5, y: p.y - 10, w: 10, h: 20 };
  }
};

export const parkedCarBounds: Rect[] = [
  ...Array.from({ length: 6 }, (_, i) => ({
    x: 2309,
    y: 1183 + i * 28,
    w: 18,
    h: 34,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    x: 1718 + i * 48,
    y: 1839,
    w: 34,
    h: 18,
  })),
];

export const colliders: Rect[] = [
  ...buildings,
  ...parkedCarBounds,
  ...props.map(propBounds).filter((r): r is Rect => r !== null),
];

export function locationAt(p: Point): string {
  if (p.y < 700) return "Kaisaniemi";
  if (p.y > 2430 && p.y < 2670) return "Esplanadi";
  if (p.x > 2880 && p.y > 1650 && p.y < 2060) return "Senaatintori";
  if (p.x > 1200 && p.x < 1690 && p.y > 840 && p.y < 1360)
    return "Rautatientori";
  if (Math.abs(p.y - 1420) < 90) return "Kaivokatu";
  if (Math.abs(p.y - 2090) < 70) return "Aleksanterinkatu";
  if (Math.abs(p.x - 1590) < 65) return "Mikonkatu";
  if (Math.abs(p.x - 2020) < 65) return "Kluuvikatu";
  if (p.x < 900) return "Mannerheimintie";
  return "Kluuvi";
}
