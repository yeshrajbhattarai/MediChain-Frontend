// src/pages/patient/Dashboard.jsx
// GET /api/v1/patient/dashboard/

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAccessToken, getPayload } from '../../auth_store/authStore'

const BASE = 'http://localhost:8000/api/v1'
const authFetch = (url) =>
  fetch(`${BASE}${url}`, { headers: { Authorization: `Bearer ${getAccessToken()}` } })

function StatCard({ label, value, icon, color }) {
  const colors = {
    teal:   'bg-teal-50 text-teal-700',
    amber:  'bg-amber-50 text-amber-700',
    emerald:'bg-emerald-50 text-emerald-700',
    blue:   'bg-blue-50 text-blue-700',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        <span className={`text-lg p-1.5 rounded-lg ${colors[color] || colors.teal}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  )
}

export default function PatientDashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const payload = getPayload()

  useEffect(() => {
    authFetch('/patient/dashboard/')
      .then(r => r.json())
      .then(d => {
        if (d.success === false && d.missing_fields) {
          // profile incomplete — redirect to profile
          window.location.href = '/patient/profile'
        } else {
          setData(d)
        }
      })
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
  if (error)   return <p className="text-red-500 text-sm">{error}</p>

  const stats = data?.stats || {}
  const recent = data?.recent_requests || []

  const STATUS_COLOR = {
    pending:   'bg-amber-50 text-amber-700',
    completed: 'bg-emerald-50 text-emerald-700',
    rejected:  'bg-red-50 text-red-600',
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome, {payload?.patient_name || 'Patient'} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Here's your health summary.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={stats.total_requests}    icon="📋" color="teal"    />
        <StatCard label="Pending"        value={stats.pending_requests}  icon="⏳" color="amber"   />
        <StatCard label="Completed"      value={stats.completed_requests} icon="✅" color="emerald" />
        <StatCard label="Hospitals"      value={stats.hospitals_count}   icon="🏥" color="blue"    />
      </div>

      {/* Recent requests */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Lab Requests</h2>
          <Link to="/patient/records" className="text-xs text-teal-600 hover:underline font-medium">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🔬</p>
            <p className="text-sm font-medium text-gray-600">No lab requests yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Lab</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Doctor</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{req.lab_name}</p>
                    <p className="text-xs text-gray-400 capitalize">{req.lab_type}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-gray-600">{req.requested_by}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[req.status] || 'bg-gray-100 text-gray-600'}`}>
                      {req.status_display || req.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-gray-400 text-xs">
                    {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Records by hospital */}
      {(data?.records_by_hospital || []).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.records_by_hospital.map(h => (
            <div key={h.hospital_id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-lg">🏥</div>
                <p className="font-medium text-gray-900 text-sm">{h.hospital_name}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-800">{h.total_requests}</p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-amber-600">{h.pending_requests}</p>
                  <p className="text-xs text-gray-400">Pending</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-emerald-600">{h.completed_requests}</p>
                  <p className="text-xs text-gray-400">Done</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}