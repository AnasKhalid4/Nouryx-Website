"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLocale } from "@/hooks/use-locale";
import { BLOG_POSTS } from "@/data/blog-posts";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowUpRight, BookOpen, TrendingUp, Users, Globe } from "lucide-react";

const categoryLabels: Record<string, Record<string, string>> = {
  comparison: { en: "Comparison", fr: "Comparatif" },
  b2b: { en: "For Salons", fr: "Pour les salons" },
  b2c: { en: "For Clients", fr: "Pour les clients" },
  city: { en: "City Guide", fr: "Guide ville" },
};
const categoryIcons: Record<string, React.ReactNode> = {
  comparison: <TrendingUp className="h-3 w-3" />,
  b2b: <BookOpen className="h-3 w-3" />,
  b2c: <Users className="h-3 w-3" />,
  city: <Globe className="h-3 w-3" />,
};
const categoryAccent: Record<string, string> = {
  comparison: "bg-violet-50 text-violet-700 border-violet-200",
  b2b: "bg-sky-50 text-sky-700 border-sky-200",
  b2c: "bg-emerald-50 text-emerald-700 border-emerald-200",
  city: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function BlogPage() {
  const { locale } = useLocale();

  const published = BLOG_POSTS.filter((p) => p.isPublished);
  const localePosts = published.filter((p) => p.locale === (locale === "fr" ? "fr" : "en"));
  const otherPosts = published.filter((p) => p.locale !== (locale === "fr" ? "fr" : "en"));
  const posts = [...localePosts, ...otherPosts];

  const [hero, ...grid] = posts;

  const getLabel = (post: typeof hero) =>
    categoryLabels[post.category]?.[locale === "fr" ? "fr" : "en"] || post.category;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── Page title strip ── */}
      <div className="w-full border-b border-[#EEEBE6] bg-[#FAFAF8]">
        <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-16 pt-14 pb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9AA8B] mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-[#C9AA8B]" />
            {locale === "fr" ? "Le blog Nouryx" : "Nouryx Blog"}
          </p>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-[#111] tracking-tight leading-none">
            {locale === "fr" ? "Beauté & Bien-être" : "Beauty & Wellness"}
          </h1>
          <p className="mt-4 text-[#777] text-base max-w-md leading-relaxed">
            {locale === "fr"
              ? "Tendances, conseils et comparatifs pour le monde de la beauté."
              : "Trends, tips and comparisons for the beauty industry."}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-16 py-14 lg:py-20">

        {/* ── Hero featured post ── */}
        {hero && (
          <Link
            href={`/blog/${hero.slug}`}
            className="group grid lg:grid-cols-[1fr_1fr] overflow-hidden rounded-2xl border border-[#E8DDD3] mb-14 lg:mb-20 transition-colors duration-300 hover:border-[#C9AA8B]/50"
          >
            {/* Image pane */}
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[380px] bg-[#F5EDE6] overflow-hidden">
              {hero.imageUrl ? (
                <Image
                  src={hero.imageUrl}
                  alt={hero.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#F5EDE6] to-[#E5D4C4]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm ${categoryAccent[hero.category] || ""}`}>
                  {categoryIcons[hero.category]}
                  {getLabel(hero)}
                </span>
              </div>
            </div>

            {/* Text pane */}
            <div className="flex flex-col px-8 py-10 lg:px-12 lg:py-12 bg-white justify-center">
              <div className="flex items-center gap-3 text-xs text-[#999] mb-5 font-medium">
                <Clock className="h-3.5 w-3.5 text-[#C9AA8B]" />
                {hero.readingTime} min {locale === "fr" ? "de lecture" : "read"}
                <span className="text-[#DDD]">·</span>
                {new Date(hero.publishedAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { year: "numeric", month: "short", day: "numeric" })}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111] leading-snug tracking-tight mb-4 group-hover:text-[#B8956F] transition-colors duration-200">
                {hero.title}
              </h2>
              <p className="text-[#666] text-base leading-relaxed line-clamp-3 mb-8">
                {hero.excerpt}
              </p>
              <div className="mt-auto">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#111] group-hover:text-[#B8956F] transition-colors">
                  {locale === "fr" ? "Lire l'article" : "Read article"}
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* ── Grid ── */}
        {grid.length > 0 && (
          <>
            <div className="flex items-center gap-5 mb-8">
              <h2 className="text-xl font-extrabold text-[#111] tracking-tight whitespace-nowrap">
                {locale === "fr" ? "Tous les articles" : "All Articles"}
              </h2>
              <div className="flex-1 h-px bg-[#EEEBE6]" />
              <span className="text-xs text-[#AAA] font-medium whitespace-nowrap">{grid.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {grid.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-[#EEEBE6] hover:border-[#C9AA8B]/40 overflow-hidden transition-colors duration-200"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/9] bg-[#F5EDE6] overflow-hidden">
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#F5EDE6] to-[#E5D4C4]" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-sm ${categoryAccent[post.category] || ""}`}>
                        {categoryIcons[post.category]}
                        {getLabel(post)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5">
                    <h2 className="text-base font-bold text-[#111] leading-snug mb-2 line-clamp-2 group-hover:text-[#B8956F] transition-colors duration-200">
                      {post.title}
                    </h2>
                    <p className="text-sm text-[#888] leading-relaxed line-clamp-2 mb-4 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between border-t border-[#F0EAE3] pt-3.5">
                      <span className="flex items-center gap-1.5 text-xs text-[#AAA] font-medium">
                        <Clock className="h-3 w-3 text-[#C9AA8B]" />
                        {post.readingTime} min
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#CCC]">
                        {post.locale.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {posts.length === 0 && (
          <div className="text-center py-32 text-[#CCC] text-lg">
            {locale === "fr" ? "Aucun article pour le moment." : "No articles yet."}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
