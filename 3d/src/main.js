// Candy Quest 3D — boot, screens, input, fixed-step loop, persistence and dev hooks.
import * as Sim from './sim.js';
import { LEVELS, ITEMS, MONSTERS } from './data.js';
import { World, PX } from './world.js';
import { bakeIcons } from './icons.js';
import { Hud, PLAYABLE_3D, helpSheet } from './hud.js';
import { randomSeed } from './rng.js';
import { THREE } from './kit.js';

const Q = new URLSearchParams(location.search);
const DEV = Q.has('dev');
const store = {
  get(k, d) { try { const v = localStorage.getItem('cq3d_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('cq3d_' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
};

// ------------------------------------------------------------------ quality ladder (persisted; steps down after a lost context)
const COARSE = matchMedia('(pointer:coarse)').matches;
const TIERS = {
  high: { name: 'high', msaa: true, maxDpr: 2, shadows: true, softShadows: true, shadowMap: 2048 },
  medium: { name: 'medium', msaa: false, maxDpr: 2, shadows: true, softShadows: false, shadowMap: 1024 },
  low: { name: 'low', msaa: false, maxDpr: 1.5, shadows: false, softShadows: false, shadowMap: 512 },
};
const tierName = Q.get('gfx') || store.get('gfx', COARSE ? 'medium' : 'high');
const quality = TIERS[tierName] || TIERS.high;

// ------------------------------------------------------------------ app state
const app = { screen: 'boot', G: null, level: 1, paused: false, frozen: false, stepQueue: 0, simdt: Q.has('simdt') ? +Q.get('simdt') : null,
  seed: Q.has('seed') ? +Q.get('seed') >>> 0 : null, unlocked: store.get('unlocked', { 1: true }), frameMs: [], lastWin: null, bootMs: 0 };
let world, hud, icons;
const $ = (s) => document.querySelector(s);
const screenEl = $('#screen');

function newGame(level, seed) {
  const s = seed ?? app.seed ?? randomSeed();
  return Sim.createGame(level, { seed: s, savedPets: store.get('pets', []), autoHit: store.get('autohit', false), onSavePets: (p) => store.set('pets', p) });
}

// ------------------------------------------------------------------ screens
function showTitle() {
  app.screen = 'title'; hud.unmount(); app.paused = false; document.body.classList.add('on-title');
  if (!app.G || app.G.level !== 1 || app.G.tick > 0) { app.G = newGame(1, 1); world.setLevel(app.G); }
  world.setCam('title');
  screenEl.innerHTML = `<div class="scr title">
    <div class="logo">CANDY<br><span>QUEST</span><em>3D</em></div>
    <div class="tagline">A real-time candy-world adventure · stop the evil Hichew King</div>
    <button class="bigbtn" data-go="select">▶ Play</button>
    <a class="lnk" href="../">Play the classic 2D version</a>
    <div class="stamp">${window.CQ3D_BUILD}</div></div>`;
}
function levelThumb(id) {
  if (id === 1 && app.thumb1) return `background-image:url(${app.thumb1})`;
  return `background:${LEVELS[id].sky}`;
}
function showSelect() {
  app.screen = 'select'; hud.unmount(); document.body.classList.remove('on-title');
  const cards = Object.values(LEVELS).map((L) => {
    const in3d = PLAYABLE_3D.has(L.id), open = !!app.unlocked[L.id];
    const cls = !in3d ? 'soon' : open ? 'open' : 'locked';
    const badge = !in3d ? 'Classic only' : open ? '▶ Play' : '🔒 Clear Level ' + (L.id - 1);
    return `<button class="lvl ${cls}" data-lvl="${L.id}"><div class="th" style="${levelThumb(L.id)}"></div><span class="badge">${badge}</span>
      <div class="mt"><div class="n">LEVEL ${L.id}</div><h3>${L.name}</h3>${!in3d ? '<span class="cl">Coming to 3D — play it in Classic ↗</span>' : ''}</div></button>`;
  }).join('');
  screenEl.innerHTML = `<div class="scr select"><button class="backlink" data-go="title">← Title</button><h1>Quest 1</h1>
    <div class="muted">Stop the Hichew King. Clear a level to unlock the next.</div><div class="lvls">${cards}</div></div>`;
}
function startLevel(level) {
  app.level = level; app.G = newGame(level); app.paused = false;
  world.setLevel(app.G); world.setCam(DEV && Q.get('cam') ? Q.get('cam') : 'play');
  screenEl.innerHTML = ''; hud.mount(app.G); app.screen = 'play'; app.acc = 0; document.body.classList.remove('on-title');
}
function showWin() {
  const G = app.G; app.screen = 'win'; hud.closePanel();
  if (G.level < 10) { app.unlocked = { ...app.unlocked, [G.level + 1]: true }; store.set('unlocked', app.unlocked); }
  app.lastWin = { level: G.level, crystals: G.crystals };
  const next = LEVELS[G.level + 1];
  screenEl.innerHTML = `<div class="scr win"><h1>Level ${G.level}<br>Clear!</h1><div class="tagline">The ${LEVELS[G.level].name} is safe… for now.</div>
    <div class="rewards"><div class="reward">${hud.img('crystal')}${G.crystals} crystals</div>${next ? `<div class="reward">🔓 ${next.name} unlocked!</div>` : '<div class="reward">🏆 Quest 1 complete!</div>'}</div>
    <div style="display:flex;gap:1em;margin-top:1em"><button class="bigbtn" data-go="select">Level Select →</button><button class="bigbtn alt" data-go="replay">↺ Replay</button></div></div>`;
  hud.el.hidden = true;
}
function showPause(on) {
  if (app.screen !== 'play') return;
  app.paused = on; hud.closePanel();
  screenEl.innerHTML = on ? `<div class="scr pause"><h1>Paused</h1><div class="stack">
    <button class="bigbtn" data-go="resume">Resume</button><button class="bigbtn alt" data-go="help">How to play</button>
    <button class="bigbtn alt" data-go="select">Level select</button>
    <button class="btn ghost" data-go="gfx" style="background:rgba(255,255,255,.8)">Graphics: ${quality.name}</button></div></div>` : '';
}
screenEl.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-go],[data-lvl]'); if (!b) return;
  const go = b.dataset.go;
  if (b.dataset.lvl) { const id = +b.dataset.lvl; if (!PLAYABLE_3D.has(id)) { location.href = '../'; return; } if (app.unlocked[id] || DEV) startLevel(id); return; }
  if (go === 'select') showSelect(); else if (go === 'title') showTitle(); else if (go === 'replay') startLevel(app.lastWin.level);
  else if (go === 'resume') showPause(false); else if (go === 'help') { showPause(false); app.paused = true; hud.openPanel('help'); }
  else if (go === 'gfx') { const order = ['high', 'medium', 'low']; store.set('gfx', order[(order.indexOf(quality.name) + 1) % 3]); location.reload(); }
});

