// Candy Quest 2 cast — Broccoli Forest. Same conventions as models.js (forward = +X, up = +Y, right = +Z, metres).
import { Kit, G, THREE } from './kit.js';
import { eyes, redEyes, grin } from './models.js';

const STALK = 0x9cc86a, STALK_D = 0x7aa84c, FLORET = [0x2f7a3a, 0x3f8f45, 0x4a9e4c, 0x2a6a34];
const rng = (seed) => { let a = seed; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; };

// a broccoli floret dome: a crown of bumpy green clusters over centre c, radius R
export function floret(k, part, c, R, seed = 1, cols = FLORET) {
  const r = rng(seed);
  k.add(part, G.sphere(R * 0.78, 16, 12), { c: cols[0], p: [c[0], c[1], c[2]], s: [1, 0.72, 1] });
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.3, e = i % 3 === 0 ? 0.85 : 0.35 + r() * 0.3;
    const x = c[0] + Math.cos(a) * Math.cos(e) * R * 0.62, y = c[1] + Math.sin(e) * R * 0.42, z = c[2] + Math.sin(a) * Math.cos(e) * R * 0.62;
    const rr = R * (0.36 + r() * 0.1);
    k.add(part, G.sphere(rr, 10, 8), { c: cols[i % cols.length], p: [x, y, z] });
    for (let j = 0; j < 3; j++) k.add(part, G.sphere(rr * 0.42, 6, 4), { c: cols[(i + j + 1) % cols.length], p: [x + (r() - 0.5) * rr, y + rr * 0.55, z + (r() - 0.5) * rr] });
  }
  k.add(part, G.sphere(R * 0.42, 12, 10), { c: cols[2], p: [c[0], c[1] + R * 0.42, c[2]] });
}

// ------------------------------------------------------------------ Broc Brute: arms, legs, no eyes — just a mouth
export function brocBrute({ king = false } = {}) {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.85, -0.22]).part('legR', 'root', [0, 0.85, 0.22]).part('body', 'root', [0, 0.85, 0])
   .part('head', 'body', [0, 1.85, 0]).part('armL', 'body', [0, 1.6, -0.46]).part('armR', 'body', [0, 1.6, 0.46]);
  const cols = king ? [0x245c2c, 0x2f7036, 0x3a8240, 0x1d4e25] : FLORET;
  for (const [p, z] of [['legL', -0.22], ['legR', 0.22]]) {
    k.add(p, G.capsule(0.13, 0.5, 4, 10), { c: STALK, p: [0, 0.5, z] });
    k.add(p, G.sphere(0.17, 12, 10), { c: STALK_D, p: [0.07, 0.1, z], s: [1.5, 0.6, 1.1] });
  }
  // stalk trunk with ribbing
  k.add('body', G.cyl(0.36, 0.44, 1.1, 18), { c: STALK, p: [0, 1.35, 0] });
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; k.add('body', G.capsule(0.05, 0.8, 3, 6), { c: STALK_D, p: [Math.cos(a) * 0.38, 1.35, Math.sin(a) * 0.38] }); }
  // the mouth — the only feature on its face
  k.add('body', G.sphere(1, 20, 10), { c: 0x2a0f14, p: [0.38, 1.42, 0], s: [0.1, 0.17, 0.3] });
  for (let i = 0; i < 5; i++) { const z = -0.22 + i * 0.11; k.add('body', G.cone(0.045, 0.1, 5), { c: 0xfff6e0, p: [0.44, 1.55, z], r: [180, 0, 0] }); k.add('body', G.cone(0.04, 0.09, 5), { c: 0xfff6e0, p: [0.44, 1.29, z + 0.05] }); }
  k.add('body', G.sphere(0.1, 10, 8), { c: 0xd9485a, p: [0.4, 1.34, 0], s: [0.6, 0.4, 1] });
  floret(k, 'head', [0, 2.2, 0], king ? 0.95 : 0.8, king ? 7 : 3, cols);
  if (king) {
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; k.add('head', G.cone(0.08, 0.28, 8), { c: 0xffc93c, p: [Math.cos(a) * 0.3, 2.92, Math.sin(a) * 0.3] }); }
    k.add('head', G.torus(0.32, 0.06, 8, 24), { c: 0xf0a82a, p: [0, 2.8, 0], r: [90, 0, 0] });
  }
  for (const [p, s] of [['armL', -1], ['armR', 1]]) {
    k.add(p, G.limb([0, 1.62, s * 0.46], [0.15, 1.05, s * 0.66], 0.1), { c: STALK });
    floret(k, p, [0.17, 0.98, s * 0.68], 0.22, 11 + s, cols);
  }
  return k;
}

