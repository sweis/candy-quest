// Halloween Special + Candy Quest 2 levels 6–7 casts. Same conventions as models.js (forward = +X, up = +Y, right = +Z).
import { Kit, G, PAT, THREE } from './kit.js';
import { eyes, redEyes, grin } from './models.js';
import { floret } from './models3.js';

const rng = (seed) => { let a = seed; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; };
function brows(k, part, x, y, z, c = 0x3a1a0a) { for (const s of [-1, 1]) k.add(part, G.rbox(0.05, 0.05, 0.2, 0.02), { c, p: [x, y, s * z], r: [s * -18, 0, 0] }); }

// ------------------------------------------------------------------ pumpkins
// ribbed pumpkin centred at c, radius R; optional glowing carved face looking along +X
export function pumpkin(k, part, c, R, { face = false, facePart = part, stem = true } = {}) {
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; k.add(part, G.sphere(R * 0.62, 14, 10), { c: i % 2 ? 0xff7a1a : 0xf06a10, p: [c[0] + Math.cos(a) * R * 0.42, c[1], c[2] + Math.sin(a) * R * 0.42], s: [0.75, 1.0, 0.75] }); }
  k.add(part, G.sphere(R * 0.9, 18, 14), { c: 0xff8a2a, p: c, s: [1, 0.86, 1] });
  if (stem) k.add(part, G.cyl(R * 0.08, R * 0.11, R * 0.35, 6), { c: 0x4a6a2a, p: [c[0], c[1] + R * 0.95, c[2]], r: [0, 0, 14] });
  if (face) {
    const x = c[0] + R * 0.86, G2 = 0xffe066;
    for (const sd of [-1, 1]) k.add(facePart, G.cone(R * 0.16, R * 0.22, 3), { c: G2, p: [x, c[1] + R * 0.2, c[2] + sd * R * 0.3], r: [0, 0, -90], s: [0.4, 1, 1], glow: true });
    k.add(facePart, G.cone(R * 0.08, R * 0.12, 3), { c: G2, p: [x + R * 0.04, c[1] + R * 0.0, c[2]], r: [0, 0, -90], s: [0.4, 1, 1], glow: true });
    k.add(facePart, G.rbox(R * 0.08, R * 0.13, R * 0.7, R * 0.04), { c: G2, p: [x, c[1] - R * 0.3, c[2]], glow: true });
    for (const dz of [-0.17, 0.17]) k.add(facePart, G.rbox(R * 0.1, R * 0.09, R * 0.1, R * 0.02), { c: 0xff8a2a, p: [x + R * 0.02, c[1] - R * 0.25, c[2] + dz * R] });
  }
}
export function pumpkinRoller({ king = false } = {}) {
  const k = new Kit(); const R = 0.72;
  k.part('body', 'root', [0, R, 0]).part('shell', 'body', [0, R, 0]).part('face', 'body', [0, R, 0]);
  pumpkin(k, 'shell', [0, R, 0], R, { stem: false });              // rolls
  const x = R * 0.9, Gl = 0xffe066;                                  // the carved face stays upright
  for (const sd of [-1, 1]) k.add('face', G.cone(0.12, 0.17, 3), { c: Gl, p: [x, R + 0.15, sd * 0.22], r: [0, 0, -90], s: [0.4, 1, 1], glow: true });
  k.add('face', G.rbox(0.07, 0.1, 0.5, 0.03), { c: Gl, p: [x, R - 0.2, 0], glow: true });
  k.add('face', G.cyl(0.06, 0.08, 0.24, 6), { c: 0x4a6a2a, p: [0, R * 1.74 + 0.1, 0] });
  if (king) { for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; k.add('face', G.cone(0.09, 0.3, 8), { c: 0xb98aff, p: [Math.cos(a) * 0.3, R * 1.72 + 0.14, Math.sin(a) * 0.3] }); } k.add('face', G.torus(0.33, 0.06, 8, 24), { c: 0x6a3aaa, p: [0, R * 1.72, 0], r: [90, 0, 0] }); }
  return k;
}
export function pumpkinSwordsman() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.8, -0.18]).part('legR', 'root', [0, 0.8, 0.18]).part('body', 'root', [0, 0.8, 0])
   .part('head', 'body', [0, 1.75, 0]).part('armL', 'body', [0, 1.6, -0.42]).part('armR', 'body', [0, 1.6, 0.42]).part('weapon', 'armR', [0.12, 1.0, 0.5]);
  for (const [p, z] of [['legL', -0.18], ['legR', 0.18]]) { k.add(p, G.capsule(0.09, 0.55, 4, 8), { c: 0x3a2a4a, p: [0, 0.48, z] }); k.add(p, G.rbox(0.34, 0.14, 0.22, 0.06), { c: 0x2a1a20, p: [0.06, 0.07, z] }); }
  k.add('body', G.lathe([[0, 0.8], [0.3, 0.82], [0.4, 1.0], [0.36, 1.4], [0.28, 1.7], [0, 1.74]], 20), { c: 0x5a2a7a });   // tattered purple coat
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; k.add('body', G.cone(0.08, 0.2, 4), { c: 0x5a2a7a, p: [Math.cos(a) * 0.36, 0.76, Math.sin(a) * 0.36], r: [180, 0, 0] }); }
  k.add('body', G.cyl(0.38, 0.38, 0.08, 18), { c: 0xff8a2a, p: [0, 1.15, 0] });
  pumpkin(k, 'head', [0, 2.12, 0], 0.42, { face: true });
  for (const [p, z] of [['armL', -0.45], ['armR', 0.45]]) k.add(p, G.limb([0, 1.6, z], [0.12, 1.0, z * 1.15], 0.07), { c: 0x4a6a2a });
  k.add('weapon', G.rbox(0.06, 1.0, 0.14, 0.03), { c: 0xd8dde6, p: [0.12, 1.62, 0.5] });
  k.add('weapon', G.cone(0.07, 0.18, 4), { c: 0xd8dde6, p: [0.12, 2.2, 0.5], s: [0.45, 1, 1] });
  k.add('weapon', G.rbox(0.1, 0.07, 0.42, 0.03), { c: 0x6a3aaa, p: [0.12, 1.1, 0.5] });
  return k;
}
export function pumpkinSnake() {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]).part('neck', 'body', [0.3, 0.7, 0]).part('head', 'neck', [0.6, 1.55, 0]);
  k.add('body', G.torus(0.5, 0.2, 12, 30), { c: 0xff8a2a, pat: PAT.licorice, p: [0, 0.2, 0], r: [90, 0, 0] });
  k.add('body', G.torus(0.36, 0.18, 12, 26), { c: 0x4a8a3a, pat: PAT.licorice, p: [0, 0.52, 0], r: [90, 0, 0] });
  k.add('neck', G.tube([[0.3, 0.6, 0], [0.4, 1.05, 0], [0.5, 1.38, 0], [0.58, 1.5, 0]], 0.16, 20, 10), { c: 0xff8a2a, pat: PAT.licorice });
  pumpkin(k, 'head', [0.7, 1.72, 0], 0.32, { face: true });     // a carved pumpkin on its head
  k.add('head', G.capsule(0.015, 0.2, 2, 4), { c: 0x6fc24f, p: [1.08, 1.52, 0], r: [0, 0, 90] });
  return k;
}
// ------------------------------------------------------------------ cauliflowers
const CREAM = [0xf6f1dc, 0xece5c6, 0xfffbea, 0xe3dab6];
export function cauliRoller({ king = false } = {}) {
  const k = new Kit(); const R = 0.74;
  k.part('body', 'root', [0, R, 0]).part('shell', 'body', [0, R, 0]).part('face', 'body', [0, R, 0]);
  k.add('shell', G.sphere(R * 0.9, 18, 14), { c: 0xece5c6, p: [0, R, 0] });
  const r = rng(king ? 17 : 5);
  for (let i = 0; i < 14; i++) { const t = (i + 0.5) / 14, y = 1 - t * 2, rr = Math.sqrt(1 - y * y), a = i * 2.39996; k.add('shell', G.sphere(R * (0.32 + r() * 0.08), 10, 8), { c: CREAM[i % 4], p: [Math.cos(a) * rr * R * 0.78, R + y * R * 0.78, Math.sin(a) * rr * R * 0.78] }); }
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; k.add('shell', G.sphere(R * 0.4, 10, 8), { c: 0x6fae4f, p: [Math.cos(a) * R * 0.75, R * 0.3, Math.sin(a) * R * 0.75], s: [1, 0.35, 0.8], dir: [Math.cos(a), 0.6, Math.sin(a)] }); }
  redEyes(k, 'face', R * 0.9, R + 0.16, 0.2, 0.1); brows(k, 'face', R * 0.94, R + 0.3, 0.2); grin(k, 'face', R * 0.94, R - 0.2, 0.26, { color: 0x3a3a1a, teeth: 5 });
  if (king) { for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; k.add('face', G.cone(0.09, 0.3, 8), { c: 0xffc93c, p: [Math.cos(a) * 0.3, R * 2 + 0.12, Math.sin(a) * 0.3] }); } k.add('face', G.torus(0.33, 0.06, 8, 24), { c: 0xf0a82a, p: [0, R * 2, 0], r: [90, 0, 0] }); }
  return k;
}
export function cauliLauncher() {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]);
  for (const [x, z] of [[0.3, -0.32], [0.3, 0.32], [-0.4, 0]]) k.add('body', G.limb([x * 0.5, 0.7, z * 0.5], [x, 0.05, z], 0.07), { c: 0x6fae4f });
  floret(k, 'body', [0, 1.0, 0], 0.62, 9, CREAM);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; k.add('body', G.sphere(0.28, 10, 8), { c: 0x6fae4f, p: [Math.cos(a) * 0.5, 0.82, Math.sin(a) * 0.5], s: [1, 0.35, 0.8], dir: [Math.cos(a), 0.6, Math.sin(a)] }); }
  k.add('body', G.cyl(0.18, 0.24, 0.7, 14), { c: 0x8fbf5a, p: [0.75, 1.0, 0], r: [0, 0, -90] });     // stalk cannon
  k.add('body', G.cyl(0.13, 0.13, 0.02, 12), { c: 0x1a2a10, p: [1.11, 1.0, 0], r: [0, 0, -90] });
  redEyes(k, 'body', 0.5, 1.3, 0.2, 0.08); brows(k, 'body', 0.52, 1.42, 0.2);
  return k;
}
export function cauliFrog() {
  const k = new Kit(); const hip = 0.32;
  k.part('body', 'root', [0, hip, 0]).part('head', 'body', [0.45, 0.5, 0]).part('tail', 'body', [-0.4, 0.4, 0]);
  for (const [n, x, s, back] of [['legFL', 0.32, -1, false], ['legFR', 0.32, 1, false], ['legBL', -0.3, -1, true], ['legBR', -0.3, 1, true]]) {
    const z = s * (back ? 0.32 : 0.22); k.part(n, 'root', [x, hip, z]);
    if (back) { k.add(n, G.sphere(0.17, 10, 8), { c: 0x8fbf5a, p: [x, 0.22, z], s: [1.4, 0.8, 0.8] }); k.add(n, G.limb([x + 0.15, 0.12, z], [x + 0.3, 0.04, z + s * 0.05], 0.05), { c: 0x8fbf5a }); }
    else k.add(n, G.limb([x, hip, z], [x + 0.08, 0.04, z + s * 0.06], 0.05), { c: 0x8fbf5a });
    k.add(n, G.sphere(0.06, 8, 6), { c: 0x6fae4f, p: [x + (back ? 0.32 : 0.1), 0.03, z + s * 0.06], s: [1.6, 0.4, 1.2] });
  }
  k.add('body', G.sphere(0.38, 18, 14), { c: 0xf6f1dc, p: [0, 0.48, 0], s: [1.25, 0.8, 1] });
  floret(k, 'body', [-0.08, 0.62, 0], 0.32, 33, CREAM);                         // cauliflower back
  k.add('head', G.sphere(0.28, 16, 12), { c: 0xe8f0c8, p: [0.42, 0.55, 0], s: [1, 0.75, 1.15] });
  for (const sd of [-1, 1]) { k.add('head', G.sphere(0.11, 12, 10), { c: 0xffffff, p: [0.48, 0.78, sd * 0.16] }); k.add('head', G.sphere(0.06, 8, 6), { c: 0x1a1a10, p: [0.56, 0.8, sd * 0.17] }); }
  k.add('head', G.torus(0.14, 0.018, 6, 16, Math.PI), { c: 0x3d6b2a, p: [0.62, 0.5, 0], r: [0, 90, 180], s: [1, 0.55, 1] });
  return k;
}
// ------------------------------------------------------------------ corn
function cob(k, part, base, len, r, dir = [0, 1, 0]) { // a corn cob: kernel-dotted capsule, wide end at base
  const g = G.capsule(r, len, 6, 14); g.translate(0, len / 2 + r, 0); k.add(part, g, { c: 0xffd84a, pat: PAT.dots, p: base, dir });
}
function husk(k, part, c, R, n = 6, h = 0.7) { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; k.add(part, G.sphere(R, 10, 8), { c: i % 2 ? 0x6fae4f : 0x8fcf5a, p: [c[0] + Math.cos(a) * R * 0.75, c[1], c[2] + Math.sin(a) * R * 0.75], s: [0.35, h / R, 0.6], dir: [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4] }); } }
export function cornBasher({ king = false } = {}) {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.8, -0.2]).part('legR', 'root', [0, 0.8, 0.2]).part('body', 'root', [0, 0.8, 0])
   .part('head', 'body', [0, 2.0, 0]).part('armL', 'body', [0, 1.65, -0.48]).part('armR', 'body', [0, 1.65, 0.48]).part('weapon', 'armR', [0.14, 1.05, 0.56]);
  for (const [p, z] of [['legL', -0.2], ['legR', 0.2]]) { k.add(p, G.capsule(0.1, 0.55, 4, 8), { c: 0x6fae4f, p: [0, 0.5, z] }); k.add(p, G.sphere(0.15, 10, 8), { c: 0x4a8a3a, p: [0.06, 0.08, z], s: [1.5, 0.6, 1] }); }
  cob(k, 'body', [0, 0.85, 0], 1.25, 0.42);
  husk(k, 'body', [0, 1.05, 0], 0.42, 7, 0.55);
  redEyes(k, 'head', 0.4, 1.95, 0.15, 0.09); brows(k, 'head', 0.43, 2.1, 0.15); grin(k, 'head', 0.43, 1.7, 0.18, { color: 0x6a4a0a });
  k.add('head', G.capsule(0.02, 0.4, 2, 4), { c: 0xe8d48a, p: [0, 2.9, 0], r: [0, 0, 20] });
  if (king) { k.add('head', G.cyl(0.36, 0.42, 0.25, 18), { c: 0xffc93c, p: [0, 2.72, 0] }); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; k.add('head', G.cone(0.07, 0.22, 6), { c: 0xffc93c, p: [Math.cos(a) * 0.36, 2.95, Math.sin(a) * 0.36] }); } }
  for (const [p, z] of [['armL', -0.5], ['armR', 0.5]]) k.add(p, G.limb([0, 1.65, z], [0.14, 1.05, z * 1.12], 0.09), { c: 0x6fae4f });
  cob(k, 'weapon', [0.14, 1.0, 0.56], king ? 1.4 : 1.0, king ? 0.24 : 0.18);    // a corn-cob club
  return k;
}
export function cornColonel() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.8, -0.2]).part('legR', 'root', [0, 0.8, 0.2]).part('body', 'root', [0, 0.8, 0])
   .part('head', 'body', [0, 2.0, 0]).part('armL', 'body', [0, 1.65, -0.48]).part('armR', 'body', [0, 1.65, 0.48]).part('weapon', 'armR', [0.14, 1.1, 0.56]);
  for (const [p, z] of [['legL', -0.2], ['legR', 0.2]]) { k.add(p, G.capsule(0.1, 0.55, 4, 8), { c: 0x4a6a3a, p: [0, 0.5, z] }); k.add(p, G.rbox(0.36, 0.14, 0.22, 0.06), { c: 0x3a2a1a, p: [0.06, 0.07, z] }); }
  cob(k, 'body', [0, 0.85, 0], 1.25, 0.42);
  k.add('body', G.cyl(0.44, 0.46, 0.5, 18), { c: 0x5a7a3a, p: [0, 1.15, 0] });                                  // olive tunic
  for (let i = 0; i < 3; i++) k.add('body', G.sphere(0.04, 8, 6), { c: 0xffc93c, p: [0.45, 1.0 + i * 0.14, 0] });
  k.add('head', G.cyl(0.4, 0.42, 0.22, 20), { c: 0x4a6a3a, p: [0, 2.75, 0] });                                   // peaked colonel's cap
  k.add('head', G.cyl(0.24, 0.24, 0.04, 16), { c: 0x2a2a1a, p: [0.32, 2.66, 0], s: [1, 1, 1.6] });
  k.add('head', G.extrude(G.star(0.08, 0.035), 0.02, 0.005), { c: 0xffc93c, p: [0.41, 2.78, 0], r: [0, 90, 0] });
  redEyes(k, 'head', 0.4, 2.05, 0.15, 0.08); brows(k, 'head', 0.43, 2.18, 0.15);
  for (const sd of [-1, 1]) k.add('head', G.capsule(0.04, 0.16, 3, 6), { c: 0xe8d48a, p: [0.44, 1.85, sd * 0.1], r: [sd * 70, 0, 0] });   // cornsilk mustache
  for (const [p, z] of [['armL', -0.5], ['armR', 0.5]]) k.add(p, G.limb([0, 1.65, z], [0.14, 1.1, z * 1.12], 0.09), { c: 0x5a7a3a });
  k.add('weapon', G.cyl(0.07, 0.09, 0.9, 12), { c: 0x6a4a2a, p: [0.55, 1.12, 0.56], r: [0, 0, -90] });         // kernel blaster
  k.add('weapon', G.cyl(0.1, 0.1, 0.2, 12), { c: 0xffd84a, pat: PAT.dots, p: [0.25, 1.22, 0.56] });
  return k;
}
export function cornBull() {
  const k = new Kit(); const hip = 0.6;
  k.part('body', 'root', [0, hip, 0]).part('head', 'body', [0.65, 0.85, 0]).part('tail', 'body', [-0.65, 0.85, 0]);
  for (const [n, x, s] of [['legFL', 0.42, -1], ['legFR', 0.42, 1], ['legBL', -0.42, -1], ['legBR', -0.42, 1]]) {
    const z = s * 0.24; k.part(n, 'root', [x, hip, z]); k.add(n, G.limb([x, hip + 0.1, z], [x, 0.06, z], 0.08), { c: 0xd9b84a });
    k.add(n, G.cyl(0.08, 0.09, 0.08, 10), { c: 0x5a3a1a, p: [x, 0.04, z] });
  }
  k.add('body', G.sphere(0.5, 22, 16), { c: 0xffd84a, pat: PAT.dots, p: [0, 0.9, 0], s: [1.45, 0.82, 0.85] });  // kernel-textured hide
  for (const sd of [-1, 1]) husk(k, 'body', [0.25, 1.1, sd * 0.3], 0.3, 3, 0.4);                                   // husk shoulders
  k.add('head', G.sphere(0.3, 18, 14), { c: 0xffd84a, pat: PAT.dots, p: [0.78, 0.95, 0], s: [1.15, 0.95, 1] });
  k.add('head', G.sphere(0.18, 12, 10), { c: 0xe8c890, p: [1.0, 0.85, 0], s: [0.8, 0.8, 1.2] });
  k.add('head', G.torus(0.07, 0.015, 6, 14), { c: 0xffc93c, p: [1.12, 0.78, 0] });
  for (const sd of [-1, 1]) k.add('head', G.tube([[0.75, 1.15, sd * 0.2], [0.75, 1.25, sd * 0.38], [0.9, 1.4, sd * 0.42]], 0.045, 10, 6), { c: 0xfff4dc });
  eyes(k, 'head', 0.98, 1.02, 0.14, 0.04);
  k.add('tail', G.tube([[-0.65, 0.95, 0], [-0.85, 0.8, 0], [-0.9, 0.55, 0]], 0.03, 10, 6), { c: 0xd9b84a });
  for (let i = 0; i < 5; i++) k.add('tail', G.capsule(0.015, 0.16, 2, 4), { c: 0xe8d48a, p: [-0.9 + (i - 2) * 0.02, 0.45, (i - 2) * 0.02] });
  return k;
}

