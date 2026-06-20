# Armor Command

Mobile-first HTML5 canvas prototype: a side-view armor platform defends the lower screen from descending missiles, drop pods, robot paratroopers, and rockets with tap-fired interceptors, hold-fired turret shots, missile-battery upgrades, and optional slaved gun drones.

## Run

```sh
python -m http.server 8791
```

Open:

```text
http://127.0.0.1:8791/
```

## Controls

- Tap: fire any ready interceptor rack at the target point.
- Hold/drag: keep firing ready missile racks while spraying turret fire toward the live touch point. Release and tap again quickly to ignore the final 0.5s of a rack cooldown.
- Drone Bay upgrades: add up to four slaved drones that fire in parallel while holding.

## Personal best

The browser saves local personal best score and deepest wave in `localStorage` under `armor-command.personal-best.v1`, with a migration from the legacy `mecha-command.personal-best.v1` key.

## Enemy pressure

Waves increase missile count, spawn cadence, speed, hot-missile chance, and missile HP. Multi-HP missiles draw an armor ring. Later waves can spawn drop pods; breaking a pod spawns a descending robot paratrooper that fires small destructible rockets. Pods and troopers shatter into falling debris when destroyed.

## Audio Controls

Music and SFX toggles live in the title and pause menus. The in-game HUD keeps only Pause and Menu buttons so the playfield stays clean. Preferences are stored in browser `localStorage`.

## Kill Chain

Kills within a short window build a visible `CHAIN` counter. Each chained kill raises the score multiplier by 0.25 up to x8.00. Letting the timer expire or taking base damage resets the chain.

## Termux Butler Notes

This workspace uses a home-compiled Android/Termux butler build for itch uploads. Go is installed at `/data/data/com.termux/files/usr/bin/go` (`go1.26.4 android/arm64`). The local butler binary is `/data/data/com.termux/files/usr/tmp/butler-android-bin/butler`, built from official `itchio/butler` source under `/data/data/com.termux/files/usr/tmp/butler-src-1780609690`. It reports `head, no build date`; push/status work, and the `android-arm64-head/LATEST` 404 self-version check is harmless.

## Validation

```sh
node --check src/main.js
python3 -m json.tool assets/asset_manifest.json >/dev/null
```

## Build Web Zip

```sh
python tools/build_web_release.py
```

The generated zip lands at `release/armor-command-web.zip`.
