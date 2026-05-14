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
   // v4: uses live Google Places results from parent via props
   ────────────────────────────────────────────── */

interface MapViewProps {
  restaurants: Restaurant[]
  savedPlaceIds: Set<string>
  /** Called when the user pans/zooms — parent should fetch more restaurants for this center */
  onViewportDiscover?: (lat: number, lng: number) => void
}

interface SelectedRestaurant extends Restaurant {
  _pixelX?: number
  _pixelY?: number
}

export default function MapView({ restaurants, onViewportDiscover }: MapViewProps) {
  const navigate = useNavigate()
  const { lat, lng } = useLocation()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement | google.maps.Marker>>(new Map())

  const [apiReady, setApiReady] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [selected, setSelected] = useState<SelectedRestaurant | null>(null)

  // ── Load Google Maps API ──
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setApiReady(true))
      .catch((err) => console.error('[MapView] Failed to load maps:', err))
  }, [])

  // ── Init map when API is ready + we have a location ──
  useEffect(() => {
    if (!apiReady || !mapRef.current || lat === null || lng === null) return

    const map = initMap(mapRef.current, { lat, lng }, 14)
    mapInstance.current = map

    // User blue dot
    addUserMarker(map, { lat, lng })

    // ── Viewport discovery: fetch more restaurants when user pans/zooms ──
    let idleTimer: ReturnType<typeof setTimeout> | null = null
    const idleListener = map.addListener('idle', () => {
      if (!onViewportDiscover) return
      // Debounce: wait 1.5s after last idle before fetching
      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        const center = map.getCenter()
        if (center) {
          onViewportDiscover(center.lat(), center.lng())
        }
      }, 1500)
    })

    // Signal that the map is ready for markers
    setMapReady(true)

    return () => {
      if (idleTimer) clearTimeout(idleTimer)
      google.maps.event.removeListener(idleListener)
      mapInstance.current = null
      setMapReady(false)
    }
  }, [apiReady, lat, lng, onViewportDiscover])

  // ── Place restaurant markers (merge new, keep existing) ──
  useEffect(() => {
    const map = mapInstance.current
    if (!map || !mapReady) return

    // Track which IDs are in the current restaurants list
    const currentIds = new Set(restaurants.map((r) => r.google_place_id))

    // Remove markers for restaurants no longer in the list
    for (const [id, marker] of markersRef.current) {
      if (!currentIds.has(id)) {
        if ('setMap' in marker) (marker as google.maps.Marker).setMap(null)
        markersRef.current.delete(id)
      }
    }

    // Add markers for new restaurants (skip already-placed ones)
    restaurants.forEach((r) => {
      if (markersRef.current.has(r.google_place_id)) return // already on map
      const marker = addRestaurantMarker(map, r, () => {
        setSelected(r)
      })
      markersRef.current.set(r.google_place_id, marker)
    })
  }, [restaurants, mapReady])

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
      {!mapReady && (
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
                onClick={() => navigate(`/restaurant/${selected.google_place_id}`)}
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