// ------------------------------------------------------------------ HUD actions → sim
function act(a, arg) {
  const G = app.G; if (!G) return;
  switch (a) {
    case 'attack': Sim.doAttack(G); break;
    case 'tame': Sim.doTame(G); break;
    case 'autohit': G.autoHit = !!arg; store.set('autohit', G.autoHit); break;
    case 'inv': case 'craft': case 'party': case 'help': hud.openPanel(a); break;
    case 'pause': showPause(true); break;
    case 'close': hud.closePanel(); if (app.paused && !screenEl.innerHTML) app.paused = false; break;
    case 'equip': Sim.equip(G, ITEMS[arg].kind, arg); break;
    case 'use': Sim.useFood(G, arg); break;
    case 'craftrow': Sim.craft(G, +arg); break;
    case 'toggle': Sim.toggleMember(G, arg); break;
    case 'revive': Sim.revive(G, arg); break;
  }
  drain();
}

// ------------------------------------------------------------------ input
const KEYMAP = { w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down', a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right' };
const held = new Set();
function applyKeys() { const G = app.G; if (!G) return; const I = G.input; I.up = I.down = I.left = I.right = false; for (const k of held) if (KEYMAP[k]) I[KEYMAP[k]] = true; }
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (DEV && k === '`') { toggleDiag(); return; }
  if (app.screen !== 'play') return;
  if (k === 'escape') { if (hud.panel) { hud.closePanel(); if (!screenEl.innerHTML) app.paused = false; } else showPause(!app.paused); return; }
  if (k === '?' || (k === '/' && e.shiftKey)) { hud.openPanel('help'); return; }
  if (k === 'i') { hud.openPanel('inv'); return; } if (k === 'c') { hud.openPanel('craft'); return; } if (k === 'p') { hud.openPanel('party'); return; }
  if (hud.panel || app.paused) return;
  if (KEYMAP[k]) { held.add(k); applyKeys(); Sim.cancelOrders(app.G); hud.hideHint(); e.preventDefault(); }
  if ((k === ' ' || k === 'j') && !e.repeat) { Sim.doAttack(app.G); e.preventDefault(); }
  if ((k === 'e' || k === 'f') && !e.repeat) Sim.doTame(app.G);
  if (k === 'shift') Sim.dash(app.G);
});
addEventListener('keyup', (e) => { held.delete(e.key.toLowerCase()); applyKeys(); });
const dropKeys = () => { held.clear(); applyKeys(); };
addEventListener('blur', dropKeys); document.addEventListener('visibilitychange', dropKeys);

