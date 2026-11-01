// Candy Quest 3 biome props + palettes. Registers into the shared PROPS / BIOMES / POOLS / OCCLUDERS / FLAT tables.
import { G, PAT } from './kit.js';
import { PROPS, BIOMES, POOLS, OCCLUDERS, FLAT } from './biomes.js';
import { FRUIT } from './models5.js';

const FCOL = { apple: 0xd92a2a, banana: 0xffd84a, grape: 0x7a3ad0, melon: null, berry: 0xe8203a, lemon: 0xffe14a, cherry: 0xc8102a, pine: null, blue: 0x3a4ab8 };
const canopy = (k, c, R, cols, r) => { for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; k.add('root', G.sphere(R * 0.55, 12, 9), { c: cols[i % cols.length], p: [c[0] + Math.cos(a) * R * 0.55, c[1] + (r() - 0.3) * R * 0.3, c[2] + Math.sin(a) * R * 0.5] }); } k.add('root', G.sphere(R * 0.7, 14, 10), { c: cols[0], p: [c[0], c[1] + R * 0.3, c[2]] }); };
const trunk = (k, s, h, col = 0x6a4a2a, r0 = 0.16) => k.add('root', G.tube([[0, -0.1, 0], [0.08 * s, h * 0.45 * s, 0], [-0.05 * s, h * 0.85 * s, 0.04], [0, h * s, 0]], r0 * s, 16, 8), { c: col });
const palm = (k, s, f, fruitFn) => {
  const top = [f * 0.7 * s, 3.1 * s, 0];
  k.add('root', G.tube([[0, -0.1, 0], [f * 0.15 * s, 1.2 * s, 0], [f * 0.45 * s, 2.3 * s, 0], top], 0.16 * s, 24, 10), { c: 0xb08a5a });
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2, tip = [top[0] + Math.cos(a) * 1.3 * s, top[1] - 0.45 * s, Math.sin(a) * 1.3 * s]; k.add('root', G.tube([top, [top[0] + Math.cos(a) * 0.7 * s, top[1] + 0.25 * s, Math.sin(a) * 0.7 * s], tip], 0.09 * s, 12, 6), { c: i % 2 ? 0x4f9a3a : 0x6fb84f }); }
  fruitFn(top);
};
const fruitTree = (fruit, leaves, R0 = 0.16) => (k, o, r) => {
  const s = 1.3 * (o.s || 1); trunk(k, s, 2.2, 0x6a4a2a, R0);
  canopy(k, [0, 2.6 * s, 0], 1.3 * s, leaves, r);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.4; FRUIT[fruit](k, 'root', [Math.cos(a) * 1.1 * s, 2.3 * s + (i % 2) * 0.4 * s, Math.sin(a) * 0.95 * s], 0.16 * s, FCOL[fruit]); }
};
const giant = (fruit, R = 0.85) => (k, o) => { const s = 1.3 * (o.s || 1); FRUIT[fruit](k, 'root', [0, R * 0.8 * s, 0], R * s, FCOL[fruit]); };

