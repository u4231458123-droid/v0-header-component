import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://my-dispatch.de'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/einstellungen/',
          '/auftraege/',
          '/kunden/',
          '/fahrer/',
          '/finanzen/',
          '/fleet/',
          '/rechnungen/',
          '/admin/',
          '/auth/reset-password',
          '/auth/forgot-password',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
