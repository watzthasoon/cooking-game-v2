// The Copper Kettle v2 — the game itself. A state machine (title ->
// playing -> gameover) around a requestAnimationFrame loop. Every
// frame: advance the clock, tick the stations, the customers and the
// effects, then draw. All the game rules live in kitchen.js, orders.js
// and customers.js; this file only wires them together and reacts to
// what they report (sounds, sparkles, grade popups).

import { CANVAS_WIDTH, CANVAS_HEIGHT, CUSTOMER_STRIP, CUSTOMER_SLOT_W, CUSTOMER_SLOT_GAP } from './layout.js';
import { mulberry32 } from './random.js';
import { matchingDish } from './recipes.js';
import { makeStations, tickStations, clickStation, makePlate, addToPlate, removeLastFromPlate, clearPlate } from './kitchen.js';
import { makeEffects, spawnSparkles, spawnHearts, spawnBang, spawnSmoke, showGrade, flashScreen, updateEffects } from './effects.js';
import { tickCustomers, maybeSpawnCustomer, serveOrder, matchingCustomer } from './orders.js';
import { attachInput, stationRect, customerRect } from './input.js';
import { drawGame, drawTitle, drawGameOver } from './render.js';
import { ensureAudio, playStep, playServe, playPerfect, playMiss, playMistake, playArrive, playLevelUp, toggleMute } from './audio.js';
import { setupShot } from './shots.js';

// Clamp the frame delta so a slow frame (or a tab that was hidden)
// never jumps the kitchen forward by seconds at once.
const DT_CLAMP = 0.25;
// Three missed orders end the shift.
const MISSES_TO_END = 3;

function readSeed() {
  const m = /[?&]seed=(\d+)/.exec(location.search);
  return m ? Number(m[1]) : Math.floor(Math.random() * 1000000);
}

export function makeGame() {
  return {
    screen: 'title',
    time: 0,
    score: 0,
    served: 0,
    missed: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    rng: mulberry32(readSeed()),
    customers: [],
    stations: makeStations(),
    plate: makePlate(),
    fx: makeEffects(),
    serveTarget: null,
    spawnTimer: 1.0,
    highlight: -1,
  };
}

function resetGame(game) {
  const fresh = makeGame();
  Object.assign(game, fresh, { screen: 'playing', spawnTimer: 0.8 });
}

function customerCenter(customer) {
  const slotX = CUSTOMER_STRIP.x + customer.slot * (CUSTOMER_SLOT_W + CUSTOMER_SLOT_GAP);
  return { x: slotX + CUSTOMER_SLOT_W / 2, y: CUSTOMER_STRIP.y + 120 };
}

