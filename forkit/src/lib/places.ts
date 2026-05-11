/* ──────────────────────────────────────────────
   ForkIt — Google Places API (New) wrapper
   Endpoints: Text Search · Nearby Search · Place Details · Photos
   ────────────────────────────────────────────── */

import { supabase } from '@/lib/supabase'
import type { Restaurant } from '@/types'

// ─── Config ──────────────────────────────────

const API_KEY = import.meta.env.VITE_GOOGLE_KEY as string
const BASE_URL = 'https://places.googleapis.com/v1/places'

// ─── Field masks ─────────────────────────────

const NEARBY_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.priceLevel',
  'places.photos',
  'places.currentOpeningHours',
  'places.location',
  'places.types',
].join(',')

const DETAIL_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'rating',
  'priceLevel',
  'photos',
  'currentOpeningHours',
  'regularOpeningHours',
  'location',
  'types',
  'websiteUri',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  'editorialSummary',
  'reviews',
  'userRatingCount',
  'googleMapsUri',
  'primaryType',
  'takeout',
  'delivery',
  'dineIn',
  'reservable',
  'servesBreakfast',
  'servesLunch',
  'servesDinner',
  'servesBeer',
  'servesWine',
  'servesVegetarianFood',
].join(',')

// ─── Price-level mapping ─────────────────────
// Google Places API (New) uses string enums for price levels.

const PRICE_LEVEL_MAP: Record<number, string> = {
  1: 'PRICE_LEVEL_INEXPENSIVE',
  2: 'PRICE_LEVEL_MODERATE',
  3: 'PRICE_LEVEL_EXPENSIVE',
  4: 'PRICE_LEVEL_VERY_EXPENSIVE',
}

const PRICE_LEVEL_REVERSE: Record<string, 1 | 2 | 3 | 4> = {
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
}

// ─── Types for raw API responses ─────────────

interface GooglePlace {
  id: string
  displayName?: { text: string; languageCode?: string }
  formattedAddress?: string
  rating?: number
  priceLevel?: string
  photos?: { name: string; widthPx: number; heightPx: number }[]
  currentOpeningHours?: { openNow?: boolean }
  location?: { latitude: number; longitude: number }
  types?: string[]
  // Detail-only fields
  websiteUri?: string
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  editorialSummary?: { text: string }
  reviews?: unknown[]
  userRatingCount?: number
  googleMapsUri?: string
  primaryType?: string
}

// ─── Helpers ─────────────────────────────────

/** Map a raw Google Place object → our Restaurant type */
function mapToRestaurant(place: GooglePlace): Restaurant {
  // Filter and validate photo names before creating URLs
  const validPhotos = (place.photos ?? [])
    .filter((p) => p.name && p.name.startsWith('places/'))
    .map((p) => getPhotoUrl(p.name))

  return {
    id: crypto.randomUUID(),
    google_place_id: place.id,
    name: place.displayName?.text ?? 'Unknown',
    cuisine: deriveCuisine(place.types ?? [], place.primaryType),
    lat: place.location?.latitude ?? 0,
    lng: place.location?.longitude ?? 0,
    price_range: PRICE_LEVEL_REVERSE[place.priceLevel ?? ''] ?? 2,
    rating: place.rating ?? 0,
    photos: validPhotos,
    // Cuisine classification defaults
    cuisine_primary: null,
    cuisine_secondary: null,
    dish_types: [],
    halal_likely: false,
    classification_source: 'unclassified',
    classification_confidence: 0,
  }
}

/** Best-effort cuisine label from Google type tags */
function deriveCuisine(types: string[], primaryType?: string): string {
  // primaryType is the most specific (e.g. "japanese_restaurant")
  if (primaryType) {
    const label = primaryType
      .replace(/_restaurant$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    return label
  }

  // Fallback: scan types for anything more descriptive than "restaurant"
  const skip = new Set([
    'restaurant',
    'food',
    'point_of_interest',
    'establishment',
  ])
  const meaningful = types.find((t) => !skip.has(t))
  if (meaningful) {
    return meaningful
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return 'Restaurant'
}

// ─── 1. searchNearbyRestaurants ──────────────

export interface NearbySearchParams {
  lat: number
  lng: number
  radiusMeters?: number
  cuisineKeyword?: string
  priceLevels?: number[]
  openNow?: boolean
  maxResults?: number
}

/**
 * Search for nearby restaurants using the Google Places (New) Nearby Search API.
 * Returns an array of `Restaurant` objects mapped from the response.
 */
export async function searchNearbyRestaurants(
  params: NearbySearchParams,
): Promise<Restaurant[]> {
  const {
    lat,
    lng,
    radiusMeters = 5000,
    cuisineKeyword,
    priceLevels,
    openNow,
  } = params

  // When a cuisine keyword is provided, we must use the Text Search endpoint
  // because Nearby Search does NOT support textQuery.
  const useTextSearch = Boolean(cuisineKeyword)

  let body: Record<string, unknown>
  let endpoint: string

  if (useTextSearch) {
    // ── Text Search path ──
    endpoint = `${BASE_URL}:searchText`
    body = {
      textQuery: `${cuisineKeyword} restaurant`,
      includedType: 'restaurant',
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radiusMeters,
        },
      },
      maxResultCount: params.maxResults ?? 20,
    }
  } else {
    // ── Nearby Search path (no keyword) ──
    endpoint = `${BASE_URL}:searchNearby`
    body = {
      includedTypes: ['restaurant'],
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radiusMeters,
        },
      },
      maxResultCount: params.maxResults ?? 20,
    }
  }

  // Optional: price-level filter (array of price-level strings)
  if (priceLevels && priceLevels.length > 0) {
    body.priceLevels = priceLevels.map((p) => PRICE_LEVEL_MAP[p]).filter(Boolean)
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': NEARBY_FIELD_MASK,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorBody = await res.text()
      console.error(
        `[places] ${useTextSearch ? 'searchText' : 'searchNearby'} failed (${res.status}):`,
        errorBody,
      )
      return []
    }

    const data = (await res.json()) as { places?: GooglePlace[] }
    let restaurants = (data.places ?? []).map(mapToRestaurant)

    // Client-side openNow filter
    if (openNow) {
      const openPlaces = (data.places ?? []).filter(
        (p) => p.currentOpeningHours?.openNow === true,
      )
      restaurants = openPlaces.map(mapToRestaurant)
    }

    return restaurants
  } catch (err) {
    console.error('[places] search network error:', err)
    return []
  }
}

