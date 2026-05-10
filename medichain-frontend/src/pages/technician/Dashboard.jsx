import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPayload } from '../../auth_store/authStore'
import StatCard from '../../components/ui/StatCard'
import Spinner from '../../components/ui/Spinner'
import { getTechnicianDashboard } from '../../api/technician'

export default function TechnicianDashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const payload = getPayload()

  useEffect(() => {
    getTechnicianDashboard()
      .then(d => setData(d))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner fullPage />
  if (error)   return <p className="text-red-500">{error}</p>

  const QUICK_ACTIONS = [
    { label: 'My Patients',  path: '/technician/patients',  icon: '🧑‍🤝‍🧑' },
    { label: 'Lab Queue',    path: '/technician/lab-queue', icon: '🔬' },
    { label: 'My Records',   path: '/technician/records',   icon: '📋' },
    { label: 'My Profile',   path: '/technician/profile',   icon: '⚙️' },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="text-gray-300">🏠</span>
        <span>/</span>
        <span className="text-gray-700 font-medium">Dashboard</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome, {payload?.full_name || 'Technician'} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Here's your lab activity summary.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="My Patients" value={data?.total_patients} icon="🧑‍🤝‍🧑" color="blue"   />
        <StatCard label="Records"     value={data?.total_records}  icon="📋"  color="amber"  />
        <StatCard label="Reports"     value={data?.total_reports}  icon="📊"  color="purple" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(a => (
            <Link key={a.path} to={a.path}
              className="flex flex-col items-center gap-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl p-4 text-center transition-all duration-150 group">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Role badge */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-semibold text-sm shrink-0">
          {payload?.full_name?.[0] || 'T'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{payload?.full_name || 'Technician'}</p>
          <p className="text-xs text-gray-400">Technician · {payload?.hospital_name || ''}</p>
        </div>
        <span className="ml-auto text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          ACTIVE
        </span>
      </div>

    </div>
  )
}
