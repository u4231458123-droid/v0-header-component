# Design Guidelines

## Farbpalette

### Primärfarben
- **Primary**: #0066FF (Blau) - CTAs, Links, Akzente
- **Primary Dark**: #0052CC - Hover-Zustände

### Neutralfarben
- **Background**: #FFFFFF
- **Foreground**: #0A0A0A
- **Muted**: #F5F5F5
- **Border**: #E5E5E5

### Statusfarben
- **Success**: #22C55E
- **Warning**: #F59E0B
- **Error**: #EF4444
- **Info**: #3B82F6

## Typografie

### Font-Familie
- **Sans-Serif**: Inter, system-ui
- **Mono**: JetBrains Mono, monospace

### Schriftgrößen
\`\`\`css
text-xs: 0.75rem (12px)
text-sm: 0.875rem (14px)
text-base: 1rem (16px)
text-lg: 1.125rem (18px)
text-xl: 1.25rem (20px)
text-2xl: 1.5rem (24px)
text-3xl: 1.875rem (30px)
text-4xl: 2.25rem (36px)
\`\`\`

### Schriftgewichte
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Spacing

\`\`\`css
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
\`\`\`

## Breakpoints

\`\`\`css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
\`\`\`

## Komponenten

### Buttons

\`\`\`jsx
// Primary
<Button className="bg-primary text-white hover:bg-primary/90">
  Primary
</Button>

// Secondary
<Button variant="outline">
  Secondary
</Button>

// Ghost
<Button variant="ghost">
  Ghost
</Button>
\`\`\`

### Cards

\`\`\`jsx
<Card className="p-6 rounded-xl border shadow-sm">
  <CardHeader>
    <CardTitle>Titel</CardTitle>
    <CardDescription>Beschreibung</CardDescription>
  </CardHeader>
  <CardContent>
    Inhalt
  </CardContent>
</Card>
\`\`\`

### Formulare

\`\`\`jsx
<div className="space-y-4">
  <div>
    <Label htmlFor="email">E-Mail</Label>
    <Input id="email" type="email" />
  </div>
  <div>
    <Label htmlFor="password">Passwort</Label>
    <Input id="password" type="password" />
  </div>
  <Button type="submit" className="w-full">
    Absenden
  </Button>
</div>
\`\`\`

## Icons

### Inline SVG Pattern
\`\`\`jsx
// Verwende Inline SVGs statt lucide-react für kritische Komponenten
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="24" 
  height="24" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  strokeWidth="2"
>
  <path d="M..."/>
</svg>
\`\`\`

## Responsive Design

### Mobile-First Approach
\`\`\`css
/* Base: Mobile */
.element {
  padding: 1rem;
}

/* Tablet */
@screen md {
  .element {
    padding: 1.5rem;
  }
}

/* Desktop */
@screen lg {
  .element {
    padding: 2rem;
  }
}
\`\`\`

### Touch-Targets
- Minimum 44x44px für Touch-Elemente
- Ausreichend Abstand zwischen interaktiven Elementen
