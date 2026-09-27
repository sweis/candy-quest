// Candy Quest simulation — a rule-for-rule port of the classic build's Game() sim (../index.html),
// pulled out of React so it can run headless, deterministically (seeded RNG, fixed 1-frame steps),
// and be driven by tests. Units match the classic build: positions in world px, dt in 60 Hz frames,
// cooldowns/buffs in seconds, i-frames and dash in frames.
//
// The renderer and HUD never mutate this state directly; they call the action functions below and
// drain G.events (toasts, damage numbers, slashes, hearts…) once per rendered frame.
import { ALLIES, MONSTERS, ITEMS, RECIPES, LEVELS } from './data.js';
import { makeRng } from './rng.js';

export const SPD = 2.6;
export const REVIVE_T = 13; // seconds for a fainted ally to recover on its own
export const PLAYER_START = { x: 200, y: 760 };
export const CAMP = { x: 240, y: 760 };

const D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export function createGame(level = 1, { seed = 1, savedPets = [], autoHit = false, onSavePets = null, solids = [], radiusOf = null } = {}) {
  const CFG = LEVELS[level] || LEVELS[1];
  const W = CFG.allPets ? 3000 : 2200, H = CFG.allPets ? 2000 : 1500;
  const rng = makeRng(seed);
  const rnd = (a, b) => a + rng() * (b - a);
  let nid = 1;
  const ents = new Map();
  const mk = (o) => { const e = { id: 'e' + nid++, vx: 0, vy: 0, cd: 0, facing: 1, ...o }; ents.set(e.id, e); return e; };

  const player = mk({ faction: 'player', sprite: 'hero', name: 'Pip', x: PLAYER_START.x, y: PLAYER_START.y, maxhp: 120, hp: 120, speed: 1.18, baseatk: 10, basedef: 2 });
  const far = (x, y, d) => Math.hypot(x - player.x, y - player.y) > d;
  const spot = (minFromStart, xMin = 160) => { let x, y, t = 0; do { x = rnd(xMin, W - 200); y = rnd(120, H - 120); t++; } while (!far(x, y, minFromStart) && t < 60); return { x, y }; };

  // enemies — randomized each play, never within the safe radius of the player's start
  CFG.enemyPool.forEach((k) => {
    const m = MONSTERS[k]; const { x, y } = spot(520, 420);
    mk({ faction: 'enemy', mkey: k, sprite: m.sprite, name: m.name, x, y, maxhp: m.hp, hp: m.hp, atk: m.atk, def: m.def, speed: m.speed, range: m.range,
      akind: m.kind, xp: m.xp, proj: m.proj, spike: m.spike, cd: 0.4 + rng() * 0.9, home: { x, y } });
  });
  // boss guards the gate (far side)
  const bk = MONSTERS[CFG.boss]; const by = rnd(560, 900);
  mk({ faction: 'enemy', mkey: CFG.boss, sprite: bk.sprite, name: bk.name, x: 1860, y: by, maxhp: bk.hp, hp: bk.hp, atk: bk.atk, def: bk.def, speed: bk.speed,
    range: bk.range, akind: bk.kind, xp: bk.xp, spike: bk.spike, boss: true, scale: 1, home: { x: 1860, y: by } });
  // wild tameable — kept near the start so you can build a party early (skip species you already own)
  const pets = (Array.isArray(savedPets) ? savedPets : []).filter((s) => s && ALLIES[s.key]).slice(0, 11);
  const owned = new Set(pets.map((s) => s.key));
  CFG.wild.filter((k) => !owned.has(k)).forEach((k, i) => {
    const a = ALLIES[k]; const sp = i < 2 ? { x: rnd(300, 560), y: rnd(560, 980) } : spot(140, 360);
    mk({ faction: 'wild', wkey: k, sprite: a.sprite, name: a.name, x: sp.x, y: sp.y, trust: 0, speed: a.speed * 0.5, home: { x: sp.x, y: sp.y } });
  });
  // early levels (two pets) start you with free bait; later levels make you forage it out in the world
  const BAIT = CFG.bait || 'cotton_candy', freeBait = CFG.wild.length >= 2;
  const drop = (id, x, y, qty = 1) => mk({ faction: 'item', item: id, qty, sprite: null, x, y });
  CFG.forage.forEach((id) => { const sp = id === BAIT && !freeBait ? spot(720, 420) : spot(30, 160); drop(id, sp.x, sp.y, 1); });
  // guaranteed early supplies right by the start
  if (freeBait) drop(BAIT, rnd(290, 460), rnd(680, 860));
  drop('mushroom', rnd(290, 460), rnd(660, 880));
  const gate = mk({ faction: 'gate', x: 2080, y: 720 });
  // restore your pets from previous plays — first 3 take the field
  const party = pets.map((s, i) => {
    const a = ALLIES[s.key];
    return { uid: 'p' + nid++, key: s.key, name: a.name, sprite: a.sprite, level: s.level || 1, xp: s.xp || 0,
      maxhp: s.maxhp || a.hp, hp: s.maxhp || a.hp, active: CFG.allPets ? true : i < 3, fainted: false };
  });
  party.filter((p) => p.active).forEach((mem, i) => {
    const a = ALLIES[mem.key];
    mk({ faction: 'ally', puid: mem.uid, sprite: mem.sprite, name: mem.name, x: player.x - 40 - i * 26, y: player.y + 30 + (i % 2) * 22,
      maxhp: mem.maxhp, hp: mem.hp, atk: a.atk + (mem.level - 1) * 2, def: a.def, speed: a.speed, range: a.range, akind: a.kind });
  });

  const G = {
    level, CFG, W, H, BAIT, rng, seed, ents, player, gate, projs: [], nextProj: 1,
    inv: { ...(freeBait ? { [BAIT]: 3 } : {}), mushroom: 1 }, equip: { weapon: null, armor: null },
    party, crystals: 0, bossDead: false, won: false, dashCd: 0, iframe: 0, buffs: [],
    input: { up: false, down: false, left: false, right: false }, autoHit: !!autoHit,
    tick: 0, time: 0, events: [], onSavePets, _nid: () => nid++, _mk: mk,
    stats: { kills: 0, damageDealt: 0, damageTaken: 0, knockouts: 0, tamed: 0, collected: 0 },
    solids, radiusOf,
  };
  // nothing starts inside a rock: push every spawned creature and pickup out of solids
  G.ents.forEach((e) => { if (e.faction !== 'gate') pushOutOfSolids(G, e, e.faction === 'item' ? 16 : radius(G, e)); if (e.home) { e.home.x = e.x; e.home.y = e.y; } });
  return G;
}

