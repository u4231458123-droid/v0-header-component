#!/bin/bash
# =============================================================================
# MyDispatch - Vollständige Validierung
# =============================================================================
# Basierend auf AAAPlanung/planung.txt Abschnitt 6.1
# =============================================================================

set -e

echo "🔍 Running complete validation checks..."
echo "=========================================="

ERRORS=0

# =============================================================================
# PHASE 1: TYPE CHECKING
# =============================================================================

echo ""
echo "📘 Type checking..."
if npm run type-check; then
  echo "✅ Type checking passed"
else
  echo "❌ Type checking failed"
  ERRORS=$((ERRORS + 1))
fi

# =============================================================================
# PHASE 2: LINTING
# =============================================================================

echo ""
echo "🧹 Linting..."
if npm run lint; then
  echo "✅ Linting passed"
else
  echo "❌ Linting failed"
  ERRORS=$((ERRORS + 1))
fi

# =============================================================================
# PHASE 3: UNIT TESTS
# =============================================================================

echo ""
echo "🧪 Running unit tests..."
if npm run test:unit -- --coverage --passWithNoTests; then
  echo "✅ Unit tests passed"
else
  echo "❌ Unit tests failed"
  ERRORS=$((ERRORS + 1))
fi

# =============================================================================
# PHASE 4: BUILD TEST
# =============================================================================

echo ""
echo "🏗️ Testing build..."
if npm run build; then
  echo "✅ Build test passed"
else
  echo "❌ Build test failed"
  ERRORS=$((ERRORS + 1))
fi

# =============================================================================
# PHASE 5: SECURITY AUDIT
# =============================================================================

echo ""
echo "🔒 Security audit..."
if npm audit --audit-level=moderate; then
  echo "✅ Security audit passed"
else
  echo "⚠️ Security audit found issues (non-blocking)"
fi

# =============================================================================
# PHASE 6: BUNDLE SIZE CHECK
# =============================================================================

echo ""
echo "📦 Checking bundle size..."
if [ -f "scripts/check-bundle-size.js" ]; then
  node scripts/check-bundle-size.js
else
  echo "⚠️ Bundle size check script not found - skipping"
fi

# =============================================================================
# PHASE 7: DESIGN VALIDATION
# =============================================================================

echo ""
echo "🎨 Validating design tokens..."
if [ -f "scripts/cicd/validate-design.mjs" ]; then
  node scripts/cicd/validate-design.mjs || echo "⚠️ Design validation found issues"
else
  echo "⚠️ Design validation script not found - skipping"
fi

# =============================================================================
# PHASE 8: SQL VALIDATION
# =============================================================================

echo ""
echo "🗄️ Validating SQL files..."
if [ -f "scripts/cicd/validate-sql-files.mjs" ]; then
  node scripts/cicd/validate-sql-files.mjs || echo "⚠️ SQL validation found issues"
else
  echo "⚠️ SQL validation script not found - skipping"
fi

# =============================================================================
# PHASE 9: DEPENDENCY CHECK
# =============================================================================

echo ""
echo "🔗 Checking dependencies..."
if [ -f "scripts/cicd/check-dependencies.mjs" ]; then
  node scripts/cicd/check-dependencies.mjs || echo "⚠️ Dependency check found issues"
else
  echo "⚠️ Dependency check script not found - skipping"
fi

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
  echo "✅ All validation checks passed!"
  exit 0
else
  echo "❌ Validation failed with $ERRORS error(s)"
  exit 1
fi
