import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Harbor Registry",
  description: "Browse datasets available in the Harbor registry",
};

type Dataset = Tables<"dataset"> & {
  dataset_task: [{ count: number }];
};

const FEATURED_DATASETS = ["terminal-bench", "swebench-verified"];

async function getDatasets() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("dataset")
    .select("*, dataset_task(count)")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching datasets:", error);
    return [];
  }

  const datasets = data as Dataset[];
  return datasets.sort((a, b) => {
    const aIndex = FEATURED_DATASETS.indexOf(a.name);
    const bIndex = FEATURED_DATASETS.indexOf(b.name);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });
}

export default async function RegistryPage() {
  const datasets = await getDatasets();

  return (
    <main className="flex flex-1 flex-col max-w-6xl w-full mx-auto px-4 py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-5xl tracking-tighter font-code mb-6">Registry</h1>
          <p className="text-lg text-muted-foreground">
            Browse the datasets available in the Harbor registry.
          </p>
        </div>

        {datasets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No datasets available yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 -m-px bg-card">
              {datasets.map((dataset) => (
                <Card
                  key={`${dataset.name}:${dataset.version}`}
                  className="shadow-none rounded-none -mr-px -mt-px"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="truncate font-code">
                        {dataset.name}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0 font-code">
                        v{dataset.version}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {dataset.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="gap-4 flex-1 flex flex-col justify-between">
                    <div>
                      <CodeBlock
                        lang="bash"
                        code={`harbor run -d ${dataset.name}@${dataset.version}`}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground font-code">
                      {dataset.dataset_task[0]?.count ?? 0} tasks
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
