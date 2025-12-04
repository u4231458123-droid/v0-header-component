# Design-Guidelines - Verbindliche Vorgaben

Dieses Dokument definiert die verbindlichen Design-Vorgaben für alle Komponenten und Seiten der Anwendung.

## 1. Design-Tokens

### 1.1 Farben

**NUR Design-Tokens verwenden - KEINE hardcoded Farben!**

#### Erlaubte Farb-Tokens:
- `bg-primary`, `text-primary`, `border-primary`
- `bg-muted`, `text-muted-foreground`, `border-muted`
- `bg-foreground`, `text-foreground`
- `bg-background`
- `bg-card`, `text-card-foreground`
- `bg-destructive`, `text-destructive-foreground`
- `bg-secondary`, `text-secondary-foreground`

#### Verboten:
- Hardcoded Hex-Farben: `#475569`, `#0f172a`, etc.
- Hardcoded RGB/RGBA: `rgb(...)`, `rgba(...)`
- Direkte Tailwind-Farben: `bg-blue-500`, `text-slate-800`, `border-gray-300`, etc.

**Ausnahme**: Nur in `lib/design-system/design-tokens.ts` und `config/design-tokens.ts` sind Hex-Werte erlaubt.

### 1.2 Rundungen (Border Radius)

| Komponente | Klasse | Verwendung |
|------------|--------|------------|
| Cards | `rounded-2xl` | Alle Card-Komponenten |
| Buttons | `rounded-xl` | Alle Button-Komponenten |
| Badges | `rounded-md` | Alle Badge-Komponenten |
| Inputs | `rounded-xl` | Alle Input-Felder |
| Dialogs | `rounded-xl` | Dialog-Content |
| Container/Boxen | `rounded-xl` | Allgemeine Container |

**Verboten**:
- `rounded` (ohne Suffix)
- `rounded-lg` für Cards (muss `rounded-2xl` sein)
- `rounded-md` für Buttons (muss `rounded-xl` sein)

### 1.3 Spacing

#### Standard-Spacing:
- **Gap**: `gap-5` als Standard (statt `gap-4` oder `gap-6`)
- **Padding Cards**: `p-4` oder `p-6`
- **Padding Buttons**: `px-4 py-2` oder `p-2` für Icon-Buttons

#### Erlaubte Spacing-Werte:
- `gap-2`, `gap-3`, `gap-5`, `gap-8`
- `p-2`, `p-4`, `p-6`
- `px-4`, `py-2`, etc.

**Vermeiden**: `gap-4`, `gap-6` (verwende `gap-5`)

### 1.4 Typography

- **Headings**: `font-medium` oder `font-semibold`
- **Body**: Standard (keine explizite font-weight)
- **Muted Text**: `text-muted-foreground`
- **Primary Text**: `text-foreground`

## 2. Komponenten-spezifische Vorgaben

### 2.1 Cards

```tsx
<Card className="rounded-2xl border-border">
  <CardHeader>
    <CardTitle>...</CardTitle>
  </CardHeader>
  <CardContent className="p-4">
    ...
  </CardContent>
</Card>
```

### 2.2 Buttons

```tsx
<Button className="rounded-xl">
  ...
</Button>
```

### 2.3 Tabs

**Aktive Tabs**:
```tsx
// RICHTIG:
<TabsTrigger value="tab1" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
  Tab 1
</TabsTrigger>

// FALSCH:
<TabsTrigger value="tab1" className="data-[state=active]:bg-card">
  Tab 1
</TabsTrigger>
```

### 2.4 Dialogs

```tsx
<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl">
  ...
</DialogContent>
```

## 3. Verbotene Begriffe

Diese Begriffe sind in der gesamten Anwendung **VERBOTEN**:

- `kostenlos`
- `gratis`
- `free` (außer in Code-Kommentaren)
- `testen`
- `Testphase`
- `trial`
- `unverbindlich`
- `ohne Risiko`

**Grund**: Marketing- und rechtliche Vorgaben.

## 4. Konsistenz-Checkliste

Vor jedem Commit prüfen:

- [ ] Keine hardcoded Farben (nur Design-Tokens)
- [ ] Cards verwenden `rounded-2xl`
- [ ] Buttons verwenden `rounded-xl`
- [ ] Standard-Spacing: `gap-5` statt `gap-4`/`gap-6`
- [ ] Aktive Tabs: `bg-primary text-primary-foreground`
- [ ] Keine verbotenen Begriffe
- [ ] Konsistente Padding-Werte

## 5. CI/CD Validierung

Die Design-Validierung läuft automatisch:

1. **Pre-Commit Hook**: Prüft alle geänderten Dateien
2. **GitHub Actions**: Prüft alle Dateien bei Push
3. **Script**: `scripts/cicd/auto-design-validator.mjs`

**Bei Fehlern**: Commit/Push wird blockiert bis alle Verstöße behoben sind.

## 6. Abhängigkeiten prüfen

Bei Änderungen an Komponenten IMMER prüfen:

1. **Verwandte Komponenten**: Sind alle ähnlichen Komponenten konsistent?
   - Beispiel: Wenn `BookingDetailsDialog` geändert wird, prüfe `InvoiceDetailsDialog` und `QuoteDetailsDialog`

2. **Design-Tokens**: Werden die richtigen Tokens verwendet?
   - Beispiel: Wenn neue Farben benötigt werden, füge sie zu `design-tokens.ts` hinzu

3. **TypeScript-Types**: Bei DB-Schema-Änderungen Types aktualisieren
   - Beispiel: Wenn `profiles` Tabelle erweitert wird, aktualisiere `types/supabase.ts`

4. **RLS-Policies**: Bei neuen Tabellen/Spalten Policies prüfen
   - Beispiel: Wenn `created_by` hinzugefügt wird, prüfe RLS-Policies

## 7. Beispiele

### RICHTIG:
```tsx
<div className="rounded-xl border bg-muted/50 p-4">
  <Button className="rounded-xl bg-primary text-primary-foreground">
    Speichern
  </Button>
</div>
```

### FALSCH:
```tsx
<div className="rounded border bg-slate-100 p-4">
  <Button className="rounded-md bg-blue-500 text-white">
    Speichern
  </Button>
</div>
```

## 8. Referenzen

- Design-Tokens: [`lib/design-system/design-tokens.ts`](../lib/design-system/design-tokens.ts)
- Auto-Validator: [`scripts/cicd/auto-design-validator.mjs`](../../scripts/cicd/auto-design-validator.mjs)
- Layout-Validator: [`scripts/validate-layout.js`](../../scripts/validate-layout.js)

