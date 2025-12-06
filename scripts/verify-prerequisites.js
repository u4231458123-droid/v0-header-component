#!/usr/bin/env node
/**
 * Pre-Execution Checks Script
 * Verifiziert alle Voraussetzungen vor der Ausführung von Tasks
 *
 * Verwendung: node scripts/verify-prerequisites.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Farben für die Konsole
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, type = 'info') {
  const prefix = {
    success: `${colors.green}✅${colors.reset}`,
    error: `${colors.red}❌${colors.reset}`,
    warning: `${colors.yellow}⚠️${colors.reset}`,
    info: `${colors.blue}ℹ️${colors.reset}`
  };
  console.log(`${prefix[type] || prefix.info} ${message}`);
}

function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    return null;
  }
}

// Definiere alle Checks
const checks = [
  {
    name: 'Node.js Version',
    check: () => {
      const version = execCommand('node --version');
      if (!version) return { passed: false, message: 'Node.js nicht gefunden' };

      const major = parseInt(version.slice(1).split('.')[0], 10);
      if (major >= 18) {
        return { passed: true, message: `Node.js ${version}` };
      }
      return { passed: false, message: `Node.js ${version} (>= 18 erforderlich)` };
    },
    fix: 'Installiere Node.js 18 oder höher: https://nodejs.org'
  },
  {
    name: 'npm Version',
    check: () => {
      const version = execCommand('npm --version');
      if (!version) return { passed: false, message: 'npm nicht gefunden' };

      const major = parseInt(version.split('.')[0], 10);
      if (major >= 8) {
        return { passed: true, message: `npm ${version}` };
      }
      return { passed: false, message: `npm ${version} (>= 8 empfohlen)` };
    },
    fix: 'Update npm: npm install -g npm@latest'
  },
  {
    name: 'package.json existiert',
    check: () => {
      const packagePath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return { passed: true, message: `${pkg.name}@${pkg.version}` };
      }
      return { passed: false, message: 'package.json nicht gefunden' };
    },
    fix: 'Führe aus: npm init -y'
  },
  {
    name: 'node_modules installiert',
    check: () => {
      const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        return { passed: true, message: 'node_modules vorhanden' };
      }
      return { passed: false, message: 'node_modules nicht gefunden' };
    },
    fix: 'Führe aus: npm install'
  },
  {
    name: '.env Datei',
    check: () => {
      const envPath = path.resolve(process.cwd(), '.env');
      const envLocalPath = path.resolve(process.cwd(), '.env.local');

      if (fs.existsSync(envPath) || fs.existsSync(envLocalPath)) {
        return { passed: true, message: '.env Datei vorhanden' };
      }

      const envExamplePath = path.resolve(process.cwd(), '.env.example');
      if (fs.existsSync(envExamplePath)) {
        return { passed: false, message: '.env fehlt, aber .env.example vorhanden' };
      }

      return { passed: true, message: '.env nicht erforderlich oder optional' };
    },
    fix: 'Führe aus: cp .env.example .env'
  },
  {
    name: 'Git Repository',
    check: () => {
      const gitDir = path.resolve(process.cwd(), '.git');
      if (fs.existsSync(gitDir)) {
        const branch = execCommand('git rev-parse --abbrev-ref HEAD');
        return { passed: true, message: `Branch: ${branch}` };
      }
      return { passed: false, message: 'Kein Git Repository' };
    },
    fix: 'Führe aus: git init'
  },
  {
    name: 'TypeScript konfiguriert',
    check: () => {
      const tsConfigPath = path.resolve(process.cwd(), 'tsconfig.json');
      if (fs.existsSync(tsConfigPath)) {
        return { passed: true, message: 'tsconfig.json vorhanden' };
      }

      // Prüfe ob TS überhaupt verwendet wird
      const packagePath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (!deps.typescript) {
          return { passed: true, message: 'TypeScript nicht verwendet' };
        }
      }

      return { passed: false, message: 'tsconfig.json fehlt' };
    },
    fix: 'Führe aus: npx tsc --init'
  },
  {
    name: 'ESLint konfiguriert',
    check: () => {
      const eslintConfigs = ['.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.js', 'eslint.config.mjs'];

      for (const config of eslintConfigs) {
        if (fs.existsSync(path.resolve(process.cwd(), config))) {
          return { passed: true, message: `${config} vorhanden` };
        }
      }

      // Prüfe package.json eslintConfig
      const packagePath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (pkg.eslintConfig) {
          return { passed: true, message: 'ESLint in package.json konfiguriert' };
        }
      }

      return { passed: true, message: 'ESLint optional oder nicht verwendet' };
    },
    fix: 'Führe aus: npm init @eslint/config'
  },
  {
    name: 'Build Script verfügbar',
    check: () => {
      const packagePath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (pkg.scripts && pkg.scripts.build) {
          return { passed: true, message: 'build script definiert' };
        }
      }
      return { passed: false, message: 'Kein build script in package.json' };
    },
    fix: 'Füge "build" script zu package.json hinzu'
  },
  {
    name: 'Disk Space',
    check: () => {
      // Vereinfachter Check - prüft nur ob das Verzeichnis beschreibbar ist
      const testFile = path.resolve(process.cwd(), '.disk-check-temp');
      try {
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        return { passed: true, message: 'Schreibzugriff vorhanden' };
      } catch (error) {
        return { passed: false, message: 'Kein Schreibzugriff' };
      }
    },
    fix: 'Stelle sicher, dass genügend Speicherplatz vorhanden ist'
  }
];

// Hauptfunktion
async function verifyPrerequisites() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.blue}🔍 MyDispatch Pre-Execution Verification${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  let passedCount = 0;
  let failedCount = 0;
  const failures = [];

  for (const { name, check, fix } of checks) {
    try {
      const result = await check();

      if (result.passed) {
        log(`${name}: ${result.message}`, 'success');
        passedCount++;
      } else {
        log(`${name}: ${result.message}`, 'error');
        failures.push({ name, fix, message: result.message });
        failedCount++;
      }
    } catch (error) {
      log(`${name}: Fehler - ${error.message}`, 'error');
      failures.push({ name, fix, message: error.message });
      failedCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`${colors.blue}📊 Ergebnis${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`✅ Bestanden: ${passedCount}`);
  console.log(`❌ Fehlgeschlagen: ${failedCount}`);

  if (failures.length > 0) {
    console.log('\n' + '-'.repeat(60));
    console.log(`${colors.yellow}🔧 Erforderliche Korrekturen:${colors.reset}`);
    console.log('-'.repeat(60));

    failures.forEach(({ name, fix, message }, index) => {
      console.log(`\n${index + 1}. ${name}`);
      console.log(`   Problem: ${message}`);
      console.log(`   Lösung: ${fix}`);
    });

    console.log('\n');
    process.exit(1);
  }

  console.log(`\n${colors.green}✨ Alle Voraussetzungen erfüllt!${colors.reset}\n`);
  process.exit(0);
}

// Ausführen
verifyPrerequisites().catch((error) => {
  console.error('Verification failed:', error);
  process.exit(1);
});
