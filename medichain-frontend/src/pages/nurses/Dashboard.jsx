// src/pages/nurse/Dashboard.jsx
// FIXED: Breadcrumbs, better UX, consistent styling

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  Users,
  Activity,
  FileText,
  AlertCircle,
  Loader,
  ArrowRight,
} from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { getNurseDashboard } from '../../api/nurse'

const COLOR = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'bg-blue-100 text-blue-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'bg-emerald-100 text-emerald-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'bg-amber-100 text-amber-600' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', icon: 'bg-teal-100 text-teal-600' },
}

function StatCard({ label, value, Icon, color = 'blue' }) {
  const c = COLOR[color]
  return (
    <div className={`rounded-2xl p-6 ${c.bg}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className={`text-3xl font-bold ${c.text} mt-2`}>{value ?? 0}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}

export default function NurseDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')
      const response = await getNurseDashboard()
      setData(response)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const QUICK_ACTIONS = [
    { label: 'View Queue', path: '/nurse/queue', Icon: ClipboardList, color: 'text-blue-600' },
    { label: 'Finalized Records', path: '/nurse/records', Icon: FileText, color: 'text-emerald-600' },
    { label: 'My Profile', path: '/nurse/profile', Icon: Users, color: 'text-amber-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-transparent">
      <PageHeader
        title="Nurse Dashboard"
        subtitle="Overview of your assigned tasks and patient care workflow"
        breadcrumbs={[{ label: 'Nurse Portal' }, { label: 'Dashboard' }]}
      />

      {/* ERROR STATE */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
            <button
              onClick={loadDashboard}
              className="text-xs text-red-600 hover:text-red-700 font-medium mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-8">
          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Assigned Tasks" value={data.assigned_tasks} Icon={ClipboardList} color="blue" />
            <StatCard label="Pending" value={data.pending_tasks} Icon={Clock3} color="amber" />
            <StatCard label="Completed Today" value={data.completed_today} Icon={CheckCircle2} color="emerald" />
            <StatCard label="Patients" value={data.total_patients} Icon={Users} color="teal" />
          </div>

          {/* QUICK ACTIONS */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
              {QUICK_ACTIONS.map(({ label, path, Icon, color }) => (
                <Link
                  key={path}
                  to={path}
                  className="
                    flex
                    flex-col
                    items-center
                    gap-3
                    bg-white
                    border
                    border-gray-200
                    rounded-2xl
                    p-5
                    text-center
                    hover:border-blue-300
                    hover:shadow-lg
                    transition-all
                    group
                  "
                >
                  <Icon size={24} className={`${color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* RECENT TASKS */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Recent Tasks</h2>
                <p className="text-xs text-gray-500 mt-1">Latest assigned nursing tasks</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {!data?.recent_tasks?.length ? (
                <div className="p-8 text-center">
                  <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent tasks</p>
                </div>
              ) : (
                data.recent_tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/nurse/queue/${task.id}`}
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                      p-5
                      hover:bg-blue-50/40
                      transition-all
                      group
                    "
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {task?.patient?.full_name || 'Unknown'}
                        </h3>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            task?.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : task?.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {(task?.status || 'pending').replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {task?.primary_diagnosis || 'No diagnosis'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors shrink-0" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}