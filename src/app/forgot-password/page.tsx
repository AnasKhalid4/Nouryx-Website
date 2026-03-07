"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import Link from "next/link";
import { sendPasswordReset } from "@/lib/firebase/auth";
import { checkEmailExists } from "@/lib/firebase/firestore";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      // Check if email exists in Firestore
      const exists = await checkEmailExists(email);
      if (!exists) {
        setError("No account found with this email address.");
        setLoading(false);
        return;
      }

      // Send password reset email
      await sendPasswordReset(email);
      setSent(true);
      toast.success("Password reset email sent!");
    } catch (err: unknown) {
      const fe = err as { code?: string; message?: string };
      if (fe.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError(fe.message || "Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
              {sent
                ? "Check your inbox for a reset link."
                : t.auth.forgotPassword.subtitle}
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a password reset link to <strong>{email}</strong>.
                Please check your email and follow the instructions.
              </p>
              <Button
                onClick={() => { setSent(false); setEmail(""); }}
                variant="outline"
                className="mt-4"
              >
                Send to another email
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C9AA8B] hover:bg-[#B8956F] text-white h-11 rounded-lg font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    t.auth.forgotPassword.cta
                  )}
                </Button>
              </form>
            </>
          )}

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
