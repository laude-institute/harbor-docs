#!/usr/bin/env python3
"""Collect GitHub user info for all PR authors.

Reads raw_pr_data.json to get unique author handles, then fetches
user profiles via GitHub API.

Outputs raw_github_users_data.json with fields:
  github_handle, email, name, affiliation
"""

import json
import subprocess
import sys


def get_user_info(handle: str) -> dict:
    """Fetch GitHub user profile."""
    cmd = ["gh", "api", f"/users/{handle}"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  Warning: could not fetch user {handle}: {result.stderr.strip()}")
        return {}
    return json.loads(result.stdout)


def main():
    with open("raw_pr_data.json") as f:
        pr_data = json.load(f)

    # Collect unique author handles
    handles = sorted(set(pr["author_github_handle"] for pr in pr_data))
    print(f"Found {len(handles)} unique authors")

    users = []
    for i, handle in enumerate(handles):
        print(f"[{i + 1}/{len(handles)}] Fetching user info for {handle}...")
        info = get_user_info(handle)

        users.append({
            "github_handle": handle,
            "email": info.get("email") or "",
            "name": info.get("name") or handle,
            "affiliation": info.get("company") or "",
        })

    output_path = "raw_github_users_data.json"
    with open(output_path, "w") as f:
        json.dump(users, f, indent=2)

    print(f"\nWrote {len(users)} users to {output_path}")


if __name__ == "__main__":
    main()
