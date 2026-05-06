// src/components/layout/DoctorLayout.jsx
// Doctor portal shell — sidebar + header + <Outlet />
// Icons: all from lordicon CDN, verified in use elsewhere in the project

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { getProfile } from '../../auth_store/profileStore'
import { getPayload } from '../../auth_store/authStore'

const DOCTOR_NAV = [
  // grid squares — same as admin dashboard, proven
  { label: 'Dashboard',   path: '/doctor/dashboard', icon: 'https://cdn.lordicon.com/oeotfwsx.json' },
  // people group — same as admin Patients, proven
  { label: 'My Patients', path: '/doctor/patients',  icon: 'https://cdn.lordicon.com/nklmjzzm.json' },
  // inbox / tray — neutral consent icon (was "received" before, fits unified consent page)
  { label: 'Consent',     path: '/doctor/consent',   icon: 'https://cdn.lordicon.com/uukerzzv.json' },
  // flask / lab — same as admin Labs, proven
  { label: 'Labs',        path: '/doctor/labs',      icon: 'https://cdn.lordicon.com/nfuackpv.json' },
  // person silhouette — same as admin Profile, proven
  { label: 'Profile',     path: '/doctor/profile',   icon: 'https://cdn.lordicon.com/bgebyztw.json' },
  { label: 'Lab Reports', path: '/doctor/lab-reports', icon: '...' },
  { label: 'Medical Records', path: '/doctor/medical-records', icon: '...' },
  { label: 'Approval Queue', path: '/doctor/approval-queue', icon: '...' },
]

export default function DoctorLayout() {
  const [open, setOpen] = useState(false)

  const profile  = getProfile()
  const payload  = getPayload()
  const name     = profile?.full_name     || payload?.full_name     || 'Doctor'
  const hospital = profile?.hospital_name || payload?.hospital_name || ''

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        navItems={DOCTOR_NAV}
        role="Doctor"
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
                {hospital ? `${hospital} · Doctor` : 'Doctor'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-semibold text-sm">
              {name[0] || 'D'}
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