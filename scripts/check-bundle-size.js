#!/usr/bin/env node
/**
 * Bundle Size Check
 * =================
 * Prüft ob Bundle-Größen innerhalb der Limits sind
 */

const fs = require("fs")
const path = require("path")

const MAX_BUNDLE_SIZE = 500 * 1024 // 500KB

function checkBundleSize() {
  console.log("📦 Checking bundle size...")
  console.log("==========================\n")

  const nextDir = path.join(process.cwd(), ".next")
  
  if (!fs.existsSync(nextDir)) {
    console.log("⚠️ .next directory not found - run 'npm run build' first")
    return
  }

  const staticDir = path.join(nextDir, "static")
  if (!fs.existsSync(staticDir)) {
    console.log("⚠️ .next/static directory not found")
    return
  }

  let totalSize = 0
  const largeFiles = []

  function checkDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        checkDirectory(fullPath)
      } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".css"))) {
        const stats = fs.statSync(fullPath)
        totalSize += stats.size
        
        if (stats.size > 100 * 1024) { // > 100KB
          largeFiles.push({
            path: fullPath.replace(process.cwd(), ""),
            size: stats.size,
            sizeKB: (stats.size / 1024).toFixed(2),
          })
        }
      }
    }
  }

  checkDirectory(staticDir)

  const totalSizeKB = (totalSize / 1024).toFixed(2)
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2)

  console.log(`📊 Bundle-Größe: ${totalSizeKB} KB (${totalSizeMB} MB)\n`)

  if (totalSize > MAX_BUNDLE_SIZE) {
    console.log(`❌ Bundle-Größe überschreitet Limit von ${MAX_BUNDLE_SIZE / 1024} KB`)
    console.log(`   Aktuell: ${totalSizeKB} KB\n`)
    
    if (largeFiles.length > 0) {
      console.log("📋 Größte Dateien:")
      largeFiles
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .forEach((file) => {
          console.log(`   ${file.path}: ${file.sizeKB} KB`)
        })
    }
    
    process.exit(1)
  } else {
    console.log(`✅ Bundle-Größe innerhalb des Limits (${MAX_BUNDLE_SIZE / 1024} KB)\n`)
    
    if (largeFiles.length > 0) {
      console.log("📋 Größte Dateien (zur Info):")
      largeFiles
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
        .forEach((file) => {
          console.log(`   ${file.path}: ${file.sizeKB} KB`)
        })
    }
  }
}

checkBundleSize()
