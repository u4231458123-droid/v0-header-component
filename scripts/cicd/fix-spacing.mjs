#!/usr/bin/env node

/**
 * CPO Agent: Automatische Behebung von falschem Spacing
 * Ersetzt gap-4/gap-6 → gap-5 gemäß Design System
 */

import { readFileSync, writeFileSync } from "fs"
import { glob } from "glob"
import { join } from "path"

function fixSpacing(content) {
  let fixed = content
  
  // Ersetze gap-4 und gap-6 durch gap-5
  // Aber nicht gap-2, gap-3, gap-8, etc. (nur 4 und 6)
  fixed = fixed.replace(/\bgap-4\b/g, 'gap-5')
  fixed = fixed.replace(/\bgap-6\b/g, 'gap-5')
  
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
      const fixed = fixSpacing(content)
      
      if (content !== fixed) {
        writeFileSync(filePath, fixed, "utf-8")
        const oldGaps = (content.match(/\bgap-[46]\b/g) || []).length
        const newGaps = (fixed.match(/\bgap-5\b/g) || []).length
        const changes = oldGaps
        if (changes > 0) {
          totalFixed += changes
          filesModified++
          console.log(`✅ ${file} - ${changes} Spacing behoben`)
        }
      }
    } catch (error) {
      console.error(`❌ Fehler bei ${file}:`, error.message)
    }
  }
  
  console.log(`\n📊 Zusammenfassung:`)
  console.log(`   - ${filesModified} Dateien bearbeitet`)
  console.log(`   - ${totalFixed} Spacing behoben`)
}

main().catch(console.error)