export const CATALOG4 = {
  pumpkin_roller: { build: () => pumpkinRoller(), rig: 'roller', h: 1.5, r: 0.78, rollR: 0.72 },
  great_pumpkin: { build: () => pumpkinRoller({ king: true }), rig: 'roller', h: 1.5, r: 0.78, rollR: 0.72, scale: 1.9 },
  pumpkin_sword: { build: pumpkinSwordsman, rig: 'biped', h: 2.6, r: 0.6 },
  pumpkin_snake: { build: pumpkinSnake, rig: 'snake', h: 2.1, r: 0.7 },
  cauli_roller: { build: () => cauliRoller(), rig: 'roller', h: 1.6, r: 0.8, rollR: 0.74 },
  cauli_king: { build: () => cauliRoller({ king: true }), rig: 'roller', h: 1.6, r: 0.8, rollR: 0.74, scale: 1.9 },
  cauli_launcher: { build: cauliLauncher, rig: 'blob', h: 1.7, r: 0.75 },
  cauli_frog: { build: cauliFrog, rig: 'frog', h: 1.0, r: 0.55 },
  corn_basher: { build: () => cornBasher(), rig: 'biped', h: 3.0, r: 0.65 },
  cob_crusher: { build: () => cornBasher({ king: true }), rig: 'biped', h: 3.0, r: 0.65, scale: 1.6 },
  corn_colonel: { build: cornColonel, rig: 'biped', h: 3.0, r: 0.65 },
  corn_bull: { build: cornBull, rig: 'quad', h: 1.5, r: 0.75, stride: 1.2 },
};
