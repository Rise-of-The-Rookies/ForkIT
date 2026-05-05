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
  return {
    id: crypto.randomUUID(),
    google_place_id: place.id,
    name: place.displayName?.text ?? 'Unknown',
    cuisine: deriveCuisine(place.types ?? [], place.primaryType),
    lat: place.location?.latitude ?? 0,
    lng: place.location?.longitude ?? 0,
    price_range: PRICE_LEVEL_REVERSE[place.priceLevel ?? ''] ?? 2,
    rating: place.rating ?? 0,
    photos: (place.photos ?? []).map((p) => getPhotoUrl(p.name)),
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
  priceLevel?: 1 | 2 | 3 | 4
  openNow?: boolean
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
    priceLevel,
    openNow,
  } = params

  // Build request body per the Places (New) API spec
  const body: Record<string, unknown> = {
    includedTypes: ['restaurant'],
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusMeters,
      },
    },
    maxResultCount: 20,
  }

  // Optional: keyword text query (e.g. "Japanese", "Mamak")
  if (cuisineKeyword) {
    body.textQuery = cuisineKeyword
  }

  // Optional: price-level filter (array of price-level strings)
  if (priceLevel) {
    body.priceLevels = [PRICE_LEVEL_MAP[priceLevel]]
  }

  // Optional: restrict to currently-open places
  // The Nearby Search (New) doesn't have a direct openNow body param —
  // we'll filter client-side after fetch if needed.

  try {
    const res = await fetch(`${BASE_URL}:searchNearby`, {
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
        `[places] searchNearby failed (${res.status}):`,
        errorBody,
      )
      return []
    }

    const data = (await res.json()) as { places?: GooglePlace[] }
    let restaurants = (data.places ?? []).map(mapToRestaurant)

    // Client-side openNow filter (since Nearby Search New doesn't support it natively in the body)
    if (openNow) {
      const openPlaces = (data.places ?? []).filter(
        (p) => p.currentOpeningHours?.openNow === true,
      )
      restaurants = openPlaces.map(mapToRestaurant)
    }

    return restaurants
  } catch (err) {
    console.error('[places] searchNearby network error:', err)
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
 */
export function getPhotoUrl(photoName: string, maxWidth = 800): string {
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
      .upsert(
        {
          google_place_id: restaurant.google_place_id,
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          lat: restaurant.lat,
          lng: restaurant.lng,
          price_range: restaurant.price_range,
          rating: restaurant.rating,
          photos: restaurant.photos,
        },
        {
          onConflict: 'google_place_id',
          ignoreDuplicates: false,
        },
      )

    if (error) {
      console.error('[places] cacheRestaurantToSupabase error:', error.message)
    }
  } catch (err) {
    console.error('[places] cacheRestaurantToSupabase network error:', err)
  }
}
