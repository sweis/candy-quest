# Candy Quest 3D — progress

Branch: `3d-port` (not merged to `main`; `main` deploys candyquest.live). Classic build untouched except a
"✨ Try Candy Quest 3D (beta)" link on its title screen (+ build stamp v10.5).

## What exists (3d/)
- `index.html` → `src/main.js`. Plain ES modules, no build step. three.js 0.186.1 vendored + minified in `3d/vendor/`.
- `src/data.js` — content tables extracted **verbatim** from `../index.html` (lines `window.ALLIES…LEVELS` + `makeScenery`).
  Check parity: `diff <(sed -n '1148,1300p' index.html) <(sed -n '5,157p' 3d/src/data.js | sed 's/^export const \([A-Z]*\)=/window.\1=/')`.
- `src/sim.js` — rule-for-rule port of the classic `Game()` sim: seeded RNG, fixed 60 Hz steps, event queue. Pure (runs in node).
- `src/kit.js` — modelling kit; everything lit shares ONE program (MeshStandard × vertex colours × pattern atlas).
- `src/models.js` / `items3d.js` / `scenery.js` — Pip, Level-1 cast (2 pets, 2 gloops, 4 Hichew soldiers, Captain), 31 items, forest biome + gate.
- `src/world.js` — renderer, fitted sun shadow, entity views, DOM tags, pooled FX, named cams, picking, occluder fade.
- `src/hud.js` — HUD/panels/help sheet (help generated from data tables). `src/icons.js` bakes icons from the 3D models at boot.
- Saves use `cq3d_*` localStorage keys (separate from classic `cq_*` saves).

## Scope decision
Level 1 is fully built in 3D. Levels 2–10 show in level select as "Classic only" and link to the classic build.
They *load* under `?dev&level=N` (sim works; bare ground + fallback blob models) — dev/testing only.

## Dev hooks (`?dev`, optional `&seed=N&level=N&simdt=N&cam=NAME&gfx=high|medium|low&diag`)
`window.cq`: `getState()`, `start(l)`, `teleport(x,y|'start'|'gate'|'boss'|'wild'|'pond')`, `freeze()/step(n)/resume()`,
`setTimeOfDay(h)`, `setSeed(n)`, `spawn(kind, at)`, `clearAll()`, `win()`, `lose()`, `killBoss()`, `cam('play'|'overview'|'hero-close'|'hud-check'|'title')`,
`screenOf(id|x,y)`, `hudRect(sel)`, `diag()`. Backtick toggles the diagnostics overlay in dev; `?diag` shows it anywhere (phones too).

## Tests (`cd 3d/test && npm install`, then `node <file>`)
| file | checks |
|---|---|
| `sim-smoke.mjs` | node-only sim: time advances, speed 3.68 m/s, taming, boss→gate→win, determinism |
| `boot.mjs` | 10 s headless boot, sim advances, no console errors, named-cam captures |
| `play.mjs` | cold boot via real clicks + hit-testing; W+D diagonal; click-to-move; tame both pets by clicking; equip via Bag UI; panels; novice bot clears L1 |
| `programs.mjs` | no shader program compiles after the first title frame (21 constant) |
| `occlusion.mjs` | bottom-edge lollipop fades when Pip is behind it |
| `sweep.mjs` | stills over every level in `LEVELS` (play + overview), blank-frame check; phone landscape touch pass |
| `shoot-classic-link.mjs` | classic title → 3D link click path |

Last run (2026-09-26, Apple M4 Pro via ANGLE/Metal, headless Chrome): all pass except the novice-bot
"0 knockouts" gate — bot clears L1 in ~60 s sim time but takes 1 KO (classic balance: Captain 340 HP / 20 ATK).

## Numbers (1280×720, high tier)
frame p50 16.7 / p99 16.8 ms (vsync-bound) · draws 120–170 in play (352 overview) · ~260–500k tris · 21 programs · 2 lights · boot ≈ 0.3–1 s after load.
Level 10 via dev path: ~1000 draws (111 enemies × ~7 part meshes) — needs instancing before L10 gets a 3D pass.

## Not verified
Real phones (only desktop Chrome phone emulation), Safari/Firefox, context-loss recovery on a real device, real-network deploy.

## Next
1. Human playtest read of Level 1 (feel, camera distance, readability).
2. Audio (WebAudio synth SFX) — classic has none; CLAUDE.md asks for it.
3. Level 2 (Rock Candy Caves) biome + cast, then widen.
4. Merge/instance enemy parts to cut per-draw cost for L10.
