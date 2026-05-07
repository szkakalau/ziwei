import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart preview",
  description:
    "Your free DestinyBlueprint Zi Wei chart preview — continue to a personalized email reading when you are ready.",
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
