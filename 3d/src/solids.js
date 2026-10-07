// Solid obstacles per level, in world px: circles derived from the classic scenery layout (makeScenery) with radii
// matched to the 3D props' footprints. Pure data — the sim uses it for collision; no three.js here.
import { sceneryFor, LEVELS } from './content.js';

// footprint radius in px (s = the prop's scale); null/absent = walkable (flat decals, tufts, pools, small scatter)
const R = {
  lolli: () => 10, cane: () => 8, bush: () => 30, rock: (s) => 30 * s,
  rcrystal: (s) => 44 * s, stala: () => 24, stone: (s) => 33 * s,
  ccboulder: (s) => 56 * s, pine: () => 34,
  gmound: (s) => 58 * s, gcluster: () => 40,
  vinetree: (s) => 17 * s, choctree: (s) => 20 * s, fudge: (s) => 38 * s, wafer: () => 25,
  canecoral: (s) => 40 * s, mintrock: (s) => 44 * s,
  orerock: (s) => 40 * s, cart: () => 44, glowcrys: () => 12,
  bigcane: (s) => 14 * s, canestump: (s) => 14 * s,
  brocctree: (s) => 22 * s, brocbush: () => 30, caulirock: (s) => 40 * s,
  carrotpeak: (s) => 46 * s, crag: (s) => 38 * s,
  cabbageboulder: (s) => 62 * s, spire: (s) => 34 * s,
  tomatopalm: (s) => 12 * s, bigtomato: (s) => 46 * s, peatree: (s) => 12 * s, peaboulder: (s) => 38 * s, podbush: () => 22,
  giantpumpkin: (s) => 70 * s, deadtree: (s) => 14 * s, gravestone: (s) => 22 * s, haybale: () => 36, scarecrow: () => 10, cornstalk: (s) => 22 * s,
  tower: (s) => 74 * s, banner: () => 7, chewblock: (s) => 48 * s, brazier: () => 14,
};

export function solidsFor(level) {
  const L = LEVELS[level] || LEVELS[1];
  const out = [];
  for (const o of sceneryFor(L.scenery)) {
    const s = o.s || 1;
    if (o.t === 'beam') { const d = 71 * s; out.push({ x: o.x - d, y: o.y, r: 10, t: 'beam' }, { x: o.x + d, y: o.y, r: 10, t: 'beam' }); continue; }
    if (o.t === 'wall') { for (let i = 0; i < 7; i++) out.push({ x: o.x - 120 + i * 40, y: o.y - 2, r: 24, t: 'wall' }); continue; }
    const f = R[o.t]; if (f) out.push({ x: o.x, y: o.y, r: f(s), t: o.t });
  }
  // Candy Gate pillars (the gate itself stays walkable — you win by stepping into it)
  for (const d of [-72, 72]) out.push({ x: 2080 + d, y: 720, r: 18, t: 'gate' });
  return out;
}
