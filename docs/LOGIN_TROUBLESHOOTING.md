# Login Troubleshooting Guide

## Problem: "Supabase Umgebungsvariablen fehlen"

### Mögliche Ursachen

1. **Umgebungsvariablen nicht in Vercel gesetzt**
   - Lösung: Siehe `docs/VERCEL_ENV_VARS_CHECKLIST.md`

2. **Variablen nicht für alle Environments gesetzt**
   - Lösung: Stelle sicher, dass sie für Production, Preview UND Development gesetzt sind

3. **Variablen nicht als `NEXT_PUBLIC_` gesetzt**
   - Lösung: Variablen MÜSSEN mit `NEXT_PUBLIC_` beginnen, damit sie im Browser verfügbar sind

4. **Projekt nicht neu deployed nach Variablen-Änderung**
   - Lösung: Redeploy das Projekt in Vercel

5. **Vercel Supabase Integration vs. manuelle Variablen**
   - Wenn Vercel direkt mit Supabase verbunden ist, könnten die Variablen anders heißen
   - Lösung: Prüfe Vercel Dashboard → Settings → Integrations → Supabase

## Debug-Schritte

### 1. Prüfe verfügbare Umgebungsvariablen

Öffne: `https://[deine-vercel-url].vercel.app/api/debug/env`

Dies zeigt, welche Variablen verfügbar sind.

### 2. Prüfe Health Check

Öffne: `https://[deine-vercel-url].vercel.app/api/health/supabase`

Dies zeigt den Status der Supabase-Verbindung.

### 3. Prüfe Browser-Konsole

1. Öffne die Login-Seite
2. Öffne Browser DevTools (F12)
3. Gehe zu Console
4. Suche nach Fehlermeldungen

### 4. Prüfe Vercel Logs

1. Gehe zu Vercel Dashboard → Dein Projekt → Deployments
2. Klicke auf das neueste Deployment
3. Gehe zu "Logs"
4. Suche nach "Supabase" oder "environment variables"

## Vercel Supabase Integration

Wenn Vercel direkt mit Supabase verbunden ist:

1. **Prüfe Integration:**
   - Vercel Dashboard → Settings → Integrations → Supabase
   - Stelle sicher, dass die Integration aktiv ist

2. **Prüfe automatisch gesetzte Variablen:**
   - Vercel setzt möglicherweise Variablen automatisch
   - Diese könnten andere Namen haben
   - Prüfe: Settings → Environment Variables

3. **Manuelle Variablen hinzufügen:**
   - Auch wenn die Integration aktiv ist, müssen die Variablen manuell gesetzt werden
   - Siehe: `docs/VERCEL_ENV_VARS_CHECKLIST.md`

## Erforderliche Variablen

### MINDESTENS diese 3:

1. `NEXT_PUBLIC_SUPABASE_URL`
   - Wert: `https://ykfufejycdgwonrlbhzn.supabase.co`

2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Wert: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODQ0NjAsImV4cCI6MjA3OTU2MDQ2MH0.q4Zx-5bcDUWGKJbwqdQcy423thv6M5iZczM7M5SN8Y0`

3. `SUPABASE_SERVICE_ROLE_KEY`
   - Wert: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk4NDQ2MCwiZXhwIjoyMDc5NTYwNDYwfQ.j9vb-Vcp5VFpGTofFMkKgFP-wLVNtvlS1Cx0GDnll38`

## Wichtig

- ✅ Variablen müssen für **alle Environments** gesetzt sein
- ✅ Nach dem Setzen: **Redeploy erforderlich**
- ✅ `NEXT_PUBLIC_` Prefix ist **erforderlich** für Browser-Variablen
- ✅ Variablennamen müssen **exakt** sein (Groß-/Kleinschreibung beachten)

## Supabase Dashboard prüfen

1. Gehe zu Supabase Dashboard
2. Settings → API
3. Prüfe:
   - Project URL: `https://ykfufejycdgwonrlbhzn.supabase.co`
   - Anon Key: Sollte mit dem in Vercel gesetzten übereinstimmen

## Authentication Settings prüfen

1. Supabase Dashboard → Authentication → URL Configuration
2. Site URL: `https://[deine-vercel-url].vercel.app`
3. Redirect URLs: `https://[deine-vercel-url].vercel.app/auth/callback`

