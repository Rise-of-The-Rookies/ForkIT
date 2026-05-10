-- ============================================================
-- Migration: 06 — Cuisine Classification Columns
-- Date: 2026-05-07
-- Description:
--   Adds cuisine classification columns to the existing
--   restaurants table. These support automated and user-driven
--   tagging of restaurant cuisine types.
--
--   Uses ALTER TABLE only — does NOT recreate the table.
-- ============================================================

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS cuisine_primary          text,
  ADD COLUMN IF NOT EXISTS cuisine_secondary        text,
  ADD COLUMN IF NOT EXISTS dish_types               text[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS halal_likely             boolean  DEFAULT false,
  ADD COLUMN IF NOT EXISTS classification_source    text     DEFAULT 'unclassified',
  ADD COLUMN IF NOT EXISTS classification_confidence float4  DEFAULT 0;

-- ── Column documentation ────────────────────────────────────
--
-- cuisine_primary:
--   Main cuisine type, e.g. "Malay", "Japanese", "Indian".
--
-- cuisine_secondary:
--   Secondary cuisine for fusion places,
--   e.g. "Indian" on a Malay-Indian fusion restaurant.
--
-- dish_types:
--   Array of dish formats served,
--   e.g. ["rice", "curry", "bread"].
--
-- halal_likely:
--   Inferred from restaurant name / reviews context.
--   This is a heuristic flag — NOT a halal guarantee.
--
-- classification_source:
--   How the classification was determined.
--   One of: "unclassified", "keyword", "gemini", "user_signal".
--
-- classification_confidence:
--   Confidence score for the classification:
--     0.0 = unclassified (no classification yet)
--     0.7 = keyword      (rule-based keyword matching)
--     0.9 = gemini        (Gemini AI classification)
--     1.0 = user_signal   (explicit user input)
-- ─────────────────────────────────────────────────────────────

COMMENT ON COLUMN restaurants.cuisine_primary          IS 'Main cuisine type e.g. "Malay", "Japanese", "Indian"';
COMMENT ON COLUMN restaurants.cuisine_secondary        IS 'Secondary cuisine for fusion places e.g. "Indian" on a Malay-Indian fusion';
COMMENT ON COLUMN restaurants.dish_types               IS 'Array of dish formats e.g. ["rice", "curry", "bread"]';
COMMENT ON COLUMN restaurants.halal_likely             IS 'Inferred from name/reviews context — not a guarantee';
COMMENT ON COLUMN restaurants.classification_source    IS 'One of: unclassified, keyword, gemini, user_signal';
COMMENT ON COLUMN restaurants.classification_confidence IS '0 = unclassified, 0.7 = keyword, 0.9 = gemini, 1.0 = user_signal';
