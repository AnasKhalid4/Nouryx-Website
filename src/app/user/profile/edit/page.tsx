"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Save, ArrowLeft } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProfilePage() {
  const { t } = useLocale();
  const { user, uid, isLoggedIn, isLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState("");

  useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.fullName || "");
      setProfilePreview(user.profile.profileImage || "");
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!uid || !fullName.trim()) return;
    setSaving(true);
    try {
      let profileImage = user?.profile?.profileImage || "";

      if (profileFile) {
        const imgRef = ref(storage, `users/${uid}/profile_${Date.now()}.${profileFile.name.split(".").pop()}`);
        await uploadBytes(imgRef, profileFile);
        profileImage = await getDownloadURL(imgRef);
      }

      await updateUserProfile(uid, {
        fullName: fullName.trim(),
        profileImage,
      });

      await refreshUser();
      toast.success("Profile updated successfully!");
      router.push("/profile");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9AA8B]" />
      </div>
    );
  }

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <main className="py-8 lg:py-12">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        {/* Back link */}
        <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Link>

        <div className="bg-white rounded-2xl border border-border/50 p-6">
          <h1 className="text-xl font-bold text-foreground mb-6">
            {t.profile.edit.title}
          </h1>

          {/* Profile Image */}
          <div className="flex items-center gap-5 mb-8">
            <div className="h-20 w-20 rounded-full bg-[#C9AA8B] flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
              {profilePreview ? (
                <Image src={profilePreview} alt="" fill className="object-cover" sizes="80px" />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {(fullName || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <Button variant="outline" size="sm" className="text-xs rounded-lg gap-1.5 pointer-events-none">
                  <Upload className="h-3 w-3" /> Change Photo
                </Button>
              </label>
              <p className="text-[10px] text-muted-foreground mt-1.5">JPG, PNG. Max 5MB</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t.auth.signup.fullName}</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="h-11 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t.auth.signup.email}</Label>
              <Input
                value={user?.profile?.email || ""}
                disabled
                className="h-11 rounded-lg bg-muted"
              />
              <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t.auth.signup.phone}</Label>
              <Input
                value={user?.profile?.phoneNumber || ""}
                disabled
                className="h-11 rounded-lg bg-muted"
              />
              <p className="text-[10px] text-muted-foreground">Phone number cannot be changed</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/profile")}
              className="flex-1 rounded-lg h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !fullName.trim()}
              className="flex-1 bg-[#C9AA8B] hover:bg-[#B8956F] text-white h-11 rounded-lg font-medium"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" /> {t.profile.edit.save}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
