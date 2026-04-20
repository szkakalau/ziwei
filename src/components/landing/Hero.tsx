import { Sparkles, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  formAnchorId: string;
};

const trust = [
  {
    icon: Sparkles,
    text: "Free Personality Snapshot · No Signup Required",
  },
  {
    icon: Star,
    text: "Trusted By 1,000+ Early Astrology Readers",
  },
  {
    icon: ShieldCheck,
    text: "30-Day No-Questions-Asked Money-Back Guarantee",
  },
] as const;

export default function Hero({ formAnchorId }: Props) {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden border-b border-white/10"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-15%,rgba(201,167,94,0.10),transparent_55%),radial-gradient(ellipse_65%_55%_at_90%_30%,rgba(201,84,60,0.08),transparent_55%),radial-gradient(ellipse_60%_55%_at_10%_70%,rgba(61,155,132,0.08),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 420 420' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(201,167,94,0.55)' stroke-width='1'%3E%3Ccircle cx='210' cy='210' r='168'/%3E%3Ccircle cx='210' cy='210' r='120'/%3E%3Ccircle cx='210' cy='210' r='72'/%3E%3Cpath d='M210 42V378'/%3E%3Cpath d='M42 210H378'/%3E%3Cpath d='M93 93L327 327'/%3E%3Cpath d='M327 93L93 327'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "min(92vw,860px)",
        }}
        aria-hidden
      />

      <div className="mx-auto flex min-h-[calc(92svh-3.5rem)] max-w-6xl flex-col justify-center px-4 py-10 sm:min-h-[calc(100svh-4rem)] sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-3xl text-center">
          <h1 className="font-display text-[clamp(2.1rem,7.2vw,3.25rem)] font-semibold leading-[1.06] tracking-tight text-ink sm:text-5xl md:text-6xl animate-on-load">
            The Astrology System Used By Chinese Emperors — Now Powered By AI
          </h1>
          <h2 className="mt-5 font-body text-[1.03rem] leading-relaxed text-ink-muted sm:mt-6 sm:text-xl md:text-2xl animate-on-load-delay-1">
            Discover your Life Palace, 10-year destiny cycles, relationship
            patterns and hidden strengths with Zi Wei Dou Shu.
          </h2>

          <div className="mt-8 grid gap-3 text-left sm:mt-10 sm:grid-cols-3 sm:gap-4">
            {trust.map((t) => (
              <div
                key={t.text}
                className="flex items-start gap-3 rounded-sm border border-white/10 bg-panel/60 px-3.5 py-3 backdrop-blur-sm animate-on-load-delay-2 sm:px-4"
              >
                <t.icon className="mt-0.5 h-4 w-4 text-gold" aria-hidden />
                <p className="font-body text-sm leading-snug text-ink-muted">
                  {t.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col items-center gap-4 animate-on-load-delay-3 sm:mt-10">
            <Button asChild variant="cta" size="lg" className="w-full max-w-xl">
              <a
                href={`#${formAnchorId}`}
                onClick={() => track("cta_hero_get_snapshot_click")}
              >
                Get My Free Snapshot In 30 Seconds
              </a>
            </Button>
            <p className="max-w-2xl font-body text-sm text-ink-dim">
              Full birth time &amp; place give the most accurate Zi Wei chart —
              same as your paid report.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

