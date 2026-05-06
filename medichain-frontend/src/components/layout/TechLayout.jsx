// src/components/layout/TechLayout.jsx

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { getProfile } from '../../auth_store/profileStore'
import { getPayload } from '../../auth_store/authStore'

const TECH_NAV = [
  { label: 'Dashboard',  path: '/technician/dashboard', icon: 'https://cdn.lordicon.com/oeotfwsx.json' },
  { label: 'Lab Queue',  path: '/technician/lab-queue', icon: 'https://cdn.lordicon.com/nfuackpv.json' },
  { label: 'My Records', path: '/technician/records',   icon: 'https://cdn.lordicon.com/jgukeevf.json' },
  { label: 'Profile',    path: '/technician/profile',   icon: 'https://cdn.lordicon.com/bgebyztw.json' },
]

export default function TechLayout() {
  const [open, setOpen] = useState(false)

  const profile  = getProfile()
  const payload  = getPayload()
  const name     = profile?.full_name     || payload?.full_name     || 'Technician'
  const hospital = profile?.hospital_name || payload?.hospital_name || ''

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        navItems={TECH_NAV}
        role="Technician"
        hospitalName={hospital}
        open={open}
        setOpen={setOpen}
      />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-gray-600 hover:text-black text-xl"
          >
            ☰
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{name}</p>
              <p className="text-xs text-gray-400">
                {hospital ? `${hospital} · Technician` : 'Technician'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-semibold text-sm">
              {name[0] || 'T'}
            </div>
          </div>
        </header>
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}