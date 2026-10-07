// Character + creature models, code-built from the kit. Forward = +X, up = +Y, right-hand side = +Z.
// Each builder returns a Kit; rigs share part names so one animator drives them all:
//   biped: body, head, armL, armR, legL, legR, weapon (child of armR), shield (child of armL)
//   blob:  body          bird: body, wingL, wingR, legL, legR          bug: body, head, legL, legR
import { Kit, G, PAT, THREE } from './kit.js';
import { CATALOG2 } from './models2.js';
import { CATALOG3 } from './models3.js';

const SKIN = 0xffdcbc, INK = 0x2a1a26, WHITE = 0xffffff;

export function eyes(k, part, x, y, z, r = 0.045, { glow = false, color = INK, hi = true } = {}) {
  k.add(part, G.sphere(r, 12, 10), { c: color, p: [x, y, -z], s: [0.6, 1.25, 1], glow });
  k.add(part, G.sphere(r, 12, 10), { c: color, p: [x, y, z], s: [0.6, 1.25, 1], glow });
  if (hi) {
    k.add(part, G.sphere(r * 0.34, 8, 6), { c: WHITE, p: [x + r * 0.5, y + r * 0.45, -z + r * 0.2], glow: true });
    k.add(part, G.sphere(r * 0.34, 8, 6), { c: WHITE, p: [x + r * 0.5, y + r * 0.45, z + r * 0.2], glow: true });
  }
}
export function redEyes(k, part, x, y, z, r) {
  for (const s of [-1, 1]) {
    k.add(part, G.sphere(r, 14, 10), { c: 0xff2b3d, p: [x, y, s * z], s: [0.55, 1, 1], glow: true });
    k.add(part, G.sphere(r * 0.38, 8, 6), { c: 0xffd6d6, p: [x + r * 0.35, y + r * 0.3, s * z - r * 0.15], glow: true });
  }
}
// jagged grin: a dark lens with little white fangs
export function grin(k, part, x, y, w, { color = 0x1b0d14, teeth = 4 } = {}) {
  k.add(part, G.sphere(1, 16, 8), { c: color, p: [x, y, 0], s: [0.05, w * 0.28, w] });
  for (let i = 0; i < teeth; i++) {
    const z = -w * 0.7 + (i / (teeth - 1)) * w * 1.4;
    k.add(part, G.cone(w * 0.12, w * 0.3, 6), { c: WHITE, p: [x + 0.02, y + w * 0.12, z], r: [180, 0, 0] });
  }
}

