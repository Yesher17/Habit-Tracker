import StatsCard from '../components/StatsCard'
import Heatmap from '../components/Heatmap'
import CompletionChart from '../components/CompletionChart'
import { getDashboardStats, calcCurrentStreak, calcLongestStreak, calcCompletionRate } from '../utils/analyticsUtils'

export default function Analytics({ habits }) {
  const stats = getDashboardStats(habits)

  if (habits.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-white mb-2">Analytics</h1>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="text-4xl mb-4">📊</span>
          <p className="text-sm font-medium text-white/50 mb-1">No data yet</p>
          <p className="text-xs text-white/25">Add habits and start tracking to see analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white mb-0.5">Analytics</h1>
        <p className="text-xs text-white/30">Last 30 days overview</p>
      </div>

      {/* Dashboard stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard
          label="Total Completions"
          value={stats.totalCompletions}
          sub="all time"
        />
        <StatsCard
          label="Overall Rate"
          value={`${stats.overallRate}%`}
          sub="last 30 days"
          accent={stats.overallRate >= 70 ? '#22c55e' : stats.overallRate >= 40 ? '#eab308' : '#ef4444'}
        />
        <StatsCard
          label="Best Habit"
          value={stats.bestHabit ? `${stats.bestHabit.icon} ${stats.bestHabit.name}` : '—'}
          sub={stats.bestHabit ? `${calcCompletionRate(stats.bestHabit)}% rate` : ''}
          accent={stats.bestHabit?.color}
        />
        <StatsCard
          label="Perfect Days"
          value={stats.perfectDaysThisWeek}
          sub="this week"
          accent={stats.perfectDaysThisWeek > 0 ? '#22c55e' : undefined}
        />
      </div>

      {/* Completion rate chart */}
      <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white mb-1">Completion Rate</h2>
        <p className="text-xs text-white/30 mb-5">Last 30 days per habit</p>
        <CompletionChart habits={habits} />
      </div>

      {/* Per-habit heatmaps */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white">Habit Heatmaps</h2>
        {habits.map(habit => {
          const streak = calcCurrentStreak(habit.completions)
          const longest = calcLongestStreak(habit.completions)
          const rate = calcCompletionRate(habit)

          return (
            <div key={habit.id} className="bg-[#141414] border border-white/[0.08] rounded-2xl p-5">
              {/* Habit header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{habit.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{habit.name}</p>
                    <p className="text-xs text-white/30">Since {habit.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-xs text-white/30">Streak</p>
                    <p className="text-sm font-semibold" style={{ color: streak > 0 ? habit.color : 'rgba(255,255,255,0.3)' }}>
                      {streak > 0 ? `🔥 ${streak}d` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30">Best</p>
                    <p className="text-sm font-semibold text-white/60">{longest}d</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30">Rate</p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: rate >= 70 ? '#22c55e' : rate >= 40 ? '#eab308' : '#ef4444' }}
                    >
                      {rate}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Heatmap */}
              <Heatmap habit={habit} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
