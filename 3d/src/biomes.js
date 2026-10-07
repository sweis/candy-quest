// Biome definitions: palette + lighting, which classic props are pools / occluders / flat, and 3D builders for every
// prop type makeScenery() places (positions come from the classic build, so layouts match it exactly).
// Props are authored at the origin in metres; `r` is a seeded rng so dressing is identical every load.
import { G, PAT, THREE } from './kit.js';

const W = 0xffffff;
const hexOf = { 'var(--purple)': 0xa98cff, 'var(--teal)': 0x7ad9c4, 'var(--orange)': 0xffb84d, 'var(--pink)': 0xff5d8f, '#fff': 0xffffff, teal: 0x7ad9c4, purple: 0xa98cff };
export const cHex = (c) => (typeof c === 'number' ? c : hexOf[c] ?? (typeof c === 'string' && c[0] === '#' ? parseInt(c.slice(1), 16) : 0xff5d8f));
const lerpHex = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t).getHex();

// helpers --------------------------------------------------------------
function crystal(k, x, z, h, w, c, tilt = [0, 0, 0], glowTip = false) { // hexagonal prism + tip, tilted about its base
  const body = G.cyl(w * 0.55, w * 0.7, h * 0.8, 6); body.translate(0, h * 0.4, 0);
  k.add('root', body, { c, p: [x, 0, z], r: tilt });
  const tip = G.cone(w * 0.55, h * 0.3, 6); tip.translate(0, h * 0.95, 0);
  k.add('root', tip, { c: lerpHex(c, W, 0.45), p: [x, 0, z], r: tilt, glow: glowTip });
}
function lumpyRock(k, s, c, r, y = 0.2) {
  const g = G.ico(0.55 * s, 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), yy = p.getY(i), z = p.getZ(i); const f = 0.8 + 0.4 * Math.abs(Math.sin(x * 7.1 + z * 3.3 + yy * 5.7)); p.setXYZ(i, x * f, Math.max(-0.1, yy * f * 0.75), z * f); }
  g.computeVertexNormals(); k.add('root', g, { c, p: [0, y * s, 0] });
}
function gumdrop(k, x, z, s, c1, c2 = null, y = 0) {
  k.add('root', G.lathe([[0, 0], [0.34, 0], [0.36, 0.08], [0.3, 0.38], [0.15, 0.58], [0, 0.62]].map(([a, b]) => [a * s, b * s]), 24), { c: c1, p: [x, y, z] });
  if (c2) k.add('root', G.sphere(0.12 * s, 10, 8), { c: lerpHex(c1, W, 0.55), p: [x - 0.1 * s, y + 0.46 * s, z + 0.12 * s], s: [1, 0.55, 1] });
}
function flame(k, x, y, z, s = 1) {
  k.add('root', G.sphere(0.2 * s, 12, 10), { c: 0xffb02e, p: [x, y + 0.18 * s, z], s: [1, 1.5, 1], glow: true });
  k.add('root', G.sphere(0.12 * s, 10, 8), { c: 0xfff3b0, p: [x, y + 0.14 * s, z], s: [1, 1.4, 1], glow: true });
}

