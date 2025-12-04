# SQL-Migration Anleitung

## Uebersicht

Diese Anleitung beschreibt die manuelle Ausfuehrung der SQL-Migration-Scripts zur vollstaendigen Entfernung aller Master-Admin-Funktionalitaet und Einrichtung des Nexify Business-Accounts.

---

## WICHTIG: Voraussetzungen

1. **Zugriff auf Supabase Dashboard** mit Admin-Rechten
2. **Backup der Datenbank** vor Ausfuehrung (empfohlen)
3. **Verfuegbare Zeit** fuer beide Scripts (ca. 5-10 Minuten)

---

## Schritt 1: Master-Admin-Policies entfernen

### Script: `scripts/029_remove_master_admin_policies.sql`

**Zweck:** Entfernt alle Row Level Security (RLS) Policies, die speziell fuer Master-Admin-Accounts erstellt wurden.

**Ausfuehrung:**

1. Oeffne Supabase Dashboard
2. Navigiere zu: **SQL Editor**
3. Kopiere den gesamten Inhalt von `scripts/029_remove_master_admin_policies.sql`
4. Fuege das Script in den SQL Editor ein
5. Klicke auf **Run** (oder druecke `Ctrl+Enter`)

**Erwartetes Ergebnis:**
- Alle Master-Admin-Policies werden geloescht
- Verifizierungs-Query am Ende zeigt: **Keine Policies mehr vorhanden**

**Hinweis:** Falls Fehler auftreten (z.B. "Policy does not exist"), ist das normal - das Script prueft bereits ob Policies existieren.

---

## Schritt 2: Nexify Business-Account erstellen

### Script: `scripts/028_create_nexify_account.sql`

**Zweck:** Erstellt das Nexify Business-Unternehmen und konfiguriert es fuer `login.nexify@gmail.com`.

**Ausfuehrung:**

1. Oeffne Supabase Dashboard
2. Navigiere zu: **SQL Editor**
3. Kopiere den gesamten Inhalt von `scripts/028_create_nexify_account.sql`
4. Fuege das Script in den SQL Editor ein
5. Klicke auf **Run** (oder druecke `Ctrl+Enter`)

**Erwartetes Ergebnis:**
- Unternehmen "Nexify" wird erstellt (ID: `nexify-company-0001`)
- Subscription: Business-Tarif, Status: active
- Limits: Unbegrenzt (Fahrer & Fahrzeuge)
- Verifizierungs-Query am Ende zeigt das erstellte Unternehmen

**WICHTIG:** Das Script aktualisiert nur das Profil, falls es bereits existiert. Der Auth-User muss **manuell** erstellt werden (siehe Schritt 3).

---

## Schritt 3: Auth-User erstellen (Manuell)

**Zweck:** Erstellt den Auth-User fuer `login.nexify@gmail.com` in Supabase Authentication.

**Ausfuehrung:**

1. Oeffne Supabase Dashboard
2. Navigiere zu: **Authentication** → **Users**
3. Klicke auf **Add User** (oder **Create User**)
4. Fuelle die Felder aus:
   - **Email:** `login.nexify@gmail.com`
   - **Password:** `1def!xO2022!!`
   - **Email Confirmed:** ✅ Ja (wichtig!)
5. Klicke auf **Create User**

**Hinweis:** Nach dem ersten Login wird automatisch ein Profil erstellt (via Supabase Auth Trigger), das dann mit dem Unternehmen verknuepft wird.

---

## Schritt 4: Verifizierung

### Pruefe Unternehmen

```sql
SELECT 
  c.id,
  c.name,
  c.email,
  c.subscription_tier,
  c.subscription_status,
  c.driver_limit,
  c.vehicle_limit
FROM companies c
WHERE c.id = 'nexify-company-0001';
```

**Erwartetes Ergebnis:**
- Name: "Nexify"
- Email: "login.nexify@gmail.com"
- Subscription Tier: "business"
- Subscription Status: "active"
- Driver Limit: -1 (unbegrenzt)
- Vehicle Limit: -1 (unbegrenzt)

### Pruefe Profil

```sql
SELECT 
  p.email,
  p.role,
  p.company_id,
  c.name as company_name
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
WHERE p.email = 'login.nexify@gmail.com';
```

**Erwartetes Ergebnis:**
- Email: "login.nexify@gmail.com"
- Role: "owner"
- Company ID: "nexify-company-0001"
- Company Name: "Nexify"

### Pruefe Master-Admin-Policies

```sql
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE policyname ILIKE '%master%admin%'
   OR policyname ILIKE '%master_admin%'
ORDER BY tablename, policyname;
```

**Erwartetes Ergebnis:**
- **Keine Zeilen** (alle Policies wurden entfernt)

---

## Fehlerbehebung

### Problem: "Policy does not exist"

**Loesung:** Das ist normal - das Script prueft bereits ob Policies existieren. Ignoriere diese Meldung.

### Problem: "User already exists"

**Loesung:** Der Auth-User existiert bereits. Pruefe ob das Profil korrekt mit dem Unternehmen verknuepft ist (siehe Schritt 4).

### Problem: "Company already exists"

**Loesung:** Das Script verwendet `ON CONFLICT`, daher wird das Unternehmen aktualisiert statt neu erstellt. Das ist korrekt.

---

## Rollback (Falls noetig)

Falls ein Rollback noetig ist, fuehre folgende Schritte aus:

1. **Loesche Nexify-Unternehmen:**
```sql
DELETE FROM companies WHERE id = 'nexify-company-0001';
```

2. **Loesche Nexify-Profil:**
```sql
DELETE FROM profiles WHERE email = 'login.nexify@gmail.com';
```

3. **Loesche Auth-User:**
- Supabase Dashboard → Authentication → Users
- Suche nach `login.nexify@gmail.com`
- Klicke auf **Delete User**

**HINWEIS:** Master-Admin-Policies koennen nicht automatisch wiederhergestellt werden. Falls noetig, muessen sie manuell neu erstellt werden.

---

## Status

- ✅ Script 029: Bereit zur Ausfuehrung
- ✅ Script 028: Bereit zur Ausfuehrung
- ⚠️  Auth-User: Muss manuell erstellt werden
- ✅ Verifizierung: Queries bereitgestellt

---

**Erstellt:** 2025-01-03  
**Letzte Aktualisierung:** 2025-01-03

