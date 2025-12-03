# GitHub Branch Protection Ruleset - MyDispatch

## ⚠️ WICHTIG: Diese Konfiguration muss noch angelegt werden!

## Ruleset Name
```
mydispatch
```

## Enforcement Status
- **Status:** Aktiv
- **Bypass List:** Konfiguriert (siehe unten)

## Bypass List (Immer erlauben)

Die folgenden Apps und Rollen müssen in der Bypass-Liste sein, damit automatische Deployments funktionieren:

### Apps (Always allow)
1. **Vercel** - `VercelApp • vercel`
   - **Grund:** Automatische Deployments von Vercel
   - **Bypass Mode:** Always allow

2. **Railway App** - `Railway AppApp • railwayapp`
   - **Grund:** Alternative Deployment-Plattform
   - **Bypass Mode:** Always allow

3. **Supabase** - `SupabaseApp • supabase`
   - **Grund:** Datenbank-Migrationen und Schema-Updates
   - **Bypass Mode:** Always allow

4. **Vercel Toolbar** - `Vercel ToolbarApp • vercel`
   - **Grund:** Vercel Preview-Deployments
   - **Bypass Mode:** Always allow

5. **What The Diff** - `What The DiffApp • beyondcode`
   - **Grund:** Code-Review-Tool
   - **Bypass Mode:** Always allow

6. **Replit** - `ReplitApp • replit`
   - **Grund:** Alternative Entwicklungsumgebung
   - **Bypass Mode:** Always allow

7. **Builder.io Integration** - `Builder.io IntegrationApp • BuilderIO`
   - **Grund:** Content-Management-Integration
   - **Bypass Mode:** Always allow

8. **lovable.dev** - `lovable.devApp • GPT-Engineer-App`
   - **Grund:** AI-Entwicklungstool
   - **Bypass Mode:** Always allow

9. **Copilot coding agent** - `Copilot coding agentApp • github`
   - **Grund:** GitHub Copilot Integration
   - **Bypass Mode:** Always allow

10. **ChatGPT Codex Connector** - `ChatGPT Codex ConnectorApp • openai`
    - **Grund:** OpenAI Integration
    - **Bypass Mode:** Always allow

11. **Manus Connector** - `Manus ConnectorApp • manus-ai-team`
    - **Grund:** AI-Entwicklungstool
    - **Bypass Mode:** Always allow

### Rollen (Always allow)
1. **MaintainRole** - Repository Maintainer
   - **Bypass Mode:** Always allow

2. **WriteRole** - Repository Write Access
   - **Bypass Mode:** Always allow

3. **Repository adminRole** - Repository Administrator
   - **Bypass Mode:** Always allow

## Target Branches

### Branch Targeting Criteria
- **Default:** All branches
- **Applies to:**
  - `main` (Produktions-Branch)
  - `dependabot/npm_and_yarn/dependencies-*` (Dependabot-Branches)
  - `temp-clean` (Temporäre Branches)

## Rules (Branch Protection Rules)

### 1. Restrict creations
- ✅ **Aktiviert:** Nur Benutzer mit Bypass-Berechtigung können passende Refs erstellen
- **Grund:** Verhindert unautorisierte Branch-Erstellung

### 2. Restrict updates
- ✅ **Aktiviert:** Nur Benutzer mit Bypass-Berechtigung können passende Refs aktualisieren
- **Grund:** Verhindert unautorisierte Updates

### 3. Restrict deletions
- ✅ **Aktiviert:** Nur Benutzer mit Bypass-Berechtigung können passende Refs löschen
- **Grund:** Verhindert versehentliches Löschen wichtiger Branches

### 4. Require linear history
- ⚠️ **Optional:** Verhindert Merge-Commits
- **Empfehlung:** Für `main` aktivieren, für Feature-Branches optional

### 5. Require deployments to succeed
- ✅ **Empfohlen:** Vercel Production-Deployment muss erfolgreich sein
- **Environments:** `production` (Vercel)

### 6. Require signed commits
- ⚠️ **Optional:** Commits müssen signiert sein
- **Empfehlung:** Für kritische Branches aktivieren

### 7. Require a pull request before merging
- ✅ **Aktiviert:** Alle Commits müssen über Pull Request
- **Grund:** Code-Review vor Merge

### 8. Required approvals
- **Anzahl:** 1 (mindestens)
- **Grund:** Mindestens eine Person muss Code-Review durchführen