// ---------------------------------------------------------------------- props
export const PROPS = {
  // ---------- forest
  lolli(k, o, r) {
    const s = 1.35 * (o.s || 1), yaw = (r() - 0.5) * 50;
    const pat = { pink: PAT.swirlPink, teal: PAT.swirlTeal, orange: PAT.swirlOrange }[o.c] || PAT.swirlPink;
    k.add('root', G.cyl(0.07 * s, 0.085 * s, 2.0 * s, 12), { c: 0xf6efe4, p: [0, 1.0 * s, 0] });
    k.add('root', G.cyl(0.82 * s, 0.82 * s, 0.26 * s, 40), { pat, uv: 'y', p: [0, 2.72 * s, 0], r: [90, yaw, 0], order: 'YXZ' });
    k.add('root', G.torus(0.82 * s, 0.13 * s, 10, 40), { c: o.c === 'teal' ? 0x7ad9c4 : o.c === 'orange' ? 0xffb84d : 0xff5d8f, p: [0, 2.72 * s, 0], r: [0, yaw, 0], order: 'YXZ' });
    for (const sd of [-1, 1]) k.add('root', G.sphere(0.16 * s, 10, 8), { c: 0xff7ba6, p: [sd * 0.14 * s, 1.72 * s, 0.05], s: [1.2, 0.7, 0.45], r: [0, 0, sd * 25] });
    k.add('root', G.sphere(0.07 * s, 8, 6), { c: 0xe23d72, p: [0, 1.72 * s, 0.06] });
  },
  cane(k, o, r) {
    const flip = r() < 0.5 ? -1 : 1, h = 2.3;
    k.add('root', G.tube([[0, -0.1, 0], [0, h * 0.5, 0], [0, h * 0.86, 0], [flip * 0.12, h * 1.0, 0], [flip * 0.42, h * 1.02, 0], [flip * 0.56, h * 0.88, 0], [flip * 0.55, h * 0.74, 0]], 0.12, 60, 14), { pat: PAT.cane, r: [0, (r() - 0.5) * 60, 0] });
  },
  bush(k, o, r) {
    const base = new THREE.Color(cHex(o.c)), light = base.clone().lerp(new THREE.Color(W), 0.35).getHex(), mid = base.getHex();
    const n = 5 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, rr = 0.35 + r() * 0.2, R = 0.35 + r() * 0.2; k.add('root', G.sphere(R, 16, 12), { c: i % 2 ? light : mid, p: [Math.cos(a) * rr, 0.38 + r() * 0.2, Math.sin(a) * rr * 0.8] }); }
    k.add('root', G.sphere(0.5, 18, 14), { c: light, p: [0, 0.62, 0] });
  },
  rock(k, o, r) { const s = o.s || 1; lumpyRock(k, s, 0x8a5a36, r); for (let i = 0; i < 4; i++) k.add('root', G.oct(0.06 * s), { c: 0xfff8f0, p: [(r() - 0.5) * 0.6 * s, 0.55 * s, (r() - 0.5) * 0.5 * s], r: [r() * 90, r() * 90, 0] }); },
  pebble(k, o, r) { const c = o.dark ? 0x5e524c : 0xb8b1a8; for (const [x, z, R] of [[0, 0, 0.18], [0.28, 0.12, 0.13], [-0.25, 0.14, 0.12]]) k.add('root', G.sphere(R, 12, 8), { c, p: [x, R * 0.5, z], s: [1, 0.7, 1] }); },
  flower(k, o, r) {
    const c = cHex(o.c);
    k.add('root', G.cyl(0.02, 0.02, 0.3, 6), { c: 0x58a348, p: [0, 0.15, 0] });
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; k.add('root', G.sphere(0.09, 10, 8), { c, p: [Math.cos(a) * 0.1, 0.32, Math.sin(a) * 0.1], s: [1, 0.45, 1] }); }
    k.add('root', G.sphere(0.06, 10, 8), { c: 0xffe06a, p: [0, 0.34, 0] });
  },
  tuft(k, o, r) { const c1 = o.c1 || 0x6fbf5a, c2 = o.c2 || 0x9fdb8a; for (let i = 0; i < 5; i++) { const a = -0.6 + i * 0.3; k.add('root', G.cone(0.04, 0.34 + (i % 2) * 0.1, 5), { c: i % 2 ? c1 : c2, p: [Math.sin(a) * 0.08, 0.16, (r() - 0.5) * 0.12], r: [0, 0, a * 40] }); } },
  // ---------- cave
  rcrystal(k, o, r) {
    const s = 1.25 * (o.s || 1), a = o.c === 'purple' ? 0xa98cff : 0x7ad9c4, b = o.c === 'purple' ? 0x7ad9c4 : 0xa98cff;
    for (const [x, z, h, w, tz, tx, c] of [[0, 0, 2.4, 0.5, 0, 0, a], [-0.5, 0.1, 1.7, 0.42, 14, 6, b], [0.48, 0.05, 1.9, 0.44, -13, -4, a], [-0.85, -0.1, 1.1, 0.34, 26, 0, b], [0.85, -0.05, 1.25, 0.34, -24, 8, a], [0.1, 0.4, 0.9, 0.3, -6, -20, b]])
      crystal(k, x * s, z * s, h * s, w * s, c, [tx, 0, tz], true);
    lumpyRock(k, 0.9 * s, 0x2e2142, r, 0.05);
  },
  stala(k, o, r) {
    k.add('root', G.lathe([[0, 1.9], [0.12, 1.5], [0.26, 0.8], [0.42, 0.2], [0.5, 0], [0, 0]], 12), { c: 0x5a4c48, p: [0, 0, 0], r: [0, r() * 360, 0], s: [1, 1, 0.85] });
    k.add('root', G.lathe([[0, 0.9], [0.1, 0.6], [0.22, 0.2], [0.28, 0], [0, 0]], 10), { c: 0x6a5a52, p: [0.45, 0, 0.2] });
  },
  stone(k, o, r) { lumpyRock(k, 1.1 * (o.s || 1), 0x3a2f2a, r); },
  shard(k, o, r) { const c = cHex(o.c); crystal(k, 0, 0, 0.8, 0.22, c, [0, 0, (r() - 0.5) * 30], true); crystal(k, 0.2, 0.1, 0.5, 0.16, c, [0, 0, -25]); },
  // ---------- snow
  ccboulder(k, o, r) {
    const s = 1.3 * (o.s || 1);
    k.add('root', G.lathe([[0, 0], [0.9, 0], [1.0, 0.25], [0.95, 0.75], [0.7, 1.15], [0.35, 1.35], [0, 1.4]].map(([a, b]) => [a * s, b * s]), 24), { pat: PAT.cornBands, s: [1, 1, 0.8] });
    k.add('root', G.sphere(0.72 * s, 20, 12), { c: 0xffffff, p: [0, 1.2 * s, 0], s: [1.05, 0.38, 0.88] });
  },
  pine(k, o, r) {
    const s = 1.2;
    k.add('root', G.cyl(0.12 * s, 0.15 * s, 0.6 * s, 8), { c: 0x7a5a3a, p: [0, 0.3 * s, 0] });
    for (const [y, rr, h] of [[0.5, 0.75, 0.9], [1.05, 0.6, 0.8], [1.55, 0.44, 0.7]]) {
      k.add('root', G.cone(rr * s, h * s, 10), { c: 0x3f8a55, p: [0, (y + h / 2) * s, 0] });
      k.add('root', G.cone(rr * 0.7 * s, h * 0.45 * s, 10), { c: 0xffffff, p: [0, (y + h * 0.78) * s, 0] });
    }
  },
  snowlump(k, o, r) { for (const [x, z, R] of [[0, 0, 0.22], [0.3, 0.12, 0.15], [-0.26, 0.15, 0.14]]) k.add('root', G.sphere(R, 12, 8), { c: 0xf6fafe, p: [x, R * 0.5, z], s: [1, 0.7, 1] }); },
  drift(k, o, r) { const s = o.s || 1; k.add('root', G.sphere(1, 22, 10), { c: 0xf6fafe, p: [0, 0, 0], s: [1.7 * s, 0.32 * s, 0.75 * s] }); },
  // ---------- gumdrop grove
  gmound(k, o, r) {
    const s = 3.2 * (o.s || 1), [c1, c2] = o.c || [0xff9bd0, 0xc41f7a];
    k.add('root', G.lathe([[0, 0], [0.36, 0], [0.38, 0.08], [0.32, 0.4], [0.17, 0.62], [0, 0.66]].map(([a, b]) => [a * s, b * s]), 32), { c: cHex(c1), pat: PAT.dots });
    k.add('root', G.sphere(0.18 * s, 12, 10), { c: lerpHex(cHex(c1), W, 0.5), p: [-0.1 * s, 0.5 * s, 0.14 * s], s: [1, 0.5, 1] });
    void c2;
  },
  gcluster(k, o, r) { const [c1] = o.c || [0xa8ffcf]; for (const [x, z, s] of [[0, 0, 1.3], [-0.55, 0.3, 1.0], [0.55, 0.25, 1.05]]) gumdrop(k, x, z, s, cHex(c1), 1); },
  gsmall(k, o, r) { const [c1] = o.c || [0xffd36e]; gumdrop(k, 0, 0, 0.8, cHex(c1), 1); },
  // ---------- jungle
  vinetree(k, o, r) {
    const s = 1.35 * (o.s || 1), c = cHex(o.c);
    k.add('root', G.tube([[0, -0.1, 0], [0.1, 1.2 * s, 0.05], [-0.08, 2.4 * s, -0.05], [0.05, 3.2 * s, 0]], 0.24 * s, 30, 12), { c, pat: PAT.licorice });
    for (const [x, y, z, R, rx] of [[-0.7, 3.3, 0, 0.62, 20], [0.6, 3.45, 0.1, 0.66, -10], [0, 3.8, -0.2, 0.55, 70], [0.1, 3.1, 0.55, 0.5, 90]])
      k.add('root', G.torus(R * s, 0.13 * s, 10, 28), { c, pat: PAT.licorice, p: [x * s, y * s, z * s], r: [rx, r() * 90, 0] });
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; k.add('root', G.sphere(0.45 * s, 12, 8), { c: 0x2f6a3a, p: [Math.cos(a) * 0.9 * s, (3.3 + (i % 2) * 0.35) * s, Math.sin(a) * 0.7 * s], s: [1.2, 0.5, 0.8] }); }
  },
  fern(k, o, r) { const s = o.s || 1; for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; k.add('root', G.sphere(0.4 * s, 10, 6), { c: i % 2 ? 0x4f8a3a : 0x6fae4f, p: [Math.cos(a) * 0.35 * s, 0.28 * s, Math.sin(a) * 0.35 * s], s: [1.2, 0.18, 0.4], r: [0, (-a * 180) / Math.PI, 28] }); } },
  coil(k, o, r) { k.add('root', G.torus(0.42, 0.13, 10, 28), { c: cHex(o.c), pat: PAT.licorice, p: [0, 0.14, 0], r: [90, 0, 0] }); k.add('root', G.torus(0.22, 0.11, 10, 20), { c: cHex(o.c), pat: PAT.licorice, p: [0, 0.34, 0], r: [90, 0, 0] }); },
  // ---------- chocolate forest
  choctree(k, o, r) {
    const s = 1.4 * (o.s || 1);
    k.add('root', G.cyl(0.2 * s, 0.28 * s, 1.5 * s, 10), { c: 0x5e3a1e, p: [0, 0.75 * s, 0] });
    for (const [x, y, z, R] of [[-0.55, 1.85, 0, 0.72], [0.1, 2.15, -0.1, 0.82], [0.62, 1.8, 0.1, 0.64], [0, 1.7, 0.45, 0.6]]) k.add('root', G.sphere(R * s, 18, 14), { c: 0x7a4a24, p: [x * s, y * s, z * s], s: [1, 0.82, 1] });
    for (const [x, z] of [[-0.6, 0.4], [0.3, 0.55], [0.75, 0.2], [-0.2, 0.6]]) k.add('root', G.capsule(0.07 * s, 0.25 * s, 4, 6), { c: 0x4a2a12, p: [x * s, 1.4 * s, z * s] });
  },
  fudge(k, o, r) { lumpyRock(k, 1.25 * (o.s || 1), 0x5e3a1e, r); },
  cocoashroom(k, o, r) {
    k.add('root', G.cyl(0.1, 0.13, 0.35, 10), { c: 0xe8d8be, p: [0, 0.17, 0] });
    k.add('root', G.sphere(0.34, 16, 10), { c: 0x7a4a24, p: [0, 0.36, 0], s: [1, 0.55, 1] });
    for (const [x, z] of [[0.12, 0.1], [-0.14, 0.02], [0.02, -0.16]]) k.add('root', G.sphere(0.05, 8, 6), { c: 0xe8d8be, p: [x, 0.52, z] });
  },
  wafer(k, o, r) { for (let i = 0; i < 5; i++) k.add('root', G.cyl(0.5, 0.5, 0.1, 20), { c: i % 2 ? 0xd9b586 : 0xb98a5a, p: [0, 0.05 + i * 0.1, 0] }); k.add('root', G.cyl(0.5, 0.5, 0.06, 20), { c: 0xe8c896, p: [0, 0.53, 0] }); },
  // ---------- peppermint ocean
  canecoral(k, o, r) {
    const s = 1.3 * (o.s || 1);
    for (const [x, z, h, tz, tx] of [[0, 0, 2.1, 0, 0], [-0.45, 0.1, 1.5, 18, 5], [0.45, 0.05, 1.7, -15, -5], [-0.75, -0.15, 1.1, 32, 0], [0.75, 0.1, 1.1, -30, 8]]) {
      const b = G.cyl(0.13 * s, 0.16 * s, h * s, 12); b.translate(0, (h / 2) * s, 0);
      k.add('root', b, { pat: PAT.caneDense, p: [x * s, 0, z * s], r: [tx, 0, tz] });
      const t = G.sphere(0.17 * s, 12, 8); t.translate(0, h * s, 0);
      k.add('root', t, { c: 0xffb3c0, p: [x * s, 0, z * s], r: [tx, 0, tz] });
    }
  },
  mintrock(k, o, r) { const s = 1.2 * (o.s || 1); k.add('root', G.sphere(0.8 * s, 28, 18), { pat: PAT.mint, uv: 'z', p: [0, 0.45 * s, 0], s: [1, 0.85, 0.7], r: [0, (r() - 0.5) * 40, 0] }); },
  shellc(k, o, r) {
    k.add('root', G.sphere(0.36, 20, 10, ), { pat: PAT.stripesV, c: 0xffd6de, p: [0, 0, 0], s: [1, 0.55, 0.9], r: [0, r() * 360, 0] });
    k.add('root', G.sphere(0.1, 8, 6), { c: 0xe08595, p: [0.3, 0.05, 0] });
  },
  // ---------- nerd mines
  beam(k, o, r) {
    const s = 1.3 * (o.s || 1);
    for (const x of [-1.1, 1.1]) k.add('root', G.rbox(0.3 * s, 2.4 * s, 0.3 * s, 0.04), { c: 0x8a5a30, p: [x * s, 1.2 * s, 0] });
    k.add('root', G.rbox(2.7 * s, 0.34 * s, 0.36 * s, 0.05), { c: 0xa06a38, p: [0, 2.5 * s, 0] });
    for (const x of [-0.8, 0.8]) k.add('root', G.rbox(0.18 * s, 0.7 * s, 0.2 * s, 0.03), { c: 0x6b4322, p: [x * s, 2.12 * s, 0], r: [0, 0, x > 0 ? 45 : -45] });
    k.add('root', G.cyl(0.02, 0.02, 0.4 * s, 4), { c: 0x333333, p: [0.3 * s, 2.15 * s, 0.1] });
    k.add('root', G.sphere(0.12 * s, 10, 8), { c: 0xffd98a, p: [0.3 * s, 1.92 * s, 0.1], glow: true });
  },
  orerock(k, o, r) {
    const s = 1.4 * (o.s || 1); lumpyRock(k, s, 0x463a54, r);
    const cs = [0xff5d8f, 0xffe94a, 0x5ab8ff, 0x7ce26a, 0xc77dff, 0xffb02e];
    for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2, e = 0.2 + r() * 0.9; k.add('root', G.sphere(0.07 * s, 8, 6), { c: cs[i % 6], p: [Math.cos(a) * Math.cos(e) * 0.5 * s, (0.2 + Math.sin(e) * 0.4) * s, Math.sin(a) * Math.cos(e) * 0.45 * s], s: [1.2, 1, 1] }); }
  },
  rail(k, o, r) {
    for (let i = 0; i < 6; i++) k.add('root', G.rbox(0.3, 0.08, 0.9, 0.02), { c: 0x6a4424, p: [-2 + i * 0.8, 0.04, 0] });
    for (const z of [-0.3, 0.3]) k.add('root', G.rbox(4.4, 0.07, 0.07, 0.02), { c: 0x8f98a6, p: [0, 0.11, z] });
  },
  cart(k, o, r) {
    k.add('root', G.rbox(1.6, 0.8, 1.0, 0.08), { c: 0x5d6570, p: [0, 0.7, 0] });
    k.add('root', G.rbox(1.7, 0.1, 1.1, 0.04), { c: 0x9aa4b2, p: [0, 1.12, 0] });
    for (const [x, z] of [[-0.55, -0.45], [0.55, -0.45], [-0.55, 0.45], [0.55, 0.45]]) k.add('root', G.cyl(0.2, 0.2, 0.08, 14), { c: 0x2c323a, p: [x, 0.22, z], r: [90, 0, 0] });
    const cs = [0xff5d8f, 0xffe94a, 0x5ab8ff, 0x7ce26a, 0xc77dff, 0xffb02e];
    for (let i = 0; i < 16; i++) k.add('root', G.sphere(0.13, 8, 6), { c: cs[i % 6], p: [(r() - 0.5) * 1.3, 1.15 + r() * 0.25, (r() - 0.5) * 0.8] });
  },
  nerdpile(k, o, r) {
    const s = o.s || 1, cs = [0xff5d8f, 0xffe94a, 0x5ab8ff, 0x7ce26a, 0xc77dff, 0xffb02e];
    for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2, d = r() * 0.5; k.add('root', G.sphere(0.12 * s, 8, 6), { c: cs[i % 6], p: [Math.cos(a) * d * s, (0.1 + (0.5 - d) * 0.5) * s, Math.sin(a) * d * s], s: [1.2, 1, 1] }); }
  },
  glowcrys(k, o, r) { const c = cHex(o.c); for (const [x, z, h, tz] of [[0, 0, 1.1, 0], [-0.25, 0.1, 0.75, 22], [0.25, 0.05, 0.8, -20]]) { k.add('root', G.cyl(0.1, 0.14, h, 6), { c, p: [x, h / 2, z], r: [0, 0, tz], glow: true }); } },
  // ---------- candy cane dunes
  bigcane(k, o, r) {
    const s = 1.35 * (o.s || 1), f = o.f || 1, h = 2.8 * s;
    k.add('root', G.tube([[0, -0.2, 0], [0, h * 0.5, 0], [0, h * 0.86, 0], [f * 0.18 * s, h, 0], [f * 0.6 * s, h * 1.02, 0], [f * 0.8 * s, h * 0.88, 0], [f * 0.8 * s, h * 0.7, 0]], 0.2 * s, 60, 14), { pat: PAT.cane, r: [0, 0, f * 8] });
  },
  canestump(k, o, r) { const s = o.s || 1; k.add('root', G.cyl(0.26 * s, 0.28 * s, 0.9 * s, 14), { pat: PAT.caneDense, p: [0, 0.45 * s, 0] }); for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; k.add('root', G.cone(0.08 * s, 0.22 * s, 5), { c: i % 2 ? W : 0xff4d63, p: [Math.cos(a) * 0.18 * s, 0.98 * s, Math.sin(a) * 0.18 * s] }); } },
  caneshards(k, o, r) { for (const [x, z, h, tz, ry] of [[0, 0, 0.5, 20, 0], [0.3, 0.12, 0.4, -24, 40], [-0.26, 0.16, 0.36, 40, -30]]) k.add('root', G.cyl(0.06, 0.07, h, 10), { pat: PAT.caneDense, p: [x, h * 0.35, z], r: [0, ry, tz] }); },
  deserttuft(k, o, r) { PROPS.tuft(k, { c1: 0xb89b4e, c2: 0xe8d48a }, r); },
  dune(k, o, r) { const s = o.s || 1; k.add('root', G.sphere(1, 24, 10), { c: 0xf2c492, p: [0, -0.1, 0], s: [2.9 * s, 0.55 * s, 1.2 * s] }); },
  // ---------- castle
  tower(k, o, r) {
    const s = 1.5 * (o.s || 1);
    k.add('root', G.cyl(0.9 * s, 1.0 * s, 3.6 * s, 20), { c: 0xffb3cc, p: [0, 1.8 * s, 0] });
    for (let i = 0; i < 3; i++) k.add('root', G.cyl(1.005 * s - i * 0.03 * s, 1.005 * s - i * 0.03 * s, 0.07 * s, 20), { c: 0xd9648f, p: [0, (0.8 + i * 1.0) * s, 0] });
    k.add('root', G.cyl(1.12 * s, 1.12 * s, 0.4 * s, 20), { c: 0xe23d72, p: [0, 3.75 * s, 0] });
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; k.add('root', G.rbox(0.36 * s, 0.34 * s, 0.3 * s, 0.05), { c: 0xe23d72, p: [Math.cos(a) * 1.0 * s, 4.1 * s, Math.sin(a) * 1.0 * s], r: [0, (-a * 180) / Math.PI, 0] }); }
    k.add('root', G.cone(1.0 * s, 1.6 * s, 20), { c: 0xf0b429, p: [0, 4.95 * s, 0] });
    k.add('root', G.cyl(0.04 * s, 0.04 * s, 0.8 * s, 6), { c: 0x6b4427, p: [0, 6.1 * s, 0] });
    k.add('root', G.rbox(0.6 * s, 0.34 * s, 0.03, 0.02), { c: 0xe23d72, p: [0.32 * s, 6.3 * s, 0] });
    k.add('root', G.rbox(0.55 * s, 0.85 * s, 0.1, 0.2), { c: 0x3a1430, p: [0, 1.6 * s, 0.97 * s] });
    k.add('root', G.sphere(0.12 * s, 8, 6), { c: 0xffd98a, p: [0, 1.62 * s, 1.0 * s], glow: true });
  },
  wall(k, o, r) {
    k.add('root', G.rbox(5.6, 2.4, 0.9, 0.08), { c: 0xf0a0bc, p: [0, 1.2, 0] });
    for (let i = 0; i < 3; i++) k.add('root', G.rbox(5.62, 0.06, 0.92, 0.02), { c: 0xc05a84, p: [0, 0.6 + i * 0.6, 0] });
    for (let i = 0; i < 9; i++) k.add('root', G.rbox(0.4, 0.42, 0.95, 0.05), { c: 0xe23d72, p: [-2.6 + i * 0.65, 2.6, 0] });
  },
  banner(k, o, r) {
    const c = cHex(o.c);
    k.add('root', G.cyl(0.07, 0.08, 3.1, 8), { c: 0x7a4a24, p: [0, 1.55, 0] });
    k.add('root', G.rbox(1.3, 0.1, 0.1, 0.03), { c: 0x6b4427, p: [0, 3.0, 0] });
    const sh = new THREE.Shape(); sh.moveTo(-0.5, 0); sh.lineTo(0.5, 0); sh.lineTo(0.5, -1.05); sh.lineTo(0, -1.35); sh.lineTo(-0.5, -1.05); sh.closePath();
    k.add('root', G.extrude(sh, 0.04, 0.01), { c, p: [0, 2.95, 0.05] });
    k.add('root', G.extrude(G.star(0.2, 0.09, 5), 0.03, 0.01), { c: 0xffc93c, p: [0, 2.45, 0.1] });
  },
  chewblock(k, o, r) { const s = 1.3 * (o.s || 1); for (const [x, z, y, c, ry] of [[-0.55, 0, 0, 0xa8e6a0, -6], [0.5, 0.1, 0, 0xffb3c8, 12], [0, -0.05, 0.62, 0xffd98a, 3]]) k.add('root', G.rbox(1.0 * s, 0.62 * s, 0.7 * s, 0.14 * s), { c, p: [x * s, (0.31 + y) * s, z * s], r: [0, ry, 0] }); },
  brazier(k, o, r) {
    k.add('root', G.cyl(0.08, 0.1, 0.8, 8), { c: 0x4a3320, p: [0, 0.4, 0] });
    k.add('root', G.lathe([[0.1, 0], [0.42, 0.1], [0.5, 0.35], [0.46, 0.38], [0, 0.2]], 18), { c: 0x8a6a48, p: [0, 0.78, 0] });
    flame(k, 0, 1.05, 0, 1.4);
  },
  // ---------- broccoli forest (Candy Quest 2)
  brocctree(k, o, r) {
    const s = 1.4 * (o.s || 1);
    k.add('root', G.cyl(0.24 * s, 0.34 * s, 1.5 * s, 14), { c: 0x9cc86a, p: [0, 0.75 * s, 0] });
    for (const [x, z, rz, rx] of [[-0.35, 0, 30, 0], [0.35, 0.05, -28, 0], [0.02, 0.35, 0, -30], [0, -0.32, 0, 32]]) { const b = G.cyl(0.1 * s, 0.16 * s, 0.8 * s, 8); b.translate(0, 0.4 * s, 0); k.add('root', b, { c: 0x8fbf5c, p: [x * 0.3 * s, 1.35 * s, z * 0.3 * s], r: [rx, 0, rz] }); }
    floretDome(k, [0, 2.15 * s, 0], 1.05 * s, r, undefined, !!o.lite);
  },
  brocbush(k, o, r) { floretDome(k, [0, 0.42, 0], 0.62, r); k.add('root', G.cyl(0.12, 0.16, 0.3, 8), { c: 0x9cc86a, p: [0, 0.15, 0] }); },
  caulirock(k, o, r) { // a cauliflower boulder: creamy florets
    const s = 1.1 * (o.s || 1);
    floretDome(k, [0, 0.35 * s, 0], 0.72 * s, r, [0xf6f1dc, 0xece5c6, 0xfffbea, 0xe3dab6]);
    k.add('root', G.sphere(0.5 * s, 14, 10), { c: 0xd9e6b0, p: [0, 0.12 * s, 0], s: [1.1, 0.4, 1.1] });
  },
  peapod(k, o, r) {
    k.add('root', G.capsule(0.12, 0.55, 6, 12), { c: 0x7bc24f, p: [0, 0.1, 0], r: [0, r() * 180, 90], s: [1, 1, 0.8] });
    for (const x of [-0.18, 0, 0.18]) k.add('root', G.sphere(0.085, 10, 8), { c: 0xa6e070, p: [x, 0.18, 0] });
  },
  sprouts(k, o, r) { for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + r(); const x = Math.cos(a) * 0.18, z = Math.sin(a) * 0.18; k.add('root', G.cyl(0.03, 0.04, 0.3, 6), { c: 0x9cc86a, p: [x, 0.15, z] }); floretDome(k, [x, 0.36, z], 0.12, r); } },
  // ---------- carrot mountains (Candy Quest 2)
  carrotpeak(k, o, r) { // a giant carrot planted in the ground: the orange shoulder + a tall leafy crown
    const s = 1.5 * (o.s || 1);
    k.add('root', G.lathe([[0, 0], [0.62, 0], [0.64, 0.45], [0.55, 0.85], [0.3, 1.0], [0, 1.02]].map(([a, b]) => [a * s, b * s]), 20), { c: 0xff8a2b });
    for (let i = 1; i < 3; i++) k.add('root', G.torus((0.63 - i * 0.03) * s, 0.03 * s, 6, 20), { c: 0xe0661a, p: [0, i * 0.3 * s, 0], r: [90, 0, 0] });
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + r() * 0.3, h = (1.8 + r() * 0.8) * s, tip = [Math.cos(a) * 0.55 * s, 1.0 * s + h, Math.sin(a) * 0.55 * s];
      k.add('root', G.limb([0, 0.95 * s, 0], tip, 0.07 * s), { c: [0x4fa83a, 0x6fc24f, 0x3d8f2e][i % 3] });
      for (let j = 1; j <= 3; j++) k.add('root', G.sphere(0.2 * s, 8, 6), { c: [0x6fc24f, 0x4fa83a, 0x8fd46a][j % 3], p: [tip[0] * (0.45 + j * 0.18), 0.95 * s + (tip[1] - 0.95 * s) * (0.45 + j * 0.18), tip[2] * (0.45 + j * 0.18)], s: [1.2, 0.5, 1] }); }
  },
  crag(k, o, r) { const s = 1.25 * (o.s || 1); k.add('root', G.ico(0.6 * s, 0), { c: 0x9a7a5e, p: [0, 0.3 * s, 0], s: [1.1, 0.8, 0.9], r: [0, r() * 90, 0] }); k.add('root', G.ico(0.35 * s, 0), { c: 0xb08f70, p: [0.45 * s, 0.18 * s, 0.2 * s], r: [r() * 60, 0, 0] }); },
  carrottop(k, o, r) { for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const tip = [Math.cos(a) * 0.35, 0.75, Math.sin(a) * 0.35]; k.add('root', G.limb([0, 0.05, 0], tip, 0.03), { c: 0x4fa83a }); k.add('root', G.sphere(0.16, 8, 6), { c: 0x6fc24f, p: tip, s: [1.2, 0.5, 1] }); } k.add('root', G.cyl(0.14, 0.16, 0.08, 10), { c: 0xff8a2b, p: [0, 0.04, 0] }); },
  babycarrots(k, o, r) { for (let i = 0; i < 3; i++) { const x = (i - 1) * 0.2, z = (r() - 0.5) * 0.2; const g = G.cone(0.06, 0.32, 8); k.add('root', g, { c: 0xff8a2b, p: [x, 0.05, z], r: [0, 0, 80 + r() * 20] }); k.add('root', G.sphere(0.05, 6, 4), { c: 0x6fc24f, p: [x - 0.16, 0.05, z] }); } },
  // ---------- cabbage boulder pass (Candy Quest 2)
  cabbageboulder(k, o, r) { // a giant cabbage head half-sunk into the pass
    const s = 1.5 * (o.s || 1), cols = [0x8fcf6a, 0x6fb24f, 0xb7e08f, 0x5a9a42];
    k.add('root', G.sphere(0.9 * s, 22, 16), { c: 0xd8f0b8, p: [0, 0.55 * s, 0] });
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + r() * 0.3, e = -0.1 + r() * 0.8, d = new THREE.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e));
      k.add('root', G.sphere(0.62 * s, 14, 10), { c: cols[i % 4], p: [d.x * 0.42 * s, 0.55 * s + d.y * 0.42 * s, d.z * 0.42 * s], s: [1, 1, 0.55], dir: [d.x, d.y, d.z] });
      k.add('root', G.capsule(0.025 * s, 0.5 * s, 2, 4), { c: 0xeaf8d6, p: [d.x * 0.72 * s, 0.55 * s + d.y * 0.72 * s, d.z * 0.72 * s], dir: [d.x, d.y, d.z] }); }
  },
  spire(k, o, r) { const s = 1.3 * (o.s || 1); k.add('root', G.lathe([[0, 2.4], [0.18, 2.0], [0.34, 1.2], [0.5, 0.4], [0.6, 0], [0, 0]].map(([a, b]) => [a * s, b * s]), 7), { c: 0x8a8578, r: [0, r() * 360, 0] }); k.add('root', G.ico(0.3 * s, 0), { c: 0x9a958a, p: [0.45 * s, 0.15 * s, 0.2 * s] }); },
  cabbagesprout(k, o, r) { for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; k.add('root', G.sphere(0.2, 10, 8), { c: [0x8fcf6a, 0x6fb24f, 0xb7e08f][i % 3], p: [Math.cos(a) * 0.14, 0.14, Math.sin(a) * 0.14], s: [1, 1, 0.5], dir: [Math.cos(a), 0.8, Math.sin(a)] }); } k.add('root', G.sphere(0.13, 10, 8), { c: 0xd8f0b8, p: [0, 0.18, 0] }); },
  // ---------- tomato shores (Candy Quest 2)
  tomatopalm(k, o, r) { // a leaning palm with a crown of fronds and a cluster of ripe tomatoes
    const s = 1.35 * (o.s || 1), f = o.f || 1, top = [f * 0.7 * s, 3.1 * s, 0];
    k.add('root', G.tube([[0, -0.1, 0], [f * 0.15 * s, 1.2 * s, 0], [f * 0.45 * s, 2.3 * s, 0], top], 0.16 * s, 24, 10), { c: 0xb08a5a });
    for (let i = 0; i < 4; i++) k.add('root', G.torus(0.17 * s, 0.03 * s, 6, 14), { c: 0x8a6a42, p: [f * (0.05 + i * 0.12) * s, (0.5 + i * 0.6) * s, 0], r: [90, 0, 0] });
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2, tip = [top[0] + Math.cos(a) * 1.3 * s, top[1] - 0.45 * s, Math.sin(a) * 1.3 * s];
      k.add('root', G.tube([top, [top[0] + Math.cos(a) * 0.7 * s, top[1] + 0.25 * s, Math.sin(a) * 0.7 * s], tip], 0.09 * s, 12, 6), { c: i % 2 ? 0x4f9a3a : 0x6fb84f }); }
    for (const [dx, dy, dz] of [[0.15, -0.25, 0.1], [-0.12, -0.3, -0.1], [0.05, -0.42, -0.15], [-0.1, -0.2, 0.18]]) k.add('root', G.sphere(0.16 * s, 12, 10), { c: 0xe8312a, p: [top[0] + dx * s, top[1] + dy * s, dz * s] });
  },
  bigtomato(k, o, r) { const s = 1.4 * (o.s || 1); k.add('root', G.sphere(0.7 * s, 22, 16), { c: 0xe8312a, p: [0, 0.35 * s, 0], s: [1, 0.8, 1] }); k.add('root', G.sphere(0.2 * s, 10, 8), { c: 0xffb3a0, p: [-0.25 * s, 0.75 * s, 0.25 * s], s: [1, 0.5, 1] });
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; k.add('root', G.sphere(0.15 * s, 8, 6), { c: 0x4f9a3a, p: [Math.cos(a) * 0.16 * s, 0.9 * s, Math.sin(a) * 0.16 * s], s: [1.8, 0.3, 0.6], r: [0, (-a * 180) / Math.PI, 0] }); } },
  cherrytomatoes(k, o, r) { for (let i = 0; i < 4; i++) k.add('root', G.sphere(0.11, 10, 8), { c: 0xe8312a, p: [(r() - 0.5) * 0.4, 0.1, (r() - 0.5) * 0.3] }); },
  // ---------- pea savannah (Candy Quest 2)
  peatree(k, o, r) { // an acacia of twisted pea vine with a flat leafy canopy and hanging pods
    const s = 1.35 * (o.s || 1);
    k.add('root', G.tube([[0, -0.1, 0], [0.1 * s, 1.0 * s, 0.05], [-0.05 * s, 1.9 * s, -0.05], [0.05 * s, 2.5 * s, 0]], 0.13 * s, 20, 8), { c: 0x6a8a3a });
    k.add('root', G.sphere(1.6 * s, 22, 10), { c: 0x7bc24f, p: [0, 2.7 * s, 0], s: [1, 0.22, 0.85] });
    for (let i = 0; i < 7; i++) { const a = r() * Math.PI * 2, d = r() * 1.2 * s; k.add('root', G.sphere(0.5 * s, 10, 6), { c: [0x6fb84f, 0x8fcf5a, 0x5aa83a][i % 3], p: [Math.cos(a) * d, 2.85 * s, Math.sin(a) * d * 0.8], s: [1, 0.3, 1] }); }
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.3; k.add('root', G.capsule(0.07 * s, 0.35 * s, 4, 8), { c: 0x5aa83a, p: [Math.cos(a) * 1.0 * s, 2.35 * s, Math.sin(a) * 0.8 * s] }); }
  },
  peaboulder(k, o, r) { const s = 1.2 * (o.s || 1); k.add('root', G.sphere(0.62 * s, 20, 14), { c: 0x9fc86a, p: [0, 0.45 * s, 0], s: [1, 0.85, 1] }); for (let i = 0; i < 3; i++) k.add('root', G.sphere(0.3 * s, 12, 10), { c: 0x8fbf5a, p: [(i - 1) * 0.5 * s, 0.2 * s, 0.35 * s] }); },
  podbush(k, o, r) { for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; k.add('root', G.capsule(0.09, 0.4, 4, 8), { c: [0x5aa83a, 0x7bc24f][i % 2], p: [Math.cos(a) * 0.25, 0.3, Math.sin(a) * 0.25], dir: [Math.cos(a), 1.4, Math.sin(a)] }); } k.add('root', G.sphere(0.25, 10, 8), { c: 0x6fb84f, p: [0, 0.2, 0] }); },
  savgrass(k, o, r) { for (let i = 0; i < 7; i++) { const a = -0.8 + i * 0.27; k.add('root', G.cone(0.035, 0.6 + (i % 3) * 0.15, 5), { c: i % 2 ? 0xd9b85a : 0xe8cf7a, p: [Math.sin(a) * 0.12, 0.3, (r() - 0.5) * 0.18], r: [0, 0, a * 35] }); } },
  // ---------- Halloween dressing
  jackolantern(k, o, r) {
    const s = 0.9 * (o.s || 1);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; k.add('root', G.sphere(0.24 * s, 12, 10), { c: i % 2 ? 0xff7a1a : 0xf06a10, p: [Math.cos(a) * 0.17 * s, 0.32 * s, Math.sin(a) * 0.17 * s], s: [0.75, 1.15, 0.75] }); }
    k.add('root', G.sphere(0.3 * s, 14, 10), { c: 0xff8a2a, p: [0, 0.32 * s, 0], s: [1, 0.95, 1] });
    k.add('root', G.cyl(0.035 * s, 0.05 * s, 0.16 * s, 6), { c: 0x4a6a2a, p: [0, 0.66 * s, 0], r: [0, 0, 12] });
    for (const sd of [-1, 1]) k.add('root', G.cone(0.07 * s, 0.1 * s, 3), { c: 0xffe066, p: [sd * 0.11 * s, 0.4 * s, 0.31 * s], r: [90, 0, 0], s: [1, 1, 0.4], glow: true });
    k.add('root', G.rbox(0.26 * s, 0.06 * s, 0.04 * s, 0.02), { c: 0xffe066, p: [0, 0.22 * s, 0.33 * s], glow: true });
    for (const dx of [-0.07, 0.07]) k.add('root', G.rbox(0.05 * s, 0.05 * s, 0.04 * s, 0.01), { c: 0xff8a2a, p: [dx * s, 0.245 * s, 0.35 * s] });
  },
};
// a broccoli floret dome (shared by trees, bushes, sprouts; cauliflower passes cream colours)
function floretDome(k, c, R, r, cols = [0x2f7a3a, 0x3f8f45, 0x4a9e4c, 0x2a6a34], lite = false) {
  k.add('root', G.sphere(R * 0.8, 12, 9), { c: cols[0], p: c, s: [1, 0.7, 1] });
  const n = R > 0.3 ? 11 : 5, bumps = R > 0.3 && !lite;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.4, e = i % 3 === 0 ? 0.9 : 0.3 + r() * 0.35, rr = R * (0.34 + r() * 0.12);
    const x = c[0] + Math.cos(a) * Math.cos(e) * R * 0.64, y = c[1] + Math.sin(e) * R * 0.44, z = c[2] + Math.sin(a) * Math.cos(e) * R * 0.64;
    k.add('root', G.sphere(rr, 9, 7), { c: cols[i % cols.length], p: [x, y, z] });
    if (bumps) for (let j = 0; j < 3; j++) k.add('root', G.sphere(rr * 0.42, 6, 4), { c: cols[(i + j + 1) % cols.length], p: [x + (r() - 0.5) * rr, y + rr * 0.55, z + (r() - 0.5) * rr] });
  }
  k.add('root', G.sphere(R * 0.42, 9, 7), { c: cols[2], p: [c[0], c[1] + R * 0.44, c[2]] });
}
// pools: water discs in carved basins
export const POOLS = { pond: { color: 0x3fa6e6 }, cpool: { color: 0x8f6bf5, glow: 0x4a2ab0 }, gpool: { color: 0xe0489e, opacity: 0.92 }, swamp: { color: 0x2c5a3a, opacity: 0.95 },
  chocpool: { color: 0x6b4427, opacity: 1, rough: 0.2 }, tidepool: { color: 0x56b8e8 }, bog: { color: 0x5aa86a, opacity: 0.9 }, spring: { color: 0x5cc4ec }, brook: { color: 0x5ab8d8 }, waterhole: { color: 0x6aa8b8, opacity: 0.9 }, oasis: { color: 0x56b8e8, ring: 0xfff0dc } };
