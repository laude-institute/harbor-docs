#!/usr/bin/env python3
"""Collect all merged PR data from laude-institute/harbor via GitHub API.

Outputs raw_pr_data.json with fields:
  pr_number, pr_url, author_github_handle, additions, deletions, pr_title, pr_type
"""

import json
import subprocess
import sys


REPO = "laude-institute/harbor"
PER_PAGE = 100


def classify_pr(title: str, labels: list[str]) -> str:
    """Classify PR type based on title and labels."""
    title_lower = title.lower()
    label_names = [l.lower() for l in labels]

    if any(k in title_lower for k in ["adapter", "[adapter]"]):
        return "adapter"
    if any(k in label_names for k in ["adapter"]):
        return "adapter"
    if any(k in title_lower for k in ["task", "[task]"]):
        return "task"
    if any(k in label_names for k in ["task"]):
        return "task"
    if any(k in title_lower for k in [
        "ci", "cd", "infra", "build", "deps", "chore", "refactor",
        "test", "lint", "format", "config", "[engineering]",
    ]):
        return "engineering"
    if any(k in label_names for k in ["engineering", "infrastructure", "ci/cd"]):
        return "engineering"
    return "other"


def fetch_merged_prs() -> list[dict]:
    """Fetch all merged PRs using gh CLI with pagination."""
    # --paginate concatenates multiple JSON arrays; use jq-style flattening
    cmd = [
        "gh", "api", "--paginate",
        "--jq", ".[] | select(.merged_at != null)",
        f"/repos/{REPO}/pulls?state=closed&per_page={PER_PAGE}",
    ]
    print(f"Fetching merged PRs from {REPO}...")
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)

    # Each line from --jq is a separate JSON object
    # But with --jq and array expansion, they come as newline-delimited JSON
    all_prs = []
    decoder = json.JSONDecoder()
    text = result.stdout.strip()
    pos = 0
    while pos < len(text):
        # Skip whitespace
        while pos < len(text) and text[pos] in ' \t\n\r':
            pos += 1
        if pos >= len(text):
            break
        obj, end = decoder.raw_decode(text, pos)
        all_prs.append(obj)
        pos = end

    print(f"Found {len(all_prs)} merged PRs")
    return all_prs


def get_pr_details(pr_number: int) -> dict:
    """Fetch additions/deletions for a specific PR."""
    cmd = [
        "gh", "api",
        f"/repos/{REPO}/pulls/{pr_number}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def main():
    merged_prs = fetch_merged_prs()

    pr_data = []
    total = len(merged_prs)

    for i, pr in enumerate(merged_prs):
        pr_number = pr["number"]
        print(f"[{i + 1}/{total}] Fetching details for PR #{pr_number}...")

        # Get detailed PR info for additions/deletions
        details = get_pr_details(pr_number)

        labels = [label["name"] for label in pr.get("labels", [])]

        entry = {
            "pr_number": pr_number,
            "pr_url": pr["html_url"],
            "author_github_handle": pr["user"]["login"],
            "additions": details.get("additions", 0),
            "deletions": details.get("deletions", 0),
            "pr_title": pr["title"],
            "pr_type": classify_pr(pr["title"], labels),
        }
        pr_data.append(entry)

    # Sort by PR number descending
    pr_data.sort(key=lambda x: x["pr_number"], reverse=True)

    output_path = "raw_pr_data.json"
    with open(output_path, "w") as f:
        json.dump(pr_data, f, indent=2)

    print(f"\nWrote {len(pr_data)} PRs to {output_path}")


if __name__ == "__main__":
    main()
