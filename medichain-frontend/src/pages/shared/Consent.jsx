// src/pages/shared/Consent.jsx
// Unified consent page — single route, single nav item, two internal tabs.
//
// APIs used:
//   GET    /api/consent/sent/                     — requests sent by my hospital
//   GET    /api/consent/received/                 — requests received by my hospital
//   GET    /api/consent/<id>/                     — single consent detail
//   POST   /api/consent/request/                  — create consent request (Sent tab only)
//   PATCH  /api/consent/<id>/hospital-decision/   — approve/reject (Received + PENDING only)
//   DELETE /api/consent/<id>/                     — withdraw request (Sent + PENDING only)
//   GET    /api/consent/hospitals/                — list all active hospitals for picker
//   GET    /api/consent/patients/search/?phone=   — find patient by phone for picker

import { useState, useEffect, useCallback } from 'react'

const BASE = 'http://127.0.0.1:8000/api'

const api = (url, opts = {}) =>
  fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access') || ''}`,
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

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

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

// ─── Detail Field ─────────────────────────────────────────────────────────────

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

function ConsentDetailModal({ consentId, activeTab, open, onClose, onRefresh }) {
  const [detail,   setDetail]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [deciding, setDeciding] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err,      setErr]      = useState('')

  const isSent     = activeTab === 'sent'
  const isReceived = activeTab === 'received'

  useEffect(() => {
    if (!open || !consentId) return
    setDetail(null); setErr('')
    setLoading(true)
    api(`/consent/${consentId}/`)
      .then(r => r.json())
      .then(setDetail)
      .catch(() => setErr('Failed to load consent details.'))
      .finally(() => setLoading(false))
  }, [open, consentId])

  async function makeDecision(choice) {
    setDeciding(true); setErr('')
    try {
      const res  = await api(`/consent/${consentId}/hospital-decision/`, {
        method: 'PATCH',
        body: JSON.stringify({ hospital_choice: choice }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Failed to submit decision.'); return }
      onRefresh(); onClose()
    } catch { setErr('Network error.') }
    finally { setDeciding(false) }
  }

  async function withdrawConsent() {
    if (!window.confirm('Withdraw this consent request? This cannot be undone.')) return
    setDeleting(true); setErr('')
    try {
      const res = await api(`/consent/${consentId}/`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setErr(data.error || 'Failed to delete consent.')
        return
      }
      onRefresh(); onClose()
    } catch { setErr('Network error.') }
    finally { setDeleting(false) }
  }

  const canDecide   = isReceived && detail?.request_status === 'PENDING' && detail?.hospital_choice === 'PENDING'
  const canWithdraw = isSent     && detail?.request_status === 'PENDING'

  return (
    <Modal open={open} onClose={onClose} title="Consent Request Detail" width="max-w-xl">
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
            <Field label="Patient ID"          value={detail.patient_id}            mono />
            <Field label="Record ID"           value={detail.record_id || 'All records'} mono />
          </div>

          {/* Individual decisions */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs text-gray-500 mb-2">Patient Decision</p>
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

          {/* Received + PENDING → approve / reject */}
          {canDecide && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3">
                Your hospital owns this record. Make your decision:
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => makeDecision('APPROVED')}
                  disabled={deciding}
                  className="flex-1 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
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
          )}

          {/* Sent + PENDING → withdraw */}
          {canWithdraw && (
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={withdrawConsent}
                disabled={deleting}
                className="flex-1 py-2 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-60 transition-colors"
              >
                {deleting ? 'Withdrawing…' : '🗑 Withdraw Request'}
              </button>
            </div>
          )}

          {/* Finalized → just close */}
          {!canDecide && !canWithdraw && (
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

// ─── Hospital Picker Modal ─────────────────────────────────────────────────────
// Loads all active hospitals once on open. Filters by name/city/state client-side.
// Calls GET /api/consent/hospitals/ — needs Samarpan's endpoint or yours in consent/views.py

function HospitalPickerModal({ open, onClose, onSelect }) {
  const [hospitals, setHospitals] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [search,    setSearch]    = useState('')
  const [err,       setErr]       = useState('')

  // Load hospitals every time modal opens, reset search
  useEffect(() => {
    if (!open) return
    setSearch(''); setErr('')
    setLoading(true)
    api('/consent/hospitals/')
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setHospitals(data) : setErr('Failed to load hospitals.'))
      .catch(() => setErr('Network error. Check your connection.'))
      .finally(() => setLoading(false))
  }, [open])

  // Client-side filter — no extra API calls
  const filtered = hospitals.filter(h => {
    const q = search.toLowerCase()
    return !q
      || h.hospital_name?.toLowerCase().includes(q)
      || h.city?.toLowerCase().includes(q)
      || h.state?.toLowerCase().includes(q)
  })

  return (
    <Modal open={open} onClose={onClose} title="Select Hospital" width="max-w-lg">
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          autoFocus
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                     focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
          placeholder="Search by hospital name or city…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : err ? (
        <p className="text-sm text-red-500 text-center py-8">{err}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          {search ? 'No hospitals match your search.' : 'No hospitals found.'}
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filtered.map(h => (
            <div
              key={h.hospital_name}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100
                         hover:border-blue-200 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center
                                justify-center text-sm font-bold flex-shrink-0">
                  {h.hospital_name?.[0]?.toUpperCase() || 'H'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{h.hospital_name}</p>
                  {(h.city || h.state) && (
                    <p className="text-xs text-gray-400">
                      {[h.city, h.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { onSelect(h.hospital_name); onClose() }}
                className="ml-3 flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-blue-600
                           text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
              >
                Select
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right mt-3">
          {filtered.length} of {hospitals.length} hospitals
        </p>
      )}
    </Modal>
  )
}

// ─── Patient Picker Modal ──────────────────────────────────────────────────────
// Doctor types the patient's 10-digit phone → clicks Search → results appear → clicks Select.
// patient UUID fills silently in the form — doctor never has to type a UUID.
// Calls GET /api/consent/patients/search/?phone=<10digits>

function PatientPickerModal({ open, onClose, onSelect }) {
  const [phone,    setPhone]    = useState('')
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)
  const [err,      setErr]      = useState('')

  // Reset every time modal opens
  useEffect(() => {
    if (open) { setPhone(''); setResults([]); setSearched(false); setErr('') }
  }, [open])

  async function handleSearch() {
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setErr('Enter a valid 10-digit phone number.')
      return
    }
    setErr(''); setLoading(true); setSearched(false)
    try {
      const res  = await api(`/consent/patients/search/?phone=${phone}`)
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Search failed.'); return }
      setResults(Array.isArray(data) ? data : [])
      setSearched(true)
    } catch { setErr('Network error.') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Find Patient by Phone" width="max-w-md">
      <div className="space-y-4">

        {/* Phone input + search button */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Patient Phone Number
          </label>
          <div className="flex gap-2">
            <input
              autoFocus
              type="tel"
              maxLength={10}
              className={`flex-1 px-3 py-2 text-sm border rounded-lg outline-none transition-colors
                ${err ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100'}`}
              placeholder="10-digit phone number"
              value={phone}
              onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading || phone.length !== 10}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors flex-shrink-0"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Searching
                </span>
              ) : 'Search'}
            </button>
          </div>
          {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
          <p className="text-xs text-gray-400 mt-1">
            Searches across all hospitals — ask the patient for their registered phone number.
          </p>
        </div>

        {/* No results state */}
        {searched && results.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <p className="text-2xl mb-1">🔍</p>
            <p className="text-sm font-medium text-gray-500">No patient found</p>
            <p className="text-xs mt-0.5">Check the phone number and try again.</p>
          </div>
        )}

        {/* Results list */}
        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">
              {results.length} patient{results.length > 1 ? 's' : ''} found
            </p>
            {results.map(p => (
              <div
                key={p.patient_id}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100
                           hover:border-blue-200 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center
                                  justify-center text-sm font-bold flex-shrink-0">
                    {p.full_name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{p.full_name}</p>
                    <p className="text-xs text-gray-500 font-mono">{p.phone}</p>
                    <p className="text-xs text-gray-400">Registered at: {p.registered_at}</p>
                  </div>
                </div>
                <button
                  onClick={() => { onSelect(p.patient_id, p.full_name); onClose() }}
                  className="ml-3 flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-blue-600
                             text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── New Consent Modal ─────────────────────────────────────────────────────────
// Hospital and patient are both selected via picker modals — no raw UUID typing.
// requesting_hospital is ignored by backend (overridden from JWT).

function NewConsentModal({ open, onClose, onCreated }) {
  const blank = { patient_id: '', requested_to_hospital: '', record_id: '' }
  const [form,         setForm]         = useState(blank)
  const [patientName,  setPatientName]  = useState('')   // display only, not sent to backend
  const [errors,       setErrors]       = useState({})
  const [loading,      setLoading]      = useState(false)
  const [success,      setSuccess]      = useState('')
  const [showHospPick, setShowHospPick] = useState(false)
  const [showPatiPick, setShowPatiPick] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (open) { setForm(blank); setPatientName(''); setErrors({}); setSuccess('') }
  }, [open])

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined, general: undefined, non_field_errors: undefined }))
  }

  async function handleSubmit() {
    setLoading(true); setErrors({}); setSuccess('')
    try {
      const res  = await api('/consent/request/', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors(typeof data === 'object' ? data : { general: 'Something went wrong.' })
        return
      }
      setSuccess('Consent request sent successfully.')
      onCreated()
      setTimeout(onClose, 1400)
    } catch { setErrors({ general: 'Network error. Try again.' }) }
    finally { setLoading(false) }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="New Consent Request">
        <div className="space-y-4">

          {errors.general && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
              {errors.general}
            </div>
          )}
          {errors.non_field_errors && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
              {errors.non_field_errors[0]}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg border border-emerald-200">
              {success}
            </div>
          )}

          {/* Patient — phone lookup → auto-fills UUID */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Patient *</label>
            {form.patient_id ? (
              // Patient selected — show name + UUID + clear button
              <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border
                              border-emerald-200 rounded-lg">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-emerald-800">{patientName || 'Patient selected'}</p>
                  <p className="text-xs font-mono text-emerald-600 truncate">{form.patient_id}</p>
                </div>
                <button
                  onClick={() => { set('patient_id', ''); setPatientName('') }}
                  className="text-xs text-emerald-600 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                >
                  ✕ Clear
                </button>
              </div>
            ) : (
              // No patient yet — show lookup trigger button
              <button
                onClick={() => setShowPatiPick(true)}
                className={`w-full px-3 py-2 text-sm border rounded-lg text-left transition-colors
                  ${errors.patient_id
                    ? 'border-red-400 bg-red-50 text-red-400'
                    : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                🔍 Search patient by phone number…
              </button>
            )}
            {errors.patient_id && (
              <p className="text-xs text-red-500 mt-0.5">{errors.patient_id[0]}</p>
            )}
          </div>

          {/* Owning Hospital — picker fills the readonly input */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Owning Hospital *</label>
            <div className="flex">
              <input
                readOnly
                className={`flex-1 px-3 py-2 text-sm border rounded-l-lg outline-none bg-gray-50
                  ${errors.requested_to_hospital ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="Select a hospital using 🔍"
                value={form.requested_to_hospital}
              />
              <button
                type="button"
                onClick={() => setShowHospPick(true)}
                className="px-3 py-2 text-sm border border-l-0 border-gray-200 rounded-r-lg
                           bg-gray-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300
                           transition-colors text-gray-500 flex-shrink-0"
              >
                🔍
              </button>
            </div>
            {form.requested_to_hospital && (
              <p className="text-xs text-emerald-600 mt-0.5">✓ {form.requested_to_hospital}</p>
            )}
            {errors.requested_to_hospital && (
              <p className="text-xs text-red-500 mt-0.5">{errors.requested_to_hospital[0]}</p>
            )}
          </div>

          {/* Record ID — optional free text */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Record ID <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors
                ${errors.record_id
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'}`}
              placeholder="Leave blank to request all records"
              value={form.record_id}
              onChange={e => set('record_id', e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg
                         text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !form.patient_id || !form.requested_to_hospital}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors font-medium"
            >
              {loading ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Picker modals — rendered outside the main modal to avoid z-index conflicts */}
      <HospitalPickerModal
        open={showHospPick}
        onClose={() => setShowHospPick(false)}
        onSelect={name => set('requested_to_hospital', name)}
      />
      <PatientPickerModal
        open={showPatiPick}
        onClose={() => setShowPatiPick(false)}
        onSelect={(patientId, name) => {
          set('patient_id', patientId)
          setPatientName(name)
        }}
      />
    </>
  )
}

// ─── Consent Card ─────────────────────────────────────────────────────────────

function ConsentCard({ consent, activeTab, onClick }) {
  const isSent       = activeTab === 'sent'
  const counterparty = isSent ? consent.requested_to_hospital : consent.requesting_hospital
  const date         = consent.created_at
    ? new Date(consent.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {counterparty?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              <span className="text-gray-400 font-normal">{isSent ? 'To: ' : 'From: '}</span>
              {counterparty}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">{consent.patient_id}</p>
          </div>
        </div>
        <StatusBadge status={consent.request_status} />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Patient</p>
            <StatusBadge status={consent.patient_choice} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Hospital</p>
            <StatusBadge status={consent.hospital_choice} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{date}</p>
          <p className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
            View details →
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Tab content (list + search/filter) ───────────────────────────────────────

function TabContent({ activeTab, consents, loading, onCardClick, onNewRequest }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Reset filters when tab switches
  useEffect(() => { setFilter('all'); setSearch('') }, [activeTab])

  const isSent = activeTab === 'sent'

  const visible = consents.filter(c => {
    const matchStatus = filter === 'all' || c.request_status === filter
    const q           = search.toLowerCase()
    const matchSearch = !q || [c.patient_id, c.requesting_hospital, c.requested_to_hospital, c.consent_id]
      .some(v => v?.toLowerCase().includes(q))
    return matchStatus && matchSearch
  })

  const counts = {
    PENDING:  consents.filter(c => c.request_status === 'PENDING').length,
    APPROVED: consents.filter(c => c.request_status === 'APPROVED').length,
    REJECTED: consents.filter(c => c.request_status === 'REJECTED').length,
  }

  return (
    <div className="space-y-5">

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
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            placeholder="Search patient ID, hospital, consent ID…"
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

      {/* Cards */}
      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">{isSent ? '📤' : '📥'}</p>
          <p className="font-medium text-gray-600">
            {search || filter !== 'all'
              ? 'No results match your filters.'
              : `No consent requests ${isSent ? 'sent' : 'received'} yet.`}
          </p>
          {isSent && !search && filter === 'all' && (
            <button
              onClick={onNewRequest}
              className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send your first request
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visible.map(c => (
            <ConsentCard
              key={c.consent_id}
              consent={c}
              activeTab={activeTab}
              onClick={() => onCardClick(c.consent_id)}
            />
          ))}
        </div>
      )}

      {!loading && visible.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {visible.length} of {consents.length} requests
        </p>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Consent() {
  const [activeTab,     setActiveTab]     = useState('sent')
  const [sentData,      setSentData]      = useState([])
  const [recvData,      setRecvData]      = useState([])
  const [sentLoading,   setSentLoading]   = useState(true)
  const [recvLoading,   setRecvLoading]   = useState(true)
  const [selectedId,    setSelectedId]    = useState(null)
  const [showDetail,    setShowDetail]    = useState(false)
  const [showNew,       setShowNew]       = useState(false)
  const [blocked,       setBlocked]       = useState(false)

  // Fetch both tabs in parallel on mount
  useEffect(() => { loadSent(); loadReceived() }, [])

  async function loadSent() {
    setSentLoading(true)
    try {
      const res  = await api('/consent/sent/')
      if (res.status === 403) { setBlocked(true); setSentData([]); return }
      const data = await res.json()
      setSentData(Array.isArray(data) ? data : [])
    } catch { setSentData([]) }
    finally { setSentLoading(false) }
  }

  async function loadReceived() {
    setRecvLoading(true)
    try {
      const res  = await api('/consent/received/')
      if (res.status === 403) { setBlocked(true); setRecvData([]); return }
      const data = await res.json()
      setRecvData(Array.isArray(data) ? data : [])
    } catch { setRecvData([]) }
    finally { setRecvLoading(false) }
  }

  // Refresh both tabs after any mutation so counts stay in sync
  function refresh() {
    loadSent()
    loadReceived()
  }

  function openDetail(id) {
    setSelectedId(id)
    setShowDetail(true)
  }

  const isSent        = activeTab === 'sent'
  const activeData    = isSent ? sentData    : recvData
  const activeLoading = isSent ? sentLoading : recvLoading

  // Pending badge count on Received tab
  const pendingReceived = recvData.filter(c => c.request_status === 'PENDING').length

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Consent Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage inter-hospital record sharing requests
          </p>
        </div>
        {isSent && (
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
          >
            <span className="text-lg leading-none">+</span> New Request
          </button>
        )}
      </div>
          {blocked && (
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Access restricted — profile incomplete
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Your hospital account is not fully active. Please complete your
            profile details to use Consent Management.
          </p>
        </div>
      </div>
    )}

      {/* Tab bar */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {[
            { key: 'sent',     label: 'Sent',     icon: '📤', badge: null },
            { key: 'received', label: 'Received',  icon: '📥', badge: pendingReceived || null },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors
                ${activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent -mb-px'}
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.badge ? (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <TabContent
        activeTab={activeTab}
        consents={activeData}
        loading={activeLoading}
        onCardClick={openDetail}
        onNewRequest={() => setShowNew(true)}
      />

      {/* Detail modal — knows which tab is active to show correct actions */}
      <ConsentDetailModal
        consentId={selectedId}
        activeTab={activeTab}
        open={showDetail}
        onClose={() => { setShowDetail(false); setSelectedId(null) }}
        onRefresh={refresh}
      />

      {/* New request modal — only reachable from Sent tab */}
      <NewConsentModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={refresh}
      />
    </div>
  )
}