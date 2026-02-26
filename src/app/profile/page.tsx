"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { User, Heart, Bell, MessageSquare, Settings, ChevronRight, Pencil } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import Link from "next/link";

export default function ProfilePage() {
  const { t } = useLocale();

  const menuItems = [
    { label: t.profile.editProfile, href: "/profile/edit", icon: Pencil },
    { label: t.profile.favorites, href: "/profile/favorites", icon: Heart },
    { label: t.profile.notifications, href: "/notifications", icon: Bell },
    { label: t.profile.messages, href: "/chat", icon: MessageSquare },
    { label: t.profile.settings, href: "/profile/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          {/* Avatar + Info */}
          <div className="text-center mb-8">
            <div className="h-24 w-24 rounded-full bg-[#E8D5C0] flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-[#8B7355]" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Alice Martin</h1>
            <p className="text-sm text-muted-foreground mt-1">alice@example.com</p>
            <p className="text-sm text-muted-foreground">+33 6 12 34 56 78</p>
          </div>

          {/* Menu */}
          <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
            {menuItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors ${
                  i > 0 ? "border-t border-border/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#F5EDE6] flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-[#C9AA8B]" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
