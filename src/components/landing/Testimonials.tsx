import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Early Beta Reader",
    quote:
      "Way deeper than any astrology app I’ve tried. The 10-year career cycle section was so accurate it felt like someone had read my life story.",
  },
  {
    name: "Astrology Enthusiast",
    quote:
      "The relationship section felt weirdly accurate. It explained exactly why my past relationships didn't work, and what I need to look for going forward.",
  },
  {
    name: "Beta Tester",
    quote:
      "I didn't expect Chinese astrology to be this detailed. I've tried every Western astrology service, and this is the only one that actually felt personal to me.",
  },
] as const;

function Avatar({ name }: { name: string }) {
  const letter = name.trim().slice(0, 1).toUpperCase();
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(201,167,94,0.25),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(61,155,132,0.18),transparent_55%)] font-mono text-sm text-ink"
      aria-hidden
    >
      {letter}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="relative border-y border-white/10 bg-mist/35 py-20 backdrop-blur-sm md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          What Our Readers Are Saying
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="h-full">
              <CardContent className="p-6">
                <p className="font-mono text-sm tracking-wider text-gold" aria-hidden>
                  ★★★★★
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <Avatar name={t.name} />
                  <p className="font-mono text-xs uppercase tracking-widest text-ink-dim">
                    {t.name}
                  </p>
                </div>
                <p className="mt-4 font-body text-sm leading-relaxed text-ink-muted">
                  {t.quote}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

