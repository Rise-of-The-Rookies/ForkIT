import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'
import { useUserStore } from '@/store/userStore'
import type { UserProfile } from '@/types'

/* ──────────────────────────────────────────────
   useAuth — hook for authentication actions
   (Session listener lives in AuthProvider)
   ────────────────────────────────────────────── */

export function useAuth() {
  const navigate = useNavigate()
  const { session, loading, setLoading } = useAuthStore()
  const { setUser, clearUser } = useUserStore()

  /* ── Fetch user row from `users` table ────── */

  const fetchUserProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error || !data) return null
      return data as UserProfile
    },
    [],
  )

  /* ── Route after sign-in based on onboarding status ── */

  const routeAfterAuth = useCallback(
    async (userId: string) => {
      const profile = await fetchUserProfile(userId)

      if (profile) {
        setUser(profile)

        if (profile.personality_type) {
          navigate('/discover', { replace: true })
        } else {
          navigate('/onboarding/profile', { replace: true })
        }
      } else {
        // No row yet → brand-new user
        navigate('/onboarding/profile', { replace: true })
      }
    },
    [fetchUserProfile, navigate, setUser],
  )

  /* ── Auth actions ─────────────────────────── */

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setLoading(false)
        throw error
      }

      // Session will be set by AuthProvider; route manually
      const {
        data: { session: freshSession },
      } = await supabase.auth.getSession()
      if (freshSession?.user) {
        await routeAfterAuth(freshSession.user.id)
      }
      setLoading(false)
    },
    [setLoading, routeAfterAuth],
  )

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setLoading(false)
        throw error
      }

      const {
        data: { session: freshSession },
      } = await supabase.auth.getSession()
      if (freshSession?.user) {
        await routeAfterAuth(freshSession.user.id)
      }
      setLoading(false)
    },
    [setLoading, routeAfterAuth],
  )

  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect to the app root — AuthProvider + ProtectedRoute
        // will handle routing to onboarding or discover
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setLoading(false)
      throw error
    }
    // OAuth redirects away, so loading stays true until the user returns
  }, [setLoading])

  const signOut = useCallback(async () => {
    setLoading(true)
    await supabase.auth.signOut()
    clearUser()
    navigate('/', { replace: true })
  }, [setLoading, clearUser, navigate])

  return {
    user: session?.user ?? null,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  }
}
