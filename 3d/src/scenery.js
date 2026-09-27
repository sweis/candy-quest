// Biome assembly: sky, fog, ground, props and the Candy Gate. Static props are merged into a few chunked meshes
// that share the one candy shader, so a whole biome costs a handful of draw calls. Definitions live in biomes.js.
import { Kit, G, PAT, THREE, mergeGeos, materials } from './kit.js';
import { makeScenery } from './data.js';
import { PROPS, POOLS, PAINT, OCCLUDERS, FLAT, BIOMES, biome } from './biomes.js';

export const PX = 1 / 50; // world px -> metres
export { BIOMES, biome };

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

// ------------------------------------------------------------------ sky dome
export function makeSky(pal) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(pal.sky[0]) }, mid: { value: new THREE.Color(pal.sky[1]) }, bot: { value: new THREE.Color(pal.sky[2]) },
      sunDir: { value: new THREE.Vector3(-0.5, 0.6, 0.5).normalize() }, sunGlow: { value: pal.underground ? 0 : 1 } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform vec3 sunDir; uniform float sunGlow; varying vec3 vDir;
      void main(){ float h = vDir.y; vec3 c = mix(bot, mid, smoothstep(-0.02, 0.18, h)); c = mix(c, top, smoothstep(0.18, 0.75, h));
        float s = max(dot(normalize(vDir), sunDir), 0.0); c += sunGlow * vec3(1.0,0.93,0.8) * (pow(s, 40.0) * 0.35 + pow(s, 6.0) * 0.08);
        gl_FragColor = vec4(c, 1.0); }`,
  });
  mat.name = 'sky';
  const m = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), mat); m.frustumCulled = false; m.renderOrder = -1; return m;
}

// ------------------------------------------------------------------ ground (vertex-coloured, two frequencies, patches painted in)
function buildGround(W, H, pal, items) {
  const margin = 55, gw = W + margin * 2, gh = H + margin * 2, seg = 1;
  const geo = new THREE.PlaneGeometry(gw, gh, Math.round(gw / seg), Math.round(gh / seg)); geo.rotateX(-Math.PI / 2); geo.translate(W / 2, 0, H / 2);
  const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
  const C = pal.ground.map((c) => new THREE.Color(c)), hill = new THREE.Color(pal.hill), tmp = new THREE.Color(), pc = new THREE.Color();
  const paints = items.filter((o) => PAINT[o.t]).map((o) => ({ ...PAINT[o.t], x: o.x * PX, z: o.y * PX, s: o.s || 1, t: o.t }));
  const bank = C[2].clone().lerp(new THREE.Color(0xfff4e0), pal.underground ? 0.08 : 0.3); // pool banks: a lighter shade of this biome's ground
  const pools = items.filter((o) => POOLS[o.t]).map((o) => ({ x: o.x * PX, z: o.y * PX, rx: 2.75, rz: 1.5, ring: POOLS[o.t].ring }));
  const HH = pal.hillH ?? 7;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const n = fbm(x * 0.07, z * 0.07), n2 = vnoise(x * 0.45 + 3, z * 0.45 + 9);
    tmp.copy(C[1]).lerp(C[0], THREE.MathUtils.smoothstep(n, 0.3, 0.7)).lerp(C[2], THREE.MathUtils.smoothstep(n, 0.62, 0.85) * 0.8);
    tmp.lerp(C[3], Math.max(0, n2 - 0.72) * 1.4);
    const ox = Math.max(0, -x, x - W), oz = Math.max(0, -z, z - H);
    let out = Math.hypot(ox, oz); if (HH < 0 && out > 0) out = Math.max(0.01, out + (fbm(x * 0.08 + 5, z * 0.08) - 0.5) * 8); // irregular coastline
    let y = 0;
    if (out > 0) {
      const t = THREE.MathUtils.smoothstep(out, 1.5, pal.underground ? 9 : 18);
      y = t * (HH >= 0 ? 1.2 + fbm(x * 0.05 + 40, z * 0.05) * HH * (pal.underground ? 1.6 : 1) : HH);
      tmp.lerp(hill, t * (pal.underground ? 0.9 : 0.6));
    }
    for (const d of paints) {
      const q = Math.hypot((x - d.x) / (d.rx * d.s), (z - d.z) / (d.rz * d.s)) + (vnoise(x * 1.7, z * 1.7) - 0.5) * 0.35;
      if (q < 1) { pc.set(d.color); tmp.lerp(pc, THREE.MathUtils.smoothstep(1 - q, 0, 0.25)); }
    }
    for (const p of pools) {
      const q = Math.hypot((x - p.x) / p.rx, (z - p.z) / p.rz);
      if (q < 1.45) { if (p.ring) pc.set(p.ring); else pc.copy(bank); tmp.lerp(pc, THREE.MathUtils.smoothstep(1.45 - q, 0, 0.35) * (p.ring ? 1 : 0.7)); }
      if (q < 1) y = -0.4 * THREE.MathUtils.smoothstep(1 - q, 0, 0.3);
    }
    pos.setY(i, y);
    col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.05, 0.95); // white atlas texel: shares the candy program
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
  const group = new THREE.Group(); group.name = 'biome:' + kind;
  const items = makeScenery(kind);
  const rnd = rngFrom(1234 + kind.length * 97);
  group.add(buildGround(W, H, pal, items));

  const CH = 12, chunks = new Map();
  const bucket = (key, cast) => { if (!chunks.has(key)) chunks.set(key, { geos: [], glows: [], cast }); return chunks.get(key); };
  const put = (x, z, kit, cast = true, y = 0, key = null) => {
    const b = bucket(key || `${Math.floor(x / CH)},${Math.floor(z / CH)},${cast ? 1 : 0}`, cast);
    const g = kit.static(); g.translate(x, y, z); b.geos.push(g);
    const gl = kit.staticGlow(); if (gl) { gl.translate(x, y, z); b.glows.push(gl); }
  };
  // classic props at their classic positions; tall ones become fade-able occluders
  const occluders = [];
  const occMat = M.candy.clone(); occMat.transparent = true; occMat.name = 'occluder'; // transparent from boot: fading never recompiles
  for (const o of items) {
    const b = PROPS[o.t]; if (!b) continue;
    const x = o.x * PX, z = o.y * PX;
    const k = new Kit(); b(k, o, rnd);
    if (OCCLUDERS.has(o.t)) {
      const g = k.static(); g.computeBoundingBox(); const bb = g.boundingBox;
      const m = new THREE.Mesh(g, occMat.clone()); m.position.set(x, 0, z); m.castShadow = m.receiveShadow = true; m.name = 'occ:' + o.t; group.add(m);
      const gl = k.staticGlow(); if (gl) m.add(new THREE.Mesh(gl, M.glow));
      occluders.push({ mesh: m, x, z, top: bb.max.y, halfW: Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) / 2, fade: 1 });
      continue;
    }
    put(x, z, k, !FLAT.has(o.t));
  }
  // scatter (decoration only — not in the classic build)
  const scatter = pal.scatter || [];
  for (let i = 0; i < 160 && scatter.length; i++) {
    const x = 1 + rnd() * (W - 2), z = 1 + rnd() * (H - 2);
    if (items.some((o) => POOLS[o.t] && Math.hypot(o.x * PX - x, (o.y * PX - z) * 1.8) < 3.4)) continue;
    let u = rnd(), pick = scatter[0]; for (const s of scatter) { if (u < s[1]) { pick = s; break; } u -= s[1]; }
    const k = new Kit(); PROPS[pick[0]](k, { c: ['pink', 'orange', 'purple', '#fff'][i % 4], ...(pick[2] || {}) }, rnd);
    put(x, z, k, false);
  }
  // boundary hedge just outside the walkable edge
  const step = 1.25, hedge = pal.hedge;
  const hedgeAt = (x, z) => { const k = new Kit(); hedge(k, rnd); put(x, z, k); };
  for (let x = -0.6; x <= W + 0.6; x += step) for (const z of [-0.7, H + 0.7]) hedgeAt(x + (rnd() - 0.5) * 0.3, z);
  for (let z = -0.6 + step; z <= H + 0.6 - step; z += step) for (const x of [-0.7, W + 0.7]) hedgeAt(x, z + (rnd() - 0.5) * 0.3);
  // backdrop beyond the edge
  for (let i = 0; i < 34; i++) {
    const a = rnd() * Math.PI * 2, d = (pal.underground ? 6 : 14) + rnd() * 30;
    const x = W / 2 + Math.cos(a) * (W / 2 + d), z = H / 2 + Math.sin(a) * (H / 2 + d);
    if (x > -3 && x < W + 3 && z > -3 && z < H + 3) continue;
    const k = new Kit(); pal.backdrop(k, rnd, i);
    const out = Math.max(0, -x, x - W, -z, z - H);
    const y = pal.hillH < 0 ? pal.hillH * 0.6 : THREE.MathUtils.smoothstep(out, 1.5, 18) * 1.2;
    put(x, z, k, false, y, `bd${i % 6}`);
  }
  for (const [key, c] of chunks) {
    const m = new THREE.Mesh(mergeGeos(c.geos), M.candy); m.castShadow = c.cast; m.receiveShadow = true; m.name = 'props:' + key; group.add(m);
    if (c.glows.length) { const gm = new THREE.Mesh(mergeGeos(c.glows), M.glow); gm.name = 'glow:' + key; group.add(gm); }
  }
  // pools (shared water material, recoloured per biome: a uniform, not a program change)
  const pools = items.filter((it) => POOLS[it.t]);
  if (pools.length) {
    const P = POOLS[pools[0].t]; M.water.color.set(P.color); M.water.emissive.set(P.glow || 0); M.water.opacity = P.opacity ?? 0.88; M.water.roughness = P.rough ?? 0.08;
  }
  for (const o of pools) {
    const x = o.x * PX, z = o.y * PX;
    const water = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2), M.water);
    water.scale.set(2.45, 1, 1.3); water.position.set(x, -0.08, z); water.receiveShadow = true; water.name = 'water'; group.add(water);
    if (o.t === 'pond' || o.t === 'oasis' || o.t === 'swamp') {
      const pads = new Kit();
      for (const [dx, dz, s] of [[-1.2, 0.3, 1], [0.9, -0.4, 0.8], [1.5, 0.5, 0.7]]) { pads.add('root', G.cyl(0.32 * s, 0.32 * s, 0.03, 18), { c: 0x6fbf5a, p: [dx, 0, dz] }); pads.add('root', G.sphere(0.07 * s, 8, 6), { c: 0xff8fbf, p: [dx + 0.08, 0.05, dz] }); }
      const pm = new THREE.Mesh(pads.static(), M.candy); pm.position.set(x, -0.05, z); pm.receiveShadow = true; group.add(pm);
    }
  }
  // the sea around the peppermint beach
  if (pal.sea) {
    M.sea.color.set(pal.sea);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), M.sea);
    sea.position.set(W / 2, -0.35, H / 2); sea.receiveShadow = true; sea.name = 'sea'; group.add(sea);
  }
  // clouds
  const clouds = new THREE.Group(); clouds.name = 'clouds';
  if (pal.clouds) for (let i = 0; i < 9; i++) {
    const k = new Kit(); for (let j = 0; j < 6; j++) k.add('root', G.sphere(2.2 + rnd() * 1.6, 14, 10), { c: j % 2 ? 0xffffff : 0xffe3ef, p: [(j - 2.5) * 2.4, rnd() * 1.2, (rnd() - 0.5) * 2] });
    const m = new THREE.Mesh(k.static(), M.matte); m.position.set(-30 + rnd() * (W + 60), 26 + rnd() * 10, -40 - rnd() * 40); m.userData.speed = 0.3 + rnd() * 0.5; clouds.add(m);
  }
  group.add(clouds);
  return { group, pal, W, H, clouds, occluders };
}
