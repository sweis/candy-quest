// Candy Quest 3D — boot, screens, input, fixed-step loop, persistence and dev hooks.
import * as Sim from './sim.js';
import { LEVELS, ITEMS, MONSTERS } from './content.js';
import { World, PX } from './world.js';
import { bakeIcons } from './icons.js';
import { Hud, helpSheet } from './hud.js';
import { QUESTS, questOf, SHOP, ALLIES, canBuy } from './content.js';
import { gameDate, halloweenActive, halloweenDaysLeft } from './events.js';
import { randomSeed } from './rng.js';
import { THREE } from './kit.js';
import { solidsFor } from './solids.js';
import { catalog } from './models.js';

const Q = new URLSearchParams(location.search);
const DEV = Q.has('dev');
const store = {
  get(k, d) { try { const v = localStorage.getItem('cq3d_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('cq3d_' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
};

// ------------------------------------------------------------------ quality ladder (persisted; steps down after a lost context)
const COARSE = matchMedia('(pointer:coarse)').matches;
// seasonal: Halloween (Oct 28 – Nov 3) turns everything orange and puts the legendary twins in the Shop. ?date= previews.
const TODAY = gameDate(), HALLOWEEN = halloweenActive(TODAY);
if (HALLOWEEN) document.body.classList.add('halloween');
const TIERS = {
  high: { name: 'high', msaa: true, maxDpr: 2, shadows: true, softShadows: true, shadowMap: 2048, lodNear: 11 },
  medium: { name: 'medium', msaa: false, maxDpr: 2, shadows: true, softShadows: false, shadowMap: 1024, lodNear: 7 },
  low: { name: 'low', msaa: false, maxDpr: 1.5, shadows: false, softShadows: false, shadowMap: 512, lodNear: 5 },
};
const tierName = Q.get('gfx') || store.get('gfx', COARSE ? 'medium' : 'high');
const quality = TIERS[tierName] || TIERS.high;

// ------------------------------------------------------------------ app state
const app = { screen: 'boot', G: null, level: 1, paused: false, frozen: false, stepQueue: 0, simdt: Q.has('simdt') ? +Q.get('simdt') : null,
  seed: Q.has('seed') ? +Q.get('seed') >>> 0 : null, unlocked: store.get('unlocked', { 1: true }), frameMs: [], lastWin: null, bootMs: 0 };
let world, hud, icons;
const $ = (s) => document.querySelector(s);
const screenEl = $('#screen');

// collision radius (world px) from the 3D model's footprint; slightly under the visual radius so crowds read as touching
export function bodyRadius(sprite, e) { if (sprite === 'hero') return 15; const c = catalog(sprite); return Math.round(c.r * (c.scale || 1) * ((e && e.scale) || 1) * 50 * 0.72); }
function newGame(level, seed) {
  const s = seed ?? app.seed ?? randomSeed();
  return Sim.createGame(level, { seed: s, savedPets: store.get('pets', []), autoHit: store.get('autohit', false), onSavePets: (p) => store.set('pets', p),
    coins: store.get('coins', 0), onCoins: (c) => store.set('coins', c), bag: store.get('bag', null),
    solids: solidsFor(level), radiusOf: bodyRadius });
}

// ------------------------------------------------------------------ screens
function showTitle() {
  app.screen = 'title'; hud.unmount(); app.paused = false; document.body.classList.add('on-title');
  if (!app.G || app.G.level !== 1 || app.G.tick > 0) { app.G = newGame(1, 1); world.setLevel(app.G); }
  world.setCam('title');
  screenEl.innerHTML = `<div class="scr title">
    ${HALLOWEEN ? `<div class="evbanner">🎃 Halloween event — ${halloweenDaysLeft(TODAY)} day${halloweenDaysLeft(TODAY) === 1 ? '' : 's'} left! Legendary Pumpkin Pie Twins in the Shop</div>` : ''}
    <div class="logo">CANDY<br><span>QUEST</span><em>3D</em></div>
    <div class="tagline">A real-time candy-world adventure · stop the evil Hichew King</div>
    <button class="bigbtn" data-go="select">▶ Play</button>
    <a class="lnk" href="../">Play the classic 2D version</a>
    <div class="stamp">${window.CQ3D_BUILD}</div></div>`;
}
// Thumbnails are real engine frames rendered offline by test/thumbs.mjs (fallback: the classic sky gradient)
function levelThumb(id) { return `background:url(thumbs/L${id}.jpg?v=${encodeURIComponent(window.CQ3D_BUILD)}) center/cover, ${LEVELS[id].sky}`; }
function showSelect() {
  app.screen = 'select'; hud.unmount(); document.body.classList.remove('on-title');
  const card = (L) => {
    const open = isOpen(L.id), qn = L.qn || L.id;
    const prev = Object.values(LEVELS).find((x) => (x.quest || 1) === (L.quest || 1) && (x.qn || x.id) === qn - 1);
    const badge = open ? '▶ Play' : '🔒 Clear ' + (prev ? prev.name : 'Level ' + (qn - 1));
    return `<button class="lvl ${open ? 'open' : 'locked'}" data-lvl="${L.id}"><div class="th" style="${levelThumb(L.id)}"></div><span class="badge">${badge}</span>
      <div class="mt"><div class="n">${L.event ? 'HALLOWEEN' : 'LEVEL ' + qn}</div><h3>${L.name}</h3></div></button>`;
  };
  const sections = QUESTS.filter((Q) => !Q.event || (Q.event === 'halloween' && HALLOWEEN)).map((Q) => {
    const ls = Object.values(LEVELS).filter((L) => questOf(L) === Q.n).sort((a, b) => (a.qn || a.id) - (b.qn || b.id)); if (!ls.length) return '';
    return `<section class="quest q${Q.n}"><h2 class="qtitle">${Q.n === 1 ? 'Quest 1' : '<b>' + Q.title + '</b>'}</h2><div class="muted">${Q.blurb}</div><div class="lvls">${ls.map(card).join('')}</div></section>`;
  }).join('');
  screenEl.innerHTML = `<div class="scr select"><button class="backlink" data-go="title">← Title</button>
    <button class="shoplink" data-go="shop">🛒 Shop <span class="coins">🪙 ${store.get('coins', 0)}</span></button>
    ${HALLOWEEN ? '<div class="evbanner">🎃 Halloween event: the Legendary Pumpkin Pie Twins are in the Shop!</div>' : ''}${sections}</div>`;
}
// next level within the same quest (by its number in the quest); Quest 1's finale leads into Candy Quest 2
function nextLevel(L) {
  const all = Object.values(LEVELS), q = questOf(L);
  if (L.event) return null;
  return all.find((x) => questOf(x) === q && (x.qn || x.id) === (L.qn || L.id) + 1) || (q === 1 && (L.qn || L.id) === 10 ? all.find((x) => questOf(x) === 2 && x.qn === 1) : null);
}
// the first level of every quest is open from the start; later ones unlock when you clear the one before
function isOpen(id) { const L = LEVELS[id]; if (L.event === 'halloween' && !HALLOWEEN && !DEV) return false; return !!app.unlocked[id] || (L.qn || L.id) === 1 || DEV; }
function startLevel(level) {
  app.level = level; app.G = newGame(level); app.paused = false;
  world.setLevel(app.G); world.setCam(DEV && Q.get('cam') ? Q.get('cam') : 'play');
  screenEl.innerHTML = ''; hud.mount(app.G); app.screen = 'play'; app.acc = 0; document.body.classList.remove('on-title');
}
function showWin() {
  const G = app.G; app.screen = 'win'; hud.closePanel();
  const L = LEVELS[G.level], next = nextLevel(L);
  if (next) { app.unlocked = { ...app.unlocked, [next.id]: true }; store.set('unlocked', app.unlocked); }
  app.lastWin = { level: G.level, crystals: G.crystals };
  const nextNote = L.event ? '🎃 Happy Halloween!' : next ? `🔓 ${questOf(next) !== questOf(L) ? 'Candy Quest 2: ' : ''}${next.name} unlocked!` : '🍭 More Candy Quest 2 levels coming soon!';
  const purple = G.level === 2 || G.level === 4 || G.level === 5;
  screenEl.innerHTML = `<div class="scr win${purple ? ' purple' : ''}"><h1>${L.event ? '🎃 ' + L.name : (L.quest === 2 ? 'Quest 2 · ' : '') + 'Level ' + (L.qn || L.id)}<br>Clear!</h1><div class="tagline">The ${LEVELS[G.level].name} is safe… for now.</div>
    <div class="rewards"><div class="reward">${hud.img('crystal')}${G.crystals} crystals</div>${G.level === 10 ? '<div class="reward">🏆 Quest 1 complete!</div>' : ''}<div class="reward">${nextNote}</div></div>
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
  if (b.dataset.lvl) { const id = +b.dataset.lvl; if (LEVELS[id] && isOpen(id)) startLevel(id); return; }
  if (go === 'select') showSelect(); else if (go === 'title') showTitle(); else if (go === 'replay') startLevel(app.lastWin.level);
  else if (go === 'resume') showPause(false); else if (go === 'help') { showPause(false); app.paused = true; hud.openPanel('help'); }
  else if (go === 'shop') hud.openPanel('shop');
  else if (go === 'gfx') { const order = ['high', 'medium', 'low']; store.set('gfx', order[(order.indexOf(quality.name) + 1) % 3]); location.reload(); }
});

// ------------------------------------------------------------------ HUD actions → sim
// Shop: works in a level (coins live in G, items go to the bag) and on Level Select (pets only; wallet in storage)
function shopInfo() {
  const inLevel = app.screen === 'play' && app.G && !app.G.won;
  const coins = inLevel ? app.G.coins : store.get('coins', 0);
  const ownedPets = (inLevel ? app.G.party.map((m) => m.key) : store.get('pets', []).map((p) => p.key));
  return { coins, inLevel, ownedPets, date: TODAY };
}
function buy(id) {
  const entry = SHOP.find((e) => e.id === id); if (!entry) return;
  const info = shopInfo(); const v = canBuy(entry, info);
  if (!v.ok) return;
  if (info.inLevel) { if (entry.kind === 'pet') Sim.buyPet(app.G, id, entry.price); else Sim.buyItem(app.G, id, entry.price); drain(); }
  else if (entry.kind === 'item') {
    store.set('coins', info.coins - entry.price);
    const bag = store.get('bag', { inv: {}, equip: {}, crystals: 0 }); bag.inv = bag.inv || {}; bag.inv[id] = (bag.inv[id] || 0) + 1; store.set('bag', bag);
    hud.toast(`🛒 Bought ${ITEMS[id].name} — it's in your bag`);
    const c = document.querySelector('.shoplink .coins'); if (c) c.textContent = '🪙 ' + store.get('coins', 0);
  }
  else if (entry.kind === 'pet') {
    store.set('coins', info.coins - entry.price);
    const pets = store.get('pets', []); pets.push({ key: id, level: 1, xp: 0, maxhp: ALLIES[id].hp }); store.set('pets', pets);
    hud.toast(`✨ ${ALLIES[id].name} joined your party!`);
    const c = document.querySelector('.shoplink .coins'); if (c) c.textContent = '🪙 ' + store.get('coins', 0);
  }
  hud.renderPanel();
}
function act(a, arg) {
  if (a === 'buy') { buy(arg); return; }
  if (a === 'shop') { hud.openPanel('shop'); return; }
  if (a === 'close' && app.screen !== 'play') { hud.closePanel(); return; }
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
  if (app.screen !== 'play') { if (k === 'escape' && hud.panel) hud.closePanel(); return; }
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
  if (app.screen === 'play' && evs.some((e) => e.t === 'ui' || e.t === 'ko' || e.t === 'win')) store.set('bag', Sim.bagOf(G)); // keep your items
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
  // spawn a passive creature beside Pip and frame it (bestiary checks); returns its entity id
  showcase(sprite) {
    const G = app.G; for (const e of [...G.ents.values()]) if (e.showcase) { e.dead = true; G.ents.delete(e.id); }
    let x = G.player.x + 170, y = G.player.y; const r = bodyRadius(sprite);
    while (G.solids.some((o) => Math.hypot(x - o.x, y - o.y) < o.r + r) && x < G.W - 100) x += 20; // clear spot, so collision never nudges it
    const e = G._mk({ faction: 'wild', sprite, name: sprite, x, y, trust: 0, speed: 0, home: { x, y }, showcase: true, facing: 1 });
    world.focusId = e.id; world.setCam('showcase'); return e.id;
  },
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
  world = new World(canvas, quality); world.halloween = HALLOWEEN;
  world.onContextLost = () => {
    const order = ['high', 'medium', 'low']; const i = order.indexOf(quality.name); if (i < 2) store.set('gfx', order[i + 1]);
    setTimeout(() => { if (world.contextLost) { const d = document.createElement('div'); d.className = 'graphics-reset'; d.textContent = 'Graphics reset — tap to reload'; d.onclick = () => location.reload(); $('#app').appendChild(d); } }, 2500);
  };
  world.onContextRestored = () => { const d = $('.graphics-reset'); if (d) d.remove(); };
  icons = bakeIcons(world.renderer);
  hud = new Hud(icons, act); hud.shopInfo = shopInfo;
  // title scene doubles as the shader warm-up: build level 1, show every FX pool once, compile, draw a real frame
  app.G = newGame(1, 1); world.setLevel(app.G); world.setCam('title');
  for (const p of [...world.parts.slice(0, 3), ...world.hearts.slice(0, 1), ...world.slashes.slice(0, 1), ...world.projMeshes.slice(0, 1)]) p.m ? (p.m.visible = true) : (p.visible = true);
  world.sync(app.G, 0); world.renderer.compile(world.scene, world.camera); world.render();
  for (const p of [...world.parts, ...world.hearts, ...world.slashes]) p.m.visible = false; for (const m of world.projMeshes) m.visible = false;
  world.render();
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
boot().catch((e) => { console.error(e); const d = $('#loading'); if (d) d.querySelector('.lt').textContent = 'Could not start: ' + e.message; });
export { app, PX, THREE };
