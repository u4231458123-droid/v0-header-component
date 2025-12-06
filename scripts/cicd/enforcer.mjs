#!/usr/bin/env node

/**
 * The Enforcer - Policy Validation Script
 * Prüft Code-Änderungen gegen project_specs.md
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const specsFile = args.find(arg => arg.startsWith("--specs="))?.split("=")[1];
const diffFile = args.find(arg => arg.startsWith("--diff="))?.split("=")[1];
const prNumber = args.find(arg => arg.startsWith("--pr-number="))?.split("=")[1];

if (!specsFile || !diffFile) {
  console.error("❌ Usage: node enforcer.mjs --specs=project_specs.md --diff=pr-diff.txt --pr-number=123");
  process.exit(1);
}

// Lade Project Specs
let specs;
try {
  specs = readFileSync(specsFile, "utf8");
} catch (e) {
  console.error(`❌ Konnte ${specsFile} nicht laden: ${e.message}`);
  process.exit(1);
}

// Lade PR Diff
let diff;
try {
  diff = readFileSync(diffFile, "utf8");
} catch (e) {
  console.error(`❌ Konnte ${diffFile} nicht laden: ${e.message}`);
  process.exit(1);
}

// Validierungsregeln
const violations = [];

// 1. Prüfe: Variablen Englisch
const germanVariablePattern = /\b(let|const|var|function|class|interface|type)\s+([a-zäöüß]+[A-ZÄÖÜß][a-zäöüß]*)/g;
const matches = diff.match(germanVariablePattern);
if (matches) {
  violations.push(`Deutsche Variablennamen gefunden: ${matches.slice(0, 5).join(", ")}`);
}

// 2. Prüfe: UI-Text Deutsch (in JSX/TSX)
const englishUITextPattern = /(?:>|"|')([A-Z][a-z]+ [a-z]+)(?:<|"|')/g;
// Diese Prüfung ist komplexer - wir prüfen nur auf offensichtliche englische UI-Texte
const englishUITexts = ["Click here", "Submit", "Cancel", "Delete", "Edit"];
englishUITexts.forEach(text => {
  if (diff.includes(text) && diff.includes(">")) {
    violations.push(`Englischer UI-Text gefunden: "${text}" - sollte auf Deutsch sein`);
  }
});

// 3. Prüfe: Tailwind Utility Classes (kein Custom CSS)
const customCSSPattern = /\.(css|scss|sass|less)$/;
const cssFiles = diff.match(/diff --git.*\.(css|scss|sass|less)/g);
if (cssFiles && !diff.includes("globals.css")) {
  violations.push(`Custom CSS-Dateien gefunden - verwende Tailwind Utility Classes`);
}

// 4. Prüfe: Swimm-Doku Updates
const swimmPattern = /\.swimm\//;
if (diff.includes("+") && !diff.match(swimmPattern) && diff.match(/\.(ts|tsx|js|jsx)$/)) {
  // Warnung, aber kein Fehler
  console.warn("⚠️  Neue Code-Dateien ohne Swimm-Doku-Update");
}

// 5. Prüfe: Verbotene Begriffe
const forbiddenTerms = ["kostenlos", "gratis", "free", "testen", "trial"];
forbiddenTerms.forEach(term => {
  if (diff.toLowerCase().includes(term)) {
    violations.push(`Verbotener Begriff gefunden: "${term}"`);
  }
});

// Ergebnis
const result = {
  pass: violations.length === 0,
  violations,
  reason: violations.length > 0 
    ? `${violations.length} Verletzung(en) gefunden`
    : "Alle Prüfungen bestanden",
};

// Schreibe Ergebnis
const resultFile = join(__dirname, "../../enforcer-result.json");
import { writeFileSync } from "fs";
writeFileSync(resultFile, JSON.stringify(result, null, 2));

// Ausgabe
if (result.pass) {
  console.log("✅ Enforcer: PASS");
  console.log("Alle Prüfungen bestanden");
  process.exit(0);
} else {
  console.error("❌ Enforcer: FAIL");
  console.error(`Grund: ${result.reason}`);
  console.error("\nVerletzungen:");
  violations.forEach(v => console.error(`  - ${v}`));
  process.exit(1);
}

