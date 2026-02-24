import contributionData from "../../../../public/harbor_contribution.json";
import { ContributorCard } from "./contributor-card";
import Link from "next/link";

interface Contributor {
  github_handle: string;
  email: string;
  name: string;
  affiliation: string;
  pr_count: number;
  total_additions: number;
  total_deletions: number;
  pr_list: { pr_url: string; pr_title: string; pr_type: string }[];
}

function partitionContributors(data: Contributor[]) {
  const harborContributors: Contributor[] = [];
  const adapterContributors: Contributor[] = [];

  for (const c of data) {
    const hasAdapter = c.pr_list.some((pr) => pr.pr_type === "adapter");
    const hasNonAdapter = c.pr_list.some((pr) => pr.pr_type !== "adapter");

    if (hasNonAdapter) {
      harborContributors.push(c);
    }
    if (hasAdapter) {
      adapterContributors.push(c);
    }
  }

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
