export default function StatsCard({ label, value, sub, accent }) {
  return (
    <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-1">
      <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">{label}</span>
      <span
        className="text-2xl font-bold leading-tight"
        style={{ color: accent || 'white' }}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-white/30">{sub}</span>}
    </div>
  )
}
