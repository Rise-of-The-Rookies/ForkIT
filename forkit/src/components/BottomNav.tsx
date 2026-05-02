import { NavLink } from 'react-router-dom'

/* ── Tab definitions ─────────────────────────────────── */
const tabs = [
  {
    to: '/discover',
    label: 'Discover',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    to: '/feed',
    label: 'Feed',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    to: '/forky',
    label: 'Forky',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 14 22h-4a7 7 0 0 1-6.73-3H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
        <path d="M10 15.5a1 1 0 1 0-2 0 1 1 0 0 0 2 0z" />
        <path d="M16 15.5a1 1 0 1 0-2 0 1 1 0 0 0 2 0z" />
      </svg>
    ),
  },
  {
    to: '/trending',
    label: 'Trending',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
] as const

/* ── Component ───────────────────────────────────────── */
export default function BottomNav() {
  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-[var(--color-bg)]/80 backdrop-blur-xl"
    >
      <ul className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-[#FF4D00] scale-105'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'drop-shadow-[0_0_6px_rgba(255,77,0,0.5)]' : ''}>
                    {tab.icon}
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide">
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-[#FF4D00]" />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
