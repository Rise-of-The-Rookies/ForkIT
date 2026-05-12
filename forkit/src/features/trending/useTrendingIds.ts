import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/* ──────────────────────────────────────────────
   useTrendingIds — fetches the set of restaurant IDs
   that have an entry in trending_scores.
   A restaurant is considered "trending" if its
   score_daily > 0 (i.e. it was scored by the pipeline).
   ────────────────────────────────────────────── */

export function useTrendingIds(region = 'KL') {
  const [trendingIds, setTrendingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      const { data, error } = await supabase
        .from('trending_scores')
        .select('restaurant_id')
        .eq('region', region)
        .gt('score_daily', 0)

      if (error) {
        console.error('[useTrendingIds]', error.message)
        return
      }

      if (!cancelled && data) {
        setTrendingIds(
          new Set((data as { restaurant_id: string }[]).map((r) => r.restaurant_id)),
        )
      }
    }

    fetch()
    return () => {
      cancelled = true
    }
  }, [region])

  return trendingIds
}
