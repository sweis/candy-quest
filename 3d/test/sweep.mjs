// Stills sweep over EVERY level in the game's own registry (LEVELS), play + overview cams, plus a phone-landscape
// pass driven by touch taps. Fails on blank frames (mean luma ~0 or <2% pixel variance) or any console error.
import { serve, launch, watchErrors, pollUntil, OUT } from './lib.mjs';
import { LEVELS } from '../src/data.js';

const { srv, base } = await serve(); const browser = await launch();
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
async function stats(page, buf) {
  return page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = 160; c.height = 90; const g = c.getContext('2d'); g.drawImage(img, 0, 0, 160, 90);
    const d = g.getImageData(0, 0, 160, 90).data; let sum = 0, sum2 = 0; const n = d.length / 4;
    for (let i = 0; i < d.length; i += 4) { const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; sum += l; sum2 += l * l; }
    const mean = sum / n; return { mean: +mean.toFixed(1), sd: +Math.sqrt(sum2 / n - mean * mean).toFixed(1) };
  }, buf.toString('base64'));
}
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } }); const errors = watchErrors(page);
for (const id of Object.keys(LEVELS)) {
  await page.goto(`${base}/3d/?dev&seed=9&level=${id}`);
  await pollUntil(page, () => window.cq && window.cq.getState().screen === 'play', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  for (const cam of ['play', 'overview']) {
    await page.evaluate((c) => window.cq.cam(c), cam); await page.waitForTimeout(350);
    const buf = await page.screenshot({ path: `${OUT}/sweep-L${id}-${cam}.png` });
    const s = await stats(page, buf);
    ok(s.mean > 8 && s.sd > 255 * 0.02, `L${id} ${LEVELS[id].name} [${cam}] not blank (luma ${s.mean} ± ${s.sd})`);
  }
  const st = await page.evaluate(() => window.cq.getState());
  console.log(`     L${id}: draws ${st.drawCalls}, tris ${st.triangles}, programs ${st.programs}, enemies ${st.sim.counts.enemy}`);
}
ok(errors.length === 0, 'sweep: no console errors' + (errors.length ? ' ' + errors.slice(0, 3).join(' | ') : ''));

// phone landscape: touch the whole cold path (title → select → level 1), then tap an enemy
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
const ph = await ctx.newPage(); const perr = watchErrors(ph);
await ph.goto(base + '/3d/?dev&seed=4');
await pollUntil(ph, () => window.cq && window.cq.getState().screen === 'title', null, { timeout: 30000 });
const tap = async (sel) => { const b = await (await ph.$(sel)).boundingBox(); await ph.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); };
await ph.screenshot({ path: OUT + '/phone-title.png' });
await tap('.bigbtn'); await ph.waitForSelector('.lvl.open'); await tap('.lvl.open');
await pollUntil(ph, () => window.cq.getState().screen === 'play'); await ph.waitForTimeout(1200);
const q = await ph.evaluate(() => window.cq.getState()); ok(q.quality === 'medium' && q.sim, `phone starts on the medium tier without MSAA (${q.quality})`);
const x0 = q.sim.player.x;
const tgt = await ph.evaluate(() => window.cq.screenOf(window.cq.G.player.x + 220, window.cq.G.player.y));
await ph.touchscreen.tap(tgt.x, tgt.y); await ph.waitForTimeout(1600);
const q2 = await ph.evaluate(() => window.cq.getState()); ok(q2.sim.player.x - x0 > 150, `tap-to-move works on touch (moved ${Math.round(q2.sim.player.x - x0)} px)`);
await ph.screenshot({ path: OUT + '/phone-play.png' });
ok(perr.length === 0, 'phone: no console errors' + (perr.length ? ' ' + perr.join(' | ') : ''));
await browser.close(); srv.close(); process.exit(fails ? 1 : 0);