// ------------------------------------------------------------------ Broccoli Snake: slithers; floret crest along its back
export function brocSnake() {
  const k = new Kit(); const segs = [[-1.45, 0.11], [-1.05, 0.14], [-0.62, 0.17], [-0.18, 0.19], [0.25, 0.2]];
  segs.forEach(([x], i) => k.part('seg' + i, 'root', [x, 0.2, 0]));
  k.part('head', 'root', [0.62, 0.3, 0]);
  segs.forEach(([x, r], i) => {
    k.add('seg' + i, G.capsule(r, 0.3, 6, 12), { c: STALK, p: [x, r + 0.02, 0], r: [0, 0, 90] });
    k.add('seg' + i, G.sphere(r * 0.9, 10, 8), { c: 0xc9e6a4, p: [x, r * 0.35, 0], s: [1.6, 0.4, 0.9] });
    floret(k, 'seg' + i, [x, r * 2 + 0.05, 0], r * 0.9, 20 + i);
  });
  k.add('head', G.sphere(0.26, 18, 14), { c: STALK, p: [0.66, 0.3, 0], s: [1.35, 0.8, 1] });
  k.add('head', G.sphere(0.22, 14, 10), { c: 0x2a0f14, p: [0.86, 0.22, 0], s: [0.8, 0.28, 0.75] });
  for (const s of [-1, 1]) k.add('head', G.cone(0.03, 0.1, 5), { c: 0xfff6e0, p: [0.93, 0.21, s * 0.07], r: [180, 0, 0] });
  redEyes(k, 'head', 0.82, 0.42, 0.13, 0.06);
  floret(k, 'head', [0.55, 0.55, 0], 0.2, 31);
  k.add('head', G.capsule(0.012, 0.16, 2, 4), { c: 0xff5d8f, p: [1.08, 0.2, 0], r: [0, 0, 90] });
  return k;
}

// ------------------------------------------------------------------ Broccolotl: a broccoli axolotl (tameable healer)
export function broccolotl() {
  const k = new Kit(); const hip = 0.3;
  k.part('body', 'root', [0, hip, 0]).part('head', 'body', [0.5, 0.45, 0]).part('tail', 'body', [-0.5, 0.4, 0]);
  for (const [n, x, s] of [['legFL', 0.35, -1], ['legFR', 0.35, 1], ['legBL', -0.35, -1], ['legBR', -0.35, 1]]) {
    const z = s * 0.26; k.part(n, 'root', [x, hip, z]);
    k.add(n, G.limb([x, hip, z], [x + 0.04, 0.05, z + s * 0.12], 0.06), { c: STALK });
    for (const d of [-0.04, 0, 0.04]) k.add(n, G.sphere(0.03, 6, 4), { c: 0xffb3c8, p: [x + 0.08, 0.03, z + s * 0.12 + d] });
  }
  k.add('body', G.capsule(0.28, 0.6, 6, 16), { c: 0xa8d87a, p: [0, 0.42, 0], r: [0, 0, 90], s: [1, 1, 0.95] });
  k.add('body', G.capsule(0.22, 0.55, 6, 12), { c: 0xd9f0c0, p: [0.02, 0.32, 0], r: [0, 0, 90], s: [1, 0.8, 0.9] });
  for (let i = 0; i < 4; i++) k.add('body', G.sphere(0.07, 8, 6), { c: FLORET[i % 4], p: [0.25 - i * 0.18, 0.7, 0] });
  k.add('head', G.sphere(0.3, 20, 16), { c: 0xa8d87a, p: [0.62, 0.5, 0], s: [1.05, 0.82, 1.25] });
  eyes(k, 'head', 0.86, 0.58, 0.17, 0.04);
  k.add('head', G.torus(0.11, 0.018, 6, 16, Math.PI), { c: 0x3d6b2a, p: [0.9, 0.44, 0], r: [0, 90, 180], s: [1, 0.6, 1] });
  for (const s of [-1, 1]) k.add('head', G.sphere(0.05, 8, 6), { c: 0xff9fb5, p: [0.84, 0.47, s * 0.26], s: [0.4, 0.6, 1] });
  // frilly gills: three stalks each side, each topped with a tiny broccoli floret
  for (const s of [-1, 1]) for (const [dy, dx] of [[0.22, 0.02], [0.08, -0.04], [-0.06, -0.02]]) {
    const base = [0.55, 0.5 + dy * 0.6, s * 0.3], tip = [0.5 + dx - 0.12, 0.62 + dy, s * 0.56];
    k.add('head', G.limb(base, tip, 0.025), { c: STALK });
    floret(k, 'head', tip, 0.11, 40 + dy * 100 + s);
  }
  const fin = new THREE.Shape(); fin.moveTo(0, 0.12); fin.quadraticCurveTo(-0.5, 0.18, -0.75, 0); fin.quadraticCurveTo(-0.5, -0.08, 0, -0.1); fin.closePath();
  k.add('tail', G.extrude(fin, 0.08, 0.03), { c: 0x8fc862, p: [-0.45, 0.45, 0] });
  return k;
}

