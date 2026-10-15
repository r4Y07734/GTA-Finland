# GTA Finland

A browser-based, top-down pixel-art Helsinki. This first playable chapter starts on Rautatientori in Kluuvi. Walk between the station, Ateneum, the National Theatre, and the neighboring streets; head north to Kaisaniemi or south toward Esplanadi.

The map is an original, handcrafted interpretation of the supplied aerial reference. Street relationships and recognizable landmarks guide the layout, but block dimensions and footprints are approximate. It is not a surveyed or complete recreation of Kluuvi. No satellite imagery is downloaded or used as a game texture.

## Run

Requires Node.js 22.12+ (Node 24 is used in the cloud environment).

```sh
npm ci
npm run dev
```

Vite serves the game on port 5173. To create a production build, run `npm run build`; `npm run preview` serves the resulting `dist/`. Deploy `dist/` on any static web host. No backend, credentials, map API, or external font request is required.

## First chapter

- 38 solid building footprints, including purpose-built station, theatre, Ateneum, and cathedral artwork.
- Copper and slate roofs, skylights, chimneys, courtyards, granite paving, crosswalks, rails, tram stops, bicycles, kiosks, streetlights, benches, trees, and planters.
- Walking and sprinting with acceleration, normalized diagonal input, sliding collisions, and a following camera.
- Parked car and street-furniture collisions; ambient trams stop for the player and have solid bodies. Pedestrians are decorative in this first version.
- District map, live minimap, seven collectible landmark notes, pause and return-to-square controls, zoom, fullscreen, and touch controls.
- Device-local saves for position, walking distance, and discovered places. Clearing browser site data resets progress.

Buildings cannot be entered. Driving, missions, interiors, and a larger Helsinki are future work. The time and weather in the interface describe the scene, not live Helsinki conditions.

| Action                | Controls                        |
| --------------------- | ------------------------------- |
| Walk                  | WASD or arrow keys              |
| Run                   | Hold Shift                      |
| Read nearby landmark  | E, or click the landmark prompt |
| District map          | M or map button                 |
| Zoom                  | + / −, wheel, or zoom buttons   |
| Pause / close a panel | Escape                          |

Touch devices display a direction pad and a run button. The game pauses while a panel is open or its tab is hidden.

## Performance and structure

The runtime uses the browser's Canvas 2D API and TypeScript, without a game engine or UI framework. Art is generated deterministically at runtime and stays on the device.

- `src/world.ts`: map geometry, roads, building styles, props, solid bounds, and landmark stories. Add new map sections here first.
- `src/art.ts`: pixel artwork and lazy 512 × 512 terrain chunks. Only visible chunks are composited each frame. The terrain cache is limited to 48 chunks (about 48 MiB of raw color pixels). Trees use shared sprites. Static artwork is baked once per chunk rather than rebuilt per frame.
- `src/physics.ts`: 128-unit spatial hash and substepped circle/rectangle movement. Nearby cells are queried instead of scanning every building, and separate axis resolution allows sliding along walls.
- `src/game.ts`: movement, collision, camera, visibility culling, sorted characters/trees, ambient trams, persistence, and minimap. The scene canvas is capped at 1100 × 800 internal pixels and one pixel per CSS pixel, with crisp nearest-neighbor scaling. The HTML interface stays sharp on high-DPI displays. A fixed 60 Hz simulation keeps movement consistent independently of the display frame rate; the minimap refreshes at 10 Hz.
- `src/main.ts` / `src/style.css`: responsive interface and accessible native dialogs.

Map geometry and solid geometry share the same building/prop records. New streets should preserve walkable connections; add new landmark checks alongside the existing reachability test. Artwork is procedural, so future sections can share rendering styles while adding bespoke landmarks. Interior transitions can later be attached to building IDs without changing the exterior collision model.

## Validation

```sh
npm test
npm run build
npm run test:browser
```

The Node tests verify spawn safety, all landmark centers, connected walkable routes, no tunneling, sliding, spatial queries, and world boundaries. Playwright checks keyboard movement, station collision, sprinting, notes, map, help, pause, touch controls, saving, and that the page requests no outside resources.

Playwright uses `/usr/bin/chromium` when available. Else install its browser with `npx playwright install chromium`. Set `CHROMIUM_PATH` to use another Chromium executable. In restricted cloud filesystems, use a writable browser cache such as `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright` for both installation and test execution.

The first desktop Chromium run in the cloud environment displayed approximately 60 FPS at 1440 × 1000. This is a development observation, not a low-end hardware benchmark; future map and gameplay additions should be profiled on representative laptops.
