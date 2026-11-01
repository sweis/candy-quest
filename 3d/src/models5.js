// Candy Quest 3 — The Fruit Frenzy cast. Fruit shapes + creature templates, then bespoke bosses and pets.
// Conventions as models.js: forward = +X, up = +Y, right = +Z, metres.
import { Kit, G, PAT, THREE } from './kit.js';
import { eyes, redEyes, grin } from './models.js';

const LEAF = 0x5aa83a, STEM = 0x6a4a2a;
const rng = (seed) => { let a = seed; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; };
function brows(k, part, x, y, z, c = 0x3a1a0a) { for (const s of [-1, 1]) k.add(part, G.rbox(0.05, 0.05, 0.2, 0.02), { c, p: [x, y, s * z], r: [s * -18, 0, 0] }); }

// ------------------------------------------------------------------ fruit shapes (centre c, radius R)
export const FRUIT = {
  apple(k, part, c, R, col = 0xd92a2a) {
    k.add(part, G.sphere(R, 22, 16), { c: col, p: c, s: [1, 0.92, 1] });
    k.add(part, G.sphere(R * 0.28, 10, 8), { c: 0xfff0e0, p: [c[0] - R * 0.35, c[1] + R * 0.45, c[2] + R * 0.35], s: [1, 0.5, 1] });
    k.add(part, G.cyl(R * 0.05, R * 0.06, R * 0.35, 6), { c: STEM, p: [c[0], c[1] + R * 1.0, c[2]], r: [0, 0, 12] });
    k.add(part, G.sphere(R * 0.22, 8, 6), { c: LEAF, p: [c[0] + R * 0.18, c[1] + R * 1.05, c[2]], s: [1.6, 0.25, 0.8], r: [0, 0, -25] });
  },
  banana(k, part, c, R, col = 0xffd84a) {
    k.add(part, G.tube([[c[0] - R * 1.1, c[1] + R * 0.5, c[2]], [c[0] - R * 0.4, c[1] - R * 0.2, c[2]], [c[0] + R * 0.4, c[1] - R * 0.2, c[2]], [c[0] + R * 1.1, c[1] + R * 0.5, c[2]]], R * 0.42, 24, 10), { c: col });
    for (const sd of [-1, 1]) k.add(part, G.sphere(R * 0.18, 8, 6), { c: 0x5a3a1a, p: [c[0] + sd * R * 1.15, c[1] + R * 0.55, c[2]] });
  },
  grape(k, part, c, R, col = 0x7a3ad0) {
    const r = rng(7); let n = 0;
    for (let row = 0; row < 5; row++) { const cnt = 5 - row, y = c[1] + R * 0.6 - row * R * 0.38; for (let j = 0; j < cnt; j++) { const a = (j / cnt) * Math.PI * 2 + row; const d = cnt > 1 ? R * 0.12 * cnt : 0;
      k.add(part, G.sphere(R * 0.3, 10, 8), { c: n++ % 3 ? col : 0x9a5ae8, p: [c[0] + Math.cos(a) * d, y + (r() - 0.5) * R * 0.05, c[2] + Math.sin(a) * d] }); } }
    k.add(part, G.cyl(R * 0.04, R * 0.05, R * 0.4, 6), { c: STEM, p: [c[0], c[1] + R * 0.95, c[2]] });
    k.add(part, G.sphere(R * 0.3, 8, 6), { c: LEAF, p: [c[0] + R * 0.25, c[1] + R * 0.95, c[2]], s: [1.4, 0.2, 1] });
  },
  melon(k, part, c, R) {
    k.add(part, G.sphere(R, 24, 18), { c: 0x3f9a3a, pat: PAT.stripesV, p: c, s: [1.1, 0.95, 1] });
    k.add(part, G.sphere(R * 0.25, 10, 8), { c: 0xe8ffd8, p: [c[0] - R * 0.35, c[1] + R * 0.5, c[2] + R * 0.35], s: [1, 0.5, 1] });
  },
  berry(k, part, c, R, col = 0xe8203a) {
    k.add(part, G.lathe([[0, -R * 1.0], [R * 0.45, -R * 0.75], [R * 0.85, -R * 0.1], [R * 0.9, R * 0.35], [R * 0.6, R * 0.7], [0, R * 0.75]].map(([a, b]) => [a, b]), 22), { c: col, p: c });
    const r = rng(11); for (let i = 0; i < 16; i++) { const a = i * 2.4, y = -0.7 + (i / 16) * 1.3, rr = 0.85 * Math.sqrt(Math.max(0.05, 1 - Math.abs(y) * 0.6)); k.add(part, G.sphere(R * 0.05, 6, 4), { c: 0xffe06a, p: [c[0] + Math.cos(a) * rr * R, c[1] + y * R * 0.8, c[2] + Math.sin(a) * rr * R], s: [1, 1.5, 1] }); void r; }
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; k.add(part, G.sphere(R * 0.26, 8, 6), { c: LEAF, p: [c[0] + Math.cos(a) * R * 0.35, c[1] + R * 0.78, c[2] + Math.sin(a) * R * 0.35], s: [1.6, 0.25, 0.7], r: [0, (-a * 180) / Math.PI, -10] }); }
  },
  lemon(k, part, c, R, col = 0xffe14a) {
    k.add(part, G.sphere(R, 22, 16), { c: col, p: c, s: [1, 0.85, 0.85] });
    for (const sd of [-1, 1]) k.add(part, G.cone(R * 0.22, R * 0.3, 10), { c: col, p: [c[0] + sd * R * 1.05, c[1], c[2]], r: [0, 0, sd * -90] });
    k.add(part, G.sphere(R * 0.25, 10, 8), { c: 0xfffbe0, p: [c[0] - R * 0.3, c[1] + R * 0.45, c[2] + R * 0.3], s: [1, 0.5, 1] });
  },
  cherry(k, part, c, R, col = 0xc8102a) {
    for (const sd of [-1, 1]) { k.add(part, G.sphere(R * 0.62, 18, 14), { c: col, p: [c[0], c[1], c[2] + sd * R * 0.5] }); k.add(part, G.tube([[c[0], c[1] + R * 0.55, c[2] + sd * R * 0.5], [c[0], c[1] + R * 1.2, c[2] + sd * R * 0.25], [c[0] - R * 0.1, c[1] + R * 1.6, c[2]]], R * 0.04, 10, 4), { c: 0x4a7a2a }); }
    k.add(part, G.sphere(R * 0.25, 8, 6), { c: LEAF, p: [c[0] + R * 0.15, c[1] + R * 1.62, c[2]], s: [1.6, 0.25, 0.8] });
  },
  pine(k, part, c, R) {
    k.add(part, G.sphere(R, 22, 18), { c: 0xe8a02a, pat: PAT.dots, p: c, s: [0.85, 1.15, 0.85] });
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; k.add(part, G.cone(R * 0.16, R * (0.6 + (i % 3) * 0.15), 6), { c: i % 2 ? 0x3d8a2a : 0x5aa83a, p: [c[0] + Math.cos(a) * R * 0.18, c[1] + R * 1.35, c[2] + Math.sin(a) * R * 0.18], dir: [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5] }); }
  },
  blue(k, part, c, R, col = 0x3a4ab8) {
    k.add(part, G.sphere(R, 22, 16), { c: col, p: c });
    k.add(part, G.extrude(G.star(R * 0.22, R * 0.1, 5), R * 0.04, 0), { c: 0x2a2a6a, p: [c[0], c[1] + R * 0.98, c[2]], r: [90, 0, 0] });
    k.add(part, G.sphere(R * 0.25, 10, 8), { c: 0xb8c8ff, p: [c[0] - R * 0.35, c[1] + R * 0.45, c[2] + R * 0.35], s: [1, 0.5, 1] });
  },
};
const crown = (k, part, c, r = 0.32, h = 0.3, col = 0xffc93c) => { for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; k.add(part, G.cone(r * 0.28, h, 8), { c: col, p: [c[0] + Math.cos(a) * r, c[1] + h * 0.5, c[2] + Math.sin(a) * r] }); } k.add(part, G.torus(r, r * 0.18, 8, 24), { c: 0xf0a82a, p: c, r: [90, 0, 0] }); };

