"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "@/hooks/use-locale";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PANELS = [
  {
    id: 0,
    title: "RELAXATION",
    sub: "The best way to enjoy a day",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1800&q=85",
  },
  {
    id: 1,
    title: "CHIROPRACTIC",
    sub: "Brand new service at our center",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1800&q=85",
  },
  {
    id: 2,
    title: "PHYSIOTHERAPY",
    sub: "Get rid of stressful traumas",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1800&q=85",
  },
  {
    id: 3,
    title: "MASSAGE THERAPY",
    sub: "For pain release and sore muscles",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1800&q=85",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CategoriesSection() {
  const { t } = useLocale();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Preload and autoplay video for instant loading
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log("Video autoplay failed:", err);
      });
    }
  }, []);

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
          {/* Fallback for browsers that don't support video */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1800&q=85')",
            }}
          />
        </video>

        {/* ── Bottom gradient so text is readable ── */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.22) 40%, rgba(0,0,0,0) 70%)",
          }}
        />

        {/* ── 4 Column Overlays with border dividers ── */}
        <div className="absolute inset-0 z-20 flex">
          {PANELS.map((panel, i) => {
            const isHovered = hovered === i;

            return (
              <div
                key={panel.id}
                onClick={() => setActive(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="relative flex-1 flex flex-col justify-end cursor-pointer"
                style={{
                  /* thin right border divider except on last */
                  borderRight: i < PANELS.length - 1 ? "1px solid rgba(255,255,255,0.3)" : "none",
                  /* subtle hover tint */
                  background: isHovered
                    ? "rgba(255,255,255,0.06)"
                    : "transparent",
                  transition: "background 0.25s ease",
                }}
              >
                {/* Bottom text block */}
                <div className="px-7 pb-9 flex flex-col gap-1.5">
                  {/* Accent line — shows when active */}
                  <div
                    style={{
                      width: active === i ? 36 : 0,
                      height: 2,
                      borderRadius: 99,
                      background: "#C9AA8B",
                      marginBottom: 4,
                      transition: "width 0.4s cubic-bezier(0.77,0,0.18,1)",
                    }}
                  />

                  {/* Title */}
                  <h3
                    className="text-white tracking-[0.18em] uppercase leading-none"
                    style={{
                      
                      fontSize: "15px",
                      fontWeight: 700,
                      opacity: isHovered ? 1 : 0.92,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    {panel.title}
                  </h3>

                  {/* Subtitle */}
                  <p
                    className="text-white/75 leading-snug"
                    style={{
                      
                      fontSize: "14.5px",
                      fontWeight: 300,
                      opacity: isHovered ? 1 : 0.8,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    {panel.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
       </div>
    </>
  );
}