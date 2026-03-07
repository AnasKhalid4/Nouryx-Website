"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BlogSchema } from "@/components/seo/BlogSchema";
import { FaqSchema } from "@/components/seo/FaqSchema";
import { Clock, ArrowLeft, ChevronDown, Users, BookOpen, TrendingUp, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/data/blog-posts";

const categoryLabelEn: Record<string, string> = {
  comparison: "Comparison",
  b2b: "For Salons",
  b2c: "For Clients",
  city: "City Guide",
};
const categoryLabelFr: Record<string, string> = {
  comparison: "Comparatif",
  b2b: "Pour les salons",
  b2c: "Pour les clients",
  city: "Guide ville",
};
const categoryIcons: Record<string, React.ReactNode> = {
  comparison: <TrendingUp className="h-3.5 w-3.5" />,
  b2b: <BookOpen className="h-3.5 w-3.5" />,
  b2c: <Users className="h-3.5 w-3.5" />,
  city: <Globe className="h-3.5 w-3.5" />,
};
const categoryAccent: Record<string, string> = {
  comparison: "bg-violet-50 text-violet-700 border-violet-200",
  b2b: "bg-sky-50 text-sky-700 border-sky-200",
  b2c: "bg-emerald-50 text-emerald-700 border-emerald-200",
  city: "bg-amber-50 text-amber-700 border-amber-200",
};

export function BlogPostContent({ post }: { post: BlogPost }) {
  const isFr = post.locale === "fr";
  const catLabel = isFr
    ? categoryLabelFr[post.category] || post.category
    : categoryLabelEn[post.category] || post.category;

  return (
    <div className="min-h-screen bg-white">
      <BlogSchema
        title={post.title}
        description={post.metaDescription}
        slug={post.slug}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        locale={post.locale}
        imageUrl={post.imageUrl}
      />
      {post.faqs.length > 0 && <FaqSchema faqs={post.faqs} />}

      <Header />

      {/* ── Full-width dark hero ── */}
      <div className="relative w-full bg-[#111] overflow-hidden" style={{ minHeight: 460 }}>
        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover opacity-25"
            priority
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/60 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-10 lg:px-16 pt-14 pb-20 lg:pt-20 lg:pb-28">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white mb-10 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {isFr ? "Retour au blog" : "Back to blog"}
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${categoryAccent[post.category] || "bg-white/20 text-white border-white/20"}`}>
              {categoryIcons[post.category]}
              {catLabel}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-white/50 font-medium">
              <Clock className="h-4 w-4 text-[#C9AA8B]" />
              {post.readingTime} min {isFr ? "de lecture" : "read"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-extrabold text-white leading-[1.1] tracking-tight mb-5 max-w-2xl">
            {post.title}
          </h1>
          <p className="text-lg text-white/55 leading-relaxed max-w-2xl mb-8">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9AA8B] to-[#A8876A] flex items-center justify-center text-white text-sm font-bold shrink-0">
              N
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">Nouryx Team</p>
              <time className="text-xs text-white/40">
                {new Date(post.publishedAt).toLocaleDateString(isFr ? "fr-FR" : "en-GB", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </time>
            </div>
          </div>
        </div>
      </div>

      {/* ── Article body ── */}
      <main className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-16 py-14 lg:py-20">
        <article>
          {/* Rendered HTML content — styled via .blog-content in globals.css */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* FAQ */}
          {post.faqs.length > 0 && (
            <section className="mt-16 pt-12 border-t-2 border-[#F0EAE3]">
              <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-8 tracking-tight">
                {isFr ? "Questions fréquentes" : "Frequently Asked Questions"}
              </h2>
              <div className="space-y-2">
                {post.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-xl border border-[#E8DDD3]/60 overflow-hidden"
                  >
                    <summary className="flex items-start justify-between px-5 py-4 cursor-pointer hover:bg-[#FAF8F5] transition-colors text-base font-semibold text-[#1A1A1A] list-none gap-4">
                      {faq.question}
                      <ChevronDown className="h-5 w-5 text-[#C9AA8B] shrink-0 mt-0.5 group-open:rotate-180 transition-transform duration-300" />
                    </summary>
                    <div className="px-5 pb-5 pt-3 text-[#666] leading-relaxed text-[15px] border-t border-[#F0EAE3]">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="mt-14 relative overflow-hidden bg-[#111] rounded-3xl p-10 lg:p-14 text-center">
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#C9AA8B]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-14 -left-14 w-44 h-44 rounded-full bg-[#C9AA8B]/8 blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#C9AA8B] mb-4">
                <span className="w-6 h-px bg-[#C9AA8B]" />
                Nouryx
                <span className="w-6 h-px bg-[#C9AA8B]" />
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-4 leading-tight">
                {post.category === "b2b"
                  ? isFr ? "Prêt à digitiser votre salon ?" : "Ready to digitise your salon?"
                  : isFr ? "Trouvez votre prochain salon" : "Find your next salon"}
              </h2>
              <p className="text-white/55 mb-8 max-w-md mx-auto leading-relaxed text-[15px]">
                {post.category === "b2b"
                  ? isFr ? "Inscrivez votre salon gratuitement. 2 mois d'essai, 0% commission."
                    : "Register your salon free. 2-month trial, 0% commission."
                  : isFr ? "Réservez en ligne en quelques clics. Gratuit pour les clients."
                    : "Book online in seconds. Free for clients."}
              </p>
              <Link
                href={post.category === "b2b" ? "/signup" : "/salons"}
                className="inline-flex items-center gap-2 bg-[#C9AA8B] hover:bg-[#B8956F] text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300"
              >
                {post.category === "b2b"
                  ? isFr ? "Inscrire mon salon →" : "List Your Salon →"
                  : isFr ? "Trouver un salon →" : "Find a Salon →"}
              </Link>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
