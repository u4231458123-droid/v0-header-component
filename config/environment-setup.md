# Environment Configuration

## Erforderliche Umgebungsvariablen

Erstellen Sie eine `.env.local` Datei im Projekt-Root mit folgenden Variablen:

### GitHub Integration
```
GITHUB_TOKEN=your_github_personal_access_token
```

### Vercel Deployment
```
VERCEL_TOKEN=your_vercel_token
```

### AI Gateway (Vercel AI SDK)
```
AI_GATEWAY_API_KEY=your_ai_gateway_api_key
```

### CodeRabbit AI Code Review
```
CODERABBIT_KEY=your_coderabbit_key
```

### DeepSeek AI
```
DEEPSEEK_API_KEY=your_deepseek_api_key
```

> **Hinweis:** Die tatsächlichen API-Keys wurden dem Benutzer separat mitgeteilt und sollten niemals in Git committet werden.

### MCP Server (Nexus Bridge)
```
MCP_SERVER_PORT=3001
NODE_ENV=development
```

## GitHub Repository Secrets

Für CI/CD müssen folgende Secrets im GitHub Repository konfiguriert werden:

1. `GITHUB_TOKEN` - Automatisch verfügbar
2. `VERCEL_TOKEN` - Vercel Deployment Token
3. `AI_GATEWAY_API_KEY` - AI Gateway API Key
4. `HUGGINGFACE_READ_TOKEN` - Hugging Face Token
5. `SUPABASE_URL` - Supabase Projekt-URL
6. `SUPABASE_ANON_KEY` - Supabase Anon Key
7. `SUPABASE_SERVICE_ROLE_KEY` - Supabase Service Role Key

## Konfiguration in Cursor/IDE

Für MCP-Server-Integration, fügen Sie in Ihre IDE-Einstellungen hinzu:

```json
{
  "mcpServers": {
    "nexus-bridge": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp-server/dist/index.js"],
      "env": {
        "NODE_ENV": "development",
        "MCP_SERVER_PORT": "3001"
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

