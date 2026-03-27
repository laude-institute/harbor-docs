import { newsSource } from "@/lib/source";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function NewsPage() {
  const posts = newsSource
    .getPages()
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 font-mono">
      <h1 className="text-3xl mb-8">News</h1>
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <Link key={post.url} href={post.url} className="block w-full">
            <Card className="w-full transition-colors hover:bg-fd-accent shadow-none">
              <CardHeader>
                <div className="mb-2 flex items-start justify-between gap-4">
                  <CardTitle className="text-xl">
                    {post.data.title}
                  </CardTitle>
                  <Badge variant="default" className="w-fit">
                    {new Date(post.data.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Badge>
                </div>
                {post.data.description && (
                  <CardDescription>{post.data.description}</CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
