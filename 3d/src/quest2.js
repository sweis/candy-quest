// Candy Quest 2 — new content that exists only in the 3D build. Kept out of data.js (which must stay a verbatim
// copy of the classic tables) and merged in by content.js.
import { ALLIES, MONSTERS, ITEMS, LEVELS, makeScenery } from './data.js';

export const Q2_ALLIES = {
  broccoli_axolotl: { name: 'Broccolotl', sprite: 'broccoli_axolotl', role: 'Regrower', hp: 110, atk: 10, def: 10, speed: 1.2, range: 150, kind: 'heal' },
  carrot_porcupine: { name: 'Carrot Porcupine', sprite: 'carrot_porcupine', role: 'Quill Shooter', hp: 112, atk: 22, def: 13, speed: 1.1, range: 220, kind: 'ranged' },
  tomato_stingray: { name: 'Tomato Stingray', sprite: 'tomato_stingray', role: 'Zapper', hp: 118, atk: 24, def: 12, speed: 1.3, range: 200, kind: 'ranged' },
  pea_cheetah: { name: 'Pea Cheetah', sprite: 'pea_cheetah', role: 'Sprinter', hp: 120, atk: 28, def: 12, speed: 1.6, range: 64, kind: 'melee' },
  cabbage_armadillo: { name: 'Cabbage Armadillo', sprite: 'cabbage_armadillo', role: 'Roller Tank', hp: 150, atk: 20, def: 18, speed: 0.95, range: 60, kind: 'melee' },
};
export const Q2_MONSTERS = {
  broc_brute: { name: 'Broc Brute', sprite: 'broc_brute', hp: 210, atk: 38, def: 24, speed: 0.78, range: 64, kind: 'melee', xp: 100 },
  broc_snake: { name: 'Broccoli Snake', sprite: 'broc_snake', hp: 180, atk: 36, def: 20, speed: 0.95, range: 70, kind: 'melee', xp: 96 },
  broc_king: { name: 'Broccolossus', sprite: 'broc_king', hp: 1700, atk: 58, def: 36, speed: 0.62, range: 130, kind: 'melee', xp: 1400, boss: true },
  carrot_sword: { name: 'Carrot Swordsman', sprite: 'carrot_sword', hp: 230, atk: 42, def: 26, speed: 0.8, range: 62, kind: 'melee', xp: 108 },
  carrot_chopper: { name: 'Carrot Chopper', sprite: 'carrot_chopper', hp: 280, atk: 46, def: 28, speed: 0.62, range: 96, kind: 'melee', xp: 118 },
  chopper_king: { name: 'Chopper King', sprite: 'chopper_king', hp: 1900, atk: 62, def: 38, speed: 0.6, range: 140, kind: 'melee', xp: 1550, boss: true },
  cabbage_roller: { name: 'Cabbage Roller', sprite: 'cabbage_roller', hp: 300, atk: 48, def: 30, speed: 0.9, range: 58, kind: 'melee', xp: 125 },
  cabbage_lobber: { name: 'Cabbage Lobber', sprite: 'cabbage_lobber', hp: 220, atk: 44, def: 24, speed: 0.6, range: 320, kind: 'ranged', xp: 120, proj: '#7bc24f' },
  tomato_sword: { name: 'Tomato Swordsman', sprite: 'tomato_sword', hp: 250, atk: 46, def: 28, speed: 0.8, range: 62, kind: 'melee', xp: 115 },
  tomato_archer: { name: 'Tomato Archer', sprite: 'tomato_archer', hp: 230, atk: 44, def: 25, speed: 0.6, range: 330, kind: 'ranged', xp: 118, proj: '#e8312a' },
  tomato_shark: { name: 'Giant Tomato Shark', sprite: 'tomato_shark', hp: 2200, atk: 68, def: 42, speed: 0.7, range: 140, kind: 'melee', xp: 1800, boss: true },
  pea_pip: { name: 'Pea Pip', sprite: 'pea_pip', hp: 160, atk: 38, def: 20, speed: 1.05, range: 50, kind: 'melee', xp: 72 },
  pea_launcher: { name: 'Pea Launcher', sprite: 'pea_launcher', hp: 250, atk: 48, def: 28, speed: 0.5, range: 340, kind: 'ranged', xp: 125, proj: '#8fdc4a' },
  podzilla: { name: 'Podzilla', sprite: 'podzilla', hp: 2400, atk: 72, def: 44, speed: 0.62, range: 130, kind: 'melee', xp: 1900, boss: true },
  cabbage_king: { name: 'King Coleslaw', sprite: 'cabbage_king', hp: 2100, atk: 66, def: 40, speed: 0.66, range: 120, kind: 'melee', xp: 1700, boss: true },
};
export const Q2_ITEMS = {
  sour_apple: { name: 'Sour Apple Drop', kind: 'bait', rarity: 'common', desc: 'A tart green hard candy. Broccoli Forest critters can’t resist it — offer it to tame them.' },
  lime_gumball: { name: 'Lime Gumball', kind: 'bait', rarity: 'common', desc: 'A zingy green gumball. Pass critters roll right over for it — offer it to tame them.' },
  cherry_taffy: { name: 'Cherry Taffy', kind: 'bait', rarity: 'common', desc: 'A chewy red taffy twist. Shore critters glide right up for it — offer it to tame them.' },
  peanut_brittle: { name: 'Pea-nut Brittle', kind: 'bait', rarity: 'common', desc: 'Crunchy brittle studded with sweet peas. Savannah critters sprint for it — offer it to tame them.' },
  carrot_pop: { name: 'Carrot Cake Pop', kind: 'bait', rarity: 'common', desc: 'A frosted carrot-cake pop on a stick. Mountain critters come running — offer it to tame them.' },
};
export const Q2_LEVELS = {
  11: { id: 11, quest: 2, qn: 1, name: 'Broccoli Forest', scenery: 'broccoli', bait: 'sour_apple',
    sky: 'radial-gradient(circle at 26% 18%, #d6f5c4, transparent 44%), linear-gradient(165deg, #9fd67f, #6fae4f 55%, #4f8f3a)',
    bossName: 'Broccolossus',
    enemyPool: ['broc_brute', 'broc_snake', 'broc_brute', 'broc_snake', 'broc_brute', 'broc_snake', 'broc_brute', 'broc_snake', 'broc_brute', 'broc_snake'],
    boss: 'broc_king', wild: ['broccoli_axolotl'],
    forage: ['sour_apple', 'sour_apple', 'sour_apple', 'sour_apple', 'mushroom', 'mushroom', 'glowberry', 'glowberry', 'honey', 'gummy_worm', 'sour_dust', 'acorn', 'crystal', 'star_sprinkle'] },
  12: { id: 12, quest: 2, qn: 2, name: 'Carrot Mountains', scenery: 'carrot', bait: 'carrot_pop',
    sky: 'radial-gradient(circle at 26% 18%, #ffe8c8, transparent 44%), linear-gradient(165deg, #ffcf94, #e9924a 55%, #9a5a2a)',
    bossName: 'Chopper King',
    enemyPool: ['carrot_sword', 'carrot_chopper', 'carrot_sword', 'carrot_chopper', 'carrot_sword', 'carrot_sword', 'carrot_chopper', 'carrot_sword', 'carrot_chopper', 'carrot_sword'],
    boss: 'chopper_king', wild: ['carrot_porcupine'],
    forage: ['carrot_pop', 'carrot_pop', 'carrot_pop', 'carrot_pop', 'honey', 'honey', 'acorn', 'acorn', 'glowberry', 'mushroom', 'gummy_worm', 'sour_dust', 'crystal', 'star_sprinkle'] },
  13: { id: 13, quest: 2, qn: 3, name: 'Cabbage Boulder Pass', scenery: 'cabbage', bait: 'lime_gumball',
    sky: 'radial-gradient(circle at 26% 18%, #e4f5d8, transparent 44%), linear-gradient(165deg, #b8d8a0, #8aa878 55%, #5f7a58)',
    bossName: 'King Coleslaw',
    enemyPool: ['cabbage_roller', 'cabbage_lobber', 'cabbage_roller', 'cabbage_lobber', 'cabbage_roller', 'cabbage_roller', 'cabbage_lobber', 'cabbage_roller', 'cabbage_lobber', 'cabbage_roller'],
    boss: 'cabbage_king', wild: ['cabbage_armadillo'],
    forage: ['lime_gumball', 'lime_gumball', 'lime_gumball', 'lime_gumball', 'honey', 'glowberry', 'glowberry', 'mushroom', 'mushroom', 'gummy_worm', 'sour_dust', 'alien_goo', 'crystal', 'star_sprinkle'] },
  14: { id: 14, quest: 2, qn: 4, name: 'Tomato Shores', scenery: 'tomato', bait: 'cherry_taffy',
    sky: 'radial-gradient(circle at 26% 18%, #fff0dc, transparent 44%), linear-gradient(165deg, #ffd9b8, #f09a7a 55%, #d95a4a)',
    bossName: 'Giant Tomato Shark',
    enemyPool: ['tomato_sword', 'tomato_archer', 'tomato_sword', 'tomato_archer', 'tomato_sword', 'tomato_sword', 'tomato_archer', 'tomato_sword', 'tomato_archer', 'tomato_sword'],
    boss: 'tomato_shark', wild: ['tomato_stingray'],
    forage: ['cherry_taffy', 'cherry_taffy', 'cherry_taffy', 'cherry_taffy', 'gummy_worm', 'gummy_worm', 'honey', 'glowberry', 'sour_dust', 'alien_goo', 'mushroom', 'acorn', 'crystal', 'star_sprinkle'] },
  15: { id: 15, quest: 2, qn: 5, name: 'Pea Savannah', scenery: 'pea', bait: 'peanut_brittle',
    sky: 'radial-gradient(circle at 26% 18%, #fff6d6, transparent 44%), linear-gradient(165deg, #f2dc8a, #cfb85a 55%, #8fae4a)',
    bossName: 'Podzilla',
    enemyPool: ['pea_pip', 'pea_pip', 'pea_launcher', 'pea_pip', 'pea_pip', 'pea_launcher', 'pea_pip', 'pea_pip', 'pea_launcher', 'pea_pip', 'pea_pip', 'pea_launcher'],
    boss: 'podzilla', wild: ['pea_cheetah'],
    forage: ['peanut_brittle', 'peanut_brittle', 'peanut_brittle', 'peanut_brittle', 'honey', 'honey', 'acorn', 'glowberry', 'mushroom', 'gummy_worm', 'sour_dust', 'alien_goo', 'crystal', 'star_sprinkle'] },
};

