import { useState, useEffect, useMemo, useCallback } from 'react'
import { useUserStore } from '@/store/userStore'
import { useAuthStore } from '@/features/auth/authStore'
import { supabase } from '@/lib/supabase'
import type { Restaurant } from '@/types'

/* ──────────────────────────────────────────────
   useRestaurants — personalised sort + saved places
   Takes the raw list from useNearbySearch and
   applies rule-based scoring using user prefs.
   ────────────────────────────────────────────── */

// ─── Budget → price-range mapping ────────────
// Converts the user's budget_pref string to matching numeric price levels.

const BUDGET_PRICE_MAP: Record<string, Set<number>> = {
  low: new Set([1]),
  mid: new Set([2, 3]),
  high: new Set([3, 4]),
}

// ─── Scoring function ────────────────────────

function scoreRestaurant(
  restaurant: Restaurant,
  cuisineTags: string[],
  budgetPref: string | null,
): number {
  let score = 0

  // +3 if the restaurant's cuisine matches any of the user's preferred cuisines
  if (cuisineTags.length > 0) {
    const cuisineLower = restaurant.cuisine.toLowerCase()
    const matched = cuisineTags.some(
      (tag) =>
        cuisineLower.includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(cuisineLower),
    )
    if (matched) score += 3
  }

  // +1 if the restaurant has a high rating (≥ 4.2)
  if (restaurant.rating >= 4.2) score += 1

  // +1 if the price range matches the user's budget preference
  if (budgetPref && BUDGET_PRICE_MAP[budgetPref]) {
    if (BUDGET_PRICE_MAP[budgetPref].has(restaurant.price_range)) {
      score += 1
    }
  }

  return score
}

// ─── Return type ─────────────────────────────

export interface UseRestaurantsResult {
  sorted: Restaurant[]
  savedPlaceIds: Set<string>
  toggleSave: (restaurantId: string) => Promise<void>
}

// ─── Hook ────────────────────────────────────

export function useRestaurants(
  restaurants: Restaurant[],
): UseRestaurantsResult {
  const preferences = useUserStore((s) => s.preferences)
  const user = useUserStore((s) => s.user)
  const session = useAuthStore((s) => s.session)

  const userId = session?.user?.id ?? null

  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(new Set())

  // ── Fetch saved places on mount / when user changes ──
  useEffect(() => {
    if (!userId) {
      setSavedPlaceIds(new Set())
      return
    }

    let cancelled = false

    async function fetchSaved() {
      const { data, error } = await supabase
        .from('saved_places')
        .select('restaurant_id')
        .eq('user_id', userId!)

      if (error) {
        console.error('[useRestaurants] Failed to fetch saved places:', error.message)
        return
      }

      if (!cancelled && data) {
        setSavedPlaceIds(new Set(data.map((row) => row.restaurant_id)))
      }
    }

    fetchSaved()
    return () => {
      cancelled = true
    }
  }, [userId])

  // ── Personalised sort ──
  const sorted = useMemo(() => {
    const cuisineTags = preferences?.cuisine_tags ?? []
    const budgetPref = user?.budget_pref ?? null

    // Create scored copies and sort descending
    const scored = restaurants.map((r) => ({
      restaurant: r,
      score: scoreRestaurant(r, cuisineTags, budgetPref),
    }))

    scored.sort((a, b) => b.score - a.score)

    return scored.map((s) => s.restaurant)
  }, [restaurants, preferences, user])

  // ── Toggle save/unsave ──
  const toggleSave = useCallback(
    async (restaurantId: string) => {
      if (!userId) {
        console.warn('[useRestaurants] Cannot toggle save — no user session')
        return
      }

      const isSaved = savedPlaceIds.has(restaurantId)

      if (isSaved) {
        // ── Remove ──
        const { error } = await supabase
          .from('saved_places')
          .delete()
          .eq('user_id', userId)
          .eq('restaurant_id', restaurantId)

        if (error) {
          console.error('[useRestaurants] Failed to unsave:', error.message)
          return
        }

        setSavedPlaceIds((prev) => {
          const next = new Set(prev)
          next.delete(restaurantId)
          return next
        })
      } else {
        // ── Add ──
        const { error } = await supabase.from('saved_places').upsert(
          {
            user_id: userId,
            restaurant_id: restaurantId,
            geofence_active: false,
            visit_count: 0,
          },
          { onConflict: 'user_id,restaurant_id' },
        )

        if (error) {
          console.error('[useRestaurants] Failed to save:', error.message)
          return
        }

        setSavedPlaceIds((prev) => new Set(prev).add(restaurantId))
      }
    },
    [userId, savedPlaceIds],
  )

  return { sorted, savedPlaceIds, toggleSave }
}
