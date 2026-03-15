"use client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLocale } from "@/hooks/use-locale";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// ── Maximum visible gradients ───────────────────────────────────────────
const gradients = [
  "radial-gradient(ellipse 50% 60% at 50% -10%, rgba(201, 170, 139, 0.5), transparent), radial-gradient(ellipse 80% 60% at 0% 90%, rgba(232, 213, 192, 0.2), transparent), linear-gradient(180deg, #FEFEFE 0%, #FAF9F8 100%)",
  "radial-gradient(ellipse 50% 60% at 50% -10%, rgba(232, 213, 192, 0.5), transparent), radial-gradient(ellipse 80% 60% at 100% 90%, rgba(201, 170, 139, 0.2), transparent), linear-gradient(180deg, #FEFEFE 0%, #FBF9F7 100%)",
  "radial-gradient(ellipse 50% 60% at 30% -10%, rgba(201, 170, 139, 0.5), transparent), radial-gradient(ellipse 80% 60% at 70% 90%, rgba(232, 213, 192, 0.2), transparent), linear-gradient(180deg, #FEFEFE 0%, #FAF8F6 100%)",
];

// Gradient for the headline text per phase
const titleGradients = [
  "linear-gradient(120deg, #1C1917 0%, #44403C 100%)",
  "linear-gradient(120deg, #292524 0%, #44403C 100%)",
  "linear-gradient(120deg, #1C1917 0%, #44403C 100%)",
];

// Repeated text for seamless marquee loop
const marqueeText = "NOURYX · NOURYX · NOURYX · NOURYX · NOURYX · NOURYX · ";

