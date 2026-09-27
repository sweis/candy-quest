// Content probe (node, no browser): every sprite/item the game's own tables reference resolves to a built 3D model,
// every level's scenery kind has a biome, and every placed prop type has a builder.
import { ALLIES, MONSTERS, ITEMS, LEVELS, makeScenery } from '../src/data.js';
import { catalog } from '../src/models.js';
import { ITEM_IDS } from '../src/items3d.js';
import { BIOMES, PROPS, POOLS, PAINT } from '../src/biomes.js';
let fails = 0; const ok = (c, m) => { if (!c) { console.log('FAIL ' + m); fails++; } };
for (const [k, m] of Object.entries(MONSTERS)) ok(!catalog(m.sprite).fallback, `monster ${k} sprite ${m.sprite} has a model`);
for (const [k, a] of Object.entries(ALLIES)) ok(!catalog(a.sprite).fallback, `pet ${k} sprite ${a.sprite} has a model`);
for (const k of Object.keys(ITEMS)) ok(ITEM_IDS.includes(k), `item ${k} has a model/icon`);
for (const L of Object.values(LEVELS)) {
  ok(BIOMES[L.scenery], `level ${L.id} scenery ${L.scenery} has a biome`);
  for (const o of makeScenery(L.scenery)) ok(PROPS[o.t] || POOLS[o.t] || PAINT[o.t], `level ${L.id} prop '${o.t}' has a builder`);
  for (const k of [...L.enemyPool, L.boss]) ok(MONSTERS[k], `level ${L.id} enemy ${k} exists`);
  for (const k of L.forage) ok(ITEMS[k], `level ${L.id} forage ${k} exists`);
}
console.log(fails ? `${fails} content failures` : `PASS content probe: ${Object.keys(MONSTERS).length} monsters, ${Object.keys(ALLIES).length} pets, ${Object.keys(ITEMS).length} items, ${Object.keys(LEVELS).length} levels all resolve`);
process.exit(fails ? 1 : 0);
