/**
 * Dokumentations-Templates
 * ========================
 * Feste Vorlagen für verschiedene Dokumentations-Kategorien.
 * Diese Templates werden von der Auto-Documentation Engine verwendet.
 */

export type DocumentationCategory =
  | "change-log"
  | "error-documentation"
  | "feature-documentation"
  | "architecture-decision"
  | "optimization-report"

export interface DocumentationMetadata {
  id: string
  date: string
  version: string
  author: string // Agent-Name
  category: DocumentationCategory
}

export interface DocumentationContent {
  summary: string // AI-generierte Kurzzusammenfassung
  content: string // Hauptinhalt
  references: string[] // Links zu verwandten Dokumenten
}

export interface Documentation {
  metadata: DocumentationMetadata
  content: DocumentationContent
  changeHistory: Array<{
    date: string
    author: string
    changes: string
  }>
}

/**
 * Template für Changelog-Einträge
 */
export const CHANGE_LOG_TEMPLATE: Omit<Documentation, "metadata" | "changeHistory"> = {
  content: {
    summary: "",
    content: `## [VERSION] - DATUM

### Added
- Feature 1
- Feature 2

### Fixed
- Bug 1
- Bug 2

### Changed
- Änderung 1
- Änderung 2

### Updated
- Update 1
- Update 2
`,
    references: [],
  },
}

/**
 * Template für Fehler-Dokumentation
 */
export const ERROR_DOCUMENTATION_TEMPLATE: Omit<Documentation, "metadata" | "changeHistory"> = {
  content: {
    summary: "",
    content: `## ERR-XXX: FEHLERNAME

**Status:** resolved|wontfix|open
**Severity:** critical|high|medium|low
**Datum:** DATUM
**Betroffene Module:** MODULE

### Beschreibung
Detaillierte Beschreibung des Fehlers.

### Root Cause
Ursache des Fehlers.

### Loesung
Beschreibung der Lösung.

### Praevention
Maßnahmen zur Vermeidung des Fehlers in Zukunft.

### Referenzen
- Datei 1
- Datei 2
`,
    references: [],
  },
}

/**
 * Template für Feature-Dokumentation
 */
export const FEATURE_DOCUMENTATION_TEMPLATE: Omit<Documentation, "metadata" | "changeHistory"> = {
  content: {
    summary: "",
    content: `## FEATURENAME

**Version:** VERSION
**Datum:** DATUM
**Status:** ✅ Implementiert | ⏳ In Arbeit | 📋 Geplant

### Beschreibung
Beschreibung des Features.

### Technische Details
- Detail 1
- Detail 2

### Verwendung
Anleitung zur Verwendung.

### API/Interface
\`\`\`typescript
// Code-Beispiel
\`\`\`

### Referenzen
- Datei 1
- Datei 2
`,
    references: [],
  },
}

/**
 * Template für Architektur-Entscheidungen
 */
export const ARCHITECTURE_DECISION_TEMPLATE: Omit<Documentation, "metadata" | "changeHistory"> = {
  content: {
    summary: "",
    content: `## Architektur-Entscheidung: ENTSCHEIDUNG

**Datum:** DATUM
**Status:** ✅ Umgesetzt | ⏳ In Diskussion | 📋 Vorgeschlagen

### Kontext
Beschreibung des Kontexts, der die Entscheidung erforderlich macht.

### Entscheidung
Die getroffene Entscheidung.

### Konsequenzen
Positive und negative Auswirkungen.

### Alternativen
Andere Optionen, die in Betracht gezogen wurden.

### Referenzen
- Datei 1
- Datei 2
`,
    references: [],
  },
}

/**
 * Template für Optimierungs-Berichte
 */
export const OPTIMIZATION_REPORT_TEMPLATE: Omit<Documentation, "metadata" | "changeHistory"> = {
  content: {
    summary: "",
    content: `## Optimierungs-Bericht: BEREICH

**Datum:** DATUM
**Status:** ✅ Abgeschlossen | ⏳ In Arbeit

### Problem
Beschreibung des Performance/Code-Problems.

### Analyse
Detaillierte Analyse des Problems.

### Lösung
Implementierte Lösung.

### Ergebnisse
- Metrik 1: Vorher → Nachher
- Metrik 2: Vorher → Nachher

### Referenzen
- Datei 1
- Datei 2
`,
    references: [],
  },
}

/**
 * Template-Mapping
 */
export const DOCUMENTATION_TEMPLATES: Record<
  DocumentationCategory,
  Omit<Documentation, "metadata" | "changeHistory">
> = {
  "change-log": CHANGE_LOG_TEMPLATE,
  "error-documentation": ERROR_DOCUMENTATION_TEMPLATE,
  "feature-documentation": FEATURE_DOCUMENTATION_TEMPLATE,
  "architecture-decision": ARCHITECTURE_DECISION_TEMPLATE,
  "optimization-report": OPTIMIZATION_REPORT_TEMPLATE,
}

/**
 * Erstellt eine neue Dokumentation basierend auf einem Template
 */
export function createDocumentationFromTemplate(
  category: DocumentationCategory,
  metadata: DocumentationMetadata,
  contentOverride?: Partial<DocumentationContent>
): Documentation {
  const template = DOCUMENTATION_TEMPLATES[category]

  return {
    metadata,
    content: {
      ...template.content,
      ...contentOverride,
    },
    changeHistory: [
      {
        date: metadata.date,
        author: metadata.author,
        changes: "Initiale Erstellung",
      },
    ],
  }
}

