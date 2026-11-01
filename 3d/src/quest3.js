// Candy Quest 3 — The Fruit Frenzy. 3D-only content, merged into the tables by content.js (like Quest 2).
// Stats here set each monster's relative strength; content.js rescales every level to Quest 1's curve.
import { ALLIES, MONSTERS, ITEMS, LEVELS } from './data.js';

const pet = (name, sprite, role, kind, o = {}) => ({ name, sprite, role, hp: 125, atk: 26, def: 14, speed: 1.25, range: kind === 'ranged' ? 210 : kind === 'heal' ? 150 : 64, kind, ...o });
export const Q3_ALLIES = {
  apple_owl: pet('Apple Owl', 'apple_owl', 'Night Watch', 'ranged'),
  banana_monkey: pet('Banana Monkey', 'banana_monkey', 'Acrobat', 'melee', { speed: 1.45 }),
  grape_turtle: pet('Grape Turtle', 'grape_turtle', 'Shell Guard', 'melee', { hp: 160, def: 20, speed: 0.9 }),
  melon_seal: pet('Watermelon Seal', 'melon_seal', 'Splasher', 'ranged'),
  berry_ladybug: pet('Strawberry Ladybug', 'berry_ladybug', 'Lucky Healer', 'heal', { atk: 10 }),
  lemon_camel: pet('Lemon Camel', 'lemon_camel', 'Trekker', 'melee', { hp: 150 }),
  cherry_bird: pet('Cherry Bird', 'cherry_bird', 'Sky Striker', 'ranged', { speed: 1.4 }),
  pine_hedgehog: pet('Pineapple Hedgehog', 'pine_hedgehog', 'Spike Ball', 'melee', { def: 18 }),
  blue_duck: pet('Blueberry Duck', 'blue_duck', 'Paddler', 'melee', { speed: 1.3 }),
};
const mon = (name, sprite, kind, o = {}) => ({ name, sprite, hp: kind === 'ranged' ? 230 : 280, atk: 48, def: 28, speed: kind === 'ranged' ? 0.6 : 0.85, range: kind === 'ranged' ? 330 : 62, kind, xp: 130, ...o });
const boss = (name, sprite, o = {}) => ({ name, sprite, hp: 2000, atk: 62, def: 40, speed: 0.65, range: 125, kind: 'melee', xp: 2000, boss: true, ...o });
export const Q3_MONSTERS = {
  apple_roller: mon('Apple Roller', 'apple_roller', 'melee', { range: 58, speed: 0.9 }),
  seed_spitter: mon('Seed Spitter', 'seed_spitter', 'ranged', { proj: '#3a2010' }),
  apple_golem: boss('Granny Smith Golem', 'apple_golem'),
  banana_brawler: mon('Banana Brawler', 'banana_brawler', 'melee'),
  peel_slinger: mon('Peel Slinger', 'peel_slinger', 'ranged', { proj: '#ffe14a' }),
  bananaconda: boss('Bananaconda', 'bananaconda', { range: 140 }),
  grape_bouncer: mon('Grape Bouncer', 'grape_bouncer', 'melee', { range: 54, speed: 1.0 }),
  grape_shooter: mon('Grape Shooter', 'grape_shooter', 'ranged', { proj: '#7a3ad0' }),
  vinelord: boss('Vinelord', 'vinelord', { range: 150 }),
  melon_roller: mon('Melon Roller', 'melon_roller', 'melee', { range: 60, hp: 320, speed: 0.85 }),
  seed_gunner: mon('Seed Gunner', 'seed_gunner', 'ranged', { proj: '#1a1a14' }),
  melon_crab: boss('Melon Crab Colossus', 'melon_crab', { range: 140 }),
  berry_sword: mon('Strawberry Swordsman', 'berry_sword', 'melee'),
  berry_bouncer: mon('Berry Bouncer', 'berry_bouncer', 'melee', { range: 52, speed: 1.05, hp: 220 }),
  queen_berry: boss('Queen Berry', 'queen_berry'),
  lemon_lancer: mon('Lemon Lancer', 'lemon_lancer', 'melee', { range: 96 }),
  lemon_squirter: mon('Lemon Squirter', 'lemon_squirter', 'ranged', { proj: '#ffe94a' }),
  sour_sphinx: boss('Sour Sphinx', 'sour_sphinx', { range: 140 }),
  cherry_bomb: mon('Cherry Bomb', 'cherry_bomb', 'melee', { range: 54, speed: 1.0 }),
  cherry_archer: mon('Cherry Archer', 'cherry_archer', 'ranged', { proj: '#c8102a' }),
  cherry_titan: boss('Cherry Twin Titan', 'cherry_titan'),
  pine_brute: mon('Pineapple Brute', 'pine_brute', 'melee', { range: 96, hp: 320, speed: 0.65 }),
  pine_spiker: mon('Pineapple Spiker', 'pine_spiker', 'ranged', { proj: '#ffb02e' }),
  pine_king: boss('Pineapple Volcano King', 'pine_king', { range: 135 }),
  blue_blob: mon('Blueberry Blob', 'blue_blob', 'melee', { range: 54 }),
  blue_spitter: mon('Blueberry Spitter', 'blue_spitter', 'ranged', { proj: '#3a5ad0' }),
  bog_beast: boss('Bog Beast', 'bog_beast', { range: 130 }),
  fruit_emperor: boss('Fruit Emperor', 'fruit_emperor', { hp: 2400 }),
};
const bait = (name, desc) => ({ name, kind: 'bait', rarity: 'common', desc: desc + ' — offer it to tame them.' });
export const Q3_ITEMS = {
  caramel_apple: bait('Caramel Apple Pop', 'A sticky caramel-dipped apple pop. Orchard critters swoop down for it'),
  banana_taffy: bait('Banana Taffy', 'A soft banana taffy twist. Jungle critters swing over for it'),
  grape_gummy: bait('Grape Gummy', 'A squishy purple grape gummy. Vineyard critters creep up for it'),
  melon_candy: bait('Watermelon Slice Candy', 'A sugary watermelon-slice jelly. Beach critters flop over for it'),
  berry_bonbon: bait('Strawberry Bonbon', 'A creamy strawberry bonbon. Field critters flutter over for it'),
  lemon_drop: bait('Lemon Drop', 'A tangy sugar-dusted lemon drop. Desert critters plod over for it'),
  cherry_cordial: bait('Cherry Cordial', 'A chocolate-wrapped cherry cordial. Cliff critters dive down for it'),
  pineapple_ring: bait('Pineapple Ring Candy', 'A chewy pineapple-ring candy. Volcano critters curl up for it'),
  muffin_bite: bait('Blueberry Muffin Bite', 'A tiny blueberry muffin. Bog critters waddle over for it'),
};

