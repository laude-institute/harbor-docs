import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ContributorCardProps {
  name: string;
  githubHandle: string;
  role: string;
}

export function ContributorCard({ name, githubHandle, role }: ContributorCardProps) {
  const hasName = name && name !== githubHandle;

  return (
    <Link
      href={`https://github.com/${githubHandle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="-mr-px -mt-px"
    >
      <Card className="shadow-none rounded-none h-full hover:bg-sidebar dark:hover:bg-accent transition-colors">
        <CardHeader>
          <CardTitle className="font-code text-lg">
            {hasName ? name : `@${githubHandle}`}
          </CardTitle>
          <CardDescription className="font-code text-xs">
            {hasName ? `@${githubHandle} · ${role}` : role}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
