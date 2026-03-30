import type { Metadata } from "next";
import "./globals.css";


import { GlobalLoader } from "@/components/ui/global-loader";
import { LocationPrompt } from "@/components/location-prompt";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";
import { AppDownloadPopup } from "@/components/app-download-popup";

export const metadata: Metadata = {
  metadataBase: new URL("https://nouryx.com"),
  title: {
    default: "Nouryx — Réservez votre salon beauté en ligne | France",
    template: "%s | Nouryx",
  },
  description:
    "Trouvez et réservez les meilleurs salons de coiffure, spas et instituts de beauté en France. Réservation en ligne gratuite, disponible 24h/24.",
  keywords: [
    "réservation salon coiffure",
    "book salon online",
    "salon de beauté",
    "coiffeur en ligne",
    "Nouryx",
    "salon booking France",
    "hair salon near me",
    "beauty booking platform",
  ],
  authors: [{ name: "Nouryx", url: "https://nouryx.com" }],
  creator: "Nouryx",
  publisher: "Nouryx",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_GB", "es_ES", "it_IT", "pt_PT"],
    url: "https://nouryx.com",
    siteName: "Nouryx",
    title: "Nouryx — La plateforme beauté #1 en France",
    description:
      "Réservez les meilleurs salons de coiffure, spas et barbiers près de chez vous.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Nouryx — Réservez votre salon beauté en ligne",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nouryx — Réservez votre salon beauté en ligne",
    description:
      "Trouvez et réservez les meilleurs salons de coiffure, spas et instituts de beauté en France.",
    images: ["/images/og-default.jpg"],
  },
  alternates: {
    canonical: "https://nouryx.com",
    languages: {
      "fr-FR": "https://nouryx.com",
      "en-GB": "https://nouryx.com",
      "es-ES": "https://nouryx.com",
      "it-IT": "https://nouryx.com",
      "pt-PT": "https://nouryx.com",
      "x-default": "https://nouryx.com",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Nouryx",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#C9AA8B" />
        <link rel="apple-touch-icon" href="/images/icons/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-heading: 'Public Sans', sans-serif;
            --font-body: 'Montserrat', sans-serif;
          }
        `}</style>
      </head>
      <body className="font-body antialiased">
        <QueryProvider>
          <AuthProvider>
            <GlobalLoader />
            <LocationPrompt />
            <AppDownloadPopup />
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
