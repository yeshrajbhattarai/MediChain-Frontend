// src/pages/patient/PatientConsent.jsx
// Patient consent management — patients view consent requests directed at them
// and can approve or reject each one.
//
// APIs used:
//   GET   /api/v1/patient/consents/                            — list patient's consent requests
//   GET   /api/v1/consent/<id>/                               — consent detail
//   PATCH /api/v1/consent/<id>/patient-decision/              — patient approve / reject

import { useState, useEffect } from 'react'
import { getAccessToken } from '../../auth_store/authStore'

const BASE = 'http://localhost:8000/api/v1'

const authApi = (url, opts = {}) =>
  fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken() || ''}`,
      ...opts.headers,
    },
  })

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS = {
  APPROVED: {
    label: 'Approved',
    cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    cls: 'bg-red-50 text-red-600 ring-1 ring-red-200',
    dot: 'bg-red-400',
  },
  PENDING: {
    label: 'Pending',
    cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-400',
  },
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.PENDING
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }) {
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col"
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

function Field({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm text-gray-800 font-medium ${mono ? 'font-mono' : ''}`}>
        {value || <span className="text-gray-400 font-normal">—</span>}
      </p>
    </div>
  )
}

// ─── Consent Detail Modal ──────────────────────────────────────────────────────

