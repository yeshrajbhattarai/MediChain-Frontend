// src/pages/technician/Records.jsx
// GET /api/v1/staff/technician/records/          — list
// GET /api/v1/staff/records/<record_id>/         — detail (may 403 until backend permission fixed)
// GET /api/v1/staff/records/<record_id>/history/ — history

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
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        style={{ animation: 'modalIn .18s cubic-bezier(.22,1,.36,1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
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
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value || <span className="text-gray-300">—</span>}</p>
    </div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function RecordDetailModal({ recordId, listRecord, open, onClose }) {
  const [detail,  setDetail]  = useState(null)
  const [history, setHistory] = useState([])
  const [tab,     setTab]     = useState('details')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !recordId) return
    setDetail(null); setHistory([]); setTab('details')
    setLoading(true)

    Promise.all([
      api(`/v1/staff/records/${recordId}/`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null),
      api(`/v1/staff/records/${recordId}/history/`)
        .then(r => r.ok ? r.json() : [])
        .catch(() => []),
    ])
      .then(([d, h]) => {
        setDetail(d)
        setHistory(Array.isArray(h) ? h : [])
      })
      .finally(() => setLoading(false))
  }, [open, recordId])

  // fall back to list-level data when detail endpoint returns 403
  const req = detail?.lab_request || null
  const audit = detail?.audit
  const ver   = detail?.version ?? listRecord?.version ?? 1

  return (
    <Modal open={open} onClose={onClose} title="Medical Record Details">
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-5">

          {/* Header */}
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-gray-900">
              {listRecord?.patient_name || '—'}
            </p>

            <p className="text-sm text-purple-600 font-medium mt-0.5">
              {listRecord?.lab_name || '—'}
            </p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full flex-shrink-0">
              v{ver}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5 w-fit">
            {['details', 'history'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors
                  ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Details tab */}
          {tab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-3">
                    Custom Field Values
                  </p>

                  <div className="space-y-2">
                    {Object.entries(listRecord?.custom_field_values || {}).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-sm border-b border-gray-100 pb-2"
                      >
                        <span className="capitalize text-gray-500">
                          {key.replaceAll('_', ' ')}
                        </span>

                        <span className="font-medium text-gray-900">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Field label="Patient" value={listRecord?.patient_name} />
                <Field label="Lab"     value={listRecord?.lab_name} />
                <Field label="Technician" value={listRecord?.recorded_by_name} />
                <Field label="Record Type" value={listRecord?.record_type_display} />
              </div>

              

              {audit && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-3">Audit</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Created by" value={audit.created_by_name} />
                    <Field label="Role"        value={audit.created_by_role} />
                    <Field label="Created at"
                      value={audit.created_at
                        ? new Date(audit.created_at).toLocaleString('en-IN')
                        : '—'}
                    />
                    <Field label="Version" value={`v${audit.selected_version || ver}`} />
                  </div>
                </div>
              )}

              {!detail && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
                  ⚠ Full record detail requires permissions. Showing available data from list.
                </p>
              )}
            </div>
          )}

          {/* History tab */}
          {tab === 'history' && (
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  {detail === null
                    ? 'History unavailable — permission needed.'
                    : 'No history found.'}
                </p>
              ) : history.map((entry, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 capitalize">
                      v{entry.version_number} · {entry.event_type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {entry.changed_at
                        ? new Date(entry.changed_at).toLocaleString('en-IN')
                        : '—'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    By <span className="font-medium text-gray-700">{entry.changed_by_name}</span>
                    {entry.changed_by_role && ` (${entry.changed_by_role})`}
                  </p>
                  {entry.change_reason && (
                    <p className="text-xs text-gray-400 mt-1 italic">"{entry.change_reason}"</p>
                  )}
                  {entry.data_snapshot?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {entry.data_snapshot.map((snap, i) => (
                        <div key={i} className="text-xs flex gap-2 flex-wrap">
                          <span className="text-gray-400 font-medium w-28 flex-shrink-0">{snap.label}</span>
                          {snap.previous !== undefined ? (
                            <span>
                              <span className="text-red-400 line-through">{snap.previous}</span>
                              {' → '}
                              <span className="text-green-600">{snap.current}</span>
                            </span>
                          ) : (
                            <span className="text-gray-600">{snap.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
  <a
    href={`/technician/records/${recordId}`}
    className="flex-1 py-2 text-sm rounded-xl bg-blue-600 text-white text-center hover:bg-blue-700 transition-colors"
  >
    View Full
  </a>

  <a
    href={`/technician/records/${recordId}/edit`}
    className="flex-1 py-2 text-sm rounded-xl border border-amber-200 text-amber-700 bg-amber-50 text-center hover:bg-amber-100 transition-colors"
  >
    Edit Record
  </a>

  <a
    href={`/technician/records/${recordId}/history`}
    className="flex-1 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 text-center hover:bg-gray-50 transition-colors"
  >
    View History
  </a>
</div>

<button
  onClick={onClose}
  className="w-full mt-3 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
>
  Close
</button>
        </div>
      )}
    </Modal>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TechnicianRecords() {
  const [records,    setRecords]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [err,        setErr]        = useState('')

  useEffect(() => { loadRecords() }, [])

  async function loadRecords() {
    
    setLoading(true); setErr('')
    try {
      const res  = await api('/v1/staff/technician/records/')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        if (data.length > 0) console.log('RECORD[0]:', JSON.stringify(data[0], null, 2))
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
    if (!q) return true
    const patient = (r.lab_request?.patient?.full_name     || '').toLowerCase()
    const lab     = (r.lab_request?.lab?.name              || '').toLowerCase()
    const doctor  = (r.lab_request?.requested_by?.full_name|| '').toLowerCase()
    const id      = (r.record_id                           || '').toLowerCase()
    return patient.includes(q) || lab.includes(q) || doctor.includes(q) || id.includes(q)
  })

  function openDetail(r)  { setSelected(r); setShowDetail(true) }
  function closeDetail()  { setShowDetail(false); setTimeout(() => setSelected(null), 300) }

  return (
    <div className="space-y-6 pb-8">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Records</h1>
        <p className="text-sm text-gray-400 mt-0.5">Medical records you have created from lab requests.</p>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 ring-1 ring-purple-200">
          {records.length} total
        </span>
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none
                       focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-colors"
            placeholder="Search patient, lab, doctor…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : err ? (
        <div className="text-center py-12 text-red-500">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-medium text-sm">{err}</p>
          <button
            onClick={loadRecords}
            className="mt-4 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
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
        <>
          {/* ── Desktop table ── */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Patient', 'Lab', 'Doctor', 'Version', 'Updated', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold tracking-widest text-gray-400 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(r => {
                  const patient = r.patient_name || '—'
                  const lab = r.lab_name || '—'
                  const doctor = r.recorded_by_name
                    ? `Tech. ${r.recorded_by_name}`
                    : '—'
                  const updated = r.updated_at
                    ? new Date(r.updated_at).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                    : '—'

                  return (
                    <tr key={r.record_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{patient}</td>
                      <td className="px-4 py-3 text-gray-600">{lab}</td>
                      <td className="px-4 py-3 text-gray-600">{doctor}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full">
                          v{r.version || 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{updated}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetail(r)}
                          className="px-3 py-1 text-xs font-medium border border-gray-200 rounded-lg
                                     text-gray-600 hover:border-purple-300 hover:text-purple-700 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-50 text-right">
              <p className="text-xs text-gray-400">Showing {filtered.length} of {records.length} records</p>
            </div>
          </div>

          {/* ── Mobile cards ── */}
          <div className="md:hidden space-y-3">
            {filtered.map(r => {
              const patient = r.patient_name || '—'

              const lab = r.lab_name || '—'

              const doctor = r.recorded_by_name
                ? `Tech. ${r.recorded_by_name}`
                : '—'
              const updated = r.updated_at
                ? new Date(r.updated_at).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })
                : '—'

              return (
                <div
                  key={r.record_id}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{patient}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{lab} · {doctor}</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full flex-shrink-0">
                      v{r.version || 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400">{updated}</p>
                    <button
                      onClick={() => openDetail(r)}
                      className="px-3 py-1 text-xs font-medium border border-gray-200 rounded-lg
                                 text-gray-600 hover:border-purple-300 hover:text-purple-700 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              )
            })}
            <p className="text-xs text-gray-400 text-right">Showing {filtered.length} of {records.length} records</p>
          </div>
        </>
      )}

      <RecordDetailModal
        recordId={selected?.record_id}
        listRecord={selected}
        open={showDetail}
        onClose={closeDetail}
      />
    </div>
  )
}