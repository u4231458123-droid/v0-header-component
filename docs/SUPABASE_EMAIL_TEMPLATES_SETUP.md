# Supabase E-Mail-Templates Setup

## Übersicht

Alle 13 E-Mail-Templates wurden erstellt und müssen nun in Supabase konfiguriert werden.

## Verfügbare Templates

1. ✅ **Confirm signup** (`templates/email/confirm-signup.html`)
2. ✅ **Invite user** (`templates/email/invite-user.html`)
3. ✅ **Magic link** (`templates/email/magic-link.html`)
4. ✅ **Change email address** (`templates/email/change-email.html`)
5. ✅ **Reset password** (`templates/email/reset-password.html`)
6. ✅ **Reauthentication** (`templates/email/reauthentication.html`)
7. ✅ **Password changed** (`templates/email/password-changed.html`)
8. ✅ **Email address changed** (`templates/email/email-address-changed.html`)
9. ✅ **Phone number changed** (`templates/email/phone-number-changed.html`)
10. ✅ **Identity linked** (`templates/email/identity-linked.html`)
11. ✅ **Identity unlinked** (`templates/email/identity-unlinked.html`)
12. ✅ **Multi-factor authentication method added** (`templates/email/mfa-method-added.html`)
13. ✅ **Multi-factor authentication method removed** (`templates/email/mfa-method-removed.html`)

## Manuelle Konfiguration in Supabase Dashboard

### Schritt 1: Zugriff auf E-Mail-Templates

1. Gehe zu: https://supabase.com/dashboard/project/ykfufejycdgwonrlbhzn/auth/templates
2. Oder: Dashboard → Authentication → Email Templates

### Schritt 2: Templates hochladen

Für jedes Template:

1. **Template auswählen** (z.B. "Confirm signup")
2. **Subject anpassen** (falls nötig)
3. **HTML-Inhalt kopieren** aus der entsprechenden Datei in `templates/email/`
4. **Speichern**

### Template-Zuordnung

| Supabase Template | Lokale Datei | Subject |
|------------------|--------------|---------|
| Confirm signup | `confirm-signup.html` | "Registrierung bestätigen" |
| Invite user | `invite-user.html` | "Du wurdest eingeladen!" |
| Magic Link | `magic-link.html` | "Dein Anmeldelink" |
| Change Email Address | `change-email.html` | "E-Mail-Adresse ändern" |
| Reset Password | `reset-password.html` | "Passwort zurücksetzen" |
| Reauthentication | `reauthentication.html` | "Re-Authentifizierung erforderlich" |
| Password changed | `password-changed.html` | "Passwort geändert" |
| Email address changed | `email-address-changed.html` | "E-Mail-Adresse geändert" |
| Phone number changed | `phone-number-changed.html` | "Telefonnummer geändert" |
| Identity linked | `identity-linked.html` | "Identität verknüpft" |
| Identity unlinked | `identity-unlinked.html` | "Identität getrennt" |
| Multi-factor authentication method added | `mfa-method-added.html` | "Zwei-Faktor-Authentifizierung hinzugefügt" |
| Multi-factor authentication method removed | `mfa-method-removed.html` | "Zwei-Faktor-Authentifizierung entfernt" |

## Wichtige Template-Variablen

Alle Templates verwenden Supabase Go Template Syntax:

- `{{ .ConfirmationURL }}` - Bestätigungs-Link
- `{{ .Token }}` - 6-stelliger OTP-Code
- `{{ .TokenHash }}` - Gehashte Token-Version
- `{{ .SiteURL }}` - Site-URL
- `{{ .Email }}` - E-Mail-Adresse des Users
- `{{ .NewEmail }}` - Neue E-Mail-Adresse (nur bei Email Change)
- `{{ .RedirectTo }}` - Redirect-URL

## Hinweise

⚠️ **Wichtig:**
- Templates müssen manuell im Supabase Dashboard hochgeladen werden
- Es gibt keine direkte MCP-Funktion für E-Mail-Templates
- Nach dem Hochladen werden die Templates sofort verwendet
- Teste die Templates nach dem Upload mit Test-E-Mails

## Testing

Nach dem Upload der Templates:

1. Teste die Registrierung (Confirm signup)
2. Teste Passwort-Reset (Reset password)
3. Teste Magic Link Login (Magic link)
4. Teste E-Mail-Änderung (Change email address)

## Logo-URL

Alle Templates verwenden das MyDispatch-Logo:
```
https://ykfufejycdgwonrlbhzn.supabase.co/storage/v1/object/public/MyDispatch%203%20D%20Logo/mydispatch-3d-logo.png
```

## Support

Bei Problemen:
- Prüfe die Supabase Logs: Dashboard → Logs → Auth
- Teste die Templates einzeln
- Stelle sicher, dass alle Template-Variablen korrekt verwendet werden

