import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free preview",
  description:
    "Your free Zi Wei (Purple Star) preview — upgrade to unlock the full destiny report.",
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