const canvas = $('#gl');
let pointerHeld = false;
function aim(ev) {
  const G = app.G; const pk = world.pick(ev.clientX, ev.clientY);
  if (pk.wx == null) return;
  const r = Sim.aimAt(G, pk.wx, pk.wy, pk.item ? 'ground' : pk.id); hud.hideHint();
  app.lastAim = { ...pk, result: r };
}
canvas.addEventListener('pointerdown', (ev) => {
  if (app.screen !== 'play' || app.paused || hud.panel) return;
  try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
  pointerHeld = true; aim(ev);
});
canvas.addEventListener('pointermove', (ev) => {
  if (app.screen !== 'play' || app.paused || hud.panel) return;
  if (pointerHeld) aim(ev);
  else if (ev.pointerType === 'mouse') { const pk = world.pick(ev.clientX, ev.clientY); if (pk.id) world.hover(pk.id); canvas.style.cursor = pk.id ? 'pointer' : ''; }
});
const up = () => { pointerHeld = false; };
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

// ------------------------------------------------------------------ events: sim → world FX + HUD
function drain() {
  const G = app.G; if (!G || !G.events.length) return;
  const evs = G.events.splice(0);
  world.onEvents(G, evs);
  let ui = false;
  for (const ev of evs) {
    if (ev.t === 'toast') hud.toast(ev.msg);
    if (ev.t === 'ui') ui = true;
    if (ev.t === 'win') setTimeout(showWin, 250);
  }
  if (app.screen === 'play') hud.update(G, ui);
}

// ------------------------------------------------------------------ loop (fixed 60 Hz sim; capped catch-up so a stall never teleports anyone)
const STEP = 1 / 60, MAX_CATCHUP = 24;
let last = 0; app.acc = 0;
function frame(t) {
  requestAnimationFrame(frame);
  const now = t / 1000; let dt = last ? now - last : STEP; last = now;
  if (!(dt >= 0)) dt = 0; dt = Math.min(dt, 0.25);
  const G = app.G;
  if (G && app.screen === 'play' && !G.won) {
    const running = !app.paused && !hud.panel && !app.frozen;
    let n = 0;
    if (app.stepQueue > 0) { while (app.stepQueue > 0) { Sim.step(G, 1); app.stepQueue--; n++; } }
    else if (running) {
      if (app.simdt != null) { for (let i = 0; i < app.simdt; i++) Sim.step(G, 1); n = app.simdt; }
      else { app.acc += dt; while (app.acc >= STEP && n < MAX_CATCHUP) { Sim.step(G, 1); app.acc -= STEP; n++; } if (n >= MAX_CATCHUP) app.acc = 0; }
    }
    if (dt > 6) Sim.cancelOrders(G);
    drain();
    hud.update(G);
  }
  if (world && G) {
    const t0 = performance.now();
    world.lastDt = dt; world.sync(G, app.screen === 'play' && (app.paused || hud.panel || app.frozen) ? 0 : dt); world.render();
    const ms = performance.now() - t0;
    app.frameMs.push(dt * 1000); if (app.frameMs.length > 240) app.frameMs.shift();
    app.cpuMs = ms;
    if (app.frames != null) app.frames++;
    if (diagOn) updateDiag();
  }
}