// painted into the ground's vertex colours (flat decals never z-fight)
export const PAINT = { dirt: { color: 0xd9b27c, rx: 1.5, rz: 0.92 }, foam: { color: 0xf4fbff, rx: 1.1, rz: 0.45 }, drift: { color: 0xffffff, rx: 1.8, rz: 0.8 }, dune: { color: 0xf6d0a0, rx: 2.8, rz: 1.0 } };
// tall props that fade when they stand between the camera and Pip
export const OCCLUDERS = new Set(['lolli', 'cane', 'rcrystal', 'stala', 'pine', 'gmound', 'vinetree', 'choctree', 'canecoral', 'beam', 'bigcane', 'tower', 'wall', 'banner', 'ccboulder', 'chewblock', 'mintrock', 'orerock', 'fudge', 'stone', 'cart', 'brocctree', 'carrotpeak', 'crag', 'cabbageboulder', 'spire', 'tomatopalm', 'bigtomato', 'peatree', 'peaboulder']);
export const FLAT = new Set(['pebble', 'tuft', 'flower', 'rail', 'snowlump', 'deserttuft', 'caneshards', 'shard', 'fern', 'coil', 'drift', 'dune', 'nerdpile', 'peapod', 'sprouts', 'babycarrots', 'carrottop', 'cabbagesprout', 'cherrytomatoes', 'savgrass', 'podbush']);

