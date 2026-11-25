// The menu: eight ingredients and seven original dishes. A dish is an
// exact multiset of ingredients — the plate must hold exactly those, in
// any order, to match a ticket. Points are the dish's base score; the
// time bonus and combo multiplier are applied on top in orders.js.

// Every ingredient knows its station kind, its colour, and how it is drawn.
export const INGREDIENTS = {
  bun:     { name: 'Bun',     kind: 'instant', color: '#e8a54b', dark: '#b97e2e', label: 'BUN' },
  patty:   { name: 'Patty',   kind: 'grill',   color: '#8a5a2b', dark: '#5d3a17', label: 'PATTY' },
  lettuce: { name: 'Lettuce', kind: 'chop',    color: '#7ed957', dark: '#4da32e', label: 'LETTUCE' },
  tomato:  { name: 'Tomato',  kind: 'chop',    color: '#ff5a4e', dark: '#c22e24', label: 'TOMATO' },
  cheese:  { name: 'Cheese',  kind: 'instant', color: '#ffd93b', dark: '#d9a400', label: 'CHEESE' },
  onion:   { name: 'Onion',   kind: 'chop',    color: '#c9a7eb', dark: '#8e6bb8', label: 'ONION' },
  fries:   { name: 'Fries',   kind: 'fryer',   color: '#ffc93c', dark: '#d99a00', label: 'FRIES' },
  drink:   { name: 'Drink',   kind: 'instant', color: '#ff7eb9', dark: '#c74f88', label: 'DRINK' },
};

export const INGREDIENT_IDS = Object.keys(INGREDIENTS);

// The seven dishes on the menu. `items` is the exact multiset the plate
// must hold. `blurb` is the one-line description on the recipe book.
export const DISHES = [
  {
    id: 'sunrise',
    name: 'Sunrise Burger',
    items: ['bun', 'patty', 'cheese', 'lettuce'],
    points: 100,
    blurb: 'Bun, patty, cheese, lettuce',
  },
  {
    id: 'classic',
    name: 'Classic Burger',
    items: ['bun', 'patty', 'tomato', 'onion'],
    points: 100,
    blurb: 'Bun, patty, tomato, onion',
  },
  {
    id: 'cheesy',
    name: 'Cheesy Melt',
    items: ['bun', 'patty', 'cheese', 'cheese'],
    points: 110,
    blurb: 'Bun, patty, double cheese',
  },
  {
    id: 'garden',
    name: 'Garden Stack',
    items: ['bun', 'lettuce', 'tomato', 'onion'],
    points: 120,
    blurb: 'Bun, lettuce, tomato, onion',
  },
  {
    id: 'salad',
    name: 'Fresh Garden Salad',
    items: ['lettuce', 'tomato', 'onion'],
    points: 80,
    blurb: 'Lettuce, tomato, onion',
  },
  {
    id: 'basket',
    name: 'Crispy Basket',
    items: ['fries', 'drink'],
    points: 60,
    blurb: 'Fries and a drink',
  },
  {
    id: 'feast',
    name: 'Kettle Feast',
    items: ['bun', 'patty', 'cheese', 'tomato', 'fries', 'drink'],
    points: 160,
    blurb: 'The works: burger, fries, drink',
  },
];

export function dishById(id) {
  return DISHES.find((d) => d.id === id);
}

// Does the plate (an array of ingredient ids) hold exactly the dish's
// items, in any order? A plate with extra items never matches.
export function plateMatchesDish(plate, dish) {
  if (plate.length !== dish.items.length) return false;
  const counts = {};
  for (const id of plate) counts[id] = (counts[id] || 0) + 1;
  for (const id of dish.items) {
    if (!counts[id]) return false;
    counts[id] -= 1;
  }
  return true;
}

// The dish the plate matches right now, or null when it matches nothing.
export function matchingDish(plate) {
  for (const dish of DISHES) {
    if (plateMatchesDish(plate, dish)) return dish;
  }
  return null;
}

// The menu's dishes sorted by points, highest first (for the recipe
// book's "most valuable" line and for picking harder orders later).
export function dishesByPoints() {
  return [...DISHES].sort((a, b) => b.points - a.points);
}
