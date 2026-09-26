// Classic title shows the 3D link; a real click on it lands on the 3D title with no console errors.
import { serve, launch, watchErrors, pollUntil, OUT } from './lib.mjs';
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } }); const errors = watchErrors(page);
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
await page.route('**/favicon.ico', (r) => r.fulfill({ status: 204 }));
await page.goto(base + '/index.html'); await page.waitForSelector('a[href="3d/"]', { timeout: 30000 }); await page.waitForTimeout(500);
await page.screenshot({ path: OUT + '/classic-title-link.png' });
const b = await (await page.$('a[href="3d/"]')).boundingBox();
ok(await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y).closest('a[href="3d/"]'), [b.x + b.width / 2, b.y + b.height / 2]), '3D link is clickable (topmost)');
await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
await page.waitForSelector('.scr.title .bigbtn', { timeout: 30000 });
ok(page.url().endsWith('/3d/'), 'lands on ' + page.url());
ok(errors.length === 0, 'no console errors ' + errors.join(' | '));
await browser.close(); srv.close(); process.exit(fails ? 1 : 0);
