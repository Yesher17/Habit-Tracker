import { today, formatDate, getLast30Days, getLast84Days } from './dateUtils'
import { subDays, parseISO } from 'date-fns'

/**
 * Calculate current streak (consecutive days ending today or yesterday)
 */
export function calcCurrentStreak(completions) {
  let streak = 0
  let cursor = new Date()

  while (true) {
    const key = formatDate(cursor)
    if (completions[key]) {
      streak++
      cursor = subDays(cursor, 1)
    } else {
      // Allow one grace day (if today isn't checked yet, check yesterday)
      if (streak === 0 && key === today()) {
        cursor = subDays(cursor, 1)
        const yesterdayKey = formatDate(cursor)
        if (completions[yesterdayKey]) {
          streak++
          cursor = subDays(cursor, 1)
          continue
        }
      }
      break
    }
  }
  return streak
}

/**
 * Calculate longest streak ever
 */
export function calcLongestStreak(completions) {
  const dates = Object.keys(completions)
    .filter(k => completions[k])
    .sort()

  if (dates.length === 0) return 0

  let longest = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (curr - prev) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }
  return longest
}

/**
 * Completion rate for a habit over last 30 days (0–100)
 */
export function calcCompletionRate(habit) {
  const days = getLast30Days()
  // Use earliest of createdAt or first completion so past-week checks count
  const firstCompletion = Object.keys(habit.completions)
    .filter(k => habit.completions[k])
    .sort()[0]
  const startDate = firstCompletion && firstCompletion < habit.createdAt
    ? firstCompletion
    : habit.createdAt
  const tracked = days.filter(d => formatDate(d) >= startDate)
  if (tracked.length === 0) return 0
  const completed = tracked.filter(d => habit.completions[formatDate(d)]).length
  return Math.round((completed / tracked.length) * 100)
}

/**
 * Per-habit completion rates for bar chart (returns array of {name, rate})
 */
export function getCompletionRates(habits) {
  return habits.map(h => ({
    name: `${h.icon} ${h.name}`,
    rate: calcCompletionRate(h),
    color: h.color,
  }))
}

/**
 * Overall stats for dashboard
 */
export function getDashboardStats(habits) {
  if (habits.length === 0) {
    return { totalCompletions: 0, overallRate: 0, bestHabit: null, perfectDaysThisWeek: 0 }
  }

  const totalCompletions = habits.reduce((sum, h) => {
    return sum + Object.values(h.completions).filter(Boolean).length
  }, 0)

  const rates = habits.map(h => calcCompletionRate(h))
  const overallRate = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)

  const bestIdx = rates.indexOf(Math.max(...rates))
  const bestHabit = habits[bestIdx]

  // Perfect days this week = days where ALL habits were completed
  const today = new Date()
  let perfectDaysThisWeek = 0
  for (let i = 0; i < 7; i++) {
    const d = subDays(today, i)
    const key = formatDate(d)
    if (habits.every(h => h.completions[key])) {
      perfectDaysThisWeek++
    }
  }

  return { totalCompletions, overallRate, bestHabit, perfectDaysThisWeek }
}

/**
 * Build heatmap data: array of 84 days with { date, count } where count = 0 or 1
 */
export function getHeatmapData(habit) {
  return getLast84Days().map(d => {
    const key = formatDate(d)
    return { date: key, count: habit.completions[key] ? 1 : 0 }
  })
}
