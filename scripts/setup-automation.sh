#!/bin/bash
# =============================================================================
# MyDispatch - Vollständige Automatisierungs-Setup
# =============================================================================
# Basierend auf AAAPlanung/planung.txt Abschnitt 6.1
# =============================================================================

set -euo pipefail

echo "🚀 MyDispatch - Vollständige Automatisierungs-Setup"
echo "=================================================="

# =============================================================================
# PHASE 1: ENVIRONMENT DETECTION
# =============================================================================

detect_environment() {
  if [ -f /.dockerenv ]; then
    echo "docker"
  elif [ -n "${CI:-}" ]; then
    echo "ci"
  else
    echo "local"
  fi
}

ENV=$(detect_environment)
echo "📍 Environment: $ENV"

# =============================================================================
# PHASE 2: NODE.JS SETUP
# =============================================================================

echo ""
echo "📦 Installing dependencies..."

if [ "$ENV" = "ci" ]; then
  npm ci --prefer-offline --no-audit
else
  npm install
fi

# =============================================================================
# PHASE 3: DATABASE SETUP (Supabase)
# =============================================================================

echo ""
echo "🗄️ Setting up database..."

if [ -f "scripts/supabase-setup.js" ]; then
  node scripts/supabase-setup.js
else
  echo "⚠️ Supabase setup script not found - skipping"
fi

# =============================================================================
# PHASE 4: ENVIRONMENT VARIABLES
# =============================================================================

echo ""
echo "🔐 Configuring environment..."

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
    echo "⚠️ Please configure .env file with your credentials"
  else
    echo "⚠️ .env.example not found - please create .env manually"
  fi
fi

# =============================================================================
# PHASE 5: PRE-COMMIT HOOKS
# =============================================================================

echo ""
echo "🪝 Installing Git hooks..."

if [ -d ".husky" ]; then
  npx husky install
  echo "✅ Husky hooks installed"
else
  echo "⚠️ .husky directory not found - creating..."
  mkdir -p .husky
  npx husky install
  npx husky add .husky/pre-commit "npm run lint-staged"
  npx husky add .husky/pre-commit "node scripts/cicd/validate-design.mjs || true"
  npx husky add .husky/pre-commit "node scripts/cicd/validate-sql-files.mjs || true"
  npx husky add .husky/pre-commit "node scripts/cicd/check-dependencies.mjs || true"
  echo "✅ Husky hooks created and installed"
fi

# =============================================================================
# PHASE 6: VALIDATION
# =============================================================================

echo ""
echo "✅ Validating setup..."

# Type Checking
echo "📘 Type checking..."
npm run type-check || echo "⚠️ Type checking failed - please fix errors"

# Linting
echo "🧹 Linting..."
npm run lint || echo "⚠️ Linting failed - please fix errors"

# Build Test
echo "🏗️ Testing build..."
npm run build || echo "⚠️ Build failed - please fix errors"

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Configure .env file with your credentials"
echo "  2. Run migrations in Supabase (see docs/CPO_SUPABASE_VOLLSTAENDIGE_ANALYSE.md)"
echo "  3. Start development: npm run dev"
