"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, X } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { mockSalons, mockCategories } from "@/data/mock-salons";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SalonsPage() {
  const { t, locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = mockSalons.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || s.categories.some((c) => c === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const enabledCategories = mockCategories.filter((c) => c.enabled);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Left Sidebar: Categories (Floating/Sticky) ── */}
            <aside className="lg:w-56 shrink-0">
              <div className="lg:sticky lg:top-24 bg-white rounded-xl  border border-border/50 p-4 lg:p-5">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                  {t.categories.title}
                </h2>
                <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-left ${
                      !selectedCategory
                        ? "bg-[#C9AA8B] text-white"
                        : "text-foreground hover:bg-[#F5EDE6]"
                    }`}
                  >
                    {t.salonDetailExtra.all}
                  </button>
                  {enabledCategories.map((cat) => {
                    const name = locale === "fr" ? cat.nameFr : cat.name;
                    const isActive = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        onClick={() =>
                          setSelectedCategory(isActive ? null : cat.name)
                        }
                        className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs font-normal transition-colors whitespace-nowrap text-left ${
                          isActive
                            ? "bg-[#C9AA8B] text-white"
                            : "text-foreground hover:bg-[#F5EDE6]"
                        }`}
                      >
                        <span>{name}</span>
                        {isActive && <X className="h-3 w-3 shrink-0" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* ── Right Content: Search + Grid ── */}
            <div className="flex-1 min-w-0">
              {/* Top bar: results count left, search right */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <p className="text-sm text-muted-foreground shrink-0">
                  {filtered.length} {t.common.salonsCount}
                </p>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.hero.searchTreatment}
                    className="pl-10 h-10 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Salon Grid */}
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((salon) => (
                    <Link
                      key={salon.id}
                      href={`/salon/${salon.id}`}
                      className="group block rounded-xl overflow-hidden border border-border/50 hover:border-[#C9AA8B]/30 bg-white transition-all"
                    >
                      <div className="relative aspect-[16/10] bg-[#F5EDE6] overflow-hidden">
                        <Image
                          src={salon.shopImages[0]}
                          alt={salon.shopName}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                        {salon.isFeatured && (
                          <Badge className="absolute top-3 left-3 bg-[#C9AA8B] text-white text-[10px] hover:bg-[#C9AA8B] z-10">
                            {t.salonDetailExtra.featured}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-[#C9AA8B] transition-colors line-clamp-1">
                          {salon.shopName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{salon.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({salon.ratingCount} {t.featured.reviews})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="text-sm line-clamp-1">{salon.address}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {salon.categories.slice(0, 3).map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 bg-[#F5EDE6] text-[#8B7355] text-xs rounded-full"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">{t.common.noResults}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