// ------------------------------------------------------------------ templates
// a fruit-bodied soldier: legs, fruit torso with the face on it, arms, and a weapon
export function fruitKnight(fruit, col, { weapon = 'sword', limb = 0x5aa83a, R = 0.6, king = false } = {}) {
  const k = new Kit(); const top = 0.75 + R * 2;
  k.part('legL', 'root', [0, 0.75, -0.18]).part('legR', 'root', [0, 0.75, 0.18]).part('body', 'root', [0, 0.75, 0])
   .part('head', 'body', [0, top, 0]).part('armL', 'body', [0, 0.75 + R * 1.3, -R - 0.05]).part('armR', 'body', [0, 0.75 + R * 1.3, R + 0.05]).part('weapon', 'armR', [0.12, 0.75 + R * 0.5, R + 0.12]);
  for (const [p, z] of [['legL', -0.18], ['legR', 0.18]]) { k.add(p, G.capsule(0.08, 0.5, 4, 8), { c: limb, p: [0, 0.45, z] }); k.add(p, G.sphere(0.13, 10, 8), { c: 0x4a3320, p: [0.05, 0.08, z], s: [1.5, 0.6, 1] }); }
  FRUIT[fruit](k, 'body', [0, 0.75 + R, 0], R, col);
  redEyes(k, 'head', R * 0.86, 0.75 + R * 1.2, R * 0.28, 0.09); brows(k, 'head', R * 0.9, 0.75 + R * 1.42, R * 0.28); grin(k, 'head', R * 0.92, 0.75 + R * 0.72, R * 0.3, { color: 0x3a0a0a });
  if (king) crown(k, 'head', [0, top + 0.1, 0]);
  for (const [p, z] of [['armL', -1], ['armR', 1]]) k.add(p, G.limb([0, 0.75 + R * 1.3, z * (R + 0.05)], [0.12, 0.75 + R * 0.55, z * (R + 0.12)], 0.07), { c: limb });
  const y0 = 0.75 + R * 0.5, z = R + 0.12, W = (g, o) => k.add('weapon', g, o), steel = 0xe3e8ef;
  if (weapon === 'sword') { W(G.rbox(0.06, 0.95, 0.14, 0.03), { c: steel, p: [0.12, y0 + 0.6, z] }); W(G.rbox(0.1, 0.07, 0.4, 0.03), { c: 0xffc93c, p: [0.12, y0 + 0.1, z] }); }
  else if (weapon === 'spear') { const g = G.cyl(0.04, 0.04, 2.2, 8); g.translate(0, 1.1, 0); W(g, { c: 0x8a6a3a, p: [0.12, y0 - 0.6, z] }); W(G.cone(0.1, 0.3, 4), { c: steel, p: [0.12, y0 + 1.75, z], s: [0.45, 1, 1] }); }
  else if (weapon === 'bow') { W(G.tube([[0.1, y0 - 0.55, z], [0.3, y0, z], [0.1, y0 + 0.55, z]], 0.035, 20, 8), { c: 0x7a4a24 }); W(G.limb([0.1, y0 - 0.55, z], [0.1, y0 + 0.55, z], 0.006, 4), { c: 0xffffff }); W(G.limb([0.0, y0, z], [0.6, y0, z], 0.014, 6), { c: 0xd9b2a0 }); }
  else if (weapon === 'squirt') { W(G.cyl(0.1, 0.12, 0.5, 12), { c: 0xffe14a, p: [0.35, y0 + 0.1, z], r: [0, 0, -90] }); W(G.cone(0.06, 0.18, 10), { c: 0xfff6c8, p: [0.68, y0 + 0.1, z], r: [0, 0, -90] }); }
  else if (weapon === 'peel') { FRUIT.banana(k, 'weapon', [0.1, y0 + 0.2, z], 0.18); }
  return k;
}
export function fruitRoller(fruit, col, { king = false, R = 0.72 } = {}) {
  const k = new Kit(); k.part('body', 'root', [0, R, 0]).part('shell', 'body', [0, R, 0]).part('face', 'body', [0, R, 0]);
  FRUIT[fruit](k, 'shell', [0, R, 0], R, col);
  redEyes(k, 'face', R * 0.92, R + 0.15, 0.2, 0.1); brows(k, 'face', R * 0.96, R + 0.3, 0.2); grin(k, 'face', R * 0.96, R - 0.2, 0.26, { color: 0x3a0a0a, teeth: 5 });
  if (king) crown(k, 'face', [0, R * 1.9, 0]);
  return k;
}
export function fruitBouncer(fruit, col, { R = 0.55, king = false } = {}) {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]);
  for (const s of [-1, 1]) k.add('body', G.sphere(0.11, 10, 8), { c: 0x4a3320, p: [0.05, 0.08, s * 0.18], s: [1.5, 0.6, 1] });
  FRUIT[fruit](k, 'body', [0, R + 0.08, 0], R, col);
  redEyes(k, 'body', R * 0.9, R + 0.25, R * 0.3, R * 0.17); grin(k, 'body', R * 0.95, R - 0.05, R * 0.35, { color: 0x2a0a1a, teeth: 4 });
  if (king) crown(k, 'body', [0, R * 2.15, 0]);
  return k;
}
export function fruitLauncher(fruit, col, barrel = 0x5a8a3a) {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]);
  for (const [x, z] of [[0.3, -0.32], [0.3, 0.32], [-0.4, 0]]) k.add('body', G.limb([x * 0.5, 0.7, z * 0.5], [x, 0.05, z], 0.07), { c: 0x4a3320 });
  FRUIT[fruit](k, 'body', [0, 1.0, 0], 0.55, col);
  k.add('body', G.cyl(0.16, 0.22, 0.6, 14), { c: barrel, p: [0.7, 0.95, 0], r: [0, 0, -90] });
  k.add('body', G.cyl(0.12, 0.12, 0.02, 12), { c: 0x101010, p: [1.01, 0.95, 0], r: [0, 0, -90] });
  redEyes(k, 'body', 0.48, 1.18, 0.18, 0.08); brows(k, 'body', 0.5, 1.3, 0.18);
  return k;
}
// small 4-legged pet body with a fruit back and a head; extras(k) adds species bits
function fruitPet(fruit, col, { headCol = 0xffe0c0, R = 0.4, hip = 0.32, extras = null, limb = 0x8a5a36 } = {}) {
  const k = new Kit();
  k.part('body', 'root', [0, hip, 0]).part('head', 'body', [R + 0.15, hip + R, 0]).part('tail', 'body', [-R - 0.1, hip + R * 0.6, 0]);
  for (const [n, x, s] of [['legFL', R * 0.7, -1], ['legFR', R * 0.7, 1], ['legBL', -R * 0.7, -1], ['legBR', -R * 0.7, 1]]) { const z = s * R * 0.55; k.part(n, 'root', [x, hip, z]); k.add(n, G.limb([x, hip + 0.05, z], [x + 0.03, 0.05, z], 0.06), { c: limb }); k.add(n, G.sphere(0.07, 8, 6), { c: limb, p: [x + 0.05, 0.04, z], s: [1.4, 0.6, 1] }); }
  FRUIT[fruit](k, 'body', [0, hip + R * 0.9, 0], R, col);
  k.add('head', G.sphere(R * 0.62, 16, 12), { c: headCol, p: [R + 0.2, hip + R * 1.2, 0] });
  eyes(k, 'head', R + 0.2 + R * 0.5, hip + R * 1.32, R * 0.25, 0.045);
  k.add('head', G.torus(R * 0.15, 0.015, 6, 12, Math.PI), { c: 0x3a2a1a, p: [R + 0.2 + R * 0.6, hip + R * 1.06, 0], r: [0, 90, 180] });
  if (extras) extras(k, R, hip);
  return k;
}