// ---------------------------------------------------------------------- biome palettes + dressing
const hedgeGum = (k, r) => { const cs = [0xff5da8, 0x7ad9c4, 0xffb84d, 0xa98cff, 0x9be15d, 0x5ab8ff]; gumdrop(k, 0, 0, 0.8 + r() * 0.4, cs[Math.floor(r() * cs.length)]); };
export const BIOMES = {
  forest: { sky: [0x7cc8f2, 0xcdeefc, 0xfff0d8], fog: 0xe9f4ea, ground: [0x8fd67c, 0x76c465, 0xa9e393, 0xc6efb2], hill: 0x7cc46a, hillH: 7,
    sun: 0xfff0d6, sunI: 3.1, hemiSky: 0xd6ecff, hemiGround: 0x8cc77a, hemiI: 1.15, clouds: true,
    scatter: [['tuft', 0.8], ['flower', 0.2]], hedge: hedgeGum, backdrop: (k, r, i) => PROPS.lolli(k, { c: ['pink', 'teal', 'orange'][i % 3], s: 2.4 + r() * 1.4 }, r) },
  cave: { sky: [0x0e0916, 0x1f1630, 0x3a2a52], fog: 0x2a1f3a, fogNear: 26, fogFar: 80, ground: [0x3a2c50, 0x2a1f3c, 0x4a3a66, 0x5a4a7a], hill: 0x1c1428, hillH: 12, underground: true,
    sun: 0xd9c8ff, sunI: 2.1, hemiSky: 0x9a86d0, hemiGround: 0x3a2a52, hemiI: 1.1, exposure: 1.15,
    scatter: [['pebble', 0.6, { dark: true }], ['shard', 0.4, { c: 'teal' }]], hedge: (k, r) => crystal(k, 0, 0, 0.6 + r() * 0.5, 0.2, r() < 0.5 ? 0x7ad9c4 : 0xa98cff, [0, 0, (r() - 0.5) * 30], true),
    backdrop: (k, r) => PROPS.rcrystal(k, { c: r() < 0.5 ? 'teal' : 'purple', s: 2 + r() * 1.5 }, r) },
  snow: { sky: [0x9fc3ea, 0xdbe8f6, 0xf6fafe], fog: 0xe8f0f9, ground: [0xeef4fb, 0xdbe7f4, 0xf8fbff, 0xcddcee], hill: 0xe4ecf6, hillH: 16,
    sun: 0xfff4e8, sunI: 2.7, hemiSky: 0xe6f0ff, hemiGround: 0xb8c8e0, hemiI: 1.25, clouds: true,
    scatter: [['snowlump', 1]], hedge: (k, r) => { PROPS.snowlump(k, {}, r); },
    backdrop: (k, r) => { const s = 4 + r() * 4; k.add('root', G.cone(1.6 * s, 3 * s, 7), { pat: PAT.cornBands, p: [0, 1.5 * s, 0] }); k.add('root', G.cone(0.75 * s, 1.35 * s, 7), { c: 0xffffff, p: [0, 2.35 * s, 0] }); } },
  gumdrop: { sky: [0xd6b8f5, 0xf3e3fb, 0xe4f6ec], fog: 0xf2e6fa, ground: [0xf3e0fb, 0xe6d2f4, 0xe0f4ea, 0xfbeefe], hill: 0xe2cff2, hillH: 8,
    sun: 0xfff0f6, sunI: 3.0, hemiSky: 0xf6e6ff, hemiGround: 0xd8c4e8, hemiI: 1.15, clouds: true,
    scatter: [['gsmall', 0.25, { c: [0xff9bd0] }], ['tuft', 0.75, { c1: 0xc9a8e6, c2: 0xa8e6c4 }]], hedge: hedgeGum,
    backdrop: (k, r, i) => PROPS.gmound(k, { c: [[0xff9bd0], [0xa8ffcf], [0xffd36e], [0x8fd4ff], [0xc26bff]][i % 5], s: 1.8 + r() * 1.6 }, r) },
  jungle: { sky: [0x1d3b2c, 0x4f8a5a, 0xa8d08a], fog: 0x4a6e50, fogNear: 30, fogFar: 100, ground: [0x2c6a45, 0x1f4a32, 0x3a7a50, 0x4f8f5a], hill: 0x1a3f2b, hillH: 9,
    sun: 0xfff2c8, sunI: 2.6, hemiSky: 0xb6e0a0, hemiGround: 0x1a3f2b, hemiI: 1.1,
    scatter: [['fern', 0.35, { s: 0.55 }], ['tuft', 0.65, { c1: 0x3f7a3a, c2: 0x6fae4f }]], hedge: (k, r) => PROPS.fern(k, { s: 0.7 }, r),
    backdrop: (k, r, i) => PROPS.vinetree(k, { c: [0xd61f7a, 0xff5d8f, 0x7c2fd8, 0xe0891e][i % 4], s: 1.6 + r() }, r) },
  choco: { sky: [0x9a6a44, 0xe8b889, 0xffe2bf], fog: 0xe6be94, ground: [0x8f6238, 0x7a5230, 0xa8794a, 0x6b4427], hill: 0x6b4427, hillH: 8,
    sun: 0xffe0b0, sunI: 3.0, hemiSky: 0xffdcb4, hemiGround: 0x5e3c20, hemiI: 1.1, clouds: true,
    scatter: [['cocoashroom', 0.3], ['tuft', 0.7, { c1: 0x8a5a32, c2: 0xb98a5a }]], hedge: (k, r) => k.add('root', G.rbox(0.6, 0.45, 0.5, 0.06), { c: r() < 0.5 ? 0x5e3a1e : 0x7a4a24, p: [0, 0.22, 0], r: [0, r() * 40, 0] }),
    backdrop: (k, r) => PROPS.choctree(k, { s: 1.6 + r() * 1.2 }, r) },
  ocean: { sky: [0x6cc6e6, 0xbfeef5, 0xfff5e0], fog: 0xcdeef5, ground: [0xf5dfb5, 0xeed2a0, 0xfbe9c8, 0xe2c894], hill: 0xd9c29a, hillH: -3, sea: 0x4fb3d9,
    sun: 0xfff6e0, sunI: 3.2, hemiSky: 0xd6f4ff, hemiGround: 0xe8d4a8, hemiI: 1.2, clouds: true,
    scatter: [['shellc', 0.4], ['pebble', 0.6]], hedge: (k, r) => PROPS.mintrock(k, { s: 0.45 + r() * 0.2 }, r),
    backdrop: (k, r, i) => (i % 2 ? PROPS.mintrock(k, { s: 2 + r() * 2 }, r) : PROPS.canecoral(k, { s: 1.5 + r() }, r)) },
  mines: { sky: [0x120c18, 0x241830, 0x4a3554], fog: 0x33243e, fogNear: 26, fogFar: 80, ground: [0x4a3554, 0x3a2a46, 0x5a4466, 0x3e2e48], hill: 0x221828, hillH: 12, underground: true,
    sun: 0xffe6c8, sunI: 2.3, hemiSky: 0xc0a4d8, hemiGround: 0x2e2238, hemiI: 1.1, exposure: 1.15,
    scatter: [['nerdpile', 0.3, { s: 0.6 }], ['pebble', 0.7, { dark: true }]], hedge: (k, r) => lumpyRock(k, 0.5 + r() * 0.3, 0x3a2e44, r),
    backdrop: (k, r, i) => (i % 3 ? lumpyRock(k, 4 + r() * 4, 0x2a2034, r) : PROPS.glowcrys(k, { c: [0xc77dff, 0x5ab8ff, 0xff5d8f, 0x7ce26a][i % 4] }, r)) },
  dunes: { sky: [0x7cb8e8, 0xffe1c4, 0xffc89a], fog: 0xffdcb8, ground: [0xffe1c4, 0xf5c79a, 0xeab27e, 0xffeedd], hill: 0xeab27e, hillH: 7,
    sun: 0xffe2b8, sunI: 3.3, hemiSky: 0xfff0e0, hemiGround: 0xd99a6a, hemiI: 1.1,
    scatter: [['deserttuft', 0.6], ['caneshards', 0.4]], hedge: (k, r) => PROPS.canestump(k, { s: 0.5 + r() * 0.2 }, r),
    backdrop: (k, r, i) => PROPS.bigcane(k, { s: 2 + r() * 1.5, f: i % 2 ? 1 : -1 }, r) },
  castle: { sky: [0x3a1430, 0x9a4a6a, 0xffb08a], fog: 0xa05a78, fogNear: 45, fogFar: 160, ground: [0xb8708e, 0xa05a78, 0xc98aa4, 0x8a4a66], hill: 0x6a2a4a, hillH: 6,
    sun: 0xffc890, sunI: 2.8, hemiSky: 0xffb8d0, hemiGround: 0x5c2440, hemiI: 1.15,
    scatter: [['caneshards', 0.3], ['pebble', 0.7]], hedge: (k, r) => k.add('root', G.rbox(1.1, 0.7, 0.6, 0.08), { c: 0xe884ab, p: [0, 0.35, 0] }),
    backdrop: (k, r, i) => PROPS.tower(k, { s: 1.4 + r() }, r) },
};
BIOMES.broccoli = { sky: [0x7fc6ea, 0xd4f0e0, 0xf4fbe6], fog: 0xdcefd4, ground: [0x6fae4f, 0x5a9a42, 0x86c264, 0xa6d680], hill: 0x5a9a42, hillH: 8,
  sun: 0xfff2d6, sunI: 3.0, hemiSky: 0xdaf0ff, hemiGround: 0x6fa850, hemiI: 1.15, clouds: true,
  scatter: [['sprouts', 0.25], ['tuft', 0.75, { c1: 0x4f8f3a, c2: 0x8fcf6a }]], hedge: (k, r) => PROPS.brocbush(k, {}, r),
  backdrop: (k, r) => PROPS.brocctree(k, { s: 2.2 + r() * 1.4, lite: true }, r) };
