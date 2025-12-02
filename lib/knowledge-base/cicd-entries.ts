/**
 * CI/CD-spezifische Knowledge-Entries
 * ====================================
 * Alle Regeln und Vorgaben für die CI/CD-Pipeline
 */

import type { KnowledgeEntry } from "./structure"

export const CICD_RULES: KnowledgeEntry = {
  id: "cicd-rules-001",
  category: "ci-cd",
  title: "CI/CD-Pipeline Regeln - OBLIGATORISCH",
  content: `
# CI/CD-Pipeline Regeln - OBLIGATORISCH

## VORBEREITUNG (OBLIGATORISCH)
- IMMER zuerst Knowledge-Base laden vor jeder Aufgabe
- Vollständiges Gesamt-Wissen und systemweites Verständnis sicherstellen
- Keine Aufgabe ohne vollständige Kontext-Informationen beginnen

## IST-ANALYSE (OBLIGATORISCH)
- Vor JEDER Code-Änderung eine IST-Analyse durchführen
- Bestehenden Code vollständig verstehen
- Abhängigkeiten und Auswirkungen analysieren
- Sinn und Logik des bestehenden Codes verstehen

## KI-MODELL-AUSWAHL
Priorität:
1. DeepSeek V3 (deepseek-ai/DeepSeek-V3) - 4096 tokens, temp 0.3
2. StarCoder2 15B (bigcode/starcoder2-15b) - 8192 tokens, temp 0.3
3. CodeLlama 13B (codellama/CodeLlama-13b-Instruct-hf) - 4096 tokens
4. WizardCoder 15B (WizardLM/WizardCoder-15B-V1.0) - 4096 tokens

## FEHLERBEHANDLUNG
- Alle Fehler in Knowledge-Base dokumentieren
- Fehlerursachen analysieren
- Präventionsmaßnahmen definieren
- Wiederholung vermeiden

## AUTO-FIX REGELN
- Pattern-basierte Fixes als Fallback
- Minimal-invasive Fixes
- Behalte Funktionalität bei
- Keine Breaking Changes
- Dokumentiere alle Fixes
  `,
  tags: ["cicd", "rules", "obligatory", "bots"],
  relatedEntries: ["rules-001", "design-guidelines-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

export const CICD_VALIDATION_RULES: KnowledgeEntry = {
  id: "cicd-validation-001",
  category: "ci-cd",
  title: "CI/CD Validierungs-Regeln",
  content: `
# CI/CD Validierungs-Regeln

## LAYOUT VALIDIERUNG
- Design-Tokens verwenden (keine hardcoded Farben)
- rounded-2xl für Cards
- rounded-xl für Buttons
- gap-5 als Standard (nicht gap-4/gap-6)
- Keine verbotenen Begriffe ("kostenlos", "testen", "trial", etc.)
- Logo-Integration: company.logo_url || "/images/mydispatch-3d-logo.png"

## MOBILE VALIDIERUNG
- Media Queries vorhanden
- Mobile Breakpoints (≤768px)
- Touch-Targets ≥44px
- Viewport Meta Tag vorhanden

## API VALIDIERUNG
- API-Endpoints dokumentiert
- Error Handling vorhanden
- Input Validation
- Authentication
- Rate Limiting

## SECURITY VALIDIERUNG
- Keine hardcoded Secrets
- Input Validation
- XSS Prevention
- HTTPS nur
- CSRF Protection

## PERFORMANCE VALIDIERUNG
- Bundle-Größe < 2MB (optimal)
- Code-Splitting vorhanden
- Lazy-Loading implementiert
- Memoization verwendet
- Tree-Shaking aktiv

## ACCESSIBILITY VALIDIERUNG
- ARIA-Attribute vorhanden
- Alt-Texte für Bilder
- Keyboard-Navigation
- Color-Contrast
- Screen-Reader-Support
  `,
  tags: ["cicd", "validation", "quality"],
  relatedEntries: ["design-guidelines-001", "functionality-rules-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "high",
}

export const CICD_ERROR_HANDLING: KnowledgeEntry = {
  id: "cicd-error-handling-001",
  category: "error-handling",
  title: "CI/CD Fehlerbehandlung",
  content: `
# CI/CD Fehlerbehandlung

## FEHLER-DOKUMENTATION
- Alle Fehler werden in Knowledge-Base dokumentiert
- Fehler-ID, Typ, Datei, Zeile, Kontext
- Lösung und Präventionsmaßnahmen
- Verwandte Fehler verlinken

## FEHLER-KATEGORIEN
- Syntax-Fehler
- Type-Fehler
- Import-Fehler
- Framework-Fehler (React, Next.js)
- Performance-Fehler
- Security-Fehler
- Accessibility-Fehler
- Design-Vorgaben-Verstöße
- Funktionalitäts-Fehler

## FEHLER-PRIORITÄT
- critical: System nicht funktionsfähig
- high: Wichtige Funktionalität betroffen
- medium: Beeinträchtigung vorhanden
- low: Kleine Verbesserung möglich

## AUTO-FIX STRATEGIE
1. Pattern-basierte Fixes (bekannte Muster)
2. AI-powered Fixes (Hugging Face)
3. TypeScript/ESLint Auto-Fix
4. Dokumentation wenn Fix nicht möglich
  `,
  tags: ["cicd", "error-handling", "auto-fix"],
  relatedEntries: ["cicd-rules-001", "rules-001"],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "high",
}

export const CICD_MYDISPATCH_SPECIFIC: KnowledgeEntry = {
  id: "cicd-mydispatch-001",
  category: "ci-cd",
  title: "MyDispatch-spezifische CI/CD-Regeln",
  content: `
# MyDispatch-spezifische CI/CD-Regeln

## ACCOUNT-ROUTING (KRITISCH)
- courbois1981@gmail.com → /dashboard (OHNE Subscription-Check)
- courbois1981@gmail.com → /mydispatch zugänglich
- courbois1981@gmail.com → Tarifwechsel-Button sichtbar
- courbois1981@gmail.com → "MyDispatch" Link in Sidebar sichtbar
- courbois83@gmail.com → /kunden-portal
- Andere Accounts → Normales Routing mit Subscription-Check

## DESIGN-VORGABEN (UNVERÄNDERLICH)
- Primärfarbe: #323D5E (nur als Design-Token bg-primary)
- Cards: rounded-2xl
- Buttons: rounded-xl
- Spacing: gap-5 als Standard
- KEINE Design-Änderungen, nur Funktionalität

## VERBOTENE BEGRIFFE
- "kostenlos", "gratis", "free"
- "testen", "Testphase", "trial"
- "unverbindlich"
- "ohne Risiko"

## FUNKTIONALITÄT
- KEINE Entfernung bestehender Features
- KEINE 404-Fehler
- Alle Buttons und Links müssen funktionieren

## PDF-GENERIERUNG
- Briefpapier wenn briefpapier_url vorhanden
- Logo wenn logo_url vorhanden (sonst MyDispatch-Logo)
- Standard DIN-Norm Format (A4) wenn kein Briefpapier

## E-MAIL-VORLAGEN
- MyDispatch-Design für MyDispatch-Kunden
- Professionelles Design für Unternehmer
- Logo-Integration (Company-Logo oder MyDispatch-Logo)

## PARTNER-WEITERLEITUNG
- Alle Daten standardmäßig im Account sichtbar
- Nur markierte Daten werden an Partner übermittelt
- Checkbox-System für Datenauswahl
  `,
  tags: ["cicd", "mydispatch", "specific", "rules"],
  relatedEntries: [
    "account-rules-001",
    "design-guidelines-001",
    "forbidden-terms-001",
    "pdf-generation-001",
    "email-templates-001",
    "partner-forwarding-001",
  ],
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  priority: "critical",
}

