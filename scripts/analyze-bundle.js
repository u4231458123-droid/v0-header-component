/**
 * Bundle Size Analyzer
 * ====================
 * Analysiert Bundle-Größe und Code-Splitting
 */

const fs = require("fs")
const path = require("path")

/**
 * Analysiere Bundle-Größe
 */
function analyzeBundle(rootDir = process.cwd()) {
  const errors = []
  const warnings = []
  const info = []

  // Prüfe .next-Verzeichnis
  const nextDir = path.join(rootDir, ".next")
  if (!fs.existsSync(nextDir)) {
    warnings.push({
      severity: "medium",
      message: ".next Verzeichnis nicht gefunden. Führe 'pnpm build' aus.",
    })
    return {
      success: true,
      errors,
      warnings,
      info,
    }
  }

  // Prüfe static/chunks
  const chunksDir = path.join(nextDir, "static", "chunks")
  if (fs.existsSync(chunksDir)) {
    const chunks = fs.readdirSync(chunksDir)
    let totalSize = 0
    const largeChunks = []

    chunks.forEach((chunk) => {
      const chunkPath = path.join(chunksDir, chunk)
      const stats = fs.statSync(chunkPath)
      const sizeMB = stats.size / (1024 * 1024)
      totalSize += sizeMB

      if (sizeMB > 0.5) {
        largeChunks.push({
          file: chunk,
          size: `${sizeMB.toFixed(2)} MB`,
        })
      }
    })

    info.push({
      totalChunks: chunks.length,
      totalSize: `${totalSize.toFixed(2)} MB`,
      largeChunks,
    })

    if (totalSize > 2) {
      warnings.push({
        severity: "medium",
        message: `Bundle-Größe (${totalSize.toFixed(2)} MB) über 2MB. Code-Splitting sollte optimiert werden.`,
      })
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    info,
  }
}

// CLI-Interface
if (require.main === module) {
  const result = analyzeBundle()
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.success ? 0 : 1)
}

module.exports = {
  analyzeBundle,
}

