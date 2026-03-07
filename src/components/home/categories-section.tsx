"use client";

import { useLocale } from "@/hooks/use-locale";
import { useCategories } from "@/hooks/use-categories";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRef, useEffect } from "react";

export default function CategoriesSection() {
  const { t } = useLocale();
  const { data: categories, isLoading } = useCategories();
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Take the latest 4 categories
  const topCategories = (categories || []).slice(0, 4);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Video autoplay failed:", err);
      });
    }
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/salons?category=${categoryId}`);
  };

  if (!isLoading && topCategories.length === 0) return null;

  return (
    <>
      <div>
        <div>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t.categoriesSection.title}
            </h2>
            <div className="w-12 h-0.5 bg-[#C9AA8B] mx-auto mt-4" />
            <p className="mt-4">{t.categoriesSection.subtitle}</p>
          </div>
        </div>

        <style>{`
          .video-bg {
            object-fit: cover;
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
          }
        `}</style>

        <section
          className="relative w-full overflow-hidden"
          style={{ height: "460px" }}
        >
          {/* ── Video Background ── */}
          <video
            ref={videoRef}
            className="video-bg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/categoires.mp4"
          >
            <source src="/images/categoires.mp4" type="video/mp4" />
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1800&q=85')",
              }}
            />
          </video>

          {/* ── Bottom gradient ── */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.22) 40%, rgba(0,0,0,0) 70%)",
            }}
          />

          {/* ── Category Overlays ── */}
          <div className="absolute inset-0 z-20 flex">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/60" />
              </div>
            ) : (
              topCategories.map((cat, i) => {
                const isHovered = hovered === i;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    className="relative flex-1 flex flex-col justify-end cursor-pointer"
                    style={{
                      borderRight:
                        i < topCategories.length - 1
                          ? "1px solid rgba(255,255,255,0.3)"
                          : "none",
                      background: isHovered
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                      transition: "background 0.25s ease",
                    }}
                  >
                    <div className="px-7 pb-9 flex flex-col gap-1.5">
                      {/* Accent line — shows when active */}
                      <div
                        style={{
                          width: active === i ? 36 : 0,
                          height: 2,
                          borderRadius: 99,
                          background: "#C9AA8B",
                          marginBottom: 4,
                          transition:
                            "width 0.4s cubic-bezier(0.77,0,0.18,1)",
                        }}
                      />

                      {/* Category Name */}
                      <h3
                        className="text-white tracking-[0.18em] uppercase leading-none"
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          opacity: isHovered ? 1 : 0.92,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        {cat.name}
                      </h3>

                      {/* Click hint */}
                      <p
                        className="text-white/75 leading-snug"
                        style={{
                          fontSize: "14.5px",
                          fontWeight: 300,
                          opacity: isHovered ? 1 : 0.8,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        {isHovered ? "View salons →" : "Browse services"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </>
  );
}