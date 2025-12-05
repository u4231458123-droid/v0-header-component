#!/usr/bin/env node

/**
 * CPO Agent: Automatische Behebung von falschen Rundungen
 * Ersetzt rounded-lg/rounded-md → rounded-xl/rounded-2xl gemäß Design System
 */

import { readFileSync, writeFileSync } from "fs"
import { glob } from "glob"
import { join } from "path"

const ROUNDING_MAPPINGS = {
  // Buttons, Inputs, Container → rounded-xl
  "rounded-lg": "rounded-xl",
  "rounded-md": "rounded-xl",
  
  // Cards → rounded-2xl
  // Note: Diese müssen kontextabhängig sein, daher vorsichtig
}

// Kontextabhängige Ersetzungen für Cards
const CARD_ROUNDING = "rounded-2xl"

function fixRoundings(content) {
  let fixed = content
  
  // Ersetze rounded-lg und rounded-md durch rounded-xl
  // Aber nicht in Card-Komponenten (dort sollte rounded-2xl verwendet werden)
  const lines = content.split('\n')
  const fixedLines = lines.map(line => {
    // Prüfe ob es eine Card-Komponente ist
    const isCard = /<Card|CardContent|CardHeader|CardTitle|CardDescription/.test(line)
    
    if (isCard && line.includes('rounded-lg')) {
      return line.replace(/rounded-lg/g, CARD_ROUNDING)
    } else if (isCard && line.includes('rounded-md')) {
      return line.replace(/rounded-md/g, CARD_ROUNDING)
    } else {
      // Normale Ersetzung für Buttons, Inputs, etc.
      return line
        .replace(/\brounded-lg\b/g, 'rounded-xl')
        .replace(/\brounded-md\b/g, 'rounded-xl')
    }
  })
  
  fixed = fixedLines.join('\n')
  
  return fixed
}

async function main() {
  const workspaceRoot = process.cwd()
  
  // Finde alle TypeScript/TSX Dateien
  const files = await glob([
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ], {
    cwd: workspaceRoot,
    ignore: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
    ],
  })
  
  let totalFixed = 0
  let filesModified = 0
  
  for (const file of files) {
    const filePath = join(workspaceRoot, file)
    
    try {
      const content = readFileSync(filePath, "utf-8")
      const fixed = fixRoundings(content)
      
      if (content !== fixed) {
        writeFileSync(filePath, fixed, "utf-8")
        const changes = (fixed.match(/rounded-xl|rounded-2xl/g) || []).length - (content.match(/rounded-xl|rounded-2xl/g) || []).length
        if (changes > 0) {
          totalFixed += changes
          filesModified++
          console.log(`✅ ${file} - ${changes} Rundungen behoben`)
        }
      }
    } catch (error) {
      console.error(`❌ Fehler bei ${file}:`, error.message)
    }
  }
  
  console.log(`\n📊 Zusammenfassung:`)
  console.log(`   - ${filesModified} Dateien bearbeitet`)
  console.log(`   - ${totalFixed} Rundungen behoben`)
}

main().catch(console.error)
