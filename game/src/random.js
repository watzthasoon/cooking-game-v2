// A tiny seeded random number generator, so screenshots and play-tests
// are deterministic. mulberry32 is small, fast, and good enough for a
// kitchen game; the seed comes from the URL (?seed=) or the clock.

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

// Pick one item from an array with the given rng.
export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

// A random integer in [min, max).
export function intBetween(rng, min, max) {
  return min + Math.floor(rng() * (max - min));
}

// Shuffle a copy of an array (Fisher-Yates), leaving the original alone.
export function shuffle(rng, items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
