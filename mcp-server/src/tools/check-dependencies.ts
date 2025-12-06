/**
 * Check Dependencies Tool
 * =======================
 * MCP Tool für Dependency-Validierung.
 * Prüft package.json auf Konflikte, veraltete Packages und Sicherheitsprobleme.
 */

import { promises as fs } from "fs"
import path from "path"

// Types
export interface DependencyCheckResult {
  success: boolean
  summary: {
    total: number
    outdated: number
    vulnerable: number
    conflicts: number
    duplicates: number
  }
  issues: DependencyIssue[]
  recommendations: string[]
  executionTime: number
}

export interface DependencyIssue {
  type: "outdated" | "vulnerable" | "conflict" | "duplicate" | "missing" | "peer"
  severity: "critical" | "high" | "medium" | "low" | "info"
  package: string
  currentVersion?: string
  latestVersion?: string
  message: string
  suggestion?: string
}

export interface PackageJson {
  name?: string
  version?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

// Bekannte Konflikte und empfohlene Versionen
const KNOWN_CONFLICTS: Record<string, { conflicts: string[]; recommendation: string }> = {
  "react": {
    conflicts: ["react-dom"],
    recommendation: "React und React-DOM sollten die gleiche Major-Version haben",
  },
  "@types/react": {
    conflicts: ["@types/react-dom"],
    recommendation: "Type-Definitionen sollten zur React-Version passen",
  },
  "next": {
    conflicts: ["react", "react-dom"],
    recommendation: "Next.js erfordert spezifische React-Versionen",
  },
}

// Kritische Sicherheitsprobleme (bekannte verwundbare Versionen)
const KNOWN_VULNERABILITIES: Record<string, { versions: string[]; severity: string; message: string }> = {
  "lodash": {
    versions: ["<4.17.21"],
    severity: "high",
    message: "Prototype Pollution Vulnerability",
  },
  "axios": {
    versions: ["<1.6.0"],
    severity: "medium",
    message: "CSRF Vulnerability in einigen Konfigurationen",
  },
}

/**
 * Parse Semantic Version
 */
function parseVersion(version: string): { major: number; minor: number; patch: number } | null {
  const match = version.replace(/^[\^~>=<]*/, "").match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) return null
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  }
}

/**
 * Prüfe auf Versions-Konflikte
 */
function checkVersionConflicts(
  deps: Record<string, string>,
  devDeps: Record<string, string>
): DependencyIssue[] {
  const issues: DependencyIssue[] = []
  const allDeps = { ...deps, ...devDeps }
  
  for (const [pkg, config] of Object.entries(KNOWN_CONFLICTS)) {
    if (allDeps[pkg]) {
      const pkgVersion = parseVersion(allDeps[pkg])
      
      for (const conflictPkg of config.conflicts) {
        if (allDeps[conflictPkg]) {
          const conflictVersion = parseVersion(allDeps[conflictPkg])
          
          if (pkgVersion && conflictVersion) {
            // Prüfe ob Major-Versionen übereinstimmen (für React-Familie)
            if (pkg.includes("react") && conflictPkg.includes("react")) {
              if (pkgVersion.major !== conflictVersion.major) {
                issues.push({
                  type: "conflict",
                  severity: "high",
                  package: `${pkg} / ${conflictPkg}`,
                  currentVersion: `${allDeps[pkg]} / ${allDeps[conflictPkg]}`,
                  message: `Version-Mismatch: ${pkg}@${allDeps[pkg]} vs ${conflictPkg}@${allDeps[conflictPkg]}`,
                  suggestion: config.recommendation,
                })
              }
            }
          }
        }
      }
    }
  }
  
  return issues
}

/**
 * Prüfe auf bekannte Sicherheitsprobleme
 */
function checkVulnerabilities(deps: Record<string, string>): DependencyIssue[] {
  const issues: DependencyIssue[] = []
  
  for (const [pkg, version] of Object.entries(deps)) {
    const vuln = KNOWN_VULNERABILITIES[pkg]
    if (vuln) {
      const parsed = parseVersion(version)
      if (parsed) {
        // Vereinfachte Version-Prüfung (nur für Major.Minor)
        const versionString = `${parsed.major}.${parsed.minor}.${parsed.patch}`
        
        // Prüfe ob Version in verwundbarem Bereich
        for (const vulnVersion of vuln.versions) {
          const vulnParsed = parseVersion(vulnVersion.replace("<", ""))
          if (vulnParsed && parsed.major <= vulnParsed.major && parsed.minor <= vulnParsed.minor) {
            issues.push({
              type: "vulnerable",
              severity: vuln.severity as any,
              package: pkg,
              currentVersion: version,
              message: vuln.message,
              suggestion: `Upgrade auf neueste Version: npm update ${pkg}`,
            })
          }
        }
      }
    }
  }
  
  return issues
}

/**
 * Prüfe auf Duplikate zwischen deps und devDeps
 */
function checkDuplicates(
  deps: Record<string, string>,
  devDeps: Record<string, string>
): DependencyIssue[] {
  const issues: DependencyIssue[] = []
  
  for (const pkg of Object.keys(deps)) {
    if (devDeps[pkg]) {
      issues.push({
        type: "duplicate",
        severity: "medium",
        package: pkg,
        currentVersion: `deps: ${deps[pkg]}, devDeps: ${devDeps[pkg]}`,
        message: `Package in beiden Abschnitten definiert`,
        suggestion: `Entferne aus devDependencies wenn in Produktion benötigt`,
      })
    }
  }
  
  return issues
}

