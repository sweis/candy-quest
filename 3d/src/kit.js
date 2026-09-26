// Procedural modelling kit. Every lit mesh in the game shares ONE shader program: MeshStandardMaterial with
// vertex colours × a small pattern atlas (candy-cane stripes, lollipop swirls, peppermint wedges…). Models are
// authored in metres in model space (forward = +X, up = +Y), grouped into named rigid "parts" for animation, and
// merged so each part is a single draw call.
import * as THREE from '../vendor/three-0.186.1.min.js';

// ------------------------------------------------------------------ pattern atlas
const CELL = 256, GRID = 4, SIZE = CELL * GRID, PAD = 16;
export const PAT = { white: 0, cane: 1, caneDense: 2, caneWide: 3, swirlPink: 4, swirlTeal: 5, swirlOrange: 6, mint: 7,
  licorice: 8, cornBands: 9, bandsRed: 10, sugar: 11, gold: 12, swirlRainbow: 13, dots: 14, stripesV: 15 };

let atlasTex = null;
export function atlas() {
  if (atlasTex) return atlasTex;
  const c = document.createElement('canvas'); c.width = c.height = SIZE;
  const g = c.getContext('2d');
  const img = g.createImageData(SIZE, SIZE);
  const put = (x, y, rgb) => { const i = (y * SIZE + x) * 4; img.data[i] = rgb[0]; img.data[i + 1] = rgb[1]; img.data[i + 2] = rgb[2]; img.data[i + 3] = 255; };
  const hex = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
  const W = hex(0xffffff), RED = hex(0xff4d63), PINK = hex(0xff5d8f), PURP = hex(0xa98cff), TEAL = hex(0x7ad9c4), ORG = hex(0xffb84d);
  const DARK = hex(0x2a2030), CY = hex(0xffe06a), CO = hex(0xff9f3c);
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  // smooth 2-colour step so stripes are crisp but not aliased: s in [0,1) periodic, returns 0..1
  const band = (s, w = 0.5, soft = 0.012) => { s -= Math.floor(s); const a = THREE.MathUtils.smoothstep(s, 0, soft) - THREE.MathUtils.smoothstep(s, w, w + soft); return a; };
  const fns = {
    [PAT.white]: () => W,
    [PAT.cane]: (u, v) => mix(W, RED, band(u * 1 + v * 4)),
    [PAT.caneDense]: (u, v) => mix(W, RED, band(u * 1 + v * 9)),
    [PAT.caneWide]: (u, v) => mix(W, RED, band(u * 1 + v * 2)),
    [PAT.swirlPink]: (u, v) => swirl(u, v, PINK, PURP),
    [PAT.swirlTeal]: (u, v) => swirl(u, v, TEAL, ORG),
    [PAT.swirlOrange]: (u, v) => swirl(u, v, ORG, PINK),
    [PAT.mint]: (u, v) => { const x = u - 0.5, y = v - 0.5, r = Math.hypot(x, y); if (r < 0.07) return W; const a = Math.atan2(y, x) / (Math.PI * 2) + 0.5; return mix(W, RED, band(a * 8, 0.5, 0.012)); },
    [PAT.licorice]: (u, v) => mix(W, DARK, band(v * 8, 0.5, 0.03)),
    [PAT.cornBands]: (u, v) => (v < 0.4 ? CY : v < 0.74 ? mix(CO, CO, 0) : W),
    [PAT.bandsRed]: (u, v) => mix(W, RED, band(v * 6, 0.5, 0.03)),
    [PAT.sugar]: (u, v) => { const k = ((Math.sin(u * 91.7 + v * 47.3) * 43758.5453) % 1 + 1) % 1; return k > 0.93 ? W : mix(W, [228, 228, 236], 0.6 * band(u * 13 + v * 7, 0.5, 0.2)); },
    [PAT.gold]: (u, v) => mix([255, 240, 184], [200, 140, 20], v),
    [PAT.swirlRainbow]: (u, v) => { const x = u - 0.5, y = v - 0.5, r = Math.hypot(x, y); const a = Math.atan2(y, x) / (Math.PI * 2) + 0.5 + r * 1.2; const cs = [PURP, PINK, TEAL, ORG]; const k = ((a * 4) % 4 + 4) % 4; const i = Math.floor(k); return mix(cs[i], cs[(i + 1) % 4], THREE.MathUtils.smoothstep(k - i, 0.4, 0.6)); },
    [PAT.dots]: (u, v) => { const x = (u * 6) % 1 - 0.5, y = (v * 6) % 1 - 0.5; return Math.hypot(x, y) < 0.18 ? W : [236, 236, 240]; },
    [PAT.stripesV]: (u, v) => mix(W, RED, band(u * 8, 0.5, 0.02)),
  };
  function swirl(u, v, c1, c2) {
    const x = u - 0.5, y = v - 0.5, r = Math.hypot(x, y) * 2; if (r > 1) return c1;
    const a = Math.atan2(y, x) / (Math.PI * 2) + 0.5 + r * 0.55;
    const k = ((a * 4) % 4 + 4) % 4; const i = Math.floor(k); const cols = [c1, W, c2, W];
    return mix(cols[i], cols[(i + 1) % 4], THREE.MathUtils.smoothstep(k - i, 0.47, 0.53));
  }
  for (let cell = 0; cell < GRID * GRID; cell++) {
    const cx = cell % GRID, cy = Math.floor(cell / GRID), fn = fns[cell] || fns[0];
    for (let py = 0; py < CELL; py++) for (let px = 0; px < CELL; px++) {
      // inner area maps to uv 0..1; padding clamps to the edge value
      const u = THREE.MathUtils.clamp((px - PAD + 0.5) / (CELL - 2 * PAD), 0, 1);
      const v = 1 - THREE.MathUtils.clamp((py - PAD + 0.5) / (CELL - 2 * PAD), 0, 1);
      put(cx * CELL + px, cy * CELL + py, fn(u, v));
    }
  }
  g.putImageData(img, 0, 0);
  atlasTex = new THREE.CanvasTexture(c);
  atlasTex.colorSpace = THREE.SRGBColorSpace;
  atlasTex.anisotropy = 4;
  atlasTex.generateMipmaps = true;
  atlasTex.minFilter = THREE.LinearMipmapLinearFilter;
  return atlasTex;
}
// Remap a geometry's 0..1 uvs into an atlas cell.
function remapUV(geo, cell, mode, box) {
  const cx = cell % GRID, cy = Math.floor(cell / GRID);
  const pos = geo.attributes.position, n = pos.count;
  let uv = geo.attributes.uv;
  if (!uv || mode) {
    const arr = new Float32Array(n * 2);
    if (mode) { // planar projection (for swirl discs): along 'x' | 'y' | 'z' axis, normalised to the bounding box
      geo.computeBoundingBox(); const b = box || geo.boundingBox;
      const [ia, ib] = mode === 'x' ? [2, 1] : mode === 'y' ? [0, 2] : [0, 1];
      const lo = [b.min.x, b.min.y, b.min.z], hi = [b.max.x, b.max.y, b.max.z];
      for (let i = 0; i < n; i++) {
        const p = [pos.getX(i), pos.getY(i), pos.getZ(i)];
        arr[i * 2] = (p[ia] - lo[ia]) / (hi[ia] - lo[ia] || 1); arr[i * 2 + 1] = (p[ib] - lo[ib]) / (hi[ib] - lo[ib] || 1);
      }
    } else if (uv) arr.set(uv.array);
    uv = new THREE.BufferAttribute(arr, 2); geo.setAttribute('uv', uv);
  }
  const s = (CELL - 2 * PAD) / SIZE;
  for (let i = 0; i < n; i++) {
    const u = THREE.MathUtils.clamp(uv.getX(i), 0, 1), v = THREE.MathUtils.clamp(uv.getY(i), 0, 1);
    uv.setXY(i, (cx * CELL + PAD) / SIZE + u * s, 1 - (cy * CELL + PAD) / SIZE - (1 - v) * s);
  }
}

