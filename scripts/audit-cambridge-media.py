#!/usr/bin/env python3
"""Check converted Cambridge references against the verified media whitelist."""
import argparse
import html
import json
import pathlib
import re


def strings(value, path=""):
    if isinstance(value, dict):
        for key, child in value.items():
            yield from strings(child, path + "." + key)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from strings(child, path + f"[{index}]")
    elif isinstance(value, str):
        yield path, value


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--media-manifest", type=pathlib.Path, required=True)
    parser.add_argument("--report", type=pathlib.Path, required=True)
    args = parser.parse_args()
    root = pathlib.Path(__file__).resolve().parents[1]
    media = json.loads(args.media_manifest.read_text())
    source = json.loads((root / "public/data/cambridge/source-catalog.json").read_text())
    ready = {item["relative_path"]: item for item in media["assets"] if item.get("status") == "ready"}
    expected_audio = {str(part["sourceQuestionId"]) for volume in source["volumes"] for test in volume["tests"] for subject in test["subjects"] if subject["subject"] == "listening" for part in subject["parts"]}
    downloaded_audio = {qid for item in ready.values() if item["kind"] == "audio" for qid in item["qids"]}
    references = {}
    unresolved_source_urls = []
    files = list((root / "public/data/cambridge/passages").glob("*.json"))
    for filename in sorted(files):
        data = json.loads(filename.read_text())
        for field, value in strings(data):
            clean = html.unescape(value)
            for match in re.finditer(r"/api/guest/cambridge/media/((?:audio|images)/[A-Za-z0-9_.-]+)", clean):
                references.setdefault(match.group(1), []).append({"file": filename.name, "field": field})
            for match in re.finditer(r"https?://ieltscat-oss\.xdf\.cn/[^\s'\"<>\\]+", clean):
                unresolved_source_urls.append({"file": filename.name, "field": field, "url": match.group(0)})
    missing_keys = sorted(set(references) - set(ready))
    unused_keys = sorted(set(ready) - set(references))
    missing_audio = sorted(expected_audio - downloaded_audio)
    report = {
        "converted_part_files": len(files),
        "source_listening_parts_expected": len(expected_audio),
        "source_listening_parts_downloaded": len(expected_audio & downloaded_audio),
        "missing_source_audio_qids": missing_audio,
        "referenced_media_keys": len(references),
        "referenced_audio_keys": sum(key.startswith("audio/") for key in references),
        "referenced_image_keys": sum(key.startswith("images/") for key in references),
        "missing_media_keys": missing_keys,
        "unresolved_source_asset_urls": unresolved_source_urls,
        "unused_verified_keys": unused_keys,
        "references": references,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({key: value for key, value in report.items() if key not in ("references", "unused_verified_keys", "unresolved_source_asset_urls")}, ensure_ascii=False))
    if missing_audio or missing_keys or unresolved_source_urls:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
