-- ============================================
-- Migration 02: user_preferences
-- ============================================

CREATE TABLE user_preferences (
  user_id            uuid   PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  cuisine_tags       text[] DEFAULT '{}',
  dietary_tags       text[] DEFAULT '{}',
  notification_prefs jsonb  DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "prefs_select_own"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "prefs_insert_own"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "prefs_update_own"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
