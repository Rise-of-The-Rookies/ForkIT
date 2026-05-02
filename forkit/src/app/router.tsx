import { createBrowserRouter } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'

// -- Pages (lazy-friendly stubs for now) --
import WelcomePage from '@/pages/WelcomePage'
import ProfileSetupPage from '@/pages/onboarding/ProfileSetupPage'
import FoodDnaPage from '@/pages/onboarding/FoodDnaPage'
import DiningStylePage from '@/pages/onboarding/DiningStylePage'
import PersonalityRevealPage from '@/pages/onboarding/PersonalityRevealPage'
import DiscoverPage from '@/pages/DiscoverPage'
import RestaurantDetailPage from '@/pages/RestaurantDetailPage'
import FeedPage from '@/pages/FeedPage'
import ForkyPage from '@/pages/ForkyPage'
import TrendingPage from '@/pages/TrendingPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'

/**
 * Application router.
 *
 * Two top-level groups:
 *   1. Standalone routes (no bottom nav) — Welcome & Onboarding
 *   2. MainLayout routes (with bottom nav) — all main app screens
 */
export const router = createBrowserRouter([
  /* ── Standalone (no nav) ──────────────────────────── */
  {
    path: '/',
    element: <WelcomePage />,
  },
  {
    path: '/onboarding/profile',
    element: <ProfileSetupPage />,
  },
  {
    path: '/onboarding/food-dna',
    element: <FoodDnaPage />,
  },
  {
    path: '/onboarding/dining-style',
    element: <DiningStylePage />,
  },
  {
    path: '/onboarding/personality',
    element: <PersonalityRevealPage />,
  },

  /* ── Main app (with bottom nav) ───────────────────── */
  {
    element: <MainLayout />,
    children: [
      { path: '/discover', element: <DiscoverPage /> },
      { path: '/restaurant/:id', element: <RestaurantDetailPage /> },
      { path: '/feed', element: <FeedPage /> },
      { path: '/forky', element: <ForkyPage /> },
      { path: '/trending', element: <TrendingPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
])
