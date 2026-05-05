// src/pages/technician/LabQueue.jsx
// GET /api/v1/staff/technician/lab/
// Shows all lab requests pending for this technician

import { useState, useEffect } from 'react'

const BASE = 'http://localhost:8000/api'

const api = (url, opts = {}) =>
  fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access') || ''}`,
      ...opts.headers,
    },
  })

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Modal({ open, onClose, title, width = 'max-w-lg', children }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] flex flex-col`}
        style={{ animation: 'modalIn .18s cubic-bezier(.22,1,.36,1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity:0; transform:scale(.96) translateY(6px) }
          to   { opacity:1; transform:scale(1)   translateY(0)   }
        }
      `}</style>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">
        {value || <span className="text-gray-400 font-normal">—</span>}
      </p>
    </div>
  )
}

const STATUS_BADGE = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', dot: 'bg-amber-500' },
  in_progress: { label: 'In Progress', cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200', dot: 'bg-blue-500' },
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
}

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function LabRequestDetailModal({ requestId, open, onClose }) {
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!open || !requestId) return
    setRequest(null); setErr('')
    setLoading(true)
    api(`/v1/staff/technician/lab-requests/${requestId}/`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setErr(data.error); return }
        setRequest(data)
      })
      .catch(() => setErr('Failed to load request details.'))
      .finally(() => setLoading(false))
  }, [open, requestId])

  const LAB_TYPE_DISPLAY = {
    'ckd': 'Chronic Kidney Disease',
    'pathology': 'Pathology',
    'radiology': 'Radiology',
    'cardiology': 'Cardiology',
    'microbiology': 'Microbiology',
    'biochemistry': 'Biochemistry',
    'hematology': 'Hematology',
  }

  return (
    <Modal open={open} onClose={onClose} title="Lab Request Details" width="max-w-xl">
      {loading ? (
        <Spinner />
      ) : err ? (
        <p className="text-sm text-red-500 text-center py-8">{err}</p>
      ) : request ? (
        <div className="space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900">
                {request.lab_request?.patient?.full_name || 'Patient'}
              </h3>
              <p className="text-sm text-blue-600 font-medium mt-0.5">
                {LAB_TYPE_DISPLAY[request.lab_request?.lab?.lab_type]}
              </p>
            </div>
            <StatusBadge status={request.lab_request?.status} />
          </div>

          {/* Patient & Lab Info */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Patient ID" value={request.lab_request?.patient?.id?.slice(0, 8)} />
            <Field label="Lab" value={request.lab_request?.lab?.name} />
            <Field label="Doctor" value={request.lab_request?.requested_by?.full_name} />
            <Field label="Phone" value={request.lab_request?.patient?.phone} />
          </div>

          {/* Diagnosis & Treatment */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Clinical Information</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">DIAGNOSIS</p>
                <p className="text-sm text-gray-800">{request.lab_request?.diagnosis || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">TREATMENT PLAN</p>
                <p className="text-sm text-gray-800">{request.lab_request?.treatment_plan || '—'}</p>
              </div>
              {request.lab_request?.notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">NOTES</p>
                  <p className="text-sm text-gray-800">{request.lab_request.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Chest Pain Type (if CKD) */}
          {request.lab_request?.chest_pain_type && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">CHEST PAIN TYPE</p>
              <p className="text-sm font-medium text-gray-800">{request.lab_request.chest_pain_type}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Requested"
              value={request.lab_request?.created_at
                ? new Date(request.lab_request.created_at).toLocaleDateString('en-IN')
                : '—'}
            />
            {request.lab_request?.completed_at && (
              <Field
                label="Completed"
                value={new Date(request.lab_request.completed_at).toLocaleDateString('en-IN')}
              />
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      ) : null}
    </Modal>
  )
}

function LabRequestCard({ request, onClick }) {
  const patientName = request.patient?.full_name || 'Unknown'
  const labName = request.lab?.name || 'Lab'

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {patientName[0]?.toUpperCase() || 'P'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{patientName}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{labName}</p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <p className="text-xs text-gray-400">
          {request.created_at
            ? new Date(request.created_at).toLocaleDateString('en-IN')
            : '—'}
        </p>
        <p className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View →
        </p>
      </div>
    </div>
  )
}

export default function LabQueue() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    loadQueue()
  }, [])

  async function loadQueue() {
    setLoading(true); setErr('')
    try {
      const res = await api('/v1/staff/technician/lab-queue/')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setRequests(data)
      } else {
        setErr('Failed to load lab queue.')
        setRequests([])
      }
    } catch {
      setErr('Network error.')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = requests.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || r.patient?.full_name?.toLowerCase().includes(q) || r.lab?.name?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const counts = {
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Lab Queue</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Lab requests assigned to you from doctors.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {[
          { key: 'pending',      color: 'text-amber-700 bg-amber-50 ring-1 ring-amber-200' },
          { key: 'in_progress',  color: 'text-blue-700 bg-blue-50 ring-1 ring-blue-200' },
          { key: 'completed',    color: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200' },
        ].map(({ key, color }) => (
          <div key={key} className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
            {counts[key]} {key.replace('_', ' ')}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            placeholder="Search by patient or lab…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {['all', 'pending', 'in_progress', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors
                ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f === 'in_progress' ? 'In Progress' : f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : err ? (
        <div className="text-center py-12 text-red-500">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-medium">{err}</p>
          <button
            onClick={loadQueue}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🔬</p>
          <p className="font-medium text-gray-600">
            {search || filter !== 'all' ? 'No requests match your filters.' : 'Lab queue is empty.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => (
            <LabRequestCard
              key={r.id}
              request={r}
              onClick={() => { setSelectedId(r.id); setShowDetail(true) }}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {filtered.length} of {requests.length} requests
        </p>
      )}

      <LabRequestDetailModal
        requestId={selectedId}
        open={showDetail}
        onClose={() => { setShowDetail(false); setSelectedId(null) }}
      />
    </div>
  )
}