// ---------------------------------------------------------------- collision (3D port addition; the classic had none)
// Creatures are circles. Same-side bodies push apart (Pip + pets, enemies, wild animals); opposite sides don't, so
// melee reach is unchanged. Everything is pushed out of solid scenery; blocked movers sidestep for a moment.
const GROUP = { player: 0, ally: 0, enemy: 1, wild: 2 };
function radius(G, e) { if (e._rad == null) e._rad = G.radiusOf ? G.radiusOf(e.sprite, e) : e.faction === 'player' ? 16 : 20; return e._rad; }
function pushOutOfSolids(G, e, r) { // iterate: a body wedged between two solids needs a few rounds to settle
  for (let it = 0; it < 4; it++) {
    let moved = false;
    for (const o of G.solids) {
      const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy), min = o.r + r;
      if (d < min - 0.01) { moved = true; if (d < 0.01) { e.x = o.x + min; continue; } e.x = o.x + (dx / d) * min; e.y = o.y + (dy / d) * min; }
    }
    if (!moved) return;
  }
}
function mv(e, ux, uy, dist) {
  if (e.detourT > 0) { const a = e.detourSign * 1.1, c = Math.cos(a), s = Math.sin(a); const nx = ux * c - uy * s; uy = ux * s + uy * c; ux = nx; }
  e.x += ux * dist; e.y += uy * dist; e._want = (e._want || 0) + dist;
}
function resolveCollisions(G, dt) {
  const mob = [];
  G.ents.forEach((e) => { if (!e.dead && GROUP[e.faction] != null) mob.push(e); });
  const mass = (e) => (e.faction === 'player' ? 4 : e.boss ? 6 : 1);
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < mob.length; i++) {
      const a = mob[i], ra = radius(G, a), ga = GROUP[a.faction];
      for (let j = i + 1; j < mob.length; j++) {
        const b = mob[j]; if (GROUP[b.faction] !== ga) continue;
        const min = ra + radius(G, b); let dx = b.x - a.x, dy = b.y - a.y;
        if (Math.abs(dx) >= min || Math.abs(dy) >= min) continue;
        let d = Math.hypot(dx, dy); if (d >= min) continue;
        if (d < 0.01) { dx = j % 2 ? 1 : -1; dy = 0.5; d = Math.hypot(dx, dy); }
        const push = min - d, ma = mass(a), mb = mass(b), ka = mb / (ma + mb), kb = ma / (ma + mb);
        a.x -= (dx / d) * push * ka; a.y -= (dy / d) * push * ka; b.x += (dx / d) * push * kb; b.y += (dy / d) * push * kb;
      }
    }
    for (const e of mob) { e.x = clamp(e.x, 40, G.W - 40); e.y = clamp(e.y, 60, G.H - 30); pushOutOfSolids(G, e, radius(G, e)); }
  }
  // blocked movers (moved < 35% of what they wanted for a while) sidestep around the obstacle for ~0.75 s
  for (const e of mob) {
    if (e.detourT > 0) e.detourT -= dt;
    const want = e._want || 0; e._want = 0;
    if (want < 0.3 * dt || e._px == null) continue;
    const moved = Math.hypot(e.x - e._px, e.y - e._py);
    if (moved < want * 0.35) e.stuckN = (e.stuckN || 0) + 1; else e.stuckN = Math.max(0, (e.stuckN || 0) - 1);
    if (e.stuckN > 8) { e.stuckN = 0; e.detourT = 45; e.detourSign = e.detourSign === 1 ? -1 : 1; }
  }
}

