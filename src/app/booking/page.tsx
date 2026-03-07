"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { useBookingStore } from "@/stores/booking-store";
import { useCreateBooking } from "@/hooks/use-bookings";
import { fetchBookedSlots } from "@/lib/firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, BellRing } from "lucide-react";

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const DAY_HEADERS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function getDaysInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const days: (number | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function formatMonthYear(year: number, month: number) {
  return new Date(year, month)
    .toLocaleString("default", { month: "long", year: "numeric" })
    .toUpperCase();
}

export default function BookingPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { uid, user } = useAuth();
  const createBooking = useCreateBooking();

  const {
    salon,
    selectedServices,
    selectedDate,
    selectedTime,
    notes,
    setDate,
    setTime,
    setNotes,
    clearBooking,
    totalPrice,
    totalMinutes,
  } = useBookingStore();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [localTime, setLocalTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notifyPopup, setNotifyPopup] = useState<string | null>(null);

  const days = getDaysInMonth(year, month);

  const isPast = (d: number) => {
    const date = new Date(year, month, d);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return date < t;
  };

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null); setLocalTime(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null); setLocalTime(null);
  };

  const toLocalDateStr = (y: number, m: number, d: number) => {
    const yy = y.toString().padStart(4, "0");
    const mm = (m + 1).toString().padStart(2, "0");
    const dd = d.toString().padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };

  const handleDaySelect = (day: number) => {
    const newDay = day === selectedDay ? null : day;
    setSelectedDay(newDay);
    setLocalTime(null);
    if (newDay) {
      const dateStr = toLocalDateStr(year, month, newDay);
      setDate(dateStr);
    }
  };

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!selectedDay || !salon?.uid) {
      setBookedSlots([]);
      return;
    }
    const dateStr = toLocalDateStr(year, month, selectedDay);
    setLoadingSlots(true);
    fetchBookedSlots(salon.uid, dateStr)
      .then(setBookedSlots)
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDay, year, month, salon?.uid]);

  const handleTimeSelect = (slot: string) => {
    const newTime = slot === localTime ? null : slot;
    setLocalTime(newTime);
    if (newTime) setTime(newTime);
  };

  const monthName = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });
  const selectedLabel = selectedDay
    ? new Date(year, month, selectedDay)
      .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      .toUpperCase()
    : null;

  const price = totalPrice();
  const duration = totalMinutes();

  // If no salon or services selected, redirect back
  if (!salon || selectedServices.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4">
          <p className="text-lg font-medium text-foreground mb-2">No services selected</p>
          <p className="text-sm text-muted-foreground mb-6">Please select services from a salon first.</p>
          <button
            onClick={() => router.push("/salons")}
            className="px-6 py-3 bg-[#C9AA8B] text-white rounded-lg font-medium hover:bg-[#B8956F] transition-colors"
          >
            Browse Salons
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const handleConfirm = async () => {
    if (!selectedDay || !localTime || !uid || !user || !salon) return;

    const dateStr = toLocalDateStr(year, month, selectedDay);
    const startAt = `${dateStr}T${localTime}:00`;
    const endMinutes = duration;
    const startDate = new Date(startAt);
    const endDate = new Date(startDate.getTime() + endMinutes * 60 * 1000);
    const endAt = endDate.toISOString();

    const bookingId = `bk_${Date.now()}_${uid.slice(0, 6)}`;

    // Check autoAcceptBooking
    const autoAccept = salon.autoAcceptBooking === 1;

    setIsSubmitting(true);

    try {
      await createBooking.mutateAsync({
        bookingId,
        salonId: salon.uid,
        bookingData: {
          bookingId,
          status: autoAccept ? "inprocess" : "pending",
          salon: {
            salonId: salon.uid,
            shopName: salon.shopName,
            city: salon.city || "",
            address: salon.address || "",
            country: salon.country || "",
            lat: salon.lat || 0,
            lng: salon.lng || 0,
            placeId: salon.placeId || "",
            owner: {
              fullName: salon.owner?.fullName || "",
              phoneNumber: salon.owner?.phoneNumber || "",
              email: salon.owner?.email || "",
              profileImage: salon.owner?.profileImage || "",
            },
          },
          user: {
            userId: uid,
            fullName: user.profile.fullName,
            phoneNumber: user.profile.phoneNumber,
            profileImage: user.profile.profileImage || "",
          },
          services: selectedServices.map((s) => ({
            serviceId: s.id,
            name: s.name,
            categoryId: s.categoryId,
            providerId: s.providerId,
            minutes: s.minutes,
            price: s.price,
          })),
          schedule: {
            startAt,
            endAt,
            durationMinutes: duration,
          },
          pricing: {
            total: price,
            currency: "EUR",
          },
          notes: notes || null,
          review: null,
          createdAt: new Date().toISOString(),
        },
      });

      toast.success(autoAccept ? "Booking confirmed!" : "Booking submitted! Waiting for salon confirmation.");
      clearBooking();
      router.push("/bookings");
    } catch (err) {
      console.error("Booking failed:", err);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-[#FAF8F5] px-3 py-6 sm:px-4 sm:py-8">
        <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-in { animation: slideDown 0.25s ease forwards; }
      `}</style>

        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 lg:gap-6 items-start">

          {/* ── LEFT: Calendar + time slots ── */}
          <div>
            <div className="border border-[#EDE7DF] bg-white overflow-hidden">

              {/* Month header */}
              <div className="bg-[#C9AA8B] flex items-center justify-between px-4 sm:px-6 py-3">
                <button
                  onClick={prevMonth}
                  className="text-white/80 hover:text-white transition-colors text-lg px-2 leading-none bg-transparent border-none cursor-pointer"
                >
                  ←
                </button>
                <span className="text-white font-semibold text-[11px] sm:text-sm tracking-widest">
                  {formatMonthYear(year, month)}
                </span>
                <button
                  onClick={nextMonth}
                  className="text-white/80 hover:text-white transition-colors text-lg px-2 leading-none bg-transparent border-none cursor-pointer"
                >
                  →
                </button>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 border-b border-[#EDE7DF]">
                {DAY_HEADERS.map((d) => (
                  <div
                    key={d}
                    className="text-center py-2 text-[9px] sm:text-[11px] font-semibold tracking-wider text-[#AAAAAA] border-r border-[#EDE7DF] last:border-r-0"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7">
                {days.map((day, i) => {
                  const isLastCol = i % 7 === 6;
                  const cellBorder = `border-b border-[#EDE7DF]${!isLastCol ? " border-r" : ""}`;

                  if (!day) {
                    return (
                      <div key={i} className={`h-10 sm:h-12 md:h-15 ${cellBorder}`} />
                    );
                  }

                  const past = isPast(day);
                  const sel = selectedDay === day;
                  const tod = isToday(day);

                  return (
                    <div key={i} className={cellBorder}>
                      <button
                        disabled={past}
                        onClick={() => handleDaySelect(day)}
                        className={[
                          "w-full h-10 sm:h-12 md:h-15 flex items-start justify-start px-1.5 sm:px-2.5 pt-1.5 sm:pt-2 text-xs sm:text-sm transition-colors",
                          past
                            ? "text-[#CCCCCC] cursor-not-allowed"
                            : sel
                              ? "bg-[#E8C4B0] text-white font-semibold"
                              : tod
                                ? "text-[#C9AA8B] font-bold hover:bg-[#F5EDE6]"
                                : "text-[#555555] hover:bg-[#F5EDE6]",
                        ].join(" ")}
                      >
                        {day}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time slots panel — revealed on date select */}
            {selectedDay && (
              <div className="slide-in border-x-2 border-b-2 border-[#E8C4B0] bg-white">

                {/* Panel heading */}
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-[#F0EBE4] flex items-center justify-between">
                  <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#999999] uppercase m-0">
                    {t.booking.selectTime} — {selectedLabel}
                  </p>
                  {loadingSlots && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C9AA8B]" />}
                </div>

                {/* Time buttons */}
                <div className="p-3 sm:p-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 sm:gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isTodaySelected = selectedDay !== null && isToday(selectedDay);
                    const slotHour = parseInt(slot.split(":")[0]);
                    const now = new Date();
                    const isPastSlot = isTodaySelected && slotHour <= now.getHours();
                    const isBooked = bookedSlots.includes(slot);

                    return (
                      <button
                        key={slot}
                        disabled={isPastSlot}
                        onClick={() => {
                          if (isBooked) {
                            setNotifyPopup(slot);
                          } else {
                            handleTimeSelect(slot);
                          }
                        }}
                        className={[
                          "py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-center border transition-all relative",
                          isPastSlot
                            ? "bg-[#F5F5F5] border-[#EDE7DF] text-[#CCCCCC] cursor-not-allowed line-through"
                            : isBooked
                              ? "bg-red-50 border-red-200 text-red-400 cursor-pointer"
                              : localTime === slot
                                ? "bg-[#E8C4B0] border-[#E8C4B0] text-white font-semibold"
                                : "bg-white border-[#EDE7DF] text-[#444444] hover:bg-[#F5EDE6] hover:border-[#C9AA8B]",
                        ].join(" ")}
                      >
                        {isBooked ? `🔒 ${slot}` : slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Summary ── */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white border border-[#EDE7DF] p-5 sm:p-6 shadow-sm">

              <p className="text-sm font-semibold text-[#999] uppercase tracking-wider mb-1">{salon.shopName}</p>
              <p className="text-base font-bold text-[#222222] mb-4">{t.booking.summary}</p>

              {/* Services */}
              {selectedServices.map((s) => (
                <div key={s.id} className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-medium text-[#333333] m-0">{s.name}</p>
                    <p className="text-xs text-[#AAAAAA] mt-0.5 m-0">{s.minutes} min</p>
                  </div>
                  <span className="text-sm font-semibold text-[#333333]">€{s.price}</span>
                </div>
              ))}

              <div className="border-t border-[#EDE7DF] my-4" />

              {/* Date / Time / Duration */}
              {[
                { icon: "📅", label: t.booking.date, value: selectedDay ? `${selectedDay} ${monthName}` : "—" },
                { icon: "🕐", label: t.booking.time, value: localTime || "—" },
                { icon: "⏱", label: t.booking.duration, value: `${duration} min` },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex justify-between items-center mb-2.5">
                  <span className="text-xs text-[#999999] flex items-center gap-1">
                    {icon} {label}
                  </span>
                  <span className="text-xs font-medium text-[#333333]">{value}</span>
                </div>
              ))}

              {/* Notes */}
              <div className="mt-3">
                <textarea
                  placeholder="Add notes for the salon (optional)"
                  className="w-full border border-[#EDE7DF] rounded-lg p-3 text-sm resize-none h-20 focus:outline-none focus:border-[#C9AA8B]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="border-t border-[#EDE7DF] my-4" />

              {/* Total */}
              <div className="flex justify-between items-center mb-5">
                <span className="text-sm font-bold text-[#222222]">{t.booking.total}</span>
                <span className="text-2xl font-bold text-[#222222]">€{price}</span>
              </div>

              {/* Confirm button */}
              <button
                disabled={!selectedDay || !localTime || isSubmitting}
                onClick={handleConfirm}
                className="w-full py-3.5 text-sm font-bold tracking-wide bg-[#333333] text-white transition-colors hover:bg-[#111111] disabled:bg-[#CCCCCC] disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>✓ {t.booking.confirm}</>
                )}
              </button>

              <p className="text-[10px] text-[#BBBBBB] text-center mt-2.5">
                {t.booking.freeCancellation}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Notify Me Popup for booked slots */}
      <Dialog open={!!notifyPopup} onOpenChange={() => setNotifyPopup(null)}>
        <DialogContent className="sm:max-w-sm w-[90vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-red-500">🔒</span> Slot Unavailable
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-muted-foreground mb-1">
              The <span className="font-semibold text-foreground">{notifyPopup}</span> slot on{" "}
              <span className="font-semibold text-foreground">{selectedLabel}</span> is already booked.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Would you like to be notified if this slot becomes available?
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setNotifyPopup(null)}
              className="flex-1 rounded-lg h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success(`We'll notify you if ${notifyPopup} becomes available!`);
                setNotifyPopup(null);
              }}
              className="flex-1 bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-lg h-10 gap-1.5"
            >
              <BellRing className="h-3.5 w-3.5" />
              Notify Me
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}