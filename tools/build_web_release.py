#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'release' / 'mecha-command-web.zip'
INCLUDE = [
    'index.html',
    'styles.css',
    'harness.html',
    'README.md',
    'PROJECT_ORIENTATION.md',
    'src/main.js',
    'assets/asset_manifest.json',
    'assets/mech/mecha_pivots.json',
]


def main() -> int:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as zf:
        for rel in INCLUDE:
            path = ROOT / rel
            if path.exists():
                zf.write(path, rel)
    with zipfile.ZipFile(OUT) as zf:
        bad = zf.testzip()
        if bad:
            raise SystemExit(f'bad zip entry: {bad}')
        print(f'wrote {OUT} entries={len(zf.namelist())}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
