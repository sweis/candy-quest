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

// ------------------------------------------------------------------ Pepper Forest
const PEP_R = 0xe8301e, PEP_Y = 0xffc21a, PEP_G = 0x4f9a2a, STEM = 0x3d7a22;
// a bell pepper: four lobes + a stem cap, centred at c (radius R, colour col)
export function bellPepper(k, part, c, R, col, { stem = true } = {}) {
  for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.4; k.add(part, G.sphere(R * 0.62, 16, 12), { c: col, p: [c[0] + Math.cos(a) * R * 0.38, c[1], c[2] + Math.sin(a) * R * 0.38], s: [0.8, 1.1, 0.8] }); }
  k.add(part, G.sphere(R * 0.82, 18, 14), { c: col, p: c, s: [1, 1.05, 1] });
  k.add(part, G.sphere(R * 0.25, 10, 8), { c: 0xffffff, p: [c[0] - R * 0.3, c[1] + R * 0.45, c[2] + R * 0.35], s: [0.6, 0.4, 0.6], glow: false });
  if (stem) { k.add(part, G.cyl(R * 0.3, R * 0.34, R * 0.12, 12), { c: STEM, p: [c[0], c[1] + R * 0.82, c[2]] }); k.add(part, G.tube([[c[0], c[1] + R * 0.85, c[2]], [c[0] + R * 0.05, c[1] + R * 1.1, c[2]], [c[0] + R * 0.2, c[1] + R * 1.2, c[2]]], R * 0.07, 8, 6), { c: STEM }); }
}
// a chili pepper lying along +X from p (length L)
export function chili(k, part, p, L, col = PEP_R, opts = {}) {
  k.add(part, G.tube([[p[0], p[1], p[2]], [p[0] + L * 0.5, p[1] - L * 0.05, p[2]], [p[0] + L, p[1] + L * 0.12, p[2]]], L * 0.09, 14, 8), { c: col, ...opts });
  k.add(part, G.cone(L * 0.09, L * 0.18, 8), { c: col, p: [p[0] + L * 1.07, p[1] + L * 0.16, p[2]], r: [0, 0, -60], ...opts });
  k.add(part, G.cyl(L * 0.1, L * 0.11, L * 0.08, 8), { c: STEM, p: [p[0] - L * 0.02, p[1], p[2]], r: [0, 0, 90] });
}
export function pepperSwinger() { // a big bell pepper that swings its long arms
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]).part('armL', 'body', [0.05, 1.7, -0.62]).part('armR', 'body', [0.05, 1.7, 0.62]).part('head', 'body', [0, 2.0, 0]);
  for (const s of [-1, 1]) k.add('body', G.capsule(0.13, 0.4, 4, 8), { c: STEM, p: [0.05, 0.3, s * 0.3] });
  bellPepper(k, 'body', [0, 1.5, 0], 0.8, PEP_R);
  for (const s of [-1, 1]) { k.add('head', G.sphere(0.13, 12, 10), { c: 0xffffff, p: [0.66, 1.72, s * 0.22] }); k.add('head', G.sphere(0.07, 8, 6), { c: 0x1a0a0a, p: [0.77, 1.73, s * 0.23] }); }
  for (const s of [-1, 1]) k.add('head', G.rbox(0.05, 0.05, 0.24, 0.02), { c: 0x3a0a0a, p: [0.7, 1.9, s * 0.22], r: [s * -22, 0, 0] });
  grin(k, 'head', 0.76, 1.32, 0.26, { color: 0x3a0a0a, teeth: 5 });
  for (const [p, sd] of [['armL', -1], ['armR', 1]]) { k.add(p, G.tube([[0.05, 1.7, sd * 0.62], [0.12, 1.2, sd * 0.78], [0.15, 0.7, sd * 0.82]], 0.08, 14, 8), { c: PEP_G }); chili(k, p, [0.05, 0.62, sd * 0.82], 0.36, 0xd92a12); }
  return k;
}
export function pepperThrower() { // a yellow pepper that hurls chilis
  const k = new Kit();
  k.part('legL', 'root', [0, 0.7, -0.18]).part('legR', 'root', [0, 0.7, 0.18]).part('body', 'root', [0, 0.7, 0])
   .part('head', 'body', [0, 1.6, 0]).part('armL', 'body', [0, 1.45, -0.55]).part('armR', 'body', [0, 1.45, 0.55]).part('weapon', 'armR', [0.12, 0.92, 0.62]);
  for (const [p, z] of [['legL', -0.18], ['legR', 0.18]]) { k.add(p, G.capsule(0.08, 0.45, 4, 8), { c: PEP_G, p: [0, 0.42, z] }); k.add(p, G.sphere(0.13, 10, 8), { c: STEM, p: [0.05, 0.08, z], s: [1.5, 0.6, 1] }); }
  bellPepper(k, 'body', [0, 1.35, 0], 0.62, PEP_Y);
  redEyes(k, 'head', 0.55, 1.5, 0.18, 0.09); brows(k, 'head', 0.58, 1.65, 0.18, 0x6a3a00); grin(k, 'head', 0.6, 1.18, 0.2, { color: 0x5a2a00 });
  for (const [p, z] of [['armL', -0.58], ['armR', 0.58]]) k.add(p, G.limb([0, 1.45, z], [0.12, 0.95, z * 1.08], 0.07), { c: PEP_G });
  chili(k, 'weapon', [0.0, 0.92, 0.62], 0.42);   // the chili it's about to throw
  return k;
}
export function pepperWizard() { // boss: a habanero sorcerer firing peppers from a pepper staff
  const k = new Kit();
  k.part('legL', 'root', [0, 0.8, -0.2]).part('legR', 'root', [0, 0.8, 0.2]).part('body', 'root', [0, 0.8, 0])
   .part('head', 'body', [0, 2.0, 0]).part('armL', 'body', [0, 1.7, -0.5]).part('armR', 'body', [0, 1.7, 0.5]).part('weapon', 'armR', [0.15, 1.1, 0.6]);
  for (const [p, z] of [['legL', -0.2], ['legR', 0.2]]) k.add(p, G.capsule(0.1, 0.5, 4, 8), { c: PEP_G, p: [0, 0.45, z] });
  k.add('body', G.lathe([[0, 0.2], [0.62, 0.25], [0.55, 0.9], [0.4, 1.5], [0.28, 1.9], [0, 1.95]], 24), { c: 0x7a1a3a });     // robe
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; k.add('body', G.extrude(G.star(0.07, 0.03), 0.02, 0), { c: 0xffc93c, p: [Math.cos(a) * 0.5, 0.7 + (i % 2) * 0.4, Math.sin(a) * 0.5], dir: [Math.cos(a), 0, Math.sin(a)] }); }
  k.add('body', G.cyl(0.5, 0.52, 0.1, 20), { c: 0xffc93c, p: [0, 1.0, 0] });
  bellPepper(k, 'head', [0, 2.3, 0], 0.48, 0xff6a1a, { stem: false });                  // habanero head
  redEyes(k, 'head', 0.42, 2.38, 0.15, 0.08); brows(k, 'head', 0.46, 2.52, 0.15, 0x3a0a0a); grin(k, 'head', 0.48, 2.14, 0.16, { color: 0x3a0a0a });
  k.add('head', G.cyl(0.62, 0.62, 0.04, 24), { c: 0x5a0a2a, p: [0, 2.72, 0] });                   // wizard hat
  k.add('head', G.cone(0.36, 1.0, 20), { c: 0x7a1a3a, p: [-0.05, 3.2, 0], r: [0, 0, 12] });
  k.add('head', G.extrude(G.star(0.1, 0.04), 0.02, 0), { c: 0xffc93c, p: [0.25, 3.05, 0], r: [0, 90, 0] });
  for (const [p, z] of [['armL', -0.52], ['armR', 0.52]]) k.add(p, G.limb([0, 1.7, z], [0.15, 1.1, z * 1.15], 0.09), { c: 0x7a1a3a });
  const st = G.cyl(0.05, 0.05, 2.4, 8); st.translate(0, 1.2, 0); k.add('weapon', st, { c: 0x6a4a2a, p: [0.15, 0.4, 0.6] });     // the pepper staff
  chili(k, 'weapon', [0.05, 2.85, 0.6], 0.4, 0xff4a1a);
  k.add('weapon', G.sphere(0.16, 12, 10), { c: 0xffb030, p: [0.25, 2.92, 0.6], glow: true });
  return k;
}
export function pepperLobster() { // pet: a lobster with a red pepper shell and pepper-half claws
  const k = new Kit(); k.part('legL', 'root', [0, 0.3, -0.2]).part('legR', 'root', [0, 0.3, 0.2]).part('body', 'root', [0, 0.3, 0]).part('head', 'body', [0.45, 0.4, 0]);
  for (const [p, s] of [['legL', -1], ['legR', 1]]) for (const x of [-0.2, 0, 0.2]) k.add(p, G.limb([x, 0.32, s * 0.2], [x + 0.06, 0.03, s * 0.45], 0.03), { c: 0xb8201a });
  for (let i = 0; i < 4; i++) k.add('body', G.sphere(0.24 - i * 0.03, 14, 10), { c: i % 2 ? PEP_R : 0xd9281a, p: [0.05 - i * 0.24, 0.38, 0], s: [0.8, 0.75, 1] });
  const fan = new THREE.Shape(); fan.moveTo(0, 0); fan.lineTo(-0.3, 0.22); fan.quadraticCurveTo(-0.38, 0, -0.3, -0.22); fan.closePath();
  k.add('body', G.extrude(fan, 0.05, 0.02), { c: 0xff5a3a, p: [-0.85, 0.36, 0], r: [90, 0, 0] });
  k.add('head', G.sphere(0.26, 16, 12), { c: PEP_R, p: [0.38, 0.45, 0], s: [1.2, 0.85, 1] });
  k.add('head', G.cyl(0.08, 0.09, 0.06, 10), { c: STEM, p: [0.32, 0.68, 0] });
  for (const s of [-1, 1]) {
    k.add('head', G.cyl(0.015, 0.015, 0.14, 6), { c: 0x8a1a10, p: [0.55, 0.6, s * 0.1] }); k.add('head', G.sphere(0.05, 8, 6), { c: 0x1a0a0a, p: [0.55, 0.69, s * 0.1] });
    k.add('head', G.tube([[0.55, 0.52, s * 0.08], [0.85, 0.75, s * 0.2], [1.1, 0.7, s * 0.3]], 0.008, 10, 4), { c: 0xb8201a });            // antennae
    k.add('head', G.limb([0.4, 0.4, s * 0.22], [0.65, 0.35, s * 0.42], 0.05), { c: 0xb8201a });
    k.add('head', G.sphere(0.15, 12, 10), { c: PEP_R, p: [0.78, 0.36, s * 0.46], s: [1.3, 0.7, 0.8] });                                   // pepper-half claws
    k.add('head', G.sphere(0.1, 10, 8), { c: 0xff5a3a, p: [0.92, 0.36, s * 0.38], s: [1.2, 0.5, 0.6] });
  }
  return k;
}

