"use client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLocale } from "@/hooks/use-locale";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
    const { t } = useLocale();
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        // Simulate API call
        setTimeout(() => {
            setStatus("success");
            setFormData({ name: "", email: "", subject: "", message: "" });
            setTimeout(() => setStatus("idle"), 5000);
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
                {/* Hero Section matching About page styling */}
                <section className="relative py-24 px-6 text-center overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: "url('/images/contact-us.webp')",
                        }}
                    />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h1 className="font-serif text-5xl md:text-6xl text-white mb-4">
                            {t.contact.title}
                        </h1>
                        <p className="text-white/90 text-lg">
                            {t.contact.text}
                        </p>
                    </div>
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
