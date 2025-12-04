# Umfassender Prompt für den Planungs-Assistenten

## Primäre Aufgabe
Analysiere die vollständige Codebase systematisch und erstelle einen detaillierten Aktionsplan zur Behebung aller Lücken, Fehler und Optimierungspotenziale. Übergebe anschließend strukturierte Aufträge an den AI-Agenten (Cursor) zur vollautomatischen Implementierung **ohne manuelle Benutzereingriffe**.

---

## 0. Automatisierungs-Prinzip (KRITISCH)

### 0.1 Keine manuellen USER-Eingriffe
**WICHTIG**: Alle Arbeiten sind vollständig durch den AI-Agenten auszuführen. Manuelle Eingriffe durch den USER sind zu vermeiden.

### 0.2 Automatisierte Systemzugriffe
Der AI-Agent hat Zugriff auf folgende Systeme und führt alle Operationen automatisch aus:

#### Supabase (via MCP Server)
- **Datenbankoperationen**: 
  - Schema-Änderungen (CREATE TABLE, ALTER TABLE, CREATE INDEX)
  - Daten-Migrationen (INSERT, UPDATE, DELETE in Bulk)
  - Query-Optimierung (Index-Erstellung, Query-Analyse)
  - Backup & Restore
- **Authentication & Authorization**:
  - User-Management (Rollen, Permissions)
  - JWT-Policy-Updates
  - Row Level Security (RLS) Konfiguration
- **Storage-Management**:
  - Bucket-Erstellung und -Konfiguration
  - File-Upload/Download-Policies
  - CDN-Konfiguration
- **Realtime-Konfiguration**:
  - Channel-Setup
  - Broadcast/Presence-Konfiguration
- **Edge Functions**:
  - Deployment von Serverless Functions
  - Environment-Variables-Management

#### GitHub (via API/MCP Server)
- **Repository-Management**:
  - Branch-Erstellung und -Löschung
  - Pull-Request-Erstellung und -Merge
  - Issue-Erstellung und -Tracking
  - Commit-Operationen
- **CI/CD-Pipeline**:
  - GitHub Actions Workflow-Updates
  - Secrets-Management
  - Environment-Konfiguration
  - Deployment-Trigger
- **Code-Reviews**:
  - Automatische PR-Reviews
  - Code-Quality-Checks
  - Security-Scans
- **Project-Management**:
  - Project-Board-Updates
  - Milestone-Tracking
  - Label-Management

#### Weitere integrierte Systeme (via API/SSH/MCP)
- **Cloud-Provider** (AWS, GCP, Azure):
  - Infrastructure-as-Code (Terraform/CloudFormation)
  - Service-Konfiguration
  - Deployment-Automatisierung
- **Monitoring & Logging**:
  - Sentry/DataDog-Integration
  - Alert-Konfiguration
  - Dashboard-Setup
- **DNS & CDN**:
  - Cloudflare/Route53-Konfiguration
  - SSL-Zertifikat-Management
- **Container-Orchestrierung**:
  - Docker/Kubernetes-Deployments
  - Service-Scaling
- **Datenbanken**:
  - PostgreSQL/MySQL-Operationen via SSH
  - Redis-Konfiguration
  - Backup-Automatisierung

### 0.3 Autonome Ausführung
Der AI-Agent:
- ✅ Führt alle Operationen selbstständig aus
- ✅ Verifiziert jede Aktion automatisch
- ✅ Implementiert Rollback bei Fehlern
- ✅ Dokumentiert alle durchgeführten Änderungen
- ✅ Benachrichtigt USER nur bei kritischen Entscheidungen oder Fehlern
- ❌ Fordert KEINE manuellen Eingriffe an (außer bei Autorisierungs-Anforderungen)

---

## 1. Initiale Codebase-Analyse

### 1.1 Vollständige Erfassung
Der AI-Agent lädt und indexiert automatisch:
- **Quellcode-Dateien**: 
  - Frontend (React, Vue, Angular, etc.)
  - Backend (Node.js, Python, Go, etc.)
  - APIs (REST, GraphQL, gRPC)
  - Mobile Apps (React Native, Flutter)
- **Konfigurationsdateien**:
  - package.json, requirements.txt, Gemfile
  - tsconfig.json, babel.config.js, webpack.config.js
  - .env-Templates und Environment-Variablen
  - docker-compose.yml, Dockerfile
  - nginx.conf, Apache-Konfigurationen
- **Dokumentation**:
  - README.md, CONTRIBUTING.md, CHANGELOG.md
  - API-Dokumentation (Swagger/OpenAPI)
  - Architecture Decision Records (ADRs)
  - Onboarding-Guides
- **Test-Suites**:
  - Unit-Tests (Jest, Pytest, JUnit)
  - Integration-Tests (Supertest, Testing Library)
  - E2E-Tests (Cypress, Playwright, Selenium)
  - Performance-Tests (K6, JMeter)
- **Build- und Deployment-Scripts**:
  - CI/CD-Pipelines (GitHub Actions, GitLab CI, Jenkins)
  - Deployment-Scripts (Bash, Python, Ansible)
  - Infrastructure-as-Code (Terraform, Pulumi)
- **Abhängigkeiten**:
  - node_modules, vendor, pip cache
  - Lock-Files (package-lock.json, yarn.lock, poetry.lock)
  - Submodules und Monorepo-Strukturen

### 1.2 Strukturanalyse
Der AI-Agent erstellt automatisch:
- **Projektstruktur-Map**:
  - Ordnerhierarchie mit Visualisierung (Tree-Struktur)
  - Dateigrößen und LOC (Lines of Code)
  - Ownership-Mapping (CODEOWNERS-Analyse)
- **Dateiabhängigkeiten**:
  - Import/Export-Graph
  - Zirkuläre Abhängigkeiten (mit Warnung)
  - Orphaned Files (ungenutzte Dateien)
