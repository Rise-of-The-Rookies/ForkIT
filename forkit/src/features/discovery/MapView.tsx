import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loadGoogleMaps,
  initMap,
  addRestaurantMarker,
  addUserMarker,
} from '@/lib/maps'
import { getPhotoUrl } from '@/lib/places'
import { useLocation } from '@/hooks/useLocation'
import type { Restaurant } from '@/types'

/* ──────────────────────────────────────────────
   MapView — Google Maps with custom markers
   ────────────────────────────────────────────── */

interface MapViewProps {
  restaurants: Restaurant[]
  savedPlaceIds: Set<string>
}

interface SelectedRestaurant extends Restaurant {
  _pixelX?: number
  _pixelY?: number
}

export default function MapView({ restaurants }: MapViewProps) {
  const navigate = useNavigate()
  const { lat, lng } = useLocation()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<(google.maps.marker.AdvancedMarkerElement | google.maps.Marker)[]>([])

  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<SelectedRestaurant | null>(null)

  // ── Load Google Maps API ──
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setReady(true))
      .catch((err) => console.error('[MapView] Failed to load maps:', err))
  }, [])

  // ── Init map when API is ready + we have a location ──
  useEffect(() => {
    if (!ready || !mapRef.current || lat === null || lng === null) return

    const map = initMap(mapRef.current, { lat, lng }, 14)
    mapInstance.current = map

    // User blue dot
    addUserMarker(map, { lat, lng })

    return () => {
      mapInstance.current = null
    }
  }, [ready, lat, lng])

  // ── Place restaurant markers ──
  useEffect(() => {
    const map = mapInstance.current
    if (!map || !ready) return

    // Clear old markers
    markersRef.current.forEach((m) => {
      if ('setMap' in m) (m as google.maps.Marker).setMap(null)
    })
    markersRef.current = []

    restaurants.forEach((r) => {
      const marker = addRestaurantMarker(map, r, () => {
        setSelected(r)
      })
      markersRef.current.push(marker)
    })
  }, [restaurants, ready])

  // ── Recenter ──
  const recenter = useCallback(() => {
    if (mapInstance.current && lat !== null && lng !== null) {
      mapInstance.current.panTo({ lat, lng })
      mapInstance.current.setZoom(14)
    }
  }, [lat, lng])

  // ── Zoom controls ──
  const zoomIn = () => {
    if (mapInstance.current) {
      mapInstance.current.setZoom((mapInstance.current.getZoom() ?? 14) + 1)
    }
  }
  const zoomOut = () => {
    if (mapInstance.current) {
      mapInstance.current.setZoom((mapInstance.current.getZoom() ?? 14) - 1)
    }
  }

  // Photo for the info card
  const selectedPhoto =
    selected && selected.photos.length > 0
      ? selected.photos[0].startsWith('http')
        ? selected.photos[0]
        : getPhotoUrl(selected.photos[0], 400)
      : null

  return (
    <div className="map-view">
      {/* Map container */}
      <div ref={mapRef} className="map-view__canvas" />

      {/* Loading overlay */}
      {!ready && (
        <div className="map-view__loading">
          <div className="map-view__spinner" />
          <span>Loading map…</span>
        </div>
      )}

      {/* Map controls */}
      <div className="map-view__controls">
        <button className="map-view__ctrl-btn" onClick={zoomIn} aria-label="Zoom in">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button className="map-view__ctrl-btn" onClick={zoomOut} aria-label="Zoom out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button className="map-view__ctrl-btn map-view__ctrl-btn--accent" onClick={recenter} aria-label="Recenter">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </button>
      </div>

      {/* Info card overlay */}
      {selected && (
        <div className="map-view__info-card" onClick={() => setSelected(null)}>
          <div className="map-view__info-inner" onClick={(e) => e.stopPropagation()}>
            {selectedPhoto && (
              <img
                src={selectedPhoto}
                alt={selected.name}
                className="map-view__info-photo"
                loading="lazy"
              />
            )}
            <div className="map-view__info-body">
              <h4 className="map-view__info-name">{selected.name}</h4>
              <div className="map-view__info-meta">
                <span className="map-view__info-cuisine">{selected.cuisine}</span>
                <span className="map-view__info-rating">⭐ {selected.rating.toFixed(1)}</span>
              </div>
              <button
                className="map-view__info-btn"
                onClick={() => navigate(`/restaurant/${selected.id}`)}
              >
                View Details
              </button>
            </div>
            <button
              className="map-view__info-close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
