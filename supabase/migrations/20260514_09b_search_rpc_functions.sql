-- ============================================================
-- Migration 09b – Search RPC functions
-- ForkIt · 2026-05-14
-- These Postgres functions power the search data layer.
-- Run AFTER 20260514_09_search_system.sql
-- ============================================================

-- ─── search_restaurants RPC ─────────────────

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

-- ─── search_dishes RPC ──────────────────────

CREATE OR REPLACE FUNCTION search_dishes(
  search_query text,
  similarity_threshold float DEFAULT 0.3,
  max_results integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  restaurant_id uuid,
  name text,
  photo_url text,
  description text,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.restaurant_id,
    d.name,
    d.photo_url,
    d.description,
    d.created_at
  FROM dishes d
  WHERE
    d.search_vector @@ plainto_tsquery('english', search_query)
    OR similarity(d.name, search_query) > similarity_threshold
  ORDER BY
    ts_rank(d.search_vector, plainto_tsquery('english', search_query)) DESC,
    similarity(d.name, search_query) DESC
  LIMIT max_results;
END;
$$;
