"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Heart, Share2, MessageSquare, ExternalLink, Plus, Minus, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { mockSalons, mockCategories } from "@/data/mock-salons";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function SalonDetailPage() {
  const { t } = useLocale();
  const params = useParams();
  const salon = mockSalons.find((s) => s.id === params.id) || mockSalons[0];
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectedTotal = salon.services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const selectedDuration = salon.services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.minutes, 0);

  // Group services by category
  const grouped = salon.services.reduce<Record<string, typeof salon.services>>(
    (acc, service) => {
      const cat = mockCategories.find((c) => c.id === service.categoryId);
      const catName = cat?.name || "Other";
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(service);
      return acc;
    },
    {}
  );

  const categoryNames = Object.keys(grouped);
  const filteredGroups = activeCategory
    ? { [activeCategory]: grouped[activeCategory] || [] }
    : grouped;

  // Team mock
  const team = [
    { name: "Sophie", initial: "S", color: "bg-blue-100 text-blue-600", rating: 4.9 },
    { name: "Rachel", initial: "R", color: "bg-purple-100 text-purple-600", rating: 4.6 },
    { name: "Alice", initial: "A", color: "bg-violet-100 text-violet-600", rating: 5.0 },
    { name: "Anna", initial: "A", color: "bg-pink-100 text-pink-600", rating: 4.8 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-32">
        {/* Full-width Image Gallery */}
        <div className="relative w-full h-72 bg-[#1A1A1A] overflow-hidden">
          {/* Main Image */}
          <img
            src={salon.shopImages[activeImage]}
            alt={salon.shopName}
            className="w-full h-full object-cover"
          />
          {/* Nav arrows */}
          <button
            onClick={() => setActiveImage(Math.max(0, activeImage - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveImage(Math.min(salon.shopImages.length - 1, activeImage + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {salon.shopImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === activeImage ? "w-7 bg-white" : "w-2.5 bg-white/40"
                }`}
              />
            ))}
          </div>
          {/* Actions overlay */}
          <div className="absolute top-5 right-5 flex gap-2 z-10">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-foreground"}`} />
            </button>
            <button className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
              <Share2 className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Content: 2-column Fresha-style */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Services & Reviews */}
            <div className="lg:col-span-2">
              {/* Services Header */}
              <h2 className="text-xl font-bold text-foreground mb-4">{t.salonDetail.services}</h2>

              {/* Category Pills */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    !activeCategory ? "bg-foreground text-white" : "bg-white border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {t.salonDetailExtra.all}
                </button>
                {categoryNames.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      activeCategory === cat ? "bg-foreground text-white" : "bg-white border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-auto shrink-0">
                  <button className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Service List */}
              <div className="space-y-0 divide-y divide-border/50">
                {Object.entries(filteredGroups).map(([catName, services]) =>
                  services.map((service) => {
                    const isSelected = selectedServices.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        className="flex items-center justify-between py-5 group cursor-pointer"
                        onClick={() => toggleService(service.id)}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{service.name}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {service.timeLabel} · {salon.services.length > 1 ? "1 service" : ""}
                          </p>
                          <p className="text-sm font-semibold text-foreground mt-1">
                            {t.common.currency}{service.price}
                          </p>
                        </div>
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={`rounded-lg text-xs h-9 px-5 ${
                            isSelected ? "bg-[#C9AA8B] hover:bg-[#B8956F] text-white" : ""
                          }`}
                          onClick={(e) => { e.stopPropagation(); toggleService(service.id); }}
                        >
                          {isSelected ? t.salonDetailExtra.added : t.salonDetailExtra.book}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* See all link */}
              <button className="mt-4 text-sm font-medium text-foreground border border-border rounded-lg px-4 py-2 hover:bg-muted transition-colors">
                {t.salonDetailExtra.seeAll}
              </button>


              {/* Reviews */}
              <div className="mt-12">
                <h2 className="text-xl font-bold text-foreground mb-5">{t.salonDetail.reviews}</h2>
                <div className="space-y-4">
                  {[
                    { name: "Sophie", rating: 5, comment: "Excellent service, very professional!", date: "Feb 15, 2026" },
                    { name: "Marc", rating: 4, comment: "Good experience, will come back.", date: "Feb 10, 2026" },
                    { name: "Camille", rating: 5, comment: "Love the atmosphere and the results!", date: "Feb 5, 2026" },
                  ].map((review, i) => (
                    <div key={i} className="py-4 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-9 w-9 rounded-full bg-[#E8D5C0] flex items-center justify-center">
                          <span className="text-sm font-medium text-[#8B7355]">{review.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-12">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Sticky Info Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-border/50 p-6 sticky top-20">
                <h1 className="text-xl font-bold text-foreground leading-snug">
                  {salon.shopName}
                </h1>
                <div className="flex items-center gap-2 mt-3">
                  <span className="font-bold">{salon.rating}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-3.5 w-3.5 ${j < Math.round(salon.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({salon.ratingCount})</span>
                </div>
                {salon.isFeatured && (
                  <Badge variant="outline" className="mt-3 text-xs border-[#C9AA8B]/40 text-[#C9AA8B]">{t.salonDetailExtra.featured}</Badge>
                )}

                <Link href="/booking">
                  <Button className="w-full bg-foreground hover:bg-foreground/90 text-white rounded-lg h-12 font-semibold mt-5">
                    {t.salonDetail.bookNow}
                  </Button>
                </Link>

                {/* Info */}
                <div className="mt-5 space-y-3 pt-5 border-t border-border/50">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{t.salonDetailExtra.closed}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <span>{salon.address}</span>
                      <button
                        onClick={() =>
                          window.open(`https://www.google.com/maps/search/?api=1&query=${salon.lat},${salon.lng}`, "_blank")
                        }
                        className="text-[#C9AA8B] hover:text-[#B8956F] font-medium ml-1"
                      >
                        {t.salonDetailExtra.getDirections}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-5 pt-5 border-t border-border/50">
                  <Link href="/chat/conv-1" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-lg gap-1.5 text-xs h-9">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {t.salonDetail.chat}
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg gap-1.5 text-xs h-9"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${salon.lat},${salon.lng}`, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t.salonDetail.openMap}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Bottom Bar (mobile) */}
        {selectedServices.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-40 lg:hidden">
            <div className="mx-auto max-w-4xl flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedServices.length} {t.salonDetail.selected} · {selectedDuration} {t.salonDetail.minutes}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {t.common.currency}{selectedTotal}
                </p>
              </div>
              <Link href="/booking">
                <Button className="bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-xl px-8 h-11 font-medium">
                  {t.salonDetail.bookNow}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
