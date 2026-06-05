# Mecha Command Project Orientation

Mecha Command is a standalone HTML5/canvas mobile prototype using the Marrow Runner workflow: dependency-free runtime, phone-first touch feel, generated-asset provenance, and later itch-ready packaging.

## Entry Points

- `index.html`: browser shell.
- `styles.css`: fullscreen/mobile layout.
- `src/main.js`: game loop, touch input, rendering, weapons, enemies, waves, and procedural art.
- `assets/asset_manifest.json`: generated/procedural asset notes and future image-gen prompts.
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
```

## Current MVP

- Tap-to-fire shoulder missiles.
- Hold/drag rifle spray.
- Four square-formation gun drones slaved to hold fire.
- Descending enemy missiles.
- Explosion-radius interception.
- Wave escalation and lightweight survivorlike upgrade offers.
- Procedural heroic chibi mecha art with runtime arm and drone barrel tracking.

## Asset Plan

The first version uses procedural canvas art. Image generation should produce modular sprites rather than every aiming pose: torso, legs, arm+rife, shoulder pods, drones, missiles, bolts, explosions. Runtime rotates arm/drone assets around pivot anchors.
