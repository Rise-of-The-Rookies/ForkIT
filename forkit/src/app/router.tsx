import { createBrowserRouter } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './ProtectedRoute'
import OnboardingGuard from './OnboardingGuard'

// -- Pages --
import WelcomePage from '@/pages/WelcomePage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
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
import SearchResultsPage from '@/pages/SearchResultsPage'

/**
 * Application router.
 *
 * Three-tier route groups:
 *   1. Standalone — Welcome (public, no nav)
 *   2. OnboardingGuard — logged-in but NOT yet completed onboarding
 *   3. ProtectedRoute → MainLayout — logged-in AND onboarding complete
 */
export const router = createBrowserRouter([
  /* ── Public ─────────────────────────────────── */
  {
    path: '/',
    element: <WelcomePage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },

  /* ── Onboarding (requires auth, blocks if already onboarded) ── */
  {
    element: <OnboardingGuard />,
    children: [
      { path: '/onboarding/profile', element: <ProfileSetupPage /> },
      { path: '/onboarding/food-dna', element: <FoodDnaPage /> },
      { path: '/onboarding/dining-style', element: <DiningStylePage /> },
      { path: '/onboarding/personality', element: <PersonalityRevealPage /> },
    ],
  },

  /* ── Protected app routes (auth + onboarding required) ── */
  {
    element: <ProtectedRoute />,
    children: [
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
          { path: '/search', element: <SearchResultsPage /> },
        ],
      },
    ],
  },
])
