"use client";

import { useParams, useRouter } from "next/navigation";
import { useUserBookings } from "@/hooks/use-bookings";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CalendarDays, Clock, MapPin, Receipt } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
    inprocess: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params?.id as string;
    const { t } = useLocale();
    const { isLoggedIn } = useAuth();
    const { data: bookings, isLoading } = useUserBookings();

    useEffect(() => {
        if (!isLoggedIn) router.push("/login");
    }, [isLoggedIn, router]);

    if (!isLoggedIn) return null;

    const booking = bookings?.find((b) => b.bookingId === bookingId);

    if (isLoading) {
        return (
            <main className="py-16 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#C9AA8B]" />
            </main>
        );
    }

    if (!booking) {
        return (
            <main className="py-16 flex flex-col items-center gap-4">
                <p className="text-muted-foreground text-lg">Booking not found.</p>
                <Link href="/bookings">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Bookings
                    </Button>
                </Link>
            </main>
        );
    }

    const startDate = new Date(booking.schedule?.startAt || Date.now());
    const endDate = new Date(booking.schedule?.endAt || Date.now());

    return (
        <main className="py-8 lg:py-12">
            <div className="mx-auto max-w-xl px-4 sm:px-6">
                {/* Back */}
                <Link href="/bookings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    {t.userBookings.title}
                </Link>

                {/* Status badge */}
                <div className="flex items-center justify-between mb-5">
                    <h1 className="text-2xl font-bold text-foreground">Booking Details</h1>
                    <Badge variant="outline" className={`${statusColors[booking.status] || ""} capitalize`}>
                        {booking.status}
                    </Badge>
                </div>

                {/* Salon card */}
                <div className="bg-white rounded-2xl border border-border/50 p-5 mb-4">
                    <div className="flex gap-4 items-center">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0">
                            <span className="text-[#C9AA8B] font-bold text-xl">
                                {booking.salon?.shopName?.charAt(0) || "S"}
                            </span>
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-foreground">{booking.salon?.shopName || "Salon"}</h2>
                            {booking.salon?.city && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {booking.salon.city}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Team Member / Specialist */}
                {booking.team_member && booking.team_member.memberId && (
                    <div className="bg-white rounded-2xl border border-border/50 p-5 mb-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Specialist</h3>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#E8D5C0] flex items-center justify-center overflow-hidden">
                                {booking.team_member.image ? (
                                    <img src={booking.team_member.image} alt={booking.team_member.name} className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold text-[#8B7355]">{booking.team_member.name.charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">{booking.team_member.name}</p>
                                <p className="text-xs text-muted-foreground">{booking.team_member.role}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Date & Time */}
                <div className="bg-white rounded-2xl border border-border/50 p-5 mb-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Schedule</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="h-8 w-8 rounded-lg bg-[#F5EDE6] flex items-center justify-center">
                            <CalendarDays className="h-4 w-4 text-[#C9AA8B]" />
                        </div>
                        {startDate.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="h-8 w-8 rounded-lg bg-[#F5EDE6] flex items-center justify-center">
                            <Clock className="h-4 w-4 text-[#C9AA8B]" />
                        </div>
                        {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" – "}
                        {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                </div>

                {/* Services */}
                {booking.services && booking.services.length > 0 && (
                    <div className="bg-white rounded-2xl border border-border/50 p-5 mb-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">{t.booking.services}</h3>
                        <div className="space-y-2">
                            {booking.services.map((s, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-foreground">{s.name}</span>
                                    <span className="text-muted-foreground">{t.common.currency}{s.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pricing */}
                <div className="bg-white rounded-2xl border border-border/50 p-5 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Receipt className="h-4 w-4 text-[#C9AA8B]" />
                        <h3 className="text-sm font-semibold text-foreground">Summary</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t.booking.total}</span>
                        <span className="text-lg font-bold text-foreground">
                            {t.common.currency}{booking.pricing?.total || 0}
                        </span>
                    </div>
                    {booking.schedule?.durationMinutes && (
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-muted-foreground">{t.booking.duration}</span>
                            <span className="text-sm text-foreground">{booking.schedule.durationMinutes} min</span>
                        </div>
                    )}
                </div>

                {/* Notes */}
                {booking.notes && (
                    <div className="bg-white rounded-2xl border border-border/50 p-5 mb-4">
                        <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
                        <p className="text-sm text-muted-foreground">{booking.notes}</p>
                    </div>
                )}

                {/* Cancellation reason */}
                {booking.status === "cancelled" && booking.cancelReason && (
                    <div className="bg-red-50 rounded-2xl border border-red-100 p-5 mb-4">
                        <h3 className="text-sm font-semibold text-red-700 mb-2">Cancellation Reason</h3>
                        <p className="text-sm text-red-600">{booking.cancelReason}</p>
                    </div>
                )}

                <Link href={`/salon/${booking.salon?.salonId}`}>
                    <Button className="w-full bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-xl">
                        View Salon
                    </Button>
                </Link>
            </div>
        </main>
    );
}