// ------------------------------------------------------------------ HERO (Pip)
export function hero() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.5, -0.1]).part('legR', 'root', [0, 0.5, 0.1])
   .part('body', 'root', [0, 0.5, 0])
   .part('head', 'body', [0, 0.98, 0])
   .part('armL', 'body', [0, 0.92, -0.22]).part('armR', 'body', [0, 0.92, 0.22])
   .part('weapon', 'armR', [0.04, 0.64, 0.27]).part('shield', 'armL', [0.04, 0.64, -0.27]).part('armor', 'body', [0, 0.5, 0]);
  const PURP = 0x9b7cf0, PURP_D = 0x4a2f78, PINK = 0xff5d8f, PINK_D = 0xe23d72;
  for (const [p, z] of [['legL', -0.1], ['legR', 0.1]]) {
    k.add(p, G.capsule(0.075, 0.26), { c: 0x5b3b8f, p: [0, 0.3, z] });
    k.add(p, G.rbox(0.24, 0.13, 0.15, 0.055), { c: PINK_D, p: [0.04, 0.07, z] });
    k.add(p, G.sphere(0.05, 8, 6), { c: 0xffc2d4, p: [0.12, 0.1, z], s: [0.6, 0.5, 1] });
  }
  // tunic (bell), hem, belt + buckle
  k.add('body', G.lathe([[0, 0.46], [0.19, 0.48], [0.235, 0.58], [0.225, 0.72], [0.19, 0.88], [0.12, 0.97], [0, 1.0]], 28), { c: PURP });
  k.add('body', G.cyl(0.238, 0.25, 0.07, 28), { c: PURP_D, p: [0, 0.5, 0] });
  k.add('body', G.cyl(0.228, 0.232, 0.065, 28), { c: 0xffc93c, p: [0, 0.66, 0] });
  k.add('body', G.rbox(0.05, 0.085, 0.09, 0.015), { c: 0xfff3d6, p: [0.225, 0.66, 0] });
  // scarf: wrap + trailing tail
  k.add('body', G.torus(0.13, 0.055, 10, 24), { c: PINK, p: [0, 0.97, 0], r: [90, 0, 0] });
  k.add('body', G.capsule(0.045, 0.2), { c: PINK_D, p: [-0.15, 0.88, -0.08], r: [20, 0, -25] });
  // head
  k.add('head', G.sphere(0.29, 28, 20), { c: SKIN, p: [0, 1.25, 0] });
  k.add('head', G.sphere(0.06, 10, 8), { c: 0xffcfa8, p: [-0.02, 1.23, -0.285], s: [0.7, 1, 0.5] });
  k.add('head', G.sphere(0.06, 10, 8), { c: 0xffcfa8, p: [-0.02, 1.23, 0.285], s: [0.7, 1, 0.5] });
  // hair: cap + fringe spikes + back tuft
  k.add('head', G.sphere(0.305, 26, 18), { c: 0xff6f9f, p: [-0.05, 1.33, 0], s: [1, 0.78, 1.03] });
  for (const [z, rz, ry] of [[-0.13, 205, 25], [0, 200, 0], [0.13, 205, -25]]) k.add('head', G.cone(0.09, 0.2, 10), { c: 0xe8457d, p: [0.2, 1.42, z], r: [0, ry, rz] });
  k.add('head', G.sphere(0.14, 12, 10), { c: 0xe8457d, p: [-0.27, 1.3, 0], s: [0.8, 1, 1.2] });
  eyes(k, 'head', 0.262, 1.25, 0.095, 0.045);
  for (const s of [-1, 1]) {
    k.add('head', G.capsule(0.013, 0.06, 3, 6), { c: 0xc98a5e, p: [0.27, 1.335, s * 0.095], r: [90, 0, s * 8] });
    k.add('head', G.sphere(0.05, 10, 8), { c: 0xff9fb5, p: [0.24, 1.18, s * 0.16], s: [0.4, 0.55, 1] });
  }
  k.add('head', G.torus(0.035, 0.011, 6, 12, Math.PI), { c: 0xb06a4a, p: [0.283, 1.175, 0], r: [0, 90, 180] });
  // arms + hands
  for (const [p, z] of [['armL', -0.25], ['armR', 0.25]]) {
    k.add(p, G.capsule(0.062, 0.2), { c: 0xb795ff, p: [0, 0.8, z] });
    k.add(p, G.sphere(0.07, 12, 10), { c: SKIN, p: [0.02, 0.65, z] });
  }
  return k;
}