// ---------------------------------------------------------------- helpers
const emit = (G, ev) => { G.events.push(ev); };
const toast = (G, msg) => emit(G, { t: 'toast', msg });

export function eff(G, e) { // effective atk/def with equip+buffs for the player
  if (e.faction === 'player') {
    let atk = e.baseatk, def = e.basedef;
    if (G.equip.weapon) atk += ITEMS[G.equip.weapon].atk;
    if (G.equip.armor) def += ITEMS[G.equip.armor].def;
    G.buffs.forEach((b) => { if (b.effect === 'atk') atk += b.val; if (b.effect === 'def') def += b.val; });
    return { atk, def };
  }
  return { atk: e.atk, def: e.def };
}
const rollDmg = (G, a, d) => Math.max(2, a * (1 - d / (d + 42))) * (0.85 + G.rng() * 0.3);

function dealDmg(G, att, tgt) {
  applyDamage(G, tgt, rollDmg(G, eff(G, att).atk, eff(G, tgt).def), att);
}
function applyDamage(G, t, dmg, src) {
  if (t.dead) return;
  if (t.faction === 'player' && G.iframe > 0) return;
  t.hp -= dmg;
  emit(G, { t: 'hit', id: t.id, x: t.x, y: t.y, n: dmg, faction: t.faction, boss: !!t.boss, src: src && src.id });
  if (t.faction === 'enemy') G.stats.damageDealt += dmg;
  if (t.faction === 'player') { G.stats.damageTaken += dmg; G.iframe = Math.max(G.iframe, 24); }
  if (t.hp <= 0) onDeath(G, t);
}
function savePets(G) {
  if (G.onSavePets) G.onSavePets(G.party.map((p) => ({ key: p.key, level: p.level, xp: p.xp, maxhp: p.maxhp })));
}
function grantXP(G, amt) {
  G.party.filter((p) => p.active && !p.fainted).forEach((p) => {
    p.xp += amt; let up = false;
    while (p.xp >= p.level * 40) { p.xp -= p.level * 40; p.level++; p.maxhp += 12; p.hp = p.maxhp; up = true; toast(G, `✨ ${p.name} reached Lv ${p.level}!`); emit(G, { t: 'levelup', uid: p.uid }); }
    if (up) {
      const e = [...G.ents.values()].find((x) => x.faction === 'ally' && x.puid === p.uid);
      if (e) { e.maxhp = p.maxhp; e.hp = p.hp; e.atk = ALLIES[p.key].atk + (p.level - 1) * 2; }
    }
  });
  savePets(G); emit(G, { t: 'ui' });
}
function dropLoot(G, e) {
  const here = (id, qty = 1) => { const ix = (G.rng() - 0.5) * 60, iy = (G.rng() - 0.5) * 40; const it = G._mk({ faction: 'item', item: id, qty, sprite: null, x: e.x + ix, y: e.y + iy, spawnedAt: G.time }); pushOutOfSolids(G, it, 16); };
  const k = e.mkey, r = G.rng();
  if (e.boss) { here('jawbreaker_mace'); here('peppermint_plate'); here('crystal', 3); here('alien_goo', 2); here('star_sprinkle', 2); here('rainbow_brittle'); }
  else if ((k && k.includes('gloop')) || (k && k.includes('lump'))) { here('alien_goo'); here('sour_dust'); if (r < 0.4) here('glowberry'); if (r < 0.3) here('gummy_worm'); if (r < 0.16) here('sugar_vest'); if (r < 0.1) here('star_sprinkle'); }
  else { here('crystal', 1 + Math.floor(G.rng() * 2)); if (r < 0.3) here('sugar_vest'); if (r < 0.12) here('cane_sword'); if (r < 0.5) here('honey'); if (r > 0.7) here('mushroom'); if (r < 0.08) here('peppermint_plate'); if (r < 0.06) here('licorice_whip'); }
}
function remove(G, e) { e.dead = true; G.ents.delete(e.id); }
function onDeath(G, e) {
  if (e.faction === 'enemy') {
    emit(G, { t: 'death', id: e.id, x: e.x, y: e.y, sprite: e.sprite, boss: !!e.boss });
    remove(G, e); G.stats.kills++;
    grantXP(G, e.xp); dropLoot(G, e);
    if (e.boss) { G.bossDead = true; toast(G, `💥 The ${G.CFG.bossName} falls! Reach the Candy Gate →`); emit(G, { t: 'bossdown' }); }
    else toast(G, `Defeated ${e.name}`);
  } else if (e.faction === 'ally') {
    const p = G.party.find((x) => x.uid === e.puid); if (p) { p.fainted = true; p.active = false; p.hp = 0; p.reviveT = REVIVE_T; }
    emit(G, { t: 'faint', id: e.id, x: e.x, y: e.y });
    toast(G, `${e.name} fainted!`); remove(G, e); emit(G, { t: 'ui' });
  } else if (e.faction === 'player') {
    e.hp = e.maxhp; e.x = CAMP.x; e.y = CAMP.y; G.iframe = 90; G.crystals = Math.max(0, G.crystals - 3);
    e.moveT = null; e.focus = null; e.focusWild = null; G.stats.knockouts++;
    emit(G, { t: 'ko' }); toast(G, '💫 Knocked out! Recovered at camp.');
  }
}
function spawnProj(G, from, to, faction, color) {
  const dx = to.x - from.x, dy = to.y - from.y, L = Math.hypot(dx, dy) || 1;
  const dmg = rollDmg(G, eff(G, from).atk, eff(G, to).def);
  G.projs.push({ id: G.nextProj++, x: from.x, y: from.y - 44, vx: (dx / L) * 6.4, vy: (dy / L) * 6.4, faction, dmg, life: 120, color, src: from.sprite });
  emit(G, { t: 'shoot', id: from.id });
}
function spawnAlly(G, mem) {
  const a = ALLIES[mem.key], p = G.player;
  G._mk({ faction: 'ally', puid: mem.uid, sprite: mem.sprite, name: mem.name, x: p.x - 40, y: p.y + 30, maxhp: mem.maxhp, hp: mem.hp,
    atk: a.atk + (mem.level - 1) * 2, def: a.def, speed: a.speed, range: a.range, akind: a.kind });
}
function collect(G, e) {
  if (e.item === 'crystal') G.crystals += e.qty; else G.inv[e.item] = (G.inv[e.item] || 0) + e.qty;
  G.stats.collected++;
  emit(G, { t: 'collect', id: e.id, item: e.item, x: e.x, y: e.y });
  toast(G, `+${e.qty} ${ITEMS[e.item].name}`); remove(G, e); emit(G, { t: 'ui' });
}

