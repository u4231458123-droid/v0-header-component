/**
 * Knowledge-Base-Loader für CI/CD
 * ===============================
 * Lädt alle relevanten Knowledge-Entries für CI/CD-Aufgaben
 */

const fs = require("fs")
const path = require("path")

/**
 * Standard-Knowledge für CI/CD
 */
function getDefaultKnowledge() {
  return {
    rules: [
      {
        id: "rules-001",
        title: "WICHTIGE REGELN FÜR ALLE BOTS",
        content: `
1. VORBEREITUNG (OBLIGATORISCH)
- IMMER zuerst alle Vorgaben, Regeln, Verbote und Dokumentationen laden
- Vollständiges Gesamt-Wissen und systemweites Verständnis sicherstellen

2. IST-ANALYSE (OBLIGATORISCH)
- Vor JEDER Aufgabe eine IST-Analyse durchführen
- Bestehenden Code vollständig verstehen
        `,
        priority: "critical",
      },
      {
        id: "design-guidelines-001",
        title: "Design & Layout Vorgaben - UNVERÄNDERLICH",
        content: `
- Design- und Layout-Änderungen sind STRENG VERBOTEN
- Primärfarbe: #323D5E (nur als Design-Token bg-primary)
- Cards: rounded-2xl
- Buttons: rounded-xl
- Spacing: gap-5 als Standard
        `,
        priority: "critical",
      },
      {
        id: "account-rules-001",
        title: "Account-spezifische Routing-Regeln",
        content: `
- courbois1981@gmail.com → /dashboard (OHNE Subscription-Check)
- courbois1981@gmail.com → /mydispatch zugänglich
- courbois83@gmail.com → /kunden-portal
        `,
        priority: "critical",
      },
      {
        id: "forbidden-terms-001",
        title: "Verbotene Begriffe",
        content: `
NIEMALS verwenden:
- "kostenlos", "gratis", "free"
- "testen", "Testphase", "trial"
- "unverbindlich"
- "ohne Risiko"
        `,
        priority: "critical",
      },
      {
        id: "functionality-rules-001",
        title: "Funktionalität - Keine Entfernung",
        content: `
STRENG VERBOTEN:
- Bestehende Buttons entfernen
- Bestehende Links entfernen
- Bestehende Funktionen entfernen
- 404-Fehler verursachen
        `,
        priority: "critical",
      },
    ],
  }
}

/**
 * Lade Knowledge für spezifische Kategorien
 */
function loadKnowledgeForCategories(categories = []) {
  const knowledge = getDefaultKnowledge()
  const allRules = knowledge.rules

  if (categories.length === 0) {
    return allRules
  }

  // Filtere nach Kategorien (vereinfacht)
  return allRules.filter((rule) => {
    const ruleCategories = {
      "rules-001": ["best-practices", "ci-cd"],
      "design-guidelines-001": ["design-guidelines"],
      "account-rules-001": ["account-rules", "routing-rules"],
      "forbidden-terms-001": ["forbidden-terms"],
      "functionality-rules-001": ["best-practices"],
    }

    const ruleCats = ruleCategories[rule.id] || []
    return categories.some((cat) => ruleCats.includes(cat))
  })
}

module.exports = {
  loadKnowledgeForCategories,
  getDefaultKnowledge,
}