// Held weapon for the hero, attached to 'weapon' part pivot (hand). Points forward-up.
export function heroWeapon(id) {
  const k = new Kit();
  const at = (y) => [0, y, 0];
  if (id === 'cane_sword') {
    k.add('root', G.tube([[0, 0.08, 0], [0, 0.55, 0], [0, 0.74, 0.0]], 0.035, 20, 10), { pat: PAT.caneDense });
    k.add('root', G.tube([[0, 0.72, 0], [0.04, 0.8, 0], [0.12, 0.8, 0], [0.14, 0.72, 0]], 0.035, 14, 10), { pat: PAT.caneDense });
    k.add('root', G.rbox(0.07, 0.03, 0.2, 0.012), { c: 0xffc93c, p: at(0.06) });
    k.add('root', G.cyl(0.025, 0.025, 0.12, 10), { c: 0x6b4427, p: at(-0.02) });
  } else if (id === 'jawbreaker_mace') {
    k.add('root', G.cyl(0.028, 0.03, 0.5, 10), { c: 0x7a4a24, p: at(0.18) });
    k.add('root', G.sphere(0.15, 20, 16), { c: 0xff5d8f, p: at(0.52) });
    k.add('root', G.sphere(0.155, 20, 16), { pat: PAT.swirlRainbow, uv: 'x', p: at(0.52), s: [0.6, 1, 1] });
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; k.add('root', G.cone(0.035, 0.09, 8), { c: 0xe23d72, p: [Math.cos(a) * 0.16, 0.52 + Math.sin(a) * 0.16, 0], r: [0, 0, (a * 180) / Math.PI - 90] }); }
  } else if (id === 'licorice_whip') {
    k.add('root', G.cyl(0.03, 0.03, 0.18, 10), { c: 0x2a1640, p: at(0.02) });
    k.add('root', G.tube([[0, 0.1, 0], [0.05, 0.3, 0.02], [0.18, 0.42, -0.02], [0.3, 0.38, 0.02], [0.36, 0.25, 0], [0.3, 0.14, 0]], 0.022, 40, 8), { c: 0xd61f7a, pat: PAT.licorice });
  } else { // wafer sword (unarmed default)
    k.add('root', G.rbox(0.05, 0.46, 0.13, 0.02), { c: 0xf2d29a, p: at(0.33), pat: PAT.white });
    for (let i = 0; i < 4; i++) k.add('root', G.rbox(0.055, 0.012, 0.135, 0.004), { c: 0xc9a066, p: at(0.17 + i * 0.1) });
    k.add('root', G.rbox(0.07, 0.035, 0.22, 0.015), { c: 0xff5d8f, p: at(0.09) });
    k.add('root', G.cyl(0.026, 0.026, 0.13, 10), { c: 0x8a5a36, p: at(0.0) });
  }
  return k;
}
// Halloween: a witch hat for Pip (attached to the head part)
export function witchHat() {
  const k = new Kit();
  k.add('root', G.cyl(0.42, 0.42, 0.03, 28), { c: 0x2a1a3a, p: [-0.04, 1.47, 0] });
  k.add('root', G.cone(0.24, 0.62, 20), { c: 0x3a2050, p: [-0.06, 1.78, 0], r: [0, 0, 14] });
  k.add('root', G.cyl(0.245, 0.25, 0.08, 20), { c: 0xff8a2a, p: [-0.04, 1.52, 0] });
  k.add('root', G.rbox(0.04, 0.08, 0.1, 0.01), { c: 0xffc93c, p: [0.2, 1.52, 0] });
  return k;
}
export function heroArmor(id) {
  const k = new Kit();
  if (id === 'sugar_vest') {
    k.add('root', G.lathe([[0.2, 0.62], [0.245, 0.7], [0.235, 0.84], [0.19, 0.93], [0.14, 0.96]], 28), { c: 0x6fd3bc });
    k.add('root', G.sphere(0.1, 12, 10), { c: 0x46b9a1, p: [0, 0.9, -0.2], s: [1, 0.6, 0.8] });
    k.add('root', G.sphere(0.1, 12, 10), { c: 0x46b9a1, p: [0, 0.9, 0.2], s: [1, 0.6, 0.8] });
  } else if (id === 'peppermint_plate') {
    k.add('root', G.cyl(0.2, 0.2, 0.05, 32), { pat: PAT.mint, uv: 'y', p: [0.2, 0.8, 0], r: [0, 0, 90] });
    k.add('root', G.torus(0.2, 0.02, 8, 32), { c: 0xe7ebf0, p: [0.222, 0.8, 0], r: [0, 90, 0] });
  } else if (id === 'gummy_armor') {
    k.add('root', G.lathe([[0.2, 0.6], [0.25, 0.7], [0.24, 0.85], [0.2, 0.94], [0.12, 0.97]], 28), { c: 0xff7fa6 });
    k.add('root', G.sphere(0.12, 12, 10), { c: 0xe23d72, p: [0, 0.92, -0.21], s: [1, 0.6, 0.8] });
    k.add('root', G.sphere(0.12, 12, 10), { c: 0xe23d72, p: [0, 0.92, 0.21], s: [1, 0.6, 0.8] });
  }
  return k;
}

