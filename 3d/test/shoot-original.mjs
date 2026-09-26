// Reference captures of the original 2D game (title, level select, level 1 in play).
import { serve, launch, watchErrors, OUT } from './lib.mjs';

const { srv, base } = await serve();
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = watchErrors(page);
await page.goto(base + '/index.html');
await page.waitForSelector('.bigbtn', { timeout: 30000 });
await page.screenshot({ path: OUT + '/orig-title.png' });
await page.click('.bigbtn');
await page.waitForSelector('.lvlcard.open');
await page.screenshot({ path: OUT + '/orig-select.png' });
await page.click('.lvlcard.open');
await page.waitForSelector('.ghud');
await page.waitForTimeout(1500);
await page.screenshot({ path: OUT + '/orig-level1.png' });
console.log('errors:', errors);
await browser.close(); srv.close();
