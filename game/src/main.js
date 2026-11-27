// Gobble Dash — the game loop and state machine. Modes: title, play, paused,
// end. A deterministic shot query (?shot=start|play|chase|end) renders one
// frozen scene for screenshots; with no query the game plays normally.
import { WORLD, Run, Turkey } from './world.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { parseShot, buildShotScene } from './shots.js';
import {
  drawBackground,
  drawTurkey,
  drawFarmer,
  drawObstacle,
  drawCorn,
  drawKnife,
  drawHud,
  drawTitle,
  drawEnd,
  drawPaused,
} from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusLine = document.getElementById('status');
canvas.width = WORLD.width;
canvas.height = WORLD.height;

const sounds = new SoundBank();
const input = new Input(canvas);

const BEST_KEY = 'gobble-dash-best-score';
let best = 0;
try {
  best = Number(window.localStorage.getItem(BEST_KEY) || '0') || 0;
} catch (err) {
  best = 0;
}

function saveBest(score) {
  const value = Math.floor(score);
  if (value > best) {
    best = value;
    try {
      window.localStorage.setItem(BEST_KEY, String(value));
    } catch (err) {
      // Storage may be unavailable; the best score is a nicety, not the game.
    }
  }
}

// Game state: one object, rebuilt on every restart.
function freshState(seed) {
  return {
    mode: 'title',
    run: new Run(seed),
    turkey: new Turkey(),
    seed,
    time: 0,
    frozen: false,
    escaped: false,
    closeChase: false,
    stageIndex: 0,
  };
}

let state = freshState(20261127);
let lastTimestamp = 0;

// A shot query replaces the live game with one frozen scene.
const shot = parseShot(window.location.search);
if (shot) {
  const scene = buildShotScene(shot.shot, shot.seed);
  state = {
    mode: scene.mode,
    run: scene.run,
    turkey: scene.turkey,
    seed: shot.seed,
    time: scene.time,
    frozen: true,
    escaped: !!scene.escaped,
    closeChase: !!scene.closeChase,
    stageIndex: scene.stageIndex,
  };
  if (state.run) state.run.time = scene.time;
  // On the end shot the frozen run IS the best run so far: show its score
  // as the best, so the stats line is self-consistent.
  if (scene.mode === 'end') best = Math.max(best, Math.floor(scene.run.score));
}

function announce(text) {
  if (statusLine) statusLine.textContent = text;
}

function startRun() {
  sounds.unlock();
  sounds.gobble();
  state = freshState((Math.random() * 1e9) | 0);
  state.mode = 'play';
  announce('Running! Jump the fences, dodge the knives, reach 1000 metres.');
}

function endRun(escaped) {
  state.mode = 'end';
  state.escaped = escaped;
  saveBest(state.run.score);
  if (escaped) {
    sounds.winStinger();
    announce(`Escaped! Score ${Math.floor(state.run.score)}. Press R to run again.`);
  } else {
    sounds.loseStinger();
    announce(`Caught! Score ${Math.floor(state.run.score)}. Press R to run again.`);
  }
}

function update(dt) {
  state.time += dt;
  if (state.mode === 'title') {
    if (input.startPressed || input.jumpPressed) startRun();
    return;
  }
  if (state.mode === 'end') {
    if (input.restartPressed) startRun();
    return;
  }
  if (state.mode === 'paused') {
    if (input.pausePressed || input.startPressed) state.mode = 'play';
    return;
  }
  // mode === 'play'
  if (input.pausePressed) {
    state.mode = 'paused';
    return;
  }
  if (input.mutePressed) sounds.toggleMute();
  const { run, turkey } = state;
  if (input.jumpPressed) turkey.jump(sounds);
  if (input.slidePressed) turkey.slide();
  if (input.dashPressed) run.dash(sounds);
  turkey.update(dt, run.speed);
  const outcome = run.update(dt, turkey, sounds);
  if (outcome) endRun(outcome === 'escaped');
}

function render() {
  // Clear every frame: the background paints the sky and the ground, but
  // the mid-ground band would otherwise keep the previous frame's pixels.
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);
  const { run, turkey } = state;
  const stageIndex = run ? run.stageInfo.index : state.stageIndex;
  const distancePx = run ? run.distancePx : state.time * 40;
  drawBackground(ctx, stageIndex, distancePx, state.time);

  if (state.mode === 'title') {
    drawTitle(ctx, state.time, best);
    return;
  }

  // Farmer: close behind the turkey in play, nearer in a close chase.
  // Keep at least 70 px between the two bodies so the farmer's reach reads
  // as a chase, not as one figure covering the other.
  const gapPx = run ? Math.max(70, run.farmerGapM * WORLD.pxPerMeter) : 120;
  const farmerX = WORLD.turkeyX - gapPx - (state.closeChase ? 10 : 0);
  const farmerScale = state.closeChase ? 1.05 : 0.92;
  drawFarmer(ctx, farmerX, WORLD.groundY, farmerScale, state.time * 9, run ? run.farmerGapM < 3 : false);

  if (run) {
    for (const o of run.obstacles) drawObstacle(ctx, o);
    for (const c of run.corns) drawCorn(ctx, c, state.time);
    for (const k of run.knives) drawKnife(ctx, k);
  }
  drawTurkey(ctx, turkey, run ? run.invulnTimer > 0 : false, state.time);

  if (state.mode === 'play' || state.mode === 'paused') {
    drawHud(ctx, run, best);
    if (run.flash > 0) {
      ctx.fillStyle = `rgba(255,60,40,${run.flash * 0.9})`;
      ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    }
  }
  if (state.mode === 'paused') drawPaused(ctx);
  if (state.mode === 'end') drawEnd(ctx, run, state.escaped, best, state.time);
}

function frame(timestamp) {
  const dt = Math.min(0.05, lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0.016);
  lastTimestamp = timestamp;
  if (!state.frozen) update(dt);
  render();
  input.endFrame();
  requestAnimationFrame(frame);
}

announce('Gobble Dash. Press Space or click to run from the farmer.');
requestAnimationFrame(frame);
