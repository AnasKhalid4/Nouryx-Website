"use client";

import { useLocale } from "@/hooks/use-locale";
import { useState, useEffect, useRef } from "react";

export function StatsSection() {
  const { t } = useLocale();
  const [visibleStats, setVisibleStats] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleStats((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.3 }
    );

    const items = sectionRef.current?.querySelectorAll('[data-index]');
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const Counter = ({ value, index }: { value: string; index: number }) => {
    const [count, setCount] = useState(0);
    const isVisible = visibleStats.has(index);

    useEffect(() => {
      if (!isVisible) {
        setCount(0);
        return;
      }

      // Extract numeric value from string (handles "12,547+" etc)
      const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
      const duration = 2000; // 2 seconds
      const steps = 40;
      const increment = numericValue / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(increment * step, numericValue);
        setCount(Math.floor(current));
        
        if (step >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [isVisible, value]);

    // Format the number with original suffixes
    const formatNumber = (num: number, original: string) => {
      if (original.includes('+')) return `${num.toLocaleString()}+`;
      if (original.includes('%')) return `${num}%`;
      if (original.includes('K')) return `${(num / 1000).toFixed(1)}K`;
      return num.toLocaleString();
    };

    return <span>{formatNumber(count, value)}</span>;
  };

  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.stats.title}
        </h2>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          {t.stats.subtitle}
        </p>

        <div ref={sectionRef} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {t.stats.items.map((stat, i) => (
            <div key={i} data-index={i} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-[#C9AA8B]">
                <Counter value={stat.value} index={i} />
              </span>
              <span className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
