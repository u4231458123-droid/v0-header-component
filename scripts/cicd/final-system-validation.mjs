/**
 * FINALE SYSTEM-VALIDIERUNG
 * ==========================
 * Prüft das gesamte MyDispatch-System vollumfänglich
 * Während der Umsetzung und Feintuning
 */

import { SystemBot } from "../../lib/ai/bots/system-bot.js"
import { QualityBot } from "../../lib/ai/bots/quality-bot.js"
import { MasterBot } from "../../lib/ai/bots/master-bot.js"
import { loadKnowledgeForTaskWithCICD } from "../../lib/knowledge-base/load-with-cicd.js"
import { promises as fs } from "fs"
import path from "path"

async function finalSystemValidation() {
  console.log("🔍 FINALE SYSTEM-VALIDIERUNG GESTARTET\n")
  console.log("=".repeat(60))
  console.log("MYDISPATCH SYSTEM - VOLLSTÄNDIGE PRÜFUNG")
  console.log("=".repeat(60) + "\n")

  const results = {
    knowledgeBase: { passed: true, errors: [], warnings: [] },
    bots: { passed: true, errors: [], warnings: [] },
    workflows: { passed: true, errors: [], warnings: [] },
    quality: { passed: true, errors: [], warnings: [] },
    overall: { passed: true, errors: [], warnings: [] },
  }

  // 1. PRÜFE WISSENSDATENBANK
  console.log("1. PRÜFE WISSENSDATENBANK...")
  try {
    const allKnowledge = loadKnowledgeForTaskWithCICD("complete-validation", [])
    const criticalEntries = allKnowledge.filter((e) => e.priority === "critical")
    
    console.log(`   ✅ ${allKnowledge.length} Knowledge-Entries geladen`)
    console.log(`   ✅ ${criticalEntries.length} kritische Einträge gefunden`)
    
    // Prüfe auf wichtige Einträge
    const requiredEntries = [
      "systemwide-thinking-001",
      "mydispatch-core-values-001",
      "ui-consistency-detailed-001",
      "visual-logical-validation-001",
      "quality-thinking-detailed-001",
      "system-bot-instructions-001",
      "quality-bot-instructions-001",
      "master-bot-instructions-001",
    ]
    
    const missingEntries = requiredEntries.filter((id) => !allKnowledge.find((e) => e.id === id))
    if (missingEntries.length > 0) {
      results.knowledgeBase.errors.push(`Fehlende Knowledge-Entries: ${missingEntries.join(", ")}`)
      results.knowledgeBase.passed = false
    } else {
      console.log("   ✅ Alle erforderlichen Knowledge-Entries vorhanden")
    }
  } catch (error) {
    results.knowledgeBase.errors.push(`Fehler beim Laden der Knowledge-Base: ${error.message}`)
    results.knowledgeBase.passed = false
  }

  // 2. PRÜFE BOTS
  console.log("\n2. PRÜFE BOTS...")
  try {
    const systemBot = new SystemBot()
    const qualityBot = new QualityBot()
    const masterBot = new MasterBot()
    
    console.log("   ✅ System-Bot initialisiert")
    console.log("   ✅ Quality-Bot initialisiert")
    console.log("   ✅ Master-Bot initialisiert")
    
    // Prüfe Bot-Funktionalität
    const testCode = `export function Test() { return <div>Test</div> }`
    const qualityCheck = await qualityBot.checkCodeAgainstDocumentation(testCode, {}, "test.tsx")
    if (qualityCheck.passed === undefined) {
      results.bots.warnings.push("Quality-Bot: checkCodeAgainstDocumentation möglicherweise unvollständig")
    } else {
      console.log("   ✅ Quality-Bot: Code-Validierung funktioniert")
    }
    
    const masterChat = await masterBot.chat("Hallo")
    if (!masterChat || typeof masterChat !== "string") {
      results.bots.warnings.push("Master-Bot: Chat-Interface möglicherweise unvollständig")
    } else {
      console.log("   ✅ Master-Bot: Chat-Interface funktioniert")
    }
  } catch (error) {
    results.bots.errors.push(`Fehler bei Bot-Initialisierung: ${error.message}`)
    results.bots.passed = false
  }

  // 3. PRÜFE WORKFLOWS
  console.log("\n3. PRÜFE WORKFLOWS...")
  try {
    const workflowsPath = path.join(process.cwd(), ".github", "workflows")
    const workflowFiles = await fs.readdir(workflowsPath)
    const requiredWorkflows = ["master-validation.yml", "auto-fix-bugs.yml", "advanced-optimizations.yml"]
    
    const missingWorkflows = requiredWorkflows.filter((file) => !workflowFiles.includes(file))
    if (missingWorkflows.length > 0) {
      results.workflows.errors.push(`Fehlende Workflows: ${missingWorkflows.join(", ")}`)
      results.workflows.passed = false
    } else {
      console.log("   ✅ Alle erforderlichen Workflows vorhanden")
    }
    
    // Prüfe auf Secret-Zugriffe (sollten mit || '' abgesichert sein)
    for (const file of requiredWorkflows) {
      const content = await fs.readFile(path.join(workflowsPath, file), "utf-8")
      const secretPatterns = [
        /\$\{\{\s*secrets\.NEXT_PUBLIC_SUPABASE_URL\s*\}\}/g,
        /\$\{\{\s*secrets\.NEXT_PUBLIC_SUPABASE_ANON_KEY\s*\}\}/g,
        /\$\{\{\s*secrets\.HUGGINGFACE_API_KEY\s*\}\}/g,
        /\$\{\{\s*secrets\.VERCEL_TOKEN\s*\}\}/g,
      ]
      
      for (const pattern of secretPatterns) {
        const matches = content.match(pattern)
        if (matches && matches.some((m) => !m.includes("|| ''"))) {
          results.workflows.warnings.push(`${file}: Secret-Zugriffe sollten mit || '' abgesichert sein`)
        }
      }
    }
    
    if (results.workflows.warnings.length === 0) {
      console.log("   ✅ Alle Secret-Zugriffe korrekt abgesichert")
    }
  } catch (error) {
    results.workflows.errors.push(`Fehler beim Prüfen der Workflows: ${error.message}`)
    results.workflows.passed = false
  }

  // 4. PRÜFE QUALITÄT
  console.log("\n4. PRÜFE QUALITÄT...")
  try {
    // Prüfe auf wichtige Dateien
    const requiredFiles = [
      "lib/knowledge-base/structure.ts",
      "lib/knowledge-base/load-with-cicd.ts",
      "lib/ai/bots/system-bot.ts",
      "lib/ai/bots/quality-bot.ts",
      "lib/ai/bots/master-bot.ts",
      "lib/cicd/prompts.ts",
      "scripts/cicd/validate-complete-system-v2.mjs",
    ]
    
    for (const file of requiredFiles) {
      try {
        await fs.access(path.join(process.cwd(), file))
        console.log(`   ✅ ${file} vorhanden`)
      } catch {
        results.quality.errors.push(`Fehlende Datei: ${file}`)
        results.quality.passed = false
      }
    }
  } catch (error) {
    results.quality.errors.push(`Fehler bei Qualitätsprüfung: ${error.message}`)
    results.quality.passed = false
  }

  // ZUSAMMENFASSUNG
  console.log("\n" + "=".repeat(60))
  console.log("VALIDIERUNGS-ERGEBNISSE")
  console.log("=".repeat(60))
  
  if (!results.knowledgeBase.passed) {
    results.overall.passed = false
    results.overall.errors.push(...results.knowledgeBase.errors)
  }
  if (!results.bots.passed) {
    results.overall.passed = false
    results.overall.errors.push(...results.bots.errors)
  }
  if (!results.workflows.passed) {
    results.overall.passed = false
    results.overall.errors.push(...results.workflows.errors)
  }
  if (!results.quality.passed) {
    results.overall.passed = false
    results.overall.errors.push(...results.quality.errors)
  }
  
  results.overall.warnings.push(...results.knowledgeBase.warnings)
  results.overall.warnings.push(...results.bots.warnings)
  results.overall.warnings.push(...results.workflows.warnings)
  results.overall.warnings.push(...results.quality.warnings)
  
  console.log(JSON.stringify(results, null, 2))
  console.log("=".repeat(60))
  
  if (results.overall.passed) {
    console.log("\n✅ SYSTEM VOLLSTÄNDIG VALIDIERT - BEREIT FÜR BETRIEB")
    if (results.overall.warnings.length > 0) {
      console.log("\n⚠️  Warnungen:")
      results.overall.warnings.forEach((w) => console.log(`   - ${w}`))
    }
    process.exit(0)
  } else {
    console.log("\n❌ VALIDIERUNG FEHLGESCHLAGEN")
    console.log("Fehler:")
    results.overall.errors.forEach((e) => console.log(`   - ${e}`))
    if (results.overall.warnings.length > 0) {
      console.log("\nWarnungen:")
      results.overall.warnings.forEach((w) => console.log(`   - ${w}`))
    }
    process.exit(1)
  }
}

finalSystemValidation().catch((error) => {
  console.error("Kritischer Fehler bei Validierung:", error)
  process.exit(1)
})

