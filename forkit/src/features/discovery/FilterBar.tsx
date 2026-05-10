import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/userStore'
import type { FilterState } from './useNearbySearch'

/* ──────────────────────────────────────────────
   FilterBar — cuisine pills + collapsible panel
   ────────────────────────────────────────────── */

interface FilterBarProps {
  filters: FilterState
  onChange: (f: FilterState) => void
}

// ─── Static data ─────────────────────────────

const CUISINE_PILLS = [
  { label: 'All', value: undefined },
  { label: 'Malaysian', value: 'Malaysian' },
  { label: 'Chinese', value: 'Chinese' },
  { label: 'Japanese', value: 'Japanese' },
  { label: 'Korean', value: 'Korean' },
  { label: 'Western', value: 'Western' },
  { label: 'Indian', value: 'Indian' },
  { label: 'Thai', value: 'Thai' },
] as const

const QUICK_PILLS = [
  { label: 'Open Now', key: 'openNow' },
  { label: '< 20', key: 'under20' },
  { label: '< 50', key: 'under50' },
] as const

const PRICE_LEVELS = [
  { label: '<20', value: 1 },
  { label: '20-50', value: 2 },
  { label: '50-100', value: 3 },
  { label: '>100', value: 4 },
] as const

const DIETARY_OPTIONS = ['Halal', 'Vegetarian', 'Vegan'] as const

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const user = useUserStore((s) => s.user)
  const [expanded, setExpanded] = useState(false)
  const [dietary, setDietary] = useState<Set<string>>(new Set())

  const defaultDistanceKm = user?.distance_pref ? Math.round(user.distance_pref) : 5

  // Count non-default active filters for the badge
  const activeCount = useMemo(() => {
    let n = 0
    if (filters.cuisine) n++
    if (filters.openNow) n++
    if (filters.priceRange && filters.priceRange.length > 0) n++
    if (filters.distanceKm !== defaultDistanceKm) n++
    if (dietary.size > 0) n++
    return n
  }, [filters, dietary, defaultDistanceKm])

  // ── Handlers ──

  const setCuisine = (value: string | undefined) => {
    onChange({ ...filters, cuisine: value })
  }

  const toggleOpenNow = () => {
    onChange({ ...filters, openNow: !filters.openNow })
  }

  const setUnderPrice = (max: number) => {
    // Under 20 → price levels 1; Under 50 → levels 1,2
    const levels = max === 20 ? [1] : [1, 2]
    const isAlready =
      filters.priceRange &&
      levels.length === filters.priceRange.length &&
      levels.every((l) => filters.priceRange!.includes(l))

    onChange({
      ...filters,
      priceRange: isAlready ? undefined : levels,
    })
  }

  const togglePriceLevel = (level: number) => {
    const current = new Set(filters.priceRange ?? [])
    if (current.has(level)) {
      current.delete(level)
    } else {
      current.add(level)
    }
    onChange({
      ...filters,
      priceRange: current.size > 0 ? Array.from(current).sort() : undefined,
    })
  }

  const setDistance = (km: number) => {
    onChange({ ...filters, distanceKm: km })
  }

  const toggleDietary = (tag: string) => {
    setDietary((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
    // Dietary doesn't map to FilterState directly (it will be used
    // for local filtering in the feed) — but we still track it here.
  }

  const isQuickActive = (key: string) => {
    if (key === 'openNow') return filters.openNow
    if (key === 'under20')
      return filters.priceRange?.length === 1 && filters.priceRange[0] === 1
    if (key === 'under50')
      return (
        filters.priceRange?.length === 2 &&
        filters.priceRange.includes(1) &&
        filters.priceRange.includes(2)
      )
    return false
  }

  return (
    <div className="filter-bar">
      {/* ── Row 1: Cuisine pills + quick filters ── */}
      <div className="filter-bar__scroll">
        {/* Cuisine pills */}
        {CUISINE_PILLS.map((pill) => {
          const active =
            pill.value === undefined
              ? !filters.cuisine
              : filters.cuisine === pill.value
          return (
            <button
              key={pill.label}
              className={`filter-bar__pill ${active ? 'filter-bar__pill--active' : ''}`}
              onClick={() => setCuisine(pill.value)}
            >
              {pill.label}
            </button>
          )
        })}

        {/* Divider dot */}
        <span className="filter-bar__dot" />

        {/* Quick pills */}
        {QUICK_PILLS.map((pill) => {
          const active = isQuickActive(pill.key)
          return (
            <button
              key={pill.key}
              className={`filter-bar__pill ${active ? 'filter-bar__pill--active' : ''}`}
              onClick={() => {
                if (pill.key === 'openNow') toggleOpenNow()
                else if (pill.key === 'under20') setUnderPrice(20)
                else if (pill.key === 'under50') setUnderPrice(50)
              }}
            >
              {pill.label}
            </button>
          )
        })}

        {/* Divider dot */}
        <span className="filter-bar__dot" />

        {/* Filters toggle button */}
        <button
          className={`filter-bar__pill filter-bar__pill--filters ${expanded ? 'filter-bar__pill--active' : ''}`}
          onClick={() => setExpanded((p) => !p)}
        >
          <FilterIcon />
          Filters
          {activeCount > 0 && (
            <span className="filter-bar__badge">{activeCount}</span>
          )}
        </button>
      </div>

      {/* ── Row 2: Expanded filter panel ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="filter-bar__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="filter-bar__panel-inner">
              {/* Distance slider */}
              <div className="filter-bar__section">
                <label className="filter-bar__label">
                  Distance
                  <span className="filter-bar__label-value">{filters.distanceKm} km</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={filters.distanceKm}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="filter-bar__slider"
                />
                <div className="filter-bar__range-labels">
                  <span>1 km</span>
                  <span>20 km</span>
                </div>
              </div>

              {/* Price range toggles */}
              <div className="filter-bar__section">
                <label className="filter-bar__label">Price Range</label>
                <div className="filter-bar__price-row">
                  {PRICE_LEVELS.map((p) => {
                    const active = filters.priceRange?.includes(p.value)
                    return (
                      <button
                        key={p.value}
                        className={`filter-bar__price-btn ${active ? 'filter-bar__price-btn--active' : ''}`}
                        onClick={() => togglePriceLevel(p.value)}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Dietary chips */}
              <div className="filter-bar__section">
                <label className="filter-bar__label">Dietary</label>
                <div className="filter-bar__chips">
                  {DIETARY_OPTIONS.map((tag) => {
                    const active = dietary.has(tag)
                    return (
                      <button
                        key={tag}
                        className={`filter-bar__pill filter-bar__pill--small ${active ? 'filter-bar__pill--active' : ''}`}
                        onClick={() => toggleDietary(tag)}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Inline SVG icon ──────────────────────────── */

function FilterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}
