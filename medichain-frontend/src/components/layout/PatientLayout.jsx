// src/components/layout/PatientLayout.jsx

import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

import { getPayload, clearTokens } from '../../auth_store/authStore'
import { confirmDialog } from '../../utils/alert'

const NAV = [
  {
    label: 'Dashboard',
    path: '/patient/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Medical Records',
    path: '/patient/records',
    icon: FileText,
  },
  {
    label: 'Consent',
    path: '/patient/consent',
    icon: ShieldCheck,
  },
  {
    label: 'Profile',
    path: '/patient/profile',
    icon: User,
  },
]

const navClass = ({ isActive }) => `
  flex items-center gap-3
  px-4 py-3
  rounded-2xl
  text-sm font-medium
  transition-all duration-200
  ${
    isActive
      ? 'bg-blue-600 text-white shadow-sm'
      : 'text-gray-600 hover:bg-gray-100'
  }
`

export default function PatientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigate = useNavigate()
  const payload = getPayload()

  const patientName =
    payload?.patient_name ||
    payload?.full_name ||
    'Patient'

  const handleLogout = async () => {
    const confirmed = await confirmDialog(
      'Logout',
      'Are you sure you want to logout?',
      'Logout'
    )

    if (!confirmed) return

    clearTokens()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-300
          md:translate-x-0
          ${
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        {/* LOGO */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">
              MediChain
            </h1>

            <p className="text-sm text-gray-400 mt-1">
              Patient Portal
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={navClass}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="
              w-full
              flex items-center gap-3
              px-4 py-3
              rounded-2xl
              text-sm font-medium
              text-red-500
              hover:bg-red-50
              transition-all
            "
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {/* TOPBAR */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          {/* MOBILE MENU */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {/* PROFILE */}
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {patientName}
              </p>

              <p className="text-xs text-gray-400">
                Patient
              </p>
            </div>

            <div className="
              w-10 h-10
              rounded-full
              bg-blue-100
              text-blue-600
              flex items-center justify-center
              text-sm font-semibold
            ">
              {patientName?.charAt(0) || 'P'}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}