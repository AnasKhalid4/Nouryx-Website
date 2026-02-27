"use client";

import { CalendarDays, TrendingUp, Star, DollarSign, Clock, User } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { mockBookings } from "@/data/mock-salons";
import Link from "next/link";

export default function DashboardHomePage() {
  const { t } = useLocale();

  const stats = [
    { label: t.dashboard.stats.totalOrders, value: "1,240", icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
    { label: t.dashboard.stats.completed, value: "1,180", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { label: t.dashboard.stats.rating, value: "4.9", icon: Star, color: "text-amber-600 bg-amber-50" },
    { label: t.dashboard.stats.earnings, value: "€52,400", icon: DollarSign, color: "text-[#C9AA8B] bg-[#C9AA8B]/10" },
  ];

  const todayBookings = mockBookings.filter((b) => b.status === "inprocess").slice(0, 4);

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          {t.dashboard.welcome}, Marie 👋
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your salon today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8 md:mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl md:rounded-2xl border border-border/50 p-4 md:p-6">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className={`h-8 w-8 md:h-10 md:w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Today's Bookings */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-border/50 p-4 md:p-6">
        <div className="flex flex-row items-center justify-between mb-4 gap-2">
          <h2 className="font-semibold text-foreground">{t.dashboard.todayBookings}</h2>
          <Link href="/dashboard/bookings" className="text-xs text-[#C9AA8B] hover:text-[#B8956F] font-medium">
            {t.common.viewAll}
          </Link>
        </div>

        {todayBookings.length > 0 ? (
          <div className="space-y-3">
            {todayBookings.map((booking) => (
              <div key={booking.bookingId} className="flex items-center gap-3 p-3 rounded-lg bg-[#FAFAF8]">
                <div className="h-10 w-10 rounded-full bg-[#E8D5C0] flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-[#8B7355]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {booking.user.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {booking.services.map((s) => s.name).join(", ")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {new Date(booking.schedule.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-xs text-muted-foreground">{booking.schedule.durationMinutes} min</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No bookings today</p>
        )}
      </div>
    </div>
  );
}
