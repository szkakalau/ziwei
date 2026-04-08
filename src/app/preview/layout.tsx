import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart preview",
  description:
    "Preview of your Purple Star (Zi Wei) chart generated from your birth data.",
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