// ------------------------------------------------------------------ bespoke bosses
function appleGolem() { const k = fruitKnight('apple', 0x7ac23a, { R: 0.85, king: true, weapon: 'sword', limb: 0x6a4a2a }); return k; }
function bananaconda() {
  const k = new Kit(); const segs = [[-1.6, 0.16], [-1.15, 0.2], [-0.68, 0.24], [-0.2, 0.26], [0.28, 0.26]];
  segs.forEach(([x], i) => k.part('seg' + i, 'root', [x, 0.25, 0])); k.part('head', 'root', [0.75, 0.4, 0]);
  segs.forEach(([x, r], i) => { k.add('seg' + i, G.capsule(r, 0.3, 6, 12), { c: i % 2 ? 0xffd84a : 0xffe46a, p: [x, r + 0.02, 0], r: [0, 0, 90] }); k.add('seg' + i, G.sphere(r * 0.25, 8, 6), { c: 0x8a6a2a, p: [x, r * 1.9, 0] }); });
  k.add('head', G.sphere(0.34, 18, 14), { c: 0xffd84a, p: [0.8, 0.42, 0], s: [1.4, 0.8, 1] });
  k.add('head', G.sphere(0.22, 12, 10), { c: 0x3a1a0a, p: [1.08, 0.32, 0], s: [0.8, 0.3, 0.8] });
  for (const s of [-1, 1]) k.add('head', G.cone(0.04, 0.14, 5), { c: 0xffffff, p: [1.16, 0.3, s * 0.08], r: [180, 0, 0] });
  redEyes(k, 'head', 1.0, 0.6, 0.16, 0.08); crown(k, 'head', [0.75, 0.75, 0], 0.22, 0.24);
  return k;
}
function vinelord() {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]).part('armL', 'body', [0.05, 2.4, -0.45]).part('armR', 'body', [0.05, 2.4, 0.45]).part('head', 'body', [0, 3.0, 0]);
  k.add('body', G.tube([[0, 0, 0], [0.1, 1.2, 0.05], [-0.08, 2.2, -0.05], [0, 2.9, 0]], 0.38, 24, 12), { c: 0x6a4a2a });
  for (let i = 0; i < 6; i++) k.add('body', G.torus(0.42, 0.06, 6, 18), { c: LEAF, p: [0, 0.4 + i * 0.42, 0], r: [90 + (i % 2) * 20, 0, 0] });
  FRUIT.grape(k, 'head', [0, 3.35, 0], 0.6); redEyes(k, 'head', 0.5, 3.4, 0.16, 0.09); crown(k, 'head', [0, 3.95, 0], 0.28, 0.26);
  for (const [p, s] of [['armL', -1], ['armR', 1]]) { k.add(p, G.tube([[0.05, 2.4, s * 0.45], [0.12, 1.8, s * 0.65], [0.15, 1.2, s * 0.7]], 0.1, 14, 8), { c: LEAF }); FRUIT.grape(k, p, [0.15, 1.0, s * 0.7], 0.3); }
  return k;
}
function melonCrab() {
  const k = new Kit(); k.part('body', 'root', [0, 0.8, 0]).part('legL', 'root', [0, 0.9, -0.5]).part('legR', 'root', [0, 0.9, 0.5]).part('head', 'body', [0.9, 1.0, 0]);
  FRUIT.melon(k, 'body', [0, 1.2, 0], 1.0);
  k.add('body', G.sphere(0.9, 20, 10), { c: 0xff5a6a, p: [0.05, 1.15, 0], s: [1.05, 0.12, 0.95] });                     // red flesh rim
  for (const [p, s] of [['legL', -1], ['legR', 1]]) for (const x of [0.4, 0, -0.4]) { const knee = [x * 1.3, 1.4, s * 1.4], foot = [x * 1.6, 0.02, s * 1.9]; k.add(p, G.limb([x, 0.9, s * 0.6], knee, 0.08), { c: 0x3f9a3a }); k.add(p, G.limb(knee, foot, 0.07), { c: 0x2f7a2a }); }
  for (const s of [-1, 1]) { k.add('head', G.limb([0.7, 1.0, s * 0.6], [1.4, 1.1, s * 0.9], 0.11), { c: 0x3f9a3a }); k.add('head', G.sphere(0.32, 14, 10), { c: 0xff5a6a, p: [1.55, 1.1, s * 0.95], s: [1.3, 0.7, 0.9] }); for (let i = 0; i < 3; i++) k.add('head', G.sphere(0.04, 6, 4), { c: 0x1a1a14, p: [1.6 + i * 0.08, 1.2, s * 0.95] }); }
  redEyes(k, 'head', 0.95, 1.55, 0.25, 0.11); grin(k, 'head', 1.0, 1.25, 0.3, { color: 0x3a0a0a, teeth: 6 });
  return k;
}
function sourSphinx() {
  const k = fruitPet('lemon', 0xffe14a, { R: 0.9, hip: 0.75, headCol: 0xffe14a, limb: 0xe8c040, extras: (k, R, hip) => {
    k.add('head', G.cone(0.75, 0.9, 4), { c: 0x3a5ad0, pat: PAT.stripesV, p: [R + 0.15, hip + R * 1.25, 0], r: [0, 45, 0] });   // pharaoh headdress
    k.add('head', G.sphere(0.5, 16, 12), { c: 0xffe14a, p: [R + 0.3, hip + R * 1.3, 0] });
    redEyes(k, 'head', R + 0.72, hip + R * 1.38, 0.17, 0.09); grin(k, 'head', R + 0.76, hip + R * 1.1, 0.2, { color: 0x6a4a00 }); crown(k, 'head', [R + 0.2, hip + R * 2.05, 0], 0.28, 0.26);
  } });
  return k;
}
function cherryTitan() {
  const k = fruitKnight('cherry', 0xc8102a, { R: 0.75, weapon: 'sword', limb: 0x4a7a2a });
  crown(k, 'head', [0, 0.75 + 0.75 * 2.9, 0.38], 0.2, 0.22); crown(k, 'head', [0, 0.75 + 0.75 * 2.9, -0.38], 0.2, 0.22);
  return k;
}
function pineKing() {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]).part('armL', 'body', [0.05, 2.1, -0.75]).part('armR', 'body', [0.05, 2.1, 0.75]);
  for (const s of [-1, 1]) k.add('body', G.capsule(0.16, 0.4, 4, 8), { c: 0x8a5a2a, p: [0.05, 0.3, s * 0.32] });
  FRUIT.pine(k, 'body', [0, 1.6, 0], 0.9);
  for (let i = 0; i < 4; i++) k.add('body', G.capsule(0.04, 0.5, 3, 6), { c: 0xff5a1a, p: [0.75, 1.0 + i * 0.3, (i % 2 ? -0.2 : 0.2)], r: [i * 20, 0, 0], glow: true });   // lava cracks
  redEyes(k, 'body', 0.74, 1.9, 0.24, 0.11); brows(k, 'body', 0.78, 2.08, 0.24); grin(k, 'body', 0.78, 1.45, 0.28, { color: 0x3a0a0a, teeth: 5 });
  crown(k, 'body', [0, 3.25, 0], 0.34, 0.32, 0xff6a1a);
  for (const [p, s] of [['armL', -1], ['armR', 1]]) { const g = G.cone(0.22, 1.3, 12); g.translate(0, 0.65, 0); k.add(p, g, { c: 0xe8a02a, pat: PAT.dots, p: [0.05, 2.1, s * 0.78], dir: [0.3, -1, s * 0.15] }); }
  return k;
}
function bogBeast() { const k = fruitBouncer('blue', 0x2a3a98, { R: 1.0, king: true }); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; k.add('body', G.sphere(0.25, 10, 8), { c: 0x4a7a3a, p: [Math.cos(a) * 0.85, 0.35 + (i % 2) * 0.4, Math.sin(a) * 0.85], s: [1, 0.4, 1] }); } return k; }
function fruitEmperor() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.9, -0.3]).part('legR', 'root', [0, 0.9, 0.3]).part('body', 'root', [0, 0.9, 0])
   .part('head', 'body', [0, 2.5, 0]).part('armL', 'body', [0, 2.1, -0.95]).part('armR', 'body', [0, 2.1, 0.95]);
  for (const [p, z] of [['legL', -0.3], ['legR', 0.3]]) { k.add(p, G.capsule(0.15, 0.55, 4, 10), { c: 0xe8a02a, pat: PAT.dots, p: [0, 0.5, z] }); k.add(p, G.sphere(0.2, 10, 8), { c: 0x4a3320, p: [0.07, 0.1, z], s: [1.5, 0.6, 1.1] }); }
  FRUIT.melon(k, 'body', [0, 1.75, 0], 0.95);                                              // watermelon body
  FRUIT.apple(k, 'head', [0.05, 2.95, 0], 0.55, 0xd92a2a);                                  // apple head
  FRUIT.pine(k, 'head', [0.05, 3.55, 0], 0.22); crown(k, 'head', [0.05, 3.42, 0], 0.4, 0.34);
  redEyes(k, 'head', 0.52, 3.0, 0.18, 0.1); brows(k, 'head', 0.56, 3.14, 0.18); grin(k, 'head', 0.58, 2.75, 0.22, { color: 0x3a0a0a, teeth: 5 });
  for (const [p, s] of [['armL', -1], ['armR', 1]]) FRUIT.banana(k, p, [0.15, 1.5, s * 1.05], 0.5);   // banana arms
  for (let i = 0; i < 6; i++) { const a = Math.PI * 0.6 + (i / 5) * Math.PI * 0.8; FRUIT.grape(k, 'body', [Math.cos(a) * 0.95 - 0.1, 1.6 + (i % 2) * 0.3, Math.sin(a) * 0.95], 0.28); }  // grape cape
  return k;
}

