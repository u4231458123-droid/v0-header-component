# CPO - Supabase Datenbank-Analyse

**Datum:** 2024  
**Rolle:** CPO & Lead Architect  
**Status:** ⏳ Analyse läuft

---

## SUPABASE-DATENBANK-STRUKTUR

### Identifizierte SQL-Migrations-Dateien

**Kern-Schema:**
- `001_create_core_schema.sql` - Basis-Tabellen
- `002_create_triggers.sql` - Trigger-Funktionen
- `003_create_functions.sql` - Helper-Funktionen
- `006_add_subscription_system.sql` - Subscription-System
- `010_fix_rls_infinite_recursion.sql` - RLS-Fixes
- `011_create_wiki_system.sql` - Wiki-System

**DSGVO & Compliance:**
- `031_fix_dsgvo_company_separation.sql` - DSGVO-konforme Trennung
- `032_employee_documents.sql` - Mitarbeiter-Dokumente
- `033_add_created_updated_by.sql` - Bearbeiter-Tracking
- `034_extend_profiles_schema.sql` - Erweiterte Profile

### Tabellen-Struktur (aus Migrations)

**Kern-Tabellen:**
- `profiles` - Benutzerprofile
- `companies` - Firmendaten
- `drivers` - Fahrerdaten
- `vehicles` - Fahrzeugdaten
- `customers` - Kundendaten
- `bookings` - Buchungen/Aufträge
- `invoices` - Rechnungen
- `quotes` - Angebote

**System-Tabellen:**
- `documents` - Dokumente (Fahrer, Mitarbeiter)
- `subscription_plans` - Tarifpläne
- `wiki_*` - Wiki-System

### RLS-Policies

**Status:** ⏳ Prüfung erforderlich

**Vorgaben:**
- ✅ Strikte company-basierte RLS
- ❌ Keine Master-Admin-Policies
- ✅ Bearbeiter-Tracking

### Funktionen

**Status:** ⏳ Prüfung erforderlich

**Identifizierte Funktionen:**
- `get_my_company_id()` - Company-ID des aktuellen Users
- `auth_user_is_owner()` - Prüft ob User Owner ist
- `auth_is_master_admin()` - **SOLLTE ENTFERNT WERDEN** (DSGVO-Verletzung)

---

## NÄCHSTE SCHRITTE

1. ⏳ Supabase-Schema vollständig analysieren
2. ⏳ RLS-Policies prüfen
3. ⏳ Funktionen prüfen
4. ⏳ DSGVO-Compliance validieren

---

**Erstellt von:** CPO & Lead Architect  
**Datum:** 2024
