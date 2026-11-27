// Seeded random numbers for Gobble Dash: every farmyard layout comes from one
// seed, so the same seed always builds the same run and the same screenshots.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A tiny deterministic layout stream: numbers in [0, 1) with a fixed order,
// so a stage's fences, bales, ovens and corn are reproducible from its seed.
export function makeLayoutStream(seed) {
  const next = mulberry32(seed);
  return {
    // Float in [0, 1).
    float() {
      return next();
    },
    // Integer in [min, max] inclusive.
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    // Pick one entry from a list.
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
    // True with the given probability.
    chance(p) {
      return next() < p;
    },
  };
}

// Hash a short string into a 32-bit seed, for stage seeds derived from names.
export function seedFromText(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
