// Node: Halloween calendar, coin economy, shop purchases.
import { halloweenActive, halloweenDaysLeft } from '../src/events.js';
import { createGame, step, buyPet, buyItem, debugDamage, snapshot } from '../src/sim.js';
import { SHOP, canBuy, BOSS_COINS } from '../src/content.js';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const D = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const cal = { '2026-10-27': false, '2026-10-28': true, '2026-10-31': true, '2026-11-03': true, '2026-11-04': false, '2027-10-30': true, '2026-06-01': false, '2026-12-31': false };
for (const [d, want] of Object.entries(cal)) ok(halloweenActive(D(d)) === want, `Halloween ${want ? 'on' : 'off'} on ${d}`);
ok(halloweenDaysLeft(D('2026-10-28')) === 7 && halloweenDaysLeft(D('2026-11-03')) === 1, 'sale countdown: 7 days left on Oct 28, last day Nov 3');
// boss pays exactly BOSS_COINS into the wallet
{ let saved = null; const G = createGame(1, { seed: 3, coins: 5, onCoins: (c) => (saved = c) });
  const boss = [...G.ents.values()].find((e) => e.boss); debugDamage(G, boss, 99999);
  ok(G.coins === 5 + BOSS_COINS && saved === G.coins, `boss kill pays ${BOSS_COINS} coins into the saved wallet (5 -> ${G.coins})`); }
// monsters sometimes drop a coin (~30%), and walking over it adds to the wallet
{ let drops = 0, kills = 0;
  for (let seed = 1; seed <= 40; seed++) { const G = createGame(2, { seed });
    for (const e of [...G.ents.values()]) if (e.faction === 'enemy' && !e.boss) { debugDamage(G, e, 99999); kills++; }
    drops += [...G.ents.values()].filter((e) => e.item === 'coin').length; }
  const rate = drops / kills; ok(rate > 0.22 && rate < 0.38, `regular monsters drop a coin ${(rate * 100).toFixed(0)}% of the time (${drops}/${kills})`); }
{ const G = createGame(2, { seed: 9 }); const m = [...G.ents.values()].find((e) => e.faction === 'enemy' && !e.boss);
  let coin = null; for (let s = 1; s < 50 && !coin; s++) { const g = createGame(2, { seed: s }); for (const e of [...g.ents.values()]) if (e.faction === 'enemy' && !e.boss) debugDamage(g, e, 99999); coin = [...g.ents.values()].find((e) => e.item === 'coin'); if (coin) { g.player.x = coin.x; g.player.y = coin.y; step(g, 1); ok(g.coins >= 1 && !g.ents.has(coin.id), `picking up a dropped coin adds it to the wallet (${g.coins})`); } }
  void m; }
// purchases
{ const G = createGame(1, { seed: 4, coins: 60 }); const twins = SHOP.find((e) => e.id === 'pumpkin_twins');
  ok(!canBuy(twins, { coins: 60, inLevel: true, ownedPets: [], date: D('2026-10-06') }).ok, 'twins cannot be bought outside Halloween');
  ok(canBuy(twins, { coins: 60, inLevel: true, ownedPets: [], date: D('2026-10-31') }).ok, 'twins can be bought on Halloween with enough coins');
  ok(!canBuy(twins, { coins: 49, inLevel: true, ownedPets: [], date: D('2026-10-31') }).ok, 'twins need 50 coins');
  ok(buyPet(G, 'pumpkin_twins', 50) && G.coins === 10 && G.party.some((p) => p.key === 'pumpkin_twins' && p.active), 'buying the twins deducts 50 and fields them');
  ok([...G.ents.values()].some((e) => e.faction === 'ally' && e.sprite === 'pumpkin_twins'), 'the twins appear in the level as one ally');
  ok(!buyPet(G, 'pumpkin_twins', 50), 'cannot buy the twins twice');
  ok(buyItem(G, 'mallow_mend', 4) && G.coins === 6 && G.inv.mallow_mend >= 1, 'buying a Mallow Mend deducts 4 coins and adds it to the bag');
  ok(!buyItem(G, 'glow_gloop', 9) && G.coins === 6, 'cannot buy what you cannot afford');
  ok(snapshot(G).coins === 6, 'coins appear in getState'); }
process.exit(fails ? 1 : 0);
