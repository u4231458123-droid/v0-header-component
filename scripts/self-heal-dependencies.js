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

async function selfHealDependencies() {
  console.log("🔧 Self-healing dependency issues...")
  console.log("=====================================\n")

  try {
    // Versuch 1: Standard Install
    console.log("📦 Versuch 1: Standard npm install...")
    execSync("npm install", { stdio: "inherit" })
    console.log("✅ Dependencies installed successfully\n")
    return
  } catch (error) {
    console.log("❌ Standard install failed, trying fixes...\n")
  }

  try {
    // Versuch 2: Legacy Peer Deps
    console.log("📦 Versuch 2: npm install --legacy-peer-deps...")
    execSync("npm install --legacy-peer-deps", { stdio: "inherit" })

    // Package.json updaten
    const pkgPath = path.join(process.cwd(), "package.json")
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
    pkg.config = pkg.config || {}
    pkg.config.legacyPeerDeps = true
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")

    console.log("✅ Installed with legacy peer deps\n")
    console.log("📝 package.json updated with legacyPeerDeps config\n")
    return
  } catch (error) {
    console.log("❌ Legacy peer deps failed, trying clean install...\n")
  }

  try {
    // Versuch 3: Clean Install
    console.log("📦 Versuch 3: Clean install...")
    execSync("rm -rf node_modules package-lock.json", { stdio: "inherit" })
    execSync("npm cache clean --force", { stdio: "inherit" })
    execSync("npm install", { stdio: "inherit" })
    console.log("✅ Clean install successful\n")
    return
  } catch (error) {
    console.log("❌ Clean install failed\n")
    console.error("❌ All dependency resolution attempts failed")
    console.error("Please check the error messages above and resolve manually")
    process.exit(1)
  }
}

selfHealDependencies().catch((error) => {
  console.error("❌ Self-healing failed:", error.message)
  process.exit(1)
})
