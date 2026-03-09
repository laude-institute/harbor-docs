#!/usr/bin/env python3
"""Generate harbor_contribution.json by merging PR data and user data.

Reads raw_pr_data.json and raw_github_users_data.json, groups by author,
ranks by PR count (ties broken by last name), and outputs harbor_contribution.json.

Output format per contributor:
{
  "github_handle": str,
  "email": str,
  "name": str,
  "affiliation": str,
  "pr_count": int,
  "total_additions": int,
  "total_deletions": int,
  "pr_list": [
    {"pr_url": str, "pr_title": str, "pr_type": str}
  ]
}
"""

import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")


def main():
    with open(os.path.join(DATA_DIR, "raw_pr_data.json")) as f:
        pr_data = json.load(f)

    with open(os.path.join(DATA_DIR, "raw_github_users_data.json")) as f:
        raw_user_data = json.load(f)

    with open(os.path.join(DATA_DIR, "verified_github_users_data.json")) as f:
        verified_user_data = json.load(f)

    # Build user lookup: verified data takes precedence over raw GitHub data
    user_map = {u["github_handle"]: u for u in raw_user_data}
    for u in verified_user_data:
        user_map[u["github_handle"]] = u

    # Group PRs by author
    contributors: dict[str, dict] = {}

    for pr in pr_data:
        handle = pr["author_github_handle"]

        if handle not in contributors:
            user_info = user_map.get(handle, {})
            contributors[handle] = {
                "github_handle": handle,
                "email": user_info.get("email", ""),
                "name": user_info.get("name", handle),
                "affiliation": user_info.get("affiliation", ""),
                "role": user_info.get("role", "Contributor"),
                "rank": user_info.get("rank", 0),
                "adapter_rank": user_info.get("adapter_rank", 0),
                "pr_count": 0,
                "adapter_pr_count": 0,
                "non_adapter_pr_count": 0,
                "total_additions": 0,
                "total_deletions": 0,
                "pr_list": [],
            }

        c = contributors[handle]
        c["pr_count"] += 1
        if pr["pr_type"] == "adapter":
            c["adapter_pr_count"] += 1
        else:
            c["non_adapter_pr_count"] += 1
        c["total_additions"] += pr["additions"]
        c["total_deletions"] += pr["deletions"]
        c["pr_list"].append({
            "pr_url": pr["pr_url"],
            "pr_title": pr["pr_title"],
            "pr_type": pr["pr_type"],
        })

    # Insert verified users who have no PRs (e.g. advisors)
    for u in verified_user_data:
        handle = u["github_handle"]
        if handle not in contributors:
            contributors[handle] = {
                "github_handle": handle,
                "email": u.get("email", ""),
                "name": u.get("name", handle),
                "affiliation": u.get("affiliation", ""),
                "role": u.get("role", "Contributor"),
                "rank": u.get("rank", 0),
                "adapter_rank": u.get("adapter_rank", 0),
                "pr_count": 0,
                "adapter_pr_count": 0,
                "non_adapter_pr_count": 0,
                "total_additions": 0,
                "total_deletions": 0,
                "pr_list": [],
            }

    def last_name(c: dict) -> str:
        """Extract last name (last whitespace-separated token) for tiebreaking."""
        parts = c["name"].strip().split()
        return parts[-1].lower() if parts else c["github_handle"].lower()

    # Rank by PR count (descending), then by last name (ascending) for ties
    ranked = sorted(contributors.values(), key=lambda x: (-x["pr_count"], last_name(x)))

    output_path = os.path.join(DATA_DIR, "harbor_contribution.json")
    with open(output_path, "w") as f:
        json.dump(ranked, f, indent=2)

    print(f"Wrote {len(ranked)} contributors to {output_path}")

    # Print summary
    print("\nTop 10 contributors by PR count:")
    for i, c in enumerate(ranked[:10]):
        print(f"  {i + 1}. {c['name']} (@{c['github_handle']}) - "
              f"{c['pr_count']} PRs, +{c['total_additions']}/-{c['total_deletions']}")


if __name__ == "__main__":
    main()
