// Procedural animation for every rig. Driven only by what the sim exposes (velocity, facing) plus render-side
// timers set from sim events (attackT, hitT, spawnT, dieT). Nothing here feeds back into gameplay.
import { THREE } from './kit.js';

const TAU = Math.PI * 2;
const ease = (t) => 1 - Math.pow(1 - t, 3);

export function animate(v, dt, time) {
  const P = v.parts, s = v.speed, moving = s > 0.25;
  const amp = THREE.MathUtils.clamp(s / 2.2, 0, 1);
  v.walk += (s * dt) / (v.stride || 0.9) * Math.PI;
  const w = v.walk, t = time + v.seed;
  // reset
  for (const k in P) { const o = P[k]; if (o.userData.rest) { o.position.copy(o.userData.rest); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); } }
  const att = v.attackT > 0 ? 1 - v.attackT / v.attackDur : -1; // 0..1 progress, -1 when idle
  const hit = Math.max(0, v.hitT);

  if (v.rig === 'biped') {
    const legA = 0.75 * amp, armA = 0.55 * amp;
    if (P.legL) P.legL.rotation.z = Math.sin(w) * legA;
    if (P.legR) P.legR.rotation.z = -Math.sin(w) * legA;
    if (P.armL) P.armL.rotation.z = -Math.sin(w) * armA;
    if (P.armR) P.armR.rotation.z = Math.sin(w) * armA;
    if (P.body) {
      P.body.position.y += Math.abs(Math.sin(w)) * 0.06 * amp + Math.sin(t * 2.2) * 0.008;
      P.body.rotation.z = -0.06 * amp; // lean into the run
    }
    if (P.head) P.head.rotation.z = Math.sin(t * 1.7) * 0.03 + Math.sin(w * 2) * 0.03 * amp;
    if (P.armL && !moving) P.armL.rotation.x = -0.08;
    if (P.armR && !moving) P.armR.rotation.x = 0.08;
    if (att >= 0 && P.armR) {
      if (v.ranged) { // raise and hold the bow / crossbow level
        P.armR.rotation.z = THREE.MathUtils.lerp(P.armR.rotation.z, Math.PI / 2, Math.min(1, att * 4));
        if (P.armL) P.armL.rotation.z = Math.PI / 2 * Math.min(1, att * 4);
      } else if (att < 0.3) P.armR.rotation.z = THREE.MathUtils.lerp(0, 3.7, ease(att / 0.3));
      else if (att < 0.62) P.armR.rotation.z = THREE.MathUtils.lerp(3.7, 0.45, ease((att - 0.3) / 0.32));
      else P.armR.rotation.z = THREE.MathUtils.lerp(0.45, 0, (att - 0.62) / 0.38);
      if (P.body && !v.ranged) P.body.rotation.y = Math.sin(att * Math.PI) * -0.35;
    }
    if (hit > 0 && P.body) { P.body.rotation.z += hit * 0.35; if (P.head) P.head.rotation.z += hit * 0.25; }
  } else if (v.rig === 'blob') {
    const b = P.body; const hop = moving ? Math.abs(Math.sin(w * 0.8)) : 0;
    const sq = 1 + Math.sin(t * 3) * 0.045 - hop * 0.08;
    b.scale.set(1 / Math.sqrt(sq), sq + hop * 0.14, 1 / Math.sqrt(sq));
    b.position.y += hop * 0.28;
    if (att >= 0) { const l = Math.sin(att * Math.PI); b.position.x += l * 0.45; b.scale.x *= 1 + l * 0.25; b.scale.y *= 1 - l * 0.15; }
    if (hit > 0) { b.scale.y *= 1 - hit * 0.28; b.scale.x *= 1 + hit * 0.2; b.scale.z *= 1 + hit * 0.2; }
  } else if (v.rig === 'bird') {
    const b = P.body;
    b.position.y += 0.1 + Math.sin(t * 3.2) * 0.09;
    const flap = Math.sin(t * (moving ? 22 : 7)) * (moving ? 0.8 : 0.35);
    if (P.wingL) P.wingL.rotation.x = flap;
    if (P.wingR) P.wingR.rotation.x = -flap;
    if (P.legL) P.legL.rotation.z = Math.sin(w) * 0.5 * amp;
    if (P.legR) P.legR.rotation.z = -Math.sin(w) * 0.5 * amp;
    if (P.head) P.head.rotation.z = Math.sin(t * 2.1) * 0.08;
    if (att >= 0) { b.rotation.z = -Math.sin(att * Math.PI) * 0.3; }
    if (hit > 0) b.rotation.z += hit * 0.3;
  } else if (v.rig === 'bug') {
    const b = P.body;
    if (P.legL) P.legL.rotation.y = Math.sin(w * 1.6) * 0.45 * amp;
    if (P.legR) P.legR.rotation.y = -Math.sin(w * 1.6) * 0.45 * amp;
    b.position.y += Math.abs(Math.sin(w * 1.6)) * 0.04 * amp + Math.sin(t * 2.6) * 0.01;
    if (P.head) P.head.rotation.x = Math.sin(t * 1.3) * 0.08;
    if (att >= 0) { b.position.x += Math.sin(att * Math.PI) * 0.35; b.rotation.z = -Math.sin(att * Math.PI) * 0.2; }
    if (hit > 0) b.rotation.z += hit * 0.25;
  }
  // spawn pop + death squash apply to the whole model
  const root = v.model;
  let sc = v.baseScale;
  if (v.spawnT > 0) { const k = 1 - v.spawnT; sc *= k < 1 ? 1 + Math.sin(k * Math.PI * 1.5) * 0.25 * (1 - k) - (1 - ease(Math.min(1, k * 1.6))) : 1; }
  root.scale.setScalar(Math.max(0.001, sc));
  if (v.dieT >= 0) { const k = Math.min(1, v.dieT); root.scale.set(sc * (1 + k * 0.5), sc * Math.max(0.02, 1 - k), sc * (1 + k * 0.5)); root.rotation.y += dt * 10 * k; }
}

// Capture rest transforms once so each frame starts from the bind pose.
export function bindRest(parts) {
  for (const k in parts) parts[k].userData.rest = parts[k].position.clone();
}
export { TAU };
