// Biome dressing: sky, fog, ground, props and the Candy Gate. All static props are merged into a few chunked
// meshes that share the one candy shader, so a whole biome costs a handful of draw calls.
import { Kit, G, PAT, THREE, mergeGeos, materials } from './kit.js';
import { makeScenery } from './data.js';

export const PX = 1 / 50; // world px -> metres
const V = (x, y) => [x * PX, y * PX];

// ------------------------------------------------------------------ noise
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, y) => vnoise(x, y) * 0.65 + vnoise(x * 2.3 + 7, y * 2.3 + 3) * 0.35;
function rngFrom(seed) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ------------------------------------------------------------------ biome palettes (forest is the fully dressed one)
export const BIOMES = {
  forest: { sky: [0x7cc8f2, 0xcdeefc, 0xfff0d8], fog: 0xe9f4ea, ground: [0x8fd67c, 0x76c465, 0xa9e393, 0xc6efb2], dirt: 0xd9b27c, hill: 0x7cc46a,
    sun: 0xfff0d6, sunI: 3.1, hemiSky: 0xd6ecff, hemiGround: 0x8cc77a, hemiI: 1.15 },
};
export const biome = (kind) => BIOMES[kind] || BIOMES.forest;

// ------------------------------------------------------------------ sky dome
export function makeSky(pal) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(pal.sky[0]) }, mid: { value: new THREE.Color(pal.sky[1]) }, bot: { value: new THREE.Color(pal.sky[2]) }, sunDir: { value: new THREE.Vector3(-0.5, 0.6, 0.5).normalize() } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform vec3 sunDir; varying vec3 vDir;
      void main(){ float h = vDir.y; vec3 c = mix(bot, mid, smoothstep(-0.02, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.75, h));
        float s = max(dot(normalize(vDir), sunDir), 0.0); c += vec3(1.0,0.93,0.8) * (pow(s, 40.0) * 0.35 + pow(s, 6.0) * 0.08);
        gl_FragColor = vec4(c, 1.0); }`,
  });
  mat.name = 'sky';
  const m = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), mat); m.frustumCulled = false; m.renderOrder = -1; return m;
}

// ------------------------------------------------------------------ prop builders (return Kit, authored at origin, metres)
const colorOf = { pink: PAT.swirlPink, teal: PAT.swirlTeal, orange: PAT.swirlOrange };
export const PROPS = {
  lolli(k, o, r) {
    const s = 1.35 * (o.s || 1);
    k.add('root', G.cyl(0.07 * s, 0.085 * s, 2.0 * s, 12), { c: 0xf6efe4, p: [0, 1.0 * s, 0] });
    const yaw = (r() - 0.5) * 50;
    k.add('root', G.cyl(0.82 * s, 0.82 * s, 0.26 * s, 40), { pat: colorOf[o.c] || PAT.swirlPink, uv: 'y', p: [0, 2.72 * s, 0], r: [90, yaw, 0], order: 'YXZ' });
    k.add('root', G.torus(0.82 * s, 0.13 * s, 10, 40), { c: o.c === 'teal' ? 0x7ad9c4 : o.c === 'orange' ? 0xffb84d : 0xff5d8f, p: [0, 2.72 * s, 0], r: [0, yaw, 0], order: 'YXZ' });
    // ribbon bow at the neck
    for (const sd of [-1, 1]) k.add('root', G.sphere(0.16 * s, 10, 8), { c: 0xff7ba6, p: [sd * 0.14 * s, 1.72 * s, 0.05], s: [1.2, 0.7, 0.45], r: [0, 0, sd * 25] });
    k.add('root', G.sphere(0.07 * s, 8, 6), { c: 0xe23d72, p: [0, 1.72 * s, 0.06] });
  },
  cane(k, o, r) {
    const flip = r() < 0.5 ? -1 : 1, h = 2.3;
    k.add('root', G.tube([[0, -0.1, 0], [0, h * 0.5, 0], [0, h * 0.86, 0], [flip * 0.12, h * 1.0, 0], [flip * 0.42, h * 1.02, 0], [flip * 0.56, h * 0.88, 0], [flip * 0.55, h * 0.74, 0]], 0.12, 60, 14), { pat: PAT.cane, r: [0, (r() - 0.5) * 60, 0] });
  },
  bush(k, o, r) {
    const base = new THREE.Color(o.cHex || 0xa98cff), light = base.clone().lerp(new THREE.Color(0xffffff), 0.35).getHex(), mid = base.getHex();
    const n = 5 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, rr = 0.35 + r() * 0.2, R = 0.35 + r() * 0.2;
      k.add('root', G.sphere(R, 16, 12), { c: i % 2 ? light : mid, p: [Math.cos(a) * rr, 0.38 + r() * 0.2, Math.sin(a) * rr * 0.8] });
    }
    k.add('root', G.sphere(0.5, 18, 14), { c: light, p: [0, 0.62, 0] });
  },
  rock(k, o, r) {
    const s = o.s || 1, g = G.ico(0.55 * s, 2); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const f = 0.85 + 0.3 * fbm(x * 3 + 11, z * 3 + y * 2); p.setXYZ(i, x * f, Math.max(-0.1, y * f * 0.75), z * f); }
    g.computeVertexNormals();
    k.add('root', g, { c: 0x8a5a36, p: [0, 0.2 * s, 0] });
    for (let i = 0; i < 4; i++) k.add('root', G.oct(0.06 * s), { c: 0xfff8f0, p: [(r() - 0.5) * 0.6 * s, 0.55 * s, (r() - 0.5) * 0.5 * s], r: [r() * 90, r() * 90, 0] });
  },
  pebble(k, o, r) { for (const [x, z, R] of [[0, 0, 0.18], [0.28, 0.12, 0.13], [-0.25, 0.14, 0.12]]) k.add('root', G.sphere(R, 12, 8), { c: 0xb8b1a8, p: [x, R * 0.5, z], s: [1, 0.7, 1] }); },
  flower(k, o, r) {
    const c = o.cHex || 0xff5d8f;
    k.add('root', G.cyl(0.02, 0.02, 0.3, 6), { c: 0x58a348, p: [0, 0.15, 0] });
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; k.add('root', G.sphere(0.09, 10, 8), { c, p: [Math.cos(a) * 0.1, 0.32, Math.sin(a) * 0.1], s: [1, 0.45, 1] }); }
    k.add('root', G.sphere(0.06, 10, 8), { c: 0xffe06a, p: [0, 0.34, 0] });
  },
  tuft(k, o, r) { for (let i = 0; i < 5; i++) { const a = -0.6 + i * 0.3; k.add('root', G.cone(0.04, 0.34 + (i % 2) * 0.1, 5), { c: i % 2 ? 0x6fbf5a : 0x9fdb8a, p: [Math.sin(a) * 0.08, 0.16, (r() - 0.5) * 0.12], r: [0, 0, a * 40] }); } },
  gumdrop(k, o, r) {
    const cols = [0xff5da8, 0x7ad9c4, 0xffb84d, 0xa98cff, 0x9be15d, 0x5ab8ff];
    k.add('root', G.lathe([[0, 0], [0.34, 0], [0.36, 0.08], [0.3, 0.38], [0.15, 0.58], [0, 0.62]], 20), { c: cols[Math.floor(r() * cols.length)], s: 0.8 + r() * 0.4 });
  },
  giantLolli(k, o, r) { PROPS.lolli(k, { c: o.c, s: 2.4 + r() * 1.4 }, r); },
  cloud(k, o, r) { for (let i = 0; i < 6; i++) k.add('root', G.sphere(2.2 + r() * 1.6, 14, 10), { c: i % 2 ? 0xffffff : 0xffe3ef, p: [(i - 2.5) * 2.4, r() * 1.2, (r() - 0.5) * 2] }); },
};

// ------------------------------------------------------------------ ground (vertex-coloured, two frequencies, dirt painted in)
function buildGround(W, H, pal, items) {
  const margin = 60, gw = W + margin * 2, gh = H + margin * 2, seg = 2;
  const nx = Math.round(gw / seg), nz = Math.round(gh / seg);
  const geo = new THREE.PlaneGeometry(gw, gh, nx, nz); geo.rotateX(-Math.PI / 2); geo.translate(W / 2, 0, H / 2);
  const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
  const c0 = new THREE.Color(pal.ground[0]), c1 = new THREE.Color(pal.ground[1]), c2 = new THREE.Color(pal.ground[2]), c3 = new THREE.Color(pal.ground[3]);
  const dirt = new THREE.Color(pal.dirt), hill = new THREE.Color(pal.hill), tmp = new THREE.Color();
  const dirts = items.filter((o) => o.t === 'dirt').map((o) => ({ x: o.x * PX, z: o.y * PX, rx: 1.5 * (o.s || 1), rz: 0.92 * (o.s || 1) }));
  const ponds = items.filter((o) => o.t === 'pond').map((o) => ({ x: o.x * PX, z: o.y * PX, rx: 2.5, rz: 1.35 }));
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const n = fbm(x * 0.07, z * 0.07), n2 = vnoise(x * 0.45 + 3, z * 0.45 + 9);
    tmp.copy(c1).lerp(c0, THREE.MathUtils.smoothstep(n, 0.3, 0.7)).lerp(c2, THREE.MathUtils.smoothstep(n, 0.62, 0.85) * 0.8);
    tmp.lerp(c3, Math.max(0, n2 - 0.72) * 1.4);
    // outside the play area: rolling hills
    const ox = Math.max(0, -x, x - W), oz = Math.max(0, -z, z - H), out = Math.hypot(ox, oz);
    let y = 0;
    if (out > 0) { const t = THREE.MathUtils.smoothstep(out, 1.5, 18); y = t * (1.2 + fbm(x * 0.05 + 40, z * 0.05) * 7); tmp.lerp(hill, t * 0.6); }
    for (const d of dirts) { const q = Math.hypot((x - d.x) / d.rx, (z - d.z) / d.rz) + (vnoise(x * 1.7, z * 1.7) - 0.5) * 0.35; if (q < 1) tmp.lerp(dirt, THREE.MathUtils.smoothstep(1 - q, 0, 0.25)); }
    for (const p of ponds) { const q = Math.hypot((x - p.x) / p.rx, (z - p.z) / p.rz); if (q < 1.25) { tmp.lerp(new THREE.Color(0xf3dcb0), THREE.MathUtils.smoothstep(1.25 - q, 0, 0.12)); } if (q < 1) y = -0.35 * THREE.MathUtils.smoothstep(1 - q, 0, 0.35); }
    pos.setY(i, y);
    col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  // point the ground's uvs at the white atlas cell so it shares the candy program
  const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.05, 0.95);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, materials().matte); m.receiveShadow = true; m.name = 'ground';
  return m;
}

// ------------------------------------------------------------------ the gate (dynamic: open/locked)
export function buildGate() {
  const k = new Kit(); k.part('portal', 'root', [0, 2.15, 0]).part('bars', 'root', [0, 2.1, 0]);
  for (const s of [-1, 1]) {
    k.add('root', G.cyl(0.3, 0.34, 2.4, 20), { pat: PAT.cane, p: [s * 1.45, 1.2, 0] });
    k.add('root', G.cyl(0.42, 0.44, 0.22, 20), { c: 0xff5d8f, p: [s * 1.45, 0.11, 0] });
    k.add('root', G.sphere(0.34, 16, 12), { c: 0xff5d8f, p: [s * 1.45, 2.45, 0], s: [1, 0.5, 1] });
  }
  k.add('root', G.torus(1.45, 0.28, 14, 40, Math.PI), { pat: PAT.caneWide, p: [0, 2.4, 0] });
  k.add('root', G.sphere(0.36, 18, 14), { c: 0xffd24d, p: [0, 3.9, 0] });
  k.add('portal', G.cyl(1.14, 1.14, 0.06, 48), { pat: PAT.swirlRainbow, uv: 'y', p: [0, 2.15, 0], r: [90, 0, 0] });
  for (const y of [1.45, 2.15, 2.85]) k.add('bars', G.rbox(2.7, 0.2, 0.14, 0.06), { c: 0x6b4427, p: [0, y, 0.14] });
  return k;
}

// ------------------------------------------------------------------ assemble a biome
export function buildBiome(kind, W_px, H_px) {
  const pal = biome(kind), W = W_px * PX, H = H_px * PX, M = materials();
  const group = new THREE.Group(); group.name = 'biome';
  const items = makeScenery(kind === 'forest' ? 'forest' : kind);
  const rnd = rngFrom(1234);
  group.add(buildGround(W, H, pal, items));

  // props -> chunked static meshes (casters / non-casters)
  const CH = 12; const chunks = new Map();
  const put = (x, z, kit, cast = true) => {
    const key = `${Math.floor(x / CH)},${Math.floor(z / CH)},${cast ? 1 : 0}`;
    const g = kit.static(); g.translate(x, 0, z);
    if (!chunks.has(key)) chunks.set(key, { geos: [], glows: [], cast });
    chunks.get(key).geos.push(g);
    const gl = kit.staticGlow(); if (gl) { gl.translate(x, 0, z); chunks.get(key).glows.push(gl); }
  };
  const colorHex = { 'var(--purple)': 0xa98cff, 'var(--teal)': 0x7ad9c4, 'var(--orange)': 0xffb84d, 'var(--pink)': 0xff5d8f, '#fff': 0xffffff };
  for (const o of items) {
    const [x, z] = V(o.x, o.y);
    const b = PROPS[o.t]; if (!b) continue;
    const k = new Kit(); b(k, { ...o, cHex: colorHex[o.c] }, rnd);
    put(x, z, k, !['pebble', 'tuft', 'flower'].includes(o.t));
  }
  // flourish: scatter extra tufts + flowers across the meadow (not in the classic build; decoration only)
  for (let i = 0; i < 160; i++) {
    const x = 1 + rnd() * (W - 2), z = 1 + rnd() * (H - 2);
    if (items.some((o) => o.t === 'pond' && Math.hypot(o.x * PX - x, (o.y * PX - z) * 1.8) < 3.4)) continue;
    const k = new Kit(); (rnd() < 0.8 ? PROPS.tuft : PROPS.flower)(k, { cHex: [0xff5d8f, 0xffb84d, 0xa98cff, 0xffffff][i % 4] }, rnd);
    put(x, z, k, false);
  }
  // boundary: a hedge of gumdrops just outside the walkable edge
  const step = 1.25;
  for (let x = -0.6; x <= W + 0.6; x += step) for (const z of [-0.7, H + 0.7]) { const k = new Kit(); PROPS.gumdrop(k, {}, rnd); put(x + (rnd() - 0.5) * 0.3, z, k); }
  for (let z = -0.6 + step; z <= H + 0.6 - step; z += step) for (const x of [-0.7, W + 0.7]) { const k = new Kit(); PROPS.gumdrop(k, {}, rnd); put(x, z + (rnd() - 0.5) * 0.3, k); }
  // backdrop: giant lollipops on the hills
  const cs = ['pink', 'teal', 'orange'];
  for (let i = 0; i < 34; i++) {
    const a = rnd() * Math.PI * 2, d = 14 + rnd() * 34;
    let x = W / 2 + Math.cos(a) * (W / 2 + d), z = H / 2 + Math.sin(a) * (H / 2 + d);
    if (x > -3 && x < W + 3 && z > -3 && z < H + 3) continue;
    const k = new Kit(); PROPS.giantLolli(k, { c: cs[i % 3] }, rnd);
    const out = Math.max(0, -x, x - W, -z, z - H), y = THREE.MathUtils.smoothstep(out, 1.5, 18) * 1.2;
    const g = k.static(); g.translate(x, y, z);
    const key = `bd${i % 6}`; if (!chunks.has(key)) chunks.set(key, { geos: [], glows: [], cast: false }); chunks.get(key).geos.push(g);
  }
  for (const [key, c] of chunks) {
    const m = new THREE.Mesh(mergeGeos(c.geos), M.candy); m.castShadow = c.cast; m.receiveShadow = true; m.name = 'props:' + key; group.add(m);
    if (c.glows.length) { const gm = new THREE.Mesh(mergeGeos(c.glows), M.glow); gm.name = 'glow:' + key; group.add(gm); }
  }
  // pond water (sits in the basin carved into the ground)
  for (const o of items.filter((it) => it.t === 'pond')) {
    const [x, z] = V(o.x, o.y);
    const water = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3fa6e6, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.88 }));
    water.material.name = 'water';
    water.scale.set(2.45, 1, 1.3); water.position.set(x, -0.08, z); water.receiveShadow = true; water.name = 'water'; group.add(water);
    const pads = new Kit();
    for (const [dx, dz, s] of [[-1.2, 0.3, 1], [0.9, -0.4, 0.8], [1.5, 0.5, 0.7]]) { pads.add('root', G.cyl(0.32 * s, 0.32 * s, 0.03, 18), { c: 0x6fbf5a, p: [dx, 0, dz] }); pads.add('root', G.sphere(0.07 * s, 8, 6), { c: 0xff8fbf, p: [dx + 0.08, 0.05, dz] }); }
    const pm = new THREE.Mesh(pads.static(), M.candy); pm.position.set(x, -0.05, z); pm.receiveShadow = true; group.add(pm);
  }
  // clouds
  const clouds = new THREE.Group(); clouds.name = 'clouds';
  for (let i = 0; i < 9; i++) { const k = new Kit(); PROPS.cloud(k, {}, rnd); const m = new THREE.Mesh(k.static(), M.matte); m.position.set(-30 + rnd() * (W + 60), 26 + rnd() * 10, -40 - rnd() * 40); m.userData.speed = 0.3 + rnd() * 0.5; clouds.add(m); }
  group.add(clouds);
  return { group, pal, W, H, clouds };
}
