-- ============================================================
-- Migration: 20260516_13_posts
-- Phase 2 — Posts, interactions & comments
-- ============================================================

-- ─── posts ───────────────────────────────────────────────────
CREATE TABLE posts (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid        NOT NULL REFERENCES restaurants(id),
  media_urls    text[]      DEFAULT '{}',
  media_type    text        DEFAULT 'photo'
                            CHECK (media_type IN ('photo','video')),
  caption       text,
  hashtags      text[]      DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);

-- ─── post_interactions ───────────────────────────────────────
CREATE TABLE post_interactions (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    uuid        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       text        NOT NULL CHECK (type IN ('like','save','reshare')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (post_id, user_id, type)
);

-- ─── comments ────────────────────────────────────────────────
CREATE TABLE comments (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    uuid        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body       text        NOT NULL,
  parent_id  uuid        REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- ─── RLS — posts ─────────────────────────────────────────────
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read posts
CREATE POLICY "posts_select_authenticated"
  ON posts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert their own posts
CREATE POLICY "posts_insert_own"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "posts_update_own"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "posts_delete_own"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- ─── RLS — post_interactions ─────────────────────────────────
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read interactions (like counts, etc.)
CREATE POLICY "post_interactions_select_authenticated"
  ON post_interactions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert their own interactions
CREATE POLICY "post_interactions_insert_own"
  ON post_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own interactions (unlike, unsave)
CREATE POLICY "post_interactions_delete_own"
  ON post_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- ─── RLS — comments ─────────────────────────────────────────
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read comments
CREATE POLICY "comments_select_authenticated"
  ON comments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert their own comments
CREATE POLICY "comments_insert_own"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "comments_update_own"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "comments_delete_own"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);
