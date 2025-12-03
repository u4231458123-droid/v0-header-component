# Vercel Projekt-Konfiguration

## ⚠️ KRITISCH: Diese Informationen müssen IMMER verwendet werden!

### Vercel Team-ID
```
team_jO6cawqC6mFroPHujn47acpU
```

### Vercel Projekt-Name
```
vercel.com/mydispatchs-projects/v0-header-component
```

### Vercel Projekt-URL
```
https://vercel.com/mydispatchs-projects/v0-header-component
```

### OIDC Federation (Sichere Backend-Zugriffe)

#### Issuer Mode: Team (Empfohlen)
```
https://oidc.vercel.com/mydispatchs-projects
```

#### OIDC Claims
- **iss** (Issuer): `https://oidc.vercel.com/mydispatchs-projects`
- **aud** (Audience): `https://vercel.com/mydispatchs-projects`
- **sub** (Subject): `owner:mydispatchs-projects:project:mydispatch-rebuild-copy:environment:production`
- **scope**: `owner:mydispatchs-projects:project:mydispatch-rebuild-copy:environment:production`

#### Verwendung
Für sichere Backend-Zugriffe mit OpenID Connect JSON Web Tokens:
1. Authentifizierung über OIDC Issuer
2. JWT-Token mit korrekten Claims verwenden
3. Audience und Scope validieren

#### Alternative: Global Mode
```
https://oidc.vercel.com
```
(Verwende Team Mode wenn möglich - sicherer)

## Verwendung

### In GitHub Secrets
Diese Werte müssen in GitHub Repository Secrets gespeichert werden:
- `VERCEL_TEAM_ID`: `team_jO6cawqC6mFroPHujn47acpU`
- `VERCEL_PROJECT_ID`: (wird aus Projekt-Name extrahiert oder aus Vercel API abgerufen)
- `VERCEL_ORG_ID`: (wird automatisch aus Team-ID ermittelt)

### In Workflows
Alle GitHub Actions Workflows müssen diese Werte verwenden:
```yaml
env:
  VERCEL_TEAM_ID: team_jO6cawqC6mFroPHujn47acpU
  VERCEL_PROJECT_NAME: v0-header-component
```

### Validierung
**IMMER** vor jedem Deployment prüfen:
1. Ist die Team-ID korrekt?
2. Ist der Projekt-Name korrekt?
3. Wird das bestehende Projekt verwendet?

## Fehlerprävention

### Problem
Bei jedem Deployment wurden neue Vercel-Projekte erstellt, weil:
- Falsche Team-ID verwendet wurde
- Falscher Projekt-Name verwendet wurde
- Keine Validierung vorhanden war

### Lösung
1. ✅ Team-ID dokumentiert
2. ✅ Projekt-Name dokumentiert
3. ⏳ Validierung in Workflows hinzufügen
4. ⏳ Bot-Validierung implementieren

## Nächste Schritte

1. GitHub Secrets aktualisieren
2. Workflows mit Team-ID erweitern
3. Validierung vor jedem Deployment
4. Bot-Integration für automatische Prüfung

