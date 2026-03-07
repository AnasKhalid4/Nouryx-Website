"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, MapPin, Star, Image as ImageIcon, Loader2, Upload, Save, X } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/hooks/use-auth";
import { updateUserProfile, updateSalonProfile } from "@/lib/firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import Image from "next/image";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export default function DashboardProfilePage() {
  const { t } = useLocale();
  const { user, uid, isLoading, refreshUser } = useAuth();

  // Edit states
  const [editBasic, setEditBasic] = useState(false);
  const [editBusiness, setEditBusiness] = useState(false);
  const [saving, setSaving] = useState(false);

  // Basic info form
  const [editName, setEditName] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState("");

  // Business info form
  const [editShopName, setEditShopName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);

  const openEditBasic = useCallback(() => {
    setEditName(user?.profile?.fullName || "");
    setProfileFile(null);
    setProfilePreview(user?.profile?.profileImage || "");
    setEditBasic(true);
  }, [user]);

  const openEditBusiness = useCallback(() => {
    setEditShopName(user?.salon?.shopName || "");
    setEditDescription(user?.salon?.description || "");
    setEditBusiness(true);
  }, [user]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const saveBasicInfo = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      let profileImage = user?.profile?.profileImage || "";

      if (profileFile) {
        const imgRef = ref(storage, `users/${uid}/profile_${Date.now()}.${profileFile.name.split(".").pop()}`);
        await uploadBytes(imgRef, profileFile);
        profileImage = await getDownloadURL(imgRef);
      }

      await updateUserProfile(uid, {
        fullName: editName.trim(),
        profileImage,
      });

      await refreshUser();
      toast.success("Profile updated!");
      setEditBasic(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const saveBusinessInfo = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      await updateSalonProfile(uid, {
        shopName: editShopName.trim(),
        description: editDescription.trim(),
      });

      await refreshUser();
      toast.success("Business info updated!");
      setEditBusiness(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update business info");
    } finally {
      setSaving(false);
    }
  };

  const handleShopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;

    setUploadingImage(true);
    try {
      const imgRef = ref(storage, `users/${uid}/shop_${Date.now()}.${file.name.split(".").pop()}`);
      await uploadBytes(imgRef, file);
      const url = await getDownloadURL(imgRef);

      const currentImages = user?.salon?.shopImages || [];
      await updateSalonProfile(uid, {
        shopImages: [...currentImages, url],
      });

      await refreshUser();
      toast.success("Image uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeShopImage = async (index: number) => {
    if (!uid || !user?.salon?.shopImages) return;
    const updated = user.salon.shopImages.filter((_, i) => i !== index);
    try {
      await updateSalonProfile(uid, { shopImages: updated });
      await refreshUser();
      toast.success("Image removed");
    } catch {
      toast.error("Failed to remove image");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[#C9AA8B]" />
      </div>
    );
  }

  const salon = user?.salon;
  const profile = user?.profile;
  const location = user?.location;
  const shopImages = salon?.shopImages || [];

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">{t.dashboard.profile.title}</h1>

      {/* Image Gallery */}
      <div className="bg-white rounded-xl border border-border/50 p-4 md:p-5 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-sm font-semibold text-foreground">Shop Images</h2>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleShopImageUpload} disabled={uploadingImage} />
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs rounded-lg gap-1 pointer-events-none" disabled={uploadingImage}>
              {uploadingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              Add Image
            </Button>
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
          {shopImages.length > 0 ? (
            shopImages.map((img, i) => (
              <div key={i} className="aspect-square rounded-xl bg-[#F5EDE6] relative overflow-hidden group">
                <Image src={img} alt={`Shop ${i + 1}`} fill className="object-cover" sizes="200px" />
                <button
                  onClick={() => removeShopImage(i)}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="aspect-square rounded-xl bg-gradient-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center col-span-2">
              <p className="text-sm text-[#C9AA8B]">No shop images yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-border/50 p-4 md:p-5 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-sm font-semibold text-foreground">Owner Information</h2>
          <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs rounded-lg gap-1" onClick={openEditBasic}>
            <Pencil className="h-3 w-3" /> Edit
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-[#C9AA8B] flex items-center justify-center shrink-0 overflow-hidden relative">
            {profile?.profileImage ? (
              <Image src={profile.profileImage} alt="" fill className="object-cover" sizes="64px" />
            ) : (
              <span className="text-white font-bold text-lg md:text-xl">
                {(salon?.shopName || "S").charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{profile?.fullName || "Owner"}</p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">{profile?.email}</p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">{profile?.phoneNumber}</p>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-xl border border-border/50 p-4 md:p-5 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-sm font-semibold text-foreground">Business Information</h2>
          <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs rounded-lg gap-1" onClick={openEditBusiness}>
            <Pencil className="h-3 w-3" /> Edit
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Shop Name</p>
            <p className="text-sm font-medium text-foreground">{salon?.shopName || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Description</p>
            <p className="text-xs md:text-sm text-foreground">{salon?.description || "No description"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Location</p>
            <p className="text-xs md:text-sm text-foreground flex items-center gap-1.5 break-words">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1">{location?.address || "—"}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Rating</p>
              <p className="text-sm font-medium text-foreground flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {salon?.rating?.toFixed(1) || "0.0"} ({salon?.ratingCount || 0})
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">SIRET</p>
              <p className="text-sm font-medium text-foreground break-all">{salon?.siretNumber || "—"}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-xs text-muted-foreground mb-0.5">Legal Status</p>
              <p className="text-sm font-medium text-foreground">{salon?.legalStatus || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Basic Info Dialog */}
      <Dialog open={editBasic} onOpenChange={setEditBasic}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit Owner Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Profile Image */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[#C9AA8B] flex items-center justify-center shrink-0 overflow-hidden relative">
                {profilePreview ? (
                  <Image src={profilePreview} alt="" fill className="object-cover" sizes="64px" />
                ) : (
                  <span className="text-white font-bold text-xl">{(editName || "S").charAt(0)}</span>
                )}
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                <Button variant="outline" size="sm" className="text-xs rounded-lg gap-1 pointer-events-none">
                  <Upload className="h-3 w-3" /> Change Photo
                </Button>
              </label>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Full Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Email</Label>
              <Input value={profile?.email || ""} disabled className="h-10 rounded-lg bg-muted" />
              <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Phone</Label>
              <Input value={profile?.phoneNumber || ""} disabled className="h-10 rounded-lg bg-muted" />
              <p className="text-[10px] text-muted-foreground">Phone cannot be changed</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditBasic(false)} className="flex-1 rounded-lg h-10">
                Cancel
              </Button>
              <Button onClick={saveBasicInfo} disabled={saving || !editName.trim()} className="flex-1 bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-lg h-10">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Save</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Business Info Dialog */}
      <Dialog open={editBusiness} onOpenChange={setEditBusiness}>
        <DialogContent className="sm:max-w-md w-[95vw] rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit Business Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-sm">Shop Name</Label>
              <Input value={editShopName} onChange={(e) => setEditShopName(e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Description</Label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full border border-border rounded-lg p-3 text-sm resize-none h-28 focus:outline-none focus:border-[#C9AA8B]"
                placeholder="Describe your salon..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditBusiness(false)} className="flex-1 rounded-lg h-10">
                Cancel
              </Button>
              <Button onClick={saveBusinessInfo} disabled={saving || !editShopName.trim()} className="flex-1 bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-lg h-10">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Save</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