// ------------------------------------------------------------------ diagnostics overlay (?dev, ?diag, or ` in dev) — works on phones too
let diagOn = Q.has('diag');
function toggleDiag() { diagOn = !diagOn; $('#diag').hidden = !diagOn; }
function pct(a, p) { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; }
function updateDiag() {
  if ((app.diagTick = (app.diagTick || 0) + 1) % 10) return;
  const s = world.stats();
  $('#diag').textContent = `${window.CQ3D_BUILD}  gfx:${quality.name}  dpr:${s.pixelRatio}\n${s.gpu}\nframe p50 ${pct(app.frameMs, 0.5).toFixed(1)}ms  p99 ${pct(app.frameMs, 0.99).toFixed(1)}ms  cpu ${app.cpuMs.toFixed(1)}ms\n` +
    `draws ${s.calls}  tris ${(s.tris / 1000).toFixed(0)}k  programs ${s.programs}  geos ${s.geometries}  tex ${s.textures}\nctxLost ${s.contextLost}  shaderErr ${s.lastShaderError ? s.lastShaderError.slice(0, 60) : '—'}` +
    (app.G ? `\nsim t ${app.G.time.toFixed(1)}s  tick ${app.G.tick}  seed ${app.G.seed}` : '');
}

// ------------------------------------------------------------------ dev hooks
function state() {
  const G = app.G, s = world ? world.stats() : {};
  return { screen: app.screen, build: window.CQ3D_BUILD, quality: quality.name, paused: app.paused, frozen: app.frozen, panel: hud ? hud.panel : null,
    frameMs: { p50: +pct(app.frameMs, 0.5).toFixed(2), p99: +pct(app.frameMs, 0.99).toFixed(2) }, drawCalls: s.calls, triangles: s.tris, programs: s.programs,
    gpu: s.gpu, contextLost: s.contextLost, lastShaderError: s.lastShaderError, lights: s.lights, bootMs: app.bootMs, cam: world ? world.camName : null,
    views: world ? world.views.size : 0,
    heroGear: (() => { const v = world && app.G && world.views.get(app.G.player.id); return v ? { weapon: v.weaponId, armor: v.armorId, weaponMeshes: v.parts.weapon.children.length, armorMeshes: v.parts.armor.children.length } : null; })(),
    panelShell: (() => { const e = document.querySelector('#panel .scrim'); return e ? (e.dataset.gen || (e.dataset.gen = String(Math.random()))) : null; })(), faded: world && world.biome ? world.biome.occluders.filter((o) => o.fade < 0.6).map((o) => o.mesh.name + '@' + Math.round(o.x / PX) + ',' + Math.round(o.z / PX)) : [], sim: G ? Sim.snapshot(G) : null, lastAim: app.lastAim || null };
}
const SPOTS = { start: () => Sim.PLAYER_START, camp: () => Sim.CAMP, gate: () => ({ x: app.G.gate.x - 150, y: app.G.gate.y }),
  boss: () => { const b = [...app.G.ents.values()].find((e) => e.boss); return b ? { x: b.x - 140, y: b.y } : Sim.PLAYER_START; },
  wild: () => { const w = [...app.G.ents.values()].find((e) => e.faction === 'wild'); return w ? { x: w.x - 90, y: w.y } : Sim.PLAYER_START; },
  pond: () => ({ x: 520, y: 1000 }) };
