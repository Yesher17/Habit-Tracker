import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { validateHabitName } from '../utils/sanitize'

const ICONS = ['✅', '🏃', '💪', '📚', '🧘', '💧', '🥗', '😴', '🎯', '✍️', '🎸', '🌿', '🏋️', '🚴', '🧠', '💊', '🌅', '🎨', '🍎', '🧹']

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
]

export default function HabitForm({ onSave, onClose, initial = null }) {
  const [name, setName] = useState(initial?.name || '')
  const [icon, setIcon] = useState(initial?.icon || '✅')
  const [color, setColor] = useState(initial?.color || '#6366f1')
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const validation = validateHabitName(name)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    onSave({ name: validation.value, icon, color })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-[#1a1a1a] border border-white/[0.08] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-base font-semibold text-white">
            {initial ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/05 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Morning Run"
              maxLength={40}
              className="w-full bg-[#212121] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Icon</label>
            <div className="grid grid-cols-10 gap-1.5">
              {ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`h-8 w-8 flex items-center justify-center rounded-lg text-base transition-all ${
                    icon === i
                      ? 'bg-white/15 ring-1 ring-white/30'
                      : 'bg-white/[0.04] hover:bg-white/10'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-[#1a1a1a] ring-white/50 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#212121] border border-white/[0.06]">
            <span className="text-xl">{icon}</span>
            <span className="text-sm font-medium text-white">{name || 'Habit name'}</span>
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: color + '22', color }}
            >
              0 day streak
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/40 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-30"
              style={{ backgroundColor: color }}
            >
              {initial ? 'Save' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