// ------------------------------------------------------------------ HICHEW SOLDIERS (+ captain / king variants)
export function soldier({ weapon = 'sword', boss = false, king = false, rock = false, mint = false } = {}) {
  const k = new Kit();
  const taffy = mint ? 0xffa8b6 : boss || king ? 0xff7fa9 : 0xffa066;
  const armor = king ? 0xf0b429 : mint ? 0xfff0f2 : rock ? 0x8ea4c8 : boss ? 0x7a4fb0 : 0x8a5a36;
  const armorD = king ? 0xa8760c : mint ? 0xe04355 : rock ? 0x54688f : boss ? 0x3a2150 : 0x5e3a1e;
  k.part('legL', 'root', [0, 0.95, -0.2]).part('legR', 'root', [0, 0.95, 0.2])
   .part('body', 'root', [0, 0.95, 0]).part('head', 'body', [0, 1.75, 0])
   .part('armL', 'body', [0, 1.6, -0.46]).part('armR', 'body', [0, 1.6, 0.46])
   .part('weapon', 'armR', [0.1, 1.1, 0.52]).part('shield', 'armL', [0.14, 1.2, -0.56]);
  if (king) k.add('body', G.lathe([[0.3, 0.3], [0.52, 0.34], [0.5, 1.0], [0.42, 1.62], [0.3, 1.66]], 28), { c: 0xc42a5e, p: [-0.12, 0, 0], s: [0.9, 1, 1.1] });
  for (const [p, z] of [['legL', -0.2], ['legR', 0.2]]) {
    k.add(p, G.capsule(0.12, 0.38), { c: taffy, p: [0, 0.72, z] });
    k.add(p, G.cyl(0.14, 0.14, 0.3, 16), { pat: rock ? PAT.caneWide : PAT.cane, c: rock ? 0xbfd0f0 : WHITE, p: [0, 0.32, z] });
    k.add(p, G.rbox(0.4, 0.16, 0.26, 0.07), { c: 0x4a3320, p: [0.06, 0.08, z] });
  }
  // torso armour
  k.add('body', G.rbox(0.8, 0.82, 0.86, 0.26), { c: armor, p: [0, 1.32, 0] });
  k.add('body', G.cyl(0.43, 0.44, 0.12, 24), { c: armorD, p: [0, 0.98, 0] });
  k.add('body', G.sphere(0.09, 14, 10), { c: 0xff5d8f, p: [0.4, 1.4, 0] });
  k.add('body', G.sphere(0.05, 10, 8), { c: 0xffd6e2, p: [0.47, 1.43, 0.02], glow: true });
  for (const s of [-1, 1]) k.add('body', G.sphere(0.24, 18, 12), { c: armor, p: [0, 1.66, s * 0.42], s: [1, 0.72, 1] });
  // head: taffy face under a helmet with a dark visor + glowing red slit eyes
  k.add('head', G.sphere(0.33, 22, 16), { c: taffy, p: [0, 1.98, 0] });
  k.add('head', G.sphere(0.36, 22, 16), { c: armor, p: [-0.02, 2.06, 0], s: [1, 0.88, 1] });
  k.add('head', G.rbox(0.12, 0.13, 0.5, 0.05), { c: 0x1c0f16, p: [0.28, 1.97, 0] });
  for (const s of [-1, 1]) k.add('head', G.capsule(0.03, 0.07, 3, 6), { c: 0xff2b3d, p: [0.35, 1.975, s * 0.1], r: [90, 0, 0], glow: true });
  k.add('head', G.rbox(0.44, 0.07, 0.62, 0.03), { c: armorD, p: [0.02, 2.06, 0] });
  if (boss || king) {
    const crown = new Kit();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      k.add('head', G.cone(0.07, king ? 0.26 : 0.2, 8), { c: 0xffc93c, p: [Math.cos(a) * 0.23, 2.42, Math.sin(a) * 0.23] });
    }
    k.add('head', G.cyl(0.26, 0.27, 0.12, 24), { c: 0xf0a82a, p: [0, 2.34, 0] });
    if (king) k.add('head', G.sphere(0.06, 10, 8), { c: 0xff3b4e, p: [0.25, 2.36, 0], glow: true });
    void crown;
  }
  // arms
  for (const [p, z] of [['armL', -0.52], ['armR', 0.52]]) {
    k.add(p, G.capsule(0.11, 0.34), { c: taffy, p: [0.02, 1.36, z] });
    k.add(p, G.sphere(0.12, 12, 10), { c: taffy, p: [0.06, 1.12, z] });
  }
  // weapons (hand pivot on armR), shield on armL
  const W = (g, o) => k.add('weapon', g, o);
  const steel = mint ? 0xff8a99 : rock ? 0xb9a8ff : 0xe3e8ef;
  if (weapon === 'sword') {
    W(G.rbox(0.07, 1.0, 0.16, 0.03), { c: steel, p: [0.1, 1.72, 0.52], pat: mint ? PAT.cane : PAT.white });
    W(G.cone(0.08, 0.2, 4), { c: steel, p: [0.1, 2.31, 0.52], r: [0, 45, 0], s: [0.45, 1, 1] });
    W(G.rbox(0.12, 0.08, 0.46, 0.03), { c: rock ? 0x9fb6e0 : 0xffc93c, p: [0.1, 1.2, 0.52] });
    W(G.cyl(0.04, 0.04, 0.24, 10), { c: 0x6b4427, p: [0.1, 1.06, 0.52] });
    k.add('shield', G.cyl(0.36, 0.36, 0.08, 36), { pat: PAT.mint, uv: 'y', p: [0.16, 1.22, -0.64], r: [90, 0, 0] });
    k.add('shield', G.torus(0.36, 0.035, 8, 36), { c: 0xe7ebf0, p: [0.16, 1.22, -0.69] });
  } else if (weapon === 'spear') {
    W(G.cyl(0.05, 0.05, 2.6, 12), { pat: PAT.caneDense, p: [0.1, 1.5, 0.52] });
    W(G.cone(0.13, 0.36, 4), { c: steel, p: [0.1, 2.98, 0.52], s: [0.45, 1, 1] });
  } else if (weapon === 'bow') { // limbs bulge toward the target (+X); string on the archer's side
    const z = 0.52, y = 1.2;
    W(G.tube([[0.1, y - 0.62, z], [0.26, y - 0.3, z], [0.32, y, z], [0.26, y + 0.3, z], [0.1, y + 0.62, z]], 0.035, 30, 8), { c: 0x7a4a24 });
    W(G.cyl(0.05, 0.05, 0.16, 10), { c: 0xffc93c, p: [0.32, y, z] });
    W(G.limb([0.1, y - 0.62, z], [-0.02, y, z], 0.007, 4), { c: 0xffffff });
    W(G.limb([-0.02, y, z], [0.1, y + 0.62, z], 0.007, 4), { c: 0xffffff });
    W(G.limb([-0.02, y, z], [0.62, y, z], 0.014, 6), { c: 0xd9b2a0 });
    W(G.cone(0.05, 0.13, 4), { c: steel, p: [0.68, y, z], r: [0, 0, -90] });
    for (const s of [-1, 1]) W(G.cone(0.035, 0.1, 3), { c: 0xff5d8f, p: [0.02, y + s * 0.03, z], r: [0, 0, -90] });
  } else if (weapon === 'crossbow') { // stock along +X, prod (limbs) at the front bulging forward, bolt loaded
    const z = 0.52, y = 1.18;
    W(G.rbox(0.82, 0.12, 0.14, 0.04), { c: 0x6b4427, p: [0.33, y, z] });
    W(G.tube([[0.62, y + 0.04, z - 0.44], [0.74, y + 0.04, z - 0.2], [0.78, y + 0.04, z], [0.74, y + 0.04, z + 0.2], [0.62, y + 0.04, z + 0.44]], 0.035, 30, 8), { c: 0x4a3320 });
    W(G.limb([0.62, y + 0.05, z - 0.44], [0.32, y + 0.07, z], 0.007, 4), { c: 0xffffff });
    W(G.limb([0.32, y + 0.07, z], [0.62, y + 0.05, z + 0.44], 0.007, 4), { c: 0xffffff });
    W(G.limb([0.32, y + 0.09, z], [0.9, y + 0.09, z], 0.016, 6), { c: 0xd9b2a0 });
    W(G.cone(0.045, 0.12, 4), { c: steel, p: [0.95, y + 0.09, z], r: [0, 0, -90] });
  }
  return k;
}

