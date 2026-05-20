import { Crosshair, CalendarRange, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  {
    icon: Crosshair,
    title: "Far More Accurate Than Sun Sign Astrology",
    body: "Western astrology only uses your birth date. Zi Wei Dou Shu calculates your full chart using your exact birth time, birth location, lunar calendar conversion and 100+ celestial stars, for hyper-personalized insights you can't get anywhere else.",
    span: "lg:col-span-7 lg:-translate-y-4",
    z: "z-20",
  },
  {
    icon: CalendarRange,
    title: "Map Your 10-Year Destiny Cycles",
    body: "Zi Wei doesn't stop at personality. It predicts exactly how your luck, opportunities and risks will shift across major 10-year life cycles, so you can make the right choices at the perfect time.",
    span: "lg:col-span-5 lg:translate-x-4 lg:-mt-8",
    z: "z-30",
  },
  {
    icon: Crown,
    title: "Trusted For Over 1,000 Years",
    body: "Developed in ancient Chinese imperial dynasties, Zi Wei Dou Shu was historically used to analyze emperors, generals and royal families. Today, we combine this time-tested system with modern AI to turn complex charts into clear, actionable insights.",
    span: "lg:col-span-6 lg:col-start-4 lg:-mt-6",
    z: "z-10",
  },
] as const;

export default function WhyZiWeiBetter() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 md:py-28">
      <div
        className="pointer-events-none absolute left-[-10%] top-[20%] h-px w-[120%] rotate-[-4deg] bg-gradient-to-r from-transparent via-gold/25 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-2xl md:pl-6 lg:pl-12">
          <p className="landing-kicker">Why Zi Wei</p>
          <h2 className="landing-headline mt-3 text-3xl md:text-4xl">
            Thousands Choose Zi Wei Over Western Astrology
          </h2>
        </div>

        <div className="relative mt-14 grid gap-6 lg:grid-cols-12 lg:gap-5">
          {cards.map((c) => (
            <Card
              key={c.title}
              className={`${c.span} ${c.z} relative border-white/10 transition-transform duration-300 hover:-translate-y-1`}
            >
              <CardHeader className="pb-0">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-cinnabar/30 bg-cinnabar/10">
                    <c.icon className="h-5 w-5 text-cinnabar" aria-hidden />
                  </span>
                  <CardTitle className="text-xl leading-snug">{c.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CardDescription className="text-sm leading-relaxed">{c.body}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