Object.assign(PROPS, {
  appletree: fruitTree('apple', [0x5aa83a, 0x4a9a32, 0x6fb84f]),
  giantapple: giant('apple'),
  fruitbush(k, o, r) { for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; k.add('root', G.sphere(0.32, 10, 8), { c: i % 2 ? 0x4a8a2a : 0x6aaa4a, p: [Math.cos(a) * 0.32, 0.35, Math.sin(a) * 0.32] }); } const f = o.fruit || 'apple'; for (let i = 0; i < 3; i++) { const a = r() * Math.PI * 2; FRUIT[f](k, 'root', [Math.cos(a) * 0.38, 0.5, Math.sin(a) * 0.38], 0.1, FCOL[f]); } },
  fallenfruit(k, o, r) { const f = o.fruit || 'apple'; for (let i = 0; i < 3; i++) FRUIT[f](k, 'root', [(r() - 0.5) * 0.5, 0.1, (r() - 0.5) * 0.4], 0.11, FCOL[f]); },
  bananatree(k, o, r) { const s = 1.35 * (o.s || 1), f = o.f || 1; palm(k, s, f, (top) => { for (let i = 0; i < 4; i++) FRUIT.banana(k, 'root', [top[0] + 0.1 * s, top[1] - (0.3 + i * 0.12) * s, (i - 1.5) * 0.12 * s], 0.18 * s); }); },
  bananabunch(k, o) { const s = 1.2 * (o.s || 1); for (let i = 0; i < 5; i++) FRUIT.banana(k, 'root', [0, (0.4 + i * 0.25) * s, (i - 2) * 0.22 * s], 0.5 * s); },
  grapevine(k, o, r) { const s = 1.2 * (o.s || 1); for (const x of [-1.1, 1.1]) k.add('root', G.cyl(0.08 * s, 0.09 * s, 2.4 * s, 8), { c: 0x7a5a3a, p: [x * s, 1.2 * s, 0] });
    k.add('root', G.tube([[-1.2 * s, 2.3 * s, 0], [0, 2.0 * s, 0.1], [1.2 * s, 2.3 * s, 0]], 0.07 * s, 16, 6), { c: 0x5a8a2a });
    for (let i = 0; i < 8; i++) k.add('root', G.sphere(0.28 * s, 10, 8), { c: i % 2 ? 0x4a8a2a : 0x6aaa4a, p: [(-1 + i * 0.3) * s, 2.25 * s, (r() - 0.5) * 0.3], s: [1, 0.5, 1] });
    for (const x of [-0.6, 0, 0.6]) FRUIT.grape(k, 'root', [x * s, 1.65 * s, 0.1], 0.3 * s); },
  grapebarrel(k, o) { const s = o.s || 1; k.add('root', G.lathe([[0.45, 0], [0.55, 0.5], [0.45, 1.0]].map(([a, b]) => [a * s, b * s]), 20), { c: 0x8a5a30 }); for (const y of [0.15, 0.5, 0.85]) k.add('root', G.torus(0.5 * s + (y === 0.5 ? 0.05 * s : 0), 0.025 * s, 6, 20), { c: 0x4a4a4a, p: [0, y * s, 0], r: [90, 0, 0] }); k.add('root', G.cyl(0.44 * s, 0.44 * s, 0.03, 20), { c: 0x6a3a1a, p: [0, 1.0 * s, 0] }); },
  melonpalm(k, o, r) { const s = 1.35 * (o.s || 1), f = o.f || 1; palm(k, s, f, (top) => { for (let i = 0; i < 3; i++) k.add('root', G.sphere(0.18 * s, 10, 8), { c: 0x6a4a2a, p: [top[0] + (i - 1) * 0.15 * s, top[1] - 0.25 * s, 0.05] }); }); },
  giantmelon: giant('melon', 0.95),
  berrybush(k, o, r) { const s = 1.3 * (o.s || 1); for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; k.add('root', G.sphere(0.5 * s, 12, 8), { c: i % 2 ? 0x4a9a32 : 0x6ab84a, p: [Math.cos(a) * 0.7 * s, 0.5 * s + (i % 3) * 0.2 * s, Math.sin(a) * 0.6 * s], s: [1, 0.6, 1] }); } for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; FRUIT.berry(k, 'root', [Math.cos(a) * 1.0 * s, 0.4 * s, Math.sin(a) * 0.85 * s], 0.2 * s); } for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; k.add('root', G.sphere(0.12 * s, 8, 6), { c: 0xffffff, p: [Math.cos(a) * 0.4 * s, 1.0 * s, Math.sin(a) * 0.4 * s], s: [1, 0.5, 1] }); } },
  giantberry: giant('berry', 0.8),
  lemontree: fruitTree('lemon', [0x3d8a2a, 0x5aa83a, 0x2f7a2a]),
  giantlemon: giant('lemon', 0.8),
  cherrytree: fruitTree('cherry', [0xffb3c8, 0xffd0dc, 0xff9ab8]),
  cliffrock(k, o, r) { const s = 1.3 * (o.s || 1); k.add('root', G.ico(0.7 * s, 0), { c: 0x9a7a6a, p: [0, 0.4 * s, 0], s: [1.1, 0.9, 0.9], r: [0, r() * 90, 0] }); k.add('root', G.ico(0.4 * s, 0), { c: 0xb09080, p: [0.5 * s, 0.2 * s, 0.3 * s] }); },
  pinepalm(k, o, r) { const s = 1.35 * (o.s || 1), f = o.f || 1; palm(k, s, f, (top) => { FRUIT.pine(k, 'root', [top[0], top[1] - 0.35 * s, 0.1], 0.22 * s); }); },
  lavarock(k, o, r) { const s = 1.3 * (o.s || 1); k.add('root', G.ico(0.7 * s, 0), { c: 0x3a2a2a, p: [0, 0.4 * s, 0], s: [1.1, 0.85, 0.9], r: [0, r() * 90, 0] }); for (let i = 0; i < 3; i++) k.add('root', G.capsule(0.04 * s, 0.4 * s, 3, 6), { c: 0xff5a1a, p: [(i - 1) * 0.3 * s, 0.55 * s, 0.55 * s], r: [0, 0, 30 * (i - 1)], glow: true }); },
  bogtree(k, o, r) { const s = 1.35 * (o.s || 1); trunk(k, s, 2.4, 0x4a3a30, 0.18); canopy(k, [0, 2.7 * s, 0], 1.2 * s, [0x3a5a3a, 0x2a4a3a, 0x4a6a4a], r); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; FRUIT.blue(k, 'root', [Math.cos(a) * 1.05 * s, 2.35 * s, Math.sin(a) * 0.9 * s], 0.12 * s); } for (let i = 0; i < 5; i++) { const a = r() * Math.PI * 2; k.add('root', G.capsule(0.02 * s, 0.6 * s, 2, 4), { c: 0x6a8a5a, p: [Math.cos(a) * 1.1 * s, 2.0 * s, Math.sin(a) * 0.9 * s] }); } },
  bogstump(k, o) { const s = o.s || 1; k.add('root', G.cyl(0.45 * s, 0.55 * s, 0.6 * s, 14), { c: 0x5a4030, p: [0, 0.3 * s, 0] }); k.add('root', G.sphere(0.46 * s, 12, 8), { c: 0x4a7a3a, p: [0, 0.6 * s, 0], s: [1, 0.25, 1] }); },
});
POOLS.lavapool = { color: 0xff5a1a, glow: 0xb83a0a, opacity: 1, rough: 0.4 };
for (const t of ['appletree', 'giantapple', 'bananatree', 'bananabunch', 'grapevine', 'grapebarrel', 'melonpalm', 'giantmelon', 'berrybush', 'giantberry', 'lemontree', 'giantlemon', 'cherrytree', 'cliffrock', 'pinepalm', 'lavarock', 'bogtree', 'bogstump']) OCCLUDERS.add(t);
FLAT.add('fallenfruit');

