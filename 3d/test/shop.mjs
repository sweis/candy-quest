// Shop + Halloween via real clicks. A: ?date=2026-10-31 (event on): orange theme, banner, buy the Legendary twins on
// Level Select, they take the field in Level 1, buy a treat mid-level from the HUD Shop button. B: Oct 6 (event off).
import { serve, launch, watchErrors, pollUntil, OUT } from './lib.mjs';
const { srv, base } = await serve(); const browser = await launch();
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function run(date, label) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } }); const errors = watchErrors(page);
  const click = async (sel) => { const h = await page.$(sel); await h.scrollIntoViewIfNeeded(); const b = await h.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(250); };
  await page.goto(`${base}/3d/?dev&seed=8&date=${date}`); await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cq3d_coins', '60'); });
  await page.goto(`${base}/3d/?dev&seed=8&date=${date}`);
  await pollUntil(page, () => window.cq && window.cq.getState().screen === 'title', null, { timeout: 30000 }); await sleep(600);
  const hw = await page.evaluate(() => document.body.classList.contains('halloween'));
  await page.screenshot({ path: `${OUT}/shop-${label}-title.png` });
  await click('.bigbtn'); await page.waitForSelector('.shoplink'); await sleep(300);
  await click('.shoplink'); await page.waitForSelector('.shopcard');
  await page.screenshot({ path: `${OUT}/shop-${label}-panel.png` });
  const btn = await page.$('.shopcard [data-a=buy]'); const disabled = await btn.evaluate((b) => b.disabled);
  return { page, errors, hw, disabled, click };
}
// A: Halloween
{
  const { page, errors, hw, disabled, click } = await run('2026-10-31', 'halloween');
  ok(hw, 'Halloween (Oct 31): page is in the orange Halloween theme');
  ok(!disabled, 'Halloween: the Legendary twins are buyable with 60 coins');
  await click('.shopcard [data-a=buy]'); await sleep(300);
  const pets = await page.evaluate(() => JSON.parse(localStorage.getItem('cq3d_pets') || '[]').map((p) => p.key));
  const coins = await page.evaluate(() => +localStorage.getItem('cq3d_coins'));
  ok(pets.includes('pumpkin_twins') && coins === 10, `clicking 🪙 50 buys them on Level Select (pets ${pets.join(',')}, coins left ${coins})`);
  ok(await page.$eval('.shopcard [data-a=buy]', (b) => b.disabled && b.textContent.includes('Owned')), 'the card then shows ✓ Owned');
  await page.screenshot({ path: OUT + '/shop-halloween-bought.png' });
  await click('.pnl .x'); await click('.lvl[data-lvl="1"]');
  await pollUntil(page, () => window.cq.getState().screen === 'play'); await sleep(1500);
  const st = await page.evaluate(() => window.cq.getState());
  ok(st.sim.party.some((p) => p.key === 'pumpkin_twins' && p.active) && st.sim.entities.some((e) => e.faction === 'ally' && e.kind === 'pumpkin_twins'), 'the twins take the field in Level 1');
  await page.evaluate(() => { document.querySelector('.hint') && document.querySelector('.hint').remove(); window.cq.teleport(560, 700); }); await sleep(1500);
  await page.screenshot({ path: OUT + '/shop-halloween-play.png' });
  // mid-level: HUD Shop button, buy a Mallow Mend with the remaining 10 coins
  const r = await page.evaluate(() => window.cq.hudRect('[data-a=shop]')); await page.mouse.click(r.x, r.y); await sleep(300);
  ok((await page.evaluate(() => window.cq.getState())).panel === 'shop', 'HUD 🛒 Shop button opens the shop mid-level (sim paused)');
  await click('[data-a=buy][data-uid=mallow_mend]');
  const s2 = (await page.evaluate(() => window.cq.getState())).sim;
  ok(s2.coins === 6 && (s2.inv.mallow_mend || 0) === 1, `bought a Mallow Mend mid-level (coins ${s2.coins}, bag ${s2.inv.mallow_mend})`);
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.cq.showcase('pumpkin_twins')); await sleep(900); await page.screenshot({ path: OUT + '/shop-twins-closeup.png' });
  ok(errors.length === 0, 'Halloween run: no console errors ' + errors.join(' | '));
  await page.close();
}
// B: off-season
{
  const { page, errors, hw, disabled } = await run('2026-10-06', 'offseason');
  ok(!hw, 'Oct 6: normal (non-Halloween) theme');
  ok(disabled && (await page.$eval('.shopcard .when', (e) => e.textContent)).includes('Back for Halloween'), 'Oct 6: twins not for sale — "Back for Halloween · Oct 28 – Nov 3"');
  ok(errors.length === 0, 'off-season run: no console errors ' + errors.join(' | '));
  await page.close();
}
await browser.close(); srv.close(); process.exit(fails ? 1 : 0);