// ------------------------------------------------------------------ BLOB MONSTERS (sour gloop, licorice lump, …)
export function blob({ body = 0x7bd16a, dark = 0x2f7a26, size = 1, sheen = 0xd6ff8f, spikes = 0, spikeColor = 0xcdeede, spikeTip = null } = {}) {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]);
  const s = size;
  k.add('body', G.lathe([[0, 0], [0.5, 0.02], [0.6, 0.2], [0.58, 0.48], [0.46, 0.76], [0.26, 0.92], [0, 0.96]].map(([x, y]) => [x * s, y * s]), 32), { c: body });
  k.add('body', G.sphere(0.2 * s, 14, 10), { c: sheen, p: [0.18 * s, 0.72 * s, -0.16 * s], s: [0.6, 0.35, 0.6] });
  for (const [x, z, h] of [[0.28, -0.42, 0.24], [-0.3, 0.38, 0.2], [0.36, 0.34, 0.18], [-0.1, -0.52, 0.17]]) k.add('body', G.sphere(0.12 * s, 10, 8), { c: dark, p: [x * s, 0.07 * s, z * s], s: [1, h / 0.12, 1] });
  redEyes(k, 'body', 0.49 * s, 0.56 * s, 0.17 * s, 0.1 * s);
  grin(k, 'body', 0.56 * s, 0.3 * s, 0.2 * s);
  for (let i = 0; i < spikes; i++) {
    const a = -0.2 + (i / Math.max(1, spikes - 1)) * (Math.PI + 0.4), rr = 0.5 * s;
    k.add('body', G.cone(0.12 * s, 0.4 * s, 6), { c: spikeColor, p: [Math.cos(a) * rr * 0.7 - 0.08 * s, (0.62 + Math.sin(a) * 0.32) * s, (i % 2 ? 1 : -1) * 0.18 * s], r: [0, 0, (a * 180) / Math.PI - 90] });
  }
  void spikeTip;
  return k;
}

