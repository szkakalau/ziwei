import Image from "next/image";
import { FileText, Sparkles } from "lucide-react";
import EmailReadingPreviewSample from "@/components/landing/EmailReadingPreviewSample";

const highlights = [
  "Human-written email reading tailored to your chart and main question",
  "Love, career, wealth, or timing guidance based on your chosen focus",
  "Clear next-step advice delivered within 24-48 hours",
] as const;

export default function SeeWhatYouGet() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 md:py-28">
      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-2xl lg:ml-auto lg:pr-8 lg:text-right">
          <p className="landing-kicker">Deliverables</p>
          <h2 className="landing-headline mt-2 text-3xl md:text-4xl">
            See Exactly What You&apos;ll Get
          </h2>
          <p className="mt-3 font-body text-base text-ink-muted md:text-lg">
            Your email reading is written by a human and grounded in your Zi Wei chart
          </p>
        </div>

        <div className="relative mt-14 min-h-[28rem] lg:mt-20">
          <article className="relative z-10 w-full max-w-2xl rounded-sm border border-white/10 bg-panel shadow-panel backdrop-blur-md lg:w-[58%]">
            <div className="flex items-start gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-jade/30 bg-jade-dim">
                <Sparkles className="h-5 w-5 text-jade" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">
                  Zi Wei Birth Chart Preview
                </h3>
                <p className="mt-1 font-body text-sm text-ink-muted">
                  Your personalized Zi Wei Dou Shu birth chart
                </p>
              </div>
            </div>
            <div className="overflow-hidden p-4 sm:p-5">
              <div className="overflow-hidden rounded-sm border border-white/10 bg-void/60">
                <Image
                  src="/images/destiny-chart-preview.jpg"
                  alt="Your personalized Zi Wei Dou Shu birth chart"
                  width={1600}
                  height={1200}
                  className="block aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </article>

          <article className="relative z-20 mt-8 w-full rounded-sm border border-gold/30 bg-panel shadow-glow backdrop-blur-md lg:absolute lg:right-0 lg:top-12 lg:mt-0 lg:w-[52%] lg:-translate-y-4">
            <div className="flex items-start gap-3 border-b border-gold/20 px-5 py-4 sm:px-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-gold/35 bg-gold-dim">
                <FileText className="h-5 w-5 text-gold" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">
                  Email Reading Preview
                </h3>
                <p className="mt-1 font-body text-sm text-ink-muted">
                  Chart context we use before writing your final email
                </p>
              </div>
            </div>
            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
              <EmailReadingPreviewSample />
              <ul className="mt-5 space-y-3 border-t border-white/10 pt-5 font-body text-sm text-ink-muted">
                {highlights.map((h) => (
                  <li key={h} className="flex gap-3">
                    <CheckBullet />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function CheckBullet() {
  return (
    <span
      className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-cinnabar"
      aria-hidden
    />
  );
}
