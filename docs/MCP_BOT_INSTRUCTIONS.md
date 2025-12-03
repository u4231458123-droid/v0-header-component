# MCP Bot Instructions - Verbindliche Anweisungen

## 🚨 KRITISCH: Alle Bots müssen diese Anweisungen befolgen!

### Regel 1: IMMER MCP verwenden
- ❌ NIEMALS direkte Supabase-API-Calls
- ✅ IMMER MCP-Funktionen verwenden
- ✅ Projekt-URL immer aus MCP abrufen

### Regel 2: Schema-Validierung VOR Code-Änderungen
```typescript
// MUSS als erstes ausgeführt werden
async validateSchema() {
  // 1. Projekt-URL
  const url = await mcp_supabase_get_project_url()
  if (url !== "https://ykfufejycdgwonrlbhzn.supabase.co") {
    throw new Error("FALSCHES PROJEKT!")
  }
  
  // 2. Tabellen auflisten
  const tables = await mcp_supabase_list_tables()
  
  // 3. Prüfe ob benötigte Tabellen existieren
  const required = ['companies', 'profiles', 'customers', 'drivers', 'vehicles', 'bookings']
  const missing = required.filter(t => !tables.includes(t))
  if (missing.length > 0) {
    throw new Error(`FEHLENDE TABELLEN: ${missing.join(', ')}`)
  }
}
```

### Regel 3: Migrationen NUR nach Schema-Validierung
```typescript
// MUSS Schema prüfen VOR Migration
async applyMigration(name: string, query: string) {
  // 1. Validiere Schema
  await this.validateSchema()
  
  // 2. Prüfe Query gegen existierende Tabellen
  const tables = await mcp_supabase_list_tables()
  // Validiere Query...
  
  // 3. Dann erst Migration anwenden
  await mcp_supabase_apply_migration({ name, query })
  
  // 4. TypeScript-Typen aktualisieren
  await mcp_supabase_generate_typescript_types()
}
```

### Regel 4: Code-Validierung gegen Schema
```typescript
// MUSS Code gegen Schema validieren
async validateCode(code: string) {
  // 1. Schema validieren
  await this.validateSchema()
  
  // 2. Code gegen Schema prüfen
  const tables = await mcp_supabase_list_tables()
  // Prüfe ob alle referenzierten Tabellen existieren
  // Prüfe ob alle Spalten existieren
  
  // 3. Dann erst Code prüfen
}
```

## Bot-spezifische Anweisungen

### Quality-Bot
```typescript
class QualityBot {
  async checkCodeAgainstDocumentation(code: string, filePath: string) {
    // 1. Schema validieren
    await this.validateSchema()
    
    // 2. Code gegen Schema prüfen
    await this.validateCodeAgainstSchema(code)
    
    // 3. Dann erst gegen Dokumentation prüfen
    // ... restliche Prüfung
  }
}
```

### System-Bot
```typescript
class SystemBot {
  async fixBug(code: string, filePath: string) {
    // 1. Schema validieren
    await this.validateSchema()
    
    // 2. Code gegen Schema prüfen
    await this.validateCodeAgainstSchema(code)
    
    // 3. Dann erst Bug fixen
    // ... Bug-Fix
  }
  
  async applyDatabaseChanges(changes: SchemaChange[]) {
    // 1. Schema validieren
    await this.validateSchema()
    
    // 2. Changes gegen Schema validieren
    for (const change of changes) {
      if (change.type === 'add_column') {
        const tables = await mcp_supabase_list_tables()
        if (!tables.includes(change.table)) {
          throw new Error(`Tabelle ${change.table} existiert nicht!`)
        }
      }
    }
    
    // 3. Migration erstellen und anwenden
    // ...
  }
}
```

### Master-Bot
```typescript
class MasterBot {
  async reviewRequest(request: ChangeRequest) {
    // 1. Vollständige Projekt-Validierung
    const validation = await this.validateProjectConfiguration()
    if (!validation.valid) {
      return {
        approved: false,
        reason: `Projekt-Konfiguration ungültig: ${validation.errors.join(', ')}`
      }
    }
    
    // 2. Schema-Validierung
    await this.validateSchema()
    
    // 3. Dann erst Request prüfen
    // ... Request-Review
  }
  
  async validateProjectConfiguration() {
    const errors: string[] = []
    
    // 1. Projekt-URL
    const url = await mcp_supabase_get_project_url()
    if (url !== "https://ykfufejycdgwonrlbhzn.supabase.co") {
      errors.push("Falsche Projekt-URL")
    }
    
    // 2. Tabellen
    const tables = await mcp_supabase_list_tables()
    if (tables.length === 0) {
      errors.push("Keine Tabellen vorhanden - Schema nicht initialisiert!")
    }
    
    // 3. Migrationen
    const migrations = await mcp_supabase_list_migrations()
    
    // 4. Sicherheit
    const security = await mcp_supabase_get_advisors({ type: "security" })
    if (security.lints.length > 0) {
      errors.push(`${security.lints.length} Sicherheitsprobleme gefunden`)
    }
    
    return {
      valid: errors.length === 0,
      errors,
      url,
      tables: tables.length,
      migrations: migrations.length
    }
  }
}
```

## Checkliste für jeden Bot

### VOR jeder Operation
- [ ] Projekt-URL mit MCP abrufen
- [ ] Projekt-URL validieren
- [ ] Tabellen auflisten
- [ ] Schema validieren

### BEI Schema-Änderungen
- [ ] Prüfe ob Tabellen existieren
- [ ] Validiere Migration
- [ ] Wende Migration an
- [ ] Generiere TypeScript-Typen
- [ ] Validiere Code gegen neues Schema

### NACH Code-Änderungen
- [ ] Schema-Validierung
- [ ] Code-Validierung
- [ ] Logs prüfen (optional)
- [ ] Advisors prüfen (optional)

## Fehlerbehandlung

### Wenn Schema-Validierung fehlschlägt
```typescript
// STOPP: Keine weiteren Operationen!
throw new Error("Schema-Validierung fehlgeschlagen! Bitte zuerst Schema initialisieren.")
```

### Wenn Projekt-URL falsch ist
```typescript
// STOPP: Falsches Projekt!
throw new Error("Falsche Projekt-URL! Bitte Projekt-Konfiguration prüfen.")
```

### Wenn Tabellen fehlen
```typescript
// STOPP: Schema nicht initialisiert!
throw new Error("Fehlende Tabellen! Bitte zuerst Schema initialisieren.")
```

## Zusammenfassung

### ✅ MUSS
- MCP für alle Supabase-Operationen verwenden
- Schema validieren VOR Code-Änderungen
- Projekt-URL validieren
- Tabellen prüfen vor Migrationen

### ❌ DARF NICHT
- Direkte Supabase-API-Calls
- Code-Änderungen ohne Schema-Validierung
- Migrationen ohne Schema-Prüfung
- Hardcoded Projekt-IDs

## Dokumentation
- Siehe `docs/MCP_SUPABASE_INTEGRATION.md` für vollständige MCP-Dokumentation
- Siehe `docs/MCP_IMPLEMENTATION_PLAN.md` für Implementierungsplan
- Siehe `docs/MCP_VOLLSTAENDIGE_ANALYSE_UND_LOESUNG.md` für vollständige Analyse

