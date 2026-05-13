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

   Cost-management features:
   1. 200 m movement threshold — skip re-fetch if
      user hasn't moved far enough.
   2. 100 m location-grid cache (10-min TTL) —
      reuse recent results for the same grid cell.
   3. Cache invalidation on filter / radius change.
   ────────────────────────────────────────────── */

// ─── Constants ───────────────────────────────

const MOVEMENT_THRESHOLD_M = 200
const CACHE_TTL_MS = 600_000 // 10 minutes
const EARTH_RADIUS_M = 6_371_000

// Module-level dedup set — persists for the browser session, resets on reload
const savedPlaceIds = new Set<string>()

// ─── Haversine helper ────────────────────────

function haversineMetres(
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
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a))
}

// ─── Grid-cache types ────────────────────────

interface CacheEntry {
  results: Restaurant[]
  fetchedAt: number // Date.now()
}

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
  /** true when the last results came from the local grid cache */
  cacheHit: boolean
}

// ─── Hook ────────────────────────────────────

export function useNearbySearch(filters: FilterState): NearbySearchResult {
  const { lat, lng, loading: locLoading } = useLocation()

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cacheHit, setCacheHit] = useState(false)

  // Debounce the entire filter object (serialised) to avoid rapid API calls
  const debouncedFilters = useDebounce(filters, 400)

  // Track latest fetch to discard stale responses
  const fetchIdRef = useRef(0)

  // ── Movement threshold ref ──────────────────
  const lastFetchPosRef = useRef<{ lat: number; lng: number } | null>(null)

  // ── Grid cache ref ──────────────────────────
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map())

  // ── Previous filter/radius refs for invalidation ──
  const prevFiltersRef = useRef<{
    cuisine?: string
    priceRange?: number[]
    openNow: boolean
    distanceKm: number
  } | null>(null)

  // ── Cache invalidation on filter / radius change ──
  useEffect(() => {
    const prev = prevFiltersRef.current
    if (prev === null) {
      // First render — just record filters, no invalidation needed
      prevFiltersRef.current = {
        cuisine: debouncedFilters.cuisine,
        priceRange: debouncedFilters.priceRange,
        openNow: debouncedFilters.openNow,
        distanceKm: debouncedFilters.distanceKm,
      }
      return
    }

    const radiusChanged = prev.distanceKm !== debouncedFilters.distanceKm
    const filtersChanged =
      prev.cuisine !== debouncedFilters.cuisine ||
      prev.openNow !== debouncedFilters.openNow ||
      JSON.stringify(prev.priceRange) !==
        JSON.stringify(debouncedFilters.priceRange)

    if (radiusChanged) {
      // Different radius → entire cache is invalid
      cacheRef.current.clear()
    } else if (filtersChanged) {
      // Filters changed → clear cache (results differ per filter combo)
      cacheRef.current.clear()
    }

    prevFiltersRef.current = {
      cuisine: debouncedFilters.cuisine,
      priceRange: debouncedFilters.priceRange,
      openNow: debouncedFilters.openNow,
      distanceKm: debouncedFilters.distanceKm,
    }
  }, [debouncedFilters])

  // ── Build a grid key (≈ 100 m cells) ────────
  function gridKey(lat: number, lng: number, radiusKm: number): string {
    return `${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusKm}`
  }

  const doFetch = useCallback(
    async (forceRefresh = false) => {
      // Need location before we can search
      if (lat === null || lng === null) return

      // ── Movement threshold check ────────────
      if (!forceRefresh && lastFetchPosRef.current) {
        const dist = haversineMetres(
          lastFetchPosRef.current.lat,
          lastFetchPosRef.current.lng,
          lat,
          lng,
        )
        if (dist < MOVEMENT_THRESHOLD_M) {
          // Haven't moved far enough — check grid cache for current cell
          const key = gridKey(lat, lng, debouncedFilters.distanceKm)
          const cached = cacheRef.current.get(key)
          if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
            setRestaurants(cached.results)
            setCacheHit(true)
            setLoading(false)
            return
          }
          // No valid cache but within threshold and no force → still skip
          // (keep existing results visible)
          return
        }
      }

      // ── Grid cache check ────────────────────
      const key = gridKey(lat, lng, debouncedFilters.distanceKm)
      if (!forceRefresh) {
        const cached = cacheRef.current.get(key)
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
          setRestaurants(cached.results)
          setCacheHit(true)
          setLoading(false)
          // Still update lastFetchPos so threshold logic is anchored correctly
          lastFetchPosRef.current = { lat, lng }
          return
        }
      }

      // ── Perform Google Places API call ──────
      const fetchId = ++fetchIdRef.current
      setLoading(true)
      setError(null)
      setCacheHit(false)

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

        // Update movement-threshold anchor
        lastFetchPosRef.current = { lat, lng }

        // Store in grid cache
        cacheRef.current.set(key, {
          results,
          fetchedAt: Date.now(),
        })

        // Fire-and-forget: background-save new restaurants to Supabase
        for (const r of results) {
          if (r.google_place_id && !savedPlaceIds.has(r.google_place_id)) {
            savedPlaceIds.add(r.google_place_id)
            void cacheRestaurantToSupabase(r).catch(() => {/* swallow */})
          }
        }
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
    },
    [lat, lng, debouncedFilters],
  )

  // Re-fetch whenever location resolves or debounced filters change
  useEffect(() => {
    if (!locLoading) {
      doFetch()
    }
  }, [locLoading, doFetch])

  // Public refetch always forces a fresh API call
  const refetch = useCallback(() => doFetch(true), [doFetch])

  return {
    restaurants,
    loading: loading || locLoading,
    error,
    refetch,
    cacheHit,
  }
}
