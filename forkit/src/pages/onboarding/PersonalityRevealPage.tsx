import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import { useUserStore } from '@/store/userStore'

/* ──────────────────────────────────────────────
   PersonalityRevealPage — Step 4 of 4
   Derive food personality → dramatic reveal
   ────────────────────────────────────────────── */

const TOTAL_STEPS = 4
const CURRENT_STEP = 4
const ANALYSIS_DURATION = 1500 // ms

/* ── Personality definitions ─────────────────── */

interface Personality {
  key: string
  emoji: string
  name: string
  description: string
  accent: string
}

const PERSONALITIES: Record<string, Personality> = {
  spice_hunter: {
    key: 'spice_hunter',
    emoji: '🌶️',
    name: 'Spice Hunter',
    description: "You chase heat, bold flavours, and the thrill of a sambal that makes you sweat.",
    accent: '#FF2D2D',
  },
  culture_explorer: {
    key: 'culture_explorer',
    emoji: '🗺️',
    name: 'Culture Explorer',
    description: "From dim sum to pho, you eat your way through Asia one dish at a time.",
    accent: '#FF8C00',
  },
  comfort_seeker: {
    key: 'comfort_seeker',
    emoji: '🍔',
    name: 'Comfort Seeker',
    description: "Nothing beats a perfectly smashed burger, crispy fries, and a side of nostalgia.",
    accent: '#FFB347',
  },
  clean_eater: {
    key: 'clean_eater',
    emoji: '🥗',
    name: 'Clean Eater',
    description: "You fuel your body intentionally — every bowl is a balanced masterpiece.",
    accent: '#00C853',
  },
  trendsetter: {
    key: 'trendsetter',
    emoji: '✨',
    name: 'Trendsetter',
    description: "You knew about that place before it went viral. First in line, always.",
    accent: '#E040FB',
  },
  local_legend: {
    key: 'local_legend',
    emoji: '🇲🇾',
    name: 'Local Legend',
    description: "Nasi lemak for breakfast, roti canai for supper — Malaysia runs through your veins.",
    accent: '#FFCA28',
  },
  the_adventurer: {
    key: 'the_adventurer',
    emoji: '🧭',
    name: 'The Adventurer',
    description: "You'll try anything once — and probably go back for seconds.",
    accent: '#448AFF',
  },
  fine_diner: {
    key: 'fine_diner',
    emoji: '🥂',
    name: 'Fine Diner',
    description: "Life's too short for bad wine and mediocre omakase. You dine with intention.",
    accent: '#CE93D8',
  },
}

/* ── Derivation logic ────────────────────────── */

const SPICE_TAGS = ['Malaysian', 'Thai', 'Mexican', 'Middle Eastern', 'Indian']
const ASIAN_TAGS = [
  'Malaysian',
  'Chinese',
  'Indian',
  'Malay',
  'Japanese',
  'Korean',
  'Thai',
  'Vietnamese',
]
const COMFORT_TAGS = ['Western', 'Italian', 'BBQ', 'Street Food']
const HEALTH_TAGS = ['Vegetarian', 'Vegan']
const TREND_TAGS = ['Japanese', 'Korean', 'Fusion']
const LOCAL_TAGS = ['Malaysian', 'Malay', 'Street Food']

function derivePersonality(
  cuisineTags: string[],
  dietaryTags: string[],
  budgetPref: string | null,
): Personality {
  const tags = new Set(cuisineTags.map((t) => t.trim()))
  const dietary = new Set(dietaryTags.map((t) => t.trim()))

  // Fine Diner — budget first (highest priority if budget is high)
  if (budgetPref === 'high') {
    return PERSONALITIES.fine_diner
  }

  // The Adventurer — 8+ different cuisines
  if (tags.size >= 8) {
    return PERSONALITIES.the_adventurer
  }

  // Spice Hunter — 3+ of the spice set
  const spiceCount = SPICE_TAGS.filter((t) => tags.has(t)).length
  if (spiceCount >= 3) {
    return PERSONALITIES.spice_hunter
  }

  // Clean Eater — vegetarian/vegan dietary + health-leaning
  const hasHealthDietary = HEALTH_TAGS.some((t) => dietary.has(t))
  const hasHealthCuisine = tags.has('Vegetarian')
  if (hasHealthDietary || hasHealthCuisine) {
    return PERSONALITIES.clean_eater
  }

  // Local Legend — Malaysian + Malay + Street Food dominant
  const localCount = LOCAL_TAGS.filter((t) => tags.has(t)).length
  if (localCount >= 2) {
    return PERSONALITIES.local_legend
  }

  // Trendsetter — 2+ of Japanese, Korean, Fusion
  const trendCount = TREND_TAGS.filter((t) => tags.has(t)).length
  if (trendCount >= 2) {
    return PERSONALITIES.trendsetter
  }

  // Culture Explorer — 4+ different Asian types
  const asianCount = ASIAN_TAGS.filter((t) => tags.has(t)).length
  if (asianCount >= 4) {
    return PERSONALITIES.culture_explorer
  }

  // Comfort Seeker — Western, Italian, BBQ, Street Food dominant
  const comfortCount = COMFORT_TAGS.filter((t) => tags.has(t)).length
  if (comfortCount >= 2) {
    return PERSONALITIES.comfort_seeker
  }

  // Fallback
  return PERSONALITIES.the_adventurer
}

