#!/usr/bin/env node

/**
 * CI/CD Script für automatische Dokumentation
 * ============================================
 * Wird bei jedem Commit ausgeführt und erstellt/aktualisiert
 * automatisch Dokumentationen basierend auf Code-Änderungen
 */

import { execSync } from "child_process"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

const PROJECT_ROOT = process.cwd()
const DOCS_DIR = join(PROJECT_ROOT, "docs")
const WIKI_DIR = join(PROJECT_ROOT, "wiki")

/**
 * Analysiert Git-Commits und erstellt Dokumentationen
 */
class AutoDocumentation {
  constructor() {
    this.changes = []
    this.documentations = []
  }

  /**
   * Hauptfunktion
   */
  async run() {
    console.log("📝 Auto-Documentation Engine gestartet...\n")

    try {
      // 1. Analysiere Git-Änderungen
      const changes = this.analyzeGitChanges()
      if (changes.length === 0) {
        console.log("✅ Keine Änderungen gefunden, keine Dokumentation erforderlich")
        return
      }

      console.log(`📊 ${changes.length} Änderungen gefunden\n`)

      // 2. Kategorisiere Änderungen
      const categorized = this.categorizeChanges(changes)
      console.log("📋 Kategorisierung:")
      console.log(`  - Features: ${categorized.features.length}`)
      console.log(`  - Fixes: ${categorized.fixes.length}`)
      console.log(`  - Refactorings: ${categorized.refactorings.length}`)
      console.log(`  - Dokumentationen: ${categorized.docs.length}\n`)

      // 3. Erstelle Dokumentationen
      await this.createDocumentations(categorized)

      // 4. Aktualisiere Changelog
      await this.updateChangelog(categorized)

      console.log("\n✅ Auto-Documentation abgeschlossen")
    } catch (error) {
      console.error("❌ Fehler bei Auto-Documentation:", error)
      process.exit(1)
    }
  }

  /**
   * Analysiert Git-Änderungen
   */
  analyzeGitChanges() {
    try {
      // Hole geänderte Dateien seit letztem Commit
      const changedFiles = execSync("git diff --name-only HEAD~1 HEAD", {
        encoding: "utf-8",
      })
        .trim()
        .split("\n")
        .filter((f) => f.length > 0)

      // Hole Commit-Nachrichten
      const commitMessages = execSync('git log --pretty=format:"%s" HEAD~1..HEAD', {
        encoding: "utf-8",
      })
        .trim()
        .split("\n")
        .filter((m) => m.length > 0)

      return {
        files: changedFiles,
        commits: commitMessages,
      }
    } catch (error) {
      // Wenn kein vorheriger Commit existiert, verwende alle Dateien
      console.warn("⚠️  Kein vorheriger Commit gefunden, verwende alle Dateien")
      return {
        files: [],
        commits: [],
      }
    }
  }

  /**
   * Kategorisiert Änderungen
   */
  categorizeChanges(changes) {
    const categorized = {
      features: [],
      fixes: [],
      refactorings: [],
      docs: [],
    }

    changes.files.forEach((file) => {
      if (file.includes("components/") || file.includes("app/")) {
        if (file.includes("Dialog") || file.includes("Dialog")) {
          categorized.features.push({
            file,
            type: "feature",
            description: `Neue Komponente: ${file}`,
          })
        } else {
          categorized.refactorings.push({
            file,
            type: "refactoring",
            description: `Code-Änderung: ${file}`,
          })
        }
      } else if (file.includes("scripts/") && file.endsWith(".sql")) {
        categorized.features.push({
          file,
          type: "migration",
          description: `SQL-Migration: ${file}`,
        })
      } else if (file.includes("lib/utils/") || file.includes("lib/ai/")) {
        categorized.features.push({
          file,
          type: "utility",
          description: `Neue Utility: ${file}`,
        })
      } else if (file.includes("wiki/") || file.includes("docs/")) {
        categorized.docs.push({
          file,
          type: "documentation",
          description: `Dokumentation aktualisiert: ${file}`,
        })
      }
    })

    // Analysiere Commit-Nachrichten
    changes.commits.forEach((commit) => {
      const lower = commit.toLowerCase()
      if (lower.includes("fix") || lower.includes("bug")) {
        categorized.fixes.push({
          commit,
          type: "fix",
          description: commit,
        })
      } else if (lower.includes("feat") || lower.includes("add")) {
        categorized.features.push({
          commit,
          type: "feature",
          description: commit,
        })
      } else if (lower.includes("refactor")) {
        categorized.refactorings.push({
          commit,
          type: "refactoring",
          description: commit,
        })
      }
    })

    return categorized
  }

