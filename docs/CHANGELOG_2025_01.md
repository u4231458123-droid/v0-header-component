# Changelog - Januar 2025

## Kommunikationssystem & Partner-System

### ✅ Implementiert

#### 1. Partner-System
- **Eigene Partnernummer anzeigen**: Die MyDispatch-ID (`mydispatch_id`) wird nun prominent auf der Partnerseite angezeigt
- **Partnernummer in Tabelle**: Die Partnernummer wird auch in der Tabelle "Aktive Partnerschaften" angezeigt

#### 2. Kommunikationssystem (Chat)
- **Fahrer ↔ Dispo Chat**: 
  - Implementiert mit `DriverDispatcherChat` Komponente
  - Prüft, ob Fahrer im Dienst ist (aktive Schicht)
  - Nutzt RPC-Funktion `get_or_create_conversation`
  - `DriverChatPanel` wurde auf das neue System umgestellt
  
- **Kunde ↔ Fahrer Chat**:
  - Implementiert mit `CustomerDriverChat` Komponente
  - 30-Minuten-Regel vor/nach Fahrt wird durchgesetzt
  - Zeitfenster-Validierung über `can_send_message` RPC-Funktion

- **Datei-Upload & Sprachnachrichten**:
  - `ChatWidget` unterstützt Datei-Upload (max. 10MB)
  - Bild-Upload mit Vorschau
  - Audio-Aufnahme (Sprachnachrichten) mit MediaRecorder API
  - Audio-Player für Wiedergabe von Sprachnachrichten

#### 3. Datenbank-Schema
- `chat_conversations` Tabelle für Chat-Threads
- `chat_messages` Tabelle für Nachrichten
- RPC-Funktion `get_or_create_conversation` für automatische Konversations-Erstellung
- RPC-Funktion `can_send_message` für Zeitfenster-Validierung
- Migration `017_extend_chat_messages_for_files_and_audio.sql` für Datei- und Audio-Unterstützung

### 🔧 Korrekturen

#### Stripe Tax ID Collection
- **Problem**: "Tax ID collection requires updating business name on the customer"
- **Lösung**: `customer_update: { name: "auto" }` zu Checkout Sessions hinzugefügt
- **Dateien**:
  - `app/actions/create-subscription.ts`
  - `lib/stripe-config.ts`

### 📝 Dokumentation

- `docs/EMAIL_TEMPLATES_IMPLEMENTATION.md` - Planung für E-Mail-Templates
- `docs/CHANGELOG_2025_01.md` - Diese Datei

### ⏳ Ausstehend

#### E-Mail-Templates
- Alle 13 Supabase Auth E-Mail-Templates müssen noch erstellt werden
- Templates müssen in Supabase konfiguriert werden
- Status: In Arbeit

#### Chat-Integration in Portale
- Chat-Button in `BookingDetailsDialog` hinzufügen
- Chat in Kundenportal integrieren
- Chat in Fahrerportal integrieren

---

## Technische Details

### Neue Komponenten
- `components/communication/DriverDispatcherChat.tsx`
- `components/communication/CustomerDriverChat.tsx`
- `components/communication/ChatWidget.tsx` (erweitert)

### Geänderte Komponenten
- `components/drivers/DriverChatPanel.tsx` - Umstellung auf neues Chat-System
- `components/partner/PartnerPageClient.tsx` - Partnernummer-Anzeige

### Datenbank-Migrationen
- `scripts/migrations/002_create_messaging_system.sql`
- `scripts/migrations/017_extend_chat_messages_for_files_and_audio.sql`

