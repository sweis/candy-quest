// Item models (~0.5 m tall, bottom at y=0, centred on x/z). Used as floating world pickups and, rendered once at
// boot, as HUD/inventory icons — so the icon always matches the thing you pick up.
import { Kit, G, PAT, THREE } from './kit.js';

const W = 0xffffff;
const B = {
  lollipop(k) {
    k.add('root', G.cyl(0.022, 0.022, 0.36, 8), { c: 0xf4ece0, p: [0, 0.18, 0] });
    k.add('root', G.cyl(0.19, 0.19, 0.07, 36), { pat: PAT.swirlPink, uv: 'y', p: [0, 0.46, 0], r: [90, 0, 0] });
  },
  cotton_candy(k) {
    k.add('root', G.cone(0.06, 0.3, 10), { c: 0xe8cfa6, p: [0, 0.15, 0], r: [180, 0, 0] });
    for (const [x, y, z, r, c] of [[0, 0.42, 0, 0.16, 0xff8fbf], [-0.1, 0.38, 0.06, 0.12, 0xffd0e4], [0.1, 0.4, -0.05, 0.12, 0xc7b3ff], [0.02, 0.52, 0.02, 0.11, 0xffe3ee]]) k.add('root', G.sphere(r, 14, 10), { c, p: [x, y, z] });
  },
  rock_candy(k) {
    k.add('root', G.cyl(0.02, 0.02, 0.3, 8), { c: 0xf4ece0, p: [0, 0.15, 0] });
    for (const [x, y, z, s, c] of [[0, 0.42, 0, 1, 0x7ad9c4], [0.08, 0.36, 0.05, 0.8, 0xa98cff], [-0.07, 0.35, -0.04, 0.75, 0xd6fff4]]) k.add('root', G.oct(0.12 * s), { c, p: [x, y, z], s: [0.8, 1.5, 0.8] });
  },
  candy_corn(k) { k.add('root', G.cone(0.16, 0.44, 5), { pat: PAT.cornBands, p: [0, 0.22, 0], s: [1, 1, 0.7] }); },
  gumdrop(k) {
    k.add('root', G.lathe([[0, 0], [0.18, 0], [0.19, 0.05], [0.16, 0.22], [0.08, 0.34], [0, 0.36]], 24), { c: 0xff5da8, p: [0, 0.02, 0] });
  },
  licorice(k) {
    k.add('root', G.torus(0.13, 0.055, 10, 30), { pat: PAT.licorice, c: 0xd61f7a, p: [0, 0.3, 0] });
    k.add('root', G.cyl(0.05, 0.05, 0.12, 10), { c: 0x2a2030, p: [0, 0.3, 0], r: [90, 0, 0] });
  },
  chocolate(k) {
    k.add('root', G.rbox(0.34, 0.24, 0.08, 0.025), { c: 0x7a4a24, p: [0, 0.2, 0] });
    for (const x of [-0.1, 0, 0.1]) for (const y of [0.14, 0.26]) k.add('root', G.rbox(0.085, 0.1, 0.03, 0.012), { c: 0x8f5a2e, p: [x, y, 0.045] });
    k.add('root', G.rbox(0.36, 0.14, 0.1, 0.02), { c: 0xd9d2e6, p: [0, 0.1, 0] });
  },
  peppermint(k) {
    k.add('root', G.cyl(0.18, 0.18, 0.07, 32), { pat: PAT.mint, uv: 'y', p: [0, 0.24, 0], r: [90, 0, 0] });
    for (const s of [-1, 1]) k.add('root', G.cone(0.06, 0.1, 8), { c: 0xffeef0, p: [s * 0.23, 0.24, 0], r: [0, 0, s * 90] });
  },
  nerds(k) {
    k.add('root', G.rbox(0.2, 0.3, 0.1, 0.03), { c: 0x8a4fd0, p: [-0.06, 0.18, 0], r: [0, 0, -8] });
    for (const [x, y, c] of [[0.12, 0.08, 0xff5d8f], [0.18, 0.16, 0xffe94a], [0.1, 0.24, 0x5ab8ff], [0.2, 0.3, 0x7ce26a], [0.14, 0.38, 0xffb02e]]) k.add('root', G.sphere(0.04, 8, 6), { c, p: [x, y, 0.02], s: [1.1, 1, 1] });
  },
  cane_shard(k) {
    k.add('root', G.cyl(0.05, 0.05, 0.34, 12), { pat: PAT.caneDense, p: [-0.05, 0.2, 0], r: [0, 0, 18] });
    k.add('root', G.cyl(0.04, 0.04, 0.24, 12), { pat: PAT.caneDense, p: [0.09, 0.15, 0], r: [0, 0, -16] });
  },
  crystal(k) {
    k.add('root', G.oct(0.14), { c: 0x7ad9c4, p: [-0.04, 0.28, 0], s: [0.8, 1.7, 0.8] });
    k.add('root', G.oct(0.1), { c: 0xa98cff, p: [0.1, 0.18, 0.03], s: [0.8, 1.5, 0.8] });
  },
  mushroom(k) {
    k.add('root', G.cyl(0.06, 0.08, 0.2, 12), { c: 0xfff3e6, p: [0, 0.1, 0] });
    k.add('root', G.sphere(0.2, 20, 12), { c: 0xff5d8f, p: [0, 0.22, 0], s: [1, 0.6, 1] });
    for (const [x, z] of [[0.08, 0.1], [-0.1, 0.05], [0.02, -0.12], [0.12, -0.06]]) k.add('root', G.sphere(0.035, 8, 6), { c: W, p: [x, 0.3, z] });
  },
  acorn(k) {
    k.add('root', G.sphere(0.13, 16, 12), { c: 0xb07a44, p: [0, 0.16, 0], s: [1, 1.2, 1] });
    k.add('root', G.sphere(0.145, 16, 10), { c: 0x5e3a1e, p: [0, 0.27, 0], s: [1, 0.55, 1] });
    k.add('root', G.cyl(0.018, 0.018, 0.08, 6), { c: 0x4a2e18, p: [0, 0.37, 0] });
  },
  glowberry(k) {
    for (const [x, y, z] of [[-0.08, 0.12, 0], [0.08, 0.13, 0.03], [0, 0.26, -0.02]]) k.add('root', G.sphere(0.1, 14, 10), { c: 0x9be15d, p: [x, y, z], glow: true });
    k.add('root', G.sphere(0.07, 8, 6), { c: 0x4ba83f, p: [0.04, 0.37, 0], s: [1.5, 0.4, 0.8] });
  },
  alien_goo(k) {
    k.add('root', G.sphere(0.2, 18, 14), { c: 0x8f6bf5, p: [0, 0.18, 0], s: [1, 0.85, 1] });
    for (const s of [-1, 1]) k.add('root', G.sphere(0.04, 8, 6), { c: 0x1c0f2a, p: [0.17, 0.22, s * 0.06] });
    k.add('root', G.sphere(0.05, 8, 6), { c: 0x6b4ad6, p: [0.05, 0.02, 0.1], s: [1, 1.6, 1] });
  },
  gummy_worm(k) {
    k.add('root', G.tube([[-0.2, 0.08, 0], [-0.08, 0.16, 0.06], [0.06, 0.08, -0.04], [0.2, 0.16, 0]], 0.05, 30, 10), { pat: PAT.stripesV, c: 0xffb84d });
    k.add('root', G.sphere(0.055, 10, 8), { c: 0xff5d8f, p: [-0.2, 0.08, 0] });
  },
  honey(k) {
    k.add('root', G.lathe([[0, 0], [0.13, 0], [0.15, 0.05], [0.15, 0.24], [0.1, 0.3], [0.06, 0.32], [0, 0.32]], 24), { c: 0xffc14d });
    k.add('root', G.cyl(0.075, 0.075, 0.06, 16), { c: 0x8a5a36, p: [0, 0.35, 0] });
    k.add('root', G.rbox(0.02, 0.1, 0.16, 0.01), { c: W, p: [0.15, 0.14, 0] });
  },
  sour_dust(k) {
    k.add('root', G.cyl(0.13, 0.13, 0.26, 20), { c: 0xd6ff8f, p: [0, 0.13, 0] });
    k.add('root', G.cyl(0.135, 0.135, 0.06, 20), { c: 0x9be15d, p: [0, 0.29, 0] });
    for (const [x, z] of [[0.05, 0.02], [-0.04, -0.05], [0.0, 0.07]]) k.add('root', G.sphere(0.025, 6, 4), { c: 0xb6e64f, p: [x, 0.34, z] });
  },
  star_sprinkle(k) { k.add('root', G.extrude(G.star(0.2, 0.09), 0.06, 0.025), { c: 0xffd24d, p: [0, 0.24, 0] }); },
  sugar_vest(k) {
    k.add('root', G.lathe([[0.1, 0.02], [0.2, 0.04], [0.22, 0.2], [0.18, 0.34], [0.1, 0.4]], 22), { c: 0x6fd3bc });
    k.add('root', G.sphere(0.07, 10, 8), { c: 0x46b9a1, p: [0, 0.37, -0.14], s: [1, 0.6, 1] });
    k.add('root', G.sphere(0.07, 10, 8), { c: 0x46b9a1, p: [0, 0.37, 0.14], s: [1, 0.6, 1] });
  },
  peppermint_plate(k) {
    k.add('root', G.cyl(0.22, 0.22, 0.06, 36), { pat: PAT.mint, uv: 'y', p: [0, 0.26, 0], r: [90, 0, 0] });
    k.add('root', G.torus(0.22, 0.022, 8, 36), { c: 0xe7ebf0, p: [0, 0.26, 0] });
  },
  cane_sword(k) {
    k.add('root', G.tube([[0, 0.1, 0], [0, 0.46, 0], [0.03, 0.54, 0], [0.1, 0.55, 0], [0.13, 0.48, 0]], 0.035, 30, 10), { pat: PAT.caneDense });
    k.add('root', G.rbox(0.05, 0.03, 0.18, 0.01), { c: 0xffc93c, p: [0, 0.09, 0] });
    k.add('root', G.cyl(0.022, 0.022, 0.1, 8), { c: 0x6b4427, p: [0, 0.03, 0] });
  },
  jawbreaker_mace(k) {
    k.add('root', G.cyl(0.025, 0.025, 0.3, 8), { c: 0x7a4a24, p: [0, 0.15, 0] });
    k.add('root', G.sphere(0.15, 20, 16), { pat: PAT.swirlRainbow, uv: 'z', p: [0, 0.38, 0] });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; k.add('root', G.cone(0.03, 0.08, 6), { c: 0xe23d72, p: [Math.cos(a) * 0.16, 0.38 + Math.sin(a) * 0.16, 0], r: [0, 0, (a * 180) / Math.PI - 90] }); }
  },
  glow_gloop(k) {
    k.add('root', G.sphere(0.19, 16, 12), { c: 0x9be15d, p: [0, 0.18, 0], s: [1, 0.85, 1], glow: true });
    k.add('root', G.sphere(0.06, 8, 6), { c: 0xeaffd6, p: [-0.06, 0.26, 0.1], glow: true });
  },
  mallow_mend(k) {
    k.add('root', G.rbox(0.3, 0.14, 0.24, 0.06), { c: 0xfff5ec, p: [0, 0.08, 0] });
    k.add('root', G.rbox(0.26, 0.13, 0.2, 0.06), { c: W, p: [0, 0.21, 0] });
    k.add('root', G.extrude(G.heart(0.07), 0.03, 0.01), { c: 0xe23d72, p: [0, 0.22, 0.11] });
  },
  fizz_tonic(k) {
    k.add('root', G.lathe([[0, 0], [0.12, 0], [0.13, 0.04], [0.13, 0.24], [0.06, 0.32], [0.045, 0.4], [0, 0.4]], 22), { c: 0x7fcfff });
    k.add('root', G.cyl(0.05, 0.05, 0.05, 12), { c: 0x8a5a36, p: [0, 0.42, 0] });
    for (const [x, y] of [[0.03, 0.12], [-0.04, 0.18], [0.02, 0.25]]) k.add('root', G.sphere(0.02, 6, 4), { c: W, p: [x, y, 0.12] });
  },
  gummy_armor(k) {
    k.add('root', G.lathe([[0.1, 0.02], [0.2, 0.04], [0.23, 0.2], [0.2, 0.34], [0.1, 0.4]], 22), { c: 0xff7fa6 });
    k.add('root', G.sphere(0.08, 10, 8), { c: 0xe23d72, p: [0, 0.37, -0.15], s: [1, 0.6, 1] });
    k.add('root', G.sphere(0.08, 10, 8), { c: 0xe23d72, p: [0, 0.37, 0.15], s: [1, 0.6, 1] });
  },
  licorice_whip(k) {
    k.add('root', G.cyl(0.03, 0.03, 0.14, 8), { c: 0x2a1640, p: [-0.12, 0.08, 0], r: [0, 0, 30] });
    k.add('root', G.tube([[-0.08, 0.14, 0], [0, 0.3, 0.03], [0.14, 0.36, -0.02], [0.2, 0.24, 0.02], [0.12, 0.14, 0]], 0.025, 30, 8), { pat: PAT.licorice, c: 0xd61f7a });
  },
  rainbow_brittle(k) { k.add('root', G.extrude(G.star(0.2, 0.15, 7), 0.07, 0.02), { pat: PAT.swirlRainbow, uv: 'z', p: [0, 0.22, 0] }); },
  gummy_guard(k) {
    const s = new THREE.Shape(); s.moveTo(0, 0.22); s.lineTo(0.18, 0.15); s.lineTo(0.16, -0.05); s.quadraticCurveTo(0.08, -0.18, 0, -0.22); s.quadraticCurveTo(-0.08, -0.18, -0.16, -0.05); s.lineTo(-0.18, 0.15); s.closePath();
    k.add('root', G.extrude(s, 0.07, 0.03), { c: 0x6fd3a4, p: [0, 0.26, 0] });
  },
  sour_apple(k) { // a green hard candy in a twist wrapper
    k.add('root', G.sphere(0.17, 20, 14), { c: 0x8fdc4a, p: [0, 0.22, 0], s: [1.25, 1, 1] });
    for (const s of [-1, 1]) k.add('root', G.cone(0.1, 0.18, 10), { c: 0xe8fff0, p: [s * 0.28, 0.22, 0], r: [0, 0, s * 90] });
    k.add('root', G.sphere(0.05, 8, 6), { c: 0xffffff, p: [-0.06, 0.32, 0.1], glow: true });
  },
  carrot_pop(k) { // carrot-cake pop: cake ball, cream-cheese frosting, a tiny carrot on top
    k.add('root', G.cyl(0.018, 0.018, 0.26, 8), { c: 0xf4ece0, p: [0, 0.13, 0] });
    k.add('root', G.sphere(0.15, 16, 12), { c: 0xc98a4a, p: [0, 0.36, 0] });
    k.add('root', G.sphere(0.152, 16, 8, ), { c: 0xfff4e6, p: [0, 0.4, 0], s: [1, 0.6, 1] });
    k.add('root', G.cone(0.035, 0.12, 8), { c: 0xff8a2b, p: [0, 0.54, 0], r: [0, 0, 180] });
    k.add('root', G.sphere(0.025, 6, 4), { c: 0x6fc24f, p: [0, 0.6, 0] });
  },
  lime_gumball(k) {
    k.add('root', G.sphere(0.2, 20, 16), { c: 0x9be15d, p: [0, 0.22, 0] });
    for (const [x, y, z] of [[0.08, 0.36, 0.1], [-0.12, 0.3, 0.08], [0.1, 0.2, -0.14]]) k.add('root', G.sphere(0.03, 6, 4), { c: 0xffffff, p: [x, y, z] });
    k.add('root', G.sphere(0.05, 8, 6), { c: 0xffffff, p: [-0.07, 0.33, 0.12], glow: true });
  },
  cherry_taffy(k) {
    k.add('root', G.capsule(0.1, 0.3, 6, 12), { c: 0xe8312a, p: [0, 0.2, 0], r: [0, 0, 90] });
    k.add('root', G.torus(0.09, 0.025, 6, 16), { c: 0xffd6d0, p: [0, 0.2, 0], r: [0, 90, 0] });
    for (const s of [-1, 1]) k.add('root', G.cone(0.08, 0.12, 8), { c: 0xfff0f0, p: [s * 0.3, 0.2, 0], r: [0, 0, s * 90] });
  },
  peanut_brittle(k) {
    k.add('root', G.rbox(0.36, 0.08, 0.26, 0.03), { c: 0xe0a84a, p: [0, 0.12, 0], r: [0, 12, 6] });
    for (const [x, z] of [[-0.1, -0.05], [0.05, 0.06], [0.12, -0.07], [-0.03, 0.08]]) k.add('root', G.sphere(0.045, 8, 6), { c: 0x8fdc4a, p: [x, 0.18, z] });
  },
  coin(k) {
    k.add('root', G.cyl(0.2, 0.2, 0.05, 32), { c: 0xffc93c, p: [0, 0.25, 0], r: [90, 0, 0] });
    k.add('root', G.torus(0.2, 0.022, 8, 32), { c: 0xf0a82a, p: [0, 0.25, 0] });
    for (const sd of [-1, 1]) k.add('root', G.extrude(G.star(0.09, 0.04), 0.012, 0.004), { c: 0xffe58a, p: [0, 0.25, sd * 0.028] });
  },
  star_pop(k) {
    k.add('root', G.cyl(0.018, 0.018, 0.26, 8), { c: 0xf4ece0, p: [0, 0.13, 0] });
    k.add('root', G.extrude(G.star(0.17, 0.08), 0.06, 0.02), { c: 0xffa53c, p: [0, 0.38, 0] });
  },
};
export const ITEM_IDS = Object.keys(B);
export function itemKit(id) {
  const k = new Kit();
  (B[id] || B.cotton_candy)(k);
  return k;
}
