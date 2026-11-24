/**
 * Deterministic PRNG using mulberry32.
 * Fixed seed 20261124 ensures identical seed data on every run (Tech Arch §9).
 */
export function createMulberry32(seed = 20261124) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
