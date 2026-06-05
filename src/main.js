(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const waveEl = document.getElementById('wave');
  const integrityEl = document.getElementById('integrity');
  const scoreEl = document.getElementById('score');

  const TAU = Math.PI * 2;
  const HOLD_MS = 150;
  const HOLD_MOVE = 10;

  const sheet = new Image();
  sheet.src = 'assets/mech/mecha_modular_sheet_alpha.png';
  const sprites = {
    mechFull: { rect: [72, 58, 394, 604], anchor: [197, 514] },
    armRifle: { rect: [492, 178, 492, 162], anchor: [42, 80], muzzle: [466, 82] },
    podLeft: { rect: [1032, 184, 192, 160], anchor: [82, 92] },
    podRight: { rect: [1312, 184, 190, 160], anchor: [82, 92] },
    drone: { rect: [512, 520, 228, 134], anchor: [96, 67], muzzle: [210, 67] },
    playerMissile: { rect: [776, 568, 214, 96], anchor: [107, 48] },
    bolt: { rect: [1020, 586, 300, 70], anchor: [150, 35] },
    enemyMissile: { rect: [1372, 420, 90, 268], anchor: [45, 134] },
    explosions: [
      { rect: [88, 746, 148, 154], anchor: [74, 77] },
      { rect: [276, 732, 184, 190], anchor: [92, 95] },
      { rect: [538, 714, 238, 222], anchor: [119, 111] },
      { rect: [858, 734, 238, 184], anchor: [119, 92] },
      { rect: [1118, 740, 236, 160], anchor: [118, 80] },
      { rect: [1374, 760, 154, 112], anchor: [77, 56] }
    ]
  };

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    status: 'menu',
    paused: false,
    now: 0,
    last: 0,
    wave: 1,
    base: 100,
    score: 0,
    scrap: 0,
    spawnLeft: 0,
    spawnTimer: 0,
    waveActive: false,
    flash: 0,
    armAngle: -Math.PI / 2,
    missileSide: -1,
    stats: {
      missileCooldown: 0.42,
      missileTimer: 0,
      missileSpeed: 720,
      explosionRadius: 58,
      rifleCooldown: 0.085,
      rifleTimer: 0,
      rifleSpread: 0.05,
      bulletSpeed: 920,
      droneCooldown: 0.16,
      droneTimer: 0,
      droneCount: 4,
      shotgunEnabled: false,
      shotgunCooldown: 0.62,
      shotgunTimer: 0,
      heavyShotEnabled: false,
      heavyShotEvery: 6,
      rifleShots: 0,
      baseRepair: 0
    }
  };

  const input = {
    active: false,
    held: false,
    pointerId: null,
    startTime: 0,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    lastTapX: 0,
    lastTapY: 0
  };

  const enemyMissiles = [];
  const playerMissiles = [];
  const bullets = [];
  const explosions = [];
  const sparks = [];

  const upgrades = [
    {
      title: 'Bigger Bursts',
      apply: () => { state.stats.explosionRadius += 12; },
      note: 'Missile explosions clear a wider pocket.'
    },
    {
      title: 'Rifle Overclock',
      apply: () => { state.stats.rifleCooldown = Math.max(0.045, state.stats.rifleCooldown * 0.84); },
      note: 'Hold-fire sprays faster.'
    },
    {
      title: 'Drone Sync',
      apply: () => { state.stats.droneCooldown = Math.max(0.075, state.stats.droneCooldown * 0.82); },
      note: 'Gun drones cycle faster.'
    },
    {
      title: 'Missile Rails',
      apply: () => { state.stats.missileSpeed += 85; state.stats.missileCooldown = Math.max(0.24, state.stats.missileCooldown * 0.92); },
      note: 'Shoulder pods reload and travel faster.'
    },
    {
      title: 'Bulwark Plating',
      apply: () => { state.base = Math.min(100, state.base + 18); },
      note: 'Patch the defended line.'
    },
    {
      title: 'Scatter Knuckle',
      apply: () => { state.stats.shotgunEnabled = true; state.stats.shotgunCooldown = Math.max(0.42, state.stats.shotgunCooldown * 0.9); },
      note: 'Hold-fire periodically vents a short shotgun fan.'
    },
    {
      title: 'Heavy Pistol Link',
      apply: () => { state.stats.heavyShotEnabled = true; state.stats.heavyShotEvery = Math.max(3, state.stats.heavyShotEvery - 1); },
      note: 'Every few rifle shots punches out a heavy round.'
    }
  ];

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function angleLerp(a, b, t) {
    let d = ((b - a + Math.PI) % TAU) - Math.PI;
    if (d < -Math.PI) d += TAU;
    return a + d * t;
  }

  function distSq(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    state.width = Math.max(320, rect.width || window.innerWidth);
    state.height = Math.max(480, rect.height || window.innerHeight);
    state.dpr = dpr;
    canvas.width = Math.round(state.width * dpr);
    canvas.height = Math.round(state.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function pointerPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp(event.clientX - rect.left, 0, state.width),
      y: clamp(event.clientY - rect.top, 0, state.height)
    };
  }

  function setOverlay(kind, options = []) {
    overlay.classList.remove('is-hidden');
    const panel = overlay.querySelector('.overlay__panel');
    if (kind === 'menu') {
      panel.innerHTML = '<h1>MECHA COMMAND</h1><p>Tap intercepts. Hold opens fire.</p><button id="startBtn2" type="button">Start</button>';
      panel.querySelector('button').addEventListener('click', startGame);
      return;
    }
    if (kind === 'clear') {
      const buttons = options.map((u, i) => `<button data-upgrade="${i}" type="button">${u.title}</button><p>${u.note}</p>`).join('');
      panel.innerHTML = `<h1>WAVE ${state.wave} CLEAR</h1><p>Choose a frame adjustment.</p>${buttons}`;
      for (const btn of panel.querySelectorAll('button[data-upgrade]')) {
        btn.addEventListener('click', () => {
          const upgrade = options[Number(btn.dataset.upgrade)];
          upgrade.apply();
          state.wave += 1;
          startWave();
          overlay.classList.add('is-hidden');
        });
      }
      return;
    }
    if (kind === 'gameover') {
      panel.innerHTML = `<h1>BREACH</h1><p>Score ${state.score}</p><button id="restartBtn" type="button">Restart</button>`;
      panel.querySelector('button').addEventListener('click', startGame);
    }
  }

  function startGame() {
    overlay.classList.add('is-hidden');
    state.status = 'playing';
    state.paused = false;
    state.wave = 1;
    state.base = 100;
    state.score = 0;
    state.scrap = 0;
    state.flash = 0;
    state.stats.missileCooldown = 0.42;
    state.stats.missileTimer = 0;
    state.stats.missileSpeed = 720;
    state.stats.explosionRadius = 58;
    state.stats.rifleCooldown = 0.085;
    state.stats.rifleTimer = 0;
    state.stats.rifleSpread = 0.05;
    state.stats.bulletSpeed = 920;
    state.stats.droneCooldown = 0.16;
    state.stats.droneTimer = 0;
    state.stats.shotgunEnabled = false;
    state.stats.shotgunCooldown = 0.62;
    state.stats.shotgunTimer = 0;
    state.stats.heavyShotEnabled = false;
    state.stats.heavyShotEvery = 6;
    state.stats.rifleShots = 0;
    clearArrays();
    startWave();
  }

  function clearArrays() {
    enemyMissiles.length = 0;
    playerMissiles.length = 0;
    bullets.length = 0;
    explosions.length = 0;
    sparks.length = 0;
  }

  function startWave() {
    state.status = 'playing';
    state.waveActive = true;
    state.spawnLeft = 7 + state.wave * 4;
    state.spawnTimer = 0.25;
    state.base = Math.min(100, state.base + state.stats.baseRepair);
  }

  function chooseUpgrades() {
    const pool = [...upgrades];
    const chosen = [];
    while (pool.length && chosen.length < 3) {
      const i = Math.floor(Math.random() * pool.length);
      chosen.push(pool.splice(i, 1)[0]);
    }
    return chosen;
  }

  function mech() {
    const s = Math.min(state.width, state.height) / 420;
    return {
      x: state.width * 0.5,
      y: state.height - Math.max(92, state.height * 0.13),
      scale: clamp(s, 0.84, 1.55)
    };
  }

  function fireMissile(x, y) {
    if (state.stats.missileTimer > 0 || state.status !== 'playing') return;
    const m = mech();
    state.missileSide *= -1;
    const podX = m.x + state.missileSide * 34 * m.scale;
    const podY = m.y - 54 * m.scale;
    playerMissiles.push({
      x: podX,
      y: podY,
      tx: clamp(x, 18, state.width - 18),
      ty: clamp(y, 48, state.height - 130),
      speed: state.stats.missileSpeed,
      trail: [],
      active: true
    });
    state.stats.missileTimer = state.stats.missileCooldown;
    addSparks(podX, podY, '#ffd966', 5, 80);
  }

  function fireRifle(x, y, source = 'mech') {
    const m = mech();
    let sx = m.x + 30 * m.scale;
    let sy = m.y - 38 * m.scale;
    if (source !== 'mech') {
      sx = source.x;
      sy = source.y;
    }
    const baseAngle = Math.atan2(y - sy, x - sx);
    const jitter = (Math.random() - 0.5) * state.stats.rifleSpread;
    const a = baseAngle + jitter;
    const heavy = source === 'mech' && state.stats.heavyShotEnabled && state.stats.rifleShots % state.stats.heavyShotEvery === 0;
    bullets.push({
      x: sx,
      y: sy,
      vx: Math.cos(a) * state.stats.bulletSpeed * (heavy ? 0.78 : 1),
      vy: Math.sin(a) * state.stats.bulletSpeed * (heavy ? 0.78 : 1),
      life: heavy ? 0.72 : 0.55,
      radius: heavy ? 7 : (source === 'mech' ? 4 : 3),
      damage: heavy ? 2 : 1,
      color: heavy ? '#ffdf67' : (source === 'mech' ? '#9be9ff' : '#ffec8a')
    });
    if (source === 'mech') state.stats.rifleShots += 1;
    addSparks(sx, sy, heavy ? '#ffdf67' : '#9be9ff', heavy ? 5 : 2, heavy ? 120 : 70);
  }

  function fireShotgun(x, y) {
    const m = mech();
    const sx = m.x + 24 * m.scale;
    const sy = m.y - 34 * m.scale;
    const baseAngle = Math.atan2(y - sy, x - sx);
    for (let i = -2; i <= 2; i += 1) {
      const a = baseAngle + i * 0.13;
      bullets.push({
        x: sx,
        y: sy,
        vx: Math.cos(a) * state.stats.bulletSpeed * 0.58,
        vy: Math.sin(a) * state.stats.bulletSpeed * 0.58,
        life: 0.24,
        radius: 5,
        damage: 1,
        color: '#ff9bd4'
      });
    }
    addSparks(sx, sy, '#ff9bd4', 10, 150);
  }

  function dronePositions() {
    const m = mech();
    const d = 70 * m.scale;
    const yBias = -64 * m.scale;
    return [
      { x: m.x - d, y: m.y + yBias - d * 0.35 },
      { x: m.x + d, y: m.y + yBias - d * 0.35 },
      { x: m.x - d, y: m.y + yBias + d * 0.55 },
      { x: m.x + d, y: m.y + yBias + d * 0.55 }
    ].slice(0, state.stats.droneCount);
  }

  function spawnEnemyMissile() {
    const margin = 20;
    const x = margin + Math.random() * (state.width - margin * 2);
    const targetX = state.width * (0.16 + Math.random() * 0.68);
    const targetY = state.height - 46;
    const speed = 54 + state.wave * 7 + Math.random() * 24;
    const a = Math.atan2(targetY - 0, targetX - x);
    enemyMissiles.push({
      x,
      y: -12,
      sx: x,
      sy: -12,
      tx: targetX,
      ty: targetY,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      radius: 8,
      alive: true,
      hp: 1,
      hot: Math.random() < 0.16 + state.wave * 0.012
    });
  }

  function addExplosion(x, y, radius, team = 'player') {
    explosions.push({ x, y, radius: 2, maxRadius: radius, life: 0.42, age: 0, team });
    addSparks(x, y, team === 'player' ? '#ffdf67' : '#ff6b6b', 14, radius * 2.4);
  }

  function addSparks(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * TAU;
      const v = speed * (0.35 + Math.random() * 0.65);
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.28 + Math.random() * 0.24, color });
    }
  }

  function update(dt) {
    if (state.status !== 'playing' || state.paused) return;

    state.stats.missileTimer = Math.max(0, state.stats.missileTimer - dt);
    state.stats.rifleTimer = Math.max(0, state.stats.rifleTimer - dt);
    state.stats.droneTimer = Math.max(0, state.stats.droneTimer - dt);
    state.stats.shotgunTimer = Math.max(0, state.stats.shotgunTimer - dt);
    state.flash = Math.max(0, state.flash - dt * 2.4);

    if (input.active) {
      const elapsed = performance.now() - input.startTime;
      const moved = Math.sqrt(distSq(input.x, input.y, input.startX, input.startY));
      if (elapsed >= HOLD_MS || moved >= HOLD_MOVE) input.held = true;
    }

    const aimX = input.active ? input.x : input.lastTapX || state.width * 0.5;
    const aimY = input.active ? input.y : input.lastTapY || state.height * 0.25;
    const m = mech();
    const shoulder = { x: m.x + 22 * m.scale, y: m.y - 42 * m.scale };
    const targetAngle = clamp(Math.atan2(aimY - shoulder.y, aimX - shoulder.x), -Math.PI + 0.1, -0.05);
    state.armAngle = angleLerp(state.armAngle, targetAngle, input.active ? 0.24 : 0.08);

    if (input.active && input.held) {
      if (state.stats.rifleTimer <= 0) {
        fireRifle(input.x, input.y, 'mech');
        state.stats.rifleTimer = state.stats.rifleCooldown;
        if (state.stats.shotgunEnabled && state.stats.shotgunTimer <= 0) {
          fireShotgun(input.x, input.y);
          state.stats.shotgunTimer = state.stats.shotgunCooldown;
        }
      }
      if (state.stats.droneTimer <= 0) {
        const drones = dronePositions();
        for (const drone of drones) fireRifle(input.x, input.y, drone);
        state.stats.droneTimer = state.stats.droneCooldown;
      }
    }

    updateWave(dt);
    updatePlayerMissiles(dt);
    updateBullets(dt);
    updateEnemyMissiles(dt);
    updateExplosions(dt);
    updateSparks(dt);
    checkWaveClear();
    updateHud();
  }

  function updateWave(dt) {
    if (!state.waveActive) return;
    state.spawnTimer -= dt;
    if (state.spawnLeft > 0 && state.spawnTimer <= 0) {
      spawnEnemyMissile();
      state.spawnLeft -= 1;
      const base = Math.max(0.28, 1.05 - state.wave * 0.045);
      state.spawnTimer = base * (0.65 + Math.random() * 0.7);
    }
  }

  function updatePlayerMissiles(dt) {
    for (const missile of playerMissiles) {
      if (!missile.active) continue;
      missile.trail.push({ x: missile.x, y: missile.y });
      if (missile.trail.length > 9) missile.trail.shift();
      const dx = missile.tx - missile.x;
      const dy = missile.ty - missile.y;
      const d = Math.hypot(dx, dy);
      if (d < missile.speed * dt || d < 8) {
        missile.active = false;
        addExplosion(missile.tx, missile.ty, state.stats.explosionRadius, 'player');
      } else {
        missile.x += (dx / d) * missile.speed * dt;
        missile.y += (dy / d) * missile.speed * dt;
      }
    }
    compact(playerMissiles, item => item.active);
  }

  function updateBullets(dt) {
    for (const b of bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      for (const e of enemyMissiles) {
        if (!e.alive) continue;
        if (distSq(b.x, b.y, e.x, e.y) < (e.radius + b.radius) ** 2) {
          e.hp -= b.damage || 1;
          b.life = 0;
          if (e.hp <= 0) {
            e.alive = false;
            state.score += 15;
            state.scrap += 1;
            addExplosion(e.x, e.y, 22, 'player');
          } else {
            addSparks(e.x, e.y, '#ffdf67', 4, 90);
          }
          break;
        }
      }
    }
    compact(bullets, b => b.life > 0 && b.x > -30 && b.x < state.width + 30 && b.y > -40 && b.y < state.height + 40);
  }

  function updateEnemyMissiles(dt) {
    for (const e of enemyMissiles) {
      if (!e.alive) continue;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      if (e.y >= e.ty || e.x < -30 || e.x > state.width + 30) {
        e.alive = false;
        state.base = Math.max(0, state.base - (e.hot ? 13 : 8));
        state.flash = 1;
        addExplosion(e.x, e.ty, e.hot ? 42 : 32, 'enemy');
        if (state.base <= 0) {
          state.status = 'gameover';
          setOverlay('gameover');
        }
      }
    }
    compact(enemyMissiles, e => e.alive);
  }

  function updateExplosions(dt) {
    for (const ex of explosions) {
      ex.age += dt;
      ex.life -= dt;
      const t = clamp(ex.age / 0.28, 0, 1);
      ex.radius = lerp(ex.radius, ex.maxRadius, t);
      if (ex.team === 'player') {
        for (const e of enemyMissiles) {
          if (!e.alive) continue;
          if (distSq(ex.x, ex.y, e.x, e.y) < (ex.radius + e.radius) ** 2) {
            e.alive = false;
            state.score += 25;
            state.scrap += 1;
            addSparks(e.x, e.y, '#ffd966', 8, 130);
          }
        }
      }
    }
    compact(explosions, ex => ex.life > 0);
  }

  function updateSparks(dt) {
    for (const s of sparks) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= 0.95;
      s.vy *= 0.95;
      s.life -= dt;
    }
    compact(sparks, s => s.life > 0);
  }

  function compact(array, predicate) {
    let write = 0;
    for (let read = 0; read < array.length; read += 1) {
      if (predicate(array[read])) array[write++] = array[read];
    }
    array.length = write;
  }

  function checkWaveClear() {
    if (!state.waveActive) return;
    if (state.spawnLeft <= 0 && enemyMissiles.length === 0 && state.status === 'playing') {
      state.waveActive = false;
      state.status = 'upgrade';
      setOverlay('clear', chooseUpgrades());
    }
  }

  function updateHud() {
    waveEl.textContent = `WAVE ${state.wave}`;
    integrityEl.textContent = `BASE ${Math.round(state.base)}%`;
    scoreEl.textContent = `SCRAP ${state.scrap}`;
  }

  function draw() {
    const w = state.width;
    const h = state.height;
    ctx.clearRect(0, 0, w, h);
    drawBackground(w, h);
    drawEnemyMissiles();
    drawPlayerMissiles();
    drawBullets();
    drawExplosions();
    drawBase();
    drawMecha();
    drawSparks();
    if (input.active && state.status === 'playing') drawReticle(input.x, input.y, input.held);
    if (state.paused) drawPauseVeil();
  }

  function drawBackground(w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#071018');
    g.addColorStop(0.55, '#0b1b25');
    g.addColorStop(1, '#141720');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#1e5368';
    ctx.lineWidth = 1;
    const step = Math.max(28, Math.min(w, h) / 12);
    for (let x = (state.now * 8) % step; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - h * 0.18, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + w * 0.16);
      ctx.stroke();
    }
    ctx.restore();

    const danger = clamp((100 - state.base) / 100, 0, 1);
    if (danger > 0) {
      ctx.fillStyle = `rgba(255, 80, 80, ${0.05 + danger * 0.08})`;
      ctx.fillRect(0, h - 58, w, 10);
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 65, 65, ${0.16 * state.flash})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function sheetReady() {
    return sheet.complete && sheet.naturalWidth > 0;
  }

  function drawSpritePart(part, x, y, scale = 1, rotation = 0, alpha = 1) {
    if (!sheetReady()) return false;
    const [sx, sy, sw, sh] = part.rect;
    const [ax, ay] = part.anchor;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.drawImage(sheet, sx, sy, sw, sh, -ax, -ay, sw, sh);
    ctx.restore();
    return true;
  }

  function drawBase() {
    const y = state.height - 48;
    ctx.fillStyle = '#111821';
    ctx.fillRect(0, y, state.width, 48);
    const segments = 8;
    const gap = 4;
    const sw = state.width / segments;
    for (let i = 0; i < segments; i += 1) {
      const healthCut = state.base / 100;
      const live = i / segments < healthCut;
      ctx.fillStyle = live ? '#46d7bd' : '#6d2735';
      roundRect(i * sw + gap, y + 14, sw - gap * 2, 14, 4, true);
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      ctx.fillRect(i * sw + gap + 3, y + 17, Math.max(0, sw - gap * 2 - 6), 2);
    }
  }

  function drawMecha() {
    const m = mech();
    const s = m.scale;
    const x = m.x;
    const y = m.y;

    drawDrones();

    if (sheetReady()) {
      drawSpritePart(sprites.mechFull, x, y + 7 * s, 0.43 * s, 0);
      drawSpritePart(sprites.podLeft, x - 58 * s, y - 58 * s, 0.34 * s, -0.06);
      drawSpritePart(sprites.podRight, x + 58 * s, y - 58 * s, 0.34 * s, 0.06);
      drawRifleArm();
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    // Legs and planted base.
    ctx.fillStyle = '#1b2632';
    roundRect(-42, 32, 32, 36, 7, true);
    roundRect(10, 32, 32, 36, 7, true);
    ctx.fillStyle = '#6ee6ff';
    roundRect(-52, 62, 46, 14, 5, true);
    roundRect(6, 62, 46, 14, 5, true);

    // Torso.
    ctx.fillStyle = '#e9f3ff';
    roundRect(-45, -54, 90, 86, 14, true);
    ctx.fillStyle = '#91a6ba';
    roundRect(-34, -44, 68, 58, 10, true);
    ctx.fillStyle = '#223247';
    roundRect(-22, -30, 44, 38, 8, true);
    ctx.fillStyle = '#ffdf67';
    roundRect(-12, -20, 24, 18, 5, true);

    // Head.
    ctx.fillStyle = '#f6fbff';
    roundRect(-32, -94, 64, 44, 12, true);
    ctx.fillStyle = '#203143';
    roundRect(-22, -82, 44, 14, 5, true);
    ctx.fillStyle = '#8ff4ff';
    ctx.fillRect(-17, -78, 34, 4);

    // Shoulder pods.
    drawPod(-58, -58, -1);
    drawPod(58, -58, 1);

    // Left chunky guard arm.
    ctx.fillStyle = '#c7d7ea';
    roundRect(-76, -42, 28, 54, 10, true);
    ctx.fillStyle = '#26374b';
    roundRect(-70, -25, 18, 34, 6, true);

    ctx.restore();

    drawRifleArm();
  }

  function drawPod(x, y, side) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(side * 0.12);
    ctx.fillStyle = '#d9e9f8';
    roundRect(-18, -22, 36, 44, 9, true);
    ctx.fillStyle = '#26374b';
    roundRect(-12, -16, 10, 28, 4, true);
    roundRect(2, -16, 10, 28, 4, true);
    ctx.fillStyle = '#ffdf67';
    ctx.fillRect(-10, -20, 8, 3);
    ctx.fillRect(4, -20, 8, 3);
    ctx.restore();
  }

  function drawRifleArm() {
    const m = mech();
    const s = m.scale;
    const shoulderX = m.x + 22 * s;
    const shoulderY = m.y - 42 * s;
    if (sheetReady()) {
      drawSpritePart(sprites.armRifle, shoulderX, shoulderY, 0.23 * s, state.armAngle);
      return;
    }
    ctx.save();
    ctx.translate(shoulderX, shoulderY);
    ctx.rotate(state.armAngle);
    ctx.scale(s, s);
    ctx.fillStyle = '#d5e3f2';
    roundRect(0, -11, 45, 22, 8, true);
    ctx.fillStyle = '#8399b1';
    roundRect(32, -15, 38, 30, 7, true);
    ctx.fillStyle = '#243348';
    roundRect(50, -8, 68, 16, 5, true);
    ctx.fillStyle = '#6ee6ff';
    ctx.fillRect(112, -4, 18, 8);
    ctx.fillStyle = '#ffdf67';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawDrones() {
    const target = input.active ? { x: input.x, y: input.y } : nearestEnemyTarget();
    for (const d of dronePositions()) {
      const a = Math.atan2(target.y - d.y, target.x - d.x);
      if (!drawSpritePart(sprites.drone, d.x, d.y, 0.28 * mech().scale, a)) {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(a);
        ctx.fillStyle = '#eff7ff';
        roundRect(-15, -15, 30, 30, 7, true);
        ctx.fillStyle = '#2a3c52';
        roundRect(5, -5, 26, 10, 4, true);
        ctx.fillStyle = '#ffdf67';
        ctx.fillRect(26, -3, 8, 6);
        ctx.restore();
      }
      ctx.strokeStyle = 'rgba(142,244,255,.18)';
      ctx.beginPath();
      ctx.arc(d.x, d.y, 22, 0, TAU);
      ctx.stroke();
    }
  }

  function nearestEnemyTarget() {
    const m = mech();
    let best = null;
    let bestD = Infinity;
    for (const e of enemyMissiles) {
      const d = distSq(m.x, m.y, e.x, e.y);
      if (d < bestD) {
        best = e;
        bestD = d;
      }
    }
    return best || { x: state.width * 0.5, y: state.height * 0.2 };
  }

  function drawEnemyMissiles() {
    for (const e of enemyMissiles) {
      ctx.strokeStyle = e.hot ? 'rgba(255, 91, 91, .62)' : 'rgba(255, 214, 112, .45)';
      ctx.lineWidth = e.hot ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(e.sx, e.sy);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
      const a = Math.atan2(e.vy, e.vx);
      if (!drawSpritePart(sprites.enemyMissile, e.x, e.y, e.hot ? 0.16 : 0.13, a + Math.PI / 2)) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = e.hot ? '#ff6b6b' : '#ffd966';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(7, 8);
        ctx.lineTo(0, 4);
        ctx.lineTo(-7, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function drawPlayerMissiles() {
    for (const missile of playerMissiles) {
      ctx.strokeStyle = 'rgba(111, 230, 255, .42)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < missile.trail.length; i += 1) {
        const p = missile.trail[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.lineTo(missile.x, missile.y);
      ctx.stroke();
      const a = Math.atan2(missile.ty - missile.y, missile.tx - missile.x);
      if (!drawSpritePart(sprites.playerMissile, missile.x, missile.y, 0.18, a)) {
        ctx.save();
        ctx.translate(missile.x, missile.y);
        ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = '#e9f3ff';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(8, 10);
        ctx.lineTo(0, 5);
        ctx.lineTo(-8, 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function drawBullets() {
    for (const b of bullets) {
      const a = Math.atan2(b.vy, b.vx);
      if (!drawSpritePart(sprites.bolt, b.x, b.y, Math.max(0.08, b.radius * 0.022), a, 0.9)) {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.radius;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx * 0.025, b.y - b.vy * 0.025);
        ctx.stroke();
      }
    }
  }

  function drawExplosions() {
    for (const ex of explosions) {
      const t = clamp(ex.life / 0.42, 0, 1);
      const frame = clamp(Math.floor((1 - t) * sprites.explosions.length), 0, sprites.explosions.length - 1);
      drawSpritePart(sprites.explosions[frame], ex.x, ex.y, Math.max(0.28, ex.radius / 92), 0, 0.86 * t);
      ctx.strokeStyle = ex.team === 'player' ? `rgba(255, 223, 103, ${0.85 * t})` : `rgba(255, 91, 91, ${0.75 * t})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = ex.team === 'player' ? `rgba(111, 230, 255, ${0.08 * t})` : `rgba(255, 91, 91, ${0.09 * t})`;
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius * 0.72, 0, TAU);
      ctx.fill();
    }
  }

  function drawSparks() {
    for (const s of sparks) {
      ctx.globalAlpha = clamp(s.life * 3, 0, 1);
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
      ctx.globalAlpha = 1;
    }
  }

  function drawReticle(x, y, held) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = held ? '#9be9ff' : '#ffdf67';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, held ? 18 : 22, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(-12, 0);
    ctx.moveTo(12, 0);
    ctx.lineTo(30, 0);
    ctx.moveTo(0, -30);
    ctx.lineTo(0, -12);
    ctx.moveTo(0, 12);
    ctx.lineTo(0, 30);
    ctx.stroke();
    const cooldown = 1 - clamp(state.stats.missileTimer / state.stats.missileCooldown, 0, 1);
    ctx.strokeStyle = 'rgba(255, 223, 103, .55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 28, -Math.PI / 2, -Math.PI / 2 + TAU * cooldown);
    ctx.stroke();
    ctx.restore();
  }

  function drawPauseVeil() {
    ctx.fillStyle = 'rgba(0, 0, 0, .42)';
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = '#f3f7ff';
    ctx.font = '900 34px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', state.width / 2, state.height / 2);
  }

  function roundRect(x, y, w, h, r, fill) {
    const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    if (fill) ctx.fill();
    else ctx.stroke();
  }

  function onPointerDown(event) {
    if (state.status !== 'playing' || state.paused) return;
    if (input.active) return;
    const p = pointerPoint(event);
    input.active = true;
    input.held = false;
    input.pointerId = event.pointerId;
    input.startTime = performance.now();
    input.startX = p.x;
    input.startY = p.y;
    input.x = p.x;
    input.y = p.y;
    try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!input.active || event.pointerId !== input.pointerId) return;
    const p = pointerPoint(event);
    input.x = p.x;
    input.y = p.y;
    event.preventDefault();
  }

  function onPointerUp(event) {
    if (!input.active || event.pointerId !== input.pointerId) return;
    const p = pointerPoint(event);
    const elapsed = performance.now() - input.startTime;
    const moved = Math.sqrt(distSq(p.x, p.y, input.startX, input.startY));
    const wasTap = elapsed < HOLD_MS && moved < HOLD_MOVE && !input.held;
    input.lastTapX = p.x;
    input.lastTapY = p.y;
    input.active = false;
    input.held = false;
    input.pointerId = null;
    if (wasTap && state.status === 'playing' && !state.paused) fireMissile(p.x, p.y);
    event.preventDefault();
  }

  function togglePause() {
    if (state.status !== 'playing') return;
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? '>' : 'II';
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {}
  }

  function loop(ts) {
    state.now = ts / 1000;
    const dt = Math.min(0.033, state.last ? (ts - state.last) / 1000 : 0.016);
    state.last = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 80));
  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', onPointerMove, { passive: false });
  canvas.addEventListener('pointerup', onPointerUp, { passive: false });
  canvas.addEventListener('pointercancel', onPointerUp, { passive: false });
  startBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', togglePause);
  fullscreenBtn.addEventListener('click', toggleFullscreen);
  window.addEventListener('keydown', event => {
    if (event.key === 'p' || event.key === 'Escape') togglePause();
    if (event.key === ' ') fireMissile(state.width * 0.5, state.height * 0.25);
  });

  resize();
  updateHud();
  setOverlay('menu');
  requestAnimationFrame(loop);
})();
