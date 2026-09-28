// Bake item icons + pet portraits once at boot by rendering the real 3D models into a corner of the main canvas
// and copying them out in the same task (no per-frame GPU read-backs). Returns id -> dataURL.
import { THREE, materials } from './kit.js';
import { itemKit, ITEM_IDS } from './items3d.js';
import { catalog } from './models.js';
import { ALLIES } from './content.js';

export function bakeIcons(renderer, size = 96) {
  const M = materials();
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xeef6ff, 0xb9a0c8, 1.6));
  const sun = new THREE.DirectionalLight(0xfff4e6, 2.6); sun.position.set(-2, 4, 5); scene.add(sun);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
  const out = {};
  const canvas = renderer.domElement;
  const prevTarget = renderer.getRenderTarget(), prevTone = renderer.toneMappingExposure;
  const oldSize = renderer.getSize(new THREE.Vector2()), oldPR = renderer.getPixelRatio();
  renderer.setPixelRatio(1); renderer.setSize(Math.max(oldSize.x, size), Math.max(oldSize.y, size), false);
  const shadowsWere = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false;
  renderer.setClearColor(0x000000, 0);
  const c2 = document.createElement('canvas'); c2.width = c2.height = size; const g2 = c2.getContext('2d');
  const shoot = (id, obj, dir = [0.9, 0.55, 1.6], fill = 0.8) => {
    scene.add(obj);
    const box = new THREE.Box3().setFromObject(obj), ctr = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
    const r = Math.max(sz.x, sz.y, sz.z) * 0.5 / fill;
    const d = r / Math.sin((cam.fov * Math.PI) / 360);
    cam.position.copy(ctr).add(new THREE.Vector3(...dir).normalize().multiplyScalar(d)); cam.lookAt(ctr); cam.updateProjectionMatrix();
    renderer.setViewport(0, 0, size, size); renderer.setScissor(0, 0, size, size); renderer.setScissorTest(true);
    renderer.clear(); renderer.render(scene, cam);
    g2.clearRect(0, 0, size, size);
    g2.drawImage(canvas, 0, canvas.height - size, size, size, 0, 0, size, size);
    out[id] = c2.toDataURL('image/png');
    scene.remove(obj); obj.traverse((o) => o.geometry && o.geometry.dispose());
  };
  for (const id of ITEM_IDS) {
    const k = itemKit(id); const m = new THREE.Mesh(k.static(), M.candy); const gl = k.staticGlow(); if (gl) m.add(new THREE.Mesh(gl, M.glow));
    shoot(id, m, [0.25, 0.35, 1.5], 0.92);
  }
  for (const key of Object.keys(ALLIES)) {
    const cat = catalog(ALLIES[key].sprite); if (cat.fallback) continue;
    const g = cat.build().build(M.candy, M.glow); g.rotation.y = -0.55;
    shoot('pet:' + key, g, [0.2, 0.35, 1.5], 0.95);
  }
  { const cat = catalog('hero'); const g = cat.build().build(M.candy, M.glow); g.rotation.y = -0.45; shoot('pet:hero', g, [0.1, 0.2, 1.5], 1.4); }
  renderer.setScissorTest(false); renderer.setClearColor(0x000000, 1);
  renderer.shadowMap.enabled = shadowsWere; renderer.setPixelRatio(oldPR); renderer.setSize(oldSize.x, oldSize.y, false);
  renderer.setRenderTarget(prevTarget); renderer.toneMappingExposure = prevTone;
  return out;
}
