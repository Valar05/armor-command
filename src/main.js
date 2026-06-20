(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const musicBtn = document.getElementById('musicBtn');
  const menuBtn = document.getElementById('menuBtn');
  const waveEl = document.getElementById('wave');
  const integrityEl = document.getElementById('integrity');
  const scoreEl = document.getElementById('score');
  const comboEl = document.getElementById('combo');

  const TAU = Math.PI * 2;
  const HOLD_MS = 150;
  const HOLD_MOVE = 10;
  const SEMI_AUTO_GRACE_MS = 360;
  const SEMI_AUTO_READY_SECONDS = 0.5;
  const PERSONAL_BEST_KEY = 'armor-command.personal-best.v1';
  const LEGACY_PERSONAL_BEST_KEY = 'mecha-command.personal-best.v1';
  const MUSIC_DISABLED_KEY = 'armor-command.music-disabled.v1';
  const SFX_DISABLED_KEY = 'armor-command.sfx-disabled.v1';
  const ITCH_PAGE_URL = 'https://valarsbeard.itch.io/armor-command';
  const MUSIC_VOLUME = 0.72;
  const SFX_VOLUME = 0.45;
  const SFX_OUTPUT_VOLUME = 0.72;
  const KILL_CHIME_MAX_LEVEL = 9;
  const KILL_CHIME_DECAY_PER_SECOND = 1.35;
  const KILL_CHIME_HOLD_SECONDS = 0.85;
  const COMBO_WINDOW_SECONDS = 2.4;
  const COMBO_STEP = 0.25;
  const COMBO_MAX_MULTIPLIER = 8;
  const MINOR_PENTATONIC = [0, 3, 5, 7, 10];
  const MINOR_HEX = [0, 2, 3, 5, 7, 10];
  const MUSIC_TRACKS = [
    'assets/%E9%92%A2%E9%93%81%E8%8B%8D%E7%A9%B9%281%29.mp3',
    'assets/%E9%92%A2%E9%93%81%E8%8B%8D%E7%A9%B9%282%29.mp3',
    'assets/%E9%92%A2%E9%93%81%E8%8B%8D%E7%A9%B9%283%29.mp3',
    'assets/%E9%92%A2%E9%93%81%E8%8B%8D%E7%A9%B9.mp3',
    'assets/%E9%92%A2%E9%93%81%E9%98%B2%E7%BA%BF%281%29.mp3',
    'assets/%E9%92%A2%E9%93%81%E9%98%B2%E7%BA%BF%282%29.mp3',
    'assets/%E9%92%A2%E9%93%81%E9%98%B2%E7%BA%BF%283%29.mp3',
    'assets/%E9%92%A2%E9%93%81%E9%98%B2%E7%BA%BF.mp3',
    'assets/%E9%93%81%E5%B9%95%E9%98%B2%E5%BE%A1.mp3'
  ];
  const DEFAULT_MUSIC_KEY = { rootMidi: 64, scale: MINOR_PENTATONIC, label: 'E minor' };
  const MUSIC_TRACK_KEYS = {
    'assets/%E9%92%A2%E9%93%81%E8%8B%8D%E7%A9%B9%281%29.mp3': { rootMidi: 64, scale: MINOR_PENTATONIC, label: 'E minor' },
    'assets/%E9%92%A2%E9%93%81%E8%8B%8D%E7%A9%B9%282%29.mp3': { rootMidi: 64, scale: MINOR_HEX, label: 'E minor' },
    'assets/%E9%92%A2%E9%93%81%E8%8B%8D%E7%A9%B9%283%29.mp3': { rootMidi: 67, scale: MINOR_PENTATONIC, label: 'G minor' },
    'assets/%E9%92%A2%E9%93%81%E8%8B%8D%E7%A9%B9.mp3': { rootMidi: 64, scale: MINOR_PENTATONIC, label: 'E minor' },
    'assets/%E9%92%A2%E9%93%81%E9%98%B2%E7%BA%BF%281%29.mp3': { rootMidi: 62, scale: MINOR_PENTATONIC, label: 'D minor' },
    'assets/%E9%92%A2%E9%93%81%E9%98%B2%E7%BA%BF%282%29.mp3': { rootMidi: 62, scale: MINOR_HEX, label: 'D minor' },
    'assets/%E9%92%A2%E9%93%81%E9%98%B2%E7%BA%BF%283%29.mp3': { rootMidi: 65, scale: MINOR_PENTATONIC, label: 'F minor' },
    'assets/%E9%92%A2%E9%93%81%E9%98%B2%E7%BA%BF.mp3': { rootMidi: 62, scale: MINOR_PENTATONIC, label: 'D minor' },
    'assets/%E9%93%81%E5%B9%95%E9%98%B2%E5%BE%A1.mp3': { rootMidi: 66, scale: MINOR_PENTATONIC, label: 'F-sharp minor' }
  };
  const SFX_ASSETS = {
    ui_select_01: 'assets/sfx/ui_select_01.wav',
    ui_pause_01: 'assets/sfx/ui_pause_01.wav',
    ui_back_to_itch_01: 'assets/sfx/ui_back_to_itch_01.wav',
    upgrade_select_01: 'assets/sfx/upgrade_select_01.wav',
    missile_launch_01: 'assets/sfx/missile_launch_01.wav',
    turret_bolt_01: 'assets/sfx/turret_bolt_01.wav',
    drone_bolt_01: 'assets/sfx/drone_bolt_01.wav',
    shotgun_burst_01: 'assets/sfx/shotgun_burst_01.wav',
    heavy_pistol_01: 'assets/sfx/heavy_pistol_01.wav',
    enemy_pop_01: 'assets/sfx/enemy_pop_01.wav',
    player_missile_explosion_01: 'assets/sfx/player_missile_explosion_01.wav',
    base_impact_01: 'assets/sfx/base_impact_01.wav',
    base_breach_01: 'assets/sfx/base_breach_01.wav',
    wave_clear_01: 'assets/sfx/wave_clear_01.wav',
    wave_start_01: 'assets/sfx/wave_start_01.wav',
    base_low_alarm_loop_01: 'assets/sfx/base_low_alarm_loop_01.wav',
    missile_ready_tick_01: 'assets/sfx/missile_ready_tick_01.wav',
    drop_pod_break_01: 'assets/sfx/drop_pod_break_01.wav',
    trooper_rocket_launch_01: 'assets/sfx/trooper_rocket_launch_01.wav',
    trooper_shatter_01: 'assets/sfx/trooper_shatter_01.wav',
    enemy_rocket_pop_01: 'assets/sfx/enemy_rocket_pop_01.wav'
  };
  const SFX_PROFILES = {
    ui_select_01: { volume: 0.42, pitchCents: 18 },
    ui_pause_01: { volume: 0.42, pitchCents: 12 },
    ui_back_to_itch_01: { volume: 0.46, pitchCents: 8 },
    upgrade_select_01: { volume: 0.58, pitchCents: 12 },
    missile_launch_01: { volume: 0.96, pitchCents: 24 },
    turret_bolt_01: { volume: 0.68, pitchCents: 42 },
    drone_bolt_01: { volume: 0.44, pitchCents: 52 },
    shotgun_burst_01: { volume: 0.98, pitchCents: 26 },
    heavy_pistol_01: { volume: 1.0, pitchCents: 22 },
    enemy_pop_01: { volume: 0.50, pitchCents: 36 },
    player_missile_explosion_01: { volume: 0.90, pitchCents: 16 },
    base_impact_01: { volume: 1.0, pitchCents: 14 },
    base_breach_01: { volume: 1.0, pitchCents: 6 },
    wave_clear_01: { volume: 0.68, pitchCents: 6 },
    wave_start_01: { volume: 0.54, pitchCents: 10 },
    base_low_alarm_loop_01: { volume: 0.42, pitchCents: 6 },
    missile_ready_tick_01: { volume: 0.25, pitchCents: 18 },
    drop_pod_break_01: { volume: 0.92, pitchCents: 18 },
    trooper_rocket_launch_01: { volume: 0.58, pitchCents: 30 },
    trooper_shatter_01: { volume: 0.72, pitchCents: 24 },
    enemy_rocket_pop_01: { volume: 0.42, pitchCents: 38 }
  };

  const backgroundImage = new Image();
  backgroundImage.src = 'assets/backgrounds/armor_command_battlefield_bg_v1.png';

  const enemySheet = new Image();
  enemySheet.src = 'assets/enemies/drop_pod_enemy_sheet_alpha_v1.png';
  const enemySprites = {
    dropPod: { rect: [66, 90, 350, 480], anchor: [175, 255] },
    dropPodCracked: { rect: [455, 90, 350, 480], anchor: [175, 255] },
    paratrooper: { rect: [855, 48, 322, 512], anchor: [161, 286] },
    trooperFalling: { rect: [1200, 300, 255, 260], anchor: [128, 138] },
    enemyRocket: { rect: [620, 636, 260, 80], anchor: [130, 40] },
    shards: [
      { rect: [76, 772, 96, 130], anchor: [48, 65] },
      { rect: [284, 782, 128, 118], anchor: [64, 59] },
      { rect: [468, 782, 140, 116], anchor: [70, 58] },
      { rect: [656, 780, 96, 124], anchor: [48, 62] },
      { rect: [832, 786, 88, 88], anchor: [44, 44] },
      { rect: [1036, 792, 86, 78], anchor: [43, 39] },
      { rect: [1164, 792, 88, 80], anchor: [44, 40] },
      { rect: [1304, 772, 118, 104], anchor: [59, 52] }
    ]
  };

  const sheet = new Image();
  sheet.src = 'assets/mech/mecha_modular_sheet_alpha.png';
  const sprites = {
    mechFull: { rect: [72, 58, 394, 352], anchor: [197, 342] },
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


  const vehicleSheet = new Image();
  vehicleSheet.src = 'assets/vehicle/armor_vehicle_sheet_alpha.png';
  const vehicleSprites = {
    hull: { rect: [176, 128, 440, 182], anchor: [220, 170] },
    starterGun: { rect: [594, 152, 170, 96], anchor: [132, 72], muzzle: [16, 47] },
    missileBattery: { rect: [786, 144, 214, 108], anchor: [190, 54] },
    heavyGun: { rect: [1038, 154, 184, 100], anchor: [146, 76], muzzle: [18, 48] },
    shotgun: { rect: [1244, 158, 184, 96], anchor: [146, 74], muzzle: [18, 46] },
    drone: { rect: [286, 404, 154, 96], anchor: [78, 50], muzzle: [134, 30] },
    playerMissile: { rect: [492, 416, 160, 74], anchor: [80, 37] },
    bolt: { rect: [680, 418, 152, 70], anchor: [76, 35] },
    enemyMissile: { rect: [838, 418, 168, 76], anchor: [84, 38] },
    explosions: [
      { rect: [236, 730, 176, 138] },
      { rect: [412, 730, 176, 138] },
      { rect: [588, 730, 176, 138] },
      { rect: [764, 730, 176, 138] },
      { rect: [940, 730, 176, 138] },
      { rect: [1116, 730, 176, 138] }
    ]
  };

  const effectsSheet = new Image();
  effectsSheet.src = 'assets/effects/armor_command_effects_sheet_alpha_v1.png';
  const effectSprites = {
    explosions: [
      { rect: [44, 239, 154, 150], anchor: [0.5, 0.62] },
      { rect: [240, 143, 257, 262], anchor: [0.5, 0.62] },
      { rect: [500, 96, 382, 312], anchor: [0.5, 0.63] },
      { rect: [860, 99, 320, 309], anchor: [0.5, 0.63] },
      { rect: [1166, 130, 308, 276], anchor: [0.5, 0.58] },
      { rect: [1462, 168, 298, 232], anchor: [0.5, 0.56] }
    ],
    radiationClouds: [
      { rect: [48, 632, 132, 130], anchor: [0.5, 0.55] },
      { rect: [248, 532, 248, 248], anchor: [0.5, 0.55] },
      { rect: [520, 466, 343, 328], anchor: [0.5, 0.55] },
      { rect: [895, 452, 292, 346], anchor: [0.5, 0.55] },
      { rect: [1214, 494, 280, 292], anchor: [0.5, 0.55] },
      { rect: [1522, 538, 236, 238], anchor: [0.5, 0.55] }
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
    comboCount: 0,
    comboTimer: 0,
    comboMultiplier: 1,
    bestScore: 0,
    bestWave: 1,
    spawnLeft: 0,
    spawnTimer: 0,
    waveActive: false,
    flash: 0,
    armAngle: -Math.PI / 2,
    missileSide: -1,
    stats: {
      missileCooldown: 2.0,
      missileRackTimers: [0],
      missileRackCursor: 0,
      missileSequenceTimer: 0,
      missileSequenceDelay: 0.18,
      missileSpeed: 720,
      missileBatteries: 0,
      missileDamage: 1,
      piercerEnabled: false,
      piercerLevel: 0,
      piercerDamageBonus: 0,
      piercerMaxPierces: 0,
      splitterEnabled: false,
      splitterLevel: 0,
      splitterCount: 3,
      splitterDamageScale: 0.55,
      radiationEnabled: false,
      radiationLevel: 0,
      radiationDuration: 2.6,
      radiationRadius: 54,
      radiationDamage: 0.42,
      radiationTick: 0.22,
      radiationMaxClouds: 2,
      explosionRadius: 58,
      rifleCooldown: 0.085,
      rifleTimer: 0,
      rifleSpread: 0.05,
      bulletSpeed: 920,
      droneCooldown: 0.16,
      droneTimer: 0,
      droneCount: 0,
      droneType: 'gun',
      droneRadiationEnabled: false,
      droneInterceptorEnabled: false,
      droneFlameEnabled: false,
      droneFlameRange: 150,
      droneFlameWidth: 0.56,
      droneFlameDps: 3.1,
      droneFlameLevel: 0,
      shotgunEnabled: false,
      shotgunCooldown: 0.62,
      shotgunTimer: 0,
      shotgunRange: 1,
      shotgunPellets: 5,
      shotgunDamage: 1,
      heavyShotEnabled: false,
      heavyShotEvery: 6,
      rifleShots: 0,
      baseRepair: 0,
      treePicks: {},
      claimedCapstones: {}
    }
  };

  const musicPlayer = {
    audio: null,
    queue: [],
    currentTrack: '',
    started: false,
    blocked: false,
    disabled: false,
    wasPlayingBeforeBackground: false
  };

  const sfxState = {
    context: null,
    masterGain: null,
    compressor: null,
    outputGain: null,
    disabled: false,
    buffers: new Map(),
    bufferPromises: new Map(),
    killChimeLevel: 0,
    killChimeHold: 0,
    lowAlarmTimer: 0,
    wasRunningBeforeBackground: false
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
    lastTapY: 0,
    lastReleaseTime: -Infinity
  };

  const enemyMissiles = [];
  const dropPods = [];
  const paratroopers = [];
  const enemyRockets = [];
  const playerMissiles = [];
  const bullets = [];
  const explosions = [];
  const delayedExplosions = [];
  const radiationClouds = [];
  const flameCones = [];
  const sparks = [];
  const debris = [];

  const upgrades = [
    {
      title: 'Bigger Bursts',
      tree: 'missile',
      apply: () => { state.stats.explosionRadius += 24; },
      note: 'Missile explosions clear a much wider pocket.'
    },
    {
      title: 'Pistol Servo',
      tree: 'cannon',
      apply: () => { state.stats.rifleCooldown = Math.max(0.038, state.stats.rifleCooldown * 0.7); },
      note: 'The starter gun cycles dramatically faster during hold-fire.'
    },
    {
      title: 'Drone Bay',
      tree: 'drone',
      apply: () => {
        if (state.stats.droneCount < 4) state.stats.droneCount += 1;
        else state.stats.droneCooldown = Math.max(0.055, state.stats.droneCooldown * 0.68);
      },
      note: 'Adds a slave gun drone, up to four. Extra bays strongly improve sync speed.'
    },
    {
      title: 'Missile Battery',
      tree: 'missile',
      apply: () => {
        if (state.stats.missileBatteries < 5) state.stats.missileBatteries += 1;
        state.stats.missileSpeed += 170;
        state.stats.missileCooldown = Math.max(0.95, state.stats.missileCooldown * 0.82);
        syncMissileRackTimers();
      },
      note: 'Adds one independent missile rack. Racks fire in sequence and cool down separately.'
    },
    {
      title: 'Piercer Warheads',
      tree: 'missile',
      apply: () => {
        state.stats.piercerEnabled = true;
        state.stats.piercerLevel += 1;
        state.stats.piercerMaxPierces = Math.min(4, state.stats.piercerMaxPierces + 1);
        state.stats.piercerDamageBonus += 0.8;
        state.stats.missileSpeed += 70;
      },
      note: () => `Additive missile trait. Piercer level ${state.stats.piercerLevel} -> ${state.stats.piercerLevel + 1}; pierces ${state.stats.piercerMaxPierces} -> ${Math.min(4, state.stats.piercerMaxPierces + 1)}; direct damage bonus ${state.stats.piercerDamageBonus.toFixed(1)} -> ${(state.stats.piercerDamageBonus + 0.8).toFixed(1)}; missile speed +70.`
    },
    {
      title: 'Splitter Payloads',
      tree: 'missile',
      apply: () => {
        state.stats.splitterEnabled = true;
        state.stats.splitterLevel += 1;
        state.stats.splitterCount = Math.min(7, state.stats.splitterCount + 1);
        state.stats.splitterDamageScale += 0.08;
        state.stats.explosionRadius += 6;
      },
      note: () => `Additive missile trait. Splitter level ${state.stats.splitterLevel} -> ${state.stats.splitterLevel + 1}; child bursts ${state.stats.splitterCount} -> ${Math.min(7, state.stats.splitterCount + 1)}; child damage scale ${state.stats.splitterDamageScale.toFixed(2)} -> ${(state.stats.splitterDamageScale + 0.08).toFixed(2)}.`
    },
    {
      title: 'Bulwark Plating',
      tree: 'armor',
      apply: () => {
        state.base = Math.min(100, state.base + 36);
        state.stats.baseRepair += 2;
      },
      note: 'Patch the defended line and add light wave-start repair.'
    },
    {
      title: 'Scatter Barrel',
      tree: 'shotgun',
      apply: () => {
        state.stats.shotgunEnabled = true;
        state.stats.shotgunRange = Math.max(state.stats.shotgunRange, 2);
        state.stats.shotgunCooldown = Math.max(0.34, state.stats.shotgunCooldown * 0.8);
      },
      note: 'Adds a cone burst with twice the old range.'
    },
    {
      title: 'Shotgun Choke',
      tree: 'shotgun',
      requires: () => state.stats.shotgunEnabled,
      apply: () => {
        state.stats.shotgunRange += 0.55;
        state.stats.shotgunPellets += 2;
      },
      note: 'Shotgun pellets fly farther and the cone gains two more pellets.'
    },
    {
      title: 'Radioactive Canisters',
      tree: 'radiation',
      apply: () => {
        state.stats.radiationEnabled = true;
        state.stats.radiationLevel += 1;
        state.stats.radiationDuration += 0.45;
        state.stats.radiationRadius += 10;
        state.stats.radiationDamage += 0.1;
      },
      note: () => `Additive missile trait. Radiation level ${state.stats.radiationLevel} -> ${state.stats.radiationLevel + 1}; cloud radius ${Math.round(state.stats.radiationRadius)} -> ${Math.round(state.stats.radiationRadius + 10)}; duration ${state.stats.radiationDuration.toFixed(1)}s -> ${(state.stats.radiationDuration + 0.45).toFixed(1)}s; entry damage ${state.stats.radiationDamage.toFixed(2)} -> ${(state.stats.radiationDamage + 0.1).toFixed(2)}.`
    },
    {
      title: 'Radioactive Saturation',
      tree: 'radiation',
      requires: () => state.stats.radiationEnabled,
      apply: () => {
        state.stats.radiationMaxClouds += 1;
        state.stats.radiationDamage += 0.22;
        state.stats.radiationTick = Math.max(0.14, state.stats.radiationTick * 0.82);
      },
      note: () => `Nested radiation buff. Clouds ${state.stats.radiationMaxClouds} -> ${state.stats.radiationMaxClouds + 1}; exposure damage ${state.stats.radiationDamage.toFixed(2)} -> ${(state.stats.radiationDamage + 0.22).toFixed(2)}; tick interval ${state.stats.radiationTick.toFixed(2)}s -> ${Math.max(0.14, state.stats.radiationTick * 0.82).toFixed(2)}s.`
    },
    {
      title: 'Heavy Pistol Link',
      tree: 'cannon',
      apply: () => { state.stats.heavyShotEnabled = true; state.stats.heavyShotEvery = Math.max(2, state.stats.heavyShotEvery - 2); },
      note: 'Every few main-gun shots punches out a heavy round more often.'
    },
    {
      title: 'Radio Drone Conversion',
      tree: 'drone',
      requires: () => state.stats.droneCount > 0,
      apply: () => {
        state.stats.droneRadiationEnabled = true;
        state.stats.radiationEnabled = true;
        state.stats.radiationMaxClouds += 1;
      },
      note: () => `Additive drone trait. Drones seed radioactive clouds and raise cloud cap ${state.stats.radiationMaxClouds} -> ${state.stats.radiationMaxClouds + 1}.`
    },
    {
      title: 'Interceptor Drone Link',
      tree: 'drone',
      requires: () => state.stats.droneCount > 0,
      apply: () => {
        state.stats.droneInterceptorEnabled = true;
        state.stats.droneCooldown = Math.max(0.07, state.stats.droneCooldown * 0.75);
      },
      note: () => `Additive drone trait. Drones keep normal fire and also snap shots at nearest hostiles. Sync cooldown ${state.stats.droneCooldown.toFixed(2)}s -> ${Math.max(0.07, state.stats.droneCooldown * 0.75).toFixed(2)}s.`
    },
    {
      title: 'Flamethrower Drone Branch',
      tree: 'drone',
      requires: () => state.stats.droneCount > 0,
      apply: () => {
        state.stats.droneFlameEnabled = true;
        state.stats.droneFlameLevel += 1;
        state.stats.droneFlameRange += 22;
        state.stats.droneFlameDps += 0.75;
        state.stats.droneFlameWidth += 0.035;
      },
      note: () => `Additive drone trait. Auto close-defense flame level ${state.stats.droneFlameLevel} -> ${state.stats.droneFlameLevel + 1}; range ${Math.round(state.stats.droneFlameRange)} -> ${Math.round(state.stats.droneFlameRange + 22)}; DPS ${state.stats.droneFlameDps.toFixed(1)} -> ${(state.stats.droneFlameDps + 0.75).toFixed(1)}.`
    }
  ];

  const capstoneUpgrades = [
    {
      title: 'CAPSTONE: Salvo Doctrine',
      tree: 'missile',
      apply: () => {
        state.stats.missileCooldown = Math.max(0.72, state.stats.missileCooldown * 0.72);
        state.stats.missileDamage += 1;
      },
      note: 'Missile racks reload faster and every missile hits harder.'
    },
    {
      title: 'CAPSTONE: Fallout Zone',
      tree: 'radiation',
      apply: () => {
        state.stats.radiationDuration += 1.4;
        state.stats.radiationRadius += 22;
        state.stats.radiationMaxClouds += 2;
      },
      note: 'Radioactive clouds become larger, longer-lived fallout zones.'
    },
    {
      title: 'CAPSTONE: Wing Commander',
      tree: 'drone',
      apply: () => {
        state.stats.droneCount = Math.max(state.stats.droneCount, 4);
        state.stats.droneCooldown = Math.max(0.052, state.stats.droneCooldown * 0.65);
        state.stats.droneFlameRange += state.stats.droneFlameEnabled ? 28 : 0;
        state.stats.droneFlameDps += state.stats.droneFlameEnabled ? 0.9 : 0;
      },
      note: 'Field a full drone wing with tighter sync speed.'
    },
    {
      title: 'CAPSTONE: Street Sweeper',
      tree: 'shotgun',
      apply: () => {
        state.stats.shotgunEnabled = true;
        state.stats.shotgunPellets += 5;
        state.stats.shotgunDamage += 1;
      },
      note: 'Shotgun blasts throw many more pellets and crack armor harder.'
    },
    {
      title: 'CAPSTONE: Overbuilt Line',
      tree: 'armor',
      apply: () => {
        state.stats.baseRepair += 8;
        state.base = Math.min(120, state.base + 45);
      },
      note: 'The defended line repairs heavily between waves and can overcap briefly.'
    },
    {
      title: 'CAPSTONE: Hammer Cycle',
      tree: 'cannon',
      apply: () => {
        state.stats.heavyShotEnabled = true;
        state.stats.heavyShotEvery = 2;
        state.stats.rifleCooldown = Math.max(0.034, state.stats.rifleCooldown * 0.78);
      },
      note: 'Main gun cadence and heavy-shot rhythm both spike.'
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

  function loadPersonalBest() {
    try {
      const current = localStorage.getItem(PERSONAL_BEST_KEY);
      const legacy = localStorage.getItem(LEGACY_PERSONAL_BEST_KEY);
      const saved = JSON.parse(current || legacy || '{}');
      state.bestScore = Math.max(0, Number(saved.score) || 0);
      state.bestWave = Math.max(1, Number(saved.wave) || 1);
      if (!current && legacy) {
        localStorage.setItem(PERSONAL_BEST_KEY, JSON.stringify({ score: state.bestScore, wave: state.bestWave }));
      }
    } catch (_) {
      state.bestScore = 0;
      state.bestWave = 1;
    }
  }

  function recordPersonalBest() {
    const nextScore = Math.max(state.bestScore, state.score);
    const nextWave = Math.max(state.bestWave, state.wave);
    if (nextScore === state.bestScore && nextWave === state.bestWave) return false;
    state.bestScore = nextScore;
    state.bestWave = nextWave;
    try {
      localStorage.setItem(PERSONAL_BEST_KEY, JSON.stringify({ score: state.bestScore, wave: state.bestWave }));
    } catch (_) {}
    return true;
  }

  function bestLine(prefix = 'Best') {
    return `${prefix}: score ${state.bestScore} / wave ${state.bestWave}`;
  }


  function shuffledMusicTracks() {
    const tracks = [...MUSIC_TRACKS];
    for (let i = tracks.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    if (tracks.length > 1 && tracks[0] === musicPlayer.currentTrack) {
      [tracks[0], tracks[1]] = [tracks[1], tracks[0]];
    }
    return tracks;
  }

  function loadMusicPreference() {
    try {
      musicPlayer.disabled = localStorage.getItem(MUSIC_DISABLED_KEY) === 'true';
    } catch (_) {
      musicPlayer.disabled = false;
    }
    updateMusicToggleLabel();
  }

  function saveMusicPreference() {
    try {
      localStorage.setItem(MUSIC_DISABLED_KEY, musicPlayer.disabled ? 'true' : 'false');
    } catch (_) {}
  }

  function updateMusicToggleLabel() {
    if (!musicBtn) return;
    musicBtn.textContent = musicPlayer.disabled ? 'MUT' : 'MUS';
    musicBtn.setAttribute('aria-label', musicPlayer.disabled ? 'Music muted' : 'Music playing');
  }

  function ensureMusicAudio() {
    if (!MUSIC_TRACKS.length || typeof Audio === 'undefined') return null;
    if (musicPlayer.audio) return musicPlayer.audio;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = MUSIC_VOLUME;
    audio.addEventListener('ended', () => {
      if (!musicPlayer.disabled) playNextMusicTrack();
    });
    audio.addEventListener('error', () => {
      if (!musicPlayer.disabled) playNextMusicTrack();
    });
    musicPlayer.audio = audio;
    return audio;
  }

  function stopMusicPlayback() {
    if (!musicPlayer.audio) return;
    musicPlayer.audio.pause();
  }

  function playNextMusicTrack() {
    if (musicPlayer.disabled) return;
    const audio = ensureMusicAudio();
    if (!audio) return;
    if (!musicPlayer.queue.length) musicPlayer.queue = shuffledMusicTracks();
    const track = musicPlayer.queue.shift();
    if (!track) return;
    musicPlayer.currentTrack = track;
    audio.src = track;
    audio.loop = MUSIC_TRACKS.length <= 1;
    audio.volume = MUSIC_VOLUME;
    musicPlayer.started = true;
    audio.play().then(() => {
      musicPlayer.blocked = false;
    }).catch(() => {
      musicPlayer.blocked = true;
    });
  }

  function startMusicPlayback() {
    if (musicPlayer.disabled) return;
    const audio = ensureMusicAudio();
    if (!audio) return;
    if (!musicPlayer.currentTrack) {
      playNextMusicTrack();
      return;
    }
    if (!audio.paused) return;
    musicPlayer.started = true;
    audio.play().then(() => {
      musicPlayer.blocked = false;
    }).catch(() => {
      musicPlayer.blocked = true;
    });
  }

  function toggleMusicPlayback() {
    musicPlayer.disabled = !musicPlayer.disabled;
    saveMusicPreference();
    updateMusicToggleLabel();
    if (musicPlayer.disabled) stopMusicPlayback();
    else startMusicPlayback();
  }

  function loadSfxPreference() {
    try {
      sfxState.disabled = localStorage.getItem(SFX_DISABLED_KEY) === 'true';
    } catch (_) {
      sfxState.disabled = false;
    }
    updateSfxOutputGain();
  }

  function saveSfxPreference() {
    try {
      localStorage.setItem(SFX_DISABLED_KEY, sfxState.disabled ? 'true' : 'false');
    } catch (_) {}
  }

  function updateSfxOutputGain() {
    if (sfxState.outputGain) sfxState.outputGain.gain.value = sfxState.disabled ? 0 : SFX_OUTPUT_VOLUME;
  }

  function sfxToggleText() {
    return sfxState.disabled ? 'SFX On' : 'SFX Off';
  }

  function toggleSfxPlayback() {
    sfxState.disabled = !sfxState.disabled;
    saveSfxPreference();
    updateSfxOutputGain();
  }

  function pauseMusicForBackground() {
    if (!musicPlayer.audio || musicPlayer.audio.paused) return;
    musicPlayer.wasPlayingBeforeBackground = true;
    musicPlayer.audio.pause();
  }

  function resumeMusicFromBackground() {
    if (!musicPlayer.wasPlayingBeforeBackground) return;
    musicPlayer.wasPlayingBeforeBackground = false;
    if (!musicPlayer.disabled && musicPlayer.started) startMusicPlayback();
  }

  function handleMusicVisibilityChange() {
    if (document.hidden) {
      pauseMusicForBackground();
      pauseSfxForBackground();
    } else {
      resumeMusicFromBackground();
      resumeSfxFromBackground();
    }
  }

  function handleWindowFocus() {
    if (!document.hidden) {
      resumeMusicFromBackground();
      resumeSfxFromBackground();
    }
  }


  function audioContextClass() {
    return window.AudioContext || window.webkitAudioContext || null;
  }

  function ensureSfxContext() {
    const Ctx = audioContextClass();
    if (!Ctx) return null;
    if (!sfxState.context) {
      sfxState.context = new Ctx();
      sfxState.masterGain = sfxState.context.createGain();
      sfxState.compressor = sfxState.context.createDynamicsCompressor();
      sfxState.outputGain = sfxState.context.createGain();
      sfxState.masterGain.gain.value = 1;
      sfxState.outputGain.gain.value = sfxState.disabled ? 0 : SFX_OUTPUT_VOLUME;
      sfxState.compressor.threshold.value = -18;
      sfxState.compressor.knee.value = 16;
      sfxState.compressor.ratio.value = 3.4;
      sfxState.compressor.attack.value = 0.003;
      sfxState.compressor.release.value = 0.12;
      sfxState.masterGain.connect(sfxState.compressor);
      sfxState.compressor.connect(sfxState.outputGain);
      sfxState.outputGain.connect(sfxState.context.destination);
    }
    if (sfxState.context.state === 'suspended') sfxState.context.resume().catch(() => {});
    return sfxState.context;
  }

  function startAudioSystems() {
    ensureSfxContext();
    preloadSfxBuffers();
    startMusicPlayback();
  }

  function randomPitchRatio(cents = 18) {
    return 2 ** (((Math.random() * 2 - 1) * cents) / 1200);
  }

  function midiToHz(midi) {
    return 440 * (2 ** ((midi - 69) / 12));
  }

  function currentMusicKey() {
    return MUSIC_TRACK_KEYS[musicPlayer.currentTrack] || DEFAULT_MUSIC_KEY;
  }

  function keyedChimeFrequency(level) {
    const key = currentMusicKey();
    const scale = key.scale || DEFAULT_MUSIC_KEY.scale;
    const step = clamp(Math.round(level) - 1, 0, KILL_CHIME_MAX_LEVEL - 1);
    const octave = Math.floor(step / scale.length);
    const degree = scale[step % scale.length];
    return midiToHz((key.rootMidi || DEFAULT_MUSIC_KEY.rootMidi) + degree + octave * 12);
  }

  function variedGain(volume, spread = 0.12) {
    return Math.max(0.0001, volume * SFX_VOLUME * (1 + (Math.random() * 2 - 1) * spread));
  }


  function sfxOutput() {
    return sfxState.masterGain || ensureSfxContext()?.destination || null;
  }

  function loadSfxBuffer(id) {
    const ctxAudio = ensureSfxContext();
    const url = SFX_ASSETS[id];
    if (!ctxAudio || !url) return null;
    if (sfxState.buffers.has(id)) return Promise.resolve(sfxState.buffers.get(id));
    if (sfxState.bufferPromises.has(id)) return sfxState.bufferPromises.get(id);
    const promise = fetch(url)
      .then(response => response.arrayBuffer())
      .then(data => ctxAudio.decodeAudioData(data))
      .then(buffer => {
        sfxState.buffers.set(id, buffer);
        return buffer;
      })
      .catch(() => null);
    sfxState.bufferPromises.set(id, promise);
    return promise;
  }

  function preloadSfxBuffers() {
    for (const id of Object.keys(SFX_ASSETS)) loadSfxBuffer(id);
  }

  function playBufferedSfx(id) {
    if (sfxState.disabled) return false;
    const ctxAudio = ensureSfxContext();
    const buffer = sfxState.buffers.get(id);
    const output = sfxOutput();
    if (!ctxAudio || !buffer || !output) {
      loadSfxBuffer(id);
      return false;
    }
    const profile = SFX_PROFILES[id] || { volume: 0.6, pitchCents: 18 };
    const source = ctxAudio.createBufferSource();
    const gain = ctxAudio.createGain();
    source.buffer = buffer;
    source.playbackRate.value = randomPitchRatio(profile.pitchCents || 18);
    gain.gain.value = variedGain(profile.volume || 0.6, 0.10);
    source.connect(gain);
    gain.connect(output);
    source.start();
    return true;
  }

  function playTone({ frequency, duration = 0.12, type = 'sine', volume = 0.18, attack = 0.006, release = 0.05, randomCents = 18, delay = 0 }) {
    if (sfxState.disabled) return false;
    const ctxAudio = ensureSfxContext();
    if (!ctxAudio) return;
    const now = ctxAudio.currentTime + delay;
    const osc = ctxAudio.createOscillator();
    const gain = ctxAudio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency * randomPitchRatio(randomCents), now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(variedGain(volume), now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
    osc.connect(gain);
    gain.connect(sfxOutput() || ctxAudio.destination);
    osc.start(now);
    osc.stop(now + duration + release + 0.02);
  }

  function playSweep({ from, to, duration = 0.16, type = 'sawtooth', volume = 0.12, attack = 0.004, release = 0.05, randomCents = 16 }) {
    if (sfxState.disabled) return false;
    const ctxAudio = ensureSfxContext();
    if (!ctxAudio) return;
    const now = ctxAudio.currentTime;
    const ratio = randomPitchRatio(randomCents);
    const osc = ctxAudio.createOscillator();
    const gain = ctxAudio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from * ratio, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to * ratio), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(variedGain(volume), now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
    osc.connect(gain);
    gain.connect(sfxOutput() || ctxAudio.destination);
    osc.start(now);
    osc.stop(now + duration + release + 0.02);
  }

  function playNoise({ duration = 0.08, volume = 0.08, filter = 'bandpass', frequency = 900, q = 0.9, release = 0.03 }) {
    if (sfxState.disabled) return false;
    const ctxAudio = ensureSfxContext();
    if (!ctxAudio) return;
    const now = ctxAudio.currentTime;
    const length = Math.max(1, Math.floor(ctxAudio.sampleRate * duration));
    const buffer = ctxAudio.createBuffer(1, length, ctxAudio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctxAudio.createBufferSource();
    const biquad = ctxAudio.createBiquadFilter();
    const gain = ctxAudio.createGain();
    source.buffer = buffer;
    source.playbackRate.value = 0.92 + Math.random() * 0.18;
    biquad.type = filter;
    biquad.frequency.value = frequency * randomPitchRatio(120);
    biquad.Q.value = q;
    gain.gain.setValueAtTime(variedGain(volume), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
    source.connect(biquad);
    biquad.connect(gain);
    gain.connect(sfxOutput() || ctxAudio.destination);
    source.start(now);
    source.stop(now + duration + release + 0.02);
  }

  function playProceduralSfx(id) {
    if (sfxState.disabled) return false;
    if (playBufferedSfx(id)) return;
    switch (id) {
      case 'ui_select_01':
        playTone({ frequency: 880, duration: 0.045, type: 'triangle', volume: 0.10, release: 0.025, randomCents: 20 });
        playTone({ frequency: 1320, duration: 0.04, type: 'sine', volume: 0.055, release: 0.02, randomCents: 18, delay: 0.025 });
        break;
      case 'ui_pause_01':
        playTone({ frequency: 260, duration: 0.055, type: 'square', volume: 0.075, release: 0.035, randomCents: 15 });
        playTone({ frequency: 620, duration: 0.04, type: 'triangle', volume: 0.055, release: 0.025, randomCents: 18, delay: 0.035 });
        break;
      case 'ui_back_to_itch_01':
        playSweep({ from: 720, to: 220, duration: 0.18, type: 'triangle', volume: 0.10, release: 0.05, randomCents: 10 });
        break;
      case 'upgrade_select_01':
        playNoise({ duration: 0.09, volume: 0.13, filter: 'lowpass', frequency: 1200, q: 0.7, release: 0.04 });
        playTone({ frequency: 523, duration: 0.06, type: 'triangle', volume: 0.075, release: 0.04, randomCents: 14, delay: 0.045 });
        playTone({ frequency: 784, duration: 0.11, type: 'sine', volume: 0.08, release: 0.06, randomCents: 14, delay: 0.09 });
        break;
      case 'missile_launch_01':
        playNoise({ duration: 0.18, volume: 0.13, filter: 'lowpass', frequency: 760, q: 0.8, release: 0.04 });
        playSweep({ from: 130, to: 390, duration: 0.18, type: 'sawtooth', volume: 0.08, release: 0.035, randomCents: 35 });
        break;
      case 'turret_bolt_01':
        playTone({ frequency: 760, duration: 0.032, type: 'square', volume: 0.07, attack: 0.002, release: 0.022, randomCents: 45 });
        playNoise({ duration: 0.035, volume: 0.035, filter: 'highpass', frequency: 2200, q: 0.4, release: 0.012 });
        break;
      case 'drone_bolt_01':
        playTone({ frequency: 1040, duration: 0.028, type: 'triangle', volume: 0.052, attack: 0.002, release: 0.018, randomCents: 55 });
        break;
      case 'shotgun_burst_01':
        playNoise({ duration: 0.13, volume: 0.18, filter: 'bandpass', frequency: 980, q: 0.55, release: 0.035 });
        playTone({ frequency: 170, duration: 0.065, type: 'triangle', volume: 0.065, attack: 0.002, release: 0.04, randomCents: 30 });
        break;
      case 'heavy_pistol_01':
        playTone({ frequency: 190, duration: 0.06, type: 'square', volume: 0.12, attack: 0.002, release: 0.035, randomCents: 25 });
        playNoise({ duration: 0.06, volume: 0.08, filter: 'bandpass', frequency: 1400, q: 0.8, release: 0.02 });
        break;
      case 'enemy_pop_01':
        playNoise({ duration: 0.08, volume: 0.08, filter: 'bandpass', frequency: 1800, q: 1.6, release: 0.03 });
        playSweep({ from: 620, to: 1160, duration: 0.07, type: 'triangle', volume: 0.045, release: 0.035, randomCents: 40 });
        break;
      case 'player_missile_explosion_01':
        playNoise({ duration: 0.24, volume: 0.16, filter: 'lowpass', frequency: 1250, q: 0.65, release: 0.08 });
        playTone({ frequency: 92, duration: 0.13, type: 'triangle', volume: 0.075, attack: 0.003, release: 0.08, randomCents: 20 });
        break;
      case 'base_impact_01':
        playNoise({ duration: 0.24, volume: 0.18, filter: 'lowpass', frequency: 620, q: 0.8, release: 0.08 });
        playTone({ frequency: 82, duration: 0.16, type: 'sawtooth', volume: 0.13, attack: 0.003, release: 0.09, randomCents: 16 });
        break;
      case 'base_breach_01':
        playProceduralSfx('base_impact_01');
        playSweep({ from: 440, to: 110, duration: 0.62, type: 'sawtooth', volume: 0.12, release: 0.18, randomCents: 8 });
        playTone({ frequency: 196, duration: 0.18, type: 'square', volume: 0.09, release: 0.12, randomCents: 10, delay: 0.18 });
        break;
      case 'wave_clear_01':
        playTone({ frequency: 392, duration: 0.10, type: 'triangle', volume: 0.10, release: 0.05, randomCents: 10 });
        playTone({ frequency: 587, duration: 0.12, type: 'triangle', volume: 0.10, release: 0.06, randomCents: 10, delay: 0.10 });
        playTone({ frequency: 784, duration: 0.22, type: 'sine', volume: 0.13, release: 0.12, randomCents: 8, delay: 0.22 });
        break;
      case 'wave_start_01':
        playSweep({ from: 300, to: 720, duration: 0.24, type: 'triangle', volume: 0.09, release: 0.05, randomCents: 14 });
        playTone({ frequency: 440, duration: 0.055, type: 'square', volume: 0.055, release: 0.03, randomCents: 18, delay: 0.24 });
        break;
      case 'base_low_alarm_loop_01':
        playTone({ frequency: 196, duration: 0.085, type: 'sawtooth', volume: 0.07, release: 0.045, randomCents: 8 });
        playTone({ frequency: 147, duration: 0.085, type: 'sawtooth', volume: 0.055, release: 0.045, randomCents: 8, delay: 0.11 });
        break;
      case 'missile_ready_tick_01':
        playTone({ frequency: 1180, duration: 0.025, type: 'sine', volume: 0.035, attack: 0.001, release: 0.015, randomCents: 24 });
        break;
      case 'drop_pod_break_01':
        playNoise({ duration: 0.20, volume: 0.18, filter: 'lowpass', frequency: 920, q: 0.7, release: 0.08 });
        playTone({ frequency: 118, duration: 0.12, type: 'sawtooth', volume: 0.12, attack: 0.002, release: 0.08, randomCents: 18 });
        break;
      case 'trooper_rocket_launch_01':
        playSweep({ from: 170, to: 480, duration: 0.13, type: 'sawtooth', volume: 0.08, release: 0.035, randomCents: 30 });
        playNoise({ duration: 0.09, volume: 0.08, filter: 'bandpass', frequency: 1000, q: 0.8, release: 0.025 });
        break;
      case 'trooper_shatter_01':
        playNoise({ duration: 0.18, volume: 0.13, filter: 'bandpass', frequency: 1200, q: 0.9, release: 0.07 });
        playTone({ frequency: 220, duration: 0.08, type: 'triangle', volume: 0.08, attack: 0.002, release: 0.06, randomCents: 24 });
        break;
      case 'enemy_rocket_pop_01':
        playSweep({ from: 840, to: 1420, duration: 0.045, type: 'triangle', volume: 0.055, release: 0.025, randomCents: 38 });
        playNoise({ duration: 0.045, volume: 0.045, filter: 'highpass', frequency: 1700, q: 0.5, release: 0.015 });
        break;
      default:
        break;
    }
  }

  function playEnemySlainChime() {
    sfxState.killChimeLevel = clamp(sfxState.killChimeLevel + 1, 0, KILL_CHIME_MAX_LEVEL);
    sfxState.killChimeHold = KILL_CHIME_HOLD_SECONDS;
    const frequency = keyedChimeFrequency(sfxState.killChimeLevel);
    playTone({ frequency, duration: 0.11, type: 'triangle', volume: 0.22, attack: 0.003, release: 0.08, randomCents: 10 });
    playTone({ frequency: frequency * 2, duration: 0.075, type: 'sine', volume: 0.07, attack: 0.002, release: 0.05, randomCents: 16 });
  }

  function updateSfx(dt) {
    sfxState.killChimeHold = Math.max(0, sfxState.killChimeHold - dt);
    if (sfxState.killChimeHold <= 0) {
      sfxState.killChimeLevel = Math.max(0, sfxState.killChimeLevel - dt * KILL_CHIME_DECAY_PER_SECOND);
    }
    if (state.status === 'playing' && !state.paused && state.base <= 30) {
      sfxState.lowAlarmTimer -= dt;
      if (sfxState.lowAlarmTimer <= 0) {
        playProceduralSfx('base_low_alarm_loop_01');
        sfxState.lowAlarmTimer = 0.78;
      }
    } else {
      sfxState.lowAlarmTimer = 0;
    }
  }

  function pauseSfxForBackground() {
    if (!sfxState.context || sfxState.context.state !== 'running') return;
    sfxState.wasRunningBeforeBackground = true;
    sfxState.context.suspend().catch(() => {});
  }

  function resumeSfxFromBackground() {
    if (!sfxState.wasRunningBeforeBackground) return;
    sfxState.wasRunningBeforeBackground = false;
    if (sfxState.context && sfxState.context.state === 'suspended') sfxState.context.resume().catch(() => {});
  }

  function comboMultiplierFor(count = state.comboCount) {
    if (count <= 0) return 1;
    return clamp(1 + (count - 1) * COMBO_STEP, 1, COMBO_MAX_MULTIPLIER);
  }

  function resetCombo() {
    state.comboCount = 0;
    state.comboTimer = 0;
    state.comboMultiplier = 1;
  }

  function registerKill(basePoints) {
    state.comboCount += 1;
    state.comboTimer = COMBO_WINDOW_SECONDS;
    state.comboMultiplier = comboMultiplierFor();
    const earned = Math.round(basePoints * state.comboMultiplier);
    state.score += earned;
    state.scrap += 1;
    playEnemySlainChime();
    return earned;
  }

  function slayEnemy(enemy, points, burstRadius = 0) {
    if (!enemy.alive) return false;
    enemy.alive = false;
    registerKill(points);
    playProceduralSfx(enemy.type === 'rocket' ? 'enemy_rocket_pop_01' : 'enemy_pop_01');
    addSparks(enemy.x, enemy.y, enemy.type === 'rocket' ? '#ff9f55' : '#ffd966', enemy.type === 'rocket' ? 5 : 8, enemy.type === 'rocket' ? 90 : 130);
    if (burstRadius > 0) addExplosion(enemy.x, enemy.y, burstRadius, 'player');
    return true;
  }

  function updateCombo(dt) {
    if (state.comboCount <= 0) return;
    state.comboTimer = Math.max(0, state.comboTimer - dt);
    if (state.comboTimer <= 0) resetCombo();
  }

  function upgradeNote(upgrade) {
    return typeof upgrade.note === 'function' ? upgrade.note() : upgrade.note;
  }

  function upgradeLabel(upgrade) {
    const tree = upgrade.tree ? ` [${upgrade.tree.toUpperCase()} ${treePickCount(upgrade.tree) + 1}]` : '';
    return `${upgrade.title}${tree}`;
  }

  function setOverlay(kind, options = []) {
    overlay.classList.remove('is-hidden');
    const panel = overlay.querySelector('.overlay__panel');
    panel.className = kind === 'menu' ? 'overlay__panel overlay__panel--title' : 'overlay__panel';
    if (kind === 'menu') {
      panel.innerHTML = `<div class="title-kicker">HTML5 prototype</div><h1 class="title-logo">ARMOR<br>COMMAND</h1><p class="title-line">Hold the line. Break the sky.</p><p class="title-best">${bestLine()}</p><button id="startBtn2" type="button">New Run</button><button id="titleMusicBtn" class="secondary" type="button">${musicPlayer.disabled ? 'Music On' : 'Music Off'}</button><button id="titleSfxBtn" class="secondary" type="button">${sfxToggleText()}</button><button id="titleExitFullscreenBtn" class="secondary" type="button">Exit Fullscreen</button><button id="titleItchBtn" class="linkish" type="button">Back to Itch Page</button>`;
      panel.querySelector('#startBtn2').addEventListener('click', () => { startAudioSystems(); playProceduralSfx('ui_select_01'); startGame(); });
      panel.querySelector('#titleMusicBtn').addEventListener('click', () => { startAudioSystems(); playProceduralSfx('ui_select_01'); toggleMusicPlayback(); setOverlay('menu'); });
      panel.querySelector('#titleSfxBtn').addEventListener('click', () => { startAudioSystems(); const wasDisabled = sfxState.disabled; toggleSfxPlayback(); if (wasDisabled) playProceduralSfx('ui_select_01'); setOverlay('menu'); });
      panel.querySelector('#titleExitFullscreenBtn').addEventListener('click', () => { startAudioSystems(); playProceduralSfx('ui_select_01'); exitFullscreenToTitle(); });
      panel.querySelector('#titleItchBtn').addEventListener('click', () => { startAudioSystems(); playProceduralSfx('ui_back_to_itch_01'); openItchPage(); });
      return;
    }
    if (kind === 'pause') {
      panel.innerHTML = `<h1>PAUSED</h1><p>Score ${state.score} / Wave ${state.wave}</p><p>${bestLine()}</p><button id="resumeBtn" type="button">Resume</button><button id="exitBtn" class="secondary" type="button">Exit to Title</button><button id="pauseMusicBtn" class="secondary" type="button">${musicPlayer.disabled ? 'Music On' : 'Music Off'}</button><button id="pauseSfxBtn" class="secondary" type="button">${sfxToggleText()}</button><button id="pauseExitFullscreenBtn" class="secondary" type="button">Exit Fullscreen</button><button id="pauseItchBtn" class="linkish" type="button">Back to Itch Page</button>`;
      panel.querySelector('#resumeBtn').addEventListener('click', () => { startAudioSystems(); playProceduralSfx('ui_select_01'); resumeGame(); });
      panel.querySelector('#exitBtn').addEventListener('click', () => { startAudioSystems(); playProceduralSfx('ui_back_to_itch_01'); exitToMenu(); });
      panel.querySelector('#pauseMusicBtn').addEventListener('click', () => { startAudioSystems(); playProceduralSfx('ui_select_01'); toggleMusicPlayback(); setOverlay('pause'); });
      panel.querySelector('#pauseSfxBtn').addEventListener('click', () => { startAudioSystems(); const wasDisabled = sfxState.disabled; toggleSfxPlayback(); if (wasDisabled) playProceduralSfx('ui_select_01'); setOverlay('pause'); });
      panel.querySelector('#pauseExitFullscreenBtn').addEventListener('click', () => { startAudioSystems(); playProceduralSfx('ui_select_01'); exitFullscreenToTitle(); });
      panel.querySelector('#pauseItchBtn').addEventListener('click', () => { startAudioSystems(); playProceduralSfx('ui_back_to_itch_01'); openItchPage(); });
      return;
    }
    if (kind === 'clear') {
      const buttons = options.map((u, i) => `<button data-upgrade="${i}" type="button">${upgradeLabel(u)}</button><p>${upgradeNote(u)}</p>`).join('');
      recordPersonalBest();
      panel.innerHTML = `<h1>WAVE ${state.wave} CLEAR</h1><p>${bestLine()}</p><p>Choose a hardpoint upgrade.</p>${buttons}`;
      for (const btn of panel.querySelectorAll('button[data-upgrade]')) {
        btn.addEventListener('click', () => {
          const upgrade = options[Number(btn.dataset.upgrade)];
          startAudioSystems();
          playProceduralSfx('upgrade_select_01');
          claimUpgrade(upgrade);
          state.wave += 1;
          startWave();
          overlay.classList.add('is-hidden');
        });
      }
      return;
    }
    if (kind === 'gameover') {
      playProceduralSfx('base_breach_01');
      const isRecord = recordPersonalBest();
      panel.innerHTML = `<h1>BREACH</h1><p>Score ${state.score} / Wave ${state.wave}</p><p>${bestLine(isRecord ? 'New best' : 'Best')}</p><button id="restartBtn" type="button">Restart</button>`;
      panel.querySelector('button').addEventListener('click', startGame);
    }
  }

  function startGame() {
    startAudioSystems();
    overlay.classList.add('is-hidden');
    state.status = 'playing';
    state.paused = false;
    pauseBtn.textContent = 'II';
    resetInput();
    state.wave = 1;
    state.base = 100;
    state.score = 0;
    state.scrap = 0;
    resetCombo();
    state.flash = 0;
    state.stats.missileCooldown = 2.0;
    state.stats.missileRackTimers = [0];
    state.stats.missileRackCursor = 0;
    state.stats.missileSequenceTimer = 0;
    state.stats.missileSequenceDelay = 0.18;
    state.stats.missileSpeed = 720;
    state.stats.missileBatteries = 0;
    state.stats.missileDamage = 1;
    state.stats.piercerEnabled = false;
    state.stats.piercerLevel = 0;
    state.stats.piercerDamageBonus = 0;
    state.stats.piercerMaxPierces = 0;
    state.stats.splitterEnabled = false;
    state.stats.splitterLevel = 0;
    state.stats.splitterCount = 3;
    state.stats.splitterDamageScale = 0.55;
    state.stats.radiationEnabled = false;
    state.stats.radiationLevel = 0;
    state.stats.radiationDuration = 2.6;
    state.stats.radiationRadius = 54;
    state.stats.radiationDamage = 0.42;
    state.stats.radiationTick = 0.22;
    state.stats.radiationMaxClouds = 2;
    state.stats.explosionRadius = 58;
    state.stats.rifleCooldown = 0.085;
    state.stats.rifleTimer = 0;
    state.stats.rifleSpread = 0.05;
    state.stats.bulletSpeed = 920;
    state.stats.droneCooldown = 0.16;
    state.stats.droneTimer = 0;
    state.stats.droneCount = 0;
    state.stats.droneType = 'gun';
    state.stats.droneRadiationEnabled = false;
    state.stats.droneInterceptorEnabled = false;
    state.stats.droneFlameEnabled = false;
    state.stats.droneFlameRange = 150;
    state.stats.droneFlameWidth = 0.56;
    state.stats.droneFlameDps = 3.1;
    state.stats.droneFlameLevel = 0;
    state.stats.shotgunEnabled = false;
    state.stats.shotgunCooldown = 0.62;
    state.stats.shotgunTimer = 0;
    state.stats.shotgunRange = 1;
    state.stats.shotgunPellets = 5;
    state.stats.shotgunDamage = 1;
    state.stats.heavyShotEnabled = false;
    state.stats.heavyShotEvery = 6;
    state.stats.rifleShots = 0;
    state.stats.baseRepair = 0;
    state.stats.treePicks = {};
    state.stats.claimedCapstones = {};
    sfxState.killChimeLevel = 0;
    sfxState.killChimeHold = 0;
    clearArrays();
    startWave();
  }

  function clearArrays() {
    enemyMissiles.length = 0;
    dropPods.length = 0;
    paratroopers.length = 0;
    enemyRockets.length = 0;
    playerMissiles.length = 0;
    bullets.length = 0;
    explosions.length = 0;
    delayedExplosions.length = 0;
    radiationClouds.length = 0;
    flameCones.length = 0;
    sparks.length = 0;
    debris.length = 0;
  }

  function resetInput() {
    input.active = false;
    input.held = false;
    input.pointerId = null;
  }

  function resumeGame() {
    if (state.status !== 'playing') return;
    state.paused = false;
    pauseBtn.textContent = 'II';
    overlay.classList.add('is-hidden');
    resetInput();
  }

  function openPauseMenu() {
    if (state.status !== 'playing') return;
    playProceduralSfx('ui_pause_01');
    state.paused = true;
    pauseBtn.textContent = '>';
    resetInput();
    setOverlay('pause');
  }

  function exitToMenu() {
    recordPersonalBest();
    clearArrays();
    resetInput();
    state.status = 'menu';
    state.paused = false;
    state.waveActive = false;
    state.spawnLeft = 0;
    state.spawnTimer = 0;
    pauseBtn.textContent = 'II';
    updateHud();
    setOverlay('menu');
  }


  function exitBrowserFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    const activeFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement;
    try {
      if (activeFullscreen && exit) return Promise.resolve(exit.call(document));
    } catch (_) {}
    return Promise.resolve();
  }

  function exitFullscreenToTitle() {
    exitBrowserFullscreen().finally(() => exitToMenu());
  }

  function openItchPage() {
    exitBrowserFullscreen();
    try {
      window.open(ITCH_PAGE_URL, '_top');
      return;
    } catch (_) {}
    const link = document.createElement('a');
    link.href = ITCH_PAGE_URL;
    link.target = '_top';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function startWave() {
    playProceduralSfx('wave_start_01');
    state.status = 'playing';
    state.waveActive = true;
    recordPersonalBest();
    state.spawnLeft = 8 + state.wave * 5;
    state.spawnTimer = 0.25;
    state.base = Math.min(100, state.base + state.stats.baseRepair);
  }

  function upgradeAvailable(upgrade) {
    return !upgrade.requires || upgrade.requires();
  }

  function treePickCount(tree) {
    return state.stats.treePicks[tree] || 0;
  }

  function capstoneReady(upgrade) {
    if (state.stats.claimedCapstones[upgrade.title]) return false;
    return treePickCount(upgrade.tree) >= 3;
  }

  function claimUpgrade(upgrade) {
    upgrade.apply();
    const tree = upgrade.tree || 'general';
    if (upgrade.title.startsWith('CAPSTONE:')) state.stats.claimedCapstones[upgrade.title] = true;
    else state.stats.treePicks[tree] = treePickCount(tree) + 1;
  }

  function chooseUpgrades() {
    const chosen = [];
    const capstones = capstoneUpgrades.filter(upgrade => upgradeAvailable(upgrade) && capstoneReady(upgrade));
    while (capstones.length && chosen.length < 3) {
      const i = Math.floor(Math.random() * capstones.length);
      chosen.push(capstones.splice(i, 1)[0]);
    }
    const pool = upgrades.filter(upgrade => upgradeAvailable(upgrade) && !chosen.includes(upgrade));
    while (pool.length && chosen.length < 3) {
      const i = Math.floor(Math.random() * pool.length);
      chosen.push(pool.splice(i, 1)[0]);
    }
    return chosen;
  }

  function mech() {
    const s = Math.min(state.width, state.height) / 620;
    return {
      x: state.width * 0.5,
      y: state.height - Math.max(74, state.height * 0.075),
      scale: clamp(s, 0.72, 1.28)
    };
  }

  function wideAspectPressure() {
    const aspect = state.width / Math.max(1, state.height);
    return clamp((aspect - 1.18) / 0.62, 0, 1);
  }

  function projectileReachScale() {
    const aspectBoost = 1 + wideAspectPressure() * 0.28;
    const largeScreenBoost = 1 + clamp((Math.min(state.width, state.height) - 740) / 520, 0, 0.22);
    return clamp(aspectBoost * largeScreenBoost, 1, 1.58);
  }

  function hostileEngagementBounds() {
    const edgeMargin = Math.max(20, Math.min(state.width, state.height) * 0.04);
    const available = Math.max(1, state.width - edgeMargin * 2);
    let laneWidth = available;
    if (wideAspectPressure() > 0) {
      laneWidth = Math.min(available, Math.max(320, state.height * 1.08));
    }
    const left = (state.width - laneWidth) * 0.5;
    return { left, right: left + laneWidth, width: laneWidth };
  }

  function randomInBounds(bounds, pad = 0) {
    const safePad = Math.min(pad, Math.max(0, bounds.width * 0.45));
    const left = bounds.left + safePad;
    const right = bounds.right - safePad;
    return left + Math.random() * Math.max(1, right - left);
  }

  function missileRackCount() {
    return Math.max(1, 1 + state.stats.missileBatteries);
  }

  function syncMissileRackTimers() {
    const count = missileRackCount();
    while (state.stats.missileRackTimers.length < count) state.stats.missileRackTimers.push(0);
    if (state.stats.missileRackTimers.length > count) state.stats.missileRackTimers.length = count;
  }

  function missileBatteryMount(index) {
    const m = mech();
    const mounts = [
      { x: m.x + 38 * m.scale, y: m.y - 108 * m.scale },
      { x: m.x - 92 * m.scale, y: m.y - 88 * m.scale },
      { x: m.x + 104 * m.scale, y: m.y - 74 * m.scale },
      { x: m.x - 122 * m.scale, y: m.y - 52 * m.scale },
      { x: m.x + 128 * m.scale, y: m.y - 48 * m.scale },
      { x: m.x, y: m.y - 126 * m.scale }
    ];
    return mounts[index % mounts.length] || mounts[0];
  }

  function missileRackMount(index) {
    return missileBatteryMount(index);
  }

  function applySemiAutoGrace(now) {
    if (now - input.lastReleaseTime > SEMI_AUTO_GRACE_MS) return;
    syncMissileRackTimers();
    const graceReadyTime = SEMI_AUTO_READY_SECONDS;
    for (let i = 0; i < state.stats.missileRackTimers.length; i += 1) {
      if (state.stats.missileRackTimers[i] <= graceReadyTime) state.stats.missileRackTimers[i] = 0;
    }
  }

  function nextReadyMissileRack() {
    syncMissileRackTimers();
    const count = state.stats.missileRackTimers.length;
    for (let step = 0; step < count; step += 1) {
      const index = (state.stats.missileRackCursor + step) % count;
      if (state.stats.missileRackTimers[index] <= 0) return index;
    }
    return -1;
  }

  function launchMissileFromRack(index, x, y) {
    const targetX = clamp(x, 18, state.width - 18);
    const targetY = clamp(y, 48, state.height - 130);
    const pod = missileRackMount(index);
    const traits = {
      radiation: state.stats.radiationEnabled,
      piercer: state.stats.piercerEnabled,
      splitter: state.stats.splitterEnabled
    };
    const launchDx = targetX - pod.x;
    const launchDy = targetY - pod.y;
    const launchD = Math.max(1, Math.hypot(launchDx, launchDy));
    const dir = { x: launchDx / launchD, y: launchDy / launchD };
    playerMissiles.push({
      x: pod.x,
      y: pod.y,
      sx: pod.x,
      sy: pod.y,
      tx: targetX,
      ty: targetY,
      dirX: dir.x,
      dirY: dir.y,
      speed: state.stats.missileSpeed,
      trail: [],
      active: true,
      traits,
      damage: state.stats.missileDamage,
      piercerDamageBonus: state.stats.piercerDamageBonus,
      piercesLeft: traits.piercer ? state.stats.piercerMaxPierces : 0,
      pierceDistance: Math.max(118, state.stats.explosionRadius * 1.55),
      splitterCount: state.stats.splitterCount,
      splitterDamageScale: state.stats.splitterDamageScale,
      radiationRadius: state.stats.radiationRadius,
      radiationDuration: state.stats.radiationDuration,
      radiationDamage: state.stats.radiationDamage,
      radius: traits.radiation ? state.stats.radiationRadius : state.stats.explosionRadius
    });
    state.stats.missileRackTimers[index] = state.stats.missileCooldown;
    state.stats.missileRackCursor = (index + 1) % state.stats.missileRackTimers.length;
    state.stats.missileSequenceTimer = state.stats.missileSequenceDelay;
    addSparks(pod.x, pod.y, traits.radiation ? '#b8ff5f' : '#ffd966', 5, 80);
    playProceduralSfx('missile_launch_01');
  }

  function fireMissile(x, y) {
    if (state.status !== 'playing') return false;
    if (state.stats.missileSequenceTimer > 0) return false;
    const index = nextReadyMissileRack();
    if (index < 0) return false;
    launchMissileFromRack(index, x, y);
    return true;
  }

  function fireRifle(x, y, source = 'mech') {
    const mount = mechRifleMount();
    let sx = mount.x;
    let sy = mount.y;
    if (source !== 'mech') {
      sx = source.x;
      sy = source.y;
    }
    const baseAngle = Math.atan2(y - sy, x - sx);
    const jitter = (Math.random() - 0.5) * state.stats.rifleSpread;
    const a = baseAngle + jitter;
    const heavy = source === 'mech' && state.stats.heavyShotEnabled && state.stats.rifleShots % state.stats.heavyShotEvery === 0;
    const reachScale = projectileReachScale();
    bullets.push({
      x: sx,
      y: sy,
      vx: Math.cos(a) * state.stats.bulletSpeed * (heavy ? 0.78 : 1),
      vy: Math.sin(a) * state.stats.bulletSpeed * (heavy ? 0.78 : 1),
      life: (heavy ? 0.72 : 0.55) * reachScale,
      radius: heavy ? 7 : (source === 'mech' ? 4 : 3),
      damage: heavy ? 2 : 1,
      color: heavy ? '#ffdf67' : (source === 'mech' ? '#9be9ff' : '#ffec8a')
    });
    if (source === 'mech') {
      state.stats.rifleShots += 1;
      playProceduralSfx(heavy ? 'heavy_pistol_01' : 'turret_bolt_01');
    } else {
      playProceduralSfx('drone_bolt_01');
    }
    addSparks(sx, sy, heavy ? '#ffdf67' : '#9be9ff', heavy ? 5 : 2, heavy ? 120 : 70);
  }

  function fireShotgun(x, y) {
    const mount = mechRifleMount();
    const sx = mount.x;
    const sy = mount.y;
    const baseAngle = Math.atan2(y - sy, x - sx);
    const pellets = Math.max(1, state.stats.shotgunPellets);
    const half = (pellets - 1) / 2;
    const reachScale = projectileReachScale();
    for (let i = 0; i < pellets; i += 1) {
      const a = baseAngle + (i - half) * 0.13;
      bullets.push({
        x: sx,
        y: sy,
        vx: Math.cos(a) * state.stats.bulletSpeed * 0.65,
        vy: Math.sin(a) * state.stats.bulletSpeed * 0.65,
        life: 0.24 * state.stats.shotgunRange * reachScale,
        radius: 5,
        damage: state.stats.shotgunDamage,
        color: '#ff9bd4'
      });
    }
    playProceduralSfx('shotgun_burst_01');
    addSparks(sx, sy, '#ff9bd4', 10, 150);
  }

  function mechRifleMount() {
    const m = mech();
    return { x: m.x + 38 * m.scale, y: m.y - 108 * m.scale };
  }

  function mechPodMount(side) {
    const m = mech();
    return missileBatteryMount(side < 0 ? 0 : 1);
  }

  function dronePositions() {
    const m = mech();
    const d = 74 * m.scale;
    return [
      { x: m.x - d, y: m.y - 132 * m.scale },
      { x: m.x + d, y: m.y - 132 * m.scale },
      { x: m.x - d * 1.28, y: m.y - 82 * m.scale },
      { x: m.x + d * 1.28, y: m.y - 82 * m.scale }
    ].slice(0, state.stats.droneCount);
  }

  function spawnEnemyMissile() {
    const bounds = hostileEngagementBounds();
    const x = randomInBounds(bounds, 20);
    const targetX = bounds.left + bounds.width * (0.16 + Math.random() * 0.68);
    const targetY = state.height - 46;
    const speedScale = 1 + Math.max(0, state.wave - 1) * 0.08;
    const speed = (58 + state.wave * 9 + Math.random() * 28) * speedScale;
    const hp = 1 + Math.floor(Math.max(0, state.wave - 2) / 2) + (Math.random() < Math.max(0, state.wave - 4) * 0.06 ? 1 : 0);
    const a = Math.atan2(targetY - 0, targetX - x);
    enemyMissiles.push({
      type: 'missile',
      x,
      y: -12,
      sx: x,
      sy: -12,
      tx: targetX,
      ty: targetY,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      radius: 8 + Math.min(5, hp - 1),
      alive: true,
      hp,
      maxHp: hp,
      hot: Math.random() < Math.min(0.42, 0.16 + state.wave * 0.018)
    });
  }

  function dropPodPressure() {
    if (state.wave < 2) return 0;
    const softenedLateWave = Math.max(0, state.wave - 6) * 0.003;
    return Math.min(0.26, 0.065 + state.wave * 0.013 - softenedLateWave);
  }

  function shouldSpawnDropPod() {
    return Math.random() < dropPodPressure();
  }

  function spawnDropPod() {
    const bounds = hostileEngagementBounds();
    const x = randomInBounds(bounds, Math.max(42, bounds.width * 0.08));
    const hp = (5 + Math.floor(state.wave / 2)) * 2 + Math.floor(Math.max(0, state.wave - 4) / 3);
    dropPods.push({
      type: 'dropPod',
      x,
      y: -64,
      vx: (Math.random() - 0.5) * 18,
      vy: 42 + state.wave * 3.2,
      radius: 25,
      alive: true,
      hp,
      maxHp: hp,
      spin: (Math.random() - 0.5) * 0.25,
      angle: (Math.random() - 0.5) * 0.12,
      wobble: Math.random() * TAU
    });
  }

  function spawnParatrooper(x, y) {
    const hp = (2 + Math.floor(state.wave / 3)) * 2;
    paratroopers.push({
      type: 'trooper',
      x,
      y,
      vx: (Math.random() - 0.5) * 12,
      vy: 22 + state.wave * 1.4,
      radius: 15,
      alive: true,
      hp,
      maxHp: hp,
      rocketTimer: 0.55 + Math.random() * 0.65,
      rocketCooldown: Math.max(1.15, 2.35 - state.wave * 0.055),
      sway: Math.random() * TAU
    });
  }

  function fireEnemyRocket(trooper) {
    const m = mech();
    const targetX = clamp(m.x + (Math.random() - 0.5) * 86, 18, state.width - 18);
    const targetY = state.height - 48;
    const speed = 150 + state.wave * 8;
    const a = Math.atan2(targetY - trooper.y, targetX - trooper.x);
    enemyRockets.push({
      type: 'rocket',
      x: trooper.x,
      y: trooper.y + 10,
      sx: trooper.x,
      sy: trooper.y + 10,
      tx: targetX,
      ty: targetY,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      radius: 5,
      alive: true,
      hp: 1,
      maxHp: 1
    });
    playProceduralSfx('trooper_rocket_launch_01');
    addSparks(trooper.x, trooper.y + 10, '#ff9f55', 4, 85);
  }

  function addExplosion(x, y, radius, team = 'player', damage = 1) {
    explosions.push({ x, y, radius: 2, maxRadius: radius, life: 0.42, age: 0, team, damage });
    playProceduralSfx(team === 'player' ? 'player_missile_explosion_01' : 'base_impact_01');
    addSparks(x, y, team === 'player' ? '#ffdf67' : '#ff6b6b', 14, radius * 2.4);
  }

  function scheduleExplosion(x, y, radius, team = 'player', damage = 1, delay = 0) {
    delayedExplosions.push({ x, y, radius, team, damage, delay });
  }

  function addRadiationCloud(x, y, radius = state.stats.radiationRadius, duration = state.stats.radiationDuration, damage = state.stats.radiationDamage) {
    radiationClouds.push({
      x,
      y,
      radius,
      life: duration,
      maxLife: duration,
      age: 0,
      tickRate: state.stats.radiationTick,
      damage,
      seed: Math.random() * TAU,
      inside: new WeakSet(),
      nextTickByTarget: new WeakMap()
    });
    while (radiationClouds.length > state.stats.radiationMaxClouds) radiationClouds.shift();
    addSparks(x, y, '#b8ff5f', 14, radius * 1.8);
  }

  function addSparks(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * TAU;
      const v = speed * (0.35 + Math.random() * 0.65);
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.28 + Math.random() * 0.24, color });
    }
  }

  function addDebris(x, y, palette, count, power, sizeMin = 6, sizeMax = 18) {
    for (let i = 0; i < count; i += 1) {
      const a = -Math.PI * (0.15 + Math.random() * 0.7);
      const side = (Math.random() - 0.5) * power * 0.85;
      const lift = power * (0.45 + Math.random() * 0.75);
      debris.push({
        x,
        y,
        vx: Math.cos(a) * lift + side,
        vy: Math.sin(a) * lift - Math.random() * 30,
        size: sizeMin + Math.random() * (sizeMax - sizeMin),
        rot: Math.random() * TAU,
        vr: (Math.random() - 0.5) * 8,
        life: 2.2 + Math.random() * 1.2,
        color: palette[Math.floor(Math.random() * palette.length)],
        shard: Math.floor(Math.random() * enemySprites.shards.length)
      });
    }
  }

  function hostileSnapshot() {
    return [...enemyRockets, ...enemyMissiles, ...dropPods, ...paratroopers];
  }

  function firstHostileHit(x, y, radius) {
    for (const e of hostileSnapshot()) {
      if (!e.alive) continue;
      if (distSq(x, y, e.x, e.y) < (radius + e.radius) ** 2) return e;
    }
    return null;
  }

  function destroyHostile(enemy, source = 'bullet') {
    if (!enemy.alive) return false;
    if (enemy.type === 'dropPod') return breakDropPod(enemy);
    if (enemy.type === 'trooper') return shatterTrooper(enemy, true);
    if (enemy.type === 'rocket') return slayEnemy(enemy, 10, source === 'bullet' ? 12 : 0);
    return slayEnemy(enemy, source === 'bullet' ? 15 : 25, source === 'bullet' ? 22 : 0);
  }

  function damageHostile(enemy, amount, source = 'bullet') {
    if (!enemy || !enemy.alive) return false;
    enemy.hp -= amount;
    if (enemy.hp <= 0) return destroyHostile(enemy, source);
    addSparks(enemy.x, enemy.y, enemy.type === 'trooper' ? '#9be9ff' : '#ffdf67', 4, 90);
    return false;
  }

  function breakDropPod(pod) {
    if (!pod.alive) return false;
    pod.alive = false;
    registerKill(45);
    playProceduralSfx('drop_pod_break_01');
    addDebris(pod.x, pod.y, ['#dce8f5', '#7a8b9b', '#243241', '#ffdf67'], 18, 185, 8, 22);
    addSparks(pod.x, pod.y, '#ffdf67', 18, 190);
    spawnParatrooper(pod.x, pod.y + 10);
    return true;
  }

  function shatterTrooper(trooper, awardScore) {
    if (!trooper.alive) return false;
    trooper.alive = false;
    if (awardScore) registerKill(30);
    playProceduralSfx('trooper_shatter_01');
    addDebris(trooper.x, trooper.y, ['#b7cad8', '#2b3b4b', '#8ff4ff', '#ffdf67'], 12, 145, 5, 14);
    addSparks(trooper.x, trooper.y, '#9be9ff', 12, 135);
    return true;
  }

  function damageBase(amount, x, y, radius, hot = false) {
    state.base = Math.max(0, state.base - amount);
    resetCombo();
    state.flash = 1;
    addExplosion(x, y, radius, 'enemy');
    if (hot) addSparks(x, y, '#ff6b6b', 10, radius * 2.2);
    if (state.base <= 0) {
      state.status = 'gameover';
      setOverlay('gameover');
    }
  }

  function update(dt) {
    if (state.status !== 'playing' || state.paused) return;

    syncMissileRackTimers();
    for (let i = 0; i < state.stats.missileRackTimers.length; i += 1) {
      state.stats.missileRackTimers[i] = Math.max(0, state.stats.missileRackTimers[i] - dt);
    }
    state.stats.missileSequenceTimer = Math.max(0, state.stats.missileSequenceTimer - dt);
    state.stats.rifleTimer = Math.max(0, state.stats.rifleTimer - dt);
    state.stats.droneTimer = Math.max(0, state.stats.droneTimer - dt);
    state.stats.shotgunTimer = Math.max(0, state.stats.shotgunTimer - dt);
    state.flash = Math.max(0, state.flash - dt * 2.4);
    updateSfx(dt);
    updateCombo(dt);

    if (input.active) {
      const elapsed = performance.now() - input.startTime;
      const moved = Math.sqrt(distSq(input.x, input.y, input.startX, input.startY));
      if (elapsed >= HOLD_MS || moved >= HOLD_MOVE) input.held = true;
    }

    const aimX = input.active ? input.x : input.lastTapX || state.width * 0.5;
    const aimY = input.active ? input.y : input.lastTapY || state.height * 0.25;
    const shoulder = mechRifleMount();
    const targetAngle = clamp(Math.atan2(aimY - shoulder.y, aimX - shoulder.x), -Math.PI + 0.1, -0.05);
    state.armAngle = angleLerp(state.armAngle, targetAngle, input.active ? 0.24 : 0.08);

    if (input.active) fireMissile(input.x, input.y);

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
        for (const drone of drones) {
          fireRifle(input.x, input.y, drone);
          if (state.stats.droneRadiationEnabled) addRadiationCloud(lerp(drone.x, input.x, 0.72), lerp(drone.y, input.y, 0.72), state.stats.radiationRadius * 0.58, state.stats.radiationDuration * 0.58, state.stats.radiationDamage * 0.7);
          if (state.stats.droneInterceptorEnabled) {
            const target = nearestEnemyTarget();
            fireRifle(target.x, target.y, drone);
          }
        }
        state.stats.droneTimer = state.stats.droneCooldown;
      }
    }

    updateWave(dt);
    updatePlayerMissiles(dt);
    updateBullets(dt);
    updateEnemyMissiles(dt);
    updateDropPods(dt);
    updateParatroopers(dt);
    updateEnemyRockets(dt);
    updateFlameDrones(dt);
    updateFlameCones(dt);
    updateDelayedExplosions(dt);
    updateExplosions(dt);
    updateRadiationClouds(dt);
    updateSparks(dt);
    updateDebris(dt);
    checkWaveClear();
    updateHud();
  }

  function updateWave(dt) {
    if (!state.waveActive) return;
    state.spawnTimer -= dt;
    if (state.spawnLeft > 0 && state.spawnTimer <= 0) {
      if (shouldSpawnDropPod()) spawnDropPod();
      else spawnEnemyMissile();
      state.spawnLeft -= 1;
      const base = Math.max(0.18, 0.95 - state.wave * 0.06);
      state.spawnTimer = base * (0.52 + Math.random() * 0.58);
    }
  }

  function missileForwardVector(missile) {
    let fx = missile.dirX || (missile.tx - (missile.sx ?? missile.x));
    let fy = missile.dirY || (missile.ty - (missile.sy ?? missile.y));
    const d = Math.max(1, Math.hypot(fx, fy));
    return { x: fx / d, y: fy / d };
  }

  function clampExplosionPoint(x, y) {
    return {
      x: clamp(x, 12, state.width - 12),
      y: clamp(y, 30, state.height - 64)
    };
  }

  function detonatePlayerMissile(missile, x = missile.tx, y = missile.ty) {
    const traits = missile.traits || {};
    const damage = (missile.damage || 1) + (traits.piercer ? (missile.piercerDamageBonus || 0) : 0);
    const baseRadius = traits.piercer ? Math.max(42, state.stats.explosionRadius * 0.82) : state.stats.explosionRadius;
    addExplosion(x, y, baseRadius, 'player', damage);
    if (traits.radiation) {
      addRadiationCloud(x, y, missile.radiationRadius || state.stats.radiationRadius, missile.radiationDuration || state.stats.radiationDuration, missile.radiationDamage || state.stats.radiationDamage);
      addExplosion(x, y, Math.max(28, state.stats.explosionRadius * 0.45), 'player', damage * 0.45);
    }
    if (traits.splitter) {
      const count = missile.splitterCount || state.stats.splitterCount;
      const forward = missileForwardVector(missile);
      const sideX = -forward.y;
      const sideY = forward.x;
      const childDamage = damage * (missile.splitterDamageScale || state.stats.splitterDamageScale);
      const spacing = Math.max(18, state.stats.explosionRadius * 0.34);
      const sideSpacing = Math.max(12, state.stats.explosionRadius * 0.18);
      for (let i = 0; i < count; i += 1) {
        const centered = i - (count - 1) / 2;
        const ahead = spacing * (1.15 + i * 0.42);
        const side = centered * sideSpacing;
        const p = clampExplosionPoint(x + forward.x * ahead + sideX * side, y + forward.y * ahead + sideY * side);
        scheduleExplosion(p.x, p.y, state.stats.explosionRadius * 0.44, 'player', childDamage, 0.07 + i * 0.045);
      }
    }
  }

  function continuePiercingMissile(missile) {
    if (!(missile.traits || {}).piercer || missile.piercesLeft <= 0) return false;
    missile.piercesLeft -= 1;
    const forward = missileForwardVector(missile);
    missile.x = missile.tx;
    missile.y = missile.ty;
    missile.sx = missile.x;
    missile.sy = missile.y;
    missile.dirX = forward.x;
    missile.dirY = forward.y;
    const next = clampExplosionPoint(missile.x + forward.x * missile.pierceDistance, missile.y + forward.y * missile.pierceDistance);
    if (Math.hypot(next.x - missile.x, next.y - missile.y) < 22) return false;
    missile.tx = next.x;
    missile.ty = next.y;
    missile.trail.length = 0;
    addSparks(missile.x, missile.y, '#ffdf67', 8, 120);
    return true;
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
        detonatePlayerMissile(missile, missile.tx, missile.ty);
        missile.active = continuePiercingMissile(missile);
      } else {
        missile.x += (dx / d) * missile.speed * dt;
        missile.y += (dy / d) * missile.speed * dt;
      }
    }
    compact(playerMissiles, item => item.active);
  }

  function updateDelayedExplosions(dt) {
    for (const ex of delayedExplosions) {
      ex.delay -= dt;
      if (ex.delay <= 0) {
        addExplosion(ex.x, ex.y, ex.radius, ex.team, ex.damage);
        ex.done = true;
      }
    }
    compact(delayedExplosions, ex => !ex.done);
  }

  function updateBullets(dt) {
    for (const b of bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      const hit = firstHostileHit(b.x, b.y, b.radius);
      if (hit) {
        b.life = 0;
        damageHostile(hit, b.damage || 1, 'bullet');
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
        damageBase(e.hot ? 13 : 8, e.x, e.ty, e.hot ? 42 : 32, e.hot);
      }
    }
    compact(enemyMissiles, e => e.alive);
  }

  function updateDropPods(dt) {
    const groundY = state.height - 52;
    for (const pod of dropPods) {
      if (!pod.alive) continue;
      pod.wobble += dt * 2.2;
      pod.angle += pod.spin * dt + Math.sin(pod.wobble) * 0.002;
      pod.x += (pod.vx + Math.sin(pod.wobble) * 10) * dt;
      pod.y += pod.vy * dt;
      if (pod.y >= groundY) {
        pod.alive = false;
        playProceduralSfx('drop_pod_break_01');
        addDebris(pod.x, groundY, ['#dce8f5', '#7a8b9b', '#243241', '#ffdf67'], 16, 160, 8, 20);
        damageBase(16, pod.x, groundY, 46, true);
      }
    }
    compact(dropPods, p => p.alive);
  }

  function updateParatroopers(dt) {
    const groundY = state.height - 58;
    for (const trooper of paratroopers) {
      if (!trooper.alive) continue;
      trooper.sway += dt * 2.6;
      trooper.x += (trooper.vx + Math.sin(trooper.sway) * 18) * dt;
      trooper.y += trooper.vy * dt;
      trooper.rocketTimer -= dt;
      if (trooper.rocketTimer <= 0 && trooper.y > 56 && trooper.y < groundY - 30) {
        fireEnemyRocket(trooper);
        trooper.rocketTimer = trooper.rocketCooldown * (0.72 + Math.random() * 0.46);
      }
      if (trooper.y >= groundY) {
        shatterTrooper(trooper, false);
        damageBase(10, trooper.x, groundY, 30, false);
      }
    }
    compact(paratroopers, t => t.alive);
  }

  function updateEnemyRockets(dt) {
    for (const rocket of enemyRockets) {
      if (!rocket.alive) continue;
      rocket.x += rocket.vx * dt;
      rocket.y += rocket.vy * dt;
      if (rocket.y >= rocket.ty || rocket.x < -30 || rocket.x > state.width + 30) {
        rocket.alive = false;
        damageBase(5, rocket.x, rocket.ty, 22, false);
      }
    }
    compact(enemyRockets, r => r.alive);
  }

  function updateExplosions(dt) {
    for (const ex of explosions) {
      ex.age += dt;
      ex.life -= dt;
      const t = clamp(ex.age / 0.28, 0, 1);
      ex.radius = lerp(ex.radius, ex.maxRadius, t);
      if (ex.team === 'player') {
        for (const e of hostileSnapshot()) {
          if (!e.alive) continue;
          if (distSq(ex.x, ex.y, e.x, e.y) < (ex.radius + e.radius) ** 2) {
            const scale = ex.damage || 1;
            const amount = (e.type === 'dropPod' ? 3 : (e.type === 'trooper' ? 2 : 99)) * scale;
            damageHostile(e, amount, 'explosion');
          }
        }
      }
    }
    compact(explosions, ex => ex.life > 0);
  }

  function angleDelta(a, b) {
    let d = ((a - b + Math.PI) % TAU) - Math.PI;
    if (d < -Math.PI) d += TAU;
    return d;
  }

  function closestHostileInRange(x, y, range) {
    let best = null;
    let bestD = range * range;
    for (const e of hostileSnapshot()) {
      if (!e.alive) continue;
      const d = distSq(x, y, e.x, e.y);
      if (d < bestD) {
        best = e;
        bestD = d;
      }
    }
    return best;
  }

  function updateFlameDrones(dt) {
    if (!state.stats.droneFlameEnabled || state.stats.droneCount <= 0) return;
    const range = state.stats.droneFlameRange;
    const halfWidth = state.stats.droneFlameWidth;
    for (const drone of dronePositions()) {
      const target = closestHostileInRange(drone.x, drone.y, range);
      if (!target) continue;
      const angle = Math.atan2(target.y - drone.y, target.x - drone.x);
      flameCones.push({ x: drone.x, y: drone.y, angle, range, width: halfWidth, life: 0.085, maxLife: 0.085, seed: Math.random() * TAU });
      for (const e of hostileSnapshot()) {
        if (!e.alive) continue;
        const dx = e.x - drone.x;
        const dy = e.y - drone.y;
        const dist = Math.hypot(dx, dy);
        if (dist > range + e.radius || dist < 1) continue;
        if (Math.abs(angleDelta(Math.atan2(dy, dx), angle)) <= halfWidth) {
          damageHostile(e, state.stats.droneFlameDps * dt * (e.type === 'dropPod' ? 0.72 : 1), 'flame');
        }
      }
    }
  }

  function updateFlameCones(dt) {
    for (const flame of flameCones) flame.life -= dt;
    compact(flameCones, flame => flame.life > 0);
  }

  function updateRadiationClouds(dt) {
    for (const cloud of radiationClouds) {
      cloud.age += dt;
      cloud.life -= dt;
      for (const e of hostileSnapshot()) {
        if (!e.alive) continue;
        const inside = distSq(cloud.x, cloud.y, e.x, e.y) < (cloud.radius + e.radius) ** 2;
        if (!inside) {
          if (cloud.inside.has(e)) cloud.inside.delete(e);
          continue;
        }
        const newlyEntered = !cloud.inside.has(e);
        const nextTick = cloud.nextTickByTarget.get(e) ?? 0;
        if (newlyEntered || cloud.age >= nextTick) {
          cloud.inside.add(e);
          const amount = e.type === 'dropPod' ? cloud.damage : cloud.damage * 1.65;
          damageHostile(e, amount, 'radiation');
          cloud.nextTickByTarget.set(e, cloud.age + cloud.tickRate);
        }
      }
    }
    compact(radiationClouds, cloud => cloud.life > 0);
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

  function updateDebris(dt) {
    for (const d of debris) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vy += 520 * dt;
      d.vx *= 0.992;
      d.rot += d.vr * dt;
      d.life -= dt;
    }
    compact(debris, d => d.life > 0 && d.y < state.height + 90);
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
    if (state.spawnLeft <= 0 && enemyMissiles.length === 0 && dropPods.length === 0 && paratroopers.length === 0 && enemyRockets.length === 0 && state.status === 'playing') {
      state.waveActive = false;
      state.status = 'upgrade';
      playProceduralSfx('wave_clear_01');
      setOverlay('clear', chooseUpgrades());
    }
  }

  function updateHud() {
    waveEl.textContent = `WAVE ${state.wave}`;
    integrityEl.textContent = `BASE ${Math.round(state.base)}%`;
    scoreEl.textContent = `S ${state.score} B ${state.bestScore}`;
    if (comboEl) {
      comboEl.textContent = state.comboCount > 1 ? `CHAIN ${state.comboCount} x${state.comboMultiplier.toFixed(2)}` : 'CHAIN 0';
      comboEl.classList.toggle('is-hot', state.comboCount > 1);
    }
  }

  function draw() {
    const w = state.width;
    const h = state.height;
    ctx.clearRect(0, 0, w, h);
    drawBackground(w, h);
    drawEnemyMissiles();
    drawEnemyRockets();
    drawDropPods();
    drawParatroopers();
    drawPlayerMissiles();
    drawBullets();
    drawFlameCones();
    drawRadiationClouds();
    drawExplosions();
    drawBase();
    drawMecha();
    drawSparks();
    drawDebris();
    if (input.active && state.status === 'playing') drawReticle(input.x, input.y, input.held);
    if (state.paused) drawPauseVeil();
  }

  function backgroundImageReady() {
    return backgroundImage.complete && backgroundImage.naturalWidth > 0;
  }

  function drawCoverImage(image, x, y, width, height, focusY = 0.58) {
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const destRatio = width / height;
    let sx = 0;
    let sy = 0;
    let sw = image.naturalWidth;
    let sh = image.naturalHeight;
    if (destRatio > sourceRatio) {
      sh = sw / destRatio;
      sy = clamp(image.naturalHeight * focusY - sh * focusY, 0, image.naturalHeight - sh);
    } else {
      sw = sh * destRatio;
      sx = clamp((image.naturalWidth - sw) * 0.5, 0, image.naturalWidth - sw);
    }
    ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
  }

  function drawProceduralBackground(w, h) {

    const horizon = h - Math.max(150, h * 0.2);
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#06101b');
    sky.addColorStop(0.54, '#092336');
    sky.addColorStop(1, '#123f4c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizon);

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#2c7690';
    ctx.lineWidth = 1;
    const step = Math.max(36, Math.min(w, h) / 10);
    for (let x = (state.now * 5) % step; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - h * 0.08, horizon);
      ctx.stroke();
    }
    for (let y = step; y < horizon; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + w * 0.035);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#89e7ff';
    for (let i = 0; i < 10; i += 1) {
      const x = (i * 113 + state.now * 9) % (w + 80) - 40;
      const y = horizon * (0.15 + (i % 5) * 0.13);
      ctx.fillRect(x, y, 28 + (i % 3) * 15, 2);
    }
    ctx.restore();

    const ground = ctx.createLinearGradient(0, horizon, 0, h);
    ground.addColorStop(0, '#20332d');
    ground.addColorStop(0.42, '#151f1c');
    ground.addColorStop(1, '#0e1112');
    ctx.fillStyle = ground;
    ctx.fillRect(0, horizon, w, h - horizon);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fillRect(0, horizon + 32, w, h - horizon - 32);
    ctx.strokeStyle = 'rgba(139, 244, 255, 0.38)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, horizon + 2);
    ctx.lineTo(w, horizon + 2);
    ctx.stroke();

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#475b50';
    const treadStep = Math.max(44, w / 10);
    for (let x = -((state.now * 18) % treadStep); x < w + treadStep; x += treadStep) {
      ctx.beginPath();
      ctx.moveTo(x, horizon + 38);
      ctx.lineTo(x + 54, h);
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

  function drawBackground(w, h) {
    if (!backgroundImageReady()) {
      drawProceduralBackground(w, h);
      return;
    }
    drawCoverImage(backgroundImage, 0, 0, w, h, 0.72);
    const horizon = h - Math.max(150, h * 0.2);

    ctx.fillStyle = 'rgba(2, 7, 12, 0.18)';
    ctx.fillRect(0, 0, w, h);

    const readability = ctx.createLinearGradient(0, 0, 0, h);
    readability.addColorStop(0, 'rgba(1, 6, 12, 0.12)');
    readability.addColorStop(0.58, 'rgba(0, 13, 20, 0.16)');
    readability.addColorStop(0.82, 'rgba(0, 6, 8, 0.03)');
    readability.addColorStop(1, 'rgba(0, 0, 0, 0.30)');
    ctx.fillStyle = readability;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.11;
    ctx.strokeStyle = '#8ff4ff';
    ctx.lineWidth = 1;
    const step = Math.max(42, Math.min(w, h) / 9);
    for (let x = (state.now * 4) % step; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - h * 0.05, horizon);
      ctx.stroke();
    }
    for (let y = step; y < horizon; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + w * 0.025);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
    ctx.fillRect(0, horizon + 36, w, h - horizon - 36);
    ctx.strokeStyle = 'rgba(139, 244, 255, 0.34)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, horizon + 2);
    ctx.lineTo(w, horizon + 2);
    ctx.stroke();

    const danger = clamp((100 - state.base) / 100, 0, 1);
    if (danger > 0) {
      ctx.fillStyle = `rgba(255, 80, 80, ${0.04 + danger * 0.08})`;
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

  function vehicleSheetReady() {
    return vehicleSheet.complete && vehicleSheet.naturalWidth > 0;
  }

  function effectsSheetReady() {
    return effectsSheet.complete && effectsSheet.naturalWidth > 0;
  }

  function enemySheetReady() {
    return enemySheet.complete && enemySheet.naturalWidth > 0;
  }

  function drawEnemyPart(part, x, y, scale = 1, rotation = 0, alpha = 1) {
    if (!enemySheetReady()) return false;
    const [sx, sy, sw, sh] = part.rect;
    const [ax, ay] = part.anchor || [sw * 0.5, sh * 0.5];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.drawImage(enemySheet, sx, sy, sw, sh, -ax, -ay, sw, sh);
    ctx.restore();
    return true;
  }

  function drawEnemyCentered(part, x, y, width, height, rotation = 0, alpha = 1) {
    if (!enemySheetReady()) return false;
    const [sx, sy, sw, sh] = part.rect;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(enemySheet, sx, sy, sw, sh, -width * 0.5, -height * 0.5, width, height);
    ctx.restore();
    return true;
  }

  function drawVehiclePart(part, x, y, scale = 1, rotation = 0, alpha = 1) {
    if (!vehicleSheetReady()) return false;
    const [sx, sy, sw, sh] = part.rect;
    const [ax, ay] = part.anchor || [sw * 0.5, sh * 0.5];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.drawImage(vehicleSheet, sx, sy, sw, sh, -ax, -ay, sw, sh);
    ctx.restore();
    return true;
  }

  function drawVehicleCentered(part, x, y, width, height, rotation = 0, alpha = 1) {
    if (!vehicleSheetReady()) return false;
    const [sx, sy, sw, sh] = part.rect;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(vehicleSheet, sx, sy, sw, sh, -width * 0.5, -height * 0.5, width, height);
    ctx.restore();
    return true;
  }

  function drawEffectFrame(frames, index, x, y, width, height, rotation = 0, alpha = 1) {
    if (!effectsSheetReady() || !frames.length) return false;
    const frame = frames[clamp(index, 0, frames.length - 1)];
    const [sx, sy, sw, sh] = frame.rect;
    const [ax, ay] = frame.anchor || [0.5, 0.5];
    const aspect = sw / Math.max(1, sh);
    let drawW = width;
    let drawH = width / aspect;
    if (drawH > height) {
      drawH = height;
      drawW = height * aspect;
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(effectsSheet, sx, sy, sw, sh, -drawW * ax, -drawH * ay, drawW, drawH);
    ctx.restore();
    return true;
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

  function drawSpriteCentered(part, x, y, width, height, rotation = 0, alpha = 1) {
    if (!sheetReady()) return false;
    const [sx, sy, sw, sh] = part.rect;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(sheet, sx, sy, sw, sh, -width * 0.5, -height * 0.5, width, height);
    ctx.restore();
    return true;
  }

  function drawBase() {
    const deckY = state.height - 58;
    const health = clamp(state.base / 100, 0, 1);
    const w = state.width;
    const center = w * 0.5;

    const groundGrad = ctx.createLinearGradient(0, deckY - 42, 0, state.height);
    groundGrad.addColorStop(0, 'rgba(18, 34, 43, 0.72)');
    groundGrad.addColorStop(0.45, '#111821');
    groundGrad.addColorStop(1, '#070b10');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, deckY - 16, w, state.height - deckY + 16);

    ctx.fillStyle = 'rgba(70, 215, 189, 0.10)';
    ctx.beginPath();
    ctx.ellipse(center, deckY - 18, w * 0.42, 18, 0, 0, TAU);
    ctx.fill();

    const pylonCount = 5;
    for (let i = 0; i < pylonCount; i += 1) {
      const x = w * (0.16 + i * 0.17);
      const damaged = i / pylonCount > health;
      const glow = damaged ? '#6d2735' : '#46d7bd';
      ctx.fillStyle = damaged ? '#2a1820' : '#182d35';
      roundRect(x - 8, deckY - 34, 16, 32, 4, true);
      ctx.fillStyle = glow;
      ctx.fillRect(x - 5, deckY - 30, 10, 6);
      ctx.strokeStyle = damaged ? 'rgba(255, 91, 91, 0.38)' : 'rgba(119, 255, 225, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 18, deckY - 34);
      ctx.lineTo(x, deckY - 48);
      ctx.lineTo(x + 18, deckY - 34);
      ctx.stroke();
    }

    const bunkerW = Math.min(280, w * 0.72);
    const bunkerX = center - bunkerW * 0.5;
    const bunkerGrad = ctx.createLinearGradient(bunkerX, deckY - 44, bunkerX + bunkerW, deckY + 4);
    bunkerGrad.addColorStop(0, '#203244');
    bunkerGrad.addColorStop(0.52, '#31495b');
    bunkerGrad.addColorStop(1, '#0f1822');
    ctx.fillStyle = bunkerGrad;
    roundRect(bunkerX, deckY - 32, bunkerW, 34, 7, true);
    ctx.fillStyle = '#0a1018';
    roundRect(center - 46, deckY - 45, 92, 22, 5, true);
    ctx.strokeStyle = 'rgba(220, 244, 255, 0.44)';
    ctx.lineWidth = 2;
    roundRect(center - 46, deckY - 45, 92, 22, 5, false);

    ctx.fillStyle = '#46d7bd';
    ctx.beginPath();
    ctx.arc(center + bunkerW * 0.33, deckY - 42, 13, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(119, 255, 225, 0.68)';
    ctx.beginPath();
    ctx.arc(center + bunkerW * 0.33, deckY - 42, 20, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();

    const segments = 10;
    const gap = 4;
    const sw = w / segments;
    for (let i = 0; i < segments; i += 1) {
      const live = i / segments < health;
      ctx.fillStyle = live ? '#46d7bd' : '#6d2735';
      roundRect(i * sw + gap, deckY + 10, sw - gap * 2, 12, 3, true);
      ctx.fillStyle = live ? 'rgba(255,255,255,.18)' : 'rgba(255,120,120,.12)';
      ctx.fillRect(i * sw + gap + 3, deckY + 13, Math.max(0, sw - gap * 2 - 6), 2);
    }

    if (health < 0.7) {
      ctx.strokeStyle = `rgba(255, 91, 91, ${0.35 + (0.7 - health) * 0.7})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i += 1) {
        const x = bunkerX + bunkerW * (0.12 + i * 0.18);
        const y = deckY - 25 + (i % 2) * 9;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 10, y + 5);
        ctx.lineTo(x + 3, y + 13);
        ctx.stroke();
      }
    }
  }

  function drawMecha() {
    const m = mech();
    const s = m.scale;
    const x = m.x;
    const y = m.y;

    drawDrones();

    if (vehicleSheetReady()) {
      drawVehiclePart(vehicleSprites.hull, x, y + 8 * s, 0.62 * s, 0);
      if (state.stats.missileBatteries > 0) drawVehiclePart(vehicleSprites.missileBattery, x - 92 * s, y - 88 * s, 0.24 * s, -Math.PI / 2);
      if (state.stats.missileBatteries > 1) drawVehiclePart(vehicleSprites.missileBattery, x + 104 * s, y - 74 * s, 0.24 * s, -Math.PI / 2);
      drawRifleArm();
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    ctx.fillStyle = 'rgba(4, 8, 10, 0.58)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 126, 20, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#111820';
    roundRect(-118, -31, 236, 46, 18, true);
    ctx.strokeStyle = '#4f6571';
    ctx.lineWidth = 3;
    roundRect(-118, -31, 236, 46, 18, false);

    ctx.fillStyle = '#273441';
    for (let i = -4; i <= 4; i += 1) {
      ctx.beginPath();
      ctx.arc(i * 25, -8, 13, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(142, 244, 255, 0.22)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = '#dce8f5';
    roundRect(-94, -80, 188, 62, 15, true);
    ctx.fillStyle = '#283746';
    roundRect(-78, -70, 156, 42, 11, true);
    ctx.fillStyle = '#1859d8';
    roundRect(-66, -64, 52, 30, 8, true);
    roundRect(24, -64, 52, 30, 8, true);
    ctx.fillStyle = '#86f5ff';
    roundRect(-8, -61, 18, 24, 5, true);
    ctx.fillStyle = '#ffcf55';
    roundRect(-88, -48, 18, 14, 4, true);
    roundRect(70, -48, 18, 14, 4, true);

    drawVehicleHardpoint(-92, -88, state.stats.missileBatteries > 0);
    drawVehicleHardpoint(104, -74, state.stats.missileBatteries > 1);
    drawVehicleHardpoint(-88, -70, state.stats.droneCount > 0);
    drawVehicleHardpoint(88, -70, state.stats.shotgunEnabled || state.stats.heavyShotEnabled);

    ctx.restore();

    drawRifleArm();
  }

  function drawVehicleHardpoint(x, y, active) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = active ? '#26394a' : '#151f28';
    ctx.strokeStyle = active ? 'rgba(111, 230, 255, 0.58)' : 'rgba(111, 230, 255, 0.2)';
    ctx.lineWidth = 2;
    roundRect(-15, -9, 30, 18, 5, true);
    roundRect(-15, -9, 30, 18, 5, false);
    ctx.fillStyle = active ? '#8ff4ff' : '#4d6770';
    ctx.fillRect(-7, -2, 14, 4);
    ctx.restore();
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
    const shoulder = mechRifleMount();
    const shoulderX = shoulder.x;
    const shoulderY = shoulder.y;
    if (vehicleSheetReady()) {
      const part = state.stats.heavyShotEnabled ? vehicleSprites.heavyGun : (state.stats.shotgunEnabled ? vehicleSprites.shotgun : vehicleSprites.starterGun);
      drawVehiclePart(part, shoulderX, shoulderY, 0.32 * s, state.armAngle + Math.PI);
      return;
    }

    ctx.save();
    ctx.translate(shoulderX, shoulderY);
    ctx.rotate(state.armAngle);
    ctx.scale(s, s);

    ctx.fillStyle = '#f1f6fb';
    roundRect(-28, -17, 48, 34, 10, true);
    ctx.strokeStyle = '#6f8291';
    ctx.lineWidth = 3;
    roundRect(-28, -17, 48, 34, 10, false);
    ctx.fillStyle = '#1b2a36';
    roundRect(8, -10, 80, 20, 6, true);
    ctx.fillStyle = state.stats.heavyShotEnabled ? '#ffcf55' : '#8ff4ff';
    ctx.fillRect(76, -5, 18, 10);
    if (state.stats.shotgunEnabled) {
      ctx.fillStyle = '#a9b9c7';
      roundRect(34, -18, 36, 8, 4, true);
      roundRect(34, 10, 36, 8, 4, true);
    }
    ctx.restore();
  }

  function drawDrones() {
    const target = input.active ? { x: input.x, y: input.y } : nearestEnemyTarget();
    for (const d of dronePositions()) {
      const a = Math.atan2(target.y - d.y, target.x - d.x);
      const s = mech().scale;
      if (!drawVehiclePart(vehicleSprites.drone, d.x, d.y, 0.28 * s, a)) {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(a);
        ctx.scale(s, s);
        ctx.fillStyle = '#e8f0f7';
        roundRect(-18, -14, 34, 28, 7, true);
        ctx.strokeStyle = '#5d7180';
        ctx.lineWidth = 2;
        roundRect(-18, -14, 34, 28, 7, false);
        ctx.fillStyle = '#263746';
        roundRect(4, -6, 30, 12, 4, true);
        ctx.fillStyle = '#8ff4ff';
        ctx.fillRect(28, -3, 8, 6);
        ctx.restore();
      }

      ctx.strokeStyle = 'rgba(142,244,255,.18)';
      ctx.beginPath();
      ctx.arc(d.x, d.y, 22 * mech().scale, 0, TAU);
      ctx.stroke();
    }
  }

  function nearestEnemyTarget() {
    const m = mech();
    let best = null;
    let bestD = Infinity;
    for (const e of hostileSnapshot()) {
      if (!e.alive) continue;
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
      const hpScale = 1 + Math.min(0.34, ((e.maxHp || e.hp || 1) - 1) * 0.09);
      if (!drawVehiclePart(vehicleSprites.enemyMissile, e.x, e.y, (e.hot ? 0.28 : 0.24) * hpScale, a + Math.PI) && !drawSpritePart(sprites.enemyMissile, e.x, e.y, (e.hot ? 0.16 : 0.13) * hpScale, a + Math.PI / 2)) {
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
      if ((e.maxHp || 1) > 1) {
        ctx.strokeStyle = e.hot ? 'rgba(255, 120, 120, 0.72)' : 'rgba(255, 223, 103, 0.62)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius + 4, 0, TAU);
        ctx.stroke();
      }
    }
  }

  function drawEnemyRockets() {
    for (const r of enemyRockets) {
      ctx.strokeStyle = 'rgba(255, 143, 83, .45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r.sx, r.sy);
      ctx.lineTo(r.x, r.y);
      ctx.stroke();
      const a = Math.atan2(r.vy, r.vx);
      if (!drawEnemyCentered(enemySprites.enemyRocket, r.x, r.y, 30, 10, a, 0.95)) {
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(a);
        ctx.fillStyle = '#ff9f55';
        roundRect(-8, -3, 14, 6, 3, true);
        ctx.fillStyle = '#ffd966';
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(2, -4);
        ctx.lineTo(2, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function drawHpRing(e, color = 'rgba(255, 223, 103, .7)') {
    if ((e.maxHp || 1) <= 1) return;
    const pct = clamp(e.hp / e.maxHp, 0, 1);
    ctx.strokeStyle = 'rgba(0,0,0,.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius + 7, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius + 7, -Math.PI / 2, -Math.PI / 2 + TAU * pct);
    ctx.stroke();
  }

  function drawDropPods() {
    for (const pod of dropPods) {
      const sprite = pod.hp <= pod.maxHp * 0.48 ? enemySprites.dropPodCracked : enemySprites.dropPod;
      if (!drawEnemyCentered(sprite, pod.x, pod.y, 66, 92, pod.angle || 0, 0.96)) {
        ctx.save();
        ctx.translate(pod.x, pod.y);
        ctx.rotate(pod.angle || 0);
        ctx.fillStyle = 'rgba(0, 0, 0, .25)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 31, 38, 0, 0, TAU);
        ctx.fill();
        const grad = ctx.createLinearGradient(-20, -34, 18, 32);
        grad.addColorStop(0, '#eef5fb');
        grad.addColorStop(0.45, '#8194a6');
        grad.addColorStop(1, '#1c2a38');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -38);
        ctx.bezierCurveTo(26, -28, 30, 10, 15, 34);
        ctx.lineTo(-15, 34);
        ctx.bezierCurveTo(-30, 10, -26, -28, 0, -38);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#dff4ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffdf67';
        roundRect(-10, -14, 20, 7, 3, true);
        ctx.fillStyle = '#203244';
        roundRect(-15, 4, 30, 18, 5, true);
        ctx.restore();
      }
      drawHpRing(pod, 'rgba(255, 223, 103, .75)');
    }
  }

  function drawParatroopers() {
    for (const trooper of paratroopers) {
      const sway = Math.sin(trooper.sway || 0);
      if (!drawEnemyCentered(enemySprites.paratrooper, trooper.x, trooper.y - 12, 82, 132, sway * 0.035, 0.96)) {
        ctx.save();
        ctx.translate(trooper.x, trooper.y);
        ctx.strokeStyle = 'rgba(220, 244, 255, .72)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -35, 34, Math.PI * 1.05, Math.PI * 1.95);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-24, -22);
        ctx.lineTo(-8, -5);
        ctx.moveTo(24, -22);
        ctx.lineTo(8, -5);
        ctx.stroke();
        ctx.rotate(sway * 0.08);
        ctx.fillStyle = '#263746';
        roundRect(-12, -4, 24, 28, 6, true);
        ctx.strokeStyle = '#8ff4ff';
        ctx.lineWidth = 2;
        roundRect(-12, -4, 24, 28, 6, false);
        ctx.fillStyle = '#dce8f5';
        ctx.beginPath();
        ctx.arc(0, -14, 9, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffdf67';
        ctx.fillRect(-4, -17, 8, 4);
        ctx.strokeStyle = '#b7cad8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-9, 8);
        ctx.lineTo(-21, 14);
        ctx.moveTo(9, 8);
        ctx.lineTo(24, 14);
        ctx.moveTo(-7, 23);
        ctx.lineTo(-14, 35);
        ctx.moveTo(7, 23);
        ctx.lineTo(14, 35);
        ctx.stroke();
        ctx.fillStyle = '#ff9f55';
        roundRect(12, 6, 22, 7, 3, true);
        ctx.restore();
      }
      drawHpRing(trooper, 'rgba(143, 244, 255, .78)');
    }
  }

  function drawPlayerMissiles() {
    for (const missile of playerMissiles) {
      const traits = missile.traits || {};
      const missileTrailColor = traits.radiation ? 'rgba(184, 255, 95, .52)' : (traits.splitter ? 'rgba(255, 155, 212, .48)' : (traits.piercer ? 'rgba(255, 223, 103, .52)' : 'rgba(111, 230, 255, .42)'));
      ctx.strokeStyle = missileTrailColor;
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
      if (!drawVehiclePart(vehicleSprites.playerMissile, missile.x, missile.y, 0.24, a + Math.PI) && !drawSpritePart(sprites.playerMissile, missile.x, missile.y, 0.18, a)) {
        ctx.save();
        ctx.translate(missile.x, missile.y);
        ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = traits.radiation ? '#b8ff5f' : (traits.splitter ? '#ff9bd4' : (traits.piercer ? '#ffdf67' : '#e9f3ff'));
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
      if (!drawVehiclePart(vehicleSprites.bolt, b.x, b.y, Math.max(0.11, b.radius * 0.03), a + Math.PI, 0.9) && !drawSpritePart(sprites.bolt, b.x, b.y, Math.max(0.08, b.radius * 0.022), a, 0.9)) {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.radius;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx * 0.025, b.y - b.vy * 0.025);
        ctx.stroke();
      }
    }
  }

  function flamePoint(flame, distance, bend) {
    const forwardX = Math.cos(flame.angle);
    const forwardY = Math.sin(flame.angle);
    const sideX = -forwardY;
    const sideY = forwardX;
    const t = distance / Math.max(1, flame.range);
    const sway = Math.sin(flame.seed + state.now * 13 + t * 4.2) * flame.range * 0.035 * t;
    const curve = bend * t * t + sway;
    return {
      x: flame.x + forwardX * distance + sideX * curve,
      y: flame.y + forwardY * distance + sideY * curve,
      sideX,
      sideY
    };
  }

  function drawFlameCones() {
    for (const flame of flameCones) {
      const t = clamp(flame.life / flame.maxLife, 0, 1);
      const bend = Math.sin(flame.seed + state.now * 8.5) * flame.range * 0.16;
      const steps = 7;
      const left = [];
      const right = [];
      for (let i = 0; i <= steps; i += 1) {
        const u = i / steps;
        const distance = flame.range * u;
        const width = Math.sin(u * Math.PI) * Math.tan(flame.width) * flame.range * (0.16 + u * 0.46);
        const p = flamePoint(flame, distance, bend);
        left.push({ x: p.x + p.sideX * width, y: p.y + p.sideY * width });
        right.push({ x: p.x - p.sideX * width, y: p.y - p.sideY * width });
      }

      const tip = flamePoint(flame, flame.range, bend);
      const grad = ctx.createLinearGradient(flame.x, flame.y, tip.x, tip.y);
      grad.addColorStop(0, `rgba(255, 240, 130, ${0.84 * t})`);
      grad.addColorStop(0.34, `rgba(255, 136, 44, ${0.54 * t})`);
      grad.addColorStop(0.78, `rgba(255, 64, 24, ${0.24 * t})`);
      grad.addColorStop(1, 'rgba(255, 40, 20, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(left[0].x, left[0].y);
      for (let i = 1; i < left.length; i += 1) ctx.lineTo(left[i].x, left[i].y);
      for (let i = right.length - 1; i >= 0; i -= 1) ctx.lineTo(right[i].x, right[i].y);
      ctx.closePath();
      ctx.fill();

      ctx.globalCompositeOperation = 'lighter';
      for (let i = 1; i <= 5; i += 1) {
        const u = i / 6;
        const p = flamePoint(flame, flame.range * u, bend * (0.65 + i * 0.05));
        const ember = flame.range * (0.11 - i * 0.008) * (0.75 + Math.sin(state.now * 20 + flame.seed + i) * 0.18);
        ctx.fillStyle = `rgba(255, ${190 - i * 18}, ${48 - i * 3}, ${0.18 * t})`;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, ember * 1.35, ember * 0.72, flame.angle + u * 0.55, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      ctx.strokeStyle = `rgba(255, 219, 87, ${0.28 * t})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= steps; i += 1) {
        const p = flamePoint(flame, flame.range * (i / steps), bend * 0.72);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }

  function drawRadiationCloudSprite(cloud) {
    const t = clamp(cloud.life / cloud.maxLife, 0, 1);
    const grow = 0.76 + (1 - t) * 0.34;
    const pulse = 0.94 + Math.sin(state.now * 7.5 + cloud.seed) * 0.07;
    const r = cloud.radius * grow * pulse;
    const ageT = clamp(cloud.age / Math.max(0.01, cloud.maxLife), 0, 1);
    const frame = clamp(Math.floor(ageT * effectSprites.radiationClouds.length), 0, effectSprites.radiationClouds.length - 1);
    if (drawEffectFrame(effectSprites.radiationClouds, frame, cloud.x, cloud.y, r * 2.72, r * 2.42, Math.sin(cloud.seed + state.now * 0.35) * 0.035, 0.92 * t)) {
      ctx.globalCompositeOperation = 'lighter';
      const glow = ctx.createRadialGradient(cloud.x, cloud.y, r * 0.18, cloud.x, cloud.y, r * 1.18);
      glow.addColorStop(0, `rgba(230, 255, 128, ${0.16 * t})`);
      glow.addColorStop(0.55, `rgba(90, 255, 91, ${0.10 * t})`);
      glow.addColorStop(1, 'rgba(40, 140, 68, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, r * 1.18, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(196, 255, 94, ${0.30 * t})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, r * 0.92, 0, TAU);
      ctx.stroke();
      return;
    }

    const gradient = ctx.createRadialGradient(cloud.x, cloud.y, r * 0.08, cloud.x, cloud.y, r);
    gradient.addColorStop(0, `rgba(230, 255, 128, ${0.24 * t})`);
    gradient.addColorStop(0.42, `rgba(105, 255, 95, ${0.16 * t})`);
    gradient.addColorStop(1, `rgba(28, 122, 61, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, r, 0, TAU);
    ctx.fill();

    for (let i = 0; i < 7; i += 1) {
      const a = cloud.seed + i * 2.399 + state.now * (0.22 + i * 0.015);
      const br = r * (0.20 + (i % 3) * 0.055);
      const bx = cloud.x + Math.cos(a) * r * (0.18 + (i % 2) * 0.18);
      const by = cloud.y + Math.sin(a * 0.82) * r * (0.14 + (i % 3) * 0.08);
      ctx.fillStyle = `rgba(${i % 2 ? 181 : 96}, 255, ${i % 2 ? 91 : 126}, ${0.11 * t})`;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
    }

    ctx.strokeStyle = `rgba(196, 255, 94, ${0.52 * t})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, r * 0.86, 0, TAU);
    ctx.stroke();

    ctx.save();
    ctx.translate(cloud.x, cloud.y);
    ctx.rotate(cloud.seed + state.now * 0.9);
    ctx.strokeStyle = `rgba(230, 255, 128, ${0.34 * t})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i += 1) {
      ctx.rotate(TAU / 3);
      ctx.beginPath();
      ctx.arc(0, -r * 0.16, r * 0.18, -0.45, 0.45);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRadiationClouds() {
    for (const cloud of radiationClouds) drawRadiationCloudSprite(cloud);
  }

  function drawExplosions() {
    for (const ex of explosions) {
      const t = clamp(ex.life / 0.42, 0, 1);
      const frame = clamp(Math.floor((1 - t) * effectSprites.explosions.length), 0, effectSprites.explosions.length - 1);
      const spriteSize = Math.max(38, ex.radius * 3.1);
      if (!drawEffectFrame(effectSprites.explosions, frame, ex.x, ex.y + spriteSize * 0.03, spriteSize, spriteSize * 0.92, 0, 0.94 * t)) {
        const fallbackSize = Math.max(28, ex.radius * 2.25);
        const fallbackFrame = clamp(Math.floor((1 - t) * sprites.explosions.length), 0, sprites.explosions.length - 1);
        if (!drawVehicleCentered(vehicleSprites.explosions[fallbackFrame], ex.x, ex.y, fallbackSize, fallbackSize, 0, 0.86 * t)) {
          drawSpriteCentered(sprites.explosions[fallbackFrame], ex.x, ex.y, fallbackSize, fallbackSize, 0, 0.86 * t);
        }
      }
      const playerBlast = ex.team === 'player';
      const core = playerBlast ? `rgba(255, 239, 150, ${0.26 * t})` : `rgba(255, 126, 91, ${0.25 * t})`;
      const glow = playerBlast ? `rgba(111, 230, 255, ${0.08 * t})` : `rgba(255, 91, 91, ${0.10 * t})`;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius * 0.92, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius * 0.34, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = playerBlast ? `rgba(255, 223, 103, ${0.76 * t})` : `rgba(255, 91, 91, ${0.70 * t})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = playerBlast ? `rgba(155, 239, 255, ${0.32 * t})` : `rgba(255, 170, 120, ${0.30 * t})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i += 1) {
        const a = i * TAU / 10 + ex.age * 3.1;
        const r0 = ex.radius * 0.42;
        const r1 = ex.radius * (0.88 + (i % 3) * 0.07);
        ctx.beginPath();
        ctx.moveTo(ex.x + Math.cos(a) * r0, ex.y + Math.sin(a) * r0);
        ctx.lineTo(ex.x + Math.cos(a) * r1, ex.y + Math.sin(a) * r1);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
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

  function drawDebris() {
    for (const d of debris) {
      ctx.save();
      ctx.globalAlpha = clamp(d.life, 0, 1);
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      const shard = enemySprites.shards[d.shard % enemySprites.shards.length];
      if (!drawEnemyCentered(shard, 0, 0, d.size * 1.75, d.size * 1.25, 0, 0.98)) {
        ctx.fillStyle = d.color;
        roundRect(-d.size * 0.5, -d.size * 0.32, d.size, d.size * 0.64, Math.min(4, d.size * 0.2), true);
        ctx.fillStyle = 'rgba(255,255,255,.16)';
        ctx.fillRect(-d.size * 0.34, -d.size * 0.22, d.size * 0.36, 2);
      }
      ctx.restore();
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
    syncMissileRackTimers();
    const nextRack = state.stats.missileRackTimers.reduce((best, t) => Math.min(best, t), state.stats.missileCooldown);
    const cooldown = 1 - clamp(nextRack / state.stats.missileCooldown, 0, 1);
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
    applySemiAutoGrace(performance.now());
    input.active = true;
    input.held = false;
    input.pointerId = event.pointerId;
    input.startTime = performance.now();
    input.startX = p.x;
    input.startY = p.y;
    input.x = p.x;
    input.y = p.y;
    fireMissile(p.x, p.y);
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
    input.lastTapX = p.x;
    input.lastTapY = p.y;
    input.active = false;
    input.held = false;
    input.pointerId = null;
    input.lastReleaseTime = performance.now();
    event.preventDefault();
  }

  function togglePause() {
    if (state.status !== 'playing') return;
    if (state.paused) resumeGame();
    else openPauseMenu();
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        const request = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
        if (request) await request.call(document.documentElement);
      } else {
        await exitBrowserFullscreen();
      }
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
  document.addEventListener('visibilitychange', handleMusicVisibilityChange);
  window.addEventListener('blur', () => { pauseMusicForBackground(); pauseSfxForBackground(); });
  window.addEventListener('focus', handleWindowFocus);
  window.addEventListener('pagehide', () => { pauseMusicForBackground(); pauseSfxForBackground(); });
  window.addEventListener('pageshow', () => { resumeMusicFromBackground(); resumeSfxFromBackground(); });
  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', onPointerMove, { passive: false });
  canvas.addEventListener('pointerup', onPointerUp, { passive: false });
  canvas.addEventListener('pointercancel', onPointerUp, { passive: false });
  startBtn.addEventListener('click', () => { startAudioSystems(); playProceduralSfx('ui_select_01'); startGame(); });
  pauseBtn.addEventListener('click', () => { startAudioSystems(); togglePause(); });
  if (musicBtn) musicBtn.addEventListener('click', () => { startAudioSystems(); playProceduralSfx('ui_select_01'); toggleMusicPlayback(); });
  menuBtn.addEventListener('click', () => { startAudioSystems(); openPauseMenu(); });
  window.addEventListener('keydown', event => {
    if (event.key === 'p' || event.key === 'Escape') togglePause();
    if (event.key === ' ') fireMissile(state.width * 0.5, state.height * 0.25);
  });

  resize();
  loadPersonalBest();
  loadMusicPreference();
  loadSfxPreference();
  updateHud();
  setOverlay('menu');
  requestAnimationFrame(loop);
})();