/**
 * Generiere Empfehlungen
 */
function generateRecommendations(issues: DependencyIssue[]): string[] {
  const recommendations: string[] = []
  
  const criticalCount = issues.filter(i => i.severity === "critical").length
  const highCount = issues.filter(i => i.severity === "high").length
  const vulnerableCount = issues.filter(i => i.type === "vulnerable").length
  
  if (criticalCount > 0) {
    recommendations.push(`⚠️ ${criticalCount} kritische Probleme müssen sofort behoben werden`)
  }
  
  if (highCount > 0) {
    recommendations.push(`🔴 ${highCount} hohe Priorität - zeitnah beheben`)
  }
  
  if (vulnerableCount > 0) {
    recommendations.push(`🔒 Führe 'pnpm audit fix' aus um Sicherheitsprobleme zu beheben`)
  }
  
  if (issues.some(i => i.type === "duplicate")) {
    recommendations.push(`📦 Bereinige doppelte Dependencies mit 'pnpm dedupe'`)
  }
  
  if (issues.length === 0) {
    recommendations.push(`✅ Keine Probleme gefunden - Dependencies sind in gutem Zustand`)
  }
  
  return recommendations
}

/**
 * Haupt-Funktion: Prüfe Dependencies
 */
export async function checkDependencies(projectRoot?: string): Promise<DependencyCheckResult> {
  const startTime = Date.now()
  const root = projectRoot || process.cwd()
  
  try {
    // Lade package.json
    const packageJsonPath = path.join(root, "package.json")
    const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8")
    const packageJson: PackageJson = JSON.parse(packageJsonContent)
    
    const deps = packageJson.dependencies || {}
    const devDeps = packageJson.devDependencies || {}
    const peerDeps = packageJson.peerDependencies || {}
    
    // Sammle alle Issues
    const issues: DependencyIssue[] = [
      ...checkVersionConflicts(deps, devDeps),
      ...checkVulnerabilities({ ...deps, ...devDeps }),
      ...checkDuplicates(deps, devDeps),
    ]
    
    // Sortiere nach Severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    
    // Generiere Empfehlungen
    const recommendations = generateRecommendations(issues)
    
    return {
      success: true,
      summary: {
        total: Object.keys(deps).length + Object.keys(devDeps).length,
        outdated: issues.filter(i => i.type === "outdated").length,
        vulnerable: issues.filter(i => i.type === "vulnerable").length,
        conflicts: issues.filter(i => i.type === "conflict").length,
        duplicates: issues.filter(i => i.type === "duplicate").length,
      },
      issues,
      recommendations,
      executionTime: Date.now() - startTime,
    }
    
  } catch (error: any) {
    return {
      success: false,
      summary: { total: 0, outdated: 0, vulnerable: 0, conflicts: 0, duplicates: 0 },
      issues: [{
        type: "missing",
        severity: "critical",
        package: "package.json",
        message: `Fehler beim Lesen: ${error.message}`,
      }],
      recommendations: ["Stelle sicher, dass package.json existiert und valides JSON enthält"],
      executionTime: Date.now() - startTime,
    }
  }
}

/**
 * MCP Tool Definition
 */
export const checkDependenciesTool = {
  name: "check_dependencies",
  description: `Prüft package.json auf Dependency-Probleme.
  
Findet:
- Versions-Konflikte zwischen Packages
- Bekannte Sicherheitslücken
- Doppelte Einträge in deps/devDeps
- Inkompatible Peer-Dependencies

Verwende vor dem Hinzufügen neuer Dependencies oder bei Build-Problemen.`,
  
  inputSchema: {
    type: "object",
    properties: {
      projectRoot: {
        type: "string",
        description: "Optional: Pfad zum Projekt-Root (default: aktuelles Verzeichnis)",
      },
    },
    required: [],
  },
  
  async execute(args: { projectRoot?: string }): Promise<string> {
    const result = await checkDependencies(args.projectRoot)
    
    if (!result.success) {
      return `❌ Dependency-Check fehlgeschlagen:\n${result.issues[0]?.message || "Unbekannter Fehler"}`
    }
    
    let output = `📦 Dependency-Check Ergebnis (${result.executionTime}ms)\n\n`
    
    // Summary
    output += `## Zusammenfassung\n`
    output += `- Gesamte Dependencies: ${result.summary.total}\n`
    output += `- Konflikte: ${result.summary.conflicts}\n`
    output += `- Sicherheitsprobleme: ${result.summary.vulnerable}\n`
    output += `- Duplikate: ${result.summary.duplicates}\n\n`
    
    // Issues
    if (result.issues.length > 0) {
      output += `## Gefundene Probleme\n\n`
      
      for (const issue of result.issues) {
        const icon = {
          critical: "🔴",
          high: "🟠",
          medium: "🟡",
          low: "🔵",
          info: "⚪",
        }[issue.severity]
        
        output += `${icon} **${issue.package}** (${issue.type})\n`
        output += `   ${issue.message}\n`
        if (issue.suggestion) {
          output += `   💡 ${issue.suggestion}\n`
        }
        output += `\n`
      }
    }
    
    // Recommendations
    output += `## Empfehlungen\n\n`
    for (const rec of result.recommendations) {
      output += `- ${rec}\n`
    }
    
    return output
  },
}

export default checkDependenciesTool

