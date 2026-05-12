// src/pages/admin/Labs.jsx
// APIs:
//   GET  /api/v1/staff/labs/                                 — list all labs
//   POST /api/v1/staff/labs/                                 — create lab (name + type + custom_field_schema)
//   GET  /api/v1/staff/labs/<uuid>/                          — lab detail + assigned technicians
//   POST /api/v1/staff/labs/<uuid>/assign-technician/        — assign technician
//   POST /api/v1/staff/labs/<uuid>/remove-technician/<uuid>/ — remove technician

import { useState, useEffect, useRef } from 'react'
import { fetchWithAuth } from '../../api/client'

const api = (url, opts = {}) =>
  fetchWithAuth(`/api/v1${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  })

// Auto-generates a snake_case key from the field label
function slugify(value) {
  return (value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
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
          >✕</button>
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

// ─── Field Type config ────────────────────────────────────────────────────────

const FIELD_TYPES = [
  { value: 'text',     label: 'Text',        hint: 'Short text answer'         },
  { value: 'textarea', label: 'Long Text',   hint: 'Multi-line text'           },
  { value: 'number',   label: 'Number',      hint: 'Numeric value'             },
  { value: 'date',     label: 'Date',        hint: 'Date picker'               },
  { value: 'boolean',  label: 'Yes / No',    hint: 'Toggle or checkbox'        },
]

const TYPE_ICONS = {
  text:     '📝',
  textarea: '📄',
  number:   '🔢',
  integer:  '🔢',
  decimal:  '🔢',
  date:     '📅',
  boolean:  '☑️',
  choice:   '📋',
}

// ─── Field Builder (used inside Create Lab modal) ─────────────────────────────
// Each field has: { _id (local only), label, key, type, required }
// _id is never sent to backend — just for React keys and deletion

function FieldBuilder({ fields, onChange }) {
  function addField() {
    onChange([
      ...fields,
      { _id: Date.now(), label: '', key: '', type: 'text', unit: '', required: false },
    ])
  }

  function removeField(id) {
    onChange(fields.filter(f => f._id !== id))
  }

  function updateField(id, patch) {
    onChange(fields.map(f => {
      if (f._id !== id) return f
      const updated = { ...f, ...patch }
      // Auto-update key when label changes (unless key was manually edited)
      if (patch.label !== undefined && !f._keyManuallyEdited) {
        updated.key = slugify(patch.label)
      }
      if (patch.key !== undefined) {
        updated._keyManuallyEdited = true
        updated.key = slugify(patch.key)
      }
      return updated
    }))
  }

  return (
    <div className="space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Report Fields</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Define what data the technician fills in for each report.
          </p>
        </div>
        <button
          onClick={addField}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600
                     text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          + Add Field
        </button>
      </div>

      {/* Empty state */}
      {fields.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
          <p className="text-2xl mb-1">📋</p>
          <p className="text-sm text-gray-500 font-medium">No fields defined yet</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Click "Add Field" to define what the technician fills in.
          </p>
        </div>
      )}

      {/* Field rows */}
       {fields.map((field, index) => (
         <div
           key={field._id}
           className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/60"
         >
          {/* Row header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Field {index + 1}
            </span>
            <button
              onClick={() => removeField(field._id)}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              ✕ Remove
            </button>
          </div>

          {/* Label + Type row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Label *</label>
              <input
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                           focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors bg-white"
                placeholder="e.g. Serum Creatinine"
                value={field.label}
                onChange={e => updateField(field._id, { label: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Type *</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                           focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors bg-white"
                value={field.type}
                onChange={e => updateField(field._id, { type: e.target.value })}
              >
                {FIELD_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {TYPE_ICONS[t.value]} {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Key + Unit row */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Key <span className="text-gray-400 font-normal">(auto-generated)</span>
              </label>
              <input
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                           focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors
                           bg-white font-mono text-gray-500"
                placeholder="auto"
                value={field.key}
                onChange={e => updateField(field._id, { key: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-0.5">Unique identifier sent to backend.</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Unit (optional)</label>
              <input
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                           focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors bg-white"
                placeholder="e.g. mg/dL"
                value={field.unit || ''}
                onChange={e => updateField(field._id, { unit: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-0.5">Display unit for numeric values.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => updateField(field._id, { required: !field.required })}
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0
                  ${field.required ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                  ${field.required ? 'translate-x-4' : 'translate-x-0.5'}`}
                />
              </div>
              <span className="text-sm text-gray-700 font-medium">Required</span>
            </label>
          </div>
        </div>
      ))}

      {/* Field count summary */}
      {fields.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {fields.length} field{fields.length !== 1 ? 's' : ''} ·{' '}
          {fields.filter(f => f.required).length} required
        </p>
      )}
    </div>
  )
}

