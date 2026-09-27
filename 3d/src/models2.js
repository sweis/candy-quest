// Cast for levels 2–10 (+ the unused Prickletreat pet). Same conventions as models.js: forward = +X, up = +Y,
// right = +Z, metres, parts named for the rig that animates them (see anim.js).
import { Kit, G, PAT, THREE } from './kit.js';
import { eyes, redEyes, grin, blob } from './models.js';

const W = 0xffffff, INK = 0x2a1a26;
const NERDS = [0xff5d8f, 0xffe94a, 0x5ab8ff, 0x7ce26a, 0xc77dff, 0xffb02e];

// cones sprouting from an ellipsoid's surface along its normals (spikes, quills, crystals)
function spikes(k, part, c, rad, n, { color = W, pat = null, len = 0.4, w = 0.1, seg = 6, minY = 0.15, maxX = 1, glow = false, jitter = 0 } = {}, r = Math.random) {
  let placed = 0;
  for (let i = 0; i < n * 6 && placed < n; i++) {
    const t = (i + 0.5) / (n * 6), y = 1 - t * 2, rr = Math.sqrt(1 - y * y), a = i * 2.39996;
    const nx = Math.cos(a) * rr, nz = Math.sin(a) * rr;
    if (y < minY || nx > maxX) continue;
    const nrm = new THREE.Vector3(nx / rad[0], y / rad[1], nz / rad[2]).normalize();
    const L = len * (1 + (r() - 0.5) * jitter);
    const p = [c[0] + nx * rad[0] * 0.92 + nrm.x * L * 0.45, c[1] + y * rad[1] * 0.92 + nrm.y * L * 0.45, c[2] + nz * rad[2] * 0.92 + nrm.z * L * 0.45];
    k.add(part, G.cone(w, L, seg), { c: color, pat, dir: [nrm.x, nrm.y, nrm.z], p, glow });
    placed++;
  }
}
function brows(k, part, x, y, z, w, color) { for (const s of [-1, 1]) k.add(part, G.rbox(0.05, 0.05, w, 0.02), { c: color, p: [x, y, s * z], r: [s * -18, 0, 0] }); }
const rng = (seed) => { let a = seed; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; };

