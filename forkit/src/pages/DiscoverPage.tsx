import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/userStore'
import { useNearbySearch } from '@/features/discovery/useNearbySearch'
import { useRestaurants } from '@/features/discovery/useRestaurants'
import type { FilterState } from '@/features/discovery/useNearbySearch'
import { searchViewportRestaurants } from '@/lib/places'
import FilterBar from '@/features/discovery/FilterBar'
import RestaurantCard from '@/features/discovery/RestaurantCard'
import MapView from '@/features/discovery/MapView'
import { useTrendingIds } from '@/features/trending/useTrendingIds'
import type { Restaurant } from '@/types'
import SearchBar from '@/components/SearchBar'

/* ──────────────────────────────────────────────
   DiscoverPage — main discovery feed + map
   ────────────────────────────────────────────── */

type ViewMode = 'list' | 'map'
const PAGE_SIZE = 6

export default function DiscoverPage() {
  const navigate = useNavigate()
  const user = useUserStore((s) => s.user)
  const preferences = useUserStore((s) => s.preferences)

  // ── Default filters from user prefs ──
  const defaultFilters = useMemo<FilterState>(
    () => ({
      cuisine: preferences?.cuisine_tags?.[0] ?? undefined,
      distanceKm: user?.distance_pref
        ? Math.round(user.distance_pref)
        : 5,
      openNow: false,
    }),
    [user, preferences],
  )

  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  // ── Infinite scroll state ──
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // ── Auto-apply distance preference when it loads asynchronously ──
  useEffect(() => {
    if (user?.distance_pref) {
      setFilters((prev) => ({
        ...prev,
        distanceKm: Math.round(user.distance_pref!),
      }))
    }
  }, [user?.distance_pref])

  // ── Data hooks ──
  const { restaurants, loading, error, refetch } = useNearbySearch(filters)
  const trendingIds = useTrendingIds()

  // ── Viewport discovery: extra restaurants found when panning the map ──
  const [viewportExtras, setViewportExtras] = useState<Restaurant[]>([])
  const viewportSeenRef = useRef<Set<string>>(new Set())

  // Merge original results + viewport discoveries (dedup by google_place_id)
  const allRestaurants = useMemo(() => {
    const seen = new Set(restaurants.map((r) => r.google_place_id))
    const extras = viewportExtras.filter((r) => !seen.has(r.google_place_id))
    return [...restaurants, ...extras]
  }, [restaurants, viewportExtras])

  const { sorted, savedPlaceIds, toggleSave } = useRestaurants(allRestaurants)

  // Clear viewport extras when filters change (results will differ)
  useEffect(() => {
    setViewportExtras([])
    viewportSeenRef.current.clear()
  }, [filters])

  const handleViewportDiscover = useCallback(
    async (lat: number, lng: number) => {
      // Grid key to avoid re-fetching the same viewport area
      const key = `${lat.toFixed(3)}_${lng.toFixed(3)}`
      if (viewportSeenRef.current.has(key)) return
      viewportSeenRef.current.add(key)

      try {
        // Fire all type-group searches in parallel for broad coverage
        const results = await searchViewportRestaurants({
          lat,
          lng,
          radiusMeters: filters.distanceKm * 1000,
          priceLevels: filters.priceRange,
          openNow: filters.openNow,
        })
        if (results.length > 0) {
          setViewportExtras((prev) => [...prev, ...results])
        }
      } catch {
        // Silently swallow — viewport discovery is best-effort
      }
    },
    [filters],
  )

  // ── Reset display count when data changes ──
  useEffect(() => {
    setDisplayCount(PAGE_SIZE)
  }, [sorted.length])

  // ── Infinite scroll observer ──
  const loadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, sorted.length))
  }, [sorted.length])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  const visibleRestaurants = sorted.slice(0, displayCount)
  const hasMore = displayCount < sorted.length

  return (
    <div className="discover-page">
      {/* ═══════ Top bar ═══════ */}
      <header className="discover-page__header">
        <div className="discover-page__brand">
          <span className="discover-page__logo">Fork<span className="discover-page__logo-accent">It</span></span>
          <span className="discover-page__logo-icon">🍴</span>
        </div>

        <div className="discover-page__actions">
          {/* Group room button */}
          <button
            className="discover-page__icon-btn"
            onClick={() => navigate('/group')}
            aria-label="Group Room"
          >
            👥
          </button>

          {/* List / Map toggle */}
          <div className="discover-page__view-toggle">
            <button
              className={`discover-page__toggle-btn ${viewMode === 'list' ? 'discover-page__toggle-btn--active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <ListIcon />
            </button>
            <button
              className={`discover-page__toggle-btn ${viewMode === 'map' ? 'discover-page__toggle-btn--active' : ''}`}
              onClick={() => setViewMode('map')}
              aria-label="Map view"
            >
              <MapIcon />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════ Search bar ═══════ */}
      <div style={{ padding: '0 20px 4px' }}>
        <SearchBar />
      </div>

      {/* ═══════ Sticky filter bar ═══════ */}
      <div className="discover-page__filters">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* ═══════ Ask Forky banner ═══════ */}
      <motion.div
        className="discover-page__forky-banner"
        onClick={() => navigate('/forky')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{
          background: 'linear-gradient(135deg, rgba(255,77,0,0.08), rgba(255,77,0,0.03))',
          border: '1px solid rgba(255,77,0,0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          marginLeft: '16px',
          marginRight: '16px',
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🤖</span>
          <span style={{ color: 'var(--text-secondary, #999)' }}>Not sure what to eat?</span>
        </span>
        <span style={{ color: '#FF4D00', fontWeight: 700, fontSize: '13px' }}>
          Ask Forky →
        </span>
      </motion.div>

      {/* ═══════ Content area ═══════ */}
      <div className="discover-page__content">
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="discover-page__feed"
            >
              {/* Loading skeletons */}
              {loading && (
                <div className="discover-page__skeletons">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="discover-page__skeleton" />
                  ))}
                </div>
              )}

              {/* Error state */}
              {!loading && error && (
                <div className="discover-page__empty">
                  <span className="discover-page__empty-icon">⚠️</span>
                  <p className="discover-page__empty-title">Something went wrong</p>
                  <p className="discover-page__empty-sub">{error}</p>
                  <button className="discover-page__retry-btn" onClick={refetch}>
                    Try Again
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && sorted.length === 0 && (
                <div className="discover-page__empty">
                  <span className="discover-page__empty-icon">🍽️</span>
                  <p className="discover-page__empty-title">No restaurants found nearby</p>
                  <p className="discover-page__empty-sub">
                    Try adjusting your filters or expanding the distance range.
                  </p>
                  <button className="discover-page__retry-btn" onClick={() => setFilters({ ...filters, distanceKm: 10 })}>
                    Expand Search
                  </button>
                </div>
              )}

              {/* Restaurant cards */}
              {!loading &&
                visibleRestaurants.map((r, i) => (
                  <RestaurantCard
                    key={r.google_place_id}
                    restaurant={r}
                    index={i}
                    isSaved={savedPlaceIds.has(r.id)}
                    onSave={() => toggleSave(r.id)}
                    trending={trendingIds.has(r.id)}
                  />
                ))}

              {/* Infinite scroll sentinel */}
              {hasMore && !loading && sorted.length > 0 && (
                <div ref={sentinelRef} className="discover-page__load-more">
                  <div className="discover-page__load-more-spinner" />
                  <span>Loading more places…</span>
                </div>
              )}

              {/* End of list */}
              {!hasMore && sorted.length > 0 && !loading && (
                <div className="discover-page__end-of-list">
                  <span className="discover-page__end-icon">🍴</span>
                  <p>You've explored all {sorted.length} places nearby</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="discover-page__map-wrapper"
            >
              <MapView restaurants={sorted} savedPlaceIds={savedPlaceIds} onViewportDiscover={handleViewportDiscover} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════ Forky FAB ═══════ */}
      <motion.button
        className="discover-page__forky-fab"
        onClick={() => navigate('/forky')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.6 }}
        aria-label="Ask Forky"
      >
        <span className="discover-page__forky-emoji">🍴</span>
        <span className="discover-page__forky-pulse" />
      </motion.button>
    </div>
  )
}

/* ── Inline SVG icons ─────────────────────────── */

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  )
}
