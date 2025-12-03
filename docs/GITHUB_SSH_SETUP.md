# GitHub SSH Setup - MyDispatch

## Übersicht

Dieses Dokument beschreibt die Einrichtung einer stabilen SSH-Verbindung zu GitHub für MyDispatch.

## Voraussetzungen

- Windows 10/11
- OpenSSH Client (meist bereits installiert)
- Git installiert
- GitHub Account: `u4231458123-droid`

## Schritt 1: SSH-Key-Pair generieren

Führe das Setup-Script aus:

```powershell
cd C:\Users\pcour\Downloads\v0-header-component-main\v0-header-component-main
powershell -ExecutionPolicy Bypass -File scripts\setup-ssh-github.ps1
```

Das Script:
- Erstellt ein ED25519 SSH-Key-Pair
- Speichert den privaten Schlüssel in `%USERPROFILE%\.ssh\id_ed25519_github`
- Speichert den öffentlichen Schlüssel in `%USERPROFILE%\.ssh\id_ed25519_github.pub`
- Erstellt eine SSH-Config-Datei

## Schritt 2: Öffentlichen Schlüssel zu GitHub hinzufügen

1. Öffne: https://github.com/settings/keys
2. Klicke auf **"New SSH key"**
3. **Title:** `MyDispatch Cursor`
4. **Key type:** `Authentication Key`
5. **Key:** Kopiere den Inhalt von `scripts/github_public_key.txt` oder aus der Konsolen-Ausgabe
6. Klicke **"Add SSH key"**

## Schritt 3: Git Remote auf SSH umstellen

Nach dem Hinzufügen des Keys zu GitHub:

```powershell
git remote set-url origin git@github.com:u4231458123-droid/v0-header-component.git
```

## Schritt 4: Verbindung testen

```powershell
ssh -T git@github.com
```

Erwartete Ausgabe:
```
Hi u4231458123-droid! You've successfully authenticated, but GitHub does not provide shell access.
```

## Schritt 5: Erste Push mit SSH

```powershell
git add -A
git commit -m "feat: SSH-Verbindung eingerichtet"
git push origin main
```

## Troubleshooting

### "Permission denied (publickey)"

- Prüfe ob der Key zu GitHub hinzugefügt wurde
- Prüfe SSH-Config: `%USERPROFILE%\.ssh\config`
- Teste Verbindung: `ssh -T git@github.com -v` (verbose)

### "ssh-keygen: command not found"

- Installiere OpenSSH Client:
  - Windows Settings > Apps > Optional Features
  - "OpenSSH Client" hinzufügen

### "Could not resolve hostname github.com"

- Prüfe Internetverbindung
- Prüfe Firewall-Einstellungen

## Sicherheit

- **NIEMALS** den privaten Schlüssel (`id_ed25519_github`) teilen oder committen
- Der private Schlüssel bleibt lokal auf dem Rechner
- Nur der öffentliche Schlüssel wird zu GitHub hinzugefügt

## Backup

Falls der Key verloren geht:
1. Neues Key-Pair generieren
2. Neuen öffentlichen Schlüssel zu GitHub hinzufügen
3. Alten Key aus GitHub entfernen

## Dateien

- **Privater Schlüssel:** `%USERPROFILE%\.ssh\id_ed25519_github` (NIEMALS teilen!)
- **Öffentlicher Schlüssel:** `%USERPROFILE%\.ssh\id_ed25519_github.pub`
- **SSH-Config:** `%USERPROFILE%\.ssh\config`
- **Public Key Backup:** `scripts/github_public_key.txt`

---

**Erstellt:** 2025-01-XX
**Status:** ✅ Aktiv

