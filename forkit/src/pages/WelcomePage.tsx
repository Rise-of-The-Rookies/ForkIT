import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/features/auth/useAuth'

/* ──────────────────────────────────────────────
   WelcomePage — Sign-in / Sign-up with email & Google
   Brand: primary #FF4D00, dark bg #0F0E0C
   ────────────────────────────────────────────── */

type Mode = 'sign-in' | 'sign-up'

export default function WelcomePage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading } =
    useAuth()

  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (mode === 'sign-in') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
  }

  const handleGoogle = async () => {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Google sign-in failed. Please try again.')
      }
    }
  }

  const toggleMode = () => {
    setError(null)
    setMode((m) => (m === 'sign-in' ? 'sign-up' : 'sign-in'))
  }

  /* ── Framer Motion helpers ────────────────── */

  const containerVariants: any = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const formVariants: any = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: -12,
      transition: { duration: 0.2 },
    },
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0F0E0C] px-6 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#FF4D00]/10 blur-[120px]" />

      <motion.div
        className="relative z-10 flex w-full max-w-sm flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Logo & tagline ──────────────────── */}
        <h1
          className="mb-1 text-5xl font-extrabold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Fork<span className="text-[#FF4D00]">It</span>{' '}
          <span className="inline-block origin-bottom-right animate-[wiggle_1.5s_ease-in-out_infinite]">
            🍴
          </span>
        </h1>
        <p className="mb-10 text-base text-[#8E8E93]">
          Stop arguing. Start eating.
        </p>

        {/* ── Google button ───────────────────── */}
        <button
          type="button"
          id="google-sign-in-btn"
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5
                     px-4 py-3.5 text-sm font-semibold text-white backdrop-blur-sm
                     transition-all duration-200 hover:bg-white/10 active:scale-[0.97]
                     disabled:pointer-events-none disabled:opacity-50"
        >
          {/* Google "G" SVG */}
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84Z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* ── Divider ─────────────────────────── */}
        <div className="my-6 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-widest text-[#8E8E93]">
            or
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* ── Email / Password form ───────────── */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            onSubmit={handleSubmit}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex w-full flex-col gap-3"
          >
            <label htmlFor="email-input" className="sr-only">
              Email
            </label>
            <input
              id="email-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white
                         placeholder:text-[#8E8E93] outline-none transition-colors
                         focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00]/40"
            />

            <label htmlFor="password-input" className="sr-only">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white
                         placeholder:text-[#8E8E93] outline-none transition-colors
                         focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00]/40"
            />

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="relative mt-1 w-full overflow-hidden rounded-xl bg-[#FF4D00] py-3.5 text-sm font-bold text-white
                         transition-all duration-200 hover:bg-[#FF7A3D] active:scale-[0.97]
                         disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Please wait…
                </span>
              ) : mode === 'sign-in' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        {/* ── Toggle between sign-in and sign-up ─ */}
        <p className="mt-6 text-sm text-[#8E8E93]">
          {mode === 'sign-in' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                id="toggle-auth-mode-btn"
                onClick={toggleMode}
                className="font-semibold text-[#FF4D00] transition-colors hover:text-[#FF7A3D]"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                id="toggle-auth-mode-btn"
                onClick={toggleMode}
                className="font-semibold text-[#FF4D00] transition-colors hover:text-[#FF7A3D]"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </motion.div>

      {/* ── Custom wiggle keyframe (Tailwind v4 @theme) ── */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(12deg); }
          75% { transform: rotate(-12deg); }
        }
      `}</style>
    </div>
  )
}
