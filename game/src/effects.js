// The cheerful feedback: sparkle bursts, floating hearts, "!" pops,
// big grade popups, and a golden screen flash. Every effect is a small
// object in a list, updated each frame and drawn by render.js.
//
// Grades: 'Wonderful!' (perfect — served fast or on a high combo),
// 'Excellent!' (good), 'Good' (slow but served), 'Try Again' (missed).

export const GRADES = {
  wonderful: { text: 'Wonderful!', color: '#ff9f1c', sub: 'Perfect serve!' },
  excellent: { text: 'Excellent!', color: '#2ec4b6', sub: 'Great timing!' },
  good: { text: 'Good!', color: '#7ed957', sub: 'Served!' },
  tryagain: { text: 'Try Again!', color: '#ff5a4e', sub: 'The customer left unhappy' },
};

export function makeEffects() {
  return {
    particles: [],
    grade: null,
    gradeT: 0,
    flash: 0,
    flashColor: '#ffd93b',
  };
}

// A burst of gold four-point stars at (x, y).
export function spawnSparkles(fx, x, y, n) {
  for (let i = 0; i < (n || 14); i++) {
    const a = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 140;
    fx.particles.push({
      kind: 'star',
      x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 60,
      life: 0.7 + Math.random() * 0.4,
      t: 0,
      size: 6 + Math.random() * 9,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 6,
      color: Math.random() < 0.7 ? '#ffd93b' : '#ff9f1c',
    });
  }
}

// Pink hearts that float up and fade, for a delighted customer.
export function spawnHearts(fx, x, y, n) {
  for (let i = 0; i < (n || 8); i++) {
    fx.particles.push({
      kind: 'heart',
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 30,
      vy: -50 - Math.random() * 50,
      life: 1.1 + Math.random() * 0.5,
      t: 0,
      size: 9 + Math.random() * 8,
      rot: (Math.random() - 0.5) * 0.6,
      spin: 0,
      color: Math.random() < 0.5 ? '#ff7eb9' : '#ff5a8a',
    });
  }
}

// A red "!" that pops and fades, for a mistake (burnt food, wrong serve).
export function spawnBang(fx, x, y) {
  fx.particles.push({
    kind: 'bang',
    x, y,
    vx: 0, vy: -30,
    life: 0.9,
    t: 0,
    size: 34,
    rot: 0,
    spin: 0,
    color: '#ff5a4e',
  });
}

// A small puff of grey smoke, for burnt food.
export function spawnSmoke(fx, x, y, n) {
  for (let i = 0; i < (n || 6); i++) {
    fx.particles.push({
      kind: 'smoke',
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 20,
      vy: -40 - Math.random() * 30,
      life: 0.9 + Math.random() * 0.4,
      t: 0,
      size: 12 + Math.random() * 10,
      rot: 0,
      spin: 0,
      color: '#9aa0a6',
    });
  }
}

// Show the big grade popup in the middle of the screen.
export function showGrade(fx, gradeKey) {
  const g = GRADES[gradeKey] || GRADES.good;
  fx.grade = g;
  fx.gradeT = 0;
}

// A golden flash over the whole screen (perfect serve).
export function flashScreen(fx, color) {
  fx.flash = 0.55;
  fx.flashColor = color || '#ffd93b';
}

// A full celebration at one spot: sparkles plus hearts, for a level
// up or a perfect serve on a hot streak.
export function celebrate(fx, x, y) {
  spawnSparkles(fx, x, y, 16);
  spawnHearts(fx, x, y - 10, 6);
}

export function updateEffects(fx, dt) {
  for (const p of fx.particles) {
    p.t += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += p.kind === 'heart' ? -20 * dt : 160 * dt;
    p.rot += p.spin * dt;
  }
  fx.particles = fx.particles.filter((p) => p.t < p.life);
  if (fx.grade) {
    fx.gradeT += dt;
    if (fx.gradeT > 1.6) fx.grade = null;
  }
  if (fx.flash > 0) fx.flash = Math.max(0, fx.flash - dt * 1.4);
}

// The grade popup's scale: pops in fast, holds, then shrinks away.
export function gradeScale(fx) {
  if (!fx.grade) return 0;
  const t = fx.gradeT;
  if (t < 0.15) return 0.5 + (t / 0.15) * 0.6;
  if (t < 1.1) return 1.1 - ((t - 0.15) / 0.95) * 0.1;
  if (t < 1.6) return 1 - ((t - 1.1) / 0.5) * 1;
  return 0;
}
