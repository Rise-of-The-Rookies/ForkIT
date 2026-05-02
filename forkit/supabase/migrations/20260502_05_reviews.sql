-- ============================================
-- Migration 05: reviews
-- ============================================

CREATE TABLE reviews (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id uuid        REFERENCES restaurants(id) ON DELETE CASCADE,
  rating        integer     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body          text,
  created_at    timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read reviews
CREATE POLICY "reviews_select_authenticated"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

-- Only the review author can insert
CREATE POLICY "reviews_insert_own"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only the review author can update
CREATE POLICY "reviews_update_own"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the review author can delete
CREATE POLICY "reviews_delete_own"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
