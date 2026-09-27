// Visual check: all 11 pets following Pip on Level 10 (collision on) — capture after walking past props.
import { serve, launch, pollUntil, OUT } from './lib.mjs';
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(base + '/3d/?dev&seed=4');
await page.evaluate(() => localStorage.setItem('cq3d_pets', JSON.stringify(['floss_finch', 'swirlbug', 'geode_jay', 'rock_turtle', 'corn_hog', 'chompgum', 'lico_snake', 'choc_lizard', 'pepp_fish', 'nerd_worm', 'cane_runner'].map((key) => ({ key, level: 5 })))));
await page.goto(base + '/3d/?dev&seed=4&level=10');
await pollUntil(page, () => window.cq && window.cq.getState().screen === 'play', null, { timeout: 30000 });
await page.evaluate(() => { window.cq.clearAll(); document.querySelector('.hint') && document.querySelector('.hint').remove(); window.cq.teleport(1300, 1000); window.cq.sim.aimAt(window.cq.G, 1500, 700, 'ground'); });
await page.waitForTimeout(6000);
await page.screenshot({ path: OUT + '/pets-formation.png' });
await browser.close(); srv.close();
