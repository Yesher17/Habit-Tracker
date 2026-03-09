import { useState, useCallback } from 'react'
import { load, save } from '../utils/storage'
import { today } from '../utils/dateUtils'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useHabits() {
  const [habits, setHabits] = useState(() => {
    const data = load()
    return data?.habits || []
  })

  const persist = useCallback((next) => {
    setHabits(next)
    save({ habits: next })
  }, [])

  const addHabit = useCallback((data) => {
    const habit = {
      id: generateId(),
      name: data.name,
      icon: data.icon || '✅',
      color: data.color || '#6366f1',
      createdAt: today(),
      completions: {},
    }
    persist(prev => [...prev, habit])
  }, [persist])

  const updateHabit = useCallback((id, data) => {
    persist(prev =>
      prev.map(h => h.id === id ? { ...h, ...data } : h)
    )
  }, [persist])

  const deleteHabit = useCallback((id) => {
    persist(prev => prev.filter(h => h.id !== id))
  }, [persist])

  const toggleCompletion = useCallback((habitId, dateStr) => {
    persist(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h
        const completions = { ...h.completions }
        if (completions[dateStr]) {
          delete completions[dateStr]
        } else {
          completions[dateStr] = true
        }
        return { ...h, completions }
      })
    )
  }, [persist])

  return { habits, addHabit, updateHabit, deleteHabit, toggleCompletion }
}
