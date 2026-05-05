import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import { useUserStore } from '@/store/userStore'

/* ──────────────────────────────────────────────
   ProfileSetupPage — Step 1 of 4
   Avatar upload + display name + bio
   ────────────────────────────────────────────── */

const TOTAL_STEPS = 4
const CURRENT_STEP = 1

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const { setUser } = useUserStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userId = session?.user?.id

  /* ── Derived state ───────────────────────── */

  const isValid = displayName.trim().length >= 2
  const bioCharCount = bio.length
  const BIO_MAX = 120
  const NAME_MAX = 30

  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return displayName.trim().slice(0, 2).toUpperCase() || '?'
  }, [displayName])

  /* ── Avatar file selection ───────────────── */

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    // Preview immediately
    const objectUrl = URL.createObjectURL(file)
    setAvatarPreview(objectUrl)
    setAvatarFile(file)

    // Upload to Supabase Storage
    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Simulate progress since supabase-js v2 doesn't expose upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const filePath = `${userId}/avatar.jpg`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        })

      clearInterval(progressInterval)

      if (uploadError) {
        throw uploadError
      }

      setUploadProgress(100)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setError(message)
      setAvatarPreview(null)
      setAvatarFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  /* ── Save & continue ─────────────────────── */

  const handleContinue = async () => {
    if (!isValid || !userId) return

    setIsSaving(true)
    setError(null)

    try {
      // Build avatar URL if file was uploaded
      let avatarUrl: string | null = null
      if (avatarFile) {
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(`${userId}/avatar.jpg`)
        avatarUrl = data.publicUrl
      }

      // Upsert user profile
      const { data, error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(
          {
            id: userId,
            display_name: displayName.trim(),
            avatar_url: avatarUrl,
            bio: bio.trim() || null,
          },
          { onConflict: 'id' },
        )
        .select()
        .single()

      if (upsertError) throw upsertError

      // Sync to Zustand store
      if (data) {
        setUser(data)
      }

      navigate('/onboarding/food-dna')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  /* ── Progress ring SVG helpers ───────────── */

  const ringRadius = 44
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference - (uploadProgress / 100) * ringCircumference

  /* ── Animation variants ──────────────────── */

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

      {/* ── Step indicator ────────────────────── */}
      <div className="relative z-10 mb-10 flex flex-col items-center gap-3">
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
      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col">
        {/* Heading */}
        <motion.h1
          className="mb-8 text-center text-3xl font-extrabold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          What should we call you?
        </motion.h1>

        {/* ── Avatar upload ─────────────────── */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            id="avatar-upload-btn"
            onClick={handleAvatarClick}
            className="group relative flex h-20 w-20 items-center justify-center rounded-full
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0E0C]"
            aria-label="Upload avatar photo"
          >
            {/* Background circle / avatar preview */}
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1C1C22] transition-colors group-hover:bg-[#252528]">
                {displayName.trim() ? (
                  <span
                    className="text-xl font-bold text-[#FF4D00]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {initials}
                  </span>
                ) : (
                  /* Camera icon placeholder */
                  <svg
                    className="h-7 w-7 text-[#8E8E93] transition-colors group-hover:text-[#FF4D00]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.9 47.9 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
                    />
                  </svg>
                )}
              </div>
            )}

            {/* Upload progress ring */}
            {isUploading && (
              <svg
                className="absolute -inset-1 animate-spin-slow"
                viewBox="0 0 96 96"
                fill="none"
              >
                <circle
                  cx="48"
                  cy="48"
                  r={ringRadius}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={ringRadius}
                  stroke="#FF4D00"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-[stroke-dashoffset] duration-200 ease-out"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
              </svg>
            )}

            {/* Completed check */}
            {!isUploading && uploadProgress === 100 && (
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#00A86B] shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <svg
                  className="h-3.5 w-3.5 text-white"
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

            {/* Hover overlay */}
            {!isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/30">
                <svg
                  className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="avatar-file-input"
            onChange={handleFileChange}
          />
        </motion.div>

        {/* ── Display name input ────────────── */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <label htmlFor="display-name-input" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-[#8E8E93]">
            Display name
          </label>
          <input
            id="display-name-input"
            type="text"
            placeholder="e.g. Nasi Lemak King"
            value={displayName}
            onChange={(e) => {
              if (e.target.value.length <= NAME_MAX) {
                setDisplayName(e.target.value)
              }
            }}
            required
            minLength={2}
            maxLength={NAME_MAX}
            autoComplete="nickname"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white
                       placeholder:text-[#8E8E93]/60 outline-none transition-colors
                       focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00]/40"
          />
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs text-[#8E8E93]/60">
              {displayName.length < 2 && displayName.length > 0
                ? 'At least 2 characters'
                : '\u00A0'}
            </span>
            <span className="text-xs text-[#8E8E93]/60">
              {displayName.length}/{NAME_MAX}
            </span>
          </div>
        </motion.div>

        {/* ── Bio textarea ──────────────────── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <label htmlFor="bio-input" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-[#8E8E93]">
            Short bio <span className="normal-case tracking-normal text-[#8E8E93]/50">(optional)</span>
          </label>
          <textarea
            id="bio-input"
            placeholder="Tell people what you love eating…"
            value={bio}
            onChange={(e) => {
              if (e.target.value.length <= BIO_MAX) {
                setBio(e.target.value)
              }
            }}
            maxLength={BIO_MAX}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white
                       placeholder:text-[#8E8E93]/60 outline-none transition-colors
                       focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00]/40"
          />
          <div className="mt-1.5 flex justify-end">
            <span
              className={`text-xs transition-colors ${
                bioCharCount >= BIO_MAX ? 'text-red-400' : 'text-[#8E8E93]/60'
              }`}
            >
              {bioCharCount}/{BIO_MAX}
            </span>
          </div>
        </motion.div>

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

        {/* ── Continue button ───────────────── */}
        <motion.button
          type="button"
          id="profile-continue-btn"
          onClick={handleContinue}
          disabled={!isValid || isSaving || isUploading}
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

      {/* ── Custom keyframe for slow spin on progress ring ── */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </motion.div>
  )
}
