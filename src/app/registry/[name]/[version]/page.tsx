import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TaskTable, type Task } from "./task-table";

type Dataset = Tables<"dataset">;
type DatasetTask = Tables<"dataset_task">;

interface PageProps {
  params: Promise<{
    name: string;
    version: string;
  }>;
}

async function getDataset(
  name: string,
  version: string
): Promise<Dataset | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("dataset")
    .select("*")
    .eq("name", name)
    .eq("version", version)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getTasks(name: string, version: string): Promise<DatasetTask[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("dataset_task")
    .select("*")
    .eq("dataset_name", name)
    .eq("dataset_version", version)
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name, version } = await params;
  const decodedName = decodeURIComponent(name);
  const dataset = await getDataset(decodedName, version);

  if (!dataset) {
    return {
      title: "Dataset Not Found",
    };
  }

  return {
    title: `${dataset.name}@${dataset.version} - Harbor Registry`,
    description: dataset.description || `Tasks in the ${dataset.name} dataset`,
  };
}

export default async function DatasetPage({ params }: PageProps) {
  const { name, version } = await params;
  const decodedName = decodeURIComponent(name);

  const [dataset, tasks] = await Promise.all([
    getDataset(decodedName, version),
    getTasks(decodedName, version),
  ]);

  if (!dataset) {
    notFound();
  }

  const taskData: Task[] = tasks.map((task) => ({
    id: task.id,
    name: task.name,
    path: task.path,
    git_url: task.git_url,
    git_commit_id: task.git_commit_id,
    created_at: task.created_at,
  }));

  return (
    <main className="flex flex-1 flex-col max-w-6xl w-full mx-auto px-4 py-12">
      <div className="space-y-6">
        <div>
          <Link href="/registry">
            <Button variant="ghost" size="sm" className="mb-4 -ml-3">
              <ArrowLeft className="h-4 w-4" />
              Back to Registry
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl tracking-tighter font-code">
              {dataset.name}
            </h1>
            <Badge variant="secondary" className="font-code">
              v{dataset.version}
            </Badge>
          </div>
          {dataset.description && (
            <p className="text-lg text-muted-foreground">
              {dataset.description}
            </p>
          )}
        </div>

        <div>
          <CodeBlock
            lang="bash"
            code={`harbor run -d ${dataset.name}@${dataset.version}`}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
          <TaskTable tasks={taskData} />
        </div>
      </div>
    </main>
  );
}
