# Swimm Living Documentation

Dieses Verzeichnis enthält die Swimm-Dokumentation für das MyDispatch-Projekt.

## Setup

1. Installiere Swimm CLI: `npm install -g @swimm/cli`
2. Initialisiere Swimm: `swimm init`
3. Verknüpfe Code-Snippets mit Dokumentation

## Struktur

- `docs/` - Swimm-Dokumentationsdateien
- `.swimmignore` - Dateien die von Swimm ignoriert werden sollen

## CI-Integration

Die Swimm-Dokumentation wird automatisch in der CI-Pipeline validiert:
- Code-Coverage muss > 80% dokumentiert sein
- Code-Änderungen müssen dokumentiert werden
- Asynchrone Dokumentation blockiert den Build

## Verwendung

1. Erstelle Swimm-Docs für neue Features
2. Verknüpfe kritische Code-Snippets
3. Stelle sicher, dass der CI-Check grün ist

