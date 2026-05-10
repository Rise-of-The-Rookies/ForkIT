import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getPhotoUrl } from '@/lib/places'
import type { Restaurant } from '@/types'

/* ──────────────────────────────────────────────
   SavedPlaces — 2-column grid of saved restaurants
   ────────────────────────────────────────────── */

interface SavedRow {
  restaurant_id: string
  saved_at: string
  restaurants: Restaurant
}

interface SavedPlacesProps {
  userId: string
}

export default function SavedPlaces({ userId }: SavedPlacesProps) {
  const navigate = useNavigate()
  const [items, setItems] = useState<SavedRow[]>([])
  const [loading, setLoading] = useState(true)

  // ── Fetch saved places joined with restaurants ──
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('saved_places')
        .select('restaurant_id, saved_at, restaurants(*)')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })

      if (!cancelled) {
        if (!error && data) {
          setItems(data as unknown as SavedRow[])
        }
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  // ── Remove from saved ──
  const handleRemove = async (restaurantId: string) => {
    const { error } = await supabase
      .from('saved_places')
      .delete()
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)

    if (!error) {
      setItems((prev) => prev.filter((item) => item.restaurant_id !== restaurantId))
    }
  }

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="saved-places__grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="saved-places__skeleton" />
        ))}
      </div>
    )
  }

  // ── Empty state ──
  if (items.length === 0) {
    return (
      <div className="saved-places__empty">
        <span className="saved-places__empty-icon">📌</span>
        <p className="saved-places__empty-title">No saved places yet</p>
        <p className="saved-places__empty-sub">
          Start exploring and save restaurants you love!
        </p>
        <button
          className="saved-places__explore-btn"
          onClick={() => navigate('/discover')}
        >
          Explore Nearby →
        </button>
      </div>
    )
  }

  return (
    <div className="saved-places__grid">
      <AnimatePresence>
        {items.map((item, i) => {
          const r = item.restaurants
          if (!r) return null

          const photoSrc =
            r.photos?.length > 0
              ? r.photos[0].startsWith('http')
                ? r.photos[0]
                : getPhotoUrl(r.photos[0], 400)
              : null

          const savedDate = new Date(item.saved_at).toLocaleDateString('en-MY', {
            day: 'numeric',
            month: 'short',
          })

          return (
            <motion.div
              key={r.id}
              className="saved-places__card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, height: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              onClick={() => navigate(`/restaurant/${r.google_place_id}`)}
            >
              {/* Photo */}
              <div className="saved-places__card-photo">
                {photoSrc ? (
                  <img
                    src={photoSrc}
                    alt={r.name}
                    className="saved-places__card-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="saved-places__card-placeholder">🍽️</div>
                )}
              </div>

              {/* Info */}
              <div className="saved-places__card-info">
                <h4 className="saved-places__card-name">{r.name}</h4>
                <span className="saved-places__card-cuisine">{r.cuisine}</span>
                <span className="saved-places__card-date">Saved {savedDate}</span>
              </div>

              {/* Remove button */}
              <button
                className="saved-places__card-remove"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(r.id)
                }}
                aria-label="Remove from saved"
              >
                ✕
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
