import { create } from 'zustand'
import type { UserProfile, UserPreferences } from '@/types'

interface UserState {
  user: UserProfile | null
  preferences: UserPreferences | null
  setUser: (user: UserProfile) => void
  setPreferences: (prefs: UserPreferences) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  preferences: null,

  setUser: (user) => set({ user }),

  setPreferences: (preferences) => set({ preferences }),

  clearUser: () => set({ user: null, preferences: null }),
}))
