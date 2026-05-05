import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

/* ──────────────────────────────────────────────
   Auth Store — Zustand slice for Supabase session
   ────────────────────────────────────────────── */

interface AuthState {
  session: Session | null
  loading: boolean
  setSession: (session: Session | null) => void
  clearSession: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true, // starts true until initial session is resolved

  setSession: (session) => set({ session, loading: false }),

  clearSession: () => set({ session: null, loading: false }),

  setLoading: (loading) => set({ loading }),
}))
