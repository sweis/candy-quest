// Seasonal events. Pure — no DOM, no three.js — so tests can check the calendar logic in node.
// Halloween runs from 3 days before to 3 days after Oct 31 (Oct 28 – Nov 3, inclusive, player's local date).
// Preview any day with ?date=YYYY-MM-DD (works without dev mode).

export const HALLOWEEN = { start: [10, 28], end: [11, 3] }; // [month, day], 1-based months

export function halloweenActive(d = new Date()) {
  const m = d.getMonth() + 1, day = d.getDate();
  return (m === 10 && day >= HALLOWEEN.start[1]) || (m === 11 && day <= HALLOWEEN.end[1]);
}
// days left in the sale (counting today), or null when it's not on
export function halloweenDaysLeft(d = new Date()) {
  if (!halloweenActive(d)) return null;
  const end = new Date(d.getMonth() + 1 === 10 ? d.getFullYear() : d.getFullYear(), 10, HALLOWEEN.end[1]); // Nov 3
  const today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((end - today) / 86400000) + 1;
}
// next sale start (for "back on Oct 28" copy)
export function nextHalloweenStart(d = new Date()) {
  let y = d.getFullYear();
  if (d.getMonth() + 1 > 11 || (d.getMonth() + 1 === 11 && d.getDate() > HALLOWEEN.end[1])) y++;
  return new Date(y, 9, HALLOWEEN.start[1]);
}
// "today" for the game: ?date=YYYY-MM-DD overrides the clock (preview / tests)
export function gameDate(search = typeof location !== 'undefined' ? location.search : '') {
  const q = new URLSearchParams(search).get('date');
  if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) { const [y, m, dd] = q.split('-').map(Number); return new Date(y, m - 1, dd); }
  return new Date();
}

// Halloween palette: every biome pulled toward pumpkin orange under a purple dusk sky.
const lerpHex = (a, b, t) => {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255, br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  return (Math.round(ar + (br - ar) * t) << 16) | (Math.round(ag + (bg - ag) * t) << 8) | Math.round(ab + (bb - ab) * t);
};
export function halloweenize(pal) {
  return {
    ...pal, halloween: true,
    sky: pal.underground ? pal.sky.map((c) => lerpHex(c, 0x2a1020, 0.4)) : [0x2c1440, 0xff8a3a, 0xffc070],
    fog: lerpHex(pal.fog, 0xd8784a, 0.6),
    ground: pal.ground.map((c, i) => lerpHex(c, [0xc8561a, 0xa8441a, 0xe07a2a, 0xffa040][i], 0.55)),
    hill: lerpHex(pal.hill, 0x6a2a2a, 0.6),
    sun: 0xffb070, sunI: (pal.sunI || 3) * 0.95,
    hemiSky: lerpHex(pal.hemiSky, 0xffa060, 0.5), hemiGround: lerpHex(pal.hemiGround, 0x5a2a1a, 0.4),
    sea: pal.sea != null ? lerpHex(pal.sea, 0x6a3a8a, 0.35) : pal.sea,
  };
}
