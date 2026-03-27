#!/usr/bin/env python3
"""Pull adapter_metadata.json files from harbor repo and generate registry-meta.json."""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

HARBOR_REPO = "git@github.com:harbor-framework/harbor.git"
OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "src",
    "app",
    "(home)",
    "registry",
    "registry-meta.json",
)

BUILDER_PATTERN = re.compile(r"^(.+?)\s*\(([^)]+)\)$")


def parse_builder(raw: str) -> dict:
    """Parse 'Name (email)' into {"name": ..., "email": ...}."""
    match = BUILDER_PATTERN.match(raw.strip())
    if match:
        return {"name": match.group(1).strip(), "email": match.group(2).strip()}
    return {"name": raw.strip(), "email": ""}


def main():
    clone_dir = tempfile.mkdtemp(prefix="harbor-")

    try:
        print(f"Cloning {HARBOR_REPO} (shallow)...")
        subprocess.run(
            ["git", "clone", "--depth", "1", HARBOR_REPO, clone_dir],
            check=True,
            capture_output=True,
            text=True,
        )

        adapters_dir = os.path.join(clone_dir, "adapters")
        if not os.path.isdir(adapters_dir):
            print("Error: adapters directory not found in harbor repo", file=sys.stderr)
            sys.exit(1)

        registry_meta: dict[str, dict] = {}
        for entry in sorted(os.listdir(adapters_dir)):
            metadata_path = os.path.join(adapters_dir, entry, "adapter_metadata.json")
            if not os.path.isfile(metadata_path):
                continue

            with open(metadata_path, "r") as f:
                data = json.load(f)

            if not isinstance(data, list) or len(data) == 0:
                continue

            item = data[0]
            adapter_name = item.get("adapter_name", entry)

            raw_builders = item.get("adapter_builders", [])
            if not isinstance(raw_builders, list):
                raw_builders = []
            contributors = [parse_builder(b) for b in raw_builders]

            registry_meta[adapter_name] = {
                "contributors": contributors,
                "acknowledgement": "2077AI",
            }

        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w") as f:
            json.dump(registry_meta, f, indent=2)
            f.write("\n")

        print(f"Generated {OUTPUT_PATH} with {len(registry_meta)} entries.")

    finally:
        shutil.rmtree(clone_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