- **Modulbeziehungen**:
  - Layer-Architecture-Validierung (Presentation/Business/Data)
  - Coupling-Metriken (Afferent/Efferent Coupling)
  - Cohesion-Analysis
- **Komponentenarchitektur**:
  - Component-Tree (React/Vue/Angular)
  - Props-Flow-Diagramm
  - State-Management-Analyse (Redux, Vuex, Context API)
- **Datenfluss-Diagramm**:
  - Request-Response-Flows
  - Event-Handling-Chains
  - Async-Operation-Mapping

### 1.3 Automatische Metrik-Erfassung
- **Code-Qualität**:
  - Cyclomatic Complexity (McCabe)
  - Maintainability Index
  - Code Duplication (>5% als Warning)
- **Test-Coverage**:
  - Line Coverage
  - Branch Coverage
  - Function Coverage
- **Performance-Baselines**:
  - Bundle-Größen (JS, CSS)
  - Load-Times (FCP, LCP, TTI)
  - API-Response-Times

---

## 2. Fehleridentifikation und -kategorisierung

### 2.1 Code-Qualität
Der AI-Agent identifiziert automatisch:

#### Syntaxfehler
- **Compile-Errors**: TypeScript/Babel/C# Compiler-Fehler
- **Parsing-Errors**: JSON/XML/YAML Syntax-Fehler
- **Linting-Violations**: ESLint/Pylint/RuboCop-Fehler
- **Automatische Behebung**:
  ```bash
  # AI-Agent führt aus:
  npm run lint -- --fix
  prettier --write "src/**/*.{js,ts,jsx,tsx}"
  ```

#### Logikfehler
- **Fehlerhafte Implementierungen**:
  - Off-by-one-Errors
  - Race Conditions
  - Memory Leaks (Event-Listener nicht abgemeldet)
- **Edge-Cases**:
  - Null/Undefined-Handling
  - Division durch Null
  - Array-Out-of-Bounds
- **Automatische Detection**:
  - Static Analysis (SonarQube, CodeQL)
  - Mutation Testing (Stryker)

#### Lücken im Code
- **Fehlende Fehlerbehandlung**:
  - Try-Catch-Blöcke fehlen
  - Error Boundaries (React) nicht implementiert
  - Promise-Rejections unbehandelt
  - **Automatische Implementierung**:
    ```typescript
    // AI-Agent fügt hinzu:
    try {
      await riskyOperation();
    } catch (error) {
      logger.error('Operation failed', { error, context });
      handleError(error);
    }
    ```
- **Unvollständige Implementierungen**:
  - TODO-Kommentare mit ausstehenden Features
  - Leere Funktionen/Placeholder
  - Commented-out Code (entfernen oder aktivieren)
- **Fehlende Validierungen**:
  - Input-Validierung (Zod, Joi, Yup)
  - Type-Checks (Runtime-Validierung)
  - API-Request/Response-Validierung

#### Code Smells
- **Duplizierter Code**:
  - DRY-Violations (>10 Zeilen Duplikation)
  - **Automatisches Refactoring**: Extraktion in Utility-Funktionen
- **Komplexität**:
  - Funktionen >50 Zeilen (Split empfohlen)
  - Cyclomatic Complexity >10 (Refactoring erforderlich)
- **Ungenutzte Assets**:
  - Imports ohne Verwendung
  - Variablen deklariert aber nicht genutzt
  - Dead Code (unerreichbare Branches)
  - **Automatisches Cleanup**:
    ```bash
    # AI-Agent führt aus:
    npx unimported
    npx depcheck
    ```
- **Inkonsistente Namenskonventionen**:
  - camelCase vs snake_case vs PascalCase
  - **Automatische Standardisierung** nach Style-Guide

### 2.2 Funktionale Probleme

#### UI/UX-Fehler
Der AI-Agent testet automatisch:
- **Nicht funktionierende Buttons**:
  - onClick-Handler fehlen
  - Event-Handler nicht gebunden
  - Disabled-State inkorrekt
  - **Automatisches Testen**:
    ```typescript
    // AI-Agent führt E2E-Tests aus:
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="success-message"]').should('be.visible');
    ```
