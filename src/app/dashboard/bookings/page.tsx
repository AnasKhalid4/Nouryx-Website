"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List, ChevronLeft, ChevronRight, Clock, User, Check, X, Eye, Loader2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { useSalonBookings, useAcceptBooking, useCompleteBooking, useCancelBooking } from "@/hooks/use-bookings";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import type { BookingModel } from "@/types/booking";

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const statusBadgeColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  inprocess: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

// Vibrant color palette for calendar blocks
const blockColors = [
  { bg: "bg-blue-300", text: "text-blue-900" },
  { bg: "bg-amber-300", text: "text-amber-900" },
  { bg: "bg-pink-300", text: "text-pink-900" },
  { bg: "bg-emerald-300", text: "text-emerald-900" },
  { bg: "bg-orange-300", text: "text-orange-900" },
  { bg: "bg-cyan-300", text: "text-cyan-900" },
  { bg: "bg-purple-300", text: "text-purple-900" },
  { bg: "bg-rose-300", text: "text-rose-900" },
];

export default function DashboardBookingsPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { data: bookings, isLoading } = useSalonBookings();
  const acceptBooking = useAcceptBooking();
  const completeBooking = useCompleteBooking();
  const cancelBooking = useCancelBooking();

  const salonName = user?.salon?.shopName || "Salon";
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [listTab, setListTab] = useState("pending");

  // Calendar date navigation
  const [calDate, setCalDate] = useState(new Date());
  const dateStr = calDate.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const goToday = () => setCalDate(new Date());
  const goPrev = () => setCalDate((d) => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const goNext = () => setCalDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });

  // Filter bookings for the selected calendar date
  const calDateKey = `${calDate.getFullYear()}-${String(calDate.getMonth() + 1).padStart(2, "0")}-${String(calDate.getDate()).padStart(2, "0")}`;

  const dayBookings = useMemo(() => {
    return (bookings || []).filter((b) => {
      try {
        const d = new Date(b.schedule.startAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return key === calDateKey;
      } catch { return false; }
    });
  }, [bookings, calDateKey]);

  // Map bookings to calendar slot positions
  const calendarBlocks = useMemo(() => {
    return dayBookings.map((booking, idx) => {
      try {
        const start = new Date(booking.schedule.startAt);
        const startHour = start.getHours();
        const startMinute = start.getMinutes();
        const slotIdx = timeSlots.findIndex((s) => parseInt(s) === startHour);
        const actualSlot = slotIdx >= 0 ? slotIdx : 0;
        const minuteOffset = startMinute / 60; // fraction of slot
        const durationHours = booking.schedule.durationMinutes / 60;

        return {
          booking,
          startSlot: actualSlot,
          minuteOffset,
          duration: durationHours,
          colorIdx: idx % blockColors.length,
        };
      } catch {
        return null;
      }
    }).filter(Boolean) as {
      booking: BookingModel;
      startSlot: number;
      minuteOffset: number;
      duration: number;
      colorIdx: number;
    }[];
  }, [dayBookings]);

  // List view filters
  const pending = (bookings || []).filter((b) => b.status === "pending");
  const inprocess = (bookings || []).filter((b) => b.status === "inprocess");
  const completed = (bookings || []).filter((b) => b.status === "completed");
  const cancelled = (bookings || []).filter((b) => b.status === "cancelled");

  const listData: Record<string, BookingModel[]> = { pending, inprocess, completed, cancelled };

  const handleAccept = (bookingId: string, userId: string) => {
    acceptBooking.mutate(
      { bookingId, userId, salonName },
      { onSuccess: () => toast.success("Booking accepted") }
    );
  };

  const handleComplete = (bookingId: string, userId: string) => {
    completeBooking.mutate(
      { bookingId, userId, salonName },
      { onSuccess: () => toast.success("Booking completed") }
    );
  };

  const handleCancel = (bookingId: string, userId: string) => {
    cancelBooking.mutate(
      { bookingId, reason: "Cancelled by salon", receiverId: userId, salonName },
      { onSuccess: () => toast.success("Booking cancelled") }
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">{t.dashboard.bookings.title}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("calendar")}
            className={`rounded-lg gap-1.5 text-xs ${view === "calendar" ? "bg-[#C9AA8B] hover:bg-[#B8956F] text-white" : ""}`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {t.dashboard.bookings.calendarView}
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
            className={`rounded-lg gap-1.5 text-xs ${view === "list" ? "bg-[#C9AA8B] hover:bg-[#B8956F] text-white" : ""}`}
          >
            <List className="h-3.5 w-3.5" />
            {t.dashboard.bookings.listView}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#C9AA8B]" />
        </div>
      ) : (
        <>
          {/* CALENDAR VIEW — Fresha-style time grid */}
          {view === "calendar" && (
            <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="rounded-lg text-xs px-3" onClick={goToday}>
                    {t.dashboard.bookings.today}
                  </Button>
                  <div className="flex items-center gap-1">
                    <button onClick={goPrev} className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={goNext} className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm font-medium text-foreground">{dateStr}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Time Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[600px] relative">
                  {timeSlots.map((time, slotIdx) => (
                    <div key={time} className="flex border-b border-border/20" style={{ height: "80px" }}>
                      {/* Time label */}
                      <div className="w-16 shrink-0 py-1 px-2 text-[11px] text-muted-foreground text-right">
                        {time}
                      </div>
                      {/* Appointment area */}
                      <div className="flex-1 relative border-l border-border/30">
                        {calendarBlocks
                          .filter((block) => block.startSlot === slotIdx)
                          .map((block, i) => {
                            const color = blockColors[block.colorIdx];
                            const heightPx = block.duration * 80;
                            const topOffset = block.minuteOffset * 80;
                            const startTime = new Date(block.booking.schedule.startAt);
                            const endTime = new Date(startTime.getTime() + block.booking.schedule.durationMinutes * 60000);
                            const startStr = startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            const endStr = endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                            // Offset overlapping blocks horizontally
                            const totalInSlot = calendarBlocks.filter((b) => b.startSlot === slotIdx).length;
                            const widthPercent = totalInSlot > 1 ? `${100 / totalInSlot}%` : "100%";
                            const leftPercent = totalInSlot > 1 ? `${(i * 100) / totalInSlot}%` : "0%";

                            return (
                              <div
                                key={block.booking.bookingId}
                                className={`absolute ${color.bg} rounded-lg p-2 cursor-pointer hover:opacity-90 transition-opacity z-10 overflow-hidden`}
                                style={{
                                  height: `${Math.max(heightPx - 8, 32)}px`,
                                  top: `${topOffset + 4}px`,
                                  left: leftPercent,
                                  width: widthPercent,
                                  paddingRight: "4px",
                                  paddingLeft: "8px",
                                }}
                              >
                                <p className={`text-[10px] font-semibold ${color.text}`}>
                                  {startStr} – {endStr}
                                </p>
                                <p className={`text-xs font-bold ${color.text} mt-0.5 truncate`}>
                                  {block.booking.user.fullName}
                                </p>
                                <p className={`text-[10px] ${color.text} opacity-80 truncate`}>
                                  {block.booking.services.map((s) => s.name).join(", ")}
                                </p>
                                {block.booking.status === "pending" && (
                                  <span className="text-[9px] bg-white/50 rounded px-1 mt-0.5 inline-block font-medium">
                                    ⏳ Pending
                                  </span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Empty state */}
              {dayBookings.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-sm">No bookings on this day</p>
                  <p className="text-xs text-muted-foreground mt-1">Use the arrows to navigate to other days</p>
                </div>
              )}
            </div>
          )}

          {/* LIST VIEW */}
          {view === "list" && (
            <div>
              <Tabs value={listTab} onValueChange={setListTab}>
                <TabsList className="bg-white border border-border/50 rounded-xl p-1 w-full">
                  <TabsTrigger value="pending" className="flex-1 rounded-lg text-xs data-[state=active]:bg-[#C9AA8B] data-[state=active]:text-white">
                    {t.dashboard.bookings.tabs.pending} ({pending.length})
                  </TabsTrigger>
                  <TabsTrigger value="inprocess" className="flex-1 rounded-lg text-xs data-[state=active]:bg-[#C9AA8B] data-[state=active]:text-white">
                    {t.dashboard.bookings.tabs.inprocess} ({inprocess.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1 rounded-lg text-xs data-[state=active]:bg-[#C9AA8B] data-[state=active]:text-white">
                    {t.dashboard.bookings.tabs.completed} ({completed.length})
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="flex-1 rounded-lg text-xs data-[state=active]:bg-[#C9AA8B] data-[state=active]:text-white">
                    {t.dashboard.bookings.tabs.cancelled} ({cancelled.length})
                  </TabsTrigger>
                </TabsList>

                {["pending", "inprocess", "completed", "cancelled"].map((status) => (
                  <TabsContent key={status} value={status} className="mt-4 space-y-3">
                    {(listData[status] || []).length > 0 ? (
                      (listData[status] || []).map((booking) => (
                        <div key={booking.bookingId} className="bg-white rounded-xl border border-border/50 p-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="h-12 w-12 rounded-full bg-[#E8D5C0] flex items-center justify-center shrink-0">
                              <User className="h-5 w-5 text-[#8B7355]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-sm text-foreground">{booking.user.fullName}</h3>
                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <CalendarDays className="h-3 w-3" />
                                      {new Date(booking.schedule.startAt).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {new Date(booking.schedule.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </div>
                                </div>
                                <Badge variant="outline" className={`text-[10px] ${statusBadgeColors[booking.status]}`}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-2 md:mt-3">
                                {booking.services.map((s, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 bg-[#F5EDE6] text-[#8B7355] rounded-full">
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-3 border-t border-border/50 gap-3">
                            <span className="font-semibold text-sm self-start sm:self-auto">{t.common.currency}{booking.pricing.total}</span>
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                              {status === "pending" && (
                                <>
                                  <Button size="sm" className="text-xs rounded-lg h-7 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none justify-center"
                                    onClick={() => handleAccept(booking.bookingId, booking.user.userId)} disabled={acceptBooking.isPending}>
                                    <Check className="h-3 w-3" />
                                    {t.dashboard.bookings.accept}
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-xs rounded-lg h-7 gap-1 text-destructive border-destructive/30 flex-1 sm:flex-none justify-center"
                                    onClick={() => handleCancel(booking.bookingId, booking.user.userId)} disabled={cancelBooking.isPending}>
                                    <X className="h-3 w-3" />
                                    {t.dashboard.bookings.decline}
                                  </Button>
                                </>
                              )}
                              {status === "inprocess" && (
                                <>
                                  <Button size="sm" className="text-xs rounded-lg h-7 gap-1 bg-[#C9AA8B] hover:bg-[#B8956F] text-white flex-1 sm:flex-none justify-center"
                                    onClick={() => handleComplete(booking.bookingId, booking.user.userId)} disabled={completeBooking.isPending}>
                                    <Check className="h-3 w-3" />
                                    {t.dashboard.bookings.complete}
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-xs rounded-lg h-7 text-destructive border-destructive/30 flex-1 sm:flex-none justify-center"
                                    onClick={() => handleCancel(booking.bookingId, booking.user.userId)} disabled={cancelBooking.isPending}>
                                    {t.dashboard.bookings.cancel}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <p className="text-muted-foreground text-sm">{t.common.noResults}</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </>
      )}
    </div>
  );
}
