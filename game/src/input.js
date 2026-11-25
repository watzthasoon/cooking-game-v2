// Input: mouse clicks and keyboard. One place owns every clickable
// rectangle, so a click and a keypress can never disagree about what
// they do. The game (main.js) hands input a set of callbacks; input
// only decides *what* was hit and calls back with it.
//
// Clickable things: the 8 stations, the plate, SERVE, CLEAR, a
// customer (serve them directly), the start button, the restart button.
// Keys: 1–8 stations, S serve, C clear, Space start/restart, M mute,
// arrows cycle the highlighted station (Enter activates it).

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  STATION_COLS,
  STATION_ROWS,
  STATION_W,
  STATION_H,
  STATION_GAP_X,
  STATION_GAP_Y,
  COUNTER,
  PLATE_CENTER,
  PLATE_RADIUS,
  SERVE_BUTTON,
  CLEAR_BUTTON,
  CUSTOMER_STRIP,
  CUSTOMER_SLOT_W,
  CUSTOMER_SLOT_GAP,
} from './layout.js';

function inside(x, y, r) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

export function stationRect(index) {
  const col = index % STATION_COLS;
  const row = Math.floor(index / STATION_COLS);
  return {
    x: COUNTER.x + col * (STATION_W + STATION_GAP_X),
    y: COUNTER.y + row * (STATION_H + STATION_GAP_Y),
    w: STATION_W,
    h: STATION_H,
  };
}

// The rectangle a customer occupies in their slot (for clicking them).
// Head and body together, from just under the speech bubble to the
// counter band.
export function customerRect(slot) {
  const x = CUSTOMER_STRIP.x + slot * (CUSTOMER_SLOT_W + CUSTOMER_SLOT_GAP);
  return { x: x + 40, y: CUSTOMER_STRIP.y + 62, w: 120, h: 110 };
}

// The speech bubble above a customer (clicking it serves them too).
export function bubbleRect(slot) {
  const x = CUSTOMER_STRIP.x + slot * (CUSTOMER_SLOT_W + CUSTOMER_SLOT_GAP);
  return { x: x + 16, y: CUSTOMER_STRIP.y + 4, w: 168, h: 58 };
}

export function plateHit(x, y) {
  const dx = x - PLATE_CENTER.x;
  const dy = y - PLATE_CENTER.y;
  return dx * dx + dy * dy <= PLATE_RADIUS * PLATE_RADIUS;
}

// Attach input to a canvas. `actions` is the set of callbacks the game
// provides: onStation(i), onPlate(), onServe(), onClear(), onCustomer(c),
// onStart(), onRestart(), onMute(). `getState` returns the game's live
// state so input knows which screen is showing and which customers are
// out. Returns a cleanup function.
export function attachInput(canvas, actions, getState) {
  function toCanvas(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  }

  function onClick(e) {
    const { x, y } = toCanvas(e);
    const game = getState();
    if (!game) return;
    if (game.screen === 'title') {
      actions.onStart();
      return;
    }
    if (game.screen === 'gameover') {
      actions.onRestart();
      return;
    }
    // A customer (or their bubble) — serve them directly.
    for (const c of game.customers) {
      if (c.state !== 'waiting') continue;
      if (inside(x, y, customerRect(c.slot)) || inside(x, y, bubbleRect(c.slot))) {
        actions.onCustomer(c);
        return;
      }
    }
    // Stations.
    for (let i = 0; i < STATION_COLS * STATION_ROWS; i++) {
      if (inside(x, y, stationRect(i))) {
        actions.onStation(i);
        return;
      }
    }
    if (inside(x, y, SERVE_BUTTON)) {
      actions.onServe();
      return;
    }
    if (inside(x, y, CLEAR_BUTTON)) {
      actions.onClear();
      return;
    }
    if (plateHit(x, y)) {
      actions.onPlate();
    }
  }

  function onKey(e) {
    const game = getState();
    if (!game) return;
    const k = e.key;
    if (k === ' ' || k === 'Enter') {
      if (game.screen === 'title') actions.onStart();
      else if (game.screen === 'gameover') actions.onRestart();
      else if (game.highlight >= 0) actions.onStation(game.highlight);
      e.preventDefault();
      return;
    }
    if (game.screen !== 'playing') return;
    if (k >= '1' && k <= '8') {
      actions.onStation(Number(k) - 1);
      return;
    }
    const lower = k.toLowerCase();
    if (lower === 's') actions.onServe();
    else if (lower === 'c') actions.onClear();
    else if (lower === 'm') actions.onMute();
    else if (k === 'ArrowLeft' || k === 'ArrowRight') {
      const dir = k === 'ArrowLeft' ? -1 : 1;
      const n = STATION_COLS * STATION_ROWS;
      game.highlight = ((game.highlight + dir) % n + n) % n;
      e.preventDefault();
    }
  }

  canvas.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);
  return () => {
    canvas.removeEventListener('click', onClick);
    window.removeEventListener('keydown', onKey);
  };
}
