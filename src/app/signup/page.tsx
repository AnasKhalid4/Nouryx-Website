"use client";

import { useState } from "react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

interface InputFieldProps {
  icon?: React.ComponentType<IconProps>;
  type?: string;
  placeholder?: string;
  rightIcon?: React.ReactNode;
  onRightIcon?: () => void;
}
function AppInput({ icon: Icon, type = "text", placeholder, rightIcon, onRightIcon }: InputFieldProps) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {Icon && <span style={{ position: "absolute", left: 13, color: "#9CA3AF", display: "flex", pointerEvents: "none" }}><Icon size={14} /></span>}
      <input
        type={type} placeholder={placeholder}
        style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#FAFAF9", padding: Icon ? "0 38px 0 40px" : "0 13px", fontSize: 14, color: "#1C1917", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", letterSpacing: "0.01em", boxSizing: "border-box" }}
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

function PrimaryButton({ children, onClick, type = "button", style: ex = {} }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit"; style?: React.CSSProperties; }) {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: "100%", height: 44, borderRadius: 10, background: hov ? COLORS.accentDark : COLORS.accent, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", transition: "background 0.2s, transform 0.15s", transform: hov ? "translateY(-1px)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, ...ex }}>
      {children}
    </button>
  );
}
function OutlineButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flex: 1, height: 44, borderRadius: 10, background: hov ? "#F5F5F4" : "#fff", color: "#44403C", border: "1.5px solid #E5E7EB", cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
      {children}
    </button>
  );
}

