/**
 * Deterministic “Personality Snapshot” copy derived from chart palaces / stars.
 * Feels personalized without calling an LLM on the marketing page.
 */

type PalaceLike = {
  name?: string;
  majorStars?: Array<{ name?: string }>;
  minorStars?: Array<{ name?: string }>;
  adjectiveStars?: Array<{ name?: string }>;
};

type ChartLike = {
  palaces?: PalaceLike[];
};

export type PersonalitySnapshot = {
  personality: string;
  hiddenStrength: string;
  careerHint: string;
  soulPalaceLabel: string;
  highlightedStars: string[];
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function starBlob(p: PalaceLike | undefined): string {
  if (!p) return "";
  const major = (p.majorStars ?? []).map((x) => x?.name ?? "").filter(Boolean);
  const minor = (p.minorStars ?? []).map((x) => x?.name ?? "").filter(Boolean);
  return [...major, ...minor].join(" ").toLowerCase();
}

function pickStars(p: PalaceLike | undefined, limit: number): string[] {
  if (!p) return [];
  const major = (p.majorStars ?? []).map((s) => s?.name).filter(Boolean) as string[];
  const minor = (p.minorStars ?? []).map((s) => s?.name).filter(Boolean) as string[];
  const adj = (p.adjectiveStars ?? []).map((s) => s?.name).filter(Boolean) as string[];
  const uniq = Array.from(new Set([...major, ...minor, ...adj]));
  return uniq.slice(0, limit);
}

function titleCaseWord(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function palaceNamed(palaces: PalaceLike[], name: string): PalaceLike | undefined {
  const n = name.toLowerCase();
  return palaces.find((p) => (p.name ?? "").toLowerCase() === n);
}

type Bundle = {
  test: (blob: string) => boolean;
  personality: string;
  hiddenStrength: string;
  careerHint: string;
};

/** Higher = checked first (more specific matchers). */
const BUNDLES: Bundle[] = [
  {
    test: (b) => /\bemperor\b/.test(b),
    personality:
      "You carry a natural sense of dignity and long-range purpose. You prefer clarity over noise, and you’re willing to play the long game even when recognition comes slowly. People often read you as composed—but underneath, you’re quietly competitive with your own standards.",
    hiddenStrength:
      "You have unusual staying power once you commit. When a goal matters, you don’t flinch at repetition or delayed gratification; you build structure until results become inevitable.",
    careerHint:
      "You perform best where leadership, planning, or high-stakes judgment is required. You dislike chaos without ownership—you want a lane where your decisions actually move outcomes.",
  },
  {
    test: (b) => /\bminister\b|\badvisor\b/.test(b),
    personality:
      "You are naturally analytical and quick to spot patterns. You tend to observe before acting, and people often see you as calm and thoughtful. You like options—but too many open loops can quietly drain you.",
    hiddenStrength:
      "Your edge is adaptive thinking: you can reframe a problem fast and find a workable path when others freeze. That agility is a real asset in competitive environments.",
    careerHint:
      "You thrive in roles that reward strategy, research, and structured problem-solving. Highly repetitive or micromanaged work tends to erode your motivation over time.",
  },
  {
    test: (b) => /\bsun\b/.test(b),
    personality:
      "You’re wired for visibility and generosity—when you trust the room, you bring warmth and momentum. You care about fairness and can become sharp when you feel dismissed or underestimated.",
    hiddenStrength:
      "You can rally people: clarity + conviction is your hidden engine. In the right environment, you don’t just execute—you elevate the standard around you.",
    careerHint:
      "You perform best where communication, leadership, and public-facing responsibility are part of the job. Pure back-office isolation often underuses your natural strengths.",
  },
  {
    test: (b) => /\bmoon\b/.test(b),
    personality:
      "You read emotional undercurrents faster than most. You may seem soft-spoken on the surface, but your intuition is precise—you notice what others overlook. You open up slowly, but deeply.",
    hiddenStrength:
      "Your sensitivity is strategic: it helps you anticipate risk early and protect what matters. When you trust your read on people, your decisions age well.",
    careerHint:
      "You excel in careers that blend insight with craft—roles where nuance matters (people, product, narrative, analysis). Harshly political cultures can cost you energy unless you set boundaries.",
  },
  {
    test: (b) => /\bgeneral\b/.test(b),
    personality:
      "You’re built for execution and endurance. You respect competence and dislike empty talk; you’d rather ship results than debate vibes. You can come across as serious—but it’s usually focus, not coldness.",
    hiddenStrength:
      "When you aim at a target, you outwork the room. Your discipline compounds: small daily standards become big advantages over time.",
    careerHint:
      "You perform best in performance-driven environments: finance, operations, technical leadership, or any lane where metrics and mastery matter. You dislike make-work and vague incentives.",
  },
  {
    test: (b) => /\bwolf\b/.test(b),
    personality:
      "You’re curious, magnetic, and hungry for variety. You learn fast and get bored fast—your challenge isn’t talent, it’s focus. People are drawn to your energy, but you guard your inner circle carefully.",
    hiddenStrength:
      "You can pivot without losing confidence. That versatility helps you survive uncertainty and spot opportunities earlier than more rigid personalities.",
    careerHint:
      "You do well in dynamic careers—growth, creative strategy, business development, or anything where initiative is rewarded. Rigid routines without meaning drain you quickly.",
  },
  {
    test: (b) => /\bjudge\b/.test(b),
    personality:
      "You think in arguments, evidence, and nuance. You’re not “negative”—you’re thorough. You can intimidate people who prefer soft ambiguity, but your intent is usually truth, not drama.",
    hiddenStrength:
      "Your ability to question assumptions prevents expensive mistakes. In complex decisions, you’re the person who spots the hidden clause.",
    careerHint:
      "You excel in analysis, research, negotiation, and specialist roles where depth beats small talk. You dislike environments that punish honesty or reward politics over outcomes.",
  },
  {
    test: (b) => /\bempress\b|\bmarshal\b/.test(b),
    personality:
      "You combine poise with practicality. You’re protective of your reputation and selective about where you invest attention—when you choose a lane, you tend to build it properly rather than chasing novelty.",
    hiddenStrength:
      "You stabilize situations: people underestimate how much calm execution matters until a crisis hits—and that’s when your steadiness pays off.",
    careerHint:
      "You perform best in structured environments where responsibility is real: management, operations, finance-adjacent roles, or building durable systems.",
  },
  {
    test: (b) => /\brebel\b|\bsage\b/.test(b),
    personality:
      "You’re wired for bold moves and sharp timing. You dislike slow bureaucracy, but you’re not reckless—you take calculated risks when you sense an opening. You learn fastest by doing.",
    hiddenStrength:
      "You recover quickly from setbacks because you iterate. Your competitive edge is momentum: once you’re aligned, you move faster than people still debating.",
    careerHint:
      "You thrive in competitive, dynamic fields—startups, sales, trading-adjacent roles, creative direction, or anything where initiative is rewarded.",
  },
];

const FALLBACK_ROTATIONS: Omit<Bundle, "test">[] = [
  {
    personality:
      "You are naturally analytical and independent.\n\nYou tend to observe before acting, and people often see you as calm and thoughtful. However, you keep your deeper emotions private and only open up to people you deeply trust.",
    hiddenStrength:
      "You have strong long-term planning ability.\n\nWhen you commit to a goal, you rarely quit. Your biggest advantage is persistence.",
    careerHint:
      "You perform best in careers where strategy, analysis or leadership is involved.\n\nYou dislike repetitive or highly controlled work.",
  },
  {
    personality:
      "You present a steady exterior, but your inner world runs deep. You prefer a few strong bonds over a wide social surface, and you’re selective about where you invest energy.",
    hiddenStrength:
      "Your resilience is quiet but real: you bounce back by refining your approach, not by performing emotion for an audience.",
    careerHint:
      "You’re built for roles that reward judgment—strategy, specialist expertise, or leadership with real accountability. Micromanagement and busywork are your kryptonite.",
  },
  {
    personality:
      "You’re motivated by meaning and mastery. You can be patient when the roadmap makes sense—and surprisingly impatient when it doesn’t. You notice details others skim past.",
    hiddenStrength:
      "You improve systems. Even without trying, you optimize: habits, workflows, relationships—whatever you touch tends to get more efficient over time.",
    careerHint:
      "You perform best where outcomes are measurable and your skill stack can compound—analytics, engineering-adjacent roles, operations, or independent practice.",
  },
  {
    personality:
      "You balance caution with ambition. You’re not reckless, but you’re not timid either—you take calculated risks when the upside is worth the trade. You value loyalty and consistency.",
    hiddenStrength:
      "Your long game is strong: you can delay gratification and build advantages quietly until the right window opens.",
    careerHint:
      "You thrive in careers that combine structure with autonomy—ownership, consulting, leadership tracks, or building something that lasts.",
  },
];

export function buildPersonalitySnapshot(chart: unknown): PersonalitySnapshot {
  const c = chart as ChartLike;
  const palaces = Array.isArray(c?.palaces) ? c.palaces : [];

  const soul = palaceNamed(palaces, "soul") ?? palaces[0];
  const career = palaceNamed(palaces, "career");

  const soulStars = pickStars(soul, 6);
  const blob = starBlob(soul) + " " + starBlob(career);

  let chosen: Omit<Bundle, "test"> | undefined;
  for (const b of BUNDLES) {
    if (b.test(blob)) {
      chosen = b;
      break;
    }
  }

  if (!chosen) {
    const h = hashString(blob || JSON.stringify(soulStars));
    chosen = FALLBACK_ROTATIONS[h % FALLBACK_ROTATIONS.length];
  }

  const rawName = soul?.name?.trim();
  const soulLabel = rawName ? titleCaseWord(rawName) : "Soul";

  return {
    personality: chosen.personality,
    hiddenStrength: chosen.hiddenStrength,
    careerHint: chosen.careerHint,
    soulPalaceLabel: soulLabel,
    highlightedStars: soulStars.slice(0, 5).map(titleCaseWord),
  };
}
