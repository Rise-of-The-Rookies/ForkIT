/* ──────────────────────────────────────────────
   useSearch — Search hook for ForkIt discovery
   Manages query state, debounced suggestions,
   full search execution, and search history.
   ────────────────────────────────────────────── */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { useLocation } from '@/hooks/useLocation'
import {
  searchRestaurants,
  getSuggestionsForQuery,
  saveSearchHistory,
  getSearchHistory,
  deleteSearchHistoryItem,
} from '@/lib/search'
import type { SearchResult, SearchSuggestions } from '@/lib/search'
import type { SearchHistory } from '@/types'
import { supabase } from '@/lib/supabase'

// ─── Hook ────────────────────────────────────

export function useSearch() {
  const { lat, lng } = useLocation()

  // ── State ──────────────────────────────────
  const [query, setQueryRaw] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({
    restaurants: [],
    dishes: [],
    cuisines: [],
    areas: [],
  })
  const [loading, setLoading] = useState(false)
  const [recentHistory, setRecentHistory] = useState<SearchHistory[]>([])

  // Debounce query for suggestions (300ms)
  const debouncedQuery = useDebounce(query, 300)

  // Track latest fetch to discard stale responses
  const suggestionsIdRef = useRef(0)
  const searchIdRef = useRef(0)

  // ── Fetch search history on mount ──────────

  useEffect(() => {
    async function loadHistory() {
      const { data: session } = await supabase.auth.getSession()
      const userId = session?.session?.user?.id
      if (!userId) return

      const history = await getSearchHistory(userId)
      setRecentHistory(history)
    }
    loadHistory()
  }, [])

  // ── Live suggestions (fires on debounced query) ──

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.trim().length < 2) {
      setSuggestions({ restaurants: [], dishes: [], cuisines: [], areas: [] })
      return
    }

    const id = ++suggestionsIdRef.current

    getSuggestionsForQuery(debouncedQuery).then((result) => {
      // Discard stale response
      if (id !== suggestionsIdRef.current) return
      setSuggestions(result)
    })
  }, [debouncedQuery])

  // ── setQuery (public) ──────────────────────

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q)
  }, [])

  // ── search (full search + save history) ────

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return
      if (lat === null || lng === null) {
        console.warn('[useSearch] No location available, using defaults')
      }

      const id = ++searchIdRef.current
      setLoading(true)

      try {
        const searchResults = await searchRestaurants({
          query: searchQuery,
          userLat: lat ?? 3.139, // KL default
          userLng: lng ?? 101.6869,
          distanceKm: 15,
          limit: 30,
        })

        // Discard stale response
        if (id !== searchIdRef.current) return

        setResults(searchResults)

        // Save to history (fire-and-forget)
        const { data: session } = await supabase.auth.getSession()
        const userId = session?.session?.user?.id
        if (userId) {
          await saveSearchHistory(userId, searchQuery, searchResults.length)
          // Refresh history
          const history = await getSearchHistory(userId)
          setRecentHistory(history)
        }
      } catch (err) {
        console.error('[useSearch] search error:', err)
        if (id === searchIdRef.current) {
          setResults([])
        }
      } finally {
        if (id === searchIdRef.current) {
          setLoading(false)
        }
      }
    },
    [lat, lng],
  )

  // ── deleteHistory ──────────────────────────

  const deleteHistory = useCallback(async (id: string) => {
    await deleteSearchHistoryItem(id)
    setRecentHistory((prev) => prev.filter((h) => h.id !== id))
  }, [])

  // ── clearQuery ─────────────────────────────

  const clearQuery = useCallback(() => {
    setQueryRaw('')
    setResults([])
    setSuggestions({ restaurants: [], dishes: [], cuisines: [], areas: [] })
  }, [])

  return {
    query,
    setQuery,
    suggestions,
    results,
    loading,
    recentHistory,
    search,
    deleteHistory,
    clearQuery,
  }
}
