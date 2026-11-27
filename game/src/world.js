// The farm the turkey runs through: five stages from the farmyard to the
// Freedom Gate, the three killers (farmer, oven, carving knife), the corn
// pickups, and the scoring. All layout comes from a seeded stream, so a
// seed always builds the same world.
import { makeLayoutStream, seedFromText } from './rng.js';

export const WORLD = {
  width: 1280,
  height: 480,
  groundY: 402,
  finishMeters: 1000,
  pxPerMeter: 8,
  turkeyX: 300,
};

// The five stages of the escape, each 200 metres, each harder than the last.
export const STAGES = [
  { name: 'Farmyard', meters: 200, sky: '#f7c873', horizon: '#e89b4d', ground: '#b97a3c', grass: '#7fae4e', density: 1.0, speed: 250 },
  { name: 'Cornfield', meters: 200, sky: '#f2b95c', horizon: '#d98a35', ground: '#a86f33', grass: '#8fae3f', density: 1.25, speed: 275 },
  { name: 'Pumpkin Patch', meters: 200, sky: '#ee9a4a', horizon: '#c96a2c', ground: '#9c652e', grass: '#a3822f', density: 1.5, speed: 300 },
  { name: 'Barn Lane', meters: 200, sky: '#e07f3e', horizon: '#a85424', ground: '#8d5a28', grass: '#7d8f3a', density: 1.75, speed: 325 },
  { name: 'Freedom Gate', meters: 200, sky: '#f9d976', horizon: '#e8a83e', ground: '#a5763a', grass: '#6fae5e', density: 2.0, speed: 350 },
];

export function stageAt(distanceMeters) {
  const index = Math.min(STAGES.length - 1, Math.floor(distanceMeters / 200));
  return { stage: STAGES[index], index, progress: (distanceMeters % 200) / 200 };
}

// One obstacle on the ground: a hay bale or fence to jump, or an oven whose
// heat zone must be jumped over or avoided entirely.
export function makeObstacle(kind, x, seed) {
  const rng = makeLayoutStream(seed);
  if (kind === 'oven') {
    return { kind: 'oven', x, w: 96, h: 74, heatW: 150, passed: false, hit: false, flame: rng.float() * 6.28 };
  }
  if (kind === 'fence') {
    return { kind: 'fence', x, w: 46, h: 64, low: true, passed: false, hit: false };
  }
  return { kind: 'bale', x, w: 74, h: 58, passed: false, hit: false };
}

// A corn pickup: plain corn scores 10, golden corn scores 50.
export function makeCorn(x, y, golden) {
  return { x, y, golden: !!golden, taken: false, bob: Math.random() * 6.28 };
}

// The carving knife: it picks a ground spot, shows a warning shadow, then
// swoops down. Its three phases are warn (shadow only), swoop (falling
// blade) and stuck (blade in the ground, then it fades).
export function makeKnife(x, seed) {
  return { x, y: -90, targetX: x, phase: 'warn', timer: 0.7, seed };
}

// Build the whole run's obstacle and corn plan up front from one seed, so
// screenshots of a seed are reproducible and the game never pops a threat
// into view unfairly.
export function buildRunPlan(seed) {
  const rng = makeLayoutStream(seed);
  const plan = [];
  let meters = 26;
  while (meters < WORLD.finishMeters - 24) {
    const roll = rng.float();
    const stageIndex = Math.min(4, Math.floor(meters / 200));
    const gap = 26 + rng.float() * 16 - stageIndex * 1.5;
    if (roll < 0.30) plan.push({ type: 'obstacle', kind: 'bale', at: meters });
    else if (roll < 0.52) plan.push({ type: 'obstacle', kind: 'fence', at: meters });
    else if (roll < 0.68) plan.push({ type: 'obstacle', kind: 'oven', at: meters });
    else if (roll < 0.80) plan.push({ type: 'knife', at: meters });
    else plan.push({ type: 'cornline', at: meters, count: 3 + rng.int(0, 3) });
    // Corn trails often follow a threat, as a reward for clearing it.
    if (rng.chance(0.45)) plan.push({ type: 'cornline', at: meters + 9, count: 3 });
    meters += Math.max(14, gap);
  }
  return plan;
}

// The live run state: distance, score, lives, the farmer's gap, and every
// entity currently on screen.
export class Run {
  constructor(seed) {
    this.seed = seed;
    this.plan = buildRunPlan(seed);
    this.planIndex = 0;
    this.distancePx = 0;
    this.distanceM = 0;
    this.score = 0;
    this.corn = 0;
    this.goldenCorn = 0;
    this.lives = 3;
    this.farmerGapM = 14; // metres between the turkey's tail and the farmer
    this.speed = STAGES[0].speed;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.invulnTimer = 0;
    this.time = 0;
    this.obstacles = [];
    this.corns = [];
    this.knives = [];
    this.events = []; // short-lived toast messages, e.g. "FARMER STUMBLED!"
    this.stumbleTimer = 7 + (seed % 5);
    this.knifeTimer = 5 + (seed % 4);
    this.ovenBurnTimer = 0;
    this.finished = false;
    this.caught = false;
    this.flash = 0;
  }

