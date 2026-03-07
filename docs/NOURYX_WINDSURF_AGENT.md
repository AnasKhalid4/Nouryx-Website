# 🚀 NOURYX — WINDSURF AGENT SEO IMPLEMENTATION BRIEF
### Operation: Rank #1 — Defeat Fresha, Planity & Treatwell

---

> **READ THIS BEFORE TOUCHING ANY FILE**
>
> You are Windsurf AI Agent working on the Nouryx codebase.
> Your mission: implement every `## AGENT TASK` in this document into the Next.js codebase.
> Skip every `## MANUAL TASK` — those are for the human owner to do after launch.
> Execute sections in the numbered order. Validate each step before moving to the next.
>
> **Tech Stack:**
> - Framework: Next.js (Pages Router — NOT App Router)
> - Hosting: Vercel
> - Database: Firebase (Firestore)
> - i18n: Already configured
> - Domain: nouryx.com
> - Languages: French (default), English, Spanish, Italian, Portuguese

---

## 📋 TASK LEGEND

| Symbol | Meaning |
|--------|---------|
| ✅ AGENT TASK | You implement this in code right now |
| 👤 MANUAL TASK | Skip — human does this after launch |
| 🔥 CRITICAL | Do this first — breaks SEO if skipped |
| ⚠️ WARNING | Common mistake — read carefully |
| 🔍 VERIFY | Run this check after implementing |

---

## 📑 TABLE OF CONTENTS

