// Deterministic screenshot states, for the 3–4 real screenshots.
// Load the game with ?shot=<name>&seed=1 and the scene is set up the
// same way every time; when it is ready, window.__shotReady is set.
//
//   start    — the title screen, customers peeking over the counter.
//   order    — a customer ordering: speech bubble, patience timer.
//   cooking  — mid-cooking: patty on the grill, fries frying, sparkles.
//   serve    — a perfect serve: grade popup "Wonderful!", hearts, a
//              delighted customer, the combo meter lit.
//
// The shots are taken by shot.mjs (Playwright), which waits for
// window.__shotReady before screenshotting.

import { makeGame } from './main.js';
import { makeCustomer, serveCustomer } from './customers.js';
import { CUSTOMER_DEFS } from './customers.js';
import { dishById } from './recipes.js';
import { spawnSparkles, spawnHearts, showGrade, flashScreen } from './effects.js';
import { addToPlate } from './kitchen.js';

export function setupShot(game, shot, seed) {
  game.screen = 'playing';
  if (shot === 'start') {
    game.screen = 'title';
    window.__shotReady = true;
    return;
  }
  if (shot === 'order') {
    // Maya ordering a Sunrise Burger, patience high, bubble showing.
    const c = makeCustomer(CUSTOMER_DEFS[0], 0, dishById('sunrise'), 55);
    c.state = 'waiting';
    c.stateT = 0;
    c.mood = 'waiting';
    c.arrive = 1;
    c.patience = 48;
    game.customers = [c];
    game.score = 0;
    game.served = 0;
    game.combo = 0;
    window.__shotReady = true;
    return;
  }
  if (shot === 'cooking') {
    // Two customers waiting; a patty grilling and fries frying; the
    // plate already holds a bun and cheese; sparkles in the air.
    const c1 = makeCustomer(CUSTOMER_DEFS[0], 0, dishById('sunrise'), 55);
    c1.state = 'waiting';
    c1.stateT = 0;
    c1.mood = 'waiting';
    c1.arrive = 1;
    c1.patience = 41;
    const c2 = makeCustomer(CUSTOMER_DEFS[2], 1, dishById('garden'), 55);
    c2.state = 'waiting';
    c2.stateT = 0;
    c2.mood = 'impatient';
    c2.arrive = 1;
    c2.patience = 14;
    game.customers = [c1, c2];
    const patty = game.stations[1];
    patty.state = 'cooking';
    patty.cookT = 3.2;
    patty.progress = 0.8;
    const fries = game.stations[6];
    fries.state = 'cooking';
    fries.cookT = 2.5;
    fries.progress = 0.5;
    addToPlate(game.plate, 'bun');
    addToPlate(game.plate, 'cheese');
    game.score = 152;
    game.served = 1;
    game.combo = 1;
    spawnSparkles(game.fx, 560, 330, 10);
    window.__shotReady = true;
    return;
  }
  if (shot === 'serve') {
    // A perfect serve just happened: Maya delighted, hearts floating,
    // the grade popup reading "Wonderful!", combo x2, score up.
    const c = makeCustomer(CUSTOMER_DEFS[0], 0, dishById('sunrise'), 55);
    c.state = 'delighted';
    c.stateT = 0.4;
    c.mood = 'delighted';
    c.arrive = 1;
    c.patience = 40;
    game.customers = [c];
    game.score = 312;
    game.served = 2;
    game.combo = 2;
    game.bestCombo = 2;
    showGrade(game.fx, 'wonderful');
    flashScreen(game.fx, '#ffd93b');
    spawnHearts(game.fx, 412, 170, 8);
    spawnSparkles(game.fx, 412, 170, 12);
    window.__shotReady = true;
    return;
  }
  window.__shotReady = true;
}
