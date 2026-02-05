import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/docs/terminus-2', destination: '/docs/agents/terminus-2', permanent: true },
      { source: '/docs/trajectory-format', destination: '/docs/agents/trajectory-format', permanent: true },
      { source: '/docs/task-format', destination: '/docs/tasks', permanent: true },
      { source: '/docs/task-difference', destination: '/docs/tasks/task-difference', permanent: true },
      { source: '/docs/task-tutorial', destination: '/docs/tasks/task-tutorial', permanent: true },
      { source: '/docs/running-tbench', destination: '/docs/datasets/running-tbench', permanent: true },
      { source: '/docs/registering-datasets', destination: '/docs/datasets/registering-datasets', permanent: true },
      { source: '/docs/adapters', destination: '/docs/datasets/adapters', permanent: true },
      { source: '/docs/metrics', destination: '/docs/datasets/metrics', permanent: true },
      { source: '/docs/example-mcp', destination: '/docs/examples/mcp', permanent: true },
      { source: '/docs/example-llm-judge', destination: '/docs/examples/llm-judge', permanent: true },
      { source: '/docs/evals', destination: '/docs/use-cases/evals', permanent: true },
      { source: '/docs/rl', destination: '/docs/use-cases/rl', permanent: true },
      { source: '/docs/sft', destination: '/docs/use-cases/sft', permanent: true },
      { source: '/docs/prompt-optimization', destination: '/docs/use-cases/prompt-optimization', permanent: true },
      { source: '/docs/roadmap', destination: '/docs/contributing/roadmap', permanent: true },
    ];
  },
};

export default withMDX(config);
