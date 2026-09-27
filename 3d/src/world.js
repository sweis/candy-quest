// three.js presentation layer: renders a sim state G. Reads G, never writes it (except via returned picks that
// the caller turns into sim actions). Light count and shader programs are fixed at init — FX use pooled meshes.
import { THREE, materials, Kit, G as Geo, PAT, mergeGeos } from './kit.js';
import { catalog, heroWeapon, heroArmor } from './models.js';
import { itemKit } from './items3d.js';
import { buildBiome, buildGate, makeSky, PX } from './scenery.js';
import { animate, bindRest } from './anim.js';
import { ITEMS } from './data.js';

const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3();
const CAMS = {
  play: { off: [0, 12.2, 10.2], fov: 40, look: [0, 0.9, 0] },
  'hud-check': { off: [0, 12.2, 10.2], fov: 40, look: [0, 0.9, 0] },
  'hero-close': { off: [3.4, 2.0, 5.2], fov: 35, look: [0, 1.0, 0] },
  overview: { fixed: true, fov: 45 },
  title: { off: [5.5, 3.2, 9.5], fov: 36, look: [0.8, 1.3, 0] },
  showcase: { focus: true, fov: 32 },
};

export class World {
  constructor(canvas, quality) {
    this.q = quality;
    const r = new THREE.WebGLRenderer({ canvas, antialias: quality.msaa, powerPreference: 'high-performance', stencil: false });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.maxDpr));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
    r.shadowMap.enabled = quality.shadows; r.shadowMap.type = quality.softShadows ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    this.renderer = r;
    const gl = r.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    this.gpu = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    this.contextLost = false; this.lastShaderError = null;
    r.debug.onShaderError = (glc, prog, vs, fs) => { this.lastShaderError = (glc.getShaderInfoLog(vs) || '') + (glc.getShaderInfoLog(fs) || '') || 'link error'; console.error('shader error', this.lastShaderError); };
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.contextLost = true; this.onContextLost && this.onContextLost(); });
    canvas.addEventListener('webglcontextrestored', () => { this.contextLost = false; this.onContextRestored && this.onContextRestored(); });

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.3, 600);
    this.camName = 'play'; this.camTarget = new THREE.Vector3(); this.camPos = new THREE.Vector3(); this.shake = 0;
    // lights: one hemisphere + one sun, forever. Never add/remove lights at runtime (program recompiles).
    this.hemi = new THREE.HemisphereLight(0xd6ecff, 0x8cc77a, 1.15); this.scene.add(this.hemi);
    const sun = new THREE.DirectionalLight(0xfff0d6, 3.1); sun.castShadow = quality.shadows;
    sun.shadow.mapSize.set(quality.shadowMap, quality.shadowMap);
    const sc = sun.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14; sc.near = 1; sc.far = 80;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
    this.sun = sun; this.sunDir = new THREE.Vector3(-0.55, 0.72, 0.42).normalize();
    this.scene.add(sun, sun.target);

    this.M = materials();
    this.views = new Map(); this.itemViews = new Map(); this.dying = [];
    this.tags = document.getElementById('tags'); this.floats = [];
    this.buildShadowBlob(); this.buildPools();
    this.time = 0; this.frame = { ms: 0, hist: [] };
  }

  // ---------------------------------------------------------------- level
  setLevel(G) {
    if (this.biome) { this.scene.remove(this.biome.group); disposeTree(this.biome.group); }
    for (const v of this.views.values()) this.destroyView(v); this.views.clear();
    for (const v of this.itemViews.values()) this.destroyItem(v); this.itemViews.clear();
    for (const d of this.dying) this.destroyAny(d); this.dying = [];
    for (const f of this.floats) f.el.remove(); this.floats = [];
    this.G = G;
    const b = buildBiome(G.CFG.scenery, G.W, G.H); this.biome = b; this.scene.add(b.group);
    this.scene.background = null; if (this.sky) this.scene.remove(this.sky);
    this.sky = makeSky(b.pal); this.sky.material.uniforms.sunDir.value.copy(this.sunDir); this.scene.add(this.sky);
    this.scene.fog = new THREE.Fog(b.pal.fog, b.pal.fogNear || 46, b.pal.fogFar || 150);
    this.renderer.toneMappingExposure = b.pal.exposure || 1;
    this.hemi.color.set(b.pal.hemiSky); this.hemi.groundColor.set(b.pal.hemiGround); this.hemi.intensity = b.pal.hemiI;
    this.sun.color.set(b.pal.sun); this.sun.intensity = b.pal.sunI;
    // gate
    const gk = buildGate(); this.gate = gk.build(this.M.candy, this.M.glow); bindRest(this.gate.userData.parts);
    this.gate.position.set(G.gate.x * PX, 0, G.gate.y * PX); this.scene.add(this.gate); b.group.add(this.gate);
    this.gateOpen = null; this.gateLabel = this.tag('gatelabel', 'Candy Gate');
    this.cut = true; this.sync(G, 0);
  }

  // ---------------------------------------------------------------- entity views
  makeView(e) {
    const cat = catalog(e.sprite);
    const k = cat.build();
    const mat = this.M.candy.clone(); mat.emissive = new THREE.Color(0); // per-entity for hit flash / hover rim (same program)
    const model = k.build(mat, this.M.glow);
    const parts = model.userData.parts; bindRest(parts);
    const group = new THREE.Group(); group.add(model);
    // distance LOD: the same kit merged into one mesh (+ one glow mesh) — 3 draws instead of ~19 for far creatures
    // Shadows for creatures come from one merged mesh whose colour-pass material writes nothing (three.js culls shadow
    // casters by the main camera's layers, so a layer trick can't hide it). 1 shadow draw per creature instead of one
    // per part; the shadow keeps the bind pose while contact blobs ground the feet.
    let lod = null;
    if (e.faction !== 'player') {
      const merged = k.static();
      lod = new THREE.Mesh(merged, mat); lod.castShadow = false; const gl = k.staticGlow(); if (gl) lod.add(new THREE.Mesh(gl, this.M.glow)); lod.visible = false; group.add(lod);
      const sh = new THREE.Mesh(merged, this.shadowOnlyMat); sh.castShadow = true; group.add(sh); lod.userData.shadow = sh;
      model.traverse((o) => { if (o.isMesh) o.castShadow = false; });
    }
    const scale = (cat.scale || 1) * (e.scale || 1);
    const shadow = new THREE.Mesh(this.blobGeo, this.blobMat); shadow.scale.setScalar(cat.r * 2.3 * scale); shadow.renderOrder = 1; group.add(shadow);
    const v = { id: e.id, e, faction: e.faction, sprite: e.sprite, group, model, lod, far: false, parts, mat, rig: cat.rig, h: cat.h * scale, r: cat.r * scale, baseScale: scale,
      yaw: e.facing >= 0 ? 0 : Math.PI, walk: 0, speed: 0, seed: Math.random() * 10, attackT: 0, attackDur: 0.3, hitT: 0, spawnT: e.faction === 'ally' ? 1 : 0, dieT: -1, stride: (cat.stride || 0.9) * scale, tailSwing: !!cat.tailSwing,
      ranged: e.akind === 'ranged', flash: 0, rim: 0, fallback: !!cat.fallback };
    group.position.set(e.x * PX, 0, e.y * PX);
    this.scene.add(group);
    // DOM tags: hp bar / trust bar + nameplate
    if (e.faction === 'enemy' || e.faction === 'ally') v.bar = this.tag('bar ' + (e.faction === 'ally' ? 'ally' : 'enemy') + (e.boss ? ' boss' : ''), '<i></i>');
    if (e.faction === 'wild') { v.bar = this.tag('bar trust', '<i></i>'); v.name = this.tag('nameplate', '🍬 ' + e.name); }
    if (e.boss) v.name = this.tag('nameplate boss', e.name);
    if (e.faction === 'player') { v.weaponId = undefined; v.armorId = undefined; }
    return v;
  }
  destroyView(v) { this.scene.remove(v.group); v.group.traverse((o) => { if (o.isMesh && o.geometry !== this.blobGeo) o.geometry.dispose(); }); v.mat.dispose(); v.bar && v.bar.remove(); v.name && v.name.remove(); }
  makeItem(e) {
    const k = itemKit(e.item); const g = new THREE.Group(); const m = new THREE.Mesh(k.static(), this.M.candy); m.castShadow = true;
    const gl = k.staticGlow(); if (gl) m.add(new THREE.Mesh(gl, this.M.glow));
    const pivot = new THREE.Group(); pivot.add(m); m.position.y = 0.25; pivot.scale.setScalar(1.35); g.add(pivot);
    const ring = new THREE.Mesh(this.ringGeo, this.M.glow); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; g.add(ring);
    const rar = (ITEMS[e.item] || {}).rarity;
    ring.material = rar === 'epic' ? this.ringMats.epic : rar === 'rare' ? this.ringMats.rare : this.ringMats.common;
    const shadow = new THREE.Mesh(this.blobGeo, this.blobMat); shadow.scale.setScalar(0.7); g.add(shadow);
    g.position.set(e.x * PX, 0, e.y * PX); this.scene.add(g);
    return { id: e.id, e, group: g, pivot, spin: Math.random() * 6, spawnT: e.spawnedAt != null ? 1 : 0, dieT: -1, item: true };
  }
  destroyItem(v) { this.scene.remove(v.group); v.group.traverse((o) => { if (o.isMesh && o.geometry !== this.blobGeo && o.geometry !== this.ringGeo) o.geometry.dispose(); }); }
  destroyAny(v) { v.item ? this.destroyItem(v) : this.destroyView(v); }

  // swap Pip's held weapon / armour meshes when equipment changes
  dressHero(v, G) {
    const w = G.equip.weapon || 'default', a = G.equip.armor || null;
    if (v.weaponId !== w) {
      const slot = v.parts.weapon;
      if (v.weaponMesh) { slot.remove(v.weaponMesh); v.weaponMesh.geometry.dispose(); }
      const k = heroWeapon(w); const m = new THREE.Mesh(k.static(), v.mat); m.castShadow = true;
      m.rotation.z = -0.9; // blade forward-up from the fist
      v.weaponMesh = m;
      slot.add(m); v.weaponId = w;
    }
    if (v.armorId !== a) {
      const slot = v.parts.armor; while (slot.children.length) { const c = slot.children.pop(); c.traverse((o) => o.geometry && o.geometry.dispose()); }
      if (a) { const k = heroArmor(a); const g = k.static(); g.translate(0, -0.5, 0); const m = new THREE.Mesh(g, v.mat); m.castShadow = true; slot.add(m); }
      v.armorId = a;
    }
  }

  // ---------------------------------------------------------------- per frame
  sync(G, dt) {
    this.time += dt;
    // create / retire views
    const seen = new Set();
    G.ents.forEach((e) => {
      if (e.faction === 'gate') return;
      seen.add(e.id);
      if (e.faction === 'item') { if (!this.itemViews.has(e.id)) this.itemViews.set(e.id, this.makeItem(e)); return; }
      if (!this.views.has(e.id)) this.views.set(e.id, this.makeView(e));
    });
    for (const [id, v] of this.views) if (!seen.has(id)) { this.views.delete(id); v.dieT = 0; if (v.bar) v.bar.style.display = 'none'; if (v.name) v.name.style.display = 'none'; this.dying.push(v); }
    for (const [id, v] of this.itemViews) if (!seen.has(id)) { this.itemViews.delete(id); v.dieT = 0; this.dying.push(v); }

    const G2 = G;
    for (const v of this.views.values()) this.updateView(v, dt, G2);
    for (const v of this.itemViews.values()) this.updateItem(v, dt);
    for (let i = this.dying.length - 1; i >= 0; i--) {
      const v = this.dying[i]; v.dieT += dt / (v.item ? 0.25 : 0.4);
      if (v.item) { const k = Math.min(1, v.dieT); const p = this.views.get(G.player.id); if (p) v.group.position.lerp(p.group.position.clone().setY(1.2), k * 0.5); v.pivot.scale.setScalar(1.35 * (1 - k)); v.pivot.position.y = k * 1.2; }
      else animate(v, dt, this.time);
      if (v.dieT >= 1) { this.destroyAny(v); this.dying.splice(i, 1); }
    }
    this.updateProjectiles(G, dt);
    this.updatePools(dt);
    this.updateGate(G, dt);
    this.updateCamera(G, dt);
    if (this.biome) for (const c of this.biome.clouds.children) { c.position.x += c.userData.speed * dt; if (c.position.x > this.biome.W + 40) c.position.x = -40; }
    this.updateOccluders(G, dt);
    this.updateTags();
  }
  updateView(v, dt, G) {
    const e = v.e; const tx = e.x * PX, tz = e.y * PX;
    const p = v.group.position; const jump = Math.hypot(tx - p.x, tz - p.z) > 3;
    p.set(tx, 0, tz);
    const spd = Math.hypot(e.vx || 0, e.vy || 0) * 60 * PX; v.speed = jump ? 0 : THREE.MathUtils.lerp(v.speed, spd, 1 - Math.exp(-dt * 14));
    // facing: travel direction when moving, else the sim's left/right facing turned 30° toward the camera
    let dx, dz;
    if (spd > 0.3 && v.attackT <= 0) { dx = e.vx; dz = e.vy; } else { dx = e.facing || 1; dz = 0.55; }
    const want = Math.atan2(-dz, dx);
    let d = want - v.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    v.yaw += d * (1 - Math.exp(-dt * (v.attackT > 0 ? 30 : 11)));
    v.group.rotation.y = v.yaw;
    v.attackT = Math.max(0, v.attackT - dt); v.hitT = Math.max(0, v.hitT - dt * 4); v.spawnT = Math.max(0, v.spawnT - dt / 0.4);
    v.flash = Math.max(0, v.flash - dt * 6);
    const rim = v.rim; v.rim = Math.max(0, v.rim - dt * 4);
    if (v.faction === 'player') {
      this.dressHero(v, G);
      const blink = G.iframe > 0 && e.hp > 0 && G.iframe > 30 ? (Math.floor(this.time * 14) % 2 ? 0.45 : 0) : 0;
      v.mat.emissive.setRGB(v.flash + blink, v.flash + blink * 0.6, v.flash + blink * 0.8);
    } else {
      const rc = v.faction === 'enemy' ? [1, 0.25, 0.35] : [1, 0.5, 0.8];
      v.mat.emissive.setRGB(v.flash + rim * rc[0] * 0.35, v.flash + rim * rc[1] * 0.35, v.flash + rim * rc[2] * 0.35);
    }
    animate(v, dt, this.time);
    if (v.lod) { // hysteresis so creatures don't flicker between LODs at the boundary
      const d = Math.hypot(v.group.position.x - this.camTarget.x, v.group.position.z - this.camTarget.z);
      const near = this.q.lodNear || 11;
      if (!v.far && d > near + 1.5 && this.camName !== 'showcase') v.far = true; else if (v.far && (d < near || this.camName === 'showcase')) v.far = false;
      v.model.visible = !v.far; v.lod.visible = v.far;
      v.lod.scale.copy(v.model.scale); v.lod.position.y = v.parts.body ? v.parts.body.position.y - v.parts.body.userData.rest.y : 0;
      const sh = v.lod.userData.shadow; sh.scale.copy(v.lod.scale); sh.position.y = v.lod.position.y; sh.visible = v.dieT < 0;
    }
    // bars
    if (v.bar) {
      const pct = e.faction === 'wild' ? e.trust : Math.max(0, (100 * e.hp) / e.maxhp);
      if (v.barPct !== pct) { v.bar.firstChild.style.width = pct + '%'; v.barPct = pct; }
    }
  }
  updateItem(v, dt) {
    v.spin += dt * 1.4; v.pivot.rotation.y = v.spin; v.pivot.position.y = 0.12 + Math.sin(this.time * 2.4 + v.spin) * 0.08;
    if (v.spawnT > 0) { v.spawnT = Math.max(0, v.spawnT - dt / 0.5); const k = 1 - v.spawnT; v.pivot.position.y += Math.sin(k * Math.PI) * 1.1; v.pivot.scale.setScalar(1.35 * Math.min(1, k * 2)); }
  }

  // ---------------------------------------------------------------- events → FX
  onEvents(G, evs) {
    for (const ev of evs) {
      const v = ev.id ? this.views.get(ev.id) || this.dying.find((d) => d.id === ev.id) : null;
      switch (ev.t) {
        case 'slash': { const p = this.views.get(G.player.id); if (p) { p.attackT = p.attackDur = 0.28; } this.spawnSlash(ev.x * PX, ev.y * PX, ev.dir); break; }
        case 'swing': if (v) { v.attackT = v.attackDur = v.ranged ? 0.45 : 0.36; } break;
        case 'hit': {
          if (v) { v.hitT = 1; v.flash = 0.9; }
          const col = ev.faction === 'enemy' ? '#ffffff' : '#ffd24d';
          this.floatText(ev.x, ev.y, (v ? v.h : 1.5) + 0.3, String(Math.round(ev.n)), 'dmg' + (ev.boss ? ' big' : '') + (ev.faction === 'enemy' ? '' : ' hurt'), col);
          this.burst(ev.x * PX, (v ? v.h * 0.55 : 0.8), ev.y * PX, ev.faction === 'enemy' ? 0xffffff : 0xffd24d, 6, 3.2);
          if (ev.faction === 'player') this.shake = Math.min(0.5, this.shake + 0.28);
          break;
        }
        case 'heal': { const tv = this.views.get(ev.id); this.floatText(ev.x, ev.y, (tv ? tv.h : 1.5) + 0.3, '+' + ev.n, 'dmg heal', '#7ad9c4'); this.burst(ev.x * PX, 0.4, ev.y * PX, 0x7ad9c4, 8, 1.4, -2); break; }
        case 'healfx': { const tv = this.views.get(ev.id); if (tv) this.burst(tv.group.position.x, 0.4, tv.group.position.z, 0x7bd16a, 14, 1.6, -2); break; }
        case 'death': this.burst(ev.x * PX, 0.7, ev.y * PX, ev.boss ? 0xffd24d : 0xff5d8f, ev.boss ? 60 : 22, ev.boss ? 7 : 4.5, 9, true); if (ev.boss) this.shake = 0.8; break;
        case 'heart': this.spawnHeart(ev.x * PX, ev.y * PX, 1); if (v) v.hitT = 0.5; break;
        case 'tamed': this.spawnHeart(ev.x * PX, ev.y * PX, 4); this.burst(ev.x * PX, 0.8, ev.y * PX, 0xff8fbf, 30, 4, 7, true); break;
        case 'collect': this.burst(ev.x * PX, 0.5, ev.y * PX, 0xfff3b0, 8, 2, 3); break;
        case 'faint': this.burst(ev.x * PX, 0.6, ev.y * PX, 0xa98cff, 16, 2.5, 6); break;
        case 'levelup': { const a = [...this.views.values()].find((x) => x.e.puid === ev.uid); if (a) { this.burst(a.group.position.x, 0.2, a.group.position.z, 0xffd24d, 26, 2, -4); this.floatText(a.e.x, a.e.y, a.h + 0.6, 'LEVEL UP', 'dmg lvl', '#ffd24d'); } break; }
        case 'ko': this.cut = true; this.burst(G.player.x * PX, 1.2, G.player.y * PX, 0xffe06a, 20, 3, 4); break;
        case 'projhit': this.burst(ev.x * PX, 1.0, (ev.y + 44) * PX, new THREE.Color(ev.color).getHex(), 7, 2.4, 4); break;
        case 'bossdown': this.shake = 0.8; break;
        case 'dash': { const p = this.views.get(G.player.id); if (p) this.burst(p.group.position.x, 0.2, p.group.position.z, 0xffffff, 8, 1.5, 2); break; }
        case 'buff': { const p = this.views.get(G.player.id); if (p) this.burst(p.group.position.x, 0.3, p.group.position.z, 0xffd24d, 16, 1.8, -3); break; }
        default: break;
      }
    }
  }

  // ---------------------------------------------------------------- pools (fixed size: no runtime allocation of programs/lights)
  buildShadowBlob() {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(40,20,40,0.55)'); gr.addColorStop(0.55, 'rgba(40,20,40,0.28)'); gr.addColorStop(1, 'rgba(40,20,40,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    this.blobMat = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    this.blobMat.name = 'blob';
    this.blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2); this.blobGeo.translate(0, 0.025, 0);
    this.ringGeo = new THREE.RingGeometry(0.34, 0.42, 32);
    const mk = (c) => { const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.7, depthWrite: false }); m.name = 'ring'; return m; };
    this.ringMats = { common: mk(0xffffff), rare: mk(0xb79bff), epic: mk(0xffb84d) };
    this.shadowOnlyMat = mk(0xffffff); this.shadowOnlyMat.colorWrite = false; this.shadowOnlyMat.opacity = 0; this.shadowOnlyMat.name = 'shadowOnly'; // shares the ring program
  }
  buildPools() {
    const glow = this.M.glow;
    // particles
    const pk = new Kit(); pk.add('root', Geo.oct(0.09), { c: 0xffffff }); const pg = pk.static();
    const sk = new Kit(); sk.add('root', Geo.extrude(Geo.star(0.12, 0.05), 0.03, 0), { c: 0xffffff }); const sg = sk.static();
    this.parts = [];
    for (let i = 0; i < 260; i++) {
      const m = new THREE.Mesh(i % 3 ? pg : sg, new THREE.MeshBasicMaterial({ vertexColors: true, map: glow.map, toneMapped: false }));
      m.material.name = 'particle'; m.visible = false; m.frustumCulled = false; this.scene.add(m);
      this.parts.push({ m, life: 0, vel: new THREE.Vector3(), g: 9, spin: 0 });
    }
    // hearts
    const hk = new Kit(); hk.add('root', Geo.extrude(Geo.heart(0.22), 0.1, 0.03), { c: 0xff5d8f }); const hg = hk.static();
    this.hearts = [];
    for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(hg, glow); m.visible = false; this.scene.add(m); this.hearts.push({ m, life: 0, vel: new THREE.Vector3() }); }
    // slash arcs
    const ak = new Kit(); ak.add('root', Geo.torus(1.15, 0.08, 6, 30, Math.PI * 0.9), { c: 0xffffff, s: [1, 1, 0.3] }); ak.add('root', Geo.torus(1.02, 0.05, 6, 30, Math.PI * 0.8), { c: 0xff7ba6, s: [1, 1, 0.3], r: [0, 0, 8] });
    const ag = ak.static();
    this.slashes = [];
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshBasicMaterial({ vertexColors: true, map: glow.map, toneMapped: false, transparent: true, depthWrite: false, side: THREE.DoubleSide }); mat.name = 'slash';
      const m = new THREE.Mesh(ag, mat); m.visible = false; this.scene.add(m); this.slashes.push({ m, life: 0 });
    }
    // projectiles
    const qk = new Kit(); qk.add('root', Geo.capsule(0.09, 0.3, 4, 8), { c: 0xffffff, r: [0, 0, 90] }); const qg = qk.static();
    this.projMeshes = [];
    for (let i = 0; i < 48; i++) { const m = new THREE.Mesh(qg, new THREE.MeshBasicMaterial({ vertexColors: true, map: glow.map, toneMapped: false })); m.material.name = 'proj'; m.visible = false; this.scene.add(m); this.projMeshes.push(m); }
  }
  burst(x, y, z, color, n, speed = 3, up = 5, stars = false) {
    let k = 0;
    for (const p of this.parts) {
      if (p.life > 0) continue;
      p.m.visible = true; p.m.position.set(x, y, z); p.m.material.color.setHex(color);
      const a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random() * 0.8);
      p.vel.set(Math.cos(a) * s, up * (0.5 + Math.random() * 0.7), Math.sin(a) * s);
      p.g = up < 0 ? -2 : 12; if (up < 0) p.vel.y = -up * (0.4 + Math.random() * 0.6);
      p.life = p.max = 0.45 + Math.random() * 0.45; p.spin = (Math.random() - 0.5) * 12; p.m.scale.setScalar(stars ? 1.4 : 1);
      if (++k >= n) break;
    }
  }
  spawnHeart(x, z, n) {
    let k = 0;
    for (const h of this.hearts) { if (h.life > 0) continue; h.m.visible = true; h.m.position.set(x + (Math.random() - 0.5) * 0.6 * (n > 1), 1.8, z); h.vel.set((Math.random() - 0.5) * (n > 1 ? 2 : 0.3), 1.8 + Math.random(), 0); h.life = h.max = 1.0; if (++k >= n) break; }
  }
  spawnSlash(x, z, dir) {
    const s = this.slashes.find((q) => q.life <= 0) || this.slashes[0];
    s.life = s.max = 0.24; s.m.visible = true; s.m.position.set(x + dir * 0.35, 1.0, z + 0.15);
    s.m.rotation.set(-0.25, dir > 0 ? 0 : Math.PI, dir > 0 ? -0.5 : 0.5); s.dir = dir;
  }
  updatePools(dt) {
    for (const p of this.parts) {
      if (p.life <= 0) continue; p.life -= dt;
      if (p.life <= 0) { p.m.visible = false; continue; }
      p.vel.y -= p.g * dt; p.m.position.addScaledVector(p.vel, dt); if (p.m.position.y < 0.05) { p.m.position.y = 0.05; p.vel.multiplyScalar(0.5); p.vel.y = Math.abs(p.vel.y) * 0.4; }
      p.m.rotation.x += p.spin * dt; p.m.rotation.y += p.spin * dt;
      const k = p.life / p.max; p.m.scale.setScalar((p.m.scale.x > 1.2 ? 1.4 : 1) * Math.min(1, k * 2.5));
    }
    for (const h of this.hearts) {
      if (h.life <= 0) continue; h.life -= dt; if (h.life <= 0) { h.m.visible = false; continue; }
      h.m.position.addScaledVector(h.vel, dt); const k = 1 - h.life / h.max; h.m.scale.setScalar(k < 0.2 ? k * 6 : 1.2 - (k - 0.2) * 0.6); h.m.lookAt(this.camera.position);
    }
    for (const s of this.slashes) {
      if (s.life <= 0) continue; s.life -= dt; if (s.life <= 0) { s.m.visible = false; continue; }
      const k = 1 - s.life / s.max; s.m.material.opacity = 1 - k; s.m.scale.setScalar(0.8 + k * 0.5); s.m.rotation.z += (s.dir > 0 ? -1 : 1) * dt * 9;
    }
  }
  updateProjectiles(G, dt) {
    for (let i = 0; i < this.projMeshes.length; i++) {
      const m = this.projMeshes[i], pr = G.projs[i];
      if (!pr) { m.visible = false; continue; }
      m.visible = true; m.material.color.set(pr.color);
      m.position.set(pr.x * PX, 1.05, (pr.y + 44) * PX); m.rotation.y = Math.atan2(-pr.vy, pr.vx);
    }
  }
  updateGate(G, dt) {
    if (!this.gate) return;
    const P = this.gate.userData.parts, open = G.bossDead;
    if (open !== this.gateOpen) {
      this.gateOpen = open;
      P.portal.userData.mesh.material = open ? this.M.glow : this.M.candy;
      if (this.gateLabel) this.gateLabel.classList.toggle('open', open);
      if (open) this.burst(this.gate.position.x, 2, this.gate.position.z, 0xffd24d, 40, 4, 8, true);
    }
    P.portal.rotation.z += dt * (open ? 2.2 : 0.15);
    P.bars.position.y = P.bars.userData.rest.y + (open ? -2.6 : 0); P.bars.visible = !open;
    if (open && Math.random() < dt * 8) this.burst(this.gate.position.x + (Math.random() - 0.5) * 2, 2 + Math.random(), this.gate.position.z, [0xff5d8f, 0x7ad9c4, 0xffd24d, 0xa98cff][Math.floor(Math.random() * 4)], 1, 0.6, -1.5);
  }

  // fade tall props that stand between the camera and Pip (screen-space overlap + nearer to the camera)
  updateOccluders(G, dt) {
    if (!this.biome) return;
    const px = G.player.x * PX, pz = G.player.y * PX;
    const pb = this.project(px, 0.1, pz), pt = this.project(px, 1.6, pz);
    for (const o of this.biome.occluders) {
      let want = 1;
      if (o.z > pz - 0.3 && (this.camName === 'play' || this.camName === 'hud-check')) {
        const a = this.project(o.x, 0, o.z), b = this.project(o.x, o.top, o.z);
        const halfPx = Math.abs(this.project(o.x + o.halfW, o.top * 0.8, o.z).x - this.project(o.x, o.top * 0.8, o.z).x) + 14;
        const overlapY = Math.min(a.y, pb.y) > Math.max(b.y, pt.y) - 10;
        if (overlapY && Math.abs(pb.x - a.x) < halfPx + 10) want = 0.25;
      }
      o.fade += (want - o.fade) * (1 - Math.exp(-dt * 10));
      o.mesh.material.opacity = o.fade; o.mesh.material.depthWrite = o.fade > 0.95; o.mesh.castShadow = true;
    }
  }

  // ---------------------------------------------------------------- camera
  setCam(name) { if (CAMS[name]) { this.camName = name; this.cut = true; } }
  updateCamera(G, dt) {
    const C = CAMS[this.camName] || CAMS.play, cam = this.camera;
    const w = this.renderer.domElement.clientWidth || 1, h = this.renderer.domElement.clientHeight || 1;
    cam.aspect = w / h;
    // narrow screens: widen FOV a touch so the play area reads on portrait-ish aspect ratios
    cam.fov = C.fov * (cam.aspect < 1.3 ? 1.18 : 1);
    cam.updateProjectionMatrix();
    const W = G.W * PX, H = G.H * PX;
    const fog = this.scene.fog, pal = this.biome && this.biome.pal;
    if (fog && pal) { const k = C.fixed ? 2.2 : 1; fog.near = (pal.fogNear || 46) * k; fog.far = (pal.fogFar || 150) * k; } // the overview sits far above the fog band
    if (C.fixed) { const hgt = Math.max(W, H * 1.6) * 1.15; cam.position.set(W / 2, hgt, H + hgt * 0.27); cam.lookAt(W / 2, 0, H / 2 + 2); this.fitSun(new THREE.Vector3(W / 2, 0, H / 2), Math.max(W, H) * 0.7); return; }
    if (C.focus) { // frame one entity by its height (bestiary / hero shots)
      const v = this.views.get(this.focusId); if (!v) return;
      const d = v.h * 1.5 + 2.6, p = v.group.position;
      cam.position.set(p.x + d * 0.42, v.h * 0.55 + d * 0.28, p.z + d); cam.lookAt(p.x, v.h * 0.45, p.z); this.fitSun(p, 10); return;
    }
    const pv = this.views.get(G.player.id);
    const target = tmpV.set(G.player.x * PX, 0, G.player.y * PX);
    if (this.camName === 'play' || this.camName === 'hud-check') { // keep the view mostly inside the map, like the classic camera
      target.x = THREE.MathUtils.clamp(target.x, 7, W - 7); target.z = THREE.MathUtils.clamp(target.z, 3.5, H - 1.5);
      if (pv) { target.x += (G.player.vx || 0) * 60 * PX * 0.18; target.z += (G.player.vy || 0) * 60 * PX * 0.12; }
    }
    const k = this.cut ? 1 : 1 - Math.exp(-dt * 5.5);
    if (!this.cut && this.camTarget.distanceTo(target) > 8) this.cut = true; // big jumps cut, never pan
    this.camTarget.lerp(target, this.cut ? 1 : k); this.cut = false;
    let off = tmpV2.set(...C.off);
    if (this.camName === 'hero-close' || this.camName === 'title') { const yaw = pv ? pv.yaw : 0; off = off.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw); }
    if (this.camName === 'title') off.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin(this.time * 0.15) * 0.25);
    cam.position.copy(this.camTarget).add(off);
    const look = this.camTarget.clone().add(new THREE.Vector3(...C.look));
    if (this.shake > 0) { this.shake = Math.max(0, this.shake - dt * 1.8); const s = this.shake * this.shake * 0.35; cam.position.x += (Math.random() - 0.5) * s; cam.position.y += (Math.random() - 0.5) * s; }
    cam.lookAt(look);
    this.fitSun(this.camTarget, 14);
  }
  // shadow frustum fitted to the play area around the camera target, snapped to texels to stop shimmering
  fitSun(center, half) {
    const s = this.sun, sc = s.shadow.camera;
    if (sc.right !== half) { sc.left = -half; sc.right = half; sc.top = half; sc.bottom = -half; sc.updateProjectionMatrix(); }
    const texel = (half * 2) / s.shadow.mapSize.x;
    const c = center.clone(); c.x = Math.round(c.x / texel) * texel; c.z = Math.round(c.z / texel) * texel;
    s.target.position.copy(c); s.position.copy(c).addScaledVector(this.sunDir, 40); s.target.updateMatrixWorld();
  }

  // ---------------------------------------------------------------- DOM tags (bars, names, damage numbers)
  tag(cls, html) { const d = document.createElement('div'); d.className = 'tag ' + cls; d.innerHTML = html; this.tags.appendChild(d); return d; }
  floatText(x, y, hgt, txt, cls, color) {
    const el = this.tag(cls, ''); el.textContent = txt; el.style.color = color;
    this.floats.push({ el, x: x * PX, z: y * PX, h: hgt, life: cls.includes('lvl') ? 1.2 : 0.8, max: cls.includes('lvl') ? 1.2 : 0.8, dx: (Math.random() - 0.5) * 30 });
  }
  project(x, y, z) {
    tmpV.set(x, y, z).project(this.camera);
    const c = this.renderer.domElement; return { x: (tmpV.x * 0.5 + 0.5) * c.clientWidth, y: (-tmpV.y * 0.5 + 0.5) * c.clientHeight, vis: tmpV.z < 1 && tmpV.z > -1 };
  }
  updateTags() {
    const place = (el, p, extra = '') => { if (!p.vis) { el.style.visibility = 'hidden'; return; } el.style.visibility = ''; el.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) translate(-50%,-100%)${extra}`; };
    for (const v of this.views.values()) {
      const gp = v.group.position;
      if (v.bar) place(v.bar, this.project(gp.x, v.h + 0.28, gp.z));
      if (v.name) place(v.name, this.project(gp.x, v.h + 0.28, gp.z), ' translateY(-12px)');
    }
    if (this.gateLabel && this.gate) place(this.gateLabel, this.project(this.gate.position.x, 4.5, this.gate.position.z));
    const dt = 1 / 60;
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i]; f.life -= this.lastDt || dt;
      if (f.life <= 0) { f.el.remove(); this.floats.splice(i, 1); continue; }
      const k = 1 - f.life / f.max;
      const p = this.project(f.x, f.h + k * 1.1, f.z);
      place(f.el, p, ` translateX(${(f.dx * k).toFixed(1)}px) scale(${(k < 0.15 ? 0.6 + k * 4 : 1.2 - k * 0.3).toFixed(2)})`);
      f.el.style.opacity = k > 0.6 ? (1 - (k - 0.6) / 0.4).toFixed(2) : '1';
    }
  }

  // ---------------------------------------------------------------- picking: screen-space first (you tap what you see), then ground
  pick(clientX, clientY) {
    const c = this.renderer.domElement, rect = c.getBoundingClientRect();
    const sx = clientX - rect.left, sy = clientY - rect.top;
    let best = null, bd = Infinity;
    for (const v of this.views.values()) {
      if (v.faction !== 'enemy' && v.faction !== 'wild') continue;
      const gp = v.group.position, a = this.project(gp.x, 0, gp.z), b = this.project(gp.x, v.h, gp.z);
      if (!a.vis) continue;
      const rad = Math.max(26, Math.abs(a.y - b.y) * 0.5), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      const d = Math.hypot((sx - cx) / 1, (sy - cy) / 1.4);
      if (d < rad && d < bd) { bd = d; best = v; }
    }
    // pickups: a tap right on a visible item walks to it (otherwise a nearby animal would steal the click)
    let item = null, id2 = Infinity;
    for (const v of this.itemViews.values()) {
      const gp = v.group.position, a = this.project(gp.x, 0.45, gp.z); if (!a.vis) continue;
      const d = Math.hypot(sx - a.x, sy - a.y); if (d < 30 && d < id2) { id2 = d; item = v; }
    }
    if (item && (!best || id2 < bd * 0.8)) return { id: null, item: item.id, wx: item.e.x, wy: item.e.y, sx, sy };
    const ndc = new THREE.Vector2((sx / c.clientWidth) * 2 - 1, -(sy / c.clientHeight) * 2 + 1);
    const ray = new THREE.Raycaster(); ray.setFromCamera(ndc, this.camera);
    const hit = new THREE.Vector3(); const ok = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit);
    return { id: best ? best.id : null, wx: ok ? hit.x / PX : null, wy: ok ? hit.z / PX : null, sx, sy };
  }
  hover(id) { for (const v of this.views.values()) if (v.id === id) v.rim = 1; }

  // ---------------------------------------------------------------- render + stats
  resize() {
    const c = this.renderer.domElement; const w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    const pr = Math.min(window.devicePixelRatio || 1, this.q.maxDpr);
    if (this.renderer.getPixelRatio() !== pr) this.renderer.setPixelRatio(pr);
    const sz = this.renderer.getSize(new THREE.Vector2());
    if (sz.x !== w || sz.y !== h) this.renderer.setSize(w, h, false);
  }
  render() {
    this.resize();
    const info = this.renderer.info; info.autoReset = false; info.reset();
    this.renderer.render(this.scene, this.camera);
    this.lastInfo = { calls: info.render.calls, tris: info.render.triangles, programs: info.programs ? info.programs.length : 0, geometries: info.memory.geometries, textures: info.memory.textures };
  }
  stats() { return { ...(this.lastInfo || {}), gpu: this.gpu, contextLost: this.contextLost, lastShaderError: this.lastShaderError, lights: 2, pixelRatio: this.renderer.getPixelRatio() }; }
}

// Geometry only: materials are shared or tiny, and disposing the last user of a program would force a recompile next level.
function disposeTree(o) { o.traverse((c) => { if (c.isMesh) c.geometry.dispose(); }); }
export { PX };
