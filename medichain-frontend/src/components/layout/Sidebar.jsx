// Sidebar.jsx — only change: import clearProfile and call it on logout
// Everything else is identical to your current Sidebar.jsx

import { Link, useLocation } from 'react-router-dom'
import { clearProfile } from '../../auth_store/profileStore'  // ← NEW

export default function Sidebar({ navItems = [], role = '', hospitalName = '', open, setOpen }) {
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    clearProfile()                      // ← NEW: wipe profile on logout
    window.location.href = '/login'
  }

  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/30 z-40 md:hidden" />
      )}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen
        md:sticky md:top-0 md:translate-x-0 md:h-screen
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 overflow-y-auto
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
              <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-base">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">M</div>
            MediChain
          </div>
          {hospitalName && <p className="text-xs text-gray-400 mt-1 truncate">{hospitalName}</p>}
          {role && (
            <span className="mt-2 inline-block text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {role}
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}
                onClick={() => setOpen && setOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}
                `}
              >
                <span className="w-7 h-7 flex items-center justify-center shrink-0">
                  <lord-icon src={item.icon} trigger="loop" delay="2000"
                    colors={isActive ? 'primary:#ffffff,secondary:#ffffff' : 'primary:#2563eb,secondary:#2563eb'}
                    style={{ width: '22px', height: '22px' }}
                  />
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <lord-icon
            src="https://cdn.lordicon.com/xhdhjyqy.json"
            trigger="loop"
            colors="primary:#dc2626"
            style={{ width: '20px', height: '20px' }}
          />
          Logout
        </button>
        </div>
      </aside>
    </>
  )
}