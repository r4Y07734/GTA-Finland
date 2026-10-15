import "@fontsource-variable/dm-sans";
import "@fontsource-variable/space-grotesk";
import "./style.css";
import { Game, type GameState } from "./game";
import { landmarks, WORLD, type Landmark } from "./world";

const icons = {
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16"/>',
  book: '<path d="M4 3h13a3 3 0 0 1 3 3v15H6a3 3 0 0 1-3-3V6a3 3 0 0 1 1-3Zm2 14h14M7 7h8m-8 4h5"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  target:
    '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l1.5 1.5m13 13L20 20M4 20l1.5-1.5m13-13L20 4"/>',
  walk: '<circle cx="14" cy="4" r="2"/><path d="m7 21 4-7-1-5 4-2 3 5 4 1m-11-4-4 4-3-1m10 3 4 6m-6-7 3 1"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3v1"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  check: '<path d="m5 12 4 4 10-10"/>',
  flag: '<path d="M5 22V3m0 0c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>',
};
const icon = (name: keyof typeof icons, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="./" aria-label="GTA Finland home"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span class="wordmark">GTA<span>FINLAND</span></span></a>
    <span class="brand-caption">A DIFFERENT KIND<br>OF OPEN WORLD.</span>
    <nav aria-label="Main navigation">
      <button class="nav-link active" id="explore-nav">${icon("compass")}<span>Explore</span><i></i></button>
      <button class="nav-link" id="map-nav">${icon("map")}<span>District map</span><kbd>M</kbd></button>
      <button class="nav-link" id="notes-nav">${icon("book")}<span>Field notes</span><span class="notes-count" id="notes-count">0</span></button>
    </nav>
    <div class="header-right"><span class="build-badge"><i></i> WORLD IN PROGRESS</span><span class="header-divider"></span><button class="icon-button" id="fullscreen" aria-label="Toggle fullscreen" title="Fullscreen">${icon("expand")}</button></div>
  </header>
  <main class="game-shell" id="game-shell">
    <canvas id="game" tabindex="0" aria-label="Playable Kluuvi map. Use W A S D or arrow keys to move, Shift to run, E for landmark notes, M for map."></canvas>
    <div class="map-grain" aria-hidden="true"></div>
    <div class="top-world-info"><span class="live-dot"></span><span>HELSINKI, FINLAND</span><span class="world-info-line"></span>${icon("sun")}<span>16:24</span><span class="weather">18°C</span></div>
    <section class="district-card" id="district-card" aria-label="District introduction">
      <div class="eyebrow"><span class="chapter">01</span> EXPLORE HELSINKI <button id="dismiss-intro" class="plain-close" aria-label="Minimize introduction">${icon("minus")}</button></div>
      <div class="district-title-row"><h1>Kluuvi<span>.</span></h1><span class="district-symbol">K<br><i>↗</i></span></div>
      <p class="district-subtitle">THE HEART OF THE CITY</p>
      <div class="intro-body"><p class="intro-lead">Familiar streets.<br>A new perspective.</p><p class="intro-description">From the station steps to the city’s quiet corners. Find your own way through a pixel-built Helsinki.</p><button class="explore-button" id="start-exploring">The streets are yours ${icon("arrow")}</button><div class="district-meta"><span>60.171° N &nbsp; 24.944° E</span><span>FI / 00100</span></div></div>
    </section>
    <div class="map-tools" aria-label="Map view controls">
      <div class="north-indicator" title="North is up"><span>N</span><svg viewBox="0 0 32 36" aria-hidden="true"><path d="m16 4 10 25-10-6-10 6Z" fill="#d7dfcc"/><path d="m16 4 10 25-10-6Z" fill="#718579"/></svg></div>
      <div class="zoom-tools"><button id="zoom-in" class="icon-button" aria-label="Zoom in" title="Zoom in (+)">${icon("plus")}</button><span></span><button id="zoom-out" class="icon-button" aria-label="Zoom out" title="Zoom out (−)">${icon("minus")}</button></div>
      <button id="recenter" class="icon-button recenter" aria-label="Center on player" title="Center on player">${icon("target")}</button>
    </div>
    <div class="toast" id="toast" role="status"></div>
    <button class="interaction-prompt" id="interaction" hidden><kbd>E</kbd><span>Discover this place</span>${icon("arrow")}</button>
    <div class="bottom-left">
      <div class="location-card"><div class="player-avatar"><span></span></div><div><span class="small-label">YOU ARE IN</span><div class="current-location" id="current-location">Rautatientori</div><span class="location-sub">Kluuvi <span>/</span> Helsinki</span></div><span class="on-foot">${icon("walk")} ON FOOT</span></div>
      <div class="movement-hint"><span class="wasd"><kbd>W</kbd><span><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span></span><span>Move around</span><span class="hint-divider"></span><kbd class="shift-key">SHIFT</kbd><span>Run</span><button id="controls-button" aria-label="Show all controls">${icon("help")}</button></div>
    </div>
    <div class="minimap-card"><div class="minimap-top"><span>YOUR NEIGHBORHOOD</span><button id="open-minimap" aria-label="Open district map">${icon("expand")}</button></div><button class="minimap-button" id="minimap-button" aria-label="Open district map"><canvas id="minimap" width="210" height="150"></canvas><span class="minimap-north">N ↑</span><span class="minimap-location">KLUUVI</span></button><div class="minimap-footer"><span><i></i> YOU</span><span id="discover-count">0 / 7 PLACES</span></div></div>
    <div class="touch-controls" id="touch-controls"><div class="dpad"><button data-dir="up" aria-label="Walk north">↑</button><button data-dir="left" aria-label="Walk west">←</button><button data-dir="down" aria-label="Walk south">↓</button><button data-dir="right" aria-label="Walk east">→</button></div><button class="touch-run" id="touch-run">RUN</button></div>
  </main>
  <footer class="statusbar"><div><span class="status-dot"></span> LIVE EXPLORATION <span class="footer-separator">/</span><span class="muted">CHAPTER 01: KLUUVI</span></div><div class="status-center">Built one street at a time.</div><div><span class="performance"><span id="fps">60</span> FPS</span><span class="footer-separator">/</span><span id="distance">0 m WALKED</span><span class="version">v0.1.0</span></div></footer>
  <dialog id="panel-dialog" aria-labelledby="dialog-title"><div class="dialog-content"><div class="dialog-top"><span class="eyebrow" id="dialog-eyebrow">KLUUVI / HELSINKI</span><button class="icon-button dialog-close" id="close-dialog" aria-label="Close panel">${icon("close")}</button></div><div id="dialog-body"></div></div></dialog>
`;

const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const game = new Game(
  $<HTMLCanvasElement>("game"),
  $<HTMLCanvasElement>("minimap"),
);
const dialog = $<HTMLDialogElement>("panel-dialog");
let panel: "map" | "notes" | "help" | "landmark" | "pause" | null = null;
let toastTimer: ReturnType<typeof setTimeout>;
let latest: GameState | null = null;
function toast(message: string) {
  clearTimeout(toastTimer);
  $("toast").innerHTML = message;
  $("toast").classList.add("visible");
  toastTimer = setTimeout(() => $("toast").classList.remove("visible"), 4200);
}
function closePanel() {
  dialog.close();
  panel = null;
  game.setPaused(false);
  $("map-nav").classList.remove("selected");
  $("notes-nav").classList.remove("selected");
  $("game").focus({ preventScroll: true });
}
function openPanel(type: NonNullable<typeof panel>, body: string) {
  panel = type;
  game.setPaused(true);
  $("dialog-body").innerHTML = body;
  $("dialog-eyebrow").textContent =
    type === "pause"
      ? "TAKE YOUR TIME"
      : type === "help"
        ? "MAKE YOURSELF AT HOME"
        : "KLUUVI / HELSINKI";
  if (!dialog.open) dialog.showModal();
  $("map-nav").classList.toggle("selected", type === "map");
  $("notes-nav").classList.toggle("selected", type === "notes");
}
function openMap() {
  openPanel(
    "map",
    `<div class="panel-heading"><div><h2 id="dialog-title">A city to get lost in<span>.</span></h2><p>Chapter 01 · Kluuvi & its surroundings</p></div><span class="map-scale">N ↑</span></div><div class="district-map-wrap"><canvas id="district-map" width="840" height="725" aria-label="Kluuvi district map with landmarks and your current position"></canvas><div class="map-watermark">HELSINKI<br><span>60°10′ N &nbsp; 24°56′ E</span></div></div><div class="map-legend"><span><i class="legend-player"></i> Your location</span><span><i class="legend-landmark"></i> Places to discover</span><span>${game.discovered.size} of ${landmarks.length} discovered</span></div><p class="panel-footnote">A handcrafted interpretation of central Helsinki. More streets are on the way.</p>`,
  );
  const canvas = $<HTMLCanvasElement>("district-map"),
    c = canvas.getContext("2d")!;
  c.imageSmoothingEnabled = false;
  c.drawImage(game.terrain.overview(1000), 0, 0, 840, 725);
  const sx = 840 / WORLD.w,
    sy = 725 / WORLD.h;
  for (const [i, l] of landmarks.entries()) {
    const x = l.x * sx,
      y = l.y * sy;
    c.fillStyle = game.discovered.has(l.id) ? "#d8af7b" : "#253f36";
    c.beginPath();
    c.arc(x, y, 11, 0, Math.PI * 2);
    c.fill();
    c.font = "bold 11px monospace";
    c.fillStyle = game.discovered.has(l.id) ? "#233d32" : "#f2e5c9";
    c.textAlign = "center";
    c.fillText(String(i + 1), x, y + 4);
  }
  const x = game.player.x * sx,
    y = game.player.y * sy;
  c.fillStyle = "#f2c48f";
  c.strokeStyle = "#fff6db";
  c.lineWidth = 2;
  c.beginPath();
  c.arc(x, y, 6, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  canvas.addEventListener("click", (e) => {
    const r = canvas.getBoundingClientRect(),
      px = ((e.clientX - r.left) / r.width) * WORLD.w,
      py = ((e.clientY - r.top) / r.height) * WORLD.h;
    const l = landmarks.find((l) => Math.hypot(l.x - px, l.y - py) < 100);
    if (l) showLandmark(l);
  });
}
function openNotes() {
  openPanel(
    "notes",
    `<h2 id="dialog-title">The places make the city<span>.</span></h2><p class="panel-description">A small field guide to your neighborhood. Walk up to a landmark to collect its story.</p><div class="notes-progress"><span>${game.discovered.size} / ${landmarks.length} PLACES DISCOVERED</span><div><i style="width:${(game.discovered.size / landmarks.length) * 100}%"></i></div></div><div class="landmark-list">${landmarks.map((l, i) => `<button class="landmark-item" data-landmark="${l.id}"><span class="landmark-number">0${i + 1}</span><div><h3>${l.name}</h3><span>${l.finnish}</span></div><span class="landmark-status ${game.discovered.has(l.id) ? "is-found" : ""}">${icon(game.discovered.has(l.id) ? "check" : "pin")}</span></button>`).join("")}</div><p class="panel-footnote">Buildings are exterior-only in this first chapter. Interiors and missions will follow.</p>`,
  );
  document
    .querySelectorAll<HTMLButtonElement>("[data-landmark]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          showLandmark(landmarks.find((l) => l.id === b.dataset.landmark)!)),
    );
}
function showLandmark(l: Landmark) {
  openPanel(
    "landmark",
    `<div class="place-illustration">${icon(l.id === "park" || l.id === "esplanadi" ? "compass" : "flag")}<span>HELSINKI · 00100</span></div><span class="place-category">${l.category}</span><h2 id="dialog-title">${l.name}<span>.</span></h2><p class="place-finnish">${l.finnish}</p><p class="place-story">${l.description}</p><div class="place-bottom"><span>${game.discovered.has(l.id) ? `${icon("check")} DISCOVERED` : `${icon("pin")} WALK HERE TO DISCOVER`}</span><button class="text-button" id="back-to-map">Find on the map ${icon("arrow")}</button></div><p class="panel-footnote">Exterior exploration · Building interiors are coming in a later chapter.</p>`,
  );
  $("back-to-map").onclick = openMap;
}
function showHelp() {
  openPanel(
    "help",
    `<h2 id="dialog-title">Find your own way<span>.</span></h2><p class="panel-description">No rush. No missions just yet. Just you, the city, and the next street over.</p><div class="controls-list"><div><span>Walk</span><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><small>or arrow keys</small></span></div><div><span>Run</span><kbd>SHIFT</kbd></div><div><span>Read a nearby landmark</span><kbd>E</kbd></div><div><span>District map</span><kbd>M</kbd></div><div><span>Zoom</span><span><kbd>+</kbd><kbd>−</kbd><small>or mouse wheel</small></span></div><div><span>Pause / close panel</span><kbd>ESC</kbd></div></div><p class="panel-footnote">Your position and discoveries are saved on this device. Solid buildings, trees, and street furniture shape where you can walk.</p><button class="primary-button" id="help-done">Let’s explore ${icon("arrow")}</button>`,
  );
  $("help-done").onclick = closePanel;
}
function showPause() {
  openPanel(
    "pause",
    `<span class="pause-symbol">Ⅱ</span><h2 id="dialog-title">The city can wait<span>.</span></h2><p class="panel-description">You’re right where you left off. Take a moment.</p><div class="pause-actions"><button id="resume" class="primary-button">Back to the streets ${icon("arrow")}</button><button id="reset-position" class="secondary-button">Return to Rautatientori ${icon("target")}</button></div><p class="panel-footnote">Returning to the square keeps your discovered places.</p>`,
  );
  $("resume").onclick = closePanel;
  $("reset-position").onclick = () => {
    game.reset();
    closePanel();
    toast("Back in <strong>Rautatientori.</strong> A good place to start.");
  };
}
const collapseIntro = () => {
  $("dismiss-intro").innerHTML = icon("plus");
  $("district-card").classList.add("collapsed");
  $("dismiss-intro").setAttribute("aria-label", "Expand introduction");
  $("game").focus({ preventScroll: true });
};
$("start-exploring").onclick = () => {
  collapseIntro();
  toast(
    "Welcome to <strong>Helsinki.</strong> Walk up to a landmark to discover its story.",
  );
};
$("dismiss-intro").onclick = () => {
  const collapsed = $("district-card").classList.toggle("collapsed");
  $("dismiss-intro").setAttribute(
    "aria-label",
    collapsed ? "Expand introduction" : "Minimize introduction",
  );
  $("dismiss-intro").innerHTML = icon(collapsed ? "plus" : "minus");
};
$("explore-nav").onclick = () => {
  if (dialog.open) closePanel();
  $("game").focus({ preventScroll: true });
};
$("map-nav").onclick = openMap;
$("open-minimap").onclick = openMap;
$("minimap-button").onclick = openMap;
$("notes-nav").onclick = openNotes;
$("controls-button").onclick = showHelp;
$("close-dialog").onclick = closePanel;
$("zoom-in").onclick = () => game.setZoom(game.zoom + 0.12);
$("zoom-out").onclick = () => game.setZoom(game.zoom - 0.12);
$("recenter").onclick = () => {
  game.recenter();
  toast("Camera centered on <strong>you.</strong>");
};
$("fullscreen").onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    toast(
      "Fullscreen is unavailable in this browser. You can keep exploring here.",
    );
  }
};
$("interaction").onclick = () => {
  const nearby = game.nearest();
  if (nearby) showLandmark(nearby);
};
dialog.addEventListener("cancel", (e) => {
  e.preventDefault();
  closePanel();
});
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) closePanel();
});
window.addEventListener("keydown", (e) => {
  if (dialog.open && e.key.toLowerCase() === "m" && panel === "map") {
    e.preventDefault();
    closePanel();
  }
});
game.onMap = () => {
  if (dialog.open) closePanel();
  else openMap();
};
game.onPause = () => {
  if (dialog.open) closePanel();
  else showPause();
};
game.onInteract = showLandmark;
game.onDiscover = (l) =>
  toast(
    `${icon("pin")} <span><small>PLACE DISCOVERED</small><strong>${l.name}</strong></span><span class="toast-count">${game.discovered.size} / ${landmarks.length}</span>`,
  );
game.onState = (s) => {
  latest = s;
  $("current-location").textContent = s.location;
  $("fps").textContent = String(s.fps);
  $("distance").textContent =
    `${s.distance < 1000 ? Math.floor(s.distance) + " m" : (s.distance / 1000).toFixed(1) + " km"} WALKED`;
  $("notes-count").textContent = String(s.discovered);
  $("discover-count").textContent =
    `${s.discovered} / ${landmarks.length} PLACES`;
  const prompt = $("interaction");
  prompt.hidden = !s.nearby || s.paused;
  if (s.nearby)
    prompt.innerHTML = `<kbd>E</kbd><span>${s.nearby.name}</span>${icon("arrow")}`;
  $("zoom-in").toggleAttribute("disabled", s.zoom >= 1.6);
  $("zoom-out").toggleAttribute("disabled", s.zoom <= game.minimumZoom);
};
// Pointer controls also work on hybrid laptops; releasing outside never sticks a key.
const activeDirections = new Map<number, string>();
const updateTouch = () => {
  const dirs = [...activeDirections.values()];
  game.touch.x = Number(dirs.includes("right")) - Number(dirs.includes("left"));
  game.touch.y = Number(dirs.includes("down")) - Number(dirs.includes("up"));
};
document.querySelectorAll<HTMLButtonElement>("[data-dir]").forEach((button) => {
  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    activeDirections.set(e.pointerId, button.dataset.dir!);
    updateTouch();
    button.classList.add("held");
  });
  const release = (e: PointerEvent) => {
    activeDirections.delete(e.pointerId);
    updateTouch();
    button.classList.remove("held");
  };
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
});
$("touch-run").addEventListener("pointerdown", (e) => {
  e.preventDefault();
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
  game.touch.sprint = true;
  $("touch-run").classList.add("held");
});
for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
  $("touch-run").addEventListener(type, () => {
    game.touch.sprint = false;
    $("touch-run").classList.remove("held");
  });
window.addEventListener("pagehide", () => game.save());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    game.save();
    game.setPaused(true);
  } else if (!dialog.open) game.setPaused(false);
});
// Read-only diagnostics for browser validation. No development dependency ships to the player.
if (import.meta.env.DEV)
  Object.assign(window, { __game: game, __state: () => latest });
