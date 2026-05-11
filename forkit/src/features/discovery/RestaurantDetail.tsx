import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import BottomSheet from '@/components/ui/BottomSheet'

/* ──────────────────────────────────────────────
   ReviewSheet — write-a-review bottom sheet
   Used inside RestaurantDetailPage
   ────────────────────────────────────────────── */

interface ReviewSheetProps {
  restaurantId: string
  isOpen: boolean
  onClose: () => void
  onSubmitted: () => void
}

export default function ReviewSheet({
  restaurantId,
  isOpen,
  onClose,
  onSubmitted,
}: ReviewSheetProps) {
  const userId = useAuthStore((s) => s.session?.user?.id)

  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const charCount = body.length
  const canSubmit = rating > 0 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit || !userId) return

    setSubmitting(true)
    setError(null)

    const { error: dbError } = await supabase.from('reviews').insert({
      user_id: userId,
      restaurant_id: restaurantId,
      rating,
      body: body.trim() || null,
    } as any)

    setSubmitting(false)

    if (dbError) {
      console.error('[ReviewSheet] Insert error:', dbError.message)
      setError('Failed to submit review. Please try again.')
      return
    }

    // Reset & close
    setRating(0)
    setBody('')
    onClose()
    onSubmitted()
  }

  const handleClose = () => {
    setRating(0)
    setBody('')
    setError(null)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Write a Review">
      <div className="review-sheet">
        {/* ── Star picker ── */}
        <div className="review-sheet__stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              className={`review-sheet__star ${star <= rating ? 'review-sheet__star--active' : ''}`}
              onClick={() => setRating(star)}
              whileTap={{ scale: 1.3 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              aria-label={`Rate ${star} stars`}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={star <= rating ? '#FF4D00' : 'none'}
                  stroke={star <= rating ? '#FF4D00' : 'currentColor'}
                  strokeWidth="1.5"
                />
              </svg>
            </motion.button>
          ))}
        </div>
        <p className="review-sheet__star-label">
          {rating === 0
            ? 'Tap to rate'
            : rating <= 2
              ? 'Could be better'
              : rating <= 3
                ? 'It was okay'
                : rating === 4
                  ? 'Really good!'
                  : 'Amazing! 🔥'}
        </p>

        {/* ── Review body ── */}
        <div className="review-sheet__textarea-wrap">
          <textarea
            className="review-sheet__textarea"
            placeholder="Tell others about your experience (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 300))}
            rows={4}
            maxLength={300}
          />
          <span className="review-sheet__char-count">{charCount}/300</span>
        </div>

        {/* ── Error ── */}
        {error && <p className="review-sheet__error">{error}</p>}

        {/* ── Submit button ── */}
        <button
          className="review-sheet__submit"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </BottomSheet>
  )
}