BIOMES.carrot = { sky: [0x7ab8e8, 0xffe6c4, 0xffd09a], fog: 0xf6d8b4, ground: [0xb07a4a, 0x9a6a3e, 0xc9905a, 0x8fbf5a], hill: 0xc97a3a, hillH: 16,
  sun: 0xffe4c0, sunI: 3.2, hemiSky: 0xfff0dc, hemiGround: 0x8a5a36, hemiI: 1.15, clouds: true,
  scatter: [['babycarrots', 0.3], ['tuft', 0.7, { c1: 0x4fa83a, c2: 0x8fcf6a }]], hedge: (k, r) => PROPS.crag(k, { s: 0.45 + r() * 0.2 }, r),
  backdrop: (k, r) => { const s = 5 + r() * 4; k.add('root', G.cone(1.5 * s, 3.2 * s, 9), { c: 0xff8a2b, p: [0, 1.6 * s, 0] }); for (let i = 1; i < 4; i++) k.add('root', G.torus(1.5 * s * (1 - i / 4), 0.05 * s, 6, 18), { c: 0xe0661a, p: [0, i * 0.8 * s, 0], r: [90, 0, 0] }); k.add('root', G.cone(0.5 * s, 0.9 * s, 9), { c: 0xfff6ea, p: [0, 2.85 * s, 0] }); } };
