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
  } else if (v.rig === 'quad' || v.rig === 'frog') { // diagonal gait: FL+BR together, FR+BL together (frogs hop instead)
    const a = Math.sin(w) * 0.55 * amp;
    if (P.legFL) P.legFL.rotation.z = a; if (P.legBR) P.legBR.rotation.z = a;
    if (P.legFR) P.legFR.rotation.z = -a; if (P.legBL) P.legBL.rotation.z = -a;
    const b = P.body; b.position.y += Math.abs(Math.sin(w)) * 0.04 * amp + Math.sin(t * 2) * 0.012;
    if (v.rig === 'frog' && moving) { const hop = Math.abs(Math.sin(w * 0.7)); b.position.y += hop * 0.35; for (const n of ['legBL', 'legBR', 'legFL', 'legFR']) if (P[n]) { P[n].position.y += hop * 0.3; P[n].rotation.z = -hop * 0.5; } }
    if (P.head) P.head.rotation.z = Math.sin(t * 1.6) * 0.04;
    if (P.tail) P.tail.rotation.y = Math.sin(t * 2.2 + w) * 0.18;
    if (att >= 0) {
      const l = Math.sin(att * Math.PI);
      if (v.tailSwing && P.tail) { P.tail.rotation.y = -Math.sin(att * Math.PI * 2) * 1.1; b.rotation.y = l * 0.3; }
      else if (P.head) { P.head.position.x += l * 0.25; P.head.rotation.z = -l * 0.3; }
      else b.position.x += l * 0.3;
    }
    if (hit > 0) b.rotation.z += hit * 0.2;
  } else if (v.rig === 'snake') {
    const b = P.body; b.scale.set(1, 1 + Math.sin(t * 2.4) * 0.04, 1);
    if (P.neck) { P.neck.rotation.x = Math.sin(t * 1.8) * 0.12; P.neck.rotation.z = Math.sin(t * 1.3) * 0.08 + (moving ? -0.15 : 0); }
    if (P.head) P.head.rotation.z = Math.sin(t * 2.6) * 0.1;
    if (moving) b.rotation.y = Math.sin(w * 1.2) * 0.2;
    if (att >= 0 && P.neck) P.neck.rotation.z -= Math.sin(att * Math.PI) * 0.7; // strike forward
    if (hit > 0) b.scale.y *= 1 - hit * 0.2;
  } else if (v.rig === 'fish') {
    const b = P.body; b.position.y += Math.sin(t * 2.4) * 0.12; b.rotation.z = Math.sin(t * 1.2) * 0.05;
    if (P.tail) P.tail.rotation.y = Math.sin(t * (moving ? 14 : 5)) * (moving ? 0.6 : 0.3);
    if (att >= 0) b.position.x += Math.sin(att * Math.PI) * 0.3;
    if (hit > 0) b.rotation.z += hit * 0.4;
  } else if (v.rig === 'worm') {
    const segs = ['seg0', 'seg1', 'seg2', 'seg3', 'head'];
    segs.forEach((n, i) => { const o = P[n]; if (!o) return; o.position.y += Math.max(0, Math.sin((moving ? w * 1.4 : t * 2.2) - i * 0.9)) * (moving ? 0.16 : 0.05); o.position.z += Math.sin(t * 1.5 - i * 0.7) * 0.04; });
    if (att >= 0 && P.head) { P.head.position.x += Math.sin(att * Math.PI) * 0.3; P.head.position.y += Math.sin(att * Math.PI) * 0.15; }
    if (hit > 0 && P.head) P.head.rotation.z += hit * 0.3;
  } else if (v.rig === 'slither') { // travelling side-to-side wave down the body; head rears to strike
    const segs = ['seg0', 'seg1', 'seg2', 'seg3', 'seg4', 'head'], ph = moving ? w * 1.3 : t * 1.6, ampZ = moving ? 0.22 : 0.08;
    segs.forEach((n, i) => { const o = P[n]; if (o) o.position.z += Math.sin(ph - (segs.length - i) * 0.95) * ampZ * (0.5 + i * 0.12); });
    if (P.head) { P.head.rotation.y = Math.sin(ph) * 0.2; P.head.position.y += Math.sin(t * 2.3) * 0.03; }
    if (att >= 0 && P.head) { const l = Math.sin(att * Math.PI); P.head.position.x += l * 0.4; P.head.position.y += l * 0.35; P.head.rotation.z = -l * 0.3; }
    if (hit > 0 && P.head) P.head.rotation.z += hit * 0.4;
  } else if (v.rig === 'chopper') { // two big carrot arms: sway at rest, raise overhead and chop down on attack
    const b = P.body, hop = moving ? Math.abs(Math.sin(w * 0.8)) : 0;
    b.position.y += hop * 0.12; b.rotation.z = Math.sin(t * 1.4) * 0.03 - 0.06 * amp;
    let a = Math.sin(t * 1.8) * 0.12 + Math.sin(w) * 0.25 * amp;
    if (att >= 0) a = att < 0.45 ? THREE.MathUtils.lerp(0, 2.6, ease(att / 0.45)) : att < 0.62 ? THREE.MathUtils.lerp(2.6, -0.35, ease((att - 0.45) / 0.17)) : THREE.MathUtils.lerp(-0.35, 0, (att - 0.62) / 0.38);
    if (P.armL) P.armL.rotation.z = a + Math.sin(t * 1.8 + 1) * 0.05;
    if (P.armR) P.armR.rotation.z = a;
    if (att >= 0 && att > 0.5 && att < 0.7) b.position.y -= 0.08; // body dips on impact
    if (hit > 0) b.rotation.z += hit * 0.2;
  } else if (v.rig === 'roller') { // leaf shell rolls with distance travelled; face stays upright; hops to mush
    v.roll = (v.roll || 0) - (s * dt) / (v.rollR || 0.75);
    if (P.shell) P.shell.rotation.z = v.roll;
    const b = P.body; b.position.y += Math.abs(Math.sin(t * 2.2)) * 0.03;
    if (att >= 0) { const l = Math.sin(att * Math.PI); b.position.y += l * 0.9; b.position.x += l * 0.35; if (att > 0.8) b.scale.set(1.15, 0.8, 1.15); }
    if (hit > 0) b.scale.y *= 1 - hit * 0.2;
  } else if (v.rig === 'ray') { // gliding stingray: wing tips ripple, tail trails, hovers
    const b = P.body; b.position.y += Math.sin(t * 2.2) * 0.1; b.rotation.x = Math.sin(t * 1.6) * 0.06;
    const f = Math.sin(t * (moving ? 9 : 4)) * (moving ? 0.45 : 0.22);
    if (P.wingL) P.wingL.rotation.x = f; if (P.wingR) P.wingR.rotation.x = -f;
    if (P.tail) P.tail.rotation.y = Math.sin(t * 3) * 0.25;
    if (P.body2) { // the twin glides half a beat behind
      const f2 = Math.sin(t * (moving ? 9 : 4) - 1.6) * (moving ? 0.5 : 0.25);
      P.body2.position.y += Math.sin(t * 2.2 - 1.6) * 0.12; P.body2.rotation.x = Math.sin(t * 1.6 - 1) * 0.08;
      if (P.wingL2) P.wingL2.rotation.x = f2; if (P.wingR2) P.wingR2.rotation.x = -f2; if (P.tail2) P.tail2.rotation.y = Math.sin(t * 3 - 1) * 0.3;
      if (att >= 0) P.body2.position.x += Math.sin(att * Math.PI) * 0.3;
    }
    if (att >= 0) { b.position.x += Math.sin(att * Math.PI) * 0.25; b.rotation.z = -Math.sin(att * Math.PI) * 0.2; }
    if (hit > 0) b.rotation.z += hit * 0.3;
  } else if (v.rig === 'serpent') {
    if (P.neck) { P.neck.rotation.z = Math.sin(t * 1.1) * 0.06; P.neck.rotation.x = Math.sin(t * 0.8) * 0.05; }
    if (P.head) P.head.rotation.z = Math.sin(t * 1.7) * 0.08;
    if (P.body) P.body.position.y += Math.sin(t * 1.4) * 0.06;
    if (att >= 0 && P.neck) P.neck.rotation.z -= Math.sin(att * Math.PI) * 0.45;
    if (hit > 0 && P.neck) P.neck.rotation.z += hit * 0.15;
  } else if (v.rig === 'pillar') { // arms swing constantly, faster when attacking
    const sp = att >= 0 ? 12 : 4.5;
    if (P.armL) P.armL.rotation.z = Math.sin(t * sp) * 0.9;
    if (P.armR) P.armR.rotation.z = -Math.sin(t * sp) * 0.9;
    if (P.body) { P.body.rotation.z = Math.sin(t * 1.3) * 0.03 - 0.05 * amp; P.body.position.y += Math.abs(Math.sin(w)) * 0.05 * amp; }
    if (hit > 0 && P.body) P.body.rotation.z += hit * 0.15;
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
