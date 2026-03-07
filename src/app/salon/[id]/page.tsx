"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Heart, Share2, MessageSquare, ExternalLink, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useSalonDetail, useSalonServices } from "@/hooks/use-salons";
import { useSalonReviews } from "@/hooks/use-reviews";
import { useIsFavorite, useToggleFavorite } from "@/hooks/use-favorites";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/hooks/use-auth";
import { useCreateConversation } from "@/hooks/use-chat";
import { useBookingStore } from "@/stores/booking-store";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function SalonDetailPage() {
  const { t } = useLocale();
  const params = useParams();
  const router = useRouter();
  const salonId = params.id as string;
  const { isLoggedIn, uid } = useAuth();

  const { data: salon, isLoading: salonLoading } = useSalonDetail(salonId);
  const { data: services, isLoading: servicesLoading } = useSalonServices(salonId);
  const { data: reviews } = useSalonReviews(salonId);
  const { data: categories } = useCategories();
  const isFavorite = useIsFavorite(salonId);
  const toggleFav = useToggleFavorite();
  const createConversation = useCreateConversation();
  const { setSalon, toggleService: bookingToggleService, selectedServices, clearBooking } = useBookingStore();
  const [startingChat, setStartingChat] = useState(false);


  const [activeImage, setActiveImage] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const isLoading = salonLoading || servicesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-10 w-10 animate-spin text-[#C9AA8B]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-40 text-muted-foreground">
          <p className="text-lg font-medium">Salon not found</p>
          <Link href="/salons" className="mt-4 text-[#C9AA8B] font-medium hover:underline">
            Browse all salons
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const shopImages = salon.shopImages?.length > 0 ? salon.shopImages : [""];

  // Build a categoryId → name lookup map
  const categoryMap = (categories || []).reduce<Record<string, string>>((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  // Group services by category name (resolved from categoryId)
  const grouped = (services || []).reduce<Record<string, typeof services>>((acc, service) => {
    const catName = categoryMap[service.categoryId] || service.categoryId || "Other";
    if (!acc[catName]) acc[catName] = [];
    acc[catName]!.push(service);
    return acc;
  }, {});

  const categoryNames = Object.keys(grouped);
  const filteredGroups = activeCategory ? { [activeCategory]: grouped[activeCategory] || [] } : grouped;

  const selectedServiceIds = selectedServices.map(s => s.id);

  const selectedTotal = (services || [])
    .filter((s) => selectedServiceIds.includes(s.id))
    .reduce((sum, s) => sum + (s.price || 0), 0);

  const selectedDuration = (services || [])
    .filter((s) => selectedServiceIds.includes(s.id))
    .reduce((sum, s) => sum + (s.minutes || 0), 0);

  const handleFavoriteToggle = () => {
    if (!isLoggedIn || !uid) {
      toast.error("Please login to add favorites");
      router.push("/login");
      return;
    }
    toggleFav.mutate({ salonId, isFavorite });
  };

  const handleChat = async () => {
    if (!isLoggedIn || !uid) {
      toast.error("Please login to chat");
      router.push("/login");
      return;
    }
    setStartingChat(true);
    try {
      const conversationId = await createConversation.mutateAsync({
        salonId,
        salonName: salon?.shopName || "Salon",
        salonImage: salon?.owner?.profileImage || "",
      });
      router.push(`/chat/${conversationId}`);
    } catch (err) {
      console.error("Failed to create conversation:", err);
      toast.error("Failed to start chat");
    } finally {
      setStartingChat(false);
    }
  };

  const handleBookNow = () => {
    if (!isLoggedIn) {
      toast.error("Please login to book");
      router.push("/login");
      return;
    }
    // Clear stale data from previous sessions, then set fresh salon + current selections
    const currentSelections = [...selectedServices];
    clearBooking();
    setSalon(salon);
    currentSelections.forEach((s) => bookingToggleService(s));
    router.push("/booking");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-32 overflow-x-hidden">
        {/* Full-width Image Gallery */}
        <div className="relative w-full h-72 bg-[#1A1A1A] overflow-hidden">
          {shopImages[activeImage] ? (
            <Image src={shopImages[activeImage]} alt={salon.shopName} fill className="object-cover" priority />
          ) : (
            <div className="flex items-center justify-center h-full text-[#C9AA8B] text-5xl font-bold">{salon.shopName.charAt(0)}</div>
          )}
          {shopImages.length > 1 && (
            <>
              <button onClick={() => setActiveImage(Math.max(0, activeImage - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors z-10">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => setActiveImage(Math.min(shopImages.length - 1, activeImage + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors z-10">
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {shopImages.map((_, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`h-2.5 rounded-full transition-all ${i === activeImage ? "w-7 bg-white" : "w-2.5 bg-white/40"}`} />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-5 right-5 flex gap-2 z-10">
            <button onClick={handleFavoriteToggle} className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-foreground"}`} />
            </button>
            <button className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}>
              <Share2 className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Services & Reviews */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-foreground mb-4">{t.salonDetail.services}</h2>

              {/* Category Pills */}
              {categoryNames.length > 1 && (
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                  <button onClick={() => setActiveCategory(null)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!activeCategory ? "bg-foreground text-white" : "bg-white border border-border text-foreground hover:bg-muted"}`}>
                    {t.salonDetailExtra.all}
                  </button>
                  {categoryNames.map((cat) => (
                    <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? "bg-foreground text-white" : "bg-white border border-border text-foreground hover:bg-muted"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Service List */}
              {!services || services.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No services listed yet.</p>
              ) : (
                <div className="space-y-0 divide-y divide-border/50">
                  {Object.entries(filteredGroups).map(([, svcList]) =>
                    (svcList || []).map((service) => {
                      const isSelected = selectedServiceIds.includes(service.id);
                      return (
                        <div key={service.id} className="flex items-center justify-between py-5 group cursor-pointer" onClick={() => bookingToggleService(service)}>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{service.name}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {service.minutes} min
                            </p>
                            <p className="text-sm font-semibold text-foreground mt-1">
                              {t.common.currency}{service.price}
                            </p>
                          </div>
                          <Button variant={isSelected ? "default" : "outline"} size="sm"
                            className={`rounded-lg text-xs h-9 px-5 ${isSelected ? "bg-[#C9AA8B] hover:bg-[#B8956F] text-white" : ""}`}
                            onClick={(e) => { e.stopPropagation(); bookingToggleService(service); }}>
                            {isSelected ? t.salonDetailExtra.added : t.salonDetailExtra.book}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Reviews */}
              <div className="mt-12">
                <h2 className="text-xl font-bold text-foreground mb-5">{t.salonDetail.reviews}</h2>
                {!reviews || reviews.length === 0 ? (
                  <p className="text-muted-foreground py-4">No reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="py-4 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-9 w-9 rounded-full bg-[#E8D5C0] flex items-center justify-center overflow-hidden">
                            {review.userImage ? (
                              <Image src={review.userImage} alt={review.userName} width={36} height={36} className="object-cover" />
                            ) : (
                              <span className="text-sm font-medium text-[#8B7355]">{review.userName.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{review.userName}</p>
                            <p className="text-xs text-muted-foreground">{review.createdAt.toLocaleDateString()}</p>
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
                )}
              </div>
            </div>

            {/* Right: Info Card — full height, scrollable */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-border/50 p-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                <h1 className="text-xl font-bold text-foreground leading-snug">{salon.shopName}</h1>
                <div className="flex items-center gap-2 mt-3">
                  <span className="font-bold">{salon.rating.toFixed(1)}</span>
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

                <Button
                  className="w-full bg-foreground hover:bg-foreground/90 text-white rounded-lg h-12 font-semibold mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleBookNow}
                  disabled={selectedServices.length === 0}
                >
                  {t.salonDetail.bookNow}
                </Button>

                <div className="mt-5 space-y-3 pt-5 border-t border-border/50">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <span>{salon.address || salon.city}</span>
                      <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${salon.lat},${salon.lng}`, "_blank")}
                        className="text-[#C9AA8B] hover:text-[#B8956F] font-medium ml-1">
                        {t.salonDetailExtra.getDirections}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-5 pt-5 border-t border-border/50">
                  {isLoggedIn && (
                    <Button variant="outline" size="sm" className="flex-1 rounded-lg gap-1.5 text-xs h-9" onClick={handleChat} disabled={startingChat}>
                      {startingChat ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
                      {t.salonDetail.chat}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg gap-1.5 text-xs h-9"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${salon.lat},${salon.lng}`, "_blank")}>
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
              <Button className="bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-xl px-8 h-11 font-medium" onClick={handleBookNow}>
                {t.salonDetail.bookNow}
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
