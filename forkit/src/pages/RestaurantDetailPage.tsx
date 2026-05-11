import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getPlaceDetails, getPhotoUrl } from '@/lib/places'
import { useAuthStore } from '@/features/auth/authStore'
import ReviewSheet from '@/features/discovery/RestaurantDetail'
import type { Restaurant, Review, Dish } from '@/types'

/* ──────────────────────────────────────────────
   RestaurantDetailPage
   Route: /restaurant/:id
   ────────────────────────────────────────────── */

// Extended detail we get from Google Places API
interface PlaceDetail {
  formattedAddress?: string
  openNow?: boolean
  userRatingCount?: number
  editorialSummary?: string
  websiteUri?: string
  phoneNumber?: string
  googleMapsUri?: string
  regularHours?: string[]
  services?: {
    dineIn?: boolean
    takeout?: boolean
    delivery?: boolean
  }
}

// Review row with joined user profile
interface ReviewWithUser extends Review {
  user_profiles?: {
    display_name: string
    avatar_url: string | null
  }
}

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.session?.user?.id)
  const galleryRef = useRef<HTMLDivElement>(null)

  // ── State ──
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [detail, setDetail] = useState<PlaceDetail | null>(null)
  const [reviews, setReviews] = useState<ReviewWithUser[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false)
  const [dishes, setDishes] = useState<Dish[]>([])

  // ── Fetch restaurant + enrichment ──
  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function load() {
      setLoading(true)

      // 1. Fetch from Supabase by google_place_id (route param)
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('google_place_id', id as any)
        .maybeSingle()

      if (error || !data) {
        console.error('[RestaurantDetail] fetch error:', error?.message)
        setLoading(false)
        return
      }

      if (cancelled) return
      setRestaurant(data as Restaurant)

      // 2. Enrich from Google Places
      try {
        const gDetail = await getPlaceDetails((data as any).google_place_id)
        if (!cancelled && gDetail) {
          // Update photos from the richer detail if available
          if (gDetail.photos.length > 0) {
            setRestaurant((prev) =>
              prev ? { ...prev, photos: gDetail.photos, rating: gDetail.rating || prev.rating } : prev,
            )
          }
        }
      } catch {
        // Google enrichment is best-effort
      }

      // 3. Fetch Google Place detail for extended fields
      try {
        const API_KEY = import.meta.env.VITE_GOOGLE_KEY as string
        const res = await fetch(
          `https://places.googleapis.com/v1/places/${(data as any).google_place_id}`,
          {
            headers: {
              'X-Goog-Api-Key': API_KEY,
              'X-Goog-FieldMask':
                'formattedAddress,currentOpeningHours,regularOpeningHours,userRatingCount,editorialSummary,websiteUri,nationalPhoneNumber,googleMapsUri,dineIn,takeout,delivery',
            },
          },
        )
        if (res.ok) {
          const raw = await res.json()
          if (!cancelled) {
            setDetail({
              formattedAddress: raw.formattedAddress,
              openNow: raw.currentOpeningHours?.openNow,
              userRatingCount: raw.userRatingCount,
              editorialSummary: raw.editorialSummary?.text,
              websiteUri: raw.websiteUri,
              phoneNumber: raw.nationalPhoneNumber,
              googleMapsUri: raw.googleMapsUri,
              regularHours: raw.regularOpeningHours?.weekdayDescriptions,
              services: {
                dineIn: raw.dineIn,
                takeout: raw.takeout,
                delivery: raw.delivery,
              },
            })
          }
        }
      } catch {
        // Best-effort
      }

      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  // ── Fetch reviews (keyed on the real Supabase restaurant.id) ──
  const restaurantDbId = restaurant?.id ?? null

  const fetchReviews = useCallback(async () => {
    if (!restaurantDbId) return
    const { data, error } = await supabase
      .from('reviews')
      .select('*, user_profiles(display_name, avatar_url)')
      .eq('restaurant_id', restaurantDbId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setReviews(data as ReviewWithUser[])
    }
  }, [restaurantDbId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // ── Check saved state (use real Supabase id) ──
  useEffect(() => {
    if (!userId || !restaurantDbId) return
    supabase
      .from('saved_places')
      .select('restaurant_id')
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantDbId)
      .maybeSingle()
      .then(({ data }) => {
        setIsSaved(!!data)
      })
  }, [userId, restaurantDbId])

  // ── Fetch dishes (use real Supabase id) ──
  useEffect(() => {
    if (!restaurantDbId) return
    supabase
      .from('dishes')
      .select('*')
      .eq('restaurant_id', restaurantDbId)
      .order('created_at', { ascending: true })
      .limit(6)
      .then(({ data }) => {
        if (data) setDishes(data as Dish[])
      })
  }, [restaurantDbId])

  // ── Toggle save ──
  const toggleSave = async () => {
    if (!userId || !restaurantDbId) return

    if (isSaved) {
      await supabase
        .from('saved_places')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantDbId)
      setIsSaved(false)
    } else {
      await (supabase.from('saved_places').upsert as any)({
        user_id: userId,
        restaurant_id: restaurantDbId,
        geofence_active: false,
        visit_count: 0,
      })
      setIsSaved(true)
    }
  }

  // ── Computed ──
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  const photos = restaurant?.photos ?? []

  // ── Loading skeleton ──
  if (loading || !restaurant) {
    return (
      <div className="detail-page">
        <div className="detail-page__skeleton-hero" />
        <div className="detail-page__skeleton-content">
          <div className="detail-page__skeleton-line detail-page__skeleton-line--wide" />
          <div className="detail-page__skeleton-line" />
          <div className="detail-page__skeleton-line detail-page__skeleton-line--short" />
        </div>
      </div>
    )
  }

  return (
    <div className="detail-page">
      {/* ═══════ HERO — Photo gallery ═══════ */}
      <section className="detail-page__hero">
        <div className="detail-page__gallery" ref={galleryRef}>
          {photos.length > 0 ? (
            photos.map((photo, i) => {
              const src = photo.startsWith('http')
                ? photo
                : getPhotoUrl(photo, 800)
              return (
                <img
                  key={i}
                  src={src}
                  alt={`${restaurant.name} photo ${i + 1}`}
                  className="detail-page__gallery-img"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              )
            })
          ) : (
            <div className="detail-page__gallery-placeholder">
              <span>🍽️</span>
              <p>No photos available</p>
            </div>
          )}
        </div>

        {/* Photo count indicator */}
        {photos.length > 1 && (
          <span className="detail-page__photo-count">
            📷 {photos.length}
          </span>
        )}

        {/* Back button */}
        <button
          className="detail-page__back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Save button */}
        <motion.button
          className="detail-page__save-btn"
          onClick={toggleSave}
          whileTap={{ scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          aria-label={isSaved ? 'Unsave' : 'Save'}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={isSaved ? '#FF4D00' : 'none'}
              stroke={isSaved ? '#FF4D00' : 'white'}
              strokeWidth="2"
            />
          </svg>
        </motion.button>
      </section>

      {/* ═══════ Ask Forky banner ═══════ */}
      <button
        className="detail-page__forky-banner"
        onClick={() => navigate(`/forky?restaurant=${restaurant.id}&name=${encodeURIComponent(restaurant.name)}`)}
      >
        <span className="detail-page__forky-icon">🍴</span>
        <span className="detail-page__forky-text">
          Ask Forky about this place
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* ═══════ INFO SECTION ═══════ */}
      <section className="detail-page__info">
        <h1 className="detail-page__name">{restaurant.name}</h1>

        {/* Meta row */}
        <div className="detail-page__meta-row">
          <span className="detail-page__cuisine-pill">{restaurant.cuisine}</span>
          <span className="detail-page__price">
            {Array.from({ length: 4 }, (_, i) => (
              <span
                key={i}
                className={i < restaurant.price_range ? 'detail-page__price-dot--active' : 'detail-page__price-dot'}
              >
                ●
              </span>
            ))}
          </span>
          <span className="detail-page__rating-inline">
            ⭐ {restaurant.rating.toFixed(1)}
          </span>
          {detail?.userRatingCount != null && (
            <span className="detail-page__review-count">
              ({detail.userRatingCount.toLocaleString()})
            </span>
          )}
        </div>

        {/* Address */}
        {detail?.formattedAddress && (
          <div className="detail-page__address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{detail.formattedAddress}</span>
          </div>
        )}

        {/* Opening hours */}
        {detail?.openNow !== undefined && (
          <div className="detail-page__hours">
            <span
              className={`detail-page__hours-status ${detail.openNow ? 'detail-page__hours-status--open' : 'detail-page__hours-status--closed'}`}
            >
              {detail.openNow ? '● Open now' : '● Closed'}
            </span>
          </div>
        )}

        {/* Services */}
        {detail?.services && (
          <div className="detail-page__services">
            {detail.services.dineIn && (
              <span className="detail-page__service-chip">🍽️ Dine-in</span>
            )}
            {detail.services.takeout && (
              <span className="detail-page__service-chip">🥡 Takeout</span>
            )}
            {detail.services.delivery && (
              <span className="detail-page__service-chip">🚚 Delivery</span>
            )}
          </div>
        )}

        {/* Editorial summary */}
        {detail?.editorialSummary && (
          <p className="detail-page__summary">{detail.editorialSummary}</p>
        )}

        {/* Regular hours */}
        {detail?.regularHours && detail.regularHours.length > 0 && (
          <div className="detail-page__regular-hours">
            <h3 className="detail-page__section-title">Opening Hours</h3>
            <ul className="detail-page__hours-list">
              {detail.regularHours.map((line, i) => (
                <li key={i} className="detail-page__hours-item">{line}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Links */}
        <div className="detail-page__links">
          {detail?.websiteUri && (
            <a
              href={detail.websiteUri}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-page__link-btn"
            >
              🌐 Website
            </a>
          )}
          {detail?.phoneNumber && (
            <a href={`tel:${detail.phoneNumber}`} className="detail-page__link-btn">
              📞 Call
            </a>
          )}
          {detail?.googleMapsUri && (
            <a
              href={detail.googleMapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-page__link-btn"
            >
              📍 Directions
            </a>
          )}
        </div>
      </section>

      {/* ═══════ TOP DISHES ═══════ */}
      {dishes.length > 0 && (
        <section className="detail-page__dishes">
          <h2 className="detail-page__section-title">
            🍽️ Top Dishes
          </h2>
          <div className="detail-page__dishes-scroll">
            {dishes.map((dish) => (
              <div key={dish.id} className="detail-page__dish-card">
                {dish.photo_url ? (
                  <img
                    src={dish.photo_url}
                    alt={dish.name}
                    className="detail-page__dish-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="detail-page__dish-img-placeholder" />
                )}
                <span className="detail-page__dish-name">{dish.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════ FORKIT REVIEWS ═══════ */}
      <section className="detail-page__reviews">
        <div className="detail-page__reviews-header">
          <div>
            <h2 className="detail-page__section-title">ForkIt Reviews</h2>
            {reviews.length > 0 && (
              <div className="detail-page__avg-rating">
                <span className="detail-page__avg-rating-number">
                  {avgRating.toFixed(1)}
                </span>
                <div className="detail-page__avg-rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill={star <= Math.round(avgRating) ? '#FF4D00' : 'none'}
                        stroke={star <= Math.round(avgRating) ? '#FF4D00' : 'var(--color-text-muted)'}
                        strokeWidth="1.5"
                      />
                    </svg>
                  ))}
                </div>
                <span className="detail-page__avg-rating-count">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          <button
            className="detail-page__write-review-btn"
            onClick={() => setReviewSheetOpen(true)}
          >
            ✍️ Write a Review
          </button>
        </div>

        {/* Review list */}
        {reviews.length === 0 ? (
          <div className="detail-page__no-reviews">
            <span className="detail-page__no-reviews-icon">💬</span>
            <p>Be the first to review this place!</p>
          </div>
        ) : (
          <div className="detail-page__review-list">
            {reviews.map((review) => (
              <div key={review.id} className="detail-page__review-card">
                {/* Avatar + name */}
                <div className="detail-page__review-top">
                  <div className="detail-page__review-avatar">
                    {review.user_profiles?.avatar_url ? (
                      <img
                        src={review.user_profiles.avatar_url}
                        alt={review.user_profiles.display_name}
                        className="detail-page__review-avatar-img"
                      />
                    ) : (
                      <span className="detail-page__review-avatar-fallback">
                        {(review.user_profiles?.display_name ?? '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="detail-page__review-meta">
                    <span className="detail-page__review-name">
                      {review.user_profiles?.display_name ?? 'Anonymous'}
                    </span>
                    <span className="detail-page__review-date">
                      {new Date(review.created_at).toLocaleDateString('en-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {/* Stars */}
                  <div className="detail-page__review-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          fill={s <= review.rating ? '#FF4D00' : 'none'}
                          stroke={s <= review.rating ? '#FF4D00' : 'var(--color-text-muted)'}
                          strokeWidth="1.5"
                        />
                      </svg>
                    ))}
                  </div>
                </div>
                {/* Body */}
                {review.body && (
                  <p className="detail-page__review-body">{review.body}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════ REVIEW BOTTOM SHEET ═══════ */}
      <ReviewSheet
        restaurantId={restaurant.id}
        isOpen={reviewSheetOpen}
        onClose={() => setReviewSheetOpen(false)}
        onSubmitted={fetchReviews}
      />
    </div>
  )
}
