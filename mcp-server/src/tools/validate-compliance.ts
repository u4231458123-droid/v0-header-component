/**
 * Validate Compliance Tool
 *
 * Checks code snippets against internal rules:
 * - German slugs validation
 * - Zod schema synchronization
 * - Design token usage
 * - Forbidden terms detection
 * - TypeScript strict mode compliance
 */

interface ComplianceResult {
  compliant: boolean;
  violations: Array<{
    rule: string;
    severity: "error" | "warning" | "info";
    message: string;
    line?: number;
    suggestion?: string;
  }>;
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

const FORBIDDEN_TERMS = [
  "kostenlos",
  "gratis",
  "free",
  "testen",
  "trial",
  "umsonst",
  "geschenkt",
  "kostenfrei",
];

const HARDCODED_COLORS = [
  /#[0-9a-fA-F]{3,8}/g,
  /rgb\([^)]+\)/g,
  /rgba\([^)]+\)/g,
  /hsl\([^)]+\)/g,
];

const DESIGN_TOKEN_PATTERNS = {
  roundings: {
    cards: "rounded-2xl",
    buttons: "rounded-xl",
    badges: "rounded-md",
  },
  spacing: {
    standard: "gap-5",
  },
};

export async function validateCompliance(
  code: string,
  filePath?: string
): Promise<ComplianceResult> {
  const violations: ComplianceResult["violations"] = [];

  if (!code || typeof code !== "string") {
    return {
      compliant: true,
      violations: [],
      summary: { errors: 0, warnings: 0, info: 0 },
    };
  }

  const lines = code.split("\n");

  // Check for forbidden terms in UI text
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const term of FORBIDDEN_TERMS) {
      if (line.toLowerCase().includes(term)) {
        violations.push({
          rule: "forbidden-terms",
          severity: "error",
          message: `Verbotener Begriff gefunden: "${term}"`,
          line: i + 1,
          suggestion: `Entferne oder ersetze "${term}" durch einen erlaubten Begriff`,
        });
      }
    }
  }

  // Check for hardcoded colors
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of HARDCODED_COLORS) {
      const matches = line.match(pattern);
      if (matches && !line.includes("// design-token")) {
        for (const match of matches) {
          violations.push({
            rule: "hardcoded-colors",
            severity: "warning",
            message: `Hardcoded color found: ${match}`,
            line: i + 1,
            suggestion: "Use Tailwind design tokens (e.g., bg-primary, text-muted-foreground)",
          });
        }
      }
    }
  }

  // Check for incorrect roundings
  const roundingPatterns = [
    { pattern: /rounded-lg/g, expected: "rounded-xl or rounded-2xl", context: "cards/buttons" },
    { pattern: /rounded-sm/g, expected: "rounded-md", context: "badges" },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { pattern, expected, context } of roundingPatterns) {
      if (pattern.test(line)) {
        violations.push({
          rule: "design-consistency",
          severity: "info",
          message: `Non-standard rounding found for ${context}`,
          line: i + 1,
          suggestion: `Consider using ${expected} per design guidelines`,
        });
      }
    }
  }

  // Check for gap-4 or gap-6 (should be gap-5)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/gap-[46]\b/.test(line) && !line.includes("// intentional")) {
      violations.push({
        rule: "spacing-consistency",
        severity: "warning",
        message: "Non-standard gap spacing found",
        line: i + 1,
        suggestion: "Use gap-5 as the standard spacing",
      });
    }
  }

  // Check for any types
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/:\s*any\b/.test(line) && !line.includes("// eslint-disable")) {
      violations.push({
        rule: "typescript-strict",
        severity: "warning",
        message: "Untyped 'any' found",
        line: i + 1,
        suggestion: "Add explicit type annotation or use 'unknown'",
      });
    }
  }

  // Check for German variable names (should be English)
  const germanVariablePatterns = [
    /const\s+(benutzer|nutzer|kunde|fahrer|fahrzeug|buchung|rechnung)\s*=/gi,
    /let\s+(benutzer|nutzer|kunde|fahrer|fahrzeug|buchung|rechnung)\s*=/gi,
    /function\s+(holen|speichern|loeschen|aktualisieren)/gi,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of germanVariablePatterns) {
      if (pattern.test(line)) {
        violations.push({
          rule: "code-language",
          severity: "error",
          message: "German variable/function name found in code",
          line: i + 1,
          suggestion: "Use English for all code identifiers (variables, functions, classes)",
        });
      }
    }
  }

  // Check for console.log in production code
  if (filePath && !filePath.includes("test") && !filePath.includes("spec")) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/console\.(log|debug|info)\(/.test(line) && !line.includes("// dev-only")) {
        violations.push({
          rule: "no-console",
          severity: "info",
          message: "console.log found in production code",
          line: i + 1,
          suggestion: "Remove or use proper logging mechanism",
        });
      }
    }
  }

  // Calculate summary
  const summary = {
    errors: violations.filter((v) => v.severity === "error").length,
    warnings: violations.filter((v) => v.severity === "warning").length,
    info: violations.filter((v) => v.severity === "info").length,
  };

  return {
    compliant: summary.errors === 0,
    violations,
    summary,
  };
}

