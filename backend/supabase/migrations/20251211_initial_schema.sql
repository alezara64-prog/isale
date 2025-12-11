-- Schema iniziale per isale Karaoke Manager

-- Tabella cantanti (singers)
CREATE TABLE IF NOT EXISTS singers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella canzoni (songs)
CREATE TABLE IF NOT EXISTS songs (
  id BIGSERIAL PRIMARY KEY,
  singer_id BIGINT REFERENCES singers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tonality TEXT,
  song_format TEXT, -- CDG, MP3+G, Video, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice per ricerca veloce
CREATE INDEX IF NOT EXISTS idx_songs_singer_id ON songs(singer_id);
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
CREATE INDEX IF NOT EXISTS idx_singers_name ON singers(name);

-- Tabella coda karaoke (queue)
CREATE TABLE IF NOT EXISTS queue (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  song_id BIGINT REFERENCES songs(id) ON DELETE SET NULL,
  song_title TEXT NOT NULL,
  singer_name TEXT NOT NULL,
  tonality TEXT,
  notes TEXT,
  position INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, singing, completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_position ON queue(position);

-- Tabella chat pubblica
CREATE TABLE IF NOT EXISTS public_chat (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_chat_created_at ON public_chat(created_at DESC);

-- Tabella chat admin
CREATE TABLE IF NOT EXISTS admin_chat (
  id BIGSERIAL PRIMARY KEY,
  sender TEXT NOT NULL, -- 'admin' or 'public'
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_chat_created_at ON admin_chat(created_at DESC);

-- Tabella stato evento
CREATE TABLE IF NOT EXISTS event_status (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserisci valori di default per event_status
INSERT INTO event_status (key, value) VALUES
  ('chatEnabled', true),
  ('queueEnabled', true),
  ('songlistEnabled', true)
ON CONFLICT (key) DO NOTHING;

-- Tabella eventi salvati
CREATE TABLE IF NOT EXISTS saved_events (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  queue_data JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_events_date ON saved_events(date DESC);

-- Tabella settings/configurazione
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserisci settings di default
INSERT INTO settings (key, value) VALUES
  ('logo_url', '""'::jsonb),
  ('social_icons', '[]'::jsonb),
  ('public_access_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Funzione per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_singers_updated_at BEFORE UPDATE ON singers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_status_updated_at BEFORE UPDATE ON event_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_events_updated_at BEFORE UPDATE ON saved_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Abilita Row Level Security (RLS)
ALTER TABLE singers ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono leggere
CREATE POLICY "Allow public read access" ON singers FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON songs FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON queue FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public_chat FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON event_status FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON settings FOR SELECT USING (true);

-- Policy: Service role può fare tutto (per il backend)
CREATE POLICY "Service role full access" ON singers FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON songs FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON queue FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON public_chat FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON admin_chat FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON event_status FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON saved_events FOR ALL USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access" ON settings FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Policy: Gli utenti possono inserire nella coda e nella chat pubblica
CREATE POLICY "Allow public insert" ON queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON public_chat FOR INSERT WITH CHECK (true);
