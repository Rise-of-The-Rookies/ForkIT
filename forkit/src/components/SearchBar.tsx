import { useState, useEffect, useRef } from 'react'

/* ──────────────────────────────────────────────
   SearchBar — with camera icon "coming soon" tooltip
   ────────────────────────────────────────────── */

export default function SearchBar() {
  const [showTooltip, setShowTooltip] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCameraClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setShowTooltip(true)
    timerRef.current = setTimeout(() => setShowTooltip(false), 2000)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Search input row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--surface-secondary, #1E1D1A)',
          borderRadius: '12px',
          padding: '10px 14px',
        }}
      >
        {/* Search icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-tertiary, #666)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        {/* Input */}
        <input
          type="text"
          placeholder="Search restaurants, cuisines..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary, #fff)',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        />

        {/* Camera icon — coming soon */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={handleCameraClick}
            aria-label="Vision Search"
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
              cursor: 'default',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.opacity = '0.5'
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary, #666)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#1E1D1A',
                color: '#fff',
                fontSize: '12px',
                borderRadius: '9999px',
                padding: '4px 12px',
                whiteSpace: 'nowrap',
                zIndex: 50,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                animation: 'tooltipFadeIn 0.2s ease',
              }}
            >
              Vision Search coming soon 👁️
            </div>
          )}
        </div>
      </div>

      {/* Tooltip animation keyframes */}
      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
