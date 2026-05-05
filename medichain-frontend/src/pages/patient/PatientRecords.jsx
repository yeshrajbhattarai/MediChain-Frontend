// src/pages/patient/Records.jsx
// GET /api/v1/patient/records/
// GET /api/v1/patient/records/<id>/
// GET /api/v1/patient/records/<id>/history/

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAccessToken } from '../../auth_store/authStore'

const BASE = 'http://localhost:8000/api/v1'
const authFetch = (url) =>
  fetch(`${BASE}${url}`, { headers: { Authorization: `Bearer ${getAccessToken()}` } })

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

const STATUS_COLOR = {
  pending:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  rejected:  'bg-red-50 text-red-600 ring-1 ring-red-200',
}

// ─── Records List ─────────────────────────────────────────────────────────────
export function PatientRecords() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    authFetch('/patient/records/')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setError('Failed to load records.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error)   return <p className="text-red-500 text-sm">{error}</p>

  const groups = data?.records_by_hospital || []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Records</h1>
        <p className="text-sm text-gray-400 mt-0.5">All your lab requests across hospitals.</p>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium text-gray-600">No records yet.</p>
        </div>
      ) : groups.map(group => (
        <div key={group.hospital_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">🏥</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{group.hospital_name}</p>
              <p className="text-xs text-gray-400">{group.total_requests} request{group.total_requests !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Lab</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Doctor</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(group.requests || []).map(req => (
                <tr key={req.id} className="hover:bg-teal-50/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{req.lab_name}</p>
                    <p className="text-xs text-gray-400 capitalize">{req.lab_type}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-gray-600 text-xs">{req.requested_by}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[req.status] || 'bg-gray-100 text-gray-600'}`}>
                      {req.status_display || req.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {req.record_id ? (
                      <button
                        onClick={() => navigate(`/patient/records/${req.record_id}`)}
                        className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                      >
                        View →
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

// ─── Record Detail ────────────────────────────────────────────────────────────
export function PatientRecordDetail() {
  const { record_id } = useParams()
  const navigate      = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState('overview') // 'overview' | 'history'
  const [history, setHistory] = useState(null)
  const [histLoading, setHistLoading] = useState(false)

  useEffect(() => {
    authFetch(`/patient/records/${record_id}/`)
      .then(r => r.json())
      .then(d => {
        if (d.success === false) setError(d.error || 'Record not found.')
        else setData(d)
      })
      .catch(() => setError('Failed to load record.'))
      .finally(() => setLoading(false))
  }, [record_id])

  async function loadHistory() {
    if (history) return
    setHistLoading(true)
    try {
      const res  = await authFetch(`/patient/records/${record_id}/history/`)
      const data = await res.json()
      setHistory(data.history || [])
    } catch { setHistory([]) }
    finally { setHistLoading(false) }
  }

  function handleTabChange(t) {
    setTab(t)
    if (t === 'history') loadHistory()
  }

  if (loading) return <Spinner />
  if (error)   return (
    <div className="text-center py-16">
      <p className="text-red-500 mb-4">{error}</p>
      <button onClick={() => navigate('/patient/records')} className="text-sm text-teal-600 hover:underline">← Back to records</button>
    </div>
  )

  const { record, lab_request, audit, custom_field_values, lab_custom_field_schema } = data

  return (
    <div className="flex flex-col gap-6 max-w-3xl">

      {/* Back */}
      <button onClick={() => navigate('/patient/records')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 w-fit">
        ← Back to records
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Record ID</p>
            <p className="font-mono text-sm text-gray-700">{String(record.record_id).slice(0, 16)}…</p>
            <p className="text-xs text-gray-400 mt-2">Version {record.version}</p>
          </div>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_COLOR[lab_request?.status] || 'bg-gray-100 text-gray-600'}`}>
            {lab_request?.status_display || lab_request?.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {[['overview', '📋 Overview'], ['history', '📅 History']].map(([key, label]) => (
            <button key={key} onClick={() => handleTabChange(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
                ${tab === key ? 'text-teal-600 border-teal-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <div className="flex flex-col gap-4">

          {/* Lab info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Lab Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Lab', lab_request?.lab_name],
                ['Hospital', lab_request?.hospital_name],
                ['Requested by', lab_request?.requested_by],
                ['Staff code', lab_request?.requested_by_staff_code],
              ].map(([label, val]) => val && (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical notes */}
          {(lab_request?.diagnosis || lab_request?.treatment_plan || lab_request?.notes) && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">Clinical Notes</h2>
              {lab_request?.diagnosis && (
                <div><p className="text-xs text-gray-400">Diagnosis</p><p className="text-sm text-gray-800">{lab_request.diagnosis}</p></div>
              )}
              {lab_request?.treatment_plan && (
                <div><p className="text-xs text-gray-400">Treatment Plan</p><p className="text-sm text-gray-800">{lab_request.treatment_plan}</p></div>
              )}
              {lab_request?.notes && (
                <div><p className="text-xs text-gray-400">Notes</p><p className="text-sm text-gray-800">{lab_request.notes}</p></div>
              )}
            </div>
          )}

          {/* Lab results */}
          {lab_custom_field_schema?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Lab Results</h2>
              <div className="space-y-2">
                {lab_custom_field_schema.map(field => (
                  <div key={field.key} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium">{field.label}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {custom_field_values?.[field.key] ?? <span className="text-gray-400 font-normal">—</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit */}
          {audit && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Audit Trail</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400">Created by</p><p className="text-gray-800">{audit.created_by_name || '—'}</p></div>
                <div><p className="text-xs text-gray-400">Created at</p><p className="text-gray-800">{audit.created_at ? new Date(audit.created_at).toLocaleDateString('en-IN') : '—'}</p></div>
                <div><p className="text-xs text-gray-400">Last updated by</p><p className="text-gray-800">{audit.latest_updated_by_name || '—'}</p></div>
                <div><p className="text-xs text-gray-400">Last updated</p><p className="text-gray-800">{audit.latest_updated_at ? new Date(audit.latest_updated_at).toLocaleDateString('en-IN') : '—'}</p></div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div>
          {histLoading ? <Spinner /> : (history || []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No version history available.</p>
          ) : (
            <div className="space-y-3">
              {history.map(h => (
                <div key={h.version_number} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    v{h.version_number}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{h.changed_by_name} <span className="text-gray-400 font-normal">({h.changed_by_role})</span></p>
                    <p className="text-xs text-gray-400">{new Date(h.changed_at).toLocaleDateString('en-IN')} · {h.event_type}</p>
                    {h.change_reason && <p className="text-xs text-gray-500 mt-1">Reason: {h.change_reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}