// ------------------------------------------------------------------ Carrot Mountains
const CARROT = 0xff8a2b, CARROT_D = 0xe0661a, LEAF = [0x4fa83a, 0x6fc24f, 0x3d8f2e];
function carrot(k, part, base, len, r, dir = [0, -1, 0]) { // a tapered carrot with ridges, tip along dir from base
  const g = G.cone(r, len, 14); g.translate(0, len / 2, 0); // wide top at the base point, tip at +len along +Y (then pointed along dir)
  k.add(part, g, { c: CARROT, p: base, dir });
  for (let i = 1; i < 4; i++) { const t = G.torus(r * (1 - i / 4.5), r * 0.06, 6, 16); t.rotateX(Math.PI / 2); t.translate(0, len * (i / 4.5), 0); k.add(part, t, { c: CARROT_D, p: base, dir }); }
}
function leafTuft(k, part, c, n = 5, h = 0.5, seed = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + r(); const tip = [c[0] + Math.cos(a) * h * 0.4, c[1] + h * (0.8 + r() * 0.4), c[2] + Math.sin(a) * h * 0.4];
    k.add(part, G.limb(c, tip, h * 0.05), { c: LEAF[i % 3] }); k.add(part, G.sphere(h * 0.16, 8, 6), { c: LEAF[(i + 1) % 3], p: tip, s: [1, 0.5, 1] }); }
}
export function carrotSwordsman() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.8, -0.18]).part('legR', 'root', [0, 0.8, 0.18]).part('body', 'root', [0, 0.8, 0])
   .part('head', 'body', [0, 2.0, 0]).part('armL', 'body', [0, 1.75, -0.42]).part('armR', 'body', [0, 1.75, 0.42])
   .part('weapon', 'armR', [0.12, 1.15, 0.5]).part('shield', 'armL', [0.14, 1.25, -0.55]);
  for (const [p, z] of [['legL', -0.18], ['legR', 0.18]]) { k.add(p, G.capsule(0.08, 0.6, 4, 8), { c: 0x6fc24f, p: [0, 0.48, z] }); k.add(p, G.rbox(0.34, 0.14, 0.2, 0.06), { c: 0x6b4427, p: [0.06, 0.07, z] }); }
  carrot(k, 'body', [0, 2.15, 0], 1.45, 0.46);          // the carrot is its body, tip down
  k.add('body', G.cyl(0.47, 0.47, 0.12, 18), { c: 0x8a5a36, p: [0, 1.25, 0] });  // belt
  k.add('body', G.rbox(0.08, 0.1, 0.14, 0.02), { c: 0xffc93c, p: [0.46, 1.25, 0] });
  redEyes(k, 'head', 0.4, 1.95, 0.15, 0.08); brows(k, 'head', 0.43, 2.08, 0.15);
  grin(k, 'head', 0.44, 1.7, 0.18, { color: 0x6e2a0a });
  leafTuft(k, 'head', [0, 2.15, 0], 6, 0.7, 3);
  for (const [p, z] of [['armL', -0.45], ['armR', 0.45]]) k.add(p, G.limb([0, 1.75, z], [0.12, 1.15, z * 1.15], 0.07), { c: 0x6fc24f });
  k.add('weapon', G.rbox(0.06, 0.95, 0.14, 0.03), { c: 0xe3e8ef, p: [0.12, 1.75, 0.5] });
  k.add('weapon', G.cone(0.07, 0.18, 4), { c: 0xe3e8ef, p: [0.12, 2.3, 0.5], s: [0.45, 1, 1] });
  k.add('weapon', G.rbox(0.1, 0.07, 0.4, 0.03), { c: 0xffc93c, p: [0.12, 1.24, 0.5] });
  k.add('shield', G.cyl(0.34, 0.34, 0.07, 28), { c: CARROT, p: [0.16, 1.3, -0.62], r: [90, 0, 0] });
  for (let i = 1; i < 3; i++) k.add('shield', G.torus(0.34 * i / 3, 0.02, 6, 20), { c: 0xffc27a, p: [0.16, 1.3, -0.665] });
  return k;
}
function brows(k, part, x, y, z) { for (const s of [-1, 1]) k.add(part, G.rbox(0.05, 0.05, 0.2, 0.02), { c: 0x6e2a0a, p: [x, y, s * z], r: [s * -18, 0, 0] }); }
export function carrotChopper({ king = false } = {}) {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]).part('armL', 'body', [0.05, 2.0, -0.72]).part('armR', 'body', [0.05, 2.0, 0.72]);
  for (const s of [-1, 1]) k.add('body', G.capsule(0.16, 0.35, 4, 10), { c: 0x6fc24f, p: [0.05, 0.3, s * 0.3] });
  // squat carrot body (tip down, wide top) with a big leafy crown
  carrot(k, 'body', [0, 2.35, 0], 1.95, 0.78);
  redEyes(k, 'body', 0.66, 1.95, 0.22, 0.11); brows(k, 'body', 0.7, 2.12, 0.22);
  grin(k, 'body', 0.62, 1.55, 0.28, { color: 0x6e2a0a, teeth: 5 });
  leafTuft(k, 'body', [0, 2.35, 0], 8, 1.0, 5);
  if (king) { for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; k.add('body', G.cone(0.1, 0.34, 8), { c: 0xffc93c, p: [Math.cos(a) * 0.45, 2.6, Math.sin(a) * 0.45] }); } k.add('body', G.torus(0.48, 0.07, 8, 28), { c: 0xf0a82a, p: [0, 2.44, 0], r: [90, 0, 0] }); }
  // two big carrot arms that chop: hanging forward-down from the shoulders at rest
  for (const [p, s] of [['armL', -1], ['armR', 1]]) {
    k.add(p, G.sphere(0.24, 14, 10), { c: CARROT_D, p: [0.05, 2.0, s * 0.72] });
    carrot(k, p, [0.05, 2.0, s * 0.72], 1.6, 0.3, [0.35, -1, s * 0.12]);
  }
  return k;
}
export function carrotPorcupine() {
  const k = new Kit(); const hip = 0.34;
  k.part('body', 'root', [0, hip, 0]).part('head', 'body', [0.55, 0.45, 0]).part('tail', 'body', [-0.55, 0.4, 0]);
  for (const [n, x, s] of [['legFL', 0.32, -1], ['legFR', 0.32, 1], ['legBL', -0.32, -1], ['legBR', -0.32, 1]]) {
    const z = s * 0.26; k.part(n, 'root', [x, hip, z]); k.add(n, G.limb([x, hip, z], [x + 0.03, 0.05, z + s * 0.05], 0.065), { c: 0x8a5a36 });
    k.add(n, G.sphere(0.08, 8, 6), { c: 0x6b4427, p: [x + 0.05, 0.05, z + s * 0.05], s: [1.3, 0.6, 1] });
  }
  k.add('body', G.sphere(0.5, 22, 16), { c: 0xc98a5a, p: [0, 0.6, 0], s: [1.25, 0.82, 0.95] });
  // quills: baby carrots with green tips, sprouting from its back
  const r = rng(12);
  for (let i = 0; i < 22; i++) {
    const t = (i + 0.5) / 22, y = 1 - t * 1.1, rr = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.39996;
    const nx = Math.cos(a) * rr, nz = Math.sin(a) * rr; if (nx > 0.55 || y < 0.05) continue;
    const base = [nx * 0.55, 0.6 + y * 0.38, nz * 0.45], dir = [nx * 0.8 - 0.25, y + 0.3, nz * 0.8], L = 0.36 + r() * 0.12;
    const d = new THREE.Vector3(...dir).normalize();
    const g = G.cone(0.055, L, 8); g.translate(0, L / 2, 0); k.add('body', g, { c: CARROT, p: base, dir: [d.x, d.y, d.z] });
    k.add('body', G.sphere(0.035, 6, 4), { c: 0x6fc24f, p: [base[0] - d.x * 0.03, base[1] - d.y * 0.03, base[2] - d.z * 0.03] });
  }
  k.add('head', G.sphere(0.27, 18, 14), { c: 0xe0b089, p: [0.68, 0.55, 0], s: [1.25, 0.95, 1] });
  k.add('head', G.sphere(0.06, 8, 6), { c: 0x3a2233, p: [0.99, 0.55, 0] });
  eyes(k, 'head', 0.86, 0.66, 0.12, 0.045);
  for (const s of [-1, 1]) { k.add('head', G.sphere(0.07, 8, 6), { c: 0xc98a5a, p: [0.6, 0.8, s * 0.17], s: [0.6, 1, 0.5] }); k.add('head', G.sphere(0.04, 8, 6), { c: 0xff9fb5, p: [0.9, 0.52, s * 0.18], s: [0.4, 0.6, 1] }); }
  return k;
}