function stationCenter(i) {
  const r = stationRect(i);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

function startGame(game) {
  ensureAudio();
  resetGame(game);
}

function serve(game, customer) {
  const result = serveOrder(game, customer);
  const c = customerCenter(customer);
  playServe();
  if (result.leveledUp) playLevelUp();
  if (result.grade === 'wonderful') {
    playPerfect();
    spawnHearts(game.fx, c.x, c.y - 20, 10);
    spawnSparkles(game.fx, c.x, c.y, 18);
    flashScreen(game.fx, '#ffd93b');
  } else {
    spawnSparkles(game.fx, c.x, c.y, 12);
  }
  showGrade(game.fx, result.grade);
  clearPlate(game.plate);
  game.serveTarget = null;
}

function updatePlaying(game, dt) {
  game.time += dt;

  // Stations: grilling, frying, burning.
  for (const ev of tickStations(game.stations, dt)) {
    const pos = stationCenter(game.stations.indexOf(ev.station));
    if (ev.type === 'ready') {
      playStep();
      spawnSparkles(game.fx, pos.x, pos.y - 10, 8);
    } else if (ev.type === 'burnt') {
      playMistake();
      spawnBang(game.fx, pos.x, pos.y - 20);
      spawnSmoke(game.fx, pos.x, pos.y - 10, 6);
    }
  }

  // Customers: patience, moods, arrivals, departures.
  for (const ev of tickCustomers(game, dt)) {
    if (ev.type === 'expired') {
      const c = customerCenter(ev.customer);
      playMiss();
      showGrade(game.fx, 'tryagain');
      spawnBang(game.fx, c.x, c.y - 30);
    }
  }
  const arrived = maybeSpawnCustomer(game, dt);
  if (arrived) playArrive();

  // Which customer (if any) does the plate match right now?
  game.serveTarget = matchingCustomer(game);

  // Game over?
  if (game.missed >= MISSES_TO_END) {
    game.screen = 'gameover';
  }

  updateEffects(game.fx, dt);
}

function onStation(game, i) {
  if (game.screen !== 'playing') return;
  ensureAudio();
  const station = game.stations[i];
  const result = clickStation(game.stations, station);
  if (!result) return;
  const pos = stationCenter(i);
  if (result.type === 'added') {
    addToPlate(game.plate, result.id);
    playStep();
    spawnSparkles(game.fx, pos.x, pos.y - 10, 5);
  } else if (result.type === 'started') {
    playStep();
  } else if (result.type === 'chopped') {
    playStep();
    spawnSparkles(game.fx, pos.x, pos.y - 10, 4);
    if (result.done) addToPlate(game.plate, station.id);
  } else if (result.type === 'plated') {
    addToPlate(game.plate, station.id);
    playStep();
    spawnSparkles(game.fx, pos.x, pos.y - 10, 6);
  } else if (result.type === 'tossed') {
    playMistake();
    spawnBang(game.fx, pos.x, pos.y - 20);
  } else if (result.type === 'too-early') {
    playMistake();
  }
}

function onServe(game) {
  if (game.screen !== 'playing') return;
  ensureAudio();
  const target = game.serveTarget;
  if (target) {
    serve(game, target);
  } else {
    // Nothing matches: a gentle refusal, not a punishment.
    playMistake();
    const plate = { x: 540, y: 500 };
    spawnBang(game.fx, plate.x, plate.y - 60);
  }
}

function onCustomer(game, customer) {
  if (game.screen !== 'playing') return;
  ensureAudio();
  if (customer.state !== 'waiting') return;
  // Serve this customer directly, but only if the plate matches them.
  const dish = matchingDish(game.plate);
  if (dish && dish.id === customer.dish.id) {
    serve(game, customer);
  } else {
    playMistake();
    const c = customerCenter(customer);
    spawnBang(game.fx, c.x, c.y - 30);
  }
}

function onPlate(game) {
  if (game.screen !== 'playing') return;
  removeLastFromPlate(game.plate);
  playStep();
}

function onClear(game) {
  if (game.screen !== 'playing') return;
  clearPlate(game.plate);
  playStep();
}

export function boot() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const game = makeGame();
  // Expose the live state for the play-test (and for debugging).
  window.__game = game;

  // A deterministic screenshot state (?shot=name&seed=1) for shot.mjs.
  const shotMatch = /[?&]shot=([a-z]+)/.exec(location.search);
  if (shotMatch) {
    setupShot(game, shotMatch[1], readSeed());
  }

  attachInput(canvas, {
    onStation: (i) => onStation(game, i),
    onPlate: () => onPlate(game),
    onServe: () => onServe(game),
    onClear: () => onClear(game),
    onCustomer: (c) => onCustomer(game, c),
    onStart: () => startGame(game),
    onRestart: () => startGame(game),
    onMute: () => toggleMute(),
  }, () => game);

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(DT_CLAMP, (now - last) / 1000);
    last = now;
    try {
      if (game.screen === 'playing') updatePlaying(game, dt);
      else updateEffects(game.fx, dt);
      if (game.screen === 'title') drawTitle(ctx, game);
      else if (game.screen === 'gameover') drawGameOver(ctx, game);
      else drawGame(ctx, game);
    } catch (err) {
      // A drawing fault must never freeze the kitchen: log it and keep going.
      console.error(err);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return game;
}

if (typeof window !== 'undefined' && document.getElementById('game')) {
  boot();
}
