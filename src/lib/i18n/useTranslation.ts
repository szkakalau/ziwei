"use client";

import { useCallback, useEffect, useState } from "react";
import { getDictionary, type Locale, LOCALES } from "./dictionaries";

const COOKIE_NAME = "lang";

function getLangFromCookie(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  const val = match?.[1];
  if (val && LOCALES.some((l) => l.key === val)) return val as Locale;
  return "en";
}

function setLangCookie(locale: Locale) {
  document.cookie = `${COOKIE_NAME}=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(getLangFromCookie());
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLangCookie(l);
    setLocaleState(l);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const dict = getDictionary(locale);
      let text = dict[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [locale],
  );

  return { t, locale, setLocale, locales: LOCALES };
}
