"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Bell, CalendarDays } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { mockNotifications } from "@/data/mock-salons";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {t.notifications.title}
            </h1>
            <button className="text-xs text-[#C9AA8B] hover:text-[#B8956F] font-medium">
              {t.notifications.markAllRead}
            </button>
          </div>

          {mockNotifications.length > 0 ? (
            <div className="space-y-2">
              {mockNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                    notif.isRead
                      ? "bg-white border-border/50"
                      : "bg-[#C9AA8B]/5 border-[#C9AA8B]/20"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    notif.isRead ? "bg-muted" : "bg-[#C9AA8B]/10"
                  }`}>
                    {notif.type === "order" ? (
                      <CalendarDays className={`h-4 w-4 ${notif.isRead ? "text-muted-foreground" : "text-[#C9AA8B]"}`} />
                    ) : (
                      <Bell className={`h-4 w-4 ${notif.isRead ? "text-muted-foreground" : "text-[#C9AA8B]"}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${notif.isRead ? "text-foreground" : "text-foreground"}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="h-2 w-2 rounded-full bg-[#C9AA8B] shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{t.notifications.empty}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
