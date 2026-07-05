"use client";

import { useState } from "react";
import { Sparkles, Orbit, Star, Crown } from "lucide-react";
import { getAchievement, getNextAchievement } from "@/lib/achievements";

const iconMap = {
  sparkles: Sparkles,
  orbit: Orbit,
  star: Star,
  crown: Crown,
} as const;

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const [showAchievement, setShowAchievement] = useState(false);

  const achievement = getAchievement(streak);
  const next = getNextAchievement(streak);
  const Icon = iconMap[achievement.icon];
  const NextIcon = next ? iconMap[next.icon] : null;

  return (
    <div className="relative" data-testid="streak-badge">
      <button
        onClick={() => setShowAchievement(!showAchievement)}
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${achievement.color}`}
      >
        <Icon className="h-4 w-4" aria-hidden />
        <span>{streak > 0 ? `Day ${streak}` : "Start your streak"}</span>
      </button>

      {showAchievement && (
        <div className="absolute right-0 top-8 z-10 w-64 rounded-xl bg-white shadow-md p-4">
          <p className="text-[11px] uppercase tracking-wider text-ink-dim mb-1">Achievement</p>
          <p className={`text-sm font-semibold flex items-center gap-1.5 ${achievement.color}`}>
            <Icon className="h-4 w-4" aria-hidden />
            {achievement.name}{" "}
            <span className="text-ink-dim text-xs font-normal">({achievement.nameZh})</span>
          </p>
          <p className="text-ink-dim text-xs mt-1">{achievement.description}</p>

          {next && NextIcon && (
            <div className="mt-3 pt-3 border-t border-gold/10">
              <p className="text-[11px] uppercase tracking-wider text-ink-dim mb-1">Next</p>
              <p className="text-ink-dim text-xs flex items-center gap-1.5">
                <NextIcon className="h-3.5 w-3.5" aria-hidden />
                {next.name} — {next.minStreak - streak} more {next.minStreak - streak === 1 ? "day" : "days"}
              </p>
            </div>
          )}

          {!next && (
            <div className="mt-3 pt-3 border-t border-gold/10">
              <p className="text-amber-300/50 text-xs">All achievements unlocked!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
