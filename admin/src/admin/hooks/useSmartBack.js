import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Smart back navigation:
 * - If history exists → go back
 * - If no history (direct URL access) → go to fallback
 */
export function useSmartBack(fallback = '/admin/dashboard') {
  const navigate = useNavigate()

  const goBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return goBack
}
