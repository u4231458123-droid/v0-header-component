-- =============================================================================
-- MESSAGING SYSTEM - VOLLSTÄNDIGE KOMMUNIKATIONSLÖSUNG
-- =============================================================================
-- Ermöglicht Kommunikation zwischen:
-- - Fahrer ↔ Zentrale (Unternehmer)
-- - Unternehmer ↔ Fahrer
-- - Beide ↔ Kunde
-- - Kunde ↔ Fahrer/Unternehmer (nur 30 Min vor Fahrt, während und nach Fahrt)
-- - Fahrer/Unternehmer während Dienstzeiten

-- Erweitere communication_log Tabelle falls nötig
DO $$
BEGIN
  -- Füge fehlende Spalten hinzu
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'communication_log' AND column_name = 'is_urgent') THEN
    ALTER TABLE communication_log ADD COLUMN is_urgent BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'communication_log' AND column_name = 'attachment_url') THEN
    ALTER TABLE communication_log ADD COLUMN attachment_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'communication_log' AND column_name = 'message_status') THEN
    ALTER TABLE communication_log ADD COLUMN message_status TEXT DEFAULT 'sent' 
      CHECK (message_status IN ('sent', 'delivered', 'read', 'failed'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'communication_log' AND column_name = 'allowed_time_window_start') THEN
    ALTER TABLE communication_log ADD COLUMN allowed_time_window_start TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'communication_log' AND column_name = 'allowed_time_window_end') THEN
    ALTER TABLE communication_log ADD COLUMN allowed_time_window_end TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'communication_log' AND column_name = 'requires_shift_active') THEN
    ALTER TABLE communication_log ADD COLUMN requires_shift_active BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Erstelle Tabelle für Chat-Konversationen (Threads)
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Teilnehmer
  participant_1_type TEXT NOT NULL CHECK (participant_1_type IN ('driver', 'dispatcher', 'customer')),
  participant_1_id UUID NOT NULL,
  participant_2_type TEXT NOT NULL CHECK (participant_2_type IN ('driver', 'dispatcher', 'customer')),
  participant_2_id UUID NOT NULL,
  
  -- Kontext
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ,
  last_message_by UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Eindeutige Konversation pro Teilnehmer-Paar
  UNIQUE(company_id, participant_1_type, participant_1_id, participant_2_type, participant_2_id, booking_id)
);

-- Erstelle Tabelle für Chat-Nachrichten
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Sender
  sender_type TEXT NOT NULL CHECK (sender_type IN ('driver', 'dispatcher', 'customer')),
  sender_id UUID NOT NULL,
  sender_name TEXT,
  
  -- Nachricht
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'status_update', 'location')),
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_company ON chat_conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_participants ON chat_conversations(participant_1_id, participant_2_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_booking ON chat_conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_company ON chat_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);

-- RLS aktivieren
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies für chat_conversations
CREATE POLICY "Users can view own conversations" ON chat_conversations
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR participant_1_id = auth.uid()
    OR participant_2_id = auth.uid()
  );

CREATE POLICY "Users can create conversations" ON chat_conversations
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
  );

CREATE POLICY "Users can update own conversations" ON chat_conversations
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR participant_1_id = auth.uid()
    OR participant_2_id = auth.uid()
  );

-- RLS Policies für chat_messages
CREATE POLICY "Users can view messages in own conversations" ON chat_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM chat_conversations 
      WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        OR participant_1_id = auth.uid()
        OR participant_2_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in own conversations" ON chat_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM chat_conversations 
      WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
    )
    AND sender_id = auth.uid()
  );

