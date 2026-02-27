"use client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLocale } from "@/hooks/use-locale";
import { Heart, Shield, Lightbulb, Sparkles } from "lucide-react";
import Image from "next/image";

const valueIcons = [Lightbulb, Shield, Heart, Sparkles];

export default function AboutPage() {
  const { t } = useLocale();

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative py-24 px-6 text-center overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/about-us.png')",
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="relative z-10">
            <h1 className="font-serif text-5xl md:text-6xl text-white mb-4">
              {t.about.title}
            </h1>
            <p className="text-white/90 text-lg max-w-xl mx-auto">
              {t.about.subtitle}
            </p>
          </div>
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