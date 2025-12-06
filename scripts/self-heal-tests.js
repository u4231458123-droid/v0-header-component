#!/usr/bin/env node
/**
 * Self-Healing Test Failures
 * ===========================
 * Basierend auf AAAPlanung/planung.txt Abschnitt 6.2
 * Behebt automatisch Test-Fehler
 */

const { execSync } = require("child_process")

async function selfHealTests() {
  console.log("🧪 Self-healing test failures...")
  console.log("================================\n")

  let attempts = 0
  const MAX_ATTEMPTS = 3

  // Detect package manager (cross-platform)
  const fs = require("fs")
  const path = require("path")
  const hasPnpmLock = fs.existsSync(path.join(process.cwd(), "pnpm-lock.yaml"))
  const hasNpmLock = fs.existsSync(path.join(process.cwd(), "package-lock.json"))
  const packageManager = hasPnpmLock ? "pnpm" : hasNpmLock ? "npm" : "npm"
  const testCommand = packageManager === "pnpm" ? "pnpm run test" : "npm run test"

  while (attempts < MAX_ATTEMPTS) {
    try {
      console.log(`📝 Versuch ${attempts + 1}/${MAX_ATTEMPTS}...`)
      execSync(testCommand, { stdio: "inherit", shell: true })
      console.log("✅ All tests passed\n")
      return
    } catch (error) {
      attempts++
      console.log(`❌ Tests failed (Attempt ${attempts}/${MAX_ATTEMPTS})\n`)

      if (attempts < MAX_ATTEMPTS) {
        // Flaky Test Detection
        const errorOutput = error.message || error.stdout?.toString() || ""
        const isFlaky = errorOutput.includes("flaky") || errorOutput.includes("retry")

        if (isFlaky) {
          console.log("🔄 Retrying flaky tests...\n")
          await sleep(2000) // Wait before retry
          continue
        }

        // Cache clear (cross-platform)
        console.log("🧹 Clearing test cache...")
        try {
          const clearCacheCommand = packageManager === "pnpm"
            ? "pnpm run test -- --clearCache"
            : "npm run test -- --clearCache"
          execSync(clearCacheCommand, { stdio: "inherit", shell: true })
        } catch {
          // Ignore if clearCache not supported
        }
        await sleep(1000)
      } else {
        console.error("❌ Tests failed after all attempts")
        console.error("Please check the test output above and fix manually")
        process.exit(1)
      }
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

selfHealTests().catch((error) => {
  console.error("❌ Self-healing failed:", error.message)
  process.exit(1)
})
