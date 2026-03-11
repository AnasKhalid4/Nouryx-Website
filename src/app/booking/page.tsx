"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  Users,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Check,
} from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useBookingStore } from "@/stores/booking-store";
import { useAuth } from "@/hooks/use-auth";
import { useCreateBooking, useMemberBookedSlots } from "@/hooks/use-bookings";
import { useTeamMembers } from "@/hooks/use-team-members";
import { useWeeklySchedule } from "@/hooks/use-schedule";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import {
  generateBookingSlots,
  getWeekdayKey,
  isSlotPast,
  isSlotDisabled,
} from "@/lib/slot-utils";

type BookingStep = "team_member" | "date_time" | "summary";

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

export default function BookingPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { isLoggedIn, uid, user } = useAuth();
  const createBooking = useCreateBooking();

  const {
    salon,
    selectedServices,
    selectedTeamMember,
    selectedDate,
    selectedTime,
    notes,
    setTeamMember,
    setDate,
    setTime,
    setNotes,
    clearBooking,
    totalPrice,
    totalMinutes,
  } = useBookingStore();

  const salonId = salon?.uid;
  const { data: teamMembers, isLoading: membersLoading } = useTeamMembers(salonId);
  const { data: weeklySchedule } = useWeeklySchedule(salonId);

  const [step, setStep] = useState<BookingStep>("team_member");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const dateStr = useMemo(() => {
    if (!selectedDate) return undefined;
    const d = new Date(selectedDate);
    const yyyy = d.getFullYear().toString().padStart(4, "0");
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [selectedDate]);

  const { data: disabledSlots } = useMemberBookedSlots(salonId, selectedTeamMember?.id, dateStr);

  const eligibleMembers = useMemo(() => {
    if (!teamMembers || !selectedServices.length) return [];
    const selectedServiceIds = selectedServices.map((s) => s.id);
    return teamMembers.filter((member) =>
      selectedServiceIds.some((sid) => member.serviceIds.includes(sid))
    );
  }, [teamMembers, selectedServices]);

  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedTeamMember || !weeklySchedule) return [];
    const dateObj = new Date(selectedDate);
    const dayKey = getWeekdayKey(dateObj);
    const salonRanges = weeklySchedule.schedule[dayKey];
    const memberRanges = selectedTeamMember.schedule[dayKey];
    const duration = totalMinutes();
    return generateBookingSlots(salonRanges, memberRanges, duration);
  }, [selectedDate, selectedTeamMember, weeklySchedule, totalMinutes]);

  useEffect(() => {
    if (!salon || selectedServices.length === 0) {
      router.push("/");
    }
  }, [salon, selectedServices, router]);

  if (!salon || selectedServices.length === 0) {
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

  const handleConfirmBooking = async () => {
    if (!uid || !user || !selectedTeamMember || !selectedDate || !selectedTime) return;

    const startDate = new Date(selectedDate);
    const [h, m] = selectedTime.split(":").map(Number);
    startDate.setHours(h, m, 0, 0);

    const duration = totalMinutes();
    const endDate = new Date(startDate.getTime() + duration * 60000);
    const bookingId = `${uid}_${Date.now()}`;

    const bookingData = {
      bookingId,
      status: salon.autoAcceptBooking === 1 ? "inprocess" : "pending",
      salon: {
        salonId: salon.uid, shopName: salon.shopName, city: salon.city,
        address: salon.address, country: salon.country, lat: salon.lat,
        lng: salon.lng, placeId: salon.placeId,
        owner: {
          fullName: salon.owner.fullName, phoneNumber: salon.owner.phoneNumber,
          email: salon.owner.email, profileImage: salon.owner.profileImage,
        },
      },
      user: {
        userId: uid, fullName: user.profile?.fullName || "",
        phoneNumber: user.profile?.phoneNumber || "",
        profileImage: user.profile?.profileImage || "",
      },
      services: selectedServices.map((s) => ({
        serviceId: s.id, name: s.name, categoryId: s.categoryId,
        providerId: s.providerId, minutes: s.minutes, price: s.price,
      })),
      schedule: { startAt: startDate.toISOString(), endAt: endDate.toISOString(), durationMinutes: duration },
      pricing: { total: totalPrice(), currency: "EUR" },
      team_member: {
        memberId: selectedTeamMember.id, name: selectedTeamMember.name,
        image: selectedTeamMember.image, role: selectedTeamMember.role,
      },
      notes: notes || null,
    };

    try {
      await createBooking.mutateAsync({ bookingId, salonId: salon.uid, bookingData });
      toast.success(t.booking.bookingConfirmed);
      clearBooking();
      router.push("/user/bookings");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    }
  };

  // ── Confirmation Screen ──
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t.booking.bookingConfirmed}</h1>
          <p className="text-sm text-muted-foreground mb-1">
            Your appointment at <strong>{salon.shopName}</strong>
          </p>
          <p className="text-sm text-muted-foreground mb-1">
            with <strong>{selectedTeamMember?.name}</strong> has been
            {salon.autoAcceptBooking === 1 ? " accepted" : " submitted"}.
          </p>
          <p className="text-sm font-medium text-foreground mt-4 mb-8">
            {selectedDate && new Date(selectedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            {" · "}{selectedTime}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { clearBooking(); router.push("/"); }} className="rounded-xl h-10 px-6">
              {t.booking.goHome}
            </Button>
            <Button onClick={() => { clearBooking(); router.push("/bookings"); }} className="bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-xl h-10 px-6">
              {t.booking.viewBookings}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const calDays = generateCalendarDays(calYear, calMonth);
  const monthLabel = new Date(calYear, calMonth).toLocaleString("default", { month: "long", year: "numeric" });
  const stepIndex = ["team_member", "date_time", "summary"].indexOf(step);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-4 sm:px-6 lg:px-10 py-6 pb-16">

        {/* ── Step Progress ── */}
        <div className="flex items-center gap-1 mb-6 text-xs">
          {(["team_member", "date_time", "summary"] as BookingStep[]).map((s, i) => {
            const labels = [t.booking.specialist, t.booking.selectDate, t.common.confirm];
            const isActive = s === step;
            const isPast = stepIndex > i;
            return (
              <div key={s} className="flex items-center gap-1">
                {i > 0 && <span className="text-border mx-1">/</span>}
                <button
                  onClick={() => { if (i < stepIndex) setStep(s); }}
                  className={`font-medium transition-colors ${isActive
                    ? "text-[#C9AA8B]"
                    : isPast
                      ? "text-foreground hover:text-[#C9AA8B] cursor-pointer"
                      : "text-muted-foreground/50 cursor-default"
                    }`}
                >
                  {isPast && <Check className="inline h-3 w-3 mr-0.5" />}
                  {labels[i]}
                </button>
              </div>
            );
          })}
          <div className="ml-auto text-right text-xs text-muted-foreground hidden sm:block">
            <span className="font-medium text-foreground">{salon.shopName}</span>
            {" · "}{selectedServices.length} {t.booking.services.toLowerCase()} · {t.common.currency}{totalPrice()}
          </div>
        </div>

        <div className="h-px bg-border/40 mb-6" />

        {/* ═══ STEP 1: Team Member ═══ */}
        {step === "team_member" && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">{t.booking.selectSpecialist}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t.booking.chooseWhoHandles}
            </p>

            {membersLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-[#C9AA8B]" />
              </div>
            ) : eligibleMembers.length === 0 ? (
              <div className="py-16 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-foreground font-medium">{t.booking.noSpecialists}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.booking.noSpecialistsDesc}</p>
                <Button variant="outline" size="sm" className="mt-4 rounded-lg" onClick={() => router.back()}>
                  {t.common.cancel}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {eligibleMembers.map((member) => {
                  const isSelected = selectedTeamMember?.id === member.id;
                  return (
                    <button
                      key={member.id}
                      onClick={() => setTeamMember(member)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left ${isSelected
                        ? "border-[#C9AA8B] bg-[#C9AA8B]/5"
                        : "border-border/40 hover:border-[#C9AA8B]/40 bg-white"
                        }`}
                    >
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#E8D5C0] to-[#F5EDE6] ${isSelected ? "ring-2 ring-[#C9AA8B] ring-offset-1" : ""
                        }`}>
                        {member.image ? (
                          <Image src={member.image} alt={member.name} width={48} height={48} className="object-cover rounded-full" />
                        ) : (
                          <span className="text-lg font-bold text-[#B8956F]">{member.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "border-[#C9AA8B] bg-[#C9AA8B]" : "border-border"
                        }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button
                disabled={!selectedTeamMember}
                onClick={() => setStep("date_time")}
                className="bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-xl px-6 h-10"
              >
                {t.common.confirm}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Date & Time ═══ */}
        {step === "date_time" && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">{t.booking.selectDate}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {selectedTeamMember?.name}
              <button onClick={() => setStep("team_member")} className="ml-2 text-[#C9AA8B] hover:underline text-xs font-medium">
                {t.booking.change}
              </button>
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="bg-white rounded-xl border border-border/40 p-5">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                      else setCalMonth(calMonth - 1);
                    }}
                    className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-bold text-foreground">{monthLabel}</span>
                  <button
                    onClick={() => {
                      if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                      else setCalMonth(calMonth + 1);
                    }}
                    className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground/50 py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {calDays.map((day, i) => {
                    if (day === null) return <div key={`e${i}`} />;
                    const dateObj = new Date(calYear, calMonth, day);
                    const isPastDay = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const isoStr = dateObj.toISOString();
                    const isChosen = selectedDate === isoStr;
                    const isToday = dateObj.toDateString() === today.toDateString();

                    const dayKey = getWeekdayKey(dateObj);
                    const salonRanges = weeklySchedule?.schedule[dayKey];
                    const memberRanges = selectedTeamMember?.schedule[dayKey];
                    const isClosed =
                      !salonRanges || salonRanges.length === 0 || salonRanges[0]?.start === "closed" ||
                      !memberRanges || memberRanges.length === 0 || memberRanges[0]?.start === "closed";
                    const isDisabled = isPastDay || isClosed;

                    return (
                      <button
                        key={day}
                        disabled={isDisabled}
                        onClick={() => setDate(isoStr)}
                        className={`h-9 rounded-lg text-sm font-medium transition-colors ${isChosen
                          ? "bg-[#C9AA8B] text-white"
                          : isDisabled
                            ? "text-muted-foreground/20 cursor-not-allowed"
                            : isToday
                              ? "text-[#C9AA8B] font-bold hover:bg-[#C9AA8B]/10"
                              : "text-foreground hover:bg-muted/60"
                          }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="bg-white rounded-xl border border-border/40 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#C9AA8B]" />
                    {t.booking.availableTimes}
                  </h3>
                  {selectedDate && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>

                {!selectedDate ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground/15 mb-2" />
                    <p className="text-xs text-muted-foreground">{t.booking.selectDateFirst}</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/15 mb-2" />
                    <p className="text-xs text-muted-foreground">{t.booking.noSlots}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
                    {availableSlots.map((slot) => {
                      const dateObj = new Date(selectedDate);
                      const past = isSlotPast(dateObj, slot);
                      const disabled = past || isSlotDisabled(slot, totalMinutes(), disabledSlots || {});
                      const isChosen = selectedTime === slot;

                      return (
                        <button
                          key={slot}
                          disabled={disabled}
                          onClick={() => setTime(slot)}
                          className={`py-2 rounded-lg text-sm font-medium transition-colors ${isChosen
                            ? "bg-[#C9AA8B] text-white"
                            : disabled
                              ? "bg-muted/20 text-muted-foreground/25 cursor-not-allowed line-through"
                              : "bg-muted/30 text-foreground hover:bg-[#C9AA8B]/10 hover:text-[#B8956F]"
                            }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep("team_member")} className="rounded-xl h-10">
                <ChevronLeft className="h-4 w-4 mr-1" /> {t.common.cancel}
              </Button>
              <Button
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep("summary")}
                className="bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-xl px-6 h-10"
              >
                {t.common.confirm} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Summary ═══ */}
        {step === "summary" && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-foreground text-center mb-1">{t.booking.summary}</h2>
            <p className="text-sm text-muted-foreground text-center mb-5">{t.booking.summaryDesc}</p>

            <div className="bg-white rounded-xl border border-border/40 divide-y divide-border/30">
              {/* Salon */}
              <div className="px-5 py-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#B8956F]">{salon.shopName.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{salon.shopName}</p>
                  <p className="text-xs text-muted-foreground truncate">{salon.address || salon.city}</p>
                </div>
              </div>

              {/* Specialist */}
              <div className="px-5 py-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedTeamMember?.image ? (
                    <Image src={selectedTeamMember.image} alt={selectedTeamMember.name} width={40} height={40} className="object-cover rounded-full" />
                  ) : (
                    <span className="text-sm font-bold text-[#B8956F]">{selectedTeamMember?.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.booking.specialist}</p>
                  <p className="text-sm font-semibold text-foreground">{selectedTeamMember?.name}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="px-5 py-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{t.booking.date}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedDate && new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{t.booking.time}</p>
                  <p className="text-sm font-semibold text-foreground">{selectedTime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{t.booking.duration}</p>
                  <p className="text-sm font-semibold text-foreground">{totalMinutes()} min</p>
                </div>
              </div>

              {/* Services */}
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground mb-2">{t.booking.services}</p>
                <div className="space-y-1.5">
                  {selectedServices.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{s.name}</span>
                      <span className="font-medium text-foreground">{t.common.currency}{s.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground mb-1.5">{t.booking.notes}</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.booking.notesPlaceholder}
                  className="w-full rounded-lg border border-border/40 bg-[#FDFBF9] p-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-[#C9AA8B] transition-colors"
                />
              </div>

              {/* Total */}
              <div className="px-5 py-4 flex items-center justify-between bg-[#FDFBF9]">
                <span className="text-sm font-bold text-foreground">{t.booking.total}</span>
                <span className="text-lg font-bold text-foreground">{t.common.currency}{totalPrice()}</span>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep("date_time")} className="rounded-xl h-10">
                <ChevronLeft className="h-4 w-4 mr-1" /> {t.common.cancel}
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={createBooking.isPending}
                className="bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-xl px-6 h-10 font-semibold"
              >
                {createBooking.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                {t.booking.confirm}
              </Button>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}