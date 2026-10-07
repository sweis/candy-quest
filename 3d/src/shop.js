// The Candy Shop: what's for sale, prices in coins, and when. Pure data + rules (no DOM).
// Coins persist across levels (wallet in localStorage); a boss kill pays 10, regular monsters sometimes drop one.
import { ALLIES, ITEMS } from './data.js';
import { halloweenActive } from './events.js';

export const SHOP_ALLIES = {
  pumpkin_twins: { name: 'Pumpkin Pie Twins', sprite: 'pumpkin_twins', role: 'Legendary · Stingray + Manta Ray', hp: 220, atk: 40, def: 22, speed: 1.4, range: 240,
    kind: 'ranged', legendary: true, desc: 'The Pumpkin Pie Stingray and the Pumpkin Pie Manta Ray — twins who only fly together. A Halloween legend.' },
};
export const SHOP_ITEMS = {
  coin: { name: 'Coin', kind: 'coin', rarity: 'rare', desc: 'A gold candy coin. Spend coins in the Shop.' },
};
Object.assign(ALLIES, SHOP_ALLIES); Object.assign(ITEMS, SHOP_ITEMS);

export const BOSS_COINS = 10, MONSTER_COIN_CHANCE = 0.3;

// catalogue: kind 'pet' or 'item' (goes in your bag, which you keep between levels) — both can be bought anywhere
export const SHOP = [
  { id: 'pumpkin_twins', kind: 'pet', price: 50, event: 'halloween', badge: 'LEGENDARY · HALLOWEEN' },
  { id: 'mallow_mend', kind: 'item', price: 4 },
  { id: 'star_pop', kind: 'item', price: 7 },
  { id: 'gummy_guard', kind: 'item', price: 8 },
  { id: 'glow_gloop', kind: 'item', price: 9 },
  { id: 'fizz_tonic', kind: 'item', price: 6 },
];
export function onSale(entry, date = new Date()) { return entry.event === 'halloween' ? halloweenActive(date) : true; }
// can this be bought right now? returns { ok, why }
export function canBuy(entry, { coins, inLevel, ownedPets, date }) {
  if (!onSale(entry, date)) return { ok: false, why: 'Halloween only (Oct 28 – Nov 3)' };
  if (entry.kind === 'pet' && ownedPets.includes(entry.id)) return { ok: false, why: 'Owned' };
  if (coins < entry.price) return { ok: false, why: `Need ${entry.price - coins} more coins` };
  return { ok: true };
}
