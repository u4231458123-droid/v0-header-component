/**
 * Knowledge-Base Loader mit CI/CD-Entries
 * =======================================
 * Lädt die Knowledge-Base und fügt CI/CD-Entries dynamisch hinzu
 */

import { INITIAL_KNOWLEDGE_BASE, type KnowledgeBase, type KnowledgeEntry, type KnowledgeCategory } from "./structure"
import {
  CICD_RULES,
  CICD_VALIDATION_RULES,
  CICD_ERROR_HANDLING,
  CICD_MYDISPATCH_SPECIFIC,
} from "./cicd-entries"
import {
  UI_CONSISTENCY_RULES,
  TEXT_QUALITY_RULES,
  MYDISPATCH_CONCEPT,
  SEO_OPTIMIZATION_RULES,
} from "./ui-consistency-entries"
import {
  SYSTEMWIDE_THINKING_RULE,
  BOT_WORKFLOW_STRUCTURE,
  EMERGENCY_AND_SPECIAL_CASES,
} from "./systemwide-thinking-entries"
import {
  MYDISPATCH_CORE_VALUES,
  QUALITY_ASSURANCE_RULES,
  HONESTY_AND_TRANSPARENCY,
} from "./mydispatch-core-values"
import {
  UI_CONSISTENCY_DETAILED,
  VISUAL_LOGICAL_VALIDATION,
  QUALITY_THINKING_DETAILED,
} from "./ui-consistency-detailed"
import {
  AUTOMATED_QUALITY_MONITORING,
  INTELLIGENT_ERROR_PREVENTION,
  CONTINUOUS_KNOWLEDGE_IMPROVEMENT,
  PROACTIVE_PERFORMANCE_OPTIMIZATION,
  INTELLIGENT_USER_EXPERIENCE_OPTIMIZATION,
  SYSTEMWIDE_CONSISTENCY_ENFORCEMENT,
} from "./mydispatch-optimizations"
import {
  AGENT_RESPONSIBILITY_CORE,
  MASTER_BOT_OVERSIGHT,
} from "./agent-responsibility"
import {
  SELF_REFLECTION_MANDATORY,
} from "./self-reflection"
import {
  BOT_COMMUNICATION_MANDATORY,
} from "./bot-communication"
import {
  SYSTEM_BOT_INSTRUCTIONS,
} from "./bot-instructions/system-bot-instructions"
import {
  QUALITY_BOT_INSTRUCTIONS,
} from "./bot-instructions/quality-bot-instructions"
import {
  MASTER_BOT_INSTRUCTIONS,
} from "./bot-instructions/master-bot-instructions"

/**
 * Lade vollständige Knowledge-Base inkl. CI/CD-Entries
 */