// ------------------------------------------------------------------ Mushroom Grounds
// a mushroom cap (dome) with spots, centred at c, radius R
export function mushCap(k, part, c, R, col, spot = 0xffffff, { glowSpots = false, flat = 0.55 } = {}) {
  k.add(part, G.sphere(R, 22, 12, ), { c: col, p: c, s: [1, flat, 1] });
  k.add(part, G.cyl(R * 0.98, R * 0.7, R * 0.12, 22), { c: 0xf2e6d0, p: [c[0], c[1] - R * 0.04, c[2]] });          // gills underneath
  for (let i = 0; i < 9; i++) { const t = (i + 0.5) / 9, y = 1 - t * 0.85, rr = Math.sqrt(1 - y * y), a = i * 2.39996;
    k.add(part, G.sphere(R * 0.13, 8, 6), { c: spot, p: [c[0] + Math.cos(a) * rr * R * 0.95, c[1] + y * R * flat * 0.95, c[2] + Math.sin(a) * rr * R * 0.95], s: [1, 0.5, 1], dir: [Math.cos(a) * rr, y, Math.sin(a) * rr], glow: glowSpots }); }
}
export function mushRammer() { // a stout spotted mushroom that lowers its cap and charges
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]);
  for (const s of [-1, 1]) k.add('body', G.capsule(0.13, 0.28, 4, 8), { c: 0xe8d8c0, p: [0.05, 0.22, s * 0.25] });
  k.add('body', G.lathe([[0, 0.35], [0.42, 0.38], [0.46, 0.7], [0.4, 1.05], [0, 1.1]], 20), { c: 0xf2e6d0 });      // stem body
  mushCap(k, 'body', [0.08, 1.34, 0], 0.85, 0xd92a2a, 0xffffff, { flat: 0.5 });
  redEyes(k, 'body', 0.44, 0.86, 0.14, 0.08); brows(k, 'body', 0.46, 1.0, 0.14); grin(k, 'body', 0.46, 0.6, 0.18, { color: 0x3a1a10 });
  return k;
}
export function mushHopper() { // a small purple toadstool that bounces about
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]);
  for (const s of [-1, 1]) k.add('body', G.sphere(0.12, 10, 8), { c: 0xe8d8c0, p: [0.05, 0.08, s * 0.16], s: [1.4, 0.6, 1] });
  k.add('body', G.lathe([[0, 0.1], [0.26, 0.12], [0.3, 0.4], [0.24, 0.62], [0, 0.66]], 18), { c: 0xf6ecdc });
  mushCap(k, 'body', [0, 0.76, 0], 0.55, 0x8a4ad0, 0xe8d8ff, { flat: 0.62 });
  redEyes(k, 'body', 0.28, 0.48, 0.1, 0.06); grin(k, 'body', 0.3, 0.3, 0.12, { color: 0x3a1a3a, teeth: 3 });
  return k;
}
export function mushBoss() { // the Mushroom Boss: a giant crowned mushroom with glowing spots and big stalk arms
  const k = new Kit();
  k.part('legL', 'root', [0, 0.7, -0.3]).part('legR', 'root', [0, 0.7, 0.3]).part('body', 'root', [0, 0.7, 0])
   .part('head', 'body', [0, 2.2, 0]).part('armL', 'body', [0, 1.7, -0.62]).part('armR', 'body', [0, 1.7, 0.62]);
  for (const [p, z] of [['legL', -0.3], ['legR', 0.3]]) { k.add(p, G.capsule(0.16, 0.45, 4, 10), { c: 0xe8d8c0, p: [0, 0.45, z] }); k.add(p, G.sphere(0.2, 10, 8), { c: 0xc8b090, p: [0.07, 0.1, z], s: [1.5, 0.6, 1.1] }); }
  k.add('body', G.lathe([[0, 0.7], [0.55, 0.75], [0.6, 1.3], [0.5, 1.9], [0, 2.0]], 22), { c: 0xf2e6d0 });
  mushCap(k, 'head', [0, 2.35, 0], 1.25, 0x6a2aa8, 0x9affe0, { glowSpots: true, flat: 0.5 });
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; k.add('head', G.cone(0.09, 0.3, 8), { c: 0xffc93c, p: [Math.cos(a) * 0.3, 3.05, Math.sin(a) * 0.3] }); }
  k.add('head', G.torus(0.33, 0.06, 8, 24), { c: 0xf0a82a, p: [0, 2.92, 0], r: [90, 0, 0] });
  redEyes(k, 'body', 0.56, 1.75, 0.18, 0.1); brows(k, 'body', 0.58, 1.9, 0.18); grin(k, 'body', 0.6, 1.35, 0.24, { color: 0x3a1a10, teeth: 5 });
  for (const [p, sd] of [['armL', -1], ['armR', 1]]) { k.add(p, G.limb([0, 1.7, sd * 0.62], [0.2, 1.0, sd * 0.9], 0.12), { c: 0xe8d8c0 }); mushCap(k, p, [0.22, 0.95, sd * 0.92], 0.24, 0x6a2aa8, 0x9affe0, { glowSpots: true }); }
  return k;
}
export function mushroomBunny() { // pet: a hopping bunny wearing a spotted mushroom cap
  const k = new Kit(); const hip = 0.3;
  k.part('body', 'root', [0, hip, 0]).part('head', 'body', [0.35, 0.6, 0]).part('tail', 'body', [-0.4, 0.45, 0]);
  for (const [n, x, s, back] of [['legFL', 0.25, -1, false], ['legFR', 0.25, 1, false], ['legBL', -0.22, -1, true], ['legBR', -0.22, 1, true]]) {
    const z = s * 0.16; k.part(n, 'root', [x, hip, z]);
    if (back) k.add(n, G.sphere(0.13, 10, 8), { c: 0xf6efe6, p: [x, 0.15, z], s: [1.6, 0.8, 0.8] }); else k.add(n, G.limb([x, hip, z], [x + 0.04, 0.04, z], 0.045), { c: 0xf6efe6 });
  }
  k.add('body', G.sphere(0.32, 18, 14), { c: 0xf6efe6, p: [0, 0.48, 0], s: [1.25, 0.9, 0.95] });
  k.add('tail', G.sphere(0.1, 10, 8), { c: 0xffffff, p: [-0.42, 0.5, 0] });
  k.add('head', G.sphere(0.22, 16, 12), { c: 0xf6efe6, p: [0.36, 0.72, 0] });
  for (const sd of [-1, 1]) { k.add('head', G.capsule(0.05, 0.28, 4, 8), { c: 0xf6efe6, p: [0.3, 1.02, sd * 0.09], r: [sd * -12, 0, -8] }); k.add('head', G.capsule(0.025, 0.2, 3, 6), { c: 0xffb8c8, p: [0.32, 1.02, sd * 0.09], r: [sd * -12, 0, -8] }); }
  mushCap(k, 'head', [0.33, 0.9, 0], 0.22, 0xd92a2a, 0xffffff, { flat: 0.6 });                 // the mushroom cap
  eyes(k, 'head', 0.53, 0.76, 0.09, 0.035);
  k.add('head', G.sphere(0.03, 6, 4), { c: 0xff8fa8, p: [0.58, 0.69, 0] });
  for (const sd of [-1, 1]) k.add('head', G.sphere(0.035, 6, 4), { c: 0xffb3c8, p: [0.52, 0.68, sd * 0.13], s: [0.4, 0.6, 1] });
  return k;
}

