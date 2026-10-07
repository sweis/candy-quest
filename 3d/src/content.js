// The game's content tables as the 3D build uses them: the classic tables (data.js, verbatim) + Candy Quest 2 + the
// Shop's extras (event pets, coins). Import from here, not from data.js, anywhere the full content matters.
export { ALLIES, MONSTERS, ITEMS, RECIPES, LEVELS } from './data.js';
export { sceneryFor, QUESTS, questOf } from './quest2.js';
export { SHOP, SHOP_ALLIES, BOSS_COINS, MONSTER_COIN_CHANCE, canBuy, onSale } from './shop.js';
import { ALLIES } from './data.js';
import './shop.js';
// pet cap = every species you can own (Prickletreat is never wild or sold)
export const PET_MAX = Object.keys(ALLIES).filter((k) => k !== 'prickletreat').length;
