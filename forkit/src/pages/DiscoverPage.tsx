import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/userStore'
import { useNearbySearch } from '@/features/discovery/useNearbySearch'
import { useRestaurants } from '@/features/discovery/useRestaurants'
import type { FilterState } from '@/features/discovery/useNearbySearch'
import FilterBar from '@/features/discovery/FilterBar'
import RestaurantCard from '@/features/discovery/RestaurantCard'
import MapView from '@/features/discovery/MapView'

/* ──────────────────────────────────────────────
   DiscoverPage — main discovery feed + map
   ────────────────────────────────────────────── */

type ViewMode = 'list' | 'map'

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
  const { sorted, savedPlaceIds, toggleSave } = useRestaurants(restaurants)

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

      {/* ═══════ Sticky filter bar ═══════ */}
      <div className="discover-page__filters">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

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
                sorted.map((r, i) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    index={i}
                    isSaved={savedPlaceIds.has(r.id)}
                    onSave={() => toggleSave(r.id)}
                    trending={r.rating >= 4.5}
                  />
                ))}
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
              <MapView restaurants={sorted} savedPlaceIds={savedPlaceIds} />
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