// ------------------------------------------------------------------ FLOSS FINCH (cotton candy bird — healer pet)
export function flossFinch() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.7, -0.12]).part('legR', 'root', [0, 0.7, 0.12]).part('body', 'root', [0, 0.7, 0])
   .part('head', 'body', [0.3, 1.25, 0]).part('wingL', 'body', [0, 1.15, -0.42]).part('wingR', 'body', [0, 1.15, 0.42]);
  for (const [p, z] of [['legL', -0.12], ['legR', 0.12]]) {
    k.add(p, G.cyl(0.022, 0.022, 0.62, 6), { c: 0xf59324, p: [0, 0.38, z] });
    for (const a of [-35, 0, 35]) k.add(p, G.capsule(0.018, 0.1, 2, 4), { c: 0xf59324, p: [0.05, 0.05, z], r: [a, 0, 90] });
  }
  // puff cluster body — cotton candy: overlapping pastel puffs
  const puffs = [[0, 1.05, 0, 0.5, 0xffb3cf], [-0.3, 1.0, 0.16, 0.34, 0xffd9e8], [-0.28, 1.05, -0.2, 0.33, 0xd9c8ff], [0.14, 0.85, 0.22, 0.3, 0xff8fbf],
    [0.12, 0.84, -0.24, 0.29, 0xffc6dc], [-0.45, 1.18, 0, 0.26, 0xc7b3ff], [0.05, 1.32, 0.05, 0.3, 0xffe3ee], [-0.12, 0.8, 0, 0.32, 0xff9fc6]];
  for (const [x, y, z, r, c] of puffs) k.add('body', G.sphere(r, 18, 14), { c, p: [x, y, z] });
  // tail puff
  k.add('body', G.sphere(0.22, 14, 12), { c: 0xb79bf0, p: [-0.62, 1.22, 0] });
  // head
  k.add('head', G.sphere(0.34, 20, 16), { c: 0xffc2da, p: [0.42, 1.5, 0] });
  k.add('head', G.sphere(0.17, 14, 12), { c: 0xd4c0ff, p: [0.3, 1.8, 0.04] });
  k.add('head', G.sphere(0.13, 12, 10), { c: 0xffffff, p: [0.44, 1.84, -0.06] });
  k.add('head', G.cone(0.1, 0.24, 12), { c: 0xffa53c, p: [0.8, 1.46, 0], r: [0, 0, -90], s: [1, 1, 0.8] });
  eyes(k, 'head', 0.7, 1.58, 0.13, 0.05);
  for (const [p, s] of [['wingL', -1], ['wingR', 1]]) {
    k.add(p, G.sphere(0.24, 14, 12), { c: 0xffd9e8, p: [-0.08, 1.12, s * 0.46], s: [1.2, 0.8, 0.5] });
    k.add(p, G.sphere(0.18, 12, 10), { c: 0xe6d8ff, p: [-0.3, 1.08, s * 0.5], s: [1.1, 0.8, 0.5] });
  }
  return k;
}

