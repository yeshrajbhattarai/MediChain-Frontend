import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProfile } from '../../auth_store/profileStore'
import Spinner from '../../components/ui/Spinner'
import { Users, FileText, BarChart3, Stethoscope, SendHorizonal, Inbox, Settings } from 'lucide-react'
import { getDoctorDashboard } from '../../api/doctor'

const COLOR = {
  blue:  { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'bg-blue-100 text-blue-600'   },
  green: { bg: 'bg-emerald-50',text: 'text-emerald-700',icon: 'bg-emerald-100 text-emerald-600'},
  amber: { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: 'bg-amber-100 text-amber-600'  },
}

function StatCard({ label, value, Icon, color = 'blue' }) {
  const c = COLOR[color]
  return (
    <div className={`rounded-xl p-5 ${c.bg} flex items-start justify-between`}>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-3xl font-bold ${c.text}`}>{value ?? 0}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon}`}>
        <Icon size={22} />
      </div>
    </div>
  )
}

export default function DoctorDashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    getDoctorDashboard()
      .then(d => setData(d))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner fullPage />
  if (error)   return <p className="text-red-500 p-4">{error}</p>

  const QUICK_ACTIONS = [
    { label: 'My Patients',      path: '/doctor/patients',         Icon: Users,          color: 'text-blue-600',  bg: 'hover:bg-blue-50 hover:border-blue-300'  },
    { label: 'Consent Sent',     path: '/doctor/consent',     Icon: SendHorizonal,  color: 'text-green-600', bg: 'hover:bg-green-50 hover:border-green-300' },
    { label: 'My Profile',       path: '/doctor/profile',          Icon: Settings,       color: 'text-gray-600',  bg: 'hover:bg-gray-50 hover:border-gray-300'  },
  ]
  const profile = getProfile()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Stethoscope size={14} />
        <span>/</span>
        <span className="text-gray-700 font-medium">Dashboard</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Welcome, {profile?.full_name || 'Doctor'}</h1>
        <p className="text-sm text-gray-400 mt-0.5">Here's a summary of your current activity.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="My Patients" value={data?.total_patients} Icon={Users}     color="blue"  />
        <StatCard label="Records"     value={data?.total_records}  Icon={FileText}  color="green" />
        <StatCard label="Reports"     value={data?.total_reports}  Icon={BarChart3} color="amber" />
      </div>

      <div>
        <h2 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, path, Icon, color, bg }) => (
            <Link key={path} to={path}
              className={`flex flex-col items-center gap-2.5 bg-white border border-gray-200 rounded-xl p-4 text-center transition-all duration-150 group ${bg}`}>
              <Icon size={22} className={`${color}`} />
              <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-semibold text-sm shrink-0">
          {profile?.full_name?.[0] || 'D'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{profile?.full_name || 'Doctor'}</p>
          <p className="text-xs text-gray-400">Doctor · {profile?.hospital_name || ''}</p>
        </div>
        <span className="ml-auto text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span>
      </div>
    </div>
  )
}
