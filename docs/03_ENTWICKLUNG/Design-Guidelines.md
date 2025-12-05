# Design-Guidelines

## Übersicht

Dieses Dokument fasst die wichtigsten Design-Guidelines zusammen. Für vollständige Dokumentation siehe: `/workspace/lib/design-system/DESIGN_GUIDELINES.md`

## Farbpalette

### Design-Tokens (MÜSSEN verwendet werden)

| Token | Verwendung | Beispiel-Wert |
|-------|-----------|--------------|
| `primary` | Buttons, Links, Highlights | `#3b82f6` (Blau) |
| `secondary` | Sekundäre Aktionen | `#6b7280` (Grau) |
| `destructive` | Löschen, Fehler | `#ef4444` (Rot) |
| `muted` | Disabled, Secondary-Text | `#9ca3af` (Hellgrau) |
| `background` | Seiten-Hintergrund | `#ffffff` (Weiß) |
| `foreground` | Standard-Text | `#000000` (Schwarz) |
| `card` | Card-Hintergrund | `#f3f4f6` (Hellgrau) |

### Wie verwenden
```typescript
// ✅ GUT
<button className="bg-primary text-primary-foreground">
  Speichern
</button>

// ❌ FALSCH
<button style={{ backgroundColor: '#3b82f6' }}>
  Speichern
</button>
```

## Komponenten-Konventionen

### Rundungen
| Komponente | Klasse | Grund |
|-----------|--------|------|
| Cards | `rounded-2xl` | Großzügiger, moderner Look |
| Buttons | `rounded-xl` | Standard Button-Höhe |
| Inputs | `rounded-xl` | Konsistent mit Buttons |
| Badges | `rounded-md` | Kompakt |
| Dialogs | `rounded-xl` | Moderne, einladende Modals |

### Abstände (Gap/Spacing)
- **Standard Gap**: `gap-5` (16px)
- **Card Padding**: `p-4` (16px) oder `p-6` (24px)
- **Kompakte Layouts**: `gap-3` (12px)
- **Großzügige Layouts**: `gap-8` (32px)

## Typografie

- **Überschriften**: Fett, größer
- **Body-Text**: Regular weight
- **Labels**: Semibold, kleiner
- **Links**: `text-primary underline`

## Buttons

### Primär (Haupt-Aktion)
```tsx
<Button className="bg-primary">Speichern</Button>
```

### Sekundär (Alternative Aktion)
```tsx
<Button variant="outline">Abbrechen</Button>
```

### Destruktiv (Löschen/Gefährlich)
```tsx
<Button variant="destructive">Löschen</Button>
```

### Disabled (Inaktiv)
```tsx
<Button disabled>Nicht verfügbar</Button>
```

## Forms

### Struktur
```tsx
<form className="space-y-5">
  <div className="space-y-2">
    <label>Name *</label>
    <input className="rounded-xl border" />
  </div>
  
  <div className="space-y-2">
    <label>E-Mail *</label>
    <input type="email" className="rounded-xl border" />
  </div>
  
  <Button type="submit" className="w-full">
    Speichern
  </Button>
</form>
```

## Tables

```tsx
<table className="w-full">
  <thead className="border-b">
    <tr>
      <th className="text-left p-4">Name</th>
      <th className="text-left p-4">E-Mail</th>
    </tr>
  </thead>
  <tbody>
    {data.map(item => (
      <tr key={item.id} className="border-b hover:bg-muted">
        <td className="p-4">{item.name}</td>
        <td className="p-4">{item.email}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## Error Handling UI

### Error-Badge
```tsx
{error && (
  <div className="bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/20">
    {error}
  </div>
)}
```

### Form-Fehler
```tsx
{fieldError && (
  <span className="text-destructive text-sm">{fieldError}</span>
)}
```

## Loading & Skeletons

### Loading State
```tsx
{isLoading ? (
  <div className="flex justify-center">
    <Spinner />
  </div>
) : (
  <Content />
)}
```

### Empty State
```tsx
{data.length === 0 ? (
  <div className="text-center py-8">
    <p className="text-muted-foreground">Keine Daten vorhanden</p>
    <Button onClick={() => setShowForm(true)}>Erstelle eins</Button>
  </div>
) : (
  <Content />
)}
```

## Responsive Design

### Breakpoints
```
sm: 640px   (Tablets)
md: 768px   (Tablets landscape)
lg: 1024px  (Desktops)
xl: 1280px  (Large Desktops)
```

### Beispiel
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</div>
```

## Checkliste

Vor dem Commit:

- [ ] Alle Farben sind `bg-primary`, nicht `#3b82f6`?
- [ ] Buttons haben `rounded-xl`?
- [ ] Gap ist `gap-5` oder `gap-3` oder `gap-8`?
- [ ] Alle Texte sind auf Deutsch?
- [ ] Keine Typos?
- [ ] Mobile responsiv?
- [ ] Error Handling vorhanden?
- [ ] Loading States vorhanden?
- [ ] Pixel-genau wie Design?

---

**Vollständige Dokumentation**: `/workspace/lib/design-system/DESIGN_GUIDELINES.md`