// ------------------------------------------------------------------ Quest 2 finale boss: the Veggie King (made of every veggie)
export function veggieKing() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.9, -0.3]).part('legR', 'root', [0, 0.9, 0.3]).part('body', 'root', [0, 0.9, 0])
   .part('head', 'body', [0, 2.3, 0]).part('armL', 'body', [0, 2.0, -0.7]).part('armR', 'body', [0, 2.0, 0.7]).part('weapon', 'armR', [0.2, 1.2, 0.85]);
  for (const [p, z] of [['legL', -0.3], ['legR', 0.3]]) { const g = G.capsule(0.17, 0.55, 6, 12); g.translate(0, 0.42, 0); k.add(p, g, { c: 0xffd84a, pat: PAT.dots, p: [0, 0.08, z] }); k.add(p, G.sphere(0.22, 10, 8), { c: 0x4a8a3a, p: [0.06, 0.1, z], s: [1.5, 0.6, 1.1] }); }  // corn-cob legs
  bellPepper(k, 'body', [0, 1.65, 0], 0.85, 0xe8301e);                                                         // bell-pepper body
  for (let i = 0; i < 9; i++) { const a = Math.PI * 0.55 + (i / 8) * Math.PI * 0.9; floret(k, 'body', [Math.cos(a) * 0.75 - 0.15, 1.2 + (i % 3) * 0.35, Math.sin(a) * 0.75], 0.28, 50 + i); } // broccoli cape
  k.add('body', G.cyl(0.88, 0.9, 0.12, 24), { c: 0xffc93c, p: [0, 1.25, 0] });
  k.add('head', G.sphere(0.6, 22, 16), { c: 0xe8312a, p: [0.05, 2.75, 0], s: [1, 0.86, 1] });                // tomato head
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; k.add('head', G.sphere(0.14, 8, 6), { c: 0x4f9a3a, p: [0.05 + Math.cos(a) * 0.14, 3.24, Math.sin(a) * 0.14], s: [1.8, 0.3, 0.6], r: [0, (-a * 180) / Math.PI, 0] }); }
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; k.add('head', G.cone(0.1, 0.4, 8), { c: 0xffc93c, p: [0.05 + Math.cos(a) * 0.38, 3.45, Math.sin(a) * 0.38] }); }
  k.add('head', G.torus(0.4, 0.08, 8, 28), { c: 0xf0a82a, p: [0.05, 3.25, 0], r: [90, 0, 0] });
  k.add('head', G.sphere(0.08, 10, 8), { c: 0x7a3ad0, p: [0.47, 3.3, 0], glow: true });
  redEyes(k, 'head', 0.58, 2.85, 0.2, 0.11); brows(k, 'head', 0.6, 3.0, 0.2); grin(k, 'head', 0.62, 2.55, 0.26, { color: 0x4a0a0a, teeth: 6 });
  for (const [p, sd] of [['armL', -1], ['armR', 1]]) { const g = G.cone(0.2, 1.1, 14); g.translate(0, 0.55, 0); k.add(p, g, { c: 0xff8a2b, p: [0, 2.0, sd * 0.72], dir: [0.3, -1, sd * 0.25] }); }  // carrot arms
  const st = G.cyl(0.06, 0.06, 2.6, 8); st.translate(0, 1.3, 0); k.add('weapon', st, { c: 0x8a5a2a, p: [0.25, 0.3, 0.88] });                    // sceptre
  k.add('weapon', G.sphere(0.22, 14, 10), { c: 0x7a3ad0, p: [0.25, 3.0, 0.88], glow: true });
  return k;
}

export const CATALOG4 = {
  veggie_king: { build: veggieKing, rig: 'biped', h: 3.7, r: 0.95, scale: 1.5 },
  mush_rammer: { build: mushRammer, rig: 'blob', h: 1.6, r: 0.8, lunge: 1.8 },
  mush_hopper: { build: mushHopper, rig: 'blob', h: 1.1, r: 0.5, hop: 2.4 },
  mush_boss: { build: mushBoss, rig: 'biped', h: 3.2, r: 0.9, scale: 1.4 },
  mushroom_bunny: { build: mushroomBunny, rig: 'frog', h: 1.1, r: 0.45 },
  pepper_swinger: { build: pepperSwinger, rig: 'pillar', h: 2.4, r: 0.85 },
  pepper_thrower: { build: pepperThrower, rig: 'biped', h: 2.3, r: 0.65 },
  pepper_wizard: { build: pepperWizard, rig: 'biped', h: 3.6, r: 0.7, scale: 1.4 },
  pepper_lobster: { build: pepperLobster, rig: 'bug', h: 0.9, r: 0.6 },
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
