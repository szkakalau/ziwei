export type ReportBirthInput = {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  location: string;
  allowFallback?: boolean;
};

export type ReportMeta = {
  placeLabel?: string;
  apparentSolarDate?: string;
  apparentSolarTime?: string;
  isApproximate?: boolean;
};

type PalaceLike = {
  name?: string;
  majorStars?: Array<{ name?: string }>;
  minorStars?: Array<{ name?: string }>;
};

type ChartLike = {
  palaces?: PalaceLike[];
};

export type ReportSection = {
  id: string;
  title: string;
  body: string[];
};

export type BuiltReport = {
  title: string;
  subtitle: string;
  summaryLines: string[];
  sections: ReportSection[];
  palaceSections: ReportSection[];
  timeline: ReportSection;
  upsell: ReportSection;
};

function pickStars(p: PalaceLike | undefined, limit: number) {
  const major = (p?.majorStars ?? []).map((s) => s?.name).filter(Boolean) as string[];
  const minor = (p?.minorStars ?? []).map((s) => s?.name).filter(Boolean) as string[];
  const combined = [...major, ...minor];
  const uniq = Array.from(new Set(combined));
  return uniq.slice(0, limit);
}

function sentenceJoin(lines: string[]) {
  return lines.filter(Boolean).join(" ");
}

export function buildFullReport(params: {
  chart: unknown;
  meta?: ReportMeta;
}): BuiltReport {
  const c = params.chart as ChartLike;
  const palaces = Array.isArray(c?.palaces) ? c.palaces : [];
  const meta = params.meta;

  const headerDate = meta?.apparentSolarDate ?? "—";
  const headerTime = meta?.apparentSolarTime ?? "—";
  const headerPlace = meta?.placeLabel ?? "—";

  const approxLine = meta?.isApproximate
    ? "Note: This report is based on an approximate chart (time-zone and true-solar corrections were unavailable)."
    : "";

  const summaryLines = [
    `Generated from your birth data: ${headerDate} • ${headerTime} • ${headerPlace}`,
    approxLine,
  ].filter(Boolean);

  const sections: ReportSection[] = [
    {
      id: "personality",
      title: "Personality & Core Drives",
      body: [
        "Zi Wei Dou Shu reads your chart as a structured map of motivations, strengths, and growth edges.",
        "In most charts, real progress comes from leaning into one or two core advantages (and designing your life around them).",
        "Use this report as a mirror for decisions—career moves, relationship patterns, and long-range timing.",
      ],
    },
    {
      id: "career-wealth",
      title: "Career & Wealth",
      body: [
        "Your career path is best understood as a set of recurring themes: autonomy vs. stability, mastery vs. visibility, and timing cycles.",
        "When your chart favors strategy and analysis, you typically thrive in roles with ownership, clear incentives, and deep problem-solving.",
        "Wealth tends to grow when you build repeatable systems—not when you chase short-term spikes.",
      ],
    },
    {
      id: "love",
      title: "Love & Relationships",
      body: [
        "Zi Wei relationship patterns often show up as your attachment rhythm: how quickly you trust, what you need to feel safe, and what triggers withdrawal.",
        "Healthy matches amplify your strengths while reducing your stress load—especially around communication style and life priorities.",
        "If you notice repetition, treat it as data. Your chart describes the pattern; your choices change the outcome.",
      ],
    },
    {
      id: "strengths-risks",
      title: "Strengths & Risks",
      body: [
        "Every chart has both leverage and friction. The goal is to double down on leverage and build guardrails around predictable risks.",
        "Your strengths are the themes you can express consistently, even under pressure.",
        "Your risks are usually not “bad luck”—they’re predictable trade-offs when you overuse a strength or ignore a constraint.",
      ],
    },
  ];

  const palaceSections: ReportSection[] = palaces.slice(0, 12).map((p, i) => {
    const stars = pickStars(p, 6);
    const palaceName = p?.name ?? `Palace ${i + 1}`;
    const starLine = stars.length ? `Key stars: ${stars.join(", ")}.` : "Key stars: —.";
    return {
      id: `palace-${i + 1}`,
      title: `${palaceName}`,
      body: [
        starLine,
        sentenceJoin([
          "This palace describes a major life domain.",
          "Read it for recurring patterns—how opportunities arrive, what you naturally optimize for, and what drains your energy.",
        ]),
      ],
    };
  });

  const timeline: ReportSection = {
    id: "life-cycles",
    title: "Life Cycle Timeline (10-year phases)",
    body: [
      "Zi Wei is powerful because it doesn’t just describe traits—it describes timing.",
      "Think in phases: some periods favor building foundations; others favor expansion, visibility, or reorientation.",
      "Use the timeline to plan: what to push, what to protect, and what to avoid forcing.",
    ],
  };

  const upsell: ReportSection = {
    id: "coming-soon",
    title: "Coming soon",
    body: [
      "Annual luck forecast",
      "Relationship compatibility report",
    ],
  };

  return {
    title: "Your Complete Zi Wei Destiny Report",
    subtitle: "Generated from your birth data.",
    summaryLines,
    sections,
    palaceSections,
    timeline,
    upsell,
  };
}

