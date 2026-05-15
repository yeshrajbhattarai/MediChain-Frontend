// src/pages/technician/Records.jsx
// GET  /api/v1/staff/technician/records/         — list (MedicalRecordMetaSerializer)
// GET  /api/v1/staff/records/<record_id>/        — detail + timeline (single fetch, no separate history call)
// POST /api/v1/staff/technician/records/create/  — create or update record (versioned by backend)

import { useState, useEffect } from 'react'
import { successToast, errorToast } from '../../utils/alert'
import { fetchWithAuth } from '../../api/client'

const api = (url, opts = {}) =>
  fetchWithAuth(`/api${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  })

// ─── Tiny helpers ──────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Label({ text }) {
  return (
    <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-0.5">
      {text}
    </p>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <Label text={label} />
      <p className="text-sm text-gray-800">{value ?? <span className="text-gray-300">—</span>}</p>
    </div>
  )
}

// ─── Record Detail Modal ───────────────────────────────────────────────────────
// step='view'  → tabs: Details | History  (with "Edit Record" button in footer)
// step='edit'  → edit form: existing fields (fixed key) + add new fields + reason

function RecordDetailModal({ recordId, listRecord, open, onClose, onUpdated }) {
  const [step, setStep]           = useState('view')   // 'view' | 'edit'
  const [activeTab, setActiveTab] = useState('details')
  const [detail, setDetail]       = useState(null)
  const [loading, setLoading]     = useState(false)

  // edit state
  const [existingEdits, setExistingEdits] = useState([])  // [{ key, value }] — key is read-only
  const [newFields,     setNewFields]     = useState([])  // [{ key, value }] — both editable
  const [editReason,    setEditReason]    = useState('')
  const [submitting,    setSubmitting]    = useState(false)

  // lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // fetch detail on open — /v1/staff/records/<id>/ returns record_id, version, lab_request, audit, timeline
  useEffect(() => {
    if (!open || !recordId) return
    setStep('view'); setActiveTab('details'); setDetail(null)
    setLoading(true)
    api(`/v1/staff/records/${recordId}/`)
      .then(r => r.json())
      .then(data => { if (data?.record_id) setDetail(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, recordId])

  if (!open) return null

  // lab_request.id from detail is what we POST as lab_request_id to the create endpoint
  const labRequestId = detail?.lab_request?.id
  const timeline     = detail?.timeline || []
  const audit        = detail?.audit
  const ver          = detail?.version ?? listRecord?.version ?? 1

  // ── Edit helpers ─────────────────────────────────────────────────────────────

  function openEdit() {
    // Pre-fill from stored custom_field_values; keys are fixed (set by lab schema)
    setExistingEdits(
      Object.entries(listRecord?.custom_field_values || {}).map(([key, value]) => ({
        key,
        value: String(value ?? ''),
      }))
    )
    setNewFields([])
    setEditReason('')
    setStep('edit')
  }

  async function submitEdit() {
    const reason = editReason.trim()
    if (!reason)       { errorToast('Change reason is required'); return }
    if (!labRequestId) { errorToast('Detail not loaded — close and reopen the record'); return }

    // Merge existing edits + any new fields into custom_field_values
    const cfv = {}
    existingEdits.forEach(({ key, value }) => { cfv[key] = value })
    newFields.forEach(({ key, value }) => { const k = key.trim(); if (k) cfv[k] = value })

    setSubmitting(true)
    try {
      const res = await api('/v1/staff/technician/records/create/', {
        method: 'POST',
        body: JSON.stringify({
          lab_request_id:           labRequestId,
          // CreateMedicalRecordSerializer requires these; service ignores them for lab records
          age:                      0,
          gender:                   'Male',
          blood_pressure_systolic:  0,
          blood_pressure_diastolic: 0,
          cholesterol:              0,
          blood_glucose:            0.0,
          heart_rate:               0,
          ecg_result:               'normal',
          technician_change_reason: reason,
          custom_field_values:      cfv,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        errorToast(
          data?.errors?.change_reason ??
          data?.errors?.lab_request   ??
          data?.error                 ??
          'Update failed.'
        )
        return
      }
      successToast(`Record updated — v${ver + 1} saved.`)
      onUpdated?.()   // reload records list
      onClose()
    } catch {
      errorToast('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }


  // ── Layout ─────────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        style={{ animation: 'modalIn .18s cubic-bezier(.22,1,.36,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            {step === 'edit' && (
              <button
                onClick={() => setStep('view')}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400
                           hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                ←
              </button>
            )}
            <h2 className="text-base font-semibold text-gray-900">
              {step === 'edit' ? 'Edit Record' : 'Lab Report Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400
                       hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loading ? (
            <Spinner />
          ) : step === 'view' ? (

            <div className="space-y-5">

              <div className="space-y-5">
    {/* Patient / lab header */}
    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-start justify-between gap-3">
      <div>
        <p className="text-base font-semibold text-gray-900">{listRecord?.patient_name || '—'}</p>
        <p className="text-sm text-purple-600 font-medium mt-0.5">{listRecord?.lab_name || '—'}</p>
      </div>
      <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full shrink-0">
        v{ver}
      </span>
    </div>

    {/* Tab switcher */}
    <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5 w-fit">
         {['details', 'history'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors
              ${activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}{t === 'history' && timeline.length > 0 ? ` (${timeline.length})` : ''}
          </button>
        ))}
      </div>

      {/* ── Details tab ── */}
      {activeTab === 'details' && (
        <div className="space-y-4">
          {/* Measurement values */}
          {Object.keys(listRecord?.custom_field_values || {}).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <Label text="Measurement Values" />
              <div className="mt-2 divide-y divide-gray-100">
                {Object.entries(listRecord.custom_field_values).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-1.5 text-sm">
                    <span className="capitalize text-gray-500">{k.replaceAll('_', ' ')}</span>
                    <span className="font-semibold text-gray-900">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Patient"     value={listRecord?.patient_name} />
            <Field label="Lab"         value={listRecord?.lab_name} />
            <Field label="Technician"  value={listRecord?.recorded_by_name} />
            <Field label="Record Type" value={listRecord?.record_type_display} />
          </div>

          {/* Audit block — only when detail loaded */}
          {audit && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Label text="Audit" />
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Field label="Created by" value={audit.created_by_name} />
                <Field label="Role"       value={audit.created_by_role} />
                <Field
                  label="Created at"
                  value={audit.created_at ? new Date(audit.created_at).toLocaleString('en-IN') : '—'}
                />
                <Field label="Version" value={`v${audit.selected_version ?? ver}`} />
              </div>
            </div>
          )}

          {!detail && !loading && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
              ⚠ Detailed audit unavailable
            </div>
          )}
        </div>
      )}

      {/* ── History tab ── */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {timeline.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No version history yet.</p>
          ) : (
            timeline.map((entry, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700 capitalize">
                    v{entry.version_number} · {entry.event_type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {entry.changed_at ? new Date(entry.changed_at).toLocaleString('en-IN') : '—'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  By{' '}
                  <span className="font-medium text-gray-700">{entry.changed_by_name}</span>
                  {entry.changed_by_role && ` (${entry.changed_by_role})`}
                </p>
                {entry.change_reason && (
                  <p className="text-xs text-gray-400 mt-1 italic">"{entry.change_reason}"</p>
                )}
                {entry.data_snapshot?.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-2">
                    {entry.data_snapshot.map((snap, i) => (
                      <div key={i} className="text-xs flex gap-2 flex-wrap items-start">
                        <span className="text-gray-400 font-medium w-28 shrink-0 capitalize">
                          {snap.label}
                        </span>
                        {snap.previous !== undefined ? (
                          <span>
                            <span className="text-red-400 line-through">{snap.previous}</span>
                            {' → '}
                            <span className="text-emerald-600 font-medium">{snap.current}</span>
                          </span>
                        ) : (
                          <span className="text-gray-600">{snap.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>

            </div>

          ) : (

            <div className="space-y-5">

                 <div className="space-y-5">
      {/* Patient strip */}
      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
        <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center shrink-0">
          {(listRecord?.patient_name || 'P')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {listRecord?.patient_name || '—'}
          </p>
          <p className="text-xs text-purple-600 truncate">
            {listRecord?.lab_name} · Currently v{ver}
          </p>
        </div>
      </div>

      {/* Existing fields — key is a read-only label, value is editable */}
      {existingEdits.length > 0 && (
        <div className="space-y-2">
          <Label text="Edit Measurement Values" />
          <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
            {existingEdits.map((field, idx) => (
              <div key={field.key} className="flex items-center gap-3 px-4 py-2.5 bg-white">
                <span className="w-32 shrink-0 text-sm capitalize text-gray-500">
                  {field.key.replaceAll('_', ' ')}
                </span>
                <span className="text-gray-300 shrink-0 text-sm">→</span>
                <input
                  type="text"
                  value={field.value}
                  onChange={e =>
                    setExistingEdits(prev =>
                      prev.map((f, i) => i === idx ? { ...f, value: e.target.value } : f)
                    )
                  }
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none
                             focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New fields — both key and value are editable */}
      {newFields.length > 0 && (
        <div className="space-y-2">
          <Label text="Add New Fields" />
          {newFields.map((field, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={field.key}
                onChange={e =>
                  setNewFields(prev =>
                    prev.map((f, i) => i === idx ? { ...f, key: e.target.value } : f)
                  )
                }
                placeholder="Field name"
                className="w-36 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none
                           focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all
                           placeholder:text-gray-300"
              />
              <input
                type="text"
                value={field.value}
                onChange={e =>
                  setNewFields(prev =>
                    prev.map((f, i) => i === idx ? { ...f, value: e.target.value } : f)
                  )
                }
                placeholder="Value"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none
                           focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all
                           placeholder:text-gray-300"
              />
              <button
                onClick={() => setNewFields(prev => prev.filter((_, i) => i !== idx))}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300
                           hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setNewFields(prev => [...prev, { key: '', value: '' }])}
        className="text-xs text-purple-600 hover:text-purple-800 font-medium px-3 py-1.5
                   border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
      >
        + Add new field
      </button>

      {/* Change reason — required by service for re-submission */}
      <div className="space-y-1.5">
        <Label text="Change Reason *" />
        <textarea
          rows={3}
          value={editReason}
          onChange={e => setEditReason(e.target.value)}
          placeholder="Why are you updating this record?"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none
                     focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all
                     placeholder:text-gray-300 resize-none"
        />
      </div>
    </div>

            </div>

          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-3">
            {step === 'view' ? (
              <>
                {/* Edit button only shown when we have lab_request_id from the detail fetch */}
                {labRequestId && (
                  <button
                    onClick={openEdit}
                    className="flex-1 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white
                               font-medium rounded-xl transition-colors"
                  >
                    Edit Record
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`${labRequestId ? 'flex-1' : 'w-full'} py-2 text-sm border border-gray-200
                             rounded-xl text-gray-600 hover:bg-gray-50 transition-colors`}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep('view')}
                  className="flex-1 py-2 text-sm border border-gray-200 rounded-xl text-gray-600
                             hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={submitEdit}
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm bg-purple-600 hover:bg-purple-700
                             disabled:opacity-50 disabled:cursor-not-allowed
                             text-white font-semibold rounded-xl transition-colors"
                >
                  {submitting ? 'Saving…' : 'Save as New Version'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.96) translateY(6px) }
          to   { opacity: 1; transform: scale(1)   translateY(0)   }
        }
      `}</style>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

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
        setRecords(data)
      } else {
        setErr('Failed to load records.')
      }
    } catch {
      setErr('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = records.filter(r => {
    const q = search.toLowerCase()
    if (!q) return true
    return [r.patient_name, r.lab_name, r.recorded_by_name, r.record_id]
      .some(v => (v || '').toLowerCase().includes(q))
  })

  function openDetail(r)  { setSelected(r); setShowDetail(true) }
  function closeDetail()  { setShowDetail(false); setTimeout(() => setSelected(null), 300) }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Records</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Lab Reports you have created from lab requests.
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 ring-1 ring-purple-200">
          {records.length} total
        </span>
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none
                       focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-colors"
            placeholder="Search patient, lab, technician..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

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
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Patient', 'Lab', 'Technician', 'Version', 'Updated', 'Actions'].map(h => (
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
                {filtered.map(r => (
                  <tr key={r.record_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.patient_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.lab_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.recorded_by_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full">
                        v{r.version || 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {r.updated_at
                        ? new Date(r.updated_at).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => openDetail(r)}
                        className="px-3 py-1 text-xs font-medium border border-gray-200 rounded-lg
                                   text-gray-600 hover:border-purple-300 hover:text-purple-700 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openDetail(r)}
                        className="px-3 py-1 text-xs font-medium border border-purple-200 rounded-lg
                                   text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-50 text-right">
              <p className="text-xs text-gray-400">
                Showing {filtered.length} of {records.length} records
              </p>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(r => (
              <div key={r.record_id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.patient_name || '—'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.lab_name || '—'} · {r.recorded_by_name || '—'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full shrink-0">
                    v{r.version || 1}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <p className="text-xs text-gray-400">
                    {r.updated_at
                      ? new Date(r.updated_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })
                      : '—'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetail(r)}
                      className="px-3 py-1 text-xs font-medium border border-gray-200 rounded-lg
                                 text-gray-600 hover:border-purple-300 hover:text-purple-700 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openDetail(r)}
                      className="px-3 py-1 text-xs font-medium border border-purple-200 rounded-lg
                                 text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <RecordDetailModal
        recordId={selected?.record_id}
        listRecord={selected}
        open={showDetail}
        onClose={closeDetail}
        onUpdated={loadRecords}
      />
    </div>
  )
}
