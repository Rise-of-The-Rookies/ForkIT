-- ============================================================
-- Migration: 20260516_15_taste_signals
-- Phase 2 — Taste signals for recommendation engine
-- ============================================================

-- ─── Table ───────────────────────────────────────────────────
CREATE TABLE taste_signals (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type   text        NOT NULL,
  cuisine_tag   text,
  restaurant_id uuid        REFERENCES restaurants(id),
  weight        float4      DEFAULT 1.0,
  created_at    timestamptz DEFAULT now()
);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE taste_signals ENABLE ROW LEVEL SECURITY;

-- Users can read their own taste signals
CREATE POLICY "taste_signals_select_own"
  ON taste_signals FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own taste signals
CREATE POLICY "taste_signals_insert_own"
  ON taste_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No DELETE or UPDATE policy — signals are immutable from the client
