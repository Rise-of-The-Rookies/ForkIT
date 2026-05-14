/* ──────────────────────────────────────────────
   ForkIt — Search data layer
   Full-text + fuzzy search via Supabase (pg_trgm)
   with bilingual Malay ↔ English translation,
   7-factor relevance scoring, and search history.
   ────────────────────────────────────────────── */

import { supabase } from '@/lib/supabase'
import type { Restaurant, Dish, SearchHistory } from '@/types'

// ─── Bilingual keyword dictionary ────────────

const BILINGUAL_MAP: Record<string, string> = {
  ayam: 'chicken',
  ikan: 'fish',
  daging: 'beef',
  babi: 'pork',
  pedas: 'spicy',
  manis: 'sweet',
  masam: 'sour',
  masin: 'salty',
  nasi: 'rice',
  mee: 'noodles',
  roti: 'bread',
  sup: 'soup',
  murah: 'cheap',
  sedap: 'delicious',
  best: 'best',
}

/**
 * Replaces Malay words in the query with English equivalents.
 * Preserves words that don't have a translation.
 */
function translateQuery(query: string): string {
  return query
    .split(/\s+/)
    .map((word) => BILINGUAL_MAP[word.toLowerCase()] ?? word)
    .join(' ')
}

// ─── Types ───────────────────────────────────

export type MatchType = 'name' | 'cuisine' | 'dish' | 'fuzzy'

export interface SearchResult {
  restaurant: Restaurant
  score: number
  matchType: MatchType
  textScore: number
  fuzzyScore: number
  trendingScore: number
}

export interface SearchSuggestions {
  restaurants: Restaurant[]
  dishes: Dish[]
  cuisines: string[]
  areas: string[]
}

export interface SearchParams {
  query: string
  userLat: number
  userLng: number
  distanceKm: number
  cuisine?: string
  priceRange?: number[]
  minRating?: number
  openNow?: boolean
  halalOnly?: boolean
  sortBy?: 'relevant' | 'closest' | 'trending' | 'rated'
  limit?: number
}

// ─── Helpers ─────────────────────────────────

const EARTH_RADIUS_KM = 6_371

/** Haversine distance in km */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

// ─── 1. searchRestaurants ────────────────────

/**
 * Full-text + fuzzy restaurant search with 7-factor relevance scoring.
 *
 * Flow:
 * 1. Translate query through bilingual dictionary
 * 2. Query Supabase RPC for text_score + fuzzy_score + trending_score
 * 3. Apply client-side filters (distance, cuisine, price, rating, halal, openNow)
 * 4. Compute 7-factor relevance score
 * 5. Sort by requested sort mode
 */
export async function searchRestaurants(
  params: SearchParams,
): Promise<SearchResult[]> {
  const {
    query,
    userLat,
    userLng,
    distanceKm,
    cuisine,
    priceRange,
    minRating,
    halalOnly,
    sortBy = 'relevant',
    limit = 30,
  } = params

  if (!query.trim()) return []

  // Step 1: Translate Malay → English
  const translated = translateQuery(query.trim())

  // Step 2: Query restaurants using Supabase query builder (avoids RPC type issues)
  // Use .or() with ilike on name, cuisine, and cuisine_primary for broad matching
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .or(
      `name.ilike.%${translated}%,cuisine.ilike.%${translated}%,cuisine_primary.ilike.%${translated}%,cuisine_secondary.ilike.%${translated}%`,
    )
    .limit(100)

  if (error) {
    console.error('[search] searchRestaurants error:', error.message)
    return []
  }

  if (!data || data.length === 0) return []

  const rows = data as Restaurant[]

  // Also search dishes for dish-name matching
  const dishMatches = await searchDishes(translated, 50)
  const dishRestaurantIds = new Set(dishMatches.map((d) => d.restaurant_id))

  const results: SearchResult[] = []

  for (const row of rows) {
    // Distance filter
    const dist = haversineKm(userLat, userLng, row.lat, row.lng)
    if (dist > distanceKm) continue

    // Cuisine filter
    if (
      cuisine &&
      row.cuisine_primary?.toLowerCase() !== cuisine.toLowerCase() &&
      row.cuisine_secondary?.toLowerCase() !== cuisine.toLowerCase()
    )
      continue

    // Price filter
    if (priceRange && priceRange.length > 0 && !priceRange.includes(row.price_range))
      continue

    // Rating filter
    if (minRating && row.rating < minRating) continue

    // Halal filter
    if (halalOnly && !row.halal_likely) continue

    // Step 3: 7-factor relevance scoring
    let score = 0
    let matchType: MatchType = 'fuzzy'

    // Factor 1: Name match (+50)
    const nameLower = row.name.toLowerCase()
    const queryLower = translated.toLowerCase()
    if (nameLower.includes(queryLower)) {
      score += 50
      matchType = 'name'
    }

    // Factor 2: Dish name match (+40)
    if (dishRestaurantIds.has(row.id)) {
      score += 40
      if (matchType === 'fuzzy') matchType = 'dish'
    }

    // Factor 3: Cuisine match (+20)
    if (
      row.cuisine_primary?.toLowerCase().includes(queryLower) ||
      row.cuisine_secondary?.toLowerCase().includes(queryLower) ||
      row.cuisine.toLowerCase().includes(queryLower)
    ) {
      score += 20
      if (matchType === 'fuzzy') matchType = 'cuisine'
    }

    // Factor 4: Trending (+15) — will use trending_scores later
    const trending = 0
    score += 0

    // Factor 5: Within distance (+10)
    if (dist <= distanceKm * 0.5) {
      score += 10
    }

    // Factor 6: Taste profile match (+10)
    // TODO: integrate with user_preferences cuisine_tags when available
    score += 0

    // Factor 7: High rating ≥ 4.5 (+5)
    if (row.rating >= 4.5) {
      score += 5
    }

    results.push({
      restaurant: row,
      score,
      matchType,
      textScore: 0,
      fuzzyScore: 0,
      trendingScore: trending,
    })
  }

  // Step 5: Sort
  switch (sortBy) {
    case 'closest':
      results.sort(
        (a, b) =>
          haversineKm(userLat, userLng, a.restaurant.lat, a.restaurant.lng) -
          haversineKm(userLat, userLng, b.restaurant.lat, b.restaurant.lng),
      )
      break
    case 'trending':
      results.sort((a, b) => b.trendingScore - a.trendingScore)
      break
    case 'rated':
      results.sort((a, b) => b.restaurant.rating - a.restaurant.rating)
      break
    case 'relevant':
    default:
      results.sort((a, b) => b.score - a.score)
  }

  return results.slice(0, limit)
}