// level n of Quest 3: { scenery kind, two monsters (5:5 mix), boss, pet, bait }
const DEF = [
  ['Apple Orchard', 'apple', 'apple_roller', 'seed_spitter', 'apple_golem', 'apple_owl', 'caramel_apple', '#d9f0b8', '#7ab84a'],
  ['Banana Jungle', 'banana', 'banana_brawler', 'peel_slinger', 'bananaconda', 'banana_monkey', 'banana_taffy', '#fff4b8', '#5a9a3a'],
  ['Grape Vineyard', 'grape', 'grape_bouncer', 'grape_shooter', 'vinelord', 'grape_turtle', 'grape_gummy', '#e8d8ff', '#6a4a9a'],
  ['Watermelon Beach', 'melon', 'melon_roller', 'seed_gunner', 'melon_crab', 'melon_seal', 'melon_candy', '#ffe0e0', '#4fb3d9'],
  ['Strawberry Fields', 'berry', 'berry_sword', 'berry_bouncer', 'queen_berry', 'berry_ladybug', 'berry_bonbon', '#ffe0e8', '#7ac24a'],
  ['Lemon Desert', 'lemon', 'lemon_lancer', 'lemon_squirter', 'sour_sphinx', 'lemon_camel', 'lemon_drop', '#fff6c8', '#e0b84a'],
  ['Cherry Cliffs', 'cherry', 'cherry_bomb', 'cherry_archer', 'cherry_titan', 'cherry_bird', 'cherry_cordial', '#ffe0e8', '#9a6a5a'],
  ['Pineapple Volcano', 'pine', 'pine_brute', 'pine_spiker', 'pine_king', 'pine_hedgehog', 'pineapple_ring', '#ffd8a8', '#6a3a2a'],
  ['Blueberry Bog', 'bog', 'blue_blob', 'blue_spitter', 'bog_beast', 'blue_duck', 'muffin_bite', '#d8e0ff', '#3a5a4a'],
];
const forage = (b) => [b, b, b, b, 'honey', 'honey', 'glowberry', 'glowberry', 'mushroom', 'gummy_worm', 'sour_dust', 'alien_goo', 'crystal', 'star_sprinkle'];
export const Q3_LEVELS = {};
DEF.forEach(([name, scenery, m1, m2, b, p, ba, c1, c2], i) => {
  Q3_LEVELS[22 + i] = { id: 22 + i, quest: 3, qn: i + 1, name, scenery: 'q3' + scenery, bait: ba,
    sky: `radial-gradient(circle at 26% 18%, ${c1}, transparent 44%), linear-gradient(165deg, ${c1}, ${c2} 70%)`,
    bossName: MONSTERS[b] ? MONSTERS[b].name : Q3_MONSTERS[b].name,
    enemyPool: [m1, m2, m1, m2, m1, m1, m2, m1, m2, m1], boss: b, wild: [p], forage: forage(ba) };
});
Q3_LEVELS[31] = { id: 31, quest: 3, qn: 10, name: 'Fruit Salad Summit', scenery: 'q3summit', bait: 'caramel_apple', allPets: true,
  sky: 'radial-gradient(circle at 26% 18%, #fff0c8, transparent 44%), linear-gradient(165deg, #ffd0e0, #ffb84d 55%, #7a4ad0)',
  bossName: 'Fruit Emperor', enemyPool: Object.entries(Q3_MONSTERS).filter(([, m]) => !m.boss).flatMap(([k]) => [k, k, k, k, k]),
  boss: 'fruit_emperor', wild: [], forage: ['honey', 'honey', 'honey', 'glowberry', 'glowberry', 'mallow_mend', 'mallow_mend', 'gummy_worm', 'sour_dust', 'alien_goo', 'crystal', 'crystal', 'star_sprinkle', 'star_sprinkle'] };

