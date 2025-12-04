# CPO - Supabase Vollständige Datenbank-Analyse

**Datum:** 2024  
**Rolle:** CPO & Lead Architect  
**Status:** ✅ Analyse abgeschlossen

---

## DATENBANK-STRUKTUR

### Identifizierte SQL-Migrations-Dateien (42 Dateien)

**Kern-Schema:**
1. `001_create_core_schema.sql` - Basis-Tabellen (companies, profiles, customers, drivers, vehicles, bookings, invoices)
2. `002_create_triggers.sql` - Auto-update Timestamps, User-Signup-Trigger
3. `003_create_functions.sql` - Dashboard-Stats-Funktion
4. `006_add_subscription_system.sql` - Subscription-Felder, Master-Admin (⚠️ DSGVO-Verletzung)
5. `010_fix_rls_infinite_recursion.sql` - RLS-Fixes, Helper-Funktionen
6. `011_create_wiki_system.sql` - Wiki-System (Kategorien, Dokumente, Fehlerlog, Changelog, Todos, Prompts)

**Erweiterte Schemas:**
7. `015_create_quotes_cashbook.sql` - Angebote und Kassenbuch
8. `021_partner_system.sql` - Partner-System (⚠️ Master-Admin-Referenzen)
9. `022_vehicle_extended_schema.sql` - Erweiterte Fahrzeug-Felder
10. `023_driver_extended_schema.sql` - Erweiterte Fahrer-Felder
11. `027_extended_company_fields.sql` - Erweiterte Firmen-Felder
12. `030_add_driver_credentials.sql` - Fahrer-Zugangsdaten

**DSGVO & Compliance:**
13. `029_remove_master_admin_policies.sql` - Entfernt Master-Admin-Policies
14. `031_fix_dsgvo_company_separation.sql` - **KRITISCH** - DSGVO-konforme Trennung
15. `032_employee_documents.sql` - Mitarbeiter-Dokumenten-System
16. `033_add_created_updated_by.sql` - Bearbeiter-Tracking
17. `034_extend_profiles_schema.sql` - Erweiterte Profile-Felder

**Weitere Migrations:**
18. `035_create_documentation_table.sql` - Dokumentations-Tabelle
19. `036_optimize_security_advisors.sql` - Security-Optimierungen
20. `037_extend_employee_document_types.sql` - Erweiterte Mitarbeiter-Dokument-Typen
21. `migrations/000_initialize_complete_schema.sql` - Vollständiges Schema
22. `migrations/001_optimize_dashboard_stats.sql` - Dashboard-Stats-Optimierung
23. `migrations/002_create_messaging_system.sql` - Messaging-System
24. `migrations/017_extend_chat_messages_for_files_and_audio.sql` - Chat-Erweiterungen

---

## TABELLEN-ÜBERSICHT

### Kern-Tabellen

**companies**
- Multi-Tenant Root
- Subscription-Felder (status, tier, stripe_customer_id, stripe_subscription_id)
- Landingpage-Konfiguration (slug, logo_url, landingpage_enabled, widget_enabled)
- Limits (driver_limit, vehicle_limit)

**profiles**
- User-Management
- Rollen: 'master', 'admin', 'dispatcher', 'driver', 'customer'
- Erweiterte Felder (Migration 034): salutation, title, date_of_birth, nationality, address_data, phone_mobile, employment_data

**customers**
- Kundendaten
- company_id (Multi-Tenant)

**drivers**
- Fahrerdaten
- Erweiterte Felder (Migration 023): salutation, title, date_of_birth, address_data, license_classes, pbef_data, employment_data

**vehicles**
- Fahrzeugdaten
- Erweiterte Felder (Migration 022): insurance_data, maintenance_data

**bookings**
- Buchungen/Aufträge
- Bearbeiter-Tracking (Migration 033): created_by, updated_by

**invoices**
- Rechnungen
- Bearbeiter-Tracking (Migration 033): created_by, updated_by

**quotes**
- Angebote
- Bearbeiter-Tracking (Migration 033): created_by, updated_by

**quote_items**
- Angebots-Positionen

**cash_book_entries**
- Kassenbuch-Einträge

### System-Tabellen

