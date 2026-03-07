"use client";

import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, X, Loader2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useAllSalons } from "@/hooks/use-salons";
import { useCategories } from "@/hooks/use-categories";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function SalonsContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Pre-select category from URL query param (e.g. /salons?category=abc123)
  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam) setSelectedCategory(catParam);
  }, [searchParams]);

  const { data: allSalons, isLoading: salonsLoading } = useAllSalons();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const filtered = useMemo(() => {
    if (!allSalons) return [];
    return allSalons.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        s.shopName.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q);

      const matchesCategory =
        !selectedCategory ||
        (s.services && s.services.some((svc) => svc.categoryId === selectedCategory));

      return matchesSearch && matchesCategory;
    });
  }, [allSalons, searchQuery, selectedCategory]);

  const isLoading = salonsLoading || categoriesLoading;

  return (
    <main className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left Sidebar: Categories ── */}
          <aside className="lg:w-56 shrink-0">
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] bg-white rounded-xl border border-border/50 p-4 lg:p-5 flex flex-col">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 shrink-0">
                {t.categories.title}
              </h2>
              <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto pb-2 lg:pb-0 flex-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-left ${!selectedCategory ? "bg-[#C9AA8B] text-white" : "text-foreground hover:bg-[#F5EDE6]"
                    }`}
                >
                  {t.salonDetailExtra.all}
                </button>
                {categories?.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isActive ? null : cat.id)}
                      className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs font-normal transition-colors whitespace-nowrap text-left ${isActive ? "bg-[#C9AA8B] text-white" : "text-foreground hover:bg-[#F5EDE6]"
                        }`}
                    >
                      <span>{cat.name}</span>
                      {isActive && <X className="h-3 w-3 shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* ── Right Content: Search + Grid ── */}
          <div className="flex-1 min-w-0">
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

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#C9AA8B]" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((salon) => (
                  <Link
                    key={salon.uid}
                    href={`/salon/${salon.uid}`}
                    className="group block rounded-xl overflow-hidden border border-border/50 hover:border-[#C9AA8B]/30 bg-white transition-all"
                  >
                    <div className="relative aspect-[16/10] bg-[#F5EDE6] overflow-hidden">
                      {salon.owner.profileImage ? (
                        <Image
                          src={salon.owner.profileImage}
                          alt={salon.shopName}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[#C9AA8B] text-3xl font-bold">
                          {salon.shopName.charAt(0)}
                        </div>
                      )}
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
                        <span className="text-sm font-medium">{salon.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({salon.ratingCount} {t.featured.reviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="text-sm line-clamp-1">{salon.address || salon.city}</span>
                      </div>
                      {salon.distanceKm != null && (
                        <p className="text-xs text-[#C9AA8B] mt-1.5 font-medium">
                          📍 {salon.distanceKm.toFixed(1)} km away
                        </p>
                      )}
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
  );
}

export default function SalonsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-40">
            <Loader2 className="h-8 w-8 animate-spin text-[#C9AA8B]" />
          </div>
        }
      >
        <SalonsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
