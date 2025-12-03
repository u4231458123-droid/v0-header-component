#!/usr/bin/env node
/**
 * AUTOMATISCHE MARKIERUNG: Pflichtfelder (Sternchen)
 * ==================================================
 * Fügt automatisch Sternchen (*) zu Pflichtfeldern in Forms hinzu
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join, extname, relative } from "path"

const REQUIRED_FIELD_PATTERNS = [
  /name=["'](email|password|first_name|last_name|company_name|address|city|postal_code|phone|pickup_address|dropoff_address|pickup_time)["']/gi,
  /name=["'](customer_id|driver_id|vehicle_id|booking_id|invoice_number|quote_number)["']/gi,
]

const REQUIRED_FIELDS = [
  "email",
  "password",
  "first_name",
  "last_name",
  "company_name",
  "address",
  "city",
  "postal_code",
  "phone",
  "pickup_address",
  "dropoff_address",
  "pickup_time",
  "customer_id",
  "driver_id",
  "vehicle_id",
]

class RequiredFieldsMarker {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir
    this.fixedFiles = []
    this.errors = []
  }

  scanFiles(dir = this.rootDir, fileList = []) {
    const files = readdirSync(dir)

    for (const file of files) {
      const filePath = join(dir, file)
      const stat = statSync(filePath)

      if (stat.isDirectory()) {
        if (
          !file.startsWith(".") &&
          file !== "node_modules" &&
          file !== ".next" &&
          file !== "dist" &&
          file !== "build"
        ) {
          this.scanFiles(filePath, fileList)
        }
      } else if (stat.isFile()) {
        const ext = extname(file)
        if ([".tsx", ".ts", ".jsx", ".js"].includes(ext)) {
          if (
            !filePath.includes("node_modules") &&
            !filePath.includes(".next") &&
            !filePath.includes("dist")
          ) {
            fileList.push(filePath)
          }
        }
      }
    }

    return fileList
  }

  isRequiredField(fieldName) {
    return REQUIRED_FIELDS.some((req) => fieldName.toLowerCase().includes(req.toLowerCase()))
  }

  fixFile(filePath) {
    try {
      let content = readFileSync(filePath, "utf-8")
      let modified = false
      const lines = content.split("\n")

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i]

        // Skip if already has asterisk or required marker
        if (line.includes("*") || line.includes("required") || line.includes("Pflichtfeld")) {
          continue
        }

        // Check for Label with Input/Select
        const labelMatch = line.match(/<Label[^>]*>(.*?)<\/Label>/i)
        if (labelMatch) {
          const labelText = labelMatch[1]
          const nextLine = i + 1 < lines.length ? lines[i + 1] : ""
          const nextNextLine = i + 2 < lines.length ? lines[i + 2] : ""

          // Check if next lines contain Input/Select with required field name
          const combinedLines = `${nextLine} ${nextNextLine}`
          const nameMatch = combinedLines.match(/name=["']([^"']+)["']/i)

          if (nameMatch && this.isRequiredField(nameMatch[1])) {
            // Add asterisk if not present
            if (!labelText.includes("*") && !labelText.includes("required")) {
              const newLabel = line.replace(
                /(<Label[^>]*>)(.*?)(<\/Label>)/i,
                `$1$2 <span className="text-destructive">*</span>$3`,
              )
              lines[i] = newLabel
              modified = true
            }
          }
        }

        // Check for Input/Select with required attribute but no visual marker
        if (line.includes('required') || line.includes('required={true}')) {
          // Find preceding Label
          for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
            const prevLine = lines[j]
            if (prevLine.includes("<Label")) {
              if (!prevLine.includes("*") && !prevLine.includes("required")) {
                const newLabel = prevLine.replace(
                  /(<Label[^>]*>)(.*?)(<\/Label>)/i,
                  `$1$2 <span className="text-destructive">*</span>$3`,
                )
                lines[j] = newLabel
                modified = true
              }
              break
            }
          }
        }
      }

      if (modified) {
        const newContent = lines.join("\n")
        writeFileSync(filePath, newContent, "utf-8")
        this.fixedFiles.push(relative(this.rootDir, filePath))
        return true
      }
      return false
    } catch (error) {
      this.errors.push({
        file: relative(this.rootDir, filePath),
        error: error.message,
      })
      return false
    }
  }

  fix() {
    console.log("🔍 Starte automatische Markierung von Pflichtfeldern...\n")

    const files = this.scanFiles()
    console.log(`📁 Gefunden: ${files.length} Dateien\n`)

    let fixedCount = 0
    for (const file of files) {
      if (this.fixFile(file)) {
        fixedCount++
      }
    }

    console.log(`✅ ${fixedCount} Dateien korrigiert`)
    if (this.fixedFiles.length > 0) {
      console.log("\n📝 Korrigierte Dateien:")
      this.fixedFiles.forEach((file) => console.log(`   - ${file}`))
    }

    if (this.errors.length > 0) {
      console.log("\n❌ Fehler:")
      this.errors.forEach((err) => console.log(`   - ${err.file}: ${err.error}`))
    }

    return {
      fixed: fixedCount,
      errors: this.errors.length,
    }
  }
}

// Main
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const marker = new RequiredFieldsMarker()
  const result = marker.fix()
  process.exit(result.errors > 0 ? 1 : 0)
}

export { RequiredFieldsMarker }

