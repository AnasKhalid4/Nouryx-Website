"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Linkedin, Instagram } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// This is the footer section and add section  and update footer logo
const socialIcons = [
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/nouryx_reservation/" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/nouryx-reservation-18504939b" },
  { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/nouryxreservation" },
  { name: "TikTok", icon: TiktokIcon, href: "https://www.tiktok.com/@nouryx_reservation?_r=1&_t=ZN-9422dJocjXL" },
];

export function Footer() {
  const { t } = useLocale();

  const footerSections = [
    {
      title: t.footer.about.title,
      links: t.footer.about.links.map((label, i) => ({
        label,
        href: ["/about", "#", "#", "#"][i],
      })),
    },
    {
      title: t.footer.business.title,
      links: t.footer.business.links.map((label, i) => ({
        label,
        href: ["/signup", "/pricing", "#"][i],
      })),
    },
    {
      title: t.footer.legal.title,
      links: t.footer.legal.links.map((label) => ({
        label,
        href: "#",
      })),
    },
  ];

  return (
    <footer className="bg-white border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">

            <div className="flex gap-3 mt-4">
              {socialIcons.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#C9AA8B] hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t.footer.social.title}
            </h3>
            <ul className="space-y-2.5">
              {socialIcons.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                  >
                    <social.icon className="h-3.5 w-3.5" />
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-center">
          <div className="relative w-32 h-16 sm:w-48 sm:h-24 md:w-64 md:h-32 lg:w-80 lg:h-40 xl:w-96 xl:h-48 mx-auto">
            <Image
              src="/images/website-logo.png"
              alt="nouryx"
              fill
              sizes="(max-width: 640px) 128px, (max-width: 768px) 192px, (max-width: 1024px) 256px, (max-width: 1280px) 320px, 384px"
              className="object-contain"
              style={{ filter: 'brightness(0) saturate(100%) invert(79%) sepia(31%) saturate(432%) hue-rotate(329deg) brightness(94%) contrast(87%)' }}
            />
          </div>
        </div>
        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            {t.footer.copyright}
          </p>
        </div>


      </div>
    </footer>
  );
}
