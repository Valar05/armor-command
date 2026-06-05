# Mecha Command

Mobile-first HTML5 canvas prototype: a heroic chibi mecha defends the lower screen from descending missiles with tap-fired shoulder pods, hold-fired rifle spray, and four slaved gun drones.

## Run

```sh
python -m http.server 8791
```

Open:

```text
http://127.0.0.1:8791/
```

## Controls

- Tap: fire a shoulder missile at the target point.
- Hold/drag: spray rifle fire toward the live touch point.
- Drones: fire in parallel while holding.

## Validation

```sh
node --check src/main.js
python3 -m json.tool assets/asset_manifest.json >/dev/null
```

## Build Web Zip

```sh
python tools/build_web_release.py
```

The generated zip lands at `release/mecha-command-web.zip`.