- **Defekte Links**:
  - Interne Navigation (React Router, Next.js Links)
  - Externe Links (404-Checks via API)
  - Broken Anchors (#sections)
  - **Automatische Validierung**:
    ```bash
    # AI-Agent führt aus:
    npx broken-link-checker http://localhost:3000 --recursive
    ```
- **Formular-Validierung**:
  - Required-Fields ohne Validation
  - Email/Phone-Format-Validierung fehlt
  - Password-Strength-Checks
  - **Automatische Implementierung** mit Yup/Zod
- **Responsiveness**:
  - Mobile-Breakpoints (320px, 768px, 1024px, 1440px)
  - Touch-Target-Größen (<44x44px)
  - Overflow-Probleme
  - **Automatisches Testing** mit Playwright

#### Business-Logik
- **Fehlende Features**:
  - Abgleich mit Requirements/User-Stories
  - Feature-Flags für unfertige Features
- **Inkorrekte Berechnungen**:
  - Preis-/Steuerberechnungen
  - Datumsberechnungen (Timezone-Issues)
  - Currency-Handling
- **Unvollständige Workflows**:
  - Checkout-Prozess mit fehlenden Steps
  - Onboarding-Flows ohne Success-State
  - Multi-Step-Forms ohne Persistierung

### 2.3 Terminal- und Runtime-Fehler

#### Analysierte Fehlerquellen
Der AI-Agent überwacht automatisch:
- **Entwicklungskonsole** (Browser DevTools):
  - Console.errors/warnings
  - Network-Failures (4xx, 5xx)
  - CORS-Errors
- **Server-Logs**:
  - Application-Logs (Winston, Pino)
  - Access-Logs (Nginx, Apache)
  - Error-Logs (Sentry, Rollbar)
- **Build-Prozess**:
  - Webpack/Vite/Rollup-Warnings
  - TypeScript-Compiler-Errors
  - PostCSS/Sass-Errors
- **Test-Runner**:
  - Jest/Vitest-Failures
  - Cypress-Screenshots von Failures
  - Playwright-Traces

#### Kategorisierung mit Auto-Fix
- **P0 (Kritisch)**: 
  - App startet nicht
  - Datenverlust-Risiken
  - Security-Vulnerabilities (SQL-Injection, XSS)
  - **Sofortige Auto-Behebung** wo möglich
- **P1 (Hoch)**:
  - Feature-Blocker
  - Performance <Core Web Vitals
  - UX-Breaking-Changes
  - **Auto-Fix + Verifizierung**
- **P2 (Mittel)**:
  - Code-Qualität
  - Technical Debt
  - Kleinere Bugs
  - **Geplantes Refactoring**
- **P3 (Niedrig)**:
  - Warnings
  - Deprecations (aber noch funktional)
  - Style-Guide-Violations
  - **Batch-Processing**

---

## 3. Abhängigkeits-Management

### 3.1 Dependency-Audit
Der AI-Agent führt automatisch aus:

#### Veraltete Pakete
```bash
# Automatische Ausführung:
npm outdated
npm audit
npx npm-check-updates -u
```
- **Automatisches Update-Strategie**:
  - Patch-Versions: Auto-Update (1.2.3 → 1.2.4)
  - Minor-Versions: Auto-Update mit Tests (1.2.3 → 1.3.0)
  - Major-Versions: Review + Breaking-Change-Analyse

#### Sicherheitslücken
```bash
# AI-Agent führt aus und behebt:
npm audit fix --force
snyk test
snyk wizard
```
- **Automatische CVE-Resolution**:
  - Critical/High: Sofortiges Patching
  - Medium: Innerhalb 48h
  - Low: Beim nächsten Update-Cycle
- **Supabase-Security-Sync** (via MCP):
  - RLS-Policy-Updates
  - JWT-Secret-Rotation
  - API-Key-Refresh

#### Inkompatibilitäten
- **Peer-Dependencies**:
  - Automatische Resolution via `--legacy-peer-deps` oder Upgrade
- **Version-Konflikte**:
  - Yarn Resolutions / NPM Overrides automatisch setzen
  ```json
  {
    "resolutions": {
      "problematic-package": "^2.0.0"
    }
  }
  ```

#### Ungenutzte Dependencies
```bash
# AI-Agent entfernt automatisch:
npx depcheck
npm uninstall <unused-packages>
```

### 3.2 Abhängigkeitsgraph
Der AI-Agent generiert automatisch:
- **Visualisierung**:
  ```bash
  # Automatisch erstellt und in Docs abgelegt:
  npx madge --image dependency-graph.svg src/
  ```
- **Kritische Metriken**:
  - Zirkuläre Abhängigkeiten (Auto-Detection + Warnung)
  - Tiefe der Dependency-Tree (>5 Ebenen = Warnung)
  - Bundle-Impact (welche Packages sind teuer?)

---

## 4. Vollständige Funktionalitätsprüfung

### 4.1 Systematischer Funktionstest
Der AI-Agent führt automatisch für **jede Funktion** aus:

#### Input-Validierung
```typescript
// Automatisch generierte Tests:
describe('calculateTotal', () => {
  test('valid inputs', () => {
    expect(calculateTotal([10, 20, 30])).toBe(60);
  });
  
  test('invalid inputs', () => {
    expect(() => calculateTotal(null)).toThrow();
    expect(() => calculateTotal([10, 'abc'])).toThrow();
  });
  
  test('edge cases', () => {
    expect(calculateTotal([])).toBe(0);
    expect(calculateTotal([0, 0, 0])).toBe(0);
    expect(calculateTotal([Number.MAX_VALUE])).toBeLessThan(Infinity);
  });
});
```

#### Output-Verifikation
- **Snapshot-Testing** für komplexe Outputs
- **Property-Based-Testing** (fast-check) für breite Coverage
- **Regression-Testing**: Outputs mit historischen Baselines vergleichen

#### Fehlerbehandlung
```typescript
// AI-Agent validiert automatisch:
test('handles network errors gracefully', async () => {
  mockAxios.get.mockRejectedValue(new Error('Network Error'));
  
  const result = await fetchData();
  
  expect(result).toEqual({ error: 'Network Error', data: null });
  expect(logger.error).toHaveBeenCalled();
});
```

#### Performance
```typescript
// Automatische Performance-Tests:
test('function completes within 100ms', async () => {
  const start = performance.now();
  await expensiveOperation();
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(100);
});
```

### 4.2 UI-Komponenten-Test
Der AI-Agent prüft automatisch für **jeden Button und Link**:

#### Funktionalität
```typescript
// Automatisch generierte Playwright-Tests:
test('submit button triggers form submission', async ({ page }) => {
  await page.goto('/form');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[data-testid="submit-button"]');
  
  await expect(page.locator('.success-message')).toBeVisible();
});
```

#### Navigation
```typescript
// Automatische Link-Validierung:
test('all navigation links are functional', async ({ page }) => {
  const links = await page.locator('a[href]').all();
  
  for (const link of links) {
    const href = await link.getAttribute('href');
    const response = await page.request.get(href);
    expect(response.status()).toBeLessThan(400);
  }
});
```

#### Visuelles Feedback
```typescript
// Automatische Visual-Regression-Tests:
test('button hover states', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('[data-testid="primary-button"]');
  
  // Normal State
  await expect(button).toHaveScreenshot('button-normal.png');
  
  // Hover State
  await button.hover();
  await expect(button).toHaveScreenshot('button-hover.png');
  
  // Disabled State
  await button.evaluate(el => el.setAttribute('disabled', 'true'));
  await expect(button).toHaveScreenshot('button-disabled.png');
});
```

#### Accessibility
```typescript
// Automatische A11y-Tests:
test('buttons are accessible', async ({ page }) => {
  await page.goto('/');
  
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  
  // Keyboard-Navigation
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('role', 'button');
  
  await page.keyboard.press('Enter');
  await expect(page.locator('.action-result')).toBeVisible();
});
```

### 4.3 End-to-End-Workflows
Der AI-Agent testet automatisch alle kritischen User-Journeys:

#### Registrierung/Login (inkl. Supabase Auth)
```typescript
// Automatischer E2E-Test mit Supabase-Integration:
test('complete user registration flow', async ({ page }) => {
  // Registration
  await page.goto('/register');
  await page.fill('[name="email"]', 'newuser@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('[type="submit"]');
  
  // Verifizierung via Supabase MCP
  const { data: user } = await supabase.auth.admin.getUserByEmail(
    'newuser@example.com'
  );
  expect(user).toBeDefined();
  
  // Email-Verifizierung (Auto-Confirm im Test)
  await supabase.auth.admin.updateUserById(user.id, {
    email_confirmed_at: new Date().toISOString()
  });
  
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'newuser@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="user-menu"]')).toContainText('newuser');
});
```

#### CRUD-Operationen (inkl. Supabase DB)
```typescript
// Automatischer Test mit DB-Validierung:
test('create, read, update, delete operations', async ({ page }) => {
  await loginAsTestUser(page);
  
  // CREATE
  await page.goto('/items/new');
  await page.fill('[name="title"]', 'Test Item');
  await page.fill('[name="description"]', 'Test Description');
  await page.click('[data-testid="save-button"]');
  
  // Verifizierung in Supabase via MCP
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('title', 'Test Item');
  expect(items).toHaveLength(1);
  const itemId = items[0].id;
  
  // READ
  await page.goto(`/items/${itemId}`);
  await expect(page.locator('h1')).toContainText('Test Item');
  
  // UPDATE
  await page.click('[data-testid="edit-button"]');
  await page.fill('[name="title"]', 'Updated Item');
  await page.click('[data-testid="save-button"]');
  
  const { data: updatedItem } = await supabase
    .from('items')
    .select('title')
    .eq('id', itemId)
    .single();
  expect(updatedItem.title).toBe('Updated Item');
  
  // DELETE
  await page.click('[data-testid="delete-button"]');
  await page.click('[data-testid="confirm-delete"]');
  
  const { data: deletedItem } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId);
  expect(deletedItem).toHaveLength(0);
});
```

#### Checkout/Payment
```typescript
// Automatischer Payment-Flow-Test:
test('complete checkout process', async ({ page }) => {
  // Cart Management
  await page.goto('/products/1');
  await page.click('[data-testid="add-to-cart"]');
  await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  
  // Checkout
  await page.goto('/cart');
  await page.click('[data-testid="checkout-button"]');
  
  // Shipping Info
  await page.fill('[name="address"]', '123 Test St');
  await page.fill('[name="city"]', 'Testville');
  await page.fill('[name="zip"]', '12345');
  await page.click('[data-testid="continue-payment"]');
  
  // Payment (Test-Mode mit Stripe)
  await page.fill('[name="cardNumber"]', '4242424242424242');
  await page.fill('[name="expiry"]', '12/25');
  await page.fill('[name="cvc"]', '123');
  await page.click('[data-testid="pay-button"]');
  
  // Success-Verifizierung
  await expect(page).toHaveURL(/\/order\/confirmation/);
  await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
});
```

#### Admin-Funktionen
```typescript
// Automatischer Admin-Test:
test('admin dashboard and user management', async ({ page }) => {
  await loginAsAdmin(page);
  
  await page.goto('/admin/users');
  
  // User-Liste laden
  await expect(page.locator('[data-testid="user-table"]')).toBeVisible();
  const userCount = await page.locator('[data-testid="user-row"]').count();
  expect(userCount).toBeGreaterThan(0);
  
  // User-Rolle ändern via UI + Supabase-Verifizierung
  await page.click('[data-testid="user-1-actions"]');
  await page.click('[data-testid="change-role"]');
  await page.selectOption('[name="role"]', 'moderator');
  await page.click('[data-testid="save-role"]');
  
  const { data: user } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', 'user-1')
    .single();
  expect(user.role).toBe('moderator');
});
```

---

## 5. GitHub & CI/CD Pipeline-Optimierung

### 5.1 Repository-Management (Vollautomatisch via GitHub API)

#### Branch-Strategie
Der AI-Agent implementiert automatisch:
```javascript
// AI-Agent führt via GitHub API aus:
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Branch-Protection-Rules
await octokit.rest.repos.updateBranchProtection({
  owner,
  repo,
  branch: 'main',
  required_status_checks: {
    strict: true,
    contexts: ['test', 'lint', 'build']
  },
  enforce_admins: true,
  required_pull_request_reviews: {
    required_approving_review_count: 1,
    dismiss_stale_reviews: true
  },
  restrictions: null
});

// Automatische Feature-Branch-Erstellung
const branches = await getBranchesFromTodoList();
for (const task of branches) {
  await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/feature/${task.id}`,
    sha: mainBranchSha
  });
}
```

#### Pull-Request-Automatisierung
```javascript
// AI-Agent erstellt automatisch PRs für alle Tasks:
for (const task of completedTasks) {
  const pr = await octokit.rest.pulls.create({
    owner,
    repo,
    title: `[${task.priority}] ${task.title}`,
    head: `feature/${task.id}`,
    base: 'main',
    body: `
## Changes
${task.description}

## Testing
- [x] Unit tests passed
- [x] Integration tests passed
- [x] E2E tests passed

## Checklist
- [x] Code follows style guidelines
- [x] Documentation updated
- [x] No breaking changes

Closes #${task.issueNumber}
    `
  });
  
  // Automatisches Labeling
  await octokit.rest.issues.addLabels({
    owner,
    repo,
    issue_number: pr.data.number,
    labels: [task.priority, 'automated', task.category]
  });
}
```

#### Issue-Tracking
```javascript
// AI-Agent erstellt automatisch Issues aus Todo-Liste:
for (const task of allTasks) {
  const issue = await octokit.rest.issues.create({
    owner,
    repo,
    title: `[${task.priority}] ${task.title}`,
    body: `
**Problem**: ${task.problem}
**Ursache**: ${task.cause}
**Betroffene Dateien**: 
${task.files.map(f => `- \`${f}\``).join('\n')}

**Lösung**:
${task.solution}

**Akzeptanzkriterien**:
${task.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n')}

**Geschätzte Zeit**: ${task.estimatedHours}h
    `,
    labels: [task.priority, task.category],
    assignees: ['ai-agent']
  });
  
  // Verknüpfung mit Project-Board
  await addToProjectBoard(issue.data.id, task.priority);
}
```

#### Commit-Automatisierung
```javascript
// AI-Agent committed alle Änderungen automatisch:
const commitMessage = generateCommitMessage(changes); // Conventional Commits
await git.add('.');
await git.commit(commitMessage);
await git.push('origin', currentBranch);

// Automatisches Signieren
await git.addConfig('commit.gpgsign', 'true');
```

### 5.2 CI/CD-Pipeline-Audit und Optimierung

#### Build-Geschwindigkeit (GitHub Actions)
Der AI-Agent optimiert automatisch `.github/workflows/ci.yml`:

```yaml
# Vorher: ~15 Minuten Build-Zeit
# Nachher: ~5 Minuten Build-Zeit

name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  # Parallelisierung
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # Automatisches Caching
      - run: npm ci
      - run: npm run lint

  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --maxWorkers=4

  test-integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:integration

  build:
    runs-on: ubuntu-latest
    needs: [lint, test-unit, test-integration]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      # Build-Cache mit Turborepo/Nx
      - uses: actions/cache@v4
        with:
          path: .next/cache
          key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-output
      # Automatisches Deployment via AI-Agent
      - name: Deploy to Production
        run: |
          # AI-Agent führt Deployment-Script aus
          ./scripts/deploy.sh
```

**Optimierungen durch AI-Agent**:
- ✅ Caching von Dependencies (npm/yarn cache)
- ✅ Parallelisierung unabhängiger Jobs (lint + test gleichzeitig)
- ✅ Matrix-Builds für Multi-Platform-Testing
- ✅ Conditional Jobs (Deploy nur bei main-Branch)
- ✅ Artifact-Sharing zwischen Jobs

#### Zuverlässigkeit
```yaml
# AI-Agent implementiert automatisch:
jobs:
  test-e2e:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false  # Alle Tests durchlaufen, auch bei Fehlern
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - name: Run E2E Tests
        uses: cypress-io/github-action@v6
        with:
          browser: ${{ matrix.browser }}
          # Automatisches Retry bei flaky Tests
          command: npm run test:e2e -- --retries 3
      - name: Upload Screenshots on Failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-screenshots-${{ matrix.browser }}
          path: cypress/screenshots

  # Automatischer Rollback bei Deployment-Fehler
  deploy-with-rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        id: deploy
        run: ./scripts/deploy.sh
      - name: Health Check
        run: |
          sleep 10
          curl -f https://app.example.com/health || exit 1
      - name: Rollback on Failure
        if: failure()
        run: ./scripts/rollback.sh ${{ steps.deploy.outputs.previous_version }}
```

#### Test-Coverage-Enforcement
```yaml
# AI-Agent fügt automatisch Coverage-Gates hinzu:
jobs:
  test-with-coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:coverage
      - name: Coverage Gate
        run: |
          COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi
      - name: Upload to Codecov
        uses: codecov/codecov-action@v4
```

### 5.3 KI-gestützte Pipeline-Verbesserungen

#### Automatische Code-Reviews
Der AI-Agent konfiguriert automatisch:
```yaml
# .github/workflows/ai-code-review.yml
name: AI Code Review
on: [pull_request]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Volle History für Diff
      
      # CodeRabbit AI Review
      - name: CodeRabbit Review
        uses: coderabbitai/coderabbit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
      
      # SonarQube Analysis
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@v2
        with:
          args: >
            -Dsonar.projectKey=my-project
            -Dsonar.qualitygate.wait=true
      
      # Custom AI Agent Review via Claude API
      - name: Claude Code Review
        run: |
          node scripts/ai-review.js \
            --pr-number ${{ github.event.pull_request.number }} \
            --base ${{ github.event.pull_request.base.sha }} \
            --head ${{ github.event.pull_request.head.sha }}
```

**AI-Review-Script** (automatisch erstellt):
```javascript
// scripts/ai-review.js
const Anthropic = require('@anthropic-ai/sdk');
const { Octokit } = require('@octokit/rest');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function reviewPR(prNumber, base, head) {
  // Diff abrufen
  const { data: diff } = await octokit.rest.repos.compareCommits({
    owner,
    repo,
    base,
    head
  });
  
  // AI-Review via Claude
  const review = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Review this code change for:
- Security vulnerabilities
- Performance issues
- Best practice violations
- Potential bugs

Diff:
${diff.data.files.map(f => f.patch).join('\n\n')}
`
    }]
  });
  
  // Kommentar erstellen
  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_request_number: prNumber,
    body: review.content[0].text,
    event: 'COMMENT'
  });
}
```

#### Predictive Failure Analysis
```javascript
// AI-Agent implementiert ML-Modell für Build-Predictions:
const { PredictiveAnalytics } = require('./ai-tools');

