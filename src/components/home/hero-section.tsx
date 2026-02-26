"use client";

import { useLocale } from "@/hooks/use-locale";
import { useState, useEffect } from "react";
import Link from "next/link";

// ── Maximum visible gradients ───────────────────────────────────────────
const gradients = [
  "radial-gradient(ellipse 50% 60% at 50% -10%, rgba(201, 170, 139, 0.5), transparent), radial-gradient(ellipse 80% 60% at 0% 90%, rgba(232, 213, 192, 0.2), transparent), linear-gradient(180deg, #FEFEFE 0%, #FAF9F8 100%)",
  "radial-gradient(ellipse 50% 60% at 50% -10%, rgba(232, 213, 192, 0.5), transparent), radial-gradient(ellipse 80% 60% at 100% 90%, rgba(201, 170, 139, 0.2), transparent), linear-gradient(180deg, #FEFEFE 0%, #FBF9F7 100%)",
  "radial-gradient(ellipse 50% 60% at 30% -10%, rgba(201, 170, 139, 0.5), transparent), radial-gradient(ellipse 80% 60% at 70% 90%, rgba(232, 213, 192, 0.2), transparent), linear-gradient(180deg, #FEFEFE 0%, #FAF8F6 100%)",
];

// Gradient for the headline text per phase
const titleGradients = [
  "linear-gradient(120deg, #1C1917 0%, #44403C 100%)",
  "linear-gradient(120deg, #292524 0%, #44403C 100%)",
  "linear-gradient(120deg, #1C1917 0%, #44403C 100%)",
];

export function HeroSection() {
  const { t } = useLocale();
  const [idx, setIdx] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setIdx((p) => (p + 1) % gradients.length), 3000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // Repeated text for seamless marquee loop
  const marqueeText = "NOURYX · NOURYX · NOURYX · NOURYX · NOURYX · NOURYX · ";

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes slideFromBottom {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes marquee-ltr {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes marquee-rtl {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .hero-title {
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: shimmer 5s linear infinite;
          transition: background-image 2s ease-in-out;
        }

        .animate-slide-up {
          opacity: 0;
          animation: slideFromBottom 0.8s ease-out forwards;
        }

        .animate-slide-up-delay-1 {
          animation-delay: 0.2s;
        }

        .animate-slide-up-delay-2 {
          animation-delay: 0.4s;
        }

        /* Marquee wrapper */
        .marquee-outer {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          overflow: hidden;
          pointer-events: none;
          /* mask so letters fade at edges */
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 12%,
            black 88%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 12%,
            black 88%,
            transparent 100%
          );
        }

        .marquee-track {
          display: flex;
          width: max-content;
          /* each track contains the text twice so it can loop seamlessly */
          animation: marquee-ltr 22s linear infinite;
          will-change: transform;
        }

        .marquee-track-rtl {
          animation: marquee-rtl 28s linear infinite;
        }

        .marquee-text {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(80px, 14vw, 160px);
          font-weight: 900;
          letter-spacing: 0.05em;
          line-height: 1;
          white-space: nowrap;
          color: rgba(120, 113, 108, 0.12);
          user-select: none;
          padding-right: 0.15em;
        }

        .cta-btn {
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 13px 32px;
          background: transparent;
          border: 1.5px solid rgba(201, 170, 139, 0.55);
          outline: none;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #78716C;
          transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
          white-space: nowrap;
        }
        .cta-btn:hover {
          border-color: rgba(201, 170, 139, 0.9);
          background: rgba(201, 170, 139, 0.05);
          transform: translateY(-1px);
        }
      `}</style>

      <section className="relative overflow-hidden -mt-16  min-h-screen flex items-center">

        {/* ── Animated background layers ── */}
        {gradients.map((bg, i) => (
          <div
            key={i}
            className="absolute inset-0 -top-16 transition-opacity duration-[2000ms] ease-in-out"
            style={{ background: bg, opacity: idx === i ? 1 : 0 }}
          />
        ))}

        {/* ── Flower Background Images ── */}
        <div
          className="absolute -top-16 right-0 w-[500px] h-[500px] pointer-events-none opacity-40 md:block hidden"
          style={{
            backgroundImage: "url('/images/background-1.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top right",
          }}
        />

        <div
          className="absolute bottom-0 left-0 w-[450px] h-[450px] pointer-events-none opacity-35 md:block hidden"
          style={{
            backgroundImage: "url('/images/backgorund-2.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom left",
          }}
        />

        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none opacity-30 md:hidden"
          style={{
            backgroundImage: "url('/images/background-1.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />

        {/* ── Main content ── */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">

          {/* ── Headline ── */}
          <div className="text-center max-w-3xl mx-auto">
            <h1
              className={`hero-title text-4xl font-extrabold tracking-tight leading-tight mt-3 md:mt-5 ${isLoaded ? 'animate-slide-up' : ''}`}
              style={{ backgroundImage: titleGradients[idx] }}
            >
              {t.hero.title}
            </h1>
            <p className={`mt-4 text-md text-muted-foreground max-w-2xl mx-auto ${isLoaded ? 'animate-slide-up animate-slide-up-delay-1' : ''}`}>
              {t.hero.subtitle}
            </p>
          </div>

          {/* ── CTA Button ── */}
          <div className={`mt-10 flex justify-center ${isLoaded ? 'animate-slide-up animate-slide-up-delay-2' : ''}`}>
            <Link href="/salons" style={{ textDecoration: "none" }}>
              <button className="cta-btn">
                {t.hero.ctaButton}
              </button>
            </Link>
          </div>

        </div>

        {/* ── Scrolling NOURYX marquee at the very bottom ── */}
        <div className="marquee-outer" style={{ height: "clamp(80px, 14vw, 160px)" }}>
          {/* Left-to-right row */}
          <div className="marquee-track">
            <span className="marquee-text">{marqueeText}</span>
            {/* duplicate for seamless loop */}
            <span className="marquee-text" aria-hidden="true">{marqueeText}</span>
          </div>
        </div>

      </section>
    </>
  );
}