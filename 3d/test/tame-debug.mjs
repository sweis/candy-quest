import { serve, launch, pollUntil } from './lib.mjs';
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(base + '/3d/?dev&seed=11&level=1'); await pollUntil(page, () => window.cq && window.cq.getState().screen === 'play');
const s = await page.evaluate(() => window.cq.getState().sim);
console.log('bait', s.inv.lollipop, 'lollipops on map', s.entities.filter(e => e.kind === 'lollipop').map(e => [e.x|0, e.y|0]), 'wild', s.entities.filter(e => e.faction === 'wild').map(e => [e.kind, e.x|0, e.y|0]));
await browser.close(); srv.close();
