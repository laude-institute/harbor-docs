import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2 mx-4">
          <p className="font-code tracking-tight text-lg font-medium">harbor</p>
        </div>
      ),
    },
    githubUrl: "https://github.com/laude-institute/harbor",
    links: [
      {
        url: "/docs",
        text: "Docs",
        active: "nested-url",
      },
      {
        url: "/registry",
        text: "Registry",
        active: "nested-url",
      },
      {
        url: "https://discord.gg/6xWPKhGDbA",
        text: "Discord",
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
