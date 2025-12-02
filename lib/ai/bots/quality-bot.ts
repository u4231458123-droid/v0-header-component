/**
 * QUALITY-BOT
 * ===========
 * Prüft Code gegen Dokumentation und Vorgaben
 * Dokumentiert gefundene Fehler in Knowledge-Base
 */

import { loadKnowledgeForTask, type KnowledgeCategory } from "@/lib/knowledge-base/structure"
import { loadKnowledgeForTaskWithCICD } from "@/lib/knowledge-base/load-with-cicd"
import type { BotTask, BotResponse } from "./system-bot"
import { logError } from "@/lib/cicd/error-logger"
import { WorkTracker } from "@/lib/knowledge-base/work-tracking"

export class QualityBot {
  private knowledgeBase: any
  private workTracker: WorkTracker

  constructor() {
    this.loadKnowledgeBase()
    this.workTracker = new WorkTracker()
  }

  /**
   * Lade alle Vorgaben und Regeln
   */
  private async loadKnowledgeBase() {
    const categories: KnowledgeCategory[] = [
      "design-guidelines",
      "coding-rules",
      "forbidden-terms",
      "functionality-rules",
      "best-practices",
      "ci-cd",
      "error-handling",
      "ui-consistency",
      "systemwide-thinking",
      "bot-instructions",
      "mydispatch-core",
    ]
    
    // Lade zusätzlich detaillierte UI-Konsistenz-Regeln
    const detailedConsistency = loadKnowledgeForTaskWithCICD("quality-check", ["ui-consistency"])
    this.knowledgeBase = [...this.knowledgeBase, ...detailedConsistency.filter((e: any) => 
      e.id === "ui-consistency-detailed-001" || 
      e.id === "visual-logical-validation-001" || 
      e.id === "quality-thinking-detailed-001"
    )]
    
    this.knowledgeBase = loadKnowledgeForTaskWithCICD("quality-check", categories)
  }

