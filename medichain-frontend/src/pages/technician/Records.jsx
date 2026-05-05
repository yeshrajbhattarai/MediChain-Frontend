// src/pages/technician/Records.jsx
// GET /api/v1/staff/technician/records/
// Shows all medical records created by this technician

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

function RecordDetailModal({ recordId, open, onClose }) {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!open || !recordId) return
    setRecord(null); setErr('')
    setLoading(true)
    api(`/v1/staff/records/${recordId}/`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setErr(data.error); return }
        setRecord(data)
      })
      .catch(() => setErr('Failed to load record details.'))
      .finally(() => setLoading(false))
  }, [open, recordId])

  return (
    <Modal open={open} onClose={onClose} title="Medical Record Details" width="max-w-xl">
      {loading ? (
        <Spinner />
      ) : err ? (
        <p className="text-sm text-red-500 text-center py-8">{err}</p>
      ) : record ? (
        <div className="space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900">
                Record {record.record_id?.slice(0, 8) || '—'}
              </h3>
              <p className="text-sm text-purple-600 font-medium mt-0.5">
                Version {record.version || 1}
              </p>
            </div>
          </div>

          {/* Lab Request Info */}
          {record.lab_request && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900">Lab Request</h4>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Patient" value={record.lab_request?.patient?.full_name} />
                <Field label="Lab" value={record.lab_request?.lab?.name} />
                <Field label="Doctor" value={record.lab_request?.requested_by?.full_name} />
                <Field label="Status" value={record.lab_request?.status} />
              </div>
            </div>
          )}

          {/* Audit Trail */}
          {record.audit && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900">Audit Trail</h4>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                {record.audit.map((entry, idx) => (
                  <div key={idx} className="text-xs">
                    <p className="font-medium text-gray-700">{entry.action}</p>
                    <p className="text-gray-500">{entry.timestamp || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {record.timeline && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900">Timeline</h4>
              <div className="space-y-2">
                {record.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">{event.event}</p>
                      <p className="text-xs text-gray-400">{event.date || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

function RecordCard({ record, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
            📋
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {record.record_id?.slice(0, 8) || 'Record'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              v{record.version || 1}
            </p>
          </div>
        </div>
        <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full flex-shrink-0">
          v{record.version || 1}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <p className="text-xs text-gray-400">
          {record.created_at
            ? new Date(record.created_at).toLocaleDateString('en-IN')
            : '—'}
        </p>
        <p className="text-xs text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View →
        </p>
      </div>
    </div>
  )
}

export default function TechnicianRecords() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    loadRecords()
  }, [])

  async function loadRecords() {
    setLoading(true); setErr('')
    try {
      const res = await api('/v1/staff/technician/records/')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setRecords(data)
      } else {
        setErr('Failed to load records.')
        setRecords([])
      }
    } catch {
      setErr('Network error.')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = records.filter(r => {
    const q = search.toLowerCase()
    return !q || r.record_id?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Records</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Medical records you have created from lab requests.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 ring-1 ring-purple-200">
          {records.length} total
        </div>
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                     focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
          placeholder="Search by record ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : err ? (
        <div className="text-center py-12 text-red-500">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-medium">{err}</p>
          <button
            onClick={loadRecords}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium text-gray-600">
            {search ? 'No records match your search.' : 'No records created yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => (
            <RecordCard
              key={r.record_id}
              record={r}
              onClick={() => { setSelectedId(r.record_id); setShowDetail(true) }}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {filtered.length} of {records.length} records
        </p>
      )}

      <RecordDetailModal
        recordId={selectedId}
        open={showDetail}
        onClose={() => { setShowDetail(false); setSelectedId(null) }}
      />
    </div>
  )
}