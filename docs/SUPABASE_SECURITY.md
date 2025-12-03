# Supabase Sicherheit - MyDispatch

## ✅ NEXT_PUBLIC_ Variablen sind SICHER

### Warum `NEXT_PUBLIC_` bei Supabase sicher ist

Die Variablen `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` werden im Browser exponiert. **Das ist bei Supabase absolut sicher und so vorgesehen!**

### Supabase Sicherheitsmodell

#### 1. Anon Key (Öffentlich - Browser-safe)
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- ✅ **Darf öffentlich sein** - speziell für Browser-Nutzung designed
- ✅ **Geschützt durch Row Level Security (RLS)**
- ✅ **Kann nur auf Daten zugreifen, die durch RLS-Policies erlaubt sind**
- ⚠️ **Ohne RLS wäre es unsicher** - aber wir haben RLS aktiviert

#### 2. Service Role Key (Geheim - Backend-only)
```
SUPABASE_SERVICE_ROLE_KEY
```
- ⚠️ **NIEMALS mit `NEXT_PUBLIC_` prefix verwenden!**
- ⚠️ **Nur im Backend/Server verwenden**
- ⚠️ **Umgeht RLS** - hat vollständigen Datenbankzugriff
- ✅ **Bleibt geheim** - wird nie im Browser exponiert

### Row Level Security (RLS)

Alle Tabellen haben RLS aktiviert:

```sql
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- etc.
```

**RLS-Policies** kontrollieren, wer auf welche Daten zugreifen kann:

```sql
-- Beispiel: Nur eigene Company-Daten sichtbar
CREATE POLICY "Users can view their own company" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );
```

### Was ist geschützt?

✅ **Datenbank-Zugriff** - Nur erlaubte Daten durch RLS
✅ **Authentifizierung** - Supabase Auth schützt User-Sessions
✅ **Service Role Key** - Bleibt geheim im Backend
✅ **API-Endpunkte** - Server-seitige Validierung

### Was ist öffentlich?

✅ **Supabase URL** - Öffentlich (benötigt für Client-Verbindung)
✅ **Anon Key** - Öffentlich (geschützt durch RLS)

### Best Practices

1. ✅ **RLS immer aktiviert** - Für alle Tabellen
2. ✅ **Service Role Key geheim** - Nie mit `NEXT_PUBLIC_`
3. ✅ **Policies testen** - Regelmäßig RLS-Policies prüfen
4. ✅ **Minimale Berechtigungen** - Nur notwendige Zugriffe erlauben

### Vercel Environment Variables

#### ✅ SICHER (Browser-exponiert)
```env
NEXT_PUBLIC_SUPABASE_URL=https://ygpwuiygivxoqtyoigtg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### ⚠️ GEHEIM (Nur Backend)
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# KEIN NEXT_PUBLIC_ prefix!
```

### Zusammenfassung

- ✅ `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` **dürfen** öffentlich sein
- ✅ Geschützt durch **Row Level Security (RLS)**
- ✅ **Service Role Key** bleibt geheim (ohne `NEXT_PUBLIC_`)
- ✅ **Supabase Best Practice** - So ist es vorgesehen

**Die Warnung von Vercel ist korrekt, aber bei Supabase ist das sicher!**