// ------------------------------------------------------------------ Cabbage Boulder Pass
const CAB = [0x8fcf6a, 0x6fb24f, 0xb7e08f, 0x5a9a42];
function cabbageBall(k, part, c, R, seed = 1) { // layered leaves around a pale core, with veins
  const r = rng(seed);
  k.add(part, G.sphere(R * 0.9, 20, 16), { c: 0xd8f0b8, p: c });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + r() * 0.4, e = -0.3 + r() * 0.9, d = new THREE.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e));
    k.add(part, G.sphere(R * 0.62, 14, 10), { c: CAB[i % 4], p: [c[0] + d.x * R * 0.42, c[1] + d.y * R * 0.42, c[2] + d.z * R * 0.42], s: [1, 1, 0.55], dir: [d.x, d.y, d.z] });
    k.add(part, G.capsule(R * 0.025, R * 0.5, 2, 4), { c: 0xeaf8d6, p: [c[0] + d.x * R * 0.72, c[1] + d.y * R * 0.72, c[2] + d.z * R * 0.72], dir: [d.x, d.y, d.z] });
  }
}
export function cabbageRoller({ king = false } = {}) {
  const k = new Kit(); const R = 0.75;
  k.part('body', 'root', [0, R, 0]).part('shell', 'body', [0, R, 0]).part('face', 'body', [0, R, 0]);
  cabbageBall(k, 'shell', [0, R, 0], R, king ? 9 : 4);                 // this part rolls
  redEyes(k, 'face', R * 0.86, R + 0.18, 0.2, 0.1); brows(k, 'face', R * 0.9, R + 0.33, 0.2);  // this part stays upright
  grin(k, 'face', R * 0.9, R - 0.2, 0.28, { color: 0x2a3a14, teeth: 5 });
  if (king) { for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; k.add('face', G.cone(0.09, 0.3, 8), { c: 0xffc93c, p: [Math.cos(a) * 0.32, R * 2 + 0.12, Math.sin(a) * 0.32] }); } k.add('face', G.torus(0.34, 0.06, 8, 24), { c: 0xf0a82a, p: [0, R * 2, 0], r: [90, 0, 0] }); }
  return k;
}
export function cabbageLobber() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.7, -0.2]).part('legR', 'root', [0, 0.7, 0.2]).part('body', 'root', [0, 0.7, 0])
   .part('head', 'body', [0, 1.55, 0]).part('armL', 'body', [0, 1.35, -0.42]).part('armR', 'body', [0, 1.35, 0.42]).part('weapon', 'armR', [0.1, 0.8, 0.5]);
  for (const [p, z] of [['legL', -0.2], ['legR', 0.2]]) { k.add(p, G.capsule(0.1, 0.4, 4, 8), { c: 0xd8f0b8, p: [0, 0.42, z] }); k.add(p, G.sphere(0.14, 10, 8), { c: 0x5a9a42, p: [0.05, 0.08, z], s: [1.4, 0.6, 1] }); }
  k.add('body', G.cyl(0.3, 0.38, 0.85, 14), { c: 0xd8f0b8, p: [0, 1.1, 0] });   // a pale cabbage-core stump
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; k.add('body', G.sphere(0.3, 10, 8), { c: CAB[i % 4], p: [Math.cos(a) * 0.3, 0.85, Math.sin(a) * 0.3], s: [0.6, 1.1, 0.35], dir: [Math.cos(a), 0.4, Math.sin(a)] }); }
  cabbageBall(k, 'head', [0.02, 1.95, 0], 0.5, 7);
  redEyes(k, 'head', 0.46, 2.0, 0.15, 0.08); grin(k, 'head', 0.48, 1.8, 0.16, { color: 0x2a3a14 });
  for (const [p, z] of [['armL', -0.45], ['armR', 0.45]]) k.add(p, G.limb([0, 1.35, z], [0.1, 0.85, z * 1.1], 0.08), { c: 0xb7e08f });
  cabbageBall(k, 'weapon', [0.14, 0.72, 0.5], 0.2, 13);   // the cabbage it's about to lob
  return k;
}
export function cabbageArmadillo() {
  const k = new Kit(); const hip = 0.3;
  k.part('body', 'root', [0, hip, 0]).part('head', 'body', [0.55, 0.4, 0]).part('tail', 'body', [-0.6, 0.35, 0]);
  for (const [n, x, s] of [['legFL', 0.32, -1], ['legFR', 0.32, 1], ['legBL', -0.32, -1], ['legBR', -0.32, 1]]) {
    const z = s * 0.24; k.part(n, 'root', [x, hip, z]); k.add(n, G.limb([x, hip, z], [x + 0.03, 0.05, z], 0.07), { c: 0xc9a88a });
    k.add(n, G.sphere(0.08, 8, 6), { c: 0x8a6a4e, p: [x + 0.05, 0.05, z], s: [1.3, 0.6, 1] });
  }
  k.add('body', G.sphere(0.46, 18, 14), { c: 0xe8cdb0, p: [0, 0.45, 0], s: [1.35, 0.72, 0.9] });
  // armour: overlapping arched cabbage-leaf bands, each with a pale vein
  for (let i = 0; i < 6; i++) {
    const x = 0.42 - i * 0.17, band = G.sphere(0.5, 22, 12, ); band.scale(1, 1, 1);
    k.add('body', G.sphere(0.5, 22, 10), { c: CAB[i % 4], p: [x, 0.52, 0], s: [0.26, 0.82, 1.02] });
    k.add('body', G.capsule(0.018, 0.5, 2, 4), { c: 0xeaf8d6, p: [x + 0.06, 0.8, 0], r: [90, 0, 0] });
  }
  k.add('head', G.sphere(0.2, 16, 12), { c: 0xe8cdb0, p: [0.68, 0.45, 0], s: [1.5, 0.9, 0.95] });
  k.add('head', G.sphere(0.04, 8, 6), { c: 0x3a2233, p: [0.97, 0.42, 0] });
  eyes(k, 'head', 0.76, 0.52, 0.1, 0.035);
  for (const s of [-1, 1]) k.add('head', G.sphere(0.07, 8, 6), { c: 0x8fcf6a, p: [0.6, 0.64, s * 0.12], s: [0.5, 1.3, 0.5] });
  k.add('tail', G.cone(0.08, 0.5, 10), { c: 0x6fb24f, p: [-0.8, 0.3, 0], r: [0, 0, 100] });
  return k;
}

