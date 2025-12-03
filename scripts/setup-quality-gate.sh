#!/bin/bash
# SETUP QUALITY GATE - Einmalige Einrichtung
# Macht Git-Hooks ausführbar und richtet das System ein

echo "🚨 MANDATORY QUALITY GATE SETUP"
echo "================================"
echo ""

# Prüfe ob .git Verzeichnis existiert
if [ ! -d ".git" ]; then
  echo "❌ Kein Git-Repository gefunden!"
  exit 1
fi

# Erstelle .git/hooks Verzeichnis falls nicht vorhanden
mkdir -p .git/hooks

# Kopiere Hooks
echo "📋 Kopiere Git-Hooks..."

# Pre-Commit Hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# MANDATORY QUALITY GATE - Pre-Commit Hook
node scripts/cicd/mandatory-quality-gate.js --pre-commit
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ QUALITY GATE FEHLGESCHLAGEN - Commit blockiert!"
  exit 1
fi
EOF

# Pre-Push Hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/sh
# MANDATORY QUALITY GATE - Pre-Push Hook
node scripts/cicd/mandatory-quality-gate.js --pre-push
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ QUALITY GATE FEHLGESCHLAGEN - Push blockiert!"
  exit 1
fi
EOF

# Mache Hooks ausführbar
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push

echo "✅ Git-Hooks installiert"
echo ""
echo "✅ QUALITY GATE SETUP ABGESCHLOSSEN"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Teste mit: git commit --allow-empty -m 'test: quality gate'"
echo "   2. Prüfe manuell: npm run quality:gate <filePath>"
echo ""

