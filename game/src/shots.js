// Deterministic screenshot scenes for Gobble Dash. A URL query picks one:
//   ?shot=start&seed=1  — title screen over the farmyard
//   ?shot=play&seed=1   — a dense mid-run: all three threats, HUD, corn
//   ?shot=chase&seed=1  — the farmer right behind the turkey, knife swooping
//   ?shot=end&seed=1    — the ESCAPED end screen with final stats
// Each scene is built from a fixed seed and a fixed simulated distance, so
// the same URL always renders the same frame.
import { WORLD, Run, Turkey } from './world.js';

export const SHOT_QUERIES = {
  start: '?shot=start&seed=1',
  play: '?shot=play&seed=1',
  chase: '?shot=chase&seed=1',
  end: '?shot=end&seed=1',
};

export function parseShot(search) {
  const params = new URLSearchParams(search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') || '1') || 1;
  if (!shot || !SHOT_QUERIES[shot]) return null;
  return { shot, seed };
}

// Build the frozen state for one screenshot scene. Returns the game state
// the renderer needs, with `frozen: true` so the main loop never advances it.
export function buildShotScene(shot, seed) {
  if (shot === 'start') {
    return { mode: 'title', run: null, turkey: new Turkey(), frozen: true, time: 1.2, stageIndex: 0 };
  }
  if (shot === 'play') {
    const run = new Run(seed);
    const turkey = new Turkey();
    // Simulate a mid-run at stage 2 (Pumpkin Patch, 412 m) with a full HUD.
    run.distancePx = 412 * WORLD.pxPerMeter;
    run.distanceM = 412;
    run.score = 1240;
    run.corn = 23;
    run.goldenCorn = 3;
    run.lives = 3;
    run.farmerGapM = 9.4;
    run.speed = 300;
    run.spawnAhead();
    // Place every threat in frame: an oven, a fence, a bale, a knife warning.
    run.obstacles.push({ kind: 'oven', x: 880, w: 96, h: 74, heatW: 150, passed: false, hit: false, flame: 0.4 });
    run.obstacles.push({ kind: 'fence', x: 1080, w: 46, h: 64, low: true, passed: false, hit: false });
    run.obstacles.push({ kind: 'bale', x: 620, w: 74, h: 58, passed: false, hit: false });
    run.knives.push({ x: 470, y: -90, targetX: 470, phase: 'warn', timer: 0.7, seed });
    run.corns.push({ x: 520, y: WORLD.groundY - 58, golden: false, taken: false, bob: 0 });
    run.corns.push({ x: 554, y: WORLD.groundY - 58, golden: false, taken: false, bob: 1 });
    run.corns.push({ x: 588, y: WORLD.groundY - 96, golden: true, taken: false, bob: 2 });
    turkey.y = WORLD.groundY - 70;
    turkey.vy = -120;
    turkey.onGround = false;
    return { mode: 'play', run, turkey, frozen: true, time: 2.6, stageIndex: 2 };
  }
  if (shot === 'chase') {
    const run = new Run(seed);
    const turkey = new Turkey();
    // Late run, Barn Lane, farmer almost on the turkey's tail.
    run.distancePx = 731 * WORLD.pxPerMeter;
    run.distanceM = 731;
    run.score = 2310;
    run.corn = 41;
    run.goldenCorn = 5;
    run.lives = 2;
    run.farmerGapM = 2.3;
    run.speed = 325;
    run.spawnAhead();
    run.obstacles.push({ kind: 'oven', x: 1010, w: 96, h: 74, heatW: 150, passed: false, hit: false, flame: 1.1 });
    run.obstacles.push({ kind: 'bale', x: 760, w: 74, h: 58, passed: false, hit: false });
    run.knives.push({ x: 380, y: 120, targetX: 380, phase: 'swoop', timer: 0.18, seed });
    run.addEvent('KNIFE INCOMING!', '#ff6b5e');
    run.addEvent('FARMER 2.3 m BEHIND!', '#ffb347');
    turkey.runPhase = 4.2;
    return { mode: 'play', run, turkey, frozen: true, time: 3.4, stageIndex: 3, closeChase: true };
  }
  // end: the ESCAPED screen with final stats.
  const run = new Run(seed);
  run.distancePx = 1000 * WORLD.pxPerMeter;
  run.distanceM = 1000;
  run.score = 3480;
  run.corn = 58;
  run.goldenCorn = 7;
  run.lives = 2;
  run.farmerGapM = 18.5;
  return { mode: 'end', run, turkey: new Turkey(), frozen: true, time: 1.0, stageIndex: 4, escaped: true };
}
