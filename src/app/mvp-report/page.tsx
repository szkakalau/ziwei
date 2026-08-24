import type { Metadata } from "next";
import LegacyReportNotice from "@/components/LegacyReportNotice";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function MvpReportPage() {
  return (
    <LegacyReportNotice
      title="The MVP report preview has been retired"
      body="This was an older on-site report prototype from the AI-report version of the product. The active flow now uses a free snapshot plus a human-written email reading."
    />
  );
}
