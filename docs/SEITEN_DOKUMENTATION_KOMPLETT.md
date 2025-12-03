# 📚 Vollständige Seiten-Dokumentation - MyDispatch

**Erstellt:** 2025-01-03  
**Version:** 1.0  
**Gesamt-Seiten:** 172 (zu analysieren)

---

## 📋 Inhaltsverzeichnis

1. [Seiten-Kategorien](#seiten-kategorien)
2. [Design-Vorgaben](#design-vorgaben)
3. [Kommunikationssystem](#kommunikationssystem)
4. [Schaltplan](#schaltplan)
5. [Seiten-Index](#seiten-index)
6. [IST/SOLL-Analyse](#istsoll-analyse)

---

## 📂 Seiten-Kategorien

### 1. Pre-Login Seiten (Public)
- Homepage
- Preise
- FAQ
- Kontakt
- Impressum
- Datenschutz
- AGB
- Nutzungsbedingungen

### 2. Auth-Seiten
- Login
- Sign-Up
- Forgot Password
- Reset Password
- Auth Callback
- Auth Error

### 3. Dashboard-Seiten (Unternehmer)
- Dashboard (Hauptseite)
- Aufträge
- Fahrzeuge (Fleet)
- Fahrer
- Kunden
- Finanzen
- Statistiken
- Rechnungen
- Einstellungen
- MyDispatch Chat

### 4. Kunden-Portal
- Kunden-Portal (Hauptseite)
- Registrieren
- Einstellungen
- Zahlungsmethoden
- Benachrichtigungen

### 5. Fahrer-Portal
- Fahrer-Portal (Hauptseite)
- Profil
- Dokumente

### 6. Tenant-Seiten (Unternehmens-Landingpages)
- Tenant Landing Page
- Tenant Login
- Tenant Kunde Portal
- Tenant Kunde Buchen
- Tenant Kunde Registrieren
- Tenant Kunde Einstellungen
- Tenant Fahrer Portal
- Tenant Impressum
- Tenant Datenschutz
- Tenant AGB

### 7. Admin-Seiten
- Admin Dashboard
- Setup Master

### 8. Widget-Seiten
- Widget [slug]

### 9. SEO-Seiten
- Stadt [slug]

### 10. API-Routen
- Alle API-Endpunkte

---

## 🎨 Design-Vorgaben

### Primärfarbe
- **#323D5E** - MyDispatch Dunkelblau-Grau
- Verwendung: Buttons, Links, Akzente, Icons

### Design-Tokens (IMMER verwenden)
```
bg-primary          -> #323D5E
text-primary        -> #323D5E
bg-primary/10       -> Icon-Backgrounds
text-primary-foreground -> Weiss auf Primary
bg-background       -> Weisser Hintergrund
text-foreground     -> Schwarzer/Dunkler Text
text-muted-foreground -> Grauer Sekundaertext
bg-muted            -> Leichter Grau-Hintergrund
border-border       -> Standard-Rahmenfarbe
bg-card             -> Card-Hintergrund
```

### Typografie
- **Primär**: System-Font-Stack (font-sans)
- **H1**: text-3xl → text-4xl → text-5xl
- **H2**: text-2xl → text-3xl → text-4xl
- **H3**: text-xl → text-2xl
- **Body**: text-base (16px)
- **Small**: text-sm (14px)

### Spacing
- **Standard-Gap**: gap-5 (20px)
- **Card-Padding**: p-5 / p-6
- **Section-Padding**: py-16 / py-20

### Komponenten
- **Cards**: rounded-2xl (16px), border border-border
- **Buttons**: rounded-xl (12px)
- **Icons**: bg-primary/10 rounded-xl w-10 h-10

### VERBOTENE Begriffe
- "kostenlos" / "gratis" / "free"
- "testen" / "Testphase" / "trial"
- "unverbindlich"
- "ohne Risiko"

---

## 🔄 Kommunikationssystem

### Architektur
```
Frontend (Next.js)
    ↓
API Routes (/api/*)
    ↓
Supabase Client
    ↓
Supabase Database
```

### Kommunikations-Flows

#### 1. Authentifizierung
```
Login Page → Auth API → Supabase Auth → Session → Dashboard
```

#### 2. Daten-Abfragen
```
Page Component → Supabase Client → RPC/Queries → Database → Response → UI
```

#### 3. E-Mail-Versand
```
Form Submit → API Route → (TODO: Resend/SendGrid) → E-Mail Service → Delivery
```

#### 4. Real-time Updates
```
Supabase Realtime → WebSocket → Client → UI Update
```

### API-Struktur
- `/api/auth/*` - Authentifizierung
- `/api/contact/*` - Kontakt-Formular
- `/api/bookings/*` - Aufträge
- `/api/chat/*` - Chat-System
- `/api/maps/*` - Karten-Services
- `/api/webhooks/*` - Webhooks (Stripe, Vercel)
- `/api/cron/*` - Cron-Jobs
- `/api/ai/*` - AI-Features

---

## 🔌 Schaltplan

### Seiten-Navigation

```
Homepage (/)
    ├── Preise (/preise)
    ├── FAQ (/fragen)
    ├── Kontakt (/kontakt)
    ├── Login (/auth/login)
    └── Sign-Up (/auth/sign-up)

Login (/auth/login)
    ├── Dashboard (/dashboard) [Unternehmer]
    ├── Kunden-Portal (/kunden-portal) [Kunde]
    ├── Fahrer-Portal (/fahrer-portal) [Fahrer]
    └── Tenant Login (/c/[company]/login) [Tenant]

Dashboard (/dashboard)
    ├── Aufträge (/auftraege)
    ├── Fahrzeuge (/fleet)
    ├── Fahrer (/fahrer)
    ├── Kunden (/kunden)
    ├── Finanzen (/finanzen)
    ├── Statistiken (/statistiken)
    ├── Rechnungen (/rechnungen)
    ├── Einstellungen (/einstellungen)
    └── MyDispatch Chat (/mydispatch/chat)

Tenant Landing Page (/c/[company])
    ├── Tenant Login (/c/[company]/login)
    ├── Tenant Kunde Portal (/c/[company]/kunde/portal)
    ├── Tenant Kunde Buchen (/c/[company]/kunde/buchen)
    └── Tenant Fahrer Portal (/c/[company]/fahrer/portal)
```

### Daten-Flows

```
User Action → Component → API Call → Supabase → Database
                                    ↓
                              Response → Component → UI Update
```

---

## 📑 Seiten-Index

### Pre-Login (8 Seiten)
1. Homepage (`/`)
2. Preise (`/preise`)
3. FAQ (`/fragen`)
4. Kontakt (`/kontakt`)
5. Impressum (`/impressum`)
6. Datenschutz (`/datenschutz`)
7. AGB (`/agb`)
8. Nutzungsbedingungen (`/nutzungsbedingungen`)

### Auth (6 Seiten)
9. Login (`/auth/login`)
10. Sign-Up (`/auth/sign-up`)
11. Sign-Up Success (`/auth/sign-up-success`)
12. Forgot Password (`/auth/forgot-password`)
13. Reset Password (`/auth/reset-password`)
14. Auth Error (`/auth/error`)

### Dashboard (10 Seiten)
15. Dashboard (`/dashboard`)
16. Aufträge (`/auftraege`)
17. Fahrzeuge (`/fleet`)
18. Fahrer (`/fahrer`)
19. Kunden (`/kunden`)
20. Finanzen (`/finanzen`)
21. Statistiken (`/statistiken`)
22. Rechnungen (`/rechnungen`)
23. Einstellungen (`/einstellungen`)
24. MyDispatch Chat (`/mydispatch/chat`)

### Kunden-Portal (5 Seiten)
25. Kunden-Portal (`/kunden-portal`)
26. Registrieren (`/kunden-portal/registrieren`)
27. Einstellungen (`/kunden-portal/einstellungen`)
28. Zahlungsmethoden (`/kunden-portal/zahlungsmethoden`)
29. Benachrichtigungen (`/kunden-portal/benachrichtigungen`)

### Fahrer-Portal (3 Seiten)
30. Fahrer-Portal (`/fahrer-portal`)
31. Profil (`/fahrer-portal/profil`)
32. Dokumente (`/fahrer-portal/dokumente`)

### Tenant (10 Seiten)
33. Tenant Landing Page (`/c/[company]`)
34. Tenant Login (`/c/[company]/login`)
35. Tenant Kunde Portal (`/c/[company]/kunde/portal`)
36. Tenant Kunde Buchen (`/c/[company]/kunde/buchen`)
37. Tenant Kunde Registrieren (`/c/[company]/kunde/registrieren`)
38. Tenant Kunde Einstellungen (`/c/[company]/kunde/portal/einstellungen`)
39. Tenant Fahrer Portal (`/c/[company]/fahrer/portal`)
40. Tenant Impressum (`/c/[company]/impressum`)
41. Tenant Datenschutz (`/c/[company]/datenschutz`)
42. Tenant AGB (`/c/[company]/agb`)

### Admin (2 Seiten)
43. Admin Dashboard (`/admin`)
44. Setup Master (`/admin/setup-master`)

### Sonstige (4 Seiten)
45. Partner (`/partner`)
46. Widget (`/widget/[slug]`)
47. Stadt SEO (`/stadt/[slug]`)
48. Subscription Required (`/subscription-required`)

### API-Routen (124 Routen)
49-172. Alle API-Endpunkte (siehe separate Dokumentation)

**Gesamt: 172 Seiten**

---

## 🔍 IST/SOLL-Analyse

### Analyse-Workflow

Für jede Seite:
1. ✅ Datei laden (`ReadFile`)
2. ✅ Komponenten identifizieren
3. ✅ Design-Vorgaben prüfen
4. ✅ Funktionen dokumentieren
5. ✅ IST-Zustand erfassen
6. ✅ SOLL-Zustand definieren
7. ✅ Abweichungen identifizieren
8. ✅ Fixes implementieren

### Status-Legende
- ✅ **Vollständig** - Seite entspricht Vorgaben
- ⚠️ **Teilweise** - Kleinere Abweichungen
- ❌ **Fehlend** - Große Abweichungen oder fehlende Features
- 🔄 **In Bearbeitung** - Aktuell in Arbeit

---

**Nächster Schritt:** Systematische Analyse jeder einzelnen Seite beginnt jetzt...

