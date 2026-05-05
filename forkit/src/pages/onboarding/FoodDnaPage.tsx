import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import { useUserStore } from '@/store/userStore'

/* ──────────────────────────────────────────────
   FoodDnaPage — Step 2 of 4
   Cuisine picks · Dietary needs · Favourite dishes
   ────────────────────────────────────────────── */

const TOTAL_STEPS = 4
const CURRENT_STEP = 2
const MIN_CUISINES = 3
const MAX_DISHES = 10

/* ── Data ────────────────────────────────────── */

const CUISINE_OPTIONS = [
  'Malaysian',
  'Chinese',
  'Indian',
  'Malay',
  'Japanese',
  'Korean',
  'Thai',
  'Vietnamese',
  'Western',
  'Italian',
  'Mexican',
  'Middle Eastern',
  'Fusion',
  'Seafood',
  'BBQ',
  'Street Food',
  'Vegetarian',
  'Halal',
] as const

const DIETARY_OPTIONS = [
  'Halal',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'No Pork',
  'No Alcohol',
] as const

/* ── Animation variants ──────────────────────── */

const pageVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: 0.3 },
  },
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.03 },
  },
}

const chipVariant = {
  initial: { opacity: 0, scale: 0.85 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function FoodDnaPage() {
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const { setPreferences } = useUserStore()

  const [selectedCuisines, setSelectedCuisines] = useState<Set<string>>(
    new Set(),
  )
  const [selectedDietary, setSelectedDietary] = useState<Set<string>>(
    new Set(),
  )
  const [dishes, setDishes] = useState<string[]>([])
  const [dishInput, setDishInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userId = session?.user?.id
  const isValid = selectedCuisines.size >= MIN_CUISINES

  /* ── Toggle helpers ────────────────────────── */

  const toggleCuisine = useCallback((cuisine: string) => {
    setSelectedCuisines((prev) => {
      const next = new Set(prev)
      if (next.has(cuisine)) {
        next.delete(cuisine)
      } else {
        next.add(cuisine)
      }
      return next
    })
  }, [])

  const toggleDietary = useCallback((tag: string) => {
    setSelectedDietary((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) {
        next.delete(tag)
      } else {
        next.add(tag)
      }
      return next
    })
  }, [])

  /* ── Dish tag helpers ──────────────────────── */

  const addDish = useCallback(
    (raw: string) => {
      const name = raw.trim()
      if (
        !name ||
        dishes.length >= MAX_DISHES ||
        dishes.some((d) => d.toLowerCase() === name.toLowerCase())
      ) {
        return
      }
      setDishes((prev) => [...prev, name])
      setDishInput('')
    },
    [dishes],
  )

  const removeDish = useCallback((index: number) => {
    setDishes((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleDishKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addDish(dishInput)
    }
    // Backspace on empty input removes last dish
    if (e.key === 'Backspace' && !dishInput && dishes.length > 0) {
      removeDish(dishes.length - 1)
    }
  }

  const handleDishChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Auto-add if user types a comma
    if (value.includes(',')) {
      const parts = value.split(',')
      parts.forEach((part) => addDish(part))
      return
    }
    setDishInput(value)
  }

  /* ── Save & continue ─────────────────────── */

  const handleContinue = async () => {
    if (!isValid || !userId) return

    setIsSaving(true)
    setError(null)

    try {
      const cuisineTags = Array.from(selectedCuisines)
      const dietaryTags = Array.from(selectedDietary)

      const { data, error: upsertError } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: userId,
            cuisine_tags: cuisineTags,
            dietary_tags: dietaryTags,
          },
          { onConflict: 'user_id' },
        )
        .select()
        .single()

      if (upsertError) throw upsertError

      // Sync to Zustand store
      if (data) {
        setPreferences(data)
      }

      navigate('/onboarding/dining-style')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  /* ── Back navigation ─────────────────────── */

  const handleBack = () => {
    navigate('/onboarding/profile')
  }

  return (
    <motion.div
      className="relative flex min-h-dvh flex-col bg-[#0F0E0C] px-6 pb-10 pt-14"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ── Ambient glow ──────────────────────── */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#FF4D00]/8 blur-[120px]" />

      {/* ── Back button ───────────────────────── */}
      <button
        type="button"
        id="food-dna-back-btn"
        onClick={handleBack}
        className="absolute left-4 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full
                   bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00]"
        aria-label="Go back"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      {/* ── Step indicator ────────────────────── */}
      <div className="relative z-10 mb-8 flex flex-col items-center gap-3">
        <span className="text-sm font-medium text-[#8E8E93]">
          {CURRENT_STEP} of {TOTAL_STEPS}
        </span>
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                i < CURRENT_STEP ? 'bg-[#FF4D00]' : 'bg-white/15'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Content ───────────────────────────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col overflow-y-auto">
        {/* ── Heading ─────────────────────────── */}
        <motion.h1
          className="mb-2 text-center text-3xl font-extrabold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Your Food DNA 🧬
        </motion.h1>
        <motion.p
          className="mb-8 text-center text-sm text-[#8E8E93]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Help us understand your taste — pick at least 3 cuisines.
        </motion.p>

        {/* ══════════════════════════════════════
           Section 1 — Cuisine Picks (required)
           ══════════════════════════════════════ */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="mb-3 text-xs font-medium uppercase tracking-widest text-[#8E8E93]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Favourite cuisines{' '}
            <span className="text-[#FF4D00]">*</span>
          </h2>

          <motion.div
            className="flex flex-wrap gap-2.5"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {CUISINE_OPTIONS.map((cuisine) => {
              const isSelected = selectedCuisines.has(cuisine)
              return (
                <motion.button
                  key={cuisine}
                  type="button"
                  id={`cuisine-chip-${cuisine.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => toggleCuisine(cuisine)}
                  variants={chipVariant}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00]/50 ${
                      isSelected
                        ? 'bg-[#FF4D00] text-white shadow-lg shadow-[#FF4D00]/20'
                        : 'bg-[#1E1D1A] text-[#8E8E93] hover:bg-[#2A2925] hover:text-[#B0B0B5]'
                    }`}
                >
                  {cuisine}
                </motion.button>
              )
            })}
          </motion.div>

          {/* Count badge */}
          <motion.div
            className="mt-3 flex items-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-300 ${
                isValid
                  ? 'bg-[#00A86B]/15 text-[#00A86B]'
                  : 'bg-white/5 text-[#8E8E93]'
              }`}
            >
              {isValid && (
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
              {selectedCuisines.size} selected
            </span>
            {!isValid && selectedCuisines.size > 0 && (
              <span className="text-xs text-[#8E8E93]/60">
                — need {MIN_CUISINES - selectedCuisines.size} more
              </span>
            )}
          </motion.div>
        </motion.section>

        {/* ══════════════════════════════════════
           Section 2 — Dietary Needs (optional)
           ══════════════════════════════════════ */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="mb-3 text-xs font-medium uppercase tracking-widest text-[#8E8E93]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Dietary needs{' '}
            <span className="normal-case tracking-normal text-[#8E8E93]/50">
              (optional)
            </span>
          </h2>

          <motion.div
            className="flex flex-wrap gap-2.5"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {DIETARY_OPTIONS.map((tag) => {
              const isSelected = selectedDietary.has(tag)
              return (
                <motion.button
                  key={tag}
                  type="button"
                  id={`dietary-chip-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => toggleDietary(tag)}
                  variants={chipVariant}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00]/50 ${
                      isSelected
                        ? 'bg-[#FF4D00] text-white shadow-lg shadow-[#FF4D00]/20'
                        : 'bg-[#1E1D1A] text-[#8E8E93] hover:bg-[#2A2925] hover:text-[#B0B0B5]'
                    }`}
                >
                  {tag}
                </motion.button>
              )
            })}
          </motion.div>
        </motion.section>

        {/* ══════════════════════════════════════
           Section 3 — Favourite Dishes (optional)
           ══════════════════════════════════════ */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="mb-3 text-xs font-medium uppercase tracking-widest text-[#8E8E93]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Favourite dishes{' '}
            <span className="normal-case tracking-normal text-[#8E8E93]/50">
              (optional)
            </span>
          </h2>

          {/* Tag input container */}
          <div
            className="flex min-h-[48px] flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5
                        transition-colors focus-within:border-[#FF4D00] focus-within:ring-1 focus-within:ring-[#FF4D00]/40"
          >
            <AnimatePresence mode="popLayout">
              {dishes.map((dish, index) => (
                <motion.span
                  key={dish}
                  layout
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-[#FF4D00]/15 px-3 py-1 text-xs font-medium text-[#FF4D00]"
                >
                  {dish}
                  <button
                    type="button"
                    onClick={() => removeDish(index)}
                    className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[#FF4D00]/60
                               transition-colors hover:bg-[#FF4D00]/20 hover:text-[#FF4D00]
                               focus:outline-none"
                    aria-label={`Remove ${dish}`}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>

            {dishes.length < MAX_DISHES && (
              <input
                id="dish-tag-input"
                type="text"
                value={dishInput}
                onChange={handleDishChange}
                onKeyDown={handleDishKeyDown}
                placeholder={
                  dishes.length === 0
                    ? 'e.g. Nasi Lemak, Ramen, Burger'
                    : 'Add another…'
                }
                className="min-w-[120px] flex-1 bg-transparent text-sm text-white placeholder:text-[#8E8E93]/60 outline-none"
              />
            )}
          </div>

          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs text-[#8E8E93]/60">
              Press Enter or comma to add
            </span>
            <span className="text-xs text-[#8E8E93]/60">
              {dishes.length}/{MAX_DISHES}
            </span>
          </div>
        </motion.section>

        {/* ── Error message ─────────────────── */}
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 text-center text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        {/* ── Spacer to push button down ───── */}
        <div className="flex-1" />

        {/* ── Continue button ────────────────── */}
        <motion.button
          type="button"
          id="food-dna-continue-btn"
          onClick={handleContinue}
          disabled={!isValid || isSaving}
          className="relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white
                     transition-all duration-200 active:scale-[0.97]
                     disabled:pointer-events-none disabled:opacity-40"
          style={{
            background: isValid ? '#FF4D00' : 'rgba(255, 77, 0, 0.3)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={isValid ? { scale: 1.02, backgroundColor: '#FF7A3D' } : {}}
          whileTap={isValid ? { scale: 0.97 } : {}}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving…
            </span>
          ) : (
            'Continue'
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
