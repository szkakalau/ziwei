export interface Achievement {
  key: string;
  name: string;
  nameZh: string;
  minStreak: number;
  icon: string;
  color: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    key: "initiate",
    name: "Zi Wei Initiate",
    nameZh: "紫微星入门",
    minStreak: 1,
    icon: "✨",
    color: "text-white/40",
    description: "Your first daily horoscope. The stars have noticed you.",
  },
  {
    key: "explorer",
    name: "Chart Explorer",
    nameZh: "命盘探索者",
    minStreak: 7,
    icon: "🔮",
    color: "text-amber-300/70",
    description: "7 days of consistent stargazing. You're building a cosmic habit.",
  },
  {
    key: "practitioner",
    name: "Dou Shu Practitioner",
    nameZh: "斗数修行者",
    minStreak: 30,
    icon: "⭐",
    color: "text-amber-200/90",
    description: "A full month with Zi Wei. The ancients would be proud.",
  },
  {
    key: "master",
    name: "Dou Shu Master",
    nameZh: "斗数通灵者",
    minStreak: 100,
    icon: "👑",
    color: "text-amber-100",
    description: "100 days of dedication. You don't just read the stars — you speak their language.",
  },
];

export function getAchievement(streak: number): Achievement {
  let current = ACHIEVEMENTS[0];
  for (const a of ACHIEVEMENTS) {
    if (streak >= a.minStreak) current = a;
  }
  return current;
}

export function getNextAchievement(streak: number): Achievement | null {
  for (const a of ACHIEVEMENTS) {
    if (streak < a.minStreak) return a;
  }
  return null;
}