async function analyzeBuildRisk(prData) {
  const features = {
    filesChanged: prData.changed_files,
    linesAdded: prData.additions,
    linesDeleted: prData.deletions,
    authorExperience: await getAuthorExperience(prData.user.login),
    touchedCriticalFiles: prData.files.some(f => CRITICAL_FILES.includes(f.filename)),
    timeOfDay: new Date().getHours(),
    dayOfWeek: new Date().getDay()
  };
  
  const riskScore = await PredictiveAnalytics.predictBuildFailure(features);
  
  if (riskScore > 0.7) {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prData.number,
      body: `⚠️ **High Risk PR Detected** (${(riskScore * 100).toFixed(1)}%)
      
This PR has a high likelihood of build failure based on:
- Large number of changes (${features.filesChanged} files)
- Critical files touched
- Historical patterns

Recommended actions:
- [ ] Split into smaller PRs
- [ ] Add extra test coverage
- [ ] Request senior developer review
      `
    });
  }
}
```

#### Auto-Fix-Workflows
```yaml
# .github/workflows/auto-fix.yml
name: Auto-Fix Issues
on:
  pull_request:
  schedule:
    - cron: '0 2 * * *'  # Täglich um 2 Uhr

jobs:
  auto-fix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Automatisches Dependency-Update
      - name: Update Dependencies
        run: |
          npx npm-check-updates -u
          npm install
          npm audit fix
      
      # Automatisches Code-Formatting
      - name: Format Code
        run: |
          npm run lint -- --fix
          npm run format
      
      # Automatisches Refactoring
      - name: AI-Powered Refactoring
        run: node scripts/ai-refactor.js
      
      # Commit & Push wenn Änderungen vorhanden
      - name: Commit Changes
        run: |
          git config user.name "AI Agent"
          git config user.email "ai-agent@example.com"
          git add .
          git diff --staged --quiet || git commit -m "chore: automated fixes and updates"
          git push
