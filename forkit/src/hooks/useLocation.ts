import { useState, useEffect } from 'react'

/* ──────────────────────────────────────────────
   useLocation — browser geolocation hook
   // v4: fresh GPS on every mount, no cross-session caching
   Falls back to Kuala Lumpur city centre on error.
   ────────────────────────────────────────────── */

// Default fallback: Kuala Lumpur centre
const KL_LAT = 3.139
const KL_LNG = 101.6869

export interface LocationState {
  lat: number | null
  lng: number | null
  loading: boolean
  error: string | null
}

export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    lat: null,
    lng: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Guard: no geolocation support
    if (!navigator.geolocation) {
      console.warn('[useLocation] Geolocation not supported — using KL fallback')
      setState({
        lat: KL_LAT,
        lng: KL_LNG,
        loading: false,
        error: 'Geolocation is not supported by this browser',
      })
      return
    }

    let cancelled = false

    navigator.geolocation.getCurrentPosition(
      // ── Success ──
      (position) => {
        if (cancelled) return
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null,
        })
      },
      // ── Error → fall back to KL ──
      (err) => {
        if (cancelled) return
        console.warn('[useLocation] Permission denied or error — using KL fallback:', err.message)
        setState({
          lat: KL_LAT,
          lng: KL_LNG,
          loading: false,
          error: err.message,
        })
      },
      // ── Options ──
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0, // v4: always request fresh position
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
