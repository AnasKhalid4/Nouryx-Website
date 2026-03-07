"use client";

import { useState } from "react";
import { Globe, Lock, Shield, FileText, Headphones, Trash2, LogOut, ChevronRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { sendPasswordReset, deleteUserAccount, signOutUser } from "@/lib/firebase/auth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const router = useRouter();

  const [showChangePw, setShowChangePw] = useState(false);
  const [changePwLoading, setChangePwLoading] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleChangePassword = async () => {
    const email = user?.profile?.email;
    if (!email) {
      toast.error("No email found for your account");
      return;
    }
    setChangePwLoading(true);
    try {
      await sendPasswordReset(email);
      toast.success("Password reset link sent to your email!");
      setShowChangePw(false);
    } catch {
      toast.error("Failed to send reset email");
    } finally {
      setChangePwLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteUserAccount();
      toast.success("Account permanently deleted");
      router.push("/signup");
    } catch (error: any) {
      if (error?.code === "auth/requires-recent-login") {
        toast.error("Please log out and log back in to verify your identity before deleting your account.");
      } else {
        toast.error("Failed to delete account: " + (error?.message || "Unknown error"));
      }
    } finally {
      setDeleteLoading(false);
      setShowDelete(false);
    }
  };

  const items = [
    { label: t.settings.language, icon: Globe, href: "#" },
    { label: t.settings.changePassword, icon: Lock, href: "#", action: "changePw" },
    { label: t.settings.privacyPolicy, icon: Shield, href: "https://admin.nouryx.com/privacy_policy.html", external: true },
    { label: t.settings.termsConditions, icon: FileText, href: "https://admin.nouryx.com/terms_conditions.html", external: true },
    { label: t.settings.contactUs, icon: Headphones, href: "https://admin.nouryx.com/#/support", external: true },
  ];

  return (
    <main className="py-8 lg:py-12">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {t.settings.title}
        </h1>

        <div className="bg-white rounded-xl border border-border/50 overflow-hidden mb-4">
          {items.map((item, i) => {
            const content = (
              <div
                className={`flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer ${i > 0 ? "border-t border-border/50" : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#F5EDE6] flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-[#C9AA8B]" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            );

            if (item.external) {
              return (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              );
            }
            if ((item as { action?: string }).action === "changePw") {
              return (
                <div key={item.label} className="block cursor-pointer" onClick={() => setShowChangePw(true)}>
                  {content}
                </div>
              );
            }
            return (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            );
          })}
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
          <button
            onClick={() => setShowDelete(true)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <span className="text-sm font-medium text-destructive">{t.settings.deleteAccount}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors border-t border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <LogOut className="h-4 w-4 text-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{t.settings.logout}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showChangePw} onOpenChange={setShowChangePw}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.settings.changePassword}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            We&apos;ll send a password reset link to <strong>{user?.profile?.email}</strong>. Follow the link in your email to set a new password.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowChangePw(false)} disabled={changePwLoading}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={changePwLoading} className="bg-[#C9AA8B] hover:bg-[#B8956F] text-white">
              {changePwLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.settings.deleteModal.title}</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-foreground font-medium mb-1">
              {t.settings.deleteModal.areYouSure}
            </p>
            <p className="text-sm text-muted-foreground">
              {t.settings.deleteModal.descClient}
            </p>
          </div>
          <DialogFooter className="gap-3 sm:gap-3 flex items-center justify-end">
            <Button variant="outline" onClick={() => setShowDelete(false)} disabled={deleteLoading}>
              {t.settings.deleteModal.cancel}
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              variant="destructive"
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.settings.deleteModal.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
