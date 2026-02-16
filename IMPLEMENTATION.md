# Contributors Page — Implementation Plan

## Goal

Add a **Contributors** tab to the [Harbor Framework website](https://harborframework.com/) that displays all project contributors, organized into three sections: Harbor Contributors, Harbor Adapter Contributors, and Acknowledgments.

**Reference design**: [tbench.ai/contributors](https://www.tbench.ai/contributors)

---

## 1. Data Collection Pipeline

All scripts live at the repo root (`~/terminal-bench-harbor-translate/harbor-docs/`). They use the `gh` CLI to query the GitHub API and output JSON files consumed by the Next.js page.

### 1.1 Collect Merged PR Data — `collect_pr_data.py`

**Input**: GitHub API (`laude-institute/harbor` repo)
**Output**: `raw_pr_data.json`

| Field | Description |
|-------|-------------|
| `pr_number` | Pull request number |
| `pr_url` | URL to the PR on GitHub |
| `author_github_handle` | GitHub username of the PR author |
| `additions` | Lines added |
| `deletions` | Lines deleted |
| `pr_title` | Title of the PR |
| `pr_type` | One of: `adapter`, `task`, `engineering`, `other` |

**PR type classification logic** (applied in order):
1. `adapter` — title or labels contain "adapter"
2. `task` — title or labels contain "task"
3. `engineering` — title or labels match CI/CD/infra/build/chore/refactor keywords
4. `other` — everything else

**How to run**:
```bash
python collect_pr_data.py
# Requires: gh CLI authenticated with repo access
# Output: raw_pr_data.json (264 merged PRs)
```

### 1.2 Collect PR Author Info — `collect_user_data.py`

**Input**: `raw_pr_data.json` (reads unique author handles)
**Output**: `raw_github_users_data.json`

| Field | Description |
|-------|-------------|
| `github_handle` | GitHub username |
| `email` | Public email (may be `null`) |
| `name` | Display name (falls back to handle) |
| `affiliation` | Company/organization from GitHub profile |

**How to run**:
```bash
python collect_user_data.py
# Requires: raw_pr_data.json, gh CLI
# Output: raw_github_users_data.json (95 unique authors)
```

### 1.3 Generate Aggregated Contribution Data — `generate_contributions.py`

**Input**: `raw_pr_data.json` + `raw_github_users_data.json`
**Output**: `harbor_contribution.json`, `public/harbor_contribution.json`, `contributors_ready_to_show.csv`, `contributors.csv`

**JSON output fields** (`harbor_contribution.json`):

| Field | Description |
|-------|-------------|
| `github_handle` | GitHub username (used as key) |
| `email` | Public email |
| `name` | Display name |
| `affiliation` | Company/organization |
| `pr_count` | Total number of merged PRs |
| `total_additions` | Sum of all additions across PRs |
| `total_deletions` | Sum of all deletions across PRs |
| `pr_list` | Array of `{ pr_url, pr_title, pr_type }` |

**Ranking**: Contributors are sorted by `pr_count` (number of merged PRs) descending.

**CSV outputs**:

| File | Columns | Purpose |
|------|---------|---------|
| `contributors_ready_to_show.csv` | `github_handle`, `name`, `has_adapter_pr`, `has_non_adapter_pr` | Only the fields needed to render the webpage |
| `contributors.csv` | `github_handler`, `name`, `affiliation`, `email` | Full contact/attribution info for all contributors |

The script also copies `harbor_contribution.json` to `public/harbor_contribution.json` so Next.js can statically import it at build time.

**How to run**:
```bash
python generate_contributions.py
# Requires: raw_pr_data.json, raw_github_users_data.json
# Output: harbor_contribution.json, public/harbor_contribution.json,
#         contributors_ready_to_show.csv, contributors.csv (95 contributors)
```

### 1.4 Full Pipeline (run all three in sequence)

```bash
python collect_pr_data.py && python collect_user_data.py && python generate_contributions.py
```

---

## 2. Navigation Update

**File**: `src/lib/layout.shared.tsx`

Add a "Contributors" link as the third nav tab (between Registry and Discord):

```tsx
links: [
  { url: "/docs",         text: "Docs",         active: "nested-url" },
  { url: "/registry",     text: "Registry",     active: "nested-url" },
  { url: "/contributors", text: "Contributors", active: "nested-url" },  // NEW
  { url: "https://discord.gg/6xWPKhGDbA", text: "Discord", active: "none", external: true },
],
```

This places the Contributors tab alongside the existing Docs, Registry, and Discord tabs in the site header.

---

## 3. Contributors Page (Next.js)

### 3.1 Route Structure

All files under `src/app/(home)/contributors/` (inside the `(home)` route group, same pattern as the registry page):

```
src/app/(home)/contributors/
├── layout.tsx            # Page layout wrapper
├── page.tsx              # Main contributors page
└── contributor-card.tsx  # Individual contributor card component
```

### 3.2 Layout — `layout.tsx`

Simple layout wrapper matching the registry page style:
- Centered container with `max-w-7xl`
- Responsive padding (`px-4 pb-4 pt-6 sm:pt-12`)

### 3.3 Page — `page.tsx`

Statically imports `public/harbor_contribution.json` at build time (no runtime API calls).

**Three sections**:

| Section | Filter Logic | Description |
|---------|-------------|-------------|
| **Harbor Contributors** | At least one PR where `pr_type !== "adapter"` | Core framework contributors (67 people) |
| **Harbor Adapter Contributors** | At least one PR where `pr_type === "adapter"` | Adapter/benchmark contributors (37 people) |
| **Acknowledgments** | Static text | Credits section |

> Note: A contributor can appear in both sections if they have both adapter and non-adapter PRs.

**Grid layout**: Responsive grid (`1 col → 2 cols → 3 cols`) inside a bordered, rounded container.

### 3.4 Contributor Card — `contributor-card.tsx`

Each card is a clickable link to the contributor's GitHub profile. Uses shadcn/ui `Card`, `CardHeader`, `CardTitle`, `CardDescription`.

**Card contents** (minimal — name and handle only):
- **Name** — `CardTitle`, monospace font (`font-code`), `text-lg`
- **@handle** — `CardDescription`, monospace, `text-xs`

**Not displayed on cards** (available in data but excluded from UI):
- Affiliation
- PR count / additions / deletions

**Styling** (matches tbench.ai design):
- `shadow-none`, `rounded-none` (flush grid tiles with shared borders)
- `-mr-px -mt-px` offset on links for seamless tile borders
- Hover: `hover:bg-sidebar dark:hover:bg-accent`
- `transition-colors` for smooth hover animation

### 3.5 Acknowledgments Section

Static content rendered below the contributor grids:

```
Acknowledgments

API inference compute for parity experiments is generously supported by
2077AI (https://www.2077ai.com/).
```

---

## 4. File Inventory

### New Files (12)

| File | Type | Description |
|------|------|-------------|
| `collect_pr_data.py` | Script | Collect merged PR data from GitHub |
| `collect_user_data.py` | Script | Collect PR author profile info |
| `generate_contributions.py` | Script | Aggregate, rank, and export contributions |
| `raw_pr_data.json` | Data | Raw PR data (264 PRs) |
| `raw_github_users_data.json` | Data | Raw user profile data (95 users) |
| `harbor_contribution.json` | Data | Final aggregated contribution data (ranked by PR count) |
| `public/harbor_contribution.json` | Data | Copy for Next.js static import |
| `contributors_ready_to_show.csv` | Data | Webpage-only fields: handle, name, section flags |
| `contributors.csv` | Data | Full contact info: handle, name, affiliation, email |
| `src/app/(home)/contributors/layout.tsx` | Component | Page layout |
| `src/app/(home)/contributors/page.tsx` | Component | Main page with 3 sections |
| `src/app/(home)/contributors/contributor-card.tsx` | Component | Contributor card |

### Modified Files (1)

| File | Change |
|------|--------|
| `src/lib/layout.shared.tsx` | Added "Contributors" nav link |

---

## 5. Dependencies & Prerequisites

- **`gh` CLI**: Required for data collection scripts (must be authenticated with access to `laude-institute/harbor`)
- **Python 3**: Required to run the data collection pipeline
- **No new npm packages**: The page uses existing dependencies (shadcn/ui Card, Next.js Link, Fumadocs layout)

---

## 6. Local Development

```bash
# 1. Install dependencies
npm install   # or: bun install

# 2. (Optional) Re-collect contributor data
python collect_pr_data.py && python collect_user_data.py && python generate_contributions.py

# 3. Start dev server
npm run dev

# 4. Visit http://localhost:3000/contributors
```

---

## 7. Verification Checklist

- [x] `tsc --noEmit` — TypeScript type check passes (zero errors)
- [x] `npm run build` — Production build compiles successfully
- [x] Contributors page renders at `/contributors`
- [x] Nav tab "Contributors" appears in site header
- [x] Harbor Contributors section shows 67 contributors
- [x] Harbor Adapter Contributors section shows 37 contributors
- [x] Acknowledgments section displays 2077AI credit
- [x] Cards link to correct GitHub profiles
- [x] Cards display only name and @handle (no affiliation, no stats)
- [x] Contributors ranked by PR count (descending)
- [x] `contributors_ready_to_show.csv` generated with webpage-only fields
- [x] `contributors.csv` generated with handle, name, affiliation, email
- [x] Responsive grid layout (1/2/3 columns)
- [x] Dark mode support
