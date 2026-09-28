// Per-level render cost from the real play camera at 3 spots (start, map centre, boss) + frame times over 5 s.
import { serve, launch, pollUntil, watchErrors } from './lib.mjs';
import { LEVELS } from '../src/content.js';
const only = process.argv.slice(2).map(Number);
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } }); const errors = watchErrors(page);
const rows = [];
for (const id of Object.keys(LEVELS).map(Number).filter((i) => !only.length || only.includes(i))) {
  await page.goto(`${base}/3d/?dev&seed=13&level=${id}${process.env.GFX ? '&gfx=' + process.env.GFX : ''}`);
  await pollUntil(page, () => window.cq && window.cq.getState().screen === 'play', null, { timeout: 30000 });
  const r = { level: id };
  for (const spot of ['start', 'centre', 'boss']) {
    await page.evaluate((s) => { const G = window.cq.G; if (s === 'centre') window.cq.teleport(G.W / 2, G.H / 2); else window.cq.teleport(s); window.cq.freeze(); }, spot);
    await page.waitForTimeout(500);
    const st = await page.evaluate(() => window.cq.getState()); r[spot] = `${st.drawCalls}d/${Math.round(st.triangles / 1000)}kt`;
    await page.evaluate(() => window.cq.resume());
  }
  await page.evaluate(() => { window.cq.teleport('centre' in window ? 'start' : 'start'); window.cq.G.autoHit = true; });
  await page.waitForTimeout(5000);
  const st = await page.evaluate(() => window.cq.getState());
  r.frame = `${st.frameMs.p50}/${st.frameMs.p99}ms`; r.programs = st.programs; r.enemies = st.sim.counts.enemy;
  const cpu = await page.evaluate(() => { const t = performance.now(); for (let i = 0; i < 30; i++) { window.cq.world.sync(window.cq.G, 1 / 60); window.cq.world.render(); } return ((performance.now() - t) / 30).toFixed(2); });
  r.cpuMsPerFrame = cpu; rows.push(r);
}
console.table(rows); console.log('errors:', errors.length ? errors : 'none');
await browser.close(); srv.close();
