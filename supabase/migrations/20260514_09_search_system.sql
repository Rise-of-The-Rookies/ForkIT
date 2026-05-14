-- ============================================================
-- Migration 09 – Search System
-- ForkIt · 2026-05-14
-- ============================================================

-- ─── 1. Enable pg_trgm extension (fuzzy matching) ───────────

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── 2. Full-text search indexes on restaurants ─────────────

-- Add tsvector column for fast full-text search on name + cuisine
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS search_vector tsvector;

UPDATE restaurants
SET search_vector = to_tsvector('english',
  coalesce(name, '') || ' ' ||
  coalesce(cuisine_primary, '') || ' ' ||
  coalesce(cuisine_secondary, '')
);

CREATE INDEX IF NOT EXISTS restaurants_search_vector_idx
  ON restaurants USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS restaurants_name_trgm_idx
  ON restaurants USING GIN(name gin_trgm_ops);

-- Trigger to keep search_vector updated on insert / update
CREATE OR REPLACE FUNCTION update_restaurant_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.cuisine_primary, '') || ' ' ||
    coalesce(NEW.cuisine_secondary, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_search_vector_update
  BEFORE INSERT OR UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_restaurant_search_vector();

-- ─── 3. Full-text search indexes on dishes ──────────────────

ALTER TABLE dishes ADD COLUMN IF NOT EXISTS search_vector tsvector;

UPDATE dishes
SET search_vector = to_tsvector('english',
  coalesce(name, '') || ' ' ||
  coalesce(description, '')
);

CREATE INDEX IF NOT EXISTS dishes_search_vector_idx
  ON dishes USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS dishes_name_trgm_idx
  ON dishes USING GIN(name gin_trgm_ops);

CREATE OR REPLACE FUNCTION update_dish_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dishes_search_vector_update
  BEFORE INSERT OR UPDATE ON dishes
  FOR EACH ROW EXECUTE FUNCTION update_dish_search_vector();

-- ─── 4. search_history table ────────────────────────────────

CREATE TABLE search_history (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query         text        NOT NULL,
  result_count  integer     DEFAULT 0,
  tapped_result uuid        REFERENCES restaurants(id) ON DELETE SET NULL,
  searched_at   timestamptz DEFAULT now()
);

CREATE INDEX search_history_user_id_idx
  ON search_history(user_id);

CREATE INDEX search_history_searched_at_idx
  ON search_history(searched_at DESC);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own search history"
  ON search_history FOR ALL TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
