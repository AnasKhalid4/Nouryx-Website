"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { useBooking } from "@/hooks/use-bookings";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

const statusColors: Record<string, string> = {
    inprocess: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function BookingDetailPage() {
    const { t } = useLocale();
    const router = useRouter();
    const params = useParams();
    const { isLoggedIn } = useAuth();
    const bookingId = params.id as string;

    const { data: booking, isLoading } = useBooking(bookingId);

    if (!isLoggedIn) {
        router.push("/login");
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-40">
                <Loader2 className="h-10 w-10 animate-spin text-[#C9AA8B]" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-muted-foreground">
                <p className="mb-4">Booking not found.</p>
                <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    const startDate = new Date(booking.schedule?.startAt || Date.now());

    return (
        <main className="py-8 lg:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

                    <button
                        onClick={() => router.push("/bookings")}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Bookings
                    </button>

                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold text-foreground">
                            Order Details
                        </h1>
                        <Badge
                            variant="outline"
                            className={`px-3 py-1 text-xs uppercase tracking-wider ${statusColors[booking.status] || ""}`}
                        >
                            {booking.status}
                        </Badge>
                    </div>

                    <div className="space-y-6">

                        {/* Salon Info Card */}
                        <div className="bg-white rounded-2xl border border-border/50 p-6">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Salon Information</h2>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-xl bg-linear-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center shrink-0">
                                    <span className="text-[#C9AA8B] font-bold text-lg">
                                        {booking.salon?.shopName?.charAt(0) || "S"}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-lg">
                                        {booking.salon?.shopName || "Salon"}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm">{booking.salon?.address || booking.salon?.city || "Address not provided"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Card */}
                        <div className="bg-white rounded-2xl border border-border/50 p-6">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Schedule</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#F5EDE6] flex items-center justify-center text-[#C9AA8B] shrink-0">
                                        <CalendarDays className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Date</p>
                                        <p className="font-medium text-foreground">{startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#F5EDE6] flex items-center justify-center text-[#C9AA8B] shrink-0">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Time</p>
                                        <p className="font-medium text-foreground">{startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Services Card */}
                        <div className="bg-white rounded-2xl border border-border/50 p-6">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Services</h2>
                            <div className="space-y-4">
                                {booking.services.map((service, idx) => (
                                    <div key={idx} className="flex justify-between items-start pb-4 border-b border-border/50 last:pb-0 last:border-0">
                                        <div>
                                            <p className="font-medium text-foreground">{service.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{service.minutes} mins</p>
                                        </div>
                                        <p className="font-semibold text-foreground">
                                            {t.common.currency}{service.price}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Summary Card */}
                        <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white">
                            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Payment Summary</h2>

                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-white/80">Subtotal</span>
                                <span>{t.common.currency}{booking.pricing.total}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-white/80">Tax & Fees</span>
                                <span>{t.common.currency}0.00</span>
                            </div>

                            <div className="flex justify-between items-center pt-4 mt-2">
                                <span className="font-bold text-lg">Total Amount</span>
                                <span className="font-bold text-xl text-[#C9AA8B]">
                                    {t.common.currency}{booking.pricing.total}
                                </span>
                            </div>
                        </div>

                        {/* Cancel Reason (if applicable) */}
                        {booking.status === "cancelled" && booking.cancelReason && (
                            <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
                                <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-2">Cancellation Reason</h2>
                                <p className="text-red-700">{booking.cancelReason}</p>
                            </div>
                        )}

                        {/* Notes */}
                        {booking.notes && (
                            <div className="bg-white rounded-2xl border border-border/50 p-6">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Special Requests / Notes</h2>
                                <p className="text-foreground text-sm">{booking.notes}</p>
                            </div>
                        )}

                    </div>
                </div>
        </main>
    );
}
