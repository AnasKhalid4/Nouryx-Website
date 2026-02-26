"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Star, MapPin, Heart } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { mockSalons } from "@/data/mock-salons";
import Link from "next/link";

export default function FavoritesPage() {
  const { t } = useLocale();
  const favorites = mockSalons.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            {t.profile.favorites}
          </h1>

          {favorites.length > 0 ? (
            <div className="space-y-3">
              {favorites.map((salon) => (
                <Link
                  key={salon.id}
                  href={`/salon/${salon.id}`}
                  className="group flex gap-4 bg-white rounded-xl border border-border/50 p-4 hover:border-[#C9AA8B]/30 transition-all"
                >
                  <div className="h-20 w-20 rounded-xl bg-linear-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0">
                    <span className="text-[#C9AA8B] text-2xl font-bold opacity-40">
                      {salon.shopName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-foreground text-sm group-hover:text-[#C9AA8B] transition-colors truncate">
                        {salon.shopName}
                      </h3>
                      <Heart className="h-4 w-4 fill-red-500 text-red-500 shrink-0 ml-2" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{salon.rating}</span>
                      <span className="text-sm text-muted-foreground">({salon.ratingCount})</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-sm truncate">{salon.address}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {salon.categories.slice(0, 3).map((cat) => (
                        <span key={cat} className="text-[10px] px-2 py-0.5 bg-[#F5EDE6] text-[#8B7355] rounded-full">
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
              <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{t.common.noResults}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
