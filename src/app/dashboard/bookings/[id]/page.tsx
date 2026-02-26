"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CalendarDays, Clock, MapPin, User, Star } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { mockBookings } from "@/data/mock-salons";
import { useParams } from "next/navigation";
import Link from "next/link";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  inprocess: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function BookingDetailPage() {
  const { t } = useLocale();
  const params = useParams();
  const booking = mockBookings.find((b) => b.bookingId === params.id) || mockBookings[0];

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
      <Link href="/dashboard/bookings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        {t.common.back}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Booking #{booking.bookingId}</h1>
        <Badge variant="outline" className={statusColors[booking.status]}>{booking.status}</Badge>
      </div>

      <div className="bg-white rounded-xl border border-border/50 p-5 space-y-5">
        {/* Client */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Client</p>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#E8D5C0] flex items-center justify-center">
              <User className="h-4 w-4 text-[#8B7355]" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{booking.user.fullName}</p>
              <p className="text-xs text-muted-foreground">Client</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Schedule */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Schedule</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(booking.schedule.startAt).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(booking.schedule.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} —{" "}
                {new Date(booking.schedule.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {" "}({booking.schedule.durationMinutes} min)
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Services */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t.booking.services}</p>
          <div className="space-y-2">
            {booking.services.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.minutes} min</p>
                </div>
                <span className="text-sm font-medium">{t.common.currency}{s.price}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">{t.booking.total}</span>
          <span className="text-xl font-bold">{t.common.currency}{booking.pricing.total}</span>
        </div>

        {/* Notes */}
        {booking.notes && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-foreground">{booking.notes}</p>
            </div>
          </>
        )}

        {/* Review */}
        {booking.review?.isReviewed && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Review</p>
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: booking.review.rating }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground">{booking.review.comment}</p>
            </div>
          </>
        )}

        {/* Cancel reason */}
        {"cancelReason" in booking && booking.cancelReason && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Cancel Reason</p>
              <p className="text-sm text-foreground">{booking.cancelReason}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
