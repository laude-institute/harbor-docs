# Contributors Data Pipeline

Scripts to collect and aggregate contributor data from the [laude-institute/harbor](https://github.com/laude-institute/harbor) repository. The output is consumed by the `/contributors` page.

## Prerequisites

- Python 3.10+
- [GitHub CLI (`gh`)](https://cli.github.com/) authenticated with access to the harbor repo (only needed for `refresh`, `refresh-prdata`, `refresh-userdata`)

## Usage

Use `ctbcli` to run the pipeline:

```bash
# Full refresh: collect PR data + user data from GitHub, then regenerate
./utils/contributors/ctbcli refresh

# PR data only: re-collect PR data from GitHub and regenerate
./utils/contributors/ctbcli refresh-prdata

# User data only: re-collect user profiles from GitHub and regenerate
./utils/contributors/ctbcli refresh-userdata

# Regenerate from existing data (no API calls — use after editing verified data)
./utils/contributors/ctbcli generate
```

## Directory Structure

```
utils/contributors/
├── ctbcli                  # CLI entrypoint
├── README.md
├── src/                    # Python scripts
│   ├── collect_pr_data.py
│   ├── collect_user_data.py
│   └── generate_contributions.py
└── data/                   # Data files
    ├── verified_github_users_data.json   # Manually curated (source of truth)
    ├── raw_pr_data.json                  # Auto-generated from GitHub API
    ├── raw_github_users_data.json        # Auto-generated from GitHub API
    └── harbor_contribution.json          # Final output for the web page
```

## How It Works

### Data flow

```
GitHub API ──► raw_pr_data.json ──────────────────────┐
GitHub API ──► raw_github_users_data.json ──┐          │
                                            ▼          ▼
              verified_github_users_data.json ──► generate_contributions.py
                                                       │
                                                       ▼
                                              harbor_contribution.json
                                                       │
                                                       ▼
                                              /contributors page
```

### Scripts (`src/`)

| Script | What it does | API calls |
|--------|-------------|-----------|
| `collect_pr_data.py` | Fetches all merged PRs from `laude-institute/harbor`, classifies each by type (`adapter`, `task`, `engineering`, `other`), and writes `raw_pr_data.json` | Yes (slowest) |
| `collect_user_data.py` | Reads unique author handles from `raw_pr_data.json`, fetches GitHub profiles, and writes `raw_github_users_data.json` | Yes |
| `generate_contributions.py` | Merges PR data with user data, ranks contributors, and writes `harbor_contribution.json` | No |

### Data files (`data/`)

| File | Source | Editable? | Description |
|------|--------|-----------|-------------|
| `verified_github_users_data.json` | Manual | **Yes** | Curated contributor info with verified names, affiliations, roles, and ranks. Takes precedence over raw GitHub data when a handle matches. |
| `raw_pr_data.json` | `collect_pr_data.py` | No | All merged PRs with author, additions/deletions, title, and type classification |
| `raw_github_users_data.json` | `collect_user_data.py` | No | GitHub profile data (name, email, company) for each PR author. Used as fallback when a handle is not in the verified data. |
| `harbor_contribution.json` | `generate_contributions.py` | No | Final aggregated output consumed by the `/contributors` page |

### Verified user data fields

The `verified_github_users_data.json` file supports these fields:

| Field | Required | Description |
|-------|----------|-------------|
| `github_handle` | Yes | GitHub username |
| `name` | Yes | Display name |
| `affiliation` | Yes | Organization or university |
| `email` | Yes | Contact email |
| `role` | No | Displayed on card (e.g. `"Co-lead"`, `"Adapter Lead"`, `"Advisor"`). Defaults to `"Contributor"` |
| `rank` | No | Sort priority for Harbor Contributors section (higher = listed first). Defaults to `0` |
| `adapter_rank` | No | Sort priority for Adapter Contributors section (higher = listed first). Defaults to `0` |

### Ranking logic

- **Harbor Contributors**: sorted by `rank` (desc) → non-adapter PR count (desc) → last name (asc)
- **Adapter Contributors**: sorted by `adapter_rank` (desc) → adapter PR count (desc) → last name (asc)

## Common Tasks

**New PRs merged — update the page:**
```bash
./utils/contributors/ctbcli refresh
```

**Edited verified user data (name, role, rank, etc.):**
```bash
./utils/contributors/ctbcli generate
```

**New contributor needs verified info:**
1. Add an entry to `data/verified_github_users_data.json`
2. Run `./utils/contributors/ctbcli generate`
