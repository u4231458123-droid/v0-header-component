#!/usr/bin/env node
/**
 * Self-Healing Dependency Resolution
 * ===================================
 * Basierend auf AAAPlanung/planung.txt Abschnitt 6.2
 * Behebt automatisch Dependency-Probleme
 */

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Logging-System
const logDir = path.join(process.cwd(), ".cicd")
const logFile = path.join(logDir, "self-heal-deps-log.json")

function ensureLogDir() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
}

function loadLogHistory() {
  ensureLogDir()
  if (fs.existsSync(logFile)) {
    try {
      return JSON.parse(fs.readFileSync(logFile, "utf8"))
    } catch {
      return { history: [] }
    }
  }
  return { history: [] }
}

function saveLogEntry(entry) {
  const log = loadLogHistory()
  log.history.push({
    ...entry,
    timestamp: new Date().toISOString(),
  })
  // Behalte nur die letzten 100 Einträge
  if (log.history.length > 100) {
    log.history = log.history.slice(-100)
  }
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2))
}

async function selfHealDependencies() {
  console.log("🔧 Self-healing dependency issues...")
  console.log("=====================================\n")
  
  const logEntry = {
    action: "self-heal-dependencies",
    attempts: [],
    result: null,
    error: null,
  }

  // Detect package manager (cross-platform)
  const hasPnpmLock = fs.existsSync(path.join(process.cwd(), "pnpm-lock.yaml"))
  const hasNpmLock = fs.existsSync(path.join(process.cwd(), "package-lock.json"))
  const packageManager = hasPnpmLock ? "pnpm" : hasNpmLock ? "npm" : "pnpm" // Default to pnpm
  const installCommand = packageManager === "pnpm" ? "pnpm install" : "npm install"
  const installFrozenCommand = packageManager === "pnpm" ? "pnpm install --frozen-lockfile" : "npm ci"

  try {
    // Versuch 1: Standard Install
    console.log(`📦 Versuch 1: Standard ${packageManager} install...`)
    logEntry.attempts.push({ attempt: 1, method: "standard-install", status: "started" })
    execSync(installCommand, { stdio: "inherit", shell: true })
    console.log("✅ Dependencies installed successfully\n")
    logEntry.attempts[0].status = "success"
    logEntry.result = "success"
    saveLogEntry(logEntry)
    return
  } catch (error) {
    console.log("❌ Standard install failed, trying fixes...\n")
    logEntry.attempts[0] = { attempt: 1, method: "standard-install", status: "failed", error: error.message }
  }

  try {
    // Versuch 2: Legacy Peer Deps (nur für npm)
    if (packageManager === "npm") {
      console.log("📦 Versuch 2: npm install --legacy-peer-deps...")
      execSync("npm install --legacy-peer-deps", { stdio: "inherit", shell: true })
    } else {
      console.log("📦 Versuch 2: pnpm install --no-frozen-lockfile...")
      execSync("pnpm install --no-frozen-lockfile", { stdio: "inherit", shell: true })
    }
    // Package.json updaten (nur für npm)
    const method2 = packageManager === "npm" ? "legacy-peer-deps" : "no-frozen-lockfile"
    logEntry.attempts.push({ attempt: 2, method: method2, status: "started" })
    if (packageManager === "npm") {
      const pkgPath = path.join(process.cwd(), "package.json")
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
      pkg.config = pkg.config || {}
      pkg.config.legacyPeerDeps = true
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
      console.log("✅ Installed with legacy peer deps\n")
      console.log("📝 package.json updated with legacyPeerDeps config\n")
    } else {
      console.log("✅ Installed successfully\n")
    }
    logEntry.attempts[logEntry.attempts.length - 1].status = "success"
    logEntry.result = "success"
    saveLogEntry(logEntry)
    return
  } catch (error) {
    console.log("❌ Install failed, trying clean install...\n")
    const method2 = packageManager === "npm" ? "legacy-peer-deps" : "no-frozen-lockfile"
    logEntry.attempts.push({ attempt: 2, method: method2, status: "failed", error: error.message })
  }

  try {
    // Versuch 3: Clean Install
    console.log("📦 Versuch 3: Clean install...")
    logEntry.attempts.push({ attempt: 3, method: "clean-install", status: "started" })
    // Cross-platform file removal
    const nodeModulesPath = path.join(process.cwd(), "node_modules")
    const packageLockPath = path.join(process.cwd(), "package-lock.json")
    const pnpmLockPath = path.join(process.cwd(), "pnpm-lock.yaml")
    
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true })
    }
    if (fs.existsSync(packageLockPath)) {
      fs.unlinkSync(packageLockPath)
    }
    if (fs.existsSync(pnpmLockPath)) {
      fs.unlinkSync(pnpmLockPath)
    }
    
    // Cross-platform cache clean
    if (packageManager === "pnpm") {
      execSync("pnpm store prune", { stdio: "inherit", shell: true })
    } else {
      execSync("npm cache clean --force", { stdio: "inherit", shell: true })
    }
    execSync(installCommand, { stdio: "inherit", shell: true })
    console.log("✅ Clean install successful\n")
    logEntry.attempts[2].status = "success"
    logEntry.result = "success"
    saveLogEntry(logEntry)
    return
  } catch (error) {
    console.log("❌ Clean install failed\n")
    console.error("❌ All dependency resolution attempts failed")
    console.error("Please check the error messages above and resolve manually")
    logEntry.attempts[2] = { attempt: 3, method: "clean-install", status: "failed", error: error.message }
    logEntry.result = "failed"
    logEntry.error = error.message
    saveLogEntry(logEntry)
    process.exit(1)
  }
}

selfHealDependencies().catch((error) => {
  console.error("❌ Self-healing failed:", error.message)
  const logEntry = {
    action: "self-heal-dependencies",
    attempts: [],
    result: "error",
    error: error.message,
    timestamp: new Date().toISOString(),
  }
  saveLogEntry(logEntry)
  process.exit(1)
})
