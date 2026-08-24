import type { Metadata } from "next";
import LegacyReportNotice from "@/components/LegacyReportNotice";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReportPage() {
  return (
    <LegacyReportNotice
      title="This legacy report page is no longer used"
      body="DestinyBlueprint now delivers paid readings by human-written email instead of generating on-site AI reports. Please continue from the email reading flow or contact support if you need help with an older order."
    />
  );
}