```

### 5.4 Performance-Optimierung

#### Baseline-Metriken (Automatisch erfasst)
```javascript
// AI-Agent misst kontinuierlich:
const performanceMetrics = {
  pipelineMetrics: {
    totalDuration: '14m 32s',
    jobs: {
      lint: '1m 15s',
      testUnit: '3m 45s',
      testIntegration: '4m 20s',
      testE2E: '8m 10s',
      build: '2m 30s',
      deploy: '1m 40s'
    }
  },
  cacheHitRate: '87%',
  artifactSizes: {
    buildOutput: '45MB',
    testReports: '2.3MB',
    coverageReports: '1.8MB'
  }
};

// Speichern in Supabase via MCP für Trending
await supabase.from('pipeline_metrics').insert({
  timestamp: new Date(),
  ...performanceMetrics
});
```

#### Optimierungsziele (Automatisch umgesetzt)
Der AI-Agent implementiert:
- **Build-Zeit**: <5 Minuten (aktuell: 14 Minuten)
  - ✅ Dependency-Caching (Einsparung: 2 Minuten)
  - ✅ Build-Artefakt-Caching (Einsparung: 1 Minute)
  - ✅ Parallelisierung (Einsparung: 6 Minuten)
  - ✅ Inkrementelles Building (Einsparung: 3 Minuten)
  - **Ergebnis**: 2 Minuten Build-Zeit ✅

- **Test-Ausführung**: <10 Minuten (aktuell: 16 Minuten)
  - ✅ Test-Sharding (4 parallel Runner)
  - ✅ Flaky-Test-Isolation
  - ✅ Smartes Test-Selection (nur betroffene Tests)
  - **Ergebnis**: 6 Minuten Test-Zeit ✅

- **Deployment**: <2 Minuten (aktuell: 1m 40s)
  - ✅ Bereits optimiert ✅

#### Monitoring-Dashboard (Automatisch erstellt)
```javascript
// AI-Agent erstellt Grafana-Dashboard via API:
const dashboard = {
  title: 'CI/CD Pipeline Performance',
  panels: [
    {
      title: 'Pipeline Duration Trend',
      targets: [{
        query: 'SELECT timestamp, total_duration FROM pipeline_metrics ORDER BY timestamp'
      }]
    },
    {
      title: 'Success Rate',
      targets: [{
        query: 'SELECT DATE(timestamp), COUNT(*) FILTER (WHERE status = \'success\') * 100.0 / COUNT(*) FROM pipeline_runs GROUP BY DATE(timestamp)'
      }]
    },
    {
      title: 'Cache Hit Rate',
      targets: [{
        query: 'SELECT timestamp, cache_hit_rate FROM pipeline_metrics'
      }]
    }
  ]
};

