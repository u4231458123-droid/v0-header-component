# CPO - Verstöße und Umsetzungsplan

**Datum:** 2024  
**Rolle:** CPO & Lead Architect  
**Status:** ✅ Analyse abgeschlossen, Umsetzung läuft

---

## IDENTIFIZIERTE VERSTÖSSE

### 1. Design-Verstöße (Hardcoded Farben)

**Status:** ⚠️ Teilweise behoben, weitere Prüfung erforderlich

**Gefundene Verstöße:**
- `app/fahrer-portal/profil/page.tsx`: `bg-emerald-500 text-white`
- `app/kunden-portal/registrieren/page.tsx`: `bg-slate-700`, `bg-primary` (OK)
- `app/stadt/[slug]/page.tsx`: `bg-white/95`, `bg-white`, `text-white`
- `app/c/[company]/login/TenantLoginPage.tsx`: `bg-white/80`, `text-slate-*`, `bg-slate-*`

**Bereits behoben:**
- ✅ `app/page.tsx`: Alle `bg-white` → `bg-card` (bereits umgesetzt)
- ✅ `app/kunden-portal/page.tsx`: Alle `text-slate-*` → `text-muted-foreground` (bereits umgesetzt)

### 2. Design-Verstöße (Rundungen)

**Status:** ⚠️ Teilweise behoben

**Gefundene Verstöße:**
- `app/page.tsx`: `rounded-lg` (sollte `rounded-xl` für Buttons sein)
- `app/subscription-required/page.tsx`: `rounded-lg` (sollte `rounded-2xl` für Cards sein)
- `app/stadt/[slug]/page.tsx`: `rounded-lg` (sollte `rounded-xl` sein)
- `app/c/[company]/login/TenantLoginPage.tsx`: `rounded-lg` (sollte `rounded-xl` sein)

**Vorgabe:**
- Cards: `rounded-2xl`
- Buttons: `rounded-xl`
- Badges: `rounded-md`

### 3. Design-Verstöße (Spacing)

**Status:** ⚠️ Teilweise behoben

**Gefundene Verstöße:**
- `app/kunden-portal/page.tsx`: `gap-4` (sollte `gap-5` sein)
- `app/page.tsx`: `gap-4` (sollte `gap-5` sein)

**Vorgabe:**
- Standard-Spacing: `gap-5`

### 4. Code-Qualität

**Status:** ✅ Größtenteils erfüllt

**Bereits implementiert:**
- ✅ TypeScript strict mode
- ✅ ESLint konfiguriert
- ✅ VS Code Settings optimiert

**Verbleibend:**
- ⏳ Prüfung auf `any`-Types
- ⏳ Prüfung auf `console.log` (außer warn/error)

### 5. Performance

**Status:** ⏳ Noch nicht implementiert

**Vorgaben:**
- Optimistic UI Updates
- Caching-Strategien
- Bundle-Size <500KB

### 6. DSGVO-Compliance

**Status:** ⏳ Prüfung erforderlich

**Vorgaben:**
- Strikte company-basierte RLS
- Keine Master-Admin-Policies
- Bearbeiter-Tracking

### 7. AI-Modelle

**Status:** ⏳ Prüfung erforderlich

**Vorgabe:**
- NUR Hugging Face (keine anderen APIs)

---

## UMSETZUNGSPLAN

### Phase 1: Design-Verstöße beheben (KRITISCH)

**Priorität:** Hoch

1. **Hardcoded Farben ersetzen:**
   - `app/fahrer-portal/profil/page.tsx`: `bg-emerald-500 text-white` → `bg-success text-success-foreground`
   - `app/stadt/[slug]/page.tsx`: `bg-white/95` → `bg-card/95`, `bg-white` → `bg-card`, `text-white` → `text-primary-foreground`
   - `app/c/[company]/login/TenantLoginPage.tsx`: `bg-white/80` → `bg-card/80`, `text-slate-*` → `text-muted-foreground`, `bg-slate-*` → `bg-muted`

2. **Rundungen korrigieren:**
   - `app/page.tsx`: `rounded-lg` → `rounded-xl` (Buttons)
   - `app/subscription-required/page.tsx`: `rounded-lg` → `rounded-2xl` (Cards)
   - `app/stadt/[slug]/page.tsx`: `rounded-lg` → `rounded-xl`
   - `app/c/[company]/login/TenantLoginPage.tsx`: `rounded-lg` → `rounded-xl`

3. **Spacing korrigieren:**
   - `app/kunden-portal/page.tsx`: `gap-4` → `gap-5`
   - `app/page.tsx`: `gap-4` → `gap-5`

### Phase 2: Code-Qualität optimieren

**Priorität:** Mittel

1. **TypeScript-Prüfung:**
   - Alle `any`-Types finden und ersetzen
   - Explizite Typen definieren

2. **Console-Log-Prüfung:**
   - Alle `console.log` finden (außer warn/error)
   - Entfernen oder durch Logger ersetzen

### Phase 3: Performance-Optimierungen

**Priorität:** Mittel

1. **Optimistic UI Updates:**
   - Implementierung in kritischen Komponenten
   - Feedback sofort anzeigen, dann Server-Sync

2. **Caching-Strategien:**
   - React Query oder SWR implementieren
   - Cache-Invalidierung optimieren

### Phase 4: DSGVO-Compliance prüfen

**Priorität:** Hoch

1. **RLS-Policies prüfen:**
   - Keine Master-Admin-Policies
   - Strikte company-basierte Filterung

2. **Bearbeiter-Tracking:**
   - `created_by` und `updated_by` in allen relevanten Tabellen
   - Frontend-Integration

### Phase 5: AI-Modelle prüfen

**Priorität:** Mittel

1. **AI-Integration prüfen:**
   - Nur Hugging Face verwenden
   - Andere APIs entfernen/ersetzen

---

## NÄCHSTE SCHRITTE

1. ⏳ Phase 1: Design-Verstöße beheben (sofort)
2. ⏳ Phase 2: Code-Qualität optimieren
3. ⏳ Phase 3: Performance-Optimierungen
4. ⏳ Phase 4: DSGVO-Compliance prüfen
5. ⏳ Phase 5: AI-Modelle prüfen

---

**Erstellt von:** CPO & Lead Architect  
**Datum:** 2024
