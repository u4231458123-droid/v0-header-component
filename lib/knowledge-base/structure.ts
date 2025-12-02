/**
 * ZENTRALE WISSENSDATENBANK
 * =========================
 * Strukturierte Wissensdatenbank für alle KI-Bots
 * Mit Inhaltsverzeichnis und interner Verlinkung
 */

export interface KnowledgeEntry {
  id: string
  category: KnowledgeCategory
  title: string
  content: string
  tags: string[]
  relatedEntries: string[]
  version: string
  lastUpdated: string
  priority: "critical" | "high" | "medium" | "low"
}

export type KnowledgeCategory =
  | "design-guidelines"
  | "coding-rules"
  | "forbidden-terms"
  | "architecture"
  | "api-documentation"
  | "error-handling"
  | "best-practices"
  | "account-rules"
  | "routing-rules"
  | "pdf-generation"
  | "email-templates"
  | "ci-cd"
  | "ui-consistency"
  | "systemwide-thinking"
  | "bot-instructions"
  | "mydispatch-core"

export interface KnowledgeBase {
  version: string
  lastUpdated: string
  tableOfContents: TableOfContents
  entries: KnowledgeEntry[]
}

export interface TableOfContents {
  categories: {
    [key in KnowledgeCategory]: {
      title: string
      description: string
      entries: string[]
    }
  }
}

/**
 * WICHTIGE REGELN FÜR ALLE BOTS:
 * ==============================
 * 1. IMMER zuerst alle Vorgaben, Regeln, Verbote und Docs laden
 * 2. Vor jeder Aufgabe eine IST-Analyse durchführen
 * 3. Niemals etwas ändern ohne vorherige Prüfung
 * 4. Anforderungen vollumfänglich verstehen
 * 5. Sinn und Logik verstehen bevor Änderungen
 */

