interface BlogSchemaProps {
  title: string
  description: string
  slug: string
  publishedAt: string
  updatedAt: string
  locale: string
  imageUrl?: string
}

export function BlogSchema({
  title, description, slug, publishedAt, updatedAt, locale, imageUrl
}: BlogSchemaProps) {
  const url = `https://nouryx.com/blog/${slug}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    datePublished: publishedAt,
    dateModified: updatedAt,
    image: imageUrl ? `https://nouryx.com${imageUrl}` : 'https://nouryx.com/images/og-default.jpg',
    publisher: {
      '@type': 'Organization',
      name: 'Nouryx',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nouryx.com/images/website-logo.png',
      },
    },
    author: {
      '@type': 'Organization',
      name: 'Nouryx',
      url: 'https://nouryx.com',
    },
    inLanguage: locale,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.article-summary', '.key-takeaway'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
