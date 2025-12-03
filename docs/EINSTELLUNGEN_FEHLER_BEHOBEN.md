# Einstellungen Fehler behoben

**Datum:** 2025-01-03  
**Fehler:** "Cannot read properties of undefined (reading 'name')"

## Problem

Die Einstellungsseite (`/einstellungen`) zeigte einen Fehler:
```
Cannot read properties of undefined (reading 'name')
```

## Ursache

1. `company` konnte `null` sein, wenn der Benutzer kein Unternehmen hatte
2. `company.name` wurde ohne Null-Check verwendet
3. Fehlende Error-Handling in Supabase-Queries
4. Keine Fallback-Werte für fehlende Daten

## Lösung

### 1. Error-Handling in `app/einstellungen/page.tsx`
- Try-Catch um `renderSettingsPage`
- Try-Catch um alle Supabase-Queries
- Fallback-Werte für alle Daten
- Detailliertes Logging

### 2. Null-Checks in `components/settings/CompanySettingsForm.tsx`
- Prüfung ob `company` existiert
- Früher Return mit Fehlermeldung wenn kein Unternehmen
- Optional chaining (`company?.name`) für alle Zugriffe

### 3. Null-Checks in `components/settings/SettingsPageClient.tsx`
- Optional chaining bereits vorhanden (`company?.name`)
- Zusätzlicher Check in `handleLogoUpload`
- Prüfung `if (!company || !company.id)` vor Updates

### 4. Error-Boundary
- `app/einstellungen/error.tsx` erstellt
- Spezifische Fehlermeldung für Einstellungen

## Änderungen

### `app/einstellungen/page.tsx`
```typescript
// Try-Catch um renderSettingsPage
try {
  return await renderSettingsPage(supabase, profile, user)
} catch (error: any) {
  console.error("[Settings] Page error:", error)
  throw error
}

// Try-Catch um alle Queries
try {
  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profile.company_id)
    .maybeSingle()
  // ...
} catch (error) {
  console.error("[Settings] Company data fetch failed:", error)
}
```

### `components/settings/CompanySettingsForm.tsx`
```typescript
export function CompanySettingsForm({ company }: CompanySettingsFormProps) {
  if (!company) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">
          Kein Unternehmen gefunden. Bitte erstellen Sie zuerst ein Unternehmen.
        </p>
      </div>
    )
  }
  // ...
}
```

## Ergebnis

✅ Einstellungsseite lädt jetzt auch ohne Unternehmen  
✅ Keine "Cannot read properties" Fehler mehr  
✅ Detailliertes Error-Logging für Debugging  
✅ Benutzerfreundliche Fehlermeldungen  

## Test

1. Mit Benutzer ohne Unternehmen → Zeigt Meldung "Kein Unternehmen gefunden"
2. Mit Benutzer mit Unternehmen → Lädt normal
3. Bei Fehler → Error-Boundary zeigt spezifische Meldung

