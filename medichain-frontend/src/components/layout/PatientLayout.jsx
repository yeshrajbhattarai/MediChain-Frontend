import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { getPayload } from '../../auth_store/authStore'
import { getPatientConsents } from '../../api/patient'

const PATIENT_NAV = [
  { label: 'Dashboard', path: '/patient/dashboard', icon: 'https://cdn.lordicon.com/oeotfwsx.json' },
  { label: 'Medical Records', path: '/patient/records', icon: 'https://cdn.lordicon.com/piurhpdv.json' },
  { label: 'Consent', path: '/patient/consent', icon: 'https://cdn.lordicon.com/xovdoewm.json' },
  { label: 'Profile', path: '/patient/profile', icon: 'https://cdn.lordicon.com/bgebyztw.json' },
]

export default function PatientLayout() {
  const [open, setOpen] = useState(false)
  const [consents, setConsents] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const payload = getPayload()
  const navigate = useNavigate()

  const patientName = payload?.patient_name || payload?.full_name || 'Patient'

  useEffect(() => {
    let mounted = true
    const fetchConsents = async () => {
      try {
        const data = await getPatientConsents()
        if (mounted && Array.isArray(data)) {
          setConsents(data)
        }
      } catch (err) {
        // fail silently to avoid breaking layout
      }
    }
    fetchConsents()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  const pendingNotifications = consents.filter(
    item =>
      item.request_status === 'PENDING' &&
      item.patient_choice === 'PENDING'
  )

  const formatDate = dateStr => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return isNaN(date) ? '—' : date.toLocaleDateString()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        navItems={PATIENT_NAV}
        role="Patient"
        open={open}
        setOpen={setOpen}
      />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-gray-600 hover:text-black text-xl"
          >
            ☰
          </button>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(prev => !prev)}
                className="relative w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition"
                aria-label="Notifications"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z"
                  />
                </svg>

                {pendingNotifications.length > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      {pendingNotifications.length}
                    </span>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-400 opacity-40 animate-ping" />
                  </>
                )}
              </button>

              <div
                className={`absolute right-2 sm:right-0 mt-3 w-[92vw] max-w-[360px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 origin-top-right ${
                  showDropdown
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                }`}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">Pending Consent Requests</p>
                  <p className="text-xs text-gray-400">
                    {pendingNotifications.length} pending approvals
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {pendingNotifications.length === 0 ? (
                    <div className="px-6 py-10 text-center text-gray-400">
                      <div className="mx-auto w-10 h-10 mb-3 rounded-full bg-blue-50 flex items-center justify-center text-blue-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500">
                        No pending consent requests
                      </p>
                    </div>
                  ) : (
                    pendingNotifications.map(item => (
                      <div
                        key={item.consent_id || item.created_at}
                        className="px-4 py-4 border-b border-gray-100 hover:bg-blue-50/40 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">
                              {item.requesting_hospital || 'Hospital'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.lab_name || item.record_type || 'Medical Record'}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              Requested: {formatDate(item.created_at)}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                            {item.request_status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Pending Action
                          </div>
                          <button
                            onClick={() => navigate('/patient/consent')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
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