// src/pages/patient/PatientDashboard.jsx

import { useEffect, useState } from 'react'
import {
  Activity,
  FileText,
  ShieldCheck,
  Clock3,
  ChevronRight,
} from 'lucide-react'

import { getPayload } from '../../auth_store/authStore'
import { errorToast } from '../../utils/alert'
import { getPatientDashboard } from '../../api/patient'

export default function PatientDashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState(null)

  const payload = getPayload()

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const data = await getPatientDashboard()
      setDashboard(data)
    } catch (err) {
      errorToast(err.message)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Records',
      value:
        dashboard?.total_records ||
        dashboard?.stats?.total_records ||
        0,
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Pending Requests',
      value:
        dashboard?.pending_requests ||
        dashboard?.stats?.pending_requests ||
        0,
      icon: Clock3,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Approved Consents',
      value:
        dashboard?.approved_consents ||
        dashboard?.stats?.approved_consents ||
        0,
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Health Activity',
      value:
        dashboard?.activity_count ||
        dashboard?.stats?.activity_count ||
        0,
      icon: Activity,
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2 text-base">
          Welcome back,{' '}
          {payload?.patient_name ||
            payload?.full_name ||
            'Patient'}
          .
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, index) => {
          const Icon = card.icon

          return (
            <div
              key={index}
              className="
                bg-white
                border border-gray-200
                rounded-3xl
                p-6
                shadow-sm
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="text-4xl font-bold text-gray-900 mt-3">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`
                    w-12 h-12 rounded-2xl
                    flex items-center justify-center
                    ${card.color}
                  `}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* PROFILE SUMMARY */}
      <div className="
        bg-white
        border border-gray-200
        rounded-3xl
        overflow-hidden
      ">
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Patient Summary
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Your personal healthcare information overview
          </p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
              Full Name
            </p>

            <p className="text-gray-800 font-medium mt-2">
              {payload?.patient_name ||
                payload?.full_name ||
                'Unknown'}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
              Patient ID
            </p>

            <p className="text-gray-800 font-medium mt-2 break-all">
              {payload?.patient_id || '—'}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
              Phone
            </p>

            <p className="text-gray-800 font-medium mt-2">
              {payload?.phone || '—'}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
              Status
            </p>

            <div className="
              inline-flex items-center
              px-3 py-1
              rounded-full
              bg-emerald-50
              text-emerald-700
              text-sm font-medium
              mt-2
            ">
              Active
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="
        bg-white
        border border-gray-200
        rounded-3xl
        overflow-hidden
      ">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest healthcare interactions
            </p>
          </div>
        </div>

        {!dashboard?.recent_activity?.length ? (
          <div className="py-24 text-center">
            <div className="
              w-16 h-16
              rounded-2xl
              bg-gray-100
              flex items-center justify-center
              mx-auto
            ">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mt-5">
              No recent activity
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Your recent healthcare activity will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {dashboard.recent_activity.map((item, index) => (
              <div
                key={index}
                className="
                  px-8 py-5
                  flex items-center justify-between
                  hover:bg-gray-50
                  transition-colors
                "
              >
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {item.title || 'Activity'}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.description || 'No description'}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
