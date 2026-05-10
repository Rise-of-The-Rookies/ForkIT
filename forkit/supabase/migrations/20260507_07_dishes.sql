-- ╔══════════════════════════════════════════════════╗
-- ║  Migration 07 — Dishes table                     ║
-- ║  Stores dish entries per restaurant               ║
-- ╚══════════════════════════════════════════════════╝

CREATE TABLE dishes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  photo_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookup by restaurant
CREATE INDEX dishes_restaurant_id_idx ON dishes(restaurant_id);

-- RLS
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read dishes
CREATE POLICY "Dishes are publicly readable"
  ON dishes FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update (populated server-side via Edge Functions)
-- No client-side insert policy needed for MVP