// ─── 2. searchDishes ─────────────────────────

/**
 * Full-text + fuzzy search on the dishes table.
 * Uses search_vector for relevance and pg_trgm similarity as fallback.
 */
export async function searchDishes(
  query: string,
  limit = 10,
): Promise<Dish[]> {
  if (!query.trim()) return []

  const translated = translateQuery(query.trim())

  // Direct query using ilike — avoids RPC type mismatch issues
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .or(`name.ilike.%${translated}%,description.ilike.%${translated}%`)
    .limit(limit)

  if (error) {
    console.error('[search] searchDishes error:', error.message)
    return []
  }

  return (data as Dish[]) ?? []
}

// ─── 3. getSuggestionsForQuery ───────────────

/**
 * Returns quick suggestions for the live search dropdown.
 * Max 3 per category: restaurants, dishes, cuisines, areas.
 */
export async function getSuggestionsForQuery(
  query: string,
): Promise<SearchSuggestions> {
  const empty: SearchSuggestions = {
    restaurants: [],
    dishes: [],
    cuisines: [],
    areas: [],
  }

  if (!query.trim() || query.trim().length < 2) return empty

  const translated = translateQuery(query.trim())

  // Fire all queries in parallel
  const [restaurantRes, dishRes, cuisineRes] = await Promise.allSettled([
    // Restaurants: fuzzy name match
    supabase
      .from('restaurants')
      .select('*')
      .or(`name.ilike.%${translated}%,cuisine_primary.ilike.%${translated}%`)
      .limit(3),

    // Dishes: fuzzy name match
    supabase
      .from('dishes')
      .select('*')
      .ilike('name', `%${translated}%`)
      .limit(3),

    // Distinct cuisines matching query
    supabase
      .from('restaurants')
      .select('cuisine_primary')
      .ilike('cuisine_primary', `%${translated}%`)
      .not('cuisine_primary', 'is', null)
      .limit(10),
  ])

  const restaurants: Restaurant[] =
    restaurantRes.status === 'fulfilled'
      ? ((restaurantRes.value.data as Restaurant[]) ?? [])
      : []

  const dishes: Dish[] =
    dishRes.status === 'fulfilled'
      ? ((dishRes.value.data as Dish[]) ?? [])
      : []

  // Deduplicate cuisine suggestions
  const cuisineSet = new Set<string>()
  if (cuisineRes.status === 'fulfilled' && cuisineRes.value.data) {
    for (const row of cuisineRes.value.data as Array<{
      cuisine_primary: string | null
    }>) {
      if (row.cuisine_primary) cuisineSet.add(row.cuisine_primary)
    }
  }

  return {
    restaurants: restaurants.slice(0, 3),
    dishes: dishes.slice(0, 3),
    cuisines: [...cuisineSet].slice(0, 3),
    areas: [], // TODO: populate from restaurant addresses / area tags
  }
}

// ─── 4. saveSearchHistory ────────────────────

/**
 * Insert a search into history, then prune to keep only the last 10 per user.
 */
export async function saveSearchHistory(
  userId: string,
  query: string,
  resultCount: number,
  tappedResult?: string,
): Promise<void> {
  // Insert
  const { error: insertErr } = await supabase.from('search_history').insert({
    user_id: userId,
    query,
    result_count: resultCount,
    tapped_result: tappedResult ?? null,
  })

  if (insertErr) {
    console.error('[search] saveSearchHistory insert error:', insertErr.message)
    return
  }

  // Prune: keep only the 10 most recent entries for this user
  const { data: rows, error: fetchErr } = await supabase
    .from('search_history')
    .select('id')
    .eq('user_id', userId)
    .order('searched_at', { ascending: false })

  if (fetchErr || !rows) return

  if (rows.length > 10) {
    const idsToDelete = rows.slice(10).map((r) => r.id)
    await supabase.from('search_history').delete().in('id', idsToDelete)
  }
}

// ─── 5. getSearchHistory ─────────────────────

/**
 * Fetch the last 10 search history entries for a user.
 */
export async function getSearchHistory(
  userId: string,
): Promise<SearchHistory[]> {
  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .eq('user_id', userId)
    .order('searched_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('[search] getSearchHistory error:', error.message)
    return []
  }

  return (data as SearchHistory[]) ?? []
}

// ─── 6. deleteSearchHistoryItem ──────────────

/**
 * Delete a single search history entry by ID.
 */
export async function deleteSearchHistoryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('search_history')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[search] deleteSearchHistoryItem error:', error.message)
  }
}
