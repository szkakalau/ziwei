import { CalendarRange, Crown, Sun, Compass, Binary } from "lucide-react";

const cards = [
  {
    icon: Sun,
    title: "Your Sun Sign is Just 1 Star. Your Zi Wei Chart Has 100+.",
    body: "Western astrology uses only your birth date — one data point. Zi Wei Dou Shu maps your exact birth time, geographic location, and over 100 celestial bodies to create a chart so detailed it fills 12 life palaces.",
    accent: "cinnabar" as const,
  },
  {
    icon: CalendarRange,
    title: "Daily AI Horoscopes Based on Your Chart",
    body: "Every morning, an AI reads your chart against the day's transits and writes a personalized horoscope. Unlike mass horoscopes that address 1/12th of the population, yours is computed from your unique star placements.",
    accent: "gold" as const,
  },
  {
    icon: Crown,
    title: "Imperial Precision, Not Mass-Market Generic",
    body: "Zi Wei Dou Shu was the exclusive tool of Chinese emperors and generals for over a millennium. It was never meant for newspaper horoscopes — it was designed for real decisions. We apply that same rigor to every reading.",
    accent: "jade" as const,
  },
  {
    icon: Compass,
    title: "Apparent Solar Time Correction",
    body: "We geocode your birthplace, look up the IANA timezone, and apply the equation of time to calculate your true apparent solar time — the actual astronomical position of the sun at your birth. This precision is what makes your chart genuinely yours.",
    accent: "gold" as const,
  },
] as const;

const accentColors = {
  cinnabar: {
    border: "border-cinnabar/20",
    bg: "bg-cinnabar/8",
    icon: "text-cinnabar",
    glow: "shadow-[0_0_40px_-8px_oklch(0.58_0.19_32/0.2)]",
  },
  gold: {
    border: "border-gold/20",
    bg: "bg-gold/[0.06]",
    icon: "text-gold",
    glow: "shadow-[0_0_40px_-8px_oklch(0.74_0.12_78/0.15)]",
  },
  jade: {
    border: "border-jade/20",
    bg: "bg-jade/[0.06]",
    icon: "text-jade",
    glow: "shadow-[0_0_40px_-8px_oklch(0.62_0.1_168/0.15)]",
  },
};

export default function WhyZiWeiBetter() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 md:py-32">
      {/* Diagonal accent lines */}
      <div
        className="pointer-events-none absolute left-0 top-[15%] h-px w-[140%] -rotate-[3deg] bg-gradient-to-r from-transparent via-gold/20 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-[60%] h-px w-[140%] -rotate-[3deg] bg-gradient-to-r from-transparent via-jade/10 to-transparent"
        aria-hidden
      />

      {/* Background circle motif */}
      <div
        className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 opacity-[0.04]"
        aria-hidden
      >
        <svg viewBox="0 0 400 400" className="h-[600px] w-[600px]" fill="none">
          <circle cx="200" cy="200" r="195" stroke="currentColor" strokeWidth="1" className="text-gold" />
          <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            return (
              <line
                key={i}
                x1="200" y1="200"
                x2={200 + 190 * Math.cos(angle)}
                y2={200 + 190 * Math.sin(angle)}
                stroke="currentColor"
                strokeWidth="0.4"
                className="text-gold"
              />
            );
          })}
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="max-w-2xl md:pl-4">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-gold/60 to-transparent" aria-hidden />
            <p className="landing-kicker">Why Zi Wei Dou Shu</p>
          </div>
          <h2 className="landing-headline mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Your sun sign is a{" "}
            <span className="relative">
              postcard
              <span
                className="absolute -inset-x-2 bottom-0 h-2 bg-cinnabar/25 blur-[2px]"
                aria-hidden
              />
            </span>
            .<br />
            This is the{" "}
            <span className="bg-gradient-to-r from-gold via-gold/90 to-cinnabar bg-clip-text text-transparent">
              full map
            </span>
            .
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-ink-muted md:text-lg">
            Western sun-sign astrology is designed for mass appeal — one reading for 1/12th of humanity.
            Zi Wei Dou Shu generates a unique chart for every person on Earth, down to the minute and
            location of their birth.
          </p>
        </div>

        {/* Cards grid — symmetric 2x2 */}
        <div className="relative mt-12 grid gap-4 sm:mt-16 sm:gap-5 sm:grid-cols-2">
          {cards.map((c, idx) => {
            const colors = accentColors[c.accent];
            return (
              <article
                key={c.title}
                className={`group relative rounded-sm border ${colors.border} ${colors.bg} ${colors.glow} backdrop-blur-sm transition-all duration-300 hover:-translate-y-1`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Accent corner */}
                <div
                  className="absolute -left-px -top-px h-8 w-8 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden
                >
                  <div className={`absolute -left-2 -top-2 h-6 w-6 rotate-45 ${c.accent === "cinnabar" ? "bg-cinnabar/20" : c.accent === "gold" ? "bg-gold/20" : "bg-jade/20"}`} />
                </div>

                <div className="p-5 sm:p-7">
                  {/* Icon + number */}
                  <div className="flex items-start justify-between">
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-sm border ${colors.border} ${colors.bg}`}>
                      <c.icon className={`h-5 w-5 ${colors.icon}`} aria-hidden />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-dim">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Title with line breaks */}
                  <h3 className="mt-5 whitespace-pre-line font-display text-xl font-semibold leading-tight tracking-tight text-ink">
                    {c.title}
                  </h3>

                  <p className="mt-3 font-body text-sm leading-relaxed text-ink-muted">
                    {c.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom insight */}
        <div className="mt-10 flex items-start gap-3 rounded-sm border border-gold/15 bg-gold/[0.03] p-4 backdrop-blur-sm mx-auto max-w-2xl sm:mt-14 sm:gap-4 sm:p-5">
          <Binary className="mt-0.5 h-5 w-5 shrink-0 text-gold/60" aria-hidden />
          <p className="font-body text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">The math matters.</span>{" "}
            A Zi Wei chart maps 12 palaces × 100+ stars × your exact birth time and geographic location.
            The result is a chart unique to you — not one of 12 archetypes like a sun sign.
          </p>
        </div>
      </div>
    </section>
  );
}
