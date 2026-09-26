// Real-input playtest. Phase A: cold boot (cleared storage, no dev flags) through the real Play → Level 1 path,
// with hit-testing checks for input-blocking overlays. Phase B (?dev): keyboard + mouse drive taming, panels and a
// novice bot (250 ms reaction, never retreats) that tries to clear Level 1. All actions are real mouse/keyboard.
import { serve, launch, watchErrors, pollUntil, OUT } from './lib.mjs';

const seed = +(process.argv.find((a) => a.startsWith('--seed=')) || '--seed=11').split('=')[1];
const { srv, base } = await serve();
const browser = await launch();
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------- Phase A: cold boot, real path
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage(); const errors = watchErrors(page);
  await page.goto(base + '/3d/'); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.waitForSelector('.bigbtn', { timeout: 30000 }); await sleep(500);
  const hit = async (x, y, want) => page.evaluate(([x, y, w]) => { const e = document.elementFromPoint(x, y); return e && (e.matches(w) || !!e.closest(w)); }, [x, y, want]);
  const b = await (await page.$('.bigbtn')).boundingBox();
  ok(await hit(b.x + b.width / 2, b.y + b.height / 2, '.bigbtn'), 'Play button is the topmost element at its centre');
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await page.waitForSelector('.lvl.open'); await sleep(300);
  await page.screenshot({ path: OUT + '/cold-select.png' });
  const c = await (await page.$('.lvl.open')).boundingBox();
  await page.mouse.click(c.x + c.width / 2, c.y + c.height / 2);
  await page.waitForSelector('#hud:not([hidden]) .act.hit'); await sleep(1500);
  await page.screenshot({ path: OUT + '/cold-play.png' });
  for (const [x, y, n] of [[640, 360, 'centre'], [300, 250, 'upper-left field'], [980, 300, 'upper-right field'], [640, 480, 'lower field']]) ok(await hit(x, y, '#gl'), `canvas receives input at ${n} (${x},${y})`);
  ok(errors.length === 0, 'cold boot: no console errors' + (errors.length ? ' ' + errors.join(' | ') : ''));
  await ctx.close();
}

// ---------------- Phase B: dev build, real input
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage(); const errors = watchErrors(page);
await page.goto(base + `/3d/?dev&seed=${seed}`); await page.evaluate(() => localStorage.clear());
await page.goto(base + `/3d/?dev&seed=${seed}&level=1`);
await pollUntil(page, () => window.cq && window.cq.getState().screen === 'play', null, { timeout: 30000 });
await sleep(400);
const S = () => page.evaluate(() => window.cq.getState().sim);

