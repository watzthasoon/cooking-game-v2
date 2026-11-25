// Sound, synthesized with WebAudio only — no audio files. A tiny
// helper plays short notes, and each game event gets its own little
// tune: a happy chime on a serve, a sparkle arpeggio on a perfect
// serve, a sad slide on a miss, a pop when a cooking step finishes,
// and a buzz when something goes wrong.
//
// Audio is created lazily on the first user gesture (browsers block
// sound before one), and every call is safe when it is not ready yet.

let ctx = null;
let muted = false;

export function ensureAudio() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    } catch (e) {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

function note(freq, start, dur, type, vol) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// A soft pop when a cooking step finishes (patty done, chop done).
export function playStep() {
  note(660, 0, 0.12, 'triangle', 0.1);
  note(880, 0.06, 0.14, 'triangle', 0.08);
}

// A happy chime when a dish is served: C - E - G, rising.
export function playServe() {
  note(523.25, 0, 0.16, 'sine', 0.12);
  note(659.25, 0.09, 0.16, 'sine', 0.12);
  note(783.99, 0.18, 0.28, 'sine', 0.14);
}

// A sparkle arpeggio for a perfect serve: high, bright, quick.
export function playPerfect() {
  note(1046.5, 0, 0.12, 'sine', 0.1);
  note(1318.5, 0.07, 0.12, 'sine', 0.1);
  note(1568, 0.14, 0.12, 'sine', 0.1);
  note(2093, 0.21, 0.3, 'sine', 0.12);
}

// A sad slide when an order expires and a customer leaves unhappy.
export function playMiss() {
  note(392, 0, 0.22, 'sine', 0.1);
  note(329.63, 0.16, 0.22, 'sine', 0.1);
  note(261.63, 0.32, 0.4, 'sine', 0.1);
}

// A low buzz when something goes wrong (burnt food, wrong serve).
export function playMistake() {
  note(160, 0, 0.18, 'square', 0.06);
  note(120, 0.1, 0.2, 'square', 0.05);
}

// A cheerful blip when a new customer arrives and orders.
export function playArrive() {
  note(587.33, 0, 0.1, 'triangle', 0.09);
  note(880, 0.08, 0.16, 'triangle', 0.09);
}

// A rising fanfare when the kitchen levels up.
export function playLevelUp() {
  note(523.25, 0, 0.12, 'triangle', 0.1);
  note(659.25, 0.08, 0.12, 'triangle', 0.1);
  note(783.99, 0.16, 0.12, 'triangle', 0.1);
  note(1046.5, 0.24, 0.3, 'triangle', 0.12);
}
