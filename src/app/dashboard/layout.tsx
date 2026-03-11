"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LayoutDashboard, CalendarDays, User, Scissors, Settings, CreditCard, MessageSquare, Bell, Users, Clock } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";

const sidebarItems = [
  { icon: LayoutDashboard, key: "title" as const, href: "/dashboard" },
  { icon: CalendarDays, key: "bookings" as const, href: "/dashboard/bookings" },
  { icon: User, key: "profile" as const, href: "/dashboard/profile" },
  { icon: Scissors, key: "services" as const, href: "/dashboard/services" },
  { icon: Users, key: "teamMembers" as const, href: "/dashboard/team-members" },
  { icon: Clock, key: "schedule" as const, href: "/dashboard/schedule" },
  { icon: MessageSquare, key: "chat" as const, href: "/chat" },
  { icon: Bell, key: "notifications" as const, href: "/dashboard/notifications" },
  { icon: CreditCard, key: "subscription" as const, href: "/dashboard/subscription" },
  { icon: Settings, key: "settings" as const, href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLocale();
  const { user } = useAuth();

  const salonName = user?.salon?.shopName || "My Salon";
  const salonCity = user?.location?.city || "";
  const salonInitial = salonName.charAt(0).toUpperCase();

  const labels: Record<string, string> = {
    title: t.dashboard.title,
    bookings: t.dashboard.bookings.title,
    profile: t.dashboard.profile.title,
    services: t.dashboard.services.title,
    teamMembers: "Team Members",
    schedule: "Schedule",
    chat: t.chat.title,
    notifications: t.notifications?.title || "Notifications",
    subscription: t.dashboard.subscription.title,
    settings: t.settings.title,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {/* Sidebar — Desktop */}
        <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-white min-h-[calc(100vh-64px)] sticky top-16">
          <nav className="p-3 space-y-1 flex-1">
            {sidebarItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "bg-[#C9AA8B]/10 text-[#C9AA8B]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  {labels[item.key]}
                </Link>
              );
            })}
          </nav>

          {/* Salon info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#C9AA8B] flex items-center justify-center">
                <span className="text-white font-bold text-sm">{salonInitial}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{salonName}</p>
                {salonCity && <p className="text-xs text-muted-foreground">{salonCity}</p>}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-40">
          <div className="flex items-center justify-around py-2">
            {sidebarItems.slice(0, 5).map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 ${isActive ? "text-[#C9AA8B]" : "text-muted-foreground"
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{labels[item.key]}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content — full width, centered */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          <div className="mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
