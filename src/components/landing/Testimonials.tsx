import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah K.",
    role: "Early Reader",
    quote:
      "I've tried Co-Star, The Pattern, and every astrology app out there. This was the first time a reading actually described me — not my sun sign, me. The 10-year cycle section was eerily accurate about my career timeline.",
    layout: "lg:col-span-7 lg:row-span-2",
    offset: "",
  },
  {
    name: "Michael R.",
    role: "Beta Tester",
    quote:
      "I was skeptical about 'Chinese astrology' at first. But the level of detail blew me away. The relationship section explained exactly why my past relationships failed and what I need to look for. It felt like someone had read my life.",
    layout: "lg:col-span-5",
    offset: "lg:-mt-12 lg:translate-x-6",
  },
  {
    name: "Emma L.",
    role: "Western Astrology Fan",
    quote:
      "I didn't expect Chinese astrology to be this specific. The chart uses your exact birth time and location — it's not just 'you're a Scorpio.' The personality snapshot alone was worth it, and the email reading went even deeper.",
    layout: "lg:col-span-5 lg:col-start-8",
    offset: "lg:-mt-8",
  },
] as const;

function Stars() {
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
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.1] bg-gradient-to-br from-gold/[0.12] to-jade/[0.08] font-display text-base text-ink"
      aria-hidden
    >
      {letter}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.07] bg-mist/40 py-24 backdrop-blur-sm md:py-32">
      {/* Decorative quote marks */}
      <div
        className="pointer-events-none absolute -left-4 top-8 select-none font-display text-[16rem] leading-none text-gold/[0.04] md:-left-8 md:text-[20rem]"
        aria-hidden
      >
        &ldquo;
      </div>
      <div
        className="pointer-events-none absolute -right-4 bottom-0 select-none font-display text-[12rem] leading-none text-gold/[0.03] md:text-[16rem]"
        aria-hidden
      >
        &rdquo;
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-lg">
            <p className="landing-kicker">Testimonials</p>
            <h2 className="landing-headline mt-2 text-3xl md:text-4xl">
              Readers who switched from
              Western astrology
            </h2>
          </div>
          <div className="flex items-center gap-3 md:pb-2">
            <Stars />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
              5.0 from early readers
            </span>
          </div>
        </div>

        {/* Testimonial cards — magazine editorial layout */}
        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className={`group relative rounded-sm border border-white/[0.08] bg-panel/80 p-6 shadow-panel backdrop-blur-md transition-all duration-500 hover:border-white/[0.14] sm:p-7 ${t.layout} ${t.offset}`}
            >
              {/* Quote icon */}
              <Quote
                className="absolute right-5 top-5 h-8 w-8 text-gold/[0.08] transition-colors duration-500 group-hover:text-gold/[0.15]"
                aria-hidden
              />

              <Stars />
              <p className="mt-5 font-body text-sm leading-relaxed text-ink-muted md:text-base">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-6 flex items-center gap-4 border-t border-white/[0.07] pt-5">
                <Avatar name={t.name} />
                <div>
                  <cite className="block font-display text-base not-italic text-ink">
                    {t.name}
                  </cite>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
                    {t.role}
                  </span>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
