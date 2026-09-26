// Pip standing just north of (behind) a bottom-edge lollipop tree: the tree must fade; stepping away restores it.
import { serve, launch, pollUntil, watchErrors, OUT } from './lib.mjs';
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } }); const errors = watchErrors(page);
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
await page.goto(base + '/3d/?dev&seed=5&level=1');
await pollUntil(page, () => window.cq && window.cq.getState().screen === 'play');
await page.evaluate(() => { window.cq.clearAll(); window.cq.teleport(980, 1170); });
await page.waitForTimeout(900);
let st = await page.evaluate(() => window.cq.getState());
ok(st.faded.some((f) => f.includes('980,1240')), 'lollipop at (980,1240) fades when Pip is behind it: ' + JSON.stringify(st.faded));
await page.screenshot({ path: OUT + '/occlusion-behind.png' });
await page.evaluate(() => window.cq.teleport(980, 1320)); await page.waitForTimeout(900);
st = await page.evaluate(() => window.cq.getState());
ok(!st.faded.some((f) => f.includes('980,1240')), 'tree is opaque again once Pip is in front of it');
ok(errors.length === 0, 'no console errors ' + errors.join(' | '));
await browser.close(); srv.close(); process.exit(fails ? 1 : 0);
