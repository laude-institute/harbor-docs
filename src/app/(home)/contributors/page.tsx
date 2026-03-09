import contributionData from "../../../../utils/contributors/data/harbor_contribution.json";
import { ContributorCard } from "./contributor-card";
import Link from "next/link";

interface Contributor {
  github_handle: string;
  email: string;
  name: string;
  affiliation: string;
  role: string;
  rank: number;
  adapter_rank: number;
  pr_count: number;
  adapter_pr_count: number;
  non_adapter_pr_count: number;
  total_additions: number;
  total_deletions: number;
  pr_list: { pr_url: string; pr_title: string; pr_type: string }[];
}

function lastName(c: Contributor): string {
  const parts = c.name.trim().split(/\s+/);
  return (parts[parts.length - 1] ?? c.github_handle).toLowerCase();
}

function partitionContributors(data: Contributor[]) {
  const harborContributors: Contributor[] = [];
  const adapterContributors: Contributor[] = [];

  for (const c of data) {
    if (c.non_adapter_pr_count > 0 || c.rank !== 0) {
      harborContributors.push(c);
    }
    if (c.adapter_pr_count > 0 || c.adapter_rank !== 0) {
      adapterContributors.push(c);
    }
  }

  // Rank first takes priority (descending), then PR count, then last name
  harborContributors.sort(
    (a, b) => b.rank - a.rank || b.non_adapter_pr_count - a.non_adapter_pr_count || lastName(a).localeCompare(lastName(b)),
  );
  adapterContributors.sort(
    (a, b) => b.adapter_rank - a.adapter_rank || b.adapter_pr_count - a.adapter_pr_count || lastName(a).localeCompare(lastName(b)),
  );

  return { harborContributors, adapterContributors };
}

export default function ContributorsPage() {
  const data = contributionData as Contributor[];
  const { harborContributors, adapterContributors } =
    partitionContributors(data);

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-4xl tracking-tighter font-code font-medium">
          Contributors
        </h1>
        <p className="text-muted-foreground">
          Harbor is built by an open community of contributors. Interested in
          contributing?{" "}
          <Link href="/docs/contributing" className="underline">
            Learn how to get started
          </Link>
          .
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl tracking-tighter font-code font-medium">
          Harbor Contributors
        </h2>
        <div className="border rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 -m-px bg-card">
            {harborContributors.map((c) => (
              <ContributorCard
                key={`harbor-${c.github_handle}`}
                name={c.name}
                githubHandle={c.github_handle}
                role={c.role}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl tracking-tighter font-code font-medium">
          Harbor Adapter Contributors
        </h2>
        <div className="border rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 -m-px bg-card">
            {adapterContributors.map((c) => (
              <ContributorCard
                key={`adapter-${c.github_handle}`}
                name={c.name}
                githubHandle={c.github_handle}
                role={c.role}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl tracking-tighter font-code font-medium">
          Acknowledgments
        </h2>
        <div className="border rounded-xl p-6 bg-card">
          <p className="text-muted-foreground">
            API inference compute for parity experiments is generously supported
            by{" "}
            <Link
              href="https://www.2077ai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              2077AI
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