// ---------------------------------------------------------------- actions (called by input / HUD)
export function doAttack(G) {
  const p = G.player; if (p.cd > 0) return false; p.cd = 0.42;
  emit(G, { t: 'slash', x: p.x, y: p.y, dir: p.facing });
  G.ents.forEach((t) => {
    if (t.faction === 'enemy') { const dx = t.x - p.x; if ((D(p, t) < 104 && Math.sign(dx) === p.facing) || D(p, t) < 70) dealDmg(G, p, t); }
  });
  return true;
}
export function doTame(G) {
  const p = G.player; let best = null, bd = 120; const BAIT = G.BAIT;
  G.ents.forEach((w) => { if (w.faction === 'wild') { const d = D(p, w); if (d < bd) { bd = d; best = w; } } });
  if (!best) { toast(G, 'No wild animal nearby to tame.'); return; }
  if (G.party.some((m) => m.key === best.wkey)) { toast(G, `You already have a ${best.name} — 1 of each pet!`); return; }
  if (G.party.length >= 11) { toast(G, 'Pet limit reached — 11 pets max!'); return; }
  if ((G.inv[BAIT] || 0) <= 0) { toast(G, `Need a ${ITEMS[BAIT].name} to tame — search the map for some!`); return; }
  G.inv[BAIT]--; best.trust = Math.min(100, best.trust + 34);
  emit(G, { t: 'heart', id: best.id, x: best.x, y: best.y, trust: best.trust });
  if (best.trust >= 100) tameComplete(G, best);
  else toast(G, `${best.name}'s trust ${best.trust}%…`);
  emit(G, { t: 'ui' });
}
function tameComplete(G, w) {
  const a = ALLIES[w.wkey]; const active = G.party.filter((p) => p.active).length;
  const mem = { uid: 'p' + G._nid(), key: w.wkey, name: a.name, sprite: a.sprite, level: 1, xp: 0, maxhp: a.hp, hp: a.hp, active: active < 3, fainted: false };
  G.party.push(mem); G.stats.tamed++;
  savePets(G);
  emit(G, { t: 'tamed', id: w.id, x: w.x, y: w.y, key: w.wkey });
  remove(G, w);
  if (mem.active) spawnAlly(G, mem);
  toast(G, `🎉 Tamed ${a.name}! Joined your party.`); emit(G, { t: 'ui' });
}
export function toggleMember(G, uid) {
  const m = G.party.find((p) => p.uid === uid); if (!m || m.fainted) return;
  if (m.active) {
    m.active = false; const e = [...G.ents.values()].find((x) => x.faction === 'ally' && x.puid === uid);
    if (e) remove(G, e);
  } else {
    if (!G.CFG.allPets && G.party.filter((p) => p.active).length >= 3) { toast(G, '3 allies max in the field.'); return; }
    m.active = true; m.hp = Math.max(m.hp, Math.round(m.maxhp * 0.5)); spawnAlly(G, m);
  }
  emit(G, { t: 'ui' });
}
export function revive(G, uid) {
  const m = G.party.find((p) => p.uid === uid); if (!m || !m.fainted) return;
  if ((G.inv.mallow_mend || 0) > 0) G.inv.mallow_mend--;
  else if (G.crystals >= 5) G.crystals -= 5;
  else { toast(G, 'Need a Mallow Mend 🍡 or 5 crystals to revive.'); return; }
  m.fainted = false; m.hp = Math.round(m.maxhp * 0.65); m.reviveT = 0; toast(G, `💗 ${m.name} revived!`); emit(G, { t: 'ui' });
}
export function equip(G, slot, id) {
  G.equip[slot] = G.equip[slot] === id ? null : id; toast(G, G.equip[slot] ? `Equipped ${ITEMS[id].name}` : 'Unequipped'); emit(G, { t: 'ui' });
}
export function useFood(G, id) {
  const it = ITEMS[id]; if ((G.inv[id] || 0) <= 0) return; G.inv[id]--;
  if (it.effect === 'heal') { G.player.hp = Math.min(G.player.maxhp, G.player.hp + it.val); toast(G, `+${it.val} HP`); emit(G, { t: 'healfx', id: G.player.id }); }
  else { G.buffs = G.buffs.filter((b) => b.effect !== it.effect); G.buffs.push({ effect: it.effect, val: it.val, t: it.dur }); toast(G, `✨ ${it.name} active!`); emit(G, { t: 'buff', effect: it.effect }); }
  emit(G, { t: 'ui' });
}
export const have = (G, k) => (k === 'crystal' ? G.crystals : G.inv[k] || 0);
export const canCraft = (G, i) => Object.entries(RECIPES[i].in).every(([k, n]) => have(G, k) >= n);
export function craft(G, i) {
  const r = RECIPES[i]; if (!canCraft(G, i)) return;
  Object.entries(r.in).forEach(([k, n]) => { if (k === 'crystal') G.crystals -= n; else G.inv[k] -= n; });
  G.inv[r.out] = (G.inv[r.out] || 0) + 1; toast(G, `🍳 Cooked ${ITEMS[r.out].name}!`); emit(G, { t: 'ui' });
}
export function dash(G) {
  if (G.dashCd > 0) return false;
  G.dashCd = 0.9; G.iframe = Math.max(G.iframe, 16); G.player.dash = 10; emit(G, { t: 'dash' }); return true;
}
// A direction key was pressed: cancel any click-to-move / auto-chase.
export function cancelOrders(G) { const p = G.player; p.moveT = null; p.focus = null; p.focusWild = null; }
// Click/tap on the world at (wx,wy) world px. Enemies win ties with wild animals, as in the classic build.
export function aimAt(G, wx, wy, picked = null) {
  const p = G.player;
  let foe = null, fd = 80, wild = null, wd = 80;
  if (picked === 'ground') { p.moveT = { x: wx, y: wy }; p.focus = null; p.focusWild = null; return { kind: 'ground' }; }
  if (picked && G.ents.get(picked)) {
    const t = G.ents.get(picked);
    if (t.faction === 'enemy') { foe = t; fd = 0; } else if (t.faction === 'wild') { wild = t; wd = 0; }
  }
  if (!foe && !wild) {
    G.ents.forEach((t) => {
      if (t.faction === 'enemy') { const d = Math.hypot(t.x - wx, t.y - wy); if (d < fd) { fd = d; foe = t; } }
      if (t.faction === 'wild') { const d = Math.hypot(t.x - wx, t.y - wy); if (d < wd) { wd = d; wild = t; } }
    });
  }
  if (foe && (!wild || fd <= wd)) { p.moveT = { x: foe.x, y: foe.y }; p.focus = foe.id; p.focusWild = null; return { kind: 'enemy', id: foe.id }; }
  if (wild) { p.moveT = { x: wild.x, y: wild.y }; p.focusWild = wild.id; p.focus = null; return { kind: 'wild', id: wild.id }; }
  p.moveT = { x: wx, y: wy }; p.focus = null; p.focusWild = null; return { kind: 'ground' };
}

