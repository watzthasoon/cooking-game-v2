// Orders, scoring, combo and levels. Every active order belongs to a
// visible customer: the ticket on the board and the speech bubble above
// the customer are the same order, and serving it is serving them.
//
// Scoring: a dish's base points, plus a time bonus (seconds of patience
// left), multiplied by the combo (1 + 0.1 per consecutive serve).
// Level up every 5 serves: patience shortens and orders arrive faster.

import { DISHES, dishById, matchingDish, plateMatchesDish } from './recipes.js';
import { makeCustomer, tickCustomer, serveCustomer, CUSTOMER_DEFS } from './customers.js';
import { pick } from './random.js';

// Patience (seconds) for a new order, by level. It shortens as the
// kitchen gets busier, but never below 25 seconds.
export function patienceForLevel(level) {
  return Math.max(25, 55 - (level - 1) * 4);
}

// How many customers may be at the counter at once, by level.
export function maxCustomersForLevel(level) {
  return level >= 3 ? 3 : 2;
}

// Seconds between new customers arriving, by level.
export function spawnGapForLevel(level) {
  return Math.max(4, 9 - (level - 1) * 1.2);
}

// Pick a dish for a new order. Early on the menu is simple; the Feast
// (6 items) only shows up from level 2, so the first orders are kind.
export function pickDish(rng, level) {
  const pool = DISHES.filter((d) => level >= 2 || d.items.length <= 4);
  return pick(rng, pool);
}

// Choose a customer character who is not already at the counter.
export function pickCustomerDef(rng, busyIds) {
  const free = CUSTOMER_DEFS.filter((d) => !busyIds.includes(d.id));
  if (free.length === 0) return pick(rng, CUSTOMER_DEFS);
  return pick(rng, free);
}

// The grade for a serve, from how much patience was left and the combo.
// Wonderful = fast or on a hot streak; Excellent = good; Good = slow.
export function gradeForServe(customer, combo) {
  const frac = customer.patience / customer.maxPatience;
  if (frac >= 0.6 || combo >= 3) return 'wonderful';
  if (frac >= 0.3) return 'excellent';
  return 'good';
}

// Points for serving a dish: base + time bonus, times the combo.
export function pointsForServe(dish, customer, combo) {
  const timeBonus = Math.round(customer.patience);
  const mult = 1 + 0.1 * combo;
  return Math.round((dish.points + timeBonus) * mult);
}

// Serve a customer whose dish matches the plate. Applies the score,
// combo, level and mood, and returns { dish, grade, points }.
export function serveOrder(game, customer) {
  const dish = customer.dish;
  const grade = gradeForServe(customer, game.combo);
  const points = pointsForServe(dish, customer, game.combo);
  game.score += points;
  game.served += 1;
  game.combo += 1;
  if (game.combo > game.bestCombo) game.bestCombo = game.combo;
  const newLevel = 1 + Math.floor(game.served / 5);
  const leveledUp = newLevel > game.level;
  game.level = newLevel;
  serveCustomer(customer);
  return { dish, grade, points, leveledUp };
}

// A customer's order expired: they leave unhappy, the combo breaks.
export function expireOrder(game, customer) {
  game.missed += 1;
  game.combo = 0;
}

// The customer whose dish the plate matches right now, or null.
// Only waiting customers count — a delighted or sad one is already done.
export function matchingCustomer(game) {
  const dish = matchingDish(game.plate);
  if (!dish) return null;
  for (const c of game.customers) {
    if (c.state === 'waiting' && c.dish.id === dish.id) return c;
  }
  return null;
}

// A one-line summary of the rush right now, for the header or a
// debug readout: how many are waiting and the shortest patience left.
export function rushSummary(game) {
  const waiting = game.customers.filter((c) => c.state === 'waiting');
  if (waiting.length === 0) return 'No orders';
  const soonest = Math.min(...waiting.map((c) => c.patience));
  return `${waiting.length} order${waiting.length === 1 ? '' : 's'} — soonest ${Math.ceil(soonest)}s`;
}

// Tick every customer (patience, moods, arrivals, departures) and
// collect the events main.js needs to react to.
export function tickCustomers(game, dt) {
  const events = [];
  for (const c of game.customers) {
    const result = tickCustomer(c, dt);
    if (result === 'expired') {
      expireOrder(game, c);
      events.push({ type: 'expired', customer: c });
    } else if (result === 'done') {
      events.push({ type: 'reacted', customer: c });
    }
  }
  // Remove customers who have fully left.
  game.customers = game.customers.filter((c) => c.state !== 'leaving' || c.arrive > 0);
  game.customers = game.customers.filter((c) => !(c.state === 'leaving' && c.arrive <= 0));
  return events;
}

// Invite a new customer in when there is a free slot and the gap has
// passed. Returns the new customer, or null.
export function maybeSpawnCustomer(game, dt) {
  game.spawnTimer -= dt;
  if (game.spawnTimer > 0) return null;
  const max = maxCustomersForLevel(game.level);
  const waiting = game.customers.filter((c) => c.state === 'waiting' || c.state === 'arriving').length;
  if (waiting >= max) {
    game.spawnTimer = 1;
    return null;
  }
  const freeSlots = [0, 1, 2].filter((s) => !game.customers.some((c) => c.slot === s));
  if (freeSlots.length === 0) {
    game.spawnTimer = 1;
    return null;
  }
  const slot = freeSlots[0];
  const busyIds = game.customers.map((c) => c.def.id);
  const def = pickCustomerDef(game.rng, busyIds);
  const dish = pickDish(game.rng, game.level);
  const patience = patienceForLevel(game.level);
  const customer = makeCustomer(def, slot, dish, patience);
  game.customers.push(customer);
  game.spawnTimer = spawnGapForLevel(game.level);
  return customer;
}

export { dishById, plateMatchesDish };
