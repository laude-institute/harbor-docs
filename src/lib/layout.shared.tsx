import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Kayak } from "lucide-react";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2 mx-4">
          <Kayak strokeWidth={1.5} />
          <p className="font-serif text-xl">Harbor</p>
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
