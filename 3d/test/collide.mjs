// Collision checks (node, deterministic): on every level, after 45 s of simulated play with a full pet party and the
// player clicking around, no pet overlaps another pet or Pip, nothing mobile stands inside a solid, no pickup spawned
// inside one, and keyboard-walking into a rock slides instead of passing through.
import { createGame, step, aimAt } from '../src/sim.js';
import { solidsFor } from '../src/solids.js';
import { LEVELS, ALLIES } from '../src/content.js';
import { catalog } from '../src/models.js';
const bodyRadius = (sprite, e) => { if (sprite === 'hero') return 15; const c = catalog(sprite); return Math.round(c.r * (c.scale || 1) * ((e && e.scale) || 1) * 50 * 0.72); };
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const pets = Object.keys(ALLIES).filter((k) => k !== 'prickletreat').map((key) => ({ key, level: 4 }));
for (const lvl of Object.keys(LEVELS).map(Number)) {
  const solids = solidsFor(lvl);
  const G = createGame(lvl, { seed: 100 + lvl, savedPets: pets.slice(0, 3), solids, radiusOf: bodyRadius });
  const inside = (e, r) => solids.find((o) => Math.hypot(e.x - o.x, e.y - o.y) < o.r + r - 0.5);
  const items = [...G.ents.values()].filter((e) => e.faction === 'item');
  ok(!items.some((e) => inside(e, 12)), `L${lvl}: no pickup spawned inside scenery (${items.length} pickups, ${solids.length} solids)`);
  let worstPet = 0, worstSolid = 0; const route = [[900, 500], [400, 1100], [1500, 1200], [1800, 400], [600, 300], [1200, 800]];
  for (let t = 0; t < 45 * 60; t++) {
    if (t % 450 === 0) { const [x, y] = route[(t / 450) % route.length]; aimAt(G, x * G.W / 2200, y * G.H / 1500, 'ground'); }
    G.player.hp = G.player.maxhp; step(G, 1);
    const team = [...G.ents.values()].filter((e) => e.faction === 'ally' || e.faction === 'player');
    for (let i = 0; i < team.length; i++) for (let j = i + 1; j < team.length; j++) {
      const a = team[i], b = team[j], ov = bodyRadius(a.sprite, a) + bodyRadius(b.sprite, b) - Math.hypot(a.x - b.x, a.y - b.y);
      worstPet = Math.max(worstPet, ov);
    }
    for (const e of G.ents.values()) if (e.faction !== 'item' && e.faction !== 'gate') { const r = bodyRadius(e.sprite, e); for (const o of solids) worstSolid = Math.max(worstSolid, o.r + r - Math.hypot(e.x - o.x, e.y - o.y)); }
  }
  ok(worstPet < 3, `L${lvl}: Pip + pets never overlap (worst overlap ${worstPet.toFixed(1)} px)`);
  ok(worstSolid < 1, `L${lvl}: no creature ever inside a rock/tree/etc (worst ${worstSolid.toFixed(1)} px)`);
}
// keyboard into a rock: slide, don't pass
{
  const lvl = 1, solids = solidsFor(lvl), rock = solids.find((o) => o.t === 'rock');
  const G = createGame(lvl, { seed: 5, solids, radiusOf: bodyRadius });
  for (const e of [...G.ents.values()]) if (e.faction === 'enemy') { e.dead = true; G.ents.delete(e.id); }
  G.player.x = rock.x - rock.r - 60; G.player.y = rock.y + 4; G.input.right = true;
  let minD = Infinity; for (let i = 0; i < 120; i++) { step(G, 1); minD = Math.min(minD, Math.hypot(G.player.x - rock.x, G.player.y - rock.y)); }
  ok(minD >= rock.r + 15 - 0.5 && G.player.x > rock.x, `walking into a rock slides around it (closest ${minD.toFixed(1)} px ≥ ${rock.r + 15}, ended past it: ${G.player.x > rock.x})`);
}
process.exit(fails ? 1 : 0);
