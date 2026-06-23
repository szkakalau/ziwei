"use client";

import { useState } from "react";
import { getAchievement, getNextAchievement } from "@/lib/achievements";

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const [showAchievement, setShowAchievement] = useState(false);

  const achievement = getAchievement(streak);
  const next = getNextAchievement(streak);

  return (
    <div className="relative" data-testid="streak-badge">
      <button
        onClick={() => setShowAchievement(!showAchievement)}
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${achievement.color}`}
      >
        <span>{achievement.icon}</span>
        <span>{streak > 0 ? `Day ${streak}` : "Start your streak"}</span>
      </button>

      {showAchievement && (
        <div className="absolute right-0 top-8 z-10 w-64 rounded-xl bg-white border border-black/5 p-4 shadow-lg">
          <p className="text-[10px] uppercase tracking-wider text-ink-dim mb-1">Achievement</p>
          <p className={`text-sm font-semibold ${achievement.color}`}>
            {achievement.icon} {achievement.name}{" "}
            <span className="text-ink-dim/70 text-xs">({achievement.nameZh})</span>
          </p>
          <p className="text-ink-dim text-xs mt-1">{achievement.description}</p>

          {next && (
            <div className="mt-3 pt-3 border-t border-black/5">
              <p className="text-[10px] uppercase tracking-wider text-ink-dim/60 mb-1">Next</p>
              <p className="text-ink-dim text-xs">
                {next.icon} {next.name} — {next.minStreak - streak} more {next.minStreak - streak === 1 ? "day" : "days"}
              </p>
            </div>
          )}

          {!next && (
            <div className="mt-3 pt-3 border-t border-black/5">
              <p className="text-amber-300/50 text-xs">All achievements unlocked!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
