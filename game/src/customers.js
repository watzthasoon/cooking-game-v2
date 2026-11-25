// The customers: original characters who walk up to the counter, order
// a dish, wait for it, and react to how they are served. Each one has a
// name, a distinct look (drawn from canvas paths in render.js), and a
// mood that changes with their patience and with what happens to them.
//
// Moods: 'excited' (just arrived), 'waiting' (patient), 'impatient'
// (patience running low), 'delighted' (served well), 'sad' (order
// expired), 'angry' (expired after waiting a long time).

export const CUSTOMER_DEFS = [
  {
    id: 'maya',
    name: 'Maya',
    skin: '#f2c89b',
    hair: '#c0392b',
    hairStyle: 'bun',
    shirt: '#f1c40f',
    shirtDark: '#c9a227',
    blurb: 'Loves a Sunrise Burger',
  },
  {
    id: 'bobo',
    name: 'Bobo',
    skin: '#e8b88a',
    hair: '#2c3e50',
    hairStyle: 'cap',
    shirt: '#27ae60',
    shirtDark: '#1e8449',
    blurb: 'Always hungry, always cheerful',
  },
  {
    id: 'luna',
    name: 'Luna',
    skin: '#f5d0a9',
    hair: '#8e44ad',
    hairStyle: 'bob',
    shirt: '#e84393',
    shirtDark: '#b83278',
    glasses: true,
    blurb: 'Orders the Garden Stack, every time',
  },
  {
    id: 'kiko',
    name: 'Kiko',
    skin: '#f2c89b',
    hair: '#1a1a1a',
    hairStyle: 'spiky',
    shirt: '#e67e22',
    shirtDark: '#b95f14',
    blurb: 'The kid who wants the Feast',
  },
  {
    id: 'sari',
    name: 'Sari',
    skin: '#d9a066',
    hair: '#2d3436',
    hairStyle: 'long',
    shirt: '#00cec9',
    shirtDark: '#009e9a',
    blurb: 'A regular, never in a rush',
  },
];

// How long a customer stays delighted (or sad) before leaving.
export const REACTION_TIME = 2.2;
// How long a customer takes to slide in when they arrive.
export const ARRIVE_TIME = 0.6;
// How long the counter stays empty after a customer leaves before the
// next one is invited in.
export const NEXT_CUSTOMER_DELAY = 1.2;

// Make a new customer in a slot, ordering the given dish. The caller
// decides the patience from the level.
export function makeCustomer(def, slot, dish, patience) {
  return {
    id: `${def.id}-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    def,
    slot,
    dish,
    patience,
    maxPatience: patience,
    mood: 'excited',
    state: 'arriving',
    stateT: 0,
    // slide-in progress, 0 (off-screen right) to 1 (in place).
    arrive: 0,
    // bounce offset for the idle animation, in pixels.
    bounce: 0,
    // how many times this customer has been kept waiting (for anger).
    waits: 0,
  };
}

// The mood a waiting customer shows, from how much patience is left.
export function moodForPatience(customer) {
  if (customer.patience <= 0) return 'sad';
  const frac = customer.patience / customer.maxPatience;
  if (frac < 0.3) return 'impatient';
  return 'waiting';
}

// Tick a customer: advance their state, drain patience while waiting,
// and update their mood. Returns 'expired' when their patience runs
// out, 'done' when they have finished reacting and are leaving, or null.
export function tickCustomer(customer, dt) {
  customer.stateT += dt;
  if (customer.state === 'arriving') {
    customer.arrive = Math.min(1, customer.stateT / ARRIVE_TIME);
    if (customer.arrive >= 1) {
      customer.state = 'waiting';
      customer.stateT = 0;
      customer.mood = 'waiting';
    }
    return null;
  }
  if (customer.state === 'waiting') {
    customer.patience -= dt;
    customer.bounce = Math.sin(customer.stateT * 4) * 2;
    if (customer.patience <= 0) {
      customer.patience = 0;
      customer.state = 'sad';
      customer.stateT = 0;
      customer.mood = customer.waits > 0 ? 'angry' : 'sad';
      customer.waits += 1;
      return 'expired';
    }
    customer.mood = moodForPatience(customer);
    return null;
  }
  // delighted or sad: react, then leave.
  if (customer.state === 'delighted' || customer.state === 'sad') {
    customer.bounce = Math.sin(customer.stateT * 8) * 3;
    if (customer.stateT >= REACTION_TIME) {
      customer.state = 'leaving';
      customer.stateT = 0;
      return 'done';
    }
    return null;
  }
  if (customer.state === 'leaving') {
    customer.arrive = Math.max(0, 1 - customer.stateT / ARRIVE_TIME);
    if (customer.arrive <= 0) return 'gone';
    return null;
  }
  return null;
}

// Mark a customer served: they are delighted, and stay to enjoy it.
export function serveCustomer(customer) {
  customer.state = 'delighted';
  customer.stateT = 0;
  customer.mood = 'delighted';
  customer.bounce = 0;
}

// Find the customer with this id among the ones at the counter.
export function customerById(customers, id) {
  return customers.find((c) => c.id === id) || null;
}
