-- ============================================
-- Migration 01: users
-- ============================================

CREATE TABLE users (
  id            uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name  text        NOT NULL,
  avatar_url    text,
  bio           text,
  personality_type text,
  budget_pref   text        CHECK (budget_pref IN ('low', 'mid', 'high')),
  distance_pref integer,
  created_at    timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own row
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own row (for onboarding)
CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
