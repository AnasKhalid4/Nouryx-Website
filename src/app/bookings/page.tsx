"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, MapPin, Star, Eye } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { mockBookings } from "@/data/mock-salons";
import Link from "next/link";

const statusColors: Record<string, string> = {
  inprocess: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

function BookingCard({ booking, t }: { booking: (typeof mockBookings)[number]; t: ReturnType<typeof useLocale>["t"] }) {
  return (
    <div className="bg-white rounded-xl border border-border/50 p-4">
      <div className="flex gap-4">
        <div className="h-16 w-16 rounded-xl bg-linear-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0">
          <span className="text-[#C9AA8B] font-bold text-lg">
            {booking.salon.shopName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {booking.salon.shopName}
            </h3>
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 ${statusColors[booking.status]}`}
            >
              {booking.status}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="text-xs">{booking.salon.city}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {new Date(booking.schedule.startAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(booking.schedule.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {booking.services.map((s, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-[#F5EDE6] text-[#8B7355] rounded-full">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <span className="font-semibold text-foreground">
          {t.common.currency}{booking.pricing.total}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs rounded-lg h-8 gap-1">
            <Eye className="h-3 w-3" />
            {t.userBookings.viewDetails}
          </Button>
          {booking.status === "inprocess" && (
            <Button variant="outline" size="sm" className="text-xs rounded-lg h-8 text-destructive border-destructive/30 hover:bg-destructive/5">
              {t.userBookings.cancel}
            </Button>
          )}
          {booking.status === "completed" && !booking.review?.isReviewed && (
            <Button size="sm" className="text-xs rounded-lg h-8 bg-[#C9AA8B] hover:bg-[#B8956F] text-white gap-1">
              <Star className="h-3 w-3" />
              {t.userBookings.writeReview}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { t } = useLocale();

  const inprocess = mockBookings.filter((b) => b.status === "inprocess");
  const completed = mockBookings.filter((b) => b.status === "completed");
  const cancelled = mockBookings.filter((b) => b.status === "cancelled");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            {t.userBookings.title}
          </h1>

          <Tabs defaultValue="inprocess">
            <TabsList className="bg-white border border-border/50 rounded-xl p-1 w-full">
              <TabsTrigger value="inprocess" className="flex-1 rounded-lg text-sm data-[state=active]:bg-[#C9AA8B] data-[state=active]:text-white">
                {t.userBookings.tabs.inprocess}
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1 rounded-lg text-sm data-[state=active]:bg-[#C9AA8B] data-[state=active]:text-white">
                {t.userBookings.tabs.completed}
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex-1 rounded-lg text-sm data-[state=active]:bg-[#C9AA8B] data-[state=active]:text-white">
                {t.userBookings.tabs.cancelled}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inprocess" className="mt-4 space-y-3">
              {inprocess.length > 0 ? (
                inprocess.map((b) => <BookingCard key={b.bookingId} booking={b} t={t} />)
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">{t.userBookings.noBookings}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4 space-y-3">
              {completed.length > 0 ? (
                completed.map((b) => <BookingCard key={b.bookingId} booking={b} t={t} />)
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">{t.userBookings.noBookings}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="mt-4 space-y-3">
              {cancelled.length > 0 ? (
                cancelled.map((b) => <BookingCard key={b.bookingId} booking={b} t={t} />)
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">{t.userBookings.noBookings}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
