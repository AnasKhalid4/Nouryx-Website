"use client";

import { Star, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";
import { mockSalons } from "@/data/mock-salons";
import Link from "next/link";

export function FeaturedSalonsSection() {
  const { t } = useLocale();
  const featured = mockSalons.filter((s) => s.isFeatured);

  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {t.featured.title}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {t.featured.subtitle}
            </p>
          </div>
          <Link
            href="/salons"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#C9AA8B] hover:text-[#B8956F] transition-colors"
          >
            {t.featured.viewAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((salon) => (
            <Link
              key={salon.id}
              href={`/salon/${salon.id}`}
              className="group block rounded-xl overflow-hidden border border-border/50 hover:border-[#C9AA8B]/30 transition-all bg-white/80 backdrop-blur-sm"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-[#F5EDE6] overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent z-10" />
                <img
                  src={salon.shopImages[0]}
                  alt={salon.shopName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-sm group-hover:text-[#C9AA8B] transition-colors line-clamp-1">
                  {salon.shopName}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">
                    {salon.rating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({salon.ratingCount})
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-sm line-clamp-1">{salon.city}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                  {salon.categories.join(" · ")}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/salons">
            <Button variant="outline" className="border-[#C9AA8B] text-[#C9AA8B] hover:bg-[#C9AA8B]/5">
              {t.featured.viewAll}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
