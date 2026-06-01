"use client";

import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { getAchievement, getNextAchievement } from "@/lib/achievements";

interface StreakBadgeProps {
  userId?: string;
}

export function StreakBadge({ userId }: StreakBadgeProps) {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAchievement, setShowAchievement] = useState(false);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetch(`/api/streak`)
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

  const achievement = getAchievement(streak);
  const next = getNextAchievement(streak);

  return (
    <div className="relative">
      <button
        onClick={() => setShowAchievement(!showAchievement)}
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${achievement.color}`}
      >
        <span>{achievement.icon}</span>
        <span>Day {streak || 1}</span>
      </button>

      {showAchievement && (
        <div className="absolute right-0 top-8 z-10 w-64 rounded-xl bg-[#12141c] border border-white/[0.1] p-4 shadow-2xl">
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Achievement</p>
          <p className={`text-sm font-semibold ${achievement.color}`}>
            {achievement.icon} {achievement.name}{" "}
            <span className="text-white/25 text-xs">({achievement.nameZh})</span>
          </p>
          <p className="text-white/40 text-xs mt-1">{achievement.description}</p>

          {next && (
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <p className="text-[10px] uppercase tracking-wider text-white/20 mb-1">Next</p>
              <p className="text-white/30 text-xs">
                {next.icon} {next.name} — {next.minStreak - streak} more {next.minStreak - streak === 1 ? "day" : "days"}
              </p>
            </div>
          )}

          {!next && (
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <p className="text-amber-300/50 text-xs">🏆 All achievements unlocked!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
