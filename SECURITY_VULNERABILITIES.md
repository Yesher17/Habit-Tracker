# Security Vulnerabilities Report - Habit Tracker

## Critical Issues (Needs Immediate Fix)

### 1. ❌ PIN Not Encrypted - Uses Base64 Encoding
**Problem:** PIN is encoded with `btoa()` (Base64), not encrypted
```js
// VULNERABLE CODE
function encodePin(pin) {
  return btoa('pin:' + pin) // btoa('pin:1234') = 'cGluOjEyMzQ='
}
```

**Attack:** Reverse with one line: `atob('cGluOjEyMzQ=')` → reveals PIN

**Fix:** Use proper hashing (even MD5 would be better, but use bcryptjs for production)

### 2. ❌ No Rate Limiting on PIN Attempts
**Problem:** User can try unlimited PINs instantly
```js
// Current code allows brute force
setLoading(true)
setTimeout(() => {
  if (verifyPin(pin)) { ... }
}, 300) // Only 300ms delay!
```

**Attack:** Attacker can try all 10,000 PINs in ~50 minutes

**Fix:** 
- Implement failed attempt counter
- Lock account after 5 failed attempts
- Add exponential backoff delay

### 3. ❌ 4-Digit PIN is Too Weak
**Problem:** Only 10,000 possible combinations (0000-9999)

**Fix:** 
- Increase to 6-8 digit PIN, OR
- Add alphanumeric support
- Consider password instead of PIN for better security

### 4. ❌ All Data Stored in Plain Text localStorage
**Problem:** PIN hash and habits visible to anyone with browser
```
localStorage: {
  "habit-tracker-user": "{\"name\":\"Honey\",\"pinHash\":\"cGluOjEyMzQ=\"}",
  "habit-tracker": "[{habits}]"
}
```

**Attack:** Anyone accessing the browser can read all data

**Fix:**
- Encrypt localStorage before saving
- Use `crypto-js` or similar for client-side encryption
- Consider using IndexedDB with encryption

### 5. ❌ No Multi-User Isolation
**Problem:** Same browser = shared localStorage for all users
- If User A creates PIN 1234, User B cannot create same PIN
- Logout doesn't clear data
- Habits persist across user logins

**Fix:**
- Store data per-user (username as key)
- Delete user data on logout (if they choose)
- Implement user profile selection screen

---

## High Priority Issues

### 6. ⚠️ No Input Sanitization
**Problem:** User names rendered directly in JSX
```jsx
// User name not sanitized
Welcome <span>{userName}!</span>
```

**Risk:** If name contains `<script>alert('xss')</script>`, could execute

**Fix:**
```jsx
// Already safe in React JSX, but add validation
const sanitizedName = String(userName).replace(/[<>]/g, '')
Welcome <span>{sanitizedName}!</span>
```

### 7. ⚠️ No Error Boundaries
**Problem:** Single error crashes entire app

**Fix:** Add error boundary component
```jsx
// Add ErrorBoundary wrapper in App.jsx
<ErrorBoundary>
  <Today {...habitsApi} />
</ErrorBoundary>
```

### 8. ⚠️ No Data Schema Validation
**Problem:** Corrupted localStorage data crashes app
```js
// No validation - corrupted JSON crashes app
const data = JSON.parse(raw)
```

**Fix:** Validate schema
```js
function validateHabits(data) {
  if (!Array.isArray(data)) return []
  return data.filter(h => 
    h.id && h.name && h.icon && h.color && h.completions
  )
}
```

---

## Medium Priority Issues

### 9. 📊 Inefficient Analytics Rendering
**Problem:** 84-day calculations on every render
```js
// Called on every render - should memoize
export function getHeatmapData(habit) {
  return getLast84Days().map(...)
}
```

**Fix:** Use `useMemo` in components

### 10. ⏱️ No Session Timeout
**Problem:** User stays logged in indefinitely
- User logs in on public computer
- Never logs out
- Anyone can access their habits

**Fix:**
```js
// Add session timeout
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
setInterval(() => {
  if (lastActivityTime + SESSION_TIMEOUT < Date.now()) {
    logoutUser()
  }
}, 60000)
```

### 11. 📝 Weak Habit Name Validation
**Problem:** Only checks if trimmed
```js
if (!name.trim()) return // That's it!
```

**Fix:**
```js
const MAX_NAME_LENGTH = 50
const validName = name.trim()
  .replace(/[<>]/g, '') // Remove HTML chars
  .slice(0, MAX_NAME_LENGTH)

if (!validName || validName.length < 2) {
  setError('Habit name must be 2-50 characters')
  return
}
```

---

## Security Checklist

- [ ] Replace Base64 with proper password hashing (bcryptjs for client-side demo)
- [ ] Implement rate limiting (5 attempts, 15-min lockout)
- [ ] Increase PIN to 6-8 digits or use password
- [ ] Encrypt localStorage data
- [ ] Add multi-user support with separate data storage
- [ ] Sanitize all user inputs
- [ ] Add React Error Boundary
- [ ] Validate all localStorage data on load
- [ ] Add session timeout (30 min)
- [ ] Add audit logging for security events
- [ ] Use HTTPS in production (if backend added)
- [ ] Add CSRF protection (if backend added)

---

## Recommended Libraries

```json
{
  "crypto-js": "^4.1.0",        // Client-side encryption
  "bcryptjs": "^2.4.3",         // Password hashing (no native crypto)
  "joi": "^17.0.0",             // Schema validation
  "dompurify": "^3.0.6"         // XSS prevention
}
```

---

## Quick Fixes (Priority Order)

1. **Replace Base64 with real hashing** (15 min)
2. **Add rate limiting** (20 min)
3. **Increase PIN to 6+ digits** (5 min)
4. **Add input sanitization** (10 min)
5. **Add error boundary** (10 min)
6. **Add data validation** (15 min)

Total time: ~75 minutes for critical fixes
