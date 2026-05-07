// src/pages/technician/LabQueue.jsx
// Technician lab queue — card list → detail modal (step 1) → fill report (step 2, slides in)

import { useState, useEffect, useRef } from 'react'

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

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Spinner({ size = 8 }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className={`w-${size} h-${size} border-2 border-blue-500 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  )
}

const STATUS_META = {
  pending:     { label: 'Pending',     bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200',   dot: 'bg-amber-500'   },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'ring-blue-200',    dot: 'bg-blue-500'    },
  completed:   { label: 'Completed',   bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
}

function StatusPill({ status }) {
  const s = STATUS_META[status] || STATUS_META.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value || <span className="text-gray-300">—</span>}</p>
    </div>
  )
}

const LAB_TYPE_LABELS = {
  ckd:           'Chronic Kidney Disease',
  pathology:     'Pathology',
  radiology:     'Radiology',
  cardiology:    'Cardiology',
  microbiology:  'Microbiology',
  biochemistry:  'Biochemistry',
  hematology:    'Hematology',
}

// ─── Queue card ───────────────────────────────────────────────────────────────

function QueueCard({ req, onClick }) {
  const name   = req.patient_name || 'Unknown Patient'
  const lab    = req.lab_name    || 'Lab'
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 shadow-sm
                 hover:border-blue-300 hover:shadow-md transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100
                          text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{lab}</p>
          </div>
        </div>
        <StatusPill status={req.status} />
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
        </p>
        <span className="text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View details →
        </span>
      </div>
    </button>
  )
}

// ─── Detail + Fill modal (single modal, two internal steps) ───────────────────
// Step 0 = detail view   (slides from right on open)
// Step 1 = fill report   (slides in from right when "Fill Report" clicked)

function LabModal({ requestId, summaryData, open, onClose, onSubmitted }) {
  const [step, setStep]         = useState(0)   // 0 = detail, 1 = fill
  const [detail, setDetail]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [err, setErr]           = useState('')
  const [formData, setFormData] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitErr, setSubmitErr]   = useState('')
  const overlayRef = useRef(null)

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // reset step every time the modal opens for a new request
  useEffect(() => {
    if (open) {
      setStep(0)
      setDetail(null)
      setErr('')
      setSubmitErr('')
    }
  }, [open, requestId])

  // fetch detail whenever modal opens
  useEffect(() => {
    if (!open || !requestId) return
    setLoading(true)
    api(`/v1/staff/technician/lab-requests/${requestId}/`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setErr(data.error); return }
        setDetail(data)
        // pre-fill form with any existing custom_field_values from the lab request
        const fields = data.lab_request?.lab?.custom_field_schema || []
        const initial = {}
        const existing = data.lab_request?.custom_field_values || {}
        fields.forEach(f => {
          initial[f.key] = existing[f.key] ?? ''
        })
        setFormData(initial)
      })
      .catch(() => setErr('Failed to load request details.'))
      .finally(() => setLoading(false))
  }, [open, requestId])

  if (!open) return null

  const req     = detail?.lab_request
  const fields = req?.lab?.custom_field_schema || []
  const labType = req?.lab?.lab_type
  const labLabel = LAB_TYPE_LABELS[labType] || labType || 'Lab'

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitErr('')
    try {
      const res = await api(`/v1/staff/technician/records/create/`, {
        method: 'POST',
        body: JSON.stringify({
        lab_request_id: requestId,
        custom_field_values: formData,
      }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitErr(data.error || 'Submission failed.'); return }
      onSubmitted?.()
      onClose()
    } catch {
      setSubmitErr('Network error. Please retry.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── shared header ──────────────────────────────────────────────────────────
  const ModalHeader = ({ title, onBack }) => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400
                       hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg"
          >
            ←
          </button>
        )}
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400
                   hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        ✕
      </button>
    </div>
  )

  // ── Step 0: Detail panel ───────────────────────────────────────────────────
  const DetailPanel = () => (
    <>
      <ModalHeader title="Request Details" />

      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
        {loading ? (
          <Spinner />
        ) : err ? (
          <p className="text-sm text-red-500 text-center py-10">{err}</p>
        ) : req ? (
          <>
            {/* Patient + status header */}
            <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div>
                <p className="text-base font-semibold text-gray-900">{req.patient?.full_name || summaryData?.patient_name || 'Patient'}</p>
                <p className="text-sm text-blue-600 font-medium mt-0.5">{labLabel}</p>
              </div>
              <StatusPill status={req.status} />
            </div>

            {/* Quick info grid — FIXED: req.requested_by for doctor, not req.patient */}
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Doctor"   value={req.requested_by?.full_name} />
              <InfoRow label="Lab"      value={req.lab?.name} />
              <InfoRow label="Requested" value={req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN') : '—'} />
              <InfoRow label="Patient phone" value={req.patient?.phone} />
            </div>

            {/* Clinical section */}
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Clinical Information</p>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <InfoRow label="Diagnosis"      value={req.diagnosis} />
                <InfoRow label="Treatment Plan" value={req.treatment_plan} />
                {req.notes && <InfoRow label="Notes" value={req.notes} />}
                {req.chest_pain_type && <InfoRow label="Chest Pain Type" value={req.chest_pain_type} />}
              </div>
            </div>

            {/* Doctor-provided custom field values (read-only preview) */}
            {req.custom_field_values && Object.keys(req.custom_field_values).length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Doctor Pre-filled Values</p>
                <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  {Object.entries(req.custom_field_values).map(([k, v]) => (
                    <InfoRow key={k} label={k.replace(/_/g, ' ')} value={String(v)} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Footer */}
      {req && (
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm border border-gray-200 rounded-xl text-gray-600
                       hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {req.status !== 'completed' && (
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white
                         font-medium rounded-xl transition-colors"
            >
              Fill Report →
            </button>
          )}
        </div>
      )}
    </>
  )

  // ── Step 1: Fill report panel ──────────────────────────────────────────────
  const FillPanel = () => (
    <>
      <ModalHeader title="Fill Lab Report" onBack={() => { setStep(0); setSubmitErr('') }} />

      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

        {/* Compact patient summary strip */}
        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm
                          flex items-center justify-center flex-shrink-0">
            {(req?.patient?.full_name || summaryData?.patient_name || 'P')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {req?.patient?.full_name || summaryData?.patient_name}
            </p>
            <p className="text-xs text-indigo-600">{labLabel} · {req?.diagnosis?.slice(0, 50)}{req?.diagnosis?.length > 50 ? '…' : ''}</p>
          </div>
        </div>

        {/* Technician measurement fields */}
        {fields.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Technician Measurements</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field, i) => {
                const isNum = field.type === 'integer' || field.type === 'float'
                return (
                  <div key={i}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 capitalize">
                      {field.label || field.key}
                      <span className="ml-1 font-normal text-gray-400 normal-case">({field.field_type})</span>
                    </label>
                    <input
                      type={isNum ? 'number' : 'text'}
                      value={formData[field.key] ?? ''}
                      onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={`Enter ${field.label || field.key}`}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm
                                 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none
                                 transition-all placeholder:text-gray-300"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* No schema-defined fields → show freeform key-value editor from custom_field_values */
          req?.custom_field_values && Object.keys(req.custom_field_values).length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Measurements</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(req.custom_field_values).map((key, i) => (
                  <div key={i}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="text"
                      value={formData[key] ?? req.custom_field_values[key] ?? ''}
                      onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm
                                 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none
                                 transition-all placeholder:text-gray-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">No measurement fields defined for this lab type.</p>
              <p className="text-xs mt-1 text-gray-300">You can still submit to mark as complete.</p>
            </div>
          )
        )}

        {submitErr && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {submitErr}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
        <button
          onClick={() => { setStep(0); setSubmitErr('') }}
          className="flex-1 py-2 text-sm border border-gray-200 rounded-xl text-gray-600
                     hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50
                     disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          {submitting ? 'Submitting…' : 'Submit Report'}
        </button>
      </div>
    </>
  )

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden"
        style={{ animation: 'modalPop .2s cubic-bezier(.22,1,.36,1)' }}
      >
        {/* Step panels — swap on step change */}
        {step === 0 ? <DetailPanel /> : <FillPanel />}
      </div>

      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(.96) translateY(8px) }
          to   { opacity: 1; transform: scale(1)  translateY(0)    }
        }
      `}</style>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LabQueue() {
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [err,      setErr]      = useState('')
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)   // { id, ...summaryData }
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { loadQueue() }, [])

  async function loadQueue() {
    setLoading(true); setErr('')
    try {
      const res  = await api('/v1/staff/technician/lab-queue/')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setRequests(data)
      } else {
        setErr('Failed to load lab queue.')
      }
    } catch {
      setErr('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = requests.filter(r => {
    const okStatus = filter === 'all' || r.status === filter
    const q = search.toLowerCase()
    const name = (r.patient_name || '').toLowerCase()
    const lab  = (r.lab_name    || '').toLowerCase()
    const okSearch = !q || name.includes(q) || lab.includes(q)
    return okStatus && okSearch
  })

  const counts = {
    pending:     requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed:   requests.filter(r => r.status === 'completed').length,
  }

  function openModal(req) {
    setSelected(req)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setTimeout(() => setSelected(null), 300)
  }

  return (
    <div className="space-y-6 pb-8">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Lab Queue</h1>
        <p className="text-sm text-gray-400 mt-0.5">Lab requests assigned to you from doctors</p>
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'pending',     ...STATUS_META.pending     },
          { key: 'in_progress', ...STATUS_META.in_progress },
          { key: 'completed',   ...STATUS_META.completed   },
        ].map(({ key, bg, text, ring }) => (
          <span key={key} className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ${bg} ${text} ${ring}`}>
            {counts[key]} {key.replace('_', ' ')}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            placeholder="Search patient or lab..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5">
          {['all', 'pending', 'in_progress', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors
                ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f === 'in_progress' ? 'In Progress' : f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : err ? (
        <div className="text-center py-16 text-red-500">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-sm font-medium">{err}</p>
          <button
            onClick={loadQueue}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
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
            <QueueCard key={r.id} req={r} onClick={() => openModal(r)} />
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {filtered.length} of {requests.length} requests
        </p>
      )}

      {/* Single modal — slides between detail and fill steps */}
      <LabModal
        requestId={selected?.id}
        summaryData={selected}
        open={showModal}
        onClose={closeModal}
        onSubmitted={() => { loadQueue() }}
      />
    </div>
  )
}