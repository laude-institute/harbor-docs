import { CodeBlock } from "@/components/code-block";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center space-y-12 max-w-6xl mx-auto px-4 py-6 sm:pt-12">
      <div className="space-y-6 flex flex-col items-center">
        <h1 className="text-8xl tracking-tighter font-code font-medium">
          harbor
        </h1>
        <p className="text-sm px-3 rounded-lg border py-1 bg-muted">
          From the makers of Terminal-Bench.
        </p>
        <p className="text-lg text-muted-foreground text-center">
          A framework for evaluating and optimizing agents and models in
          container environments.
        </p>
        <CodeBlock lang="bash" code={`uv tool install harbor`} />
        <Button size="lg" asChild className="mt-6">
          <Link href="/docs">Read the docs</Link>
        </Button>
        <div className="w-full aspect-video">
          <iframe
            src="https://www.loom.com/embed/8c11f218c9fc4674bd659146af435627"
            allowFullScreen
            className="w-full h-full rounded-xl"
            style={{ border: 0 }}
          ></iframe>
        </div>
      </div>
    </main>
  );
}
