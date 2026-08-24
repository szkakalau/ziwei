import type { Metadata } from "next";
import SnapshotClient from "./snapshotClient";

export const metadata: Metadata = {
  title: "Your Free Zi Wei Snapshot",
  description:
    "Your free Zi Wei Dou Shu birth chart snapshot — see your 12 palaces and major stars.",
  robots: { index: false, follow: false },
};

export default function SnapshotPage() {
  return <SnapshotClient />;
}