// ─── 2. getPlaceDetails ──────────────────────

/**
 * Fetch full details for a single place by its Google Place ID.
 * Returns a `Restaurant` or `null` if the request fails.
 */
export async function getPlaceDetails(
  googlePlaceId: string,
): Promise<Restaurant | null> {
  try {
    const res = await fetch(`${BASE_URL}/${googlePlaceId}`, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': DETAIL_FIELD_MASK,
      },
    })

    if (!res.ok) {
      const errorBody = await res.text()
      console.error(
        `[places] getPlaceDetails failed (${res.status}):`,
        errorBody,
      )
      return null
    }

    const place = (await res.json()) as GooglePlace
    return mapToRestaurant(place)
  } catch (err) {
    console.error('[places] getPlaceDetails network error:', err)
    return null
  }
}

// ─── 3. getPhotoUrl ──────────────────────────

/**
 * Build the photo media URL for a given photo resource name.
 * @param photoName  e.g. "places/ChIJ.../photos/abc123"
 * @param maxWidth   max width in px (default 800)
 * @returns Photo URL or empty string if invalid
 */
export function getPhotoUrl(photoName: string, maxWidth = 800): string {
  // Validate photo name format
  if (!photoName || !photoName.startsWith('places/')) {
    console.warn('[places] Invalid photo name format:', photoName)
    return ''
  }

  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`
}

// ─── 4. cacheRestaurantToSupabase ────────────

/**
 * Upsert a restaurant into the Supabase `restaurants` table.
 * On conflict with `google_place_id`, only name, rating, and photos are updated.
 */
export async function cacheRestaurantToSupabase(
  restaurant: Restaurant,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('restaurants')
      .upsert(restaurant as any, {
        onConflict: 'google_place_id',
        ignoreDuplicates: false,
      })

    if (error) {
      console.error('[places] cacheRestaurantToSupabase error:', error.message)
    }
  } catch (err) {
    console.error('[places] cacheRestaurantToSupabase network error:', err)
  }
}

// ─── 5. searchAllCuisineRestaurants ──────────

const ALL_CUISINE_KEYWORDS = [
  'Malaysian',
  'Chinese',
  'Japanese',
  'Korean',
  'Western',
  'Indian',
  'Thai',
]

/**
 * Fetch restaurants across ALL cuisine categories in parallel.
 * Each cuisine gets its own Text Search call (maxResults per cuisine).
 * Results are deduplicated by google_place_id and shuffled for diversity.
 */
export async function searchAllCuisineRestaurants(
  params: Omit<NearbySearchParams, 'cuisineKeyword'>,
): Promise<Restaurant[]> {
  const perCuisine = 5 // results per cuisine category

  // Fire one request per cuisine + one generic nearby request
  const promises = ALL_CUISINE_KEYWORDS.map((cuisine) =>
    searchNearbyRestaurants({
      ...params,
      cuisineKeyword: cuisine,
      maxResults: perCuisine,
    }),
  )
  // Also include a generic nearby search for broader coverage
  promises.push(
    searchNearbyRestaurants({ ...params, maxResults: 10 }),
  )

  const settled = await Promise.allSettled(promises)

  // Combine all successful results, deduplicating by google_place_id
  const seen = new Set<string>()
  const all: Restaurant[] = []

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      for (const r of result.value) {
        if (!seen.has(r.google_place_id)) {
          seen.add(r.google_place_id)
          all.push(r)
        }
      }
    }
  }

  // Shuffle for visual diversity (Fisher-Yates)
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }

  return all
}
