// The game's content tables as the 3D build uses them: the classic tables (data.js, verbatim) + Candy Quest 2 +
// the Halloween Special + the Shop's extras (event pets, coins). Import from here, not from data.js.
import { ALLIES } from './data.js';
import { sceneryFor as q2Scenery, QUESTS as Q } from './quest2.js';
import { pumpkinScenery } from './halloween.js';
import './shop.js';
export { ALLIES, MONSTERS, ITEMS, RECIPES, LEVELS } from './data.js';
export { questOf } from './quest2.js';
export { SHOP, SHOP_ALLIES, BOSS_COINS, MONSTER_COIN_CHANCE, canBuy, onSale } from './shop.js';
export const sceneryFor = (kind) => (kind === 'pumpkin' ? pumpkinScenery() : q2Scenery(kind));
// level-select sections; event sections only show while their event is on
export const QUESTS = [...Q, { n: 'halloween', title: '🎃 Halloween Special', event: 'halloween', blurb: 'Only until Nov 3! Tame the Pumpkin Snake and face the Great Pumpkin.' }];
// pet cap = every species you can own (Prickletreat is never wild or sold)
export const PET_MAX = Object.keys(ALLIES).filter((k) => k !== 'prickletreat').length;
