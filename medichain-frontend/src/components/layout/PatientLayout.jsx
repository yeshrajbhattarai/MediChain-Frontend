import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { getPayload } from '../../auth_store/authStore'

const PATIENT_NAV = [
  { label: 'Dashboard', path: '/patient/dashboard', icon: 'https://cdn.lordicon.com/oeotfwsx.json' },
  { label: 'Medical Records', path: '/patient/records', icon: 'https://cdn.lordicon.com/piurhpdv.json' },
  { label: 'Consent', path: '/patient/consent', icon: 'https://cdn.lordicon.com/xovdoewm.json' },
  { label: 'Profile', path: '/patient/profile', icon: 'https://cdn.lordicon.com/bgebyztw.json' },
]

export default function PatientLayout() {
  const [open, setOpen] = useState(false)
  const payload = getPayload()

  const patientName = payload?.patient_name || payload?.full_name || 'Patient'
  const contextLabel = payload?.patient_id || ''

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        navItems={PATIENT_NAV}
        role="Patient"
        hospitalName={contextLabel}
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
              <p className="text-sm font-medium text-gray-800">{patientName}</p>
              <p className="text-xs text-gray-400">Patient</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
              {patientName[0] || 'P'}
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

