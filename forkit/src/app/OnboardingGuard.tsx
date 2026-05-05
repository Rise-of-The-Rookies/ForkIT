import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { useUserStore } from '@/store/userStore'
import { supabase } from '@/lib/supabase'

/* ──────────────────────────────────────────────
   OnboardingGuard
   Protects /onboarding/* routes:
   - No session             → redirect to /
   - Session + already onboarded → redirect to /discover
   - Session + onboarding incomplete → render children
   ────────────────────────────────────────────── */

export default function OnboardingGuard() {
  const { session, loading: authLoading } = useAuthStore()
  const { user, setUser } = useUserStore()
  const [profileLoading, setProfileLoading] = useState(true)

  /* ── Fetch user profile on mount ───────────── */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) {
        setProfileLoading(false)
        return
      }

      if (user && user.id === session.user.id) {
        setProfileLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!error && data) {
          setUser(data)
        }
      } catch {
        // No profile yet — expected for new users
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [session?.user?.id, user, setUser])

  /* ── Loading ──────────────────────────────── */

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0F0E0C]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-3 border-[#FF4D00]/30 border-t-[#FF4D00]" />
            <span className="text-lg">🍴</span>
          </div>
          <span className="text-sm font-medium text-[#8E8E93]">
            Loading…
          </span>
        </div>
      </div>
    )
  }

  /* ── Not logged in → welcome page ─────────── */
  if (!session) {
    return <Navigate to="/" replace />
  }

  /* ── Already completed onboarding → app ───── */
  if (user?.personality_type) {
    return <Navigate to="/discover" replace />
  }

  /* ── In progress — render onboarding screens ─ */
  return <Outlet />
}
