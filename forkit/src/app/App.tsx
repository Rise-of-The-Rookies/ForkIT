import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useTheme } from '@/hooks/useTheme'
import AuthProvider from '@/features/auth/AuthProvider'

export default function App() {
  // Initialize theme on mount (applies data-theme to <html>)
  useTheme()

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
