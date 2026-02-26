"use client";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useState } from "react";

export function ReviewsSection() {
  const { t } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const review = t.reviews.items[activeIndex];

  const prev = () => setActiveIndex((i) => (i === 0 ? t.reviews.items.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === t.reviews.items.length - 1 ? 0 : i + 1));

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background image with parallax effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('/images/reviews.jpg')",
        }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {t.reviews.title}
          </h2>
          <div className="w-12 h-0.5 bg-[#C9AA8B] mx-auto mt-4" />
          <p className="mt-4 text-white/70">{t.reviewsSection.subtitle}</p>
        </div>

        {/* Active Review */}
        <div className="text-center">
          <p className="text-base md:text-lg text-white/90 italic leading-relaxed max-w-2xl mx-auto mb-3">
            &ldquo;{review.text}&rdquo;
          </p>
          <p className="text-base md:text-lg text-white/90 italic leading-relaxed max-w-2xl mx-auto mb-8">
            {review.title}
          </p>

          <div className="flex gap-0.5 justify-center mb-4">
            {Array.from({ length: review.rating }).map((_, j) => (
              <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <p className="text-sm font-semibold text-white">
            — {review.name}, <span className="font-normal text-white/70">{review.city}</span>
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button onClick={prev} className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            {t.reviews.items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-6 bg-[#C9AA8B]" : "w-2.5 bg-[#C9AA8B]/25"
                }`}
              />
            ))}
          </div>
          <button onClick={next} className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
