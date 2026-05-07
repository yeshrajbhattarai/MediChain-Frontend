// src/layouts/NurseLayout.jsx
// FIXED & PRODUCTION READY
// Main layout for nurse portal with sidebar navigation
import { clearTokens } from '../../auth_store/authStore'

import { useNavigate } from 'react-router-dom'
import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

import { useState } from 'react'
import { confirmDialog, successToast } from '../../utils/alert'
const navClass = ({ isActive }) => `
  flex
  items-center
  gap-3
  px-4
  py-3
  rounded-xl
  text-sm
  font-medium
  transition-all
  ${
    isActive
      ? 'bg-blue-600 text-white'
      : 'text-gray-600 hover:bg-gray-100'
  }
`

export default function NurseLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

const handleLogout = async () => {
  const confirmed = await confirmDialog(
    'Logout',
    'Are you sure you want to logout?',
    'Logout',
    true
  )

  if (!confirmed) return

  clearTokens()

  successToast('Logged out successfully')

  navigate('/login')
}

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-64
          bg-white
          border-r
          border-gray-200
          transform
          transition-transform
          md:relative
          md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-blue-600">
              MediChain
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Nurse Portal
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/nurse/dashboard"
            className={navClass}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>

          <NavLink
            to="/nurse/queue"
            className={navClass}
            onClick={() => setSidebarOpen(false)}
          >
            <ClipboardList className="w-5 h-5" />
            Queue
          </NavLink>

          <NavLink
            to="/nurse/records"
            className={navClass}
            onClick={() => setSidebarOpen(false)}
          >
            <FileText className="w-5 h-5" />
            Records
          </NavLink>

          <NavLink
            to="/nurse/profile"
            className={navClass}
            onClick={() => setSidebarOpen(false)}
          >
            <User className="w-5 h-5" />
            Profile
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="
              w-full
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-xl
              text-sm
              font-medium
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

      {/* BACKDROP */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
        />
      )}

      {/* MAIN */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* MOBILE HEADER */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">MediChain</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}