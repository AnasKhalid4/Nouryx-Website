"use client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLocale } from "@/hooks/use-locale";
import { Heart, Shield, Lightbulb, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const valueIcons = [Lightbulb, Shield, Heart, Sparkles];

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

// Repeated text for seamless marquee loop
const marqueeText = "NOURYX · NOURYX · NOURYX · NOURYX · NOURYX · NOURYX · ";

export default function AboutPage() {
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
      `}</style>

      <Header />
      <main>
        {/* Hero Section - Same as Home */}
        <section className="relative overflow-hidden -mt-16 h-[50vh] flex items-center">
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

          {/* <div
            className="absolute bottom-0 left-0 w-[450px] h-[450px] pointer-events-none opacity-35 md:block hidden"
            style={{
              backgroundImage: "url('/images/backgorund-2.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "bottom left",
            }}
          /> */}

          {/* <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none opacity-30 md:hidden"
            style={{
              backgroundImage: "url('/images/background-1.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          /> */}

          {/* ── Main content ── */}
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            {/* ── Headline ── */}
            <div className="text-center max-w-3xl mx-auto">
              <h1
                className={`hero-title text-4xl font-extrabold tracking-tight leading-tight mt-3 md:mt-5 ${isLoaded ? 'animate-slide-up' : ''}`}
                style={{ backgroundImage: titleGradients[idx] }}
              >
                {t.about.title}
              </h1>
              <p className={`mt-4 text-md text-muted-foreground max-w-2xl mx-auto ${isLoaded ? 'animate-slide-up animate-slide-up-delay-1' : ''}`}>
                {t.about.subtitle}
              </p>
            </div>
          </div>

          {/* ── Scrolling NOURYX marquee at the very bottom ── */}
       
        </section>

        {/* Story — styled like reference image */}
        <section className="bg-[#f5f0eb] py-16 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — overlapping image collage */}
            <div className="relative h-[520px] flex-shrink-0 hidden md:block">              {/* Back image: tall portrait */}
              <div className="absolute top-0 left-0 w-[56%] h-[64%] rounded-2xl overflow-hidden">
                <Image
                  src="/images/salon-placeholder-5.webp"
                  alt="Nail technician at work"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {/* Front image: round / clipped bottom-right */}
              <div
                className="absolute bottom-0 right-0 w-[58%] h-[68%] overflow-hidden"
                style={{ borderRadius: "60% 60% 60% 0 / 60% 60% 60% 0" }}
              >
                <Image
                  src="/images/salon-placeholder-1.webp"
                  alt="Colorful nails close-up"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {/* Decorative circle badge */}

            </div>

            {/* Right — text and stats */}
            <div>
              {/* Label */}
              <p className="text-xs tracking-[0.2em] uppercase text-[#c9a98a] font-medium mb-3">
                {t.about.title}
              </p>

              {/* Headline */}
              <h2 className="font-serif text-3xl md:text-4xl text-[#2c1a0e] leading-tight mb-5">
                {t.about.story.title}
              </h2>

              {/* Body text */}
              <p className="text-[#6b4f3a] text-[15px] leading-relaxed mb-8">
                {t.about.story.text}
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "500+", label: t.aboutStats.salons },
                  { value: "10,000+", label: t.aboutStats.clients },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="font-serif text-4xl text-[#c9a98a] leading-none mb-1">
                      {stat.value}
                    </p>
                    <p className="text-[#7a5c44] text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl text-[#2c1a0e] mb-4">
              {t.about.mission.title}
            </h2>
            <p className="text-[#6b4f3a] text-[15px] leading-relaxed">
              {t.about.mission.text}
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="bg-[#f5f0eb] py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-3xl text-[#2c1a0e] text-center mb-10">
              {t.about.values.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.about.values.items.map((value, i) => {
                const Icon = valueIcons[i];
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-sm text-center"
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#f5f0eb] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#c9a98a]" />
                    </div>
                    <h3 className="font-serif text-lg text-[#2c1a0e] mb-2">
                      {value.title}
                    </h3>
                    <p className="text-[#6b4f3a] text-sm leading-relaxed">
                      {value.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}