1. [i18n & URL Architecture Audit](#1-i18n--url-architecture-audit)
2. [Hreflang Tag System](#2-hreflang-tag-system)
3. [Metadata System — All 5 Languages](#3-metadata-system--all-5-languages)
4. [Schema.org Structured Data](#4-schemaorg-structured-data)
5. [Core Web Vitals Optimization](#5-core-web-vitals-optimization)
6. [Firebase-Powered Programmatic SEO](#6-firebase-powered-programmatic-seo)
7. [Blog System — Agent Researches & Writes](#7-blog-system--agent-researches--writes)
8. [Competitor Comparison Pages](#8-competitor-comparison-pages)
9. [XML Sitemap — Dynamic & Firebase-Aware](#9-xml-sitemap--dynamic--firebase-aware)
10. [Robots.txt](#10-robotstxt)
11. [404 Page + Redirect Map](#11-404-page--redirect-map)
12. [AEO/GEO — AI Search Optimization](#12-aeogeo--ai-search-optimization)
13. [Edge Middleware — Language Suggestion Banner](#13-edge-middleware--language-suggestion-banner)
14. [PWA — Make Nouryx Installable](#14-pwa--make-nouryx-installable)
15. [GA4 Event Tracking](#15-ga4-event-tracking)
16. [CRO — A/B Testing with Vercel](#16-cro--ab-testing-with-vercel)
17. [Homepage & Service Page Copy — All 5 Languages](#17-homepage--service-page-copy--all-5-languages)
18. [Full Keyword Taxonomy](#18-full-keyword-taxonomy)
19. [Manual Playbook — Backlinks & GBP](#19-manual-playbook--backlinks--gbp)
20. [Master Verification Checklist](#20-master-verification-checklist)

---

---

# SECTION 1: i18n & URL ARCHITECTURE AUDIT

## 🔥 CRITICAL — AGENT TASK: Audit Existing i18n Config

**First action:** Read the existing `next.config.js` to understand current i18n setup, then verify it matches the required structure below.

### Required `next.config.js` i18n config:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['fr', 'en', 'es', 'it', 'pt'],
    defaultLocale: 'fr',         // French = primary market
    localeDetection: false,      // 🔥 CRITICAL: MUST be false
  },
  // ... rest of your existing config
}

module.exports = nextConfig
```

### ⚠️ WARNING — `localeDetection: false` is NON-NEGOTIABLE
```
If localeDetection: true →
  Googlebot (US IP) hits nouryx.com →
  Gets auto-redirected to /en/ →
  NEVER discovers /fr/, /es/, /it/, /pt/ →
  Those pages are INVISIBLE to Google forever

If localeDetection: false →
  Googlebot hits nouryx.com →
  Sees French homepage (default) →
  Follows language switcher links →
  Discovers ALL 5 language versions →
  Indexes everything ✅
```

### Required URL structure — verify these routes exist:
```
nouryx.com/              → French (default, no prefix)
nouryx.com/en/           → English
nouryx.com/es/           → Spanish
nouryx.com/it/           → Italian
nouryx.com/pt/           → Portuguese

nouryx.com/salon/[slug]       → French salon page
nouryx.com/en/salon/[slug]    → English salon page
nouryx.com/es/salon/[slug]    → Spanish salon page

nouryx.com/blog/[slug]        → French blog
nouryx.com/en/blog/[slug]     → English blog
```

### 🔍 VERIFY:
```bash
# After updating next.config.js, run:
npm run dev
# Visit: http://localhost:3000
# Visit: http://localhost:3000/en
# Visit: http://localhost:3000/es
# Visit: http://localhost:3000/it
# Visit: http://localhost:3000/pt
# All 5 must load without redirect errors
```

---

# SECTION 2: HREFLANG TAG SYSTEM

## ✅ AGENT TASK: Create HreflangTags Component

**File to create:** `components/seo/HreflangTags.tsx`

```tsx
// components/seo/HreflangTags.tsx
import Head from 'next/head'
import { useRouter } from 'next/router'

const BASE_URL = 'https://nouryx.com'
const LOCALES = ['fr', 'en', 'es', 'it', 'pt']

// Maps locale to full hreflang code
const HREFLANG_MAP: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-PT',
}

interface HreflangTagsProps {
  canonicalPath?: string // override if canonical differs from current path
}

export function HreflangTags({ canonicalPath }: HreflangTagsProps) {
  const { asPath, locale } = useRouter()
  
  // Strip query strings and fragments from path
  const cleanPath = (canonicalPath || asPath).split('?')[0].split('#')[0]
  
  // Build URL for a given locale
  const buildUrl = (loc: string, path: string) => {
    // French is default — no prefix
    if (loc === 'fr') {
      return `${BASE_URL}${path === '/' ? '' : path}`
    }
    return `${BASE_URL}/${loc}${path === '/' ? '' : path}`
  }

  // Self-referencing canonical URL
  const canonicalUrl = buildUrl(locale || 'fr', cleanPath)

  return (
    <Head>
      {/* Canonical tag — prevents duplicate content penalty */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang tags — tell Google which page = which language */}
      {LOCALES.map((loc) => (
        <link
          key={loc}
          rel="alternate"
          hrefLang={HREFLANG_MAP[loc]}
          href={buildUrl(loc, cleanPath)}
        />
      ))}

      {/* x-default = fallback for unmatched regions, points to French */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={buildUrl('fr', cleanPath)}
      />
    </Head>
  )
}
```

## ✅ AGENT TASK: Add HreflangTags to Every Page

**File to edit:** `pages/_app.tsx`

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { HreflangTags } from '@/components/seo/HreflangTags'
// ... your existing imports

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <HreflangTags />
      <Component {...pageProps} />
    </>
  )
}
```

## ✅ AGENT TASK: Build Language Switcher Component

**File to create:** `components/ui/LanguageSwitcher.tsx`

```tsx
// components/ui/LanguageSwitcher.tsx
// CRITICAL: This must be visible on every page
// Googlebot follows these links to discover all language versions
import Link from 'next/link'
import { useRouter } from 'next/router'

const LANGUAGES = [
  { code: 'fr', label: 'FR', flag: '🇫🇷', full: 'Français' },
  { code: 'en', label: 'EN', flag: '🇬🇧', full: 'English' },
  { code: 'es', label: 'ES', flag: '🇪🇸', full: 'Español' },
  { code: 'it', label: 'IT', flag: '🇮🇹', full: 'Italiano' },
  { code: 'pt', label: 'PT', flag: '🇧🇷', full: 'Português' },
]

export function LanguageSwitcher() {
  const { asPath, locale } = useRouter()

  return (
    <div className="language-switcher flex gap-2 items-center">
      {LANGUAGES.map(({ code, label, flag, full }) => (
        <Link
          key={code}
          href={asPath}
          locale={code}
          aria-label={`Switch to ${full}`}
          className={`
            text-sm px-2 py-1 rounded transition-colors
            ${locale === code
              ? 'font-bold text-white bg-blue-600'
              : 'text-gray-600 hover:text-blue-600'
            }
          `}
        >
          {flag} {label}
        </Link>
      ))}
    </div>
  )
}
```

**File to edit:** Add `<LanguageSwitcher />` to your main navigation component (wherever your header/navbar is defined).

### 🔍 VERIFY:
```
After implementation:
1. Open nouryx.com in browser
2. Right-click → View Page Source
3. Search for "hreflang"
4. You must see 6 lines: fr-FR, en-GB, es-ES, it-IT, pt-PT, x-default
5. Every single page must have these — check homepage, salon page, blog page
6. Run: https://www.hreflang.io/ → paste nouryx.com → zero errors required
```

---

# SECTION 3: METADATA SYSTEM — ALL 5 LANGUAGES

## ✅ AGENT TASK: Create SEO Config File

**File to create:** `lib/seo/metadata.ts`

```typescript
// lib/seo/metadata.ts
export const BASE_URL = 'https://nouryx.com'
export const SITE_NAME = 'Nouryx'

// ─── Homepage Metadata ───────────────────────────────────────────
export const HOME_META = {
  fr: {
    title: 'Nouryx — Réservez votre salon beauté en ligne | France',
    description: 'Trouvez et réservez les meilleurs salons de coiffure, spas et instituts de beauté en France. Réservation en ligne gratuite, disponible 24h/24. Essayez Nouryx.',
    ogTitle: 'Nouryx — La plateforme beauté #1 en France',
    ogDescription: 'Réservez les meilleurs salons de coiffure, spas et barbiers près de chez vous.',
  },
  en: {
    title: 'Nouryx — Book Beauty & Wellness Salons Online | France',
    description: 'Find and book top-rated hair salons, spas, nail studios and barbers near you in France. Free instant online booking available 24/7. Trusted by thousands.',
    ogTitle: 'Nouryx — Book Your Beauty Salon Online',
    ogDescription: 'The #1 salon booking platform in France. Book hair, nails, spa and more.',
  },
  es: {
    title: 'Nouryx — Reserva tu salón de belleza online | Francia',
    description: 'Encuentra y reserva los mejores salones de peluquería, spas e institutos de belleza en Francia. Reserva online gratis, disponible las 24h. Únete a Nouryx.',
    ogTitle: 'Nouryx — Reserva tu salón de belleza online',
    ogDescription: 'La plataforma #1 de reservas de salones en Francia.',
  },
  it: {
    title: 'Nouryx — Prenota il tuo salone di bellezza online | Francia',
    description: 'Trova e prenota i migliori parrucchieri, spa e centri estetici in Francia. Prenotazione online gratuita, disponibile 24 ore su 24. Prova Nouryx oggi.',
    ogTitle: 'Nouryx — Prenota il tuo salone di bellezza',
    ogDescription: 'La piattaforma #1 per prenotare saloni di bellezza in Francia.',
  },
  pt: {
    title: 'Nouryx — Agende seu salão de beleza online | França',
    description: 'Encontre e agende os melhores salões de cabeleireiro, spas e centros de beleza na França. Agendamento online gratuito, disponível 24h. Experimente o Nouryx.',
    ogTitle: 'Nouryx — Agende seu salão de beleza online',
    ogDescription: 'A plataforma #1 de agendamento de salões na França.',
  },
}

// ─── Service Page Metadata ────────────────────────────────────────
export const SERVICE_META: Record<string, Record<string, { title: string; description: string; h1: string }>> = {
  hair: {
    fr: {
      title: 'Salons de Coiffure en Ligne — Réservez | Nouryx',
      description: 'Trouvez les meilleurs salons de coiffure près de chez vous. Coupe, couleur, brushing — réservez en ligne instantanément sur Nouryx.',
      h1: 'Trouvez un coiffeur à proximité — Les meilleurs salons de coiffure',
    },
    en: {
      title: 'Find Hair Salons near Me — Book Online | Nouryx',
      description: 'Search and book the best hair salons near you. Haircuts, colouring, blowouts — instant online booking available 24/7 on Nouryx.',
      h1: 'Find Hair Salons near me — Search top hair salons near you',
    },
    es: {
      title: 'Peluquerías Online — Reserva tu Cita | Nouryx',
      description: 'Encuentra las mejores peluquerías cerca de ti. Cortes, coloración, peinados — reserva online al instante en Nouryx.',
      h1: 'Encuentra peluquerías cerca de mí — Los mejores salones de belleza',
    },
    it: {
      title: 'Parrucchieri Online — Prenota il tuo Appuntamento | Nouryx',
      description: 'Trova i migliori parrucchieri vicino a te. Tagli, colorazioni, piega — prenota online subito su Nouryx.',
      h1: 'Trova parrucchieri nelle vicinanze — I migliori saloni di bellezza',
    },
    pt: {
      title: 'Cabeleireiros Online — Agende seu Horário | Nouryx',
      description: 'Encontre os melhores cabeleireiros perto de você. Cortes, coloração, escova — agende online instantaneamente no Nouryx.',
      h1: 'Encontre cabeleireiros perto de mim — Os melhores salões de beleza',
    },
  },
  barbers: {
    fr: {
      title: 'Barbiers en Ligne — Réservez votre Coupe | Nouryx',
      description: 'Trouvez les meilleurs barbiers près de chez vous. Coupe homme, rasage, taille de barbe — réservez en ligne sur Nouryx.',
      h1: 'Trouvez un barbier à proximité — Les meilleurs barbiers',
    },
    en: {
      title: 'Find Barbers near Me — Book Online | Nouryx',
      description: 'Search and book the best barbers near you. Haircuts, shaves, beard trims — instant online booking on Nouryx.',
      h1: 'Find Barbers near me — Top-rated barbers in your area',
    },
    es: {
      title: 'Barberos Online — Reserva tu Cita | Nouryx',
      description: 'Encuentra los mejores barberos cerca de ti. Cortes, afeitados, arreglo de barba — reserva online en Nouryx.',
      h1: 'Encuentra barberos cerca de mí — Los mejores barberos online',
    },
    it: {
      title: 'Barbieri Online — Prenota il tuo Appuntamento | Nouryx',
      description: 'Trova i migliori barbieri vicino a te. Tagli uomo, rasatura, cura della barba — prenota online su Nouryx.',
      h1: 'Trova barbieri nelle vicinanze — I migliori barbieri online',
    },
    pt: {
      title: 'Barbeiros Online — Agende seu Horário | Nouryx',
      description: 'Encontre os melhores barbeiros perto de você. Cortes masculinos, barba — agende online no Nouryx.',
      h1: 'Encontre barbeiros perto de mim — Os melhores barbeiros online',
    },
  },
  spa: {
    fr: {
      title: 'Spas & Massages en Ligne — Réservez | Nouryx',
      description: 'Trouvez les meilleurs spas et centres de massage près de chez vous. Massages relaxants, soins du visage — réservez sur Nouryx.',
      h1: 'Trouvez un spa à proximité — Les meilleurs centres de bien-être',
    },
    en: {
      title: 'Find Spas & Massage near Me — Book Online | Nouryx',
      description: 'Search and book the best spas and massage centres near you. Relaxation, deep tissue, facials — instant booking on Nouryx.',
      h1: 'Find Spas near me — Book massage and wellness treatments',
    },
    es: {
      title: 'Spas y Masajes Online — Reserva | Nouryx',
      description: 'Encuentra los mejores spas y centros de masaje cerca de ti. Masajes relajantes, tratamientos faciales — reserva en Nouryx.',
      h1: 'Encuentra spas cerca de mí — Los mejores centros de bienestar',
    },
    it: {
      title: 'Spa e Massaggi Online — Prenota | Nouryx',
      description: 'Trova i migliori centri spa e massaggi vicino a te. Massaggi rilassanti, trattamenti viso — prenota su Nouryx.',
      h1: 'Trova spa nelle vicinanze — I migliori centri benessere',
    },
    pt: {
      title: 'Spas e Massagens Online — Agende | Nouryx',
      description: 'Encontre os melhores spas e centros de massagem perto de você. Massagens relaxantes, tratamentos faciais — agende no Nouryx.',
      h1: 'Encontre spas perto de mim — Os melhores centros de bem-estar',
    },
  },
  nails: {
    fr: {
      title: 'Salons de Manucure & Nail Art en Ligne | Nouryx',
      description: 'Trouvez les meilleures nail artists près de chez vous. Manucure gel, nail art, pédicure — réservez en ligne sur Nouryx.',
      h1: 'Trouvez un salon de manucure à proximité',
    },
    en: {
      title: 'Find Nail Salons near Me — Book Online | Nouryx',
      description: 'Search and book the best nail salons near you. Gel manicures, nail art, pedicures — instant online booking on Nouryx.',
      h1: 'Find Nail Salons near me — Top-rated nail technicians',
    },
    es: {
      title: 'Salones de Uñas Online — Reserva | Nouryx',
      description: 'Encuentra los mejores salones de manicura cerca de ti. Manicura gel, nail art, pedicura — reserva online en Nouryx.',
      h1: 'Encuentra salones de uñas cerca de mí',
    },
    it: {
      title: 'Centri di Manicure Online — Prenota | Nouryx',
      description: 'Trova i migliori centri di manicure vicino a te. Manicure gel, nail art, pedicure — prenota su Nouryx.',
      h1: 'Trova centri di manicure nelle vicinanze',
    },
    pt: {
      title: 'Salões de Manicure Online — Agende | Nouryx',
      description: 'Encontre os melhores salões de manicure perto de você. Manicure em gel, nail art, pedicure — agende no Nouryx.',
      h1: 'Encontre salões de manicure perto de mim',
    },
  },
}

// ─── Dynamic Salon Page Meta Generator ───────────────────────────
export function generateSalonMeta(
  salonName: string,
  city: string,
  services: string[],
  rating: number,
  reviewCount: number,
  locale: string
) {
  const top3 = services.slice(0, 3).join(', ')

  const templates: Record<string, { title: string; description: string; h1: string }> = {
    fr: {
      title: `${salonName} — ${city} — Réservez en ligne | Nouryx`,
      description: `Réservez en ligne chez ${salonName} à ${city}. Services: ${top3}. Noté ${rating}/5 par ${reviewCount} clients. Réservation instantanée sur Nouryx.`,
      h1: `${salonName} — Salon de beauté à ${city}`,
    },
    en: {
      title: `${salonName} — ${city} — Book Online | Nouryx`,
      description: `Book ${salonName} in ${city} online. Services: ${top3}. Rated ${rating}/5 by ${reviewCount} clients. Instant booking on Nouryx.`,
      h1: `${salonName} — Beauty Salon in ${city}`,
    },
    es: {
      title: `${salonName} — ${city} — Reserva online | Nouryx`,
      description: `Reserva en línea en ${salonName} en ${city}. Servicios: ${top3}. Puntuación ${rating}/5 por ${reviewCount} clientes. Reserva instantánea en Nouryx.`,
      h1: `${salonName} — Salón de belleza en ${city}`,
    },
    it: {
      title: `${salonName} — ${city} — Prenota online | Nouryx`,
      description: `Prenota ${salonName} a ${city} online. Servizi: ${top3}. Voto ${rating}/5 da ${reviewCount} clienti. Prenotazione istantanea su Nouryx.`,
      h1: `${salonName} — Salone di bellezza a ${city}`,
    },
    pt: {
      title: `${salonName} — ${city} — Agende online | Nouryx`,
      description: `Agende no ${salonName} em ${city} online. Serviços: ${top3}. Nota ${rating}/5 por ${reviewCount} clientes. Agendamento instantâneo no Nouryx.`,
      h1: `${salonName} — Salão de beleza em ${city}`,
    },
  }

  return templates[locale] || templates.fr
}
```

## ✅ AGENT TASK: Create Reusable SEO Head Component

**File to create:** `components/seo/SeoHead.tsx`

```tsx
// components/seo/SeoHead.tsx
import Head from 'next/head'
import { useRouter } from 'next/router'
import { BASE_URL, SITE_NAME } from '@/lib/seo/metadata'

interface SeoHeadProps {
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  noIndex?: boolean
}

export function SeoHead({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage = '/images/og-default.jpg',
  noIndex = false,
}: SeoHeadProps) {
  const { asPath, locale } = useRouter()
  const canonicalUrl = `${BASE_URL}${locale !== 'fr' ? `/${locale}` : ''}${asPath.split('?')[0]}`

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={`${BASE_URL}${ogImage}`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={`${BASE_URL}${ogImage}`} />

      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#1E3A8A" />
    </Head>
  )
}
```

## ✅ AGENT TASK: Apply SeoHead to Every Page

For each page in `pages/`, find the existing `<Head>` tags and replace with:

```tsx
// Example: pages/index.tsx
import { SeoHead } from '@/components/seo/SeoHead'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { HOME_META } from '@/lib/seo/metadata'
import { useRouter } from 'next/router'

export default function Home() {
  const { locale } = useRouter()
  const meta = HOME_META[locale as string] || HOME_META.fr

  return (
    <>
      <SeoHead
        title={meta.title}
        description={meta.description}
        ogTitle={meta.ogTitle}
        ogDescription={meta.ogDescription}
      />
      <HreflangTags />
      {/* rest of your page */}
    </>
  )
}
```

---

# SECTION 4: SCHEMA.ORG STRUCTURED DATA

## ✅ AGENT TASK: Create Schema Components

**File to create:** `components/seo/schemas/WebsiteSchema.tsx`

```tsx
// components/seo/schemas/WebsiteSchema.tsx
// Add to pages/index.tsx (homepage only)
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
```

**File to create:** `components/seo/schemas/SalonSchema.tsx`

```tsx
// components/seo/schemas/SalonSchema.tsx
// Add to pages/salon/[slug].tsx

interface SalonSchemaProps {
  salon: {
    name: string
    description: string
    address: string
    city: string
    country: string
    postalCode: string
    phone: string
    lat: number
    lng: number
    rating: number
    reviewCount: number
    services: Array<{ name: string; price: number; duration: number }>
    photos: string[]
    hours: Array<{ day: string; open: string; close: string }>
    priceRange: string
    slug: string
    googleMapsUrl?: string
    instagramUrl?: string
  }
  locale: string
}

export function SalonSchema({ salon, locale }: SalonSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: salon.name,
    description: salon.description,
    url: `https://nouryx.com${locale !== 'fr' ? `/${locale}` : ''}/salon/${salon.slug}`,
    telephone: salon.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: salon.address,
      addressLocality: salon.city,
      addressCountry: salon.country,
      postalCode: salon.postalCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: salon.lat,
      longitude: salon.lng,
    },
    openingHoursSpecification: salon.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.day,
      opens: h.open,
      closes: h.close,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: salon.rating,
      reviewCount: salon.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: salon.services.map((s, i) => ({
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
    sameAs: [salon.googleMapsUrl, salon.instagramUrl].filter(Boolean),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

**File to create:** `components/seo/schemas/BlogSchema.tsx`

```tsx
// components/seo/schemas/BlogSchema.tsx
// Add to pages/blog/[slug].tsx

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
  const url = `https://nouryx.com${locale !== 'fr' ? `/${locale}` : ''}/blog/${slug}`

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
```

**File to create:** `components/seo/schemas/FaqSchema.tsx`

```tsx
// components/seo/schemas/FaqSchema.tsx
// Add to blog posts and comparison pages — unlocks expandable FAQ in Google results

interface FaqItem { question: string; answer: string }

export function FaqSchema({ faqs }: { faqs: FaqItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 🔍 VERIFY:
```
After deploying, test every schema at:
https://search.google.com/test/rich-results
- Homepage: WebSite + Organization must pass
- Salon page: BeautySalon must pass with rating stars
- Blog page: BlogPosting must pass
- FAQ: FAQPage must pass
```

---

# SECTION 5: CORE WEB VITALS OPTIMIZATION

## ✅ AGENT TASK: Audit and Fix All Images

Search the entire codebase for `<img` tags and replace every one with `next/image`:

```tsx
// ❌ BEFORE — never use <img> in Next.js
<img src="/images/hero.jpg" alt="salon" />

// ✅ AFTER — always use next/image
import Image from 'next/image'

// Above the fold (hero images) — add priority
<Image
  src="/images/hero.jpg"
  alt="Réservez votre salon beauté en ligne — Nouryx"
  width={1200}
  height={600}
  priority={true}
  quality={85}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
/>

// Below the fold — lazy load
<Image
  src={salon.photoUrl}
  alt={`${salon.name} — ${salon.city} — réserver en ligne Nouryx`}
  width={400}
  height={300}
  loading="lazy"
  quality={80}
/>
```

## ✅ AGENT TASK: Add Font Optimization

**File to edit:** `pages/_document.tsx`

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* font-display: swap prevents invisible text during load */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

## ✅ AGENT TASK: Add next.config.js Performance Settings

```javascript
// next.config.js — add these to your existing config
const nextConfig = {
  i18n: {
    locales: ['fr', 'en', 'es', 'it', 'pt'],
    defaultLocale: 'fr',
    localeDetection: false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'], // auto-convert to modern formats
    domains: [
      'firebasestorage.googleapis.com', // Firebase Storage images
      'nouryx.com',
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}
```

### 🔍 VERIFY:
```
Test Core Web Vitals:
1. https://pagespeed.web.dev/ → enter https://nouryx.com
2. Test all 5 locale homepages (/en, /es, /it, /pt)
3. Required scores:
   LCP < 2.5s ✅
   CLS < 0.1  ✅
   INP < 200ms ✅
   Mobile score > 75 ✅
```

---

# SECTION 6: FIREBASE-POWERED PROGRAMMATIC SEO

## ✅ AGENT TASK: Create Firebase SEO Data Fetchers

**File to create:** `lib/firebase/seo.ts`

```typescript
// lib/firebase/seo.ts
// Fetches salon data from Firestore for SSG/ISR

import { db } from '@/lib/firebase/client' // your existing Firebase init
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'

export interface SalonSeoData {
  id: string
  slug: string
  name: string
  description: string
  city: string
  country: string
  address: string
  postalCode: string
  phone: string
  lat: number
  lng: number
  rating: number
  reviewCount: number
  services: Array<{ name: string; price: number; duration: number }>
  photos: string[]
  hours: Array<{ day: string; open: string; close: string }>
  priceRange: string
  googleMapsUrl?: string
  instagramUrl?: string
  updatedAt: string
  isPublished: boolean
}

// Get ALL salon slugs — used in getStaticPaths
export async function getAllSalonSlugs(): Promise<string[]> {
  const snapshot = await getDocs(
    query(collection(db, 'salons'), where('isPublished', '==', true))
  )
  return snapshot.docs.map((d) => d.data().slug as string).filter(Boolean)
}

// Get single salon by slug — used in getStaticProps
export async function getSalonBySlug(slug: string): Promise<SalonSeoData | null> {
  const snapshot = await getDocs(
    query(collection(db, 'salons'), where('slug', '==', slug), limit(1))
  )
  if (snapshot.empty) return null
  const data = snapshot.docs[0].data()
  return { id: snapshot.docs[0].id, ...data } as SalonSeoData
}

// Get ALL salons for sitemap generation
export async function getAllSalonsForSitemap() {
  const snapshot = await getDocs(
    query(collection(db, 'salons'), where('isPublished', '==', true))
  )
  return snapshot.docs.map((d) => ({
    slug: d.data().slug,
    updatedAt: d.data().updatedAt || new Date().toISOString(),
  }))
}

// Get salons by city — used for city directory pages
export async function getSalonsByCity(city: string, limitCount = 20) {
  const snapshot = await getDocs(
    query(
      collection(db, 'salons'),
      where('isPublished', '==', true),
      where('city', '==', city),
      orderBy('rating', 'desc'),
      limit(limitCount)
    )
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as SalonSeoData[]
}

// Get related salons (same city, different slug) — for internal linking
export async function getRelatedSalons(city: string, excludeSlug: string, limitCount = 4) {
  const snapshot = await getDocs(
    query(
      collection(db, 'salons'),
      where('isPublished', '==', true),
      where('city', '==', city),
      orderBy('rating', 'desc'),
      limit(limitCount + 1)
    )
  )
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((s: any) => s.slug !== excludeSlug)
    .slice(0, limitCount) as SalonSeoData[]
}
```

## ✅ AGENT TASK: Build Programmatic Salon Pages with SSG + ISR

**File to create:** `pages/salon/[slug].tsx`

```tsx
// pages/salon/[slug].tsx
import type { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { SeoHead } from '@/components/seo/SeoHead'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { SalonSchema } from '@/components/seo/schemas/SalonSchema'
import { FaqSchema } from '@/components/seo/schemas/FaqSchema'
import { generateSalonMeta } from '@/lib/seo/metadata'
import {
  getAllSalonSlugs,
  getSalonBySlug,
  getRelatedSalons,
  type SalonSeoData,
} from '@/lib/firebase/seo'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  salon: SalonSeoData
  relatedSalons: SalonSeoData[]
}

export default function SalonPage({ salon, relatedSalons }: Props) {
  const { locale } = useRouter()
  const currentLocale = locale || 'fr'
  const meta = generateSalonMeta(
    salon.name,
    salon.city,
    salon.services.map((s) => s.name),
    salon.rating,
    salon.reviewCount,
    currentLocale
  )

  // Auto-generated FAQs from salon data
  const faqs = [
    {
      question: currentLocale === 'fr'
        ? `Comment réserver un rendez-vous chez ${salon.name} ?`
        : `How do I book an appointment at ${salon.name}?`,
      answer: currentLocale === 'fr'
        ? `Réservez en ligne sur Nouryx en quelques clics. Choisissez votre service, votre créneau et confirmez. Réservation instantanée, disponible 24h/24.`
        : `Book online on Nouryx in a few clicks. Choose your service, pick a time slot and confirm. Instant booking, available 24/7.`,
    },
    {
      question: currentLocale === 'fr'
        ? `Quels sont les horaires de ${salon.name} ?`
        : `What are the opening hours of ${salon.name}?`,
      answer: salon.hours
        .map((h) => `${h.day}: ${h.open} - ${h.close}`)
        .join(', '),
    },
    {
      question: currentLocale === 'fr'
        ? `Quels services propose ${salon.name} ?`
        : `What services does ${salon.name} offer?`,
      answer: salon.services.map((s) => `${s.name} (${s.price}€)`).join(', '),
    },
  ]

  return (
    <>
      <SeoHead
        title={meta.title}
        description={meta.description}
      />
      <HreflangTags />
      <SalonSchema salon={salon} locale={currentLocale} />
      <FaqSchema faqs={faqs} />

      <main>
        {/* Breadcrumb — also add BreadcrumbSchema */}
        <nav aria-label="breadcrumb">
          <ol>
            <li><Link href="/">Nouryx</Link></li>
            <li><Link href="/salons">{salon.city}</Link></li>
            <li>{salon.name}</li>
          </ol>
        </nav>

        <h1>{meta.h1}</h1>

        {/* Salon photos */}
        <div className="salon-photos">
          {salon.photos.slice(0, 4).map((photo, i) => (
            <Image
              key={i}
              src={photo}
              alt={`${salon.name} — ${salon.city} — ${salon.services[0]?.name || 'salon'} — Nouryx`}
              width={400}
              height={300}
              loading={i === 0 ? 'eager' : 'lazy'}
              priority={i === 0}
            />
          ))}
        </div>

        {/* Rating */}
        <div className="rating">
          ★ {salon.rating}/5 ({salon.reviewCount} avis)
        </div>

        {/* Services with SEO-rich H2 headings */}
        <section>
          <h2>
            {currentLocale === 'fr'
              ? `Services de ${salon.name} à ${salon.city}`
              : `Services at ${salon.name} in ${salon.city}`}
          </h2>
          {salon.services.map((service) => (
            <div key={service.name}>
              <span>{service.name}</span>
              <span>{service.price}€</span>
              <span>{service.duration} min</span>
            </div>
          ))}
        </section>

        {/* Book CTA */}
        <section>
          <h2>
            {currentLocale === 'fr'
              ? `Réserver chez ${salon.name}`
              : `Book at ${salon.name}`}
          </h2>
          <button className="btn-primary">
            {currentLocale === 'fr' ? 'Réserver maintenant' : 'Book Now'}
          </button>
        </section>

        {/* FAQ Section */}
        <section>
          <h2>FAQ</h2>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </section>

        {/* Related salons — internal linking */}
        {relatedSalons.length > 0 && (
          <section>
            <h2>
              {currentLocale === 'fr'
                ? `Autres salons à ${salon.city}`
                : `More salons in ${salon.city}`}
            </h2>
            <div>
              {relatedSalons.map((related) => (
                <Link key={related.slug} href={`/salon/${related.slug}`}>
                  {related.name} — ★{related.rating}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  )
}

// SSG — pre-build all salon pages at deploy time
export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllSalonSlugs()

  const paths = slugs.map((slug) => ({ params: { slug } }))

  return {
    paths,
    fallback: 'blocking', // new salons: SSR first request, then cached
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string
  const salon = await getSalonBySlug(slug)

  if (!salon) return { notFound: true }

  const relatedSalons = await getRelatedSalons(salon.city, slug)

  return {
    props: { salon, relatedSalons },
    revalidate: 900, // ISR: rebuild every 15 minutes (catches new reviews)
  }
}
```

---

# SECTION 7: BLOG SYSTEM — AGENT RESEARCHES & WRITES

## ✅ AGENT TASK: Create Firestore Blog Schema

Add blogs to Firebase Firestore with this exact structure:

```typescript
// Firestore collection: 'blogs'
// Document structure:
interface BlogPost {
  id: string
  slug: string            // URL-friendly, e.g. "planity-vs-nouryx-2026"
  locale: string          // "fr" | "en" | "es" | "it" | "pt"
  title: string
  metaTitle: string       // ≤60 chars
  metaDescription: string // ≤158 chars
  content: string         // Full HTML or Markdown content
  excerpt: string         // 2-3 sentence summary
  category: string        // "b2b" | "b2c" | "comparison" | "city"
  primaryKeyword: string
  secondaryKeywords: string[]
  publishedAt: string     // ISO date
  updatedAt: string       // ISO date
  isPublished: boolean
  imageUrl: string
  readingTime: number     // minutes
  faqs: Array<{ question: string; answer: string }>
  internalLinks: string[] // other blog slugs to link to
}
```

## ✅ AGENT TASK: Build Blog Pages with SSG

**File to create:** `pages/blog/index.tsx` — Blog listing page

**File to create:** `pages/blog/[slug].tsx`

```tsx
// pages/blog/[slug].tsx
import type { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { getDocs, query, collection, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { SeoHead } from '@/components/seo/SeoHead'
import { HreflangTags } from '@/components/seo/HreflangTags'
import { BlogSchema } from '@/components/seo/schemas/BlogSchema'
import { FaqSchema } from '@/components/seo/schemas/FaqSchema'

export default function BlogPost({ post }: { post: any }) {
  const { locale } = useRouter()

  return (
    <>
      <SeoHead
        title={post.metaTitle}
        description={post.metaDescription}
        ogImage={post.imageUrl}
      />
      <HreflangTags />
      <BlogSchema
        title={post.title}
        description={post.metaDescription}
        slug={post.slug}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        locale={locale || 'fr'}
        imageUrl={post.imageUrl}
      />
      {post.faqs?.length > 0 && <FaqSchema faqs={post.faqs} />}

      <article className="blog-post">
        <header>
          <h1>{post.title}</h1>
          <p className="article-summary">{post.excerpt}</p>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString()}
          </time>
        </header>

        {/* key-takeaway class is used by speakable schema for AEO */}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.faqs?.length > 0 && (
          <section className="faq-section">
            <h2>FAQ</h2>
            {post.faqs.map((faq: any) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </section>
        )}

        {/* CTA — B2B blogs link to signup, B2C link to salons */}
        <section className="blog-cta">
          {post.category === 'b2b' ? (
            <a href={`/${locale !== 'fr' ? locale + '/' : ''}signup`} className="btn-primary">
              {locale === 'fr' ? 'Inscrire mon salon gratuitement →' : 'List Your Salon Free →'}
            </a>
          ) : (
            <a href={`/${locale !== 'fr' ? locale + '/' : ''}salons`} className="btn-primary">
              {locale === 'fr' ? 'Trouver un salon →' : 'Find a Salon →'}
            </a>
          )}
        </section>
      </article>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const snapshot = await getDocs(
    query(collection(db, 'blogs'), where('isPublished', '==', true))
  )
  const paths = snapshot.docs.map((d) => ({
    params: { slug: d.data().slug },
    locale: d.data().locale,
  }))
  return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const snapshot = await getDocs(
    query(
      collection(db, 'blogs'),
      where('slug', '==', params?.slug),
      where('locale', '==', locale || 'fr')
    )
  )
  if (snapshot.empty) return { notFound: true }
  const post = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  return { props: { post }, revalidate: 3600 }
}
```

---

## 🔍 AGENT TASK: RESEARCH & WRITE 30 PRIORITY BLOGS

> **HOW TO DO THIS:**
> For each blog below, search the web for current information, statistics, and competitor data.
> Write the full blog post in the specified language.
> Store each completed blog as a Firestore document in the `blogs` collection.
> Minimum 1,200 words per post. Follow the structure template below.

### Blog Post Structure Template (MUST follow for every article):

```
1. metaTitle (≤60 chars) — contains primary keyword
2. metaDescription (≤158 chars) — contains primary keyword + CTA
3. H1 — exact primary keyword naturally included
4. excerpt — 2-3 sentence summary (used for speakable AEO schema)
5. key-takeaway div — 3-bullet summary of article (AEO optimized)
6. Introduction (150-200 words) — hook + problem + primary keyword
7. Table of Contents (anchor links)
8. H2 sections (4-6) — each H2 contains a secondary keyword
9. H3 subsections where needed
10. At least 1 statistic or data point per H2 section
11. Internal links: 2-3 links to other Nouryx pages
12. FAQ section (3-5 Q&As) → stored in faqs[] array
13. CTA section → B2B: signup | B2C: salons directory
```

---

### 🇫🇷 FRENCH BLOGS (Write in French)

#### BLOG FR-01 — HIGHEST PRIORITY
```yaml
slug: planity-vs-fresha-vs-nouryx-2026
locale: fr
category: comparison
primaryKeyword: planity avis logiciel salon coiffure
secondaryKeywords:
  - alternative planity
  - meilleur logiciel salon de coiffure 2026
  - comparatif logiciel réservation salon
  - planity pro tarif commission
  - fresha avis france
metaTitle: "Planity vs Fresha vs Nouryx : Quel logiciel choisir en 2026 ?"
metaDescription: "Comparatif complet des meilleurs logiciels de réservation pour salons de coiffure en France. Planity, Fresha ou Nouryx — découvrez lequel vous convient en 2026."
h1: "Planity vs Fresha vs Nouryx : Comparatif des meilleurs logiciels salon de coiffure 2026"
cta: b2b
internalLinks: ["/signup", "/pricing", "/fr/blog/reduire-no-shows-salon"]
faqs:
  - Q: "Planity est-il gratuit pour les salons ?"
    A: "Planity propose un modèle freemium mais prélève des commissions sur les nouvelles réservations générées via sa marketplace..."
  - Q: "Quelle est la différence entre Planity et Nouryx ?"
    A: "Nouryx propose un modèle 0% commission avec gestion des réservations parallèles et des employés indépendants..."
  - Q: "Peut-on migrer ses clients de Planity vers Nouryx ?"
    A: "Oui, Nouryx propose un outil d'import de données client depuis Planity et Fresha..."
```

**RESEARCH INSTRUCTIONS FOR AGENT:**
Search for: `planity logiciel salon coiffure avis 2026`, `planity vs fresha france`, `meilleur logiciel coiffure france 2026`
Key facts to include:
- Planity has ~4.66M organic visits/month, DA 67
- France has ~100,000 salons
- 40% of French salon bookings happen after salon closes
- Planity weakness: can't handle parallel bookings (colorist processing multiple clients)
- French salons uniquely have hybrid model: salaried + chair renters
- Nouryx advantage: 0% commission, handles both models

---

#### BLOG FR-02
```yaml
slug: reduire-no-shows-salon-coiffure
locale: fr
category: b2b
primaryKeyword: réduire no-show salon coiffure
secondaryKeywords:
  - rappels automatiques salon
  - annulation rendez-vous coiffeur
  - gestion absences salon beauté
  - logiciel rappel sms salon
metaTitle: "Comment réduire les no-shows dans votre salon en 2026"
metaDescription: "Les absences coûtent en moyenne 150€/jour à un salon de coiffure. Découvrez les 5 stratégies prouvées pour réduire vos no-shows jusqu'à 70% avec Nouryx."
cta: b2b
```
**RESEARCH:** Search `no-show taux salon coiffure france statistiques`, `cout absence client salon beauté`

---

#### BLOG FR-03
```yaml
slug: inscrire-salon-plateforme-reservation-en-ligne
locale: fr
category: b2b
primaryKeyword: inscrire salon plateforme réservation en ligne
secondaryKeywords:
  - logiciel réservation salon gratuit
  - agenda en ligne salon de coiffure
  - système réservation salon beauté
metaTitle: "Comment inscrire votre salon sur une plateforme de réservation en ligne"
metaDescription: "Guide complet pour inscrire votre salon sur Nouryx et recevoir des réservations en ligne 24h/24. Gratuit, rapide, sans commission."
cta: b2b
```

---

#### BLOG FR-04
```yaml
slug: meilleurs-salons-coiffure-paris-2026
locale: fr
category: b2c
primaryKeyword: meilleur salon de coiffure Paris
secondaryKeywords:
  - coiffeur Paris en ligne
  - réserver coiffeur Paris
  - salon beauté Paris arrondissement
  - coiffeur Paris pas cher
metaTitle: "Les meilleurs salons de coiffure à Paris en 2026 — Réservez en ligne"
metaDescription: "Découvrez les salons de coiffure les mieux notés à Paris par arrondissement. Réservez en ligne en secondes sur Nouryx. Coupe, couleur, brushing."
cta: b2c
```

---

#### BLOG FR-05
```yaml
slug: gestion-employes-independants-salon-coiffure
locale: fr
category: b2b
primaryKeyword: gérer employés indépendants salon coiffure
secondaryKeywords:
  - location chaise coiffeur logiciel
  - salarié indépendant même salon
  - planning salon hybride
metaTitle: "Gérer salariés et indépendants dans votre salon — Guide 2026"
metaDescription: "40% des salons français ont des coiffeurs indépendants et salariés. Découvrez comment Nouryx gère les deux modèles sans friction."
cta: b2b
```
**RESEARCH:** Search `location chaise coiffeur france legislation`, `salon hybride salarié indépendant gestion`

---

#### BLOG FR-06
```yaml
slug: tendances-coiffure-2026-france
locale: fr
category: b2c
primaryKeyword: tendances coiffure 2026
secondaryKeywords:
  - coupes cheveux mode 2026
  - couleur cheveux tendance 2026
  - balayage tendance 2026
metaTitle: "Tendances coiffure 2026 : Les coupes et couleurs à adopter"
metaDescription: "Balayage naturel, coupe wolf, couleurs pastels... découvrez les tendances coiffure 2026 et réservez votre coiffeur en ligne sur Nouryx."
cta: b2c
```

---

### 🇬🇧 ENGLISH BLOGS (Write in English)

#### BLOG EN-01 — HIGHEST PRIORITY
```yaml
slug: fresha-alternative-2026
locale: en
category: comparison
primaryKeyword: alternatives to fresha salon software
secondaryKeywords:
  - fresha vs booksy
  - fresha commission fees
  - best salon booking software France
  - fresha competitor 2026
metaTitle: "5 Best Fresha Alternatives for Salons in 2026"
metaDescription: "Fresha's hidden fees adding up? Compare the top 5 Fresha alternatives for salons in France. See which platform offers 0% commission and better scheduling."
h1: "The 5 Best Fresha Alternatives for Salon Owners in 2026"
cta: b2b
faqs:
  - Q: "Is Fresha actually free for salons?"
    A: "Fresha's software is free but charges processing fees on payments plus marketplace commission on new clients..."
  - Q: "What is the best Fresha alternative in France?"
    A: "Nouryx is built specifically for the French market with 0% commission, French-language support, and handles the complex hybrid employment models common in French salons..."
```
**RESEARCH:** Search `fresha alternatives 2026`, `fresha commission fees salons`, `salon booking software France`

---

#### BLOG EN-02
```yaml
slug: how-to-book-hair-salon-online-france
locale: en
category: b2c
primaryKeyword: book hair salon online France
secondaryKeywords:
  - online salon booking France
  - book beauty appointment France
  - hair salon near me France
metaTitle: "How to Book a Hair Salon Online in France — Complete Guide 2026"
metaDescription: "New to France or just tired of phone calls? Here's exactly how to book a hair salon online in France in under 2 minutes using Nouryx."
cta: b2c
```

---

#### BLOG EN-03
```yaml
slug: reduce-salon-no-shows-2026
locale: en
category: b2b
primaryKeyword: reduce salon no-shows
secondaryKeywords:
  - salon cancellation policy
  - automated appointment reminders
  - salon management software no-shows
metaTitle: "How to Reduce Salon No-Shows by 70% in 2026"
metaDescription: "No-shows cost the average salon €150/day. Here are 5 proven strategies including automated SMS reminders that cut cancellations by up to 70%."
cta: b2b
```

---

#### BLOG EN-04
```yaml
slug: 7-salon-marketing-strategies-2026
locale: en
category: b2b
primaryKeyword: salon marketing strategies 2026
secondaryKeywords:
  - email marketing for salons
  - grow salon clients online
  - Google Business Profile salon
  - salon social media marketing
metaTitle: "7 Salon Marketing Strategies to Stay Fully Booked in 2026"
metaDescription: "94% of clients prefer booking online. Here are 7 automated marketing strategies that keep your salon calendar full — starting today."
cta: b2b
```

---

#### BLOG EN-05
```yaml
slug: best-beauty-salons-paris-2026
locale: en
category: b2c
primaryKeyword: best beauty salons Paris
secondaryKeywords:
  - hair salon Paris book online
  - top rated salons Paris
  - Paris beauty salon English
metaTitle: "Best Beauty Salons in Paris 2026 — Book Online | Nouryx"
metaDescription: "Looking for the best hair salons, spas or nail studios in Paris? Here are the top-rated options by arrondissement — all bookable online in seconds."
cta: b2c
```

---

### 🇪🇸 SPANISH BLOGS (Write in Spanish)

#### BLOG ES-01
```yaml
slug: alternativa-fresha-espana-2026
locale: es
category: comparison
primaryKeyword: alternativa a fresha para peluquerías
secondaryKeywords:
  - mejor app reservas peluquería españa
  - programa gestión peluquería gratis
  - fresha opiniones españa
metaTitle: "Las 5 mejores alternativas a Fresha para peluquerías en 2026"
metaDescription: "¿Las comisiones de Fresha son demasiado altas? Descubre las mejores alternativas para peluquerías en España con 0% de comisión."
cta: b2b
```
**RESEARCH:** Search `alternativa fresha españa`, `programa gestión peluquería españa 2026`

---

#### BLOG ES-02
```yaml
slug: gestionar-peluqueria-movil-2026
locale: es
category: b2b
primaryKeyword: gestionar peluquería desde el móvil
secondaryKeywords:
  - app gestión peluquería
  - agenda virtual barbería
  - programa reservas peluquería
metaTitle: "Cómo gestionar tu peluquería desde el móvil en 2026"
metaDescription: "El 46% de las citas en peluquerías se reservan fuera del horario laboral. Aquí te explicamos cómo gestionar todo desde tu móvil con Nouryx."
cta: b2b
```

---

#### BLOG ES-03
```yaml
slug: como-reservar-salon-belleza-online-francia
locale: es
category: b2c
primaryKeyword: reservar salón de belleza online Francia
secondaryKeywords:
  - peluquería online Francia
  - reservar cita peluquería Francia
metaTitle: "Cómo reservar en un salón de belleza online en Francia — Guía 2026"
metaDescription: "¿Vives en Francia y buscas peluquería? Aprende a reservar tu cita en un salón de belleza online en minutos con Nouryx."
cta: b2c
```

---

### 🇮🇹 ITALIAN BLOGS (Write in Italian)

#### BLOG IT-01
```yaml
slug: software-parrucchieri-gdpr-2026
locale: it
category: b2b
primaryKeyword: software gestionale parrucchieri GDPR
secondaryKeywords:
  - miglior software parrucchieri 2026
  - gestionale salone bellezza fatturazione
  - uala alternativa italia
metaTitle: "Software Gestionale per Parrucchieri: GDPR e Fatturazione 2026"
metaDescription: "Proteggi il tuo salone dalle sanzioni GDPR e dalla fatturazione errata. Scopri come Nouryx gestisce compliance e fatturazione automaticamente."
cta: b2b
```
**RESEARCH:** Search `software parrucchieri italia 2026`, `gdpr salone bellezza italia`, `fatturazione elettronica parrucchiere`

---

#### BLOG IT-02
```yaml
slug: come-prenotare-parrucchiere-online-francia
locale: it
category: b2c
primaryKeyword: prenotare parrucchiere online Francia
secondaryKeywords:
  - salone bellezza online prenotazione
  - miglior parrucchiere Parigi
metaTitle: "Come prenotare un parrucchiere online in Francia — Guida 2026"
metaDescription: "Vivi in Francia e cerchi un parrucchiere? Ecco come prenotare online in pochi minuti con Nouryx, disponibile 24 ore su 24."
cta: b2c
```

---

#### BLOG IT-03
```yaml
slug: migliori-saloni-bellezza-parigi-2026
locale: it
category: b2c
primaryKeyword: migliori saloni di bellezza Parigi
secondaryKeywords:
  - parrucchiere Parigi prenota online
  - salone bellezza Parigi italiano
metaTitle: "I migliori saloni di bellezza a Parigi nel 2026 — Prenota online"
metaDescription: "Alla ricerca del miglior parrucchiere o spa a Parigi? Ecco i saloni più apprezzati per quartiere, tutti prenotabili online su Nouryx."
cta: b2c
```

---

### 🇧🇷 PORTUGUESE BLOGS (Write in Portuguese)

#### BLOG PT-01
```yaml
slug: aumentar-retencao-clientes-salao-2026
locale: pt
category: b2b
primaryKeyword: aumentar retenção clientes salão de beleza
secondaryKeywords:
  - CRM salão de beleza
  - software gestão salão
  - como fidelizar clientes salão
metaTitle: "Como Aumentar a Retenção de Clientes no seu Salão em 2026"
metaDescription: "94% dos clientes preferem reservar online. Veja como usar o CRM do Nouryx para fidelizar clientes e manter o salão sempre cheio."
cta: b2b
```
**RESEARCH:** Search `retenção clientes salão beleza brasil portugal`, `software gestão salão beleza 2026`

---

#### BLOG PT-02
```yaml
slug: como-agendar-salao-beleza-online-franca
locale: pt
category: b2c
primaryKeyword: agendar salão de beleza online França
secondaryKeywords:
  - cabeleireiro online França
  - reservar salão França
metaTitle: "Como Agendar em um Salão de Beleza Online na França — Guia 2026"
metaDescription: "Mora na França e procura cabeleireiro? Veja como agendar seu horário em um salão de beleza online em minutos com o Nouryx."
cta: b2c
```

---

#### BLOG PT-03
```yaml
slug: melhores-saloes-beleza-paris-2026
locale: pt
category: b2c
primaryKeyword: melhores salões de beleza Paris
secondaryKeywords:
  - cabeleireiro Paris online
  - salão beleza Paris brasileiro
metaTitle: "Os melhores salões de beleza em Paris em 2026 — Agende online"
metaDescription: "Procurando o melhor cabeleireiro ou spa em Paris? Veja os salões mais bem avaliados por bairro, todos agendáveis online no Nouryx."
cta: b2c
```

---

# SECTION 8: COMPETITOR COMPARISON PAGES

## ✅ AGENT TASK: Create Comparison Page Template

**File to create:** `pages/blog/[slug].tsx` already handles this. Use the same structure.

Create these as Firestore blog documents with `category: "comparison"`:

| Slug | Locale | Primary Keyword |
|------|--------|----------------|
| `planity-vs-nouryx-2026` | fr | planity avis alternative |
| `fresha-alternative-2026` | en | alternatives to fresha |
| `fresha-alternative-france` | fr | alternative fresha france |
| `alternativa-fresha-espana` | es | alternativa fresha españa |
| `meilleur-logiciel-salon-coiffure-2026` | fr | meilleur logiciel salon coiffure |
| `software-parrucchieri-italia-2026` | it | software gestionale parrucchieri |

### Comparison Page Content Structure (Agent must follow):
```
H1: [Competitor] vs Nouryx — [Year]
Introduction: Acknowledge competitor size. Frame as honest comparison.
H2: [Competitor] — What is it, who is it for
H2: Nouryx — What is it, who is it for
H2: Comparison Table (Commission, Features, Languages, Support, Price)
H2: Which is better for [target country] salons?
H2: How to switch from [Competitor] to Nouryx
FAQ Section (5 questions)
CTA: "Try Nouryx Free — 0% Commission"
```

---

# SECTION 9: XML SITEMAP — DYNAMIC & FIREBASE-AWARE

## ✅ AGENT TASK: Create Dynamic Sitemap

**File to create:** `pages/sitemap.xml.tsx`

```tsx
// pages/sitemap.xml.tsx
import type { GetServerSideProps } from 'next'
import { getDocs, query, collection, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

const BASE = 'https://nouryx.com'
const LOCALES = ['fr', 'en', 'es', 'it', 'pt']

// French is default locale (no prefix in URL)
const buildUrl = (locale: string, path: string) =>
  locale === 'fr' ? `${BASE}${path}` : `${BASE}/${locale}${path}`

const STATIC_PATHS = [
  '/',
  '/salons',
  '/pricing',
  '/about',
  '/contact',
  '/signup',
  '/blog',
]

function generateSitemapXml(urls: Array<{
  loc: string
  lastmod: string
  changefreq: string
  priority: string
  alternates: Array<{ hreflang: string; href: string }>
}>) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    ${u.alternates.map(a =>
      `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`
    ).join('\n    ')}
  </url>`).join('\n')}
</urlset>`
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const today = new Date().toISOString().split('T')[0]

  // Fetch salons from Firebase
  const salonSnap = await getDocs(
    query(collection(db, 'salons'), where('isPublished', '==', true))
  )
  const salons = salonSnap.docs.map(d => ({
    slug: d.data().slug,
    updatedAt: d.data().updatedAt?.split('T')[0] || today,
  }))

  // Fetch blogs from Firebase
  const blogSnap = await getDocs(
    query(collection(db, 'blogs'), where('isPublished', '==', true))
  )
  const blogs = blogSnap.docs.map(d => ({
    slug: d.data().slug,
    locale: d.data().locale,
    updatedAt: d.data().updatedAt?.split('T')[0] || today,
  }))

  const urls = [
    // Static pages
    ...LOCALES.flatMap(locale =>
      STATIC_PATHS.map(path => ({
        loc: buildUrl(locale, path),
        lastmod: today,
        changefreq: 'weekly',
        priority: path === '/' ? '1.0' : '0.8',
        alternates: [
          ...LOCALES.map(l => ({
            hreflang: l === 'fr' ? 'fr-FR' : l === 'en' ? 'en-GB' : l === 'es' ? 'es-ES' : l === 'it' ? 'it-IT' : 'pt-PT',
            href: buildUrl(l, path),
          })),
          { hreflang: 'x-default', href: buildUrl('fr', path) },
        ],
      }))
    ),

    // Salon profile pages (programmatic SEO)
    ...LOCALES.flatMap(locale =>
      salons.map(salon => ({
        loc: buildUrl(locale, `/salon/${salon.slug}`),
        lastmod: salon.updatedAt,
        changefreq: 'daily',
        priority: '0.9',
        alternates: [
          ...LOCALES.map(l => ({
            hreflang: l === 'fr' ? 'fr-FR' : l === 'en' ? 'en-GB' : l === 'es' ? 'es-ES' : l === 'it' ? 'it-IT' : 'pt-PT',
            href: buildUrl(l, `/salon/${salon.slug}`),
          })),
          { hreflang: 'x-default', href: buildUrl('fr', `/salon/${salon.slug}`) },
        ],
      }))
    ),

    // Blog posts
    ...blogs.map(blog => ({
      loc: buildUrl(blog.locale, `/blog/${blog.slug}`),
      lastmod: blog.updatedAt,
      changefreq: 'monthly',
      priority: '0.7',
      alternates: [
        {
          hreflang: blog.locale === 'fr' ? 'fr-FR' : blog.locale === 'en' ? 'en-GB' : blog.locale === 'es' ? 'es-ES' : blog.locale === 'it' ? 'it-IT' : 'pt-PT',
          href: buildUrl(blog.locale, `/blog/${blog.slug}`),
        },
        { hreflang: 'x-default', href: buildUrl('fr', `/blog/${blog.slug}`) },
      ],
    })),
  ]

  res.setHeader('Content-Type', 'text/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.write(generateSitemapXml(urls))
  res.end()

  return { props: {} }
}

export default function Sitemap() { return null }
```

---

# SECTION 10: ROBOTS.TXT

## ✅ AGENT TASK: Create robots.txt

**File to create:** `public/robots.txt`

```
User-agent: *
Allow: /

# Allow all 5 language versions explicitly
Allow: /en/
Allow: /es/
Allow: /it/
Allow: /pt/

# Block internal/admin/API routes
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /_next/
Disallow: /login
Disallow: /signup/success

# Allow bots to access static assets
Allow: /_next/static/
Allow: /images/

# Sitemap location
Sitemap: https://nouryx.com/sitemap.xml

# Friendly crawl rate
Crawl-delay: 1
```

---

# SECTION 11: 404 PAGE + REDIRECT MAP

## ✅ AGENT TASK: Create Smart 404 Page

**File to create:** `pages/404.tsx`

```tsx
// pages/404.tsx
import { useRouter } from 'next/router'
import Link from 'next/link'
import { SeoHead } from '@/components/seo/SeoHead'

const COPY: Record<string, any> = {
  fr: {
    title: 'Page introuvable',
    subtitle: 'Cette page n\'existe pas, mais votre prochain rendez-vous beauté, lui, existe.',
    searchLabel: 'Trouver un salon',
    cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
    cta: 'Voir tous les salons',
    ctaB2b: 'Inscrire mon salon',
  },
  en: {
    title: 'Page not found',
    subtitle: 'This page doesn\'t exist, but your next beauty appointment does.',
    searchLabel: 'Find a salon',
    cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
    cta: 'View all salons',
    ctaB2b: 'List your salon',
  },
  es: {
    title: 'Página no encontrada',
    subtitle: 'Esta página no existe, pero tu próxima cita de belleza sí.',
    searchLabel: 'Encontrar un salón',
    cities: ['París', 'Lyon', 'Marsella', 'Toulouse', 'Niza'],
    cta: 'Ver todos los salones',
    ctaB2b: 'Registrar mi salón',
  },
  it: {
    title: 'Pagina non trovata',
    subtitle: 'Questa pagina non esiste, ma il tuo prossimo appuntamento di bellezza sì.',
    searchLabel: 'Trova un salone',
    cities: ['Parigi', 'Lione', 'Marsiglia', 'Tolosa', 'Nizza'],
    cta: 'Vedi tutti i saloni',
    ctaB2b: 'Registra il mio salone',
  },
  pt: {
    title: 'Página não encontrada',
    subtitle: 'Esta página não existe, mas seu próximo agendamento de beleza sim.',
    searchLabel: 'Encontrar um salão',
    cities: ['Paris', 'Lyon', 'Marselha', 'Toulouse', 'Nice'],
    cta: 'Ver todos os salões',
    ctaB2b: 'Cadastrar meu salão',
  },
}

export default function NotFound() {
  const { locale } = useRouter()
  const c = COPY[locale || 'fr']
  const prefix = locale !== 'fr' ? `/${locale}` : ''

  return (
    <>
      <SeoHead
        title={`404 — ${c.title} | Nouryx`}
        description={c.subtitle}
        noIndex={true}
      />
      <main className="not-found-page text-center py-24 px-6">
        <p className="text-6xl mb-4">✂️</p>
        <h1 className="text-4xl font-bold mb-4">404 — {c.title}</h1>
        <p className="text-xl text-gray-500 mb-10">{c.subtitle}</p>

        {/* Quick search */}
        <Link href={`${prefix}/salons`} className="btn-primary mb-8 inline-block">
          🔍 {c.searchLabel}
        </Link>

        {/* City shortcuts */}
        <div className="cities flex justify-center gap-4 mb-10 flex-wrap">
          {c.cities.map((city: string) => (
            <Link
              key={city}
              href={`${prefix}/salons/${city.toLowerCase()}`}
              className="px-4 py-2 border rounded-full hover:bg-blue-50"
            >
              📍 {city}
            </Link>
          ))}
        </div>

        {/* B2B CTA */}
        <p className="text-sm text-gray-400 mt-8">
          Vous êtes professionnel ?{' '}
          <Link href={`${prefix}/signup`} className="text-blue-600 underline">
            {c.ctaB2b}
          </Link>
        </p>
      </main>
    </>
  )
}
```

## ✅ AGENT TASK: Add Redirect Map to next.config.js

```javascript
// next.config.js — add to existing config
async redirects() {
  return [
    // ─── Domain migration: Vercel → production ───────────────
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'booking-nouryx.vercel.app' }],
      destination: 'https://nouryx.com/:path*',
      permanent: true, // 301 — passes 100% SEO authority
    },

    // ─── Legacy URL normalization ─────────────────────────────
    // If old routes existed without locale prefix, redirect to French
    { source: '/salon/:slug', destination: '/salon/:slug', permanent: false }, // already correct
    { source: '/salons', destination: '/salons', permanent: false }, // already correct

    // ─── Remove trailing slashes ──────────────────────────────
    {
      source: '/:path+/',
      destination: '/:path+',
      permanent: true,
    },
  ]
},
```

---

# SECTION 12: AEO/GEO — AI SEARCH OPTIMIZATION

## ✅ AGENT TASK: Add Speakable Schema to All Blog Posts

Already included in `BlogSchema.tsx` via the `speakable` property with `cssSelector: ['h1', '.article-summary', '.key-takeaway']`.

## ✅ AGENT TASK: Add `.key-takeaway` Section to Every Blog

In the blog content stored in Firestore, every article must start with:

```html
<!-- Add this HTML at the top of every blog post content field -->
<div class="key-takeaway">
  <h2>Points clés</h2>
  <ul>
    <li>[Most important fact from article — contains primary keyword]</li>
    <li>[Second key point — contains secondary keyword]</li>
    <li>[Third key point — actionable for reader]</li>
  </ul>
</div>
```

This `key-takeaway` section is what Google AI Overviews and ChatGPT extract to answer user queries. It's also referenced in the speakable schema.

## ✅ AGENT TASK: Add Entity Consistency Throughout Site

In every page's content, meta tags, and schema, consistently reference these entity clusters so Google's Knowledge Graph connects Nouryx to these concepts:

```
Nouryx + [réservation salon] + [France] + [coiffeur] + [Paris, Lyon, Marseille]
Nouryx + [salon booking] + [France] + [hair salon] + [beauty platform]
Nouryx + [logiciel salon] + [0% commission] + [alternative Planity] + [alternative Fresha]
```

## ✅ AGENT TASK: Add FAQ Section to Homepage

Add a visible FAQ section to `pages/index.tsx` with `FaqSchema`:

```tsx
// In pages/index.tsx — add below the hero section
import { FaqSchema } from '@/components/seo/schemas/FaqSchema'

const HOME_FAQS: Record<string, Array<{question: string; answer: string}>> = {
  fr: [
    {
      question: "Comment réserver un salon de coiffure en ligne en France avec Nouryx ?",
      answer: "Rendez-vous sur Nouryx, recherchez un salon par ville ou service, choisissez un créneau disponible et confirmez. La réservation est instantanée, gratuite et disponible 24h/24."
    },
    {
      question: "Nouryx est-il gratuit pour réserver un salon ?",
      answer: "Oui, Nouryx est entièrement gratuit pour les clients. Vous réservez votre rendez-vous sans frais. Les salons paient un abonnement pour accéder à la plateforme."
    },
    {
      question: "Comment inscrire mon salon sur Nouryx ?",
      answer: "Cliquez sur 'Inscrire mon salon', créez votre profil, ajoutez vos services et tarifs. Votre salon est en ligne en moins de 30 minutes et commence à recevoir des réservations."
    },
    {
      question: "Quelle est la différence entre Nouryx et Planity ou Fresha ?",
      answer: "Nouryx est conçu pour le marché français avec 0% de commission sur les réservations, la gestion des employés indépendants et salariés, et le support en français 7j/7."
    },
  ],
  en: [
    {
      question: "How do I book a hair salon online in France with Nouryx?",
      answer: "Visit Nouryx, search for a salon by city or service, choose an available time slot and confirm. Booking is instant, free and available 24/7."
    },
    {
      question: "Is Nouryx free to use for clients?",
      answer: "Yes, Nouryx is completely free for clients. You book your appointment at no cost. Salons pay a subscription to access the platform."
    },
    {
      question: "How is Nouryx different from Fresha or Planity?",
      answer: "Nouryx is built specifically for the French market with 0% booking commission, full French-language support, and handles complex salon structures like chair rental alongside salaried staff."
    },
  ],
  // Add es, it, pt equivalents
}
```

---

# SECTION 13: EDGE MIDDLEWARE — LANGUAGE SUGGESTION BANNER

## ✅ AGENT TASK: Create Middleware File

**File to create:** `middleware.ts` (at root of project, same level as `pages/`)

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPPORTED_LOCALES = ['fr', 'en', 'es', 'it', 'pt']

// Map country codes to suggested locale
const COUNTRY_LOCALE_MAP: Record<string, string> = {
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr', MC: 'fr', // French-speaking
  GB: 'en', US: 'en', CA: 'en', AU: 'en', IE: 'en', // English-speaking
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', // Spanish-speaking
  IT: 'it', SM: 'it', VA: 'it',                       // Italian-speaking
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',            // Portuguese-speaking
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // Skip middleware for static files, API routes, _next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return response
  }

  // Get user's country from Vercel's geo header
  const country = request.geo?.country || ''
  const suggestedLocale = COUNTRY_LOCALE_MAP[country] || 'fr'

  // Get current locale from URL
  const currentLocale = pathname.split('/')[1]
  const isLocaleInPath = SUPPORTED_LOCALES.includes(currentLocale)
  const activeLocale = isLocaleInPath ? currentLocale : 'fr'

  // Check if user has already dismissed or chosen a language
  const langChoice = request.cookies.get('nouryx-lang-choice')

  // If suggested locale differs from current AND user hasn't made a choice yet
  // → Set a header that the client reads to show a suggestion banner
  // ⚠️ NEVER redirect — only suggest. Redirecting breaks Googlebot indexing.
  if (suggestedLocale !== activeLocale && !langChoice) {
    response.headers.set('x-suggested-locale', suggestedLocale)
    response.headers.set('x-user-country', country)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api).*)',
  ],
}
```

## ✅ AGENT TASK: Create Language Suggestion Banner Component

**File to create:** `components/ui/LanguageSuggestionBanner.tsx`

```tsx
// components/ui/LanguageSuggestionBanner.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const BANNER_COPY: Record<string, Record<string, string>> = {
  en: {
    message: "Would you prefer to browse Nouryx in English?",
    accept: "Yes, switch to English",
    decline: "No thanks",
  },
  es: {
    message: "¿Prefieres ver Nouryx en Español?",
    accept: "Sí, cambiar a Español",
    decline: "No, gracias",
  },
  it: {
    message: "Preferisci navigare Nouryx in Italiano?",
    accept: "Sì, passa all'Italiano",
    decline: "No, grazie",
  },
  pt: {
    message: "Prefere ver o Nouryx em Português?",
    accept: "Sim, mudar para Português",
    decline: "Não, obrigado",
  },
}

export function LanguageSuggestionBanner() {
  const { asPath, locale } = useRouter()
  const [suggestedLocale, setSuggestedLocale] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Read the suggested locale set by middleware via a meta tag or API call
    // In Pages Router, we pass this via a custom _document header or cookie
    const suggested = document.cookie
      .split('; ')
      .find(row => row.startsWith('x-suggested-locale='))
      ?.split('=')[1]

    if (suggested && suggested !== locale && BANNER_COPY[suggested]) {
      setSuggestedLocale(suggested)
      setVisible(true)
    }
  }, [locale])

  const handleDecline = () => {
    // Remember choice for 30 days
    document.cookie = `nouryx-lang-choice=${locale}; max-age=${30 * 24 * 60 * 60}; path=/`
    setVisible(false)
  }

  const handleAccept = () => {
    document.cookie = `nouryx-lang-choice=${suggestedLocale}; max-age=${30 * 24 * 60 * 60}; path=/`
    setVisible(false)
  }

  if (!visible || !suggestedLocale) return null

  const copy = BANNER_COPY[suggestedLocale]

  return (
    <div className="lang-banner fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm bg-white shadow-xl rounded-xl p-4 z-50 border border-gray-100">
      <p className="text-sm font-medium text-gray-800 mb-3">{copy.message}</p>
      <div className="flex gap-2">
        <Link
          href={asPath}
          locale={suggestedLocale}
          onClick={handleAccept}
          className="flex-1 text-center text-sm bg-blue-600 text-white rounded-lg py-2 px-3 hover:bg-blue-700"
        >
          {copy.accept}
        </Link>
        <button
          onClick={handleDecline}
          className="text-sm text-gray-400 hover:text-gray-600 px-2"
        >
          {copy.decline}
        </button>
      </div>
    </div>
  )
}
```

**Add to `pages/_app.tsx`:**
```tsx
import { LanguageSuggestionBanner } from '@/components/ui/LanguageSuggestionBanner'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <HreflangTags />
      <Component {...pageProps} />
      <LanguageSuggestionBanner />
    </>
  )
}
```

---

# SECTION 14: PWA — MAKE NOURYX INSTALLABLE

## ✅ AGENT TASK: Install and Configure next-pwa

```bash
npm install next-pwa
```

**File to edit:** `next.config.js`

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // only in production
  runtimeCaching: [
    {
      // Cache salon pages for offline browsing
      urlPattern: /^https:\/\/nouryx\.com\/.*\/salon\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'salon-pages',
        expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      // Cache Firebase Storage images
      urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'firebase-images',
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      // Cache Google Fonts
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'google-fonts' },
    },
  ],
})

module.exports = withPWA({
  i18n: {
    locales: ['fr', 'en', 'es', 'it', 'pt'],
    defaultLocale: 'fr',
    localeDetection: false,
  },
  // ... rest of your config
})
```

## ✅ AGENT TASK: Create Web App Manifest

**File to create:** `public/manifest.json`

```json
{
  "name": "Nouryx — Réservation Salon Beauté",
  "short_name": "Nouryx",
  "description": "Réservez les meilleurs salons de coiffure, spas et instituts de beauté en ligne",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#1E3A8A",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/images/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/images/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/images/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/images/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/images/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/images/screenshot-home.jpg",
      "sizes": "390x844",
      "type": "image/jpeg",
      "form_factor": "narrow",
      "label": "Homepage — Find salons near you"
    }
  ],
  "categories": ["lifestyle", "beauty", "shopping"],
  "lang": "fr",
  "dir": "ltr"
}
```

**Add to `pages/_document.tsx`:**
```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Nouryx" />
<link rel="apple-touch-icon" href="/images/icons/icon-192x192.png" />
```

> **AGENT NOTE:** Generate icon files at all required sizes from the Nouryx logo. Use `/images/website-logo.png` as source. Create the `/public/images/icons/` directory.

### 🔍 VERIFY:
```
1. Deploy to nouryx.com (PWA only works on HTTPS)
2. Open Chrome DevTools → Application → Manifest
3. Should show all icons and "Add to Home Screen" capability
4. Open Chrome DevTools → Application → Service Workers
5. Should show "Activated and running"
6. Run Lighthouse audit → PWA score should be 100
```

---

# SECTION 15: GA4 EVENT TRACKING

## ✅ AGENT TASK: Add GA4 Script

**File to edit:** `pages/_document.tsx`

```tsx
// pages/_document.tsx — add GA4 to <Head>
// Replace GA_MEASUREMENT_ID with actual ID from Google Analytics account
// Format: G-XXXXXXXXXX

const GA_ID = process.env.NEXT_PUBLIC_GA_ID // set in Vercel env vars

// Inside <Head>:
{GA_ID && (
  <>
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
    />
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure',
          });
        `,
      }}
    />
  </>
)}
```

## ✅ AGENT TASK: Create GA4 Event Tracker

**File to create:** `lib/analytics/events.ts`

```typescript
// lib/analytics/events.ts
// Call these functions on key user actions to track the booking funnel

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const GA = {
  // Salon discovery
  viewSalon: (salonName: string, city: string, locale: string) => {
    window.gtag?.('event', 'view_salon', {
      salon_name: salonName,
      salon_city: city,
      language: locale,
    })
  },

  // Booking funnel
  clickBookNow: (salonName: string, service: string) => {
    window.gtag?.('event', 'click_book_now', {
      salon_name: salonName,
      service_name: service,
    })
  },

  selectTimeSlot: (salonName: string) => {
    window.gtag?.('event', 'select_time_slot', { salon_name: salonName })
  },

  completeBooking: (salonName: string, service: string, price: number) => {
    window.gtag?.('event', 'complete_booking', {
      salon_name: salonName,
      service_name: service,
      value: price,
      currency: 'EUR',
    })
  },

  // Salon owner funnel
  viewPricing: (locale: string) => {
    window.gtag?.('event', 'view_pricing', { language: locale })
  },

  startSalonSignup: () => {
    window.gtag?.('event', 'start_salon_signup')
  },

  completeSalonSignup: (city: string) => {
    window.gtag?.('event', 'complete_salon_signup', {
      salon_city: city,
    })
  },

  // Content engagement
  readBlog: (blogTitle: string, category: string, locale: string) => {
    window.gtag?.('event', 'read_blog', {
      blog_title: blogTitle,
      blog_category: category,
      language: locale,
    })
  },

  clickBlogCta: (blogTitle: string, ctaType: 'b2b' | 'b2c') => {
    window.gtag?.('event', 'click_blog_cta', {
      blog_title: blogTitle,
      cta_type: ctaType,
    })
  },

  // Language switching
  switchLanguage: (fromLocale: string, toLocale: string) => {
    window.gtag?.('event', 'switch_language', {
      from_language: fromLocale,
      to_language: toLocale,
    })
  },

  // Search
  searchSalons: (query: string, city: string, locale: string) => {
    window.gtag?.('event', 'search', {
      search_term: query,
      search_city: city,
      language: locale,
    })
  },
}
```

**Usage example in salon page:**
```tsx
import { GA } from '@/lib/analytics/events'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

// In SalonPage component:
const { locale } = useRouter()

useEffect(() => {
  GA.viewSalon(salon.name, salon.city, locale || 'fr')
}, [])

// On "Book Now" button click:
<button onClick={() => GA.clickBookNow(salon.name, selectedService)}>
  Réserver maintenant
</button>
```

---

# SECTION 16: CRO — A/B TESTING WITH VERCEL

## ✅ AGENT TASK: Set Up A/B Test for Homepage Hero CTA

Vercel Edge Middleware can split traffic 50/50 between two page variants — no third-party tools needed.

**File to create:** `middleware.ts` — add to existing middleware:

```typescript
// Add inside existing middleware.ts function
// A/B test for homepage CTA button text
// Cookie ensures same user always sees same variant

const abCookie = request.cookies.get('nouryx-ab-hero')

if (!abCookie && pathname === '/') {
  const variant = Math.random() < 0.5 ? 'a' : 'b'
  response.headers.set('x-ab-variant', variant)
  response.cookies.set('nouryx-ab-hero', variant, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
} else if (abCookie) {
  response.headers.set('x-ab-variant', abCookie.value)
}
```

**File to create:** `lib/ab/useVariant.ts`

```typescript
// lib/ab/useVariant.ts
import { useEffect, useState } from 'react'

export function useAbVariant(testName: string): 'a' | 'b' | null {
  const [variant, setVariant] = useState<'a' | 'b' | null>(null)

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`nouryx-ab-${testName}=`))
      ?.split('=')[1]
    setVariant((cookie as 'a' | 'b') || null)
  }, [testName])

  return variant
}
```

**Usage in `pages/index.tsx`:**
```tsx
import { useAbVariant } from '@/lib/ab/useVariant'
import { GA } from '@/lib/analytics/events'

// Top 3 highest-impact tests to run first:

// TEST 1 — Hero CTA button copy
const heroVariant = useAbVariant('hero')
// Variant A (current): "Book Your Appointment" / "Réserver votre rendez-vous"
// Variant B (test):    "Find a Salon Near Me" / "Trouver un salon près de moi"

// TEST 2 — Social proof position  
// Variant A: Reviews section at bottom of page
// Variant B: "★★★★★ Trusted by 500+ salons" directly under hero CTA

// TEST 3 — Salon owner CTA copy
// Variant A: "List Your Business"
// Variant B: "Register Free — 0% Commission"

<button
  onClick={() => {
    window.gtag?.('event', 'hero_cta_click', { variant: heroVariant })
  }}
  className="btn-primary"
>
  {heroVariant === 'b'
    ? 'Trouver un salon près de moi'
    : 'Réserver votre rendez-vous'
  }
</button>
```

---

# SECTION 17: HOMEPAGE & SERVICE PAGE COPY — ALL 5 LANGUAGES

## ✅ AGENT TASK: Update Homepage Hero Text

Find the hero section in your homepage component and replace with these exact copies:

```tsx
// lib/i18n/homepageCopy.ts
export const HOMEPAGE_COPY = {
  fr: {
    heroTitle: "Réservez des prestations de beauté et de bien-être près de chez vous",
    heroSubtitle: "Découvrez les salons de coiffure, barbiers, spas et instituts de beauté les mieux notés. Réservation en ligne gratuite, disponible 24h/24.",
    heroCta1: "Trouver un salon",
    heroCta2: "Inscrire mon salon",
    searchPlaceholder: "Ville, service, salon...",
    trustBadge: "★★★★★ Approuvé par des milliers de clients en France",
    featuredTitle: "Salons en vedette",
    servicesTitle: "Nos services",
    b2bTitle: "Gérez votre salon avec Nouryx",
    b2bSubtitle: "Logiciel de réservation tout-en-un pour les salons de coiffure, spas et instituts de beauté. Zéro commission, agenda en ligne, rappels automatiques.",
    b2bCta: "Inscrire mon salon gratuitement",
    statsAppointments: "Rendez-vous pris",
    statsSalons: "Salons partenaires",
    statsCities: "Villes",
    statsClients: "Clients satisfaits",
  },
  en: {
    heroTitle: "Book local beauty and wellness services",
    heroSubtitle: "Discover top-rated hair salons, barbers, spas and beauty institutes. Free instant online booking, available 24/7.",
    heroCta1: "Find a Salon",
    heroCta2: "List Your Business",
    searchPlaceholder: "City, service, salon...",
    trustBadge: "★★★★★ Trusted by thousands of clients across France",
    featuredTitle: "Featured Salons",
    servicesTitle: "Our Services",
    b2bTitle: "Manage your salon with Nouryx",
    b2bSubtitle: "All-in-one booking software for hair salons, spas and beauty institutes. Zero commission, online calendar, automated reminders.",
    b2bCta: "Register Your Salon Free",
    statsAppointments: "Appointments booked",
    statsSalons: "Partner salons",
    statsCities: "Cities",
    statsClients: "Happy clients",
  },
  es: {
    heroTitle: "Reserva servicios de belleza y bienestar cerca de ti",
    heroSubtitle: "Descubre los mejores salones de peluquería, barberos, spas e institutos de belleza. Reserva online gratis, disponible 24h.",
    heroCta1: "Encontrar un salón",
    heroCta2: "Registrar mi salón",
    searchPlaceholder: "Ciudad, servicio, salón...",
    trustBadge: "★★★★★ Con la confianza de miles de clientes en Francia",
    featuredTitle: "Salones destacados",
    servicesTitle: "Nuestros servicios",
    b2bTitle: "Gestiona tu salón con Nouryx",
    b2bSubtitle: "Software de reservas todo en uno para peluquerías, spas e institutos de belleza. Cero comisión, agenda online, recordatorios automáticos.",
    b2bCta: "Registrar mi salón gratis",
    statsAppointments: "Citas reservadas",
    statsSalons: "Salones asociados",
    statsCities: "Ciudades",
    statsClients: "Clientes satisfechos",
  },
  it: {
    heroTitle: "Prenota servizi di bellezza e benessere vicino a te",
    heroSubtitle: "Scopri i migliori parrucchieri, barbieri, spa e centri estetici. Prenotazione online gratuita, disponibile 24 ore su 24.",
    heroCta1: "Trova un salone",
    heroCta2: "Registra il mio salone",
    searchPlaceholder: "Città, servizio, salone...",
    trustBadge: "★★★★★ Scelto da migliaia di clienti in Francia",
    featuredTitle: "Saloni in evidenza",
    servicesTitle: "I nostri servizi",
    b2bTitle: "Gestisci il tuo salone con Nouryx",
    b2bSubtitle: "Software di prenotazione all-in-one per parrucchieri, spa e centri estetici. Zero commissioni, agenda online, promemoria automatici.",
    b2bCta: "Registra il mio salone gratis",
    statsAppointments: "Appuntamenti prenotati",
    statsSalons: "Saloni partner",
    statsCities: "Città",
    statsClients: "Clienti soddisfatti",
  },
  pt: {
    heroTitle: "Agende serviços de beleza e bem-estar perto de você",
    heroSubtitle: "Descubra os melhores cabeleireiros, barbeiros, spas e centros de beleza. Agendamento online gratuito, disponível 24h.",
    heroCta1: "Encontrar um salão",
    heroCta2: "Cadastrar meu salão",
    searchPlaceholder: "Cidade, serviço, salão...",
    trustBadge: "★★★★★ Confiado por milhares de clientes na França",
    featuredTitle: "Salões em destaque",
    servicesTitle: "Nossos serviços",
    b2bTitle: "Gerencie seu salão com Nouryx",
    b2bSubtitle: "Software de agendamento completo para salões de beleza, spas e centros estéticos. Zero comissão, agenda online, lembretes automáticos.",
    b2bCta: "Cadastrar meu salão grátis",
    statsAppointments: "Agendamentos realizados",
    statsSalons: "Salões parceiros",
    statsCities: "Cidades",
    statsClients: "Clientes satisfeitos",
  },
}
```

---

# SECTION 18: FULL KEYWORD TAXONOMY

## Reference Table — Agent Uses These When Writing Content

### B2C Keywords (Target via Programmatic Salon Directory Pages)

| Language | Keyword | Volume | Target Page |
|----------|---------|--------|------------|
| 🇬🇧 EN | hair salon near me | 4,090,000 | /en/salons |
| 🇬🇧 EN | nail salon near me | 2,740,000 | /en/nails |
| 🇬🇧 EN | hair styling near me | 4,090,000 | /en/hair |
| 🇬🇧 EN | barbershop near me | HIGH | /en/barbers |
| 🇬🇧 EN | massage near me | HIGH | /en/massage |
| 🇫🇷 FR | coiffeur autour de moi | 1,000,000+ | /salons |
| 🇫🇷 FR | salon de coiffure Paris | HIGH | /salons/paris |
| 🇫🇷 FR | barbier près de moi | HIGH | /barbiers |
| 🇫🇷 FR | institut de beauté Paris | HIGH | /salons/paris |
| 🇫🇷 FR | spa massage Paris | HIGH | /spa |
| 🇪🇸 ES | peluquería cerca de mí | 1,000,000+ | /es/peluquerias |
| 🇪🇸 ES | barberos cerca de mí | HIGH | /es/barberos |
| 🇮🇹 IT | parrucchiere nelle vicinanze | HIGH | /it/parrucchieri |
| 🇧🇷 PT | cabeleireiro perto de mim | HIGH | /pt/cabeleireiros |

### B2B Keywords (Target via Blog Posts + Feature Pages)

| Language | Keyword | Volume | Target Page |
|----------|---------|--------|------------|
| 🇬🇧 EN | salon management software | 12,100/mo | /en/for-business |
| 🇬🇧 EN | alternatives to fresha | 3,200/mo | /en/blog/fresha-alternative |
| 🇬🇧 EN | alternatives to booksy | 3,200/mo | /en/blog/fresha-alternative |
| 🇫🇷 FR | logiciel réservation salon de coiffure | HIGH | /blog/meilleur-logiciel |
| 🇫🇷 FR | planity avis | HIGH | /blog/planity-vs-nouryx |
| 🇫🇷 FR | alternative planity | HIGH | /blog/planity-vs-nouryx |
| 🇫🇷 FR | meilleur logiciel salon coiffure 2026 | HIGH | /blog/meilleur-logiciel |
| 🇪🇸 ES | programa gestión peluquerías | HIGH | /es/para-negocios |
| 🇮🇹 IT | software gestionale parrucchieri | HIGH | /it/per-aziende |
| 🇧🇷 PT | software gestão salão de beleza | HIGH | /pt/para-negocios |

---

# SECTION 19: MANUAL PLAYBOOK — BACKLINKS & GBP

> ⚠️ AGENT: SKIP THIS ENTIRE SECTION. These are human tasks only.

## 👤 MANUAL TASK — BACKLINK ACQUISITION (Owner does this)

### Week 1–2: Free Directory Submissions (50 backlinks, ~3 hours total)
Submit nouryx.com to each of these — each submission = 1 free backlink:

**French Directories:**
- pages-jaunes.fr — French Yellow Pages
- europages.fr — European business directory
- societe.com — French company directory
- kompass.com — International B2B directory
- annuaire-inversé.net
- hoodspot.fr — French local business
- infobel.fr

**Beauty Industry Specific:**
- capterra.fr — Software review site (HIGH VALUE)
- getapp.fr — Software directory (HIGH VALUE)
- g2.com — Software review (HIGH VALUE)
- appvizer.fr — French software comparison
- logiciels-pro.com

**French Startup Directories:**
- frenchtech.co
- startupblink.com
- crunchbase.com — Create Nouryx profile
- wellfound.com (AngelList)

**Pan-European:**
- yelp.fr
- foursquare.com
- hotfrog.fr

### Month 1–3: Content-Based Link Earning

**Create these "linkable assets" (agent writes the content, you publish and promote):**

1. **"Rapport Annuel: L'industrie des salons de coiffure en France 2026"**
   - Include: number of salons (100,000), employment figures, revenue data, booking trends
   - Research: INSEE data, federation professionnelle de la coiffure
   - Publish at: nouryx.com/fr/ressources/rapport-industrie-2026
   - Pitch to: Figaro Madame, Marie Claire, Les Echos, beauty trade press

2. **"Calculateur de pertes liées aux no-shows"**
   - Free interactive tool: enter daily appointments + average ticket = annual loss from no-shows
   - Publish at: nouryx.com/fr/outils/calculateur-no-shows
   - Pitch to: coiffure blogs, salon owner Facebook groups

3. **"Guide complet: Ouvrir un salon de coiffure en France 2026"**
   - Comprehensive guide: legal requirements, costs, insurance, software
   - Gets links naturally from anyone searching "ouvrir salon coiffure"

### Month 2–4: Direct Outreach Templates

**Email template (French) — Beauty bloggers:**
```
Objet: Collaboration Nouryx × [Nom du blog]

Bonjour [Prénom],

Je m'appelle [Votre nom] de Nouryx, la nouvelle plateforme française 
de réservation de salons de coiffure.

J'ai lu votre article sur [article récent] et j'ai pensé que votre audience 
pourrait être intéressée par notre plateforme.

En échange d'une mention sur votre blog, nous serions heureux de :
→ Référencer votre salon préféré gratuitement sur Nouryx
→ Vous donner un accès premium gratuit pendant 6 mois
→ Vous offrir un bon de réservation de 50€

Intéressé(e) ? Je serais ravi d'en discuter.

Cordialement,
[Votre nom]
nouryx.com
```

## 👤 MANUAL TASK — GOOGLE BUSINESS PROFILE (Owner does this)

### Step-by-Step Setup (One Time, ~20 minutes):

1. Go to **business.google.com**
2. Click "Add your business"
3. Business name: **"Nouryx — Plateforme de Réservation de Salons"**
4. Category (primary): **"Software Company"**
5. Category (secondary): **"Beauty Salon"** (add as secondary)
6. Website: **https://nouryx.com**
7. Description (copy-paste this):
```
Nouryx est la plateforme française de réservation de salons de beauté en ligne. 
Trouvez et réservez les meilleurs salons de coiffure, barbiers, spas et instituts 
de beauté près de chez vous — gratuitement, en quelques secondes. 
Pour les professionnels : gérez votre agenda, réduisez les no-shows et développez 
votre clientèle avec 0% de commission sur vos réservations.
```
8. Add photos: screenshots of the platform, homepage, salon listing page
9. Set service area: France (all regions)
10. Verify via postcard or phone

### Weekly GBP Posts (15 minutes/week):
```
Week 1: "Nouveau salon partenaire à Paris — Réservez maintenant" + link to salon page
Week 2: Share latest blog post with excerpt + link
Week 3: Tip for salon owners: "Comment réduire vos no-shows de 70%"
Week 4: Client testimonial + booking CTA
```

### Salon Onboarding GBP Instruction:
Add this to your salon onboarding email/dashboard:
```
💡 Astuce: Ajoutez votre lien de réservation Nouryx à votre 
Google Business Profile pour recevoir des réservations 
directement depuis Google Maps.

Votre lien: https://nouryx.com/salon/[votre-slug]

Comment faire:
1. Connectez-vous à business.google.com
2. Cliquez sur "Modifier le profil"
3. Ajoutez votre URL Nouryx dans le champ "Site web"
4. Cliquez sur "Rendez-vous" et ajoutez votre lien Nouryx
```

---

# SECTION 20: MASTER VERIFICATION CHECKLIST

## ✅ PHASE 1 — Technical Foundation (Complete Before Launch)

- [ ] `localeDetection: false` confirmed in `next.config.js`
- [ ] All 5 locales accessible: `/`, `/en`, `/es`, `/it`, `/pt`
- [ ] `HreflangTags` component on every page — verified via View Source
- [ ] Hreflang symmetry verified at hreflang.io — zero errors
- [ ] `LanguageSwitcher` visible in navigation on all pages
- [ ] All `<img>` tags replaced with `next/image`
- [ ] Hero images have `priority={true}`
- [ ] `pages/_document.tsx` has correct `lang` attribute
- [ ] `public/robots.txt` created and accessible at nouryx.com/robots.txt
- [ ] Redirect from `booking-nouryx.vercel.app` → `nouryx.com` working (301)

## ✅ PHASE 2 — SEO Signals (First Week)

- [ ] `SeoHead` component on every page with unique title + description
- [ ] All titles ≤60 characters
- [ ] All meta descriptions ≤158 characters
- [ ] `WebsiteSchema` on homepage — passes rich results test
- [ ] `SalonSchema` on all salon pages — passes rich results test
- [ ] `BlogSchema` on all blog posts — passes rich results test
- [ ] `FaqSchema` on homepage and all blog posts
- [ ] Dynamic sitemap accessible at nouryx.com/sitemap.xml
- [ ] Sitemap submitted to Google Search Console
- [ ] Google Search Console verified — zero crawl errors

## ✅ PHASE 3 — Content (Weeks 2–8)

- [ ] Homepage copy updated in all 5 languages (Section 17)
- [ ] Service page titles/H1s match Section 3 tables exactly
- [ ] Blog FR-01 (planity-vs-fresha-vs-nouryx) published and indexed
- [ ] Blog EN-01 (fresha-alternative) published and indexed
- [ ] All 15 blogs from Section 7 published within 8 weeks
- [ ] All comparison pages live (Section 8)
- [ ] Each blog has internal links to 2-3 other Nouryx pages
- [ ] Each blog has FAQ section with FaqSchema

## ✅ PHASE 4 — Performance & Features (Week 2–3)

- [ ] Core Web Vitals: LCP < 2.5s on all 5 locale homepages
- [ ] Core Web Vitals: CLS < 0.1
- [ ] PageSpeed mobile score > 75 on all locale homepages
- [ ] PWA: manifest.json accessible at nouryx.com/manifest.json
- [ ] PWA: Service worker registered and active in Chrome DevTools
- [ ] PWA: Lighthouse PWA score = 100
- [ ] Edge Middleware: language suggestion banner shows for non-French visitors
- [ ] GA4: tracking script loading (check Network tab in DevTools)
- [ ] GA4: `complete_booking` event firing on successful booking
- [ ] GA4: `complete_salon_signup` event firing on salon registration
- [ ] 404 page: shows city links and search in correct language

## ✅ PHASE 5 — Firebase & Programmatic SEO (Week 2–4)

- [ ] `getAllSalonSlugs()` returns all published salon slugs
- [ ] `getSalonBySlug()` returns correct salon data
- [ ] Salon pages pre-built at build time (check Vercel build logs)
- [ ] New salon registration creates a live indexed page within 24h (ISR working)
- [ ] Salon page title tags match `generateSalonMeta()` templates
- [ ] Salon pages include `SalonSchema` with rating, address, services
- [ ] Sitemap includes all salon pages across all 5 locales

---

## 📊 KPI TARGETS

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Google impressions (FR) | 5,000+ | 50,000+ | 500,000+ |
| Indexed pages total | 50+ | 500+ | 5,000+ |
| "Logiciel réservation salon" rank | Top 50 | Top 20 | Top 5 |
| "Alternative Planity" rank | Top 30 | Top 10 | Top 3 |
| "Alternative Fresha" EN rank | Top 30 | Top 10 | Top 3 |
| Blog articles published | 10 | 25 | 50+ |
| Core Web Vitals pass | ✅ | ✅ | ✅ |
| PWA install prompts | Live | Growing | Thousands |

---

> **FINAL NOTE TO WINDSURF AGENT:**
> Execute sections 1–16 in order. Each section builds on the previous.
> When writing blog content (Section 7), search the web for current data before writing.
> All code is written for Next.js Pages Router + Firebase Firestore.
> Do NOT use App Router patterns — stick to `getStaticProps`, `getStaticPaths`, `getServerSideProps`.
> After completing all agent tasks, run the full Phase 1–5 checklist in Section 20.
> Report any Firebase permission errors, missing environment variables, or TypeScript conflicts immediately.

---

*Document generated for Nouryx — nouryx.com — Defeat Fresha, Planity & Treatwell*
*Stack: Next.js (Pages Router) + Vercel + Firebase*
*Target markets: France 🇫🇷 Spain 🇪🇸 Italy 🇮🇹 Portugal 🇧🇷 Global English 🇬🇧*
