import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart preview",
  description:
    "Your free DestinyBlueprint Zi Wei chart preview — unlock the full report when you are ready.",
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
