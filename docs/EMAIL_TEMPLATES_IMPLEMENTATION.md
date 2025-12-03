# E-Mail-Templates Implementierung

**Datum:** 2025-01-XX  
**Status:** In Planung

---

## Übersicht

Alle E-Mail-Templates für Supabase Auth werden basierend auf dem bereitgestellten MyDispatch-Template erstellt und in Supabase konfiguriert. Resend ist bereits eingerichtet und alle E-Mails gehen direkt über Resend.

---

## Template-Liste

### 1. ✅ Confirm sign up (Bereits vorhanden)
- **Zweck:** E-Mail-Bestätigung nach Registrierung
- **Template:** Bereits erstellt
- **Status:** ✅ Fertig

### 2. ⏳ Invite user
- **Zweck:** Einladung für Benutzer ohne Account
- **Variablen:** `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .Token }}`
- **Status:** ⏳ Ausstehend

### 3. ⏳ Magic link
- **Zweck:** Einmaliger Anmeldelink per E-Mail
- **Variablen:** `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .Token }}`
- **Status:** ⏳ Ausstehend

### 4. ⏳ Change email address
- **Zweck:** Neue E-Mail-Adresse verifizieren
- **Variablen:** `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .Token }}`
- **Status:** ⏳ Ausstehend

### 5. ⏳ Reset password
- **Zweck:** Passwort zurücksetzen
- **Variablen:** `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .Token }}`
- **Status:** ⏳ Ausstehend

### 6. ⏳ Reauthentication
- **Zweck:** Re-Authentifizierung vor sensibler Aktion
- **Variablen:** `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .Token }}`
- **Status:** ⏳ Ausstehend

### 7. ⏳ Password changed
- **Zweck:** Benachrichtigung bei Passwortänderung
- **Variablen:** `{{ .Email }}`
- **Status:** ⏳ Ausstehend

### 8. ⏳ Email address changed
- **Zweck:** Benachrichtigung bei E-Mail-Änderung
- **Variablen:** `{{ .Email }}`, `{{ .NewEmail }}`
- **Status:** ⏳ Ausstehend

### 9. ⏳ Phone number changed
- **Zweck:** Benachrichtigung bei Telefonnummer-Änderung
- **Variablen:** `{{ .Email }}`, `{{ .Phone }}`
- **Status:** ⏳ Ausstehend

### 10. ⏳ Identity linked
- **Zweck:** Benachrichtigung bei verknüpfter Identität
- **Variablen:** `{{ .Email }}`, `{{ .Provider }}`
- **Status:** ⏳ Ausstehend

### 11. ⏳ Identity unlinked
- **Zweck:** Benachrichtigung bei getrennter Identität
- **Variablen:** `{{ .Email }}`, `{{ .Provider }}`
- **Status:** ⏳ Ausstehend

### 12. ⏳ Multi-factor authentication method added
- **Zweck:** Benachrichtigung bei hinzugefügter MFA-Methode
- **Variablen:** `{{ .Email }}`, `{{ .Method }}`
- **Status:** ⏳ Ausstehend

### 13. ⏳ Multi-factor authentication method removed
- **Zweck:** Benachrichtigung bei entfernter MFA-Methode
- **Variablen:** `{{ .Email }}`, `{{ .Method }}`
- **Status:** ⏳ Ausstehend

---

## Template-Struktur

Alle Templates folgen der gleichen Struktur wie das "Confirm sign up" Template:

1. **Header:** MyDispatch Logo
2. **Content:**
   - Headline (Template-spezifisch)
   - Body-Text (Template-spezifisch)
   - Button (falls nötig)
   - Fallback-Link (falls nötig)
3. **Footer:**
   - Anbieter-Informationen
   - Kontakt-Informationen
   - Rechtliche Angaben

---

## Supabase Integration

Die Templates werden in Supabase unter **Authentication > Email Templates** konfiguriert:

1. Template auswählen
2. HTML-Template einfügen
3. Variablen prüfen (z.B. `{{ .ConfirmationURL }}`)
4. Speichern

---

## Resend Konfiguration

- ✅ Resend ist bereits eingerichtet
- ✅ Alle E-Mails gehen direkt über Resend
- ✅ Keine zusätzliche Konfiguration nötig

---

## Nächste Schritte

1. ✅ Chat-Integration abschließen
2. ⏳ Alle E-Mail-Templates erstellen
3. ⏳ Templates in Supabase einbinden
4. ⏳ Testen der Templates

