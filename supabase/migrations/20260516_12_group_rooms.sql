-- ============================================================
-- Migration: 20260516_12_group_rooms
-- Phase 2 — Group rooms, members & swipes
-- ============================================================

-- ─── group_rooms ─────────────────────────────────────────────
CREATE TABLE group_rooms (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id    uuid        NOT NULL REFERENCES auth.users(id),
  code       text        UNIQUE NOT NULL,
  status     text        DEFAULT 'waiting'
                         CHECK (status IN ('waiting','swiping','revealed','done')),
  filters    jsonb       DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ─── room_members ────────────────────────────────────────────
CREATE TABLE room_members (
  room_id          uuid        REFERENCES group_rooms(id) ON DELETE CASCADE,
  user_id          uuid        REFERENCES auth.users(id)       ON DELETE CASCADE,
  joined_at        timestamptz DEFAULT now(),
  finished_swiping boolean     DEFAULT false,
  PRIMARY KEY (room_id, user_id)
);

-- ─── swipes ──────────────────────────────────────────────────
CREATE TABLE swipes (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id       uuid        REFERENCES group_rooms(id) ON DELETE CASCADE,
  user_id       uuid        REFERENCES auth.users(id),
  restaurant_id uuid        REFERENCES restaurants(id),
  direction     text        CHECK (direction IN ('yes','no')),
  swiped_at     timestamptz DEFAULT now()
);

-- ─── RLS — group_rooms ──────────────────────────────────────
ALTER TABLE group_rooms ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read rooms they are a member of
CREATE POLICY "group_rooms_select_members"
  ON group_rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = id AND rm.user_id = auth.uid()
    )
    OR host_id = auth.uid()
  );

-- Host can insert a room
CREATE POLICY "group_rooms_insert_host"
  ON group_rooms FOR INSERT
  WITH CHECK (
    auth.uid() = host_id
  );

-- Host can update their room (e.g. change status)
CREATE POLICY "group_rooms_update_host"
  ON group_rooms FOR UPDATE
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- ─── RLS — room_members ─────────────────────────────────────
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

-- Members can read other members in rooms they belong to
CREATE POLICY "room_members_select"
  ON room_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = room_members.room_id AND rm.user_id = auth.uid()
    )
  );

-- Authenticated users can join rooms (insert themselves)
CREATE POLICY "room_members_insert_self"
  ON room_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Members can update own row (e.g. finished_swiping)
CREATE POLICY "room_members_update_self"
  ON room_members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── RLS — swipes ───────────────────────────────────────────
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Members can read swipes in rooms they belong to
CREATE POLICY "swipes_select_members"
  ON swipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = swipes.room_id AND rm.user_id = auth.uid()
    )
  );

-- Members can insert swipes for their own user_id
CREATE POLICY "swipes_insert_own"
  ON swipes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );
