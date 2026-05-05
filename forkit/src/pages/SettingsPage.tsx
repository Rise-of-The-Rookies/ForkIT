import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/features/auth/useAuth'

/* ──────────────────────────────────────────────
   SettingsPage — theme, preferences, sign out
   ────────────────────────────────────────────── */

type ThemePref = 'dark' | 'light' | 'system'

const THEME_OPTIONS: { label: string; value: ThemePref; icon: string }[] = [
  { label: 'Dark', value: 'dark', icon: '🌙' },
  { label: 'Light', value: 'light', icon: '☀️' },
  { label: 'System', value: 'system', icon: '💻' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { preference, setTheme } = useTheme()
  const { signOut } = useAuth()

  return (
    <div className="settings-page">
      {/* ── Header ── */}
      <header className="settings-page__header">
        <button
          className="settings-page__back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="settings-page__title">Settings</h1>
        <div style={{ width: 22 }} /> {/* spacer for centering */}
      </header>

      {/* ── Theme toggle ── */}
      <section className="settings-page__section">
        <h2 className="settings-page__section-title">Appearance</h2>
        <div className="settings-page__theme-row">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`settings-page__theme-pill ${preference === opt.value ? 'settings-page__theme-pill--active' : ''}`}
              onClick={() => setTheme(opt.value)}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Preferences ── */}
      <section className="settings-page__section">
        <h2 className="settings-page__section-title">Preferences</h2>

        <button
          className="settings-page__row-btn"
          onClick={() => navigate('/onboarding/food-dna')}
        >
          <span className="settings-page__row-icon">🍜</span>
          <span className="settings-page__row-text">Edit Food Preferences</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button
          className="settings-page__row-btn"
          onClick={() => navigate('/onboarding/dining-style')}
        >
          <span className="settings-page__row-icon">💰</span>
          <span className="settings-page__row-text">Edit Budget & Distance</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </section>

      {/* ── Account ── */}
      <section className="settings-page__section">
        <h2 className="settings-page__section-title">Account</h2>

        <button
          className="settings-page__signout-btn"
          onClick={signOut}
        >
          Sign Out
        </button>
      </section>

      {/* ── Version ── */}
      <footer className="settings-page__footer">
        <p className="settings-page__version">ForkIt v0.1.0 — MVP</p>
        <p className="settings-page__credit">Made with 🍴 in Kuala Lumpur</p>
      </footer>
    </div>
  )
}