  get stageInfo() {
    return stageAt(this.distanceM);
  }

  // Spawn everything whose planned position has scrolled into range.
  spawnAhead() {
    const aheadM = this.distanceM + WORLD.width / WORLD.pxPerMeter + 30;
    while (this.planIndex < this.plan.length && this.plan[this.planIndex].at <= aheadM) {
      const item = this.plan[this.planIndex];
      this.planIndex++;
      const x = WORLD.turkeyX + (item.at - this.distanceM) * WORLD.pxPerMeter;
      if (item.type === 'obstacle') {
        this.obstacles.push(makeObstacle(item.kind, x, this.seed + Math.floor(item.at * 13)));
      } else if (item.type === 'cornline') {
        for (let i = 0; i < item.count; i++) {
          const golden = i === 2 && item.count >= 4;
          this.corns.push(makeCorn(x + i * 34, WORLD.groundY - (i % 2 === 0 ? 58 : 96), golden));
        }
      } else if (item.type === 'knife') {
        this.knives.push(makeKnife(x, this.seed + Math.floor(item.at * 7)));
      }
    }
  }

  addEvent(text, color = '#fff3c4') {
    this.events.push({ text, color, timer: 1.8 });
  }

  // One tick of the run. Returns 'escaped' | 'caught' | null.
  update(dt, turkey, sounds) {
    this.time += dt;
    const { stage } = this.stageInfo;
    let targetSpeed = stage.speed;
    if (this.dashTimer > 0) {
      targetSpeed *= 1.55;
      this.dashTimer -= dt;
    }
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.invulnTimer > 0) this.invulnTimer -= dt;
    if (this.flash > 0) this.flash -= dt;
    this.speed = targetSpeed;
    this.distancePx += targetSpeed * dt;
    this.distanceM = this.distancePx / WORLD.pxPerMeter;
    this.score += targetSpeed * dt * 0.12;
    for (const e of this.events) e.timer -= dt;
    this.events = this.events.filter((e) => e.timer > 0);

    // The farmer closes in whenever the turkey is hurt or slow, and loses
    // ground when the turkey dashes or the farmer stumbles.
    this.farmerGapM -= dt * 0.25;
    this.stumbleTimer -= dt;
    if (this.stumbleTimer <= 0) {
      this.stumbleTimer = 9 + ((this.seed + Math.floor(this.time)) % 6);
      this.farmerGapM = Math.min(22, this.farmerGapM + 3.5);
      this.addEvent('FARMER STUMBLED! +3.5 m', '#ffe066');
      sounds.stumble();
    }
    // Extra knives swoop in on a timer, more often in later stages.
    this.knifeTimer -= dt;
    if (this.knifeTimer <= 0) {
      const stageIndex = this.stageInfo.index;
      this.knifeTimer = Math.max(2.6, 6.5 - stageIndex * 0.9);
      this.knives.push(makeKnife(WORLD.turkeyX + 40 + (this.seed % 260), this.seed + Math.floor(this.time * 31)));
      sounds.alarm();
    }

    this.spawnAhead();
    const scroll = targetSpeed * dt;
    for (const o of this.obstacles) o.x -= scroll;
    for (const c of this.corns) c.x -= scroll;
    for (const k of this.knives) {
      k.timer -= dt;
      if (k.phase === 'warn' && k.timer <= 0) {
        k.phase = 'swoop';
        k.timer = 0.42;
        sounds.knifeWhoosh();
      } else if (k.phase === 'swoop') {
        const p = 1 - Math.max(0, k.timer) / 0.42;
        k.y = -90 + (WORLD.groundY - 8 + 90) * p * p;
        if (k.timer <= 0) {
          k.phase = 'stuck';
          k.timer = 1.4;
        }
      }
    }
    this.obstacles = this.obstacles.filter((o) => o.x > -220);
    this.corns = this.corns.filter((c) => c.x > -60);
    this.knives = this.knives.filter((k) => k.phase !== 'stuck' || k.timer > 0);

    // Corn pickups.
    for (const c of this.corns) {
      if (c.taken) continue;
      const dx = Math.abs(c.x - WORLD.turkeyX);
      const dy = Math.abs(c.y - (turkey.y - 20));
      if (dx < 44 && dy < 52) {
        c.taken = true;
        this.corn++;
        if (c.golden) {
          this.goldenCorn++;
          this.score += 50;
          this.addEvent('GOLDEN CORN! +50', '#ffd94a');
          sounds.goldenPop();
        } else {
          this.score += 10;
          sounds.pop();
        }
      }
    }
    this.corns = this.corns.filter((c) => !c.taken);

