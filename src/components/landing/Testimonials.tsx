import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Early Beta Reader",
    quote:
      "Way deeper than any astrology app I've tried. The 10-year career cycle section was so accurate it felt like someone had read my life story.",
    layout: "lg:col-span-7 lg:row-span-2",
    offset: "",
  },
  {
    name: "Astrology Enthusiast",
    quote:
      "The relationship section felt weirdly accurate. It explained exactly why my past relationships didn't work, and what I need to look for going forward.",
    layout: "lg:col-span-5",
    offset: "lg:-mt-10 lg:translate-x-4",
  },
  {
    name: "Beta Tester",
    quote:
      "I didn't expect Chinese astrology to be this detailed. I've tried every Western astrology service, and this is the only one that actually felt personal to me.",
    layout: "lg:col-span-5 lg:col-start-8",
    offset: "lg:-mt-6",
  },
] as const;

function StarRating() {
  return (
    <div className="flex gap-0.5 text-gold" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-gold/80" aria-hidden />
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const letter = name.trim().slice(0, 1).toUpperCase();
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-gold/20 to-jade/15 font-mono text-sm text-ink"
      aria-hidden
    >
      {letter}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-mist/40 py-20 backdrop-blur-sm md:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="landing-kicker">Readers</p>
            <h2 className="landing-headline mt-2 text-3xl md:text-4xl">
              What Our Readers Are Saying
            </h2>
          </div>
          <Quote className="hidden h-12 w-12 text-gold/25 lg:block" aria-hidden />
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className={`relative rounded-sm border border-white/10 bg-panel p-6 shadow-panel backdrop-blur-md ${t.layout} ${t.offset}`}
            >
              <StarRating />
              <p className="mt-5 font-body text-sm leading-relaxed text-ink-muted md:text-base">
                {t.quote}
              </p>
              <footer className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                <Avatar name={t.name} />
                <cite className="font-mono text-xs not-italic uppercase tracking-widest text-ink-dim">
                  {t.name}
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
