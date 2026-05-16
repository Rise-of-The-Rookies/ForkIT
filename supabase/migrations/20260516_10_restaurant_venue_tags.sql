-- ============================================================
-- Migration 10 – Restaurant venue types and searchable tags
-- ForkIt · 2026-05-16
-- ============================================================

-- ─── 1. Add new columns to restaurants table ─────────────────

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS venue_type text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS searchable_tags text[] DEFAULT '{}';

-- ─── 2. Update search_vector trigger ─────────────────────────
-- Include venue_type, searchable_tags, and dish_types in the vector

CREATE OR REPLACE FUNCTION update_restaurant_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.cuisine_primary, '') || ' ' ||
    coalesce(NEW.cuisine_secondary, '') || ' ' ||
    coalesce(NEW.venue_type, '') || ' ' ||
    array_to_string(coalesce(NEW.searchable_tags, '{}'), ' ') || ' ' ||
    array_to_string(coalesce(NEW.dish_types, '{}'), ' ')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- The trigger itself doesn't need to be recreated if the function is replaced
-- but we'll force an update on existing rows if any
UPDATE restaurants SET id = id;

-- ─── 3. Update search_restaurants RPC ────────────────────────

DROP FUNCTION IF EXISTS search_restaurants(text, float);

CREATE OR REPLACE FUNCTION search_restaurants(
  search_query text,
  similarity_threshold float DEFAULT 0.3
)
RETURNS TABLE (
  id uuid,
  google_place_id text,
  name text,
  cuisine text,
  lat double precision,
  lng double precision,
  price_range integer,
  rating double precision,
  photos text[],
  cuisine_primary text,
  cuisine_secondary text,
  dish_types text[],
  halal_likely boolean,
  classification_source text,
  classification_confidence double precision,
  venue_type text,
  searchable_tags text[],
  text_score real,
  fuzzy_score real,
  trending_score double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.google_place_id,
    r.name,
    r.cuisine,
    r.lat,
    r.lng,
    r.price_range,
    r.rating,
    r.photos,
    r.cuisine_primary,
    r.cuisine_secondary,
    r.dish_types,
    r.halal_likely,
    r.classification_source,
    r.classification_confidence,
    r.venue_type,
    r.searchable_tags,
    ts_rank(r.search_vector, plainto_tsquery('english', search_query)) AS text_score,
    similarity(r.name, search_query) AS fuzzy_score,
    ts.score_daily AS trending_score
  FROM restaurants r
  LEFT JOIN trending_scores ts ON ts.restaurant_id = r.id
  WHERE
    r.search_vector @@ plainto_tsquery('english', search_query)
    OR similarity(r.name, search_query) > similarity_threshold
  ORDER BY
    ts_rank(r.search_vector, plainto_tsquery('english', search_query)) DESC,
    similarity(r.name, search_query) DESC
  LIMIT 100;
END;
$$;
