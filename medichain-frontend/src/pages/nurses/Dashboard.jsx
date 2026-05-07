// src/pages/nurse/Dashboard.jsx

import { useEffect, useState } from 'react'
import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  Users,
  RefreshCw,
} from 'lucide-react'

import { getNurseDashboard } from '../../api/nurse'

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  tone = 'blue',
  loading = false,
}) {
  const tones = {
    blue: {
      box: 'bg-blue-50 border-blue-100',
      icon: 'text-blue-700',
    },

    emerald: {
      box: 'bg-emerald-50 border-emerald-100',
      icon: 'text-emerald-700',
    },

    amber: {
      box: 'bg-amber-50 border-amber-100',
      icon: 'text-amber-700',
    },

    teal: {
      box: 'bg-teal-50 border-teal-100',
      icon: 'text-teal-700',
    },
  }

  return (
    <div className="
      bg-white
      border
      border-gray-200
      rounded-2xl
      p-5
    ">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 mt-1">
            {loading ? '...' : value}
          </h3>
        </div>

        <div
          className={`
            w-12
            h-12
            rounded-2xl
            border
            flex
            items-center
            justify-center
            ${tones[tone].box}
          `}
        >
          <Icon className={`w-5 h-5 ${tones[tone].icon}`} />
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')

      const data = await getNurseDashboard()

      console.log('Nurse Dashboard:', data)

      setDashboard(data)

    } catch (err) {
      console.error(err)

      setError('Failed to load dashboard')
      setDashboard(null)

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-4
      ">

        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Nurse Dashboard
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Overview of nursing activities and patient workflow
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-xl
            border
            border-gray-200
            bg-white
            hover:bg-gray-50
            transition-colors
            text-sm
            font-medium
            text-gray-700
          "
        >
          <RefreshCw className="w-4 h-4" />

          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="
          bg-red-50
          border
          border-red-200
          rounded-2xl
          p-4
          text-sm
          text-red-700
        ">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
        gap-4
      ">

        <StatCard
          title="Assigned Tasks"
          value={
            dashboard?.assigned_tasks ??
            dashboard?.assigned ??
            0
          }
          icon={ClipboardList}
          tone="blue"
          loading={loading}
        />

        <StatCard
          title="Completed Today"
          value={
            dashboard?.completed_today ??
            dashboard?.completed ??
            0
          }
          icon={CheckCircle2}
          tone="emerald"
          loading={loading}
        />

        <StatCard
          title="Pending Tasks"
          value={
            dashboard?.pending_tasks ??
            dashboard?.pending ??
            0
          }
          icon={Clock3}
          tone="amber"
          loading={loading}
        />

        <StatCard
          title="Patients"
          value={
            dashboard?.total_patients ??
            dashboard?.patients ??
            0
          }
          icon={Users}
          tone="teal"
          loading={loading}
        />
      </div>

      {/* OVERVIEW */}
      <div className="
        bg-white
        border
        border-gray-200
        rounded-2xl
        p-6
      ">

        <div className="
          flex
          items-start
          justify-between
          gap-4
          flex-wrap
        ">

          <div>
            <h2 className="font-semibold text-gray-900">
              Today's Overview
            </h2>

            <p className="
              text-sm
              text-gray-500
              mt-2
              leading-relaxed
              max-w-2xl
            ">
              Monitor assigned nursing tasks, patient activities,
              pending healthcare workflows, and completed
              treatments from a centralized dashboard.
            </p>
          </div>

          <div className="
            flex
            flex-wrap
            gap-2
          ">

            <span className="
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold
              bg-blue-50
              text-blue-700
              ring-1
              ring-blue-200
            ">
              Active Workflow
            </span>

            <span className="
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold
              bg-emerald-50
              text-emerald-700
              ring-1
              ring-emerald-200
            ">
              Secure Records
            </span>

            <span className="
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold
              bg-teal-50
              text-teal-700
              ring-1
              ring-teal-200
            ">
              Patient Monitoring
            </span>
          </div>
        </div>
      </div>

      {/* RAW DEBUG DATA */}
      {/* Remove later after backend finalization */}

      {dashboard && (
        <div className="
          bg-white
          border
          border-gray-200
          rounded-2xl
          p-5
        ">
          <h3 className="font-semibold text-gray-900 mb-4">
            Live API Response
          </h3>

          <pre className="
            text-xs
            overflow-auto
            bg-gray-50
            rounded-xl
            p-4
            text-gray-700
          ">
            {JSON.stringify(dashboard, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}