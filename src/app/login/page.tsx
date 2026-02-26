"use client";

import { useState } from "react";
import Link from "next/link";

const COLORS = {
  accent: "#C9AA8B",
  accentDark: "#B8956F",
  accentLight: "#F5EDE6",
} as const;

interface IconProps { size?: number; style?: React.CSSProperties; }

const Mail      = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>;
const Lock      = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const EyeIcon   = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOff    = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const ArrowLeft = ({ size = 14, style }: IconProps) => <svg width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

function AppInput({ icon: Icon, type = "text", placeholder, rightIcon, onRightIcon }: { icon?: React.ComponentType<IconProps>; type?: string; placeholder?: string; rightIcon?: React.ReactNode; onRightIcon?: () => void }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {Icon && <span style={{ position: "absolute", left: 13, color: "#9CA3AF", display: "flex", pointerEvents: "none" }}><Icon size={14} /></span>}
      <input
        type={type} placeholder={placeholder}
        style={{ width: "100%", height: 46, borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#FAFAF9", padding: Icon ? "0 38px 0 40px" : "0 13px", fontSize: 14, color: "#1C1917", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",  letterSpacing: "0.01em", boxSizing: "border-box" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.accentLight}`; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; }}
      />
      {rightIcon && <button type="button" onClick={onRightIcon} style={{ position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", display: "flex", padding: 0 }}>{rightIcon}</button>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", marginBottom: 5, fontSize: 11, fontWeight: 700, color: "#57534E", letterSpacing: "0.08em", textTransform: "uppercase" as const}}>{children}</label>;
}

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [hovBtn, setHovBtn] = useState(false);
  const [hovBack, setHovBack] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Montserrat:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.accent}44; border-radius: 4px; }
        input::placeholder { color: #C4B9B4; font-family: 'Cormorant Garamond', serif; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", width: "100vw",  overflow: "hidden", background: "#FAFAF9" }}>

        {/* LEFT */}
        <div style={{ width: "50%", minWidth: 440, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 52px", borderBottom: "1px solid #F0EDE9", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ height: 34, width: 34, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 17, lineHeight: 1 }}>N</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: 19, color: "#1C1917", letterSpacing: "0.02em" }}>nouryx.</span>
            </div>
            {/* Back to Home */}
            <button
              onClick={() => window.location.href = "/"}
              onMouseEnter={() => setHovBack(true)}
              onMouseLeave={() => setHovBack(false)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: hovBack ? "#F5F0EB" : "transparent", border: "none", cursor: "pointer", color: hovBack ? "#1C1917" : "#78716C", fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", padding: "6px 10px", borderRadius: 8, transition: "all 0.2s" }}>
              <ArrowLeft size={13} /> Home
            </button>
          </div>

          {/* Form area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 52px", overflowY: "auto" }}>
            <div style={{ maxWidth: 380, width: "100%" }}>

              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: COLORS.accent,  marginBottom: 10 }}>Welcome back</p>
              <h1 style={{ fontSize: 36, fontWeight: 600, color: "#1C1917", lineHeight: 1.18, marginBottom: 6, }}>
                Sign <em style={{ fontWeight: 300 }}>in</em>
              </h1>
              <p style={{ color: "#A8A29E", fontSize: 15, marginBottom: 36, fontWeight: 300 }}>
                Good to have you back. Let&apos;s get started.
              </p>

              <form style={{ display: "flex", flexDirection: "column", gap: 16 }} onSubmit={(e) => e.preventDefault()}>
                <div>
                  <FieldLabel>Email Address</FieldLabel>
                  <AppInput icon={Mail} type="email" placeholder="hello@example.com" />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <FieldLabel>Password</FieldLabel>
                    <Link href="/forgot-password" style={{ fontSize: 11.5, color: COLORS.accent, fontWeight: 600, textDecoration: "none",  letterSpacing: "0.02em" }}>
                      Forgot password?
                    </Link>
                  </div>
                  <AppInput
                    icon={Lock} type={showPw ? "text" : "password"} placeholder="••••••••"
                    rightIcon={showPw ? <EyeOff size={14} /> : <EyeIcon size={14} />}
                    onRightIcon={() => setShowPw((p) => !p)}
                  />
                </div>

         
                <button
                  type="submit"
                  onMouseEnter={() => setHovBtn(true)}
                  onMouseLeave={() => setHovBtn(false)}
                  style={{ width: "100%", height: 46, borderRadius: 10, background: hovBtn ? COLORS.accentDark : COLORS.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", transition: "background 0.2s, transform 0.15s", transform: hovBtn ? "translateY(-1px)" : "none", marginTop: 4 }}>
                  SIGN IN
                </button>
              </form>

            


              <p style={{ marginTop: 28, fontSize: 13.5, color: "#A8A29E", textAlign: "center" }}>
                Don&apos;t have an account?{" "}
                <Link href="/signup" style={{ color: COLORS.accent, fontWeight: 600, textDecoration: "none" }}>Sign up</Link>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — full height image */}
        <div style={{ flex: 1, height: "100vh", position: "relative", overflow: "hidden", background: "#1C1917" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80')`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(28,25,23,0.45) 0%, rgba(201,170,139,0.08) 55%, rgba(28,25,23,0.75) 100%)" }} />
          {/* Badge */}
          <div style={{ position: "absolute", top: 24, right: 24, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(14px)", borderRadius: 10, padding: "8px 16px", color: "#fff", fontSize: 12.5,  fontWeight: 600, letterSpacing: "0.05em", border: "1px solid rgba(255,255,255,0.15)" }}>
            ✦ nouryx.
          </div>
        
         
          {/* Bottom copy */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 48px" }}>
            <div style={{ width: 36, height: 2, background: COLORS.accent, marginBottom: 18, borderRadius: 2 }} />
            <div style={{ fontSize: 32, fontWeight: 500, color: "#fff", lineHeight: 1.28, marginBottom: 8, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
              Your appointments,<br />always on time.
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14.5, fontWeight: 300 }}>
              Manage bookings & discover top salons near you.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}