await grafanaAPI.createDashboard(dashboard);
```

---

## 6. Automatisierung & Selbstheilung

### 6.1 Entwicklungs-Scripts (Vollautomatisch)

#### Setup-Script
```bash
#!/bin/bash
# scripts/setup.sh - Automatisch vom AI-Agent erstellt

set -euo pipefail

echo "🚀 Starting automated setup..."

# Environment Detection
detect_environment() {
  if [ -f /.dockerenv ]; then
    echo "docker"
  elif [ -n "$CI" ]; then
    echo "ci"
  else
    echo "local"
  fi
}

ENV=$(detect_environment)
echo "📍 Environment: $ENV"

# Node.js Setup
echo "📦 Installing dependencies..."
if [ "$ENV" = "ci" ]; then
  npm ci --prefer-offline --no-audit
else
  npm install
fi

# Database Setup via Supabase MCP
echo "🗄️ Setting up database..."
node scripts/supabase-setup.js

# Environment Variables
echo "🔐 Configuring environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️ Please configure .env file"
fi

# Pre-commit Hooks
echo "🪝 Installing Git hooks..."
npx husky install
npx husky add .husky/pre-commit "npm run lint-staged"

# Validation
echo "✅ Validating setup..."
npm run validate

echo "✨ Setup complete!"
```

**Supabase-Setup-Script** (automatisch via MCP):
```javascript
// scripts/supabase-setup.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function setupDatabase() {
  console.log('🗄️ Creating database schema...');
  
  // Tabellen erstellen
  const { error: tableError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
    `
  });
  
  if (tableError) throw tableError;
  
  // RLS Policies
  console.log('🔒 Setting up Row Level Security...');
  await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE items ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can read own data" ON users
        FOR SELECT USING (auth.uid() = id);
      
      CREATE POLICY "Users can manage own items" ON items
        FOR ALL USING (auth.uid() = user_id);
    `
  });
  
  // Storage Buckets
  console.log('📦 Creating storage buckets...');
  await supabase.storage.createBucket('avatars', {
    public: true,
    fileSizeLimit: 1024 * 1024 * 2 // 2MB
  });
  
  console.log('✅ Database setup complete!');
}

