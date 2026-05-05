import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getPhotoUrl } from '@/lib/places'
import type { Restaurant } from '@/types'

/* ──────────────────────────────────────────────
   RestaurantCard — photo-first discovery card
   ────────────────────────────────────────────── */

interface RestaurantCardProps {
  restaurant: Restaurant
  isSaved: boolean
  onSave: () => void
  onClick?: () => void
  index?: number
  trending?: boolean
}

export default function RestaurantCard({
  restaurant,
  isSaved,
  onSave,
  onClick,
  index = 0,
  trending = false,
}: RestaurantCardProps) {
  const navigate = useNavigate()

  // Pick the first photo, fallback to a gradient placeholder
  const photoSrc =
    restaurant.photos.length > 0
      ? restaurant.photos[0].startsWith('http')
        ? restaurant.photos[0]
        : getPhotoUrl(restaurant.photos[0], 800)
      : null

  const handleClick = () => {
    if (onClick) return onClick()
    navigate(`/restaurant/${restaurant.id}`)
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSave()
  }

  // Price label
  const priceLabel = '₹'.repeat(restaurant.price_range) // visual only

  return (
    <motion.article
      className="restaurant-card"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${restaurant.name}`}
    >
      {/* ── Background image ── */}
      {photoSrc ? (
        <img
          src={photoSrc}
          alt={restaurant.name}
          className="restaurant-card__image"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="restaurant-card__placeholder" />
      )}

      {/* ── Gradient overlay ── */}
      <div className="restaurant-card__overlay" />

      {/* ── Trending badge (top-left) ── */}
      {trending && (
        <span className="restaurant-card__badge restaurant-card__badge--trending">
          🔥 Trending
        </span>
      )}

      {/* ── Save button (top-right) ── */}
      <motion.button
        className="restaurant-card__save"
        onClick={handleSave}
        whileTap={{ scale: 1.35 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        aria-label={isSaved ? 'Unsave restaurant' : 'Save restaurant'}
      >
        {isSaved ? (
          <HeartFilledIcon />
        ) : (
          <HeartOutlineIcon />
        )}
      </motion.button>

      {/* ── Bottom content ── */}
      <div className="restaurant-card__content">
        <div className="restaurant-card__info">
          <h3 className="restaurant-card__name">{restaurant.name}</h3>
          <div className="restaurant-card__tags">
            <span className="restaurant-card__pill">{restaurant.cuisine}</span>
            <span className="restaurant-card__pill restaurant-card__pill--price">
              {'RM'.padEnd(2 + restaurant.price_range, 'M').slice(0, 2 + restaurant.price_range)}
            </span>
          </div>
        </div>

        {/* ── Rating badge (bottom-right) ── */}
        <div className="restaurant-card__rating">
          <StarIcon />
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>
      </div>
    </motion.article>
  )
}

/* ── Inline SVG icons ─────────────────────────── */

function HeartFilledIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF4D00" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function HeartOutlineIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
