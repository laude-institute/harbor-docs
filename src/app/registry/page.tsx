import { createClient } from "@/lib/supabase/server";
import type { Dataset, DatasetTask, DatasetMetric } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registry - Harbor",
  description: "Browse datasets available in the Harbor registry",
};

interface DatasetWithCounts {
  name: string;
  version: string;
  description: string | null;
  created_at: string;
  task_count: number;
  metric_count: number;
}

async function getDatasets(): Promise<DatasetWithCounts[]> {
  const supabase = createClient();

  // Fetch datasets with their related task and metric counts
  const { data: datasets, error } = await supabase
    .from("dataset")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !datasets) {
    console.error("Error fetching datasets:", error);
    return [];
  }

  // Fetch task counts for each dataset
  const { data: tasks } = await supabase
    .from("dataset_task")
    .select("dataset_name, dataset_version");

  // Fetch metric counts for each dataset
  const { data: metrics } = await supabase
    .from("dataset_metric")
    .select("dataset_name, dataset_version");

  // Create maps for counting
  const taskCountMap = new Map<string, number>();
  const metricCountMap = new Map<string, number>();

  (tasks as Pick<DatasetTask, "dataset_name" | "dataset_version">[] | null)?.forEach((task) => {
    const key = `${task.dataset_name}:${task.dataset_version}`;
    taskCountMap.set(key, (taskCountMap.get(key) || 0) + 1);
  });

  (metrics as Pick<DatasetMetric, "dataset_name" | "dataset_version">[] | null)?.forEach((metric) => {
    const key = `${metric.dataset_name}:${metric.dataset_version}`;
    metricCountMap.set(key, (metricCountMap.get(key) || 0) + 1);
  });

  return (datasets as Dataset[]).map((dataset) => {
    const key = `${dataset.name}:${dataset.version}`;
    return {
      name: dataset.name,
      version: dataset.version,
      description: dataset.description,
      created_at: dataset.created_at,
      task_count: taskCountMap.get(key) || 0,
      metric_count: metricCountMap.get(key) || 0,
    };
  });
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function RegistryPage() {
  const datasets = await getDatasets();

  return (
    <main className="flex flex-1 flex-col max-w-6xl mx-auto px-4 py-12">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl tracking-tight font-serif">Registry</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 -m-px bg-card">
              {datasets.map((dataset) => (
                <Card
                  key={`${dataset.name}:${dataset.version}`}
                  className="shadow-none rounded-none -mr-px -mt-px"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="truncate">{dataset.name}</CardTitle>
                      <Badge variant="secondary" className="shrink-0">
                        v{dataset.version}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {dataset.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{dataset.task_count} tasks</span>
                      <span>·</span>
                      <span>{dataset.metric_count} metrics</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Added {formatDate(dataset.created_at)}
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