// ---------------------------------------------------------------- the step (dt in 60 Hz frames)
export function step(G, dt = 1) {
  if (G.won) return;
  if (!(dt >= 0)) dt = 0;
  G.tick++; G.time += dt / 60;
  const p = G.player, S = SPD * dt, I = G.input;
  G.dashCd -= dt / 60; G.iframe -= dt; p.cd -= dt / 60;
  G.buffs.forEach((b) => { if (b.t != null) b.t -= dt / 60; }); G.buffs = G.buffs.filter((b) => b.t == null || b.t > 0);
  const allies = []; G.ents.forEach((x) => { x._px = x.x; x._py = x.y; if (x.faction === 'ally') allies.push(x); });
  // keep party HP in sync with the fielded ally
  allies.forEach((e) => { const m = G.party.find((pm) => pm.uid === e.puid); if (m) m.hp = e.hp; });
  // fainted allies recover over time
  let revivedAny = false;
  G.party.forEach((m) => {
    if (m.fainted) {
      m.reviveT = (m.reviveT == null ? REVIVE_T : m.reviveT) - dt / 60;
      m.hp = Math.max(0, Math.round(m.maxhp * 0.55 * (1 - Math.max(0, m.reviveT) / REVIVE_T)));
      if (m.reviveT <= 0) { m.fainted = false; m.hp = Math.round(m.maxhp * 0.55); m.reviveT = 0; toast(G, `💗 ${m.name} recovered — ready to send in!`); revivedAny = true; }
    }
  });
  if (revivedAny) emit(G, { t: 'ui' });
  // player movement
  let mx = 0, my = 0;
  if (I.up) my -= 1; if (I.down) my += 1; if (I.left) mx -= 1; if (I.right) mx += 1;
  if (mx || my) { p.moveT = null; p.focus = null; p.focusWild = null; }
  else {
    if (p.focus) {
      const f = G.ents.get(p.focus); if (!f) p.focus = null;
      else if (D(p, f) > 84) p.moveT = { x: f.x, y: f.y };
      else { p.moveT = null; p.facing = f.x > p.x ? 1 : -1; doAttack(G); }
    }
    if (p.focusWild) {
      const w = G.ents.get(p.focusWild); if (!w) p.focusWild = null;
      else if (D(p, w) > 100) p.moveT = { x: w.x, y: w.y };
      else { p.moveT = null; p.focusWild = null; doTame(G); }
    }
    if (p.moveT) { const dx = p.moveT.x - p.x, dy = p.moveT.y - p.y, L = Math.hypot(dx, dy); if (L < 8) p.moveT = null; else { mx = dx / L; my = dy / L; } }
  }
  const L = Math.hypot(mx, my) || 1; let sp = p.speed * S;
  G.buffs.forEach((b) => { if (b.effect === 'speed') sp *= 1.5; });
  if (p.dash > 0) { sp *= 2.4; p.dash -= dt; }
  if (mx || my) {
    if (p.moveT && !(I.up || I.down || I.left || I.right)) mv(p, mx / L, my / L, sp); // click-to-move may sidestep a rock
    else { p.x += (mx / L) * sp; p.y += (my / L) * sp; } // keys: slide along obstacles, never auto-steer
  }
  p.x = clamp(p.x, 40, G.W - 40); p.y = clamp(p.y, 60, G.H - 30);
  if (mx) p.facing = mx > 0 ? 1 : -1;
  // auto-hit
  if (G.autoHit && p.cd <= 0) {
    let foe = null, fd = 96; G.ents.forEach((t) => { if (t.faction === 'enemy') { const d = D(p, t); if (d < fd) { fd = d; foe = t; } } });
    if (foe) { if (!mx && !my) p.facing = foe.x > p.x ? 1 : -1; if (fd < 70 || Math.sign(foe.x - p.x) === p.facing) doAttack(G); }
  }
  // entities AI
  G.ents.forEach((e) => {
    if (e.dead) return;
    if (e.cd > 0) e.cd -= dt / 60;
    if (e.faction === 'ally') {
      let foe = null, fdv = 440; G.ents.forEach((t) => { if (t.faction === 'enemy') { const d = D(e, t); if (d < fdv) { fdv = d; foe = t; } } });
      if (e.akind === 'heal') { // healer: heal lowest friendly
        let low = null, lr = 1;
        [p, ...allies].forEach((f) => { if (!f.dead && f.hp / f.maxhp < lr && D(e, f) < 300) { lr = f.hp / f.maxhp; low = f; } });
        if (low && lr < 0.95 && e.cd <= 0) { e.cd = 1.8; low.hp = Math.min(low.maxhp, low.hp + 10); emit(G, { t: 'heal', id: low.id, from: e.id, x: low.x, y: low.y, n: 10 }); }
        const tx = p.x - 50, ty = p.y - 40, dx = tx - e.x, dy = ty - e.y, dl = Math.hypot(dx, dy); // hover near player
        if (dl > 10) { mv(e, dx / dl, dy / dl, e.speed * S); }
      } else if (foe) {
        const d = D(e, foe); e.facing = foe.x > e.x ? 1 : -1;
        if (d > e.range * 0.9) { const dx = foe.x - e.x, dy = foe.y - e.y, dl = Math.hypot(dx, dy); mv(e, dx / dl, dy / dl, e.speed * S); }
        else if (e.cd <= 0) { e.cd = e.akind === 'ranged' ? 1.4 : 0.8; emit(G, { t: 'swing', id: e.id }); if (e.akind === 'ranged') spawnProj(G, e, foe, 'ally', '#a98cff'); else dealDmg(G, e, foe); }
      } else { // follow player formation
        const idx = allies.indexOf(e);
        const tx = p.x - 62 - Math.floor(idx / 2) * 56, ty = p.y + 22 + (idx % 2) * 48, dx = tx - e.x, dy = ty - e.y, dl = Math.hypot(dx, dy); // 3D: two rows, bodies need room
        if (dl > 14) { mv(e, dx / dl, dy / dl, e.speed * S); e.facing = dx > 0 ? 1 : -1; }
      }
    } else if (e.faction === 'enemy') {
      let tgt = null, td = 380;
      [p, ...allies].forEach((c) => { if (c.dead) return; const d = D(e, c); if (d < td) { td = d; tgt = c; } });
      if (e.boss && !tgt) { const d = D(e, p); if (d < 700) { tgt = p; td = d; } }
      // spike contact: stepping on a spiked enemy hurts you
      if (e.spike) {
        e.cd2 = (e.cd2 || 0) - dt / 60;
        const dp = D(e, p); if (dp < 46 && G.iframe <= 0 && e.cd2 <= 0) { e.cd2 = 0.9; applyDamage(G, p, Math.max(4, e.atk * 0.7), e); }
      }
      if (e.dead) return;
      if (tgt) {
        e.facing = tgt.x > e.x ? 1 : -1; const d = td;
        if (d > e.range * 0.85) { const dx = tgt.x - e.x, dy = tgt.y - e.y, dl = Math.hypot(dx, dy); mv(e, dx / dl, dy / dl, e.speed * S); }
        else if (e.cd <= 0) {
          e.cd = e.akind === 'ranged' ? 1.6 : 1.2; emit(G, { t: 'swing', id: e.id });
          if (e.akind === 'ranged') { const pc = e.proj || (e.sprite === 'corn_box' ? '#ff9124' : '#ff5d6c'); spawnProj(G, e, tgt, 'enemy', pc); }
          else dealDmg(G, e, tgt);
        }
      } else { // wander near home
        const dx = e.home.x - e.x, dy = e.home.y - e.y, dl = Math.hypot(dx, dy); if (dl > 20) { mv(e, dx / dl, dy / dl, e.speed * S * 0.5); }
      }
    } else if (e.faction === 'wild') {
      const dx = e.home.x - e.x, dy = e.home.y - e.y, dl = Math.hypot(dx, dy);
      if (dl > 26) { mv(e, dx / dl, dy / dl, e.speed * S * 0.4); e.facing = dx > 0 ? 1 : -1; }
    } else if (e.faction === 'item') { if (D(p, e) < 48) collect(G, e); }
  });
  resolveCollisions(G, dt);
  G.ents.forEach((e) => { if (!e.dead && e._px != null && e.faction !== 'item') { e.vx = (e.x - e._px) / (dt || 1); e.vy = (e.y - e._py) / (dt || 1); } });
  // projectiles (fly at chest height, 44 px above the ground anchor)
  for (let i = G.projs.length - 1; i >= 0; i--) {
    const pr = G.projs[i]; pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt;
    let hitE = null;
    G.ents.forEach((t) => {
      if ((pr.faction === 'enemy' && (t.faction === 'player' || t.faction === 'ally')) || (pr.faction === 'ally' && t.faction === 'enemy')) {
        if (!hitE && Math.hypot(t.x - pr.x, t.y - 44 - pr.y) < 30) hitE = t;
      }
    });
    if (hitE) { applyDamage(G, hitE, pr.dmg, null); emit(G, { t: 'projhit', x: pr.x, y: pr.y, color: pr.color }); G.projs.splice(i, 1); continue; }
    if (pr.life <= 0) G.projs.splice(i, 1);
  }
  // win
  if (G.bossDead && !G.won && D(p, G.gate) < 96) { G.won = true; emit(G, { t: 'win' }); }
}

