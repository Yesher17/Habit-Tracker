import CryptoJS from 'crypto-js'

const STORAGE_KEY = 'habit-tracker'
const USER_STORAGE_KEY = 'habit-tracker-user'
const ATTEMPTS_KEY = 'habit-tracker-attempts'
const ENCRYPTION_KEY = 'habit-tracker-secret-key-2026' // In production, use environment variable

// ============ ENCRYPTION UTILITIES ============

function encrypt(data) {
  try {
    const jsonStr = JSON.stringify(data)
    return CryptoJS.AES.encrypt(jsonStr, ENCRYPTION_KEY).toString()
  } catch (e) {
    console.error('Encryption failed', e)
    return null
  }
}

function decrypt(encryptedStr) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedStr, ENCRYPTION_KEY)
    const jsonStr = bytes.toString(CryptoJS.enc.Utf8)
    return JSON.parse(jsonStr)
  } catch (e) {
    console.error('Decryption failed', e)
    return null
  }
}

// ============ PIN HASHING (using simpler method for 4-digit PIN) ============

function hashPin(pin) {
  // PBKDF2 hashing - more secure than Base64
  const salt = 'habit-tracker-salt'
  const hashedPin = CryptoJS.PBKDF2(pin, salt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString()
  return hashedPin
}

// ============ RATE LIMITING ============

export function getLoginAttempts() {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY)
    if (!raw) return { count: 0, lockedUntil: null }
    return JSON.parse(raw)
  } catch {
    return { count: 0, lockedUntil: null }
  }
}

export function recordFailedAttempt() {
  const attempts = getLoginAttempts()
  const now = Date.now()
  
  attempts.count += 1
  
  // Lock account after 5 failed attempts for 15 minutes
  if (attempts.count >= 5) {
    attempts.lockedUntil = now + (15 * 60 * 1000) // 15 minutes
  }
  
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts))
  return attempts
}

export function recordSuccessfulLogin() {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count: 0, lockedUntil: null }))
}

export function isAccountLocked() {
  const attempts = getLoginAttempts()
  if (!attempts.lockedUntil) return false
  
  const now = Date.now()
  if (now < attempts.lockedUntil) {
    return true
  }
  
  // Unlock if timeout has passed
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count: 0, lockedUntil: null }))
  return false
}

export function getTimeUntilUnlock() {
  const attempts = getLoginAttempts()
  if (!attempts.lockedUntil) return 0
  
  const now = Date.now()
  const remaining = Math.ceil((attempts.lockedUntil - now) / 1000)
  return Math.max(0, remaining)
}

// ============ USER AUTHENTICATION ============

export function saveUserData(name, pin) {
  try {
    const userData = {
      name,
      pinHash: hashPin(pin),
      createdAt: new Date().toISOString()
    }
    const encrypted = encrypt(userData)
    if (encrypted) {
      localStorage.setItem(USER_STORAGE_KEY, encrypted)
    }
  } catch (e) {
    console.error('Failed to save user data', e)
  }
}

export function loadUserData() {
  try {
    const encrypted = localStorage.getItem(USER_STORAGE_KEY)
    if (!encrypted) return null
    return decrypt(encrypted)
  } catch {
    return null
  }
}

export function verifyPin(pin) {
  try {
    const userData = loadUserData()
    if (!userData) return false
    return userData.pinHash === hashPin(pin)
  } catch {
    return false
  }
}

export function logoutUser() {
  // Clear session but keep user data encrypted
  recordSuccessfulLogin()
}

// ============ HABITS STORAGE ============

// Validate habit data structure
function validateHabit(habit) {
  return (
    habit &&
    typeof habit.id === 'string' &&
    typeof habit.name === 'string' &&
    habit.name.trim().length > 0 &&
    typeof habit.icon === 'string' &&
    typeof habit.color === 'string' &&
    typeof habit.createdAt === 'string' &&
    typeof habit.completions === 'object'
  )
}

export function load() {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY)
    if (!encrypted) return { habits: [] }
    
    const data = decrypt(encrypted)
    if (!data || !Array.isArray(data.habits)) {
      return { habits: [] }
    }
    
    // Validate each habit
    const validHabits = data.habits.filter(validateHabit)
    return { habits: validHabits }
  } catch {
    return { habits: [] }
  }
}

export function save(data) {
  try {
    if (!data || !Array.isArray(data.habits)) {
      console.error('Invalid data structure')
      return
    }
    
    // Validate all habits before saving
    const validHabits = data.habits.filter(validateHabit)
    const encrypted = encrypt({ habits: validHabits })
    
    if (encrypted) {
      localStorage.setItem(STORAGE_KEY, encrypted)
    }
  } catch (e) {
    console.error('Failed to save to localStorage', e)
  }
}
