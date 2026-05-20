import { Sparkles, Star, ShieldCheck, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  formAnchorId: string;
};

const trust = [
  { icon: Sparkles, text: "Free Personality Snapshot · No Signup Required" },
  { icon: Star, text: "Personalized Human Reading Delivered By Email" },
  { icon: ShieldCheck, text: "30-Day No-Questions-Asked Money-Back Guarantee" },
] as const;

export default function Hero({ formAnchorId }: Props) {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden border-b border-white/10 landing-diagonal-flow"
    >
      <div
        className="pointer-events-none absolute -right-[20%] top-[8%] h-[min(72vw,520px)] w-[min(72vw,520px)] opacity-[0.22]"
        aria-hidden
      >
        <Compass
          className="h-full w-full text-gold/40"
          strokeWidth={0.35}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_15%_0%,oklch(0.74_0.12_78/0.12),transparent_55%),radial-gradient(ellipse_55%_45%_at_95%_40%,oklch(0.58_0.19_32/0.1),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-6 lg:py-24">
        <div className="relative z-10 lg:pr-8">
          <p className="landing-kicker animate-on-load">Zi Wei Dou Shu · Email Reading</p>
          <h1 className="landing-headline mt-4 text-[clamp(2.25rem,6.5vw,3.75rem)] animate-on-load-delay-1">
            Ancient Zi Wei Wisdom, Interpreted For You By Email
          </h1>
          <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-ink-muted animate-on-load-delay-2">
            Start with a free snapshot, then upgrade to a human-crafted reading focused on
            your love, career, wealth, or timing questions.
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 animate-on-load-delay-3 sm:flex-row sm:items-center">
            <Button asChild variant="cta" size="lg" className="w-full sm:w-auto">
              <a
                href={`#${formAnchorId}`}
                onClick={() => track("cta_hero_get_snapshot_click")}
              >
                Get My Free Snapshot In 30 Seconds
              </a>
            </Button>
            <p className="max-w-xs font-body text-sm text-ink-dim">
              Full birth time and place help us build the most accurate chart.
            </p>
          </div>
        </div>

        <div className="relative z-10 lg:-mr-4 lg:mt-6">
          <div
            className="absolute -left-3 top-8 hidden h-24 w-px origin-top rotate-[28deg] bg-gradient-to-b from-gold/60 to-transparent lg:block"
            aria-hidden
          />
          <ul className="flex flex-col gap-4 animate-reveal-stagger sm:max-w-md lg:ml-auto lg:max-w-sm">
            {trust.map((t, i) => (
              <li
                key={t.text}
                className={`flex items-start gap-3 rounded-sm border border-white/10 bg-panel px-4 py-3.5 shadow-panel backdrop-blur-md ${
                  i === 1 ? "lg:translate-x-6" : i === 2 ? "lg:translate-x-3" : ""
                }`}
              >
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-gold/30 bg-gold/10">
                  <t.icon className="h-4 w-4 text-gold" aria-hidden />
                </span>
                <p className="font-body text-sm leading-snug text-ink-muted">{t.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
