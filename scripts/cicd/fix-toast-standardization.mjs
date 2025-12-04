#!/usr/bin/env node

/**
 * Toast-Standardisierung Script
 * ==============================
 * Fügt description und duration zu allen Toast-Nachrichten hinzu
 */

import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'
import { join } from 'path'

const TOAST_PATTERNS = {
  success: {
    pattern: /toast\.success\(["']([^"']+)["']\)\s*$/gm,
    replacement: (match, message) => {
      // Bestimme description basierend auf Nachricht
      const descriptions = {
        'erfolgreich aktualisiert': 'Die Änderungen wurden gespeichert und sind sofort sichtbar.',
        'erfolgreich erstellt': 'Der Eintrag wurde erfolgreich angelegt.',
        'erfolgreich gelöscht': 'Der Eintrag wurde aus dem System entfernt.',
        'erfolgreich gespeichert': 'Die Änderungen wurden gespeichert.',
        'erfolgreich angelegt': 'Der Eintrag wurde in Ihr System aufgenommen.',
        'erfolgreich hinzugefuegt': 'Der Eintrag wurde hinzugefügt.',
        'erfolgreich geändert': 'Die Änderungen wurden gespeichert.',
        'erfolgreich hochgeladen': 'Die Datei wurde erfolgreich hochgeladen.',
        'erfolgreich entfernt': 'Der Eintrag wurde entfernt.',
        'erfolgreich gesendet': 'Die Nachricht wurde erfolgreich gesendet.',
        'erfolgreich kopiert': 'Der Inhalt wurde in die Zwischenablage kopiert.',
      }
      
      let description = 'Die Aktion wurde erfolgreich durchgeführt.'
      for (const [key, desc] of Object.entries(descriptions)) {
        if (message.toLowerCase().includes(key)) {
          description = desc
          break
        }
      }
      
      return `toast.success("${message}", {\n        description: "${description}",\n        duration: 4000,\n      })`
    },
  },
  error: {
    pattern: /toast\.error\(["']([^"']+)["']\)\s*$/gm,
    replacement: (match, message) => {
      // Bestimme description basierend auf Nachricht
      const descriptions = {
        'Fehler beim': 'Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        'Bitte': 'Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.',
        'Kein': 'Bitte überprüfen Sie die Einstellungen und versuchen Sie es erneut.',
      }
      
      let description = 'Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.'
      for (const [key, desc] of Object.entries(descriptions)) {
        if (message.includes(key)) {
          description = desc
          break
        }
      }
      
      return `toast.error("${message}", {\n        description: "${description}",\n        duration: 5000,\n      })`
    },
  },
}

async function fixToastStandardization() {
  const files = await glob('{components,app}/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/.next/**'],
  })
  
  let totalFixed = 0
  const results = []
  
  for (const file of files) {
    try {
      let content = readFileSync(file, 'utf-8')
      let fileFixed = 0
      const originalContent = content
      
      // Fix Success Toasts
      content = content.replace(TOAST_PATTERNS.success.pattern, (match, message) => {
        fileFixed++
        return TOAST_PATTERNS.success.replacement(match, message)
      })
      
      // Fix Error Toasts
      content = content.replace(TOAST_PATTERNS.error.pattern, (match, message) => {
        fileFixed++
        return TOAST_PATTERNS.error.replacement(match, message)
      })
      
      if (fileFixed > 0) {
        writeFileSync(file, content, 'utf-8')
        totalFixed += fileFixed
        results.push({ file, fixed: fileFixed })
        console.log(`✅ ${file}: ${fileFixed} Toast(s) standardisiert`)
      }
    } catch (error) {
      console.error(`❌ Fehler bei ${file}:`, error.message)
    }
  }
  
  console.log(`\n📊 Zusammenfassung:`)
  console.log(`- ${results.length} Dateien bearbeitet`)
  console.log(`- ${totalFixed} Toast(s) standardisiert`)
  
  return { totalFixed, results }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fixToastStandardization().catch(console.error)
}

export { fixToastStandardization }
