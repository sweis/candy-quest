// Program census across all ten levels in one session: nothing may compile after the first title frame.
import { serve, launch, pollUntil } from './lib.mjs';
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(base + '/3d/?dev&seed=11');
await pollUntil(page, () => window.cq && window.cq.getState().screen === 'title');
const keys = () => page.evaluate(() => window.cq.world.renderer.info.programs.map((p) => p.cacheKey));
const seen = new Set(await keys()); const fresh = [];
for (let l = 1; l <= 10; l++) {
  await page.evaluate((l) => { window.cq.start(l); window.cq.G.autoHit = true; window.cq.teleport('boss'); }, l);
  await page.waitForTimeout(2500);
  for (const k of await keys()) if (!seen.has(k)) { fresh.push('L' + l + ': ' + k.slice(0, 90)); seen.add(k); }
}
console.log((fresh.length ? 'FAIL' : 'PASS') + ` no shader program compiled after the title frame across 10 levels (${fresh.length} new)`); fresh.forEach((f) => console.log('  ' + f));
await browser.close(); srv.close(); process.exit(fresh.length ? 1 : 0);
