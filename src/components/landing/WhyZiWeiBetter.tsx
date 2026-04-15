import { Crosshair, CalendarRange, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  {
    icon: Crosshair,
    title: "Far More Accurate Than Sun Sign Astrology",
    body: "Western astrology only uses your birth date. Zi Wei Dou Shu calculates your full chart using your exact birth time, birth location, lunar calendar conversion and 100+ celestial stars, for hyper-personalized insights you can't get anywhere else.",
  },
  {
    icon: CalendarRange,
    title: "Map Your 10-Year Destiny Cycles",
    body: "Zi Wei doesn't stop at personality. It predicts exactly how your luck, opportunities and risks will shift across major 10-year life cycles, so you can make the right choices at the perfect time.",
  },
  {
    icon: Crown,
    title: "Trusted For Over 1,000 Years",
    body: "Developed in ancient Chinese imperial dynasties, Zi Wei Dou Shu was historically used to analyze emperors, generals and royal families. Today, we combine this time-tested system with modern AI to turn complex charts into clear, actionable insights.",
  },
] as const;

export default function WhyZiWeiBetter() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
      <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        Why Thousands Of Readers Choose Zi Wei Dou Shu Over Western Astrology
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title} className="h-full">
            <CardHeader className="pb-0">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-gold/25 bg-gold/10">
                  <c.icon className="h-5 w-5 text-gold" aria-hidden />
                </span>
                <div>
                  <CardTitle className="text-xl">{c.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardDescription className="text-sm">{c.body}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

