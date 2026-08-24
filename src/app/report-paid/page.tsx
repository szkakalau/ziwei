import type { Metadata } from "next";
import LegacyReportNotice from "@/components/LegacyReportNotice";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReportPaidPage() {
  return (
    <LegacyReportNotice
      title="The old paid report page has been retired"
      body="Paid orders are now delivered as human-written Zi Wei email readings. This older on-site report view is no longer part of the active customer flow. If you need help with an earlier purchase, please contact support."
    />
  );
}
