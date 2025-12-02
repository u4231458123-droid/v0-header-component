-- =====================================================
-- MyDispatch Wiki System - Supabase Datenbankstruktur
-- Version: 1.0.0 | Stand: 25.11.2025
-- =====================================================

-- Wiki Kategorien
CREATE TABLE IF NOT EXISTS wiki_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wiki Dokumente
CREATE TABLE IF NOT EXISTS wiki_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES wiki_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT true,
    is_locked BOOLEAN DEFAULT false,
    tags TEXT[],
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    UNIQUE(category_id, slug)
);

-- Wiki Versionen (für Versionierung)
CREATE TABLE IF NOT EXISTS wiki_document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES wiki_documents(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    content TEXT NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- Fehlerprotokoll (niemals löschen!)
CREATE TABLE IF NOT EXISTS wiki_error_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_code TEXT NOT NULL,
    error_message TEXT NOT NULL,
    affected_module TEXT,
    root_cause TEXT,
    solution TEXT,
    status TEXT DEFAULT 'open', -- open, resolved, wontfix
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    resolved_by UUID
);

-- Changelog (automatisch gepflegt)
CREATE TABLE IF NOT EXISTS wiki_changelog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL,
    change_type TEXT NOT NULL, -- feature, bugfix, breaking, security
    title TEXT NOT NULL,
    description TEXT,
    affected_modules TEXT[],
    related_error_id UUID REFERENCES wiki_error_log(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- ToDo-System
CREATE TABLE IF NOT EXISTS wiki_todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open', -- open, in_progress, review, done
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    category TEXT,
    assigned_to TEXT,
    dependencies TEXT[],
    related_docs UUID[],
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID
);

-- Prompts Sammlung
CREATE TABLE IF NOT EXISTS wiki_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    tags TEXT[],
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_wiki_documents_category ON wiki_documents(category_id);
CREATE INDEX IF NOT EXISTS idx_wiki_documents_slug ON wiki_documents(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_documents_tags ON wiki_documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_wiki_error_log_status ON wiki_error_log(status);
CREATE INDEX IF NOT EXISTS idx_wiki_todos_status ON wiki_todos(status);
CREATE INDEX IF NOT EXISTS idx_wiki_changelog_version ON wiki_changelog(version);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_wiki_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wiki_documents_updated
    BEFORE UPDATE ON wiki_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_wiki_timestamp();

CREATE TRIGGER wiki_todos_updated
    BEFORE UPDATE ON wiki_todos
    FOR EACH ROW
    EXECUTE FUNCTION update_wiki_timestamp();

-- RLS für Wiki (nur Master-Admins können bearbeiten, alle können lesen)
ALTER TABLE wiki_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_error_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_prompts ENABLE ROW LEVEL SECURITY;

-- Jeder kann Wiki lesen
CREATE POLICY "Anyone can read wiki_categories" ON wiki_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read wiki_documents" ON wiki_documents FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can read wiki_changelog" ON wiki_changelog FOR SELECT USING (true);
CREATE POLICY "Anyone can read wiki_prompts" ON wiki_prompts FOR SELECT USING (is_active = true);

-- Nur Master-Admins können schreiben (über Service Role Key)

-- Initiale Kategorien einfügen
INSERT INTO wiki_categories (name, slug, description, sort_order, icon) VALUES
    ('Hauptindex', 'index', 'Einstiegspunkt und Übersicht', 0, 'home'),
    ('Dokumentation', 'docs', 'Technische Dokumentation', 1, 'file-text'),
    ('Prompts', 'prompts', 'Prompt-Sammlung für AI', 2, 'terminal'),
    ('Architektur', 'architecture', 'Systemarchitektur und Design', 3, 'layers'),
    ('Logik', 'logic', 'Business-Logik und Workflows', 4, 'workflow'),
    ('Design-System', 'design-system', 'UI/UX Guidelines', 5, 'palette'),
    ('Tarife', 'tarife', 'Tariflogik und Preise', 6, 'credit-card'),
    ('Portale', 'portale', 'Portal-Dokumentation', 7, 'layout'),
    ('API', 'api', 'API-Referenz', 8, 'code'),
    ('Fehler', 'errors', 'Fehlerliste und Lösungen', 9, 'alert-triangle'),
    ('Checklisten', 'checklists', 'Prüflisten und QA', 10, 'check-square'),
    ('ToDos', 'todos', 'Aufgabenverwaltung', 11, 'list-todo'),
    ('Changelog', 'changelog', 'Änderungsprotokoll', 12, 'history'),
    ('Rechtliches', 'legal', 'Rechtliche Dokumente', 13, 'shield'),
    ('CI/CD', 'ci-cd', 'Pipeline und Deployment', 14, 'git-branch'),
    ('Tests', 'test-plans', 'Testpläne und QA', 15, 'test-tube'),
    ('Deployment', 'deployment', 'Deployment-Anleitungen', 16, 'rocket'),
    ('Branding', 'branding', 'Markenrichtlinien', 17, 'star')
ON CONFLICT (slug) DO NOTHING;