// ---------------------------------------------------------------- read-only views
export function objective(G) { return G.bossDead ? 'Reach the Candy Gate →' : 'Defeat the ' + G.CFG.bossName; }
export function counts(G) {
  const c = { enemy: 0, ally: 0, wild: 0, item: 0, boss: 0 };
  G.ents.forEach((e) => { if (c[e.faction] != null) c[e.faction]++; if (e.boss) c.boss++; });
  c.projectiles = G.projs.length; return c;
}
export function snapshot(G) {
  const r = (v) => Math.round(v * 10) / 10;
  const ef = eff(G, G.player);
  return {
    level: G.level, seed: G.seed, tick: G.tick, simTime: r(G.time), won: G.won, bossDead: G.bossDead, objective: objective(G),
    player: { x: r(G.player.x), y: r(G.player.y), vx: r(G.player.vx || 0), vy: r(G.player.vy || 0), hp: r(G.player.hp), maxhp: G.player.maxhp,
      atk: ef.atk, def: ef.def, facing: G.player.facing, cd: r(Math.max(0, G.player.cd)), iframe: r(Math.max(0, G.iframe)), dashCd: r(Math.max(0, G.dashCd)),
      focus: G.player.focus || null, focusWild: G.player.focusWild || null, moveT: G.player.moveT ? { x: r(G.player.moveT.x), y: r(G.player.moveT.y) } : null },
    crystals: G.crystals, inv: { ...G.inv }, equip: { ...G.equip }, buffs: G.buffs.map((b) => ({ ...b, t: r(b.t) })), autoHit: G.autoHit,
    party: G.party.map((p) => ({ uid: p.uid, key: p.key, level: p.level, xp: p.xp, hp: r(p.hp), maxhp: p.maxhp, active: p.active, fainted: p.fainted })),
    counts: counts(G), stats: { ...G.stats, damageDealt: r(G.stats.damageDealt), damageTaken: r(G.stats.damageTaken) },
    entities: [...G.ents.values()].filter((e) => e.faction !== 'gate').map((e) => ({ id: e.id, faction: e.faction, kind: e.mkey || e.wkey || e.item || e.sprite,
      x: r(e.x), y: r(e.y), vx: r(e.vx || 0), vy: r(e.vy || 0), hp: e.hp != null ? r(e.hp) : undefined, maxhp: e.maxhp, trust: e.trust, boss: e.boss || undefined })),
    projectiles: G.projs.map((p) => ({ x: r(p.x), y: r(p.y), faction: p.faction })),
    gate: { x: G.gate.x, y: G.gate.y, open: G.bossDead },
  };
}

// Dev/test only: route damage through the real damage path (i-frames, KO, death, loot all apply).
export function debugDamage(G, target, n) { applyDamage(G, target, n, null); }
