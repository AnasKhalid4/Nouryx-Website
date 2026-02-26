"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List, ChevronLeft, ChevronRight, Clock, User, Check, X, Eye } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { mockBookings } from "@/data/mock-salons";
import { useState } from "react";

const timeSlots = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

const statusBadgeColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  inprocess: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

// Vibrant color palette for calendar blocks (matching the screenshot)
const blockColors = [
  { bg: "bg-blue-300", text: "text-blue-900" },
  { bg: "bg-amber-300", text: "text-amber-900" },
  { bg: "bg-pink-300", text: "text-pink-900" },
  { bg: "bg-emerald-300", text: "text-emerald-900" },
  { bg: "bg-orange-300", text: "text-orange-900" },
  { bg: "bg-cyan-300", text: "text-cyan-900" },
];

// Staff columns
const staffMembers = ["Sophie", "Rachel", "Alice", "Anna", "Marie", "Julie"];

// Colorful calendar appointments matching screenshot style
const calendarAppointments = [
  { startSlot: 0, duration: 2, client: "Brenda Massey", service: "Blow Dry", col: 0, colorIdx: 0 },
  { startSlot: 0, duration: 2, client: "Alena Geidt", service: "Hair cut", col: 1, colorIdx: 1 },
  { startSlot: 1, duration: 2, client: "James Herwitz", service: "Balinese Massage", col: 3, colorIdx: 2 },
  { startSlot: 2, duration: 1, client: "Phillip Dorwart", service: "Beard Grooming", col: 2, colorIdx: 2 },
  { startSlot: 2, duration: 2, client: "Craig Mango", service: "Yoga session", col: 0, colorIdx: 1 },
  { startSlot: 2, duration: 4, client: "Amy Jones", service: "Haircut and colour", col: 3, colorIdx: 3 },
  { startSlot: 2, duration: 2, client: "Megan White", service: "Hair cut", col: 5, colorIdx: 4 },
  { startSlot: 3, duration: 1, client: "Marilyn Carder", service: "Hair and Beard Cut", col: 1, colorIdx: 3 },
  { startSlot: 4, duration: 2, client: "Zain Dias", service: "Hair Coloring", col: 0, colorIdx: 0 },
  { startSlot: 5, duration: 2, client: "Desirae Stanton", service: "Blow Dry", col: 2, colorIdx: 0 },
  { startSlot: 5, duration: 2, client: "Alena Dias", service: "Haircut and colour", col: 3, colorIdx: 3 },
  { startSlot: 5, duration: 2, client: "Randy Press", service: "Swedish Massage", col: 5, colorIdx: 2 },
  { startSlot: 7, duration: 3, client: "Mary Lee Fisher", service: "Hair Coloring", col: 0, colorIdx: 1 },
];

export default function DashboardBookingsPage() {
  const { t } = useLocale();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [listTab, setListTab] = useState("pending");

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const pending = mockBookings.filter((b) => b.status === "pending");
  const inprocess = mockBookings.filter((b) => b.status === "inprocess");
  const completed = mockBookings.filter((b) => b.status === "completed");
  const cancelled = mockBookings.filter((b) => b.status === "cancelled");

  const listData: Record<string, typeof mockBookings> = { pending, inprocess, completed, cancelled };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t.dashboard.bookings.title}</h1>
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

      {/* CALENDAR VIEW — Colorful grid like Fresha */}
      {view === "calendar" && (
        <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="rounded-lg text-xs px-3">
                {t.dashboard.bookings.today}
              </Button>
              <div className="flex items-center gap-1">
                <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm font-medium text-foreground">{dateStr}</span>
            </div>
          </div>

          {/* Staff header row */}
          <div className="flex border-b border-border/50">
            <div className="w-16 shrink-0" />
            {staffMembers.map((name) => (
              <div key={name} className="flex-1 text-center py-2 border-l border-border/30">
                <span className="text-xs font-medium text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>

          {/* Time Grid with positioned blocks */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px] relative">
              {timeSlots.map((time, slotIdx) => (
                <div key={time} className="flex border-b border-border/20" style={{ height: "80px" }}>
                  {/* Time label */}
                  <div className="w-16 shrink-0 py-1 px-2 text-[11px] text-muted-foreground text-right">
                    {time}
                  </div>
                  {/* Staff columns */}
                  {staffMembers.map((_, colIdx) => {
                    const apt = calendarAppointments.find(
                      (a) => a.col === colIdx && a.startSlot === slotIdx
                    );
                    return (
                      <div key={colIdx} className="flex-1 border-l border-border/20 relative">
                        {apt && (() => {
                          const color = blockColors[apt.colorIdx % blockColors.length];
                          const heightPx = apt.duration * 80;
                          const startTime = timeSlots[apt.startSlot];
                          const endHour = parseInt(startTime) + Math.floor(apt.duration);
                          const endMin = (apt.duration % 1) * 60;
                          const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin || 0).padStart(2, "0")}`;
                          return (
                            <div
                              className={`absolute inset-x-1 top-1 ${color.bg} rounded-lg p-2 cursor-pointer hover:opacity-90 transition-opacity z-10 overflow-hidden`}
                              style={{ height: `${heightPx - 8}px` }}
                            >
                              <p className={`text-[10px] font-semibold ${color.text}`}>
                                {startTime} – {endTime}
                              </p>
                              <p className={`text-xs font-bold ${color.text} mt-0.5 truncate`}>
                                {apt.client}
                              </p>
                              <p className={`text-[10px] ${color.text} opacity-80 truncate`}>
                                {apt.service}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
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
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-[#E8D5C0] flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-[#8B7355]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-sm text-foreground">{booking.user.fullName}</h3>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
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
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {booking.services.map((s, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-[#F5EDE6] text-[#8B7355] rounded-full">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <span className="font-semibold text-sm">{t.common.currency}{booking.pricing.total}</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-xs rounded-lg h-7 gap-1">
                            <Eye className="h-3 w-3" />
                            {t.dashboard.bookings.viewDetails}
                          </Button>
                          {status === "pending" && (
                            <>
                              <Button size="sm" className="text-xs rounded-lg h-7 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Check className="h-3 w-3" />
                                {t.dashboard.bookings.accept}
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs rounded-lg h-7 gap-1 text-destructive border-destructive/30">
                                <X className="h-3 w-3" />
                                {t.dashboard.bookings.decline}
                              </Button>
                            </>
                          )}
                          {status === "inprocess" && (
                            <>
                              <Button size="sm" className="text-xs rounded-lg h-7 gap-1 bg-[#C9AA8B] hover:bg-[#B8956F] text-white">
                                <Check className="h-3 w-3" />
                                {t.dashboard.bookings.complete}
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs rounded-lg h-7 text-destructive border-destructive/30">
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
    </div>
  );
}
