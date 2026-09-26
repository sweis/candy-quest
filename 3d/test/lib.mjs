// Shared harness: static server + browser launcher for Candy Quest checks.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const OUT = path.join(ROOT, '3d', 'test', 'out');
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.jsx': 'text/babel' };

export function serve(port = 0) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
      res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(port, '127.0.0.1', () => resolve({ srv, base: `http://127.0.0.1:${srv.address().port}` }));
  });
}

// Prefer the locally cached Chrome for Testing (newer than playwright's pinned build).
function chromePath() {
  const c = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  if (!fs.existsSync(c)) return undefined;
  const dirs = fs.readdirSync(c).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1]);
  for (const d of dirs) {
    const p = path.join(c, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

export async function launch({ gpu = true } = {}) {
  const args = gpu ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] : ['--use-gl=swiftshader'];
  return chromium.launch({ executablePath: chromePath(), headless: true, args });
}

// Collects console errors / page errors for a page.
export function watchErrors(page) {
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  return errors;
}

export async function pollUntil(page, fn, arg, { timeout = 20000, every = 100 } = {}) {
  const t0 = Date.now();
  for (;;) {
    const v = await page.evaluate(fn, arg).catch(() => undefined);
    if (v) return v;
    if (Date.now() - t0 > timeout) throw new Error('pollUntil timeout: ' + fn.toString().slice(0, 120));
    await new Promise(r => setTimeout(r, every));
  }
}
