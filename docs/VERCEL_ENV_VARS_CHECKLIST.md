# ✅ Vercel Environment Variables - Checkliste

## ⚠️ KRITISCH: Diese Variablen MÜSSEN in Vercel gesetzt werden!

**Projekt-Ref:** `ykfufejycdgwonrlbhzn`

---

## 📋 Schritt-für-Schritt Anleitung

### 1. Vercel Dashboard öffnen
- Gehe zu: **Vercel Dashboard → Dein Projekt → Settings → Environment Variables**
- Oder direkt: `https://vercel.com/[dein-team]/[dein-projekt]/settings/environment-variables`

### 2. Für JEDE Variable:
- Klicke auf **"Add New"**
- Wähle **Environment:** ✅ Production, ✅ Preview, ✅ Development (alle drei!)
- Füge **Name** und **Value** ein
- Klicke auf **"Save"**

---

## 🔑 Erforderliche Variablen (MINDESTENS diese 3!)

### ✅ Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://ykfufejycdgwonrlbhzn.supabase.co
Environment: Production, Preview, Development
```

### ✅ Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODQ0NjAsImV4cCI6MjA3OTU2MDQ2MH0.q4Zx-5bcDUWGKJbwqdQcy423thv6M5iZczM7M5SN8Y0
Environment: Production, Preview, Development
```

### ✅ Variable 3: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnVmZWp5Y2Rnd29ucmxiaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk4NDQ2MCwiZXhwIjoyMDc5NTYwNDYwfQ.j9vb-Vcp5VFpGTofFMkKgFP-wLVNtvlS1Cx0GDnll38
Environment: Production, Preview, Development
```

---

## 🔧 Optionale, aber empfohlene Variablen

### Variable 4: SUPABASE_JWT_SECRET
```
Name: SUPABASE_JWT_SECRET
Value: qA/FVx0XbRVj1BeNr0ZfX6oTcvhTaKs4S9NUcJBa6PBUr2Ec6/lFJiNDE3p6OnzgE421MyIaGlF9Q8f8rduxYw==
Environment: Production, Preview, Development
```

### Variable 5: NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
```
Name: NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
Value: https://[deine-vercel-url].vercel.app/auth/callback
Environment: Production, Preview, Development
```
**Hinweis:** Ersetze `[deine-vercel-url]` mit deiner tatsächlichen Vercel-URL!

### Variable 6-8: Postgres (falls benötigt)
```
Name: POSTGRES_PASSWORD
Value: BYhr9zh4vOTsDXkm
Environment: Production, Preview, Development

Name: POSTGRES_PRISMA_URL
Value: postgres://postgres.ykfufejycdgwonrlbhzn:BYhr9zh4vOTsDXkm@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
Environment: Production, Preview, Development

Name: POSTGRES_URL
Value: postgres://postgres.ykfufejycdgwonrlbhzn:BYhr9zh4vOTsDXkm@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
Environment: Production, Preview, Development
```

---

## ✅ Nach dem Setzen der Variablen

1. **Redeploy das Projekt:**
   - Gehe zu: **Deployments** Tab
   - Klicke auf die **drei Punkte** (⋯) beim neuesten Deployment
   - Wähle **"Redeploy"**
   - Oder: Warte auf den nächsten Git Push (automatisches Redeploy)

2. **Teste die Verbindung:**
   - Öffne: `https://[deine-vercel-url].vercel.app/api/health/supabase`
   - Erwartete Antwort: `{"status":"success",...}`

3. **Teste den Login:**
   - Gehe zu: `https://[deine-vercel-url].vercel.app/auth/login`
   - Versuche dich anzumelden

---

## 🔍 Troubleshooting

### Problem: "Supabase Umgebungsvariablen fehlen"
**Lösung:**
- Prüfe, ob alle 3 erforderlichen Variablen gesetzt sind
- Prüfe, ob sie für **alle Environments** (Production, Preview, Development) gesetzt sind
- **Redeploy** das Projekt nach dem Setzen

### Problem: Login funktioniert nicht
**Lösung:**
1. Prüfe Browser-Konsole auf Fehler
2. Prüfe Vercel Logs (Deployments → Logs)
3. Prüfe Supabase Dashboard → Authentication → URL Configuration:
   - Site URL: `https://[deine-vercel-url].vercel.app`
   - Redirect URLs: `https://[deine-vercel-url].vercel.app/auth/callback`

### Problem: Build schlägt fehl
**Lösung:**
- Stelle sicher, dass `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` gesetzt sind
- Diese werden während des Builds benötigt

---

## 📝 Checkliste zum Abhaken

- [ ] `NEXT_PUBLIC_SUPABASE_URL` gesetzt (Production, Preview, Development)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` gesetzt (Production, Preview, Development)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` gesetzt (Production, Preview, Development)
- [ ] Projekt wurde **Redeployed**
- [ ] Health Check funktioniert: `/api/health/supabase`
- [ ] Login funktioniert: `/auth/login`
- [ ] Supabase Redirect URLs konfiguriert

---

## 🎯 Wichtig

- ✅ **ALLE** drei erforderlichen Variablen müssen gesetzt sein
- ✅ Variablen müssen für **alle Environments** gesetzt werden
- ✅ Nach dem Setzen: **Redeploy** erforderlich!
- ⚠️ **Service Role Key** NUR im Backend - NIEMALS im Browser verwenden!

