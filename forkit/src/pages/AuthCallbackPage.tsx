import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/userStore'
import type { UserProfile } from '@/types'

/* ──────────────────────────────────────────────
   AuthCallbackPage
   Handles the redirect after Google (or any OAuth)
   sign-in. Waits for the session to be available,
   then routes to onboarding or the main app.
   ────────────────────────────────────────────── */

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setUser } = useUserStore()

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase extracts the token from the URL fragment automatically
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        // No session → go back to welcome
        navigate('/', { replace: true })
        return
      }

      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profile) {
        setUser(profile as UserProfile)

        if ((profile as UserProfile).personality_type) {
          navigate('/discover', { replace: true })
        } else {
          navigate('/onboarding/profile', { replace: true })
        }
      } else {
        // Brand-new user → start onboarding
        navigate('/onboarding/profile', { replace: true })
      }
    }

    handleCallback()
  }, [navigate, setUser])

  /* ── Show a branded loading spinner while processing ── */
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0F0E0C]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-3 border-[#FF4D00]/30 border-t-[#FF4D00]" />
          <span className="text-lg">🍴</span>
        </div>
        <span className="text-sm font-medium text-[#8E8E93]">
          Signing you in…
        </span>
      </div>
    </div>
  )
}
