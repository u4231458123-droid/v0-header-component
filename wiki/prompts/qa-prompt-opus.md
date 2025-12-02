# QA-Prompt für Opus 4.5

## Aufgabe

Führe eine vollständige Qualitätssicherung des MyDispatch-Systems durch.

## Prüfbereiche

### 1. Funktionale Tests
- [ ] Alle Pre-Login-Seiten laden korrekt
- [ ] Registrierung funktioniert
- [ ] Login/Logout funktioniert
- [ ] Dashboard-Navigation funktioniert
- [ ] CRUD-Operationen funktionieren

### 2. Design-Tests
- [ ] Responsive auf allen Breakpoints
- [ ] Konsistente Farbgebung
- [ ] Korrekte Typografie
- [ ] Icons werden angezeigt

### 3. Performance-Tests
- [ ] Seitenladezeit < 3s
- [ ] Keine Memory Leaks
- [ ] Optimierte Bilder

### 4. Sicherheits-Tests
- [ ] RLS funktioniert korrekt
- [ ] Keine XSS-Schwachstellen
- [ ] Sessions werden korrekt verwaltet

### 5. Compliance-Tests
- [ ] Cookie-Banner funktioniert
- [ ] Impressum vollständig
- [ ] Datenschutz vollständig

## Vorgehen

1. Lade `wiki/prompt.md` für Kontext
2. Prüfe jeden Bereich systematisch
3. Dokumentiere Fehler in `wiki/errors/fehlerliste.md`
4. Aktualisiere `wiki/changelog/changelog.md`
5. Erstelle Go-Live-Report

## Output

Erstelle einen strukturierten QA-Report mit:
- Gefundene Fehler
- Behobene Fehler
- Empfehlungen
- Go-Live-Freigabe (Ja/Nein)
