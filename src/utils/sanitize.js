// Input sanitization and validation utilities

export function sanitizeString(str, maxLength = 100) {
  if (typeof str !== 'string') return ''
  
  return str
    .trim()
    .replace(/[<>"/]/g, '') // Remove HTML chars
    .slice(0, maxLength)
}

export function validateName(name) {
  const sanitized = sanitizeString(name, 50)
  
  if (sanitized.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' }
  }
  
  return { valid: true, value: sanitized }
}

export function validateHabitName(name) {
  const sanitized = sanitizeString(name, 40)
  
  if (sanitized.length < 1) {
    return { valid: false, error: 'Habit name is required' }
  }
  
  if (sanitized.length < 2) {
    return { valid: false, error: 'Habit name must be at least 2 characters' }
  }
  
  return { valid: true, value: sanitized }
}

export function validatePin(pin) {
  const pinStr = String(pin).replace(/\D/g, '')
  
  if (pinStr.length !== 4) {
    return { valid: false, error: 'PIN must be exactly 4 digits' }
  }
  
  return { valid: true, value: pinStr }
}
