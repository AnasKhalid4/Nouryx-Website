"use client";

import { useState, useEffect, useCallback } from "react";
import { content as enContent } from "@/data/content.en";
import { content as frContent } from "@/data/content.fr";
import { content as esContent } from "@/data/content.sp";
import { content as itContent } from "@/data/content.it";
import { content as ptContent } from "@/data/content.pt";
import type { Content } from "@/data/content.en";

export type Locale = "en" | "fr" | "es" | "it" | "pt";

const STORAGE_KEY = "nouryx_locale";
const EVENT_KEY = "nouryx_locale_change";

const VALID_LOCALES: Locale[] = ["en", "fr", "es", "it", "pt"];

function getInitialLocale(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && (VALID_LOCALES as string[]).includes(saved)) {
      return saved;
    }
  }
  return "en";
}

const contentMap: Record<Locale, Content> = {
  en: enContent,
  fr: frContent,
  es: esContent as unknown as Content,
  it: itContent as unknown as Content,
  pt: ptContent as unknown as Content,
};

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && (VALID_LOCALES as string[]).includes(saved)) {
      setLocaleState(saved);
    }

    const handleLocaleChange = (e: Event) => {
      const customEvent = e as CustomEvent<Locale>;
      if (customEvent.detail) setLocaleState(customEvent.detail);
    };

    window.addEventListener(EVENT_KEY, handleLocaleChange);
    return () => window.removeEventListener(EVENT_KEY, handleLocaleChange);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: newLocale }));
  }, []);

  // Keep toggleLocale for backward compat (cycles through all locales)
  const toggleLocale = useCallback(() => {
    const idx = VALID_LOCALES.indexOf(locale);
    const next = VALID_LOCALES[(idx + 1) % VALID_LOCALES.length];
    setLocale(next);
  }, [locale, setLocale]);

  const t: Content = contentMap[locale] ?? enContent;

  return { locale, setLocale, toggleLocale, t };
}
