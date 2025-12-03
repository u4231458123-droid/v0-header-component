# Vercel Cron Jobs Konfiguration

## Übersicht

Die MyDispatch-Anwendung nutzt Vercel Cron Jobs für automatisierte Tasks, die regelmäßig ausgeführt werden. Diese ersetzen teilweise die GitHub Actions Workflows für bestimmte wiederkehrende Aufgaben.

## Cron Jobs

### 1. Bot-Monitoring (`/api/cron/bot-monitor`)
- **Schedule**: Alle 2 Stunden (`0 */2 * * *`)
- **Aufgabe**: Überwacht alle Bots und deren Performance
- **Funktion**: Führt Health-Checks für alle Bots aus und sammelt Metriken

### 2. Auto-Fix Bugs (`/api/cron/auto-fix`)
- **Schedule**: 
  - Alle 2 Stunden (`0 */2 * * *`)
  - Täglich um 3:00 UTC (`0 3 * * *`)
- **Aufgabe**: Automatische Bug-Fixes für die gesamte Codebase
- **Funktion**: Analysiert Code auf Fehler und behebt diese automatisch

### 3. Advanced Optimizations (`/api/cron/optimize`)
- **Schedule**: Wöchentlich am Sonntag um 3:00 UTC (`0 3 * * 0`)
- **Aufgabe**: Erweiterte Codebase-Optimierungen
- **Funktion**: Führt Performance-Optimierungen und Code-Verbesserungen durch

### 4. Prompt-Optimization (`/api/cron/prompt-optimize`)
- **Schedule**: Täglich um 4:00 UTC (`0 4 * * *`)
- **Aufgabe**: Kontinuierliche Optimierung von AI-Prompts
- **Funktion**: Optimiert Prompts für alle Bots basierend auf aktuellen Ergebnissen

## Sicherheitskonfiguration

### CRON_SECRET Environment Variable

Alle Cron Jobs sind durch ein `CRON_SECRET` geschützt, das in Vercel als Environment Variable gesetzt werden muss.

#### Vercel Dashboard Konfiguration

1. Gehe zu deinem Projekt in Vercel
2. Navigiere zu **Settings** → **Environment Variables**
3. Füge eine neue Variable hinzu:
   - **Name**: `CRON_SECRET`
   - **Value**: Ein sicherer, zufälliger String (z.B. generiert mit `openssl rand -hex 32`)
   - **Environment**: Production, Preview, Development (alle)

#### Beispiel-Generierung

```bash
# Generiere einen sicheren Secret
openssl rand -hex 32
```

#### GitHub Secrets (Optional)

Falls du den Secret auch in GitHub Actions verwenden möchtest:

1. Gehe zu deinem Repository → **Settings** → **Secrets and variables** → **Actions**
2. Füge einen neuen Secret hinzu:
   - **Name**: `CRON_SECRET`
   - **Value**: Derselbe Wert wie in Vercel

## Vercel.json Konfiguration

Die `vercel.json` Datei enthält alle Cron Job Definitionen:

```json
{
  "crons": [
    {
      "path": "/api/cron/bot-monitor",
      "schedule": "0 */2 * * *"
    },
    {
      "path": "/api/cron/auto-fix",
      "schedule": "0 */2 * * *"
    },
    {
      "path": "/api/cron/auto-fix",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/cron/optimize",
      "schedule": "0 3 * * 0"
    },
    {
      "path": "/api/cron/prompt-optimize",
      "schedule": "0 4 * * *"
    }
  ]
}
```

## Cron Schedule Format

Vercel verwendet das Standard Cron-Format:

```
┌───────────── Minute (0 - 59)
│ ┌───────────── Stunde (0 - 23)
│ │ ┌───────────── Tag des Monats (1 - 31)
│ │ │ ┌───────────── Monat (1 - 12)
│ │ │ │ ┌───────────── Wochentag (0 - 6) (Sonntag bis Samstag)
│ │ │ │ │
* * * * *
```

### Beispiele

- `0 */2 * * *` - Alle 2 Stunden
- `0 3 * * *` - Täglich um 3:00 UTC
- `0 3 * * 0` - Wöchentlich am Sonntag um 3:00 UTC
- `0 4 * * *` - Täglich um 4:00 UTC

## API-Endpoints

Alle Cron-Endpoints befinden sich unter `app/api/cron/`:

- `/api/cron/route.ts` - Haupt-Endpoint (Test)
- `/api/cron/bot-monitor/route.ts` - Bot-Monitoring
- `/api/cron/auto-fix/route.ts` - Auto-Fix Bugs
- `/api/cron/optimize/route.ts` - Advanced Optimizations
- `/api/cron/prompt-optimize/route.ts` - Prompt-Optimization

## Sicherheitsvalidierung

Jeder Endpoint validiert den `Authorization` Header:

```typescript
const authHeader = request.headers.get('Authorization');
const expectedSecret = process.env.CRON_SECRET;

if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

Vercel fügt automatisch den `Authorization` Header mit dem `CRON_SECRET` zu allen Cron Job-Aufrufen hinzu.

## Monitoring

### Vercel Dashboard

1. Gehe zu deinem Projekt → **Logs**
2. Filtere nach `/api/cron/` um Cron Job-Logs zu sehen
3. Prüfe **Observability** für Metriken und Fehlerraten

### Logs

Alle Cron Jobs loggen ihre Ergebnisse:
- Erfolgreiche Ausführungen: `{ ok: true, timestamp: ..., task: '...', results: ... }`
- Fehler: `{ ok: false, error: '...', timestamp: ... }`

## Troubleshooting

### Cron Jobs werden nicht ausgeführt

1. Prüfe, ob `CRON_SECRET` in Vercel gesetzt ist
2. Prüfe die `vercel.json` auf korrekte Syntax
3. Prüfe die Logs in Vercel Dashboard

### 401 Unauthorized Fehler

1. Stelle sicher, dass `CRON_SECRET` korrekt gesetzt ist
2. Prüfe, ob der Secret in allen Environments (Production, Preview, Development) gesetzt ist
3. Stelle sicher, dass Vercel den Header automatisch hinzufügt (nur bei echten Cron-Aufrufen)

### Fehler in Cron Jobs

1. Prüfe die Logs in Vercel Dashboard
2. Prüfe die Bot-Implementierungen (`lib/ai/bots/`, `lib/cicd/bot-monitor.ts`)
3. Stelle sicher, dass alle Dependencies verfügbar sind

## Integration mit GitHub Actions

Die Cron Jobs ergänzen die GitHub Actions Workflows:

- **GitHub Actions**: Für Push-basierte Tasks, Pull Requests, etc.
- **Vercel Cron Jobs**: Für zeitbasierte, wiederkehrende Tasks

Beide Systeme können parallel laufen und ergänzen sich.

## Nächste Schritte

1. ✅ `CRON_SECRET` in Vercel setzen
2. ✅ `vercel.json` committen und pushen
3. ✅ Erste Cron Jobs in Vercel Dashboard prüfen
4. ✅ Logs überwachen
5. ✅ Bei Bedarf Schedules anpassen

