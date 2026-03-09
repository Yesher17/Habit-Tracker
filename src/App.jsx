import { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import Today from './pages/Today'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import ErrorBoundary from './components/ErrorBoundary'
import { useHabits } from './hooks/useHabits'
import { loadUserData, logoutUser } from './utils/storage'

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export default function App() {
  const [page, setPage] = useState('today')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const habitsApi = useHabits()
  const lastActivityRef = useRef(Date.now())
  const timeoutRef = useRef(null)

  // Check if user is already logged in on mount
  useEffect(() => {
    const userData = loadUserData()
    if (userData) {
      setUserName(userData.name)
      setIsLoggedIn(true)
    }
    setLoading(false)
  }, [])

  // Session timeout logic
  useEffect(() => {
    if (!isLoggedIn) return

    const resetTimeout = () => {
      lastActivityRef.current = Date.now()
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        handleSessionTimeout()
      }, SESSION_TIMEOUT)
    }

    const handleSessionTimeout = () => {
      logoutUser()
      setIsLoggedIn(false)
      alert('Session expired. Please login again.')
    }

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    events.forEach(event => {
      window.addEventListener(event, resetTimeout)
    })

    // Initial timeout
    resetTimeout()

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isLoggedIn])

  const handleLoginSuccess = (name) => {
    setUserName(name)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0f0f0f] font-sans">
        <Navbar page={page} setPage={setPage} userName={userName} setOnLogout={handleLogout} />
        <main className="pt-14">
          {page === 'today' ? (
            <Today {...habitsApi} />
          ) : (
            <Analytics habits={habitsApi.habits} />
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}
