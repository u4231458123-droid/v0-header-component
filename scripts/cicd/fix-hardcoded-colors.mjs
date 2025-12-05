#!/usr/bin/env node

/**
 * CPO Agent: Automatische Behebung von hardcoded Farben
 * Ersetzt alle hardcoded Tailwind-Farben durch Design-Tokens
 */

import { readFileSync, writeFileSync } from "fs"
import { glob } from "glob"
import { join } from "path"

const COLOR_MAPPINGS = {
  // Background colors
  "bg-white": "bg-card",
  "bg-slate-50": "bg-background",
  "bg-slate-100": "bg-muted",
  "bg-slate-200": "bg-border",
  "bg-slate-900": "bg-primary",
  "bg-gray-50": "bg-background",
  "bg-gray-100": "bg-muted",
  "bg-gray-200": "bg-border",
  "bg-gray-900": "bg-primary",
  
  // Text colors
  "text-white": "text-primary-foreground",
  "text-slate-400": "text-muted-foreground",
  "text-slate-500": "text-muted-foreground",
  "text-slate-600": "text-foreground",
  "text-slate-900": "text-foreground",
  "text-gray-400": "text-muted-foreground",
  "text-gray-500": "text-muted-foreground",
  "text-gray-600": "text-foreground",
  "text-gray-900": "text-foreground",
  
  // Status colors - Success
  "bg-green-500": "bg-success",
  "bg-green-600": "bg-success",
  "bg-green-700": "bg-success",
  "text-green-500": "text-success",
  "text-green-600": "text-success",
  "border-green-200": "border-success",
  "border-green-500": "border-success",
  "bg-green-50": "bg-success/10",
  "bg-green-500/20": "bg-success/20",
  "text-green-600": "text-success",
  "border-green-500/30": "border-success/30",
  
  // Status colors - Warning
  "bg-amber-500": "bg-warning",
  "bg-amber-600": "bg-warning",
  "bg-amber-700": "bg-warning",
  "text-amber-500": "text-warning",
  "text-amber-600": "text-warning",
  "border-amber-200": "border-warning",
  "border-amber-500": "border-warning",
  "bg-amber-50": "bg-warning/10",
  "bg-amber-500/20": "bg-warning/20",
  "text-amber-600": "text-warning",
  "border-amber-500/30": "border-warning/30",
  
  // Status colors - Destructive/Error
  "bg-red-500": "bg-destructive",
  "bg-red-600": "bg-destructive",
  "text-red-500": "text-destructive",
  "text-red-600": "text-destructive",
  "border-red-200": "border-destructive",
  "bg-red-50": "bg-destructive/10",
  "hover:bg-red-50": "hover:bg-destructive/10",
  
  // Status colors - Info
  "bg-blue-500": "bg-info",
  "bg-blue-600": "bg-info",
  "text-blue-500": "text-info",
  "text-blue-600": "text-info",
  "border-blue-200": "border-info",
  "bg-blue-50": "bg-info/10",
  "bg-blue-500/20": "bg-info/20",
  "text-blue-600": "text-info",
  "border-blue-500/30": "border-info/30",
  
  // Emerald (Success variant)
  "bg-emerald-500": "bg-success",
  "bg-emerald-600": "bg-success",
  "text-emerald-500": "text-success",
  "text-emerald-600": "text-success",
  
  // Orange (Warning variant)
  "bg-orange-500": "bg-warning",
  "bg-orange-600": "bg-warning",
  "text-orange-500": "text-warning",
  "text-orange-600": "text-warning",
  
  // Yellow (Warning variant)
  "bg-yellow-500": "bg-warning",
  "bg-yellow-600": "bg-warning",
  "text-yellow-500": "text-warning",
  "text-yellow-600": "text-warning",
}

// Spezielle Mappings für hover states
const HOVER_MAPPINGS = {
  "hover:bg-green-600": "hover:bg-success/90",
  "hover:bg-green-700": "hover:bg-success/90",
  "hover:bg-amber-600": "hover:bg-warning/90",
  "hover:bg-amber-700": "hover:bg-warning/90",
  "hover:bg-red-600": "hover:bg-destructive/90",
  "hover:bg-blue-600": "hover:bg-info/90",
  "hover:bg-emerald-600": "hover:bg-success/90",
  "hover:bg-emerald-700": "hover:bg-success/90",
  "hover:text-slate-600": "hover:text-foreground",
}

function fixHardcodedColors(content) {
  let fixed = content
  
  // Ersetze alle Mappings
  for (const [oldColor, newColor] of Object.entries(COLOR_MAPPINGS)) {
    // Erstelle Regex, das die Klasse als ganze Klasse matched (mit Leerzeichen oder am Anfang/Ende)
    const regex = new RegExp(`\\b${oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
    fixed = fixed.replace(regex, newColor)
  }
  
  // Ersetze Hover-Mappings
  for (const [oldHover, newHover] of Object.entries(HOVER_MAPPINGS)) {
    const regex = new RegExp(`\\b${oldHover.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
    fixed = fixed.replace(regex, newHover)
  }
  
  return fixed
}

async function main() {
  const workspaceRoot = process.cwd()
  
  // Finde alle TypeScript/TSX Dateien in app/ und components/
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
      const fixed = fixHardcodedColors(content)
      
      if (content !== fixed) {
        writeFileSync(filePath, fixed, "utf-8")
        const changes = (fixed.match(/bg-(success|warning|destructive|info|card|background|muted|border|primary)|text-(success|warning|destructive|info|foreground|muted-foreground|primary-foreground)/g) || []).length
        totalFixed += changes
        filesModified++
        console.log(`✅ ${file} - ${changes} Farben behoben`)
      }
    } catch (error) {
      console.error(`❌ Fehler bei ${file}:`, error.message)
    }
  }
  
  console.log(`\n📊 Zusammenfassung:`)
  console.log(`   - ${filesModified} Dateien bearbeitet`)
  console.log(`   - ${totalFixed} Farben behoben`)
}

main().catch(console.error)
