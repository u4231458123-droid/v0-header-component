# MyDispatch Design Guidelines v2.0 - VERBINDLICH

## VERBOTENE BEGRIFFE (PFLICHT!)

Die folgenden Begriffe dürfen NIEMALS verwendet werden:
- "kostenlos" / "gratis" / "free"
- "testen" / "Testphase" / "trial"
- "unverbindlich"
- "ohne Risiko"

### Erlaubte Alternativen:
- "Jetzt registrieren"
- "Jetzt starten"
- "Tarif wählen"
- "Monatlich kündbar"
- "Entdecken Sie MyDispatch"
- "Lernen Sie uns kennen"
- "Flexibel ohne Mindestlaufzeit"

---

## CI FARBEN (VERBINDLICH)

### Primärfarbe
- **#323D5E** - MyDispatch Dunkelblau-Grau
- Verwendung: Buttons, Links, Akzente, Icons

### Design-Tokens (IMMER verwenden statt Hardcoded-Farben):
\`\`\`
bg-primary          -> #323D5E (Primaerfarbe)
text-primary        -> #323D5E (Primaerfarbe fuer Text)
bg-primary/10       -> Icon-Backgrounds, leichte Akzente
text-primary-foreground -> Weiss auf Primary-Hintergrund
bg-background       -> Weisser Hintergrund
text-foreground     -> Schwarzer/Dunkler Text
text-muted-foreground -> Grauer Sekundaertext
bg-muted            -> Leichter Grau-Hintergrund
border-border       -> Standard-Rahmenfarbe
bg-card             -> Card-Hintergrund
\`\`\`

### VERBOTENE Farbcodes (ersetzen durch Tokens):
- `#0A2540` -> `bg-primary`
- `bg-slate-800` -> `bg-primary`
- `bg-slate-900` -> `bg-primary`
- `bg-slate-100` -> `bg-muted` oder `bg-primary/10`
- `text-slate-900` -> `text-foreground`
- `text-slate-600/700` -> `text-muted-foreground`
- `text-gray-*` -> entsprechende Design-Tokens
- `border-gray-*` -> `border-border`

---

## TYPOGRAFIE

### Schriftfamilie
- **Primär**: System-Font-Stack (font-sans)
- **Monospace**: Für Code/Zahlen (font-mono)

### Schriftgrößen (Mobile → Desktop)
- H1: text-3xl → text-4xl → text-5xl
- H2: text-2xl → text-3xl → text-4xl
- H3: text-xl → text-2xl
- Body: text-base (16px)
- Small: text-sm (14px)
- Caption: text-xs (12px)

---

## ABSTÄNDE (SPACING)

### Standard-Gap fuer Layouts:
- **gap-5** (20px) - Standard für Grids und Flex-Layouts

### Erlaubte Gaps:
- gap-2 (8px) - Sehr kleine Abstände (Icons, Badges)
- gap-3 (12px) - Kleine Inline-Elemente
- gap-5 (20px) - **STANDARD** für Cards und Grids
- gap-8 (32px) - Nur für große Sektionen

### Padding:
- p-5 / p-6 - Card-Padding
- py-16 / py-20 - Section-Padding vertikal
- px-4 sm:px-6 lg:px-8 - Container-Padding horizontal

### VERMEIDEN:
- gap-4 und gap-6 → durch gap-5 ersetzen wo möglich

---

## KOMPONENTEN-DESIGN

### Cards
- **Border-Radius**: rounded-2xl (16px)
- **Border**: border border-border
- **Hover**: hover:border-primary/50 hover:shadow-lg
- **Transition**: transition-all duration-300

### Buttons
- **Border-Radius**: rounded-xl (12px)
- **Primary**: bg-primary text-primary-foreground hover:bg-primary/90
- **Secondary/Outline**: border border-border hover:bg-muted

### Icons in Containern
- **Container**: bg-primary/10 rounded-xl w-10 h-10 oder w-12 h-12
- **Icon**: text-primary w-5 h-5 oder w-6 h-6
- **Zentrieren**: flex items-center justify-center

### Inputs
- **Border-Radius**: rounded-lg (8px)
- **Border**: border border-input
- **Focus**: focus:ring-2 focus:ring-ring

### VERBOTEN in Cards:
- rounded-lg → durch rounded-2xl ersetzen
- rounded-md → durch rounded-xl oder rounded-2xl ersetzen

---

## LOGO

### Offizieller Pfad
- `/images/my-dispatch-logo.png`

### Größen nach Kontext:
- Header Desktop: h-10 w-auto
- Header Mobile: h-8 oder h-9 w-auto
- Footer: h-8 w-auto
- Auth-Seiten: h-10 bis h-12 w-auto

### Verwendung:
- Auf hellem Hintergrund: Normal
- Auf dunklem Hintergrund: `className="brightness-0 invert"`

### Alt-Text:
- "MyDispatch - simply arrive"

---

## REFERENZ-SEITEN (VERBINDLICH)

Die folgenden Seiten gelten als Design-Referenz:
1. **Homepage** (`app/page.tsx`) - Hero, Features, CTAs
2. **Dashboard** (`app/dashboard/page.tsx`) - Portal-Design, KPI-Cards
3. **Login** (`app/auth/login/page.tsx`) - Auth-Design
4. **Sign-Up** (`app/auth/sign-up/page.tsx`) - Registrierungs-Flow

Alle anderen Seiten MÜSSEN diesem Design folgen.

---

## HOVER-EFFEKTE

### Cards:
\`\`\`
hover:border-primary/50 hover:shadow-lg transition-all duration-300
\`\`\`

### Buttons:
\`\`\`
hover:bg-primary/90 transition-colors
\`\`\`

### Links:
\`\`\`
hover:text-foreground transition-colors
\`\`\`
oder
\`\`\`
hover:underline
\`\`\`

---

## CHECKLISTE VOR DEPLOYMENT

- [ ] Keine verbotenen Begriffe (kostenlos, testen, trial, etc.)
- [ ] Alle Farben verwenden Design-Tokens (keine Hex-Codes)
- [ ] Cards verwenden rounded-2xl
- [ ] Buttons verwenden rounded-xl
- [ ] Logo-Pfad ist /images/my-dispatch-logo.png
- [ ] Abstände verwenden gap-5 (Standard)
- [ ] Hover-Effekte sind konsistent
- [ ] Mobile-Responsiveness geprüft
- [ ] Icon-Container verwenden bg-primary/10 text-primary

---

## VERPFLICHTUNGEN

1. **Keine "kostenlos/testen" Texte** - NIEMALS
2. **Nur CI-konforme Farben** - Design-Tokens verwenden
3. **Konsistente Abstände** - gap-5 als Standard
4. **Einheitliche Komponenten-Styles** - Siehe oben
5. **Logo-Qualität und -Größe einhalten** - Korrekter Pfad
6. **Referenz-Seiten als Vorlage** - Homepage und Dashboard

---

*Stand: November 2025 - v2.0*
