import { getHeatmapData } from '../utils/analyticsUtils'
import { formatDate } from '../utils/dateUtils'
import { format, parseISO } from 'date-fns'

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Heatmap({ habit }) {
  const data = getHeatmapData(habit)

  // Pad the start so day 0 aligns to correct weekday (Mon = 0)
  const firstDate = parseISO(data[0].date)
  // getDay: 0=Sun, 1=Mon...6=Sat → convert to Mon-based
  const firstDow = (firstDate.getDay() + 6) % 7
  const padded = [...Array(firstDow).fill(null), ...data]

  // Split into columns of 7 (each column = 1 week)
  const columns = []
  for (let i = 0; i < padded.length; i += 7) {
    columns.push(padded.slice(i, i + 7))
  }

  // Month labels: collect unique months and their starting column index
  const monthLabels = []
  let lastMonth = null
  columns.forEach((col, ci) => {
    const first = col.find(c => c !== null)
    if (first) {
      const m = format(parseISO(first.date), 'MMM')
      if (m !== lastMonth) {
        monthLabels.push({ label: m, col: ci })
        lastMonth = m
      }
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1.5 min-w-max">
        {/* Month labels */}
        <div className="flex gap-1 ml-8">
          {columns.map((_, ci) => {
            const label = monthLabels.find(m => m.col === ci)
            return (
              <div key={ci} className="w-3 text-[9px] text-white/25 font-medium">
                {label ? label.label : ''}
              </div>
            )
          })}
        </div>

        {/* Grid rows (one per weekday) */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 justify-between mr-1">
            {WEEK_LABELS.map((d, i) => (
              <div key={d} className="h-3 text-[9px] text-white/25 font-medium flex items-center">
                {i % 2 === 0 ? d : ''}
              </div>
            ))}
          </div>

          {/* Columns */}
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, ri) => {
                const cell = col[ri]
                if (!cell) {
                  return <div key={ri} className="w-3 h-3" />
                }
                const filled = cell.count === 1
                return (
                  <div
                    key={ri}
                    title={cell.date}
                    className="w-3 h-3 rounded-[3px] transition-opacity"
                    style={{
                      backgroundColor: filled ? habit.color : 'rgba(255,255,255,0.06)',
                      opacity: filled ? 1 : 1,
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