BIOMES.cabbage = { sky: [0x86b8e0, 0xdcecd8, 0xf2f6e6], fog: 0xd6e2cc, ground: [0x8aa878, 0x7a9468, 0x9fbf88, 0xa8a08a], hill: 0x7a766a, hillH: 20,
  sun: 0xfff0dc, sunI: 3.0, hemiSky: 0xe0eef8, hemiGround: 0x6a7a5a, hemiI: 1.15, clouds: true,
  scatter: [['cabbagesprout', 0.25], ['pebble', 0.35], ['tuft', 0.4, { c1: 0x5a8a3a, c2: 0x9fbf6a }]], hedge: (k, r) => lumpyRock(k, 0.5 + r() * 0.3, 0x8a8578, r),
  backdrop: (k, r, i) => (i % 3 ? PROPS.spire(k, { s: 3 + r() * 3 }, r) : PROPS.cabbageboulder(k, { s: 2 + r() * 1.5 }, r)) };
BIOMES.tomato = { sky: [0x6cb8e6, 0xffd9c8, 0xfff0e0], fog: 0xf6dccf, ground: [0xf5dfb5, 0xeed2a0, 0xfbe9c8, 0xe2c894], hill: 0xd9c29a, hillH: -3, sea: 0x4fb3d9,
  sun: 0xffe8d0, sunI: 3.2, hemiSky: 0xffe6dc, hemiGround: 0xe8d4a8, hemiI: 1.2, clouds: true,
  scatter: [['shellc', 0.35], ['cherrytomatoes', 0.25], ['pebble', 0.4]], hedge: (k, r) => PROPS.bigtomato(k, { s: 0.35 + r() * 0.15 }, r),
  backdrop: (k, r, i) => (i % 2 ? PROPS.tomatopalm(k, { s: 1.6 + r(), f: i % 4 ? 1 : -1 }, r) : PROPS.bigtomato(k, { s: 1.8 + r() * 1.5 }, r)) };
BIOMES.pea = { sky: [0x7cb8e8, 0xfff0c8, 0xffe0a0], fog: 0xf6e4b8, ground: [0xd9c070, 0xc9ae5a, 0xe8d48a, 0x9fbf5a], hill: 0xc9ae5a, hillH: 6,
  sun: 0xfff0c8, sunI: 3.3, hemiSky: 0xfff4dc, hemiGround: 0xa89a58, hemiI: 1.1, clouds: true,
  scatter: [['savgrass', 0.75], ['podbush', 0.1], ['pebble', 0.15]], hedge: (k, r) => PROPS.savgrass(k, {}, r),
  backdrop: (k, r, i) => (i % 3 ? PROPS.peatree(k, { s: 1.6 + r() * 1.2 }, r) : PROPS.peaboulder(k, { s: 2 + r() * 2 }, r)) };
export const biome = (kind) => BIOMES[kind] || BIOMES.forest;