  /**
   * Erstellt Dokumentationen
   */
  async createDocumentations(categorized) {
    const timestamp = new Date().toISOString().split("T")[0]

    // Erstelle Feature-Dokumentationen
    if (categorized.features.length > 0) {
      const featureDoc = {
        title: `Neue Features - ${timestamp}`,
        content: this.generateFeatureDocumentation(categorized.features),
        category: "feature-documentation",
      }
      this.documentations.push(featureDoc)
    }

    // Erstelle Fix-Dokumentationen
    if (categorized.fixes.length > 0) {
      const fixDoc = {
        title: `Bugfixes - ${timestamp}`,
        content: this.generateFixDocumentation(categorized.fixes),
        category: "error-documentation",
      }
      this.documentations.push(fixDoc)
    }
  }

  /**
   * Generiert Feature-Dokumentation
   */
  generateFeatureDocumentation(features) {
    let content = `## Neue Features\n\n`
    content += `**Datum:** ${new Date().toISOString().split("T")[0]}\n\n`

    features.forEach((feature) => {
      content += `### ${feature.description}\n\n`
      if (feature.file) {
        content += `- **Datei:** \`${feature.file}\`\n`
      }
      if (feature.commit) {
        content += `- **Commit:** ${feature.commit}\n`
      }
      content += `\n`
    })

    return content
  }

  /**
   * Generiert Fix-Dokumentation
   */
  generateFixDocumentation(fixes) {
    let content = `## Bugfixes\n\n`
    content += `**Datum:** ${new Date().toISOString().split("T")[0]}\n\n`

    fixes.forEach((fix) => {
      content += `### ${fix.description}\n\n`
      if (fix.file) {
        content += `- **Datei:** \`${fix.file}\`\n`
      }
      if (fix.commit) {
        content += `- **Commit:** ${fix.commit}\n`
      }
      content += `\n`
    })

    return content
  }

  /**
   * Aktualisiert Changelog
   */
  async updateChangelog(categorized) {
    const changelogPath = join(WIKI_DIR, "changelog", "changelog.md")

    if (!existsSync(changelogPath)) {
      console.warn("⚠️  Changelog nicht gefunden, überspringe Update")
      return
    }

    const changelog = readFileSync(changelogPath, "utf-8")
    const today = new Date().toISOString().split("T")[0]

    // Prüfe ob bereits ein Eintrag für heute existiert
    if (changelog.includes(`## [2.4.0] - ${today}`)) {
      console.log("ℹ️  Changelog für heute bereits vorhanden")
      return
    }

    // Erstelle neuen Changelog-Eintrag
    let newEntry = `## [2.4.0] - ${today}\n\n`

    if (categorized.features.length > 0) {
      newEntry += `### Added\n`
      categorized.features.forEach((feature) => {
        newEntry += `- ${feature.description}\n`
      })
      newEntry += `\n`
    }

    if (categorized.fixes.length > 0) {
      newEntry += `### Fixed\n`
      categorized.fixes.forEach((fix) => {
        newEntry += `- ${fix.description}\n`
      })
      newEntry += `\n`
    }

    if (categorized.refactorings.length > 0) {
      newEntry += `### Changed\n`
      categorized.refactorings.forEach((ref) => {
        newEntry += `- ${ref.description}\n`
      })
      newEntry += `\n`
    }

    // Füge neuen Eintrag am Anfang des Changelogs hinzu
    const updatedChangelog = changelog.replace(
      /^# Changelog\n\n/,
      `# Changelog\n\n${newEntry}---\n\n`
    )

    writeFileSync(changelogPath, updatedChangelog, "utf-8")
    console.log("✅ Changelog aktualisiert")
  }
}

// Führe Script aus
if (import.meta.url === `file://${process.argv[1]}`) {
  const autoDoc = new AutoDocumentation()
  autoDoc.run().catch((error) => {
    console.error("❌ Fehler:", error)
    process.exit(1)
  })
}

export { AutoDocumentation }