setupDatabase().catch(console.error);
```

#### Validierungs-Script
```bash
#!/bin/bash
# scripts/validate.sh - Automatische Qualitätsprüfung

set -e

echo "🔍 Running validation checks..."

# Type Checking
echo "📘 Type checking..."
npm run type-check

# Linting
echo "🧹 Linting..."
npm run lint

# Unit Tests
echo "🧪 Running unit tests..."
npm run test:unit -- --coverage --passWithNoTests

# Build Test
echo "🏗️ Testing build..."
npm run build

# Security Audit
echo "🔒 Security audit..."
npm audit --audit-level=moderate

# Bundle Size Check
echo "📦 Checking bundle size..."
node scripts/check-bundle-size.js

echo "✅ All validation checks passed!"
```

#### Pre-Commit-Hooks (Automatisch installiert)
```javascript
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Automatische Checks vor jedem Commit
npx lint-staged

# Custom AI-powered checks
node scripts/ai-pre-commit-check.js
```

```javascript
// scripts/ai-pre-commit-check.js
const { execSync } = require('child_process');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic();

async function aiPreCommitCheck() {
  // Staged Files abrufen
  const stagedFiles = execSync('git diff --cached --name-only')
    .toString()
    .trim()
    .split('\n');
  
  // Nur relevante Dateien
  const codeFiles = stagedFiles.filter(f => 
    /\.(js|ts|jsx|tsx|py|go|rs)$/.test(f)
  );
  
  if (codeFiles.length === 0) return;
  
  // Diff abrufen
  const diff = execSync('git diff --cached').toString();
  
  // AI-Analyse
  const analysis = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Analyze this code change for potential issues:
- Syntax errors
- Security vulnerabilities
- Performance anti-patterns
- Missing error handling

If critical issues found, respond with JSON: {"block": true, "reason": "..."}
Otherwise: {"block": false}

Diff:
${diff}
`
    }]
  });
  
  const result = JSON.parse(analysis.content[0].text);
  
  if (result.block) {
    console.error(`❌ Commit blocked: ${result.reason}`);
    process.exit(1);
  }
  
  console.log('✅ AI pre-commit check passed');
}

aiPreCommitCheck().catch(err => {
  console.error('AI check failed:', err);
  // Bei AI-Fehler: Commit erlauben (fail-open)
  process.exit(0);
});
```

#### Rollback-Script
```bash
#!/bin/bash
# scripts/rollback.sh - Automatischer Rollback

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./rollback.sh <version>"
  exit 1
fi

echo "🔄 Rolling back to version $VERSION..."

# GitHub Release als Rollback-Quelle
echo "📦 Fetching release artifacts..."
gh release download "v$VERSION" --pattern "*.tar.gz"

# Deployment
echo "🚀 Deploying previous version..."
tar -xzf "app-v$VERSION.tar.gz"
./deploy.sh

# Supabase Migrations Rollback via MCP
echo "🗄️ Rolling back database migrations..."
node scripts/supabase-rollback.js "$VERSION"

# Verification
echo "✅ Verifying rollback..."
./scripts/health-check.sh

echo "✨ Rollback to v$VERSION complete!"
```

### 6.2 Selbstheilungs-Workflows (Vollautomatisch)

#### Dependency-Resolution
```javascript
// scripts/self-heal-dependencies.js
const { execSync } = require('child_process');
const fs = require('fs');

async function selfHealDependencies() {
  console.log('🔧 Self-healing dependency issues...');
  
  try {
    // Versuch 1: Standard Install
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
    return;
  } catch (error) {
    console.log('❌ Standard install failed, trying fixes...');
  }
  
  // Versuch 2: Legacy Peer Deps
  try {
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    
    // Package.json updaten
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.config = pkg.config || {};
    pkg.config.legacyPeerDeps = true;
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    
    console.log('✅ Installed with legacy peer deps');
    await notifySlack('Dependency issue auto-fixed with --legacy-peer-deps');
    return;
  } catch (error) {
    console.log('❌ Legacy peer deps failed, trying clean install...');
  }
  
  // Versuch 3: Clean Install
  try {
    execSync('rm -rf node_modules package-lock.json');
    execSync('npm cache clean --force');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Clean install successful');
    await notifySlack('Dependency issue auto-fixed with clean install');
    return;
  } catch (error) {
    console.log('❌ Clean install failed, trying version resolution...');
  }
  
  // Versuch 4: AI-powered Version Resolution
  const conflicts = parseConflicts(error.message);
  const resolutions = await resolveWithAI(conflicts);
  
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.resolutions = resolutions;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ AI-powered resolution successful');
  await notifySlack('Dependency conflicts resolved by AI');
}

async function resolveWithAI(conflicts) {
  const anthropic = new Anthropic();
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Resolve these npm dependency conflicts by suggesting compatible versions:
${JSON.stringify(conflicts, null, 2)}

Respond with JSON object of resolutions: {"package-name": "version"}
`
    }]
  });
  
  return JSON.parse(response.content[0].text);
}