// Scenery: every Quest 3 biome uses the classic slot pattern with its own tree / boulder / bush / scatter props
const KIT = {
  q3apple: ['appletree', 'giantapple', 'fruitbush', 'fallenfruit', 'pond'],
  q3banana: ['bananatree', 'bananabunch', 'fruitbush', 'fallenfruit', 'pond'],
  q3grape: ['grapevine', 'grapebarrel', 'fruitbush', 'fallenfruit', 'pond'],
  q3melon: ['melonpalm', 'giantmelon', 'shellc', 'fallenfruit', 'tidepool'],
  q3berry: ['berrybush', 'giantberry', 'fruitbush', 'fallenfruit', 'pond'],
  q3lemon: ['lemontree', 'giantlemon', 'fruitbush', 'fallenfruit', 'oasis'],
  q3cherry: ['cherrytree', 'cliffrock', 'fruitbush', 'fallenfruit', 'pond'],
  q3pine: ['pinepalm', 'lavarock', 'fruitbush', 'fallenfruit', 'lavapool'],
  q3bog: ['bogtree', 'bogstump', 'fruitbush', 'fallenfruit', 'swamp'],
};
export function q3Scenery(kind) {
  const s = []; const add = (t, x, y, o = {}) => s.push({ t, x, y, ...o });
  if (kind === 'q3summit') { // 3000×2000 finale: landmarks from every Quest 3 biome
    const big = Object.values(KIT).map((k) => k[0]), mid = Object.values(KIT).map((k) => k[1]); let i = 0;
    for (let gy = 0; gy < 4; gy++) for (let gx = 0; gx < 6; gx++) {
      const x = 300 + gx * 480 + (gy % 2) * 200, y = 300 + gy * 440;
      if (Math.hypot(x - 200, y - 760) < 380 || Math.hypot(x - 2080, y - 720) < 260 || Math.hypot(x - 1860, y - 730) < 240) continue;
      add(big[i % big.length], x, y, { s: 0.9 + (i % 3) * 0.2, f: i % 2 ? 1 : -1 }); add(mid[i % mid.length], x + 200, y + 180, { s: 0.8 }); i++;
    }
    add('pond', 900, 1100); return s;
  }
  const [tree, boulder, bush, scatter, pool] = KIT[kind];
  [[320, 380], [700, 320], [1120, 440], [1520, 340], [1900, 320], [520, 1180], [980, 1240], [1600, 1160], [2000, 1060]].forEach(([x, y], i) => add(tree, x, y, { s: 0.9 + (i % 3) * 0.2, f: i % 2 ? 1 : -1 }));
  [[640, 520], [1240, 660], [1820, 840], [420, 1060], [1440, 1100]].forEach(([x, y], i) => add(boulder, x, y, { s: 0.8 + (i % 2) * 0.4 }));
  const fruit = Q3_FRUIT[kind];
  [[360, 640], [1080, 880], [1620, 600], [840, 440], [1300, 1020]].forEach(([x, y]) => add(bush, x, y, { fruit }));
  [[480, 760], [1180, 540], [1700, 720], [900, 1120], [1500, 480], [260, 980]].forEach(([x, y]) => add(scatter, x, y, { fruit }));
  [[600, 560], [1300, 700], [1860, 900], [400, 1000]].forEach(([x, y], i) => add('dirt', x, y, { s: 0.9 + (i % 3) * 0.3 }));
  add(pool, 560, 900);
  return s;
}
export const Q3_FRUIT = { q3apple: 'apple', q3banana: 'banana', q3grape: 'grape', q3melon: 'melon', q3berry: 'berry', q3lemon: 'lemon', q3cherry: 'cherry', q3pine: 'pine', q3bog: 'blue' };

Object.assign(ALLIES, Q3_ALLIES); Object.assign(MONSTERS, Q3_MONSTERS); Object.assign(ITEMS, Q3_ITEMS); Object.assign(LEVELS, Q3_LEVELS);