// ------------------------------------------------------------------ L2 · Rock Candy Caves
export function spikeBlob() {
  const k = blob({ body: 0x3a8aa8, dark: 0x1a4660, sheen: 0xaee0ee });
  spikes(k, 'body', [-0.05, 0.5, 0], [0.56, 0.44, 0.56], 9, { color: 0xcdeede, len: 0.42, w: 0.1, maxX: 0.55, minY: 0.2 }, rng(3));
  k.add('body', G.oct(0.12), { c: 0xd6fff4, p: [0.35, 0.3, 0.4] });
  return k;
}
export function crystalWidow() {
  const k = new Kit(); k.part('body', 'root', [0, 1.0, 0]).part('legL', 'root', [0.1, 1.1, -0.4]).part('legR', 'root', [0.1, 1.1, 0.4]).part('head', 'body', [0.5, 1.0, 0]);
  k.add('body', G.sphere(1.0, 26, 20), { c: 0x2a5e7c, p: [-0.75, 1.4, 0], s: [1.2, 0.85, 1] });
  k.add('body', G.sphere(0.6, 12, 8), { c: 0x6f9fb8, p: [-0.6, 1.6, 0.5], s: [0.8, 0.5, 0.4] });
  spikes(k, 'body', [-0.75, 1.4, 0], [1.2, 0.85, 1], 8, { color: 0xd6fff4, len: 0.8, w: 0.17, minY: 0.35 }, rng(5));
  k.add('head', G.sphere(0.6, 22, 16), { c: 0x234f6a, p: [0.55, 1.05, 0], s: [1, 0.85, 1] });
  for (const s of [-1, 1]) k.add('head', G.cone(0.08, 0.34, 6), { c: 0xeafcff, p: [1.0, 0.62, s * 0.16], r: [0, 0, 190] });
  for (const [y, z, rr] of [[1.28, 0.1, 0.07], [1.32, 0.24, 0.06], [1.15, 0.2, 0.05]]) for (const s of [-1, 1]) k.add('head', G.sphere(rr, 10, 8), { c: 0xff2b3d, p: [1.06 - z * 0.3, y, s * z], glow: true });
  for (const [p, s] of [['legL', -1], ['legR', 1]]) for (const x of [0.5, 0.05, -0.4]) {
    const base = [x, 1.1, s * 0.45], knee = [x * 1.4 + 0.05, 1.95, s * 1.35], foot = [x * 1.9, 0.02, s * 1.95];
    k.add(p, G.limb(base, knee, 0.085), { c: 0x6f4fd8 });
    k.add(p, G.limb(knee, foot, 0.07), { c: 0x8f78e8 });
    k.add(p, G.oct(0.12), { c: 0xd6fff4, p: knee });
  }
  return k;
}
export function geodeJay() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.6, -0.12]).part('legR', 'root', [0, 0.6, 0.12]).part('body', 'root', [0, 0.6, 0])
   .part('head', 'body', [0.35, 1.3, 0]).part('wingL', 'body', [0, 1.1, -0.4]).part('wingR', 'body', [0, 1.1, 0.4]);
  for (const [p, z] of [['legL', -0.12], ['legR', 0.12]]) { k.add(p, G.cyl(0.025, 0.025, 0.56, 6), { c: 0x2f8a76, p: [0, 0.32, z] }); k.add(p, G.capsule(0.02, 0.1, 2, 4), { c: 0x2f8a76, p: [0.06, 0.04, z], r: [0, 0, 90] }); }
  k.add('body', G.ico(0.5, 0), { c: 0x46b9a1, p: [0, 1.0, 0], s: [1.3, 1, 1] });
  k.add('body', G.ico(0.34, 0), { c: 0x7c5cf0, p: [0.25, 0.92, 0], s: [1, 1.1, 1] });
  k.add('body', G.cone(0.28, 0.8, 4), { c: 0xa98cff, p: [-0.75, 1.15, 0], r: [0, 0, 100], s: [1, 1, 0.5] });
  k.add('head', G.ico(0.3, 0), { c: 0xa98cff, p: [0.5, 1.45, 0] });
  k.add('head', G.cone(0.08, 0.26, 4), { c: 0xffa53c, p: [0.85, 1.42, 0], r: [0, 0, -90] });
  k.add('head', G.cone(0.1, 0.3, 4), { c: 0xd6fff4, p: [0.42, 1.8, 0], r: [0, 0, 20] });
  eyes(k, 'head', 0.72, 1.52, 0.12, 0.045);
  for (const [p, s] of [['wingL', -1], ['wingR', 1]]) k.add(p, G.ico(0.34, 0), { c: 0x2fa58a, p: [-0.1, 1.08, s * 0.45], s: [1.3, 0.8, 0.35] });
  k.add('body', G.oct(0.06), { c: W, p: [-0.2, 1.5, 0.3], glow: true });
  return k;
}
export function crystalSnapper() {
  const k = quadBase({ hip: 0.42, legs: [[0.5, 0.45], [-0.5, 0.45]], legR: 0.13, legColor: 0x46b9a1 });
  k.add('body', G.cyl(0.85, 0.9, 0.3, 14), { c: 0x46b9a1, p: [0, 0.55, 0] });
  k.add('body', G.ico(0.9, 1), { c: 0x7c5cf0, p: [0, 0.7, 0], s: [1.15, 0.7, 1] });
  for (const [x, z, h] of [[0, 0, 0.7], [-0.35, 0.3, 0.5], [0.3, -0.3, 0.55], [-0.3, -0.35, 0.45]]) { const g = G.cyl(0.1, 0.15, h, 6); g.translate(0, h / 2, 0); k.add('body', g, { c: 0xd6fff4, p: [x, 1.2, z], r: [z * 40, 0, -x * 40] }); }
  k.add('head', G.ico(0.3, 0), { c: 0x7ad9c4, p: [1.1, 0.65, 0], s: [1.2, 1, 1] });
  eyes(k, 'head', 1.33, 0.72, 0.12, 0.045);
  k.add('tail', G.cone(0.14, 0.5, 5), { c: 0xa98cff, p: [-1.1, 0.5, 0], r: [0, 0, 100] });
  return k;
}
// ------------------------------------------------------------------ L3 · Candy Corn Mountains
export function kernelCube() {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]);
  k.add('body', G.rbox(1.05, 0.95, 0.95, 0.18), { pat: PAT.cornBands, p: [0, 0.62, 0] });
  k.add('body', G.cone(0.2, 0.62, 12), { pat: PAT.cornBands, p: [0, 1.38, 0] });
  for (const s of [-1, 1]) k.add('body', G.rbox(0.3, 0.2, 0.26, 0.06), { c: 0xe07a1e, p: [0.05, 0.1, s * 0.28] });
  redEyes(k, 'body', 0.53, 0.72, 0.22, 0.1);
  brows(k, 'body', 0.54, 0.86, 0.22, 0.24, 0x7a3a00);
  grin(k, 'body', 0.53, 0.42, 0.24);
  return k;
}
export function cornLizard({ boss = false } = {}) {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.9, -0.2]).part('legR', 'root', [0, 0.9, 0.2]).part('body', 'root', [0, 0.9, 0])
   .part('head', 'body', [0.1, 1.9, 0]).part('armL', 'body', [0.05, 1.65, -0.38]).part('armR', 'body', [0.05, 1.65, 0.38])
   .part('weapon', 'armR', [0.2, 1.2, 0.45]).part('tail', 'body', [-0.3, 1.0, 0]);
  const skin = boss ? 0xe07a1e : 0xd8984a, belly = boss ? 0xffe6b0 : 0xf0d3a0, dark = boss ? 0xa5530c : 0x8a5316;
  for (const [p, z] of [['legL', -0.2], ['legR', 0.2]]) { k.add(p, G.capsule(0.13, 0.45, 4, 10), { c: skin, p: [0, 0.5, z] }); k.add(p, G.rbox(0.42, 0.14, 0.24, 0.06), { c: dark, p: [0.08, 0.07, z] }); }
  k.add('body', G.capsule(0.4, 0.55, 6, 16), { c: skin, p: [0, 1.4, 0] });
  k.add('body', G.sphere(0.3, 14, 10), { c: belly, p: [0.22, 1.35, 0], s: [0.6, 1.3, 0.9] });
  for (let i = 0; i < 5; i++) k.add('body', G.cone(0.1, 0.36, 6), { pat: PAT.cornBands, p: [-0.38, 1.1 + i * 0.2, 0], r: [0, 0, 60 - i * 5] });
  k.add('tail', G.tube([[-0.3, 1.0, 0], [-0.8, 0.7, 0.05], [-1.3, 0.3, -0.05], [-1.6, 0.12, 0]], 0.15, 20, 10), { c: skin });
  k.add('head', G.sphere(0.36, 18, 14), { c: skin, p: [0.12, 2.12, 0] });
  k.add('head', G.sphere(0.24, 14, 10), { c: skin, p: [0.45, 2.02, 0], s: [1.3, 0.75, 0.9] });
  k.add('head', G.sphere(0.03, 6, 4), { c: 0x5e3a1e, p: [0.74, 2.07, 0.07] });
  for (const [x, rz] of [[0.0, 20], [0.16, 0], [0.3, -18]]) k.add('head', G.cone(0.08, 0.28, 6), { pat: PAT.cornBands, p: [x - 0.05, 2.5, 0], r: [0, 0, rz] });
  if (boss) { redEyes(k, 'head', 0.38, 2.2, 0.14, 0.07); k.add('head', G.cyl(0.37, 0.37, 0.12, 20), { c: 0xa5530c, p: [0.1, 2.36, 0] }); }
  else k.add('head', G.sphere(0.07, 10, 8), { c: 0xff2b3d, p: [0.42, 2.2, 0.15], s: [0.6, 1, 1], glow: true });
  for (const [p, z] of [['armL', -0.42], ['armR', 0.42]]) k.add(p, G.capsule(0.1, 0.35, 4, 8), { c: skin, p: [0.1, 1.38, z] });
  k.add('weapon', G.cyl(0.045, 0.05, 3.0, 8), { c: 0x8a5316, p: [0.2, 1.6, 0.45] });
  k.add('weapon', G.cone(0.16, 0.5, 8), { pat: PAT.cornBands, p: [0.2, 3.35, 0.45] });
  return k;
}
export function kernelHog({ prickle = false } = {}) {
  const k = quadBase({ hip: 0.4, legs: [[0.4, 0.3], [-0.4, 0.3]], legR: 0.09, legColor: 0xc79a5d });
  const body = prickle ? 0xf0c98a : 0xf3dcb4;
  k.add('body', G.sphere(0.55, 22, 16), { c: body, p: [0, 0.62, 0], s: [1.3, 0.8, 0.95] });
  spikes(k, 'body', [-0.05, 0.62, 0], [0.72, 0.44, 0.52], prickle ? 14 : 18, { pat: PAT.cornBands, len: 0.45, w: 0.1, maxX: 0.45, minY: 0.05 }, rng(prickle ? 9 : 7));
  if (!prickle) for (const [x, z] of [[-0.2, 0.1], [0.0, -0.2], [-0.4, -0.15]]) k.add('body', G.sphere(0.09, 8, 6), { c: W, p: [x, 1.12, z], s: [1, 0.55, 1] });
  k.add('head', G.sphere(0.3, 16, 12), { c: body, p: [0.72, 0.6, 0], s: [1.3, 0.9, 0.9] });
  k.add('head', G.sphere(0.06, 8, 6), { c: prickle ? 0xe23d72 : 0x3a2233, p: [1.1, 0.6, 0] });
  eyes(k, 'head', 0.9, 0.72, 0.13, 0.04);
  k.add('head', G.sphere(0.09, 8, 6), { c: 0xdcb87f, p: [0.6, 0.86, 0.2], s: [0.6, 1, 0.5] });
  return k;
}
// ------------------------------------------------------------------ L4 · Gumdrop Grove
function gumdropAt(k, part, x, y, z, s, c, pat = PAT.dots) { k.add(part, G.lathe([[0, 0], [0.34, 0], [0.36, 0.08], [0.3, 0.38], [0.15, 0.58], [0, 0.62]].map(([a, b]) => [a * s, b * s]), 20), { c, pat, p: [x, y, z] }); }
export function evilGumdrop() {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]);
  for (const s of [-1, 1]) k.add('body', G.capsule(0.1, 0.12, 4, 8), { c: 0x8a1d5a, p: [0.05, 0.14, s * 0.22] });
  k.add('body', G.lathe([[0, 0.15], [0.6, 0.15], [0.64, 0.3], [0.52, 0.9], [0.28, 1.28], [0, 1.34]], 28), { c: 0xd61f7a, pat: PAT.dots });
  redEyes(k, 'body', 0.52, 0.85, 0.16, 0.09);
  brows(k, 'body', 0.55, 1.0, 0.16, 0.22, 0x5c0d34);
  grin(k, 'body', 0.6, 0.55, 0.22);
  return k;
}
export function gumdropBlob() {
  const k = blob({ body: 0xe2483d, dark: 0x7a1e46, sheen: 0xffb3a0, size: 1.1 });
  gumdropAt(k, 'body', 0.35, 0.3, 0.45, 0.45, 0xffd36e); gumdropAt(k, 'body', -0.2, 0.45, -0.5, 0.4, 0xa8ffcf); gumdropAt(k, 'body', -0.45, 0.25, 0.3, 0.35, 0x8fd4ff);
  return k;
}
export function gumLord() {
  const k = new Kit(); const skin = 0x8f45e0, light = 0xb57bff;
  k.part('legL', 'root', [0, 1.0, -0.26]).part('legR', 'root', [0, 1.0, 0.26]).part('body', 'root', [0, 1.0, 0])
   .part('head', 'body', [0, 2.1, 0]).part('armL', 'body', [0, 1.95, -0.62]).part('armR', 'body', [0, 1.95, 0.62]).part('weapon', 'armR', [0.1, 1.2, 0.7]);
  for (const [p, z] of [['legL', -0.26], ['legR', 0.26]]) { k.add(p, G.capsule(0.16, 0.55, 4, 10), { c: skin, p: [0, 0.55, z] }); k.add(p, G.rbox(0.45, 0.18, 0.3, 0.07), { c: 0x3a1568, p: [0.08, 0.09, z] }); }
  k.add('body', G.rbox(0.9, 1.1, 1.0, 0.3), { c: skin, pat: PAT.dots, p: [0, 1.55, 0] });
  const cs = [0xff9bd0, 0xa8ffcf, 0xffd36e, 0x8fd4ff, 0xff9bd0];
  for (const [y, z, s, i] of [[1.9, -0.35, 0.8, 0], [1.9, 0.35, 0.85, 1], [1.4, -0.45, 0.7, 2], [1.4, 0.45, 0.72, 3], [2.1, 0, 0.7, 4]]) gumdropAt(k, 'body', -0.5, y - 0.3, z, s, cs[i]);
  gumdropAt(k, 'body', 0.47, 1.12, 0, 0.45, 0xffd36e);
  k.add('head', G.sphere(0.42, 20, 16), { c: skin, pat: PAT.dots, p: [0.05, 2.45, 0] });
  gumdropAt(k, 'head', 0.05, 2.78, -0.2, 0.35, 0xff9bd0); gumdropAt(k, 'head', 0.05, 2.82, 0, 0.42, 0xffd36e); gumdropAt(k, 'head', 0.05, 2.78, 0.2, 0.35, 0xa8ffcf);
  redEyes(k, 'head', 0.4, 2.5, 0.14, 0.08); brows(k, 'head', 0.42, 2.63, 0.14, 0.18, 0x2a0d4e); grin(k, 'head', 0.44, 2.28, 0.18);
  for (const [p, z] of [['armL', -0.66], ['armR', 0.66]]) { k.add(p, G.capsule(0.15, 0.55, 4, 10), { c: light, p: [0.05, 1.5, z] }); gumdropAt(k, p, 0.05, 1.02, z, 0.55, light); }
  return k;
}
export function chompgum() {
  const k = quadBase({ hip: 0.36, legs: [[0.55, 0.35], [-0.5, 0.35]], legR: 0.12, legColor: 0x4ba83f });
  k.add('body', G.capsule(0.38, 1.3, 6, 16), { c: 0x7bd16a, p: [0, 0.55, 0], r: [0, 0, 90], s: [1, 1, 0.95] });
  k.add('body', G.capsule(0.3, 1.2, 6, 12), { c: 0xd2f0bf, p: [0.02, 0.42, 0], r: [0, 0, 90], s: [1, 1, 0.9] });
  for (let i = 0; i < 6; i++) k.add('body', G.cone(0.09, 0.22, 4), { c: 0x3d8a2f, p: [0.55 - i * 0.24, 0.95, 0] });
  k.add('tail', G.cone(0.3, 1.2, 12), { c: 0x7bd16a, p: [-1.4, 0.45, 0], r: [0, 0, 95], s: [1, 1, 0.7] });
  k.add('head', G.rbox(0.9, 0.24, 0.55, 0.1), { c: 0x7bd16a, p: [1.35, 0.62, 0] });
  k.add('head', G.rbox(0.85, 0.16, 0.5, 0.07), { c: 0x4ba83f, p: [1.33, 0.44, 0] });
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) k.add('head', G.cone(0.04, 0.1, 4), { c: W, p: [1.05 + i * 0.16, 0.52, s * 0.22], r: [180, 0, 0] });
  for (const s of [-1, 1]) { k.add('head', G.sphere(0.13, 12, 10), { c: 0xbdf0ab, p: [1.0, 0.8, s * 0.17] }); eyes(k, 'head', 1.1, 0.83, 0.17 * s, 0.05, { hi: true }); }
  return k;
}
// ------------------------------------------------------------------ L5 · Licorice Jungle
export function vinePillar() {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]).part('armL', 'body', [0.05, 2.5, -0.4]).part('armR', 'body', [0.05, 2.5, 0.4]).part('head', 'body', [0, 3.2, 0]);
  k.add('body', G.cyl(0.36, 0.44, 3.2, 16), { c: 0x6b9c47, p: [0, 1.6, 0] });
  for (const y of [0.8, 1.5, 2.2, 2.9]) k.add('body', G.torus(0.4, 0.07, 8, 20), { c: 0x25401b, p: [0, y, 0], r: [90, 0, 0] });
  k.add('head', G.sphere(0.55, 20, 16), { c: 0x4f7a34, p: [0, 3.45, 0], s: [1, 0.9, 1] });
  redEyes(k, 'head', 0.45, 3.55, 0.18, 0.1); grin(k, 'head', 0.52, 3.25, 0.2);
  for (const [p, s] of [['armL', -1], ['armR', 1]]) {
    k.add(p, G.tube([[0.05, 2.5, s * 0.4], [0.1, 2.0, s * 0.55], [0.12, 1.4, s * 0.6]], 0.11, 16, 10), { c: 0x5a8a3a, pat: PAT.licorice });
    k.add(p, G.sphere(0.22, 14, 10), { c: 0x8fbf5f, p: [0.12, 1.3, s * 0.6] });
  }
  return k;
}
export function tailBeast({ boss = false } = {}) {
  const skin = boss ? 0x5a2a8a : 0x3f6b2f, belly = boss ? 0xd79bff : 0xa8cf7f, plate = boss ? 0x6b3a8a : 0x2f4a22;
  const k = quadBase({ hip: 0.75, legs: [[0.55, 0.45], [-0.55, 0.45]], legR: 0.19, legColor: skin });
  k.add('body', G.sphere(0.85, 24, 18), { c: skin, p: [0, 1.15, 0], s: [1.4, 0.8, 0.9] });
  k.add('body', G.sphere(0.6, 16, 12), { c: belly, p: [0.2, 0.95, 0], s: [1.4, 0.6, 1.2] });
  for (let i = 0; i < 5; i++) k.add('body', G.cone(0.2, 0.42, 4), { c: plate, p: [0.6 - i * 0.3, 1.8, 0], s: [1, 1, 0.3] });
  k.add('head', G.sphere(0.5, 18, 14), { c: skin, p: [1.3, 1.45, 0], s: [1.2, 0.9, 0.9] });
  k.add('head', G.sphere(0.3, 14, 10), { c: skin, p: [1.75, 1.3, 0], s: [1.3, 0.7, 0.8] });
  grin(k, 'head', 1.95, 1.22, 0.18, { teeth: 5 });
  if (boss) { redEyes(k, 'head', 1.78, 1.62, 0.19, 0.09); brows(k, 'head', 1.8, 1.74, 0.19, 0.2, 0x2a0d4e); for (const s of [-1, 1]) k.add('head', G.cone(0.1, 0.4, 6), { c: 0x2a0d4e, p: [1.25, 1.95, s * 0.2], r: [s * -15, 0, -20] }); }
  else redEyes(k, 'head', 1.76, 1.62, 0.2, 0.085);
  k.add('tail', G.tube([[-1.0, 1.1, 0], [-1.7, 0.95, 0], [-2.4, 0.75, 0]], 0.26, 16, 10), { c: skin });
  k.add('tail', G.sphere(0.36, 16, 12), { c: 0x8fbf5f, p: [-2.6, 0.72, 0] });
  spikes(k, 'tail', [-2.6, 0.72, 0], [0.36, 0.36, 0.36], 7, { color: 0x211a24, len: 0.3, w: 0.08, minY: -0.8 }, rng(11));
  return k;
}
export function twizzleSerpent() {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]).part('neck', 'body', [0.3, 0.7, 0]).part('head', 'neck', [0.55, 1.6, 0]);
  k.add('body', G.torus(0.5, 0.2, 12, 30), { c: 0xd61f7a, pat: PAT.licorice, p: [0, 0.2, 0], r: [90, 0, 0] });
  k.add('body', G.torus(0.36, 0.18, 12, 26), { c: 0xff5d8f, pat: PAT.licorice, p: [0, 0.52, 0], r: [90, 0, 0] });
  k.add('neck', G.tube([[0.3, 0.6, 0], [0.4, 1.1, 0], [0.5, 1.45, 0], [0.55, 1.6, 0]], 0.16, 20, 10), { c: 0xd61f7a, pat: PAT.licorice });
  k.add('head', G.sphere(0.26, 18, 14), { c: 0x221a26, p: [0.72, 1.66, 0], s: [1.4, 0.8, 1] });
  for (const s of [-1, 1]) { k.add('head', G.sphere(0.06, 10, 8), { c: 0xffd24d, p: [0.82, 1.78, s * 0.12] }); k.add('head', G.sphere(0.03, 6, 4), { c: 0x151016, p: [0.86, 1.79, s * 0.12], s: [0.5, 1.4, 1] }); }
  k.add('head', G.capsule(0.015, 0.2, 2, 4), { c: 0xff5d8f, p: [1.1, 1.6, 0], r: [0, 0, 90] });
  for (const s of [-1, 1]) k.add('head', G.capsule(0.012, 0.07, 2, 4), { c: 0xff5d8f, p: [1.23, 1.6, s * 0.03], r: [s * 30, 0, 90] });
  return k;
}
// ------------------------------------------------------------------ L6 · Chocolate Forest
export function cocoaSquirter() {
  const k = blob({ body: 0x543014, dark: 0x3d2210, sheen: 0xc99356, size: 1.1 });
  k.add('body', G.cyl(0.2, 0.26, 0.5, 14), { c: 0x7a4a24, p: [0.72, 0.55, 0], r: [0, 0, -90] });
  k.add('body', G.cyl(0.13, 0.13, 0.02, 12), { c: 0x1c0e04, p: [0.98, 0.55, 0], r: [0, 0, -90] });
  brows(k, 'body', 0.55, 0.82, 0.18, 0.24, 0x331b0a);
  return k;
}
export function fudgebackBlob() {
  const k = blob({ body: 0x8a5a32, dark: 0x6b4427, sheen: 0xe8c896, size: 1.12 });
  for (const [x, z, rz, rx] of [[-0.35, -0.3, 25, -15], [-0.1, 0.05, 10, 5], [-0.4, 0.3, 30, 20], [0.1, -0.4, 5, -25]]) {
    k.add('body', G.rbox(0.5, 0.62, 0.12, 0.04), { c: 0x5e3a1e, p: [x, 1.0, z], r: [rx, 0, rz] });
    k.add('body', G.rbox(0.52, 0.04, 0.13, 0.01), { c: 0x3d2210, p: [x, 1.0, z], r: [rx, 0, rz] });
  }
  return k;
}
export function fudgeColossus() {
  const k = blob({ body: 0x6b4427, dark: 0x331b0a, sheen: 0xa8703f, size: 2.0 });
  for (const [x, y, z, rz] of [[0.95, 0.7, 0.4, -10], [0.9, 0.9, -0.5, 15], [0.4, 1.4, 0.8, 30]]) k.add('body', G.capsule(0.05, 0.5, 3, 6), { c: 0xffa040, p: [x, y, z], r: [60, 0, rz], glow: true });
  brows(k, 'body', 1.05, 1.45, 0.35, 0.45, 0x1c0e04);
  return k;
}
export function chocoGecko() {
  const k = quadBase({ hip: 0.28, legs: [[0.45, 0.4], [-0.45, 0.4]], legR: 0.08, legColor: 0x543014, splay: 0.35 });
  k.add('body', G.capsule(0.3, 0.95, 6, 14), { c: 0x7a4a24, p: [0, 0.42, 0], r: [0, 0, 90] });
  for (let i = 0; i < 4; i++) k.add('body', G.rbox(0.26, 0.1, 0.3, 0.04), { c: 0xd9a86e, p: [0.4 - i * 0.28, 0.72, 0] });
  k.add('head', G.sphere(0.3, 18, 14), { c: 0x7a4a24, p: [0.85, 0.55, 0], s: [1.2, 0.95, 1] });
  for (const s of [-1, 1]) { k.add('head', G.sphere(0.08, 10, 8), { c: W, p: [1.08, 0.66, s * 0.11] }); k.add('head', G.sphere(0.04, 8, 6), { c: INK, p: [1.14, 0.67, s * 0.11] }); }
  k.add('head', G.torus(0.07, 0.015, 6, 12, Math.PI), { c: 0x3d2210, p: [1.16, 0.46, 0], r: [0, 90, 180] });
  k.add('tail', G.torus(0.28, 0.1, 10, 24, Math.PI * 1.5), { c: 0x7a4a24, p: [-0.95, 0.55, 0] });
  return k;
}
// ------------------------------------------------------------------ L7 · Peppermint Ocean
export function peppermintLurker() {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]);
  k.add('body', G.sphere(0.72, 32, 22), { pat: PAT.mint, uv: 'x', p: [0, 0.8, 0] });
  for (const s of [-1, 1]) k.add('body', G.cyl(0.36, 0.36, 0.1, 28), { pat: PAT.mint, uv: 'y', p: [-0.05, 0.75, s * 0.78], r: [90, 0, 0] });
  for (const [z, rx] of [[-0.25, -22], [0, 0], [0.25, 22]]) k.add('body', G.cone(0.12, 0.4, 8), { c: 0xff4d63, p: [-0.1, 1.6, z], r: [rx, 0, 10] });
  redEyes(k, 'body', 0.64, 0.95, 0.18, 0.1); brows(k, 'body', 0.66, 1.1, 0.18, 0.24, 0xb02540); grin(k, 'body', 0.68, 0.62, 0.24, { color: 0x5a0a19 });
  return k;
}
export function peppermintLeviathan() {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]).part('neck', 'body', [0.8, 0.1, 0]).part('head', 'neck', [1.0, 2.8, 0]);
  k.add('body', G.torus(0.8, 0.34, 14, 30, Math.PI), { pat: PAT.caneWide, p: [-1.2, 0, 0] });
  k.add('body', G.torus(0.55, 0.3, 12, 26, Math.PI), { pat: PAT.caneWide, p: [-2.6, 0, 0.2] });
  k.add('body', G.torus(1.6, 0.14, 8, 36), { c: 0xd6f4ff, p: [-0.6, 0.02, 0], r: [90, 0, 0], s: [1.2, 0.8, 1] });
  for (const x of [-1.2, -2.6]) k.add('body', G.cone(0.2, 0.5, 4), { c: 0xe04355, p: [x, x === -1.2 ? 1.25 : 0.95, 0], s: [1, 1, 0.35] });
  k.add('neck', G.tube([[0.8, -0.2, 0], [0.8, 1.0, 0], [0.9, 2.1, 0], [1.0, 2.8, 0]], 0.42, 24, 14), { pat: PAT.caneDense });
  k.add('head', G.sphere(0.6, 24, 18), { pat: PAT.caneWide, p: [1.3, 3.05, 0], s: [1.35, 0.9, 1] });
  for (const [x, rz] of [[0.9, 20], [1.2, 0], [1.5, -20]]) k.add('head', G.cone(0.12, 0.42, 8), { c: 0xff4d63, p: [x, 3.6, 0], r: [0, 0, rz] });
  redEyes(k, 'head', 1.8, 3.2, 0.26, 0.11); brows(k, 'head', 1.82, 3.36, 0.26, 0.28, 0x8a1028); grin(k, 'head', 1.95, 2.85, 0.3, { color: 0x5a0a19, teeth: 6 });
  return k;
}
export function peppermintFish() {
  const k = new Kit(); k.part('body', 'root', [0, 0.9, 0]).part('tail', 'body', [-0.55, 0.9, 0]);
  k.add('body', G.sphere(0.5, 26, 18), { pat: PAT.stripesV, p: [0, 0.9, 0], s: [1.3, 0.85, 0.62] });
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(0.45, 0.2); fin.lineTo(0.3, -0.05); fin.closePath();
  k.add('body', G.extrude(fin, 0.04, 0.015), { c: 0xff4d63, p: [-0.15, 1.28, 0] });
  k.add('body', G.extrude(fin, 0.03, 0.01), { c: 0xff8fa0, p: [0.1, 0.72, 0.3], r: [0, 30, 180] });
  for (const s of [-1, 1]) { k.add('body', G.sphere(0.09, 10, 8), { c: W, p: [0.48, 1.0, s * 0.2] }); k.add('body', G.sphere(0.045, 8, 6), { c: INK, p: [0.55, 1.01, s * 0.22] }); }
  k.add('body', G.torus(0.06, 0.015, 6, 12, Math.PI), { c: 0xb02540, p: [0.63, 0.82, 0], r: [0, 90, 180] });
  const tail = new THREE.Shape(); tail.moveTo(0, 0); tail.lineTo(-0.5, 0.35); tail.lineTo(-0.35, 0); tail.lineTo(-0.5, -0.35); tail.closePath();
  k.add('tail', G.extrude(tail, 0.06, 0.02), { pat: PAT.stripesV, p: [-0.5, 0.9, 0] });
  for (const [x, y] of [[0.8, 1.35], [0.95, 1.6]]) k.add('body', G.sphere(0.05, 8, 6), { c: 0xd6f4ff, p: [x, y, 0], glow: true });
  return k;
}
// ------------------------------------------------------------------ L8 · Nerd Mines
function nerdsOn(k, part, c, rad, n, size, seed) { const r = rng(seed); for (let i = 0; i < n; i++) { const y = 1 - ((i + 0.5) / n) * 1.6, rr = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.4; k.add(part, G.sphere(size, 10, 8), { c: NERDS[i % 6], p: [c[0] + Math.cos(a) * rr * rad[0], c[1] + y * rad[1], c[2] + Math.sin(a) * rr * rad[2]], s: [1.2, 1, 1], r: [r() * 60, r() * 60, 0] }); } }
export function nerdBlob() { const k = blob({ body: 0x8a4fd0, dark: 0x5c2f96, sheen: 0xd9a8ff, size: 1.1 }); nerdsOn(k, 'body', [-0.05, 0.55, 0], [0.62, 0.48, 0.62], 16, 0.07, 3); brows(k, 'body', 0.56, 0.78, 0.19, 0.2, 0x3d1a6e); return k; }
export function nerdCluster() {
  const k = new Kit(); k.part('body', 'root', [0, 0, 0]);
  k.add('body', G.sphere(0.78, 28, 20), { c: 0xff5d8f, p: [0, 0.8, 0] });
  nerdsOn(k, 'body', [0, 0.8, 0], [0.8, 0.8, 0.8], 20, 0.1, 5);
  redEyes(k, 'body', 0.7, 1.0, 0.2, 0.1); brows(k, 'body', 0.72, 1.16, 0.2, 0.24, 0x8a1f4a);
  k.add('body', G.rbox(0.1, 0.18, 0.46, 0.04), { c: 0x8a1f4a, p: [0.74, 0.62, 0] });
  for (let i = 0; i < 4; i++) k.add('body', G.rbox(0.11, 0.06, 0.07, 0.01), { c: W, p: [0.78, 0.66, -0.15 + i * 0.1] });
  return k;
}
export function megaNerds() {
  const k = blob({ body: 0xff5d8f, dark: 0xb52a58, sheen: 0xffc4d6, size: 2.0 });
  for (const [x, y, z, s, c] of [[-0.6, 1.9, -0.6, 0.45, 0x5ab8ff], [-0.3, 2.1, 0.1, 0.5, 0x7ce26a], [-0.7, 1.8, 0.65, 0.42, 0xffe94a], [0.1, 1.95, -0.3, 0.38, 0xc77dff]]) k.add('body', G.sphere(s, 16, 12), { c, p: [x, y, z], s: [1.15, 1, 1] });
  nerdsOn(k, 'body', [-0.1, 1.0, 0], [1.2, 0.9, 1.2], 18, 0.13, 8);
  for (const s of [-1, 1]) k.add('body', G.capsule(0.28, 0.4, 4, 10), { c: 0xff5d8f, p: [0.3, 0.8, s * 1.25], r: [s * 35, 0, 0] });
  return k;
}
export function nerdWorm() {
  const k = new Kit(); const cols = [0xc77dff, 0x5ab8ff, 0x7ce26a, 0xffb02e];
  k.part('seg0', 'root', [-0.95, 0.3, 0]).part('seg1', 'root', [-0.55, 0.33, 0]).part('seg2', 'root', [-0.12, 0.35, 0]).part('seg3', 'root', [0.32, 0.36, 0]).part('head', 'root', [0.8, 0.45, 0]);
  [[-0.95, 0.28], [-0.55, 0.32], [-0.12, 0.35], [0.32, 0.36]].forEach(([x, r], i) => { k.add('seg' + i, G.sphere(r, 18, 14), { c: cols[i], p: [x, r, 0] }); k.add('seg' + i, G.sphere(r * 0.2, 8, 6), { c: NERDS[(i + 2) % 6], p: [x + r * 0.3, r * 1.75, r * 0.35] }); });
  k.add('head', G.sphere(0.4, 20, 16), { c: 0xff5d8f, p: [0.85, 0.5, 0] });
  for (const s of [-1, 1]) { k.add('head', G.capsule(0.03, 0.18, 2, 4), { c: 0xff8fb3, p: [0.75, 0.98, s * 0.12], r: [s * 15, 0, 10] }); k.add('head', G.sphere(0.05, 8, 6), { c: 0xffe94a, p: [0.74, 1.1, s * 0.15] }); }
  eyes(k, 'head', 1.18, 0.6, 0.13, 0.06, { color: INK });
  k.add('head', G.torus(0.07, 0.015, 6, 12, Math.PI), { c: 0x8a1f4a, p: [1.24, 0.43, 0], r: [0, 90, 180] });
  return k;
}
// ------------------------------------------------------------------ L9 · Candy Cane Dunes
function hook(k, part, base, h, r, flip = 1, tilt = [0, 0, 0]) { const [x, y, z] = base; const g = G.tube([[0, 0, 0], [0, h * 0.7, 0], [flip * 0.1, h, 0], [flip * h * 0.3, h * 1.06, 0], [flip * h * 0.42, h * 0.9, 0]], r, 30, 10); k.add(part, g, { pat: PAT.caneDense, p: [x, y, z], r: tilt }); }
export function caneBrawler() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.7, -0.25]).part('legR', 'root', [0, 0.7, 0.25]).part('body', 'root', [0, 0.7, 0]).part('head', 'body', [0, 2.2, 0])
   .part('armL', 'body', [0, 1.75, -0.6]).part('armR', 'body', [0, 1.75, 0.6]);
  for (const [p, z] of [['legL', -0.25], ['legR', 0.25]]) { k.add(p, G.cyl(0.14, 0.14, 0.6, 12), { pat: PAT.caneDense, p: [0, 0.4, z] }); k.add(p, G.rbox(0.36, 0.14, 0.24, 0.06), { c: 0xff4d63, p: [0.06, 0.07, z] }); }
  k.add('body', G.capsule(0.62, 0.8, 8, 20), { pat: PAT.cane, p: [0, 1.5, 0] });
  hook(k, 'head', [0, 2.3, 0], 0.55, 0.12, 1);
  redEyes(k, 'body', 0.56, 1.75, 0.2, 0.1); brows(k, 'body', 0.58, 1.92, 0.2, 0.24, 0xb02540); grin(k, 'body', 0.6, 1.42, 0.26, { color: 0x6e0f28 });
  for (const [p, s] of [['armL', -1], ['armR', 1]]) { k.add(p, G.limb([0, 1.75, s * 0.6], [0.2, 1.1, s * 0.85], 0.13), { pat: PAT.caneDense }); k.add(p, G.sphere(0.2, 12, 10), { c: 0xff4d63, p: [0.22, 1.02, s * 0.88] }); }
  return k;
}
export function caneStrider() {
  const k = quadBase({ hip: 1.1, legs: [[0.45, 0.45], [-0.45, 0.45]], legR: 0.07, legColor: 0xffffff, legPat: PAT.caneDense, foot: 0xff4d63 });
  k.add('body', G.sphere(0.62, 24, 16), { pat: PAT.cane, p: [0, 1.4, 0], s: [1.5, 0.75, 0.9] });
  for (const [z, rz] of [[-0.18, 20], [0.18, 20]]) k.add('head', G.cone(0.08, 0.36, 8), { c: 0xff4d63, p: [0.65, 1.95, z], r: [0, 0, rz] });
  k.add('head', G.sphere(0.36, 16, 12), { pat: PAT.cane, p: [0.95, 1.55, 0] });
  redEyes(k, 'head', 1.22, 1.64, 0.13, 0.07); grin(k, 'head', 1.28, 1.42, 0.14, { color: 0x6e0f28 });
  hook(k, 'tail', [-0.85, 1.35, 0], 0.7, 0.1, -1, [0, 0, 40]);
  return k;
}
export function caneColossus() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.8, -0.45]).part('legR', 'root', [0, 0.8, 0.45]).part('body', 'root', [0, 0.8, 0]).part('head', 'body', [0, 3.0, 0])
   .part('armL', 'body', [0, 2.4, -1.0]).part('armR', 'body', [0, 2.4, 1.0]);
  for (const [p, z] of [['legL', -0.45], ['legR', 0.45]]) k.add(p, G.rbox(0.62, 0.8, 0.62, 0.2), { pat: PAT.caneDense, p: [0, 0.4, z] });
  k.add('body', G.rbox(1.9, 2.1, 1.7, 0.6), { pat: PAT.cane, p: [0, 1.9, 0] });
  hook(k, 'head', [0, 2.9, 0], 0.9, 0.22, 1);
  redEyes(k, 'body', 0.93, 2.3, 0.3, 0.13); brows(k, 'body', 0.95, 2.52, 0.3, 0.34, 0xb02540); grin(k, 'body', 0.96, 1.7, 0.4, { color: 0x6e0f28, teeth: 6 });
  for (const [p, s] of [['armL', -1], ['armR', 1]]) { k.add(p, G.limb([0, 2.4, s * 1.0], [0.3, 1.5, s * 1.25], 0.22), { pat: PAT.caneDense }); hook(k, p, [0.3, 1.5, s * 1.25], 0.6, 0.16, 1, [0, 0, 180]); }
  return k;
}
export function caneRoadrunner() {
  const k = new Kit();
  k.part('legL', 'root', [0, 0.7, -0.12]).part('legR', 'root', [0, 0.7, 0.12]).part('body', 'root', [0, 0.7, 0])
   .part('head', 'body', [0.45, 1.25, 0]).part('wingL', 'body', [0, 1.05, -0.35]).part('wingR', 'body', [0, 1.05, 0.35]);
  for (const [p, z] of [['legL', -0.12], ['legR', 0.12]]) { k.add(p, G.cyl(0.03, 0.03, 0.68, 6), { c: 0xffb02e, p: [0, 0.36, z] }); k.add(p, G.capsule(0.025, 0.14, 2, 4), { c: 0xe08a12, p: [0.07, 0.03, z], r: [0, 0, 90] }); }
  k.add('body', G.sphere(0.45, 24, 16), { pat: PAT.cane, p: [0, 1.0, 0], s: [1.4, 0.85, 0.85] });
  for (const [y, rz] of [[1.25, 115], [1.1, 100]]) k.add('body', G.capsule(0.07, 0.6, 4, 8), { pat: PAT.caneDense, p: [-0.75, y, 0], r: [0, 0, rz] });
  k.add('head', G.capsule(0.12, 0.35, 4, 10), { pat: PAT.caneDense, p: [0.5, 1.3, 0], r: [0, 0, -15] });
  k.add('head', G.sphere(0.25, 18, 14), { pat: PAT.cane, p: [0.62, 1.62, 0] });
  for (const [z, rz] of [[-0.05, 30], [0.05, 10]]) k.add('head', G.capsule(0.035, 0.18, 2, 6), { c: 0xff4d63, p: [0.5, 1.9, z], r: [0, 0, rz] });
  k.add('head', G.cone(0.07, 0.3, 8), { c: 0xffb02e, p: [0.98, 1.6, 0], r: [0, 0, -90] });
  eyes(k, 'head', 0.8, 1.68, 0.12, 0.045);
  for (const [p, s] of [['wingL', -1], ['wingR', 1]]) k.add(p, G.sphere(0.25, 12, 10), { pat: PAT.cane, p: [-0.1, 1.02, s * 0.38], s: [1.3, 0.7, 0.35] });
  return k;
}

