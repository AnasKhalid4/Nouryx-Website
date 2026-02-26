"use client";

import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";
import Link from "next/link";
import Image from "next/image";

export function ForBusinessSection() {
  const { t } = useLocale();

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top: Software showcase */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {t.forBusiness.title}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t.forBusiness.subtitle}
            </p>
            <ul className="mt-6 space-y-3">
              {t.forBusiness.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-[#C9AA8B]/10 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-[#C9AA8B]" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/pricing">
                <Button
                  variant="outline"
                  className="border-foreground text-foreground hover:bg-foreground hover:text-white rounded-full px-6"
                >
                  {t.forBusiness.cta}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Bookings image */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/images/bookings.png"
              alt="Booking management interface"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Bottom: Business stats */}
        {/* <div className="mt-20">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            {t.forBusiness.statsTitle}
          </h3>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {t.forBusiness.statsItems.map((stat, i) => (
              <div
                key={i}
                className="bg-[#FAFAF8] rounded-xl p-6 text-center"
              >
                <span className="text-3xl md:text-4xl font-bold text-[#C9AA8B]">
                  {stat.value}
                </span>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
}
