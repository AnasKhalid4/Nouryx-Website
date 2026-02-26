"use client";

import { useLocale } from "@/hooks/use-locale";

export function AdvantagesSection() {
  const { t } = useLocale();

  return (
    <section className="relative">
      {/* Parallax fixed background image - stays fixed while content scrolls */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('/images/advantage.webp')",
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.advantagesSection.title}
            </h2>
            <div className="w-12 h-0.5 bg-[#C9AA8B] mx-auto mt-4" />
            <p className="mt-4 text-white/60">{t.advantagesSection.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {t.advantagesSection.items.map((adv) => (
              <div key={adv.num} className="flex gap-5">
                <span className="text-3xl font-bold text-[#C9AA8B]/60 shrink-0 leading-none mt-1">
                  {adv.num}.
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[#C9AA8B] mb-2">
                    {adv.title}
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {adv.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
