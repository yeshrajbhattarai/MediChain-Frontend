  import { useEffect, useState } from 'react'
  import { Link } from 'react-router-dom'
  import Spinner from '../../components/ui/Spinner'
  import { getHospitalDashboard } from '../../api/hospital'
  import {
    Stethoscope, HeartPulse, FlaskConical, Users,
    Building2, FileText, BarChart3, ClipboardPlus,
    UserPlus, TestTubeDiagonal, FilePlus, SendHorizonal
  } from 'lucide-react'

  // ── Stat card (replaces StatCard to use lucide icons) ─────────────────────────
  const COLOR = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'bg-blue-100 text-blue-600'   },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'bg-purple-100 text-purple-600' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: 'bg-amber-100 text-amber-600'  },
    green:  { bg: 'bg-emerald-50',text: 'text-emerald-700',icon: 'bg-emerald-100 text-emerald-600'},
    red:    { bg: 'bg-red-50',    text: 'text-red-700',    icon: 'bg-red-100 text-red-600'      },
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

  export default function AdminDashboard() {
    const [data, setData]       = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState('')

    useEffect(() => {
      getHospitalDashboard()
        .then(d => setData(d))
        .catch(() => setError('Failed to load dashboard'))
        .finally(() => setLoading(false))
    }, [])

    if (loading) return <Spinner fullPage />
    if (error)   return <p className="text-red-500 p-4">{error}</p>

    const QUICK_ACTIONS = [
      { label: 'Add Doctor',     path: '/admin/doctors',          Icon: UserPlus,         color: 'text-blue-600',   bg: 'hover:bg-blue-50 hover:border-blue-300'   },
      { label: 'Add Nurse',      path: '/admin/nurses',           Icon: HeartPulse,       color: 'text-purple-600', bg: 'hover:bg-purple-50 hover:border-purple-300' },
      { label: 'Add Technician', path: '/admin/technicians',      Icon: TestTubeDiagonal, color: 'text-amber-600',  bg: 'hover:bg-amber-50 hover:border-amber-300'  },
      { label: 'Add Patient',    path: '/admin/patients',         Icon: ClipboardPlus,    color: 'text-green-600',  bg: 'hover:bg-green-50 hover:border-green-300'  },
      { label: 'Manage Labs',    path: '/admin/labs',             Icon: FlaskConical,     color: 'text-red-600',    bg: 'hover:bg-red-50 hover:border-red-300'      },
      { label: 'View Consents',  path: '/admin/consent',     Icon: SendHorizonal,    color: 'text-blue-600',   bg: 'hover:bg-blue-50 hover:border-blue-300'   },
    ]

    const accountStatus = data?.hospital?.account_status
    const isPending = accountStatus === 'pending'
    const isSuspended = accountStatus === 'suspended'

    return (
      <div className="flex flex-col gap-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Building2 size={14} />
          <span>/</span>
          <span className="text-gray-700 font-medium">Dashboard</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Welcome back, {data?.hospital?.hospital_name || 'Admin'} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Here's what's happening at your hospital today.</p>
        </div>

        {(isPending || isSuspended) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium flex items-start gap-3 ${
              isSuspended
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <div className="text-lg">{isSuspended ? '⛔' : '⚠️'}</div>
            <div>
              <p className="font-semibold">
                {isSuspended
                  ? 'Your hospital account is suspended.'
                  : 'Your hospital profile is incomplete.'}
              </p>
              <p className="text-xs mt-1">
                {isSuspended
                  ? 'Contact MediChain support to restore full access.'
                  : 'Complete your license and address details to activate all services.'}
              </p>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard label="Doctors"     value={data?.total_doctors}     Icon={Stethoscope}      color="blue"   />
          <StatCard label="Nurses"      value={data?.total_nurses}      Icon={HeartPulse}       color="purple" />
          <StatCard label="Technicians" value={data?.total_technicians} Icon={FlaskConical}     color="amber"  />
          <StatCard label="Patients"    value={data?.total_patients}    Icon={Users}            color="green"  />
          <StatCard label="Records"     value={data?.total_records}     Icon={FileText}         color="blue"   />
          <StatCard label="Reports"     value={data?.total_reports}     Icon={BarChart3}        color="red"    />
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map(({ label, path, Icon, color, bg }) => (
              <Link key={path} to={path}
                className={`flex flex-col items-center gap-2.5 bg-white border border-gray-200 rounded-xl p-4 text-center transition-all duration-150 group ${bg}`}>
                <Icon size={22} className={`${color} transition-colors`} />
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Hospital status */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <Building2 size={18} className="text-gray-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{data?.hospital?.hospital_name}</p>
            <p className="text-xs text-gray-400">{[data?.hospital?.city, data?.hospital?.state].filter(Boolean).join(', ')}</p>
          </div>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full border w-fit
            ${accountStatus === 'active'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : accountStatus === 'suspended'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {accountStatus?.toUpperCase() || 'PENDING'}
          </span>
        </div>

      </div>
    )
  }
