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
import { WebsiteSchema } from "@/components/seo/WebsiteSchema";
import { FaqSchema } from "@/components/seo/FaqSchema";
import { useLocale } from "@/hooks/use-locale";
import { ChevronDown } from "lucide-react";

const HOME_FAQS: Record<string, Array<{ question: string; answer: string }>> = {
  fr: [
    { question: "Comment réserver un salon de coiffure en ligne en France avec Nouryx ?", answer: "Rendez-vous sur Nouryx, recherchez un salon par ville ou service, choisissez un créneau disponible et confirmez. La réservation est instantanée, gratuite et disponible 24h/24." },
    { question: "Nouryx est-il gratuit pour réserver un salon ?", answer: "Oui, Nouryx est entièrement gratuit pour les clients. Vous réservez votre rendez-vous sans frais. Les salons paient un abonnement pour accéder à la plateforme." },
    { question: "Comment inscrire mon salon sur Nouryx ?", answer: "Cliquez sur 'Inscrire mon salon', créez votre profil, ajoutez vos services et tarifs. Votre salon est en ligne en moins de 30 minutes et commence à recevoir des réservations." },
    { question: "Quelle est la différence entre Nouryx et Planity ou Fresha ?", answer: "Nouryx est conçu pour le marché français avec 0% de commission sur les réservations, la gestion des employés indépendants et salariés, et le support en français 7j/7." },
  ],
  en: [
    { question: "How do I book a hair salon online in France with Nouryx?", answer: "Visit Nouryx, search for a salon by city or service, choose an available time slot and confirm. Booking is instant, free and available 24/7." },
    { question: "Is Nouryx free to use for clients?", answer: "Yes, Nouryx is completely free for clients. You book your appointment at no cost. Salons pay a subscription to access the platform." },
    { question: "How do I list my salon on Nouryx?", answer: "Click 'List Your Business', create your profile, add your services and prices. Your salon is online in under 30 minutes and starts receiving bookings." },
    { question: "How is Nouryx different from Fresha or Planity?", answer: "Nouryx is built specifically for the French market with 0% booking commission, full French-language support, and handles complex salon structures like chair rental alongside salaried staff." },
  ],
};

export default function HomePage() {
  const { locale } = useLocale();
  const faqs = HOME_FAQS[locale] || HOME_FAQS.en;

  return (
    <div className="min-h-screen bg-background">
      <WebsiteSchema />
      <FaqSchema faqs={faqs} />
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
