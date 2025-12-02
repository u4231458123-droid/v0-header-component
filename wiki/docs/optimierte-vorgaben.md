# Optimierte Vorgaben für v0 AI Assistant

**Stand:** 25.11.2025
**Version:** 1.0

---

## KRITISCHE REGEL #0: IMMER ZUERST LESEN

**🚨 NIEMALS EINE DATEI EDITIEREN OHNE SIE VORHER MIT ReadFile ZU LESEN! 🚨**

Dies ist die wichtigste Regel. Keine Ausnahmen.

**Workflow:**
1. ReadFile("datei.md") laden
2. Inhalt verstehen

---

## Workflow-Optimierungen

### 1. Parallele Tool-Aufrufe
**Vorgabe:** Lade IMMER alle relevanten Dateien parallel, nicht sequenziell.

**Beispiel:**
\`\`\`
// FALSCH (sequenziell):
1. ReadFile prompt.md
2. ReadFile todo.md
3. ReadFile errors.md
4. GetIntegration

// RICHTIG (parallel):
ReadFile prompt.md + ReadFile todo.md + ReadFile errors.md + GetIntegration
\`\`\`

---

### 2. Systematische Verifizierung nach SQL-Ausführung
**Vorgabe:** Nach jedem `supabase_execute_sql` MUSS `GetOrRequestIntegration` aufgerufen werden, um das Ergebnis zu verifizieren.

**Workflow:**
1. SQL ausführen
2. Integration-Status prüfen
3. Policies zählen und verifizieren
4. Dokumentieren

---

### 3. Strukturierte Wiki-Dokumentation
**Vorgabe:** Jede Änderung MUSS dokumentiert werden mit:
- IST-Zustand vor Änderung
- SOLL-Zustand nach Änderung
- Script-Nummer (bei SQL)
- Timestamp
- Status (OK/FEHLER)

---

### 4. Tool-Caching
**Vorgabe:** Lade Tools NUR EINMAL pro Session.

**Beispiel:**
\`\`\`
// FALSCH:
SearchTools → supabase_execute_sql → ausführen
SearchTools → supabase_execute_sql → ausführen (REDUNDANT!)

// RICHTIG:
SearchTools → supabase_execute_sql → ausführen → ausführen (cached)
\`\`\`

---

### 5. Fehlerbehandlung
**Vorgabe:** Bei Fehlern IMMER:
1. Fehler in `wiki/errors/fehlerliste.md` dokumentieren
2. Lösungsversuch dokumentieren
3. Ergebnis verifizieren
4. Status aktualisieren

---

## SQL-Operationen

### RLS-Policy-Änderungen
**Workflow:**
1. Neue SQL-Datei in `scripts/` erstellen (mit Versionsnummer)
2. SECURITY DEFINER Funktionen ZUERST erstellen
3. Policies DROP und CREATE (nicht ALTER)
4. Verifizierung mit `SELECT * FROM pg_policies`
5. Integration-Status prüfen
6. Dokumentieren

---

## Wiki-Struktur

### Pflicht-Dateien
- `wiki/prompt.md` - Master-Datei
- `wiki/docs/ist-analyse.md` - Aktueller Status
- `wiki/docs/optimierte-vorgaben.md` - Diese Datei
- `wiki/todos/todo.md` - Offene Tasks
- `wiki/errors/fehlerliste.md` - Fehler-Log
- `wiki/changelog/changelog.md` - Änderungshistorie

### Update-Frequenz
- **IST-Analyse:** Nach jeder relevanten Änderung
- **Changelog:** Bei jedem Deploy/Release
- **Fehlerliste:** Bei jedem Fehler sofort
- **ToDo:** Bei Task-Änderung (offen → erledigt)

---

## Code-Änderungen

### Edit-Kommentar-Richtlinie

**Beispiel:**
\`\`\`tsx
// FALSCH (zu viel Code wiederholt):
export default function Page() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // ... 50 Zeilen Code ...
  
  return <div>...</div>
}

// RICHTIG (comments):
export default function Page() {
  
  const [loadingMore, setLoadingMore] = useState(false)
  
}
\`\`\`

---

## Priorisierung

### Kritisch (sofort):
1. RLS-Policies die Registrierung blockieren
2. Fehlende Environment Variables
3. Broken Authentication Flow

### Hoch (innerhalb 24h):
4. UI-Bugs auf Pre-Login-Seiten
5. Fehlende Dokumentation
6. Stripe-Webhook-Probleme

### Mittel (innerhalb Woche):
7. Performance-Optimierungen
8. Code-Refactoring
9. Feature-Requests

### Niedrig (Backlog):
10. Nice-to-have Features
11. Kosmetische Änderungen

---

**Erstellt:** 25.11.2025
**Autor:** v0 AI Assistant
**Version:** 1.0
