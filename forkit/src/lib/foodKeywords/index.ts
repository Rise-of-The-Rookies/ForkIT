/* ──────────────────────────────────────────────
   ForkIt — Food Keyword Database
   1,703 keywords across 24 categories.
   Central lookup, classification, and suggestion engine.
   ────────────────────────────────────────────── */

import type { FoodCategory, KeywordType } from '@/types'
import type { FoodKeyword, CategoryBlock } from './types'
export type { FoodKeyword, CategoryBlock } from './types'

// ─── Data imports ────────────────────────────

import { MALAY_KEYWORDS, MALAY_VENUE_KEYWORDS, CHINESE_KEYWORDS } from './data-malay-chinese'
import { JAPANESE_KEYWORDS, KOREAN_KEYWORDS, THAI_KEYWORDS } from './data-jpn-kor-thai'
import { VIETNAMESE_KEYWORDS, INDIAN_KEYWORDS, MIDDLE_EASTERN_KEYWORDS } from './data-vn-in-me'
import { SOUTHEAST_ASIAN_KEYWORDS, EAST_ASIAN_KEYWORDS, SOUTH_ASIAN_KEYWORDS, AFRICAN_KEYWORDS, LATIN_AMERICAN_KEYWORDS } from './data-regional'
import { WESTERN_KEYWORDS, EUROPEAN_KEYWORDS } from './data-western'
import { SEAFOOD_KEYWORDS, VEGETARIAN_KEYWORDS, DIETARY_KEYWORDS } from './data-dietary'
import { FORMAT_KEYWORDS, DESSERT_KEYWORDS, DRINKS_KEYWORDS, VENUE_KEYWORDS, OCCASION_KEYWORDS, PRICE_KEYWORDS } from './data-functional'

// ─── All category blocks ────────────────────

export const ALL_CATEGORY_BLOCKS: CategoryBlock[] = [
  MALAY_KEYWORDS, MALAY_VENUE_KEYWORDS, CHINESE_KEYWORDS,
  JAPANESE_KEYWORDS, KOREAN_KEYWORDS, THAI_KEYWORDS,
  VIETNAMESE_KEYWORDS, INDIAN_KEYWORDS, MIDDLE_EASTERN_KEYWORDS,
  SOUTHEAST_ASIAN_KEYWORDS, EAST_ASIAN_KEYWORDS, SOUTH_ASIAN_KEYWORDS,
  AFRICAN_KEYWORDS, LATIN_AMERICAN_KEYWORDS,
  WESTERN_KEYWORDS, EUROPEAN_KEYWORDS,
  SEAFOOD_KEYWORDS, VEGETARIAN_KEYWORDS, DIETARY_KEYWORDS,
  FORMAT_KEYWORDS, DESSERT_KEYWORDS, DRINKS_KEYWORDS,
  VENUE_KEYWORDS, OCCASION_KEYWORDS, PRICE_KEYWORDS,
]

// ─── Flattened keyword list (built once) ─────

function buildFlatList(): FoodKeyword[] {
  const list: FoodKeyword[] = []
  for (const block of ALL_CATEGORY_BLOCKS) {
    for (const kw of block.keywords) {
      list.push({
        keyword: kw,
        category: block.category,
        type: block.type,
        cuisineTag: block.cuisineTag,
      })
    }
  }
  return list
}

/** All 1,703 keywords as FoodKeyword objects */
export const FOOD_KEYWORDS: FoodKeyword[] = buildFlatList()

// ─── Lookup maps (built once on import) ──────

const keywordLowerMap = new Map<string, FoodKeyword>()
for (const kw of FOOD_KEYWORDS) {
  keywordLowerMap.set(kw.keyword.toLowerCase(), kw)
}

// ─── Public helper functions ─────────────────

/** Find a keyword by exact or case-insensitive match */
export function findKeyword(query: string): FoodKeyword | undefined {
  return keywordLowerMap.get(query.toLowerCase())
}

/** Find the best-matching keyword for a restaurant name (substring scan) */
export function classifyByName(name: string): FoodKeyword | undefined {
  const lower = name.toLowerCase()
  let bestMatch: FoodKeyword | undefined
  let bestLen = 0

  for (const kw of FOOD_KEYWORDS) {
    const kwLower = kw.keyword.toLowerCase()
    if (lower.includes(kwLower) && kwLower.length > bestLen) {
      bestMatch = kw
      bestLen = kwLower.length
    }
  }
  return bestMatch
}

/** Get all keywords for a specific category */
export function getKeywordsByCategory(cat: FoodCategory): FoodKeyword[] {
  return FOOD_KEYWORDS.filter((kw) => kw.category === cat)
}

/** Get all keywords for a specific type */
export function getKeywordsByType(type: KeywordType): FoodKeyword[] {
  return FOOD_KEYWORDS.filter((kw) => kw.type === type)
}

/** Get the cuisine tag for a keyword string */
export function getCuisineForKeyword(keyword: string): string | undefined {
  return findKeyword(keyword)?.cuisineTag
}

/** Get all keyword strings (for autocomplete) */
export function getSearchableKeywords(): string[] {
  return FOOD_KEYWORDS.map((kw) => kw.keyword)
}

/**
 * Fuzzy prefix search for autocomplete suggestions.
 * Returns up to `limit` keywords matching the prefix.
 */
export function suggestKeywords(prefix: string, limit = 8): FoodKeyword[] {
  if (!prefix || prefix.length < 2) return []
  const lower = prefix.toLowerCase()
  const results: FoodKeyword[] = []

  // Exact prefix matches first
  for (const kw of FOOD_KEYWORDS) {
    if (kw.keyword.toLowerCase().startsWith(lower)) {
      results.push(kw)
      if (results.length >= limit) return results
    }
  }

  // Then substring matches
  for (const kw of FOOD_KEYWORDS) {
    if (
      !kw.keyword.toLowerCase().startsWith(lower) &&
      kw.keyword.toLowerCase().includes(lower)
    ) {
      results.push(kw)
      if (results.length >= limit) return results
    }
  }

  return results
}

/**
 * Curated list of ~50 high-impact keywords for Google Places Text Search.
 * These are category-level terms that return broad, useful results.
 * Specific dish names are excluded (local search only).
 */
export const GOOGLE_PLACES_KEYWORDS: string[] = [
  // Malaysian (8)
  'Malaysian', 'Mamak', 'Kopitiam', 'Nasi Lemak', 'Nasi Kandar', 'Laksa', 'Satay', 'Roti Canai',
  // Chinese (6)
  'Chinese', 'Dim Sum', 'Hot Pot', 'Chicken Rice', 'Char Siu', 'Wonton',
  // Japanese (5)
  'Japanese', 'Sushi', 'Ramen', 'Yakiniku', 'Izakaya',
  // Korean (3)
  'Korean', 'Korean BBQ', 'Korean Fried Chicken',
  // Thai (3)
  'Thai', 'Pad Thai', 'Tom Yum',
  // Vietnamese (2)
  'Vietnamese', 'Pho',
  // Indian (4)
  'Indian', 'Biryani', 'Tandoori', 'Banana Leaf Rice',
  // Middle Eastern (3)
  'Middle Eastern', 'Shawarma', 'Kebab',
  // Western (6)
  'Western', 'Burger', 'Pizza', 'Steak', 'Pasta', 'Fried Chicken',
  // European (2)
  'Italian', 'French',
  // Other (8)
  'Seafood', 'Vegetarian', 'Dessert Cafe', 'Bakery', 'Bubble Tea', 'Cafe', 'BBQ', 'Buffet',
]
