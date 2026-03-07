export const BASE_URL = 'https://nouryx.com'
export const SITE_NAME = 'Nouryx'

export const LOCALES = ['fr', 'en', 'es', 'it', 'pt'] as const
export type SupportedLocale = (typeof LOCALES)[number]

export const HREFLANG_MAP: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-PT',
}

// ─── Homepage Metadata ───────────────────────────────────────────
export const HOME_META: Record<string, { title: string; description: string; ogTitle: string; ogDescription: string }> = {
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
      description: `Reserva en línea en ${salonName} en ${city}. Servicios: ${top3}. Puntuación ${rating}/5 por ${reviewCount} clientes.`,
      h1: `${salonName} — Salón de belleza en ${city}`,
    },
    it: {
      title: `${salonName} — ${city} — Prenota online | Nouryx`,
      description: `Prenota ${salonName} a ${city} online. Servizi: ${top3}. Voto ${rating}/5 da ${reviewCount} clienti.`,
      h1: `${salonName} — Salone di bellezza a ${city}`,
    },
    pt: {
      title: `${salonName} — ${city} — Agende online | Nouryx`,
      description: `Agende no ${salonName} em ${city} online. Serviços: ${top3}. Nota ${rating}/5 por ${reviewCount} clientes.`,
      h1: `${salonName} — Salão de beleza em ${city}`,
    },
  }

  return templates[locale] || templates.fr
}

// ─── Blog Page Meta Generator ────────────────────────────────────
export const BLOG_INDEX_META: Record<string, { title: string; description: string }> = {
  fr: {
    title: 'Blog Beauté & Bien-être — Conseils Salon | Nouryx',
    description: 'Tendances coiffure, conseils bien-être, comparatifs logiciels salon... Le blog Nouryx vous aide à trouver le meilleur pour votre beauté.',
  },
  en: {
    title: 'Beauty & Wellness Blog — Salon Tips | Nouryx',
    description: 'Hair trends, wellness tips, salon software comparisons... The Nouryx blog helps you discover the best in beauty.',
  },
  es: {
    title: 'Blog de Belleza y Bienestar — Consejos | Nouryx',
    description: 'Tendencias de peluquería, consejos de bienestar, comparativas de software... El blog de Nouryx te ayuda a encontrar lo mejor.',
  },
  it: {
    title: 'Blog Bellezza e Benessere — Consigli | Nouryx',
    description: 'Tendenze parrucchiere, consigli benessere, confronti software... Il blog Nouryx ti aiuta a trovare il meglio.',
  },
  pt: {
    title: 'Blog de Beleza e Bem-estar — Dicas | Nouryx',
    description: 'Tendências de cabelo, dicas de bem-estar, comparativos de software... O blog Nouryx ajuda você a encontrar o melhor.',
  },
}
