# Pflichtfelder-Übersicht - MyDispatch

## Logische Pflichtfelder-Definition

### Pre-Login Bereich

#### 1. Registrierung (`/auth/sign-up`)
**Pflichtfelder:**
- ✅ E-Mail (bereits required)
- ✅ Passwort (bereits required, min. 8 Zeichen)
- ✅ Passwort bestätigen (bereits required)
- ✅ Firmenname (bereits required)
- ✅ Vorname (bereits required)
- ✅ Nachname (bereits required)
- ✅ Telefon (bereits required)
- ✅ Straße (bereits required)
- ✅ PLZ (bereits required)
- ✅ Ort (bereits required)
- ✅ AGB akzeptieren (bereits required)
- ✅ Datenschutz akzeptieren (bereits required)

#### 2. Login (`/auth/login`)
**Pflichtfelder:**
- ✅ E-Mail (bereits required)
- ✅ Passwort (bereits required)

#### 3. Passwort vergessen (`/auth/forgot-password`)
**Pflichtfelder:**
- ✅ E-Mail (bereits required)

#### 4. Passwort zurücksetzen (`/auth/reset-password`)
**Pflichtfelder:**
- ✅ Neues Passwort (bereits required)
- ✅ Passwort bestätigen (bereits required)

### Unternehmer-Portal

#### 1. Auftrag buchen (`CreateBookingDialog`)
**Pflichtfelder:**
- ✅ Kunde (bestehend ODER neu mit vollständigen Daten)
- ✅ Abholadresse (bereits required)
- ✅ Zieladresse (bereits required)
- ✅ Datum (bereits required)
- ✅ Uhrzeit (bereits required)
- ✅ Fahrzeugklasse (bereits required)
- ✅ Passagieranzahl (bereits required)
- ✅ Zahlungsmethode (bereits required)

**Bei neuem Kunden zusätzlich:**
- ✅ Anrede (bereits required)
- ✅ Vorname (bereits required)
- ✅ Nachname (bereits required)
- ✅ Telefon ODER Mobil (mindestens eines)

#### 2. Fahrer anlegen (`NewDriverDialog`)
**Pflichtfelder:**
- ✅ Anrede (bereits required)
- ✅ Vorname (bereits required)
- ✅ Nachname (bereits required)
- ✅ Telefon (bereits required)
- ⚠️ Führerscheinnummer (sollte Pflicht sein)
- ⚠️ Führerschein-Ablaufdatum (sollte Pflicht sein)

**Bei Zugangsdaten erstellen:**
- ✅ E-Mail (bereits required)
- ✅ Benutzername (bereits required)
- ✅ Passwort (bereits required, min. 8 Zeichen)
- ✅ Passwort bestätigen (bereits required)

#### 3. Kunde anlegen (`NewCustomerDialog`)
**Pflichtfelder:**
- ✅ Vorname (bereits required)
- ✅ Nachname (bereits required)
- ✅ Telefon (bereits required)
- ⚠️ Anrede (sollte Pflicht sein)

**Bei Geschäftskunde:**
- ⚠️ Firmenname (sollte Pflicht sein)

#### 4. Rechnung erstellen (`NewInvoiceDialog`)
**Pflichtfelder:**
- ✅ Kunde (bereits required)
- ✅ Rechnungsdatum (bereits required)
- ✅ Fälligkeitsdatum (bereits required)
- ✅ Nettobetrag (bereits required)
- ⚠️ MwSt-Satz (sollte Pflicht sein)

#### 5. Angebot erstellen (`NewQuoteDialog`)
**Pflichtfelder:**
- ✅ Kunde (bereits required)
- ⚠️ Gültig bis (sollte Pflicht sein)
- ⚠️ Mindestens eine Position (sollte Pflicht sein)

### Fahrer-Portal

#### 1. Profil bearbeiten
**Pflichtfelder:**
- ✅ Vorname
- ✅ Nachname
- ✅ Telefon
- ✅ E-Mail (falls Zugangsdaten vorhanden)

#### 2. Dokumente hochladen
**Pflichtfelder:**
- ✅ Dokumenttyp
- ✅ Datei

### Kunden-Portal

#### 1. Registrierung (`/kunden-portal/registrieren`)
**Pflichtfelder:**
- ✅ Anrede (bereits required)
- ✅ Vorname (bereits required)
- ✅ Nachname (bereits required)
- ✅ E-Mail (bereits required)
- ✅ Passwort (bereits required, min. 8 Zeichen)
- ✅ Passwort bestätigen (bereits required)
- ✅ Telefon (bereits required)
- ✅ Straße (bereits required)
- ✅ PLZ (bereits required)
- ✅ Ort (bereits required)
- ✅ AGB akzeptieren (bereits required)
- ✅ Datenschutz akzeptieren (bereits required)

#### 2. Einstellungen
**Pflichtfelder:**
- ✅ Vorname
- ✅ Nachname
- ✅ E-Mail
- ✅ Telefon

## Implementierungsplan

1. ✅ Pre-Login Forms - bereits vollständig
2. ⚠️ Unternehmer-Portal Forms - teilweise, muss ergänzt werden
3. ⚠️ Fahrer-Portal Forms - muss geprüft werden
4. ✅ Kunden-Portal Forms - bereits vollständig

