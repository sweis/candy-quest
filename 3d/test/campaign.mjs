// Campaign run: levels 1→10 in one session via real input. Pip is dev-boosted (ATK/HP) so the run is fast — this
// verifies level plumbing (boss → gate → win screen → next level unlocked, taming carries pets forward, L10's
// all-pets field), not balance. Captures a mid-fight frame per level.
import { serve, launch, watchErrors, pollUntil, OUT } from './lib.mjs';
import { LEVELS } from '../src/content.js';
const from = +(process.argv[2] || 1), to = +(process.argv[3] || 10);
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } }); const errors = watchErrors(page);
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DQ = process.env.DATE ? '&date=' + process.env.DATE : '';
await page.goto(base + '/3d/?dev&seed=17' + DQ); await page.evaluate(() => localStorage.clear());
await page.goto(base + '/3d/?dev&seed=17' + DQ);
await pollUntil(page, () => window.cq && window.cq.getState().screen === 'title', null, { timeout: 30000 });
// title → select via real clicks
const clickSel = async (sel) => { const h = await page.$(sel); await h.scrollIntoViewIfNeeded(); const b = await h.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); };
await clickSel('.bigbtn'); await page.waitForSelector('.lvl');
const qOf = (L) => L.quest || 1;
const nextOf = (L) => L.event ? null : Object.values(LEVELS).find((x) => qOf(x) === qOf(L) && (x.qn || x.id) === (L.qn || L.id) + 1) || (qOf(L) === 1 && L.id === 10 ? Object.values(LEVELS).find((x) => qOf(x) === 2 && x.qn === 1) : null);
for (let lvl = from; lvl <= to; lvl++) {
  if (LEVELS[lvl].event && !process.env.DATE) continue; // event levels only appear while their event is on
  if (lvl > 1 && from === lvl) { // starting mid-campaign: unlock up to here and bring the pets you'd have tamed so far
    await page.evaluate((l) => { const u = {}; for (let i = 1; i <= l; i++) u[i] = true; localStorage.setItem('cq3d_unlocked', JSON.stringify(u));
      const keys = ['floss_finch', 'swirlbug', 'geode_jay', 'rock_turtle', 'corn_hog', 'chompgum', 'lico_snake', 'choc_lizard', 'pepp_fish', 'nerd_worm', 'cane_runner'].slice(0, l + 1);
      localStorage.setItem('cq3d_pets', JSON.stringify(keys.map((key) => ({ key, level: 3 })))); window.cq.select(); }, lvl);
    await page.waitForSelector('.lvl');
  }
  if (!(await page.$(`.lvl[data-lvl="${lvl}"]`))) { await page.evaluate(() => window.cq.select()); await page.waitForSelector('.lvl'); }
  await clickSel(`.lvl[data-lvl="${lvl}"]`);
  try { await pollUntil(page, () => window.cq.getState().screen === 'play', null, { timeout: 30000 }); }
  catch (e) { await page.screenshot({ path: `${OUT}/campaign-stuck-L${lvl}.png` }); console.log('stuck:', await page.evaluate(() => { try { return JSON.stringify({ s: window.cq.getState().screen }); } catch (err) { return 'getState threw: ' + err.message; } }), errors); throw e; }
  const t0 = Date.now();
  if (lvl === 10) { const s0 = (await page.evaluate(() => window.cq.getState())).sim; ok(s0.party.length > 0 && s0.counts.ally === s0.party.length, `L10 fields every pet at the start (${s0.counts.ally}/${s0.party.length}) — allPets`); await sleep(600); await page.screenshot({ path: OUT + '/campaign-L10-allpets.png' }); }
  await page.evaluate(() => { const G = window.cq.G; G.player.baseatk = 90; G.player.maxhp = G.player.hp = 900; G.autoHit = true; });
  // tame the local pet(s) with real clicks first (gives later levels a party), then boss, then gate
  let shot = false;
  for (;;) {
    const st = (await page.evaluate(() => window.cq.getState())).sim;
    if (st.won || Date.now() - t0 > 150000) break;
    await page.evaluate(() => { const G = window.cq.G; G.inv[G.BAIT] = Math.max(G.inv[G.BAIT] || 0, 3); });
    const p = st.player, wild = st.entities.find((e) => e.faction === 'wild');
    const boss = st.entities.find((e) => e.boss);
    let tgt = null;
    if (wild && st.party.length < 99) tgt = { id: wild.id, x: wild.x, y: wild.y };
    else if (boss) tgt = { id: boss.id, x: boss.x, y: boss.y };
    else tgt = { x: st.gate.x, y: st.gate.y };
    const sp = tgt.id ? await page.evaluate((id) => window.cq.screenOf(id), tgt.id) : await page.evaluate(([x, y]) => window.cq.screenOf(x, y), [tgt.x, tgt.y]);
    if (sp && sp.vis && sp.x > 30 && sp.x < 1250 && sp.y > 100 && sp.y < 540) await page.mouse.click(sp.x, sp.y);
    else { const a = Math.atan2(tgt.y - p.y, tgt.x - p.x); await page.mouse.click(640 + Math.cos(a) * 300, 330 + Math.sin(a) * 170); }
    if (!shot && boss && Math.hypot(boss.x - p.x, boss.y - p.y) < 260) { await sleep(400); await page.screenshot({ path: `${OUT}/campaign-L${lvl}.png` }); shot = true; }
    await sleep(250);
  }
  await pollUntil(page, () => window.cq.getState().screen === 'win', null, { timeout: 8000 }).catch(() => {});
  const st = await page.evaluate(() => window.cq.getState());
  ok(st.screen === 'win', `L${lvl} ${LEVELS[lvl].name}: cleared via real clicks in ${((Date.now() - t0) / 1000).toFixed(0)} s (party ${st.sim.party.map((m) => m.key).join(',') || '—'}, KOs ${st.sim.stats.knockouts})`);
  { const nx = nextOf(LEVELS[lvl]); if (nx) ok(JSON.parse(await page.evaluate(() => localStorage.getItem('cq3d_unlocked')))[nx.id] === true, `${nx.name} unlocked`); }
  await page.screenshot({ path: `${OUT}/campaign-win-L${lvl}.png` });
  await clickSel('[data-go=select]'); await page.waitForSelector('.lvl');
}
await page.screenshot({ path: OUT + '/campaign-select-end.png' });
ok(errors.length === 0, 'campaign: no console errors' + (errors.length ? ':\n  ' + errors.slice(0, 5).join('\n  ') : ''));
await browser.close(); srv.close(); process.exit(fails ? 1 : 0);
