// Everything on screen, drawn on the canvas. Food, customers and
// effects are all drawn from paths — no image files. One file owns
// every drawing helper, so the kitchen has a single look: warm wood,
// cream tiles, chunky rounded panels, and big readable feedback.

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  HEADER,
  CUSTOMER_STRIP,
  CUSTOMER_SLOT_W,
  CUSTOMER_SLOT_GAP,
  BUBBLE,
  BOARD,
  TICKET_HEIGHT,
  TICKET_GAP,
  COUNTER,
  STATION_COLS,
  STATION_ROWS,
  PLATE_AREA,
  PLATE_CENTER,
  PLATE_RADIUS,
  SERVE_BUTTON,
  CLEAR_BUTTON,
  RECIPES,
  GRADE_POPUP,
} from './layout.js';
import { INGREDIENTS, DISHES } from './recipes.js';
import { stationRect, customerRect, bubbleRect } from './input.js';
import { gradeScale } from './effects.js';

// ---------- small helpers ----------

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function text(ctx, s, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight || '700'} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

// A four-point star (sparkle).
export function drawStar(ctx, x, y, r, rot, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot || 0);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rad = i % 2 === 0 ? r : r * 0.32;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// A heart.
export function drawHeart(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 10, size / 10);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.bezierCurveTo(-7, -4, -3, -9, 0, -4);
  ctx.bezierCurveTo(3, -9, 7, -4, 0, 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ---------- food icons ----------

export function drawFoodIcon(ctx, id, cx, cy, size) {
  const ing = INGREDIENTS[id];
  const s = size / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    ctx.fillStyle = '#e8a54b';
    ctx.beginPath();
    ctx.arc(0, -s * 0.15, s * 0.85, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c98a35';
    roundRect(ctx, -s * 0.85, s * 0.25, s * 1.7, s * 0.45, s * 0.2);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    circle(ctx, -s * 0.35, -s * 0.5, s * 0.1);
    circle(ctx, s * 0.2, -s * 0.62, s * 0.1);
    circle(ctx, s * 0.45, -s * 0.35, s * 0.08);
  } else if (id === 'patty') {
    ctx.fillStyle = '#8a5a2b';
    roundRect(ctx, -s, -s * 0.4, s * 2, s * 0.8, s * 0.35);
    ctx.fill();
    ctx.fillStyle = '#6b4420';
    circle(ctx, -s * 0.4, 0, s * 0.12);
    circle(ctx, s * 0.3, -s * 0.1, s * 0.12);
    circle(ctx, 0, s * 0.15, s * 0.1);
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#7ed957';
    ctx.beginPath();
    ctx.moveTo(-s, s * 0.3);
    ctx.quadraticCurveTo(-s * 0.5, -s, 0, -s * 0.2);
    ctx.quadraticCurveTo(s * 0.5, -s, s, s * 0.3);
    ctx.quadraticCurveTo(0, s * 0.7, -s, s * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4da32e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.2);
    ctx.lineTo(0, s * 0.5);
    ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = '#ff5a4e';
    circle(ctx, 0, s * 0.1, s * 0.85);
    ctx.fillStyle = '#4da32e';
    drawStar(ctx, 0, -s * 0.55, s * 0.4, 0, '#4da32e');
  } else if (id === 'cheese') {
    ctx.fillStyle = '#ffd93b';
    ctx.beginPath();
    ctx.moveTo(-s, s * 0.6);
    ctx.lineTo(s, s * 0.6);
    ctx.lineTo(0, -s * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d9a400';
    circle(ctx, -s * 0.25, s * 0.25, s * 0.14);
    circle(ctx, s * 0.2, s * 0.05, s * 0.12);
  } else if (id === 'onion') {
    ctx.strokeStyle = '#c9a7eb';
    ctx.lineWidth = s * 0.28;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, s * (0.85 - i * 0.28), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = '#8e6bb8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2);
    ctx.stroke();
  } else if (id === 'fries') {
    ctx.fillStyle = '#ffc93c';
    for (let i = -1; i <= 1; i++) {
      roundRect(ctx, i * s * 0.55 - s * 0.2, -s * 0.9, s * 0.4, s * 1.3, s * 0.12);
      ctx.fill();
    }
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.moveTo(-s * 0.9, -s * 0.1);
    ctx.lineTo(s * 0.9, -s * 0.1);
    ctx.lineTo(s * 0.7, s * 0.9);
    ctx.lineTo(-s * 0.7, s * 0.9);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'drink') {
    ctx.fillStyle = '#ff7eb9';
    ctx.beginPath();
    ctx.moveTo(-s * 0.6, -s * 0.6);
    ctx.lineTo(s * 0.6, -s * 0.6);
    ctx.lineTo(s * 0.45, s * 0.85);
    ctx.lineTo(-s * 0.45, s * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    roundRect(ctx, -s * 0.75, -s * 0.75, s * 1.5, s * 0.25, s * 0.1);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = s * 0.18;
    ctx.beginPath();
    ctx.moveTo(s * 0.2, -s * 0.7);
    ctx.lineTo(s * 0.45, -s * 1.1);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- customers ----------

// Draw one customer in their slot. `slotX` is the left edge of the
// slot; the customer stands centred in it. The face changes with the
// mood: happy eyes and blush when delighted, a sweat drop when
// impatient, a tear when sad, steam when angry.
export function drawCustomer(ctx, customer, slotX, baseY) {
  const def = customer.def;
  const cx = slotX + CUSTOMER_SLOT_W / 2;
  const bob = customer.bounce || 0;
  const bodyY = baseY + 62 + bob;
  const headY = bodyY - 34;
  const slide = (1 - customer.arrive) * 160;
  const x = cx + slide;

  // Body (shirt).
  ctx.fillStyle = def.shirt;
  roundRect(ctx, x - 42, bodyY - 6, 84, 52, 18);
  ctx.fill();
  ctx.fillStyle = def.shirtDark;
  roundRect(ctx, x - 42, bodyY + 34, 84, 12, 6);
  ctx.fill();
  // Arms.
  ctx.fillStyle = def.shirt;
  circle(ctx, x - 44, bodyY + 12, 10);
  circle(ctx, x + 44, bodyY + 12, 10);

  // Head.
  ctx.fillStyle = def.skin;
  circle(ctx, x, headY, 30);

  // Hair, by style.
  ctx.fillStyle = def.hair;
  if (def.hairStyle === 'bun') {
    ctx.beginPath();
    ctx.arc(x, headY - 6, 30, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    circle(ctx, x, headY - 32, 12);
    ctx.fillStyle = '#fff';
    circle(ctx, x, headY - 32, 4);
  } else if (def.hairStyle === 'cap') {
    ctx.beginPath();
    ctx.arc(x, headY - 4, 30, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2980b9';
    roundRect(ctx, x - 30, headY - 12, 60, 10, 5);
    ctx.fill();
  } else if (def.hairStyle === 'bob') {
    ctx.beginPath();
    ctx.arc(x, headY - 2, 31, Math.PI * 0.95, Math.PI * 2.05);
    ctx.closePath();
    ctx.fill();
    roundRect(ctx, x - 31, headY - 8, 12, 26, 6);
    ctx.fill();
    roundRect(ctx, x + 19, headY - 8, 12, 26, 6);
    ctx.fill();
  } else if (def.hairStyle === 'spiky') {
    ctx.beginPath();
    ctx.moveTo(x - 28, headY - 6);
    for (let i = 0; i <= 6; i++) {
      const px = x - 28 + (i * 56) / 6;
      ctx.lineTo(px, headY - 6 - (i % 2 === 0 ? 18 : 6));
    }
    ctx.lineTo(x + 28, headY - 6);
    ctx.closePath();
    ctx.fill();
  } else if (def.hairStyle === 'long') {
    ctx.beginPath();
    ctx.arc(x, headY - 4, 31, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    roundRect(ctx, x - 32, headY - 6, 14, 52, 7);
    ctx.fill();
    roundRect(ctx, x + 18, headY - 6, 14, 52, 7);
    ctx.fill();
  }

  // Face, by mood.
  const mood = customer.mood;
  ctx.fillStyle = '#2d3436';
  if (mood === 'delighted') {
    // Happy closed eyes (^^) and a big open smile.
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x - 12, headY + 2, 6, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 12, headY + 2, 6, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.arc(x, headY + 12, 9, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    // Blush.
    ctx.fillStyle = 'rgba(255, 120, 140, 0.7)';
    circle(ctx, x - 20, headY + 8, 5);
    circle(ctx, x + 20, headY + 8, 5);
  } else if (mood === 'sad' || mood === 'angry') {
    // Droopy eyes and a frown, plus a tear when sad.
    ctx.beginPath();
    ctx.arc(x - 12, headY + 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 12, headY + 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, headY + 22, 8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    if (mood === 'sad') {
      ctx.fillStyle = '#74b9ff';
      ctx.beginPath();
      ctx.arc(x - 18, headY + 12, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Angry: red tint and steam.
      ctx.fillStyle = 'rgba(255, 80, 60, 0.25)';
      circle(ctx, x, headY, 30);
      ctx.strokeStyle = '#b2bec3';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x - 14, headY - 34, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 10, headY - 38, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Angry eyebrows.
    if (mood === 'angry') {
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 18, headY - 8);
      ctx.lineTo(x - 6, headY - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 18, headY - 8);
      ctx.lineTo(x + 6, headY - 4);
      ctx.stroke();
    }
  } else {
    // Waiting / excited / impatient: open eyes, small smile.
    circle(ctx, x - 12, headY + 2, 3.5);
    circle(ctx, x + 12, headY + 2, 3.5);
    if (mood === 'excited') {
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.arc(x, headY + 12, 7, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, headY + 8, 7, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
    if (mood === 'impatient') {
      // Worried eyebrows and a sweat drop.
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 18, headY - 10);
      ctx.lineTo(x - 6, headY - 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 18, headY - 10);
      ctx.lineTo(x + 6, headY - 6);
      ctx.stroke();
      ctx.fillStyle = '#74b9ff';
      ctx.beginPath();
      ctx.arc(x + 26, headY - 14, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Glasses.
  if (def.glasses) {
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - 12, headY + 2, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 12, headY + 2, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 4, headY + 2);
    ctx.lineTo(x + 4, headY + 2);
    ctx.stroke();
  }
}

// The speech bubble above a customer: who they are, the dish they
// want, and a patience bar that drains green -> amber -> red.
export function drawBubble(ctx, customer, slotX) {
  const r = bubbleRect(customer.slot);
  const dish = customer.dish;
  const frac = Math.max(0, customer.patience / customer.maxPatience);
  const barColor = frac > 0.5 ? '#7ed957' : frac > 0.25 ? '#ffb703' : '#ff5a4e';

  ctx.fillStyle = '#fffdf5';
  ctx.strokeStyle = '#e0a458';
  ctx.lineWidth = 2.5;
  roundRect(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fill();
  ctx.stroke();
  // Bubble tail.
  ctx.fillStyle = '#fffdf5';
  ctx.beginPath();
  ctx.moveTo(r.x + r.w / 2 - 10, r.y + r.h - 2);
  ctx.lineTo(r.x + r.w / 2 + 10, r.y + r.h - 2);
  ctx.lineTo(r.x + r.w / 2, r.y + r.h + 12);
  ctx.closePath();
  ctx.fill();

  text(ctx, `${customer.def.name} wants`, r.x + 12, r.y + 10, 11, '#8d6e63', '700', 'left');
  drawFoodIcon(ctx, dish.items[0], r.x + 20, r.y + 30, 26);
  text(ctx, dish.name, r.x + 38, r.y + 30, 14, '#3d2b1f', '800', 'left');
  // Patience bar.
  ctx.fillStyle = '#e8e0d0';
  roundRect(ctx, r.x + 12, r.y + r.h - 12, r.w - 24, 7, 3.5);
  ctx.fill();
  ctx.fillStyle = barColor;
  roundRect(ctx, r.x + 12, r.y + r.h - 12, (r.w - 24) * frac, 7, 3.5);
  ctx.fill();
  text(ctx, `${Math.ceil(customer.patience)}s`, r.x + r.w - 8, r.y + r.h - 8, 10, '#5d4037', '700', 'right');
}

// ---------- order board ----------

export function drawTicket(ctx, customer, x, y, w, h) {
  const dish = customer.dish;
  const frac = Math.max(0, customer.patience / customer.maxPatience);
  const barColor = frac > 0.5 ? '#7ed957' : frac > 0.25 ? '#ffb703' : '#ff5a4e';
  const urgent = frac < 0.3;

  ctx.fillStyle = '#fffdf5';
  ctx.strokeStyle = urgent ? '#ff5a4e' : '#e0a458';
  ctx.lineWidth = urgent ? 3 : 2;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();
  // Customer colour strip.
  ctx.fillStyle = customer.def.shirt;
  roundRect(ctx, x, y, 10, h, 6);
  ctx.fill();

  text(ctx, `${customer.def.name} wants`, x + 20, y + 16, 12, '#8d6e63', '700', 'left');
  text(ctx, dish.name, x + 20, y + 36, 17, '#3d2b1f', '800', 'left');
  // Ingredient chips: icons in a row, names wrapped beneath.
  const chips = dish.items;
  let cx = x + 20;
  const cy = y + 66;
  for (const id of chips) {
    drawFoodIcon(ctx, id, cx + 13, cy, 26);
    cx += 30;
  }
  const names = chips.map((id) => INGREDIENTS[id].name).join(' + ');
  text(ctx, names, x + 20, y + 92, 12, '#5d4037', '600', 'left');
  // Patience bar with seconds.
  ctx.fillStyle = '#e8e0d0';
  roundRect(ctx, x + 20, y + h - 26, w - 40, 10, 5);
  ctx.fill();
  ctx.fillStyle = barColor;
  roundRect(ctx, x + 20, y + h - 26, (w - 40) * frac, 10, 5);
  ctx.fill();
  text(ctx, `${Math.ceil(customer.patience)}s left`, x + w - 20, y + h - 21, 11, urgent ? '#ff5a4e' : '#5d4037', '700', 'right');
}

// ---------- stations and plate ----------

export function drawStation(ctx, station, rect, highlighted) {
  const ing = INGREDIENTS[station.id];
  const cooking = station.state === 'cooking';
  const ready = station.state === 'ready';
  const burnt = station.state === 'burnt';
  const chopping = station.state === 'chopping';

  ctx.fillStyle = highlighted ? '#fff3d6' : '#fffdf5';
  ctx.strokeStyle = ready ? '#7ed957' : burnt ? '#ff5a4e' : '#e0a458';
  ctx.lineWidth = ready || burnt ? 3 : 2;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();
  ctx.stroke();

  drawFoodIcon(ctx, station.id, rect.x + rect.w / 2, rect.y + 40, 52);
  text(ctx, ing.name, rect.x + rect.w / 2, rect.y + 76, 14, '#3d2b1f', '800');
  text(ctx, `[${station.key}] ${station.note}`, rect.x + rect.w / 2, rect.y + 96, 11, '#8d6e63', '600');

  if (cooking || ready) {
    const doneAt = station.kind === 'grill' ? 4 : 5;
    const frac = Math.min(1, station.cookT / doneAt);
    ctx.fillStyle = '#e8e0d0';
    roundRect(ctx, rect.x + 14, rect.y + rect.h - 14, rect.w - 28, 8, 4);
    ctx.fill();
    ctx.fillStyle = ready ? '#7ed957' : '#ffb703';
    roundRect(ctx, rect.x + 14, rect.y + rect.h - 14, (rect.w - 28) * frac, 8, 4);
    ctx.fill();
    if (ready) text(ctx, 'READY!', rect.x + rect.w / 2, rect.y + 18, 13, '#4da32e', '800');
  }
  if (burnt) {
    text(ctx, 'BURNT!', rect.x + rect.w / 2, rect.y + 18, 13, '#ff5a4e', '800');
    text(ctx, 'click to toss', rect.x + rect.w / 2, rect.y + rect.h - 24, 10, '#8d6e63', '600');
  }
  if (chopping) {
    text(ctx, `Chop ${station.chops}/2`, rect.x + rect.w / 2, rect.y + 18, 13, '#e67e22', '800');
  }
}

export function drawPlate(ctx, plate) {
  // The plate itself.
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#d7ccc8';
  ctx.lineWidth = 3;
  circle(ctx, PLATE_CENTER.x, PLATE_CENTER.y, PLATE_RADIUS);
  ctx.stroke();
  ctx.fillStyle = '#f5f0e6';
  circle(ctx, PLATE_CENTER.x, PLATE_CENTER.y, PLATE_RADIUS - 14);

  if (plate.length === 0) {
    text(ctx, 'Your plate', PLATE_CENTER.x, PLATE_CENTER.y - 8, 15, '#bcaaa4', '700');
    text(ctx, 'click a station to add', PLATE_CENTER.x, PLATE_CENTER.y + 14, 11, '#bcaaa4', '600');
    return;
  }
  // Stack the dish bottom to top, each layer a little higher.
  const n = plate.length;
  plate.forEach((id, i) => {
    const y = PLATE_CENTER.y + 34 - i * 16;
    const w = 110 - i * 4;
    ctx.save();
    ctx.translate(PLATE_CENTER.x, y);
    ctx.scale(w / 110, 1);
    drawFoodIcon(ctx, id, 0, 0, 60);
    ctx.restore();
  });
  text(ctx, `${n} item${n === 1 ? '' : 's'}`, PLATE_CENTER.x, PLATE_CENTER.y + 62, 12, '#8d6e63', '700');
}

// ---------- header, buttons, effects ----------

export function drawHeader(ctx, game) {
  ctx.fillStyle = '#ff8f5c';
  ctx.fillRect(HEADER.x, HEADER.y, HEADER.w, HEADER.h);
  ctx.fillStyle = '#e76f51';
  ctx.fillRect(HEADER.x, HEADER.y + HEADER.h - 4, HEADER.w, 4);
  text(ctx, 'THE COPPER KETTLE', 20, HEADER.y + 24, 22, '#fff', '800', 'left');
  text(ctx, `SCORE ${game.score}`, 330, HEADER.y + 24, 18, '#fff', '800', 'left');
  text(ctx, `LEVEL ${game.level}`, 520, HEADER.y + 24, 16, '#ffe8d6', '700', 'left');
  text(ctx, `SERVED ${game.served}`, 640, HEADER.y + 24, 16, '#ffe8d6', '700', 'left');
  text(ctx, `MISSED ${game.missed}/3`, 780, HEADER.y + 24, 16, '#ffe8d6', '700', 'left');

  // Combo meter: a bar that fills with the combo, plus a flame label.
  const comboFrac = Math.min(1, game.combo / 5);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  roundRect(ctx, 920, HEADER.y + 12, 180, 24, 12);
  ctx.fill();
  if (game.combo > 0) {
    ctx.fillStyle = game.combo >= 3 ? '#ffd93b' : '#ffb703';
    roundRect(ctx, 920, HEADER.y + 12, 180 * comboFrac, 24, 12);
    ctx.fill();
  }
  text(ctx, game.combo > 0 ? `COMBO x${game.combo}` : 'COMBO', 1010, HEADER.y + 24, 14, '#fff', '800');
  text(ctx, 'M: mute', 1150, HEADER.y + 24, 12, '#ffe8d6', '600', 'left');
}

export function drawButtons(ctx, game, canServe, serveDish) {
  // SERVE.
  ctx.fillStyle = canServe ? '#7ed957' : '#cfc8bd';
  ctx.strokeStyle = canServe ? '#4da32e' : '#a89f91';
  ctx.lineWidth = 3;
  roundRect(ctx, SERVE_BUTTON.x, SERVE_BUTTON.y, SERVE_BUTTON.w, SERVE_BUTTON.h, 14);
  ctx.fill();
  ctx.stroke();
  if (canServe) {
    text(ctx, 'SERVE!', SERVE_BUTTON.x + SERVE_BUTTON.w / 2, SERVE_BUTTON.y + 22, 22, '#fff', '800');
    text(ctx, serveDish.name, SERVE_BUTTON.x + SERVE_BUTTON.w / 2, SERVE_BUTTON.y + 46, 13, '#fff', '700');
  } else {
    text(ctx, 'SERVE', SERVE_BUTTON.x + SERVE_BUTTON.w / 2, SERVE_BUTTON.y + 30, 20, '#fff', '800');
  }
  // CLEAR.
  ctx.fillStyle = '#fffdf5';
  ctx.strokeStyle = '#e0a458';
  ctx.lineWidth = 2;
  roundRect(ctx, CLEAR_BUTTON.x, CLEAR_BUTTON.y, CLEAR_BUTTON.w, CLEAR_BUTTON.h, 12);
  ctx.fill();
  ctx.stroke();
  text(ctx, 'CLEAR PLATE [C]', CLEAR_BUTTON.x + CLEAR_BUTTON.w / 2, CLEAR_BUTTON.y + 22, 13, '#8d6e63', '700');
}

export function drawEffects(ctx, fx) {
  for (const p of fx.particles) {
    const a = Math.max(0, 1 - p.t / p.life);
    ctx.globalAlpha = a;
    if (p.kind === 'star') {
      drawStar(ctx, p.x, p.y, p.size, p.rot, p.color);
    } else if (p.kind === 'heart') {
      drawHeart(ctx, p.x, p.y, p.size, p.color);
    } else if (p.kind === 'bang') {
      text(ctx, '!', p.x, p.y, p.size, p.color, '800');
    } else if (p.kind === 'smoke') {
      ctx.fillStyle = p.color;
      circle(ctx, p.x, p.y, p.size * (1 + p.t));
    }
  }
  ctx.globalAlpha = 1;
  // Grade popup.
  if (fx.grade) {
    const scale = gradeScale(fx);
    if (scale > 0) {
      ctx.save();
      ctx.translate(GRADE_POPUP.x, GRADE_POPUP.y);
      ctx.scale(scale, scale);
      ctx.fillStyle = 'rgba(255, 253, 245, 0.95)';
      ctx.strokeStyle = fx.grade.color;
      ctx.lineWidth = 4;
      roundRect(ctx, -GRADE_POPUP.w / 2, -GRADE_POPUP.h / 2, GRADE_POPUP.w, GRADE_POPUP.h, 24);
      ctx.fill();
      ctx.stroke();
      drawStar(ctx, -GRADE_POPUP.w / 2 + 26, -GRADE_POPUP.h / 2 + 26, 16, 0.4, '#ffd93b');
      drawStar(ctx, GRADE_POPUP.w / 2 - 26, -GRADE_POPUP.h / 2 + 26, 12, 0.9, '#ff9f1c');
      drawStar(ctx, GRADE_POPUP.w / 2 - 30, GRADE_POPUP.h / 2 - 24, 14, 0.2, '#ffd93b');
      text(ctx, fx.grade.text, 0, -16, 44, fx.grade.color, '800');
      text(ctx, fx.grade.sub, 0, 32, 18, '#5d4037', '700');
      ctx.restore();
    }
  }
  // Screen flash.
  if (fx.flash > 0) {
    ctx.globalAlpha = fx.flash;
    ctx.fillStyle = fx.flashColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = 1;
  }
}

// ---------- screens and the main draw ----------

export function drawBackground(ctx) {
  // Warm cream wall with a wood counter band.
  ctx.fillStyle = '#fff8e7';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#ffe8c9';
  for (let x = 0; x < CANVAS_WIDTH; x += 64) {
    ctx.fillRect(x, 48, 2, CANVAS_HEIGHT - 48);
  }
  // The counter band the customers stand behind.
  ctx.fillStyle = '#d7a86a';
  ctx.fillRect(CUSTOMER_STRIP.x - 8, CUSTOMER_STRIP.y + 164, CUSTOMER_STRIP.w + 16, 14);
  ctx.fillStyle = '#b98a4e';
  ctx.fillRect(CUSTOMER_STRIP.x - 8, CUSTOMER_STRIP.y + 174, CUSTOMER_STRIP.w + 16, 4);
}

export function drawRecipeBook(ctx) {
  ctx.fillStyle = '#fffdf5';
  ctx.strokeStyle = '#e0a458';
  ctx.lineWidth = 2;
  roundRect(ctx, RECIPES.x, RECIPES.y, RECIPES.w, RECIPES.h, 12);
  ctx.fill();
  ctx.stroke();
  text(ctx, 'RECIPE BOOK', RECIPES.x + RECIPES.w / 2, RECIPES.y + 20, 15, '#3d2b1f', '800');
  let y = RECIPES.y + 44;
  for (const dish of DISHES) {
    text(ctx, dish.name, RECIPES.x + 14, y, 13, '#3d2b1f', '800', 'left');
    text(ctx, `${dish.points} pts`, RECIPES.x + RECIPES.w - 14, y, 11, '#8d6e63', '700', 'right');
    y += 18;
    let cx = RECIPES.x + 14;
    for (const id of dish.items) {
      drawFoodIcon(ctx, id, cx + 9, y + 8, 18);
      cx += 22;
    }
    text(ctx, dish.blurb, cx + 4, y + 8, 11, '#8d6e63', '600', 'left');
    y += 30;
  }
  text(ctx, 'HOW TO PLAY', RECIPES.x + RECIPES.w / 2, y + 6, 13, '#3d2b1f', '800');
  text(ctx, 'Click a station (or press 1-8) to add it.', RECIPES.x + 14, y + 28, 12, '#5d4037', '600', 'left');
  text(ctx, 'Grill the patty, fry the fries, chop the veg.', RECIPES.x + 14, y + 46, 12, '#5d4037', '600', 'left');
  text(ctx, 'Build the dish, then SERVE (S) or click', RECIPES.x + 14, y + 64, 12, '#5d4037', '600', 'left');
  text(ctx, 'the customer. 3 misses end the shift!', RECIPES.x + 14, y + 82, 12, '#5d4037', '600', 'left');
}

export function drawTitle(ctx, game) {
  drawBackground(ctx);
  // A few decorative customers peeking over the counter.
  const demo = [
    { def: { id: 'maya', name: 'Maya', skin: '#f2c89b', hair: '#c0392b', hairStyle: 'bun', shirt: '#f1c40f', shirtDark: '#c9a227' }, mood: 'excited', arrive: 1, bounce: 0 },
    { def: { id: 'bobo', name: 'Bobo', skin: '#e8b88a', hair: '#2c3e50', hairStyle: 'cap', shirt: '#27ae60', shirtDark: '#1e8449' }, mood: 'delighted', arrive: 1, bounce: 0 },
    { def: { id: 'luna', name: 'Luna', skin: '#f5d0a9', hair: '#8e44ad', hairStyle: 'bob', shirt: '#e84393', shirtDark: '#b83278', glasses: true }, mood: 'waiting', arrive: 1, bounce: 0 },
  ];
  demo.forEach((c, i) => {
    const slotX = CUSTOMER_STRIP.x + i * (CUSTOMER_SLOT_W + CUSTOMER_SLOT_GAP);
    drawCustomer(ctx, c, slotX, CUSTOMER_STRIP.y + 64);
  });
  // Title card.
  ctx.fillStyle = 'rgba(255, 253, 245, 0.96)';
  ctx.strokeStyle = '#e0a458';
  ctx.lineWidth = 3;
  roundRect(ctx, 340, 260, 600, 300, 24);
  ctx.fill();
  ctx.stroke();
  drawStar(ctx, 380, 300, 18, 0.3, '#ffd93b');
  drawStar(ctx, 900, 300, 14, 0.8, '#ff9f1c');
  text(ctx, 'THE COPPER KETTLE', 640, 320, 40, '#e76f51', '800');
  text(ctx, 'A cosy kitchen rush — with real customers!', 640, 362, 18, '#5d4037', '700');
  text(ctx, 'Customers walk in and order. Cook their dish,', 640, 398, 15, '#8d6e63', '600');
  text(ctx, 'serve it before their patience runs out,', 640, 420, 15, '#8d6e63', '600');
  text(ctx, 'and make them smile!', 640, 442, 15, '#8d6e63', '600');
  ctx.fillStyle = '#7ed957';
  roundRect(ctx, 490, 470, 300, 56, 16);
  ctx.fill();
  text(ctx, 'START COOKING', 640, 498, 22, '#fff', '800');
  text(ctx, 'Click or press Space — 1-8 cook, S serves, C clears', 640, 540, 13, '#8d6e63', '600');
}

export function drawGameOver(ctx, game) {
  drawBackground(ctx);
  ctx.fillStyle = 'rgba(255, 253, 245, 0.96)';
  ctx.strokeStyle = '#e0a458';
  ctx.lineWidth = 3;
  roundRect(ctx, 380, 200, 520, 320, 24);
  ctx.fill();
  ctx.stroke();
  text(ctx, 'SHIFT OVER!', 640, 250, 36, '#e76f51', '800');
  text(ctx, `Score: ${game.score}`, 640, 310, 24, '#3d2b1f', '800');
  text(ctx, `Dishes served: ${game.served}`, 640, 348, 18, '#5d4037', '700');
  text(ctx, `Best combo: x${game.bestCombo}`, 640, 376, 18, '#5d4037', '700');
  text(ctx, `Level reached: ${game.level}`, 640, 404, 18, '#5d4037', '700');
  ctx.fillStyle = '#7ed957';
  roundRect(ctx, 490, 440, 300, 52, 16);
  ctx.fill();
  text(ctx, 'PLAY AGAIN', 640, 466, 20, '#fff', '800');
  text(ctx, 'Click or press Space', 640, 506, 13, '#8d6e63', '600');
}

// The whole frame, for the playing screen.
export function drawGame(ctx, game) {
  drawBackground(ctx);
  drawHeader(ctx, game);

  // Customers and their bubbles (only while they are at the counter).
  for (const c of game.customers) {
    if (c.state === 'leaving' && c.arrive <= 0) continue;
    const slotX = CUSTOMER_STRIP.x + c.slot * (CUSTOMER_SLOT_W + CUSTOMER_SLOT_GAP);
    if (c.state === 'waiting' || c.state === 'arriving') {
      drawBubble(ctx, c, slotX);
    }
    drawCustomer(ctx, c, slotX, CUSTOMER_STRIP.y + 64);
  }

  // Order board.
  const waiting = game.customers.filter((c) => c.state === 'waiting' || c.state === 'arriving');
  if (waiting.length === 0) {
    ctx.fillStyle = '#fffdf5';
    ctx.strokeStyle = '#e0a458';
    ctx.lineWidth = 2;
    roundRect(ctx, BOARD.x, BOARD.y, BOARD.w, TICKET_HEIGHT, 12);
    ctx.fill();
    ctx.stroke();
    text(ctx, 'No orders yet —', BOARD.x + BOARD.w / 2, BOARD.y + 60, 14, '#8d6e63', '700');
    text(ctx, 'a customer is on their way!', BOARD.x + BOARD.w / 2, BOARD.y + 84, 14, '#8d6e63', '700');
  } else {
    waiting.forEach((c, i) => {
      drawTicket(ctx, c, BOARD.x, BOARD.y + i * (TICKET_HEIGHT + TICKET_GAP), BOARD.w, TICKET_HEIGHT);
    });
  }

  // Counter stations.
  game.stations.forEach((s, i) => {
    drawStation(ctx, s, stationRect(i), game.highlight === i);
  });

  // Plate and buttons.
  drawPlate(ctx, game.plate);
  const match = game.serveTarget;
  drawButtons(ctx, game, !!match, match ? match.dish : null);

  // Recipe book.
  drawRecipeBook(ctx);

  // Effects on top of everything.
  drawEffects(ctx, game.fx);
}
