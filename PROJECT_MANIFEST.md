# Project Manifest: armor-command

- Generated: 2026-06-20T17:47:30-05:00
- Workspace path: `/storage/emulated/0/Documents/GodotProjects/armor-command`
- Git repository: yes
- Git remote: `https://github.com/Valar05/armor-command`
- Orientation: `PROJECT_ORIENTATION.md`
- Agent instructions: `AGENTS.md`

## Purpose Snapshot
> # Armor Command Project Orientation
> Armor Command is a standalone HTML5/canvas mobile prototype using the Marrow Runner workflow: dependency-free runtime, phone-first touch feel, generated-asset provenance, and itch-ready packaging. The current runtime direction is a side-view armor/tank platform rather than a full-body character mech.
> ## Entry Points
> - `index.html`: browser shell.
> - `styles.css`: fullscreen/mobile layout.
> - `src/main.js`: game loop, touch input, rendering, weapons, enemies, waves, procedural side-view vehicle art, and upgrade behavior.
> - `assets/asset_manifest.json`: generated/procedural asset notes and future image-gen prompts.
> - `assets/sfx/sfx_manifest.json`: SFX batch-generation plan, runtime triggers, provenance targets, and mix notes. Current SFX master is 0.45 plus post-compressor output gain 0.72 against music 0.72.
> - `assets/mech/mecha_pivots.json`: older modular mecha pivot plan retained as art-history/reference, not the current runtime direction.
> - `tools/build_web_release.py`: packages a simple web zip.
> - `harness.html`: simple responsive canvas smoke page.
> ## Run Locally
> ```sh
> python -m http.server 8791
> ```
> Open `http://127.0.0.1:8791/`.
> ## Validation
> ```sh

## Entrypoints And Validation Clues
- `harness.html`
- `src/main.js`

## Top-Level Inventory
- `.gitattributes`
- `.gitignore`
- `AGENTS.md`
- `assets/`
- `data/`
- `docs/`
- `harness.html`
- `index.html`
- `PROJECT_MANIFEST.md`
- `PROJECT_ORIENTATION.md`
- `README.md`
- `release/`
- `src/`
- `styles.css`
- `tools/`

## Git Hygiene
- `.gitignore` contains a Codex workspace hygiene block for credentials, caches, and local build outputs.
- `.gitattributes` contains a Codex Git LFS block for common binary assets, models, audio, video, archives, fonts, and PDFs.
- `git lfs install --local` was attempted for this repository during the manifest pass.
