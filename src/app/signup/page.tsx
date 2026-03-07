"use client";

import { useState, useRef, useCallback } from "react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { sendOtp, createRecaptchaVerifier, verifyOtpAndCreateUser, clearRecaptchaVerifier } from "@/lib/firebase/auth";
import { createUser, checkEmailExists, checkPhoneExists } from "@/lib/firebase/firestore";
import { uploadUserProfileImage, uploadSalonLogo, uploadSalonShopImages } from "@/lib/firebase/storage";
import { getPlaceDetails, autocomplete } from "@/lib/google-places";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

// Normalize phone to E.164 format
function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-().]/g, ""); // strip spaces, dashes, parens
  if (!p.startsWith("+")) p = "+" + p;
  return p;
}
function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone);
}

const COLORS = {
  accent: "#C9AA8B",
  accentDark: "#B8956F",
  accentLight: "#F5EDE6",
} as const;

type Screen = "select" | "client" | "salon";

interface IconProps { size?: number; style?: React.CSSProperties; }

const Mail = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" /></svg>;
const Lock = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
const User = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
const Phone = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10 21 3 14 3 5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.3 1L6.6 10.8z" /></svg>;
const EyeIcon = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const EyeOff = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
const Upload = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const MapPin = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const ArrowLeft = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
const ArrowRight = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const Building = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="1" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>;
const Check = ({ size = 12, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>;
const Globe = ({ size = 13, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></svg>;
const Spinner = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ animation: "spin 0.7s linear infinite" }}><path d="M21 12a9 9 0 11-6.22-8.56" /></svg>;

function AppInput({ icon: Icon, type = "text", placeholder, rightIcon, onRightIcon, value, onChange, disabled, onKeyDown }: { icon?: React.ComponentType<IconProps>; type?: string; placeholder?: string; rightIcon?: React.ReactNode; onRightIcon?: () => void; value?: string; onChange?: (val: string) => void; disabled?: boolean; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {Icon && <span style={{ position: "absolute", left: 13, color: "#9CA3AF", display: "flex", pointerEvents: "none" }}><Icon size={14} /></span>}
      <input
        type={type} placeholder={placeholder} value={value} disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={onKeyDown}
        style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #E5E7EB", background: disabled ? "#F3F4F6" : "#FAFAF9", padding: Icon ? "0 38px 0 40px" : "0 13px", fontSize: 14, color: "#1C1917", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", letterSpacing: "0.01em", boxSizing: "border-box" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.accentLight}`; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; }}
      />
      {rightIcon && <button type="button" onClick={onRightIcon} style={{ position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex", padding: 0 }}>{rightIcon}</button>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", marginBottom: 5, fontSize: 11, fontWeight: 700, color: "#57534E", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{children}</label>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column" }}><FieldLabel>{label}</FieldLabel>{children}</div>;
}

function PrimaryButton({ children, onClick, type = "button", style: ex = {}, disabled }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit"; style?: React.CSSProperties; disabled?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: "100%", height: 44, borderRadius: 10, background: disabled ? "#D6CFC9" : hov ? COLORS.accentDark : COLORS.accent, color: "#fff", border: "none", cursor: disabled ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", transition: "background 0.2s, transform 0.15s", transform: hov && !disabled ? "translateY(-1px)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, ...ex }}>
      {children}
    </button>
  );
}
function OutlineButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flex: 1, height: 44, borderRadius: 10, background: hov ? "#F5F5F4" : "#fff", color: "#44403C", border: "1.5px solid #E5E7EB", cursor: disabled ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
      {children}
    </button>
  );
}

function UploadZone({ round = false, label, Icon = Upload, preview, onFileSelect }: { round?: boolean; label: string; Icon?: React.ComponentType<IconProps>; preview?: string | null; onFileSelect?: (file: File) => void }) {
  return (
    <label style={{ cursor: "pointer", display: "block" }}>
      <div style={{ height: 84, width: 84, borderRadius: round ? "50%" : 16, background: preview ? "transparent" : COLORS.accentLight, border: preview ? "none" : `2px dashed ${COLORS.accent}50`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s", margin: "0 auto", overflow: "hidden" }}>
        {preview ? (
          <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <>
            <Icon size={16} style={{ color: `${COLORS.accent}90` }} />
            <span style={{ fontSize: 9.5, color: "#9CA3AF", marginTop: 4, letterSpacing: "0.05em" }}>{label}</span>
          </>
        )}
      </div>
      <input type="file" style={{ display: "none" }} accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f && onFileSelect) onFileSelect(f); }} />
    </label>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 4, width: "80%" }}>
      {[1, 2].map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ height: 28, width: 28, borderRadius: "50%", background: step > s ? `${COLORS.accent}20` : step === s ? COLORS.accent : "#F3F4F6", color: step > s ? COLORS.accent : step === s ? "#fff" : "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: step > s ? `1.5px solid ${COLORS.accent}50` : "none", transition: "all 0.3s" }}>
              {step > s ? <Check size={12} /> : s}
            </div>
            <span style={{ fontSize: 11, fontWeight: step === s ? 700 : 400, color: step === s ? "#1C1917" : "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              {s === 1 ? "Account" : "Salon Info"}
            </span>
          </div>
          {i === 0 && <div style={{ flex: 1, height: 1.5, margin: "0 12px", background: step > 1 ? COLORS.accent : "#E5E7EB", transition: "background 0.4s", minWidth: 24 }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function AppSelect({ options, placeholder, value, onChange, disabled }: { options: string[]; placeholder: string; value?: string; onChange?: (val: string) => void; disabled?: boolean }) {
  return (
    <select value={value} onChange={(e) => onChange?.(e.target.value)} disabled={disabled}
      style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#FAFAF9", padding: "0 36px 0 13px", fontSize: 14, color: "#1C1917", cursor: "pointer", outline: "none", appearance: "none" as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", boxSizing: "border-box" }}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Panel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", transform: active ? "translateX(0)" : "translateX(100%)", opacity: active ? 1 : 0, transition: "transform 0.45s cubic-bezier(.77,0,.18,1), opacity 0.3s ease", pointerEvents: active ? "auto" : "none", padding: "28px 52px 44px" }}
      className="panel-scroll">
      {children}
    </div>
  );
}

function NavBack({ label, onClick }: { label: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: 6, background: hov ? "#F5F0EB" : "transparent", border: "none", cursor: "pointer", color: hov ? "#1C1917" : "#78716C", fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", padding: "6px 10px", borderRadius: 8, transition: "all 0.2s", whiteSpace: "nowrap" }}>
      <ArrowLeft size={13} />{label}
    </button>
  );
}

// OTP Modal
function OTPModal({ visible, phone, onVerify, onClose, loading }: { visible: boolean; phone: string; onVerify: (otp: string) => void; onClose: () => void; loading: boolean }) {
  const [otp, setOtp] = useState("");
  if (!visible) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: "#1C1917", marginBottom: 6 }}>Verify Phone</h3>
        <p style={{ fontSize: 14, color: "#78716C", marginBottom: 20 }}>Enter the 6-digit code sent to <strong>{phone}</strong></p>
        <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" disabled={loading}
          style={{ width: "100%", height: 52, textAlign: "center", fontSize: 28, fontWeight: 700, letterSpacing: "0.4em", borderRadius: 12, border: `2px solid ${COLORS.accent}`, outline: "none", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} disabled={loading} style={{ flex: 1, height: 44, borderRadius: 10, background: "#F5F5F4", border: "1.5px solid #E5E7EB", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#57534E" }}>Cancel</button>
          <button onClick={() => onVerify(otp)} disabled={loading || otp.length < 6} style={{ flex: 1, height: 44, borderRadius: 10, background: otp.length === 6 && !loading ? COLORS.accent : "#D6CFC9", color: "#fff", border: "none", cursor: otp.length === 6 && !loading ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {loading ? <Spinner /> : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}

const RIGHT_COPY: Record<Screen, { quote: string; sub: string }> = {
  select: { quote: "Your beauty, perfectly organised.", sub: "Book the best salons & spas near you." },
  client: { quote: "Discover & book in seconds.", sub: "Thousands of salons, one elegant platform." },
  salon: { quote: "Grow your salon business.", sub: "Smart bookings. Happy clients. Less stress." },
};

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [screen, setScreen] = useState<Screen>("select");
  const [salonStep, setSalonStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  // Client form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [clientConfirmPw, setClientConfirmPw] = useState("");
  const [clientAgree, setClientAgree] = useState(false);
  const [clientPhoto, setClientPhoto] = useState<File | null>(null);
  const [clientPhotoPreview, setClientPhotoPreview] = useState<string | null>(null);

  // Salon form state
  const [salonName, setSalonName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [salonEmail, setSalonEmail] = useState("");
  const [salonPhone, setSalonPhone] = useState("");
  const [salonPassword, setSalonPassword] = useState("");
  const [salonConfirmPw, setSalonConfirmPw] = useState("");
  const [salonLogo, setSalonLogo] = useState<File | null>(null);
  const [salonLogoPreview, setSalonLogoPreview] = useState<string | null>(null);
  const [salonAddress, setSalonAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<{ description: string; placeId: string }[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
  const [shopPhotos, setShopPhotos] = useState<(File | null)[]>([null, null, null, null]);
  const [shopPhotoPreviews, setShopPhotoPreviews] = useState<(string | null)[]>([null, null, null, null]);
  const [siretNumber, setSiretNumber] = useState("");
  const [legalStatus, setLegalStatus] = useState("");
  const [salonDescription, setSalonDescription] = useState("");
  const [salonAgree, setSalonAgree] = useState(false);

  const rp = RIGHT_COPY[screen];
  const goTo = (s: Screen) => { setScreen(s); setSalonStep(1); setError(""); };
  const onBack = () => screen !== "select" ? goTo("select") : router.push("/");

  const handlePhotoSelect = useCallback((file: File, type: "client" | "salon") => {
    const url = URL.createObjectURL(file);
    if (type === "client") { setClientPhoto(file); setClientPhotoPreview(url); }
    else { setSalonLogo(file); setSalonLogoPreview(url); }
  }, []);

  const handleShopPhotoSelect = useCallback((file: File, index: number) => {
    const url = URL.createObjectURL(file);
    setShopPhotos(prev => { const n = [...prev]; n[index] = file; return n; });
    setShopPhotoPreviews(prev => { const n = [...prev]; n[index] = url; return n; });
  }, []);

  const handleAddressSearch = useCallback(async (q: string) => {
    setSalonAddress(q);
    setSelectedPlaceId("");
    setHighlightedSuggestion(-1);
    if (q.length > 2) {
      const results = await autocomplete(q);
      setAddressSuggestions(results);
    } else {
      setAddressSuggestions([]);
    }
  }, []);

  const handleAddressSelect = useCallback(async (placeId: string, description: string) => {
    setSalonAddress(description);
    setSelectedPlaceId(placeId);
    setAddressSuggestions([]);
    setHighlightedSuggestion(-1);
  }, []);

  const handleAddressKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (addressSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedSuggestion((prev) => Math.min(prev + 1, addressSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedSuggestion((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightedSuggestion >= 0) {
      e.preventDefault();
      const s = addressSuggestions[highlightedSuggestion];
      handleAddressSelect(s.placeId, s.description);
    } else if (e.key === "Escape") {
      setAddressSuggestions([]);
      setHighlightedSuggestion(-1);
    }
  }, [addressSuggestions, highlightedSuggestion, handleAddressSelect]);

  // Client signup
  const handleClientSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!clientName || !clientEmail || !clientPhone || !clientPassword) { setError("All fields are required."); return; }
    if (clientPassword !== clientConfirmPw) { setError("Passwords don't match."); return; }
    if (clientPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!clientAgree) { setError("Please agree to the Terms & Conditions."); return; }

    const phone = normalizePhone(clientPhone);
    if (!isValidE164(phone)) { setError("Please enter a valid phone number with country code (e.g. +33612345678)"); return; }

    setLoading(true);
    try {
      const [emailExists, phoneExists] = await Promise.all([
        checkEmailExists(clientEmail), checkPhoneExists(phone)
      ]);
      if (emailExists) { setError("Email already in use."); setLoading(false); return; }
      if (phoneExists) { setError("Phone number already registered."); setLoading(false); return; }

      // Send OTP — always create a fresh RecaptchaVerifier
      const verifier = createRecaptchaVerifier("recaptcha-container");
      recaptchaRef.current = verifier;
      const result = await sendOtp(phone, verifier);
      setConfirmResult(result);
      setShowOtp(true);
      setLoading(false);
    } catch (err: unknown) {
      const fe = err as { message?: string };
      setError(fe.message || "Failed to send OTP.");
      clearRecaptchaVerifier();
      recaptchaRef.current = null;
      setLoading(false);
    }
  };

  const handleClientOtpVerify = async (otp: string) => {
    if (!confirmResult) return;
    setLoading(true);
    try {
      const firebaseUser = await verifyOtpAndCreateUser(confirmResult, otp, clientEmail, clientPassword);

      // Upload photo if selected
      let profileImage = "";
      if (clientPhoto) {
        profileImage = await uploadUserProfileImage(clientPhoto, firebaseUser.uid);
      }

      // Create Firestore doc
      await createUser(firebaseUser.uid, {
        role: "user",
        data: {
          fullName: clientName,
          email: clientEmail,
          phoneNumber: clientPhone,
          profileImage,
        },
      });

      const user = await (await import("@/lib/firebase/firestore")).fetchUser(firebaseUser.uid);
      setUser(user);
      setShowOtp(false);
      clearRecaptchaVerifier();
      recaptchaRef.current = null;
      toast.success("Account created successfully!");
      router.push("/");
    } catch (err: unknown) {
      const fe = err as { message?: string };
      setError(fe.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Salon signup step 1 → step 2
  const handleSalonStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!salonName || !ownerName || !salonEmail || !salonPhone || !salonPassword) { setError("All fields are required."); return; }
    if (salonPassword !== salonConfirmPw) { setError("Passwords don't match."); return; }
    if (salonPassword.length < 8) { setError("Password must be at least 8 characters."); return; }

    const phone = normalizePhone(salonPhone);
    if (!isValidE164(phone)) { setError("Please enter a valid phone number with country code (e.g. +33612345678)"); return; }

    setLoading(true);
    try {
      const [emailExists, phoneExists] = await Promise.all([
        checkEmailExists(salonEmail), checkPhoneExists(salonPhone)
      ]);
      if (emailExists) { setError("Email already in use."); setLoading(false); return; }
      if (phoneExists) { setError("Phone number already registered."); setLoading(false); return; }
      setSalonStep(2);
    } catch (err: unknown) {
      const fe = err as { message?: string };
      setError(fe.message || "Validation error.");
    } finally {
      setLoading(false);
    }
  };

  // Salon signup step 2 → OTP → create
  const handleSalonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!salonAddress || !selectedPlaceId) { setError("Please select a salon address."); return; }
    if (!siretNumber) { setError("SIRET number is required."); return; }
    if (!legalStatus) { setError("Legal status is required."); return; }
    if (!salonDescription || salonDescription.length < 10) { setError("Description must be at least 10 characters."); return; }
    if (!salonAgree) { setError("Please agree to the Terms & Conditions."); return; }

    setLoading(true);
    try {
      // Always create a fresh RecaptchaVerifier
      const verifier = createRecaptchaVerifier("recaptcha-container");
      recaptchaRef.current = verifier;
      const result = await sendOtp(normalizePhone(salonPhone), verifier);
      setConfirmResult(result);
      setShowOtp(true);
      setLoading(false);
    } catch (err: unknown) {
      const fe = err as { message?: string };
      setError(fe.message || "Failed to send OTP.");
      clearRecaptchaVerifier();
      recaptchaRef.current = null;
      setLoading(false);
    }
  };

  const handleSalonOtpVerify = async (otp: string) => {
    if (!confirmResult) return;
    setLoading(true);
    try {
      const firebaseUser = await verifyOtpAndCreateUser(confirmResult, otp, salonEmail, salonPassword);

      // Upload logo
      let logoUrl = "";
      if (salonLogo) {
        logoUrl = await uploadSalonLogo(salonLogo, firebaseUser.uid);
      }

      // Upload shop photos
      const validPhotos = shopPhotos.filter(Boolean) as File[];
      let shopImageUrls: string[] = [];
      if (validPhotos.length > 0) {
        shopImageUrls = await uploadSalonShopImages(validPhotos, firebaseUser.uid);
      }

      // Get place details for location
      const placeDetails = await getPlaceDetails(selectedPlaceId);

      // Create Firestore doc
      await createUser(firebaseUser.uid, {
        role: "salon",
        data: {
          fullName: ownerName,
          email: salonEmail,
          phoneNumber: salonPhone,
          profileImage: logoUrl,
        },
        salon: {
          shopName: salonName,
          shopImages: shopImageUrls,
          siretNumber,
          legalStatus,
          description: salonDescription,
          status: "pending",
          autoAcceptBooking: autoAccept ? 1 : 0,
          isFeatured: false,
          rating: 0,
          ratingCount: 0,
          totalOrders: 0,
          completedOrders: 0,
          totalEarnings: 0,
        },
        location: placeDetails ? {
          address: placeDetails.address,
          city: placeDetails.city,
          country: placeDetails.country,
          placeId: placeDetails.placeId,
          lat: placeDetails.lat,
          lng: placeDetails.lng,
        } : {
          address: salonAddress,
          city: "",
          country: "",
          placeId: selectedPlaceId,
          lat: 0,
          lng: 0,
        },
      });

      setShowOtp(false);
      clearRecaptchaVerifier();
      recaptchaRef.current = null;
      toast.success("Salon registered! Awaiting approval.");
      router.push("/login");
    } catch (err: unknown) {
      const fe = err as { message?: string };
      setError(fe.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Montserrat:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.accent}44; border-radius: 4px; }
        input::placeholder, textarea::placeholder { color: #C4B9B4; font-family: 'Cormorant Garamond', serif; }
        textarea { resize: none; }
        .role-card { transition: border-color 0.22s, background 0.22s, transform 0.22s, box-shadow 0.22s !important; }
        .role-card:hover { border-color: ${COLORS.accent} !important; background: ${COLORS.accentLight} !important; transform: translateY(-1px) !important; box-shadow: 0 4px 16px rgba(201,170,139,0.14) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .signup-root { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: #FAFAF9; }
        .signup-left { width: 50%; min-width: 460px; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        .signup-topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 52px; border-bottom: 1px solid #F0EDE9; flex-shrink: 0; }
        .select-panel { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 0 52px; }
        .panel-scroll { padding: 28px 52px 44px !important; }
        .signup-right { flex: 1; height: 100vh; position: relative; overflow: hidden; background: #1C1917; }
        @media (max-width: 767px) {
          .signup-root { height: 100svh; overflow-y: auto; }
          .signup-right { display: none; }
          .signup-left { width: 100%; min-width: unset; height: 100%; min-height: 100svh; align-items: center; }
          .signup-topbar { width: 100%; padding: 16px 24px; }
          .select-panel { padding: 0 24px !important; align-items: center; }
          .panel-scroll { padding: 28px 24px 44px !important; }
        }
      `}</style>

      <div id="recaptcha-container" />

      <OTPModal
        visible={showOtp}
        phone={screen === "client" ? clientPhone : salonPhone}
        loading={loading}
        onVerify={screen === "client" ? handleClientOtpVerify : handleSalonOtpVerify}
        onClose={() => setShowOtp(false)}
      />

      <div className="signup-root">
        <div className="signup-left">
          <div className="signup-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Image src="/images/website-logo.png" alt="Nouryx" width={120} height={28} className="h-7 w-auto" />
            </div>
            <NavBack label={screen !== "select" ? "Back" : "Home"} onClick={onBack} />
          </div>

          <div style={{ flex: 1, overflow: "hidden", position: "relative", width: "100%" }}>

            {/* SELECT */}
            <div className="select-panel" style={{ transform: screen === "select" ? "translateX(0)" : "translateX(-100%)", opacity: screen === "select" ? 1 : 0, transition: "transform 0.45s cubic-bezier(.77,0,.18,1), opacity 0.3s ease", pointerEvents: screen === "select" ? "auto" : "none" }}>
              <div style={{ width: "100%", maxWidth: 420 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: COLORS.accent, marginBottom: 10 }}>Welcome to Nouryx</p>
                <h1 style={{ fontSize: 36, fontWeight: 600, color: "#1C1917", lineHeight: 1.18, marginBottom: 6 }}>Sign up</h1>
                <p style={{ color: "#A8A29E", fontSize: 15.5, marginBottom: 36, fontWeight: 300 }}>Choose how you&apos;d like to continue.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {([
                    { key: "client" as Screen, title: "For Customers", sub: "Book salons and spas near you", symbol: "✦" },
                    { key: "salon" as Screen, title: "For Professionals", sub: "Manage and grow your business", symbol: "◈" },
                  ]).map(({ key, title, sub, symbol }) => (
                    <button key={key} className="role-card" onClick={() => goTo(key)}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 12, border: "1.5px solid #E5E7EB", background: "#fff", cursor: "pointer", textAlign: "left", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", width: "100%" }}>
                      <div style={{ height: 40, width: 40, borderRadius: 10, background: COLORS.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0, color: COLORS.accent }}>{symbol}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#1C1917", marginBottom: 1 }}>{title}</div>
                        <div style={{ fontSize: 13, color: "#A8A29E", fontWeight: 300 }}>{sub}</div>
                      </div>
                      <div style={{ color: "#D6CFC9", flexShrink: 0, display: "flex" }}><ArrowRight size={13} /></div>
                    </button>
                  ))}
                </div>
                <p style={{ marginTop: 28, fontSize: 13.5, color: "#A8A29E", textAlign: "center" }}>
                  Already have an account?{" "}<Link href="/login" style={{ color: COLORS.accent, fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
                </p>
                <div style={{ marginTop: 36, display: "flex", gap: 20, justifyContent: "center" }}>
                  <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "#A8A29E", fontSize: 12, padding: 0 }}><Globe size={12} /> Help &amp; Support</button>
                </div>
              </div>
            </div>

            {/* CLIENT FORM */}
            <Panel active={screen === "client"}>
              <div style={{ marginBottom: 22 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: COLORS.accent, textTransform: "uppercase" as const, marginBottom: 7 }}>Customer Account</p>
                <h2 style={{ fontSize: 28, fontWeight: 600, color: "#1C1917", lineHeight: 1.2 }}>Create your profile</h2>
              </div>
              {error && screen === "client" && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13, marginBottom: 12, fontWeight: 500 }}>{error}</div>}
              <form style={{ display: "flex", flexDirection: "column", gap: 13 }} onSubmit={handleClientSignup}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
                  <UploadZone round label="Photo" preview={clientPhotoPreview} onFileSelect={(f) => handlePhotoSelect(f, "client")} />
                </div>
                <Field label="Full Name"><AppInput icon={User} placeholder="John Doe" value={clientName} onChange={setClientName} disabled={loading} /></Field>
                <Field label="Email Address"><AppInput icon={Mail} type="email" placeholder="hello@example.com" value={clientEmail} onChange={setClientEmail} disabled={loading} /></Field>
                <Field label="Phone Number"><AppInput icon={Phone} type="tel" placeholder="+33 6 12 34 56 78" value={clientPhone} onChange={setClientPhone} disabled={loading} /></Field>
                <Field label="Password"><AppInput icon={Lock} type={showPw ? "text" : "password"} placeholder="••••••••" rightIcon={showPw ? <EyeOff size={14} /> : <EyeIcon size={14} />} onRightIcon={() => setShowPw((p) => !p)} value={clientPassword} onChange={setClientPassword} disabled={loading} /></Field>
                <Field label="Confirm Password"><AppInput icon={Lock} type="password" placeholder="••••••••" value={clientConfirmPw} onChange={setClientConfirmPw} disabled={loading} /></Field>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer", marginTop: 2 }} onClick={() => setClientAgree(p => !p)}>
                  <div style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px solid ${COLORS.accent}`, flexShrink: 0, marginTop: 1, background: clientAgree ? COLORS.accent : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {clientAgree && <Check size={10} style={{ color: "#fff" }} />}
                  </div>
                  <span style={{ fontSize: 13, color: "#78716C" }}>I agree to the <Link href="#" style={{ color: COLORS.accent, fontWeight: 600, textDecoration: "none" }}>Terms &amp; Conditions</Link> and <Link href="#" style={{ color: COLORS.accent, fontWeight: 600, textDecoration: "none" }}>Privacy Policy</Link></span>
                </label>
                <PrimaryButton type="submit" style={{ marginTop: 2 }} disabled={loading}>{loading ? <><Spinner /> CREATING...</> : <>CREATE ACCOUNT <ArrowRight size={13} /></>}</PrimaryButton>
              </form>
              <p style={{ marginTop: 18, textAlign: "center", fontSize: 13.5, color: "#A8A29E" }}>Already have an account? <Link href="/login" style={{ fontWeight: 600, color: COLORS.accent, textDecoration: "none" }}>Sign in</Link></p>
            </Panel>

            {/* SALON FORM */}
            <Panel active={screen === "salon"}>
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: COLORS.accent, textTransform: "uppercase" as const, marginBottom: 7 }}>Professional Account</p>
                <h2 style={{ fontSize: 28, fontWeight: 600, color: "#1C1917", lineHeight: 1.2 }}>Register your salon</h2>
              </div>
              <StepIndicator step={salonStep} />
              {error && screen === "salon" && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13, marginTop: 12, marginBottom: 4, fontWeight: 500 }}>{error}</div>}

              {salonStep === 1 && (
                <form style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }} onSubmit={handleSalonStep1Submit}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
                    <UploadZone Icon={Building} label="Logo" preview={salonLogoPreview} onFileSelect={(f) => handlePhotoSelect(f, "salon")} />
                  </div>
                  <Field label="Salon Name"><AppInput placeholder="Élégance Coiffure" value={salonName} onChange={setSalonName} disabled={loading} /></Field>
                  <Field label="Owner Name"><AppInput icon={User} placeholder="Marie Dupont" value={ownerName} onChange={setOwnerName} disabled={loading} /></Field>
                  <Field label="Email Address"><AppInput icon={Mail} type="email" placeholder="salon@example.com" value={salonEmail} onChange={setSalonEmail} disabled={loading} /></Field>
                  <Field label="Phone Number"><AppInput icon={Phone} type="tel" placeholder="+33 6 12 34 56 78" value={salonPhone} onChange={setSalonPhone} disabled={loading} /></Field>
                  <Field label="Password"><AppInput icon={Lock} type={showPw ? "text" : "password"} placeholder="••••••••" rightIcon={showPw ? <EyeOff size={14} /> : <EyeIcon size={14} />} onRightIcon={() => setShowPw((p) => !p)} value={salonPassword} onChange={setSalonPassword} disabled={loading} /></Field>
                  <Field label="Confirm Password"><AppInput icon={Lock} type="password" placeholder="••••••••" value={salonConfirmPw} onChange={setSalonConfirmPw} disabled={loading} /></Field>
                  <PrimaryButton type="submit" style={{ marginTop: 2 }} disabled={loading}>{loading ? <><Spinner /> VALIDATING...</> : <>CONTINUE <ArrowRight size={13} /></>}</PrimaryButton>
                </form>
              )}

              {salonStep === 2 && (
                <form style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }} onSubmit={handleSalonSubmit}>
                  <Field label="Salon Address">
                    <div style={{ position: "relative" }}>
                      <AppInput icon={MapPin} placeholder="12 Rue de Rivoli, Paris" value={salonAddress} onChange={handleAddressSearch} disabled={loading} onKeyDown={handleAddressKeyDown} />
                      {addressSuggestions.length > 0 && (
                        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, marginTop: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 10, maxHeight: 200, overflowY: "auto" }}>
                          {addressSuggestions.map((s, idx) => (
                            <button key={s.placeId} type="button" onClick={() => handleAddressSelect(s.placeId, s.description)}
                              style={{ width: "100%", padding: "10px 14px", border: "none", background: idx === highlightedSuggestion ? COLORS.accentLight : "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: "#1C1917", borderBottom: "1px solid #F5F5F4" }}
                              onMouseEnter={() => setHighlightedSuggestion(idx)}
                              onMouseLeave={() => setHighlightedSuggestion(-1)}>
                              {s.description}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Field>
                  <div>
                    <FieldLabel>Shop Photos</FieldLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <label key={i} style={{ cursor: "pointer" }}>
                          <div style={{ aspectRatio: "1", borderRadius: 10, background: shopPhotoPreviews[i] ? "transparent" : COLORS.accentLight, border: shopPhotoPreviews[i] ? "none" : `2px dashed ${COLORS.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            {shopPhotoPreviews[i] ? <img src={shopPhotoPreviews[i]!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Upload size={14} style={{ color: `${COLORS.accent}80` }} />}
                          </div>
                          <input type="file" style={{ display: "none" }} accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleShopPhotoSelect(f, i); }} />
                        </label>
                      ))}
                    </div>
                  </div>
                  <Field label="SIRET Number"><AppInput placeholder="123 456 789 00012" value={siretNumber} onChange={setSiretNumber} disabled={loading} /></Field>
                  <Field label="Legal Status"><AppSelect options={["SAS", "SARL", "EURL", "Auto-entrepreneur", "SA"]} placeholder="Select status..." value={legalStatus} onChange={setLegalStatus} disabled={loading} /></Field>
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea placeholder="Tell clients about your salon..." rows={3} value={salonDescription} onChange={(e) => setSalonDescription(e.target.value)} disabled={loading}
                      style={{ width: "100%", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#FAFAF9", padding: "11px 13px", fontSize: 14, color: "#1C1917", outline: "none", boxSizing: "border-box" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.accentLight}`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1917" }}>Auto-accept bookings</div>
                      <div style={{ fontSize: 11.5, color: "#A8A29E", marginTop: 1 }}>Confirm appointments automatically</div>
                    </div>
                    <div role="switch" aria-checked={autoAccept} onClick={() => setAutoAccept((a) => !a)}
                      style={{ width: 42, height: 23, borderRadius: 12, background: autoAccept ? COLORS.accent : "#E5E7EB", position: "relative", cursor: "pointer", transition: "background 0.25s", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 3, left: autoAccept ? 21 : 3, width: 17, height: 17, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.18)", transition: "left 0.25s" }} />
                    </div>
                  </div>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer" }} onClick={() => setSalonAgree(p => !p)}>
                    <div style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px solid ${COLORS.accent}`, flexShrink: 0, marginTop: 1, background: salonAgree ? COLORS.accent : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {salonAgree && <Check size={10} style={{ color: "#fff" }} />}
                    </div>
                    <span style={{ fontSize: 13, color: "#78716C" }}>I agree to the <Link href="#" style={{ color: COLORS.accent, fontWeight: 600, textDecoration: "none" }}>Terms &amp; Conditions</Link></span>
                  </label>
                  <div style={{ display: "flex", gap: 9, marginTop: 2 }}>
                    <OutlineButton onClick={() => setSalonStep(1)} disabled={loading}><ArrowLeft size={13} /> BACK</OutlineButton>
                    <PrimaryButton type="submit" style={{ flex: 1 }} disabled={loading}>{loading ? <><Spinner /> REGISTERING...</> : "REGISTER SALON"}</PrimaryButton>
                  </div>
                </form>
              )}

              <p style={{ marginTop: 18, textAlign: "center", fontSize: 13.5, color: "#A8A29E" }}>Already registered? <Link href="/login" style={{ fontWeight: 600, color: COLORS.accent, textDecoration: "none" }}>Sign in</Link></p>
            </Panel>
          </div>
        </div>

        <div className="signup-right">
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80')`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(28,25,23,0.5) 0%, rgba(201,170,139,0.1) 55%, rgba(28,25,23,0.72) 100%)" }} />
          <div style={{ position: "absolute", top: 24, right: 24, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(14px)", borderRadius: 10, padding: "8px 16px", color: "#fff", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.05em", border: "1px solid rgba(255,255,255,0.15)" }}>✦ nouryx.</div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 48px" }}>
            <div style={{ width: 36, height: 2, background: COLORS.accent, marginBottom: 18, borderRadius: 2 }} />
            <div style={{ fontSize: 32, fontWeight: 500, color: "#fff", lineHeight: 1.28, marginBottom: 8, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>{rp.quote}</div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14.5, fontWeight: 300 }}>{rp.sub}</p>
            <div style={{ display: "flex", gap: 5, marginTop: 22 }}>
              {(["select", "client", "salon"] as Screen[]).map((s) => (
                <div key={s} style={{ height: 3, width: screen === s ? 22 : 7, borderRadius: 2, background: screen === s ? COLORS.accent : "rgba(255,255,255,0.28)", transition: "all 0.35s ease" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}