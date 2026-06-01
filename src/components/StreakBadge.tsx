"use client";

import { Flame } from "lucide-react";
import { useEffect, useState } from "react";

interface StreakBadgeProps {
  userId?: string;
}

export function StreakBadge({ userId }: StreakBadgeProps) {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetch(`/api/streak?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => { if (d.ok) setStreak(d.streak); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground animate-pulse">
        <Flame className="h-4 w-4" />
        <span>...</span>
      </div>
    );
  }

  if (streak === 0) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Flame className="h-4 w-4" />
        <span>Day 1</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-amber-400">
      <Flame className="h-4 w-4" />
      <span>Day {streak}</span>
    </div>
  );
}
