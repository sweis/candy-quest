// Close-up of any monster kind next to Pip: node shoot-model.mjs crossbow_kind [out-name]
import { serve, launch, pollUntil, OUT } from './lib.mjs';
const kinds = process.argv.slice(2);
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
await page.goto(base + '/3d/?dev&seed=3&level=1');
await pollUntil(page, () => window.cq && window.cq.getState().screen === 'play');
for (const k of kinds) {
  await page.evaluate((k) => { const cq = window.cq; cq.clearAll(); cq.teleport(900, 1300); const id = cq.spawn(k, { x: 1010, y: 1300 }); cq.G.ents.get(id).atk = 0; cq.cam('hero-close'); }, k);
  await page.waitForTimeout(1500); await page.evaluate(() => window.cq.freeze());
  await page.screenshot({ path: `${OUT}/model-${k}.png` }); await page.evaluate(() => window.cq.resume());
}
await browser.close(); srv.close();
