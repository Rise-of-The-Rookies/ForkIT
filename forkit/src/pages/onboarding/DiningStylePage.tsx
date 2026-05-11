import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import { useUserStore } from '@/store/userStore'

/* ──────────────────────────────────────────────
   DiningStylePage — Step 3 of 4
   Budget · Distance · Notification preferences
   ────────────────────────────────────────────── */

const TOTAL_STEPS = 4
const CURRENT_STEP = 3

type BudgetTier = 'low' | 'mid' | 'high'

interface BudgetOption {
  value: BudgetTier
  emoji: string
  label: string
  sub: string
}

const BUDGET_OPTIONS: BudgetOption[] = [
  { value: 'low', emoji: '💰', label: 'Budget', sub: 'Under RM20' },
  { value: 'mid', emoji: '💳', label: 'Mid-range', sub: 'RM20–60' },
  { value: 'high', emoji: '💎', label: 'Fine Dining', sub: 'RM60+' },
]

interface NotifPref {
  key: string
  label: string
  description: string
}

const NOTIF_OPTIONS: NotifPref[] = [
  {
    key: 'nudges',
    label: 'Meal time nudges',
    description: 'Get reminded around breakfast, lunch & dinner',
  },
  {
    key: 'friends',
    label: 'Friend activity',
    description: "See when friends post reviews or save spots",
  },
  {
    key: 'trending',
    label: 'Trending alerts',
    description: 'New viral spots and trending dishes near you',
  },
  {
    key: 'geofence',
    label: 'Geofence alerts',
    description: "Get notified when you're near a saved place",
  },
]

/* ── Animation variants ──────────────────────── */

