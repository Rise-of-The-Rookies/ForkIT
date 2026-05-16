-- ============================================================
-- Migration: 20260516_11_friends
-- Phase 2 — Friends system
-- ============================================================

-- ─── Table ───────────────────────────────────────────────────
CREATE TABLE friends (
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id  uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  status     text        NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','accepted')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, friend_id)
);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Users can read rows where they are either side of the friendship
CREATE POLICY "friends_select_own"
  ON friends FOR SELECT
  USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- Users can send friend requests (insert where user_id = self)
CREATE POLICY "friends_insert_own"
  ON friends FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Users can update their own rows (accept / change status)
CREATE POLICY "friends_update_own"
  ON friends FOR UPDATE
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Users can delete (unfriend) their own rows
CREATE POLICY "friends_delete_own"
  ON friends FOR DELETE
  USING (
    auth.uid() = user_id
  );
