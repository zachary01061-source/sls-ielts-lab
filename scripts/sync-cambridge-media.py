#!/usr/bin/env python3
"""Download only media URLs observed in authorized Cambridge question exports.

The default is one incremental pass. Existing verified files are reused and HTTP
authorization/rate-limit failures are not retried automatically.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import html
import json
import pathlib
import re
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request


SOURCE_ORIGIN = "https://ieltscat.xdf.cn"
MAX_ASSET_BYTES = 100 * 1024 * 1024
VERIFIED_FILES = {}


def atomic_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    temp.replace(path)


def walk_strings(value):
    if isinstance(value, dict):
        for child in value.values():
            yield from walk_strings(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_strings(child)
    elif isinstance(value, str):
        yield value
        stripped = value.lstrip()
        if stripped.startswith(("{", "[")):
            try:
                nested = json.loads(value)
            except (ValueError, TypeError):
                return
            if not isinstance(nested, str):
                yield from walk_strings(nested)


def absolute_source_url(value):
    value = html.unescape(value).replace("\\/", "/").strip()
    if value.startswith("data:"):
        return None
    value = urllib.parse.urljoin(SOURCE_ORIGIN, value)
    parsed = urllib.parse.urlsplit(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc or parsed.username or parsed.password:
        return None
    return value


def inspect_raws(raw_dir):
    by_url = {}
    count = 0
    for raw_path in sorted(raw_dir.glob("*.json")):
        try:
            payload = json.loads(raw_path.read_text())
        except (OSError, ValueError):
            continue
        data = payload.get("data")
        if payload.get("code") != 200 or not isinstance(data, dict):
            continue
        count += 1
        qid = str(data.get("qId") or raw_path.stem)
        for doc in data.get("docList") or []:
            if str(doc.get("code")) != "6":
                continue
            for entry in doc.get("list") or []:
                body = entry.get("body")
                if isinstance(body, str):
                    try:
                        body = json.loads(body)
                    except ValueError:
                        continue
                source = absolute_source_url(body.get("audio", "")) if isinstance(body, dict) and body.get("audio") else None
                if source:
                    item = by_url.setdefault(source, {"kind": "audio", "source_url": source, "qids": [], "relative_path": f"audio/{qid}.mp3"})
                    if qid not in item["qids"]:
                        item["qids"].append(qid)
        for text in walk_strings(data):
            # Decode the extra layer of HTML escaping used inside content JSON.
            clean = html.unescape(text.replace('\\"', '"').replace("\\'", "'"))
            for match in re.finditer(r"<img\b[^>]*?\bsrc\s*=\s*['\"]([^'\"]+)['\"]", clean, re.I):
                source = absolute_source_url(match.group(1))
                if not source:
                    continue
                suffix = pathlib.PurePosixPath(urllib.parse.urlsplit(source).path).suffix.lower()
                if suffix not in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"}:
                    suffix = ".img"
                name = hashlib.sha256(source.encode()).hexdigest()[:32] + suffix
                item = by_url.setdefault(source, {"kind": "image", "source_url": source, "qids": [], "relative_path": "images/" + name})
                if qid not in item["qids"]:
                    item["qids"].append(qid)
    return count, by_url


def probe_audio(path):
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        raise RuntimeError("ffprobe is required to verify downloaded recordings")
    result = subprocess.run([ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)], capture_output=True, text=True, timeout=30)
    if result.returncode:
        raise RuntimeError("Audio could not be decoded")
    duration = float(json.loads(result.stdout)["format"]["duration"])
    if duration <= 0 or duration > 7200:
        raise RuntimeError("Unexpected audio duration")
    return round(duration, 3)


def download_asset(item, output_dir):
    result = dict(item)
    target = output_dir / item["relative_path"]
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        request = urllib.request.Request(item["source_url"], headers={"User-Agent": "SLS-Cambridge-Media-Transfer/1.0"})
        with urllib.request.urlopen(request, timeout=45) as response:
            content_type = response.headers.get_content_type()
            response_url = response.geturl()
            declared = response.headers.get("Content-Length")
            if declared and int(declared) > MAX_ASSET_BYTES:
                raise RuntimeError("Source file exceeds transfer limit")
            if item["kind"] == "audio" and not (content_type.startswith("audio/") or content_type == "application/octet-stream"):
                raise RuntimeError("Source did not return an audio file: " + content_type)
            if item["kind"] == "image" and not (content_type.startswith("image/") or content_type == "application/octet-stream"):
                raise RuntimeError("Source did not return an image file: " + content_type)
            if item["kind"] == "image" and content_type not in ("image/png", "image/jpeg", "image/gif", "image/webp"):
                raise RuntimeError("Image format is not supported by the Cambridge media server: " + content_type)
            with tempfile.NamedTemporaryFile(prefix=target.name + ".", suffix=".part", dir=target.parent, delete=False) as handle:
                temporary = pathlib.Path(handle.name)
                digest = hashlib.sha256()
                size = 0
                while True:
                    chunk = response.read(256 * 1024)
                    if not chunk:
                        break
                    size += len(chunk)
                    if size > MAX_ASSET_BYTES:
                        raise RuntimeError("Source file exceeds transfer limit")
                    digest.update(chunk)
                    handle.write(chunk)
            if not size:
                raise RuntimeError("Source file is empty")
            if declared and size != int(declared):
                raise RuntimeError("Source transfer ended before Content-Length bytes arrived")
            result.update(status="ready", size_bytes=size, sha256=digest.hexdigest(), content_type=content_type, response_url=response_url)
            if item["kind"] == "audio":
                result["duration_seconds"] = probe_audio(temporary)
            temporary.replace(target)
            temporary = None
            result["local_path"] = str(target)
    except urllib.error.HTTPError as error:
        result.update(status="error", http_status=error.code, error="HTTP " + str(error.code), blocked=error.code in (401, 403, 429))
    except Exception as error:
        result.update(status="error", error=str(error)[:300])
    finally:
        if temporary and temporary.exists():
            temporary.unlink()
    return result


def verify_existing(item, output_dir):
    path = output_dir / item["relative_path"]
    if item.get("status") != "ready" or not path.is_file() or path.stat().st_size != item.get("size_bytes"):
        return False
    stat = path.stat()
    fingerprint = (stat.st_size, stat.st_mtime_ns, item.get("sha256"))
    if VERIFIED_FILES.get(str(path)) == fingerprint:
        return True
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    verified = digest.hexdigest() == item.get("sha256")
    if verified:
        VERIFIED_FILES[str(path)] = fingerprint
    return verified


def save_manifests(args, items, raw_count):
    items = sorted(items, key=lambda item: (item["kind"], item["relative_path"]))
    summary = {"raw_files_seen": raw_count, "observed_assets": len(items), "audio_ready": sum(item["kind"] == "audio" and item["status"] == "ready" for item in items), "images_ready": sum(item["kind"] == "image" and item["status"] == "ready" for item in items), "errors": sum(item["status"] != "ready" for item in items), "total_bytes": sum(item.get("size_bytes", 0) for item in items if item["status"] == "ready")}
    manifest = {"version": 1, "source": SOURCE_ORIGIN, "summary": summary, "assets": items}
    atomic_json(args.output_dir / "media-manifest.json", manifest)
    server_assets = [{"key": item["relative_path"], "sourceUrl": item.get("response_url", item["source_url"]), "contentType": item["content_type"], "sizeBytes": item["size_bytes"], "sha256": item["sha256"]} for item in items if item["status"] == "ready" and (item["kind"] == "audio" or item["content_type"] in ("image/png", "image/jpeg", "image/gif", "image/webp"))]
    atomic_json(args.server_manifest, {"version": 1, "assets": server_assets})
    cambridge21 = {}
    for item in items:
        if item.get("status") != "ready" or item["kind"] != "audio":
            continue
        for qid in item["qids"]:
            matched = re.fullmatch(r"cambridge-21-test-(\d+)-listening-(\d+)", qid)
            if matched:
                cambridge21[matched[1] + "-" + matched[2]] = {"src": "/api/guest/cambridge/media/" + item["relative_path"], "durationSeconds": item["duration_seconds"], "sha256": item["sha256"]}
    atomic_json(args.output_dir / "cambridge21-audio-index.json", cambridge21)
    return manifest


def one_pass(args, previous):
    raw_count, observed = inspect_raws(args.raw_dir)
    if args.extra_sources and args.extra_sources.is_file():
        extra = json.loads(args.extra_sources.read_text())
        for item in extra.get("assets", []):
            source = absolute_source_url(item["source_url"])
            relative = item.get("relative_path", "")
            if not source or item.get("kind") not in ("audio", "image") or not re.fullmatch(r"(?:audio|images)/[A-Za-z0-9_-]+\.(?:mp3|png|jpg|jpeg|webp|gif)", relative):
                raise RuntimeError("Invalid explicit extra media source")
            if source in observed:
                observed[source]["qids"] = sorted(set(observed[source]["qids"]) | set(item["qids"]))
            else:
                observed[source] = {"kind": item["kind"], "source_url": source, "qids": item["qids"], "relative_path": relative}
    previous_by_url = {item["source_url"]: item for item in previous.get("assets", [])}
    items, pending = [], []
    for source, item in observed.items():
        old = previous_by_url.get(source)
        if old and verify_existing(old, args.output_dir):
            retained = {**old, "qids": sorted(set(old.get("qids", [])) | set(item["qids"]))}
            items.append(retained)
        elif old and old.get("status") == "error" and (old.get("blocked") or not args.retry_errors or old.get("attempts", 1) >= 2):
            items.append({**old, "qids": item["qids"]})
        else:
            item["attempts"] = (old.get("attempts", 1) if old else 0) + 1
            pending.append(item)
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = [executor.submit(download_asset, item, args.output_dir) for item in pending]
        for future in concurrent.futures.as_completed(futures):
            item = future.result()
            items.append(item)
            print(json.dumps({"kind": item["kind"], "qid": item["qids"][0], "status": item["status"], "bytes": item.get("size_bytes"), "error": item.get("error")}), flush=True)
            save_manifests(args, items, raw_count)
    manifest = save_manifests(args, items, raw_count)
    print(json.dumps({"summary": manifest["summary"]}), flush=True)
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--raw-dir", type=pathlib.Path, required=True)
    parser.add_argument("--output-dir", type=pathlib.Path, required=True)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--watch-seconds", type=int, default=0)
    parser.add_argument("--poll-seconds", type=int, default=15)
    parser.add_argument("--retry-errors", action="store_true")
    parser.add_argument("--server-manifest", type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[1] / "server/materials/cambridge-media.json")
    parser.add_argument("--extra-sources", type=pathlib.Path)
    parser.add_argument("--stop-file", type=pathlib.Path, help="Finish the current pass and stop watching when this file exists")
    args = parser.parse_args()
    if not 1 <= args.workers <= 6 or not 0 <= args.watch_seconds <= 1800 or not 1 <= args.poll_seconds <= 60:
        parser.error("workers must be 1–6; watch 0–1800 seconds; poll 1–60 seconds")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = args.output_dir / "media-manifest.json"
    previous = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    deadline = time.monotonic() + args.watch_seconds
    while True:
        previous = one_pass(args, previous)
        if not args.watch_seconds or time.monotonic() >= deadline or (args.stop_file and args.stop_file.exists()):
            break
        time.sleep(min(args.poll_seconds, max(0, deadline - time.monotonic())))


if __name__ == "__main__":
    main()
