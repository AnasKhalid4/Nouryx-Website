"use client";

import { Bell, CalendarDays, Loader2 } from "lucide-react";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllRead } from "@/hooks/use-notifications";

function timeAgo(date: Date) {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardNotificationsPage() {
    const { data: notifications, isLoading } = useNotifications();
    const unreadCount = useUnreadCount();
    const markAsRead = useMarkAsRead();
    const markAllRead = useMarkAllRead();

    return (
        <div className="p-4 md:p-6 lg:p-10 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="text-xs bg-[#C9AA8B] text-white rounded-full px-2.5 py-0.5 font-medium">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllRead.mutate()}
                        disabled={markAllRead.isPending}
                        className="text-xs text-[#C9AA8B] hover:text-[#B8956F] font-medium disabled:opacity-50"
                    >
                        {markAllRead.isPending ? "Marking..." : "Mark all as read"}
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-[#C9AA8B]" />
                </div>
            ) : notifications && notifications.length > 0 ? (
                <div className="space-y-2">
                    {notifications.map((notif) => (
                        <button
                            key={notif.id}
                            onClick={() => {
                                if (!notif.isRead) markAsRead.mutate(notif.id);
                            }}
                            className={`w-full text-left flex gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${notif.isRead
                                    ? "bg-white border-border/50 hover:bg-muted/30"
                                    : "bg-[#C9AA8B]/5 border-[#C9AA8B]/20 hover:bg-[#C9AA8B]/10"
                                }`}
                        >
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${notif.isRead ? "bg-muted" : "bg-[#C9AA8B]/10"
                                }`}>
                                {notif.type === "order" ? (
                                    <CalendarDays className={`h-4 w-4 ${notif.isRead ? "text-muted-foreground" : "text-[#C9AA8B]"}`} />
                                ) : (
                                    <Bell className={`h-4 w-4 ${notif.isRead ? "text-muted-foreground" : "text-[#C9AA8B]"}`} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm ${notif.isRead ? "font-normal" : "font-semibold"} text-foreground`}>
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
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No notifications yet</p>
                    <p className="text-xs text-muted-foreground mt-1">You&apos;ll see booking updates and messages here</p>
                </div>
            )}
        </div>
    );
}