// ------------------------------------------------------------------ SWIRLBUG (lollipop beetle — speed pet)
export function swirlbug() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.36, -0.2]).part('legR', 'root', [0, 0.36, 0.2]).part('body', 'root', [0, 0.36, 0]).part('head', 'body', [0.4, 0.62, 0]);
  for (const [p, s] of [['legL', -1], ['legR', 1]]) for (const x of [-0.3, 0, 0.3]) {
    const knee = [x + x * 0.4, 0.46, s * 0.62], foot = [x + x * 0.7, 0.03, s * 0.74];
    k.add(p, G.limb([x * 0.8, 0.5, s * 0.25], knee, 0.04), { c: 0x3d2613 });
    k.add(p, G.limb(knee, foot, 0.035), { c: 0x3d2613 });
    k.add(p, G.sphere(0.045, 8, 6), { c: 0x2a190c, p: foot });
  }
  k.add('body', G.sphere(0.5, 24, 18), { c: 0x6b4427, p: [-0.05, 0.58, 0], s: [1.15, 0.72, 0.9] });
  // candy shell: two swirl elytra
  for (const s of [-1, 1]) k.add('body', G.sphere(0.46, 24, 16, ), { pat: PAT.swirlPink, uv: 'y', p: [-0.08, 0.72, s * 0.2], s: [1.05, 0.58, 0.55], r: [s * -12, 0, 0] });
  k.add('body', G.sphere(0.07, 10, 8), { c: 0xe23d72, p: [-0.05, 1.0, 0] });
  k.add('head', G.sphere(0.25, 18, 14), { c: 0x5a3820, p: [0.52, 0.66, 0], s: [0.9, 0.9, 1] });
  eyes(k, 'head', 0.72, 0.72, 0.1, 0.05, { color: WHITE, hi: false });
  for (const s of [-1, 1]) {
    k.add('head', G.sphere(0.025, 8, 6), { c: INK, p: [0.745, 0.72, s * 0.1] });
    k.add('head', G.cyl(0.012, 0.012, 0.36, 6), { c: 0x3d2613, p: [0.62, 0.98, s * 0.12], r: [s * -18, 0, -28] });
    k.add('head', G.sphere(0.06, 10, 8), { c: s < 0 ? 0xa98cff : 0xff5d8f, p: [0.72, 1.15, s * 0.18] });
  }
  return k;
}

// ------------------------------------------------------------------ generic fallback (unbuilt sprites)
export function fallback(hue = 0.9) {
  const c = new THREE.Color().setHSL(hue, 0.6, 0.6).getHex();
  return blob({ body: c, dark: new THREE.Color().setHSL(hue, 0.6, 0.35).getHex(), sheen: 0xffffff });
}

// sprite id -> {build, rig, height(m), radius(m) for shadows/picking}
export const CATALOG = {
  hero: { build: hero, rig: 'biped', h: 1.6, r: 0.42 },
  floss_finch: { build: flossFinch, rig: 'bird', h: 2.0, r: 0.62 },
  swirlbug: { build: swirlbug, rig: 'bug', h: 1.2, r: 0.6 },
  blob_sour: { build: () => blob({ body: 0x86d95f, dark: 0x3d8a2f, sheen: 0xeaffb0 }), rig: 'blob', h: 1.05, r: 0.62 },
  blob_licorice: { build: () => blob({ body: 0x3a2150, dark: 0x1c0f2a, sheen: 0x8a6bb0, size: 1.12 }), rig: 'blob', h: 1.15, r: 0.68 },
  sword: { build: () => soldier({ weapon: 'sword' }), rig: 'biped', h: 2.4, r: 0.6 },
  spear: { build: () => soldier({ weapon: 'spear' }), rig: 'biped', h: 2.4, r: 0.6 },
  bow: { build: () => soldier({ weapon: 'bow' }), rig: 'biped', h: 2.4, r: 0.6 },
  crossbow: { build: () => soldier({ weapon: 'crossbow' }), rig: 'biped', h: 2.4, r: 0.6 },
  boss: { build: () => soldier({ weapon: 'sword', boss: true }), rig: 'biped', h: 2.6, r: 0.62, scale: 1.45 },
  hichew_king: { build: () => soldier({ weapon: 'sword', king: true }), rig: 'biped', h: 2.6, r: 0.62, scale: 1.3 },
  rock_sword: { build: () => soldier({ weapon: 'sword', rock: true }), rig: 'biped', h: 2.4, r: 0.6 },
  pepp_sword: { build: () => soldier({ weapon: 'sword', mint: true }), rig: 'biped', h: 2.4, r: 0.6 },
};
export function catalog(sprite) {
  if (CATALOG[sprite]) return CATALOG[sprite];
  if (CATALOG2[sprite]) return CATALOG2[sprite];
  if (CATALOG3[sprite]) return CATALOG3[sprite];
  let h = 0; for (const ch of sprite || '?') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { build: () => fallback((h % 360) / 360), rig: 'blob', h: 1.1, r: 0.6, fallback: true };
}
