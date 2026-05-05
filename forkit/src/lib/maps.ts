/* ──────────────────────────────────────────────
   ForkIt — Google Maps JS API helpers
   Dark-themed map · Custom markers · Init
   ────────────────────────────────────────────── */

const API_KEY = import.meta.env.VITE_GOOGLE_KEY as string

// ─── Dark map style (matches ForkIt dark theme) ──

export const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1a1917' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1917' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6e6e6e' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9e9e9e' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6e6e6e' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1e2a1e' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a7c4a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2a2926' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1917' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3c3a35' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1917' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a8a' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#252420' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6e6e6e' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1a2a' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3a5a7c' }],
  },
]

// ─── Load the Maps JS API dynamically ────────

let loadPromise: Promise<void> | null = null

export function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=marker&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })

  return loadPromise
}

// ─── Init map ────────────────────────────────

export function initMap(
  element: HTMLElement,
  center: { lat: number; lng: number },
  zoom = 14,
): google.maps.Map {
  const map = new google.maps.Map(element, {
    center,
    zoom,
    styles: DARK_MAP_STYLE,
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
    backgroundColor: '#1a1917',
  })

  return map
}

// ─── Custom marker ───────────────────────────

export interface MarkerRestaurant {
  id: string
  name: string
  rating: number
  lat: number
  lng: number
  cuisine: string
  photos: string[]
}

export function addRestaurantMarker(
  map: google.maps.Map,
  restaurant: MarkerRestaurant,
  onClick: () => void,
): google.maps.marker.AdvancedMarkerElement | google.maps.Marker {
  // Build custom marker HTML
  const markerEl = document.createElement('div')
  markerEl.className = 'map-marker'
  markerEl.innerHTML = `
    <span class="map-marker__name">${escapeHtml(restaurant.name.length > 18 ? restaurant.name.slice(0, 18) + '…' : restaurant.name)}</span>
    <span class="map-marker__rating">⭐ ${restaurant.rating.toFixed(1)}</span>
  `

  // Try AdvancedMarkerElement first, fall back to regular Marker
  try {
    if (google.maps.marker?.AdvancedMarkerElement) {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: restaurant.lat, lng: restaurant.lng },
        content: markerEl,
        title: restaurant.name,
      })
      marker.addListener('click', onClick)
      return marker
    }
  } catch {
    // Fall through to legacy marker
  }

  // Legacy fallback — simple circle marker
  const marker = new google.maps.Marker({
    map,
    position: { lat: restaurant.lat, lng: restaurant.lng },
    title: restaurant.name,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#FF4D00',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2,
      scale: 8,
    },
  })

  marker.addListener('click', onClick)
  return marker
}

// ─── Create user location marker ─────────────

export function addUserMarker(
  map: google.maps.Map,
  position: { lat: number; lng: number },
): google.maps.Marker {
  return new google.maps.Marker({
    map,
    position,
    title: 'Your location',
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 3,
      scale: 8,
    },
    zIndex: 999,
  })
}

// ─── Utils ───────────────────────────────────

function escapeHtml(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
