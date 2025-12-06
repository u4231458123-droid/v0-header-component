import type { Metadata } from "next"
import { HomePageClient } from "./HomePageClient"

export const metadata: Metadata = {
  title: "MyDispatch - Professionelle Dispositions-Software für Taxi, Mietwagen & Chauffeur",
  description:
    "Die moderne Dispositions-Software für Taxi, Mietwagen und Chauffeur-Unternehmen. Verwalten Sie Ihre Flotte, Buchungen und Kunden in einer Cloud-Lösung. Made in Germany. DSGVO-konform. GoBD-zertifiziert.",
  keywords: [
    "Dispositions-Software",
    "Taxi-Software",
    "Mietwagen-Software",
    "Chauffeur-Software",
    "Flotten-Verwaltung",
    "Buchungs-System",
    "GoBD-konform",
    "DSGVO-konform",
  ],
  openGraph: {
    title: "MyDispatch - Professionelle Dispositions-Software",
    description:
      "Die moderne Dispositions-Software für Taxi, Mietwagen und Chauffeur-Unternehmen. Made in Germany. DSGVO-konform.",
    url: "https://my-dispatch.de",
    siteName: "MyDispatch",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "https://my-dispatch.de/images/mydispatch-dashboard-hero.png",
        width: 1200,
        height: 675,
        alt: "MyDispatch Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyDispatch - Professionelle Dispositions-Software",
    description: "Die moderne Dispositions-Software für Taxi, Mietwagen und Chauffeur-Unternehmen.",
    images: ["https://my-dispatch.de/images/mydispatch-dashboard-hero.png"],
  },
  alternates: {
    canonical: "/",
  },
}

export default function HomePage() {
  return <HomePageClient />
}
