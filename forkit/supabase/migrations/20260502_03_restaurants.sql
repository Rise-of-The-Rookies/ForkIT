-- ============================================
-- Migration 03: restaurants
-- ============================================

CREATE TABLE restaurants (
  id              uuid   DEFAULT gen_random_uuid() PRIMARY KEY,
  google_place_id text   UNIQUE NOT NULL,
  name            text   NOT NULL,
  cuisine         text,
  lat             float8,
  lng             float8,
  price_range     integer CHECK (price_range BETWEEN 1 AND 4),
  rating          float4,
  photos          text[] DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read restaurants
CREATE POLICY "restaurants_select_authenticated"
  ON restaurants FOR SELECT
  TO authenticated
  USING (true);

-- No INSERT / UPDATE / DELETE policies for authenticated role.
-- Writes happen server-side via the service_role key.
