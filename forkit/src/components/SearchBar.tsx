import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '@/features/discovery/useSearch'
import { supabase } from '@/lib/supabase'

/* ──────────────────────────────────────────────
   SearchBar — full-screen overlay search with
   pre-search, live suggestions, camera tooltip
   ────────────────────────────────────────────── */

// Trending placeholder chips (Phase 3 will use real data)
const TRENDING_CHIPS = [
  '🔥 Nasi Lemak',
  '🔥 Mamak',
  '🔥 Korean BBQ',
  '🔥 Dim Sum',
  '🔥 Roti Canai',
  '🔥 Bubble Tea',
]

export default function SearchBar() {
  const navigate = useNavigate()
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Camera tooltip state (preserved from original)
  const [showTooltip, setShowTooltip] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    query,
    setQuery,
    suggestions,
    loading,
    recentHistory,
    search,
    deleteHistory,
    clearQuery,
  } = useSearch()

  // ── Camera tooltip handler ──
  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (timerRef.current) clearTimeout(timerRef.current)
    setShowTooltip(true)
    timerRef.current = setTimeout(() => setShowTooltip(false), 2000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // ── Focus the input when overlay opens ──
  useEffect(() => {
    if (focused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [focused])

  // ── Open overlay ──
  const openSearch = () => setFocused(true)

  // ── Close overlay ──
  const closeSearch = () => {
    setFocused(false)
    clearQuery()
  }

  // ── Execute search → navigate to results ──
  const handleSearch = useCallback(
    (q: string) => {
      if (!q.trim()) return
      search(q)
      setFocused(false)
      navigate(`/search?q=${encodeURIComponent(q.trim())}`)
    },
    [search, navigate],
  )

  // ── Delete all history ──
  const handleClearAllHistory = async () => {
    const { data: session } = await supabase.auth.getSession()
    const userId = session?.session?.user?.id
    if (!userId) return
    for (const h of recentHistory) {
      await deleteHistory(h.id)
    }
  }

  const hasQuery = query.trim().length > 0
  const hasSuggestions =
    suggestions.restaurants.length > 0 ||
    suggestions.dishes.length > 0 ||
    suggestions.cuisines.length > 0

  return (
    <>
      {/* ═══════ Collapsed bar (tap to open) ═══════ */}
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          onClick={openSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--surface-secondary, #1E1D1A)',
            borderRadius: '12px',
            padding: '10px 14px',
            cursor: 'pointer',
          }}
        >
          <SearchIcon />
          <span
            style={{
              flex: 1,
              color: 'var(--text-tertiary, #666)',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          >
            Search restaurants, cuisines...
          </span>

          {/* Camera icon */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleCameraClick}
              aria-label="Vision Search"
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.5,
                cursor: 'default',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.opacity = '0.5'
              }}
            >
              <CameraIcon />
            </button>
            {showTooltip && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: '#1E1D1A',
                  color: '#fff',
                  fontSize: '12px',
                  borderRadius: '9999px',
                  padding: '4px 12px',
                  whiteSpace: 'nowrap',
                  zIndex: 50,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  animation: 'tooltipFadeIn 0.2s ease',
                }}
              >
                Vision Search coming soon 👁️
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes tooltipFadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* ═══════ Full-screen overlay ═══════ */}
      <AnimatePresence>
        {focused && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Header with input ── */}
            <motion.div
              className="search-overlay__header"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <button
                className="search-overlay__back"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <ChevronLeftIcon />
              </button>

              <div className="search-overlay__input-wrap">
                <SearchIcon />
                <input
                  ref={inputRef}
                  type="text"
                  className="search-overlay__input"
                  placeholder="Search restaurants, dishes, cuisines..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch(query)
                  }}
                />
                {hasQuery && (
                  <button
                    className="search-overlay__clear"
                    onClick={() => clearQuery()}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>

            {/* ── Body ── */}
            <motion.div
              className="search-overlay__body"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
            >
              {!hasQuery ? (
                /* ═══════ Pre-search screen ═══════ */
                <div>
                  {/* Recent searches */}
                  {recentHistory.length > 0 && (
                    <div className="pre-search__section">
                      <div className="pre-search__heading">
                        <span className="pre-search__title">Recent</span>
                        <button
                          className="pre-search__clear-btn"
                          onClick={handleClearAllHistory}
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="pre-search__list">
                        {recentHistory.map((h) => (
                          <button
                            key={h.id}
                            className="pre-search__item"
                            onClick={() => {
                              setQuery(h.query)
                              handleSearch(h.query)
                            }}
                          >
                            <span className="pre-search__item-icon">🕐</span>
                            <span className="pre-search__item-text">
                              {h.query}
                            </span>
                            <span
                              className="pre-search__item-delete"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteHistory(h.id)
                              }}
                            >
                              ✕
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending searches */}
                  <div className="pre-search__section">
                    <div className="pre-search__heading">
                      <span className="pre-search__title">
                        🔥 Trending near you
                      </span>
                    </div>
                    <div className="pre-search__chips">
                      {TRENDING_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          className="pre-search__chip"
                          onClick={() => {
                            const q = chip.replace(/^🔥\s*/, '')
                            setQuery(q)
                            handleSearch(q)
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ═══════ Suggestions dropdown ═══════ */
                <div className="suggestions">
                  {loading && !hasSuggestions ? (
                    /* Skeleton loading */
                    <>
                      {['Dishes', 'Restaurants', 'Cuisines'].map((s) => (
                        <div key={s} className="suggestions__section">
                          <div className="suggestions__section-title">
                            {s}
                          </div>
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="suggestions__skeleton">
                              <div className="suggestions__skeleton-icon" />
                              <div className="suggestions__skeleton-text">
                                <div className="suggestions__skeleton-line suggestions__skeleton-line--long" />
                                <div className="suggestions__skeleton-line suggestions__skeleton-line--short" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {/* Dishes */}
                      {suggestions.dishes.length > 0 && (
                        <div className="suggestions__section">
                          <div className="suggestions__section-title">
                            🍔 Dishes
                          </div>
                          {suggestions.dishes.map((d) => (
                            <button
                              key={d.id}
                              className="suggestions__item"
                              onClick={() => {
                                setQuery(d.name)
                                handleSearch(d.name)
                              }}
                            >
                              <span className="suggestions__item-icon">
                                🍽️
                              </span>
                              <div className="suggestions__item-info">
                                <div className="suggestions__item-name">
                                  {d.name}
                                </div>
                                <div className="suggestions__item-label">
                                  Dish
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Restaurants */}
                      {suggestions.restaurants.length > 0 && (
                        <div className="suggestions__section">
                          <div className="suggestions__section-title">
                            🏪 Restaurants
                          </div>
                          {suggestions.restaurants.map((r) => (
                            <button
                              key={r.id}
                              className="suggestions__item"
                              onClick={() =>
                                navigate(
                                  `/restaurant/${r.google_place_id}`,
                                )
                              }
                            >
                              <span className="suggestions__item-icon">
                                📍
                              </span>
                              <div className="suggestions__item-info">
                                <div className="suggestions__item-name">
                                  {r.name}
                                </div>
                                <div className="suggestions__item-label">
                                  {r.cuisine_primary ?? r.cuisine}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Cuisines */}
                      {suggestions.cuisines.length > 0 && (
                        <div className="suggestions__section">
                          <div className="suggestions__section-title">
                            🍜 Cuisines
                          </div>
                          {suggestions.cuisines.map((c) => (
                            <button
                              key={c}
                              className="suggestions__item"
                              onClick={() => {
                                setQuery(c)
                                handleSearch(c)
                              }}
                            >
                              <span className="suggestions__item-icon">
                                🍜
                              </span>
                              <div className="suggestions__item-info">
                                <div className="suggestions__item-name">
                                  {c}
                                </div>
                                <div className="suggestions__item-label">
                                  Cuisine
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Search for '{query}' → */}
                  <button
                    className="suggestions__search-for"
                    onClick={() => handleSearch(query)}
                  >
                    <SearchIcon />
                    <span>
                      Search for &lsquo;{query}&rsquo; →
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Inline SVG icons ─────────────────────────── */

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--text-tertiary, #666)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--text-tertiary, #666)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
