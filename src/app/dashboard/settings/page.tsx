"use client";

import { Globe, Lock, Shield, FileText, Headphones, Trash2, LogOut, CreditCard, ChevronRight } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import Link from "next/link";

export default function DashboardSettingsPage() {
  const { t } = useLocale();

  const items = [
    { label: t.settings.manageSubscription, icon: CreditCard, href: "/dashboard/subscription" },
    { label: t.settings.language, icon: Globe, href: "#" },
    { label: t.settings.changePassword, icon: Lock, href: "#" },
    { label: t.settings.privacyPolicy, icon: Shield, href: "https://admin.nouryx.com/privacy_policy.html", external: true },
    { label: t.settings.termsConditions, icon: FileText, href: "https://admin.nouryx.com/terms_conditions.html", external: true },
    { label: t.settings.contactUs, icon: Headphones, href: "https://admin.nouryx.com/#/support", external: true },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t.settings.title}</h1>

      <div className="bg-white rounded-xl border border-border/50 overflow-hidden mb-4">
        {items.map((item, i) => {
          const content = (
            <div
              className={`flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer ${
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
            </div>
          );

          if (item.external) {
            return (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            );
          }
          return (
            <Link key={item.label} href={item.href}>
              {content}
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-50/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-sm font-medium text-destructive">{t.settings.deleteAccount}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <LogOut className="h-4 w-4 text-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">{t.settings.logout}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
