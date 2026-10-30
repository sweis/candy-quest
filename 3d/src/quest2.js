// Candy Quest 2 — new content that exists only in the 3D build. Kept out of data.js (which must stay a verbatim
// copy of the classic tables) and merged in by content.js.
import { ALLIES, MONSTERS, ITEMS, LEVELS, makeScenery } from './data.js';

export const Q2_ALLIES = {
  broccoli_axolotl: { name: 'Broccolotl', sprite: 'broccoli_axolotl', role: 'Regrower', hp: 110, atk: 10, def: 10, speed: 1.2, range: 150, kind: 'heal' },
  carrot_porcupine: { name: 'Carrot Porcupine', sprite: 'carrot_porcupine', role: 'Quill Shooter', hp: 112, atk: 22, def: 13, speed: 1.1, range: 220, kind: 'ranged' },
  tomato_stingray: { name: 'Tomato Stingray', sprite: 'tomato_stingray', role: 'Zapper', hp: 118, atk: 24, def: 12, speed: 1.3, range: 200, kind: 'ranged' },
  pea_cheetah: { name: 'Pea Cheetah', sprite: 'pea_cheetah', role: 'Sprinter', hp: 120, atk: 28, def: 12, speed: 1.6, range: 64, kind: 'melee' },
  cauli_frog: { name: 'Cauliflower Frog', sprite: 'cauli_frog', role: 'Hopper', hp: 125, atk: 26, def: 14, speed: 1.35, range: 64, kind: 'melee' },
  corn_bull: { name: 'Corn Bull', sprite: 'corn_bull', role: 'Charger', hp: 160, atk: 30, def: 18, speed: 1.15, range: 66, kind: 'melee' },
  pepper_lobster: { name: 'Pepper Lobster', sprite: 'pepper_lobster', role: 'Pincher', hp: 135, atk: 30, def: 16, speed: 1.2, range: 64, kind: 'melee' },
  mushroom_bunny: { name: 'Mushroom Bunny', sprite: 'mushroom_bunny', role: 'Bouncer', hp: 130, atk: 26, def: 15, speed: 1.4, range: 64, kind: 'melee' },
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
  cauli_roller: { name: 'Cauliflower Roller', sprite: 'cauli_roller', hp: 320, atk: 52, def: 32, speed: 0.9, range: 58, kind: 'melee', xp: 130 },
  cauli_launcher: { name: 'Cauliflower Launcher', sprite: 'cauli_launcher', hp: 260, atk: 50, def: 28, speed: 0.5, range: 340, kind: 'ranged', xp: 128, proj: '#f6f1dc' },
  cauli_king: { name: 'King Cauliflower', sprite: 'cauli_king', hp: 2600, atk: 76, def: 46, speed: 0.66, range: 125, kind: 'melee', xp: 2000, boss: true },
  corn_basher: { name: 'Corn Basher', sprite: 'corn_basher', hp: 340, atk: 55, def: 34, speed: 0.8, range: 70, kind: 'melee', xp: 135 },
  corn_colonel: { name: 'Corn Colonel', sprite: 'corn_colonel', hp: 270, atk: 52, def: 30, speed: 0.6, range: 340, kind: 'ranged', xp: 132, proj: '#ffe06a' },
  cob_crusher: { name: 'Cob Crusher', sprite: 'cob_crusher', hp: 2800, atk: 80, def: 48, speed: 0.64, range: 135, kind: 'melee', xp: 2100, boss: true },
  pepper_swinger: { name: 'Pepper Swinger', sprite: 'pepper_swinger', hp: 360, atk: 58, def: 36, speed: 0.75, range: 90, kind: 'melee', xp: 140 },
  pepper_thrower: { name: 'Pepper Thrower', sprite: 'pepper_thrower', hp: 280, atk: 54, def: 30, speed: 0.6, range: 330, kind: 'ranged', xp: 136, proj: '#e8301e' },
  pepper_wizard: { name: 'Habanero Sorcerer', sprite: 'pepper_wizard', hp: 2600, atk: 70, def: 44, speed: 0.55, range: 360, kind: 'ranged', xp: 2200, boss: true, proj: '#ff6a1a' },
  mush_rammer: { name: 'Mushroom Rammer', sprite: 'mush_rammer', hp: 300, atk: 55, def: 30, speed: 0.9, range: 60, kind: 'melee', xp: 140 },
  mush_hopper: { name: 'Mushroom Hopper', sprite: 'mush_hopper', hp: 220, atk: 48, def: 24, speed: 1.1, range: 52, kind: 'melee', xp: 130 },
  mush_boss: { name: 'Mushroom Monarch', sprite: 'mush_boss', hp: 2000, atk: 60, def: 40, speed: 0.66, range: 125, kind: 'melee', xp: 2000, boss: true },
  veggie_king: { name: 'Veggie King', sprite: 'veggie_king', hp: 2400, atk: 62, def: 40, speed: 0.68, range: 120, kind: 'melee', xp: 2500, boss: true },
  cabbage_king: { name: 'King Coleslaw', sprite: 'cabbage_king', hp: 2100, atk: 66, def: 40, speed: 0.66, range: 120, kind: 'melee', xp: 1700, boss: true },
};
export const Q2_ITEMS = {
  sour_apple: { name: 'Sour Apple Drop', kind: 'bait', rarity: 'common', desc: 'A tart green hard candy. Broccoli Forest critters can’t resist it — offer it to tame them.' },
  lime_gumball: { name: 'Lime Gumball', kind: 'bait', rarity: 'common', desc: 'A zingy green gumball. Pass critters roll right over for it — offer it to tame them.' },
  cherry_taffy: { name: 'Cherry Taffy', kind: 'bait', rarity: 'common', desc: 'A chewy red taffy twist. Shore critters glide right up for it — offer it to tame them.' },
  peanut_brittle: { name: 'Pea-nut Brittle', kind: 'bait', rarity: 'common', desc: 'Crunchy brittle studded with sweet peas. Savannah critters sprint for it — offer it to tame them.' },
  marshmallow: { name: 'Vanilla Marshmallow', kind: 'bait', rarity: 'common', desc: 'A pillowy white marshmallow. Field critters hop right over — offer it to tame them.' },
  popcorn_ball: { name: 'Caramel Popcorn Ball', kind: 'bait', rarity: 'common', desc: 'A sticky caramel popcorn ball. Corn Forest critters stampede for it — offer it to tame them.' },
  fireball: { name: 'Cinnamon Fireball', kind: 'bait', rarity: 'common', desc: 'A red-hot cinnamon candy. Pepper Forest critters love the heat — offer it to tame them.' },
  truffle: { name: 'Chocolate Truffle', kind: 'bait', rarity: 'common', desc: 'A cocoa-dusted chocolate truffle. Mushroom Grounds critters sniff it out — offer it to tame them.' },
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
  17: { id: 17, quest: 2, qn: 6, name: 'Cauliflower Field', scenery: 'cauli', bait: 'marshmallow',
    sky: 'radial-gradient(circle at 26% 18%, #fffbea, transparent 44%), linear-gradient(165deg, #e8f0d0, #a8c06a 55%, #7a9a4a)',
    bossName: 'King Cauliflower',
    enemyPool: ['cauli_roller', 'cauli_launcher', 'cauli_roller', 'cauli_launcher', 'cauli_roller', 'cauli_roller', 'cauli_launcher', 'cauli_roller', 'cauli_launcher', 'cauli_roller'],
    boss: 'cauli_king', wild: ['cauli_frog'],
    forage: ['marshmallow', 'marshmallow', 'marshmallow', 'marshmallow', 'honey', 'glowberry', 'glowberry', 'mushroom', 'mushroom', 'gummy_worm', 'sour_dust', 'alien_goo', 'crystal', 'star_sprinkle'] },
  18: { id: 18, quest: 2, qn: 7, name: 'Corn Forest', scenery: 'corn', bait: 'popcorn_ball',
    sky: 'radial-gradient(circle at 26% 18%, #fff4c8, transparent 44%), linear-gradient(165deg, #ffe8a0, #c8aa62 55%, #8a7a3a)',
    bossName: 'Cob Crusher',
    enemyPool: ['corn_basher', 'corn_colonel', 'corn_basher', 'corn_colonel', 'corn_basher', 'corn_basher', 'corn_colonel', 'corn_basher', 'corn_colonel', 'corn_basher'],
    boss: 'cob_crusher', wild: ['corn_bull'],
    forage: ['popcorn_ball', 'popcorn_ball', 'popcorn_ball', 'popcorn_ball', 'honey', 'honey', 'acorn', 'glowberry', 'mushroom', 'gummy_worm', 'sour_dust', 'alien_goo', 'crystal', 'star_sprinkle'] },
  19: { id: 19, quest: 2, qn: 8, name: 'Pepper Forest', scenery: 'pepper', bait: 'fireball',
    sky: 'radial-gradient(circle at 26% 18%, #ffe0c0, transparent 44%), linear-gradient(165deg, #ffb08a, #d9502a 55%, #6a8a2a)',
    bossName: 'Habanero Sorcerer',
    enemyPool: ['pepper_swinger', 'pepper_thrower', 'pepper_swinger', 'pepper_thrower', 'pepper_swinger', 'pepper_swinger', 'pepper_thrower', 'pepper_swinger', 'pepper_thrower', 'pepper_swinger'],
    boss: 'pepper_wizard', wild: ['pepper_lobster'],
    forage: ['fireball', 'fireball', 'fireball', 'fireball', 'honey', 'honey', 'glowberry', 'glowberry', 'mushroom', 'gummy_worm', 'sour_dust', 'alien_goo', 'crystal', 'star_sprinkle'] },
  20: { id: 20, quest: 2, qn: 9, name: 'Mushroom Grounds', scenery: 'mushroom', bait: 'truffle',
    sky: 'radial-gradient(circle at 26% 18%, #e8d8ff, transparent 44%), linear-gradient(165deg, #9ab8c8, #6a7a9a 55%, #4a5a3a)',
    bossName: 'Mushroom Monarch',
    enemyPool: ['mush_rammer', 'mush_hopper', 'mush_rammer', 'mush_hopper', 'mush_hopper', 'mush_rammer', 'mush_hopper', 'mush_rammer', 'mush_hopper', 'mush_rammer'],
    boss: 'mush_boss', wild: ['mushroom_bunny'],
    forage: ['truffle', 'truffle', 'truffle', 'truffle', 'mushroom', 'mushroom', 'glowberry', 'glowberry', 'honey', 'gummy_worm', 'sour_dust', 'alien_goo', 'crystal', 'star_sprinkle'] },
  // the Quest 2 finale: like Quest 1's Final Battle — every pet fights, 5 of each Candy Quest 2 monster
  21: { id: 21, quest: 2, qn: 10, name: 'Mixed Veggie Mountain', scenery: 'veggiemtn', bait: 'sour_apple', allPets: true,
    sky: 'radial-gradient(circle at 26% 18%, #fff0c8, transparent 44%), linear-gradient(165deg, #b8d88a, #e0904a 55%, #6a4a8a)',
    bossName: 'Veggie King', enemyPool: [], boss: 'veggie_king', wild: [],
    forage: ['honey', 'honey', 'honey', 'glowberry', 'glowberry', 'mallow_mend', 'mallow_mend', 'gummy_worm', 'sour_dust', 'alien_goo', 'crystal', 'crystal', 'star_sprinkle', 'star_sprinkle'] },
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
// Cauliflower Field: furrowed farmland with rows of cauliflowers, creamy boulders and scarecrows
function cauliScenery() {
  const s = []; const add = (t, x, y, o = {}) => s.push({ t, x, y, ...o });
  [[320, 380], [1120, 440], [1900, 320], [980, 1240], [2000, 1060]].forEach(([x, y]) => add('scarecrow', x, y));
  [[700, 320], [1520, 340], [520, 1180], [1600, 1160], [640, 520], [1240, 660], [1820, 840]].forEach(([x, y], i) => add('caulirock', x, y, { s: 0.9 + (i % 3) * 0.25 }));
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { if ((r + c) % 3 === 0) continue; add('cauliplant', 420 + c * 220 + (r % 2) * 90, 560 + r * 150); }
  [[600, 520], [1000, 820], [1400, 600], [800, 1100], [1700, 980]].forEach(([x, y], i) => add('dirt', x, y, { s: 1.0 + (i % 3) * 0.3 }));
  add('pond', 560, 900);
  return s;
}
// Corn Forest: towering cornstalk clusters, hay bales, scarecrows
function cornScenery() {
  const s = []; const add = (t, x, y, o = {}) => s.push({ t, x, y, ...o });
  [[320, 380], [700, 320], [1120, 440], [1520, 340], [1900, 320], [520, 1180], [980, 1240], [1600, 1160], [2000, 1060], [860, 700], [1380, 820], [1760, 620]].forEach(([x, y], i) => add('cornstalk', x, y, { s: 0.9 + (i % 3) * 0.2 }));
  [[640, 520], [1240, 640], [1820, 840], [420, 1060]].forEach(([x, y]) => add('haybale', x, y));
  [[360, 640], [1300, 1020]].forEach(([x, y]) => add('scarecrow', x, y));
  [[480, 760], [1180, 540], [1700, 720], [900, 1120], [1500, 480]].forEach(([x, y]) => add('savgrass', x, y));
  [[600, 560], [1300, 700], [1860, 900], [400, 1000], [1100, 1060]].forEach(([x, y], i) => add('dirt', x, y, { s: 0.9 + (i % 3) * 0.3 }));
  return s;
}
// Pepper Forest: pepper trees hung with bell peppers and chilis, giant pepper boulders, chili bushes, a salsa pool
function pepperScenery() {
  const s = []; const add = (t, x, y, o = {}) => s.push({ t, x, y, ...o });
  [[320, 380], [700, 320], [1120, 440], [1520, 340], [1900, 320], [520, 1180], [980, 1240], [1600, 1160], [2000, 1060]].forEach(([x, y], i) => add('peppertree', x, y, { s: 0.9 + (i % 3) * 0.2 }));
  [[640, 520], [1240, 660], [1820, 840], [420, 1060], [1440, 1100]].forEach(([x, y], i) => add('bellboulder', x, y, { s: 0.8 + (i % 2) * 0.45, c: i % 3 }));
  [[360, 640], [1080, 880], [1620, 600], [840, 440], [1300, 1020]].forEach(([x, y]) => add('chilibush', x, y));
  [[480, 760], [1180, 540], [1700, 720], [900, 1120], [1500, 480], [260, 980]].forEach(([x, y]) => add('chilis', x, y));
  [[600, 560], [1300, 700], [1860, 900], [400, 1000]].forEach(([x, y], i) => add('dirt', x, y, { s: 0.9 + (i % 3) * 0.3 }));
  add('salsapool', 560, 900);
  return s;
}
// Mushroom Grounds: a misty glade of giant mushroom trees, mossy logs, fairy rings and glowing toadstools
function mushroomScenery() {
  const s = []; const add = (t, x, y, o = {}) => s.push({ t, x, y, ...o });
  [[320, 380], [700, 320], [1120, 440], [1520, 340], [1900, 320], [520, 1180], [980, 1240], [1600, 1160], [2000, 1060]].forEach(([x, y], i) => add('mushtree', x, y, { s: 0.9 + (i % 3) * 0.22, c: i % 3 }));
  [[640, 520], [1240, 660], [1820, 840], [420, 1060]].forEach(([x, y], i) => add('mosslog', x, y, { s: 0.9 + (i % 2) * 0.3 }));
  [[360, 640], [1080, 880], [1620, 600], [840, 440], [1300, 1020], [1440, 1100]].forEach(([x, y], i) => add('toadstools', x, y, { c: i % 3 }));
  [[880, 700], [1500, 760]].forEach(([x, y]) => add('fairyring', x, y));
  [[480, 760], [1180, 540], [1700, 720], [900, 1120]].forEach(([x, y], i) => add('dirt', x, y, { s: 0.9 + (i % 3) * 0.25 }));
  add('pond', 560, 900);
  return s;
}
// Mixed Veggie Mountain (3000×2000, like the Final Battle): landmarks from every Candy Quest 2 biome
function veggieMountainScenery() {
  const s = []; const add = (t, x, y, o = {}) => s.push({ t, x, y, ...o });
  const big = ['brocctree', 'carrotpeak', 'cabbageboulder', 'tomatopalm', 'peatree', 'caulirock', 'cornstalk', 'peppertree', 'mushtree'];
  const small = ['brocbush', 'carrottop', 'cabbagesprout', 'bigtomato', 'podbush', 'cauliplant', 'haybale', 'bellboulder', 'toadstools'];
  let i = 0;
  for (let gy = 0; gy < 4; gy++) for (let gx = 0; gx < 6; gx++) {
    const x = 300 + gx * 480 + (gy % 2) * 200, y = 300 + gy * 440;
    if (Math.hypot(x - 200, y - 760) < 380 || Math.hypot(x - 2080, y - 720) < 260 || Math.hypot(x - 1860, y - 730) < 240) continue; // keep start, gate, boss clear
    add(big[i % big.length], x, y, { s: 0.9 + (i % 3) * 0.2, c: i % 3, f: i % 2 ? 1 : -1 });
    add(small[i % small.length], x + 200, y + 180, { c: i % 3 });
    i++;
  }
  [[700, 1500], [2300, 1600], [1500, 1200]].forEach(([x, y], j) => add('dirt', x, y, { s: 1.2 + j * 0.2 }));
  add('pond', 900, 1100);
  return s;
}
const SCENERY = { veggiemtn: veggieMountainScenery, mushroom: mushroomScenery, pepper: pepperScenery, broccoli: broccoliScenery, carrot: carrotScenery, cabbage: cabbageScenery, tomato: tomatoScenery, pea: peaScenery, cauli: cauliScenery, corn: cornScenery };
export const sceneryFor = (kind) => (SCENERY[kind] ? SCENERY[kind]() : makeScenery(kind));

Q2_LEVELS[21].enemyPool = Object.entries(Q2_MONSTERS).filter(([, m]) => !m.boss).flatMap(([k]) => [k, k, k, k, k]);
Object.assign(ALLIES, Q2_ALLIES); Object.assign(MONSTERS, Q2_MONSTERS); Object.assign(ITEMS, Q2_ITEMS); Object.assign(LEVELS, Q2_LEVELS);

export const QUESTS = [{ n: 1, title: 'Quest 1', blurb: 'Stop the Hichew King. Clear a level to unlock the next.' },
  { n: 2, title: 'Candy Quest 2', blurb: 'The veggies strike back. New levels unlock as they’re built.' }];
export const questOf = (L) => L.quest || 1;