export const CATALOG3 = {
  cabbage_roller: { build: () => cabbageRoller(), rig: 'roller', h: 1.6, r: 0.8, rollR: 0.75 },
  cabbage_king: { build: () => cabbageRoller({ king: true }), rig: 'roller', h: 1.6, r: 0.8, rollR: 0.75, scale: 1.8 },
  cabbage_lobber: { build: cabbageLobber, rig: 'biped', h: 2.5, r: 0.6 },
  cabbage_armadillo: { build: cabbageArmadillo, rig: 'quad', h: 1.0, r: 0.65 },
  carrot_sword: { build: carrotSwordsman, rig: 'biped', h: 2.8, r: 0.6 },
  carrot_chopper: { build: () => carrotChopper(), rig: 'chopper', h: 3.1, r: 0.9 },
  chopper_king: { build: () => carrotChopper({ king: true }), rig: 'chopper', h: 3.1, r: 0.9, scale: 1.5 },
  carrot_porcupine: { build: carrotPorcupine, rig: 'quad', h: 1.1, r: 0.62 },
  broc_brute: { build: () => brocBrute(), rig: 'biped', h: 3.0, r: 0.75 },
  broc_king: { build: () => brocBrute({ king: true }), rig: 'biped', h: 3.2, r: 0.8, scale: 1.5 },
  broc_snake: { build: brocSnake, rig: 'slither', h: 0.9, r: 0.7, stride: 1.2 },
  broccoli_axolotl: { build: broccolotl, rig: 'quad', h: 1.0, r: 0.62 },
};
