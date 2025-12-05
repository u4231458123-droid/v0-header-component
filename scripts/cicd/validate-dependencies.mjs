#!/usr/bin/env node
/**
 * Pre-Flight Dependency Validation
 * =================================
 * Prüft ob alle benötigten Skripte und Dependencies vorhanden sind
 */

import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '../..')

const requiredScripts = [
  'scripts/validate-layout.js',
  'scripts/validate-mobile.js',
  'scripts/validate-api.js',
  'scripts/validate-security.js',
  'scripts/validate-performance.js',
  'scripts/validate-accessibility.js',
  'scripts/validate-final.js',
  'scripts/cicd/auto-design-validator.mjs',
  'scripts/cicd/validate-sql-files.mjs',
  'scripts/cicd/check-dependencies.mjs',
]

const requiredFiles = [
  'package.json',
  'pnpm-lock.yaml',
  'tsconfig.json',
]

let hasErrors = false

console.log('🔍 Pre-Flight Dependency Validation')
console.log('====================================\n')

// Prüfe package.json
console.log('📦 Checking package.json...')
if (!existsSync(join(rootDir, 'package.json'))) {
  console.error('❌ package.json not found')
  hasErrors = true
} else {
  console.log('✅ package.json found')
}

// Prüfe Lockfile
console.log('\n📦 Checking lockfile...')
const hasPnpmLock = existsSync(join(rootDir, 'pnpm-lock.yaml'))
const hasNpmLock = existsSync(join(rootDir, 'package-lock.json'))
if (!hasPnpmLock && !hasNpmLock) {
  console.warn('⚠️  No lockfile found (pnpm-lock.yaml or package-lock.json)')
} else {
  console.log(`✅ Lockfile found (${hasPnpmLock ? 'pnpm-lock.yaml' : 'package-lock.json'})`)
}

// Prüfe TypeScript Config
console.log('\n📘 Checking TypeScript config...')
if (!existsSync(join(rootDir, 'tsconfig.json'))) {
  console.warn('⚠️  tsconfig.json not found')
} else {
  console.log('✅ tsconfig.json found')
}

// Prüfe Scripts
console.log('\n📜 Checking required scripts...')
const missingScripts = []
for (const script of requiredScripts) {
  const scriptPath = join(rootDir, script)
  if (!existsSync(scriptPath)) {
    missingScripts.push(script)
    console.warn(`⚠️  ${script} not found`)
  } else {
    console.log(`✅ ${script} found`)
  }
}

if (missingScripts.length > 0) {
  console.warn(`\n⚠️  ${missingScripts.length} script(s) missing (non-blocking)`)
}

// Prüfe package.json Scripts
console.log('\n📋 Checking package.json scripts...')
let missingPackageScripts = []
try {
  const { readFile } = await import('fs/promises')
  const packageJsonContent = await readFile(join(rootDir, 'package.json'), 'utf-8')
  const packageJson = JSON.parse(packageJsonContent)

  const requiredPackageScripts = [
    'validate:design',
    'validate:sql',
    'lint',
    'type-check',
    'build',
  ]

  for (const script of requiredPackageScripts) {
    if (!packageJson.scripts || !packageJson.scripts[script]) {
      missingPackageScripts.push(script)
      console.warn(`⚠️  Script "${script}" not found in package.json`)
    } else {
      console.log(`✅ Script "${script}" found`)
    }
  }

  if (missingPackageScripts.length > 0) {
    console.warn(`\n⚠️  ${missingPackageScripts.length} package script(s) missing (non-blocking)`)
  }
} catch (error) {
  console.error('❌ Failed to read package.json:', error.message)
  hasErrors = true
}

// Zusammenfassung
console.log('\n' + '='.repeat(40))
if (hasErrors) {
  console.error('❌ Pre-flight validation failed with errors')
  process.exit(1)
} else if (missingScripts.length > 0 || missingPackageScripts.length > 0) {
  console.warn('⚠️  Pre-flight validation completed with warnings')
  if (missingScripts.length > 0) {
    console.warn(`   ${missingScripts.length} external script(s) missing`)
  }
  if (missingPackageScripts.length > 0) {
    console.warn(`   ${missingPackageScripts.length} package.json script(s) missing`)
  }
  console.warn('   Workflow will continue')
  process.exit(0)
} else {
  console.log('✅ Pre-flight validation passed')
  process.exit(0)
}
