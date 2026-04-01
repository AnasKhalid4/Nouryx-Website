"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import Link from "next/link";

export default function PricingPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isSalon = user?.role === "salon";
  const isActive = user?.subscription?.active ?? false;
  const createdAtMs = user?.createdAt?.getTime?.() ?? 0;
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;
  const freeEndsAtMs = createdAtMs > 0 ? createdAtMs + oneYearMs : 0;
  const isOneYearComplete = createdAtMs > 0 && Date.now() >= freeEndsAtMs;
  const showProfessionalCard = isSalon && isOneYearComplete;

  const freePlanCard = (
    <div className="bg-white rounded-2xl border border-border/50 p-8 relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <Badge className="bg-[#C9AA8B]/10 text-[#C9AA8B] border border-[#C9AA8B]/20 hover:bg-[#C9AA8B]/10 text-xs">
          {t.pricing.currentPlanBadge}
        </Badge>
      </div>

      <h3 className="text-lg font-semibold text-foreground">
        {t.pricing.freePlan.name}
      </h3>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-foreground">
          {t.pricing.freePlan.currency}{t.pricing.freePlan.price}
        </span>
        <span className="text-muted-foreground">{t.pricing.freePlan.period}</span>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {t.pricing.freePlan.description}
      </p>

      <div className="mt-8">
        <Link href={user?.role === "salon" ? "/dashboard" : "/signup"}>
          <Button variant="outline" className="w-full rounded-xl h-12 text-sm font-medium border-[#C9AA8B]/30 text-[#C9AA8B] hover:bg-[#C9AA8B]/10">
            {user?.role === "salon" ? t.pricing.goToDashboard : t.pricing.freePlan.cta}
          </Button>
        </Link>
      </div>

      <ul className="mt-8 space-y-3">
        {t.pricing.freePlan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div className="mt-0.5 h-5 w-5 rounded-full bg-[#C9AA8B]/10 flex items-center justify-center shrink-0">
              <Check className="h-3 w-3 text-[#C9AA8B]" />
            </div>
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-16 pb-20 text-center">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Badge
              variant="secondary"
              className="mb-4 bg-[#C9AA8B]/10 text-[#C9AA8B] border-[#C9AA8B]/20 hover:bg-[#C9AA8B]/10"
            >
              {t.pricing.badge}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              {t.pricing.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t.pricing.subtitle}
            </p>
          </div>
        </section>

        {/* Pricing Card */}
        <section className="pb-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            {showProfessionalCard ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {freePlanCard}
                <div className="bg-white rounded-2xl border border-[#C9AA8B]/20 p-8 relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-[#C9AA8B] text-white hover:bg-[#C9AA8B] text-xs">
                      {t.pricing.trialBadge}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">
                    {t.pricing.planName}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {t.pricing.currency}{t.pricing.price}
                    </span>
                    <span className="text-muted-foreground">{t.pricing.period}</span>
                  </div>

                  <div className="mt-8">
                    <Link href={user?.role === "salon" ? "/dashboard/subscription" : "/signup"}>
                      <Button className="w-full bg-[#C9AA8B] hover:bg-[#B8956F] text-white h-12 rounded-xl text-sm font-medium">
                        {t.pricing.cta}
                      </Button>
                    </Link>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {t.pricing.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 h-5 w-5 rounded-full bg-[#C9AA8B]/10 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-[#C9AA8B]" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-full md:max-w-[calc((100%-1.5rem)/2)]">
                  {freePlanCard}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-20">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              {t.pricing.faq.title}
            </h2>
            <div className="space-y-3">
              {t.pricing.faq.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-border/50"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-sm font-medium text-foreground pr-4">
                      {item.q}
                    </span>
                    {openFaq === i ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 -mt-1">
                      <p className="text-sm text-muted-foreground">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
