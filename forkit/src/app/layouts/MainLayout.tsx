import { Outlet } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'

/**
 * MainLayout — wraps every "logged-in" route.
 * Renders the page content via <Outlet /> and pins the
 * bottom navigation bar beneath it.
 */
export default function MainLayout() {
  return (
    <div className="relative min-h-dvh bg-[var(--color-bg)] text-[var(--color-text)] pb-20">
      <Outlet />
      <BottomNav />
    </div>
  )
}
