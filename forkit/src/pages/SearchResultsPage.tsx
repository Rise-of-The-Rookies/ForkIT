import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { searchRestaurants, searchDishes, saveSearchHistory } from '@/lib/search'
import type { SearchResult } from '@/lib/search'
import { useLocation } from '@/hooks/useLocation'
import { useRestaurants } from '@/features/discovery/useRestaurants'
import { useTrendingIds } from '@/features/trending/useTrendingIds'
import RestaurantCard from '@/features/discovery/RestaurantCard'
import MapView from '@/features/discovery/MapView'
import FilterBar from '@/features/discovery/FilterBar'
import type { FilterState } from '@/features/discovery/useNearbySearch'
import type { Dish } from '@/types'
import { supabase } from '@/lib/supabase'

/* ──────────────────────────────────────────────
   SearchResultsPage — /search?q={query}
   ────────────────────────────────────────────── */

type ViewMode = 'list' | 'grouped' | 'map'
type SortMode = 'relevant' | 'closest' | 'trending' | 'rated'

export default function SearchResultsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryParam = searchParams.get('q') ?? ''

  const { lat, lng } = useLocation()
  const trendingIds = useTrendingIds()

  // ── State ──
  const [results, setResults] = useState<SearchResult[]>([])
  const [dishResults, setDishResults] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortBy, setSortBy] = useState<SortMode>('relevant')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    distanceKm: 15,
    openNow: false,
  })

  const fetchIdRef = useRef(0)

  // ── Fetch results ──
  const doSearch = useCallback(async () => {
    if (!queryParam.trim()) return

    const id = ++fetchIdRef.current
    setLoading(true)

    try {
      const [restaurantRes, dishRes] = await Promise.allSettled([
        searchRestaurants({
          query: queryParam,
          userLat: lat ?? 3.139,
          userLng: lng ?? 101.6869,
          distanceKm: filters.distanceKm,
          cuisine: filters.cuisine,
          priceRange: filters.priceRange,
          openNow: filters.openNow ? true : undefined,
          sortBy,
          limit: 50,
        }),
        searchDishes(queryParam, 20),
      ])

      if (id !== fetchIdRef.current) return

      setResults(
        restaurantRes.status === 'fulfilled' ? restaurantRes.value : [],
      )
      setDishResults(
        dishRes.status === 'fulfilled' ? dishRes.value : [],
      )
    } catch (err) {
      console.error('[SearchResultsPage] search error:', err)
      if (id === fetchIdRef.current) {
        setResults([])
        setDishResults([])
      }
    } finally {
      if (id === fetchIdRef.current) setLoading(false)
    }
  }, [queryParam, lat, lng, filters, sortBy])

  useEffect(() => {
    doSearch()
  }, [doSearch])

  // ── Restaurant array for hooks ──
  const restaurants = useMemo(
    () => results.map((r) => r.restaurant),
    [results],
  )
  const { sorted, savedPlaceIds, toggleSave } = useRestaurants(restaurants)

  // ── Handle restaurant tap: save tapped_result ──
  const handleRestaurantTap = useCallback(
    async (googlePlaceId: string, restaurantId: string) => {
      // Save tapped result to search history
      const { data: session } = await supabase.auth.getSession()
      const userId = session?.session?.user?.id
      if (userId) {
        void saveSearchHistory(userId, queryParam, results.length, restaurantId)
      }
      navigate(`/restaurant/${googlePlaceId}`)
    },
    [queryParam, results.length, navigate],
  )

  // ── Navigate to search overlay ──
  const openSearchOverlay = () => navigate('/discover')

  const isEmpty = !loading && results.length === 0 && dishResults.length === 0

  return (
    <div className="search-results">
      {/* ═══════ Header ═══════ */}
      <div className="search-results__header">
        <button
          className="search-results__back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ChevronLeftIcon />
        </button>

        <button
          className="search-results__search-btn"
          onClick={openSearchOverlay}
        >
          <SearchIcon />
          <span className="search-results__search-text">{queryParam}</span>
        </button>

        <button
          className="search-results__filter-btn"
          onClick={() => setShowFilters((p) => !p)}
          aria-label="Filters"
        >
          <FilterIcon />
        </button>
      </div>

      {/* ═══════ Filter panel (collapsible) ═══════ */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="search-results__filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="search-results__filter-inner">
              <FilterBar filters={filters} onChange={setFilters} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ Controls: tabs + sort ═══════ */}
      <div className="search-results__controls">
        <div className="search-results__tabs">
          {(['list', 'grouped', 'map'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              className={`search-results__tab ${viewMode === mode ? 'search-results__tab--active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {mode === 'list' && '📋'}
              {mode === 'grouped' && '🗂'}
              {mode === 'map' && '🗺'}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        <div className="search-results__sort">
          <select
            className="search-results__sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortMode)}
          >
            <option value="relevant">Most Relevant</option>
            <option value="closest">Closest</option>
            <option value="trending">Trending</option>
            <option value="rated">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* ═══════ Content ═══════ */}
      <div className="search-results__content">
        {/* Loading */}
        {loading && (
          <div className="search-results__skeletons">
            {[0, 1, 2].map((i) => (
              <div key={i} className="search-results__skeleton-card" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="search-results__empty">
            <span className="search-results__empty-icon">🔍</span>
            <p className="search-results__empty-title">
              No results for &lsquo;{queryParam}&rsquo;
            </p>
            <p className="search-results__empty-sub">
              Try different keywords or adjust your filters.
            </p>
            <motion.button
              onClick={() => navigate('/forky')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                borderRadius: '100px',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Try asking Forky →
            </motion.button>
          </div>
        )}

        {/* ── List view ── */}
        {!loading && viewMode === 'list' && results.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="search-results__count">
                <strong>{results.length}</strong> restaurant
                {results.length !== 1 ? 's' : ''} found
              </div>
              <div className="search-results__feed">
                {sorted.map((r, i) => (
                  <RestaurantCard
                    key={r.google_place_id}
                    restaurant={r}
                    index={i}
                    isSaved={savedPlaceIds.has(r.id)}
                    onSave={() => toggleSave(r.id)}
                    onClick={() => handleRestaurantTap(r.google_place_id, r.id)}
                    trending={trendingIds.has(r.id)}
                  />
                ))}
              </div>

              {/* Forky handoff when results < 3 */}
              {results.length < 3 && (
                <motion.div
                  className="search-results__forky-banner"
                  onClick={() => navigate('/forky')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="search-results__forky-text">
                    <span style={{ fontSize: '18px' }}>🍴</span>
                    This sounds like a Forky question
                  </span>
                  <span className="search-results__forky-cta">
                    Ask Forky →
                  </span>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Grouped view ── */}
        {!loading && viewMode === 'grouped' && (results.length > 0 || dishResults.length > 0) && (
          <AnimatePresence mode="wait">
            <motion.div
              key="grouped"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Restaurants group */}
              {results.length > 0 && (
                <div className="search-results__group">
                  <div className="search-results__group-title">
                    🏪 Restaurants
                    <span className="search-results__group-count">
                      ({results.length})
                    </span>
                  </div>
                  <div className="search-results__feed">
                    {sorted.map((r, i) => (
                      <RestaurantCard
                        key={r.google_place_id}
                        restaurant={r}
                        index={i}
                        isSaved={savedPlaceIds.has(r.id)}
                        onSave={() => toggleSave(r.id)}
                        onClick={() =>
                          handleRestaurantTap(r.google_place_id, r.id)
                        }
                        trending={trendingIds.has(r.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Dishes group */}
              {dishResults.length > 0 && (
                <div className="search-results__group">
                  <div className="search-results__group-title">
                    🍔 Dishes
                    <span className="search-results__group-count">
                      ({dishResults.length})
                    </span>
                  </div>
                  <div className="search-results__feed">
                    {dishResults.map((d) => (
                      <div key={d.id} className="search-results__dish">
                        <span className="search-results__dish-icon">🍽️</span>
                        <div className="search-results__dish-info">
                          <div className="search-results__dish-name">
                            {d.name}
                          </div>
                          {d.description && (
                            <div className="search-results__dish-desc">
                              {d.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Map view ── */}
        {!loading && viewMode === 'map' && results.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="search-results__map"
            >
              <MapView restaurants={sorted} savedPlaceIds={savedPlaceIds} />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

/* ── Inline SVG icons ─────────────────────────── */

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted, #666)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}
