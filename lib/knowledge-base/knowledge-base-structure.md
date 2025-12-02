# Wissensdatenbank-Struktur - MyDispatch

## Übersicht

Die MyDispatch Wissensdatenbank ist die zentrale Quelle für alle Vorgaben, Regeln, Arbeitsanweisungen und Best Practices. Sie wird von allen Bots verwendet und stellt sicher, dass alle Umsetzungen konsistent und qualitativ hochwertig sind.

## Struktur

### 1. Kategorien

#### 1.1 Design-Guidelines
- `design-guidelines-001`: Design & Layout Vorgaben - UNVERÄNDERLICH
- `ui-consistency-001`: Systemweite UI-Konsistenz - UNVERÄNDERLICH
- `ui-consistency-detailed-001`: UI-Konsistenz Detailliert - Exakte Platzierung

#### 1.2 Coding-Rules
- `coding-rules-001`: Coding-Regeln & Best Practices
- `forbidden-terms-001`: Verbotene Begriffe - NIEMALS verwenden

#### 1.3 Architecture
- `architecture-001`: Architektur-Guidelines
- `logo-integration-001`: Logo-Integration Regeln

#### 1.4 Best-Practices
- `rules-001`: WICHTIGE REGELN FÜR ALLE BOTS
- `mydispatch-core-values-001`: MyDispatch Kernwerte - UNVERÄNDERLICH
- `quality-assurance-001`: Qualitätssicherung - Lückenfreie Umsetzung
- `honesty-transparency-001`: Ehrlichkeit & Transparenz - KEINE LÜGEN
- `visual-logical-validation-001`: Visuelle & Logische Prüfung - Nutzersicht
- `quality-thinking-detailed-001`: Qualitätsdenken bis ins kleinste Detail

#### 1.5 Account-Rules
- `account-rules-001`: Account-spezifische Routing-Regeln
- `routing-rules-001`: Routing-Logik & Middleware

#### 1.6 PDF & Email
- `pdf-generation-001`: PDF-Generierung Regeln
- `email-templates-001`: E-Mail-Vorlagen Regeln

#### 1.7 Functionality
- `functionality-rules-001`: Funktionalität - Keine Entfernung

#### 1.8 CI/CD
- `cicd-rules-001`: CI/CD Pipeline Regeln
- `cicd-validation-001`: CI/CD Validierung
- `cicd-error-handling-001`: CI/CD Error Handling
- `cicd-mydispatch-001`: MyDispatch-spezifische CI/CD Vorgaben

#### 1.9 Systemweites Denken
- `systemwide-thinking-001`: Systemweites Denken - UNVERÄNDERLICH
- `bot-workflow-001`: Strukturiertes Bot-Arbeitskonzept
- `emergency-special-cases-001`: Notfall-Lösungen & Sonderfälle

#### 1.10 Bot-Arbeitsanweisungen
- `system-bot-instructions-001`: System-Bot: Detaillierte Arbeitsanweisungen
- `quality-bot-instructions-001`: Quality-Bot: Detaillierte Arbeitsanweisungen
- `master-bot-instructions-001`: Master-Bot: Detaillierte Arbeitsanweisungen

#### 1.11 UI-Konsistenz & Text-Qualität
- `text-quality-001`: Text-Qualität & SEO-Optimierung
- `mydispatch-concept-001`: MyDispatch-Konzept & Vertrauensbildung
- `seo-optimization-001`: SEO-Optimierung Guidelines

## 2. Knowledge-Entry-Struktur

Jeder Knowledge-Entry hat folgende Struktur:

```typescript
{
  id: string                    // Eindeutige ID (z.B. "design-guidelines-001")
  category: KnowledgeCategory   // Kategorie (z.B. "design-guidelines")
  title: string                 // Titel
  content: string               // Vollständiger Inhalt (Markdown)
  tags: string[]                // Tags für Suche
  relatedEntries: string[]      // Verwandte Einträge (IDs)
  version: string               // Version (z.B. "1.0.0")
  lastUpdated: string           // ISO-Datum
  priority: "critical" | "high" | "medium" | "low"
}
```

