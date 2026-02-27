"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import CategoriesSection from "@/components/home/categories-section";
import { FeaturedSalonsSection } from "@/components/home/featured-salons-section";
import { StatsSection } from "@/components/home/stats-section";
import { ForBusinessSection } from "@/components/home/for-business-section";
import { AdvantagesSection } from "@/components/home/advantages-section";
import { ReviewsSection } from "@/components/home/reviews-section";
import { DownloadAppSection } from "@/components/home/download-app-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <main>
        <div className="mt-10 md:mt-20">
          <CategoriesSection />
        </div>
        <FeaturedSalonsSection />

        <ForBusinessSection />
        <AdvantagesSection />
        <StatsSection />
        <ReviewsSection />
        <DownloadAppSection />
      </main>
      <Footer />
    </div>
  );
}
