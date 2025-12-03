# Vercel Environment Variables Setup - MyDispatch

## ⚠️ KRITISCH: Diese Variablen MÜSSEN in Vercel gesetzt werden!

**Schnell-Setup:** Siehe auch `docs/VERCEL_ENV_VARS_QUICK_SETUP.md` für Schritt-für-Schritt-Anleitung

### Supabase (ERFORDERLICH für Login und Datenbank)

1. Gehe zu: **Vercel Dashboard → Project Settings → Environment Variables**
2. Füge folgende Variablen hinzu:

#### Production, Preview, Development

```env
NEXT_PUBLIC_SUPABASE_URL=https://ykfufejycdgwonrlbhzn.supabase.co
```

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODQ0NjAsImV4cCI6MjA3OTU2MDQ2MH0.q4Zx-5bcDUWGKJbwqdQcy423thv6M5iZczM7M5SN8Y0
```

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk4NDQ2MCwiZXhwIjoyMDc5NTYwNDYwfQ.j9vb-Vcp5VFpGTofFMkKgFP-wLVNtvlS1Cx0GDnll38
```

### Vercel Webhook (ERFORDERLICH für Webhook-Sicherheit)

```env
VERCEL_WEBHOOK_SECRET=mbDmy0nOH2HjaK53lHX2gvLM
```

### Weitere Variablen (falls benötigt)

- `STRIPE_SECRET_KEY` - Für Zahlungen
- `STRIPE_PUBLISHABLE_KEY` - Für Zahlungen
- `HUGGINGFACE_API_KEY` - Für AI-Funktionen
- `ANTHROPIC_API_KEY` - Für AI-Funktionen
- `GEMINI_API_KEY` - Für AI-Funktionen
- `CRON_SECRET` - Für Cron Jobs

## Setup-Schritte

1. **Öffne Vercel Dashboard**
   - Gehe zu: https://vercel.com/mydispatchs-projects/v0-header-component/settings/environment-variables

2. **Füge jede Variable hinzu**
   - Klicke auf "Add New"
   - Wähle Environment (Production, Preview, Development)
   - Füge Name und Value ein
   - Klicke auf "Save"

3. **Redeploy nach Änderungen**
   - Nach dem Setzen der Variablen: **Redeploy** das Projekt
   - Oder warte auf den nächsten Push

## Wichtig

- ✅ **ALLE** drei Supabase-Variablen müssen gesetzt sein
- ✅ Variablen müssen für **alle Environments** (Production, Preview, Development) gesetzt werden
- ⚠️ Nach dem Setzen: **Redeploy** erforderlich
- ⚠️ Login funktioniert **NUR** wenn alle Variablen korrekt gesetzt sind

## Login-Problem beheben

Wenn Login nicht funktioniert:

1. ✅ Prüfe, ob alle 3 Supabase-Variablen in Vercel gesetzt sind
2. ✅ Prüfe, ob die Variablen für das richtige Environment gesetzt sind
3. ✅ Redeploy das Projekt nach dem Setzen der Variablen
4. ✅ Prüfe Vercel Logs für Fehlermeldungen
5. ✅ Prüfe Browser-Konsole für Client-seitige Fehler

## Verifizierung

Nach dem Setzen der Variablen:

1. **Redeploy** das Projekt
2. **Teste Login** auf der Live-Seite
3. **Prüfe Vercel Logs** für Fehler
4. **Prüfe Browser-Konsole** für Client-Fehler

Wenn alles korrekt ist, sollte der Login funktionieren!