CREATE POLICY "Users can update own messages" ON chat_messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Funktion: Prüfe ob Nachricht erlaubt ist (30 Min vor Fahrt, etc.)
CREATE OR REPLACE FUNCTION can_send_message(
  p_booking_id UUID,
  p_sender_type TEXT,
  p_recipient_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_pickup_time TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
  v_time_diff INTERVAL;
  v_booking_status TEXT;
  v_driver_shift_active BOOLEAN;
BEGIN
  -- Wenn keine Buchung, erlaube immer (für allgemeine Kommunikation)
  IF p_booking_id IS NULL THEN
    -- Prüfe ob Fahrer/Unternehmer während Dienstzeiten
    IF p_sender_type IN ('driver', 'dispatcher') THEN
      -- Prüfe ob aktive Schicht existiert
      SELECT EXISTS(
        SELECT 1 FROM driver_shifts 
        WHERE driver_id = (
          CASE 
            WHEN p_sender_type = 'driver' THEN (SELECT id FROM drivers WHERE user_id = auth.uid() LIMIT 1)
            ELSE NULL
          END
        )
        AND status IN ('active', 'break')
        AND shift_start <= v_now
        AND (shift_end IS NULL OR shift_end >= v_now)
      ) INTO v_driver_shift_active;
      
      -- Erlaube nur während aktiver Schicht
      RETURN v_driver_shift_active;
    END IF;
    
    -- Für andere Fälle erlaube
    RETURN true;
  END IF;
  
  -- Lade Buchungsdaten
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  v_pickup_time := v_booking.pickup_time;
  v_booking_status := v_booking.status;
  v_time_diff := v_pickup_time - v_now;
  
  -- Kunde kann nur 30 Min vor Fahrt, während und nach Fahrt schreiben
  IF p_sender_type = 'customer' THEN
    -- 30 Minuten vor Fahrt
    IF v_time_diff <= INTERVAL '30 minutes' AND v_time_diff >= INTERVAL '0 minutes' THEN
      RETURN true;
    END IF;
    
    -- Während Fahrt (in_progress)
    IF v_booking_status = 'in_progress' THEN
      RETURN true;
    END IF;
    
    -- Nach Fahrt (completed)
    IF v_booking_status = 'completed' THEN
      RETURN true;
    END IF;
    
    RETURN false;
  END IF;
  
  -- Fahrer/Unternehmer können immer schreiben (während Dienstzeiten)
  IF p_sender_type IN ('driver', 'dispatcher') THEN
    -- Prüfe ob aktive Schicht (für Fahrer)
    IF p_sender_type = 'driver' THEN
      SELECT EXISTS(
        SELECT 1 FROM driver_shifts 
        WHERE driver_id = v_booking.driver_id
        AND status IN ('active', 'break')
        AND shift_start <= v_now
        AND (shift_end IS NULL OR shift_end >= v_now)
      ) INTO v_driver_shift_active;
      
      RETURN v_driver_shift_active;
    END IF;
    
    -- Unternehmer kann immer
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion: Erstelle oder finde Konversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_company_id UUID,
  p_participant_1_type TEXT,
  p_participant_1_id UUID,
  p_participant_2_type TEXT,
  p_participant_2_id UUID,
  p_booking_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Suche existierende Konversation
  SELECT id INTO v_conversation_id
  FROM chat_conversations
  WHERE company_id = p_company_id
    AND (
      (participant_1_type = p_participant_1_type AND participant_1_id = p_participant_1_id
       AND participant_2_type = p_participant_2_type AND participant_2_id = p_participant_2_id)
      OR
      (participant_1_type = p_participant_2_type AND participant_1_id = p_participant_2_id
       AND participant_2_type = p_participant_1_type AND participant_2_id = p_participant_1_id)
    )
    AND (p_booking_id IS NULL OR booking_id = p_booking_id)
  LIMIT 1;
  
  -- Erstelle neue Konversation falls nicht gefunden
  IF v_conversation_id IS NULL THEN
    INSERT INTO chat_conversations (
      company_id,
      participant_1_type,
      participant_1_id,
      participant_2_type,
      participant_2_id,
      booking_id
    ) VALUES (
      p_company_id,
      p_participant_1_type,
      p_participant_1_id,
      p_participant_2_type,
      p_participant_2_id,
      p_booking_id
    )
    RETURNING id INTO v_conversation_id;
  ELSE
    -- Aktualisiere last_message_at
    UPDATE chat_conversations
    SET updated_at = NOW(), is_active = true
    WHERE id = v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Aktualisiere last_message_at in conversation
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET last_message_at = NEW.created_at,
      last_message_by = NEW.sender_id,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON chat_messages;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

