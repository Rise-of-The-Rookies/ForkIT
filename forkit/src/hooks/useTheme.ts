import { useState, useEffect, useCallback } from 'react'

/* ──────────────────────────────────────────────
   useTheme — dark / light / system theme manager
   Persists preference in localStorage.
   Applies data-theme attribute on <html>.
   ────────────────────────────────────────────── */

const STORAGE_KEY = 'forkit-theme'

type ThemePreference = 'dark' | 'light' | 'system'
type ResolvedTheme = 'dark' | 'light'

function getStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored
    }
  } catch {
    // localStorage may be unavailable (SSR, private browsing)
  }
  return 'dark' // default
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return preference
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    getStoredPreference,
  )
  const [currentTheme, setCurrentTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(getStoredPreference()),
  )

  /* ── Apply on mount and when preference changes ── */
  useEffect(() => {
    const resolved = resolveTheme(preference)
    setCurrentTheme(resolved)
    applyTheme(resolved)
  }, [preference])

  /* ── Listen for OS-level theme changes when set to 'system' ── */
  useEffect(() => {
    if (preference !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e: MediaQueryListEvent) => {
      const resolved: ResolvedTheme = e.matches ? 'dark' : 'light'
      setCurrentTheme(resolved)
      applyTheme(resolved)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [preference])

  /* ── Set theme preference ─────────────────── */
  const setTheme = useCallback((newPreference: ThemePreference) => {
    setPreferenceState(newPreference)
    try {
      localStorage.setItem(STORAGE_KEY, newPreference)
    } catch {
      // Fail silently
    }
  }, [])

  return {
    /** The user's raw preference ('dark' | 'light' | 'system') */
    preference,
    /** The resolved theme currently applied ('dark' | 'light') */
    currentTheme,
    /** Update the theme preference */
    setTheme,
  }
}
