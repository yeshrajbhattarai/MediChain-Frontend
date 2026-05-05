// src/components/layout/AdminLayout.jsx

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { getProfile } from '../../auth_store/profileStore'
import { getPayload } from '../../auth_store/authStore'

const ADMIN_NAV = [
  { label: 'Dashboard',   path: '/admin/dashboard',   icon: 'https://cdn.lordicon.com/oeotfwsx.json' },
  { label: 'Doctors',     path: '/admin/doctors',     icon: 'https://cdn.lordicon.com/shcfcebj.json' },
  { label: 'Nurses',      path: '/admin/nurses',      icon: 'https://cdn.lordicon.com/lhjjdftm.json' },
  { label: 'Technicians', path: '/admin/technicians', icon: 'https://cdn.lordicon.com/uvofdfal.json' },
  { label: 'Patients',    path: '/admin/patients',    icon: 'https://cdn.lordicon.com/nklmjzzm.json' },
  { label: 'Labs',        path: '/admin/labs',        icon: 'https://cdn.lordicon.com/nfuackpv.json' },
  { label: 'Consent',     path: '/admin/consent',     icon: 'https://cdn.lordicon.com/xovdoewm.json' }, // ← single item
  { label: 'Profile',     path: '/admin/profile',     icon: 'https://cdn.lordicon.com/bgebyztw.json' },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)

  const profile = getProfile()
  const payload = getPayload()
  const name    = profile?.hospital_name || payload?.hospital_name || 'Hospital'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={ADMIN_NAV} role="Hospital Admin" hospitalName={name} open={open} setOpen={setOpen} />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="md:hidden text-gray-600 hover:text-black text-xl">☰</button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{name}</p>
              <p className="text-xs text-gray-400">
                {profile?.city ? `${profile.city} · Admin` : 'Admin'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
              {name[0] || 'H'}
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