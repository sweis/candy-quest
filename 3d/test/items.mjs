// Keep-your-items: node (sim) + browser (real clicks across two levels, shop purchase outside a level).
import { createGame, bagOf } from '../src/sim.js';
import { serve, launch, watchErrors, pollUntil } from './lib.mjs';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
{ const bag = { inv: { cane_sword: 1, honey: 4, mallow_mend: 2, lollipop: 1 }, equip: { weapon: 'cane_sword', armor: 'sugar_vest' }, crystals: 17 };
  const G = createGame(2, { seed: 1, bag });
  ok(G.inv.honey === 4 && G.inv.mallow_mend === 2 && G.inv.lollipop === 1 && G.inv.mushroom === 1, 'next level starts with the saved bag + its own starting supplies');
  ok(G.equip.weapon === 'cane_sword' && G.equip.armor === null, 'equipped weapon carries over; armour you no longer own does not');
  ok(G.crystals === 17, 'crystals carry over');
  ok(JSON.stringify(bagOf(G).inv).includes('"honey":4'), 'bagOf() snapshots the bag for saving'); }
{ const G = createGame(1, { seed: 1 }); ok(G.inv.lollipop === 3 && G.inv.mushroom === 1 && G.crystals === 0, 'a fresh save starts exactly like the classic'); }
// browser: collect in L1, win, start L2 — the items are still there; buy a treat on Level Select
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } }); const errors = watchErrors(page);
await page.goto(base + '/3d/?dev&seed=3'); await page.evaluate(() => localStorage.clear()); await page.goto(base + '/3d/?dev&seed=3&level=1');
await pollUntil(page, () => window.cq && window.cq.getState().screen === 'play', null, { timeout: 30000 });
await page.evaluate(() => { const S = window.cq.sim, G = window.cq.G; G.inv.jawbreaker_mace = 1; S.equip(G, 'weapon', 'jawbreaker_mace'); G.inv.star_pop = 2; G.crystals = 9; window.cq.win(); });
await pollUntil(page, () => window.cq.getState().screen === 'win', null, { timeout: 15000 });
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('cq3d_bag')));
ok(saved && saved.inv.jawbreaker_mace === 1 && saved.inv.star_pop === 2 && saved.equip.weapon === 'jawbreaker_mace', 'winning Level 1 saves the bag + equipped weapon');
await page.evaluate(() => window.cq.select()); await page.waitForSelector('.shoplink');
await page.evaluate(() => localStorage.setItem('cq3d_coins', '20'));
await page.evaluate(() => window.cq.select()); await page.waitForSelector('.shoplink');
const sb = await (await page.$('.shoplink')).boundingBox(); await page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2); await page.waitForSelector('[data-a=buy][data-uid=mallow_mend]');
const bb = await (await page.$('[data-a=buy][data-uid=mallow_mend]')).boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(300);
const afterBuy = await page.evaluate(() => ({ bag: JSON.parse(localStorage.getItem('cq3d_bag')), coins: +localStorage.getItem('cq3d_coins') }));
ok(afterBuy.bag.inv.mallow_mend === 1 && afterBuy.coins === 16, `a treat bought on Level Select goes into the saved bag (coins ${afterBuy.coins})`);
await page.keyboard.press('Escape');
const c = await (await page.$('.lvl[data-lvl="2"]')).boundingBox(); await page.mouse.click(c.x + c.width / 2, c.y + c.height / 2);
await pollUntil(page, () => window.cq.getState().screen === 'play');
const st = (await page.evaluate(() => window.cq.getState())).sim;
ok(st.inv.jawbreaker_mace === 1 && st.inv.star_pop === 2 && st.inv.mallow_mend === 1 && st.equip.weapon === 'jawbreaker_mace' && st.crystals === 9, 'Level 2 starts with everything from Level 1 + the shop treat, mace still equipped');
ok((await page.evaluate(() => window.cq.getState())).heroGear.weapon === 'jawbreaker_mace', 'Pip is holding the mace in Level 2');
ok(errors.length === 0, 'no console errors ' + errors.join(' | '));
await browser.close(); srv.close(); process.exit(fails ? 1 : 0);
