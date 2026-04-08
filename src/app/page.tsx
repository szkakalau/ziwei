import type { Metadata } from "next";
import BirthFormModal from "@/components/BirthFormModal";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Purple Star astrology reading—free preview",
  description:
    "See how AI translates classical Purple Star (Zi Wei) astrology into clear, practical insights about you.",
};

export default function HomePage() {
  return (
    <main>
      {/* ① HERO */}
      <section className="relative isolate mx-auto max-w-6xl overflow-hidden px-6 pb-16 pt-16 text-left md:pb-20 md:pt-20">
        <div
          className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-40"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-36 top-10 h-80 w-80 rounded-full bg-jade-dim blur-[110px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-28 top-24 h-72 w-72 rounded-full bg-cinnabar-glow blur-[105px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-gold/35 to-transparent"
          aria-hidden
        />

        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink md:text-6xl lg:text-7xl">
              The astrology system used by Chinese emperors — now powered by AI
            </h1>
            <p className="mt-7 max-w-xl font-body text-xl leading-relaxed text-ink-muted">
              Discover your Life Palace, destiny cycles, relationship patterns and hidden strengths with Zi Wei Dou Shu.
            </p>

            <div className="mt-10 flex flex-col items-start gap-3">
              <BirthFormModal triggerText="Generate My Chart →" />
              <p className="font-body text-sm text-ink-dim">
                Free preview • No signup required
              </p>
              <p className="font-body text-sm text-ink-dim">
                Used by 1,000+ early astrology readers
              </p>
            </div>
          </div>

          {/* Decorative “seal” panel */}
          <div className="relative hidden md:block">
            <div className="absolute -inset-6 rounded-sm border border-gold/15 bg-panel shadow-panel backdrop-blur-md" />
            <div className="relative rounded-sm border border-white/10 bg-void/55 p-7 shadow-panel">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-gold/80">
                    chart_engine
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-ink">
                    Apparent solar time
                  </p>
                </div>
                <div
                  className="h-10 w-10 rotate-45 border border-gold/40 bg-cinnabar/15 shadow-[0_0_22px_rgba(201,84,60,0.28)]"
                  aria-hidden
                />
              </div>
              <p className="mt-4 font-body text-sm leading-relaxed text-ink-muted">
                Built from birth place and clock time, then mapped into the 12
                Life Palaces with 100+ stars.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 font-mono text-[11px] uppercase tracking-widest text-ink-dim">
                <span className="rounded-sm border border-white/10 bg-void/60 px-3 py-2 text-center">
                  palaces
                </span>
                <span className="rounded-sm border border-white/10 bg-void/60 px-3 py-2 text-center">
                  cycles
                </span>
                <span className="rounded-sm border border-white/10 bg-void/60 px-3 py-2 text-center">
                  stars
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ② SOCIAL PROOF BAR */}
      <section className="border-y border-white/10 bg-mist/40 py-6 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center font-body text-sm text-ink-muted">
            <span className="font-mono text-sm tracking-wider text-gold">
              ★★★★★
            </span>{" "}
            Early beta readers from Reddit &amp; astrology communities
          </p>
        </div>
      </section>

      {/* ③ SEE A REAL READING */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-px w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/60 to-transparent"
          aria-hidden
        />
        <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          See what your reading actually looks like
        </h2>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Your Destiny Chart",
              src: "/images/destiny-chart-preview.jpg",
              caption: (
                <>
                  Your birth chart mapped using the Zi Wei Dou Shu system.
                  <br />
                  12 Life Palaces • 100+ stars • Lunar calendar calculation
                </>
              ),
            },
            {
              title: "Deep Personality Analysis",
              src: "/images/report-preview.jpg",
              caption: (
                <>
                  A personalized written report generated from your chart.
                  <br />
                  Easy to read. Deeply detailed.
                </>
              ),
            },
            {
              title: "Love & Career Insights",
              src: "/images/love-career.jpg",
              caption: "Insights into love, career and financial potential.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-sm border border-white/10 bg-panel p-5 shadow-panel backdrop-blur-sm"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-18"
                aria-hidden
              />

              <p className="relative font-display text-xl font-semibold text-ink">
                {card.title}
              </p>
              <div className="relative mt-4 overflow-hidden rounded-sm border border-gold/15 bg-void/70">
                <div
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    background:
                      "radial-gradient(120% 90% at 20% 20%, rgba(61,155,132,0.18), transparent 55%), radial-gradient(90% 70% at 90% 30%, rgba(201,84,60,0.16), transparent 55%)",
                  }}
                  aria-hidden
                />
                <Image
                  src={card.src}
                  alt={card.title}
                  width={1200}
                  height={900}
                  className="relative block aspect-[4/3] w-full object-cover opacity-95"
                />
              </div>
              <p className="relative mt-4 font-body text-sm leading-relaxed text-ink-muted">
                {card.caption}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center font-body text-lg text-ink-muted">
          This is a full destiny report — not a daily horoscope.
        </p>
      </section>

      {/* ④ WHAT IS ZI WEI ASTROLOGY */}
      <section className="relative border-y border-white/10 bg-mist/35 py-24 backdrop-blur-sm">
        <div
          className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-18"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">
            What is Zi Wei Dou Shu?
          </h2>
          <div className="mt-8 max-w-3xl font-body text-lg leading-relaxed text-ink-muted">
            <p>
              Zi Wei Dou Shu (Purple Star Astrology) is a 1000-year-old Chinese
              system of destiny analysis.
            </p>
            <p className="mt-5">
              Instead of sun signs, it maps your entire life structure using:
              <br />
              • Birth time
              <br />
              • Birth location
              <br />
              • Lunar calendar conversion
              <br />
              • 100+ stars across 12 Life Palaces
            </p>
            <p className="mt-5">
              It has been used for centuries to analyze:
              <br />
              career paths, wealth patterns, relationships and life cycles.
            </p>
          </div>
        </div>
      </section>

      {/* ⑤ WHY IT FEELS DIFFERENT */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Why people find it more accurate than Western astrology
        </h2>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Not based on sun signs",
              body: "Your chart is calculated from full birth data, not just your birthday.",
              accent: "bg-cinnabar/18",
            },
            {
              title: "Life Palace system",
              body: "Your life is divided into 12 domains like Career, Wealth, Relationships and Health.",
              accent: "bg-jade/16",
            },
            {
              title: "Life cycle timeline",
              body: "See how your luck and opportunities change across different life periods.",
              accent: "bg-gold/12",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-sm border border-white/10 bg-panel p-8 shadow-panel backdrop-blur-sm"
            >
              <div className={`h-1.5 w-10 ${c.accent}`} aria-hidden />
              <h3 className="mt-6 font-display text-2xl font-semibold text-ink">
                {c.title}
              </h3>
              <p className="mt-3 font-body leading-relaxed text-ink-muted">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ⑥ WHAT YOU GET IN FULL REPORT */}
      <section className="relative border-y border-white/10 bg-mist/35 py-24 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            What’s inside your full reading
          </h2>

          <div className="mx-auto mt-14 max-w-4xl rounded-sm border border-gold/25 bg-panel p-10 shadow-panel backdrop-blur-sm">
            <div className="grid gap-10 md:grid-cols-2">
              <ul className="space-y-3 font-body text-lg text-ink-muted">
                {[
                  "✓ 12 Life Palaces breakdown",
                  "✓ Personality strengths & blind spots",
                  "✓ Career & wealth potential",
                  "✓ Love & relationship patterns",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-gold" aria-hidden>
                      ✓
                    </span>
                    <span>{t.replace(/^✓\s*/, "")}</span>
                  </li>
                ))}
              </ul>
              <ul className="space-y-3 font-body text-lg text-ink-muted">
                {[
                  "✓ 10-year life cycle timeline",
                  "✓ Major opportunities & risks",
                  "✓ Hidden talents analysis",
                  "✓ Downloadable PDF report",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-gold" aria-hidden>
                      ✓
                    </span>
                    <span>{t.replace(/^✓\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-10 font-body text-sm text-ink-dim">
              Instantly generated after your chart is created.
            </p>
          </div>
        </div>
      </section>

      {/* ⑦ SAMPLE INSIGHT */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Example insight from a real chart
          </h2>
          <div className="mx-auto mt-10 max-w-3xl rounded-sm border border-white/10 bg-mist/45 p-10 shadow-panel backdrop-blur-sm">
            <p className="font-body text-lg leading-relaxed text-ink-muted">
              &quot;You tend to experience major career turning points in your early 30s.
              Your chart shows strong strategic ability but delayed recognition.
              You thrive in roles combining analysis and independence.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* ⑧ TESTIMONIALS */}
      <section className="relative border-y border-white/10 bg-mist/35 py-24 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { quote: "Way deeper than any astrology app I’ve tried.", by: "Early reader" },
              {
                quote: "The relationship section felt weirdly accurate.",
                by: "Astrology enthusiast",
              },
              {
                quote: "I didn’t expect Chinese astrology to be this detailed.",
                by: "Beta tester",
              },
            ].map((t) => (
              <div
                key={t.quote}
                className="rounded-sm border border-white/10 bg-panel p-8 shadow-panel backdrop-blur-sm"
              >
                <p className="font-mono text-sm tracking-wider text-gold">
                  ★★★★★
                </p>
                <p className="mt-4 font-body leading-relaxed text-ink-muted">
                  {t.quote}
                </p>
                <p className="mt-5 font-mono text-xs uppercase tracking-widest text-ink-dim">
                  {t.by}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑨ PRICING TEASER */}
      <section className="relative mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Start free. Unlock your full destiny report anytime.
        </h2>
        <p className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
          Free preview available
          <br />
          Full report — $19
        </p>
        <div className="mt-10 flex justify-center">
          <BirthFormModal triggerText="Generate My Chart →" />
        </div>
      </section>

      {/* ⑩ FAQ */}
      <section className="relative border-y border-white/10 bg-mist/35 py-24 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            FAQ
          </h2>
          <div className="mt-12 space-y-4">
            {[
              {
                q: "Is this AI or real astrology?",
                a: "Both. We calculate your chart using the traditional Zi Wei Dou Shu system, then AI translates the complex chart into readable insights.",
              },
              {
                q: "Is this real astrology?",
                a: "Yes. We use the traditional Zi Wei Dou Shu calculation system.",
              },
              {
                q: "Do I need exact birth time?",
                a: "The more accurate your birth time, the more precise your chart.",
              },
              {
                q: "Is this scientifically proven?",
                a: "Zi Wei Dou Shu is a traditional metaphysical system used for centuries.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-sm border border-white/10 bg-panel p-5 shadow-panel backdrop-blur-sm open:border-gold/25"
              >
                <summary className="cursor-pointer list-none font-display text-lg font-semibold text-ink after:float-right after:text-gold/70 after:content-['+'] open:after:content-['−']">
                  {item.q}
                </summary>
                <p className="mt-3 font-body leading-relaxed text-ink-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ⑪ FINAL CTA */}
      <section className="relative mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
          Your destiny chart is already written.
          <br />
          Let AI reveal it.
        </h2>
        <div className="mt-10 flex justify-center">
          <BirthFormModal triggerText="Generate My Chart →" />
        </div>
      </section>
    </main>
  );
}