export const KNOWLEDGE_BASE_RULES: KnowledgeEntry = {
  id: "rules-001",
  category: "best-practices",
  title: "WICHTIGE REGELN FÜR ALLE BOTS",
  content: `
# WICHTIGE REGELN FÜR ALLE BOTS

## 1. VORBEREITUNG (OBLIGATORISCH)
- IMMER zuerst alle Vorgaben, Regeln, Verbote und Dokumentationen laden
- Vollständiges Gesamt-Wissen und systemweites Verständnis sicherstellen
- Keine Aufgabe ohne vollständige Kontext-Informationen beginnen

## 2. IST-ANALYSE (OBLIGATORISCH)
- Vor JEDER Aufgabe eine IST-Analyse durchführen
- Bestehenden Code vollständig verstehen
- Abhängigkeiten und Auswirkungen analysieren
- Sinn und Logik des bestehenden Codes verstehen

## 3. ÄNDERUNGEN (STRENG VERBOTEN OHNE PRÜFUNG)
- NIEMALS etwas ändern ohne vorherige Prüfung
- NIEMALS ohne vollständiges Verständnis der Anforderungen
- NIEMALS ohne Verständnis von Sinn und Logik
- Jede Änderung muss dokumentiert werden

## 4. FEHLERBEHANDLUNG
- Alle Fehler in zentrale Wissensdatenbank dokumentieren
- Fehlerursachen analysieren
- Präventionsmaßnahmen definieren
- Wiederholung vermeiden

## 5. QUALITÄTSSICHERUNG
- Code gegen Dokumentation prüfen
- Design-Vorgaben einhalten
- Keine Breaking Changes
- Funktionalität erhalten
  `,
  tags: ["rules", "obligatory", "bots", "quality"],
  relatedEntries: ["design-guidelines-001", "coding-rules-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const DESIGN_GUIDELINES: KnowledgeEntry = {
  id: "design-guidelines-001",
  category: "design-guidelines",
  title: "Design & Layout Vorgaben - UNVERÄNDERLICH",
  content: `
# Design & Layout Vorgaben - UNVERÄNDERLICH

## VERBOTEN
- Design- und Layout-Änderungen sind STRENG VERBOTEN
- Farbverstöße sind nicht erlaubt
- Vorgaben-Verstöße sind nicht erlaubt

## ERLAUBT
- Fehlerbehebungen die Design/Layout nicht ändern
- Funktionalitäts-Verbesserungen ohne Design-Änderung
- Performance-Optimierungen ohne visuelle Änderungen

## CI-FARBEN (VERBINDLICH)
- Primärfarbe: #323D5E (Dunkelblau-Grau)
- Design-Tokens verwenden (NICHT hardcoded)
- bg-primary, text-primary, etc.

## TYPOGRAFIE
- System-Font-Stack (font-sans)
- Schriftgrößen: H1 (3xl-5xl), H2 (2xl-4xl), Body (base)

## SPACING
- Standard-Gap: 4px/8px Grid
- Konsistente Abstände
  `,
  tags: ["design", "layout", "colors", "forbidden"],
  relatedEntries: ["rules-001", "coding-rules-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const ACCOUNT_RULES: KnowledgeEntry = {
  id: "account-rules-001",
  category: "account-rules",
  title: "Account-spezifische Routing-Regeln",
  content: `
# Account-spezifische Routing-Regeln

## MASTER-ACCOUNT (courbois1981@gmail.com)
- Direkter Zugang ins /dashboard (OHNE Subscription-Check)
- Spezieller Button in Tarifverwaltung (nur für diesen Account sichtbar)
- Zugang zu /mydispatch (nur für diesen Account)
- Button zum Wechseln zwischen Basic/Business Tarif in Tarifverwaltung
- Führt nach Login ins /dashboard (ohne Bezahlung)

## KUNDEN-ACCOUNT (courbois83@gmail.com)
- Einfacher Kunden-Account
- NICHT mit courbois1981@gmail.com verwechseln
- Weiterleitung ins /kunden-portal

## ROUTING-LOGIK
- Middleware prüft Account-Typ
- Dashboard-Layout prüft Account-Typ
- Dashboard-Page prüft Account-Typ
- Spezielle Behandlung für Master-Account
  `,
  tags: ["account", "routing", "master", "customer"],
  relatedEntries: ["rules-001", "routing-rules-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const FORBIDDEN_TERMS: KnowledgeEntry = {
  id: "forbidden-terms-001",
  category: "forbidden-terms",
  title: "Verbotene Begriffe - NIEMALS verwenden",
  content: `
# VERBOTENE BEGRIFFE (PFLICHT!)

Die folgenden Begriffe dürfen NIEMALS verwendet werden:
- "kostenlos" / "gratis" / "free"
- "testen" / "Testphase" / "trial"
- "unverbindlich"
- "ohne Risiko"

## Erlaubte Alternativen:
- "Jetzt registrieren"
- "Jetzt starten"
- "Tarif wählen"
- "Monatlich kündbar"
- "Entdecken Sie MyDispatch"
- "Lernen Sie uns kennen"
- "Flexibel ohne Mindestlaufzeit"
  `,
  tags: ["forbidden", "terms", "marketing"],
  relatedEntries: ["rules-001", "design-guidelines-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const PDF_GENERATION_RULES: KnowledgeEntry = {
  id: "pdf-generation-001",
  category: "pdf-generation",
  title: "PDF-Generierung mit Briefpapier und Logo",
  content: `
# PDF-Generierung Regeln

## Briefpapier
- Wenn briefpapier_url vorhanden: Verwende Briefpapier als Hintergrund
- Wenn kein Briefpapier: Standard DIN-Norm Format (A4: 210mm x 297mm)
- Briefpapier wird als Hintergrundbild eingefügt

## Logo
- Wenn logo_url vorhanden: Verwende Company-Logo
- Wenn kein Logo: Verwende MyDispatch-Logo (/images/mydispatch-3d-logo.png)
- Logo wird oben links positioniert
- Bei Briefpapier: Logo über Briefpapier positionieren

## Kombinationen
- Logo + Briefpapier: Logo über Briefpapier
- Logo + kein Briefpapier: Logo auf Standard-Format
- Kein Logo + Briefpapier: Nur Briefpapier
- Kein Logo + kein Briefpapier: Standard-Format mit MyDispatch-Logo

## Anwendungsfälle
- Rechnungen: Briefpapier + Logo
- Aufträge: Briefpapier + Logo
- Angebote: Briefpapier + Logo
- Partner-Weiterleitung: Nur ausgewählte Felder
  `,
  tags: ["pdf", "briefpapier", "logo", "generation"],
  relatedEntries: ["rules-001", "design-guidelines-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "high",
}

export const PARTNER_FORWARDING_RULES: KnowledgeEntry = {
  id: "partner-forwarding-001",
  category: "api-documentation",
  title: "Partner-Weiterleitung Regeln",
  content: `
# Partner-Weiterleitung Regeln

## Standardmäßig sichtbar (im Account)
Alle Daten sind standardmäßig im Account sichtbar:
- ID
- Datum "Auftrag Zeitpunkt"
- Uhrzeit "Auftrag Zeitpunkt"
- KUNDE "Anrede, Vorname NAME"
- Abhol Adresse
- Ziel Adresse
- Passagier Anzahl
- Passagier Name/n
- Fahrzeug Kategorie
- Flug / Zug aus
- Flug / Zug Nummer
- Fahrer
- Fahrzeug Kennzeichen
- Fahrpreis

## Weiterleitung an Partner
- Nur markierte Daten werden übermittelt
- Checkbox-System für Datenauswahl
- Per E-Mail oder PDF möglich
- PDF enthält nur ausgewählte Felder
- E-Mail enthält nur ausgewählte Felder

## Implementierung
- PartnerForwardDialog Komponente
- Checkbox-Auswahl für jedes Feld
- Vorschau der ausgewählten Daten
- API-Route: /api/bookings/forward-to-partner
  `,
  tags: ["partner", "forwarding", "data-selection"],
  relatedEntries: ["pdf-generation-001", "rules-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "high",
}

export const EMAIL_TEMPLATE_RULES: KnowledgeEntry = {
  id: "email-templates-001",
  category: "email-templates",
  title: "E-Mail-Vorlagen Regeln",
  content: `
# E-Mail-Vorlagen Regeln

## MyDispatch-Kunden (für MyDispatch)
- MyDispatch Design
- MyDispatch Daten
- MyDispatch Logo
- MyDispatch Branding

## Unternehmer (für seine Kunden/Fahrer)
- Einheitliches professionelles Design
- Unternehmens-Daten
- Unternehmens-Logo (wenn hochgeladen)
- Sonst MyDispatch-Logo
- Unternehmens-Branding

## Anwendungsfälle
- Buchungsbestätigung
- Rechnungsversand
- Partner-Weiterleitung
- Support-Anfragen
- System-Benachrichtigungen

## Implementierung
- Template-System mit Variablen
- Logo-Ersetzung basierend auf Company
- Branding-Anpassung
- Responsive Design
  `,
  tags: ["email", "templates", "branding"],
  relatedEntries: ["pdf-generation-001", "design-guidelines-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "high",
}

export const LOGO_INTEGRATION_RULES: KnowledgeEntry = {
  id: "logo-integration-001",
  category: "architecture",
  title: "Logo-Integration Regeln",
  content: `
# Logo-Integration Regeln

## Wo Logo angezeigt wird
1. Portalseiten (Kunden-Portal, Fahrer-Portal)
2. Login-Seite des Unternehmers
3. Registrierungsseite des Unternehmers
4. Tenant-Landingpage
5. PDF-Dokumente
6. E-Mail-Vorlagen

## Logik
- Standard: MyDispatch 3D-Logo (/images/mydispatch-3d-logo.png) - MUSS BEIBEHALTEN WERDEN
- Wenn company.logo_url vorhanden: Verwende Company-Logo
- Wenn kein Company-Logo: Verwende MyDispatch 3D-Logo (Standard)
- Logo wird konsistent überall verwendet
- Fallback immer MyDispatch 3D-Logo

## Implementierung
- Prüfung: company.logo_url || "/images/mydispatch-3d-logo.png"
- Standard-Logo ist das MyDispatch 3D-Logo (mydispatch-3d-logo.png)
- Konsistente Verwendung in allen Komponenten
- Keine hardcoded Logo-Pfade (außer Standard 3D-Logo)
- Das 3D-Logo ist das primäre Logo und darf nicht geändert werden
  `,
  tags: ["logo", "integration", "branding"],
  relatedEntries: ["design-guidelines-001", "email-templates-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "high",
}

export const FUNCTIONALITY_RULES: KnowledgeEntry = {
  id: "functionality-rules-001",
  category: "best-practices",
  title: "Funktionalität - Keine Entfernung",
  content: `
# Funktionalität - Keine Entfernung

## STRENG VERBOTEN
- Bestehende Buttons entfernen
- Bestehende Links entfernen
- Bestehende Funktionen entfernen
- 404-Fehler verursachen
- Fehlende Funktionen einführen

## ERLAUBT
- Fehler in bestehenden Funktionen beheben
- Funktionen verbessern
- Neue Funktionen hinzufügen (wenn gewünscht)
- Performance optimieren

## Prüfung vor Änderungen
- Alle Buttons funktionieren
- Alle Links funktionieren
- Keine 404-Fehler
- Alle Funktionen getestet
  `,
  tags: ["functionality", "forbidden", "quality"],
  relatedEntries: ["rules-001", "error-handling-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const INITIAL_KNOWLEDGE_BASE: KnowledgeBase = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  tableOfContents: {
    categories: {
      "design-guidelines": {
        title: "Design & Layout Vorgaben",
        description: "Unveränderliche Design- und Layout-Regeln",
        entries: ["design-guidelines-001"],
      },
      "coding-rules": {
        title: "Coding-Regeln",
        description: "Regeln für Code-Änderungen und Best Practices",
        entries: ["rules-001", "functionality-rules-001"],
      },
      "forbidden-terms": {
        title: "Verbotene Begriffe",
        description: "Begriffe die niemals verwendet werden dürfen",
        entries: ["forbidden-terms-001"],
      },
      "architecture": {
        title: "Architektur",
        description: "System-Architektur und Struktur",
        entries: ["logo-integration-001"],
      },
      "api-documentation": {
        title: "API-Dokumentation",
        description: "API-Endpunkte und deren Verwendung",
        entries: ["partner-forwarding-001"],
      },
      "error-handling": {
        title: "Fehlerbehandlung",
        description: "Wie Fehler behandelt und dokumentiert werden",
        entries: [],
      },
      "best-practices": {
        title: "Best Practices",
        description: "Bewährte Praktiken und Empfehlungen",
        entries: ["rules-001", "functionality-rules-001"],
      },
      "account-rules": {
        title: "Account-Regeln",
        description: "Regeln für verschiedene Account-Typen",
        entries: ["account-rules-001"],
      },
      "routing-rules": {
        title: "Routing-Regeln",
        description: "Regeln für Routing und Navigation",
        entries: ["account-rules-001"],
      },
      "pdf-generation": {
        title: "PDF-Generierung",
        description: "Regeln für PDF-Generierung mit Briefpapier und Logo",
        entries: ["pdf-generation-001"],
      },
      "email-templates": {
        title: "E-Mail-Vorlagen",
        description: "Regeln für E-Mail-Vorlagen",
        entries: ["email-templates-001"],
      },
      "ci-cd": {
        title: "CI/CD",
        description: "CI/CD Pipeline und Automatisierung",
        entries: [],
      },
    },
  },
  entries: [
    KNOWLEDGE_BASE_RULES,
    DESIGN_GUIDELINES,
    ACCOUNT_RULES,
    FORBIDDEN_TERMS,
    PDF_GENERATION_RULES,
    PARTNER_FORWARDING_RULES,
    EMAIL_TEMPLATE_RULES,
    LOGO_INTEGRATION_RULES,
    FUNCTIONALITY_RULES,
  ],
}

/**
 * Lade alle relevanten Knowledge-Entries für eine Aufgabe
 */
export function loadKnowledgeForTask(taskType: string, categories: KnowledgeCategory[] = []): KnowledgeEntry[] {
  const allEntries = INITIAL_KNOWLEDGE_BASE.entries
  const criticalEntries = allEntries.filter((e) => e.priority === "critical")
  const categoryEntries = categories.length > 0 
    ? allEntries.filter((e) => categories.includes(e.category))
    : []
  
  // Kombiniere kritische Einträge mit kategorie-spezifischen
  const relevantEntries = [...new Set([...criticalEntries, ...categoryEntries])]
  
  // Sortiere nach Priorität
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  relevantEntries.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  
  return relevantEntries
}

/**
 * Generiere Prompt mit Knowledge-Base Kontext
 */
export function generatePromptWithKnowledge(
  task: string,
  taskType: string,
  categories: KnowledgeCategory[] = []
): string {
  const knowledge = loadKnowledgeForTask(taskType, categories)
  
  let prompt = `# AUFGABE: ${task}\n\n`
  prompt += `## WICHTIG: BEFOLGE DIESE REGELN AUSNAHMSLOS\n\n`
  
  // Füge alle Knowledge-Entries hinzu
  knowledge.forEach((entry) => {
    prompt += `## ${entry.title}\n${entry.content}\n\n`
  })
  
  prompt += `## DEINE AUFGABE\n${task}\n\n`
  prompt += `## VORGEHEN\n`
  prompt += `1. Lade alle relevanten Dokumentationen und Vorgaben\n`
  prompt += `2. Führe eine IST-Analyse durch\n`
  prompt += `3. Verstehe den bestehenden Code vollständig\n`
  prompt += `4. Prüfe alle Abhängigkeiten\n`
  prompt += `5. Implementiere Änderungen nur nach vollständigem Verständnis\n`
  prompt += `6. Dokumentiere alle Änderungen\n`
  
  return prompt
}

