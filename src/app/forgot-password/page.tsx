"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16 lg:py-24">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t.auth.forgotPassword.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t.auth.forgotPassword.subtitle}
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t.auth.forgotPassword.email}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  className="pl-10 h-11 rounded-lg bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#C9AA8B] hover:bg-[#B8956F] text-white h-11 rounded-lg font-medium"
            >
              {t.auth.forgotPassword.cta}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.auth.forgotPassword.backToLogin}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
