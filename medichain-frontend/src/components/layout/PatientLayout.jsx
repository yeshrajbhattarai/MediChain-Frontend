// src/components/layout/PatientLayout.jsx
// Layout wrapper for all patient portal pages

import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { getPayload, clearTokens } from '../../auth_store/authStore'

const NAV = [
  { label: 'Dashboard', path: '/patient/dashboard', icon: '🏠' },
  { label: 'My Records', path: '/patient/records',  icon: '📋' },
  { label: 'Profile',    path: '/patient/profile',  icon: '⚙️' },
]

export default function PatientLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const payload  = getPayload()
  const name     = payload?.patient_name || 'Patient'

  function handleLogout() {
    clearTokens()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-56 bg-white border-r border-gray-200 z-30
        flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static
      `}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">M</div>
            <span className="font-semibold text-gray-900">MediChain</span>
          </div>
          <p className="text-xs text-teal-600 mt-0.5 font-medium">Patient Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-teal-50 text-teal-700'
                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="md:hidden text-gray-600 text-xl">☰</button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{name}</p>
              <p className="text-xs text-gray-400">Patient</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold text-sm">
              {name[0] || 'P'}
            </div>
          </div>
        </header>
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}