/* ── Confetti burst ──────────────────────────── */

function fireConfetti() {
  const duration = 2500
  const end = Date.now() + duration

  const colors = ['#FF4D00', '#FF0080', '#FFCA28', '#00A86B', '#448AFF', '#E040FB']

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.65 },
      colors,
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.65 },
      colors,
      disableForReducedMotion: true,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  // Initial big burst
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { x: 0.5, y: 0.45 },
    colors,
    disableForReducedMotion: true,
  })

  frame()
}

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

/* ── Component ───────────────────────────────── */

export default function PersonalityRevealPage() {
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const { preferences, user, setUser } = useUserStore()

  const [phase, setPhase] = useState<'analysing' | 'revealed'>('analysing')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confettiFired = useRef(false)

  const userId = session?.user?.id

  /* ── Derive personality from store ─────────── */

  const personality = derivePersonality(
    preferences?.cuisine_tags ?? [],
    preferences?.dietary_tags ?? [],
    user?.budget_pref ?? null,
  )

  /* ── Analysis timer → reveal ───────────────── */

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('revealed')
    }, ANALYSIS_DURATION)

    return () => clearTimeout(timer)
  }, [])

  /* ── Fire confetti on reveal ───────────────── */

  useEffect(() => {
    if (phase === 'revealed' && !confettiFired.current) {
      confettiFired.current = true
      // Slight delay so the emoji scales up first
      setTimeout(fireConfetti, 300)
    }
  }, [phase])

  /* ── Save & navigate ─────────────────────── */

  const handleFinish = useCallback(async () => {
    if (!userId) return

    setIsSaving(true)
    setError(null)

    try {
      const { data, error: updateError } = await (supabase
        .from('user_profiles')
        .update as any)({ personality_type: personality.key })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) throw updateError

      if (data) {
        setUser({ ...(user ?? data), ...(data as any) })
      }

      navigate('/discover')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }, [userId, personality.key, navigate, setUser, user])

  return (
    <motion.div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0F0E0C] px-6 pb-10 pt-14"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ── Ambient glow — uses personality accent ─── */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] transition-colors duration-1000"
        style={{ backgroundColor: `${personality.accent}12` }}
      />

      {/* ── Step indicator ────────────────────── */}
      <div className="absolute top-14 left-0 right-0 z-10 flex flex-col items-center gap-3">
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

      {/* ── Content area ──────────────────────── */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <AnimatePresence mode="wait">
          {/* ════════════════════════════════════
             Phase 1 — Analysing
             ════════════════════════════════════ */}
          {phase === 'analysing' && (
            <motion.div
              key="analysing"
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {/* Pulsing rings */}
              <div className="relative flex h-28 w-28 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#FF4D00]/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border-2 border-[#FF4D00]/20"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.3,
                  }}
                />
                <motion.div
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FF4D00]/10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <span className="text-4xl">🧬</span>
                </motion.div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <h2
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Analysing your taste
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    ...
                  </motion.span>
                </h2>
                <p className="text-sm text-[#8E8E93]">
                  Crunching your food DNA
                </p>
              </div>

              {/* Fake progress bar */}
              <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF4D00] to-[#FF0080]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: ANALYSIS_DURATION / 1000, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════
             Phase 2 — Revealed
             ════════════════════════════════════ */}
          {phase === 'revealed' && (
            <motion.div
              key="revealed"
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Heading */}
              <motion.p
                className="text-sm font-medium text-[#8E8E93]"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                Your food personality is ready 🎉
              </motion.p>

              {/* Large emoji reveal */}
              <motion.div
                className="relative flex h-32 w-32 items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.25, 1] }}
                transition={{
                  duration: 0.7,
                  times: [0, 0.6, 1],
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* Glow ring behind emoji */}
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-40"
                  style={{ backgroundColor: personality.accent }}
                />
                <span className="relative text-7xl drop-shadow-lg">
                  {personality.emoji}
                </span>
              </motion.div>

              {/* Personality name with glow */}
              <motion.h1
                className="text-center text-4xl font-extrabold tracking-tight"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: '#FF4D00',
                  textShadow: '0 0 40px rgba(255, 77, 0, 0.4), 0 0 80px rgba(255, 77, 0, 0.15)',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {personality.name}
              </motion.h1>

              {/* Description */}
              <motion.p
                className="max-w-xs text-center text-sm leading-relaxed text-[#B0B0B5]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {personality.description}
              </motion.p>

              {/* Personality badge chip */}
              <motion.div
                className="flex items-center gap-2 rounded-full border px-4 py-2"
                style={{
                  borderColor: `${personality.accent}40`,
                  backgroundColor: `${personality.accent}10`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="text-base">{personality.emoji}</span>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: personality.accent }}
                >
                  {personality.name}
                </span>
              </motion.div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}

              {/* CTA Button */}
              <motion.button
                type="button"
                id="personality-finish-btn"
                onClick={handleFinish}
                disabled={isSaving}
                className="mt-4 w-full max-w-xs overflow-hidden rounded-xl bg-[#FF4D00] py-4 text-base font-bold text-white
                           transition-all duration-200 active:scale-[0.97]
                           disabled:pointer-events-none disabled:opacity-40"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.03, backgroundColor: '#FF7A3D' }}
                whileTap={{ scale: 0.97 }}
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Let's eat!
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </span>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
