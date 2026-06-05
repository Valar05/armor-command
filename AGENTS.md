# Mecha Command Agent Notes

Read `PROJECT_ORIENTATION.md` before editing. Keep this as a standalone web/canvas project, not inside Thunder Brainstorm.

## Runtime Rules

- Preserve mobile-first one-finger input.
- Keep procedural art fallbacks even after generated sprites are added.
- Arm and drone aiming should be runtime transforms with anchor points, not large pose sheets.
- Avoid adding frameworks unless the project clearly outgrows plain canvas.

## Validation

Run after runtime changes:

```sh
node --check src/main.js
python3 -m json.tool assets/asset_manifest.json >/dev/null
```

## Asset Hygiene

Generated images, SFX, and future release page assets should be recorded in manifests. Refresh Android media indexing for files exported to Pictures/Download for external upload.
