"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ExternalLink, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export type Task = {
  id: number;
  name: string;
  path: string;
  git_url: string;
  git_commit_id: string;
  created_at: string;
};

function buildGitLink(gitUrl: string, commitId: string, path: string): string {
  // Convert git URL to browsable URL
  // Handle both https://github.com/... and git@github.com:... formats
  let baseUrl = gitUrl;

  if (gitUrl.startsWith("git@")) {
    // Convert git@github.com:user/repo.git to https://github.com/user/repo
    baseUrl = gitUrl
      .replace("git@", "https://")
      .replace(":", "/")
      .replace(/\.git$/, "");
  } else if (gitUrl.endsWith(".git")) {
    baseUrl = gitUrl.replace(/\.git$/, "");
  }

  // Build the blob URL with commit and path
  return `${baseUrl}/tree/${commitId}/${path}`;
}

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="font-code">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "path",
    header: "Path",
    cell: ({ row }) => (
      <span className="font-code text-muted-foreground">
        {row.getValue("path")}
      </span>
    ),
  },
  {
    accessorKey: "git_commit_id",
    header: "Commit",
    cell: ({ row }) => (
      <span className="font-code text-muted-foreground">
        {(row.getValue("git_commit_id") as string).slice(0, 7)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Source",
    cell: ({ row }) => {
      const task = row.original;
      const link = buildGitLink(task.git_url, task.git_commit_id, task.path);
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="sr-only">View source</span>
        </a>
      );
    },
  },
];

interface TaskTableProps {
  tasks: Task[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
