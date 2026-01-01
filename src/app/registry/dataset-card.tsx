"use client";

import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface DatasetCardProps {
  name: string;
  version: string;
  description: string | null;
  taskCount: number;
}

export function DatasetCard({
  name,
  version,
  description,
  taskCount,
}: DatasetCardProps) {
  const handleCopyDataset = async () => {
    const datasetString = `${name}@${version}`;
    try {
      await navigator.clipboard.writeText(datasetString);
      toast.success("Copied to clipboard", {
        description: datasetString,
      });
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Card className="shadow-none rounded-none -mr-px -mt-px">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle
            className="truncate font-code cursor-pointer hover:underline"
            onClick={handleCopyDataset}
          >
            {name}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0 font-code">
            v{version}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {description || "No description available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4 flex-1 flex flex-col justify-between">
        <div>
          <CodeBlock lang="bash" code={`harbor run -d ${name}@${version}`} />
        </div>
        <p className="text-sm text-muted-foreground font-code">
          {taskCount} tasks
        </p>
      </CardContent>
    </Card>
  );
}