  /**
   * Prüfe Code gegen Dokumentation und Knowledge-Base
   * SYSTEMWEITE PRÜFUNG: UI-Konsistenz, Text-Qualität, SEO, MyDispatch-Konzept
   * DYNAMISCHE PRÜFUNG: Alle Knowledge-Base-Regeln werden automatisch geprüft
   */
  async checkCodeAgainstDocumentation(
    code: string,
    documentation: any,
    filePath: string
  ): Promise<{
    violations: Array<{
      type: "design" | "functionality" | "forbidden-term" | "logic" | "account-routing" | "pdf-email" | "logo" | "ui-consistency" | "text-quality" | "seo" | "mydispatch-concept" | "partner-forwarding" | "driver-selection" | "other"
      severity: "critical" | "high" | "medium" | "low"
      message: string
      line?: number
      suggestion: string
    }>
    passed: boolean
  }> {
    await this.loadKnowledgeBase()
    const violations: any[] = []
    const lines = code.split("\n")
    
    // DYNAMISCHE PRÜFUNG: Lade ALLE Knowledge-Base-Regeln
    const designGuidelines = this.knowledgeBase.find((e: any) => e.id === "design-guidelines-001")
    const forbiddenTerms = this.knowledgeBase.find((e: any) => e.id === "forbidden-terms-001")
    const accountRules = this.knowledgeBase.find((e: any) => e.id === "account-rules-001")
    const pdfRules = this.knowledgeBase.find((e: any) => e.id === "pdf-generation-001")
    const emailRules = this.knowledgeBase.find((e: any) => e.id === "email-templates-001")
    const uiConsistencyRules = this.knowledgeBase.find((e: any) => e.id === "ui-consistency-001")
    const textQualityRules = this.knowledgeBase.find((e: any) => e.id === "text-quality-001")
    const mydispatchConcept = this.knowledgeBase.find((e: any) => e.id === "mydispatch-concept-001")
    const seoRules = this.knowledgeBase.find((e: any) => e.id === "seo-optimization-001")
    const routingRules = this.knowledgeBase.find((e: any) => e.id === "routing-rules-001")
    const functionalityRules = this.knowledgeBase.find((e: any) => e.id === "functionality-rules-001")
    const codingRules = this.knowledgeBase.find((e: any) => e.id === "coding-rules-001")
    const bestPractices = this.knowledgeBase.find((e: any) => e.id === "best-practices-001")
    
    // DYNAMISCHE PRÜFUNG: Prüfe ALLE Knowledge-Base-Entries
    const allKnowledgeEntries = this.knowledgeBase.filter((e: any) => 
      e.priority === "critical" || e.priority === "high"
    )
    
    // Prüfe jede Knowledge-Base-Regel dynamisch
    for (const entry of allKnowledgeEntries) {
      if (entry.content && typeof entry.content === "string") {
        // Extrahiere Regeln aus Content
        const rules = this.extractRulesFromContent(entry.content, entry.category)
        for (const rule of rules) {
          const ruleViolations = this.checkRuleAgainstCode(rule, code, lines, filePath, entry.category)
          violations.push(...ruleViolations)
        }
      }
    }
    
    // Prüfe Design-Vorgaben
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Hardcoded Farben
      if (/#323D5E|#0A2540|#([0-9a-fA-F]{3}){1,2}/i.test(line) && !line.includes("//") && !line.includes("/*")) {
        violations.push({
          type: "design",
          severity: "high",
          message: "Hardcoded Farbe gefunden. Verwende Design-Tokens.",
          line: i + 1,
          suggestion: "Ersetze durch bg-primary, text-primary, etc.",
        })
      }
      
      // Falsche rounded-Klassen für Cards
      if (/rounded-lg.*Card|Card.*rounded-lg|className.*rounded-lg.*Card/.test(line)) {
        violations.push({
          type: "design",
          severity: "medium",
          message: "Cards müssen rounded-2xl verwenden, nicht rounded-lg",
          line: i + 1,
          suggestion: "Ersetze rounded-lg durch rounded-2xl für Cards",
        })
      }
      
      // Falsche rounded-Klassen für Buttons
      if (/rounded-md.*Button|Button.*rounded-md|className.*rounded-md.*Button/.test(line)) {
        violations.push({
          type: "design",
          severity: "medium",
          message: "Buttons müssen rounded-xl verwenden, nicht rounded-md",
          line: i + 1,
          suggestion: "Ersetze rounded-md durch rounded-xl für Buttons",
        })
      }
      
      // Falsche gap-Werte
      if (/gap-4|gap-6/.test(line) && !line.includes("//") && !line.includes("/*")) {
        violations.push({
          type: "design",
          severity: "medium",
          message: "Standard-Gap ist gap-5, nicht gap-4 oder gap-6",
          line: i + 1,
          suggestion: "Ersetze gap-4 oder gap-6 durch gap-5",
        })
      }
      
      // Verbotene Begriffe
      if (forbiddenTerms) {
        const forbiddenTermsList = ["kostenlos", "gratis", "free", "testen", "Testphase", "trial", "unverbindlich", "ohne Risiko"]
        for (const term of forbiddenTermsList) {
          const regex = new RegExp(`\\b${term}\\b`, "i")
          if (regex.test(line) && !line.includes("//") && !line.includes("/*")) {
            violations.push({
              type: "forbidden-term",
              severity: "critical",
              message: `Verbotener Begriff gefunden: "${term}"`,
              line: i + 1,
              suggestion: "Verwende erlaubte Alternativen (siehe Knowledge-Base)",
            })
          }
        }
      }
      
      // Account-Routing-Prüfung
      if (accountRules && filePath.includes("dashboard") && filePath.includes("page.tsx")) {
        if (line.includes("courbois1981@gmail.com") && !line.includes("redirect(\"/dashboard\")") && !line.includes("redirect('/dashboard')")) {
          violations.push({
            type: "account-routing",
            severity: "critical",
            message: "Master-Account (courbois1981@gmail.com) muss zu /dashboard weiterleiten ohne Subscription-Check",
            line: i + 1,
            suggestion: "Implementiere korrekte Routing-Logik für Master-Account",
          })
        }
        if (line.includes("courbois83@gmail.com") && !line.includes("redirect(\"/kunden-portal\")") && !line.includes("redirect('/kunden-portal')")) {
          violations.push({
            type: "account-routing",
            severity: "critical",
            message: "Kunden-Account (courbois83@gmail.com) muss zu /kunden-portal weiterleiten",
            line: i + 1,
            suggestion: "Implementiere korrekte Routing-Logik für Kunden-Account",
          })
        }
      }
      
      // Logo-Integration-Prüfung
      if (filePath.includes("logo") || line.includes("logo")) {
        if (!line.includes("company.logo_url") && !line.includes("company?.logo_url") && !line.includes("/images/mydispatch-3d-logo.png")) {
          if (line.includes("logo") && !line.includes("//") && !line.includes("/*")) {
            violations.push({
              type: "logo",
              severity: "medium",
              message: "Logo-Integration sollte company.logo_url || '/images/mydispatch-3d-logo.png' verwenden",
              line: i + 1,
              suggestion: "Verwende company.logo_url || '/images/mydispatch-3d-logo.png' für Logo-Integration",
            })
          }
        }
      }
      
      // PDF-Generierung-Prüfung
      if (pdfRules && filePath.includes("pdf") && filePath.includes("generator")) {
        if (line.includes("briefpapier") && !line.includes("briefpapier_url")) {
          violations.push({
            type: "pdf-email",
            severity: "high",
            message: "PDF-Generierung sollte briefpapier_url berücksichtigen",
            line: i + 1,
            suggestion: "Implementiere Briefpapier-Integration in PDF-Generierung",
          })
        }
      }
      
      // E-Mail-Vorlagen-Prüfung
      if (emailRules && filePath.includes("email") && filePath.includes("template")) {
        if (line.includes("logo") && !line.includes("company.logo_url") && !line.includes("company?.logo_url")) {
          violations.push({
            type: "pdf-email",
            severity: "high",
            message: "E-Mail-Vorlagen sollten dynamisches Logo (company.logo_url || MyDispatch-Logo) verwenden",
            line: i + 1,
            suggestion: "Implementiere dynamische Logo-Integration in E-Mail-Vorlagen",
          })
        }
      }

      // UI-KONSISTENZ-PRÜFUNG: Systemweite UI-Library-Elemente
      if (uiConsistencyRules) {
        // Header muss aus UI-Library sein
        if ((line.includes("<header") || line.includes("<Header")) && !line.includes("from '@/components/ui/header'") && !line.includes('from "@/components/ui/header"') && !line.includes("components/ui/header")) {
          violations.push({
            type: "ui-consistency",
            severity: "critical",
            message: "Header muss aus systemweiter UI-Library verwendet werden (components/ui/header)",
            line: i + 1,
            suggestion: "Verwende <Header /> aus components/ui/header.tsx",
          })
        }

        // Footer muss aus UI-Library sein
        if ((line.includes("<footer") || line.includes("<Footer")) && !line.includes("from '@/components/ui/footer'") && !line.includes('from "@/components/ui/footer"') && !line.includes("components/ui/footer")) {
          violations.push({
            type: "ui-consistency",
            severity: "critical",
            message: "Footer muss aus systemweiter UI-Library verwendet werden (components/ui/footer)",
            line: i + 1,
            suggestion: "Verwende <Footer /> aus components/ui/footer.tsx",
          })
        }

        // Logo muss aus UI-Library sein
        if ((line.includes("<logo") || line.includes("<Logo") || line.includes("logo.png") || line.includes("logo.svg")) && !line.includes("from '@/components/ui/logo'") && !line.includes('from "@/components/ui/logo"') && !line.includes("components/ui/logo") && !line.includes("company.logo_url")) {
          violations.push({
            type: "ui-consistency",
            severity: "critical",
            message: "Logo muss aus systemweiter UI-Library verwendet werden (components/ui/logo)",
            line: i + 1,
            suggestion: "Verwende <Logo /> aus components/ui/logo.tsx",
          })
        }
      }

      // TEXT-QUALITÄTS-PRÜFUNG
      if (textQualityRules) {
        // Generische Texte vermeiden
        const genericTexts = ["Willkommen", "Hier klicken", "Testen Sie", "Kostenlos", "Gratis"]
        for (const genericText of genericTexts) {
          if (line.includes(genericText) && !line.includes("//") && !line.includes("/*")) {
            violations.push({
              type: "text-quality",
              severity: "high",
              message: `Generischer Text gefunden: "${genericText}". Verwende themenrelevante, nutzerfreundliche, SEO-optimierte Texte.`,
              line: i + 1,
              suggestion: `Ersetze durch themenrelevanten, freundlichen, kompetenten Text gemäß Text-Qualitäts-Guidelines`,
            })
          }
        }

        // SEO-Prüfung: Meta-Tags
        if (filePath.includes("page.tsx") || filePath.includes("layout.tsx")) {
          if (line.includes("metadata") || line.includes("title") || line.includes("description")) {
            // Prüfe ob SEO-relevante Keywords vorhanden
            const seoKeywords = ["Fahrdienst", "Taxi", "Dispatch", "Transport", "Fahrzeug"]
            const hasSeoKeywords = seoKeywords.some((keyword) => line.toLowerCase().includes(keyword.toLowerCase()))
            if (!hasSeoKeywords && (line.includes("title") || line.includes("description"))) {
              violations.push({
                type: "seo",
                severity: "medium",
                message: "SEO-Optimierung: Meta-Tags sollten relevante Keywords enthalten",
                line: i + 1,
                suggestion: "Füge SEO-relevante Keywords hinzu (Fahrdienst, Taxi, Dispatch, etc.)",
              })
            }
          }
        }
      }

      // MYDISPATCH-KONZEPT-PRÜFUNG
      if (mydispatchConcept) {
        // Prüfe ob MyDispatch-Kernwerte sichtbar sind
        if (filePath.includes("page.tsx") && (filePath.includes("home") || filePath.includes("index") || filePath.includes("landing"))) {
          const coreValues = ["einfach", "wenige Klicks", "übersichtlich", "nicht überladen", "Branchenansprüche", "Nutzerqualität", "günstig"]
          const hasCoreValues = coreValues.some((value) => code.toLowerCase().includes(value.toLowerCase()))
          if (!hasCoreValues) {
            violations.push({
              type: "mydispatch-concept",
              severity: "high",
              message: "Home-Seite sollte MyDispatch-Kernwerte klar kommunizieren (Einfachheit, wenige Klicks, Qualität, Preis)",
              line: i + 1,
              suggestion: "Integriere MyDispatch-Kernwerte klar und hochwertig auf der Home-Seite",
            })
          }
          
          // PRÜFE: Keine erfundenen Zertifikate, Testimonials, Case Studies
          const forbiddenClaims = ["zertifiziert", "testimonial", "case study", "kunde sagt", "bewertung von"]
          const hasForbiddenClaims = forbiddenClaims.some((claim) => code.toLowerCase().includes(claim.toLowerCase()))
          if (hasForbiddenClaims && !code.includes("//") && !code.includes("/*")) {
            violations.push({
              type: "honesty",
              severity: "critical",
              message: "KEINE erfundenen Zertifikate, Testimonials oder Case Studies! Stattdessen: Hervorheben der MyDispatch-Anwendung, hoher Qualität und hohem Nutzen.",
              line: i + 1,
              suggestion: "Entferne erfundene Inhalte und ersetze durch ehrliche Darstellung der Qualität und des Nutzens",
            })
          }
        }
      }
      
      // LÜCKENFREIHEIT-PRÜFUNG
      const qualityAssurance = this.knowledgeBase.find((e: any) => e.id === "quality-assurance-001")
      if (qualityAssurance) {
        // Prüfe auf Lücken in Rechtstexten, Erklärungen, Hilfestellungen, Beschreibungen
        if (filePath.includes("legal") || filePath.includes("terms") || filePath.includes("privacy") || filePath.includes("imprint")) {
          const incompleteIndicators = ["TODO", "coming soon", "wird ergänzt", "in kürze"]
          const hasIncomplete = incompleteIndicators.some((indicator) => code.toLowerCase().includes(indicator.toLowerCase()))
          if (hasIncomplete) {
            violations.push({
              type: "quality-assurance",
              severity: "critical",
              message: "Rechtstexte müssen vollständig sein - keine Lücken oder Platzhalter",
              line: i + 1,
              suggestion: "Vervollständige alle Rechtstexte lückenlos",
            })
          }
        }
        
        // Prüfe auf Lücken in Erklärungen und Beschreibungen
        if (filePath.includes("help") || filePath.includes("faq") || filePath.includes("description")) {
          const incompleteIndicators = ["TODO", "coming soon", "wird ergänzt", "in kürze", "noch nicht verfügbar"]
          const hasIncomplete = incompleteIndicators.some((indicator) => code.toLowerCase().includes(indicator.toLowerCase()))
          if (hasIncomplete) {
            violations.push({
              type: "quality-assurance",
              severity: "high",
              message: "Erklärungen und Beschreibungen müssen vollständig sein - keine Lücken",
              line: i + 1,
              suggestion: "Vervollständige alle Erklärungen und Beschreibungen lückenlos",
            })
          }
        }
      }
      
      // UI-KONSISTENZ DETAILLIERT: Exakte Platzierung prüfen
      const detailedConsistency = this.knowledgeBase.find((e: any) => e.id === "ui-consistency-detailed-001")
      if (detailedConsistency) {
        // Prüfe auf Button-Platzierung (Beispiel: Dashboard-Seiten)
        if (filePath.includes("dashboard") && (line.includes("Button") || line.includes("button"))) {
          // Prüfe ob Button-Komponente konsistent verwendet wird
          if (!line.includes("from '@/components/ui/button'") && !line.includes('from "@/components/ui/button"') && !line.includes("components/ui/button")) {
            violations.push({
              type: "ui-consistency",
              severity: "high",
              message: "Buttons müssen aus UI-Library verwendet werden für exakt identische Platzierung auf allen Dashboard-Seiten",
              line: i + 1,
              suggestion: "Verwende Button-Komponente aus components/ui/button.tsx für konsistente Platzierung",
            })
          }
        }
        
        // Prüfe auf Hilfe-Text-Platzierung
        if (filePath.includes("help") && (line.includes("Hilfe") || line.includes("help"))) {
          // Prüfe ob Hilfe-Komponente konsistent verwendet wird
          if (!line.includes("from '@/components/ui/help'") && !line.includes('from "@/components/ui/help"') && !line.includes("components/ui/help")) {
            violations.push({
              type: "ui-consistency",
              severity: "high",
              message: "Hilfe-Texte müssen aus UI-Library verwendet werden für exakt identische Platzierung auf allen Hilfe-Pages",
              line: i + 1,
              suggestion: "Verwende Help-Komponente aus components/ui/help.tsx für konsistente Platzierung",
            })
          }
        }
      }
      
      // VISUELLE & LOGISCHE PRÜFUNG: Aus Nutzersicht
      const visualLogical = this.knowledgeBase.find((e: any) => e.id === "visual-logical-validation-001")
      if (visualLogical) {
        // Prüfe auf Text-Ausrichtungen (nicht nur Datenwerte, sondern auch visuell/logisch)
        if (line.includes("text-align") || line.includes("textAlign")) {
          // Prüfe ob Ausrichtung konsistent ist
          if (line.includes("text-align: center") && !filePath.includes("heading") && !filePath.includes("title")) {
            violations.push({
              type: "visual-logical",
              severity: "medium",
              message: "Text-Ausrichtung sollte visuell und logisch aus Nutzersicht geprüft werden - Zentrierung nur für Überschriften",
              line: i + 1,
              suggestion: "Prüfe visuell und logisch: Macht die Ausrichtung aus Nutzersicht Sinn?",
            })
          }
        }
        
        // Prüfe auf Textumbrüche
        if (line.includes("word-break") || line.includes("wordBreak") || line.includes("overflow")) {
          violations.push({
            type: "visual-logical",
            severity: "medium",
            message: "Textumbrüche sollten visuell und logisch aus Nutzersicht geprüft werden - sind sie lesbar und sinnvoll?",
            line: i + 1,
            suggestion: "Prüfe visuell: Siehen die Umbrüche gut aus? Prüfe logisch: Sind die Umbrüche sinnvoll?",
          })
        }
      }
      
      // QUALITÄT BIS INS KLEINSTE DETAIL
      const qualityThinking = this.knowledgeBase.find((e: any) => e.id === "quality-thinking-detailed-001")
      if (qualityThinking) {
        // Prüfe auf Abstände (pixelgenau)
        if (line.includes("margin") || line.includes("padding") || line.includes("gap")) {
          // Prüfe ob Standard-Abstände verwendet werden
          const standardSpacing = ["gap-5", "p-4", "m-4", "gap-20", "p-16", "m-16"]
          const hasStandardSpacing = standardSpacing.some((spacing) => line.includes(spacing))
          if (!hasStandardSpacing && (line.includes("margin") || line.includes("padding") || line.includes("gap"))) {
            violations.push({
              type: "quality-detail",
              severity: "low",
              message: "Abstände sollten pixelgenau und konsistent sein - prüfe visuell ob Abstände harmonisch sind",
              line: i + 1,
              suggestion: "Verwende Standard-Abstände (gap-5, p-4, etc.) und prüfe visuell ob sie harmonisch sind",
            })
          }
        }
        
        // Prüfe auf Farbabstimmungen
        if (line.includes("bg-") || line.includes("text-") || line.includes("border-")) {
          // Prüfe ob Design-Tokens verwendet werden (nicht hardcoded)
          if (line.includes("#") && !line.includes("//") && !line.includes("/*")) {
            violations.push({
              type: "quality-detail",
              severity: "high",
              message: "Farben sollten harmonisch und konsistent sein - verwende Design-Tokens statt hardcoded Farben",
              line: i + 1,
              suggestion: "Verwende Design-Tokens (bg-primary, text-primary, etc.) für harmonische Farbabstimmungen",
            })
          }
        }
      }
      
      // PARTNER-WEITERLEITUNG-PRÜFUNG
      if (routingRules && filePath.includes("partner") && (filePath.includes("forward") || filePath.includes("route"))) {
        // Prüfe ob alle notwendigen Daten weitergegeben werden
        const requiredData = ["bookingId", "customerName", "pickupAddress", "destinationAddress", "pickupTime"]
        const missingData = requiredData.filter((data) => !code.includes(data))
        if (missingData.length > 0) {
          violations.push({
            type: "partner-forwarding",
            severity: "critical",
            message: `Partner-Weiterleitung fehlt notwendige Daten: ${missingData.join(", ")}`,
            line: i + 1,
            suggestion: "Stelle sicher, dass alle notwendigen Buchungsdaten an Partner weitergegeben werden",
          })
        }
      }
      
      // FAHRER- UND FAHRZEUGAUSWAHL-PRÜFUNG
      if (filePath.includes("booking") || filePath.includes("fahrer") || filePath.includes("driver")) {
        // Prüfe ob Fahrer- und Fahrzeugauswahl korrekt implementiert ist
        if (line.includes("selectDriver") || line.includes("selectVehicle")) {
          if (!line.includes("available") && !line.includes("status") && !line.includes("active")) {
            violations.push({
              type: "driver-selection",
              severity: "high",
              message: "Fahrer- und Fahrzeugauswahl sollte nur verfügbare/aktive Fahrzeuge berücksichtigen",
              line: i + 1,
              suggestion: "Prüfe Fahrer- und Fahrzeugstatus vor Auswahl",
            })
          }
        }
      }
    }
    
