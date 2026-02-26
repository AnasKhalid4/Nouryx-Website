import type { Metadata } from "next";
import { Public_Sans, Montserrat } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nouryx — Book Beauty & Wellness Services",
  description:
    "Discover top-rated salons, barbers, and beauty experts. Book your next appointment in seconds with Nouryx.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${publicSans.variable} ${montserrat.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
