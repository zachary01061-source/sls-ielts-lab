#!/usr/bin/env python3
"""Mirror the pinned Cambridge assets into a site's public API paths, verifying SHA-256."""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from hashlib import sha256
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
from tempfile import NamedTemporaryFile
from urllib.parse import urlsplit


def verified(path, asset):
    if not path.is_file() or path.stat().st_size != asset['sizeBytes']:
        return False
    digest = sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest() == asset['sha256']


def fetch(asset, destination):
    key = asset['key']
    if not re.fullmatch(r'(?:images|audio)/[A-Za-z0-9_-]+\.[a-z0-9]+', key):
        raise ValueError(f'Invalid key {key!r}')
    source = asset['sourceUrl']
    if urlsplit(source).netloc != 'ieltscat-oss.xdf.cn' or urlsplit(source).scheme != 'https':
        raise ValueError(f'Unexpected source for {key}')
    target = destination / key
    if verified(target, asset):
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile(prefix=target.name+'.', suffix='.part', dir=target.parent, delete=False) as temp:
        staging = Path(temp.name)
    try:
        subprocess.run(['curl', '--fail', '--location', '--silent', '--show-error', '--proto', '=https', '--proto-redir', '=https', '--connect-timeout', '12', '--max-time', '180', '--retry', '2', '--retry-max-time', '240', '--max-filesize', str(asset['sizeBytes']), '--output', str(staging), source], check=True)
        if not verified(staging, asset):
            raise IOError(f'SHA-256 or byte count mismatch: {key}')
        staging.replace(target)
    finally:
        if staging.exists():
            staging.unlink()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, default=Path('server/materials/cambridge-media.json'))
    parser.add_argument('--destination', type=Path, default=Path('public/api/guest/cambridge/media'))
    parser.add_argument('--workers', type=int, choices=range(1, 13), default=6)
    args = parser.parse_args()
    if not shutil.which('curl'):
        parser.error('curl is required')
    assets = json.loads(args.manifest.read_text())['assets']
    failures = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        jobs = {pool.submit(fetch, asset, args.destination):asset for asset in assets}
        for count, job in enumerate(as_completed(jobs),1):
            try:
                job.result()
            except Exception as exc:
                print(f"Failed {jobs[job]['key']}: {exc}", file=sys.stderr, flush=True)
                failures += 1
            if count % 25 == 0 or count == len(assets):
                print(f'{count}/{len(assets)} checked, {failures} failed', flush=True)
    return bool(failures)


if __name__ == '__main__':
    sys.exit(main())
