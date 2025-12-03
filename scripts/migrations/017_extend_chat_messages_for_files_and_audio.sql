-- =============================================================================
-- ERWEITERE CHAT_MESSAGES FÜR DATEI-UPLOAD UND SPRAchnachrichten
-- =============================================================================

-- Erweitere chat_messages Tabelle
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT CHECK (attachment_type IN ('file', 'image', 'audio', 'document')),
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_size INTEGER,
ADD COLUMN IF NOT EXISTS audio_duration INTEGER, -- Dauer in Sekunden für Audio-Nachrichten
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'status_update', 'location', 'file', 'image', 'audio'));

-- Aktualisiere message_type CHECK Constraint falls nötig
DO $$
BEGIN
  -- Entferne alte Constraint falls vorhanden
  ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;
  
  -- Erstelle neue Constraint mit erweiterten Typen
  ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_message_type_check 
    CHECK (message_type IN ('text', 'system', 'status_update', 'location', 'file', 'image', 'audio'));
END $$;

-- Index für Attachment-Suchen
CREATE INDEX IF NOT EXISTS idx_chat_messages_attachment ON chat_messages(attachment_url) WHERE attachment_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);

-- Kommentare
COMMENT ON COLUMN chat_messages.attachment_url IS 'URL zum hochgeladenen Anhang (Supabase Storage)';
COMMENT ON COLUMN chat_messages.attachment_type IS 'Typ des Anhangs (file, image, audio, document)';
COMMENT ON COLUMN chat_messages.attachment_name IS 'Original-Dateiname';
COMMENT ON COLUMN chat_messages.attachment_size IS 'Dateigröße in Bytes';
COMMENT ON COLUMN chat_messages.audio_duration IS 'Dauer der Audio-Nachricht in Sekunden';
COMMENT ON COLUMN chat_messages.message_type IS 'Typ der Nachricht (text, file, image, audio, etc.)';

