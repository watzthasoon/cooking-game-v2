# The Copper Kettle v2 — a cosy kitchen rush, now with real customers

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/watzthasoon/cooking-game-v2/rank.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/watzthasoon/cooking-game-v2/reward.svg)](https://make.fun/c/best-cooking-game-20261125-0137)

A complete original cooking game for the [make.fun best-cooking-game bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). Run a little kitchen where real customers walk up to the counter and order: Maya, Bobo, Luna, Kiko and Sari each want a dish, and their faces tell you how you are doing. Cook it, serve it before their patience runs out, and make them smile — a perfect serve earns a "Wonderful!", hearts, and a golden flash.

## How to play

- **Customers** walk up to the counter (top). A speech bubble above each one shows the dish they want and a patience bar that drains green to red. Their face changes as they wait: excited, patient, impatient (with a sweat drop), delighted, sad, or angry.
- **Order board** (left): every ticket belongs to a customer — same dish, same timer, same name.
- **Counter** (middle): click an ingredient, or press its key (1–8).
  - Bun, cheese and drink go straight on the plate.
  - Patty grills and fries fry — click to start, then click again when the bar turns green. Leave them too long and they burn (toss them with a click).
  - Lettuce, tomato and onion need two chops each.
- **Plate** (under the counter): your dish builds up, bottom to top. Click the plate to take the last item back off, or press C to clear it.
- **Serve**: when the plate matches a customer's dish exactly, the SERVE button turns green — click it (or press S, or click the customer themselves). A fast serve earns "Wonderful!" with hearts and sparkles; a slower one "Excellent!" or "Good". You score the dish's points plus a bonus for the time left, multiplied by your combo. Serve in a row without a miss and the combo grows — the combo meter in the header lights up.
- **Levels**: every 5 serves the kitchen levels up — customers arrive faster, patience shortens, and a third customer joins from level 3. Three missed orders end the shift.

## The menu

Seven original dishes: Sunrise Burger, Classic Burger, Cheesy Melt, Garden Stack, Fresh Garden Salad, Crispy Basket, and the Kettle Feast. The recipe book on the right lists them all.

## Run it

Serve the game folder with any static server and open `game/index.html` in a desktop browser. No network, no build step.

```sh
node serve.ts
# then open http://localhost:8080
```

Keyboard: 1–8 cook, S serve, C clear, Space start/restart, M mute, arrows move the station highlight.

## Layout

- `game/index.html` — the page and the 1280×720 canvas.
- `game/src/main.js` — the loop and the state machine.
- `game/src/recipes.js` — the menu: ingredients, dishes, matching.
- `game/src/customers.js` — the customers: looks, moods, arrivals.
- `game/src/kitchen.js` — the counter: stations, grill, fryer, chopping, plate.
- `game/src/orders.js` — orders, scoring, combo, levels.
- `game/src/effects.js` — sparkles, hearts, grade popups, screen flash.
- `game/src/audio.js` — WebAudio chimes (no audio files).
- `game/src/render.js` — everything drawn on the canvas.
- `game/src/layout.js` — the kitchen's geometry.
- `game/src/input.js` — mouse and keyboard.
- `game/src/random.js` — seeded random numbers.
- `game/src/shots.js` — deterministic states for the screenshots.
- `main.ts` — builds `dist/` (game + screenshots + dossier.json).
