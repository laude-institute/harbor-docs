import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2 mr-4">
          <p className="font-code tracking-tight text-lg">harbor</p>
        </div>
      ),
    },
    githubUrl: "https://github.com/laude-institute/harbor",
    links: [
      {
        url: "/docs",
        text: "docs",
        active: "nested-url",
      },
      {
        url: "/news",
        text: "news",
        active: "nested-url",
      },
      {
        url: "/registry",
        text: "registry",
        active: "nested-url",
      },
      {
        url: "https://discord.gg/6xWPKhGDbA",
        text: "discord",
        active: "none",
        external: true,
      },
    ],
    themeSwitch: {
      enabled: true,
      mode: "light-dark-system",
    },
  };
}