// keyboard: W+D held together for 2 s -> diagonal movement at full speed
{
  const a = await S();
  await page.keyboard.down('w'); await page.keyboard.down('d'); await sleep(2000); await page.keyboard.up('w'); await page.keyboard.up('d');
  const b = await S(); const dx = b.player.x - a.player.x, dy = b.player.y - a.player.y, dt = b.simTime - a.simTime;
  const v = Math.hypot(dx, dy) / dt / 50;
  ok(dx > 0 && dy < 0 && Math.abs(Math.abs(dx) - Math.abs(dy)) < 0.2 * Math.abs(dx), `W+D moves up-right diagonally (dx ${dx.toFixed(0)}, dy ${dy.toFixed(0)})`);
  ok(v > 3.2 && v < 4.2, `diagonal speed ${v.toFixed(2)} m/s ≈ 3.68 (same as one axis, as classic)`);
}
// mouse: click the ground -> walk there
{
  const a = await S(); const tgt = { x: a.player.x + 250, y: a.player.y + 120 };
  const p = await page.evaluate(([x, y]) => window.cq.screenOf(x, y), [tgt.x, tgt.y]);
  await page.mouse.click(p.x, p.y); await sleep(2500);
  const b = await S(); ok(Math.hypot(b.player.x - tgt.x, b.player.y - tgt.y) < 30, `click-to-move reaches the clicked ground point (err ${Math.hypot(b.player.x - tgt.x, b.player.y - tgt.y).toFixed(0)} px)`);
}
// taming both wild animals by clicking them (fetching more lollipops by click when out of bait)
for (let i = 0; i < 2; i++) {
  const s = await S(); const w = s.entities.find((e) => e.faction === 'wild'); if (!w) break;
  for (let k = 0; k < 160; k++) {
    const st = await S(); const ww = st.entities.find((e) => e.id === w.id); if (!ww) break;
    if ((st.inv.lollipop || 0) === 0) {
      const lp = st.entities.filter((e) => e.faction === 'item' && e.kind === 'lollipop').sort((a, b) => Math.hypot(a.x - st.player.x, a.y - st.player.y) - Math.hypot(b.x - st.player.x, b.y - st.player.y))[0];
      if (!lp) break;
      const q = await page.evaluate(([x, y]) => window.cq.screenOf(x, y), [lp.x, lp.y]);
      if (q.vis && q.y > 90 && q.y < 560 && q.x > 20 && q.x < 1260) await page.mouse.click(q.x, q.y);
      else { const a = Math.atan2(lp.y - st.player.y, lp.x - st.player.x); await page.mouse.click(640 + Math.cos(a) * 300, 330 + Math.sin(a) * 170); }
      await sleep(400); continue;
    }
    const p = await page.evaluate((id) => window.cq.screenOf(id), w.id);
    if (p && p.vis) await page.mouse.click(p.x, p.y);
    await sleep(350);
  }
  const s2 = await S(); ok(s2.party.some((m) => m.key === w.kind), `tamed ${w.kind} by clicking it (party ${s2.party.map((m) => m.key).join(',')})`);
  if (!s2.party.some((m) => m.key === w.kind)) console.log('  debug:', JSON.stringify({ bait: s2.inv.lollipop, left: s2.entities.filter((e) => e.kind === 'lollipop').map((e) => [e.x | 0, e.y | 0]), p: [s2.player.x | 0, s2.player.y | 0], hp: s2.player.hp, ko: s2.stats.knockouts, wild: s2.entities.filter((e) => e.faction === 'wild').map((e) => [e.kind, e.x | 0, e.y | 0, e.trust]) }));
}
// equip a weapon through the real Bag UI: exactly one weapon mesh in Pip's hand afterwards
{
  await page.evaluate(() => { window.cq.G.inv.cane_sword = 1; window.cq.G.inv.licorice_whip = 1; });
  for (const id of ['cane_sword', 'licorice_whip']) {
    let r = await page.evaluate(() => window.cq.hudRect('[data-a=inv]')); await page.mouse.click(r.x, r.y); await sleep(250);
    const gen0 = (await page.evaluate(() => window.cq.getState())).panelShell;
    r = await page.evaluate((id) => window.cq.hudRect(`[data-a=sel][data-uid=${id}]`), id); await page.mouse.click(r.x, r.y); await sleep(150);
    r = await page.evaluate(() => window.cq.hudRect('[data-a=equip]')); await page.mouse.click(r.x, r.y); await sleep(250);
    const st = await page.evaluate(() => window.cq.getState());
    ok(st.panelShell === gen0, `selecting + equipping ${id} refreshes the bag in place (no flicker rebuild)`);
    await page.keyboard.press('Escape'); await sleep(250);
    const g = (await page.evaluate(() => window.cq.getState())).heroGear;
    ok(g.weapon === id && g.weaponMeshes === 1, `Pip holds only the ${id} (${JSON.stringify(g)})`);
  }
  await page.evaluate(() => window.cq.cam('hero-close')); await sleep(500); await page.screenshot({ path: OUT + '/play-equip-whip.png' });
}
await page.evaluate(() => window.cq.cam('play')); await sleep(300);
await page.screenshot({ path: OUT + '/play-tamed.png' });
// panels via real clicks: Bag opens and pauses; ✕ closes
{
  const r = await page.evaluate(() => window.cq.hudRect('[data-a=inv]')); await page.mouse.click(r.x, r.y); await sleep(300);
  const t0 = (await S()).simTime; await sleep(500); const st = await page.evaluate(() => window.cq.getState());
  ok(st.panel === 'inv' && st.sim.simTime === t0, 'Bag button opens the backpack and pauses the sim');
  await page.screenshot({ path: OUT + '/play-bag.png' });
  const x = await page.evaluate(() => window.cq.hudRect('.pnl .x')); await page.mouse.click(x.x, x.y); await sleep(200);
  ok((await page.evaluate(() => window.cq.getState())).panel === null, '✕ closes the panel');
  await page.keyboard.press('c'); await sleep(300); await page.screenshot({ path: OUT + '/play-craft.png' });
  ok((await page.evaluate(() => window.cq.getState())).panel === 'craft', 'C opens the kitchen'); await page.keyboard.press('Escape');
  await page.keyboard.press('Shift+Slash'); await sleep(300); await page.screenshot({ path: OUT + '/play-help.png' });
  ok((await page.evaluate(() => window.cq.getState())).panel === 'help', '? opens the help sheet'); await page.keyboard.press('Escape');
}
// novice bot: auto-hit on, click the nearest enemy (boss last), eat Mallow Mend under 35% HP, then walk into the gate
{
  const r = await page.evaluate(() => window.cq.hudRect('.autohit')); await page.mouse.click(r.x, r.y);
  const t0 = Date.now(); let shots = 0;
  for (;;) {
    const st = await S(); if (st.won || Date.now() - t0 > 240000) break;
    const p = st.player;
    if (p.hp / p.maxhp < 0.35 && (st.inv.mallow_mend || 0) > 0) {
      const b = await page.evaluate(() => window.cq.hudRect('[data-a=inv]')); await page.mouse.click(b.x, b.y); await sleep(150);
      const s = await page.evaluate(() => window.cq.hudRect('[data-uid=mallow_mend]')); if (s) { await page.mouse.click(s.x, s.y); await sleep(100); const u = await page.evaluate(() => window.cq.hudRect('[data-a=use]')); if (u) await page.mouse.click(u.x, u.y); }
      await page.keyboard.press('Escape'); await sleep(100);
    }
    if ((st.inv.mushroom || 0) >= 2) { await page.keyboard.press('c'); await sleep(120); const row = await page.evaluate(() => window.cq.hudRect('[data-a=craftrow][data-uid="0"]')); if (row) await page.mouse.click(row.x, row.y); await page.keyboard.press('Escape'); }
    const foes = st.entities.filter((e) => e.faction === 'enemy');
    const dist = (e) => Math.hypot(e.x - p.x, e.y - p.y);
    const target = st.bossDead ? null : foes.filter((e) => !e.boss).sort((a, b) => dist(a) - dist(b))[0] || foes.find((e) => e.boss);
    let sp;
    if (target) { if (!p.focus || p.focus !== target.id) sp = await page.evaluate((id) => window.cq.screenOf(id), target.id); }
    else sp = await page.evaluate(([x, y]) => window.cq.screenOf(x, y), [st.gate.x, st.gate.y]);
    if (sp && sp.vis && sp.x > 20 && sp.x < 1260 && sp.y > 90 && sp.y < 560) await page.mouse.click(sp.x, sp.y);
    else if (target || st.bossDead) { // off-screen: walk toward it by clicking the screen edge in its direction
      const tx = target ? target.x : st.gate.x, ty = target ? target.y : st.gate.y; const a = Math.atan2(ty - p.y, tx - p.x);
      await page.mouse.click(640 + Math.cos(a) * 300, 330 + Math.sin(a) * 170);
    }
    if (++shots % 40 === 0) await page.screenshot({ path: `${OUT}/bot-${String(shots / 40).padStart(2, '0')}.png` });
    await sleep(250);
  }
  const st = await page.evaluate(() => window.cq.getState());
  console.log('bot result:', JSON.stringify({ won: st.sim.won, simTime: st.sim.simTime, stats: st.sim.stats, party: st.sim.party.map((m) => m.key + ':L' + m.level + (m.fainted ? '(fainted)' : '')), frameMs: st.frameMs, draws: st.drawCalls, programs: st.programs }));
  await sleep(600); await page.screenshot({ path: OUT + '/bot-end.png' });
  ok(st.sim.won || st.screen === 'win', 'novice bot clears Level 1');
  ok(st.sim.stats.knockouts === 0, `novice bot finishes with 0 knockouts (got ${st.sim.stats.knockouts})`);
}
ok(errors.length === 0, 'no console errors' + (errors.length ? ':\n  ' + errors.join('\n  ') : ''));
await browser.close(); srv.close();
process.exit(fails ? 1 : 0);