// ------------------------------------------------------------------ pets
function appleOwl() {
  const k = new Kit(); k.part('legL', 'root', [0, 0.45, -0.12]).part('legR', 'root', [0, 0.45, 0.12]).part('body', 'root', [0, 0.45, 0]).part('head', 'body', [0.1, 1.2, 0]).part('wingL', 'body', [0, 0.95, -0.4]).part('wingR', 'body', [0, 0.95, 0.4]);
  for (const [p, z] of [['legL', -0.12], ['legR', 0.12]]) k.add(p, G.cyl(0.03, 0.03, 0.4, 6), { c: 0xe0a02a, p: [0, 0.25, z] });
  FRUIT.apple(k, 'body', [0, 0.9, 0], 0.45, 0xd92a2a);
  for (const s of [-1, 1]) { k.add('head', G.sphere(0.14, 12, 10), { c: 0xfff4e0, p: [0.38, 1.0, s * 0.14] }); k.add('head', G.sphere(0.08, 10, 8), { c: 0x1a1a14, p: [0.47, 1.0, s * 0.15] }); k.add('head', G.cone(0.06, 0.16, 6), { c: 0xa81a1a, p: [0.05, 1.42, s * 0.2], r: [s * -20, 0, 0] }); }
  k.add('head', G.cone(0.05, 0.12, 6), { c: 0xe0a02a, p: [0.48, 0.88, 0], r: [0, 0, -120] });
  for (const [p, s] of [['wingL', -1], ['wingR', 1]]) k.add(p, G.sphere(0.25, 12, 8), { c: LEAF, p: [-0.05, 0.85, s * 0.42], s: [1.1, 1, 0.3] });
  return k;
}
const bananaMonkey = () => fruitPet('banana', 0xffd84a, { R: 0.38, headCol: 0x8a5a36, limb: 0x8a5a36, extras: (k, R, hip) => { for (const s of [-1, 1]) k.add('head', G.sphere(0.1, 8, 6), { c: 0xd9a070, p: [R + 0.2, hip + R * 1.25, s * 0.26], s: [0.5, 1, 1] }); k.add('head', G.sphere(0.16, 10, 8), { c: 0xe8c8a0, p: [R + 0.36, hip + R * 1.08, 0], s: [0.7, 0.7, 1] }); k.add('tail', G.tube([[-R - 0.1, hip + R * 0.6, 0], [-R - 0.4, hip + R * 1.2, 0], [-R - 0.2, hip + R * 1.7, 0]], 0.04, 12, 6), { c: 0x8a5a36 }); } });
const grapeTurtle = () => fruitPet('grape', 0x7a3ad0, { R: 0.5, hip: 0.25, headCol: 0x8fcf6a, limb: 0x6fae4f });
const melonSeal = () => fruitPet('melon', null, { R: 0.5, hip: 0.2, headCol: 0xb8c8d0, limb: 0x9aa8b0, extras: (k, R, hip) => { for (const s of [-1, 1]) k.add('head', G.capsule(0.01, 0.2, 2, 4), { c: 0x3a3a3a, p: [R + 0.55, hip + R * 1.1, s * 0.12], r: [s * 70, 0, 0] }); } });
function berryLadybug() {
  const k = new Kit(); k.part('legL', 'root', [0, 0.3, -0.2]).part('legR', 'root', [0, 0.3, 0.2]).part('body', 'root', [0, 0.3, 0]).part('head', 'body', [0.4, 0.45, 0]);
  for (const [p, s] of [['legL', -1], ['legR', 1]]) for (const x of [-0.2, 0, 0.2]) k.add(p, G.limb([x, 0.3, s * 0.25], [x + 0.05, 0.03, s * 0.45], 0.025), { c: 0x1a1a14 });
  FRUIT.berry(k, 'body', [-0.02, 0.5, 0], 0.4); k.add('head', G.sphere(0.2, 14, 10), { c: 0x1a1a14, p: [0.42, 0.45, 0] }); eyes(k, 'head', 0.57, 0.5, 0.08, 0.04, { color: 0xffffff, hi: false });
  for (const s of [-1, 1]) { k.add('head', G.cyl(0.01, 0.01, 0.2, 4), { c: 0x1a1a14, p: [0.5, 0.68, s * 0.08], r: [s * -20, 0, -20] }); k.add('head', G.sphere(0.035, 6, 4), { c: 0x1a1a14, p: [0.56, 0.77, s * 0.12] }); }
  return k;
}
const lemonCamel = () => fruitPet('lemon', 0xffe14a, { R: 0.5, hip: 0.75, headCol: 0xd9b880, limb: 0xc8a070, extras: (k, R, hip) => { FRUIT.lemon(k, 'body', [-0.2, hip + R * 1.75, 0], 0.22); k.add('head', G.capsule(0.09, 0.4, 4, 8), { c: 0xd9b880, p: [R + 0.12, hip + R * 0.95, 0], r: [0, 0, -20] }); } });
function cherryBird() {
  const k = new Kit(); k.part('legL', 'root', [0, 0.45, -0.1]).part('legR', 'root', [0, 0.45, 0.1]).part('body', 'root', [0, 0.45, 0]).part('head', 'body', [0.25, 0.95, 0]).part('wingL', 'body', [0, 0.85, -0.3]).part('wingR', 'body', [0, 0.85, 0.3]);
  for (const [p, z] of [['legL', -0.1], ['legR', 0.1]]) k.add(p, G.cyl(0.025, 0.025, 0.42, 6), { c: 0xe0a02a, p: [0, 0.24, z] });
  k.add('body', G.sphere(0.32, 16, 12), { c: 0xc8102a, p: [0, 0.8, 0], s: [1.3, 0.9, 0.9] });
  k.add('head', G.sphere(0.22, 14, 10), { c: 0xd92a3a, p: [0.32, 1.05, 0] }); k.add('head', G.cone(0.05, 0.16, 8), { c: 0xffc93c, p: [0.55, 1.03, 0], r: [0, 0, -90] });
  eyes(k, 'head', 0.46, 1.1, 0.1, 0.035); k.add('head', G.tube([[0.3, 1.25, 0], [0.25, 1.45, 0], [0.12, 1.55, 0]], 0.02, 8, 4), { c: 0x4a7a2a });
  for (const [p, s] of [['wingL', -1], ['wingR', 1]]) k.add(p, G.sphere(0.2, 12, 8), { c: 0x8a0a1a, p: [-0.05, 0.82, s * 0.32], s: [1.2, 0.6, 0.3] });
  k.add('body', G.cone(0.12, 0.3, 6), { c: 0x8a0a1a, p: [-0.45, 0.85, 0], r: [0, 0, 100] });
  return k;
}
const pineHedgehog = () => fruitPet('pine', null, { R: 0.42, headCol: 0xe8c890, limb: 0x8a5a36 });
function blueDuckModel() {
  const k = new Kit(); k.part('legL', 'root', [0, 0.3, -0.12]).part('legR', 'root', [0, 0.3, 0.12]).part('body', 'root', [0, 0.3, 0]).part('head', 'body', [0.3, 0.85, 0]).part('wingL', 'body', [0, 0.65, -0.32]).part('wingR', 'body', [0, 0.65, 0.32]);
  for (const [p, z] of [['legL', -0.12], ['legR', 0.12]]) { k.add(p, G.cyl(0.03, 0.03, 0.28, 6), { c: 0xff9a2a, p: [0, 0.16, z] }); k.add(p, G.sphere(0.07, 8, 6), { c: 0xff9a2a, p: [0.06, 0.02, z], s: [1.6, 0.3, 1.2] }); }
  FRUIT.blue(k, 'body', [0, 0.62, 0], 0.36); k.add('head', G.sphere(0.2, 14, 10), { c: 0x4a5ad8, p: [0.35, 0.95, 0] });
  k.add('head', G.sphere(0.1, 10, 8), { c: 0xff9a2a, p: [0.56, 0.9, 0], s: [1.4, 0.45, 1] }); eyes(k, 'head', 0.48, 1.0, 0.1, 0.035);
  for (const [p, s] of [['wingL', -1], ['wingR', 1]]) k.add(p, G.sphere(0.18, 12, 8), { c: 0x2a3a98, p: [-0.05, 0.65, s * 0.33], s: [1.3, 0.6, 0.3] });
  return k;
}

