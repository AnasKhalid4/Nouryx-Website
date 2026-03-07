import type { MetadataRoute } from "next";

const BASE = "https://nouryx.com";

const STATIC_PATHS = [
  "/",
  "/salons",
  "/pricing",
  "/about",
  "/contact",
  "/login",
  "/signup",
  "/blog",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date().toISOString();

  // Static pages
  const staticUrls: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: today,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1.0 : 0.8,
  }));

  // Blog posts (static — matches our hardcoded blog data)
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const { BLOG_POSTS } = await import("@/data/blog-posts");
    blogUrls = BLOG_POSTS.filter((p) => p.isPublished).map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // Blog data not yet created
  }

  // Salon pages from Firebase (try/catch so build doesn't fail if Firebase unavailable)
  let salonUrls: MetadataRoute.Sitemap = [];
  try {
    const { collection, query, where, getDocs } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase/config");
    const q = query(
      collection(db, "users"),
      where("role", "==", "salon"),
      where("salon.status", "==", "approved")
    );
    const snap = await getDocs(q);
    salonUrls = snap.docs.map((d) => ({
      url: `${BASE}/salon/${d.id}`,
      lastModified: today,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));
  } catch {
    // Firebase not available at build time — acceptable
  }

  return [...staticUrls, ...blogUrls, ...salonUrls];
}
