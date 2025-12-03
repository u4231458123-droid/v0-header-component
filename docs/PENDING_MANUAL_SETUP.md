# ⚠️ Ausstehende manuelle Setup-Aufgaben

## GitHub Branch Protection Ruleset

### Status: ⏳ **MUSS MANUELL ERSTELLT WERDEN**

### Was zu tun ist:
1. Gehe zu: `https://github.com/u4231458123-droid/v0-header-component/settings/rules`
2. Klicke auf "New ruleset" → "Branch ruleset"
3. Konfiguriere gemäß: `docs/GITHUB_BRANCH_PROTECTION_SETUP.md`

### Wichtigste Punkte:
- ✅ **Ruleset Name:** `mydispatch`
- ✅ **Bypass-Liste:** Vercel, Supabase, Dependabot MÜSSEN enthalten sein
- ✅ **Target Branches:** Alle Branches (oder spezifisch: `main`, `dependabot/*`)
- ✅ **Rules:** Alle dokumentierten Rules aktivieren

### Warum wichtig:
- Verhindert unautorisierte Änderungen
- Erzwingt Code-Reviews
- Sichert automatische Deployments (durch Bypass-Liste)
- Schützt vor versehentlichen Force-Pushes

## Dependabot Vulnerabilities

### Status: ⏳ **MUSS GEPRÜFT WERDEN**

GitHub meldet:
- **10 Vulnerabilities** (5 high, 4 moderate, 1 low)
- Link: `https://github.com/u4231458123-droid/v0-header-component/security/dependabot`

### Was zu tun ist:
1. Prüfe die gemeldeten Vulnerabilities
2. Update betroffene Dependencies
3. Teste nach Updates
4. Committe und pushe Fixes

## Weitere ausstehende Aufgaben

### 1. Form-Validierung
- ⏳ Required-Fields mit Asterisk markieren
- Script vorhanden: `scripts/cicd/add-required-fields.mjs`

### 2. Dropdown-Texte
- ⏳ Alle Placeholder-Texte auf Deutsch prüfen
- Script vorhanden: `scripts/cicd/fix-german-dropdowns.mjs`

### 3. Design-System (Rest)
- ⏳ ~32 weitere hardcoded Farben beheben
- Script vorhanden: `scripts/cicd/comprehensive-app-audit.mjs`

### 4. Kommunikationssystem
- ⏳ Vollständige Integration testen
- Migration vorhanden: `scripts/migrations/002_create_messaging_system.sql`

## Priorisierung

### Priorität 1 (Kritisch)
1. ⚠️ **GitHub Branch Protection Ruleset** - Sicherheit
2. ⚠️ **Dependabot Vulnerabilities** - Sicherheit

### Priorität 2 (Hoch)
3. ⏳ Form-Validierung
4. ⏳ Kommunikationssystem testen

### Priorität 3 (Mittel)
5. ⏳ Dropdown-Texte
6. ⏳ Weitere Design-Probleme