    return {
      violations,
      passed: violations.length === 0,
    }
  }

  /**
   * Extrahiere Regeln aus Knowledge-Base-Content
   */
  private extractRulesFromContent(content: string, category: string): Array<{
    pattern: RegExp | string
    message: string
    severity: "critical" | "high" | "medium" | "low"
    suggestion: string
  }> {
    const rules: Array<{
      pattern: RegExp | string
      message: string
      severity: "critical" | "high" | "medium" | "low"
      suggestion: string
    }> = []
    
    // Extrahiere Regeln basierend auf Category
    if (category === "forbidden-terms") {
      const forbiddenTerms = ["kostenlos", "gratis", "free", "testen", "trial"]
      for (const term of forbiddenTerms) {
        rules.push({
          pattern: new RegExp(`\\b${term}\\b`, "i"),
          message: `Verbotener Begriff gefunden: "${term}"`,
          severity: "critical",
          suggestion: "Verwende erlaubte Alternativen",
        })
      }
    }
    
    if (category === "design-guidelines") {
      rules.push({
        pattern: /#([0-9a-fA-F]{3}){1,2}/,
        message: "Hardcoded Farbe gefunden. Verwende Design-Tokens.",
        severity: "high",
        suggestion: "Ersetze durch bg-primary, text-primary, etc.",
      })
    }
    
    return rules
  }

  /**
   * Prüfe Regel gegen Code
   */
  private checkRuleAgainstCode(
    rule: {
      pattern: RegExp | string
      message: string
      severity: "critical" | "high" | "medium" | "low"
      suggestion: string
    },
    code: string,
    lines: string[],
    filePath: string,
    category: string
  ): Array<{
    type: string
    severity: "critical" | "high" | "medium" | "low"
    message: string
    line?: number
    suggestion: string
  }> {
    const violations: any[] = []
    const pattern = typeof rule.pattern === "string" ? new RegExp(rule.pattern, "i") : rule.pattern
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (pattern.test(line) && !line.includes("//") && !line.includes("/*")) {
        violations.push({
          type: category,
          severity: rule.severity,
          message: rule.message,
          line: i + 1,
          suggestion: rule.suggestion,
        })
      }
    }
    
    return violations
  }

  /**
   * Dokumentiere gefundene Fehler persistent
   * INTEGRIERT FEHLER IN KNOWLEDGE-BASE
   */
  async documentViolation(violation: {
    type: string
    filePath: string
    line?: number
    message: string
    solution: string
    severity?: "critical" | "high" | "medium" | "low"
  }) {
    // Speichere persistent in Error-Log
    try {
      await logError({
        type: "violation",
        severity: violation.severity || "medium",
        category: violation.type,
        message: violation.message,
        filePath: violation.filePath,
        line: violation.line,
        solution: violation.solution,
        botId: "quality-bot",
      })
      
      // INTEGRIERE FEHLER IN KNOWLEDGE-BASE
      await this.integrateErrorIntoKnowledgeBase(violation)
    } catch (error) {
      console.error("Fehler beim Loggen der Violation:", error)
      // Fallback: Console-Log
      console.log("Violation documented:", violation)
    }
  }

  /**
   * Integriere Fehler in Knowledge-Base für zukünftige Prävention
   */
  private async integrateErrorIntoKnowledgeBase(violation: {
    type: string
    filePath: string
    line?: number
    message: string
    solution: string
    severity?: "critical" | "high" | "medium" | "low"
  }) {
    try {
      const { promises: fs } = await import("fs")
      const path = await import("path")
      
      const knowledgeBaseDir = path.join(process.cwd(), ".cicd", "knowledge-base-errors")
      await fs.mkdir(knowledgeBaseDir, { recursive: true })
      
      const errorFile = path.join(knowledgeBaseDir, `${violation.type}-errors.json`)
      
      let errors: any[] = []
      try {
        const content = await fs.readFile(errorFile, "utf-8")
        errors = JSON.parse(content)
      } catch {
        errors = []
      }
      
      errors.push({
        id: `error-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
        type: violation.type,
        severity: violation.severity || "medium",
        message: violation.message,
        filePath: violation.filePath,
        line: violation.line,
        solution: violation.solution,
      })
      
      // Behalte nur die letzten 100 Einträge pro Typ
      if (errors.length > 100) {
        errors = errors.slice(-100)
      }
      
      await fs.writeFile(errorFile, JSON.stringify(errors, null, 2), "utf-8")
    } catch (error) {
      console.warn("Fehler beim Integrieren in Knowledge-Base:", error)
      // Nicht kritisch - Fehler wird trotzdem geloggt
    }
  }

  /**
   * Prüfe gegen Arbeitsabschluss-Dokumentation
   */
  async verifyAgainstCompletionDocs(
    code: string,
    completionDocs: any,
    filePath: string
  ): Promise<BotResponse> {
    // 1. Lade Knowledge-Base
    await this.loadKnowledgeBase()
    
    // 2. Prüfe Code gegen Dokumentation
    const check = await this.checkCodeAgainstDocumentation(code, completionDocs, filePath)
    
    // 3. Dokumentiere Verstöße
    for (const violation of check.violations) {
      await this.documentViolation({
        type: violation.type,
        filePath,
        line: violation.line,
        message: violation.message,
        solution: violation.suggestion,
      })
    }
    
    return {
      success: check.passed,
      warnings: check.violations.filter((v) => v.severity === "medium" || v.severity === "low").map((v) => v.message),
      errors: check.violations.filter((v) => v.severity === "critical" || v.severity === "high").map((v) => v.message),
    }
  }
}

