import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { formatDate, isFutureDate } from '../utils/dateUtils'
import { calcCurrentStreak, calcLongestStreak } from '../utils/analyticsUtils'

export default function HabitRow({ habit, weekDays, toggleCompletion, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const currentStreak = calcCurrentStreak(habit.completions)
  const longestStreak = calcLongestStreak(habit.completions)

  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="group flex items-center gap-0 border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
      {/* Habit info */}
      <div className="flex items-center gap-2.5 w-44 shrink-0 px-4 py-3.5">
        <span className="text-lg leading-none">{habit.icon}</span>
        <span className="text-sm font-medium text-white/80 truncate">{habit.name}</span>
      </div>

      {/* Day checkboxes */}
      {weekDays.map((day) => {
        const dateStr = formatDate(day)
        const checked = !!habit.completions[dateStr]
        const future = isFutureDate(day)

        return (
          <div
            key={dateStr}
            className="flex-1 flex items-center justify-center py-3.5"
          >
            <button
              disabled={future}
              onClick={() => !future && toggleCompletion(habit.id, dateStr)}
              className={`w-6 h-6 rounded-md border transition-all duration-150 flex items-center justify-center ${
                future
                  ? 'border-white/[0.06] cursor-not-allowed opacity-30'
                  : checked
                  ? 'border-transparent scale-95'
                  : 'border-white/[0.15] hover:border-white/30 hover:scale-105'
              }`}
              style={checked ? { backgroundColor: habit.color } : {}}
              title={dateStr}
            >
              {checked && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        )
      })}

      {/* Streak */}
      <div className="w-24 shrink-0 px-3 flex flex-col items-end">
        <span
          className="text-xs font-semibold"
          style={{ color: currentStreak > 0 ? habit.color : 'rgba(255,255,255,0.25)' }}
        >
          {currentStreak > 0 ? `🔥 ${currentStreak}d` : '—'}
        </span>
        {longestStreak > 0 && (
          <span className="text-[10px] text-white/20 mt-0.5">best {longestStreak}d</span>
        )}
      </div>

      {/* Menu */}
      <div className="w-10 shrink-0 flex items-center justify-center relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="p-1.5 rounded-lg text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreHorizontal size={14} />
        </button>
        {menuOpen && (
          <div className="absolute right-2 top-8 z-10 bg-[#252525] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl min-w-[120px]">
            <button
              onClick={() => { setMenuOpen(false); onEdit(habit) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={() => { setMenuOpen(false); onDelete(habit.id) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