// ------------------------------------------------------------------ catalogue + projectile shapes
export const CATALOG5 = {
  apple_roller: { build: () => fruitRoller('apple', 0xd92a2a), rig: 'roller', h: 1.5, r: 0.78, rollR: 0.72 },
  seed_spitter: { build: () => fruitLauncher('apple', 0x7ac23a, 0xd9c8a0), rig: 'blob', h: 1.6, r: 0.7 },
  apple_golem: { build: appleGolem, rig: 'biped', h: 3.0, r: 0.9, scale: 1.4 },
  banana_brawler: { build: () => fruitKnight('banana', 0xffd84a, { R: 0.6, weapon: 'sword', limb: 0x8a6a2a }), rig: 'biped', h: 2.3, r: 0.75 },
  peel_slinger: { build: () => fruitKnight('banana', 0xffe46a, { R: 0.55, weapon: 'peel', limb: 0x8a6a2a }), rig: 'biped', h: 2.2, r: 0.7 },
  bananaconda: { build: bananaconda, rig: 'slither', h: 1.2, r: 0.8, scale: 1.8, stride: 1.4 },
  grape_bouncer: { build: () => fruitBouncer('grape', 0x7a3ad0), rig: 'blob', h: 1.3, r: 0.55, hop: 2.2 },
  grape_shooter: { build: () => fruitLauncher('grape', 0x7a3ad0, 0x6a4a2a), rig: 'blob', h: 1.6, r: 0.7 },
  vinelord: { build: vinelord, rig: 'pillar', h: 4.2, r: 0.7 },
  melon_roller: { build: () => fruitRoller('melon', null, { R: 0.8 }), rig: 'roller', h: 1.7, r: 0.85, rollR: 0.8 },
  seed_gunner: { build: () => fruitLauncher('melon', null, 0xff5a6a), rig: 'blob', h: 1.6, r: 0.7 },
  melon_crab: { build: melonCrab, rig: 'bug', h: 2.4, r: 1.5 },
  berry_sword: { build: () => fruitKnight('berry', 0xe8203a, { R: 0.6, weapon: 'sword' }), rig: 'biped', h: 2.3, r: 0.7 },
  berry_bouncer: { build: () => fruitBouncer('berry', 0xe8203a, { R: 0.5 }), rig: 'blob', h: 1.3, r: 0.5, hop: 2.4 },
  queen_berry: { build: () => fruitKnight('berry', 0xff3a5a, { R: 0.8, weapon: 'sword', king: true }), rig: 'biped', h: 2.9, r: 0.85, scale: 1.4 },
  lemon_lancer: { build: () => fruitKnight('lemon', 0xffe14a, { R: 0.55, weapon: 'spear', limb: 0x8fbf3a }), rig: 'biped', h: 2.3, r: 0.75 },
  lemon_squirter: { build: () => fruitKnight('lemon', 0xffd02a, { R: 0.55, weapon: 'squirt', limb: 0x8fbf3a }), rig: 'biped', h: 2.2, r: 0.7 },
  sour_sphinx: { build: sourSphinx, rig: 'quad', h: 3.0, r: 1.3 },
  cherry_bomb: { build: () => fruitBouncer('cherry', 0xc8102a, { R: 0.5 }), rig: 'blob', h: 1.4, r: 0.6, hop: 2.0 },
  cherry_archer: { build: () => fruitKnight('cherry', 0xc8102a, { R: 0.55, weapon: 'bow', limb: 0x4a7a2a }), rig: 'biped', h: 2.4, r: 0.7 },
  cherry_titan: { build: cherryTitan, rig: 'biped', h: 3.0, r: 0.9, scale: 1.45 },
  pine_brute: { build: () => fruitKnight('pine', null, { R: 0.6, weapon: 'sword', limb: 0x8a5a2a }), rig: 'biped', h: 2.6, r: 0.75 },
  pine_spiker: { build: () => fruitLauncher('pine', null, 0x3d8a2a), rig: 'blob', h: 1.9, r: 0.7 },
  pine_king: { build: pineKing, rig: 'chopper', h: 3.4, r: 1.0, scale: 1.3 },
  blue_blob: { build: () => fruitBouncer('blue', 0x3a4ab8, { R: 0.6 }), rig: 'blob', h: 1.4, r: 0.65 },
  blue_spitter: { build: () => fruitLauncher('blue', 0x3a4ab8, 0x2a2a6a), rig: 'blob', h: 1.6, r: 0.7 },
  bog_beast: { build: bogBeast, rig: 'blob', h: 2.4, r: 1.2, scale: 1.4 },
  fruit_emperor: { build: fruitEmperor, rig: 'biped', h: 4.0, r: 1.1, scale: 1.4 },
  apple_owl: { build: appleOwl, rig: 'bird', h: 1.6, r: 0.5 },
  banana_monkey: { build: bananaMonkey, rig: 'quad', h: 1.0, r: 0.5 },
  grape_turtle: { build: grapeTurtle, rig: 'quad', h: 1.0, r: 0.6 },
  melon_seal: { build: melonSeal, rig: 'quad', h: 0.9, r: 0.6 },
  berry_ladybug: { build: berryLadybug, rig: 'bug', h: 0.9, r: 0.5 },
  lemon_camel: { build: lemonCamel, rig: 'quad', h: 1.8, r: 0.6, stride: 1.2 },
  cherry_bird: { build: cherryBird, rig: 'bird', h: 1.4, r: 0.45 },
  pine_hedgehog: { build: pineHedgehog, rig: 'quad', h: 1.2, r: 0.55 },
  blue_duck: { build: blueDuckModel, rig: 'bird', h: 1.1, r: 0.45 },
};
// projectile shapes for Quest 3 shooters: src sprite -> { build(kit), arc, spin }
export const PROJ5 = {
  seed_spitter: { build: (k) => k.add('root', G.sphere(0.07, 8, 6), { c: 0x3a2010, s: [1.6, 1, 1] }), arc: 0.2, spin: true },
  peel_slinger: { build: (k) => FRUIT.banana(k, 'root', [0, 0, 0], 0.16), arc: 0.8, spin: true },
  grape_shooter: { build: (k) => k.add('root', G.sphere(0.13, 10, 8), { c: 0x7a3ad0 }), arc: 0.3, spin: false },
  seed_gunner: { build: (k) => k.add('root', G.sphere(0.07, 8, 6), { c: 0x1a1a14, s: [1.6, 1, 1] }), arc: 0.1, spin: true },
  lemon_squirter: { build: (k) => k.add('root', G.sphere(0.1, 10, 8), { c: 0xffe94a, s: [1.6, 0.8, 0.8], glow: true }), arc: 0.2, spin: false },
  cherry_archer: { build: (k) => FRUIT.cherry(k, 'root', [0, 0, 0], 0.14), arc: 0.4, spin: true },
  pine_spiker: { build: (k) => k.add('root', G.cone(0.06, 0.3, 6), { c: 0xffb02e, r: [0, 0, -90] }), arc: 0.1, spin: false },
  blue_spitter: { build: (k) => k.add('root', G.sphere(0.12, 10, 8), { c: 0x3a4ab8 }), arc: 0.3, spin: false },
};
