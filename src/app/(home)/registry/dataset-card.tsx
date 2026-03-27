"use client";

import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DatasetCardProps {
  name: string;
  version: string;
  description: string | null;
  taskCount: number;
  contributors?: { name: string; email: string }[];
  acknowledgement?: string;
}

export function DatasetCard({
  name,
  version,
  description,
  taskCount,
  contributors,
  acknowledgement,
}: DatasetCardProps) {
  const datasetString = `${name}@${version}`;

  return (
    <Link
      href={`/registry/${encodeURIComponent(name)}/${encodeURIComponent(
        version
      )}`}
      className="block border-b border-r"
    >
      <Card className="shadow-none rounded-none border-0 h-full hover:bg-sidebar dark:hover:bg-accent transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <CardTitle className="truncate font-code">{name}</CardTitle>
              <CopyButton
                text={datasetString}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast.success("Copied to clipboard", {
                    description: (
                      <span className="font-mono text-muted-foreground">
                        {datasetString}
                      </span>
                    ),
                  });
                }}
              />
            </div>
            <Badge variant="secondary" className="shrink-0 font-code">
              v{version}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {description || "No description available"}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4 flex-1 flex flex-col justify-between">
          {(contributors?.length || acknowledgement) && (
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-code">
              {contributors?.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <User className="size-3 shrink-0" />
                  {c.name}
                </span>
              ))}
              {acknowledgement && (
                <span className="flex items-center gap-1.5">
                  <Heart className="size-3 shrink-0" />
                  {acknowledgement}
                </span>
              )}
            </div>
          )}
          <div
            className="cursor-default"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <CodeBlock lang="bash" code={`uvx harbor run -d ${name}@${version}`} />
          </div>
          <p className="text-sm text-muted-foreground font-code">
            {taskCount} tasks
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
