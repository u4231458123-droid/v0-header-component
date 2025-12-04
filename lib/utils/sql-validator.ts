/**
 * SQL-Validierungs-Utility
 * =========================
 * Verhindert, dass TypeScript/JavaScript-Dateien als SQL ausgeführt werden.
 * MUSS vor jeder SQL-Ausführung verwendet werden.
 */

/**
 * Prüft ob eine Datei eine gültige SQL-Datei ist (basierend auf Dateiendung)
 */
export function isValidSQLFile(filePath: string): boolean {
  if (!filePath) return false
  const normalizedPath = filePath.toLowerCase().trim()
  return normalizedPath.endsWith(".sql")
}

/**
 * Prüft ob der Inhalt gültiges SQL ist (keine JS/TS-Syntax)
 */
export function isValidSQLContent(content: string): {
  valid: boolean
  reason?: string
} {
  if (!content || typeof content !== "string") {
    return { valid: false, reason: "Inhalt ist leer oder kein String" }
  }

  const trimmed = content.trim()

  // Prüfe auf verbotene JavaScript/TypeScript-Syntax
  const forbiddenPatterns = [
    { pattern: /^["']use\s+(client|server)["']/i, reason: "TypeScript 'use client'/'use server' Direktive gefunden" },
    { pattern: /^import\s+/i, reason: "JavaScript/TypeScript 'import' Statement gefunden" },
    { pattern: /^export\s+/i, reason: "JavaScript/TypeScript 'export' Statement gefunden" },
    { pattern: /^const\s+\w+\s*=/i, reason: "JavaScript 'const' Statement gefunden" },
    { pattern: /^let\s+\w+\s*=/i, reason: "JavaScript 'let' Statement gefunden" },
    { pattern: /^var\s+\w+\s*=/i, reason: "JavaScript 'var' Statement gefunden" },
    { pattern: /^function\s+\w+/i, reason: "JavaScript 'function' Statement gefunden" },
    { pattern: /^interface\s+\w+/i, reason: "TypeScript 'interface' Statement gefunden" },
    { pattern: /^type\s+\w+/i, reason: "TypeScript 'type' Statement gefunden" },
    { pattern: /^class\s+\w+/i, reason: "JavaScript/TypeScript 'class' Statement gefunden" },
    { pattern: /^export\s+default/i, reason: "JavaScript 'export default' Statement gefunden" },
    { pattern: /^\/\/.*tsx|\.tsx/i, reason: "TypeScript/TSX-Kommentar oder Referenz gefunden" },
  ]

  for (const { pattern, reason } of forbiddenPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, reason }
    }
  }

  // Prüfe ob SQL-Keywords vorhanden sind (mindestens eines)
  const sqlKeywords = [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "CREATE",
    "ALTER",
    "DROP",
    "TRUNCATE",
    "GRANT",
    "REVOKE",
    "COMMIT",
    "ROLLBACK",
    "BEGIN",
    "END",
    "WITH",
    "FROM",
    "WHERE",
    "JOIN",
    "INNER",
    "LEFT",
    "RIGHT",
    "FULL",
    "ON",
    "GROUP BY",
    "ORDER BY",
    "HAVING",
    "UNION",
    "EXCEPT",
    "INTERSECT",
    "TABLE",
    "VIEW",
    "INDEX",
    "FUNCTION",
    "PROCEDURE",
    "TRIGGER",
    "POLICY",
    "ENABLE",
    "DISABLE",
    "ROW LEVEL SECURITY",
    "REFERENCES",
    "FOREIGN KEY",
    "PRIMARY KEY",
    "UNIQUE",
    "CHECK",
    "DEFAULT",
    "NOT NULL",
    "NULL",
    "UUID",
    "TEXT",
    "INTEGER",
    "BIGINT",
    "BOOLEAN",
    "TIMESTAMP",
    "DATE",
    "JSONB",
    "VARCHAR",
    "CHAR",
    "NUMERIC",
    "DECIMAL",
    "REAL",
    "DOUBLE PRECISION",
    "ARRAY",
    "AS",
    "RETURNS",
    "LANGUAGE",
    "SECURITY DEFINER",
    "STABLE",
    "VOLATILE",
    "IMMUTABLE",
    "SET",
    "search_path",
    "$$",
    "DO $$",
    "BEGIN",
    "END $$",
  ]

  const upperContent = trimmed.toUpperCase()
  const hasSQLKeyword = sqlKeywords.some((keyword) => upperContent.includes(keyword))

  if (!hasSQLKeyword && trimmed.length > 50) {
    // Wenn der Inhalt lang ist (>50 Zeichen) aber keine SQL-Keywords enthält, ist es wahrscheinlich kein SQL
    return { valid: false, reason: "Keine SQL-Keywords gefunden (möglicherweise JavaScript/TypeScript-Code)" }
  }

  return { valid: true }
}

/**
 * Kombinierte Validierung vor SQL-Ausführung
 * Prüft sowohl Dateipfad als auch Inhalt
 */
export function validateSQLBeforeExecution(
  query: string,
  filePath?: string
): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. Prüfe Dateipfad (falls vorhanden)
  if (filePath) {
    if (!isValidSQLFile(filePath)) {
      errors.push(`Ungültige Dateiendung: '${filePath}' (erwartet: .sql)`)
    }
  }

  // 2. Prüfe Inhalt
  const contentValidation = isValidSQLContent(query)
  if (!contentValidation.valid) {
    errors.push(`Ungültiger SQL-Inhalt: ${contentValidation.reason}`)
    if (filePath) {
      errors.push(`Datei: ${filePath}`)
    }
    errors.push(
      "HINWEIS: Es scheint, dass eine TypeScript/JavaScript-Datei als SQL ausgeführt werden soll. Bitte prüfe den Dateipfad."
    )
  }

  // 3. Warnung bei verdächtigen Mustern (aber nicht blockierend)
  if (query.includes("components/") || query.includes("lib/") || query.includes("app/")) {
    warnings.push("SQL-Query enthält Pfad-Referenzen, die auf eine falsche Datei hindeuten könnten")
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Extrahiert Dateinamen aus einem Pfad und prüft die Endung
 */
export function extractFileName(filePath: string): string {
  if (!filePath) return ""
  const parts = filePath.split(/[/\\]/)
  return parts[parts.length - 1] || filePath
}

/**
 * Prüft ob ein Dateiname auf eine SQL-Datei hindeutet
 */
export function looksLikeSQLFile(fileName: string): boolean {
  if (!fileName) return false
  return fileName.toLowerCase().endsWith(".sql")
}

