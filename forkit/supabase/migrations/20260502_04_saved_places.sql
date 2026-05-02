-- ============================================
-- Migration 04: saved_places
-- ============================================

CREATE TABLE saved_places (
  user_id         uuid        REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id   uuid        REFERENCES restaurants(id) ON DELETE CASCADE,
  saved_at        timestamptz DEFAULT now(),
  geofence_active boolean     DEFAULT true,
  last_notified_at timestamptz,
  visit_count     integer     DEFAULT 0,

  PRIMARY KEY (user_id, restaurant_id)
);

-- Enable Row Level Security
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;

-- Users can read their own saved places
CREATE POLICY "saved_select_own"
  ON saved_places FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own saved places
CREATE POLICY "saved_insert_own"
  ON saved_places FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own saved places
CREATE POLICY "saved_update_own"
  ON saved_places FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved places
CREATE POLICY "saved_delete_own"
  ON saved_places FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
