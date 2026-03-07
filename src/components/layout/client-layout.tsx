"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CalendarDays, User, Heart, Bell, MessageSquare, Settings, LogOut } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-notifications";
import { signOutUser } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

const sidebarItems = [
  { icon: CalendarDays, labelKey: "bookings" as const, href: "/user/bookings" },
  { icon: User, labelKey: "profile" as const, href: "/user/profile" },
  { icon: Heart, labelKey: "favorites" as const, href: "/user/profile/favorites" },
  { icon: Bell, labelKey: "notifications" as const, href: "/notifications" },
  { icon: MessageSquare, labelKey: "chat" as const, href: "/chat" },
  { icon: Settings, labelKey: "settings" as const, href: "/user/profile/settings" },
];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLocale();
  const { user } = useAuth();
  const { push } = useRouter();
  const unreadCount = useUnreadCount();

  const userName = user?.profile?.fullName || "My Account";
  const userEmail = user?.profile?.email || "";
  const userImage = user?.profile?.profileImage || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const labels: Record<string, string> = {
    bookings: t.nav.bookings,
    profile: t.nav.profile,
    favorites: t.nav.favorites,
    notifications: t.nav.notifications,
    chat: t.nav.chat,
    settings: t.nav.settings,
  };

  const handleLogout = async () => {
    await signOutUser();
    toast.success("Signed out");
    push("/");
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
                item.href === "/user/profile"
                  ? pathname === "/user/profile"
                  : pathname.startsWith(item.href);
              const showBadge = item.labelKey === "notifications" && (unreadCount ?? 0) > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#C9AA8B]/10 text-[#C9AA8B]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{labels[item.labelKey]}</span>
                  {showBadge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full mt-2"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {t.nav.logout}
            </button>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#E8D5C0] flex items-center justify-center overflow-hidden shrink-0">
                {userImage ? (
                  <Image src={userImage} alt={userName} width={36} height={36} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-[#8B7355] font-bold text-sm">{userInitial}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                {userEmail && <p className="text-xs text-muted-foreground truncate">{userEmail}</p>}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-40">
          <div className="flex items-center justify-around py-2">
            {sidebarItems.slice(0, 5).map((item) => {
              const isActive =
                item.href === "/user/profile"
                  ? pathname === "/user/profile"
                  : pathname.startsWith(item.href);
              const showBadge = item.labelKey === "notifications" && (unreadCount ?? 0) > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 relative ${
                    isActive ? "text-[#C9AA8B]" : "text-muted-foreground"
                  }`}
                >
                  <div className="relative">
                    <item.icon className="h-5 w-5" />
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full h-3.5 min-w-3.5 flex items-center justify-center px-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{labels[item.labelKey]}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          <div className="mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
