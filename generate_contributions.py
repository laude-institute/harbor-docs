#!/usr/bin/env python3
"""Generate harbor_contribution.json by merging PR data and user data.

Reads raw_pr_data.json and raw_github_users_data.json, groups by author,
ranks by PR count (descending), and outputs harbor_contribution.json.

Also generates:
- contributors_ready_to_show.csv  (only fields needed for the webpage)
- contributors.csv                (github_handler, name, affiliation, email)

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

import csv
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

    # Rank by PR count (descending)
    ranked = sorted(contributors.values(), key=lambda x: x["pr_count"], reverse=True)

    # Write harbor_contribution.json
    output_path = "harbor_contribution.json"
    with open(output_path, "w") as f:
        json.dump(ranked, f, indent=2)

    # Copy to public/ for Next.js static import
    with open("public/harbor_contribution.json", "w") as f:
        json.dump(ranked, f, indent=2)

    print(f"Wrote {len(ranked)} contributors to {output_path}")

    # Write contributors_ready_to_show.csv (only webpage-required fields)
    with open("contributors_ready_to_show.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["github_handle", "name", "has_adapter_pr", "has_non_adapter_pr"])
        for c in ranked:
            has_adapter = any(pr["pr_type"] == "adapter" for pr in c["pr_list"])
            has_non_adapter = any(pr["pr_type"] != "adapter" for pr in c["pr_list"])
            writer.writerow([c["github_handle"], c["name"], has_adapter, has_non_adapter])

    print(f"Wrote contributors_ready_to_show.csv")

    # Write contributors.csv (full contact info)
    with open("contributors.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["github_handler", "name", "affiliation", "email", "is_adapter_contributor"])
        for c in ranked:
            is_adapter = any(pr["pr_type"] == "adapter" for pr in c["pr_list"])
            writer.writerow([c["github_handle"], c["name"], c["affiliation"], c["email"], is_adapter])

    print(f"Wrote contributors.csv")

    # Print summary
    print("\nTop 10 contributors by PR count:")
    for i, c in enumerate(ranked[:10]):
        print(f"  {i + 1}. {c['name']} (@{c['github_handle']}) - "
              f"{c['pr_count']} PRs, +{c['total_additions']}/-{c['total_deletions']}")


if __name__ == "__main__":
    main()
