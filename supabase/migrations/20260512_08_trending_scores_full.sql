-- ============================================================
-- 20260512_08 — Trending Scores (full rebuild)
-- ============================================================

-- 1. Drop existing table (cascade to remove dependent objects)
DROP TABLE IF EXISTS trending_scores CASCADE;

-- 2. Create table
CREATE TABLE trending_scores (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id   uuid        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  score_daily     float4      DEFAULT 0,
  score_weekly    float4      DEFAULT 0,
  rank_local      integer,
  rank_city       integer,
  rank_national   integer,
  score_delta_pct float4      DEFAULT 0,
  top_signals     jsonb       DEFAULT '{}',
  region          text        NOT NULL DEFAULT 'KL',
  computed_at     timestamptz DEFAULT now()
);

-- 3. Unique constraint — one row per restaurant per region
ALTER TABLE trending_scores
  ADD CONSTRAINT uq_trending_restaurant_region
  UNIQUE (restaurant_id, region);

-- 4. Enable Row-Level Security
ALTER TABLE trending_scores ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies

-- All authenticated users can read
CREATE POLICY "Authenticated users can read trending_scores"
  ON trending_scores
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service_role can insert
CREATE POLICY "Service role can insert trending_scores"
  ON trending_scores
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service_role can update
CREATE POLICY "Service role can update trending_scores"
  ON trending_scores
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Only service_role can delete
CREATE POLICY "Service role can delete trending_scores"
  ON trending_scores
  FOR DELETE
  TO service_role
  USING (true);
