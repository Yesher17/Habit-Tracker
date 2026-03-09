import { CheckSquare, BarChart2, LogOut } from 'lucide-react'
import { logoutUser } from '../utils/storage'
import { sanitizeString } from '../utils/sanitize'

export default function Navbar({ page, setPage, userName, setOnLogout }) {
  const sanitizedName = sanitizeString(userName, 50)

  const handleLogout = () => {
    logoutUser()
    setOnLogout()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#0f0f0f]/90 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-lg font-semibold tracking-tight text-white">Habits</span>
          </div>
          {sanitizedName && (
            <div className="text-sm text-gray-400">
              Welcome <span className="text-blue-400 font-semibold">{sanitizedName}!</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#1a1a1a] rounded-lg p-1 border border-white/[0.06]">
            <button
              onClick={() => setPage('today')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                page === 'today'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <CheckSquare size={14} />
              Today
            </button>
            <button
              onClick={() => setPage('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                page === 'analytics'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <BarChart2 size={14} />
              Analytics
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-150"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  )
}
