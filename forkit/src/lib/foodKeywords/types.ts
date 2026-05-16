/* ──────────────────────────────────────────────
   ForkIt — Food Keyword Taxonomy Types
   ────────────────────────────────────────────── */

import type { FoodCategory, KeywordType } from '@/types'

export interface FoodKeyword {
  keyword: string
  category: FoodCategory
  type: KeywordType
  cuisineTag?: string
}

/** Compact format: category → { type, cuisineTag, keywords[] } */
export interface CategoryBlock {
  category: FoodCategory
  type: KeywordType
  cuisineTag?: string
  keywords: string[]
}
