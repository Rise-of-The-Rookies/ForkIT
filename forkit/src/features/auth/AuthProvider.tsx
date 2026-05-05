import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'
import { useUserStore } from '@/store/userStore'
import type { UserProfile } from '@/types'

/* ──────────────────────────────────────────────
   AuthProvider — global auth listener
   Mount once at the app root so every route
   (including OAuth callbacks) picks up the session.
   ────────────────────────────────────────────── */

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data as UserProfile
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { setSession, clearSession } = useAuthStore()
  const { setUser, clearUser } = useUserStore()

  useEffect(() => {
    // 1. Grab existing session on mount
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)

      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id).then((profile) => {
          if (profile) setUser(profile)
        })
      }
    })

    // 2. Subscribe to future auth events (incl. OAuth callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)

      if (newSession?.user) {
        fetchUserProfile(newSession.user.id).then((profile) => {
          if (profile) setUser(profile)
        })
      } else {
        clearUser()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setSession, clearSession, setUser, clearUser])

  return <>{children}</>
}
