// src/pages/technician/LabQueue.jsx
// Technician lab queue — card list → detail modal (step 0) → fill report (step 1)
// API shape: GET /api/v1/staff/technician/lab-queue/ → array of summary items
//            GET /api/v1/staff/technician/lab-requests/{id}/ → { lab_request: {...}, latest_revision: ... }
//            POST /api/v1/staff/technician/records/create/ → { lab_request_id, custom_field_values }

import { useState, useEffect, useRef } from 'react'
import { fetchWithAuth } from '../../api/client'
import { ALL_TEST_PATIENTS } from '../../data/ckdTestPatients'

// ─── API helper ───────────────────────────────────────────────────────────────

const api = (url, opts = {}) =>
  fetchWithAuth(`/api${url}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
  })

// ─── Constants ────────────────────────────────────────────────────────────────

const LAB_TYPE_LABELS = {
  ckd:          'Chronic Kidney Disease (CKD)',
  pathology:    'Pathology',
  radiology:    'Radiology',
  cardiology:   'Cardiology',
  microbiology: 'Microbiology',
  biochemistry: 'Biochemistry',
  hematology:   'Hematology',
}

const STATUS_META = {
  pending:     { label: 'Pending',     bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200',   dot: 'bg-amber-500'   },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'ring-blue-200',    dot: 'bg-blue-500'    },
  completed:   { label: 'Completed',   bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
}

// ─── Small shared components ─────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function StatusPill({ status }) {
  const s = STATUS_META[status] || STATUS_META.pending
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
                  text-xs font-semibold ring-1 flex-shrink-0
                  ${s.bg} ${s.text} ${s.ring}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-0.5">
        {label}
      </p>
      <p className="text-sm text-gray-800">
        {value || <span className="text-gray-300">—</span>}
      </p>
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">
      {children}
    </p>
  )
}

// ─── Queue card ───────────────────────────────────────────────────────────────

function QueueCard({ req, onClick }) {
  const name     = req.patient_name || 'Unknown Patient'
  const lab      = req.lab_name     || 'Lab'
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const date     = req.created_at
    ? new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '—'

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 shadow-sm
                 hover:border-blue-300 hover:shadow-md transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100
                       text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{lab}</p>
          </div>
        </div>
        <StatusPill status={req.status} />
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-400">{date}</p>
        <span className="text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View details →
        </span>
      </div>
    </button>
  )
}

// ─── Field renderer ───────────────────────────────────────────────────────────
// field.type drives the input:
//   'choice'  → <select> with field.options
//   'decimal' → <input type="number" step="any">
//   'integer' → <input type="number" step="1">
//   'text'    → <input type="text">

function LabField({ field, value, onChange }) {
  const label = (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {field.label || field.key}
      {field.required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )

  if (field.type === 'choice' && field.options?.length > 0) {
    // normalise: options may be [{ label, value }] (API) or ['string'] (LAB_TEMPLATES)
    const normalised = field.options.map(o =>
      typeof o === 'string' ? { label: o, value: o } : o
    )
    return (
      <div>
        {label}
        <select
          value={value ?? ''}
          onChange={e => onChange(field.key, e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm
                     focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none
                     bg-white text-gray-800 transition-all"
        >
          <option value="">Select…</option>
          {normalised.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  const isNumeric = field.type === 'integer' || field.type === 'decimal'
  const step      = field.type === 'decimal' ? 'any' : '1'

  return (
    <div>
      {label}
      <input
        type={isNumeric ? 'number' : 'text'}
        step={isNumeric ? step : undefined}
        value={value ?? ''}
        onChange={e => onChange(field.key, e.target.value)}
        placeholder={`Enter ${field.label || field.key}`}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm
                   focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none
                   transition-all placeholder:text-gray-300"
      />
    </div>
  )
}

// ─── Autofill picker ──────────────────────────────────────────────────────────
// Dropdown that lets testers one-click fill all fields with a preset patient profile.

function AutofillPicker({ onSelect, schema }) {
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)

  // close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const ckdPatients    = ALL_TEST_PATIENTS.filter(p => p.category === 'ckd')
  const notCkdPatients = ALL_TEST_PATIENTS.filter(p => p.category === 'not_ckd')

  function handleSelect(presetValues) {
    // Only inject keys that exist in the current schema
    const schemaKeys = new Set(schema.map(f => f.key))
    const filtered   = Object.fromEntries(
      Object.entries(presetValues).filter(([k]) => schemaKeys.has(k))
    )
    onSelect(filtered)
    setOpen(false)
  }

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                   rounded-lg border border-violet-200 bg-violet-50 text-violet-700
                   hover:bg-violet-100 transition-colors"
      >
        <span>🧪</span>
        Autofill test data
        <span className="text-violet-400 text-[10px]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200
                     rounded-2xl shadow-xl z-50 overflow-hidden"
        >
          {/* CKD group */}
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-semibold tracking-widest text-red-500 uppercase">
              🔴 CKD patients
            </p>
          </div>
          {ckdPatients.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(p.values)}
              className="w-full text-left px-3 py-2 text-xs text-gray-700
                         hover:bg-red-50 transition-colors leading-snug"
            >
              {p.label}
            </button>
          ))}

          <div className="border-t border-gray-100 mx-3 my-1" />

          {/* Non-CKD group */}
          <div className="px-3 pt-1 pb-1">
            <p className="text-[10px] font-semibold tracking-widest text-emerald-600 uppercase">
              🟢 Healthy patients
            </p>
          </div>
          {notCkdPatients.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(p.values)}
              className="w-full text-left px-3 py-2 text-xs text-gray-700
                         hover:bg-emerald-50 transition-colors leading-snug"
            >
              {p.label}
            </button>
          ))}

          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400">
              Selecting a profile overwrites all current field values.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function LabModal({ requestId, summaryData, open, onClose, onSubmitted }) {
  const [step, setStep]             = useState(0)
  const [detail, setDetail]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [fetchErr, setFetchErr]     = useState('')
  const [formData, setFormData]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitErr, setSubmitErr]   = useState('')
  const overlayRef                  = useRef(null)

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // reset on open
  useEffect(() => {
    if (open) {
      setStep(0)
      setDetail(null)
      setFetchErr('')
      setSubmitErr('')
      setFormData({})
    }
  }, [open, requestId])

  // fetch full detail
  useEffect(() => {
    if (!open || !requestId) return
    setLoading(true)
    api(`/v1/staff/technician/lab-requests/${requestId}/`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setFetchErr(data.error); return }
        setDetail(data)
        // initialise form: schema keys with existing values or empty string
        const schema   = data.lab_request?.lab?.custom_field_schema || []
        const existing = data.lab_request?.custom_field_values      || {}
        const initial  = {}
        schema.forEach(f => { initial[f.key] = existing[f.key] ?? '' })
        setFormData(initial)
      })
      .catch(() => setFetchErr('Failed to load request details.'))
      .finally(() => setLoading(false))
  }, [open, requestId])

  if (!open) return null

  const labReq      = detail?.lab_request
  const schema      = labReq?.lab?.custom_field_schema || []
  const labType     = labReq?.lab?.lab_type
  const labLabel    = LAB_TYPE_LABELS[labType] || labType || 'Lab'
  const patientName = labReq?.patient?.full_name
    || summaryData?.patient_name
    || 'Patient'

  function handleFieldChange(key, val) {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  // Autofill: replace formData with preset values (schema-filtered)
  function handleAutofill(filteredValues) {
    setFormData(prev => ({ ...prev, ...filteredValues }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitErr('')
    try {
      const res  = await api('/v1/staff/technician/records/create/', {
        method: 'POST',
        body: JSON.stringify({
          lab_request_id:      requestId,
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

  // ── Shared modal header ────────────────────────────────────────────────────
  const ModalHeader = ({ title, onBack }) => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400
                       hover:text-gray-700 hover:bg-gray-100 transition-colors text-base"
          >
            ←
          </button>
        )}
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
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
      <ModalHeader title="Request details" />

      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
        {loading ? (
          <Spinner />
        ) : fetchErr ? (
          <p className="text-sm text-red-500 text-center py-10">{fetchErr}</p>
        ) : labReq ? (
          <>
            {/* Patient + status banner */}
            <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div>
                <p className="text-base font-semibold text-gray-900">{patientName}</p>
                <p className="text-sm text-blue-600 font-medium mt-0.5">{labLabel}</p>
              </div>
              <StatusPill status={labReq.status} />
            </div>

            {/* Quick info grid */}
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Doctor"        value={labReq.doctor_name || summaryData?.doctor_name} />
              <InfoRow label="Lab"           value={labReq.lab?.name} />
              <InfoRow
                label="Requested on"
                value={labReq.created_at
                  ? new Date(labReq.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })
                  : null}
              />
              <InfoRow label="Patient phone" value={labReq.patient?.phone} />
              {labReq.completed_at && (
                <InfoRow
                  label="Completed on"
                  value={new Date(labReq.completed_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                />
              )}
            </div>

            {/* Clinical information */}
            <div>
              <SectionHeading>Clinical information</SectionHeading>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <InfoRow label="Diagnosis"      value={labReq.diagnosis} />
                <InfoRow label="Treatment plan" value={labReq.treatment_plan} />
                {labReq.notes           && <InfoRow label="Notes"           value={labReq.notes} />}
                {labReq.chest_pain_type && <InfoRow label="Chest pain type" value={labReq.chest_pain_type} />}
              </div>
            </div>

            {/* Latest revision summary */}
            {detail?.latest_revision && (
              <div>
                <SectionHeading>Latest report revision</SectionHeading>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-xs text-emerald-700">
                    Submitted on{' '}
                    {new Date(detail.latest_revision.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Doctor pre-filled values */}
            {labReq.custom_field_values &&
              Object.keys(labReq.custom_field_values).length > 0 && (
              <div>
                <SectionHeading>Doctor pre-filled values</SectionHeading>
                <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  {Object.entries(labReq.custom_field_values).map(([k, v]) => (
                    <InfoRow key={k} label={k.replace(/_/g, ' ')} value={String(v)} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Footer */}
      {labReq && (
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm border border-gray-200 rounded-xl text-gray-600
                       hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {labReq.status !== 'completed' && (
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white
                         font-medium rounded-xl transition-colors"
            >
              Fill report →
            </button>
          )}
        </div>
      )}
    </>
  )

  // ── Step 1: Fill report panel ──────────────────────────────────────────────
  const FillPanel = () => (
    <>
      <ModalHeader
        title="Fill lab report"
        onBack={() => { setStep(0); setSubmitErr('') }}
      />

      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

        {/* Compact patient strip */}
        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <div
            className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm
                       flex items-center justify-center flex-shrink-0"
          >
            {patientName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{patientName}</p>
            <p className="text-xs text-indigo-600">
              {labLabel}
              {labReq?.diagnosis
                ? ` · ${labReq.diagnosis.slice(0, 55)}${labReq.diagnosis.length > 55 ? '…' : ''}`
                : ''}
            </p>
          </div>
        </div>

        {/* Fields section — header row with autofill button */}
        {schema.length > 0 ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <SectionHeading>Technician measurements</SectionHeading>
              {/* Autofill is only meaningful for CKD labs */}
              {labType === 'ckd' && (
                <AutofillPicker onSelect={handleAutofill} schema={schema} />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {schema.map(field => (
                <LabField
                  key={field.key}
                  field={field}
                  value={formData[field.key]}
                  onChange={handleFieldChange}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">No measurement fields defined for this lab type.</p>
            <p className="text-xs mt-1 text-gray-300">You can still submit to mark as complete.</p>
          </div>
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
          className="flex-1 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700
                     disabled:opacity-50 disabled:cursor-not-allowed
                     text-white font-semibold rounded-xl transition-colors"
        >
          {submitting ? 'Submitting…' : 'Submit report'}
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
        {step === 0 ? <DetailPanel /> : <FillPanel />}
      </div>
      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(.96) translateY(8px) }
          to   { opacity: 1; transform: scale(1)  translateY(0) }
        }
      `}</style>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LabQueue() {
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [err, setErr]             = useState('')
  const [filter, setFilter]       = useState('all')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { loadQueue() }, [])

  async function loadQueue() {
    setLoading(true)
    setErr('')
    try {
      const res  = await api('/v1/staff/technician/lab-queue/')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setRequests(data)
      } else {
        setErr(data?.error || 'Failed to load lab queue.')
      }
    } catch {
      setErr('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = requests.filter(r => {
    const okStatus = filter === 'all' || r.status === filter
    const q        = search.toLowerCase()
    const okSearch = !q
      || (r.patient_name || '').toLowerCase().includes(q)
      || (r.lab_name     || '').toLowerCase().includes(q)
      || (r.doctor_name  || '').toLowerCase().includes(q)
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

  const FilterTab = ({ value, label }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
        filter === value
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-6 pb-8">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Lab queue</h1>
          <p className="text-sm text-gray-400 mt-0.5">Lab requests assigned to you from doctors</p>
        </div>
        <button
          onClick={loadQueue}
          className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'pending',     label: 'pending',     ...STATUS_META.pending     },
          { key: 'in_progress', label: 'in progress', ...STATUS_META.in_progress },
          { key: 'completed',   label: 'completed',   ...STATUS_META.completed   },
        ].map(({ key, label, bg, text, ring, dot }) => (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ${bg} ${text} ${ring}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {counts[key]} {label}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors bg-white"
            placeholder="Search patient, lab or doctor…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5">
          <FilterTab value="all"         label="All" />
          <FilterTab value="pending"     label="Pending" />
          <FilterTab value="in_progress" label="In progress" />
          <FilterTab value="completed"   label="Completed" />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : err ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-sm font-medium text-red-500">{err}</p>
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
            {search || filter !== 'all'
              ? 'No requests match your filters.'
              : 'Your lab queue is empty.'}
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

      {/* Modal */}
      <LabModal
        requestId={selected?.id}
        summaryData={selected}
        open={showModal}
        onClose={closeModal}
        onSubmitted={loadQueue}
      />
    </div>
  )
}