"use client";

import { useState, useEffect } from "react";
import { User, Heart, Bell, MessageSquare, Settings, ChevronRight, Pencil, LogOut, Loader2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { signOutUser } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { t } = useLocale();
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9AA8B]" />
      </div>
    );
  }

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !user)) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, user, router]);

  if (!isLoggedIn || !user) {
    return null;
  }

  const menuItems = [
    { label: t.profile.editProfile, href: "/user/profile/edit", icon: Pencil },
    { label: t.profile.favorites, href: "/user/profile/favorites", icon: Heart },
    { label: t.profile.notifications, href: "/notifications", icon: Bell },
    { label: t.profile.messages, href: "/chat", icon: MessageSquare },
    { label: t.profile.settings, href: "/user/profile/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOutUser();
    toast.success("Signed out");
    router.push("/");
  };

  return (
    <main className="py-8 lg:py-12">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        {/* Avatar + Info */}
        <div className="text-center mb-8">
          <div className="h-24 w-24 rounded-full bg-[#E8D5C0] flex items-center justify-center mx-auto mb-4 overflow-hidden">
            {user.profile?.profileImage ? (
              <Image
                src={user.profile.profileImage}
                alt={user.profile.fullName}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <User className="h-10 w-10 text-[#8B7355]" />
            )}
          </div>
          <h1 className="text-xl font-bold text-foreground">{user.profile?.fullName || "User"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{user.profile?.email}</p>
          <p className="text-sm text-muted-foreground">{user.profile?.phoneNumber}</p>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
          {menuItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors ${i > 0 ? "border-t border-border/50" : ""
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
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-between px-5 py-4 hover:bg-red-50/50 transition-colors w-full border-t border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center">
                <LogOut className="h-4 w-4 text-red-500" />
              </div>
              <span className="text-sm font-medium text-red-600">{t.nav.logout}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </main>
  );
}
