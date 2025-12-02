/**
 * MyDispatch Unternehmensdaten
 * Zentrale Datei für alle Firmendaten
 * Domain: my-dispatch.de
 *
 * LETZTE AKTUALISIERUNG: 25.11.2025
 */

export const COMPANY = {
  // Firma
  name: "RideHub Solutions",
  shortName: "RideHub Solutions",
  product: "MyDispatch",
  slogan: "simply arrive",

  // Domain & URLs
  domain: "my-dispatch.de",
  website: "https://www.my-dispatch.de",

  owner: "Ibrahim SIMSEK",
  ceo: "Ibrahim SIMSEK",

  address: {
    street: "Ensbachmühle 4",
    zip: "94571",
    city: "Schaufling",
    country: "Deutschland",
    full: "Ensbachmühle 4, D-94571 Schaufling, Deutschland",
  },

  contact: {
    phone: "+49 170 8004423",
    email: "info@my-dispatch.de",
    support: "support@my-dispatch.de",
    datenschutz: "datenschutz@my-dispatch.de",
    sales: "vertrieb@my-dispatch.de",
  },

  legal: {
    // Keine Handelsregister-Eintragung (Einzelunternehmen)
    registergericht: null,
    registernummer: null,
    // USt-IdNr. noch nicht erteilt - wird später ergänzt
    ustIdNr: null,
  },

  businessHours: {
    weekdays: "Mo-Fr: 09:00-17:00 Uhr",
    weekend: "Geschlossen",
  },

  // Social Media (für später)
  social: {
    linkedin: "",
    xing: "",
    twitter: "",
    facebook: "",
    instagram: "",
  },

  // Gründungsjahr
  foundedYear: 2024,

  // Copyright
  copyright: `© ${new Date().getFullYear()} my-dispatch.de by RideHub Solutions`,

  // Logo URLs
  logos: {
    main: "/images/mydispatch-3d-logo.png",
    dark: "/images/mydispatch-3d-logo.png",
    light: "/images/mydispatch-3d-logo.png",
    icon: "/images/mydispatch-3d-logo.png",
  },

  // Produkt-Beschreibung
  description:
    "Die moderne Dispositionssoftware für Taxi, Mietwagen und Chauffeur-Unternehmen. Made in Germany. DSGVO-konform. GoBD-zertifiziert.",
  shortDescription: "Dispositionssoftware für Taxi, Mietwagen & Chauffeur",

  pricing: {
    starter: {
      name: "Starter",
      price: 39,
      yearlyPrice: 31.2, // 20% discount
      drivers: 3, // Korrigiert von 5 auf 3
      vehicles: 3, // Korrigiert von 5 auf 3
      description: "Perfekt für Einzelunternehmer und kleine Flotten",
    },
    business: {
      name: "Business",
      price: 99, // Changed from 129 to 99
      yearlyPrice: 79.2, // 20% discount (99 * 0.8)
      drivers: -1, // Unbegrenzt
      vehicles: -1, // Unbegrenzt
      description: "Für wachsende Taxibetriebe mit Anspruch",
    },
    enterprise: {
      name: "Enterprise",
      price: null, // Auf Anfrage
      yearlyPrice: null,
      drivers: -1, // Unbegrenzt
      vehicles: -1,
      description: "Für große Taxiunternehmen und Zentralen",
    },
  },

  // Features
  features: {
    starter: [
      "Bis zu 3 Fahrer", // Korrigiert von 5 auf 3
      "Bis zu 3 Fahrzeuge", // Korrigiert von 5 auf 3
      "Unbegrenzte Buchungen",
      "Kundenverwaltung (ohne Kunden-Login)",
      "Manuelle Auftragseingabe",
      "Konfigurierbarer Mindestvorlauf",
      "E-Mail-Versand-System",
      "Auftragseingangsbuch",
      "Basis-Reporting",
      "E-Mail Support",
    ],
    business: [
      "Unbegrenzte Fahrer",
      "Unbegrenzte Fahrzeuge",
      "Alle Starter Features",
      "Kunden-Login mit Selbstbuchung",
      "Erweiterte Reports & Analytics",
      "API-Zugang",
      "Priority Support (24h)",
      "Smartphone-App für Fahrer",
    ],
    enterprise: [
      "Alle Business Features",
      "White-Label-Option",
      "Dedizierter Account Manager",
      "24/7 Premium Support",
      "Telefon-Hotline",
      "Individuelle Anpassungen",
    ],
  },
} as const

export type CompanyData = typeof COMPANY
