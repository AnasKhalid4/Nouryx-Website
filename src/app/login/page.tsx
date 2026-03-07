"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/firebase/auth";
import { fetchUser } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/stores/auth-store";
import { requestNotificationPermission } from "@/lib/firebase/messaging";
import { saveFcmToken } from "@/lib/firebase/auth";
import { toast } from "sonner";

const COLORS = {
  accent: "#C9AA8B",
  accentDark: "#B8956F",
  accentLight: "#F5EDE6",
} as const;

interface IconProps { size?: number; style?: React.CSSProperties; }

const Mail = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" /></svg>;
const Lock = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
const EyeIcon = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const EyeOff = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
const ArrowLeft = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
const Spinner = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ animation: "spin 0.7s linear infinite" }}><path d="M21 12a9 9 0 11-6.22-8.56" /></svg>;

function AppInput({ icon: Icon, type = "text", placeholder, rightIcon, onRightIcon, value, onChange, disabled }: { icon?: React.ComponentType<IconProps>; type?: string; placeholder?: string; rightIcon?: React.ReactNode; onRightIcon?: () => void; value?: string; onChange?: (val: string) => void; disabled?: boolean }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {Icon && <span style={{ position: "absolute", left: 13, color: "#9CA3AF", display: "flex", pointerEvents: "none" }}><Icon size={14} /></span>}
      <input
        type={type} placeholder={placeholder} value={value} disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: "100%", height: 46, borderRadius: 10, border: "1.5px solid #E5E7EB", background: disabled ? "#F3F4F6" : "#FAFAF9", padding: Icon ? "0 38px 0 40px" : "0 13px", fontSize: 14, color: "#1C1917", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", letterSpacing: "0.01em", boxSizing: "border-box", opacity: disabled ? 0.6 : 1 }}
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

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [hovBtn, setHovBtn] = useState(false);
  const [hovBack, setHovBack] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      // 1. Sign in with Firebase Auth
      const firebaseUser = await loginUser(email, password);

      // 2. Fetch user profile from Firestore
      const user = await fetchUser(firebaseUser.uid);

      // 3. Block check
      if (user.isBlock === "1") {
        setError("Your account has been blocked. Contact support.");
        setLoading(false);
        return;
      }

      // 4. Salon status check
      if (user.role === "salon" && user.salon?.status === "pending") {
        setError("Your salon account is pending approval.");
        setLoading(false);
        return;
      }

      // 5. Set user in store
      setUser(user);

      // 6. Save FCM token (non-blocking)
      requestNotificationPermission().then((token) => {
        if (token) saveFcmToken(firebaseUser.uid, token);
      });

      toast.success("Welcome back!");

      // 7. Role-based redirect
      if (user.role === "salon") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      switch (firebaseError.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        default:
          setError(firebaseError.message || "Login failed. Please try again.");
      }
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
        input::placeholder { color: #C4B9B4; font-family: 'Cormorant Garamond', serif; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: #FAFAF9;
        }
        .login-left {
          width: 50%;
          min-width: 440px;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        .login-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 52px;
          border-bottom: 1px solid #F0EDE9;
          flex-shrink: 0;
        }
        .login-form-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 52px;
          overflow-y: auto;
        }
        .login-form-inner {
          max-width: 380px;
          width: 100%;
        }
        .login-right {
          flex: 1;
          height: 100vh;
          position: relative;
          overflow: hidden;
          background: #1C1917;
        }
        @media (max-width: 767px) {
          .login-root { height: 100svh; overflow-y: auto; }
          .login-right { display: none; }
          .login-left { width: 100%; min-width: unset; height: 100%; min-height: 100svh; align-items: center; }
          .login-topbar { width: 100%; padding: 16px 24px; }
          .login-form-area { width: 100%; padding: 0 24px 40px; align-items: center; }
          .login-form-inner { max-width: 400px; width: 100%; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-left">
          <div className="login-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ height: 34, width: 34, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 17, lineHeight: 1 }}>N</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: 19, color: "#1C1917", letterSpacing: "0.02em" }}>nouryx.</span>
            </div>
            <button
              onClick={() => router.push("/")}
              onMouseEnter={() => setHovBack(true)}
              onMouseLeave={() => setHovBack(false)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: hovBack ? "#F5F0EB" : "transparent", border: "none", cursor: "pointer", color: hovBack ? "#1C1917" : "#78716C", fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", padding: "6px 10px", borderRadius: 8, transition: "all 0.2s", whiteSpace: "nowrap" }}>
              <ArrowLeft size={13} /> Home
            </button>
          </div>

          <div className="login-form-area">
            <div className="login-form-inner">
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: COLORS.accent, marginBottom: 10 }}>Welcome back</p>
              <h1 style={{ fontSize: 36, fontWeight: 600, color: "#1C1917", lineHeight: 1.18, marginBottom: 6 }}>Sign in</h1>
              <p style={{ color: "#A8A29E", fontSize: 15, marginBottom: 32, fontWeight: 300 }}>Good to have you back. Let&apos;s get started.</p>

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <form style={{ display: "flex", flexDirection: "column", gap: 16 }} onSubmit={handleLogin}>
                <div>
                  <FieldLabel>Email Address</FieldLabel>
                  <AppInput icon={Mail} type="email" placeholder="hello@example.com" value={email} onChange={setEmail} disabled={loading} />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <FieldLabel>Password</FieldLabel>
                    <Link href="/forgot-password" style={{ fontSize: 11.5, color: COLORS.accent, fontWeight: 600, textDecoration: "none", letterSpacing: "0.02em" }}>
                      Forgot password?
                    </Link>
                  </div>
                  <AppInput
                    icon={Lock} type={showPw ? "text" : "password"} placeholder="••••••••"
                    rightIcon={showPw ? <EyeOff size={14} /> : <EyeIcon size={14} />}
                    onRightIcon={() => setShowPw((p) => !p)}
                    value={password} onChange={setPassword} disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setHovBtn(true)}
                  onMouseLeave={() => setHovBtn(false)}
                  style={{ width: "100%", height: 48, borderRadius: 10, background: loading ? "#D6CFC9" : hovBtn ? COLORS.accentDark : COLORS.accent, color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", transition: "background 0.2s, transform 0.15s", transform: hovBtn && !loading ? "translateY(-1px)" : "none", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {loading ? <><Spinner /> SIGNING IN...</> : "SIGN IN"}
                </button>
              </form>

              <p style={{ marginTop: 28, fontSize: 13.5, color: "#A8A29E", textAlign: "center" }}>
                Don&apos;t have an account?{" "}
                <Link href="/signup" style={{ color: COLORS.accent, fontWeight: 600, textDecoration: "none" }}>Sign up</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80')`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(28,25,23,0.45) 0%, rgba(201,170,139,0.08) 55%, rgba(28,25,23,0.75) 100%)" }} />
          <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(14px)", borderRadius: 10, padding: "7px 14px", color: "#fff", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.05em", border: "1px solid rgba(255,255,255,0.15)", zIndex: 2 }}>
            ✦ nouryx.
          </div>
          <div className="login-right-copy" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 48px" }}>
            <div style={{ width: 36, height: 2, background: COLORS.accent, marginBottom: 18, borderRadius: 2 }} />
            <div style={{ fontSize: 32, fontWeight: 500, color: "#fff", lineHeight: 1.28, marginBottom: 8, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
              Your appointments,<br />always on time.
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14.5, fontWeight: 300 }}>
              Manage bookings &amp; discover top salons near you.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}