// Broccoli Forest layout (world px), in the same style as the classic makeScenery()
function broccoliScenery() {
  const s = []; const add = (t, x, y, o = {}) => s.push({ t, x, y, ...o });
  [[320, 380], [700, 320], [1120, 440], [1520, 340], [1900, 320], [520, 1180], [980, 1240], [1600, 1160], [2000, 1060]].forEach(([x, y], i) => add('brocctree', x, y, { s: 0.9 + (i % 3) * 0.2 }));
  [[360, 640], [1080, 880], [1620, 600], [840, 440], [1440, 1100]].forEach(([x, y]) => add('brocbush', x, y));
  [[640, 520], [1240, 660], [1820, 840], [420, 1060]].forEach(([x, y], i) => add('caulirock', x, y, { s: 0.8 + (i % 2) * 0.4 }));
  [[480, 760], [1180, 540], [1700, 720], [900, 1120], [1360, 1000]].forEach(([x, y]) => add('peapod', x, y));
  [[560, 620], [900, 620], [1300, 880], [1700, 480], [420, 900], [1140, 1020], [820, 880], [1560, 520]].forEach(([x, y]) => add('sprouts', x, y));
  [[480, 560], [1180, 760], [1700, 520], [900, 1120]].forEach(([x, y], i) => add('dirt', x, y, { s: 0.8 + (i % 3) * 0.25 }));
  add('bog', 540, 900);
  return s;
}
// Carrot Mountains layout: giant carrots stand in for peaks, rocky crags, leafy carrot-top bushes, a mountain spring
function carrotScenery() {
  const s = []; const add = (t, x, y, o = {}) => s.push({ t, x, y, ...o });
  [[320, 380], [700, 320], [1120, 440], [1520, 340], [1900, 320], [520, 1180], [980, 1240], [1600, 1160], [2000, 1060]].forEach(([x, y], i) => add('carrotpeak', x, y, { s: 0.9 + (i % 3) * 0.22 }));
  [[640, 520], [1240, 660], [1820, 840], [420, 1060], [1440, 1100]].forEach(([x, y], i) => add('crag', x, y, { s: 0.8 + (i % 2) * 0.45 }));
  [[360, 640], [1080, 880], [1620, 600], [840, 440], [1300, 1020]].forEach(([x, y]) => add('carrottop', x, y));
  [[480, 760], [1180, 540], [1700, 720], [900, 1120], [1500, 480], [260, 980]].forEach(([x, y]) => add('babycarrots', x, y));
  [[600, 560], [1300, 700], [1860, 900], [400, 1000], [1100, 1060]].forEach(([x, y], i) => add('dirt', x, y, { s: 0.9 + (i % 3) * 0.3 }));
  add('spring', 560, 900);
  return s;
}
// Cabbage Boulder Pass: a rocky mountain pass littered with giant cabbage boulders and rock spires
function cabbageScenery() {
  const s = []; const add = (t, x, y, o = {}) => s.push({ t, x, y, ...o });
  [[320, 380], [700, 320], [1120, 440], [1520, 340], [1900, 320], [520, 1180], [980, 1240], [1600, 1160], [2000, 1060]].forEach(([x, y], i) => add('cabbageboulder', x, y, { s: 0.85 + (i % 3) * 0.22 }));
  [[460, 520], [860, 1060], [1300, 300], [1750, 980], [200, 900], [1420, 1100]].forEach(([x, y], i) => add('spire', x, y, { s: 0.9 + (i % 2) * 0.3 }));
  [[640, 500], [1240, 640], [1820, 820], [420, 1080], [1080, 860]].forEach(([x, y], i) => add('stone', x, y, { s: 0.8 + (i % 2) * 0.5 }));
  [[360, 640], [1080, 880], [1620, 600], [840, 440], [1300, 1020]].forEach(([x, y]) => add('cabbagesprout', x, y));
  [[520, 600], [1180, 720], [660, 980], [1740, 560], [1380, 1080], [300, 720]].forEach(([x, y]) => add('pebble', x, y));
  add('brook', 560, 900);
  return s;
}
// Tomato Shores: a beach of tomato-vine palms, half-buried giant tomatoes, shells and tide pools
function tomatoScenery() {
  const s = []; const add = (t, x, y, o = {}) => s.push({ t, x, y, ...o });
  [[320, 380], [700, 320], [1120, 440], [1520, 340], [1900, 320], [520, 1180], [980, 1240], [1600, 1160], [2000, 1060]].forEach(([x, y], i) => add('tomatopalm', x, y, { s: 0.9 + (i % 3) * 0.2, f: i % 2 ? 1 : -1 }));
  [[640, 520], [1240, 660], [1820, 840], [420, 1060], [1440, 1100]].forEach(([x, y], i) => add('bigtomato', x, y, { s: 0.8 + (i % 2) * 0.45 }));
  [[360, 640], [1080, 880], [1620, 600], [840, 440], [1300, 1020]].forEach(([x, y]) => add('shellc', x, y));
  [[480, 760], [1180, 540], [1700, 720], [900, 1120], [1500, 480], [260, 980]].forEach(([x, y], i) => add('foam', x, y, { s: 0.8 + (i % 3) * 0.3 }));
  [[560, 620], [1300, 880], [1720, 520], [820, 900]].forEach(([x, y]) => add('cherrytomatoes', x, y));
  [[540, 900], [1560, 860]].forEach(([x, y]) => add('tidepool', x, y));
  return s;
}
// Pea Savannah: golden grass, pea-vine acacias, pod bushes, round pea boulders and a watering hole
function peaScenery() {
  const s = []; const add = (t, x, y, o = {}) => s.push({ t, x, y, ...o });
  [[320, 380], [760, 320], [1180, 440], [1580, 340], [1960, 320], [540, 1180], [1020, 1240], [1640, 1160]].forEach(([x, y], i) => add('peatree', x, y, { s: 0.9 + (i % 3) * 0.22 }));
  [[640, 520], [1240, 660], [1820, 840], [420, 1060], [1440, 1100]].forEach(([x, y], i) => add('peaboulder', x, y, { s: 0.8 + (i % 2) * 0.45 }));
  [[360, 640], [1080, 880], [1620, 600], [840, 440], [1300, 1020]].forEach(([x, y]) => add('podbush', x, y));
  [[480, 760], [1180, 540], [1700, 720], [900, 1120], [1500, 480], [260, 980], [1100, 700], [700, 900]].forEach(([x, y]) => add('savgrass', x, y));
  [[600, 560], [1300, 700], [1860, 900], [400, 1000], [1100, 1060]].forEach(([x, y], i) => add('dune', x, y, { s: 0.6 + (i % 3) * 0.2 }));
  add('waterhole', 560, 900);
  return s;
}
const SCENERY = { broccoli: broccoliScenery, carrot: carrotScenery, cabbage: cabbageScenery, tomato: tomatoScenery, pea: peaScenery };
export const sceneryFor = (kind) => (SCENERY[kind] ? SCENERY[kind]() : makeScenery(kind));

Object.assign(ALLIES, Q2_ALLIES); Object.assign(MONSTERS, Q2_MONSTERS); Object.assign(ITEMS, Q2_ITEMS); Object.assign(LEVELS, Q2_LEVELS);

export const QUESTS = [{ n: 1, title: 'Quest 1', blurb: 'Stop the Hichew King. Clear a level to unlock the next.' },
  { n: 2, title: 'Candy Quest 2', blurb: 'The veggies strike back. New levels unlock as they’re built.' }];
export const questOf = (L) => L.quest || 1;