const hooks = {
  getState: state,
  start: (lvl = 1) => startLevel(lvl), title: showTitle, select: showSelect,
  teleport(x, y) { const G = app.G; const p = typeof x === 'string' ? SPOTS[x]() : { x, y }; G.player.x = p.x; G.player.y = p.y; Sim.cancelOrders(G); world.cut = true; return { x: G.player.x, y: G.player.y }; },
  freeze() { app.frozen = true; }, resume() { app.frozen = false; }, step(n = 1) { app.stepQueue += n; },
  setTimeOfDay(h) { const a = ((h - 6) / 12) * Math.PI; world.sunDir.set(-Math.cos(a) * 0.8, Math.max(0.12, Math.sin(a)), 0.45).normalize(); if (world.sky) world.sky.material.uniforms.sunDir.value.copy(world.sunDir); },
  setSeed(n) { app.seed = n >>> 0; if (app.screen === 'play') startLevel(app.level); },
  spawn(kind, at) { const G = app.G; const p = at || { x: G.player.x + 200, y: G.player.y }; const m = MONSTERS[kind];
    if (!m) return null; return G._mk({ faction: 'enemy', mkey: kind, sprite: m.sprite, name: m.name, x: p.x, y: p.y, maxhp: m.hp, hp: m.hp, atk: m.atk, def: m.def, speed: m.speed, range: m.range, akind: m.kind, xp: m.xp, proj: m.proj, spike: m.spike, boss: m.boss, cd: 0.5, home: { ...p } }).id; },
  clearAll() { const G = app.G; for (const e of [...G.ents.values()]) if (e.faction === 'enemy' && !e.boss) { e.dead = true; G.ents.delete(e.id); } G.projs.length = 0; },
  win() { const G = app.G; G.bossDead = true; G.player.x = G.gate.x - 40; G.player.y = G.gate.y; world.cut = true; },
  lose() { const G = app.G; G.iframe = 0; Sim.debugDamage(G, G.player, G.player.hp + 1); },
  killBoss() { const b = [...app.G.ents.values()].find((e) => e.boss); if (b) { b.hp = 0.5; } },
  cam(name) { world.setCam(name); return world.camName; },
  // screen position (CSS px) of an entity's chest, or of a world px point, for driving real mouse input in tests
  screenOf(idOrX, y) {
    if (typeof idOrX === 'string') { const v = world.views.get(idOrX) || world.itemViews.get(idOrX); if (!v) return null; const p = v.group.position; return world.project(p.x, (v.h || 0.5) * 0.5, p.z); }
    return world.project(idOrX * PX, 0, y * PX);
  },
  hudRect(sel) { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; },
  diag(on = true) { diagOn = !on; toggleDiag(); },
  sim: Sim, get G() { return app.G; }, get world() { return world; }, THREE,
};

// ------------------------------------------------------------------ boot
async function boot() {
  const t0 = performance.now();
  world = new World(canvas, quality);
  world.onContextLost = () => {
    const order = ['high', 'medium', 'low']; const i = order.indexOf(quality.name); if (i < 2) store.set('gfx', order[i + 1]);
    setTimeout(() => { if (world.contextLost) { const d = document.createElement('div'); d.className = 'graphics-reset'; d.textContent = 'Graphics reset — tap to reload'; d.onclick = () => location.reload(); $('#app').appendChild(d); } }, 2500);
  };
  world.onContextRestored = () => { const d = $('.graphics-reset'); if (d) d.remove(); };
  icons = bakeIcons(world.renderer);
  hud = new Hud(icons, act);
  // title scene doubles as the shader warm-up: build level 1, show every FX pool once, compile, draw a real frame
  app.G = newGame(1, 1); world.setLevel(app.G); world.setCam('title');
  for (const p of [...world.parts.slice(0, 3), ...world.hearts.slice(0, 1), ...world.slashes.slice(0, 1), ...world.projMeshes.slice(0, 1)]) p.m ? (p.m.visible = true) : (p.visible = true);
  world.sync(app.G, 0); world.renderer.compile(world.scene, world.camera); world.render();
  for (const p of [...world.parts, ...world.hearts, ...world.slashes]) p.m.visible = false; for (const m of world.projMeshes) m.visible = false;
  world.render();
  app.thumb1 = snapThumb();
  if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
  app.bootMs = Math.round(performance.now() - t0);
  showTitle();
  $('#loading').classList.add('done'); setTimeout(() => $('#loading').remove(), 500);
  requestAnimationFrame(frame);
  if (DEV) {
    window.cq = hooks; $('#diag').hidden = !diagOn;
    if (Q.has('level')) startLevel(+Q.get('level'));
  }
  if (Q.has('diag')) $('#diag').hidden = false;
}
// level-select thumbnail for Level 1: a real frame of the forest from the overview camera
function snapThumb() {
  const prev = world.camName; world.setCam('overview'); world.sync(app.G, 0); world.render();
  const c = document.createElement('canvas'); c.width = 320; c.height = 180; const g = c.getContext('2d');
  const src = world.renderer.domElement; const sw = src.width, sh = src.height, ar = 320 / 180; let w = sw, h = sw / ar; if (h > sh) { h = sh; w = sh * ar; }
  g.drawImage(src, (sw - w) / 2, (sh - h) / 2, w, h, 0, 0, 320, 180);
  world.setCam(prev); return c.toDataURL('image/jpeg', 0.8);
}
boot().catch((e) => { console.error(e); const d = $('#loading'); if (d) d.querySelector('.lt').textContent = 'Could not start: ' + e.message; });
export { app, PX, THREE };
