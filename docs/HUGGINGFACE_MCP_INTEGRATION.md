# Hugging Face MCP Integration - Vollständige Dokumentation

## Übersicht

Diese Dokumentation beschreibt die vollständige Integration des Hugging Face Model Context Protocol (MCP) für die MyDispatch-Anwendung. MCP ermöglicht direkten Zugriff auf Hugging Face Models über einen standardisierten Protokoll.

## Konfiguration

### 1. Cursor MCP-Konfiguration

Die MCP-Konfiguration für Cursor befindet sich in `.cursor/mcp.json` oder kann manuell in den Cursor-Einstellungen hinzugefügt werden:

```json
{
  "mcpServers": {
    "hf-mcp-server": {
      "url": "https://huggingface.co/mcp",
      "auth": {
        "type": "oauth",
        "loginUrl": "https://huggingface.co/mcp?login"
      },
      "headers": {
        "Authorization": "Bearer ${HUGGINGFACE_READ_TOKEN}"
      }
    }
  }
}
```

### 2. Umgebungsvariablen

Erforderliche Umgebungsvariablen in `.env.local`:

```bash
# Hugging Face READ Token (für MCP)
HUGGINGFACE_READ_TOKEN=your_read_token_here

# Hugging Face API Key (Fallback)
HUGGINGFACE_API_KEY=your_api_key_here
```

### 3. OAuth-Login

1. Öffne die Login-URL: `https://huggingface.co/mcp?login`
2. Melde dich mit deinem Hugging Face Account an
3. Erlaube den Zugriff auf MCP
4. Kopiere den generierten READ Token
5. Füge den Token zu `.env.local` hinzu

## Verfügbare Funktionen

### HuggingFaceMCPClient

Die `HuggingFaceMCPClient` Klasse bietet folgende Methoden:

#### 1. `checkMCPServer()`

Prüft ob der MCP-Server verfügbar ist:

```typescript
import { getHuggingFaceMCPClient } from "@/lib/ai/bots/huggingface-mcp"

const client = getHuggingFaceMCPClient()
const check = await client.checkMCPServer()

if (check.available) {
  console.log("MCP-Server ist verfügbar")
} else {
  console.error(check.message)
}
```

#### 2. `generate(model, prompt, parameters?)`

Generiert Text mit einem Hugging Face Model über MCP:

```typescript
const client = getHuggingFaceMCPClient()
const response = await client.generate(
  "microsoft/Phi-3-mini-4k-instruct",
  "Erkläre TypeScript in einem Satz.",
  {
    max_new_tokens: 100,
    temperature: 0.7,
  }
)

if (response.generated_text) {
  console.log(response.generated_text)
} else if (response.error) {
  console.error(response.error)
}
```

#### 3. `listModels()`

Listet alle verfügbaren Models über MCP:

```typescript
const client = getHuggingFaceMCPClient()
const { models, error } = await client.listModels()

if (error) {
  console.error(error)
} else {
  console.log("Verfügbare Models:", models)
}
```

#### 4. `hasAuth()`

Prüft ob Auth konfiguriert ist:

```typescript
const client = getHuggingFaceMCPClient()
if (!client.hasAuth()) {
  console.warn("Keine Auth-Konfiguration gefunden")
  console.log("Login-URL:", client.getLoginUrl())
}
```

## Integration in Bots

### System-Bot Integration

Der System-Bot kann Hugging Face MCP für Code-Analyse nutzen:

```typescript
import { getHuggingFaceMCPClient } from "@/lib/ai/bots/huggingface-mcp"

// In System-Bot
async analyzeCode(code: string) {
  const mcpClient = getHuggingFaceMCPClient()
  
  if (mcpClient.hasAuth()) {
    const response = await mcpClient.generate(
      "deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct",
      `Analysiere folgenden Code auf Fehler:\n\n${code}`
    )
    
    if (response.generated_text) {
      return response.generated_text
    }
  }
  
  // Fallback zu normalem Hugging Face Client
  // ...
}
```

### Quality-Bot Integration

Der Quality-Bot kann MCP für Qualitätsprüfungen nutzen:

