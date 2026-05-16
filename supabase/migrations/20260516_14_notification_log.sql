-- ============================================================
-- Migration: 20260516_14_notification_log
-- Phase 2 — Notification log
-- ============================================================

-- ─── Table ───────────────────────────────────────────────────
CREATE TABLE notification_log (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          text        NOT NULL,
  restaurant_id uuid        REFERENCES restaurants(id),
  sent_at       timestamptz DEFAULT now(),
  opened        boolean     DEFAULT false
);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications only
CREATE POLICY "notification_log_select_own"
  ON notification_log FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update own notifications (mark as opened)
CREATE POLICY "notification_log_update_own"
  ON notification_log FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
