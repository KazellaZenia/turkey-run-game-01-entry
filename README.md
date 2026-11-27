# turkey-run-game-01-entry

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/kazellazenia/turkey-run-game-01-entry/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/kazellazenia/turkey-run-game-01-entry/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Gobble Dash — 5 stages, 3 killers, 1000 m to freedom. A complete original turkey escape game: one turkey outruns the farmer across a crowded farmyard, jumps fences and hay bales, clears roaring ovens, and dodges carving knives swooping from the sky — through the Farmyard, Cornfield, Pumpkin Patch, Barn Lane and Freedom Gate — with a live HUD (score, distance, 3 lives, stage progress, speed, corn, farmer gap), synthesized gobbles and alarms, a title screen, and caught/escaped end screens with restart.

## Run it

```sh
node main.ts
```

That writes the game, screenshots and dossier.json into `/output` (or `$MAKEFUN_OUTPUT_DIR`). To play it in a browser, serve `game/` with any static server and open `game/index.html`:

```sh
python3 -m http.server 8080 --directory game
```

Then open http://localhost:8080 in desktop Chrome. Keyboard: Space / ↑ jump and flap, ↓ / S slide, Shift / X dash, P pause, R restart, M mute. Mouse: click the left half to jump, the right half to dash. Deterministic screenshot scenes: `?shot=start`, `?shot=play`, `?shot=chase`, `?shot=end` (each with `&seed=1`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=crrfafzt&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
