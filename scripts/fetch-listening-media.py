#!/usr/bin/env python3
"""Restore listening recordings from the school's CDN and verify each SHA-256.

Run at the repository root: python3 scripts/fetch-listening-media.py
To use another public folder or mirror, see --help. Existing matching files are kept.
"""
import argparse
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import sys
import tempfile
import time
import urllib.request

DEFAULT_ORIGIN = 'https://sls-reading-zac.b-cdn.net'
DEFAULT_MANIFEST = 'public/data/listening/NETLIFY_Audio_Included.json'


def digest_file(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(256 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def restore(entry, dest, origin):
    relative = entry['path']
    if not re.fullmatch(r'media/listening/[A-Za-z0-9_-]+\.mp3', relative):
        raise ValueError('Unexpected audio path')
    target = dest.joinpath(*PurePosixPath(relative).parts)
    expected_size = int(entry['sizeBytes'])
    expected_hash = entry['sha256']
    if target.is_file() and target.stat().st_size == expected_size and digest_file(target) == expected_hash:
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    url = origin.rstrip('/') + '/' + relative
    for attempt in range(3):
        temp = None
        try:
            with urllib.request.urlopen(url, timeout=75) as response, tempfile.NamedTemporaryFile(dir=target.parent, delete=False) as out:
                temp = Path(out.name)
                digest = hashlib.sha256()
                total = 0
                for chunk in iter(lambda: response.read(256 * 1024), b''):
                    total += len(chunk)
                    if total > expected_size:
                        raise ValueError('Response exceeds manifest size')
                    out.write(chunk)
                    digest.update(chunk)
            if total != expected_size or digest.hexdigest() != expected_hash:
                raise ValueError('Size or SHA-256 mismatch')
            os.replace(temp, target)
            return
        except (OSError, ValueError) as exc:
            if attempt == 2:
                raise RuntimeError(str(exc)) from exc
            time.sleep(2 ** attempt)
        finally:
            if temp is not None and temp.exists():
                temp.unlink()


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--manifest', type=Path, default=Path(DEFAULT_MANIFEST))
    cli.add_argument('--output', type=Path, default=Path('public'), help='Static site root (default public)')
    cli.add_argument('--origin', default=DEFAULT_ORIGIN, help='Audio mirror origin')
    cli.add_argument('--jobs', type=int, default=6, help='Parallel requests')
    args = cli.parse_args()
    if args.jobs < 1:
        cli.error('--jobs must be positive')
    entries = json.loads(args.manifest.read_text(encoding='utf-8'))['entries']
    failed = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        files = {pool.submit(restore, entry, args.output, args.origin): entry['path'] for entry in entries}
        for i, future in enumerate(concurrent.futures.as_completed(files), start=1):
            try:
                future.result()
            except Exception as exc:
                failed += 1
                print(f'{files[future]}: {exc}', file=sys.stderr, flush=True)
            if i % 25 == 0 or i == len(files):
                print(f'Checked {i}/{len(files)}, {failed} failed', flush=True)
    return int(bool(failed))


if __name__ == '__main__':
    sys.exit(main())
