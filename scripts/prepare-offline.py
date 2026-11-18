#!/usr/bin/env python3
"""Build a standalone copy of the public practice site using verified release media."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SCHOOL_CDN = 'https://sls-reading-zac.b-cdn.net'


def media_files(media_root):
    ordinary = ROOT / 'public/data/listening/NETLIFY_Audio_Included.json'
    for entry in json.loads(ordinary.read_text(encoding='utf-8'))['entries']:
        path = entry['path']
        if not re.fullmatch(r'media/listening/[a-zA-Z0-9_-]+\.mp3', path):
            raise ValueError(f'Unexpected listening media path: {path}')
        yield media_root / path, Path(path), entry
    cambridge = ROOT / 'server/materials/cambridge-media.json'
    for entry in json.loads(cambridge.read_text(encoding='utf-8'))['assets']:
        key = entry['key']
        if not re.fullmatch(r'(audio/[a-zA-Z0-9_-]+\.mp3|images/[a-zA-Z0-9_-]+\.(png|jpe?g|gif|webp))', key):
            raise ValueError(f'Unexpected Cambridge media path: {key}')
        # Keeping the API path also preserves the browser's existing image allowlist.
        yield media_root / 'cambridge' / key, Path('api/guest/cambridge/media') / key, entry


def copy_verified(source, target, entry):
    target.parent.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256()
    size = 0
    with source.open('rb') as input_file, target.open('wb') as output_file:
        for chunk in iter(lambda: input_file.read(1024 * 1024), b''):
            size += len(chunk)
            digest.update(chunk)
            output_file.write(chunk)
    if size != entry['sizeBytes'] or digest.hexdigest() != entry['sha256']:
        raise ValueError(f'Media verification failed: {source}')


def replace_once(path, before, after):
    source = path.read_text(encoding='utf-8')
    if source.count(before) != 1:
        raise ValueError(f'Unexpected frontend version in {path.name}: expected exactly one audio rule')
    path.write_text(source.replace(before, after), encoding='utf-8')


def prepare_frontend(site):
    # Ordinary practice resolves root-relative URLs against an explicit audio origin.
    replace_once(site / 'audio-source.mjs', repr(SCHOOL_CDN), 'new URL(import.meta.url).origin')
    # Advanced exercises have a separate allowlist for audio and embed full CDN URLs.
    replace_once(site / 'growth-ui.mjs', r'/^https:\/\/sls-reading-zac\.b-cdn\.net\/media\//',
                 r'/^\/media\/listening\/[a-zA-Z0-9_-]+\.mp3$/')
    prefix = SCHOOL_CDN + '/media/listening/'
    for path in site.rglob('*'):
        if path.suffix not in {'.js', '.mjs', '.html', '.json'}:
            continue
        content = path.read_text(encoding='utf-8')
        if prefix in content:
            path.write_text(content.replace(prefix, '/media/listening/'), encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--media-dir', type=Path, default=ROOT / 'media-backup',
                        help='Directory containing the extracted media/ and cambridge/ folders')
    parser.add_argument('--output', type=Path, default=ROOT / 'offline-site',
                        help='New directory for the standalone practice frontend')
    args = parser.parse_args()
    output = args.output.resolve()
    media = args.media_dir.resolve()
    public = (ROOT / 'public').resolve()
    if output.exists() or any(p == output or p in output.parents for p in (public, media)):
        parser.error('Choose a new output directory outside the public/ and media backup folders')
    assets = list(media_files(media))
    missing = [str(source) for source, _, entry in assets if not source.is_file() or source.stat().st_size != entry['sizeBytes']]
    if missing:
        raise ValueError(f'{len(missing)} media files missing or wrong size. First: {missing[0]}')
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.sls-offline-', dir=output.parent) as tmp:
        site = Path(tmp) / 'site'
        shutil.copytree(public, site)
        prepare_frontend(site)
        for source, relative, entry in assets:
            copy_verified(source, site / relative, entry)
        site.rename(output)
    print(f'Standalone public frontend: {output}\nVerified {len(assets)} media files.')
    print(f'Run python3 -m http.server 8000 --bind 127.0.0.1 from that directory and open http://127.0.0.1:8000/')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, KeyError) as exc:
        sys.exit(str(exc))
