// Boot check: title renders, level 1 starts, sim time advances for ~10 s, no console errors. Captures named cams.
// Usage: node boot.mjs [--gpu=0]
import { serve, launch, watchErrors, pollUntil, OUT } from './lib.mjs';

const gpu = !process.argv.includes('--gpu=0');
const { srv, base } = await serve();
const browser = await launch({ gpu });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = watchErrors(page);
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
try {
  await page.goto(base + '/3d/?dev&seed=7');
  await pollUntil(page, () => window.cq && window.cq.getState().screen === 'title', null, { timeout: 30000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: OUT + '/3d-title.png' });
  const s0 = await page.evaluate(() => window.cq.getState());
  console.log('boot', s0.bootMs, 'ms  gpu:', s0.gpu, ' programs:', s0.programs, ' draws:', s0.drawCalls);
  await page.evaluate(() => window.cq.start(1));
  await pollUntil(page, () => window.cq.getState().screen === 'play');
  const t0 = await page.evaluate(() => window.cq.getState().sim.simTime);
  await page.waitForTimeout(10000);
  const s1 = await page.evaluate(() => window.cq.getState());
  ok(s1.sim.simTime - t0 > 5, `sim time advances (${t0} -> ${s1.sim.simTime})`);
  ok(!s1.contextLost, 'context not lost');
  console.log('play: draws', s1.drawCalls, 'tris', s1.triangles, 'programs', s1.programs, 'frame', JSON.stringify(s1.frameMs), 'views', s1.views);
  await page.screenshot({ path: OUT + '/3d-play.png' });
  for (const cam of ['overview', 'hero-close']) {
    await page.evaluate((c) => window.cq.cam(c), cam); await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/3d-cam-${cam}.png` });
  }
} catch (e) { ok(false, 'exception: ' + e.message); }
ok(errors.length === 0, 'no console errors' + (errors.length ? ':\n  ' + errors.join('\n  ') : ''));
await browser.close(); srv.close();
process.exit(fails ? 1 : 0);