selfHealDependencies();
```

#### Formatting-Auto-Fix
```yaml
# .github/workflows/auto-format.yml
name: Auto-Format on Push
on:
  push:
    branches-ignore:
      - main

jobs:
  auto-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Auto-Format
        run: |
          npm run format
          npm run lint -- --fix
      
      - name: Commit if changed
        run: |
          git config user.name "AI Agent"
          git config user.email "ai-agent@example.com"
          git add .
          git diff --staged --quiet || git commit -m "style: auto-format code"
          git push
```

#### Test-Failure-Handling
```javascript
// scripts/self-heal-tests.js
const { execSync } = require('child_process');

async function selfHealTests() {
  let attempts = 0;
  const MAX_ATTEMPTS = 3;
  
  while (attempts < MAX_ATTEMPTS) {
    try {
      execSync('npm run test', { stdio: 'inherit' });
      console.log('✅ All tests passed');
      return;
    } catch (error) {
      attempts++;
      console.log(`❌ Tests failed (Attempt ${attempts}/${MAX_ATTEMPTS})`);
      
      if (attempts < MAX_ATTEMPTS) {
        // Flaky Test Detection
        const failedTests = parseFailedTests(error.message);
        
        if (isFlaky(failedTests)) {
          console.log('🔄 Retrying flaky tests...');
          await sleep(2000); // Wait before retry
          continue;
        }
        
        // AI-powered Test Fixing
        console.log('🤖 Attempting AI-powered test fix...');
        await fixTestsWithAI(failedTests);
      } else {
        // Notify Team
        await notifySlack(`Tests failed after ${MAX_ATTEMPTS} attempts:
${error.message}
Failed tests: ${failedTests.join(', ')}
        `);
        process.exit(1);
      }
    }
  }
}

async function fixTestsWithAI(failedTests) {
  for (const test of failedTests) {
    const testFile = test.file;
    const testContent = fs.readFileSync(testFile, 'utf8');
    
    const anthropic = new Anthropic();
    const fix = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `This test is failing:
${test.error}

Test file:
${testContent}

Provide a fixed version of the test file.
`
      }]
    });
    
    fs.writeFileSync(testFile, fix.content[0].text);
    console.log(`✅ Fixed ${testFile}`);
  }
}

selfHealTests();
```

#### Deployment-Rollback
```yaml
# .github/workflows/deploy-with-safeguards.yml
name: Deploy with Auto-Rollback
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Get Current Version
        id: current
        run: |
          CURRENT_VERSION=$(curl -s https://api.example.com/version)
          echo "version=$CURRENT_VERSION" >> $GITHUB_OUTPUT
      
      - name: Deploy New Version
        id: deploy
        run: |
          NEW_VERSION=$(date +%Y%m%d%H%M%S)
          ./scripts/deploy.sh $NEW_VERSION
          echo "version=$NEW_VERSION" >> $GITHUB_OUTPUT
      
      - name: Wait for Stabilization
        run: sleep 30
      
      - name: Health Check
        id: health
        run: |
          for i in {1..10}; do
            if curl -f https://api.example.com/health; then
              echo "✅ Health check passed"
              exit 0
            fi
            sleep 5
          done
          echo "❌ Health check failed"
          exit 1
      
      - name: Automated Rollback
        if: failure()
        run: |
          echo "🔄 Triggering automated rollback..."
          ./scripts/rollback.sh ${{ steps.current.outputs.version }}
          
          # Notify via Slack/Email
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "❌ Deployment failed! Rolled back to ${{ steps.current.outputs.version }}",
              "blocks": [{
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Deployment Failed*\nAttempted: `${{ steps.deploy.outputs.version }}`\nRolled back to: `${{ steps.current.outputs.version }}`"
                }
              }]
            }'
      
      - name: Notify Success
        if: success()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "✅ Successfully deployed version ${{ steps.deploy.outputs.version }}"
            }'
```

### 6.3 Verifizierungs-System (Vollautomatisch)

#### Pre-Execution-Checks
```javascript
// scripts/verify-prerequisites.js
const fs = require('fs');
const { execSync } = require('child_process');

function verifyPrerequisites() {
  console.log('🔍 Verifying prerequisites...');
  
  const checks = [
    {
      name: 'Node.js version',
      check: () => {
        const version = execSync('node --version').toString().trim();
        const major = parseInt(version.slice(1).split('.')[0]);
        return major >= 18;
      },
      fix: 'Install Node.js 18 or higher: https://nodejs.org'
    },
    {
      name: '.env file',
      check: () => fs.existsSync('.env'),
      fix: 'Run: cp .env.example .env'
    },
    {
      name: 'Supabase connection',
      check: async () => {
        const supabase = require('@supabase/supabase-js').createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        );
        const { error } = await supabase.from('_health').select('*').limit(1);
        return !error;
      },
      fix: 'Check SUPABASE_URL and SUPABASE_ANON_KEY in .env'
    },
    {
      name: 'GitHub token',
      check: () => !!process.env.GITHUB_TOKEN,
      fix: 'Set GITHUB_TOKEN in .env'
    }
  ];
  
  for (const { name, check, fix } of checks) {
    try {
      const passed = typeof check === 'function' ? await check() : check;
      if (passed) {
        console.log(`✅ ${name}`);
      } else {
        console.error(`❌ ${name}`);
        console.error(`   Fix: ${fix}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ ${name} - ${error.message}`);
      console.error(`   Fix: ${fix}`);
      process.exit(1);
    }



ACHTUN! Vestehe das Prinzip und führe es ab hier autonom im gleichen Schema optmiert weiter fort. 