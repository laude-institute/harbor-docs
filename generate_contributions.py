#!/usr/bin/env python3
"""Generate harbor_contribution.json by merging PR data and user data.

Reads raw_pr_data.json and raw_github_users_data.json, groups by author,
ranks by total additions, and outputs harbor_contribution.json.

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


def main():
    with open("raw_pr_data.json") as f:
        pr_data = json.load(f)

    with open("raw_github_users_data.json") as f:
        user_data = json.load(f)

    # Build user lookup
    user_map = {u["github_handle"]: u for u in user_data}

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
                "pr_count": 0,
                "total_additions": 0,
                "total_deletions": 0,
                "pr_list": [],
            }

        c = contributors[handle]
        c["pr_count"] += 1
        c["total_additions"] += pr["additions"]
        c["total_deletions"] += pr["deletions"]
        c["pr_list"].append({
            "pr_url": pr["pr_url"],
            "pr_title": pr["pr_title"],
            "pr_type": pr["pr_type"],
        })

    # Rank by total additions (descending)
    ranked = sorted(contributors.values(), key=lambda x: x["total_additions"], reverse=True)

    output_path = "harbor_contribution.json"
    with open(output_path, "w") as f:
        json.dump(ranked, f, indent=2)

    print(f"Wrote {len(ranked)} contributors to {output_path}")

    # Print summary
    print("\nTop 10 contributors by additions:")
    for i, c in enumerate(ranked[:10]):
        print(f"  {i + 1}. {c['name']} (@{c['github_handle']}) - "
              f"+{c['total_additions']}/-{c['total_deletions']} across {c['pr_count']} PRs")


if __name__ == "__main__":
    main()
