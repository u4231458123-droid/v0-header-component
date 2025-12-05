# Kernwerte

## MyDispatch Kernwerte (5 Säulen)

### 1. ✅ KEINE LÜGEN - Ehrliche, transparente Kommunikation

**Definition**: Wir kommunizieren immer wahrheitsgemäß und transparent mit unseren Kunden.

**Praktische Umsetzung**:
- ✅ Realistische Preisstaffeln (keine versteckten Kosten)
- ✅ Ehrliche Feature-Beschreibungen (nicht: "bald", "in Planung")
- ✅ Transparente Fehler-Mitteilungen (nicht: "Fehler ist aufgetreten")
- ✅ Klare Limitierungen (z.B. "Starter Plan: max 5 Fahrer")
- ✅ Deutsche Tonalität (formal, vertrauenswürdig)

**Verbotene Begriffe**:
- ❌ "kostenlos", "gratis", "free"
- ❌ "testen", "trial" (nur: "kostenlose Testphase")
- ❌ "billig", "günstig" (nur: "faire Preise")
- ❌ Vage Versprechungen ("bald", "in Kürze")

### 2. 🎨 Hohe Qualität - Pixelgenaue Präzision

**Definition**: Jedes Pixel, jedes Wort muss korrekt sein. Keine Fehler.

**Praktische Umsetzung**:
- ✅ Design-Guidelines verbindlich (keine Ausnahmen)
- ✅ Design-Tokens für Farben (keine hardcoded Farben)
- ✅ Konsistente Abstände (Spacing-Skala)
- ✅ Konsistente Rundungen (Border Radius)
- ✅ Deutsche Texte überprüft (kein Google Translate)
- ✅ Keine Typos, keine Grammatik-Fehler

**Messbar**: Pixel-per-Pixel Vergleich mit Design-Datei

### 3. 💡 Nutzerfreundlichkeit - Einfache Bedienung

**Definition**: Die Bedienung muss intuitiv sein – ohne Schulung.

**Praktische Umsetzung**:
- ✅ Deutsche Sprache überall (Labels, Fehlermeldungen, Help-Text)
- ✅ Logische Navigation (keine versteckten Features)
- ✅ Fehler-Meldungen sind hilfreich (nicht: "Error 422")
- ✅ Responsive Design (Mobile-first)
- ✅ Accessibility (ARIA-Labels, Tastatur-Navigation)
- ✅ Undo-Funktionalität für kritische Operationen

**Messbar**: User-Tests mit unbeschriebenen Nutzern

### 4. 🏆 Vollumfängliche Lösungen - Alle täglichen Branchenansprüche erfüllt

**Definition**: Nicht nur "MVP", sondern **vollständige, produktionsreife Software**.

**Praktische Umsetzung**:
- ✅ Fahrtenverwaltung (inkl. Tracking, Status, Historie)
- ✅ Kundenverwaltung (inkl. CRM, Kontakte, Kommunikation)
- ✅ Fahrzeugmanagement (inkl. Wartung, Inspektionen)
- ✅ Fahrerverwaltung (inkl. Schichten, Verfügbarkeit)
- ✅ Rechnungswesen (GoBD-konform, automatisch)
- ✅ Reporting (Statistiken, Analysen, Dashboards)

**Nicht akzeptabel**: "Das machen wir später" oder "Für Enterprise"

### 5. 👁️ Visuelle & Funktionale Qualität - Professionelles Design + Konsistente Farben

**Definition**: Das System sieht professionell aus und fühlt sich hochwertig an.

**Praktische Umsetzung**:
- ✅ Konsistente Farbpalette überall
- ✅ Professionelle Icons (Lucide)
- ✅ Hochwertige Typografie (kein Pixel-Font)
- ✅ Animations-Übergänge (Micro-Interactions)
- ✅ Loading-States (nicht: unendliche Spinner)
- ✅ Empty-States (Hilfreiche, nicht leere Seiten)
- ✅ Success-Feedback (Toast Notifications)

---

## Integration in den Entwicklungsprozess

### Code-Review Checklist
```
✅ Code folgt TypeScript strict mode?
✅ Design-Guidelines eingehalten?
✅ Deutsche Texte überprüft?
✅ Error Handling implementiert?
✅ Accessibility geprüft?
✅ Mobile responsiv?
✅ Keine Lügen in der Kommunikation?
✅ Vollständige Lösung (nicht nur MVP)?
```

### Definition of Done
- ✅ Feature ist 100% funktional (nicht 80%)
- ✅ UI ist pixel-genau (nicht ungefähr)
- ✅ Deutsche Texte sind korrekt
- ✅ Tests bestanden (E2E, Lint, TypeScript)
- ✅ Code Review genehmigt
- ✅ Deployment erfolgreich
- ✅ Keine Open Issues/TODOs

---

**Verantwortung**: Alle Beteiligten (Entwickler, Designer, Product Owner) sind für die Einhaltung dieser Kernwerte verantwortlich.
