# SSH-Key-Pair für GitHub generieren
# Autor: MyDispatch Setup
# Datum: $(Get-Date -Format "yyyy-MM-dd")

Write-Host "=== MyDispatch GitHub SSH Setup ===" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob .ssh Verzeichnis existiert
$sshDir = "$env:USERPROFILE\.ssh"
if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
    Write-Host "✓ .ssh Verzeichnis erstellt" -ForegroundColor Green
}

# Prüfe ob bereits ein Key existiert
$keyPath = "$sshDir\id_ed25519_github"
$pubKeyPath = "$keyPath.pub"

if (Test-Path $keyPath) {
    Write-Host "⚠ SSH-Key existiert bereits: $keyPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Überschreiben? (j/n)"
    if ($overwrite -ne "j") {
        Write-Host "Abgebrochen." -ForegroundColor Red
        exit
    }
    Remove-Item $keyPath -Force -ErrorAction SilentlyContinue
    Remove-Item $pubKeyPath -Force -ErrorAction SilentlyContinue
}

Write-Host "Generiere SSH-Key-Pair (ED25519)..." -ForegroundColor Yellow

# Generiere SSH-Key mit ssh-keygen
$keygenCommand = "ssh-keygen -t ed25519 -C `"courbois1981@gmail.com`" -f `"$keyPath`" -N `"`""
Invoke-Expression $keygenCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Fehler beim Generieren des SSH-Keys!" -ForegroundColor Red
    Write-Host "Versuche alternativen Ansatz..." -ForegroundColor Yellow
    
    # Alternativer Ansatz: Nutze OpenSSH falls verfügbar
    $opensshPath = "C:\Windows\System32\OpenSSH\ssh-keygen.exe"
    if (Test-Path $opensshPath) {
        & $opensshPath -t ed25519 -C "courbois1981@gmail.com" -f $keyPath -N '""'
    } else {
        Write-Host "❌ OpenSSH nicht gefunden. Bitte manuell installieren:" -ForegroundColor Red
        Write-Host "  1. Windows Settings > Apps > Optional Features" -ForegroundColor Yellow
        Write-Host "  2. 'OpenSSH Client' installieren" -ForegroundColor Yellow
        exit 1
    }
}

if (Test-Path $pubKeyPath) {
    Write-Host ""
    Write-Host "✓ SSH-Key-Pair erfolgreich generiert!" -ForegroundColor Green
    Write-Host ""
    
    # Lese öffentlichen Schlüssel
    $publicKey = Get-Content $pubKeyPath -Raw
    Write-Host "=== ÖFFENTLICHER SCHLÜSSEL ===" -ForegroundColor Cyan
    Write-Host $publicKey -ForegroundColor White
    Write-Host ""
    
    # Speichere öffentlichen Schlüssel in Datei
    $pubKeyFile = "$PSScriptRoot\github_public_key.txt"
    $publicKey | Out-File -FilePath $pubKeyFile -Encoding UTF8 -NoNewline
    Write-Host "✓ Öffentlicher Schlüssel gespeichert in: $pubKeyFile" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "=== NÄCHSTE SCHRITTE ===" -ForegroundColor Cyan
    Write-Host "1. Kopiere den obigen öffentlichen Schlüssel" -ForegroundColor Yellow
    Write-Host "2. Gehe zu: https://github.com/settings/keys" -ForegroundColor Yellow
    Write-Host "3. Klicke auf 'New SSH key'" -ForegroundColor Yellow
    Write-Host "4. Titel: 'MyDispatch Cursor'" -ForegroundColor Yellow
    Write-Host "5. Key: Füge den obigen Schlüssel ein" -ForegroundColor Yellow
    Write-Host "6. Klicke 'Add SSH key'" -ForegroundColor Yellow
    Write-Host ""
    
    # Konfiguriere SSH für GitHub
    $sshConfigPath = "$sshDir\config"
    $sshConfigContent = @"
Host github.com
    HostName github.com
    User git
    IdentityFile $keyPath
    IdentitiesOnly yes
"@
    
    if (-not (Test-Path $sshConfigPath)) {
        $sshConfigContent | Out-File -FilePath $sshConfigPath -Encoding UTF8 -NoNewline
        Write-Host "✓ SSH-Config erstellt: $sshConfigPath" -ForegroundColor Green
    } else {
        Write-Host "⚠ SSH-Config existiert bereits. Bitte manuell prüfen." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "=== GIT KONFIGURATION ===" -ForegroundColor Cyan
    Write-Host "Aktuelle Git Remote URL:" -ForegroundColor Yellow
    git remote -v
    Write-Host ""
    Write-Host "Nach dem Hinzufügen des Keys zu GitHub, führe aus:" -ForegroundColor Yellow
    Write-Host "  git remote set-url origin git@github.com:u4231458123-droid/v0-header-component.git" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "❌ Fehler: Öffentlicher Schlüssel nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "=== FERTIG ===" -ForegroundColor Green

