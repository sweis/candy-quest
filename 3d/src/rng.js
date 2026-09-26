// Seeded RNG (mulberry32). Every random roll in the sim goes through one of these so runs replay identically.
export function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.seed = seed >>> 0;
  return next;
}
export const randomSeed = () => (Math.random() * 2 ** 32) >>> 0;
