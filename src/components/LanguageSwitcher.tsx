"use client";

import { Globe } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function LanguageSwitcher() {
  const { locale, setLocale, locales } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                   bg-white/[0.03] border border-gold/[0.06]
                   text-white/40 text-xs hover:text-white/60 transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        {locale.toUpperCase()}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 w-40 rounded-xl bg-white
                          border border-gold/10 py-1 shadow-lg">
            {locales.map((l) => (
              <button
                key={l.key}
                onClick={() => { setLocale(l.key); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-xs transition-colors
                            ${l.key === locale
                              ? "text-gold bg-gold/[0.06]"
                              : "text-ink-dim hover:text-ink-muted hover:bg-black/[0.03]"
                            }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
