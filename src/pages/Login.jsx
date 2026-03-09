import { useState, useEffect } from 'react'
import { 
  loadUserData, 
  saveUserData, 
  verifyPin, 
  isAccountLocked, 
  getTimeUntilUnlock, 
  recordFailedAttempt, 
  recordSuccessfulLogin,
  getLoginAttempts 
} from '../utils/storage'
import { validateName, validatePin } from '../utils/sanitize'

export default function Login({ onLoginSuccess }) {
  const [step, setStep] = useState('enterPin')
  const [pin, setPin] = useState('')
  const [name, setName] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locked, setLocked] = useState(false)
  const [lockTimeLeft, setLockTimeLeft] = useState(0)

  // Check account lock status on mount
  useEffect(() => {
    if (isAccountLocked()) {
      setLocked(true)
      updateLockTimer()
    }
  }, [])

  // Update lock timer
  useEffect(() => {
    if (!locked) return
    const timer = setInterval(() => updateLockTimer(), 1000)
    return () => clearInterval(timer)
  }, [locked])

  const updateLockTimer = () => {
    const timeLeft = getTimeUntilUnlock()
    setLockTimeLeft(timeLeft)
    
    if (timeLeft <= 0) {
      setLocked(false)
      setError('')
    }
  }

  const handlePinSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Check if account is locked
    if (isAccountLocked()) {
      setLocked(true)
      const timeLeft = getTimeUntilUnlock()
      setLockTimeLeft(timeLeft)
      setError(`Account locked. Try again in ${timeLeft} seconds`)
      return
    }

    const pinValidation = validatePin(pin)
    if (!pinValidation.valid) {
      setError(pinValidation.error)
      return
    }

    setLoading(true)
    setTimeout(() => {
      if (verifyPin(pinValidation.value)) {
        recordSuccessfulLogin()
        const userData = loadUserData()
        onLoginSuccess(userData.name)
      } else {
        const attempts = recordFailedAttempt()
        if (attempts.lockedUntil) {
          setLocked(true)
          setLockTimeLeft(900) // 15 minutes
          setError('❌ Account locked for 15 minutes due to too many failed attempts')
          setStep('enterPin')
        } else {
          setError(`❌ Incorrect PIN (${5 - attempts.count} attempts left)`)
        }
        setPin('')
      }
      setLoading(false)
    }, 300)
  }

  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    setError('')

    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      setError(nameValidation.error)
      return
    }

    const pinValidation = validatePin(pin)
    if (!pinValidation.valid) {
      setError(pinValidation.error)
      return
    }

    if (pinValidation.value !== confirmPin) {
      setError('PINs do not match')
      return
    }

    // Check if PIN already exists
    if (verifyPin(pinValidation.value)) {
      setError('This PIN is already in use')
      return
    }

    setLoading(true)
    setTimeout(() => {
      saveUserData(nameValidation.value, pinValidation.value)
      recordSuccessfulLogin()
      onLoginSuccess(nameValidation.value)
      setLoading(false)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-lg p-8 border border-[#333]">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Habit Tracker
        </h1>
        <p className="text-gray-400 text-center mb-8">Secure Access</p>

        {locked && (
          <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
            ⏱️ Account temporarily locked
            <br />
            <span className="font-semibold">Try again in {lockTimeLeft}s</span>
          </div>
        )}

        {step === 'enterPin' ? (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Enter Your PIN (4 digits)
              </label>
              <input
                type="password"
                maxLength="4"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full bg-[#0f0f0f] border border-[#444] rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-gray-600 focus:outline-none focus:border-blue-500"
                disabled={loading || locked}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length !== 4 || locked}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>

            {!locked && (
              <div className="text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setStep('register')
                    setError('')
                  }}
                  className="text-blue-400 hover:text-blue-300 transition"
                >
                  Register here
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                What's Your Name?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength="50"
                className="w-full bg-[#0f0f0f] border border-[#444] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Create a PIN (4 digits)
              </label>
              <input
                type="password"
                maxLength="4"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full bg-[#0f0f0f] border border-[#444] rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-gray-600 focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirm PIN
              </label>
              <input
                type="password"
                maxLength="4"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full bg-[#0f0f0f] border border-[#444] rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-gray-600 focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim() || pin.length !== 4 || confirmPin.length !== 4}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('enterPin')
                setName('')
                setPin('')
                setConfirmPin('')
                setError('')
              }}
              className="w-full text-gray-400 hover:text-gray-300 text-sm transition"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}