function UploadZone({ round = false, label, Icon = Upload }: { round?: boolean; label: string; Icon?: React.ComponentType<IconProps> }) {
  return (
    <label style={{ cursor: "pointer", display: "block" }}>
      <div style={{ height: 84, width: 84, borderRadius: round ? "50%" : 16, background: COLORS.accentLight, border: `2px dashed ${COLORS.accent}50`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s", margin: "0 auto" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.accent; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${COLORS.accent}50`; }}>
        <Icon size={16} style={{ color: `${COLORS.accent}90` }} />
        <span style={{ fontSize: 9.5, color: "#9CA3AF", marginTop: 4, letterSpacing: "0.05em" }}>{label}</span>
      </div>
      <input type="file" style={{ display: "none" }} accept="image/*" />
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

function AppSelect({ options, placeholder }: { options: string[]; placeholder: string }) {
  return (
    <select style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#FAFAF9", padding: "0 36px 0 13px", fontSize: 14, color: "#1C1917", cursor: "pointer", outline: "none", appearance: "none" as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 13px center", boxSizing: "border-box" }}>
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

const RIGHT_COPY: Record<Screen, { quote: string; sub: string }> = {
  select: { quote: "Your beauty, perfectly organised.", sub: "Book the best salons & spas near you." },
  client: { quote: "Discover & book in seconds.", sub: "Thousands of salons, one elegant platform." },
  salon: { quote: "Grow your salon business.", sub: "Smart bookings. Happy clients. Less stress." },
};

export default function SignupPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("select");
  const [salonStep, setSalonStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);

  const rp = RIGHT_COPY[screen];
  const goTo = (s: Screen) => { setScreen(s); setSalonStep(1); };
  const onBack = () => screen !== "select" ? goTo("select") : router.push("/");

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

        /* ── Layout ── */
        .signup-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: #FAFAF9;
        }

        /* LEFT — desktop (unchanged) */
        .signup-left {
          width: 50%;
          min-width: 460px;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }

        .signup-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 52px;
          border-bottom: 1px solid #F0EDE9;
          flex-shrink: 0;
        }

        /* SELECT panel (not using Panel component) */
        .select-panel {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 52px;
        }

        /* Panel scroll area — desktop padding */
        .panel-scroll {
          padding: 28px 52px 44px !important;
        }

        /* RIGHT — desktop (unchanged) */
        .signup-right {
          flex: 1;
          height: 100vh;
          position: relative;
          overflow: hidden;
          background: #1C1917;
        }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .signup-root {
            height: 100svh;
            overflow-y: auto;
          }

          /* Hide image entirely */
          .signup-right {
            display: none;
          }

          /* Left takes full width, centers content */
          .signup-left {
            width: 100%;
            min-width: unset;
            height: 100%;
            min-height: 100svh;
            align-items: center;
          }

          .signup-topbar {
            width: 100%;
            padding: 16px 24px;
          }

          /* Panels fill width and center */
          .select-panel {
            padding: 0 24px !important;
            align-items: center;
          }

          .panel-scroll {
            padding: 28px 24px 44px !important;
          }
        }
      `}</style>

      <div className="signup-root">

        {/* LEFT */}
        <div className="signup-left">

          {/* Top bar */}
          <div className="signup-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Image src="/images/website-logo.png" alt="Nouryx" width={120} height={28} className="h-7 w-auto" />
            </div>
            <NavBack label={screen !== "select" ? "Back" : "Home"} onClick={onBack} />
          </div>

          {/* Panels */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative", width: "100%" }}>

            {/* SELECT */}
            <div
              className="select-panel"
              style={{
                transform: screen === "select" ? "translateX(0)" : "translateX(-100%)",
                opacity: screen === "select" ? 1 : 0,
                transition: "transform 0.45s cubic-bezier(.77,0,.18,1), opacity 0.3s ease",
                pointerEvents: screen === "select" ? "auto" : "none",
              }}>
              <div style={{ width: "100%", maxWidth: 420 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: COLORS.accent, marginBottom: 10 }}>Welcome to Nouryx</p>
                <h1 style={{ fontSize: 36, fontWeight: 600, color: "#1C1917", lineHeight: 1.18, marginBottom: 6 }}>Sign up</h1>
                <p style={{ color: "#A8A29E", fontSize: 15.5, marginBottom: 36, fontWeight: 300 }}>Choose how you'd like to continue.</p>

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
              <form style={{ display: "flex", flexDirection: "column", gap: 13 }} onSubmit={(e) => e.preventDefault()}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}><UploadZone round label="Photo" /></div>
                <Field label="Full Name"><AppInput icon={User} placeholder="John Doe" /></Field>
                <Field label="Email Address"><AppInput icon={Mail} type="email" placeholder="hello@example.com" /></Field>
                <Field label="Phone Number"><AppInput icon={Phone} type="tel" placeholder="+33 6 12 34 56 78" /></Field>
                <Field label="Password"><AppInput icon={Lock} type={showPw ? "text" : "password"} placeholder="••••••••" rightIcon={showPw ? <EyeOff size={14} /> : <EyeIcon size={14} />} onRightIcon={() => setShowPw((p) => !p)} /></Field>
                <Field label="Confirm Password"><AppInput icon={Lock} type="password" placeholder="••••••••" /></Field>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer", marginTop: 2 }}>
                  <div style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px solid ${COLORS.accent}`, flexShrink: 0, marginTop: 1, background: "#fff" }} />
                  <span style={{ fontSize: 13, color: "#78716C" }}>I agree to the <Link href="#" style={{ color: COLORS.accent, fontWeight: 600, textDecoration: "none" }}>Terms &amp; Conditions</Link> and <Link href="#" style={{ color: COLORS.accent, fontWeight: 600, textDecoration: "none" }}>Privacy Policy</Link></span>
                </label>
                <PrimaryButton type="submit" style={{ marginTop: 2 }}>CREATE ACCOUNT <ArrowRight size={13} /></PrimaryButton>
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

              {salonStep === 1 && (
                <form style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }} onSubmit={(e) => { e.preventDefault(); setSalonStep(2); }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}><UploadZone Icon={Building} label="Logo" /></div>
                  <Field label="Salon Name"><AppInput placeholder="Élégance Coiffure" /></Field>
                  <Field label="Owner Name"><AppInput icon={User} placeholder="Marie Dupont" /></Field>
                  <Field label="Email Address"><AppInput icon={Mail} type="email" placeholder="salon@example.com" /></Field>
                  <Field label="Phone Number"><AppInput icon={Phone} type="tel" placeholder="+33 6 12 34 56 78" /></Field>
                  <Field label="Password"><AppInput icon={Lock} type={showPw ? "text" : "password"} placeholder="••••••••" rightIcon={showPw ? <EyeOff size={14} /> : <EyeIcon size={14} />} onRightIcon={() => setShowPw((p) => !p)} /></Field>
                  <Field label="Confirm Password"><AppInput icon={Lock} type="password" placeholder="••••••••" /></Field>
                  <PrimaryButton type="submit" style={{ marginTop: 2 }}>CONTINUE <ArrowRight size={13} /></PrimaryButton>
                </form>
              )}

              {salonStep === 2 && (
                <form style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }} onSubmit={(e) => e.preventDefault()}>
                  <Field label="Salon Address"><AppInput icon={MapPin} placeholder="12 Rue de Rivoli, Paris" /></Field>
                  <div>
                    <FieldLabel>Shop Photos</FieldLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <label key={i} style={{ cursor: "pointer" }}>
                          <div style={{ aspectRatio: "1", borderRadius: 10, background: COLORS.accentLight, border: `2px dashed ${COLORS.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.accent; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${COLORS.accent}40`; }}>
                            <Upload size={14} style={{ color: `${COLORS.accent}80` }} />
                          </div>
                          <input type="file" style={{ display: "none" }} accept="image/*" />
                        </label>
                      ))}
                    </div>
                  </div>
                  <Field label="SIRET Number"><AppInput placeholder="123 456 789 00012" /></Field>
                  <Field label="Legal Status"><AppSelect options={["SAS", "SARL", "EURL", "Auto-entrepreneur", "SA"]} placeholder="Select status..." /></Field>
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea placeholder="Tell clients about your salon..." rows={3}
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
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer" }}>
                    <div style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px solid ${COLORS.accent}`, flexShrink: 0, marginTop: 1, background: "#fff" }} />
                    <span style={{ fontSize: 13, color: "#78716C" }}>I agree to the <Link href="#" style={{ color: COLORS.accent, fontWeight: 600, textDecoration: "none" }}>Terms &amp; Conditions</Link></span>
                  </label>
                  <div style={{ display: "flex", gap: 9, marginTop: 2 }}>
                    <OutlineButton onClick={() => setSalonStep(1)}><ArrowLeft size={13} /> BACK</OutlineButton>
                    <PrimaryButton type="submit" style={{ flex: 1 }}>REGISTER SALON</PrimaryButton>
                  </div>
                </form>
              )}

              <p style={{ marginTop: 18, textAlign: "center", fontSize: 13.5, color: "#A8A29E" }}>Already registered? <Link href="/login" style={{ fontWeight: 600, color: COLORS.accent, textDecoration: "none" }}>Sign in</Link></p>
            </Panel>
          </div>
        </div>

        {/* RIGHT — image panel, hidden on mobile */}
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