// Shader-program census: programs after the first title frame must equal programs after a full level of play.
import { serve, launch, pollUntil } from './lib.mjs';
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(base + '/3d/?dev&seed=11');
await pollUntil(page, () => window.cq && window.cq.getState().screen === 'title');
const list = () => page.evaluate(() => window.cq.world.renderer.info.programs.map((p) => p.name + ' ' + p.cacheKey.split(',').slice(0, 60).join(',').length + ':' + p.id));
const names = () => page.evaluate(() => window.cq.world.renderer.info.programs.map((p) => p.name));
const a = await list();
await page.evaluate(() => { window.cq.start(1); window.cq.G.autoHit = true; });
// exercise every FX: fights, projectiles, taming hearts, equip, food buff, KO, boss death, gate open
await page.evaluate(async () => { const cq = window.cq, G = cq.G, S = cq.sim;
  const w = [...G.ents.values()].find((e) => e.faction === 'wild'); G.player.x = w.x - 40; G.player.y = w.y; for (let i = 0; i < 3; i++) S.doTame(G);
  G.inv.cane_sword = 1; S.equip(G, 'weapon', 'cane_sword'); G.inv.sugar_vest = 1; S.equip(G, 'armor', 'sugar_vest'); G.inv.glow_gloop = 1; S.useFood(G, 'glow_gloop');
  cq.teleport(1200, 700); });
await page.waitForTimeout(8000);
await page.evaluate(() => { window.cq.lose(); }); await page.waitForTimeout(1500);
await page.evaluate(() => { window.cq.killBoss(); window.cq.teleport('boss'); }); await page.waitForTimeout(3000);
await page.evaluate(() => window.cq.win()); await page.waitForTimeout(1500);
const b = await list();
console.log('title programs:', a.length, ' after play:', b.length);
const an = new Set(a.map((x) => x.split(':')[1])); for (const x of b) if (!an.has(x.split(':')[1])) console.log('  NEW mid-game:', x);
const fresh = b.filter((x) => !an.has(x.split(':')[1]));
console.log((fresh.length ? 'FAIL' : 'PASS') + ' no shader program compiled after the title frame (' + fresh.length + ' new)');
process.exitCode = fresh.length ? 1 : 0;
await browser.close(); srv.close();
