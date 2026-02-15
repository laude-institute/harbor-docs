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
  affiliation: string;
  prCount: number;
  totalAdditions: number;
  totalDeletions: number;
}

export function ContributorCard({
  name,
  githubHandle,
  affiliation,
  prCount,
  totalAdditions,
  totalDeletions,
}: ContributorCardProps) {
  return (
    <Link
      href={`https://github.com/${githubHandle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="-mr-px -mt-px"
    >
      <Card className="shadow-none rounded-none h-full hover:bg-sidebar dark:hover:bg-accent transition-colors">
        <CardHeader>
          <CardTitle className="font-code text-lg">{name}</CardTitle>
          <CardDescription className="font-code text-xs">
            @{githubHandle}
          </CardDescription>
          {affiliation && (
            <p className="text-xs text-muted-foreground">{affiliation}</p>
          )}
          <p className="text-xs text-muted-foreground font-code pt-1">
            {prCount} PRs &middot; +{totalAdditions.toLocaleString()} / &minus;{totalDeletions.toLocaleString()}
          </p>
        </CardHeader>
      </Card>
    </Link>
  );
}
