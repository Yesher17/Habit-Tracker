import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { getCompletionRates } from '../utils/analyticsUtils'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, rate, color } = payload[0].payload
  return (
    <div className="bg-[#252525] border border-white/[0.08] rounded-xl px-3 py-2 text-sm shadow-xl">
      <div className="text-white font-medium">{name}</div>
      <div className="text-white/50 text-xs mt-0.5">
        <span style={{ color }}>{rate}%</span> completion (last 30d)
      </div>
    </div>
  )
}

export default function CompletionChart({ habits }) {
  const data = getCompletionRates(habits)

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 4 }} barSize={28}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="name"
          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={v => `${v}%`}
          tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          ticks={[0, 25, 50, 75, 100]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
