import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { getProfile } from '../../auth_store/profileStore'
import { getPayload } from '../../auth_store/authStore'

const NURSE_NAV = [
  { label: 'Dashboard', path: '/nurse/dashboard', icon: 'https://cdn.lordicon.com/oeotfwsx.json' },
  { label: 'Queue', path: '/nurse/queue', icon: 'https://cdn.lordicon.com/hnqamtrw.json' },
  { label: 'Records', path: '/nurse/records', icon: 'https://cdn.lordicon.com/piurhpdv.json' },
  { label: 'Profile', path: '/nurse/profile', icon: 'https://cdn.lordicon.com/bgebyztw.json' },
]

export default function NurseLayout() {
  const [open, setOpen] = useState(false)
  const profile = getProfile()
  const payload = getPayload()
  const name = profile?.full_name || payload?.full_name || 'Nurse'
  const hospital = profile?.hospital_name || payload?.hospital_name || ''

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        navItems={NURSE_NAV}
        role="Nurse"
        hospitalName={hospital}
        open={open}
        setOpen={setOpen}
      />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="md:hidden text-gray-600 hover:text-black text-xl">☰</button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{name}</p>
              <p className="text-xs text-gray-400">
                {hospital ? `${hospital} · Nurse` : 'Nurse'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-semibold text-sm">
              {name[0] || 'N'}
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
