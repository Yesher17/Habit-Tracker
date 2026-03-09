import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
  getWeekStart,
  getWeekDays,
  nextWeek,
  prevWeek,
  formatDisplay,
  formatDayName,
  formatWeekLabel,
  isDateToday,
  formatDate,
} from '../utils/dateUtils'
import HabitRow from '../components/HabitRow'
import HabitForm from '../components/HabitForm'

export default function Today({ habits = [], addHabit, updateHabit, deleteHabit, toggleCompletion }) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart())
  const [showForm, setShowForm] = useState(false)
  const [editHabit, setEditHabit] = useState(null)

  const weekDays = getWeekDays(weekStart)
  const isCurrentWeek = formatDate(weekStart) === formatDate(getWeekStart())

  const handleEdit = (habit) => setEditHabit(habit)
  const handleDelete = (id) => {
    if (window.confirm('Delete this habit? All history will be lost.')) {
      deleteHabit(id)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">
            {isCurrentWeek ? 'This Week' : `Week of ${formatWeekLabel(weekStart)}`}
          </h1>
          <p className="text-xs text-white/30 mt-0.5">{habits.length} habit{habits.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekStart(prevWeek(weekStart))}
            className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {!isCurrentWeek && (
            <button
              onClick={() => setWeekStart(getWeekStart())}
              className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
            >
              Today
            </button>
          )}
          <button
            onClick={() => setWeekStart(nextWeek(weekStart))}
            disabled={isCurrentWeek}
            className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden">
        {/* Column headers */}
        <div className="flex items-center border-b border-white/[0.08]">
          <div className="w-44 shrink-0 px-4 py-3">
            <span className="text-[11px] font-medium text-white/25 uppercase tracking-wider">Habit</span>
          </div>
          {weekDays.map((day) => {
            const isToday = isDateToday(day)
            return (
              <div
                key={formatDate(day)}
                className={`flex-1 flex flex-col items-center py-3 ${
                  isToday ? 'bg-white/[0.04]' : ''
                }`}
              >
                <span className={`text-[10px] font-medium uppercase tracking-wider ${isToday ? 'text-white/60' : 'text-white/25'}`}>
                  {formatDayName(day)}
                </span>
                <span className={`text-xs font-semibold mt-0.5 ${isToday ? 'text-white' : 'text-white/35'}`}>
                  {formatDisplay(day)}
                </span>
                {isToday && (
                  <span className="w-1 h-1 rounded-full bg-white/50 mt-1" />
                )}
              </div>
            )
          })}
          <div className="w-24 shrink-0 px-3 py-3">
            <span className="text-[11px] font-medium text-white/25 uppercase tracking-wider text-right block">Streak</span>
          </div>
          <div className="w-10 shrink-0" />
        </div>

        {/* Habit rows */}
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <span className="text-4xl mb-4">✦</span>
            <p className="text-sm font-medium text-white/50 mb-1">No habits yet</p>
            <p className="text-xs text-white/25">Add your first habit to start tracking</p>
          </div>
        ) : (
          habits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              weekDays={weekDays}
              toggleCompletion={toggleCompletion}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}

        {/* Add habit row */}
        <div className="px-4 py-3 border-t border-white/[0.04]">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-sm text-white/25 hover:text-white/60 transition-colors"
          >
            <Plus size={14} />
            Add habit
          </button>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <HabitForm
          onSave={addHabit}
          onClose={() => setShowForm(false)}
        />
      )}
      {editHabit && (
        <HabitForm
          initial={editHabit}
          onSave={(data) => updateHabit(editHabit.id, data)}
          onClose={() => setEditHabit(null)}
        />
      )}
    </div>
  )
}
