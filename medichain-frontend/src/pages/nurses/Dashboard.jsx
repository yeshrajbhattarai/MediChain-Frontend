// src/pages/nurses/Dashboard.jsx

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  Users,
  Activity,
  Building2,
  FileText,
  Stethoscope,
  ArrowRight,
} from 'lucide-react'

import Spinner from '../../components/ui/Spinner'
import { getNurseDashboard } from '../../api/nurse'
import { errorToast } from '../../utils/alert'

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────

const COLOR = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: 'bg-blue-100 text-blue-600',
  },

  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    icon: 'bg-emerald-100 text-emerald-600',
  },

  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: 'bg-amber-100 text-amber-600',
  },

  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    icon: 'bg-teal-100 text-teal-600',
  },
}

function StatCard({ label, value, Icon, color = 'blue' }) {
  const c = COLOR[color]

  return (
    <div
      className={`
        rounded-xl
        p-5
        ${c.bg}
        flex
        items-start
        justify-between
      `}
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gray-500 font-medium">
          {label}
        </p>

        <p className={`text-3xl font-bold ${c.text}`}>
          {value ?? 0}
        </p>
      </div>

      <div
        className={`
          w-11
          h-11
          rounded-xl
          flex
          items-center
          justify-center
          ${c.icon}
        `}
      >
        <Icon size={22} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────

export default function NurseDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)

      const response = await getNurseDashboard()

      console.log('Nurse Dashboard:', response)

      setData(response)
    } catch (err) {
      console.error(err)

      errorToast('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Spinner fullPage />
  }

  const QUICK_ACTIONS = [
    {
      label: 'View Queue',
      path: '/nurse/queue',
      Icon: ClipboardList,
      color: 'text-blue-600',
      bg: 'hover:bg-blue-50 hover:border-blue-300',
    },

    {
      label: 'Patient Records',
      path: '/nurse/records',
      Icon: FileText,
      color: 'text-emerald-600',
      bg: 'hover:bg-emerald-50 hover:border-emerald-300',
    },

    {
      label: 'My Profile',
      path: '/nurse/profile',
      Icon: Users,
      color: 'text-amber-600',
      bg: 'hover:bg-amber-50 hover:border-amber-300',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Building2 size={14} />

        <span>/</span>

        <span className="text-gray-700 font-medium">
          Dashboard
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Nurse Dashboard
        </h1>

        <p className="text-sm text-gray-400 mt-0.5">
          Overview of assigned nursing tasks and patient workflow.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Assigned Tasks"
          value={data?.assigned_tasks}
          Icon={ClipboardList}
          color="blue"
        />

        <StatCard
          label="Pending Tasks"
          value={data?.pending_tasks}
          Icon={Clock3}
          color="amber"
        />

        <StatCard
          label="Completed Today"
          value={data?.completed_today}
          Icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          label="Patients"
          value={data?.total_patients}
          Icon={Users}
          color="teal"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map(
            ({ label, path, Icon, color, bg }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex
                  flex-col
                  items-center
                  gap-2.5
                  bg-white
                  border
                  border-gray-200
                  rounded-xl
                  p-5
                  text-center
                  transition-all
                  duration-150
                  group
                  ${bg}
                `}
              >
                <Icon
                  size={22}
                  className={`${color} transition-colors`}
                />

                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 leading-tight">
                  {label}
                </span>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Recent Tasks
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Latest assigned nurse workflow items
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {!data?.recent_tasks?.length && (
            <div className="p-10 text-center">
              <p className="text-sm text-gray-500">
                No recent tasks available
              </p>
            </div>
          )}

          {data?.recent_tasks?.map((task) => (
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
              {/* LEFT */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">
                    {task?.patient?.full_name || 'Unknown Patient'}
                  </h3>

                  <span
                    className={`
                      px-2.5
                      py-1
                      rounded-full
                      text-[11px]
                      font-semibold
                      ${
                        task?.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : task?.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }
                    `}
                  >
                    {(task?.status || 'pending')
                      .replace('_', ' ')
                      .toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  {task?.primary_diagnosis || 'No diagnosis'}
                </p>

                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" />

                    <span>
                      {task?.doctor?.full_name || 'Doctor'}
                    </span>
                  </div>

                  <span>
                    {task?.created_at
                      ? new Date(task.created_at).toLocaleString(
                          'en-IN'
                        )
                      : ''}
                  </span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-teal-600" />
                </div>

                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}