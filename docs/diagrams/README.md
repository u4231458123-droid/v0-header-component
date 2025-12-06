# Eraser.io Diagram-as-Code

Dieses Verzeichnis enthält Architecture-Diagramme als Code, die mit Eraser.io synchronisiert werden.

## Struktur

- `architecture.eraser` - Haupt-Architektur-Diagramm
- `database-schema.eraser` - Datenbank-Schema
- `workflow-diagrams.eraser` - Workflow-Diagramme

## Verwendung

1. Erstelle/Update Diagramme in Eraser.io
2. Exportiere als Code in dieses Verzeichnis
3. Diagramme werden automatisch mit Codebase synchronisiert

## Auto-Sync

Die Diagramme werden in der CI-Pipeline validiert:
- Architektur-Änderungen müssen in Diagrammen reflektiert werden
- Schema-Änderungen müssen in database-schema.eraser aktualisiert werden

