// Tally draw calls by category for one frozen frame (hooks renderBufferDirect). node drawcensus.mjs <level> [spot]
import { serve, launch, pollUntil } from './lib.mjs';
const lvl = +(process.argv[2] || 10), spot = process.argv[3] || 'centre';
const { srv, base } = await serve(); const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(`${base}/3d/?dev&seed=13&level=${lvl}`);
await pollUntil(page, () => window.cq && window.cq.getState().screen === 'play', null, { timeout: 30000 });
const out = await page.evaluate(async (spot) => {
  const cq = window.cq, G = cq.G, w = cq.world, r = w.renderer;
  if (spot === 'centre') cq.teleport(G.W / 2, G.H / 2); else cq.teleport(spot);
  cq.freeze(); await new Promise((res) => setTimeout(res, 400));
  const tally = {}, orig = r.renderBufferDirect.bind(r);
  const cat = (o) => { let n = o; while (n && !n.userData.cat) { if (n.name && /^(props|glow|occ|ground|sea|water|clouds|bd)/.test(n.name)) return n.name.split(':')[0]; n = n.parent; } return n ? n.userData.cat : (o.material && o.material.name) || 'other'; };
  for (const v of w.views.values()) v.group.userData.cat = 'creature:' + v.faction;
  for (const v of w.itemViews.values()) v.group.userData.cat = 'item';
  r.renderBufferDirect = function (camera, scene, geo, mat, obj, group) { const k = (camera.isOrthographicCamera ? 'shadow ' : '') + cat(obj); tally[k] = (tally[k] || 0) + 1; return orig(camera, scene, geo, mat, obj, group); };
  w.sync(G, 0); w.render(); r.renderBufferDirect = orig;
  return tally;
}, spot);
console.log(Object.entries(out).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v}\t${k}`).join('\n'));
await browser.close(); srv.close();
