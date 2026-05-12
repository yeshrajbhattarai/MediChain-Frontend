// src/pages/doctor/DoctorDashboard.jsx
// Refactored for consistency and improved UX

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProfile } from '../../auth_store/profileStore'
import Spinner from '../../components/ui/Spinner'
import { Users, FileText, BarChart3, Stethoscope } from 'lucide-react'
import { getDoctorDashboard } from '../../api/doctor'

const COLOR = {
  blue:  { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'bg-blue-100 text-blue-600'   },
  green: { bg: 'bg-emerald-50',text: 'text-emerald-700',icon: 'bg-emerald-100 text-emerald-600'},
  amber: { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: 'bg-amber-100 text-amber-600'  },
}

function StatCard({ label, value, Icon, color = 'blue' }) {
  const c = COLOR[color]
  return (
    <div className={`rounded-lg p-4 ${c.bg} flex items-start justify-between`}>
      <div className="flex flex-col gap-1">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value ?? 0}</p>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.icon}`}>
        <Icon size={20} />
      </div>
    </div>
  )
}

export default function DoctorDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const profile = getProfile()

  useEffect(() => {
    getDoctorDashboard()
      .then(d => setData(d))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner fullPage />
  if (error) return <p className="text-red-500 p-4">{error}</p>

  const QUICK_LINKS = [
    { label: 'My Patients',      path: '/doctor/patients',     Icon: Users,        color: 'text-blue-600' },
    { label: 'Approval Queue',   path: '/doctor/approval',     Icon: FileText,     color: 'text-emerald-600' },
    { label: 'Labs',             path: '/doctor/labs',         Icon: BarChart3,    color: 'text-amber-600' },
    { label: 'Profile',          path: '/doctor/profile',      Icon: Stethoscope,  color: 'text-gray-600' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Welcome, {profile?.full_name || 'Doctor'}</h1>
        <p className="text-sm text-gray-400 mt-0.5">Here's an overview of your current activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Patients"  value={data?.total_patients} Icon={Users}     color="blue"  />
        <StatCard label="Records"   value={data?.total_records}  Icon={FileText}  color="green" />
        <StatCard label="Reports"   value={data?.total_reports}  Icon={BarChart3} color="amber" />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ label, path, Icon, color }) => (
            <Link key={path} to={path}
              className={`flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-lg p-3.5 text-center transition-all duration-150 hover:border-teal-300 hover:shadow-sm group`}>
              <Icon size={20} className={color} />
              <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold shrink-0">
          {profile?.full_name?.[0] || 'D'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'Doctor'}</p>
          <p className="text-xs text-gray-400">Doctor {profile?.hospital_name ? `at ${profile.hospital_name}` : ''}</p>
        </div>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-teal-50 text-teal-700">ACTIVE</span>
      </div>
    </div>
  )
}