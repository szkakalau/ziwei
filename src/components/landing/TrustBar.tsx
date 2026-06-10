"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Users, Clock } from "lucide-react";

function AnimatedCounter({
  target,
  label,
  suffix,
}: {
  target: number;
  label: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setCount(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="font-semibold text-ink">
      {count.toLocaleString()}
      {suffix || ""}
      <span className="ml-1 font-normal text-ink-muted">{label}</span>
    </span>
  );
}

export default function TrustBar() {
  return (
    <section className="relative border-b border-gold/[0.06] bg-gold/[0.02]">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm sm:gap-x-12">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gold/60" aria-hidden />
            <AnimatedCounter target={12400} label="charts generated" suffix="+" />
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Clock className="h-4 w-4 text-gold/60" aria-hidden />
            <AnimatedCounter target={847} label="readings delivered this week" />
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-jade/60" aria-hidden />
            <span className="text-ink-muted">
              <span className="font-semibold text-ink">100%</span> private · no signup required
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
