"use client";

import { Star, MapPin, Heart, Loader2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { useFavoriteSalons, useToggleFavorite, useIsFavorite } from "@/hooks/use-favorites";
import type { SalonModel } from "@/types/salon";
import Link from "next/link";
import { toast } from "sonner";


function FavoriteCard({ salon }: { salon: SalonModel }) {
  const { uid } = useAuth();
  const isFav = useIsFavorite(salon.uid);
  const toggleFav = useToggleFavorite();

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!uid) return;
    toggleFav.mutate({ salonId: salon.uid, isFavorite: isFav });
    toast.success(isFav ? "Removed from favourites" : "Added to favourites");
  };

  return (
    <Link
      href={`/salon/${salon.uid}`}
      className="group flex gap-4 bg-white rounded-xl border border-border/50 p-4 hover:border-[#C9AA8B]/30 transition-all"
    >
      <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0">
        <span className="text-[#C9AA8B] text-2xl font-bold opacity-40">
          {salon.shopName?.charAt(0) || "S"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-foreground text-sm group-hover:text-[#C9AA8B] transition-colors truncate">
            {salon.shopName}
          </h3>
          <button
            onClick={handleRemove}
            disabled={toggleFav.isPending}
            className="shrink-0 ml-2 p-1 rounded-full hover:bg-red-50 transition-colors"
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground/40"}`} />
          </button>
        </div>
        {(salon.address || salon.city) && (
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-sm truncate">{salon.address || salon.city}</span>
          </div>
        )}
        {salon.rating !== undefined && (
          <div className="flex items-center gap-1.5 mt-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{salon.rating}</span>
            {salon.ratingCount !== undefined && (
              <span className="text-sm text-muted-foreground">({salon.ratingCount})</span>
            )}
          </div>
        )}

      </div>
    </Link>
  );
}

export default function FavoritesPage() {
  const { t } = useLocale();
  const { data: salons = [], isLoading } = useFavoriteSalons();

  return (
    <main className="py-8 lg:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {t.profile.favorites}
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#C9AA8B]" />
          </div>
        ) : salons.length > 0 ? (
          <div className="space-y-3">
            {salons.map((salon) => (
              <FavoriteCard key={salon.uid} salon={salon} />
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
  );
}
