"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Heart, User, Calendar } from "lucide-react";

export function AppNav() {
  const pathname = usePathname();

  const links = [
    { href: "/daily", label: "Today", icon: Sparkles },
    { href: "/yearly", label: "Yearly", icon: Calendar },
    { href: "/compatibility", label: "Match", icon: Heart },
    { href: "/account", label: "Account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-void/80 backdrop-blur-2xl border-t border-gold/[0.05] safe-area-bottom" data-testid="app-nav">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[64px] transition-colors ${
                active
                  ? "text-gold"
                  : "text-ink-dim hover:text-ink-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
