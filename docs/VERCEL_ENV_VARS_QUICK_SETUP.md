# Vercel Environment Variables - Schnell-Setup

## ⚠️ KRITISCH: Diese Variablen MÜSSEN gesetzt werden!

### Schritt 1: Vercel Dashboard öffnen

1. Gehe zu: **https://vercel.com/mydispatchs-projects/v0-header-component/settings/environment-variables**
2. Oder: Vercel Dashboard → `v0-header-component` → Settings → Environment Variables

### Schritt 2: Variablen hinzufügen

Klicke für **jede** Variable auf **"Add New"** und setze sie für **Production, Preview UND Development**:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL

- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://ykfufejycdgwonrlbhzn.supabase.co`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Klicke:** "Save"

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY

- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODQ0NjAsImV4cCI6MjA3OTU2MDQ2MH0.q4Zx-5bcDUWGKJbwqdQcy423thv6M5iZczM7M5SN8Y0`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Klicke:** "Save"

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY

- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk4NDQ2MCwiZXhwIjoyMDc5NTYwNDYwfQ.j9vb-Vcp5VFpGTofFMkKgFP-wLVNtvlS1Cx0GDnll38`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Klicke:** "Save"

#### Variable 4: VERCEL_WEBHOOK_SECRET (Optional, aber empfohlen)

- **Name:** `VERCEL_WEBHOOK_SECRET`
- **Value:** `mbDmy0nOH2HjaK53lHX2gvLM`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Klicke:** "Save"

### Schritt 3: Redeploy

Nach dem Setzen aller Variablen:

1. Gehe zu: **Deployments** Tab
2. Klicke auf die **drei Punkte** (⋯) beim neuesten Deployment
3. Wähle **"Redeploy"**
4. Oder: Warte auf den nächsten Git Push (automatisches Redeploy)

### Schritt 4: Verifizierung

Nach dem Redeploy:

1. ✅ Öffne die Live-Seite
2. ✅ Teste den Login
3. ✅ Prüfe Browser-Konsole (F12) für Fehler
4. ✅ Prüfe Vercel Logs für Backend-Fehler

## Checkliste

- [ ] `NEXT_PUBLIC_SUPABASE_URL` gesetzt
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` gesetzt
- [ ] `SUPABASE_SERVICE_ROLE_KEY` gesetzt
- [ ] Alle Variablen für Production, Preview UND Development gesetzt
- [ ] Redeploy durchgeführt
- [ ] Login getestet

## Troubleshooting

### "Supabase Umgebungsvariablen fehlen" Fehler

**Ursache:** Variablen nicht gesetzt oder nicht für alle Environments gesetzt

**Lösung:**
1. Prüfe, ob alle 3 Variablen in Vercel gesetzt sind
2. Prüfe, ob sie für **alle** Environments (Production, Preview, Development) gesetzt sind
3. Redeploy nach dem Setzen

### Login funktioniert nicht

**Ursache:** Falsche Keys oder fehlende Variablen

**Lösung:**
1. Prüfe Vercel Logs für Fehlermeldungen
2. Prüfe Browser-Konsole (F12) für Client-Fehler
3. Stelle sicher, dass alle Keys korrekt kopiert wurden (keine Leerzeichen!)

### Variablen werden nicht übernommen

**Ursache:** Kein Redeploy nach dem Setzen

**Lösung:**
1. Redeploy manuell durchführen
2. Oder warte auf nächsten Git Push

## Direkter Link

**Vercel Environment Variables:**
https://vercel.com/mydispatchs-projects/v0-header-component/settings/environment-variables

