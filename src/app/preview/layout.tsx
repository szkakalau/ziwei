import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart preview",
  description:
    "DestinyBlueprint chart preview — purchase the full report for the complete reading.",
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
