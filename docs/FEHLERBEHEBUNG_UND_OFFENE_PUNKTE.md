# MyDispatch - Fehlerbehebung und Offene Punkte

**Datum:** 2025-01-XX  
**Status:** In Bearbeitung

---

## ✅ Behobene Fehler

### 1. Home Page: Jahrespreise korrigiert
- **Problem:** Jahrespreise waren falsch (374€ Starter, 950€ Business)
- **Lösung:** 
  - `lib/tariff/tariff-definitions.ts`: Jahrespreise auf 31,20€ (Starter) und 79,20€ (Business) korrigiert
  - `app/page.tsx`: Hardcoded Pricing-Section durch `HomePricingSection` ersetzt, die bereits Jahrespreise mit Toggle unterstützt
- **Status:** ✅ Erledigt

### 2. Landing Page: Logout-Redirect korrigiert
- **Problem:** Nach Logout wurde zu `/auth/login` statt zur Unternehmens-Landingpage umgeleitet
- **Lösung:** `app/c/[company]/kunde/portal/TenantCustomerPortal.tsx`: `handleLogout` leitet jetzt zu `/c/${company.company_slug}` um
- **Status:** ✅ Erledigt

### 3. E-Mail-Templates: Logo-URLs als absolute URLs
- **Problem:** Logo-URLs in E-Mails waren relativ und funktionierten nicht
- **Lösung:** `lib/email/templates.ts`: Automatische Konvertierung zu absoluten URLs basierend auf `NEXT_PUBLIC_SITE_URL`
- **Status:** ✅ Erledigt

---

## 🔄 Noch offene Punkte (aus Fehlerliste)

### 1. Home: Unterer Slider CI angleichen (blau/weiß Schrift)
- **Status:** ⏳ Pending
- **Beschreibung:** CI (Corporate Identity) im unteren Slider angleichen

### 2. Dashboard: Unterer Slider CI angleichen (blau/weiß Schrift)
- **Status:** ⏳ Pending
- **Beschreibung:** CI im Dashboard-Slider angleichen

### 3. Finanzen/Kunden: Doppelte Liste beheben
- **Status:** ⏳ Pending
- **Beschreibung:** Prüfen, ob Kundenliste doppelt angezeigt wird

### 4. Aufträge: Fahrer-Auswahl Fehler (Zeichenfehler nach Auswahl)
- **Status:** ⏳ Pending
- **Beschreibung:** Zeichenfehler nach Fahrer-Auswahl beheben

### 5. Aufträge: Adresseneingabe reparieren
- **Status:** ⏳ Pending
- **Beschreibung:** Adresseneingabe funktioniert möglicherweise nicht korrekt (verwendet bereits `AddressAutocomplete`)

### 6. Kunde Dashboard: Login-Daten-Fehler beheben
- **Status:** ⏳ Pending
- **Beschreibung:** Login-Daten-Fehler im Kunden-Dashboard

### 7. Einstellungen/Unternehmen: Speichern final prüfen
- **Status:** ⏳ Pending
- **Beschreibung:** Finale Prüfung, ob alle Einstellungen korrekt gespeichert werden

---

## 📋 Offene Punkte aus Dokumentationen

### Phase 2 Features (Geplant, aber noch nicht implementiert)

#### 1. Partner-System
- **Status:** Spezifikation erstellt, DB-Schema fehlt
- **Beschreibung:** Partner-Verbindung via MD-ID, Notizfeld, Verbindungsanfrage, Status-Synchronisation
- **Dokumentation:** `docs/PARTNER-SYSTEM-SPEZIFIKATION.md`
- **Priorität:** Niedrig (Phase 2)

#### 2. E-Mail-Templates (Phase 2)
- **Status:** Basis implementiert, HTML-Templates fehlen
- **Noch zu implementieren:**
  - HTML-Templates (CI-konform)
  - Auftrag erstellt / geändert
  - Fahrer-Benachrichtigung
  - Dokument Ablauf
  - Rechnung bereit
  - Storno
  - Partner-Auftrag erhalten
  - Automatisches Impressum in allen Mails
  - DSGVO-konforme Vorlagen
- **Priorität:** Mittel (Phase 2)

#### 3. Kassenbuch (Phase 2)
- **Status:** Vorbereitet, aber noch nicht vollständig implementiert
- **Priorität:** Niedrig (Phase 2)

#### 4. E-Rechnung (Phase 2)
- **Status:** Vorbereitet
- **Priorität:** Niedrig (Phase 2)

#### 5. TSE-Integration (Phase 2)
- **Status:** Vorbereitet
- **Priorität:** Niedrig (Phase 2)

#### 6. Fehlende Tabellen (laut VOLLSTAENDIGE_SYSTEMANALYSE.md)
- **Status:** Prüfen, ob diese Tabellen existieren
- **Tabellen:**
  - `documents` (Dokumente-Tabelle)
  - `driver_shifts` (Driver Shifts)
  - `booking_requests` (Booking Requests)
  - `customer_accounts` (Customer Accounts)
- **Priorität:** Hoch (Prüfen, ob benötigt)

---

## 🔍 Nächste Schritte

### Sofort (Kritisch)
1. ✅ Home: Jahrespreise korrigiert
2. ✅ Landing Page: Logout-Redirect korrigiert
3. ✅ E-Mail-Templates: Logo-URLs als absolute URLs
4. ⏳ CI-Probleme in Slidern beheben (Home & Dashboard)
5. ⏳ Doppelte Kundenliste prüfen und beheben
6. ⏳ Fahrer-Auswahl-Fehler analysieren und beheben
7. ⏳ Adresseneingabe testen und reparieren
8. ⏳ Login-Daten-Fehler im Kunden-Dashboard beheben
9. ⏳ Einstellungen-Speichern final testen

### Phase 2 (Niedrige Priorität)
1. Partner-System implementieren
2. E-Mail-Templates vollständig implementieren
3. Kassenbuch vollständig implementieren
4. E-Rechnung implementieren
5. TSE-Integration implementieren
6. Fehlende Tabellen prüfen und ggf. erstellen

---

## 📝 Notizen

- Jahrespreise: 31,20€ (Starter), 79,20€ (Business) - 20% Rabatt
- Logo-URLs: Automatische Konvertierung zu absoluten URLs
- Logout: Zurück zur Unternehmens-Landingpage statt zu `/auth/login`