```typescript
import { getHuggingFaceMCPClient } from "@/lib/ai/bots/huggingface-mcp"

// In Quality-Bot
async checkCodeQuality(code: string) {
  const mcpClient = getHuggingFaceMCPClient()
  
  if (mcpClient.hasAuth()) {
    const response = await mcpClient.generate(
      "bigcode/starcoder2-15b-instruct",
      `Prüfe folgenden Code auf Qualitätsprobleme:\n\n${code}`
    )
    
    if (response.generated_text) {
      return this.parseQualityReport(response.generated_text)
    }
  }
  
  // Fallback zu normalem Quality-Check
  // ...
}
```

## Vorteile von MCP

### 1. Standardisiertes Protokoll

- Einheitliche API für alle Model-Provider
- Einfache Integration in verschiedene Tools
- Zukunftssichere Architektur

### 2. Direkter Zugriff

- Keine zusätzlichen API-Wrapper nötig
- Reduzierte Latenz
- Bessere Performance

### 3. OAuth-Authentifizierung

- Sichere Token-Verwaltung
- Automatische Token-Erneuerung
- Keine hardcoded API-Keys

### 4. Cursor-Integration

- Native Unterstützung in Cursor IDE
- Automatische Code-Vervollständigung
- Direkte Model-Abfragen im Editor

## Fehlerbehandlung

### MCP-Server nicht verfügbar

```typescript
const check = await client.checkMCPServer()
if (!check.available) {
  // Fallback zu normalem Hugging Face Client
  const fallbackClient = getHuggingFaceClient()
  return await fallbackClient.generate(prompt, taskType)
}
```

### Auth-Fehler

```typescript
if (!client.hasAuth()) {
  console.error("HUGGINGFACE_READ_TOKEN nicht gesetzt")
  console.log("Login-URL:", client.getLoginUrl())
  // Fallback zu API Key
}
```

### Model nicht verfügbar

```typescript
const response = await client.generate(model, prompt)
if (response.error) {
  console.error("Model-Fehler:", response.error)
  // Fallback zu anderem Model
}
```

## Best Practices

### 1. Immer Fallback implementieren

```typescript
async generateWithFallback(prompt: string) {
  const mcpClient = getHuggingFaceMCPClient()
  
  // Versuche MCP zuerst
  if (mcpClient.hasAuth()) {
    const response = await mcpClient.generate("model", prompt)
    if (response.generated_text) {
      return response.generated_text
    }
  }
  
  // Fallback zu normalem Client
  const client = getHuggingFaceClient()
  return await client.generate(prompt, "code-analysis")
}
```

### 2. Token-Sicherheit

- ❌ NIEMALS Tokens in Code committen
- ✅ Immer `.env.local` verwenden
- ✅ Tokens in GitHub Secrets speichern
- ✅ Regelmäßig Token rotieren

### 3. Rate-Limiting

```typescript
// Implementiere Rate-Limiting für MCP-Requests
const rateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60000, // 1 Minute
})

async generateWithRateLimit(prompt: string) {
  await rateLimiter.wait()
  return await client.generate("model", prompt)
}
```

## Troubleshooting

### Problem: MCP-Server nicht erreichbar

**Lösung:**
1. Prüfe Internet-Verbindung
2. Prüfe ob `https://huggingface.co/mcp` erreichbar ist
3. Prüfe Firewall/Proxy-Einstellungen

### Problem: Auth-Fehler (401)

**Lösung:**
1. Prüfe ob `HUGGINGFACE_READ_TOKEN` gesetzt ist
2. Hole neuen Token über Login-URL
3. Prüfe ob Token noch gültig ist

### Problem: Model nicht gefunden

**Lösung:**
1. Prüfe ob Model-Name korrekt ist
2. Liste verfügbare Models: `await client.listModels()`
3. Verwende Fallback-Model

## Nächste Schritte

1. ✅ MCP-Konfiguration erstellt
2. ✅ HuggingFaceMCPClient implementiert
3. ⏳ Integration in System-Bot
4. ⏳ Integration in Quality-Bot
5. ⏳ Integration in andere Bots
6. ⏳ Tests und Validierung
7. ⏳ Dokumentation aktualisieren

## Referenzen

- [Hugging Face MCP Documentation](https://huggingface.co/mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Cursor MCP Integration](https://cursor.sh/docs/mcp)

