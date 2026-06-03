import Image from "next/image";
import { FileText, Sparkles, ArrowRight, Mail } from "lucide-react";
import EmailReadingPreviewSample from "@/components/landing/EmailReadingPreviewSample";

const highlights = [
  "Human-written reading grounded in your full Zi Wei Dou Shu chart",
  "Choose your focus: love, career, wealth, or life timing",
  "Clear, actionable guidance delivered by email within 24-48 hours",
  "Every reading references your specific stars and palaces by name",
] as const;

export default function SeeWhatYouGet() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 md:py-32">
      {/* Background: subtle radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.74_0.12_78/0.06),transparent_60%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 backdrop-blur-sm">
            <Mail className="h-3.5 w-3.5 text-gold/70" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">What You Receive</span>
          </div>
          <h2 className="landing-headline mt-5 text-3xl md:text-4xl lg:text-5xl">
            Your chart.{" "}
            <span className="text-ink-muted">Your stars.</span>
            <br />
            <span className="bg-gradient-to-r from-gold to-cinnabar bg-clip-text text-transparent">
              Your story
            </span>
            , written by a human.
          </h2>
          <p className="mt-4 mx-auto max-w-xl font-body text-base leading-relaxed text-ink-muted">
            We don&apos;t send templated paragraphs. Your Zi Wei reader examines your specific
            chart and writes a personalized email based on what they find.
          </p>
        </div>

        {/* Preview cards — layered overlap */}
        <div className="relative mt-16 lg:mt-20">
          {/* Chart preview card */}
          <article className="relative z-10 mx-auto max-w-2xl rounded-sm border border-white/[0.08] bg-panel/80 shadow-panel backdrop-blur-md lg:mx-0 lg:w-[56%]">
            <div className="flex items-start gap-4 border-b border-white/[0.07] px-6 py-5">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-jade/25 bg-jade/[0.08]">
                <Sparkles className="h-5 w-5 text-jade" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">
                  Your Zi Wei Birth Chart
                </h3>
                <p className="mt-0.5 font-body text-sm text-ink-muted">
                  The full 12-palace chart that forms the foundation of your reading
                </p>
              </div>
            </div>
            <div className="p-5">
              <div className="overflow-hidden rounded-sm border border-white/[0.06] bg-void/60">
                <Image
                  src="/images/destiny-chart-preview.jpg"
                  alt="Your personalized Zi Wei Dou Shu birth chart showing 12 palaces and 100+ stars"
                  width={1600}
                  height={1200}
                  className="block aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </article>

          {/* Email reading preview card — offset and overlapping */}
          <article className="relative z-20 mx-auto mt-6 max-w-2xl rounded-sm border border-gold/25 bg-gradient-to-br from-gold/[0.06] via-panel/90 to-cinnabar/[0.04] shadow-glow backdrop-blur-md lg:absolute lg:right-0 lg:top-16 lg:mt-0 lg:w-[52%]">
            <div className="flex items-start gap-4 border-b border-gold/[0.15] px-6 py-5">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-gold/30 bg-gold/[0.08]">
                <FileText className="h-5 w-5 text-gold" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">
                  Your Email Reading
                </h3>
                <p className="mt-0.5 font-body text-sm text-ink-muted">
                  Personalized, human-written, and delivered in 24-48 hours
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-4">
              <EmailReadingPreviewSample />

              {/* Info note */}
              <div className="mt-5 space-y-3 border-t border-white/[0.07] pt-5">
                {highlights.map((h) => (
                  <div key={h} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-cinnabar" aria-hidden />
                    <span className="font-body text-sm leading-relaxed text-ink-muted">{h}</span>
                  </div>
                ))}
              </div>

              {/* Teaser arrow */}
              <div className="mt-5 flex items-center gap-2 text-gold/60">
                <ArrowRight className="h-4 w-4" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                  This is just a sample — your reading is unique
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
