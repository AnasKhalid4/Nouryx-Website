export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://nouryx.com/#website',
        name: 'Nouryx',
        url: 'https://nouryx.com',
        inLanguage: ['fr-FR', 'en-GB', 'es-ES', 'it-IT', 'pt-PT'],
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://nouryx.com/salons?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://nouryx.com/#organization',
        name: 'Nouryx',
        url: 'https://nouryx.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://nouryx.com/images/website-logo.png',
          width: 200,
          height: 60,
        },
        sameAs: [
          'https://www.instagram.com/nouryx_reservation/',
          'https://www.facebook.com/nouryxreservation',
          'https://www.linkedin.com/in/nouryx-reservation-18504939b',
          'https://www.tiktok.com/@nouryx_reservation',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: ['French', 'English', 'Spanish', 'Italian', 'Portuguese'],
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Nouryx',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, iOS, Android',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          description: 'Free for clients. Salon owners register free.',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '500',
          bestRating: '5',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