**documents**
- Dokumente (Fahrer, Mitarbeiter, Unternehmen)
- owner_type: 'driver', 'company', 'employee' (Migration 032)
- profile_id für Mitarbeiter-Zuordnung (Migration 032)

**subscription_plans**
- Tarifpläne

**partner_connections**
- Partner-Verbindungen

**partner_bookings**
- Partner-Buchungen

**partner_booking_history**
- Partner-Buchungs-Historie

**communication_log**
- Kommunikations-Log

**chat_conversations**
- Chat-Konversationen

**chat_messages**
- Chat-Nachrichten (mit Files und Audio - Migration 017)

**documentation**
- Dokumentations-Tabelle (Migration 035)

### Wiki-System (Migration 011)

**wiki_categories**
- Wiki-Kategorien

**wiki_documents**
- Wiki-Dokumente

**wiki_document_versions**
- Wiki-Versionen

**wiki_error_log**
- Fehlerprotokoll (niemals löschen!)

**wiki_changelog**
- Changelog

**wiki_todos**
- ToDo-System

**wiki_prompts**
- Prompts-Sammlung

---

## RLS-POLICIES

### Status: ⚠️ Teilweise DSGVO-Verletzungen gefunden

**Gefundene Master-Admin-Policies (SOLLTEN ENTFERNT WERDEN):**
- `scripts/006_add_subscription_system.sql`: Master-Admin-Policies für profiles und companies
- `scripts/010_fix_rls_infinite_recursion.sql`: `profiles_master_admin_all` Policy
- `scripts/021_partner_system.sql`: Master-Admin-Referenzen in Policies
- `scripts/008_complete_system_schema.sql`: Master-Admin-Rollen-Checks

**DSGVO-konforme Policies (Migration 031):**
- ✅ Alle Master-Admin-Policies entfernt
- ✅ Strikte company-basierte Trennung
- ✅ `auth_user_company_id()` Helper-Funktion
- ✅ `auth_user_is_owner()` Helper-Funktion (nur für Owner)

**Aktuelle Policies-Struktur:**
- **profiles**: `profiles_select_own`, `profiles_select_company`, `profiles_update_own`, `profiles_insert_own`
- **companies**: `companies_select_own`, `companies_public_landing`
- **Alle anderen Tabellen**: Company-basierte Policies

---

## FUNKTIONEN

### Helper-Funktionen

**auth_user_company_id()**
- Gibt company_id des aktuellen Users zurück
- SECURITY DEFINER, STABLE

**auth_user_is_owner()**
- Prüft ob User Owner des eigenen Unternehmens ist
- SECURITY DEFINER, STABLE
- **Ersetzt** `auth_is_master_admin()` (DSGVO-konform)

**get_my_company_id()**
- Alias für `auth_user_company_id()`
- SECURITY DEFINER, STABLE

**get_dashboard_stats(target_company_id, target_date)**
- Dashboard-Statistiken für ein Unternehmen
- SECURITY DEFINER

**set_updated_by()**
- Setzt `updated_by` automatisch bei UPDATE
- Trigger-Funktion (Migration 033)

**update_updated_at_column()**
- Setzt `updated_at` automatisch bei UPDATE
- Trigger-Funktion

**handle_new_user()**
- Erstellt automatisch Profile bei User-Signup
- Trigger-Funktion

### Messaging-Funktionen (Migration 002)

**can_send_message()**
- Prüft ob Nachricht gesendet werden kann

**get_or_create_conversation()**
- Erstellt oder holt Konversation

**update_conversation_on_message()**
- Aktualisiert Konversation bei neuer Nachricht

### **ENTFERNTE FUNKTIONEN (DSGVO-Verletzung):**

**auth_is_master_admin()** - ❌ ENTFERNT (Migration 031)
**is_master_admin()** - ❌ ENTFERNT (Migration 031)

---

## TRIGGER

### Auto-Update-Trigger

**update_*_updated_at**
- Setzt `updated_at` automatisch bei UPDATE
- Für: companies, profiles, customers, drivers, vehicles, bookings, invoices

**trigger_*_updated_by**
- Setzt `updated_by` automatisch bei UPDATE (Migration 033)
- Für: bookings, invoices, quotes

**on_auth_user_created**
- Erstellt automatisch Profile bei User-Signup
- Trigger auf `auth.users`

---

