"use client";

import { Smartphone } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export function DownloadAppSection() {
  const { t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @keyframes slideFromBottom {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideFromRight {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-up {
          opacity: 0;
          animation: slideFromBottom 0.8s ease-out forwards;
        }
        
        .animate-slide-right {
          opacity: 0;
          animation: slideFromRight 0.8s ease-out forwards;
        }
        
        .animate-delay-1 {
          animation-delay: 0.2s;
        }
        
        .animate-delay-2 {
          animation-delay: 0.4s;
        }
      `}</style>
      
      <section ref={sectionRef} className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Text content */}
            <div className={isVisible ? 'animate-slide-up' : ''}>
              <p className={`text-sm text-muted-foreground mb-2 flex items-center gap-2 ${isVisible ? 'animate-slide-up animate-delay-1' : ''}`}>
                {t.downloadApp.availableOn}
                <span className="font-medium text-foreground">iOS</span>
                <span className="font-medium text-foreground">Android</span>
              </p>
              <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight ${isVisible ? 'animate-slide-up animate-delay-1' : ''}`}>
                {t.downloadApp.title}
              </h2>
              <p className={`mt-4 text-muted-foreground max-w-md ${isVisible ? 'animate-slide-up animate-delay-2' : ''}`}>
                {t.downloadApp.subtitle}
              </p>
              <div className={`mt-8 flex items-center gap-4 ${isVisible ? 'animate-slide-up animate-delay-2' : ''}`}>
                {/* App Store Badge Placeholder */}
                <div className="h-12 px-5 bg-foreground rounded-xl flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] text-white/70 leading-none">Download on the</p>
                    <p className="text-sm font-semibold text-white leading-tight">App Store</p>
                  </div>
                </div>
                {/* Google Play Badge Placeholder */}
                <div className="h-12 px-5 bg-foreground rounded-xl flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302L16.5 14l-2.302-2.302 3.5-2.19zM5.864 2.658l10.937 6.333-2.302 2.302-8.635-8.635z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] text-white/70 leading-none">Get it on</p>
                    <p className="text-sm font-semibold text-white leading-tight">Google Play</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Download image */}
            <div className={`relative rounded-2xl overflow-hidden ${isVisible ? 'animate-slide-right' : ''}`}>
              <Image
                src="/images/download.jpg"
                alt="Mobile app download"
                width={400}
                height={300}
                className=" object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
