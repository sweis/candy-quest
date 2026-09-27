// Environment-only stills for every biome: overview + play cam, enemies cleared so the dressing reads.
import { serve, launch, watchErrors, pollUntil, OUT } from './lib.mjs';
import { LEVELS } from '../src/data.js';
const only = process.argv.slice(2).map(Number);
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } }); const errors = watchErrors(page);
for (const id of Object.keys(LEVELS).map(Number).filter((i) => !only.length || only.includes(i))) {
  await page.goto(`${base}/3d/?dev&seed=9&level=${id}`);
  await pollUntil(page, () => window.cq && window.cq.getState().screen === 'play', null, { timeout: 30000 });
  await page.evaluate(() => { window.cq.clearAll(); document.querySelector('#hud').hidden = true; document.querySelector('#tags').style.display = 'none'; window.cq.teleport(1000, 800); });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/biome-L${id}-play.png` });
  await page.evaluate(() => window.cq.cam('overview')); await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/biome-L${id}-overview.png` });
  console.log('L' + id, LEVELS[id].scenery, JSON.stringify((await page.evaluate(() => window.cq.getState())).drawCalls));
}
console.log('errors:', errors.length ? errors : 'none');
await browser.close(); srv.close();
