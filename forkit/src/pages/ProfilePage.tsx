import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/userStore'
import { useAuthStore } from '@/features/auth/authStore'
import ProfileHeader from '@/features/profile/ProfileHeader'
import SavedPlaces from '@/features/profile/SavedPlaces'
import type { Review } from '@/types'

/* ──────────────────────────────────────────────
   ProfilePage — user profile, saved places, reviews
   ────────────────────────────────────────────── */

type ProfileTab = 'saved' | 'reviews'

interface ReviewWithRestaurant extends Review {
  restaurants?: {
    name: string
    cuisine: string
    google_place_id: string
  }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useUserStore((s) => s.user)
  const userId = useAuthStore((s) => s.session?.user?.id)

  const [tab, setTab] = useState<ProfileTab>('saved')
  const [savedCount, setSavedCount] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [reviews, setReviews] = useState<ReviewWithRestaurant[]>([])

  // ── Fetch counts + reviews ──
  useEffect(() => {
    if (!userId) return

    // Saved count
    supabase
      .from('saved_places')
      .select('restaurant_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .then(({ count }) => {
        setSavedCount(count ?? 0)
      })

    // Reviews
    supabase
      .from('reviews')
      .select('*, restaurants(name, cuisine, google_place_id)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, count }) => {
        if (data) setReviews(data as ReviewWithRestaurant[])
        setReviewCount(count ?? data?.length ?? 0)
      })
  }, [userId])

  // ── No user yet ──
  if (!user || !userId) {
    return (
      <div className="profile-page">
        <div className="profile-page__loading">
          <div className="profile-page__loading-avatar" />
          <div className="profile-page__loading-line profile-page__loading-line--wide" />
          <div className="profile-page__loading-line" />
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      {/* ── Top-right settings icon ── */}
      <button
        className="profile-page__settings-btn"
        onClick={() => navigate('/settings')}
        aria-label="Settings"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </button>

      {/* ── Header ── */}
      <ProfileHeader
        user={user}
        savedCount={savedCount}
        reviewCount={reviewCount}
      />

      {/* ── Tabs ── */}
      <div className="profile-page__tabs">
        <button
          className={`profile-page__tab ${tab === 'saved' ? 'profile-page__tab--active' : ''}`}
          onClick={() => setTab('saved')}
        >
          Saved
        </button>
        <button
          className={`profile-page__tab ${tab === 'reviews' ? 'profile-page__tab--active' : ''}`}
          onClick={() => setTab('reviews')}
        >
          Reviews
        </button>
      </div>

      {/* ── Tab content ── */}
      <div className="profile-page__content">
        {tab === 'saved' ? (
          <SavedPlaces userId={userId} />
        ) : (
          <div className="profile-page__reviews">
            {reviews.length === 0 ? (
              <div className="profile-page__empty">
                <span className="profile-page__empty-icon">✍️</span>
                <p>You haven't written any reviews yet.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="profile-page__review-card"
                  onClick={() => navigate(`/restaurant/${review.restaurants?.google_place_id ?? review.restaurant_id}`)}
                >
                  <div className="profile-page__review-top">
                    <span className="profile-page__review-restaurant">
                      {review.restaurants?.name ?? 'Unknown restaurant'}
                    </span>
                    <div className="profile-page__review-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                  {review.restaurants?.cuisine && (
                    <span className="profile-page__review-cuisine">
                      {review.restaurants.cuisine}
                    </span>
                  )}
                  {review.body && (
                    <p className="profile-page__review-body">{review.body}</p>
                  )}
                  <span className="profile-page__review-date">
                    {new Date(review.created_at).toLocaleDateString('en-MY', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
