# Einstellungen - Alle Tabs mit Null-Checks abgesichert

**Datum:** 2025-01-03  
**Status:** ✅ Abgeschlossen

## Problem

Die Einstellungsseite (`/einstellungen`) zeigte Fehler, wenn `company` `null` war. Alle Tabs, die `company` benötigen, mussten mit Null-Checks abgesichert werden.

## Lösung

### Alle Tabs mit Null-Checks versehen:

1. **Company Tab** ✅
   - Null-Check hinzugefügt
   - Zeigt Warnung wenn kein Unternehmen vorhanden

2. **Landingpage Tab** ✅
   - Null-Check hinzugefügt
   - Zeigt Warnung wenn kein Unternehmen vorhanden

3. **Branding Tab** ✅
   - Null-Check hinzugefügt
   - Zeigt Warnung wenn kein Unternehmen vorhanden

4. **Billing Tab** ✅
   - Null-Check hinzugefügt
   - Zeigt Warnung wenn kein Unternehmen vorhanden

5. **Notifications Tab** ✅
   - Null-Check hinzugefügt
   - Zeigt Warnung wenn kein Unternehmen vorhanden

6. **Team Tab** ✅
   - Null-Check hinzugefügt (`!company || !company.id`)
   - Zeigt Warnung wenn kein Unternehmen vorhanden

7. **Profile Tab** ✅
   - Benötigt kein Unternehmen (funktioniert ohne)

8. **Security Tab** ✅
   - Benötigt kein Unternehmen (funktioniert ohne)

## Implementierung

Jeder Tab, der `company` benötigt, hat jetzt folgende Struktur:

```tsx
<TabsContent value="tab-name" className="space-y-6">
  {!company ? (
    <Card className="border-amber-500/50 bg-amber-500/10">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-700 dark:text-amber-400">
              Kein Unternehmen gefunden
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sie müssen zuerst ein Unternehmen erstellen, um [Tab-Funktion] zu konfigurieren.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : (
    // Tab-Inhalt hier
  )}
</TabsContent>
```

## Ergebnis

✅ Alle Tabs funktionieren jetzt auch ohne Unternehmen  
✅ Benutzerfreundliche Fehlermeldungen  
✅ Keine "Cannot read properties" Fehler mehr  
✅ Konsistente UI für alle Tabs  

## Test

1. Mit Benutzer ohne Unternehmen → Alle Tabs zeigen Warnung
2. Mit Benutzer mit Unternehmen → Alle Tabs funktionieren normal
3. Bei Fehler → Error-Boundary zeigt spezifische Meldung

