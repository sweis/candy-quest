// 🎃 Halloween Special — the Pumpkin Patch level. Only offered while the Halloween event is on (events.js:
// Oct 28 – Nov 3). Merged into the content tables by content.js, like Candy Quest 2.
import { ALLIES, MONSTERS, LEVELS } from './data.js';

export const HW_ALLIES = {
  pumpkin_snake: { name: 'Pumpkin Snake', sprite: 'pumpkin_snake', role: 'Spooky Striker', hp: 120, atk: 26, def: 12, speed: 1.25, range: 64, kind: 'melee' },
};
export const HW_MONSTERS = {
  pumpkin_roller: { name: 'Rolling Pumpkin', sprite: 'pumpkin_roller', hp: 200, atk: 36, def: 22, speed: 0.9, range: 58, kind: 'melee', xp: 100 },
  pumpkin_sword: { name: 'Pumpkin Swordsman', sprite: 'pumpkin_sword', hp: 220, atk: 40, def: 24, speed: 0.8, range: 62, kind: 'melee', xp: 105 },
  great_pumpkin: { name: 'The Great Pumpkin', sprite: 'great_pumpkin', hp: 1800, atk: 58, def: 36, speed: 0.66, range: 120, kind: 'melee', xp: 1500, boss: true },
};
export const HW_LEVELS = {
  16: { id: 16, quest: 'halloween', qn: 1, event: 'halloween', name: 'Pumpkin Patch', scenery: 'pumpkin', bait: 'candy_corn',
    sky: 'radial-gradient(circle at 26% 18%, #ffb347, transparent 44%), linear-gradient(165deg, #6a2a5a, #3a1438 55%, #1c0a20)',
    bossName: 'Great Pumpkin',
    enemyPool: ['pumpkin_roller', 'pumpkin_sword', 'pumpkin_roller', 'pumpkin_sword', 'pumpkin_roller', 'pumpkin_roller', 'pumpkin_sword', 'pumpkin_roller', 'pumpkin_sword', 'pumpkin_roller'],
    boss: 'great_pumpkin', wild: ['pumpkin_snake'],
    forage: ['candy_corn', 'candy_corn', 'candy_corn', 'candy_corn', 'honey', 'honey', 'glowberry', 'glowberry', 'mushroom', 'gummy_worm', 'sour_dust', 'alien_goo', 'crystal', 'star_sprinkle'] },
};
// Pumpkin Patch layout: giant pumpkins, twisted dead trees, candy gravestones, hay bales, jack-o'-lanterns
export function pumpkinScenery() {
  const s = []; const add = (t, x, y, o = {}) => s.push({ t, x, y, ...o });
  [[320, 380], [700, 320], [1120, 440], [1520, 340], [1900, 320], [520, 1180], [980, 1240], [1600, 1160], [2000, 1060]].forEach(([x, y], i) => add(i % 2 ? 'deadtree' : 'giantpumpkin', x, y, { s: 0.9 + (i % 3) * 0.2 }));
  [[460, 520], [860, 1060], [1300, 300], [1750, 980], [1420, 1100], [1080, 860]].forEach(([x, y], i) => add('gravestone', x, y, { s: 0.9 + (i % 2) * 0.2 }));
  [[640, 500], [1240, 640], [1820, 820], [420, 1080]].forEach(([x, y]) => add('haybale', x, y));
  [[360, 640], [1080, 880], [1620, 600], [840, 440], [1300, 1020], [560, 760], [1700, 700], [960, 600]].forEach(([x, y]) => add('jackolantern', x, y, { s: 1.2 }));
  [[480, 760], [1180, 540], [1700, 720], [900, 1120]].forEach(([x, y], i) => add('dirt', x, y, { s: 0.9 + (i % 3) * 0.25 }));
  return s;
}
Object.assign(ALLIES, HW_ALLIES); Object.assign(MONSTERS, HW_MONSTERS); Object.assign(LEVELS, HW_LEVELS);
