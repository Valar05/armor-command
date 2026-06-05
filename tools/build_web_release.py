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
]
ASSET_GLOBS = [
    'assets/**/*.json',
    'assets/**/*.png',
    'assets/**/*.jpg',
    'assets/**/*.jpeg',
    'assets/**/*.webp',
    'assets/**/*.wav',
    'assets/**/*.mp3',
]


def main() -> int:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as zf:
        written = set()
        for rel in INCLUDE:
            path = ROOT / rel
            if path.exists():
                zf.write(path, rel)
                written.add(rel)
        for pattern in ASSET_GLOBS:
            for path in ROOT.glob(pattern):
                if not path.is_file():
                    continue
                rel = path.relative_to(ROOT).as_posix()
                if rel in written:
                    continue
                zf.write(path, rel)
                written.add(rel)
    with zipfile.ZipFile(OUT) as zf:
        bad = zf.testzip()
        if bad:
            raise SystemExit(f'bad zip entry: {bad}')
        print(f'wrote {OUT} entries={len(zf.namelist())}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
