import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from '@/hooks/useLocation'
import { useDebounce } from '@/hooks/useDebounce'
import {
  searchNearbyRestaurants,
  searchAllCuisineRestaurants,
  cacheRestaurantToSupabase,
} from '@/lib/places'
import type { Restaurant } from '@/types'

/* ──────────────────────────────────────────────
   useNearbySearch — discovery feed data hook
   Calls Google Places Nearby Search, then caches
   every result into Supabase for offline access.
   ────────────────────────────────────────────── */

// ─── Filter shape consumed by the FilterBar ──

export interface FilterState {
  cuisine?: string
  priceRange?: number[]
  distanceKm: number
  openNow: boolean
}

// ─── Return type ─────────────────────────────

export interface NearbySearchResult {
  restaurants: Restaurant[]
  loading: boolean
  error: string | null
  refetch: () => void
}

// ─── Hook ────────────────────────────────────

export function useNearbySearch(filters: FilterState): NearbySearchResult {
  const { lat, lng, loading: locLoading } = useLocation()

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce the entire filter object (serialised) to avoid rapid API calls
  const debouncedFilters = useDebounce(filters, 400)

  // Track latest fetch to discard stale responses
  const fetchIdRef = useRef(0)

  const doFetch = useCallback(async () => {
    // Need location before we can search
    if (lat === null || lng === null) return

    const fetchId = ++fetchIdRef.current
    setLoading(true)
    setError(null)

    try {
      const isAllCategory = !debouncedFilters.cuisine

      const results = isAllCategory
        ? await searchAllCuisineRestaurants({
            lat,
            lng,
            radiusMeters: debouncedFilters.distanceKm * 1000,
            priceLevels: debouncedFilters.priceRange,
            openNow: debouncedFilters.openNow,
          })
        : await searchNearbyRestaurants({
            lat,
            lng,
            radiusMeters: debouncedFilters.distanceKm * 1000,
            cuisineKeyword: debouncedFilters.cuisine,
            priceLevels: debouncedFilters.priceRange,
            openNow: debouncedFilters.openNow,
          })

      // Stale response guard
      if (fetchId !== fetchIdRef.current) return

      setRestaurants(results)

      // Fire-and-forget: cache every result into Supabase
      results.forEach((r) => {
        cacheRestaurantToSupabase(r).catch(() => {
          /* silently swallow — caching is best-effort */
        })
      })
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return
      const message =
        err instanceof Error ? err.message : 'Failed to fetch restaurants'
      console.error('[useNearbySearch]', message)
      setError(message)
      setRestaurants([])
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false)
      }
    }
  }, [lat, lng, debouncedFilters])

  // Re-fetch whenever location resolves or debounced filters change
  useEffect(() => {
    if (!locLoading) {
      doFetch()
    }
  }, [locLoading, doFetch])

  return { restaurants, loading: loading || locLoading, error, refetch: doFetch }
}
