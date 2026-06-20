# Armor Command Project Orientation

Armor Command is a standalone HTML5/canvas mobile prototype using the Marrow Runner workflow: dependency-free runtime, phone-first touch feel, generated-asset provenance, and itch-ready packaging. The current runtime direction is a side-view armor/tank platform rather than a full-body character mech.

## Entry Points

- `index.html`: browser shell.
- `styles.css`: fullscreen/mobile layout.
- `src/main.js`: game loop, touch input, rendering, weapons, enemies, waves, procedural side-view vehicle art, and upgrade behavior.
- `assets/asset_manifest.json`: generated/procedural asset notes and future image-gen prompts.
- `assets/sfx/sfx_manifest.json`: SFX batch-generation plan, runtime triggers, provenance targets, and mix notes. Current SFX master is 0.45 plus post-compressor output gain 0.72 against music 0.72.
- `assets/mech/mecha_pivots.json`: older modular mecha pivot plan retained as art-history/reference, not the current runtime direction.
- `tools/build_web_release.py`: packages a simple web zip.
- `harness.html`: simple responsive canvas smoke page.

## Run Locally

```sh
python -m http.server 8791
```

Open `http://127.0.0.1:8791/`.

## Validation

```sh
node --check src/main.js
python3 -m json.tool assets/asset_manifest.json >/dev/null
python3 -m json.tool assets/sfx/sfx_manifest.json >/dev/null
```

## Current MVP

- Tap-to-fire all ready interceptor racks from the starter weapon and visible missile batteries.
- Hold/drag continuously fires ready missile racks while spraying turret fire from a starter pistol-class gun; quick release-tap cadence ignores the final 0.5s of each rack cooldown.
- Drone Bay upgrades add up to four slaved gun drones; the run starts with none.
- Descending enemy missiles with wave-scaled speed, spawn cadence, and HP.
- Drop pod enemy branch: armored pods break into robot paratroopers; troopers descend, fire small rockets, and shatter into falling debris.
- Kill-chain score multiplier with a visible combo counter.
- Explosion-radius interception.
- Wave escalation, tree-tagged survivorlike upgrade offers, and capstones after repeated tree investment.
- Browser-local `localStorage` personal best score and deepest wave.
- Scatter-barrel, heavy-pistol, radioactive, piercer, splitter, and drone-conversion upgrades layered onto hold-fire and missile sequencing.
- Generated battlefield background, generated enemy pod/trooper sheet, and procedural fallbacks for tank/enemy rendering.
- Persistent SFX toggle in title/pause menus; in-game HUD no longer has a music button.

## Asset Plan

The runtime now uses procedural vehicle art for readability. Future image generation should produce a side-profile armored tank/vehicle with clear hardpoints, not a full-body humanoid mech: hull/treads, turret barrel, left/right missile batteries, optional drone sprites, missiles, bolts, explosions, and enemy missiles. Runtime should keep turret and drone aiming as transforms around anchor points rather than baked pose sheets.


## Termux Butler Release Tooling

Itch uploads use the locally compiled Android/Termux butler binary at `/data/data/com.termux/files/usr/tmp/butler-android-bin/butler`. Go is installed at `/data/data/com.termux/files/usr/bin/go` and reports `go1.26.4 android/arm64`. The binary was built from official `itchio/butler` source under `/data/data/com.termux/files/usr/tmp/butler-src-1780609690`; `butler version` reports `head, no build date`, and the `android-arm64-head/LATEST` 404 self-check can be ignored when push/status continue successfully.
