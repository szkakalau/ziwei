import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  "Deep Personality Analysis: Uncover your core traits, hidden strengths and growth areas",
  "Love & Career Insights: Learn your relationship patterns and ideal career paths",
  "10-Year Cycle Forecast: See exactly when your biggest opportunities will arrive",
] as const;

export default function SeeWhatYouGet() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
      <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        See Exactly What You&apos;ll Get
      </h2>
      <p className="mt-3 text-center font-body text-base text-ink-muted md:text-lg">
        Your full destiny report is easy to read, deeply detailed, and 100% personalized to your birth chart
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2 md:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Zi Wei Birth Chart Preview</CardTitle>
            <CardDescription>
              Your personalized Zi Wei Dou Shu birth chart
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Report Preview</CardTitle>
            <CardDescription>
              Your full destiny report is deeply detailed and easy to read
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-sm border border-white/10 bg-void/60">
              <Image
                src="/images/report-preview.jpg"
                alt="Full destiny report preview screenshot"
                width={1600}
                height={1200}
                className="block aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
            <ul className="mt-6 space-y-3 font-body text-sm text-ink-muted">
              {highlights.map((h) => (
                <li key={h} className="flex gap-3">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

