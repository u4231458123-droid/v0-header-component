# Automatischer QualityBot - Integration

## Übersicht

Der QualityBot ist jetzt vollständig automatisch in alle Code-Änderungen integriert. Er prüft Code sofort nach jeder Änderung, behebt Fehler automatisch (wenn möglich) und gibt Rückmeldung bei manuellen Eingriffen.

## Funktionsweise

### 1. Automatische Prüfung

Der QualityBot prüft Code automatisch gegen:
- Design-Vorgaben (Farben, Abstände, rounded-Klassen)
- UI-Konsistenz (UI-Library-Imports)
- Coding-Rules (Best Practices)
- Forbidden Terms (verbotene Begriffe)
- Funktionalität (Logik-Fehler)
- Text-Qualität (SEO, Nutzerfreundlichkeit)

### 2. Automatische Behebung

Der QualityBot behebt automatisch:
- ✅ Hardcoded Farben → Design-Tokens
- ✅ Falsche rounded-Klassen (rounded-lg → rounded-2xl für Cards, rounded-md → rounded-xl für Buttons)
- ✅ Falsche gap-Werte (gap-4/gap-6 → gap-5)
- ✅ UI-Library-Imports (wenn möglich)

### 3. Rückmeldung

Bei manuellen Eingriffen gibt der QualityBot:
- ⚠️ Warnung mit Zeilennummer
- 💡 Vorschlag zur Behebung
- 📊 Schweregrad (critical, high, medium, low)

## Verwendung

### Automatisch (empfohlen)

Der QualityBot wird automatisch bei jeder Code-Änderung ausgeführt. Du musst nichts tun!

### Manuell

```bash
# Prüfe einzelne Datei
node scripts/cicd/auto-quality-check.ts app/dashboard/page.tsx

# Oder via npm script
npm run quality:check app/dashboard/page.tsx
```

### In Code

```typescript
import { withQualityCheck, checkCodeQuality } from "@/lib/ai/bots/quality-integration"

// Wrapper für Code-Änderungen
const { result, qualityCheck } = await withQualityCheck(
  "app/dashboard/page.tsx",
  async () => {
    // Deine Code-Änderung
    return "Ergebnis"
  },
  {
    autoFix: true,
    autoSave: true,
  }
)

// Nur prüfen
const qualityCheck = await checkCodeQuality("app/dashboard/page.tsx")
```

## Nexify-Account Setup

### SQL-Migration ausführen

```sql
-- Führe scripts/028_create_nexify_account.sql in Supabase aus
```

### Auth-User erstellen

1. Gehe zu Supabase Dashboard → Authentication → Users
2. Erstelle neuen User:
   - **Email**: `nexify.login@gmail.com`
   - **Passwort**: `1def!xO2022!!`
   - **Email bestätigt**: ✅ Ja

### Testen

1. Login mit `nexify.login@gmail.com` / `1def!xO2022!!`
2. Dashboard sollte laden
3. Einstellungen sollten funktionieren

## Qualitätsstandards

Der QualityBot prüft automatisch:

### Design
- ✅ Keine hardcoded Farben
- ✅ Cards: `rounded-2xl` (nicht `rounded-lg`)
- ✅ Buttons: `rounded-xl` (nicht `rounded-md`)
- ✅ Standard-Gap: `gap-5` (nicht `gap-4` oder `gap-6`)

### UI-Konsistenz
- ✅ Header aus `components/ui/header`
- ✅ Footer aus `components/ui/footer`
- ✅ Logo aus `components/ui/logo`
- ✅ Buttons aus `components/ui/button`

### Code-Qualität
- ✅ Null-Checks vorhanden
- ✅ Error-Handling implementiert
- ✅ TypeScript-Typen korrekt
- ✅ Keine ungenutzten Imports

## Fehlerbehebung

### QualityBot findet Fehler

1. **Auto-Fix möglich**: Wird automatisch behoben
2. **Manuelle Eingriffe**: QualityBot gibt Vorschlag
3. **Kritische Fehler**: Müssen sofort behoben werden

### QualityBot meldet nichts

- ✅ Code ist qualitativ hochwertig
- ✅ Alle Standards eingehalten
- ✅ Keine Violations gefunden

## Best Practices

1. **Immer QualityBot prüfen lassen** vor Commits
2. **Auto-Fix aktivieren** für schnelle Behebungen
3. **Manuelle Eingriffe** bei kritischen Violations
4. **Dokumentation** bei komplexen Änderungen

## Nächste Schritte

1. ✅ SQL-Migration ausführen
2. ✅ Auth-User erstellen
3. ✅ Login testen
4. ✅ QualityBot automatisch prüfen lassen

---

**Status**: ✅ Vollständig integriert und einsatzbereit

