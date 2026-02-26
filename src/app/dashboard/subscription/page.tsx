"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Sparkles } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

export default function DashboardSubscriptionPage() {
  const { t } = useLocale();

  const isActive = false;

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t.dashboard.subscription.title}</h1>

      {/* Current Status */}
      <div className="bg-white rounded-xl border border-border/50 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#C9AA8B]/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[#C9AA8B]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.dashboard.subscription.currentPlan}</p>
              <p className="text-xs text-muted-foreground">Professional</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}
          >
            {isActive ? t.dashboard.subscription.active : t.dashboard.subscription.inactive}
          </Badge>
        </div>

        {isActive ? (
          <Button variant="outline" className="w-full rounded-lg">
            {t.dashboard.subscription.manage}
          </Button>
        ) : null}
      </div>

      {/* Pricing Card (if not active) */}
      {!isActive && (
        <div className="bg-linear-to-br from-[#F5EDE6] to-[#E8D5C0]/50 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge className="bg-[#C9AA8B] text-white hover:bg-[#C9AA8B] text-xs">
              {t.pricing.trialBadge}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-[#C9AA8B]" />
            <h2 className="text-lg font-bold text-foreground">{t.pricing.planName}</h2>
          </div>

          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-bold text-foreground">{t.pricing.currency}{t.pricing.price}</span>
            <span className="text-muted-foreground">{t.pricing.period}</span>
          </div>

          <ul className="space-y-2.5 mb-8">
            {t.pricing.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <div className="h-5 w-5 rounded-full bg-[#C9AA8B]/20 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-[#C9AA8B]" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button className="w-full bg-[#C9AA8B] hover:bg-[#B8956F] text-white h-12 rounded-xl font-medium text-sm">
            {t.dashboard.subscription.upgrade}
          </Button>
        </div>
      )}
    </div>
  );
}
