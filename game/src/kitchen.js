// The counter: eight ingredient stations and the plate. Each station
// knows its kind (instant, grill, fryer, chop) and its state. The plate
// holds the dish being built, bottom to top.
//
// Station states:
//   'idle'     — nothing happening, click to start (or add, for instant).
//   'cooking'  — grill/fryer running; click again when the bar is green.
//   'ready'    — cooked and waiting to be plated; click to add to plate.
//   'burnt'    — left too long; click to toss it (with a "!" and smoke).
//   'chopping' — a chop item is on the board; click to chop (2 chops).

import { INGREDIENTS, INGREDIENT_IDS } from './recipes.js';

// Grill / fryer timings, in seconds.
export const GRILL_TIME = 4;
export const GRILL_BURN = 9;
export const FRY_TIME = 5;
export const FRY_BURN = 10;
export const CHOPS_NEEDED = 2;

const STATION_DEFS = [
  { id: 'bun', name: 'Bun', key: '1', note: 'Click to add' },
  { id: 'patty', name: 'Patty', key: '2', note: 'Grill it!' },
  { id: 'lettuce', name: 'Lettuce', key: '3', note: 'Chop chop!' },
  { id: 'tomato', name: 'Tomato', key: '4', note: 'Chop chop!' },
  { id: 'cheese', name: 'Cheese', key: '5', note: 'Click to add' },
  { id: 'onion', name: 'Onion', key: '6', note: 'Chop chop!' },
  { id: 'fries', name: 'Fries', key: '7', note: 'Fry it!' },
  { id: 'drink', name: 'Drink', key: '8', note: 'Click to add' },
];

export function makeStations() {
  return STATION_DEFS.map((d) => ({
    ...d,
    kind: INGREDIENTS[d.id].kind,
    state: 'idle',
    progress: 0,
    chops: 0,
    // time the current cooking has been running.
    cookT: 0,
  }));
}

export function stationById(stations, id) {
  return stations.find((s) => s.id === id);
}

export function stationByKey(stations, key) {
  return stations.find((s) => s.key === key);
}

// Advance grill/fryer timers. Returns a list of events:
//   { type: 'ready', station } when food finishes cooking,
//   { type: 'burnt', station } when food burns.
export function tickStations(stations, dt) {
  const events = [];
  for (const s of stations) {
    if (s.state !== 'cooking') continue;
    s.cookT += dt;
    const burnAt = s.kind === 'grill' ? GRILL_BURN : FRY_BURN;
    const doneAt = s.kind === 'grill' ? GRILL_TIME : FRY_TIME;
    if (s.cookT >= burnAt) {
      s.state = 'burnt';
      s.progress = 1;
      events.push({ type: 'burnt', station: s });
    } else if (s.cookT >= doneAt) {
      if (s.state === 'cooking') {
        s.state = 'ready';
        s.progress = 1;
        events.push({ type: 'ready', station: s });
      }
    } else {
      s.progress = s.cookT / doneAt;
    }
  }
  return events;
}

// What happens when a station is clicked. Returns an event describing
// the result, so main.js can play the right sound and effect:
//   { type: 'added', id }        — an ingredient went on the plate.
//   { type: 'started', station } — grill/fryer started.
//   { type: 'chopped', station, done } — a chop landed (done = finished).
//   { type: 'plated', station }  — cooked food moved to the plate.
//   { type: 'tossed', station }  — burnt food thrown away.
//   { type: 'too-early', station } — clicked while still cooking.
//   null — nothing happened.
export function clickStation(stations, station) {
  const kind = station.kind;
  if (kind === 'instant') {
    return { type: 'added', id: station.id };
  }
  if (kind === 'grill' || kind === 'fryer') {
    if (station.state === 'idle') {
      station.state = 'cooking';
      station.cookT = 0;
      station.progress = 0;
      return { type: 'started', station };
    }
    if (station.state === 'ready') {
      station.state = 'idle';
      station.progress = 0;
      station.cookT = 0;
      return { type: 'plated', station };
    }
    if (station.state === 'burnt') {
      station.state = 'idle';
      station.progress = 0;
      station.cookT = 0;
      return { type: 'tossed', station };
    }
    // still cooking: too early.
    return { type: 'too-early', station };
  }
  // chop
  if (station.state === 'idle') {
    station.state = 'chopping';
    station.chops = 1;
    return { type: 'chopped', station, done: false };
  }
  if (station.state === 'chopping') {
    station.chops += 1;
    if (station.chops >= CHOPS_NEEDED) {
      station.state = 'idle';
      station.chops = 0;
      return { type: 'chopped', station, done: true };
    }
    return { type: 'chopped', station, done: false };
  }
  return null;
}

// The plate: a simple array of ingredient ids, bottom to top.
export function makePlate() {
  return [];
}

export function addToPlate(plate, id) {
  plate.push(id);
}

export function removeLastFromPlate(plate) {
  return plate.pop();
}

export function clearPlate(plate) {
  plate.length = 0;
}

// How many of an ingredient the plate holds (for the ticket chips).
export function plateCount(plate, id) {
  let n = 0;
  for (const x of plate) if (x === id) n += 1;
  return n;
}

// A station's one-line status for the counter ("Grilling…", "Ready!",
// "Burnt!", "Chop 1/2", or its hint when idle).
export function stationStatus(station) {
  if (station.state === 'cooking') return 'Cooking…';
  if (station.state === 'ready') return 'Ready!';
  if (station.state === 'burnt') return 'Burnt!';
  if (station.state === 'chopping') return `Chop ${station.chops}/2`;
  return station.note;
}

export { INGREDIENT_IDS };
