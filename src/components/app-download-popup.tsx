"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocale } from "@/hooks/use-locale";

const IOS_APP_URL = "https://apps.apple.com/us/app/nouryx/id6758208118";
const ANDROID_APP_URL =
  "https://play.google.com/store/apps/details?id=com.nouryx.service";

export function AppDownloadPopup() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;

    const scheduleOpen = () => {
      timeoutId = window.setTimeout(() => setOpen(true), 10000);
    };

    if (document.readyState === "complete") {
      scheduleOpen();
    } else {
      window.addEventListener("load", scheduleOpen, { once: true });
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden border-border/50 rounded-2xl sm:max-w-3xl">
        <div className="flex flex-col md:grid md:grid-cols-2">
          <div className="relative bg-white flex items-center justify-center p-6 md:p-8">
            <Image
              src="/images/download.jpg"
              alt="Nouryx mobile app"
              width={520}
              height={420}
              className="w-full h-auto max-h-72 md:max-h-none object-contain"
              priority
            />
          </div>

          <div className="p-6 md:p-8 flex flex-col justify-center">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {t.appDownloadPopup.title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {t.appDownloadPopup.description}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 flex flex-row gap-3">
              <a
                href={IOS_APP_URL}
                target="_blank"
                rel="noreferrer"
                className="h-12 px-5 bg-foreground rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-white/70 leading-none">{t.appDownloadPopup.getItOn}</p>
                  <p className="text-[10px] font-semibold text-white leading-tight">{t.appDownloadPopup.appStore}</p>
                </div>
              </a>
              <a
                href={ANDROID_APP_URL}
                target="_blank"
                rel="noreferrer"
                className="h-12 px-5 bg-foreground rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302L16.5 14l-2.302-2.302 3.5-2.19zM5.864 2.658l10.937 6.333-2.302 2.302-8.635-8.635z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-white/70 leading-none">{t.appDownloadPopup.getItOn}</p>
                  <p className="text-[10px] font-semibold text-white leading-tight">{t.appDownloadPopup.googlePlay}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
