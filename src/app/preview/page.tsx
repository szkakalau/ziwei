"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PreviewPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/snapshot");
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-20 font-body text-ink-muted">
      Redirecting to the active email reading flow...
    </div>
  );
}
