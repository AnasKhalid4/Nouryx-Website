interface SalonSchemaProps {
  salon: {
    name: string
    description: string
    address: string
    city: string
    country: string
    phone: string
    lat: number
    lng: number
    rating: number
    reviewCount: number
    services: Array<{ name: string; price: number; minutes: number }>
    photos: string[]
    priceRange: string
  }
}

export function SalonSchema({ salon }: SalonSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: salon.name,
    description: salon.description,
    url: `https://nouryx.com/salon/${encodeURIComponent(salon.name.toLowerCase().replace(/\s+/g, '-'))}`,
    telephone: salon.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: salon.address,
      addressLocality: salon.city,
      addressCountry: salon.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: salon.lat,
      longitude: salon.lng,
    },
    openingHoursSpecification: [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ].map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day,
      opens: '09:00',
      closes: '19:00',
    })),
    aggregateRating: salon.reviewCount > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: salon.rating,
          reviewCount: salon.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: salon.services.slice(0, 10).map((s, i) => ({
        '@type': 'Offer',
        position: i + 1,
        name: s.name,
        price: s.price,
        priceCurrency: 'EUR',
        seller: { '@type': 'LocalBusiness', name: salon.name },
      })),
    },
    priceRange: salon.priceRange,
    image: salon.photos,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
