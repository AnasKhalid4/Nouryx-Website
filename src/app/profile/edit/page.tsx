"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, User } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

export default function EditProfilePage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <h1 className="text-2xl font-bold text-foreground mb-8">
            {t.profile.edit.title}
          </h1>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Avatar */}
            <div className="flex justify-center">
              <label className="cursor-pointer group relative">
                <div className="h-28 w-28 rounded-full bg-[#E8D5C0] flex items-center justify-center">
                  <User className="h-12 w-12 text-[#8B7355]" />
                </div>
                <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#C9AA8B] flex items-center justify-center text-white border-2 border-white">
                  <Upload className="h-3.5 w-3.5" />
                </div>
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t.auth.signup.fullName}</Label>
              <Input defaultValue="Alice Martin" className="h-11 rounded-lg bg-white" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t.auth.signup.email}</Label>
              <Input defaultValue="alice@example.com" disabled className="h-11 rounded-lg bg-muted" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t.auth.signup.phone}</Label>
              <Input defaultValue="+33 6 12 34 56 78" disabled className="h-11 rounded-lg bg-muted" />
            </div>

            <Button type="submit" className="w-full bg-[#C9AA8B] hover:bg-[#B8956F] text-white h-11 rounded-lg font-medium">
              {t.profile.edit.save}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
