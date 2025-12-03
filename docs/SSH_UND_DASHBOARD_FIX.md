# SSH Setup & Dashboard 404 Fix

## Problem 1: SSH-Verbindung zu GitHub

**Status:** ⚠️ Terminal-Verbindungen funktionieren nicht zuverlässig

**Lösung:** Manuelle SSH-Einrichtung mit `GITHUB_SSH_EINRICHTUNG.txt`

### Schnellstart:

1. Öffne PowerShell
2. Führe die Befehle aus `GITHUB_SSH_EINRICHTUNG.txt` aus
3. Füge den öffentlichen Schlüssel zu GitHub hinzu
4. Stelle Git Remote auf SSH um: `git remote set-url origin git@github.com:u4231458123-droid/v0-header-component.git`

---

## Problem 2: Dashboard 404 nach Login

**Symptom:** Nach Login wird `/dashboard` mit 404-Fehler angezeigt

### Mögliche Ursachen:

1. **Master-Account hat kein Profil/Company**
   - Das Dashboard benötigt `companyId` für Datenabfragen
   - Master-Account sollte trotzdem Zugang haben, auch ohne Company

2. **Next.js Build-Problem**
   - Dashboard-Route wird nicht korrekt kompiliert
   - Lösung: `npm run build` prüfen

3. **Middleware-Redirect-Problem**
   - Middleware könnte Dashboard-Zugriff blockieren
   - Prüfe `middleware.ts` und `lib/supabase/middleware.ts`

### Analyse:

**Dashboard-Route:** `app/dashboard/page.tsx` ✅ existiert
**Layout:** `app/dashboard/layout.tsx` ✅ existiert
**Export:** `export default async function DashboardPage()` ✅ korrekt

**Problem:** Master-Account (`courbois1981@gmail.com`) hat möglicherweise:
- Kein `profile` in `profiles` Tabelle
- Kein `company_id`
- Dashboard versucht Daten zu laden, aber `companyId` ist `undefined`

### Fix-Strategie:

1. **Master-Account sollte auch ohne Company funktionieren**
   - Dashboard sollte leere Stats anzeigen, nicht 404
   - Prüfe ob `companyId` undefined ist und handle das korrekt

2. **Fallback für Master-Account**
   - Wenn `profile` oder `companyId` fehlt, zeige leeres Dashboard
   - Keine Weiterleitung, keine 404

### Code-Änderung erforderlich:

In `app/dashboard/page.tsx` Zeile ~200:

```typescript
// AKTUELL:
const companyId = profile?.company_id

// FIX: Master-Account sollte auch ohne Company funktionieren
let companyId = profile?.company_id

// Wenn Master-Account und kein Company, setze companyId auf null (nicht undefined)
if (isMasterAccount && !companyId) {
  companyId = null // Explizit null statt undefined
}
```

Und dann in den Datenabfragen:

```typescript
// AKTUELL:
if (companyId) {
  // ... Daten laden
}

// FIX: Master-Account ohne Company sollte trotzdem Dashboard sehen
if (companyId || isMasterAccount) {
  // ... Daten laden (mit Fallback für Master ohne Company)
  if (!companyId && isMasterAccount) {
    // Zeige leeres Dashboard für Master
    stats = { /* leere Stats */ }
  }
}
```

---

## Nächste Schritte:

1. ✅ SSH-Key-Pair generieren (manuell mit `GITHUB_SSH_EINRICHTUNG.txt`)
2. ✅ Öffentlichen Schlüssel zu GitHub hinzufügen
3. ✅ Git Remote auf SSH umstellen
4. 🔧 Dashboard-Fix implementieren (Master-Account ohne Company)
5. 🔧 Testen: Login mit Master-Account → Dashboard sollte laden
6. 🔧 Committen und Pushen via SSH

---

**Erstellt:** 2025-01-XX
**Status:** 🔄 In Bearbeitung

