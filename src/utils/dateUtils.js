import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isToday,
  parseISO,
  subDays,
  eachDayOfInterval,
} from 'date-fns'

export function today() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDate(date) {
  return format(date, 'yyyy-MM-dd')
}

export function formatDisplay(date) {
  return format(date, 'dd/MM')
}

export function formatDayName(date) {
  return format(date, 'EEE')
}

export function formatWeekLabel(startDate) {
  return format(startDate, 'MMM dd, yyyy')
}

export function getWeekStart(referenceDate = new Date()) {
  return startOfWeek(referenceDate, { weekStartsOn: 1 }) // Monday
}

export function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

export function nextWeek(weekStart) {
  return addWeeks(weekStart, 1)
}

export function prevWeek(weekStart) {
  return subWeeks(weekStart, 1)
}

export function isDateToday(date) {
  return isToday(date)
}

export function isFutureDate(date) {
  const todayStr = today()
  return formatDate(date) > todayStr
}

export function getLast30Days() {
  const end = new Date()
  const start = subDays(end, 29)
  return eachDayOfInterval({ start, end })
}

export function getLast84Days() {
  const end = new Date()
  const start = subDays(end, 83)
  return eachDayOfInterval({ start, end })
}
