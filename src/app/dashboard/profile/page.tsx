"use client";

import { Button } from "@/components/ui/button";
import { Pencil, MapPin, Star, Image as ImageIcon } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { mockSalons } from "@/data/mock-salons";
import Link from "next/link";

export default function DashboardProfilePage() {
  const { t } = useLocale();
  const salon = mockSalons[0];

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">{t.dashboard.profile.title}</h1>

      {/* Image Gallery */}
      <div className="bg-white rounded-xl border border-border/50 p-4 md:p-5 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-sm font-semibold text-foreground">{t.dashboard.profile.editImages}</h2>
          <Link href="/dashboard/profile" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs rounded-lg gap-1">
              <ImageIcon className="h-3 w-3" />
              {t.dashboard.profile.editImages}
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-linear-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center relative overflow-hidden">
              <span className="text-[#C9AA8B] text-xl font-bold opacity-20">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-border/50 p-4 md:p-5 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-sm font-semibold text-foreground">{t.dashboard.profile.editBasic}</h2>
          <Link href="/dashboard/profile" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs rounded-lg gap-1">
              <Pencil className="h-3 w-3" />
              {t.dashboard.profile.editBasic}
            </Button>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-[#C9AA8B] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg md:text-xl">{salon.shopName.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{salon.ownerName}</p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">salon@example.com</p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">+33 6 12 34 56 78</p>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-xl border border-border/50 p-4 md:p-5 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-sm font-semibold text-foreground">{t.dashboard.profile.editBusiness}</h2>
          <Link href="/dashboard/profile" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs rounded-lg gap-1">
              <Pencil className="h-3 w-3" />
              {t.dashboard.profile.editBusiness}
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Shop Name</p>
            <p className="text-sm font-medium text-foreground">{salon.shopName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Description</p>
            <p className="text-xs md:text-sm text-foreground">{salon.description}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Location</p>
            <p className="text-xs md:text-sm text-foreground flex items-center gap-1.5 break-words">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1">{salon.address}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Rating</p>
              <p className="text-sm font-medium text-foreground flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {salon.rating} ({salon.ratingCount})
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">SIRET</p>
              <p className="text-sm font-medium text-foreground break-all">123 456 789 00012</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-xs text-muted-foreground mb-0.5">Legal Status</p>
              <p className="text-sm font-medium text-foreground">SAS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
