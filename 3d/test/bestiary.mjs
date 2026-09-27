// Close-up of every creature in the catalog via cq.showcase (framed by height), tiled into contact sheets.
import { serve, launch, watchErrors, pollUntil, OUT } from './lib.mjs';
import { execFileSync } from 'node:child_process';
const list = process.argv.slice(2);
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 640, height: 480 } }); const errors = watchErrors(page);
await page.goto(base + '/3d/?dev&seed=2&level=1');
await pollUntil(page, () => window.cq && window.cq.getState().screen === 'play');
await page.evaluate(() => { window.cq.clearAll(); for (const e of [...window.cq.G.ents.values()]) if (e.faction === 'wild' || e.boss) window.cq.G.ents.delete(e.id); document.querySelector('#hud').hidden = true; document.querySelector('#tags').style.display = 'none'; window.cq.teleport(1100, 700); });
const sprites = list.length ? list : await page.evaluate(async () => { const m = await import('./src/models2.js'); return Object.keys(m.CATALOG2); });
const files = [];
for (const s of sprites) { await page.evaluate((s) => window.cq.showcase(s), s); await page.waitForTimeout(900); const f = `${OUT}/beast-${s}.png`; await page.screenshot({ path: f }); files.push(f); }
console.log('shot', files.length, 'errors:', errors.length ? errors : 'none');
for (let i = 0; i < files.length; i += 12) {
  const chunk = files.slice(i, i + 12), n = chunk.length;
  const args = ['-loglevel', 'error', '-y']; chunk.forEach((f) => args.push('-i', f));
  const lay = chunk.map((_, j) => `${(j % 4) * 320}_${Math.floor(j / 4) * 240}`).join('|');
  args.push('-filter_complex', chunk.map((_, j) => `[${j}]scale=320:240[s${j}];`).join('') + chunk.map((_, j) => `[s${j}]`).join('') + (n > 1 ? `xstack=inputs=${n}:layout=${lay}:fill=black` : 'null'), `${OUT}/sheet-beasts-${i / 12}.png`);
  execFileSync('ffmpeg', args);
}
await browser.close(); srv.close();
