"use client";

import { useState, useEffect, useCallback } from "react";
import { content as enContent } from "@/data/content.en";
import { content as frContent } from "@/data/content.fr";
import type { Content } from "@/data/content.en";

type Locale = "en" | "fr";

const STORAGE_KEY = "nouryx_locale";

// Initialize locale from localStorage immediately to prevent flash
function getInitialLocale(): Locale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "en" || saved === "fr") {
      return saved;
    }
  }
  return "en"; // Default to English instead of French
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    // Sync with localStorage on mount (in case of SSR)
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "en" || saved === "fr") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    const newLocale = locale === "fr" ? "en" : "fr";
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, [locale]);

  const t: Content = locale === "fr" ? frContent : enContent;

  return { locale, setLocale, toggleLocale, t };
}
