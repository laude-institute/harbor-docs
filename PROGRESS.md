# Contributors Page Implementation Progress

## Status: Complete

## Steps Completed

### 1. PR Data Collection (`collect_pr_data.py`)
- Fetches all merged PRs from `laude-institute/harbor` via GitHub API (`gh` CLI)
- Classifies each PR as `adapter`, `task`, `engineering`, or `other` based on title and labels
- Fetches per-PR additions/deletions stats
- Output: `raw_pr_data.json` (264 merged PRs)

### 2. User Data Collection (`collect_user_data.py`)
- Reads unique author handles from `raw_pr_data.json`
- Fetches each user's GitHub profile (name, email, company/affiliation)
- Output: `raw_github_users_data.json` (95 unique authors)

### 3. Contribution Aggregation (`generate_contributions.py`)
- Merges PR data and user data, keyed by GitHub handle
- Computes per-contributor: total additions, total deletions, PR count, PR list
- Ranks contributors by total additions (descending)
- Output: `harbor_contribution.json` (95 contributors)

### 4. Contributors Page (Next.js)
- **Nav tab**: Added "Contributors" link in `src/lib/layout.shared.tsx`
- **Layout**: `src/app/(home)/contributors/layout.tsx` (mirrors registry layout)
- **Page**: `src/app/(home)/contributors/page.tsx` with three sections:
  - **Harbor Contributors** — contributors with non-adapter PRs (67 contributors)
  - **Harbor Adapter Contributors** — contributors with adapter PRs (37 contributors)
  - **Acknowledgments** — 2077AI compute support credit
- **Card component**: `src/app/(home)/contributors/contributor-card.tsx`
  - Links to GitHub profile
  - Shows name, handle, affiliation, PR count, additions/deletions
  - Follows the same grid tile pattern as the registry page
- **Data**: `public/harbor_contribution.json` (statically imported by page)
- **Design**: Follows the contributor list format of https://www.tbench.ai/contributors

### 5. Verification
- TypeScript type check (`tsc --noEmit`): passes with zero errors
- Build compilation: successful (registry page fails due to pre-existing missing Supabase env vars, unrelated to contributors page)

## Files Created/Modified

### New Files
| File | Description |
|------|-------------|
| `collect_pr_data.py` | Script to collect merged PR data |
| `collect_user_data.py` | Script to collect PR author info |
| `generate_contributions.py` | Script to aggregate and rank contributions |
| `raw_pr_data.json` | Raw PR data (264 PRs) |
| `raw_github_users_data.json` | Raw user profile data (95 users) |
| `harbor_contribution.json` | Final aggregated contribution data |
| `public/harbor_contribution.json` | Copy for Next.js static import |
| `src/app/(home)/contributors/layout.tsx` | Contributors page layout |
| `src/app/(home)/contributors/page.tsx` | Contributors page component |
| `src/app/(home)/contributors/contributor-card.tsx` | Contributor card component |

### Modified Files
| File | Change |
|------|--------|
| `src/lib/layout.shared.tsx` | Added "Contributors" nav link |
