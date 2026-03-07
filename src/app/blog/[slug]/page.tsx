import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/data/blog-posts";
import type { Metadata } from "next";
import { BlogPostContent } from "./blog-post-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.filter((p) => p.isPublished).map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug && p.isPublished);
  if (!post) return { title: "Not Found" };

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: [post.primaryKeyword, ...post.secondaryKeywords],
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      locale: post.locale === "fr" ? "fr_FR" : post.locale === "es" ? "es_ES" : post.locale === "it" ? "it_IT" : post.locale === "pt" ? "pt_PT" : "en_GB",
      images: post.imageUrl ? [{ url: post.imageUrl }] : undefined,
    },
    alternates: {
      canonical: `https://nouryx.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug && p.isPublished);

  if (!post) notFound();

  return <BlogPostContent post={post} />;
}
