/**
 * BOT-ARCHITEKTUR FÜR ALLE BEREICHE
 * ==================================
 * Vollständiges Konzept: Bot + Assistent + Prüfungsprozess
 */

export interface BotRole {
  id: string
  name: string
  area: string
  responsibility: string
  tasks: string[]
}

export interface AssistantRole {
  id: string
  name: string
  botId: string
  responsibility: string
  tasks: string[]
}

export interface BotArea {
  area: string
  bot: BotRole
  assistant: AssistantRole
  validationBots: string[]
  workflow: {
    planning: string
    execution: string
    validation: string
    documentation: string
  }
}

/**
 * Vollständige Bot-Architektur für MyDispatch
 */
export const MYDISPATCH_BOT_ARCHITECTURE: BotArea[] = [
  // DOKUMENTATION
  {
    area: "documentation",
    bot: {
      id: "documentation-bot",
      name: "Documentation-Bot",
      area: "documentation",
      responsibility: "Verwaltet gesamte Dokumentation, stellt sicher, dass alle Vorgaben eingehalten werden, trägt Verantwortung für Dokumentationsbereich",
      tasks: [
        "Dokumentationsplanung",
        "Qualitätssicherung",
        "Vorgaben-Durchsetzung",
        "Nachjustierung fehlermachender Bots",
        "Dokumentations-Review",
        "Abnahme und Freigabe",
      ],
    },
    assistant: {
      id: "documentation-assistant",
      name: "Documentation-Assistant",
      botId: "documentation-bot",
      responsibility: "Führt Dokumentationsaufgaben aus, nimmt Berichte entgegen, koordiniert Prüfungen",
      tasks: [
        "Dokumentation erstellen",
        "Berichte entgegennehmen",
        "Prüfungsaufträge weitergeben",
        "Prüfungsergebnisse sammeln",
        "Auswertung erstellen",
        "Nachjustierungsaufträge erstellen",
      ],
    },
    validationBots: ["quality-bot", "master-bot"],
    workflow: {
      planning: "Documentation-Bot plant Dokumentation",
      execution: "Documentation-Assistant führt aus",
      validation: "Quality-Bot prüft, Master-Bot validiert",
      documentation: "Sofortige Dokumentation mit Zeitstempel",
    },
  },

  // MARKETINGTEXTE
  {
    area: "marketing-texts",
    bot: {
      id: "marketing-text-bot",
      name: "Marketing-Text-Bot",
      area: "marketing-texts",
      responsibility: "Verwaltet Marketingtexte, stellt sicher, dass alle Vorgaben (SEO, MyDispatch-Konzept, Text-Qualität) eingehalten werden",
      tasks: [
        "Marketingtext-Planung",
        "Qualitätssicherung",
        "SEO-Optimierung",
        "MyDispatch-Konzept-Integration",
        "Text-Review",
        "Abnahme und Freigabe",
      ],
    },
    assistant: {
      id: "marketing-text-assistant",
      name: "Marketing-Text-Assistant",
      botId: "marketing-text-bot",
      responsibility: "Erstellt Marketingtexte, nimmt Berichte entgegen, koordiniert Prüfungen",
      tasks: [
        "Marketingtexte erstellen",
        "Berichte entgegennehmen",
        "Prüfungsaufträge weitergeben",
        "Prüfungsergebnisse sammeln",
        "Auswertung erstellen",
      ],
    },
    validationBots: ["quality-bot", "text-quality-bot"],
    workflow: {
      planning: "Marketing-Text-Bot plant Text",
      execution: "Marketing-Text-Assistant erstellt Text",
      validation: "Quality-Bot und Text-Quality-Bot prüfen",
      documentation: "Sofortige Dokumentation mit Zeitstempel",
    },
  },

  // MAILING-TEXTE
  {
    area: "mailing-texts",
    bot: {
      id: "mailing-text-bot",
      name: "Mailing-Text-Bot",
      area: "mailing-texts",
      responsibility: "Verwaltet Mailing-Texte, stellt sicher, dass alle Vorgaben (Branding, Professionalität, MyDispatch-Konzept) eingehalten werden",
      tasks: [
        "Mailing-Text-Planung",
        "Qualitätssicherung",
        "Branding-Integration",
        "Professionalität-Sicherstellung",
        "Text-Review",
        "Abnahme und Freigabe",
      ],
    },
    assistant: {
      id: "mailing-text-assistant",
      name: "Mailing-Text-Assistant",
      botId: "mailing-text-bot",
      responsibility: "Erstellt Mailing-Texte, nimmt Berichte entgegen, koordiniert Prüfungen",
      tasks: [
        "Mailing-Texte erstellen",
        "Berichte entgegennehmen",
        "Prüfungsaufträge weitergeben",
        "Prüfungsergebnisse sammeln",
        "Auswertung erstellen",
      ],
    },
    validationBots: ["quality-bot", "text-quality-bot"],
    workflow: {
      planning: "Mailing-Text-Bot plant Text",
      execution: "Mailing-Text-Assistant erstellt Text",
      validation: "Quality-Bot und Text-Quality-Bot prüfen",
      documentation: "Sofortige Dokumentation mit Zeitstempel",
    },
  },

  // RECHTSBEREICHE
  {
    area: "legal",
    bot: {
      id: "legal-bot",
      name: "Legal-Bot",
      area: "legal",
      responsibility: "Verwaltet Rechtsbereiche, stellt sicher, dass alle rechtlichen Vorgaben eingehalten werden",
      tasks: [
        "Rechtstext-Planung",
        "Rechtliche Prüfung",
        "Compliance-Sicherstellung",
        "Rechtstext-Review",
        "Abnahme und Freigabe",
      ],
    },
    assistant: {
      id: "legal-assistant",
      name: "Legal-Assistant",
      botId: "legal-bot",
      responsibility: "Erstellt Rechtstexte, nimmt Berichte entgegen, koordiniert Prüfungen",
      tasks: [
        "Rechtstexte erstellen",
        "Berichte entgegennehmen",
        "Prüfungsaufträge weitergeben",
        "Prüfungsergebnisse sammeln",
        "Auswertung erstellen",
      ],
    },
    validationBots: ["quality-bot", "master-bot"],
    workflow: {
      planning: "Legal-Bot plant Rechtstext",
      execution: "Legal-Assistant erstellt Text",
      validation: "Quality-Bot und Master-Bot prüfen",
      documentation: "Sofortige Dokumentation mit Zeitstempel",
    },
  },

  // CODE-ENTWICKLUNG
  {
    area: "code-development",
    bot: {
      id: "system-bot",
      name: "System-Bot",
      area: "code-development",
      responsibility: "Verwaltet Code-Entwicklung, stellt sicher, dass alle Vorgaben (Coding-Rules, Design-Guidelines, etc.) eingehalten werden",
      tasks: [
        "Code-Planung",
        "Code-Analyse",
        "Bug-Fixing",
        "Code-Optimierung",
        "Code-Review",
        "Abnahme und Freigabe",
      ],
    },
    assistant: {
      id: "code-assistant",
      name: "Code-Assistant",
      botId: "system-bot",
      responsibility: "Führt Code-Änderungen aus, nimmt Berichte entgegen, koordiniert Prüfungen",
      tasks: [
        "Code-Änderungen ausführen",
        "Berichte entgegennehmen",
        "Prüfungsaufträge weitergeben",
        "Prüfungsergebnisse sammeln",
        "Auswertung erstellen",
      ],
    },
    validationBots: ["quality-bot"],
    workflow: {
      planning: "System-Bot plant Code-Änderung",
      execution: "Code-Assistant führt aus",
      validation: "Quality-Bot prüft Code",
      documentation: "Sofortige Dokumentation mit Zeitstempel",
    },
  },

  // QUALITÄTSSICHERUNG
  {
    area: "quality-assurance",
    bot: {
      id: "quality-bot",
      name: "Quality-Bot",
      area: "quality-assurance",
      responsibility: "Verwaltet Qualitätssicherung, stellt sicher, dass alle Qualitätsvorgaben eingehalten werden",
      tasks: [
        "Qualitätsprüfung",
        "Validierung",
        "Verstoß-Erkennung",
        "Qualitäts-Review",
        "Abnahme und Freigabe",
      ],
    },
    assistant: {
      id: "quality-assistant",
      name: "Quality-Assistant",
      botId: "quality-bot",
      responsibility: "Führt Qualitätsprüfungen aus, nimmt Berichte entgegen, koordiniert Prüfungen",
      tasks: [
        "Qualitätsprüfungen ausführen",
        "Berichte entgegennehmen",
        "Prüfungsaufträge weitergeben",
        "Prüfungsergebnisse sammeln",
        "Auswertung erstellen",
      ],
    },
    validationBots: ["master-bot"],
    workflow: {
      planning: "Quality-Bot plant Prüfung",
      execution: "Quality-Assistant führt Prüfung aus",
      validation: "Master-Bot validiert Prüfung",
      documentation: "Sofortige Dokumentation mit Zeitstempel",
    },
  },

  // TEXT-QUALITÄT
  {
    area: "text-quality",
    bot: {
      id: "text-quality-bot",
      name: "Text-Quality-Bot",
      area: "text-quality",
      responsibility: "Verwaltet Text-Qualität, stellt sicher, dass alle Text-Vorgaben (SEO, Nutzerfreundlichkeit, MyDispatch-Konzept) eingehalten werden",
      tasks: [
        "Text-Qualitäts-Planung",
        "Text-Prüfung",
        "SEO-Optimierung",
        "Text-Review",
        "Abnahme und Freigabe",
      ],
    },
    assistant: {
      id: "text-quality-assistant",
      name: "Text-Quality-Assistant",
      botId: "text-quality-bot",
      responsibility: "Prüft Texte, nimmt Berichte entgegen, koordiniert Prüfungen",
      tasks: [
        "Texte prüfen",
        "Berichte entgegennehmen",
        "Prüfungsaufträge weitergeben",
        "Prüfungsergebnisse sammeln",
        "Auswertung erstellen",
      ],
    },
    validationBots: ["quality-bot"],
    workflow: {
      planning: "Text-Quality-Bot plant Prüfung",
      execution: "Text-Quality-Assistant prüft Text",
      validation: "Quality-Bot validiert Prüfung",
      documentation: "Sofortige Dokumentation mit Zeitstempel",
    },
  },
]

/**
 * Finde Bot-Architektur für Bereich
 */
export function getBotArchitectureForArea(area: string): BotArea | undefined {
  return MYDISPATCH_BOT_ARCHITECTURE.find((arch) => arch.area === area)
}

/**
 * Finde alle Bots für Bereich
 */
export function getBotsForArea(area: string): { bot: BotRole; assistant: AssistantRole } | undefined {
  const architecture = getBotArchitectureForArea(area)
  if (!architecture) return undefined
  return {
    bot: architecture.bot,
    assistant: architecture.assistant,
  }
}