// ------------------------------------------------------------------ primitives
export const G = {
  sphere: (r = 1, w = 20, h = 14) => new THREE.SphereGeometry(r, w, h),
  hemi: (r = 1, w = 20, h = 8) => new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, Math.PI / 2),
  capsule: (r, len, cap = 6, rad = 12) => new THREE.CapsuleGeometry(r, len, cap, rad),
  cyl: (rt, rb, h, seg = 16, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open),
  cone: (r, h, seg = 14) => new THREE.ConeGeometry(r, h, seg),
  torus: (R, r, rs = 10, ts = 28, arc = Math.PI * 2) => new THREE.TorusGeometry(R, r, rs, ts, arc),
  lathe: (pts, seg = 24) => new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg),
  tube: (pts, r, ts = 40, rs = 12) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    const g = new THREE.TubeGeometry(curve, ts, r, rs, false);
    // swap so u = around, v = along (matches the stripe patterns)
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) { const a = uv.getX(i), b = uv.getY(i); uv.setXY(i, b, a); }
    return g;
  },
  rbox: (w, h, d, r = 0.05, seg = 5) => roundedBox(w, h, d, r, seg),
  extrude: (shape, depth, bevel = 0.02) => {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 16 });
    g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return g;
  },
  star: (ro, ri, n = 5) => { const s = new THREE.Shape(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : ro, a = (i / (n * 2)) * Math.PI * 2 + Math.PI / 2; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath(); return s; },
  heart: (sz) => { const s = new THREE.Shape(); const k = sz; s.moveTo(0, -0.9 * k); s.bezierCurveTo(-0.2 * k, -0.6 * k, -1 * k, -0.2 * k, -0.95 * k, 0.3 * k); s.bezierCurveTo(-0.9 * k, 0.85 * k, -0.2 * k, 0.95 * k, 0, 0.45 * k); s.bezierCurveTo(0.2 * k, 0.95 * k, 0.9 * k, 0.85 * k, 0.95 * k, 0.3 * k); s.bezierCurveTo(1 * k, -0.2 * k, 0.2 * k, -0.6 * k, 0, -0.9 * k); return s; },
  plane: (w, h) => new THREE.PlaneGeometry(w, h),
  // capsule spanning a -> b (model space); add() it with no p/r
  limb: (a, b, r, rad = 8) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
    const g = new THREE.CapsuleGeometry(r, Math.max(0.001, L), 4, rad);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2); return g;
  },
  ico: (r, d = 0) => new THREE.IcosahedronGeometry(r, d),
  oct: (r) => new THREE.OctahedronGeometry(r, 0),
};
function roundedBox(w, h, d, r, seg) {
  const g = new THREE.BoxGeometry(w, h, d, seg * 2, seg * 2, seg * 2);
  const pos = g.attributes.position, nrm = g.attributes.normal;
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r, v = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    c.set(THREE.MathUtils.clamp(v.x, -hx, hx), THREE.MathUtils.clamp(v.y, -hy, hy), THREE.MathUtils.clamp(v.z, -hz, hz));
    const n = v.clone().sub(c); if (n.lengthSq() < 1e-12) n.set(0, 1, 0); n.normalize();
    pos.setXYZ(i, c.x + n.x * r, c.y + n.y * r, c.z + n.z * r); nrm.setXYZ(i, n.x, n.y, n.z);
  }
  return g;
}