// ─── Create Lab Modal (2-step) ─────────────────────────────────────────────────
// Step 1: Lab name + type
// Step 2: Field builder — define custom_field_schema
// Both are submitted together in one POST on final step

const LAB_TYPES = [
  { label: 'Chronic Kidney Disease', value: 'ckd'          },
  { label: 'Pathology',              value: 'pathology'    },
  { label: 'Radiology',              value: 'radiology'    },
  { label: 'Cardiology',             value: 'cardiology'   },
  { label: 'Microbiology',           value: 'microbiology' },
  { label: 'Biochemistry',           value: 'biochemistry' },
  { label: 'Hematology',             value: 'hematology'   },
]

function CreateLabModal({ open, onClose, onCreated }) {
  const [step,    setStep]    = useState(1)   // 1 = basic info, 2 = field builder
  const [form,    setForm]    = useState({ lab_type: '', name: '' })
  const [fields,  setFields]  = useState([])
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  // Reset everything when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep(1); setForm({ lab_type: '', name: '' })
      setFields([]); setErrors({}); setSuccess('')
    }
  }, [open])

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  // Validate step 1 before advancing
  function handleNext() {
    const errs = {}
    if (!form.lab_type) errs.lab_type = 'Select a lab type.'
    if (!form.name.trim()) errs.name = 'Lab name is required.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStep(2)
  }

  // Validate fields and submit
  async function handleSubmit() {
    // Validate each field has a label and key
    const errs = {}
    fields.forEach((f, i) => {
      if (!f.label.trim()) errs[`field_${i}_label`] = `Field ${i + 1} needs a label.`
      if (!f.key.trim())   errs[`field_${i}_key`]   = `Field ${i + 1} needs a key.`
    })
    if (Object.keys(errs).length) { setErrors(errs); return }

    // Strip _id and _keyManuallyEdited — backend doesn't want those
    const schema = fields.map(({ label, key, type, unit, required }) => ({
      label,
      key,
      type: ['integer', 'decimal'].includes(type) ? 'number' : type,
      unit: unit?.trim() || undefined,
      required,
    }))

    setLoading(true); setErrors({}); setSuccess('')
    try {
      const res  = await api('/staff/labs/', {
        method: 'POST',
        body: JSON.stringify({ ...form, custom_field_schema: schema }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors(data.errors || { general: 'Something went wrong.' })
        setStep(1)  // go back to step 1 on error
        return
      }
      setSuccess(`Lab "${data.name}" created successfully.`)
      onCreated(data)
      setTimeout(onClose, 1400)
    } catch { setErrors({ general: 'Network error. Try again.' }) }
    finally { setLoading(false) }
  }

  const inp = key =>
    `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors
     ${errors[key]
       ? 'border-red-400 bg-red-50'
       : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'}`

  // Check if any field validation errors exist
  const hasFieldErrors = Object.keys(errors).some(k => k.startsWith('field_'))

  return (
    <Modal open={open} onClose={onClose} title="Create New Lab" width="max-w-xl">
      <div className="space-y-5">

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${step === s
                  ? 'bg-blue-600 text-white'
                  : step > s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-500'}`}
              >
                {step > s ? '✓' : s}
              </div>
              <span className={`text-xs font-medium ${step === s ? 'text-gray-800' : 'text-gray-400'}`}>
                {s === 1 ? 'Basic Info' : 'Report Fields'}
              </span>
              {s < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* Global messages */}
        {errors.general && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
            {errors.general}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg border border-emerald-200">
            {success}
          </div>
        )}

        {/* ── Step 1: Basic Info ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Lab Type *</label>
              <select className={inp('lab_type')} value={form.lab_type} onChange={e => set('lab_type', e.target.value)}>
                <option value="">Select type…</option>
                {LAB_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.lab_type && <p className="text-xs text-red-500 mt-0.5">{errors.lab_type}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Lab Name *</label>
              <input
                className={inp('name')}
                placeholder="e.g. KFT Lab — Block A"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
              />
              {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Next: Define Fields →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Field Builder ── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Summary of step 1 */}
            <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-base flex-shrink-0">🔬</div>
              <div>
                <p className="text-sm font-medium text-blue-900">{form.name}</p>
                <p className="text-xs text-blue-600 capitalize">{form.lab_type}</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="ml-auto text-xs text-blue-500 hover:text-blue-700 font-medium"
              >
                ← Edit
              </button>
            </div>

            {/* Field validation errors summary */}
            {hasFieldErrors && (
              <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
                Some fields are missing labels or keys. Please fill them in.
              </div>
            )}

            <FieldBuilder fields={fields} onChange={setFields} />

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium"
              >
                {loading ? 'Creating…' : `Create Lab${fields.length > 0 ? ` (${fields.length} fields)` : ''}`}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Fields can not be changed after creation — they define the database table structure.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── Lab Detail Modal ──────────────────────────────────────────────────────────

function LabDetailModal({ lab, open, onClose, onUpdated }) {
  const [detail,      setDetail]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [technicians, setTechnicians] = useState([])
  const [assignId,    setAssignId]    = useState('')
  const [assigning,   setAssigning]   = useState(false)
  const [removing,    setRemoving]    = useState(null)
  const [archiving,   setArchiving]   = useState(false)
  const [msg,         setMsg]         = useState('')
  const [activeTab,   setActiveTab]   = useState('technicians')  // 'technicians' | 'schema'
  const hasFetched = useRef(false)

  const normalizeDetail = (labData) => ({
    ...labData.lab,
    assignments: labData.assignments,
    pending_requests: labData.pending_requests,
    completed_count: labData.completed_count,
  })

  useEffect(() => {
    if (!open || !lab) return
    if (hasFetched.current) return
    hasFetched.current = true
    setLoading(true)
    Promise.all([
      api(`/staff/labs/${lab.id}/`).then(r => r.json()),
      api('/staff/technicians/').then(r => r.json()),
    ]).then(([labData, techData]) => {
      const flat = normalizeDetail(labData)
      setDetail(flat)
      setTechnicians(Array.isArray(techData) ? techData.filter(t => t.status === 'active') : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [open, lab])

  function handleClose() {
    hasFetched.current = false
    setDetail(null); setMsg(''); setAssignId('')
    setActiveTab('technicians')
    onClose()
  }

  async function handleAssign() {
    if (!assignId) return
    setAssigning(true); setMsg('')
    try {
      const res  = await api(`/staff/labs/${lab.id}/assign-technician/`, {
        method: 'POST',
        body: JSON.stringify({ technician_id: assignId }),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg('Technician assigned successfully.')
        hasFetched.current = false
        const updated = await api(`/staff/labs/${lab.id}/`).then(r => r.json())
        setDetail(normalizeDetail(updated)); setAssignId('')
        onUpdated?.(lab.id, { is_active: true })
      } else { setMsg(data.error || 'Failed to assign.') }
    } catch { setMsg('Network error.') }
    finally { setAssigning(false) }
  }

  async function handleRemove(techId) {
    setRemoving(techId); setMsg('')
    try {
      const res  = await api(`/staff/labs/${lab.id}/remove-technician/${techId}/`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setMsg('Technician removed.')
        const updated = await api(`/staff/labs/${lab.id}/`).then(r => r.json())
        setDetail(normalizeDetail(updated))
        onUpdated?.(lab.id, { is_active: true })
      } else { setMsg(data.error || 'Failed to remove.') }
    } catch { setMsg('Network error.') }
    finally { setRemoving(null) }
  }

  async function handleArchive() {
    if (!window.confirm('Archive this lab? This will deactivate new requests.')) return
    setArchiving(true); setMsg('')
    try {
      const res = await api(`/staff/labs/${lab.id}/delete/`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setMsg(data.message || 'Lab archived.')
        const updated = await api(`/staff/labs/${lab.id}/`).then(r => r.json())
        setDetail(normalizeDetail(updated))
        onUpdated?.(lab.id, { is_active: false })
      } else {
        setMsg(data.error || 'Failed to archive.')
      }
    } catch {
      setMsg('Network error.')
    } finally {
      setArchiving(false)
    }
  }

  const d           = detail || lab || {}
  const assignedIds = new Set((detail?.assignments || []).map(t => t.id))
  const available   = technicians.filter(t => !assignedIds.has(t.id))
  const schema      = d.custom_field_schema || []

  return (
    <Modal open={open} onClose={handleClose} title="Lab Details" width="max-w-xl">
      {loading ? <Spinner /> : (
        <div className="space-y-5">

          {/* Lab header */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl flex-shrink-0">
              🔬
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{d.name}</p>
              <p className="text-sm text-gray-500 capitalize">{d.lab_type}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 px-2 py-0.5 rounded-full
                ${d.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${d.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
                {d.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Stats row */}
          {detail && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-amber-600">{detail.pending_requests ?? 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">Pending</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-emerald-600">{detail.completed_count ?? 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">Completed</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-blue-600">{schema.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Fields</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-1">
              {[
                { key: 'technicians', label: '👥 Technicians' },
                { key: 'schema',      label: '📋 Report Fields' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                    ${activeTab === tab.key
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 border-transparent'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab: Technicians */}
          {activeTab === 'technicians' && (
            <div className="space-y-4">
              {/* Assigned list */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Assigned Technicians
                </p>
                {(detail?.assignments || []).length === 0 ? (
                  <p className="text-sm text-gray-400 italic py-2">No technicians assigned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(detail?.assignments || []).map(tech => (
                      <div key={tech.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold">
                            {tech.full_name?.[0] || 'T'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{tech.full_name}</p>
                            <p className="text-xs text-gray-400">{tech.employee_id}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemove(tech.id)}
                          disabled={removing === tech.id}
                          className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          {removing === tech.id ? 'Removing…' : 'Remove'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign dropdown */}
              {available.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Assign Technician
                  </p>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      value={assignId}
                      onChange={e => setAssignId(e.target.value)}
                    >
                      <option value="">Select technician…</option>
                      {available.map(t => (
                        <option key={t.id} value={t.id}>{t.full_name} ({t.employee_id})</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssign}
                      disabled={!assignId || assigning}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors whitespace-nowrap"
                    >
                      {assigning ? 'Assigning…' : 'Assign'}
                    </button>
                  </div>
                </div>
              )}

              {msg && (
                <p className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg text-center">{msg}</p>
              )}
            </div>
          )}

          {/* Tab: Report Fields / Schema */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              {schema.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-2xl mb-1">📋</p>
                  <p className="text-sm font-medium text-gray-500">No custom fields defined</p>
                  <p className="text-xs mt-0.5">
                    This lab only uses the default fields (age, gender, diagnosis, etc.)
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-400">
                    These fields were defined at creation and cannot be changed.
                  </p>
                  <div className="space-y-2">
                    {schema.map((field, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-base">{TYPE_ICONS[field.type] || '📝'}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800">{field.label}</p>
                            <p className="text-xs font-mono text-gray-400">{field.key}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                            {field.type}
                          </span>
                          {field.required && (
                            <span className="text-xs bg-red-50 text-red-600 ring-1 ring-red-200 px-2 py-0.5 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 text-right">
                    {schema.length} field{schema.length !== 1 ? 's' : ''} ·{' '}
                    {schema.filter(f => f.required).length} required
                  </p>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-1 border-t border-gray-100 space-y-2">
            {detail?.is_active && (
              <button
                onClick={handleArchive}
                disabled={archiving}
                className="w-full px-4 py-2 text-sm border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                {archiving ? 'Archiving…' : 'Archive Lab'}
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const LAB_TYPE_COLOR = {
  ckd:          'bg-indigo-50 text-indigo-700',
  pathology:    'bg-rose-50 text-rose-700',
  radiology:    'bg-violet-50 text-violet-700',
  cardiology:   'bg-red-50 text-red-700',
  microbiology: 'bg-green-50 text-green-700',
  biochemistry: 'bg-blue-50 text-blue-700',
  hematology:   'bg-orange-50 text-orange-700',
}

export default function Labs() {
  const [labs,        setLabs]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [showCreate,  setShowCreate]  = useState(false)
  const [selected,    setSelected]    = useState(null)
  const [showDetail,  setShowDetail]  = useState(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchLabs()
  }, [])

  async function fetchLabs() {
    setLoading(true)
    try {
      const res  = await api('/staff/labs/')
      const data = await res.json()
      // API returns array of { lab, technicians_count, pending_count, completed_count }
      // Flatten for table display
      const flat = Array.isArray(data)
        ? data.map(row => ({ ...row.lab, _counts: { tech: row.technicians_count, pending: row.pending_count, completed: row.completed_count } }))
        : []
      setLabs(flat)
    } catch { setLabs([]) }
    finally { setLoading(false) }
  }

  function handleCreated(lab) {
    // lab from POST response is a flat LabSerializer object
    setLabs(prev => [{ ...lab, _counts: { tech: 0, pending: 0, completed: 0 } }, ...prev])
  }

  function handleLabUpdated(labId, updates) {
    setLabs(prev =>
      prev.map(lab =>
        lab.id === labId ? { ...lab, ...updates } : lab
      )
    )
  }

  function openDetail(lab) { setSelected(lab); setShowDetail(true) }

  const visible = labs.filter(l => {
    const q = search.toLowerCase()
    return !q || [l.name, l.lab_type].some(v => v?.toLowerCase().includes(q))
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Labs</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {labs.length} lab{labs.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          <span className="text-lg leading-none">+</span> Create Lab
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
          placeholder="Search lab name or type…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <Spinner /> : visible.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-2">🔬</p>
            <p className="font-medium text-gray-600">No labs found</p>
            <p className="text-sm mt-1">
              {search ? 'Try a different search term.' : 'Create your first lab to get started.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Lab</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Fields</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden xl:table-cell">Activity</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map(lab => (
                <tr
                  key={lab.id}
                  className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                  onClick={() => openDetail(lab)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-base flex-shrink-0">
                        🔬
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{lab.name}</p>
                        <p className="text-xs text-gray-400">{lab.hospital_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize
                      ${LAB_TYPE_COLOR[lab.lab_type] || 'bg-gray-100 text-gray-600'}`}>
                      {lab.lab_type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">
                      {(lab.custom_field_schema || []).length} custom field{(lab.custom_field_schema || []).length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden xl:table-cell">
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{lab._counts?.tech ?? 0} techs</span>
                      <span>•</span>
                      <span>{lab._counts?.pending ?? 0} pending</span>
                      <span>•</span>
                      <span>{lab._counts?.completed ?? 0} done</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${lab.is_active
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${lab.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {lab.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={e => { e.stopPropagation(); openDetail(lab) }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && visible.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {visible.length} of {labs.length} labs
        </p>
      )}

      <CreateLabModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
      <LabDetailModal
        lab={selected}
        open={showDetail}
        onClose={() => { setShowDetail(false); setSelected(null) }}
        onUpdated={handleLabUpdated}
      />
    </div>
  )
}
