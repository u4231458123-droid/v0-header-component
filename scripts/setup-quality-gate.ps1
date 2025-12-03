# SETUP QUALITY GATE - Einmalige Einrichtung (PowerShell)
# Macht Git-Hooks ausführbar und richtet das System ein

Write-Host ""
Write-Host "🚨 MANDATORY QUALITY GATE SETUP" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""

# Prüfe ob .git Verzeichnis existiert
if (-not (Test-Path ".git")) {
    Write-Host "❌ Kein Git-Repository gefunden!" -ForegroundColor Red
    exit 1
}

# Erstelle .git/hooks Verzeichnis falls nicht vorhanden
if (-not (Test-Path ".git/hooks")) {
    New-Item -ItemType Directory -Path ".git/hooks" -Force | Out-Null
}

# Pre-Commit Hook
Write-Host "📋 Installiere Pre-Commit Hook..." -ForegroundColor Cyan
@"
#!/bin/sh
# MANDATORY QUALITY GATE - Pre-Commit Hook
node scripts/cicd/mandatory-quality-gate.js --pre-commit
if [ `$? -ne 0 ]; then
  echo ""
  echo "❌ QUALITY GATE FEHLGESCHLAGEN - Commit blockiert!"
  exit 1
fi
"@ | Out-File -FilePath ".git/hooks/pre-commit" -Encoding utf8 -NoNewline

# Pre-Push Hook
Write-Host "📋 Installiere Pre-Push Hook..." -ForegroundColor Cyan
@"
#!/bin/sh
# MANDATORY QUALITY GATE - Pre-Push Hook
node scripts/cicd/mandatory-quality-gate.js --pre-push
if [ `$? -ne 0 ]; then
  echo ""
  echo "❌ QUALITY GATE FEHLGESCHLAGEN - Push blockiert!"
  exit 1
fi
"@ | Out-File -FilePath ".git/hooks/pre-push" -Encoding utf8 -NoNewline

Write-Host "✅ Git-Hooks installiert" -ForegroundColor Green
Write-Host ""
Write-Host "✅ QUALITY GATE SETUP ABGESCHLOSSEN" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "   1. Teste mit: git commit --allow-empty -m 'test: quality gate'"
Write-Host "   2. Prüfe manuell: npm run quality:gate <filePath>"
Write-Host ""

