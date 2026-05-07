import { Outlet, NavLink } from 'react-router-dom'

import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FileText,
  User,
  LogOut,
} from 'lucide-react'

export default function NurseLayout() {
  const navClass = ({ isActive }) =>
    `
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

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* SIDEBAR */}
      <aside className="
        w-64
        bg-white
        border-r
        border-gray-200
        hidden
        md:flex
        flex-col
      ">

        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-semibold text-blue-600">
            MediChain
          </h1>

          <p className="text-xs text-gray-400 mt-1">
            Nurse Portal
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">

          <NavLink
            to="/nurse/dashboard"
            className={navClass}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>

          <NavLink
            to="/nurse/queue"
            className={navClass}
          >
            <ClipboardList className="w-5 h-5" />
            Queue
          </NavLink>

          

          <NavLink
            to="/nurse/records"
            className={navClass}
          >
            <FileText className="w-5 h-5" />
            Records
          </NavLink>

          <NavLink
            to="/nurse/profile"
            className={navClass}
          >
            <User className="w-5 h-5" />
            Profile
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="
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
          ">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0">

        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}