### 9. Dismiss stale pull request approvals when new commits are pushed
- ✅ **Aktiviert:** Neue Commits setzen alte Approvals zurück
- **Grund:** Sicherstellt, dass neue Änderungen geprüft werden

### 10. Require review from Code Owners
- ✅ **Aktiviert:** Code-Owner müssen Pull Requests approven
- **Grund:** Wichtige Dateien werden von Experten geprüft

### 11. Require approval of the most recent reviewable push
- ✅ **Aktiviert:** Neuester Push muss approviert werden
- **Grund:** Verhindert, dass alte Approvals für neue Änderungen gelten

### 12. Require conversation resolution before merging
- ✅ **Aktiviert:** Alle Code-Kommentare müssen aufgelöst sein
- **Grund:** Sicherstellt, dass alle Diskussionen abgeschlossen sind

### 13. Automatically request Copilot code review
- ✅ **Aktiviert:** Automatische Copilot-Code-Review
- **Grund:** Zusätzliche AI-gestützte Code-Qualitätsprüfung

### 14. Allowed merge methods
- ✅ **Merge commits:** Erlaubt
- ✅ **Squash merging:** Erlaubt
- ✅ **Rebase merging:** Erlaubt
- **Grund:** Flexibilität bei Merge-Strategien

### 15. Require status checks to pass
- ✅ **Aktiviert:** Status-Checks müssen erfolgreich sein
- **Required Checks:**
  - `build` (Next.js Build)
  - `lint` (ESLint)
  - `type-check` (TypeScript)
  - `test` (Tests, falls vorhanden)

### 16. Block force pushes
- ✅ **Aktiviert:** Force-Pushes sind blockiert
- **Grund:** Verhindert Überschreibung der Git-Historie

### 17. Require code scanning results
- ⚠️ **Optional:** Code-Scanning-Ergebnisse erforderlich
- **Tools:**
  - **CodeQL:** Aktiviert
  - **Grund:** Sicherheits-Scanning

### 18. Require code quality results
- ⚠️ **Optional:** Code-Quality-Ergebnisse erforderlich
- **Severity:** Medium oder höher
- **Grund:** Code-Qualität sicherstellen

## Setup-Anleitung

### Schritt 1: Ruleset erstellen
1. Gehe zu: `https://github.com/u4231458123-droid/v0-header-component/settings/rules`
2. Klicke auf "New ruleset"
3. Wähle "New ruleset" → "Branch ruleset"

### Schritt 2: Ruleset konfigurieren
1. **Name:** `mydispatch`
2. **Enforcement status:** Aktiv
3. **Bypass List:** Alle oben genannten Apps und Rollen hinzufügen
4. **Target branches:** "All branches" oder spezifische Branches

### Schritt 3: Rules aktivieren
1. Alle oben genannten Rules aktivieren
2. Status-Checks konfigurieren
3. Code-Owners-Datei erstellen (falls nicht vorhanden)

### Schritt 4: Code Owners Datei erstellen
Erstelle `.github/CODEOWNERS`:
```
# Core System
/lib/ai/bots/ @mydispatch-team
/lib/cicd/ @mydispatch-team
/.github/workflows/ @mydispatch-team

# Database
/scripts/migrations/ @mydispatch-team
/types/supabase.ts @mydispatch-team

# Configuration
/vercel.json @mydispatch-team
/package.json @mydispatch-team
```

## Wichtige Hinweise

### ⚠️ KRITISCH: Bypass-Liste
- **Vercel MUSS** in der Bypass-Liste sein, sonst funktionieren automatische Deployments nicht!
- **Supabase MUSS** in der Bypass-Liste sein, sonst funktionieren Migrationen nicht!
- **Dependabot MUSS** in der Bypass-Liste sein, sonst funktionieren Dependency-Updates nicht!

### ⚠️ WICHTIG: Status-Checks
- Alle Status-Checks müssen in GitHub Actions definiert sein
- Vercel Deployment-Check muss konfiguriert sein
- Build-Check muss konfiguriert sein

### ⚠️ HINWEIS: Code-Owners
- Erstelle `.github/CODEOWNERS` Datei
- Definiere Code-Owner für kritische Bereiche
- Code-Owner müssen Repository-Zugriff haben

## Nächste Schritte

1. ⏳ Ruleset `mydispatch` erstellen
2. ⏳ Bypass-Liste konfigurieren
3. ⏳ Rules aktivieren
4. ⏳ Status-Checks konfigurieren
5. ⏳ Code-Owners-Datei erstellen
6. ⏳ Testen mit einem Test-Pull-Request

## Referenzen

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