export function loadFullKnowledgeBase(): KnowledgeBase {
  const base = INITIAL_KNOWLEDGE_BASE

  // Füge CI/CD-Entries hinzu
  const cicdEntries: KnowledgeEntry[] = [
    CICD_RULES,
    CICD_VALIDATION_RULES,
    CICD_ERROR_HANDLING,
    CICD_MYDISPATCH_SPECIFIC,
    UI_CONSISTENCY_RULES,
    TEXT_QUALITY_RULES,
    MYDISPATCH_CONCEPT,
    SEO_OPTIMIZATION_RULES,
    SYSTEMWIDE_THINKING_RULE,
    BOT_WORKFLOW_STRUCTURE,
    EMERGENCY_AND_SPECIAL_CASES,
    SYSTEM_BOT_INSTRUCTIONS,
    QUALITY_BOT_INSTRUCTIONS,
    MASTER_BOT_INSTRUCTIONS,
    MYDISPATCH_CORE_VALUES,
    QUALITY_ASSURANCE_RULES,
    HONESTY_AND_TRANSPARENCY,
    UI_CONSISTENCY_DETAILED,
    VISUAL_LOGICAL_VALIDATION,
    QUALITY_THINKING_DETAILED,
    AUTOMATED_QUALITY_MONITORING,
    INTELLIGENT_ERROR_PREVENTION,
    CONTINUOUS_KNOWLEDGE_IMPROVEMENT,
    PROACTIVE_PERFORMANCE_OPTIMIZATION,
    INTELLIGENT_USER_EXPERIENCE_OPTIMIZATION,
    SYSTEMWIDE_CONSISTENCY_ENFORCEMENT,
    AGENT_RESPONSIBILITY_CORE,
    MASTER_BOT_OVERSIGHT,
    SELF_REFLECTION_MANDATORY,
    BOT_COMMUNICATION_MANDATORY,
  ]

  // Aktualisiere Table of Contents
  const updatedTableOfContents = {
    ...base.tableOfContents,
    categories: {
      ...base.tableOfContents.categories,
      "ci-cd": {
        title: "CI/CD",
        description: "CI/CD Pipeline und Automatisierung",
        entries: [
          "cicd-rules-001",
          "cicd-validation-001",
          "cicd-mydispatch-001",
        ],
      },
      "ui-consistency": {
        title: "UI-Konsistenz",
        description: "Systemweite UI-Library-Elemente und Konsistenz",
        entries: [
          "ui-consistency-001",
          "ui-consistency-detailed-001",
          "text-quality-001",
          "mydispatch-concept-001",
          "seo-optimization-001",
          "visual-logical-validation-001",
          "quality-thinking-detailed-001",
        ],
      },
      "systemwide-thinking": {
        title: "Systemweites Denken",
        description: "Systemweites Denken und strukturierte Bot-Arbeitskonzepte",
        entries: [
          "systemwide-thinking-001",
          "bot-workflow-001",
          "emergency-special-cases-001",
        ],
      },
      "bot-instructions": {
        title: "Bot-Arbeitsanweisungen",
        description: "Detaillierte Arbeitsanweisungen für alle Bots",
        entries: [
          "system-bot-instructions-001",
          "quality-bot-instructions-001",
          "master-bot-instructions-001",
        ],
      },
      "mydispatch-core": {
        title: "MyDispatch Kernwerte",
        description: "Kernwerte, Qualitätsstandards und Ehrlichkeit",
        entries: [
          "mydispatch-core-values-001",
          "quality-assurance-001",
          "honesty-transparency-001",
        ],
      },
      "mydispatch-optimizations": {
        title: "MyDispatch Optimierungen",
        description: "Eigenständig entwickelte Lösungen zur Perfektionierung",
        entries: [
          "mydispatch-optimization-001",
          "mydispatch-optimization-002",
          "mydispatch-optimization-003",
          "mydispatch-optimization-004",
          "mydispatch-optimization-005",
          "mydispatch-optimization-006",
        ],
      },
      "agent-responsibility": {
        title: "Agent-Verantwortlichkeit",
        description: "Verantwortlichkeiten aller AI-Agenten für vollständige Vorgaben-Umsetzung",
        entries: [
          "agent-responsibility-001",
          "master-bot-oversight-001",
        ],
      },
      "self-reflection": {
        title: "Selbstreflexion",
        description: "Obligatorische Selbstreflexion für alle Bots und Assistenten",
        entries: [
          "self-reflection-001",
        ],
      },
      "bot-communication": {
        title: "Bot-Kommunikation",
        description: "Obligatorische Kommunikation bei Unsicherheit, keine Halluzinationen",
        entries: [
          "bot-communication-001",
        ],
      },
      "error-handling": {
        ...base.tableOfContents.categories["error-handling"],
        entries: [
          ...base.tableOfContents.categories["error-handling"].entries,
          "cicd-error-handling-001",
        ],
      },
    },
  }

  return {
    ...base,
    tableOfContents: updatedTableOfContents,
    entries: [...base.entries, ...cicdEntries],
  }
}

/**
 * Lade Knowledge-Entries für Task mit CI/CD-Entries
 */
export function loadKnowledgeForTaskWithCICD(
  taskType: string,
  categories: (string | KnowledgeCategory)[] = []
): KnowledgeEntry[] {
  const fullBase = loadFullKnowledgeBase()
  const allEntries = fullBase.entries
  const criticalEntries = allEntries.filter((e) => e.priority === "critical")

  const categoryEntries =
    categories.length > 0
      ? allEntries.filter((e) => categories.includes(e.category))
      : []

  // Kombiniere kritische Einträge mit kategorie-spezifischen
  const relevantEntries = [...new Set([...criticalEntries, ...categoryEntries])]

  // Sortiere nach Priorität
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  relevantEntries.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return relevantEntries
}