    // Collisions, only when the turkey is not briefly invulnerable.
    if (this.invulnTimer <= 0) {
      const tb = turkey.bounds();
      for (const o of this.obstacles) {
        if (o.hit || o.passed) continue;
        if (o.kind === 'oven') {
          const inHeat = turkey.x + 26 > o.x - o.heatW / 2 && turkey.x - 26 < o.x + o.heatW / 2;
          const onGround = turkey.y >= WORLD.groundY - 4;
          if (inHeat && onGround) {
            this.ovenBurnTimer += dt;
            if (this.ovenBurnTimer > 0.45) {
              this.hurt('OVEN BURN! -1 LIFE', turkey, sounds);
              this.ovenBurnTimer = 0;
            }
          } else {
            this.ovenBurnTimer = 0;
          }
          if (!o.passed && o.x + o.w < WORLD.turkeyX - 30) {
            o.passed = true;
            this.score += 25;
            this.addEvent('OVEN CLEARED! +25', '#ffb347');
          }
          continue;
        }
        const overlapX = tb.right > o.x && tb.left < o.x + o.w;
        const overlapY = tb.bottom > WORLD.groundY - o.h + 8 && tb.top < WORLD.groundY;
        if (overlapX && overlapY) {
          o.hit = true;
          this.hurt(o.kind === 'fence' ? 'FENCE CRASH! -1 LIFE' : 'HAY BALE CRASH! -1 LIFE', turkey, sounds);
        } else if (!o.passed && o.x + o.w < WORLD.turkeyX - 30) {
          o.passed = true;
          this.score += 15;
        }
      }
      // A stuck knife hurts only if the turkey is on its landing spot.
      for (const k of this.knives) {
        if (k.phase === 'stuck' && Math.abs(k.x - WORLD.turkeyX) < 42 && turkey.y >= WORLD.groundY - 6) {
          this.hurt('KNIFE HIT! -1 LIFE', turkey, sounds);
          k.phase = 'done';
        }
      }
      this.knives = this.knives.filter((k) => k.phase !== 'done');
    }

    if (this.lives <= 0 || this.farmerGapM <= 0) {
      this.caught = true;
      this.finished = true;
      return 'caught';
    }
    if (this.distanceM >= WORLD.finishMeters) {
      this.finished = true;
      return 'escaped';
    }
    return null;
  }

  hurt(message, turkey, sounds) {
    this.lives--;
    this.farmerGapM = Math.max(0, this.farmerGapM - 4);
    this.invulnTimer = 1.4;
    this.flash = 0.35;
    turkey.knockback();
    this.addEvent(message, '#ff6b5e');
    sounds.thud();
    sounds.alarm();
  }

  dash(sounds) {
    if (this.dashCooldown > 0 || this.dashTimer > 0) return false;
    this.dashTimer = 0.7;
    this.dashCooldown = 2.2;
    this.farmerGapM = Math.min(24, this.farmerGapM + 2);
    sounds.flap();
    return true;
  }
}

// The turkey itself: jump physics, sliding, and the knockback on a hit.
export class Turkey {
  constructor() {
    this.x = WORLD.turkeyX;
    this.y = WORLD.groundY;
    this.vy = 0;
    this.onGround = true;
    this.sliding = false;
    this.slideTimer = 0;
    this.flapTimer = 0;
    this.runPhase = 0;
  }

  bounds() {
    const h = this.sliding ? 30 : 52;
    return { left: this.x - 30, right: this.x + 30, top: this.y - h, bottom: this.y };
  }

  jump(sounds) {
    if (this.onGround) {
      this.vy = -640;
      this.onGround = false;
      this.flapTimer = 0.28;
      if (sounds) sounds.flap();
      return true;
    }
    // Double-flap in the air: a small extra lift, once per jump.
    if (this.flapTimer <= 0 && this.vy > -80) {
      this.vy = -300;
      this.flapTimer = 0.28;
      if (sounds) sounds.flap();
      return true;
    }
    return false;
  }

  slide() {
    if (this.onGround) {
      this.sliding = true;
      this.slideTimer = 0.55;
    }
  }

  knockback() {
    this.vy = -260;
    this.onGround = false;
  }

  update(dt, speed) {
    this.runPhase += dt * (speed / 26);
    if (this.flapTimer > 0) this.flapTimer -= dt;
    if (this.slideTimer > 0) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) this.sliding = false;
    }
    if (!this.onGround) {
      this.vy += 1750 * dt;
      this.y += this.vy * dt;
      if (this.y >= WORLD.groundY) {
        this.y = WORLD.groundY;
        this.vy = 0;
        this.onGround = true;
      }
    }
  }
}

export { seedFromText };
