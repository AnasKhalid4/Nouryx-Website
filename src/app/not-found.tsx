"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLocale } from "@/hooks/use-locale";
import { Search, MapPin, Scissors } from "lucide-react";

const COPY: Record<string, { title: string; subtitle: string; searchLabel: string; cities: string[]; cta: string; ctaB2b: string; ctaB2bLabel: string }> = {
  fr: {
    title: "Page introuvable",
    subtitle: "Cette page n'existe pas, mais votre prochain rendez-vous beauté, lui, existe.",
    searchLabel: "Trouver un salon",
    cities: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice"],
    cta: "Voir tous les salons",
    ctaB2b: "/signup",
    ctaB2bLabel: "Inscrire mon salon",
  },
  en: {
    title: "Page not found",
    subtitle: "This page doesn't exist, but your next beauty appointment does.",
    searchLabel: "Find a salon",
    cities: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice"],
    cta: "View all salons",
    ctaB2b: "/signup",
    ctaB2bLabel: "List your salon",
  },
};

export default function NotFound() {
  const { locale } = useLocale();
  const c = COPY[locale] || COPY.en;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="h-20 w-20 rounded-full bg-[#F5EDE6] flex items-center justify-center mb-6">
          <Scissors className="h-10 w-10 text-[#C9AA8B]" />
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-3">
          404 — {c.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-md">
          {c.subtitle}
        </p>

        <Link
          href="/salons"
          className="inline-flex items-center gap-2 bg-[#C9AA8B] hover:bg-[#B8956F] text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors mb-8"
        >
          <Search className="h-4 w-4" />
          {c.searchLabel}
        </Link>

        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {c.cities.map((city) => (
            <Link
              key={city}
              href={`/salons?city=${city.toLowerCase()}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-border/50 rounded-full text-sm text-muted-foreground hover:border-[#C9AA8B]/50 hover:text-foreground transition-colors"
            >
              <MapPin className="h-3 w-3" />
              {city}
            </Link>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {locale === "fr" ? "Vous êtes professionnel ?" : "Are you a professional?"}{" "}
          <Link href={c.ctaB2b} className="text-[#C9AA8B] hover:underline font-medium">
            {c.ctaB2bLabel}
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
