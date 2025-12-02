# Portal-Übersicht

## Systemarchitektur

MyDispatch besteht aus vier Hauptportalen:

\`\`\`
┌─────────────────────────────────────────────────────┐
│                   MyDispatch                         │
├─────────────────────────────────────────────────────┤
│  Pre-Login          │  Post-Login                    │
│  ─────────          │  ──────────                    │
│  • Homepage         │  • Unternehmerportal           │
│  • Pricing          │  • Fahrerportal                │
│  • FAQ              │  • Kundenportal                │
│  • Docs             │  • Tenant-Landingpages         │
│  • Contact          │                                │
│  • Auth             │                                │
└─────────────────────────────────────────────────────┘
\`\`\`

## 1. Pre-Login Bereich

### Routen
| Route | Beschreibung |
|-------|--------------|
| / | Homepage |
| /pricing | Preise und Tarife |
| /faq | Häufige Fragen |
| /docs | Dokumentation |
| /contact | Kontaktformular |
| /impressum | Impressum |
| /datenschutz | Datenschutzerklärung |
| /agb | AGB |
| /auth/login | Login |
| /auth/sign-up | Registrierung |

### Komponenten
- MarketingLayout
- V28CookieConsent
- V28HeroSection
- V28PricingCard

## 2. Unternehmerportal

### Routen
| Route | Beschreibung | Tarif |
|-------|--------------|-------|
| /dashboard | Übersicht | Alle |
| /auftraege | Buchungsverwaltung | Alle |
| /fahrer | Fahrerverwaltung | Alle |
| /kunden | Kundenverwaltung | Alle |
| /rechnungen | Rechnungswesen | Alle |
| /einstellungen | Firmeneinstellungen | Alle |

### Features nach Tarif
| Feature | Starter | Business | Enterprise |
|---------|---------|----------|------------|
| Dashboard | Ja | Ja | Ja |
| Buchungen | Ja | Ja | Ja |
| Fahrer (Limit) | 5 | 20 | Unbegrenzt |
| Fahrzeuge (Limit) | 5 | 20 | Unbegrenzt |
| Statistiken | Basis | Erweitert | Premium |
| API-Zugang | Nein | Ja | Ja |

## 3. Fahrerportal

### Routen
| Route | Beschreibung |
|-------|--------------|
| /fahrer-portal | Dashboard |
| /fahrer-portal/dokumente | Dokumentenverwaltung |

### Features
- Schicht starten/beenden
- Fahrten annehmen/ablehnen
- Fahrtenstatus aktualisieren
- Dokumente hochladen
- Verfügbarkeitsstatus

## 4. Kundenportal

### Routen
| Route | Beschreibung |
|-------|--------------|
| /kunden-portal | Dashboard |
| /kunden-portal/registrieren | Registrierung |

### Features
- Buchungsübersicht
- Buchungshistorie
- Profilmanagement
- Neue Buchung erstellen

## 5. Tenant-Landingpages

### Routen
| Route | Beschreibung | Tarif |
|-------|--------------|-------|
| /[slug] | Dynamische Unternehmensseite | Alle |

### Features nach Tarif
| Feature | Starter | Business | Enterprise |
|---------|---------|----------|------------|
| Landingpage | Ja | Ja | Ja |
| Custom Branding | Nein | Ja | Ja |
| Buchungswidget | Nein | Ja | Ja |
| Kundenregistrierung | Ja | Ja | Ja |
| White-Label | Nein | Nein | Ja |

## Zugriffskontrolle

### Rollen
| Rolle | Zugriff |
|-------|---------|
| master_admin | Alles |
| admin | Firmenportal |
| dispatcher | Buchungen, Fahrer |
| driver | Fahrerportal |
| customer | Kundenportal |

### Middleware
Die Middleware prüft:
1. Session-Gültigkeit
2. Token-Refresh
3. Rollenbasierte Weiterleitung