## DSGVO-COMPLIANCE-STATUS

### ✅ Implementiert

1. **Strikte company-basierte Trennung** (Migration 031)
   - Alle Master-Admin-Policies entfernt
   - Nur company-basierte RLS-Policies

2. **Bearbeiter-Tracking** (Migration 033)
   - `created_by` und `updated_by` in bookings, invoices, quotes
   - Automatische Trigger für `updated_by`

3. **Mitarbeiter-Dokumente** (Migration 032)
   - Dokumente für Mitarbeiter (owner_type = 'employee')
   - RLS-Policies für Mitarbeiter-Dokumente

4. **Erweiterte Profile** (Migration 034)
   - Vollständige Profil-Daten für Mitarbeiter
   - Analog zu Fahrern

### ⚠️ Noch zu prüfen

1. **Master-Admin-Referenzen in älteren Migrations**
   - `scripts/021_partner_system.sql`: Master-Admin-Checks
   - `scripts/008_complete_system_schema.sql`: Master-Admin-Rollen-Checks

2. **Wiki-System RLS**
   - Aktuell: "Jeder kann lesen, nur Master-Admins können schreiben"
   - **Sollte geändert werden**: Company-basierte RLS

---

## MIGRATIONS-REIHENFOLGE (EMPFOHLEN)

1. **001_create_core_schema.sql** - Basis-Schema
2. **002_create_triggers.sql** - Trigger
3. **003_create_functions.sql** - Funktionen
4. **006_add_subscription_system.sql** - Subscription (⚠️ Master-Admin-Policies entfernen)
5. **010_fix_rls_infinite_recursion.sql** - RLS-Fixes (⚠️ Master-Admin-Policy entfernen)
6. **011_create_wiki_system.sql** - Wiki-System
7. **015_create_quotes_cashbook.sql** - Angebote
8. **021_partner_system.sql** - Partner-System (⚠️ Master-Admin-Referenzen entfernen)
9. **022_vehicle_extended_schema.sql** - Fahrzeuge erweitert
10. **023_driver_extended_schema.sql** - Fahrer erweitert
11. **027_extended_company_fields.sql** - Firmen erweitert
12. **029_remove_master_admin_policies.sql** - Master-Admin-Policies entfernen
13. **030_add_driver_credentials.sql** - Fahrer-Zugangsdaten
14. **031_fix_dsgvo_company_separation.sql** - **KRITISCH** - DSGVO-Fix
15. **032_employee_documents.sql** - Mitarbeiter-Dokumente
16. **033_add_created_updated_by.sql** - Bearbeiter-Tracking
17. **034_extend_profiles_schema.sql** - Profile erweitert
18. **035_create_documentation_table.sql** - Dokumentation
19. **036_optimize_security_advisors.sql** - Security
20. **037_extend_employee_document_types.sql** - Dokument-Typen

---

## KRITISCHE HINWEISE

### DSGVO-Verletzungen

1. **Master-Admin-Policies** (Migration 031 behebt dies)
   - ❌ `scripts/006_add_subscription_system.sql`: Master-Admin-Policies
   - ❌ `scripts/010_fix_rls_infinite_recursion.sql`: Master-Admin-Policy
   - ❌ `scripts/021_partner_system.sql`: Master-Admin-Referenzen

2. **Master-Admin-Funktionen** (Migration 031 behebt dies)
   - ❌ `auth_is_master_admin()` - ENTFERNT
   - ❌ `is_master_admin()` - ENTFERNT

### Empfohlene Änderungen

1. **Wiki-System RLS** (Migration 011)
   - Aktuell: "Jeder kann lesen, nur Master-Admins können schreiben"
   - **Sollte geändert werden**: Company-basierte RLS

2. **Partner-System** (Migration 021)
   - Master-Admin-Referenzen entfernen
   - Company-basierte Policies verwenden

---

## NÄCHSTE SCHRITTE

1. ⏳ Prüfung ob Migration 031 bereits ausgeführt wurde
2. ⏳ Prüfung ob alle Master-Admin-Referenzen entfernt wurden
3. ⏳ Wiki-System RLS anpassen (company-basiert)
4. ⏳ Partner-System Master-Admin-Referenzen entfernen

---

**Erstellt von:** CPO & Lead Architect  
**Datum:** 2024