// ------------------------------------------------------------------ shared quadruped base (legs + empty body/head/tail parts)
function quadBase({ hip, legs, legR, legColor, legPat = null, foot = null, splay = 0 }) {
  const k = new Kit();
  k.part('body', 'root', [0, hip, 0]).part('head', 'body', [legs[0][0] + 0.3, hip + 0.1, 0]).part('tail', 'body', [legs[1][0] - 0.3, hip, 0]);
  const names = [['legFL', legs[0][0], -1], ['legFR', legs[0][0], 1], ['legBL', legs[1][0], -1], ['legBR', legs[1][0], 1]];
  for (const [n, x, s] of names) {
    const z = s * legs[0][1];
    k.part(n, 'root', [x, hip, z]);
    k.add(n, G.limb([x, hip, z], [x + 0.02, 0.06, z + s * splay], legR), { c: legColor, pat: legPat });
    k.add(n, G.sphere(legR * 1.35, 10, 8), { c: foot || legColor, p: [x + legR * 0.5, legR * 0.8, z + s * splay], s: [1.3, 0.7, 1] });
  }
  return k;
}

// sprite id -> catalog entry (merged into CATALOG by models.js consumers)
export const CATALOG2 = {
  spike_blob: { build: spikeBlob, rig: 'blob', h: 1.3, r: 0.66 },
  rock_spider: { build: crystalWidow, rig: 'bug', h: 2.4, r: 1.6, stride: 1.6 },
  geode_jay: { build: geodeJay, rig: 'bird', h: 1.9, r: 0.6 },
  rock_turtle: { build: crystalSnapper, rig: 'quad', h: 1.3, r: 0.95 },
  corn_box: { build: kernelCube, rig: 'blob', h: 1.7, r: 0.62 },
  corn_lizard: { build: () => cornLizard(), rig: 'biped', h: 2.6, r: 0.6 },
  corn_boss: { build: () => cornLizard({ boss: true }), rig: 'biped', h: 2.6, r: 0.62, scale: 1.5 },
  corn_hog: { build: () => kernelHog(), rig: 'quad', h: 1.2, r: 0.75 },
  prickletreat: { build: () => kernelHog({ prickle: true }), rig: 'quad', h: 1.2, r: 0.75 },
  evil_gum: { build: evilGumdrop, rig: 'blob', h: 1.4, r: 0.62 },
  gum_blob: { build: gumdropBlob, rig: 'blob', h: 1.2, r: 0.72 },
  gum_lord: { build: gumLord, rig: 'biped', h: 3.0, r: 0.75 },
  chompgum: { build: chompgum, rig: 'quad', h: 1.0, r: 0.95, stride: 1.1 },
  pillar: { build: vinePillar, rig: 'pillar', h: 4.0, r: 0.6 },
  tail_beast: { build: () => tailBeast(), rig: 'quad', h: 2.0, r: 1.2, stride: 1.3, tailSwing: true },
  tail_boss: { build: () => tailBeast({ boss: true }), rig: 'quad', h: 2.0, r: 1.2, scale: 1.45, stride: 1.3, tailSwing: true },
  lico_snake: { build: twizzleSerpent, rig: 'snake', h: 1.9, r: 0.7 },
  choc_squirt: { build: cocoaSquirter, rig: 'blob', h: 1.15, r: 0.72 },
  choc_blob: { build: fudgebackBlob, rig: 'blob', h: 1.3, r: 0.72 },
  choc_boss: { build: fudgeColossus, rig: 'blob', h: 2.0, r: 1.3 },
  choc_lizard: { build: chocoGecko, rig: 'quad', h: 0.9, r: 0.85 },
  pepp_monster: { build: peppermintLurker, rig: 'blob', h: 1.8, r: 0.8 },
  pepp_boss: { build: peppermintLeviathan, rig: 'serpent', h: 3.9, r: 1.8 },
  pepp_fish: { build: peppermintFish, rig: 'fish', h: 1.5, r: 0.6 },
  nerd_blob: { build: nerdBlob, rig: 'blob', h: 1.15, r: 0.72 },
  nerd_cluster: { build: nerdCluster, rig: 'blob', h: 1.6, r: 0.8 },
  nerd_king: { build: megaNerds, rig: 'blob', h: 2.4, r: 1.4 },
  nerd_worm: { build: nerdWorm, rig: 'worm', h: 1.2, r: 0.85 },
  cane_brawler: { build: caneBrawler, rig: 'biped', h: 2.6, r: 0.75 },
  cane_strider: { build: caneStrider, rig: 'quad', h: 2.1, r: 0.9, stride: 1.4 },
  cane_boss: { build: caneColossus, rig: 'biped', h: 4.0, r: 1.2, stride: 1.4 },
  cane_runner: { build: caneRoadrunner, rig: 'bird', h: 2.0, r: 0.6 },
};
