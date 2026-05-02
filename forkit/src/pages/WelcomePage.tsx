import { useNavigate } from 'react-router-dom'

export default function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)] px-6">
      <h1 className="text-5xl font-extrabold tracking-tight mb-2">
        Fork<span className="text-[#FF4D00]">It</span>
      </h1>
      <p className="text-[var(--color-text-muted)] text-lg mb-10">
        Discover your next favourite meal
      </p>

      <button
        onClick={() => navigate('/onboarding/profile')}
        className="w-full max-w-xs py-3.5 rounded-2xl bg-[#FF4D00] text-white font-semibold text-base
                   hover:bg-[#FF7A3D] active:scale-[0.97] transition-all duration-200 cursor-pointer"
      >
        Get Started
      </button>

      <button
        onClick={() => navigate('/discover')}
        className="mt-4 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
      >
        Skip to Discover →
      </button>
    </div>
  )
}
