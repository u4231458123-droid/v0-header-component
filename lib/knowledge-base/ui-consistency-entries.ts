/**
 * UI-KONSISTENZ & TEXT-QUALITÄT
 * =============================
 * Systemweite UI-Library-Elemente, Text-Guidelines, SEO-Optimierung
 * MyDispatch-Konzept und Vertrauensbildung
 */

import type { KnowledgeEntry } from "./structure"

export const UI_CONSISTENCY_RULES: KnowledgeEntry = {
  id: "ui-consistency-001",
  category: "design-guidelines",
  title: "Systemweite UI-Konsistenz - UNVERÄNDERLICH",
  content: `
# Systemweite UI-Konsistenz - UNVERÄNDERLICH

## VERBOTEN
- Abweichungen von systemweiten UI-Library-Elementen
- Individuelle Header/Footer/Logo-Implementierungen
- Inkonsistente Komponenten-Verwendung
- Hardcoded UI-Elemente statt Library-Komponenten

## ERFORDERLICH
- Systemweite UI-Library-Elemente verwenden
- Header: IMMER aus UI-Library
- Logo: IMMER aus UI-Library
- Footer: IMMER aus UI-Library
- Alle UI-Elemente: IMMER aus UI-Library

## UI-LIBRARY-STRUKTUR
- \`components/ui/header.tsx\` - Systemweiter Header
- \`components/ui/footer.tsx\` - Systemweiter Footer
- \`components/ui/logo.tsx\` - Systemweites Logo (MyDispatch 3D-Logo als Standard)
- \`components/ui/navigation.tsx\` - Systemweite Navigation
- \`components/ui/buttons.tsx\` - Systemweite Buttons
- \`components/ui/cards.tsx\` - Systemweite Cards

## LOGO-STANDARD
- Standard-Logo: \`/images/mydispatch-3d-logo.png\` (MyDispatch 3D-Logo)
- Company-Logo: \`company.logo_url\` (wenn vorhanden)
- Logik: \`company.logo_url || "/images/mydispatch-3d-logo.png"\`
- Das 3D-Logo ist das Standard-Logo und muss beibehalten werden

## KONSISTENZ-PRÜFUNG
- Header muss IMMER \`<Header />\` aus UI-Library sein
- Footer muss IMMER \`<Footer />\` aus UI-Library sein
- Logo muss IMMER \`<Logo />\` aus UI-Library sein
- Keine Duplikate, keine Abweichungen
`,
  tags: ["ui", "consistency", "library", "forbidden"],
  relatedEntries: ["design-guidelines-001", "text-quality-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const TEXT_QUALITY_RULES: KnowledgeEntry = {
  id: "text-quality-001",
  category: "best-practices",
  title: "Text-Qualität & SEO-Optimierung",
  content: `
# Text-Qualität & SEO-Optimierung

## VERBOTEN
- Generische Texte ("Willkommen", "Hier klicken", etc.)
- Unprofessionelle Sprache
- Unklare Formulierungen
- Fehlende SEO-Optimierung
- Unfreundliche oder kalte Sprache

## ERFORDERLICH
- Themenrelevante Texte
- Nutzerfreundlich
- SEO-optimiert
- Freundlich, kompetent, ansprechend
- Harmonisch im Gesamtkonzept
- Hochwertig und seriös

## TEXT-GUIDELINES

### 1. Themenrelevanz
- Branchenbezogen (Taxi, Fahrdienst, Transport)
- Konkrete Nutzenformulierungen
- Klare Handlungsaufforderungen

### 2. Nutzerfreundlichkeit
- Einfache Sprache (aber nicht banal)
- Klare Struktur
- Verständliche Anweisungen
- Wenige Klicks zum Ziel

### 3. SEO-Optimierung
- Relevante Keywords natürlich integriert
- Meta-Descriptions optimiert
- Headings strukturiert (H1, H2, H3)
- Alt-Texte für Bilder
- Semantische HTML-Struktur

### 4. Ton & Stil
- Freundlich aber professionell
- Kompetent aber nicht überheblich
- Ansprechend aber nicht übertrieben
- Vertrauensbildend
- Seriös und hochwertig

### 5. MyDispatch-Konzept
- Einfachheit betonen
- Wenige Klicks
- Nicht überladen
- Alle täglichen Branchenansprüche
- Höchste Nutzerqualität
- Günstiger Preis (Monats-/Jahrespreis)

## BEISPIEL-TEXTE

### ❌ VERBOTEN:
- "Willkommen bei MyDispatch"
- "Hier klicken"
- "Testen Sie jetzt"
- "Kostenlos starten"

### ✅ ERFORDERLICH:
- "MyDispatch: Ihr zuverlässiger Partner für professionelle Fahrdienste"
- "Jetzt registrieren und sofort loslegen"
- "Entdecken Sie die Vorteile"
- "Flexibel ohne Mindestlaufzeit"

## SEO-RELEVANTE KEYWORDS
- Fahrdienst-Software
- Taxi-Dispatch-System
- Transport-Management
- Fahrzeugverwaltung
- Auftragsverwaltung
- Fahrer-App
- Kundenportal
`,
  tags: ["text", "seo", "quality", "content"],
  relatedEntries: ["ui-consistency-001", "mydispatch-concept-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const MYDISPATCH_CONCEPT: KnowledgeEntry = {
  id: "mydispatch-concept-001",
  category: "best-practices",
  title: "MyDispatch-Konzept & Vertrauensbildung",
  content: `
# MyDispatch-Konzept & Vertrauensbildung

## KERNWERTE
1. **Einfachheit**: Wenige Klicks zum Ziel
2. **Übersichtlichkeit**: Nicht überladen, klare Struktur
3. **Vollständigkeit**: Alle täglichen Branchenansprüche erfüllt
4. **Qualität**: Höchste Nutzerqualität
5. **Preis**: Günstiger Monats-/Jahrespreis als Mitbewerber

## UNTERSCHEIDUNGSMERKMALE

### Was MyDispatch auszeichnet:
- ✅ Einfache Bedienung mit wenigen Klicks
- ✅ Auf den ersten Blick nicht überladen
- ✅ Alle täglichen Branchenansprüche erfüllt
- ✅ Höchste Nutzerqualität
- ✅ Günstiger Preis (Monats-/Jahrespreis)

### Was MyDispatch NICHT ist:
- ❌ Kompliziert oder überladen
- ❌ Teuer oder unübersichtlich
- ❌ Unvollständig oder unprofessionell

## VERTRAUENSBILDUNG

### Systemweite Konsistenz
- Hochwertiges Konzept auf Home-Seite
- Systemweit widergespiegelt
- Professionelle, seriöse Darstellung
- Fach-Expertise sichtbar

### Home-Seite Konzept
- Klare Botschaft: Einfachheit + Qualität + Preis
- Vertrauensbildende Elemente
- Professionelle Präsentation
- Seriöse, hochwertige Ausstrahlung

## SYSTEMWEITE UMSETZUNG
- Home-Seite: Klar, hochwertig, vertrauensbildend
- Alle Seiten: Konsistentes Konzept
- Alle Texte: Freundlich, kompetent, ansprechend
- Alle UI-Elemente: Konsistent, professionell
- Alle Funktionen: Einfach, übersichtlich, vollständig
`,
  tags: ["concept", "trust", "branding", "mydispatch"],
  relatedEntries: ["ui-consistency-001", "text-quality-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const SEO_OPTIMIZATION_RULES: KnowledgeEntry = {
  id: "seo-optimization-001",
  category: "best-practices",
  title: "SEO-Optimierung Guidelines",
  content: `
# SEO-Optimierung Guidelines

## ERFORDERLICH

### 1. Meta-Tags
- Title-Tags: 50-60 Zeichen, keywords-relevant
- Meta-Descriptions: 150-160 Zeichen, ansprechend
- Open Graph Tags für Social Media
- Twitter Cards

### 2. Content-Struktur
- H1: Einmal pro Seite, keywords-relevant
- H2-H6: Logische Hierarchie
- Semantische HTML5-Elemente
- Alt-Texte für alle Bilder

### 3. Keywords
- Primär: Fahrdienst-Software, Taxi-Dispatch-System
- Sekundär: Transport-Management, Fahrzeugverwaltung
- Long-Tail: "Professionelle Fahrdienst-Software für Taxiunternehmen"
- Natürlich integriert, nicht überoptimiert

### 4. Interne Verlinkung
- Logische Verlinkungsstruktur
- Anchor-Texte relevant
- Breadcrumb-Navigation

### 5. Performance
- Schnelle Ladezeiten
- Mobile-First
- Core Web Vitals optimiert
`,
  tags: ["seo", "optimization", "content"],
  relatedEntries: ["text-quality-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "high",
}

