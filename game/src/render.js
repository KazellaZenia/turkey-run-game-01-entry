// All drawing for Gobble Dash: the crowded farmyard, the turkey, the farmer,
// the oven and the knife, the HUD, and the title and end screens. Everything
// is vector shapes drawn in code — no image files, no network.
import { WORLD, STAGES } from './world.js';
import { makeLayoutStream } from './rng.js';

// Draw the big turkey portrait used on the title and end screens.
export function drawTurkeyPortrait(ctx, cx, cy, scale, opts = {}) {
  const s = scale;
  const flap = opts.flap || 0;
  const happy = !!opts.happy;
  const scared = !!opts.scared;
  ctx.save();
  ctx.translate(cx, cy);
  // Tail feathers: a fan of autumn colours.
  const featherColors = ['#d94f2b', '#e88b2a', '#f2c14e', '#a34d1f', '#c96a2c'];
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate((i * 0.42) + Math.sin(flap) * 0.05);
    ctx.fillStyle = featherColors[i + 2];
    ctx.beginPath();
    ctx.ellipse(0, -58 * s, 17 * s, 52 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, -92 * s, 7 * s, 16 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Body.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(0, 0, 52 * s, 58 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a06a33';
  ctx.beginPath();
  ctx.ellipse(0, 8 * s, 40 * s, 44 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing.
  ctx.fillStyle = '#6e451f';
  ctx.beginPath();
  ctx.ellipse(-30 * s, -4 * s, 22 * s, 34 * s, 0.5 + Math.sin(flap) * 0.12, 0, Math.PI * 2);
  ctx.fill();
  // Head and neck.
  ctx.fillStyle = '#c96a4a';
  ctx.beginPath();
  ctx.ellipse(14 * s, -66 * s, 13 * s, 26 * s, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d97b52';
  ctx.beginPath();
  ctx.arc(26 * s, -92 * s, 22 * s, 0, Math.PI * 2);
  ctx.fill();
  // Beak.
  ctx.fillStyle = '#f2a541';
  ctx.beginPath();
  ctx.moveTo(44 * s, -96 * s);
  ctx.lineTo(66 * s, -88 * s);
  ctx.lineTo(44 * s, -80 * s);
  ctx.closePath();
  ctx.fill();
  // Wattle.
  ctx.fillStyle = '#d93a2b';
  ctx.beginPath();
  ctx.ellipse(38 * s, -76 * s, 6 * s, 12 * s, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Snood.
  ctx.fillStyle = '#e84a3a';
  ctx.beginPath();
  ctx.ellipse(48 * s, -102 * s, 4 * s, 9 * s, 0.4, 0, Math.PI * 2);
  ctx.fill();
  // Eye.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(30 * s, -98 * s, 7 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d1d1d';
  ctx.beginPath();
  ctx.arc(32 * s, -98 * s, 3.5 * s, 0, Math.PI * 2);
  ctx.fill();
  if (scared) {
    ctx.strokeStyle = '#1d1d1d';
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(18 * s, -112 * s);
    ctx.lineTo(42 * s, -104 * s);
    ctx.stroke();
  }
  if (happy) {
    // A relieved smile.
    ctx.strokeStyle = '#5b3413';
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.arc(30 * s, -84 * s, 8 * s, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
  // Legs.
  ctx.strokeStyle = '#e8a13c';
  ctx.lineWidth = 5 * s;
  ctx.beginPath();
  ctx.moveTo(-14 * s, 54 * s);
  ctx.lineTo(-14 * s, 74 * s);
  ctx.moveTo(14 * s, 54 * s);
  ctx.lineTo(14 * s, 74 * s);
  ctx.stroke();
  ctx.restore();
}

// The farmer: overalls, straw hat, red shirt, pitchfork, mid-chase.
export function drawFarmer(ctx, x, y, scale, runPhase, stumbling) {
  const s = scale;
  ctx.save();
  ctx.translate(x, y);
  const bob = Math.sin(runPhase * 2) * 3 * s;
  const lean = stumbling ? 0.35 : 0.22;
  ctx.rotate(lean);
  // Legs, running.
  ctx.strokeStyle = '#3a4a6b';
  ctx.lineWidth = 9 * s;
  const legSwing = Math.sin(runPhase * 2) * 14 * s;
  ctx.beginPath();
  ctx.moveTo(0, -52 * s + bob);
  ctx.lineTo(-legSwing, 0);
  ctx.moveTo(0, -52 * s + bob);
  ctx.lineTo(legSwing, 0);
  ctx.stroke();
  // Overalls body.
  ctx.fillStyle = '#33507e';
  ctx.fillRect(-16 * s, -104 * s + bob, 32 * s, 56 * s);
  // Red shirt arms, one reaching forward.
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 10 * s;
  ctx.beginPath();
  ctx.moveTo(-14 * s, -96 * s + bob);
  ctx.lineTo(-30 * s, -66 * s + bob);
  ctx.moveTo(14 * s, -96 * s + bob);
  ctx.lineTo(38 * s, -84 * s + bob);
  ctx.stroke();
  // Head.
  ctx.fillStyle = '#f0c297';
  ctx.beginPath();
  ctx.arc(0, -122 * s + bob, 17 * s, 0, Math.PI * 2);
  ctx.fill();
  // Beard and angry eyes.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(0, -108 * s + bob, 12 * s, 8 * s, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#1d1d1d';
  ctx.beginPath();
  ctx.arc(-6 * s, -126 * s + bob, 2.5 * s, 0, Math.PI * 2);
  ctx.arc(6 * s, -126 * s + bob, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
  // Straw hat.
  ctx.fillStyle = '#e8c85a';
  ctx.beginPath();
  ctx.ellipse(0, -134 * s + bob, 26 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-13 * s, -152 * s + bob, 26 * s, 16 * s);
  ctx.fillStyle = '#b03a2e';
  ctx.fillRect(-13 * s, -140 * s + bob, 26 * s, 5 * s);
  // Pitchfork in the reaching hand.
  ctx.strokeStyle = '#7a5a30';
  ctx.lineWidth = 4 * s;
  ctx.beginPath();
  ctx.moveTo(38 * s, -84 * s + bob);
  ctx.lineTo(62 * s, -128 * s + bob);
  ctx.stroke();
  ctx.strokeStyle = '#c8ccd4';
  ctx.lineWidth = 3 * s;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(62 * s + i * 6 * s, -128 * s + bob);
    ctx.lineTo(66 * s + i * 6 * s, -146 * s + bob);
    ctx.stroke();
  }
  ctx.restore();
}

// One chicken pecking in the yard.
function drawChicken(ctx, x, y, s, phase) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#f5f0e6';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12 * s, -10 * s + Math.sin(phase) * 2, 7 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e84a3a';
  ctx.beginPath();
  ctx.arc(12 * s, -17 * s + Math.sin(phase) * 2, 3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2a541';
  ctx.beginPath();
  ctx.moveTo(18 * s, -11 * s);
  ctx.lineTo(24 * s, -9 * s);
  ctx.lineTo(18 * s, -7 * s);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// The farmyard behind the action: barn, farmhouse, fences, hay, corn rows,
// pumpkins, chickens, a scarecrow, dust and falling leaves.
export function drawBackground(ctx, stageIndex, distancePx, time) {
  const stage = STAGES[stageIndex];
  const W = WORLD.width;
  const H = WORLD.height;
  // Sky and sun.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, stage.sky);
  sky.addColorStop(1, stage.horizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 300);
  ctx.fillStyle = '#fff2b0';
  ctx.beginPath();
  ctx.arc(1090, 62, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,242,176,0.35)';
  ctx.beginPath();
  ctx.arc(1090, 62, 52, 0, Math.PI * 2);
  ctx.fill();
  // Clouds.
  ctx.fillStyle = 'rgba(255,250,235,0.85)';
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 340 - distancePx * 0.08) % (W + 260) + W + 260) % (W + 260) - 130;
    ctx.beginPath();
    ctx.ellipse(cx, 52 + i * 22, 52, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 34, 58 + i * 22, 38, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Distant hills and trees.
  ctx.fillStyle = '#a8763e';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  for (let x = 0; x <= W; x += 80) ctx.lineTo(x, 268 + Math.sin((x + distancePx * 0.15) * 0.01) * 14);
  ctx.lineTo(W, 300);
  ctx.closePath();
  ctx.fill();
  // Mid-ground base: the trampled dirt yard between the hills and the
  // running ground. Without this the band is never painted and old frames
  // smear across it, since the canvas is cleared every frame.
  ctx.fillStyle = '#7d5a30';
  ctx.fillRect(0, 300, W, WORLD.groundY - 300);
  // Barn (left, far) and farmhouse (right, far).
  const barnX = 150 - (distancePx * 0.25) % 1400;
  ctx.fillStyle = '#b03a2e';
  ctx.fillRect(barnX, 196, 150, 104);
  ctx.fillStyle = '#7e2a20';
  ctx.beginPath();
  ctx.moveTo(barnX - 12, 200);
  ctx.lineTo(barnX + 75, 148);
  ctx.lineTo(barnX + 162, 200);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f5e6c8';
  ctx.fillRect(barnX + 58, 250, 34, 50);
  ctx.strokeStyle = '#f5e6c8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(barnX + 58, 250);
  ctx.lineTo(barnX + 92, 300);
  ctx.moveTo(barnX + 92, 250);
  ctx.lineTo(barnX + 58, 300);
  ctx.stroke();
  const houseX = 980 - (distancePx * 0.25) % 1400;
  ctx.fillStyle = '#f2e3c2';
  ctx.fillRect(houseX, 216, 170, 84);
  ctx.fillStyle = '#5b3a1e';
  ctx.beginPath();
  ctx.moveTo(houseX - 10, 218);
  ctx.lineTo(houseX + 85, 172);
  ctx.lineTo(houseX + 180, 218);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd94a';
  ctx.fillRect(houseX + 20, 240, 26, 26);
  ctx.fillRect(houseX + 120, 240, 26, 26);
  ctx.fillStyle = '#7e2a20';
  ctx.fillRect(houseX + 72, 252, 26, 48);
  // Fence line across the mid-ground.
  ctx.strokeStyle = '#8a6a42';
  ctx.lineWidth = 5;
  for (let x = -((distancePx * 0.5) % 96); x < W; x += 96) {
    ctx.beginPath();
    ctx.moveTo(x, 318);
    ctx.lineTo(x, 348);
    ctx.stroke();
  }
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 324);
  ctx.lineTo(W, 324);
  ctx.moveTo(0, 340);
  ctx.lineTo(W, 340);
  ctx.stroke();
  // Corn rows (stages 1+) and pumpkin patch (stage 2+) in the mid-ground.
  const rng = makeLayoutStream(1000 + stageIndex * 77);
  if (stageIndex >= 1) {
    ctx.strokeStyle = '#5d7d2e';
    ctx.lineWidth = 3;
    for (let i = 0; i < 14; i++) {
      const cx = ((i * 97 + rng.int(0, 40) - distancePx * 0.6) % (W + 200) + W + 200) % (W + 200) - 100;
      ctx.beginPath();
      ctx.moveTo(cx, 352);
      ctx.lineTo(cx - 6, 316);
      ctx.moveTo(cx, 352);
      ctx.lineTo(cx + 6, 314);
      ctx.stroke();
      ctx.fillStyle = '#f2c14e';
      ctx.beginPath();
      ctx.ellipse(cx, 330, 4, 9, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (stageIndex >= 2) {
    for (let i = 0; i < 8; i++) {
      const px = ((i * 173 + 60 - distancePx * 0.6) % (W + 200) + W + 200) % (W + 200) - 100;
      ctx.fillStyle = '#e07b28';
      ctx.beginPath();
      ctx.ellipse(px, 356, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8a4d16';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, 344);
      ctx.lineTo(px + 3, 336);
      ctx.stroke();
    }
  }
  // Scarecrow standing in the field, kept to the right so it never lands
  // behind the title screen's text block.
  const scX = 1150 - (distancePx * 0.5) % 1500;
  ctx.strokeStyle = '#6b4a26';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(scX, 300);
  ctx.lineTo(scX, 366);
  ctx.moveTo(scX - 34, 322);
  ctx.lineTo(scX + 34, 322);
  ctx.stroke();
  ctx.fillStyle = '#3a6ea5';
  ctx.fillRect(scX - 24, 322, 48, 34);
  ctx.fillStyle = '#f0c297';
  ctx.beginPath();
  ctx.arc(scX, 302, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8c85a';
  ctx.beginPath();
  ctx.ellipse(scX, 292, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, WORLD.groundY, W, H - WORLD.groundY);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, WORLD.groundY, W, 10);
  // Dirt texture: seeded speckles scrolling with the world.
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let i = 0; i < 46; i++) {
    const sx = ((i * 137 - distancePx) % (W + 40) + W + 40) % (W + 40) - 20;
    ctx.fillRect(sx, WORLD.groundY + 16 + ((i * 53) % 52), 7, 3);
  }
  // Hay bales resting in the yard.
  ctx.fillStyle = '#d9a441';
  for (let i = 0; i < 3; i++) {
    const hx = ((i * 521 + 240 - distancePx * 0.85) % (W + 300) + W + 300) % (W + 300) - 150;
    ctx.beginPath();
    ctx.ellipse(hx, WORLD.groundY - 8, 34, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a87c22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(hx, WORLD.groundY - 8, 22, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Chickens pecking near the fence.
  drawChicken(ctx, ((300 - distancePx * 0.7) % (W + 200) + W + 200) % (W + 200) - 100, 386, 1, time * 2);
  drawChicken(ctx, ((820 - distancePx * 0.7) % (W + 200) + W + 200) % (W + 200) - 100, 392, 0.9, time * 2 + 2);
  // Falling autumn leaves.
  ctx.fillStyle = 'rgba(232,139,42,0.85)';
  for (let i = 0; i < 12; i++) {
    const lx = ((i * 211 + time * (18 + i * 3) - distancePx * 0.2) % (W + 60) + W + 60) % (W + 60) - 30;
    const ly = 40 + ((i * 97 + time * (26 + i * 2)) % 300);
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(time * 1.5 + i);
    ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }
  // Dust kicked up behind the turkey.
  ctx.fillStyle = 'rgba(214,178,128,0.5)';
  for (let i = 0; i < 6; i++) {
    const dx = WORLD.turkeyX - 40 - ((time * 90 + i * 26) % 130);
    const dy = WORLD.groundY - 4 - ((i * 7) % 18);
    ctx.beginPath();
    ctx.arc(dx, dy, 4 + (i % 3) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// A hay bale or fence obstacle.
export function drawObstacle(ctx, o) {
  const gy = WORLD.groundY;
  if (o.kind === 'bale') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, gy - o.h / 2 + 6, o.w / 2, o.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a87c22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, gy - o.h / 2 + 6, o.w / 3, o.h / 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(o.x + 8, gy - o.h + 12);
    ctx.lineTo(o.x + o.w - 8, gy - o.h + 12);
    ctx.stroke();
  } else if (o.kind === 'fence') {
    ctx.strokeStyle = '#8a6a42';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(o.x + 4, gy);
    ctx.lineTo(o.x + 4, gy - o.h);
    ctx.moveTo(o.x + o.w - 4, gy);
    ctx.lineTo(o.x + o.w - 4, gy - o.h);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(o.x, gy - o.h + 10);
    ctx.lineTo(o.x + o.w, gy - o.h + 10);
    ctx.moveTo(o.x, gy - o.h + 32);
    ctx.lineTo(o.x + o.w, gy - o.h + 32);
    ctx.stroke();
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(o.x + o.w / 2 - 16, gy - o.h - 12, 32, 12);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KEEP OUT', o.x + o.w / 2, gy - o.h - 3);
  } else if (o.kind === 'oven') {
    // Heat zone on the ground, glowing.
    const pulse = 0.5 + Math.sin(o.flame + Date.now() / 240) * 0.2;
    const heat = ctx.createRadialGradient(o.x + o.w / 2, gy - 6, 6, o.x + o.w / 2, gy - 6, o.heatW / 2);
    heat.addColorStop(0, `rgba(255,90,20,${0.45 * pulse + 0.25})`);
    heat.addColorStop(1, 'rgba(255,90,20,0)');
    ctx.fillStyle = heat;
    ctx.fillRect(o.x - o.heatW / 2, gy - 40, o.heatW, 40);
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(o.x, gy - o.h, o.w, o.h);
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(o.x + 6, gy - o.h + 6, o.w - 12, o.h - 12);
    // Oven window with flames.
    ctx.fillStyle = '#ff7b1c';
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, gy - 34, 26, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd94a';
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, gy - 30, 14 + pulse * 6, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Chimney with smoke.
    ctx.fillStyle = '#444';
    ctx.fillRect(o.x + o.w - 26, gy - o.h - 26, 18, 28);
    ctx.fillStyle = 'rgba(200,200,200,0.55)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(o.x + o.w - 17 + i * 5, gy - o.h - 36 - i * 12, 5 + i * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOT!', o.x + o.w / 2, gy - o.h - 32);
  }
}

// A corn cob pickup, golden or plain, bobbing gently.
export function drawCorn(ctx, c, time) {
  const bobY = Math.sin(time * 3 + c.bob) * 4;
  ctx.save();
  ctx.translate(c.x, c.y + bobY);
  if (c.golden) {
    ctx.fillStyle = 'rgba(255,217,74,0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, 20 + Math.sin(time * 5) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = c.golden ? '#ffd94a' : '#f2c14e';
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 15, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.golden ? '#e8a13c' : '#d9a441';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.ellipse(i * 4, 0, 2, 11, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#5d7d2e';
  ctx.beginPath();
  ctx.ellipse(-8, -12, 5, 10, -0.6, 0, Math.PI * 2);
  ctx.ellipse(8, -12, 5, 10, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// The carving knife: warning shadow, then the falling blade.
export function drawKnife(ctx, k) {
  if (k.phase === 'warn') {
    const pulse = 0.5 + Math.sin(Date.now() / 90) * 0.4;
    ctx.fillStyle = `rgba(200,30,30,${0.35 + pulse * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(k.x, WORLD.groundY + 2, 34, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('! KNIFE !', k.x, WORLD.groundY - 108);
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(k.x, WORLD.groundY - 100);
    ctx.lineTo(k.x, WORLD.groundY - 20);
    ctx.stroke();
  } else {
    ctx.save();
    ctx.translate(k.x, k.y);
    ctx.rotate(0.5);
    ctx.fillStyle = '#c8ccd4';
    ctx.beginPath();
    ctx.moveTo(0, -52);
    ctx.lineTo(14, 6);
    ctx.lineTo(0, 16);
    ctx.lineTo(-14, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5b3a1e';
    ctx.fillRect(-5, 14, 10, 26);
    ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(k.x, WORLD.groundY + 2, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// The running turkey, drawn small in the world.
export function drawTurkey(ctx, turkey, invulnerable, time) {
  if (invulnerable && Math.floor(time * 12) % 2 === 0) return; // blink while hurt
  const s = 0.62;
  const flap = turkey.flapTimer > 0 ? Math.sin(time * 30) * 0.3 : Math.sin(turkey.runPhase) * 0.08;
  ctx.save();
  ctx.translate(turkey.x, turkey.y);
  if (turkey.sliding) {
    ctx.rotate(0.5);
    ctx.translate(0, 14);
  } else if (!turkey.onGround) {
    ctx.rotate(-0.12);
  } else {
    ctx.rotate(Math.sin(turkey.runPhase) * 0.04);
  }
  ctx.scale(s, s);
  drawTurkeyPortrait(ctx, 0, -46, 1, { flap, scared: false });
  ctx.restore();
}

// The HUD: score, distance, lives, stage, speed, corn, farmer gap.
export function drawHud(ctx, run, best) {
  const { stage, index, progress } = run.stageInfo;
  ctx.save();
  // Top bar.
  ctx.fillStyle = 'rgba(30,18,8,0.88)';
  ctx.fillRect(0, 0, WORLD.width, 64);
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${Math.floor(run.score)}`, 18, 26);
  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#ffd94a';
  ctx.fillText(`DISTANCE ${Math.floor(run.distanceM)} m / 1000 m`, 18, 50);
  // Lives as hearts.
  for (let i = 0; i < 3; i++) {
    const hx = 330 + i * 30;
    ctx.fillStyle = i < run.lives ? '#ff4d6d' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(hx, 22, 9, 0, Math.PI * 2);
    ctx.arc(hx + 12, 22, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 7, 24);
    ctx.lineTo(hx + 18, 24);
    ctx.lineTo(hx + 5, 40);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`CORN ${run.corn}  (gold ${run.goldenCorn})`, 330, 52);
  // Stage + progress bar.
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`STAGE ${index + 1}/5 — ${stage.name.toUpperCase()}`, 700, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(560, 36, 280, 12);
  ctx.fillStyle = '#7fae4e';
  ctx.fillRect(560, 36, 280 * (index / 5 + progress / 5), 12);
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`${Math.floor(run.distanceM)} / 1000 m to freedom`, 700, 60);
  // Speed and farmer gap on the right.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`SPEED ${Math.round(run.speed * 3.6 / 8)} km/h`, 1262, 24);
  const gapColor = run.farmerGapM < 5 ? '#ff6b5e' : run.farmerGapM < 9 ? '#ffb347' : '#8aff8a';
  ctx.fillStyle = gapColor;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`FARMER ${run.farmerGapM.toFixed(1)} m BEHIND`, 1262, 50);
  if (best > 0) {
    ctx.fillStyle = 'rgba(255,243,196,0.75)';
    ctx.font = '13px sans-serif';
    ctx.fillText(`BEST ${Math.floor(best)}`, 1262, 62);
  }
  // Toast events under the bar.
  ctx.textAlign = 'center';
  ctx.font = 'bold 17px sans-serif';
  run.events.forEach((e, i) => {
    ctx.globalAlpha = Math.min(1, e.timer);
    ctx.fillStyle = e.color;
    ctx.fillText(e.text, WORLD.width / 2, 96 + i * 24);
  });
  ctx.globalAlpha = 1;
  // Dash cooldown pip.
  if (run.dashCooldown > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(18, 70, 90, 6);
    ctx.fillStyle = '#8aff8a';
    ctx.fillRect(18, 70, 90 * (1 - run.dashCooldown / 2.2), 6);
    ctx.fillStyle = '#fff3c4';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DASH', 18, 88);
  }
  ctx.restore();
}

// Title screen: quantified title, controls, and the turkey portrait.
// Two-column layout: the portrait on the left, the text block on the right,
// so no text ever sits on top of the turkey.
export function drawTitle(ctx, time, best) {
  ctx.fillStyle = 'rgba(30,18,8,0.55)';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  drawTurkeyPortrait(ctx, 250, 255, 1.25, { flap: time * 2, happy: true });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText('GOBBLE DASH', 800, 82);
  ctx.fillStyle = '#ffd94a';
  ctx.font = 'bold 23px sans-serif';
  ctx.fillText('5 stages · 3 killers · 1000 m to freedom', 800, 120);
  ctx.fillStyle = '#fff3c4';
  ctx.font = '18px sans-serif';
  ctx.fillText('One turkey. One farmer. One oven. One very sharp knife.', 800, 176);
  ctx.fillText('Outrun the farmer, jump the fences and hay bales,', 800, 204);
  ctx.fillText('clear the ovens, dodge the falling knives — reach the Freedom Gate.', 800, 232);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#ffe066';
  ctx.fillText('SPACE / ↑ / CLICK — jump & flap    ↓ / S — slide', 800, 288);
  ctx.fillText('SHIFT / X — dash    P — pause    M — mute    R — restart', 800, 314);
  if (best > 0) {
    ctx.fillStyle = '#fff3c4';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`BEST SCORE ${Math.floor(best)}`, 800, 352);
  }
  const blink = Math.floor(time * 2) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('— PRESS SPACE OR CLICK TO RUN —', 800, 404);
  }
}

// End screen: CAUGHT or ESCAPED, with the big portrait and final stats.
// The title and subtitle sit above the portrait, the stats below it, so the
// portrait never covers any text; the Freedom Gate is drawn behind the
// turkey on the escaped screen.
export function drawEnd(ctx, run, escaped, best, time) {
  ctx.fillStyle = escaped ? 'rgba(20,60,20,0.62)' : 'rgba(60,10,8,0.62)';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = escaped ? '#8aff8a' : '#ff6b5e';
  ctx.font = 'bold 50px sans-serif';
  ctx.fillText(escaped ? 'ESCAPED!' : 'CAUGHT!', 640, 62);
  ctx.fillStyle = '#fff3c4';
  ctx.font = '20px sans-serif';
  ctx.fillText(
    escaped ? 'The turkey made it 1000 m to freedom — no Thanksgiving dinner today!' : 'The farmer got his turkey. Thanksgiving dinner is served…',
    640, 96,
  );
  if (escaped) {
    // Freedom Gate behind the turkey.
    ctx.strokeStyle = '#ffd94a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(470, 350);
    ctx.lineTo(470, 140);
    ctx.moveTo(810, 350);
    ctx.lineTo(810, 140);
    ctx.moveTo(450, 138);
    ctx.lineTo(830, 138);
    ctx.stroke();
    drawTurkeyPortrait(ctx, 640, 268, 1.05, { flap: time * 1.5, happy: true });
  } else {
    drawTurkeyPortrait(ctx, 520, 268, 1.05, { flap: 0, scared: true });
    drawFarmer(ctx, 820, 350, 1.1, time * 6, false);
  }
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 19px sans-serif';
  ctx.fillText(
    `SCORE ${Math.floor(run.score)}   ·   DISTANCE ${Math.floor(run.distanceM)} m   ·   CORN ${run.corn} (gold ${run.goldenCorn})   ·   BEST ${Math.floor(best)}`,
    640, 400,
  );
  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 18px sans-serif';
  const blink = Math.floor(time * 2) % 2 === 0;
  if (blink) ctx.fillText('— PRESS R OR CLICK TO RUN AGAIN —', 640, 436);
  ctx.fillStyle = '#fff3c4';
  ctx.font = '15px sans-serif';
  ctx.fillText('Gobble Dash — 5 stages · 3 killers · 1000 m to freedom', 640, 466);
}

// Pause overlay.
export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(20,12,4,0.6)';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('PAUSED', 640, 220);
  ctx.font = '18px sans-serif';
  ctx.fillText('Press P to keep running', 640, 260);
}