## 3. Verwendung durch Bots

### 3.1 System-Bot
Lädt automatisch:
- design-guidelines
- coding-rules
- forbidden-terms
- architecture
- best-practices
- account-rules
- routing-rules
- pdf-generation
- email-templates
- functionality-rules
- ci-cd
- error-handling
- ui-consistency
- systemwide-thinking
- bot-instructions
- mydispatch-core

### 3.2 Quality-Bot
Lädt automatisch:
- design-guidelines
- coding-rules
- forbidden-terms
- functionality-rules
- best-practices
- ci-cd
- error-handling
- ui-consistency (inkl. detaillierte Regeln)
- systemwide-thinking
- bot-instructions
- mydispatch-core

### 3.3 Master-Bot
Lädt automatisch:
- ALLE Kategorien (vollständige Knowledge-Base)

## 4. Prioritäten

### Critical (Höchste Priorität)
- Systemweites Denken
- MyDispatch Kernwerte
- UI-Konsistenz
- Bot-Arbeitsanweisungen
- Qualitätssicherung

### High
- Design-Guidelines
- Coding-Rules
- Account-Rules
- Routing-Rules

### Medium
- Best-Practices
- SEO-Optimierung
- Text-Qualität

### Low
- API-Documentation
- Error-Handling (nicht-kritisch)

## 5. Aktualisierung

### 5.1 Neue Einträge hinzufügen
1. Erstelle Knowledge-Entry in entsprechender Datei
2. Füge zu `load-with-cicd.ts` hinzu
3. Füge zu entsprechender Kategorie in `tableOfContents` hinzu
4. Dokumentiere in dieser Datei

### 5.2 Bestehende Einträge aktualisieren
1. Aktualisiere `content` im Knowledge-Entry
2. Erhöhe `version`
3. Aktualisiere `lastUpdated`
4. Dokumentiere Änderung

## 6. Suchfunktion

### 6.1 Nach Kategorie
```typescript
loadKnowledgeForTaskWithCICD("task-type", ["design-guidelines", "coding-rules"])
```

### 6.2 Nach ID
```typescript
knowledgeBase.find((e) => e.id === "design-guidelines-001")
```

### 6.3 Nach Tags
```typescript
knowledgeBase.filter((e) => e.tags.includes("critical"))
```

## 7. Wichtige Regeln

### 7.1 Für alle Bots
- IMMER zuerst Knowledge-Base laden
- IMMER systemweites Denken aktivieren
- IMMER alle relevanten Kategorien laden
- NIEMALS ohne vollständige Kontext-Informationen arbeiten

### 7.2 Für Knowledge-Entry-Erstellung
- Klare, präzise Formulierungen
- Vollständige Beispiele
- Verwandte Einträge verlinken
- Regelmäßig aktualisieren

## 8. Dokumentation

### 8.1 Struktur-Dokumentation
- Diese Datei: `lib/knowledge-base/knowledge-base-structure.md`

### 8.2 Inhalt-Dokumentation
- Jeder Knowledge-Entry enthält vollständige Dokumentation im `content`-Feld

### 8.3 Verwendungs-Dokumentation
- Bot-spezifische Dokumentation in `docs/COMPLETE_BOT_WORKFLOW_SYSTEM.md`
- Qualitäts-Dokumentation in `docs/COMPLETE_QUALITY_SYSTEM.md`

## 9. Zusammenfassung

Die Wissensdatenbank ist:
- ✅ Vollständig strukturiert
- ✅ Klar kommuniziert dargestellt
- ✅ Alle Vorgaben sichergestellt
- ✅ Von allen Bots verwendet
- ✅ Kontinuierlich aktualisiert
- ✅ Vollständig dokumentiert

Dies gewährleistet, dass alle Umsetzungen konsistent, qualitativ hochwertig und lückenlos sind.

