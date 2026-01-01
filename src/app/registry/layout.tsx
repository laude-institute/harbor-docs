import { baseOptions } from "@/lib/layout.shared";
import { HomeLayout } from "fumadocs-ui/layouts/home";

export default function Layout({ children }: LayoutProps<"/registry">) {
  return (
    <HomeLayout {...{ ...baseOptions(), searchToggle: { enabled: false } }}>
      {children}
    </HomeLayout>
  );
}