const pageVariants: any = {
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

export default function DiningStylePage() {
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const { setUser, setPreferences, user, preferences } = useUserStore()

  const [budget, setBudget] = useState<BudgetTier>('mid')
  const [distance, setDistance] = useState(5)
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    nudges: true,
    friends: true,
    trending: true,
    geofence: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userId = session?.user?.id

  /* ── Toggle notification ───────────────────── */

  const toggleNotif = (key: string) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  /* ── Save & continue ─────────────────────── */

  const handleContinue = async () => {
    if (!userId) return

    setIsSaving(true)
    setError(null)

    try {
      // 1. Update user profile (budget + distance)
      const { data: profileData, error: profileError } = await (supabase
        .from('user_profiles')
        .update as any)({
          budget_pref: budget,
          distance_pref: distance,
        })
        .eq('id', userId)
        .select()
        .single()

      if (profileError) throw profileError

      // 2. Upsert notification preferences
      const { data: prefData, error: prefError } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: userId,
            notification_prefs: notifs,
          } as any,
          { onConflict: 'user_id' },
        )
        .select()
        .single()

      if (prefError) throw prefError

      // Sync to Zustand
      if (profileData) {
        setUser({ ...(user ?? profileData), ...(profileData as any) })
      }
      if (prefData) {
        setPreferences({ ...(preferences ?? prefData), ...(prefData as any) })
      }

      navigate('/onboarding/personality')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  /* ── Navigation helpers ──────────────────── */

  const handleBack = () => navigate('/onboarding/food-dna')
  const handleSkip = () => navigate('/onboarding/personality')

  /* ── Slider fill percentage ──────────────── */

  const sliderPercent = ((distance - 1) / (20 - 1)) * 100

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
        id="dining-style-back-btn"
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

      {/* ── Skip button ───────────────────────── */}
      <button
        type="button"
        id="dining-style-skip-btn"
        onClick={handleSkip}
        className="absolute right-4 top-5 z-20 px-3 py-2 text-sm font-medium text-[#8E8E93]
                   transition-colors hover:text-white focus:outline-none focus-visible:text-white"
      >
        Skip
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
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col">
        {/* ── Heading ─────────────────────────── */}
        <motion.h1
          className="mb-2 text-center text-3xl font-extrabold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          How do you like to dine?
        </motion.h1>
        <motion.p
          className="mb-10 text-center text-sm text-[#8E8E93]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          You can always change this later.
        </motion.p>

        {/* ══════════════════════════════════════
           Section 1 — Budget per meal
           ══════════════════════════════════════ */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="mb-4 text-xs font-medium uppercase tracking-widest text-[#8E8E93]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Budget per meal
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {BUDGET_OPTIONS.map((opt) => {
              const isSelected = budget === opt.value
              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  id={`budget-card-${opt.value}`}
                  onClick={() => setBudget(opt.value)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-5
                    transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00]/50 ${
                      isSelected
                        ? 'border-[#FF4D00] bg-[#FF4D00]/8 shadow-lg shadow-[#FF4D00]/10'
                        : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/5'
                    }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span
                    className={`text-sm font-semibold transition-colors ${
                      isSelected ? 'text-white' : 'text-[#B0B0B5]'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span
                    className={`text-[11px] transition-colors ${
                      isSelected ? 'text-[#FF4D00]' : 'text-[#8E8E93]/70'
                    }`}
                  >
                    {opt.sub}
                  </span>

                  {/* Selection indicator dot */}
                  {isSelected && (
                    <motion.div
                      layoutId="budget-dot"
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4D00]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <svg
                        className="h-3 w-3 text-white"
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
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.section>

        {/* ══════════════════════════════════════
           Section 2 — Distance radius
           ══════════════════════════════════════ */}
        <motion.section
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-xs font-medium uppercase tracking-widest text-[#8E8E93]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Distance radius
            </h2>
            <span className="text-sm font-semibold text-white">
              Within{' '}
              <span className="text-[#FF4D00]">{distance}</span> km
            </span>
          </div>

          {/* Custom slider */}
          <div className="relative">
            <input
              id="distance-slider"
              type="range"
              min={1}
              max={20}
              step={1}
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="distance-slider w-full cursor-pointer appearance-none bg-transparent focus:outline-none"
              aria-label={`Distance radius: ${distance} km`}
            />
            {/* Track fill overlay */}
            <div className="pointer-events-none absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full">
              <div
                className="h-full rounded-full bg-[#FF4D00] transition-[width] duration-100"
                style={{ width: `${sliderPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[#8E8E93]/60">
            <span>1 km</span>
            <span>20 km</span>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════
           Section 3 — Notification preferences
           ══════════════════════════════════════ */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="mb-4 text-xs font-medium uppercase tracking-widest text-[#8E8E93]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Notifications
          </h2>

          <div className="space-y-1">
            {NOTIF_OPTIONS.map((opt) => {
              const isOn = notifs[opt.key]
              return (
                <button
                  key={opt.key}
                  type="button"
                  id={`notif-toggle-${opt.key}`}
                  onClick={() => toggleNotif(opt.key)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3.5
                             transition-colors hover:bg-white/[0.03] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF4D00]/40"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{opt.label}</p>
                    <p className="mt-0.5 text-xs text-[#8E8E93]/70">
                      {opt.description}
                    </p>
                  </div>

                  {/* Toggle switch */}
                  <div
                    className={`relative flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
                      isOn ? 'bg-[#FF4D00]' : 'bg-white/10'
                    }`}
                  >
                    <motion.div
                      className="h-5 w-5 rounded-full bg-white shadow-md"
                      animate={{ x: isOn ? 22 : 4 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </div>
                </button>
              )
            })}
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

        {/* ── Spacer ───────────────────────── */}
        <div className="flex-1" />

        {/* ── Continue button ────────────────── */}
        <motion.button
          type="button"
          id="dining-style-continue-btn"
          onClick={handleContinue}
          disabled={isSaving}
          className="relative w-full overflow-hidden rounded-xl bg-[#FF4D00] py-3.5 text-sm font-bold text-white
                     transition-all duration-200 active:scale-[0.97]
                     disabled:pointer-events-none disabled:opacity-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.02, backgroundColor: '#FF7A3D' }}
          whileTap={{ scale: 0.97 }}
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

      {/* ── Custom slider styles ──────────────── */}
      <style>{`
        /* Track */
        .distance-slider::-webkit-slider-runnable-track {
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.08);
        }
        .distance-slider::-moz-range-track {
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.08);
        }

        /* Filled track (Firefox) */
        .distance-slider::-moz-range-progress {
          height: 6px;
          border-radius: 3px;
          background: #FF4D00;
        }

        /* Thumb */
        .distance-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #FF4D00;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(255, 77, 0, 0.35);
          margin-top: -8px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .distance-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #FF4D00;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(255, 77, 0, 0.35);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        /* Thumb hover */
        .distance-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 12px rgba(255, 77, 0, 0.5);
        }
        .distance-slider::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 12px rgba(255, 77, 0, 0.5);
        }

        /* Focus ring on thumb */
        .distance-slider:focus-visible::-webkit-slider-thumb {
          outline: 2px solid #FF4D00;
          outline-offset: 2px;
        }
        .distance-slider:focus-visible::-moz-range-thumb {
          outline: 2px solid #FF4D00;
          outline-offset: 2px;
        }
      `}</style>
    </motion.div>
  )
}
