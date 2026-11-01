// The game's content tables as the 3D build uses them: the classic tables (data.js, verbatim) + Candy Quest 2 +
// the Halloween Special + the Shop's extras (event pets, coins). Import from here, not from data.js.
import { ALLIES } from './data.js';
import { sceneryFor as q2Scenery, QUESTS as Q } from './quest2.js';
import { pumpkinScenery } from './halloween.js';
import { q3Scenery } from './quest3.js';
import './shop.js';
export { ALLIES, MONSTERS, ITEMS, RECIPES, LEVELS } from './data.js';
export { questOf } from './quest2.js';
export { SHOP, SHOP_ALLIES, BOSS_COINS, MONSTER_COIN_CHANCE, canBuy, onSale } from './shop.js';
export const sceneryFor = (kind) => (kind === 'pumpkin' ? pumpkinScenery() : kind.startsWith('q3') ? q3Scenery(kind) : q2Scenery(kind));
// level-select sections; event sections only show while their event is on
export const QUESTS = [...Q, { n: 3, title: 'Candy Quest 3', blurb: 'The Fruit Frenzy! The fruits want their sugar back.' }, { n: 'halloween', title: '🎃 Halloween Special', event: 'halloween', blurb: 'Only until Nov 3! Tame the Pumpkin Snake and face the Great Pumpkin.' }];
// Difficulty: every new quest starts back easy. A later quest's level n is scaled to match Quest 1's level n
// (average HP/ATK/DEF/XP of its regular monsters, and its boss), past level 10 it keeps climbing ~10% a level.
import { LEVELS as LV, MONSTERS as MO } from './data.js';
function statsOf(keys) { const a = { hp: 0, atk: 0, def: 0, xp: 0 }; for (const k of keys) for (const f in a) a[f] += MO[k][f] / keys.length; return a; }
function q1Ref(n) {
  const L = LV[Math.min(10, n)], extra = n > 10 ? Math.pow(1.1, n - 10) : 1;
  const pool = L.id === 10 ? LV[9].enemyPool : L.enemyPool; // L10's pool is every earlier monster; use L9's for its regulars
  const reg = statsOf(pool), boss = statsOf([L.boss]);
  for (const f in reg) { reg[f] *= extra; boss[f] *= extra; }
  return { reg, boss };
}
export const DIFFICULTY_SCALED = new Set();
for (const L of Object.values(LV)) {
  if ((L.quest || 1) === 1 || L.event) continue;
  const ref = q1Ref(L.qn || 1), cur = statsOf(L.enemyPool), regs = new Set(L.enemyPool);
  for (const k of regs) { if (DIFFICULTY_SCALED.has(k)) continue; const m = MO[k]; for (const f of ['hp', 'atk', 'def', 'xp']) m[f] = Math.max(1, Math.round(m[f] * ref.reg[f] / cur[f])); DIFFICULTY_SCALED.add(k); }
  const b = MO[L.boss]; if (!DIFFICULTY_SCALED.has(L.boss)) { for (const f of ['hp', 'atk', 'def', 'xp']) b[f] = Math.max(1, Math.round(ref.boss[f])); DIFFICULTY_SCALED.add(L.boss); }
}

// pet cap = every species you can own (Prickletreat is never wild or sold)
export const PET_MAX = Object.keys(ALLIES).filter((k) => k !== 'prickletreat').length;