export default function ContactPage() {
    const { t } = useLocale();
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [idx, setIdx] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const iv = setInterval(() => setIdx((p) => (p + 1) % gradients.length), 3000);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("Contact form error:", error);
            setStatus("error");
        } finally {
            setTimeout(() => setStatus("idle"), 5000);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <style>{`
                @keyframes shimmer {
                  0%   { background-position: -200% center; }
                  100% { background-position: 200% center; }
                }

                @keyframes slideFromBottom {
                  0% {
                    opacity: 0;
                    transform: translateY(40px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }

                @keyframes marquee-ltr {
                  0%   { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }

                .hero-title {
                  -webkit-background-clip: text;
                  background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-size: 200% auto;
                  animation: shimmer 5s linear infinite;
                  transition: background-image 2s ease-in-out;
                }

                .animate-slide-up {
                  opacity: 0;
                  animation: slideFromBottom 0.8s ease-out forwards;
                }

                .animate-slide-up-delay-1 {
                  animation-delay: 0.2s;
                }

                .animate-slide-up-delay-2 {
                  animation-delay: 0.4s;
                }

                /* Marquee wrapper */
                .marquee-outer {
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  width: 100%;
                  overflow: hidden;
                  pointer-events: none;
                  /* mask so letters fade at edges */
                  -webkit-mask-image: linear-gradient(
                    to right,
                    transparent 0%,
                    black 12%,
                    black 88%,
                    transparent 100%
                  );
                  mask-image: linear-gradient(
                    to right,
                    transparent 0%,
                    black 12%,
                    black 88%,
                    transparent 100%
                  );
                }

                .marquee-track {
                  display: flex;
                  width: max-content;
                  /* each track contains the text twice so it can loop seamlessly */
                  animation: marquee-ltr 22s linear infinite;
                  will-change: transform;
                }

                .marquee-text {
                  font-family: 'Montserrat', sans-serif;
                  font-size: clamp(80px, 14vw, 160px);
                  font-weight: 900;
                  letter-spacing: 0.05em;
                  line-height: 1;
                  white-space: nowrap;
                  color: rgba(120, 113, 108, 0.12);
                  user-select: none;
                  padding-right: 0.15em;
                }
            `}</style>

            <Header />
            <main className="flex-1">
                {/* Hero Section - Same as Home */}
                <section className="relative overflow-hidden -mt-16 h-[50vh] flex items-center">
                    {/* ── Animated background layers ── */}
                    {gradients.map((bg, i) => (
                        <div
                            key={i}
                            className="absolute inset-0 -top-16 transition-opacity duration-2000 ease-in-out"
                            style={{ background: bg, opacity: idx === i ? 1 : 0 }}
                        />
                    ))}

                    {/* ── Flower Background Images ── */}
                    <div
                        className="absolute -top-16 right-0 w-[500px] h-[500px] pointer-events-none opacity-40 md:block hidden"
                        style={{
                            backgroundImage: "url('/images/background-1.png')",
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "top right",
                        }}
                    />

                    {/* <div
                        className="absolute bottom-0 left-0 w-[450px] h-[450px] pointer-events-none opacity-35 md:block hidden"
                        style={{
                            backgroundImage: "url('/images/backgorund-2.png')",
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "bottom left",
                        }}
                    />

                    <div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none opacity-30 md:hidden"
                        style={{
                            backgroundImage: "url('/images/background-1.png')",
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                        }}
                    /> */}

                    {/* ── Main content ── */}
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                        {/* ── Headline ── */}
                        <div className="text-center max-w-3xl mx-auto">
                            <h1
                                className={`hero-title text-4xl font-extrabold tracking-tight leading-tight mt-3 md:mt-5 ${isLoaded ? 'animate-slide-up' : ''}`}
                                style={{ backgroundImage: titleGradients[idx] }}
                            >
                                {t.contact.title}
                            </h1>
                            <p className={`mt-4 text-md text-muted-foreground max-w-2xl mx-auto ${isLoaded ? 'animate-slide-up animate-slide-up-delay-1' : ''}`}>
                                {t.contact.text}
                            </p>
                        </div>
                    </div>

                    {/* ── Scrolling NOURYX marquee at very bottom ── */}
                   
                </section>


                {/* Form Section */}
                <section className="py-24 px-6 bg-white">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="font-serif text-4xl text-[#2c1a0e] mb-3 font-bold">
                                Send us a Message
                            </h2>
                            <p className="text-muted-foreground text-[15px] max-w-xl mx-auto">
                                Whether you're a client looking for the perfect salon, or a business aiming to grow, we're here to help.
                            </p>
                        </div>

                        {status === "success" && (
                            <div className="mb-10 p-5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[15px] flex items-center justify-center gap-3">
                                <Send className="h-4 w-4 text-emerald-600" />
                                {t.contact.form.success}
                            </div>
                        )}
                        {status === "error" && (
                            <div className="mb-10 p-5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-[15px] text-center">
                                {t.contact.form.error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div>
                                <input
                                    required
                                    name="name"
                                    placeholder={t.contact.form.name + " *"}
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full h-14 border-b border-[#CBD5E1] bg-transparent px-2 text-[15px] outline-none focus:border-[#C9AA8B] transition-colors placeholder:text-[#94A3B8] text-[#2c1a0e]"
                                />
                            </div>
                            <div>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    placeholder={"Email *"}
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full h-14 border-b border-[#CBD5E1] bg-transparent px-2 text-[15px] outline-none focus:border-[#C9AA8B] transition-colors placeholder:text-[#94A3B8] text-[#2c1a0e]"
                                />
                            </div>
                            <div>
                                <input
                                    required
                                    type="tel"
                                    name="subject"
                                    placeholder={"Phone Number *"}
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full h-14 border-b border-[#CBD5E1] bg-transparent px-2 text-[15px] outline-none focus:border-[#C9AA8B] transition-colors placeholder:text-[#94A3B8] text-[#2c1a0e]"
                                />
                            </div>
                            <div>
                                <textarea
                                    required
                                    name="message"
                                    placeholder={t.contact.form.message + " *"}
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={1}
                                    className="w-full border-b border-[#CBD5E1] bg-transparent px-2 py-4 text-[15px] outline-none focus:border-[#C9AA8B] transition-colors resize-none placeholder:text-[#94A3B8] text-[#2c1a0e]"
                                />
                            </div>

                            <div className="pt-6">
                                <Button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="w-full h-14 bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-none text-sm font-bold tracking-[0.15em] uppercase transition-all"
                                >
                                    {status === "loading" ? t.common.loading : "SUBMIT NOW"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Full Width Map Section Below Form */}
                <section className="w-full h-[60vh] min-h-[400px] bg-[#f5f0eb]">
                    <iframe
                        title="Nouryx Headquarter Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.2255883256087!2d2.299522176508006!3d48.87295870034607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fddfe2c7ba9%3A0xe5a3cff9c513e9ec!2s123%20Av.%20des%20Champs-%C3%89lys%C3%A9es%2C%2075008%20Paris%2C%20France!5e0!3m2!1sen!2sus!4v1709123456789!5m2!1sen!2sus"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="grayscale-[0.1] contrast-[1.05]"
                    />
                </section>
            </main>
            <Footer />
        </div>
    );
}
