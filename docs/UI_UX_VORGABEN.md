# UI/UX Vorgaben - MyDispatch

**Erstellt:** 2025-01-03  
**Status:** 📋 Aktiv

---

## 🌐 Sprache & Lokalisierung

### Deutsch als Standard
- **Alle Texte** müssen auf Deutsch sein
- **Dropdown-Buttons**: Auch die Beschriftungen/Placeholder der Dropdown-Buttons müssen auf Deutsch sein, nicht nur die Dropdown-Texte selbst
- **Fehlermeldungen**: Alle Fehlermeldungen auf Deutsch
- **Button-Labels**: Alle Button-Beschriftungen auf Deutsch
- **Formular-Labels**: Alle Formular-Feldbeschriftungen auf Deutsch

### Beispiele für korrekte Dropdown-Button-Beschriftungen:
```tsx
// ✅ RICHTIG
<SelectTrigger>
  <SelectValue placeholder="Fahrer auswählen" />
</SelectTrigger>

// ❌ FALSCH
<SelectTrigger>
  <SelectValue placeholder="Select driver" />
</SelectTrigger>
```

---

## 🎨 Design-System

### Farben
- **Primary**: Blau (wie definiert in Tailwind-Config)
- **Footer Homepage**: Blauer Hintergrund (`bg-primary`) mit weißer Schrift (`text-primary-foreground`)

### Abstände & Spacing
- **Einheitliche Abstände**: Alle ähnlichen Elemente müssen einheitliche Abstände haben
- **Fleet-Buttons**: Die 3 Buttons (Fahrer-Tab, Fahrzeuge-Tab, Neuer Fahrer/Fahrzeug) müssen:
  - Gleiche Höhe haben
  - Gleiche Abstände zwischen den Buttons haben
  - Einheitliches Padding haben
  - Einheitliche Border-Radius haben

### Typografie
- **Schriftgrößen**: Konsistent verwenden
- **Font-Weights**: Einheitlich (600 für Labels, 500 für Values)

---

## 📄 PDF-Generierung

### Visuelle Optimierungen
- **Dokument-Titel**: Größer (28pt), fett (700), besserer Abstand
- **Labels**: Dunkler (#4a5568), fetter (600), mehr Letter-Spacing
- **Tabellen**: 
  - Header mit Hintergrundfarbe (#f8f9fa)
  - Mehr Padding (14px 12px)
  - Hover-Effekt für Zeilen
- **Footer**: 
  - Dickerer Border (2px)
  - Mehr Abstand oben (60px)
  - Bessere Zeilenhöhe (1.8)

### Layout
- **A4-Format**: 210mm x 297mm
- **Ränder**: 20mm (außer bei Briefpapier)
- **Logo**: Max. 60px Höhe, max. 200px Breite

---

## 🚨 Error-Handling

### Error-Boundaries
- Jede Route sollte einen eigenen Error-Boundary haben (`error.tsx`)
- Fehlermeldungen müssen auf Deutsch sein
- Detailliertes Logging für Debugging

### Beispiel-Struktur:
```
app/
  einstellungen/
    page.tsx
    error.tsx  ← Spezifischer Error-Boundary
```

---

## ✅ Checkliste für neue Komponenten

- [ ] Alle Texte auf Deutsch
- [ ] Dropdown-Button-Placeholder auf Deutsch
- [ ] Einheitliche Abstände
- [ ] Konsistente Farben
- [ ] Error-Handling implementiert
- [ ] Responsive Design
- [ ] Accessibility (ARIA-Labels)

---

**Letzte Aktualisierung:** 2025-01-03

