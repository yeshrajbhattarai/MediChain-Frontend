// src/pages/doctor/Labs.jsx
// Doctor can view all labs in their hospital and see details.
// Read-only — no create/edit/delete.
//
// APIs used:
//   GET /api/v1/staff/doctor/labs/            — list all labs
//   GET /api/v1/staff/doctor/labs/<lab_id>/   — single lab detail
//
import { useState, useEffect } from 'react'
import { fetchWithAuth } from '../../api/client'

const api = (url, opts = {}) =>
  fetchWithAuth(`/api${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  })

// ─── Lab type display labels ───────────────────────────────────────────────────

const LAB_TYPE_DISPLAY = {
  ckd:          'Chronic Kidney Disease',
  pathology:    'Pathology',
  radiology:    'Radiology',
  cardiology:   'Cardiology',
  microbiology: 'Microbiology',
  biochemistry: 'Biochemistry',
  hematology:   'Hematology',
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

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">
        {value ?? <span className="text-gray-400 font-normal">—</span>}
      </p>
    </div>
  )
}

// ─── Lab Detail Modal ──────────────────────────────────────────────────────────
// Endpoint returns FLAT: { id, name, lab_type, is_active, custom_field_schema,
//                          assigned_technicians, pending_requests, completed_requests }

function LabDetailModal({ labId, open, onClose }) {
  const [lab,     setLab]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')

  useEffect(() => {
    if (!open || !labId) return
    setLab(null); setErr('')
    setLoading(true)
    api(`/v1/staff/doctor/labs/${labId}/`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setErr(data.error); return }
        setLab(data)          // flat object — access as lab.name, lab.lab_type, etc.
      })
      .catch(() => setErr('Failed to load lab details.'))
      .finally(() => setLoading(false))
  }, [open, labId])

  return (
    <Modal open={open} onClose={onClose} title="Lab Details" width="max-w-xl">
      {loading ? (
        <Spinner />
      ) : err ? (
        <p className="text-sm text-red-500 text-center py-8">{err}</p>
      ) : lab ? (
        <div className="space-y-6">

          {/* Lab header */}
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {lab.name?.[0]?.toUpperCase() || '🧬'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-gray-900">{lab.name}</h3>
              <p className="text-sm text-blue-600 font-medium mt-0.5">
                {LAB_TYPE_DISPLAY[lab.lab_type] || lab.lab_type}
              </p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
              lab.is_active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {lab.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Basic info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Lab Type" value={LAB_TYPE_DISPLAY[lab.lab_type] || lab.lab_type} />
              <Field label="Status"   value={lab.is_active ? 'Active' : 'Inactive'} />
            </div>
          </div>

          {/* Custom field schema */}
          {lab.custom_field_schema?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Report Fields</h4>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                {lab.custom_field_schema.map((field, idx) => (
                  <div key={idx} className="text-sm flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-800">{field.label || field.key}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {field.type || 'text'}{field.unit ? ` · ${field.unit}` : ''}
                      </p>
                    </div>
                    {field.required && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-600 rounded-full flex-shrink-0">
                        Required
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff + request stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
              <p className="text-xs text-blue-600 font-medium mb-1">TECHNICIANS</p>
              <p className="text-2xl font-bold text-blue-700">
                {lab.assigned_technicians ?? 0}
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <p className="text-xs text-amber-600 font-medium mb-1">PENDING</p>
              <p className="text-2xl font-bold text-amber-700">
                {lab.pending_requests ?? 0}
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <p className="text-xs text-emerald-600 font-medium mb-1">COMPLETED</p>
              <p className="text-2xl font-bold text-emerald-700">
                {lab.completed_requests ?? 0}
              </p>
            </div>
          </div>

          {/* Close */}
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

// ─── Lab Card ─────────────────────────────────────────────────────────────────

function LabCard({ lab, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {lab.name?.[0]?.toUpperCase() || '🧬'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{lab.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {LAB_TYPE_DISPLAY[lab.lab_type] || lab.lab_type}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
          lab.is_active
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {lab.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <p className="text-xs text-gray-400">Click to view details</p>
        <p className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View →
        </p>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DoctorLabs() {
  const [labs,       setLabs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [err,        setErr]        = useState('')

  useEffect(() => { loadLabs() }, [])

  async function loadLabs() {
    setLoading(true); setErr('')
    try {
      const res  = await api('/v1/staff/doctor/labs/')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setLabs(data)
      } else {
        setErr(data?.error || 'Failed to load labs.')
        setLabs([])
      }
    } catch {
      setErr('Network error.')
      setLabs([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = labs.filter(lab => {
    const q = search.toLowerCase()
    return !q || lab.name?.toLowerCase().includes(q) || lab.lab_type?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Available Labs</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          View all labs in your hospital. Send patients to labs from their detail page.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200">
          {labs.length} total
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          {labs.filter(l => l.is_active).length} active
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                     focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
          placeholder="Search labs by name or type…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : err ? (
        <div className="text-center py-12 text-red-500">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-medium">{err}</p>
          <button
            onClick={loadLabs}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🧬</p>
          <p className="font-medium text-gray-600">
            {search ? 'No labs match your search.' : 'No labs available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(lab => (
            <LabCard
              key={lab.id}
              lab={lab}
              onClick={() => { setSelectedId(lab.id); setShowDetail(true) }}
            />
          ))}
        </div>
      )}

      {!loading && !err && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {filtered.length} of {labs.length} labs
        </p>
      )}

      {/* Detail modal */}
      <LabDetailModal
        labId={selectedId}
        open={showDetail}
        onClose={() => { setShowDetail(false); setSelectedId(null) }}
      />
    </div>
  )
}
