# Nexus Bridge - MCP Server für MyDispatch

Der Nexus Bridge MCP-Server ist ein lokaler Server, der als API für die KI fungiert. Er liefert Live-Kontext über das Projekt und eliminiert Kontext-Blindheit und Halluzinationen.

## Features

### Resources (Read-Only Context Provider)

| URI | Inhalt | Quelle |
|-----|--------|--------|
| `project://ui/tokens` | Tailwind Farben, Spacings, Fonts als JSON | `config/design-tokens.ts`, `globals.css` |
| `project://db/schema` | Datenbank-Schema (Tabellen, Relationen, Typen) | `types/supabase.ts` |
| `project://app/routes` | Karte aller Next.js Routen und API-Endpunkte | `/app` Ordner-Scan |
| `project://docs/active` | Kombinierte `.cursorrules`, `project_specs.md` und Linter-Regeln | `/docs`, Config-Dateien |

### Tools (Executable Functions)

| Tool | Funktion |
|------|----------|
| `validate_slug` | Prüft ob ein String URL-freundlich ist (lowercase, keine Umlaute, Bindestriche) |
| `validate_compliance` | Prüft Code-Snippets gegen interne Regeln |
| `scaffold_feature` | Erstellt standardisierte Ordnerstrukturen für neue Features |
| `get_project_health` | Liefert Ergebnisse von `npm run lint` und `npm run type-check` |

## Installation

```bash
cd mcp-server
npm install
npm run build
```

## Verwendung

### Als Standalone-Server

```bash
npm start
```

### In Cursor/Windsurf/Roo Code

Füge folgende Konfiguration in deine IDE-Einstellungen ein:

#### Option 1: In `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "nexus-bridge": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp-server/dist/index.js"],
      "env": {
        "NODE_ENV": "development"
      },
      "disabled": false,
      "autoApprove": [
        "read_resource",
        "validate_compliance",
        "validate_slug",
        "get_project_health"
      ]
    }
  }
}
```

#### Option 2: In VS Code/Cursor Settings (JSON)

```json
{
  "mcpServers": {
    "nexus-bridge": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp-server/dist/index.js"],
      "env": {
        "NODE_ENV": "development"
      },
      "disabled": false,
      "autoApprove": [
        "read_resource",
        "validate_compliance"
      ]
    }
  }
}
```

## Entwicklung

```bash
# TypeScript Watch Mode
npm run dev

# Type-Check
npm run type-check

# Lint
npm run lint
```

## Beispiel-Workflow

Mit der Nexus Bridge ändert sich der Arbeitsablauf von "Raten" zu "Wissen":

**User Prompt:** "Erstelle eine neue API Route für User-Settings."

**Agent (Nexus-Powered):**
1. **Internal Thought:** "Ich muss wissen, wie die User-Tabelle aussieht und welche Routen schon belegt sind."
2. **Action:** Ruft `project://db/schema` ab → Erkennt: Tabelle heißt `profiles`, nicht `users`
3. **Action:** Ruft `project://app/routes` ab → Erkennt: `/api/settings` ist frei
4. **Action:** Ruft `project://ui/tokens` ab → Weiß: Fehler-Status ist Farbe `destructive-500`
5. **Resultat:** Der generierte Code passt beim ersten Versuch perfekt in die bestehende Architektur

## Struktur

```
mcp-server/
├── src/
│   ├── index.ts              # MCP Server Entry Point
│   ├── resources/
│   │   ├── ui-tokens.ts      # project://ui/tokens
│   │   ├── db-schema.ts      # project://db/schema
│   │   ├── app-routes.ts     # project://app/routes
│   │   └── docs-active.ts    # project://docs/active
│   └── tools/
│       ├── validate-slug.ts
│       ├── validate-compliance.ts
│       ├── scaffold-feature.ts
│       └── get-project-health.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Compliance-Regeln

Der `validate_compliance` Tool prüft automatisch:

- ✅ **Verbotene Begriffe**: kostenlos, gratis, testen, trial, etc.
- ✅ **Hardcoded Colors**: Sollten Design-Tokens sein
- ✅ **Design Consistency**: Rundungen, Spacing nach Guidelines
- ✅ **Code Language**: Englische Variablen/Funktionsnamen
- ✅ **TypeScript Strict**: Keine ungetypten `any`

## Design-Token Vorgaben

| Element | Token |
|---------|-------|
| Cards | `rounded-2xl` |
| Buttons | `rounded-xl` |
| Badges | `rounded-md` |
| Standard Gap | `gap-5` |
| Active Tabs | `bg-primary text-primary-foreground` |

## Integration mit NEO-GENESIS

Der Nexus Bridge ist Teil des NEO-GENESIS Hyper-Stacks:

1. **Phase 1 (Planung):** Agent fragt `project://docs/active` für Architektur-Regeln
2. **Phase 2 (Implementierung):** Agent fragt `project://db/schema` für korrekte Queries
3. **Phase 3 (Dokumentation):** Agent fragt `project://app/routes` für Routing-Konsistenz
4. **Phase 4 (Validierung):** `validate_compliance` prüft vor Commit