// ------------------------------------------------------------------ builder
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
const _col = new THREE.Color();
const DEG = Math.PI / 180;

export class Kit {
  constructor() { this.parts = new Map(); this.part('root', null, [0, 0, 0]); }
  // pivot in model space; parent part name
  part(name, parent = 'root', pivot = [0, 0, 0]) { this.parts.set(name, { name, parent, pivot, geos: [], glows: [] }); return this; }
  // add(part, geometry, {c: colour, p: [x,y,z], r: [deg x,y,z], s: number|[x,y,z], pat, uv: 'x'|'y'|'z', glow, e: emissive-ish lighten})
  add(partName, geo, o = {}) {
    const part = this.parts.get(partName); if (!part) throw new Error('no part ' + partName);
    if (o.pat != null || o.uv) remapUV(geo, o.pat ?? 0, o.uv); else remapUV(geo, PAT.white);
    const s = o.s == null ? [1, 1, 1] : typeof o.s === 'number' ? [o.s, o.s, o.s] : o.s;
    const r = o.r || [0, 0, 0];
    _e.set(r[0] * DEG, r[1] * DEG, r[2] * DEG, o.order || 'XYZ'); _q.setFromEuler(_e);
    _m.compose(_p.set(...(o.p || [0, 0, 0])), _q, _s.set(...s));
    geo.applyMatrix4(_m);
    const n = geo.attributes.position.count, col = new Float32Array(n * 3);
    _col.set(o.c ?? 0xffffff);
    for (let i = 0; i < n; i++) { col[i * 3] = _col.r; col[i * 3 + 1] = _col.g; col[i * 3 + 2] = _col.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    (o.glow ? part.glows : part.geos).push(geo);
    return this;
  }
  // mirror helper: add the same thing on +Z and -Z sides (model faces +X, so Z is left/right)
  pair(partL, partR, mkGeo, o) {
    this.add(partL, mkGeo(), { ...o, p: [o.p[0], o.p[1], -Math.abs(o.p[2])], r: o.r ? [-o.r[0], -o.r[1], o.r[2]] : undefined });
    this.add(partR, mkGeo(), { ...o, p: [o.p[0], o.p[1], Math.abs(o.p[2])] });
    return this;
  }
  // Build a THREE.Group. mat: lit material; glowMat: unlit material for glowing bits.
  build(mat, glowMat) {
    const group = new THREE.Group(); const objs = {};
    for (const [name, part] of this.parts) {
      const o = new THREE.Group(); o.name = name; objs[name] = o;
      const piv = new THREE.Vector3(...part.pivot);
      if (part.geos.length) {
        const g = mergeGeos(part.geos); g.translate(-piv.x, -piv.y, -piv.z);
        const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; o.add(m); o.userData.mesh = m;
      }
      if (part.glows.length) {
        const g = mergeGeos(part.glows); g.translate(-piv.x, -piv.y, -piv.z);
        const m = new THREE.Mesh(g, glowMat); o.add(m); o.userData.glow = m;
      }
    }
    for (const [name, part] of this.parts) {
      const o = objs[name];
      if (!part.parent) { group.add(o); continue; }
      const par = this.parts.get(part.parent);
      o.position.set(part.pivot[0] - par.pivot[0], part.pivot[1] - par.pivot[1], part.pivot[2] - par.pivot[2]);
      objs[part.parent].add(o);
    }
    group.userData.parts = objs;
    return group;
  }
  // Merge everything into one static geometry (for scenery instancing).
  static(opts = {}) { const all = []; for (const p of this.parts.values()) all.push(...p.geos); return mergeGeos(all); }
  staticGlow() { const all = []; for (const p of this.parts.values()) all.push(...p.glows); return all.length ? mergeGeos(all) : null; }
}

export function mergeGeos(list) {
  let nv = 0, ni = 0;
  const gs = list.map((g) => {
    if (!g.index) { const n = g.attributes.position.count; const idx = new (n > 65535 ? Uint32Array : Uint16Array)(n); for (let i = 0; i < n; i++) idx[i] = i; g.setIndex(new THREE.BufferAttribute(idx, 1)); }
    if (!g.attributes.normal) g.computeVertexNormals();
    nv += g.attributes.position.count; ni += g.index.count; return g;
  });
  const pos = new Float32Array(nv * 3), nrm = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), col = new Float32Array(nv * 3);
  const idx = new (nv > 65535 ? Uint32Array : Uint16Array)(ni);
  let ov = 0, oi = 0;
  for (const g of gs) {
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array, ov * 3); nrm.set(g.attributes.normal.array, ov * 3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array.subarray(0, n * 2), ov * 2);
    col.set(g.attributes.color.array, ov * 3);
    const gi = g.index.array; for (let i = 0; i < gi.length; i++) idx[oi + i] = gi[i] + ov;
    ov += n; oi += gi.length; g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  out.computeBoundingSphere(); out.computeBoundingBox();
  return out;
}

// ------------------------------------------------------------------ shared materials
let mats = null;
export function materials() {
  if (mats) return mats;
  const map = atlas();
  mats = {
    candy: new THREE.MeshStandardMaterial({ vertexColors: true, map, roughness: 0.42, metalness: 0 }),
    matte: new THREE.MeshStandardMaterial({ vertexColors: true, map, roughness: 0.8, metalness: 0 }),
    glow: new THREE.MeshBasicMaterial({ vertexColors: true, map, toneMapped: false }),
  };
  mats.candy.name = 'candy'; mats.matte.name = 'matte'; mats.glow.name = 'glow';
  return mats;
}
export { THREE };
