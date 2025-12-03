# Nexify-Account Setup - Vollständige Anleitung

## Übersicht

Dieses Dokument beschreibt die vollständige Einrichtung des neuen Nexify-Business-Accounts (`nexify.login@gmail.com`) und die Entfernung aller Master-Account-Sonderregeln.

## Schritt 1: SQL-Migration ausführen

### Datei
`scripts/028_create_nexify_account.sql`

### Ausführung
1. Öffne Supabase Dashboard
2. Gehe zu SQL Editor
3. Führe `scripts/028_create_nexify_account.sql` aus
4. Prüfe Verifizierungs-Query am Ende

### Was wird erstellt?
- ✅ Unternehmen "Nexify" mit ID `nexify-company-0001`
- ✅ Subscription: Business-Tarif, Status: active
- ✅ Limits: Unbegrenzt (Fahrer & Fahrzeuge)
- ✅ Profile wird aktualisiert (falls vorhanden)

## Schritt 2: Auth-User erstellen

### In Supabase Dashboard
1. Gehe zu **Authentication** → **Users**
2. Klicke auf **Add User** → **Create new user**
3. Fülle aus:
   - **Email**: `nexify.login@gmail.com`
   - **Password**: `1def!xO2022!!`
   - **Auto Confirm User**: ✅ Ja
   - **Send confirmation email**: ❌ Nein (optional)

### Alternative: Via Supabase CLI
```bash
supabase auth admin create-user \
  --email nexify.login@gmail.com \
  --password "1def!xO2022!!" \
  --email-confirm true
```

## Schritt 3: Testen

### Login testen
1. Öffne `https://www.my-dispatch.de/auth/login`
2. Login mit:
   - Email: `nexify.login@gmail.com`
   - Passwort: `1def!xO2022!!`
3. Erwartetes Verhalten:
   - ✅ Weiterleitung zu `/dashboard`
   - ✅ Dashboard lädt korrekt
   - ✅ Keine Fehler

### Einstellungen testen
1. Gehe zu `/einstellungen`
2. Erwartetes Verhalten:
   - ✅ Seite lädt ohne Fehler
   - ✅ Alle Tabs funktionieren
   - ✅ Speichern funktioniert

## Schritt 4: Code-Bereinigung (bereits durchgeführt)

### Entfernte Master-Account-Logik
- ✅ `app/dashboard/page.tsx` - Master-Account-Checks entfernt
- ✅ `app/dashboard/layout.tsx` - `isMasterAccount` Funktion entfernt
- ✅ `app/auth/login/page.tsx` - Master-Account-Redirect entfernt
- ✅ `lib/subscription-server.ts` - `MASTER_ACCOUNT_EMAILS` entfernt
- ✅ `lib/tier-guard.tsx` - Master-Admin nur noch Role-Check
- ✅ `app/admin/page.tsx` - Master-Email-Check entfernt
- ✅ `app/mydispatch/page.tsx` - Master-Email-Check durch Role-Check ersetzt
- ✅ `components/layout/AppSidebar.tsx` - Master-Account-Email-Checks entfernt
- ✅ `app/api/team/invite/route.ts` - Master-Account-Check entfernt
- ✅ `lib/subscription.ts` - `MASTER_ACCOUNT_EMAILS` entfernt

### Verbleibende Master-Admin-Funktionalität
- ✅ Admin-Bereiche (`/admin`, `/mydispatch`) nutzen nur noch Role-Check
- ✅ Master-Admin wird über `role === "master_admin"` oder `role === "master"` erkannt
- ✅ Keine E-Mail-basierten Checks mehr

## Schritt 5: QualityBot-Integration (neu)

### Automatische Prüfung
Der QualityBot prüft jetzt automatisch:
- ✅ Design-Vorgaben (Farben, Abstände, rounded-Klassen)
- ✅ UI-Konsistenz (UI-Library-Imports)
- ✅ Code-Qualität (Null-Checks, Error-Handling)
- ✅ Text-Qualität (SEO, Nutzerfreundlichkeit)

### Automatische Behebung
Der QualityBot behebt automatisch:
- ✅ Hardcoded Farben → Design-Tokens
- ✅ Falsche rounded-Klassen
- ✅ Falsche gap-Werte

### Verwendung
```bash
# Manuell prüfen
npm run quality:check app/dashboard/page.tsx
```

## Nächste Schritte

1. ✅ SQL-Migration ausführen
2. ✅ Auth-User erstellen
3. ✅ Login testen
4. ✅ Einstellungen testen
5. ⏳ Optional: `courbois1981@gmail.com` aus Datenbank entfernen (nach Bestätigung)

## Troubleshooting

### Login funktioniert nicht
- Prüfe ob Auth-User erstellt wurde
- Prüfe ob Profile `company_id` hat
- Prüfe ob Subscription Status "active" ist

### Dashboard zeigt Fehler
- Prüfe Browser-Konsole
- Prüfe Supabase Logs
- Prüfe ob `company_id` im Profile gesetzt ist

### Einstellungen zeigen Fehler
- Prüfe ob `company` Daten vorhanden sind
- Prüfe Null-Checks in `SettingsPageClient.tsx`
- Prüfe Error-Boundary

---

**Status**: ✅ Setup-Anleitung vollständig
**Letzte Aktualisierung**: 2025-01-03

