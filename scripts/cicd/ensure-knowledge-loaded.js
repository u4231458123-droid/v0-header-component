/**
 * Sicherstellt, dass Knowledge-Base geladen ist
 * ===============================================
 * Wird vor jedem Bot-Aufruf verwendet
 */

const { loadFullKnowledgeBase, loadKnowledgeForTaskWithCICD } = require("../../lib/knowledge-base/load-with-cicd")

/**
 * Lade Knowledge-Base und gebe Status zurück
 */
function ensureKnowledgeLoaded() {
  try {
    const fullBase = loadFullKnowledgeBase()
    const criticalEntries = fullBase.entries.filter((e) => e.priority === "critical")
    
    console.log(`✅ Knowledge-Base geladen:`)
    console.log(`   - Gesamt: ${fullBase.entries.length} Einträge`)
    console.log(`   - Kritisch: ${criticalEntries.length} Einträge`)
    console.log(`   - Kategorien: ${Object.keys(fullBase.tableOfContents.categories).length}`)
    
    return {
      success: true,
      entries: fullBase.entries.length,
      critical: criticalEntries.length,
      categories: Object.keys(fullBase.tableOfContents.categories).length,
    }
  } catch (error) {
    console.error("❌ Fehler beim Laden der Knowledge-Base:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Lade Knowledge für spezifische Kategorien
 */
function loadKnowledgeForCategories(categories = []) {
  try {
    const entries = loadKnowledgeForTaskWithCICD("general", categories)
    console.log(`✅ Knowledge für Kategorien geladen: ${entries.length} Einträge`)
    return {
      success: true,
      entries: entries.length,
      categories,
    }
  } catch (error) {
    console.error("❌ Fehler beim Laden der Knowledge:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// CLI-Interface
if (require.main === module) {
  const categories = process.argv.slice(2)
  
  if (categories.length > 0) {
    const result = loadKnowledgeForCategories(categories)
    console.log(JSON.stringify(result, null, 2))
    process.exit(result.success ? 0 : 1)
  } else {
    const result = ensureKnowledgeLoaded()
    console.log(JSON.stringify(result, null, 2))
    process.exit(result.success ? 0 : 1)
  }
}

module.exports = {
  ensureKnowledgeLoaded,
  loadKnowledgeForCategories,
}

