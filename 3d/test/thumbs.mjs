// Render the level-select thumbnails (thumbs/L<id>.jpg) from the real engine: overview-ish cam, no HUD, cast in place.
import { serve, launch, pollUntil, ROOT } from './lib.mjs';
import { LEVELS } from '../src/content.js';
import fs from 'node:fs';
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 640, height: 360 }, deviceScaleFactor: 1 });
for (const id of Object.keys(LEVELS)) {
  await page.goto(`${base}/3d/?dev&seed=21&level=${id}`);
  await pollUntil(page, () => window.cq && window.cq.getState().screen === 'play', null, { timeout: 30000 });
  await page.evaluate(() => { document.querySelector('#hud').hidden = true; document.querySelector('#tags').style.display = 'none'; document.querySelector('#toasts').style.display = 'none';
    const b = [...window.cq.G.ents.values()].find((e) => e.boss); window.cq.teleport(b.x - 260, b.y + 60); window.cq.freeze(); });
  await page.waitForTimeout(900);
  const buf = await page.screenshot({ type: 'jpeg', quality: 72 });
  fs.writeFileSync(`${ROOT}/3d/thumbs/L${id}.jpg`, buf); console.log('L' + id, buf.length, 'bytes');
}
await browser.close(); srv.close();