function ConsentDetailModal({ consentId, open, onClose, onRefresh }) {
  const [detail,   setDetail]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [deciding, setDeciding] = useState(false)
  const [err,      setErr]      = useState('')

  useEffect(() => {
    if (!open || !consentId) return
    setDetail(null); setErr('')
    setLoading(true)
    authApi(`/consent/${consentId}/`)
      .then(r => r.json())
      .then(setDetail)
      .catch(() => setErr('Failed to load consent details.'))
      .finally(() => setLoading(false))
  }, [open, consentId])

  async function makeDecision(patient_choice) {
    setDeciding(true); setErr('')
    try {
      const res  = await authApi(`/consent/${consentId}/patient-decision/`, {
        method: 'PATCH',
        body: JSON.stringify({ patient_choice }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Failed to submit decision.'); return }
      onRefresh()
      onClose()
    } catch { setErr('Network error.') }
    finally { setDeciding(false) }
  }

  const canDecide = detail?.patient_choice === 'PENDING'

  return (
    <Modal open={open} onClose={onClose} title="Consent Request Detail">
      {loading ? (
        <Spinner />
      ) : err && !detail ? (
        <p className="text-sm text-red-500">{err}</p>
      ) : detail ? (
        <div className="space-y-5">

          {/* Consent ID + overall status */}
          <div className="flex items-start justify-between gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1">Consent ID</p>
              <p className="text-xs font-mono text-gray-700 break-all">{detail.consent_id}</p>
            </div>
            <StatusBadge status={detail.request_status} />
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Requesting Hospital" value={detail.requesting_hospital} />
            <Field label="Owning Hospital"     value={detail.requested_to_hospital} />
            <Field label="Record ID"           value={detail.record_id || 'All records'} mono />
          </div>

          {/* Individual decisions */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs text-gray-500 mb-2">Your Decision</p>
              <StatusBadge status={detail.patient_choice} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Hospital Decision</p>
              <StatusBadge status={detail.hospital_choice} />
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Requested On"
              value={detail.created_at
                ? new Date(detail.created_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })
                : null}
            />
            <Field
              label="Last Updated"
              value={detail.updated_at
                ? new Date(detail.updated_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })
                : null}
            />
          </div>

          {err && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
              {err}
            </p>
          )}

          {/* Pending → approve / reject */}
          {canDecide ? (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3">
                A hospital is requesting access to your medical record. Make your decision:
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => makeDecision('APPROVED')}
                  disabled={deciding}
                  className="flex-1 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60 transition-colors"
                >
                  {deciding ? 'Submitting…' : '✓ Approve'}
                </button>
                <button
                  onClick={() => makeDecision('REJECTED')}
                  disabled={deciding}
                  className="flex-1 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
                >
                  {deciding ? 'Submitting…' : '✕ Reject'}
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-1 border-t border-gray-100">
              <button
                onClick={onClose}
                className="w-full py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  )
}

const RECORD_ID_DISPLAY_LENGTH = 12

// ─── Consent Card ─────────────────────────────────────────────────────────────

function ConsentCard({ consent, onClick }) {
  const date = consent.created_at
    ? new Date(consent.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {consent.requesting_hospital?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              <span className="text-gray-400 font-normal">From: </span>
              {consent.requesting_hospital}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {consent.record_id
                ? `Record: ${String(consent.record_id).slice(0, RECORD_ID_DISPLAY_LENGTH)}…`
                : 'All records'}
            </p>
          </div>
        </div>
        <StatusBadge status={consent.request_status} />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Your Decision</p>
            <StatusBadge status={consent.patient_choice} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Hospital</p>
            <StatusBadge status={consent.hospital_choice} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{date}</p>
          <p className="text-xs text-teal-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
            View details →
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PatientConsent() {
  const [consents,    setConsents]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [filter,      setFilter]      = useState('all')
  const [search,      setSearch]      = useState('')
  const [selectedId,  setSelectedId]  = useState(null)
  const [showDetail,  setShowDetail]  = useState(false)

  useEffect(() => { loadConsents() }, [])

  async function loadConsents() {
    setLoading(true); setError('')
    try {
      const res  = await authApi('/patient/consents/')
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to load consent requests.'); return }
      setConsents(Array.isArray(data) ? data : data.results || [])
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  function openDetail(id) {
    setSelectedId(id)
    setShowDetail(true)
  }

  const counts = {
    PENDING:  consents.filter(c => c.request_status === 'PENDING').length,
    APPROVED: consents.filter(c => c.request_status === 'APPROVED').length,
    REJECTED: consents.filter(c => c.request_status === 'REJECTED').length,
  }

  const pendingDecision = consents.filter(c => c.patient_choice === 'PENDING').length

  const visible = consents.filter(c => {
    const matchStatus = filter === 'all' || c.request_status === filter
    const q           = search.toLowerCase()
    const matchSearch = !q || [c.requesting_hospital, c.requested_to_hospital, c.consent_id, c.record_id]
      .some(v => v?.toLowerCase().includes(q))
    return matchStatus && matchSearch
  })

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Consent Requests</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage hospitals' requests to access your medical records.
        </p>
      </div>

      {/* Pending action banner */}
      {pendingDecision > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {pendingDecision} request{pendingDecision > 1 ? 's' : ''} awaiting your decision
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Click on a request card to review and approve or reject it.
            </p>
          </div>
        </div>
      )}

      {/* Stat pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { key: 'PENDING',  color: 'text-amber-700 bg-amber-50 ring-1 ring-amber-200'       },
          { key: 'APPROVED', color: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200' },
          { key: 'REJECTED', color: 'text-red-600 bg-red-50 ring-1 ring-red-200'             },
        ].map(({ key, color }) => (
          <div key={key} className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
            {counts[key]} {key.charAt(0) + key.slice(1).toLowerCase()}
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 transition-colors"
            placeholder="Search by hospital or consent ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {['all', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors
                ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-sm font-medium text-red-500">{error}</p>
          <button
            onClick={loadConsents}
            className="mt-4 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-medium text-gray-600">
            {search || filter !== 'all'
              ? 'No results match your filters.'
              : 'No consent requests yet.'}
          </p>
          <p className="text-xs mt-1 text-gray-400">
            When a hospital requests access to your records, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visible.map(c => (
            <ConsentCard
              key={c.consent_id}
              consent={c}
              onClick={() => openDetail(c.consent_id)}
            />
          ))}
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {visible.length} of {consents.length} requests
        </p>
      )}

      {/* Detail modal */}
      <ConsentDetailModal
        consentId={selectedId}
        open={showDetail}
        onClose={() => { setShowDetail(false); setSelectedId(null) }}
        onRefresh={loadConsents}
      />
    </div>
  )
}
