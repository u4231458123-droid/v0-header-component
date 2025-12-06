# TASK: Datenbank-Migration

**Template für sichere Datenbank-Migrationen**

---

## C - Context

```
@project_specs.md @types/supabase.ts

**MCP Live-Kontext (automatisch laden):**
- `project://db/schema` - Aktuelles Datenbank-Schema
- `project://docs/active` - Aktive Regeln

**Migration-Kontext:**
- Tabelle(n): [TABELLEN]
- Änderungsart: [CREATE/ALTER/DROP]
- Motivation: [WARUM]
```

---

## R - Role

```
Agiere als Database Administrator und Backend-Developer im NEO-GENESIS Stack.

Deine Verantwortung:
- **Datensicherheit**: Keine Datenverluste
- **DSGVO-Compliance**: Company-basierte RLS, keine Master-Admin-Policies
- **Bearbeiter-Tracking**: created_by, updated_by für relevante Tabellen
- **Performance**: Indizes für häufige Queries
```

---

## E - Execution

```
**Migration Protokoll:**

1. **Pre-Migration Analyse:**
   - Aktuelles Schema analysieren
   - Abhängigkeiten identifizieren
   - Rollback-Strategie planen

2. **Migration-Datei erstellen:**
   - Dateiname: `scripts/[NNN]_[beschreibung].sql`
   - Format: Inkrementelle Nummer + snake_case Beschreibung
   - Beispiel: `scripts/035_add_invoice_status.sql`

3. **SQL schreiben:**
   ```sql
   -- Migration: [Beschreibung]
   -- Datum: [YYYY-MM-DD]
   -- Autor: AI-Agent

   -- 1. Schema-Änderungen
   ALTER TABLE [table] ADD COLUMN [column] [type];

   -- 2. Indizes (falls nötig)
   CREATE INDEX idx_[table]_[column] ON [table]([column]);

   -- 3. RLS-Policies (PFLICHT für neue Tabellen)
   ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "[table]_company_isolation" ON [table]
     FOR ALL
     USING (company_id = auth.jwt() ->> 'company_id');

   -- 4. Trigger für updated_at (falls nötig)
   CREATE TRIGGER update_[table]_updated_at
     BEFORE UPDATE ON [table]
     FOR EACH ROW
     EXECUTE FUNCTION update_updated_at();
   ```

4. **SQL-Validierung:**
   - Prüfe mit `validateSQLBeforeExecution()`
   - Keine TypeScript-Syntax in SQL-Datei!
   - Syntax-Check vor Ausführung

5. **TypeScript-Typen aktualisieren:**
   - `types/supabase.ts` erweitern
   - Neue Typen für neue Tabellen/Spalten

6. **Migration ausführen:**
   - Via Supabase MCP: `mcp_supabase_apply_migration`
   - Oder manuell in Supabase Dashboard

7. **Verifizierung:**
   - Schema-Check via MCP
   - Test-Query ausführen
   - RLS-Policy testen

8. **Rollback-Script bereitstellen:**
   - `scripts/[NNN]_rollback_[beschreibung].sql`
```

---

## D - Definition of Done

```
- [ ] Migration-SQL erstellt und validiert
- [ ] Keine TypeScript-Syntax in SQL
- [ ] RLS-Policies für neue Tabellen
- [ ] Indizes für Performance
- [ ] Bearbeiter-Tracking (created_by/updated_by) falls relevant
- [ ] TypeScript-Typen aktualisiert
- [ ] Migration erfolgreich ausgeführt
- [ ] Verifizierung bestanden
- [ ] Rollback-Script vorhanden
- [ ] Dokumentation aktualisiert
```

---

## O - Output

```
**Erwartete Ausgabe:**

1. Migration-SQL-Datei: `scripts/[NNN]_[name].sql`
2. Rollback-SQL-Datei: `scripts/[NNN]_rollback_[name].sql`
3. TypeScript-Typen: `types/supabase.ts` Updates
4. Commit-Message: "feat(db): [beschreibung]

- Added [table/column]
- RLS policies configured
- Indexes created

Migration: scripts/[NNN]_[name].sql"
```

---

## DSGVO-Checkliste

```
- [ ] Keine Master-Admin-Policies
- [ ] Company-basierte RLS für alle Tabellen
- [ ] Benutzer sehen NUR eigene Firmendaten
- [ ] Bearbeiter-Tracking bei sensiblen Daten
- [ ] Löschbarkeit gewährleistet (Recht auf Löschung)
```

---

## User Input

**Was soll migriert werden:** [BESCHREIBUNG]

**Betroffene Tabelle(n):** [TABELLEN]

**Änderungsart:** [CREATE TABLE / ALTER TABLE / DROP TABLE]

---

**EXECUTE.**