const pal = (o) => ({ sun: 0xfff0d8, sunI: 3.1, hemiSky: 0xe8f0ff, hemiI: 1.15, clouds: true, hillH: 8, ...o });
const scat = (fruit, c1, c2) => [['fallenfruit', 0.25, { fruit }], ['tuft', 0.75, { c1, c2 }]];
const hedgeBush = (fruit) => (k, r) => PROPS.fruitbush(k, { fruit }, r);
Object.assign(BIOMES, {
  q3apple: pal({ sky: [0x7cc0f0, 0xd8f0d0, 0xfff4dc], fog: 0xe0f0d8, ground: [0x7ab84a, 0x6aa83a, 0x9ac862, 0xb8d88a], hill: 0x6aa83a, hemiGround: 0x7aa84a, scatter: scat('apple', 0x4a8a2a, 0x8fcf5a), hedge: hedgeBush('apple'), backdrop: (k, r) => PROPS.appletree(k, { s: 2 + r() }, r) }),
  q3banana: pal({ sky: [0x6ab0d8, 0xd8f0c8, 0xfff8d0], fog: 0xd8ecc8, ground: [0x5a9a3a, 0x4a8a2a, 0x6aaa4a, 0x8a7a3a], hill: 0x3a6a2a, hemiGround: 0x4a7a2a, scatter: scat('banana', 0x3a7a2a, 0x6aaa4a), hedge: hedgeBush('banana'), backdrop: (k, r, i) => PROPS.bananatree(k, { s: 1.8 + r(), f: i % 2 ? 1 : -1 }, r) }),
  q3grape: pal({ sky: [0x8a90d8, 0xe8d8f0, 0xfff0e8], fog: 0xe0d8ec, ground: [0x8a9a5a, 0x7a8a4a, 0x9aaa6a, 0x8a6a8a], hill: 0x6a6a5a, hemiGround: 0x6a6a4a, scatter: scat('grape', 0x5a7a3a, 0x9aaa6a), hedge: hedgeBush('grape'), backdrop: (k, r) => PROPS.grapevine(k, { s: 1.6 + r() }, r) }),
  q3melon: pal({ sky: [0x6cc6e6, 0xbfeef5, 0xfff5e0], fog: 0xcdeef5, ground: [0xf5dfb5, 0xeed2a0, 0xfbe9c8, 0xe2c894], hill: 0xd9c29a, hillH: -3, sea: 0x4fb3d9, hemiGround: 0xe8d4a8, scatter: [['fallenfruit', 0.2, { fruit: 'melon' }], ['shellc', 0.3], ['pebble', 0.5]], hedge: (k, r) => PROPS.shellc(k, {}, r), backdrop: (k, r, i) => (i % 2 ? PROPS.melonpalm(k, { s: 1.6 + r(), f: 1 }, r) : PROPS.giantmelon(k, { s: 1.6 + r() }, r)) }),
  q3berry: pal({ sky: [0x88c8f0, 0xffe8f0, 0xfff4f4], fog: 0xf4e4ea, ground: [0x7ac24a, 0x6ab23a, 0x8ad25a, 0xc8a070], hill: 0x6ab23a, hemiGround: 0x7aa84a, scatter: scat('berry', 0x4a8a2a, 0x9ad26a), hedge: hedgeBush('berry'), backdrop: (k, r) => PROPS.berrybush(k, { s: 1.8 + r() }, r) }),
  q3lemon: pal({ sky: [0x80b8e8, 0xfff0c8, 0xffe0a0], fog: 0xf8e6b8, ground: [0xf0d890, 0xe8c878, 0xf8e4a8, 0xd8b868], hill: 0xe8c070, hillH: 7, hemiGround: 0xc8a060, sunI: 3.3, scatter: [['fallenfruit', 0.25, { fruit: 'lemon' }], ['deserttuft', 0.75]], hedge: (k, r) => PROPS.deserttuft(k, {}, r), backdrop: (k, r) => PROPS.lemontree(k, { s: 1.8 + r() }, r) }),
  q3cherry: pal({ sky: [0x8ab8e8, 0xffe0e8, 0xfff0f0], fog: 0xf0dde2, ground: [0x8aa86a, 0x7a985a, 0x9ab87a, 0xa88a7a], hill: 0x9a7a6a, hillH: 18, hemiGround: 0x7a7a5a, scatter: scat('cherry', 0x5a8a3a, 0x9ac86a), hedge: (k, r) => PROPS.cliffrock(k, { s: 0.4 }, r), backdrop: (k, r, i) => (i % 2 ? PROPS.cherrytree(k, { s: 2 + r() }, r) : PROPS.cliffrock(k, { s: 3 + r() * 2 }, r)) }),
  q3pine: pal({ sky: [0x3a2a3a, 0xc8603a, 0xffb070], fog: 0xb0705a, fogNear: 34, fogFar: 120, ground: [0x5a4a3a, 0x4a3a30, 0x6a5a40, 0x3a3030], hill: 0x2a2020, hillH: 16, sun: 0xffb080, sunI: 2.8, hemiSky: 0xffb090, hemiGround: 0x3a2a20, clouds: false, scatter: [['fallenfruit', 0.2, { fruit: 'pine' }], ['pebble', 0.8, { dark: true }]], hedge: (k, r) => PROPS.lavarock(k, { s: 0.35 }, r), backdrop: (k, r, i) => (i % 3 ? PROPS.lavarock(k, { s: 3 + r() * 3 }, r) : PROPS.pinepalm(k, { s: 1.8 + r(), f: 1 }, r)) }),
  q3bog: pal({ sky: [0x4a5a7a, 0x9ab0b8, 0xc8d8d0], fog: 0x8aa0a0, fogNear: 30, fogFar: 100, ground: [0x4a6a4a, 0x3a5a3a, 0x5a7a52, 0x4a4a6a], hill: 0x2a3a2a, hemiSky: 0xc0d0f0, hemiGround: 0x2a3a2a, clouds: false, scatter: scat('blue', 0x3a5a3a, 0x6a8a5a), hedge: hedgeBush('blue'), backdrop: (k, r) => PROPS.bogtree(k, { s: 1.8 + r() }, r) }),
  q3summit: pal({ sky: [0x7ab0e0, 0xffe8d8, 0xffd8b0], fog: 0xf0dcc8, fogNear: 46, fogFar: 160, ground: [0x8aa85a, 0x7a984a, 0xa0b86a, 0xc8a070], hill: 0x8a7a5a, hillH: 20, hemiGround: 0x6a7a4a, scatter: [['fallenfruit', 0.3, { fruit: 'apple' }], ['tuft', 0.7, { c1: 0x5a8a3a, c2: 0x9fbf6a }]], hedge: hedgeBush('cherry'), backdrop: (k, r, i) => [() => PROPS.appletree(k, { s: 2 + r() }, r), () => PROPS.giantmelon(k, { s: 2 + r() }, r), () => PROPS.cherrytree(k, { s: 2 + r() }, r), () => PROPS.lavarock(k, { s: 3 + r() * 2 }, r), () => PROPS.bananatree(k, { s: 2 + r(), f: 1 }, r)][i % 5]() }),
});
