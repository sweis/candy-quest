// Headless sim checks (node): time advances, movement speed, taming, boss kill -> gate -> win, determinism.
import { createGame, step, snapshot, doTame, aimAt } from '../src/sim.js';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const G = createGame(1, { seed: 42 });
const x0 = G.player.x; G.input.right = true; for (let i = 0; i < 120; i++) step(G); G.input.right = false;
ok(G.time > 1.99, 'sim time advances (' + G.time.toFixed(2) + 's)');
ok((G.player.x - x0) / 2 > 8 * 50 * 0.3, 'holding D for 2 s moves ' + ((G.player.x - x0) / 2 / 50).toFixed(2) + ' m/s');
// taming: stand next to each wild animal and feed bait (3 bait = 3*34 = 102 trust)
const w = [...G.ents.values()].find(e => e.faction === 'wild');
G.player.x = w.x - 30; G.player.y = w.y; for (let i = 0; i < 3; i++) doTame(G);
ok(G.party.length === 1 && G.party[0].key === w.wkey, 'tamed ' + w.wkey + ' with 3 bait');
// boss kill -> gate -> win
const boss = [...G.ents.values()].find(e => e.boss); boss.hp = 1;
G.player.x = boss.x - 50; G.player.y = boss.y; G.player.facing = 1; aimAt(G, boss.x, boss.y, boss.id);
for (let i = 0; i < 60 && !G.bossDead; i++) step(G);
ok(G.bossDead, 'boss dies via real attack path');
aimAt(G, G.gate.x, G.gate.y); for (let i = 0; i < 1200 && !G.won; i++) step(G);
ok(G.won, 'walking to the gate wins (tick ' + G.tick + ')');
// determinism
const run = () => { const g = createGame(1, { seed: 7 }); g.autoHit = true; aimAt(g, 1200, 700); for (let i = 0; i < 900; i++) step(g); return JSON.stringify(snapshot(g)); };
ok(run() === run(), 'same seed + inputs => identical snapshot');
process.exit(fails ? 1 : 0);
