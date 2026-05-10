// src/pages/doctor/CreateMedicalRecord.jsx
// Route: /doctor/patients/:id/create-record
// Needs: <Route path="/doctor/patients/:id/create-record" element={<CreateMedicalRecord />} /> in App.jsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchWithAuth } from '../../api/client'

// JSON fetch helper
const api = (url, opts = {}) =>
  fetchWithAuth(`/api/v1${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  })

// Multipart fetch helper — used for file upload (no Content-Type, browser sets boundary)
const apiForm = (url, formData) =>
  fetchWithAuth(`/api/v1${url}`, {
    method: 'POST',
    body: formData,
  })

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

const BLANK = {
  title: '',
  primary_diagnosis: '',
  key_instruction: '',
  doctor_note: '',
}

export default function CreateMedicalRecord() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [detail, setDetail]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState(BLANK)
  const [file, setFile]       = useState(null)
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState(null)

  // fetch patient detail for header info + assigned nurses
  useEffect(() => {
    api(`/staff/doctor/patients/${id}/`)
      .then(r => r.json())
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  function validate() {
    const errs = {}
    if (!form.title.trim())              errs.title              = 'Required'
    if (!form.primary_diagnosis.trim())  errs.primary_diagnosis  = 'Required'
    if (!form.key_instruction.trim())    errs.key_instruction    = 'Required'
    if (!file)                           errs.file               = 'Handwritten prescription upload is required'
    return errs
  }

  async function submit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title',              form.title.trim())
      fd.append('primary_diagnosis',  form.primary_diagnosis.trim())
      fd.append('key_instruction',    form.key_instruction.trim())
      if (form.doctor_note.trim()) fd.append('doctor_note', form.doctor_note.trim())
      fd.append('handwritten_file',   file)
      fd.append('patient_id',         id)

      // Endpoint confirmed in reference API: create nurse queue item with multipart payload.
      const res  = await apiForm(`/staff/doctor/patients/${id}/create-medical-record/`, fd)
      const data = await res.json()

      if (!res.ok) {
        const mapped = {}
        Object.entries(data.errors || data).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : v
        })
        setErrors(mapped)
        return
      }

      setToast('Medical record created and forwarded to nurse.')
      setTimeout(() => navigate(`/doctor/patients/${id}`), 1500)
    } catch {
      setToast('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  const patient       = detail?.patient || {}
  const nurses        = detail?.assigned_nurses || []
  const initials      = patient.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'P'
  const govIdMasked   = detail?.gov_id_masked || '••••••••'

  // input class helper
  const ic = k =>
    `w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all
    ${errors[k]
      ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-200'
      : 'border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-100'}`

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto pb-10">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white text-sm font-medium px-5 py-3.5 rounded-2xl shadow-xl">
          ✓ {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <button onClick={() => navigate('/doctor/patients')} className="hover:text-teal-600 transition-colors">
          My Patients
        </button>
        <span>/</span>
        <button onClick={() => navigate(`/doctor/patients/${id}`)} className="hover:text-teal-600 transition-colors">
          {patient.full_name || 'Patient'}
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium">Create Medical Record</span>
      </div>

      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Create Medical Record</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Enter critical points and upload handwritten prescription. Nurse completes detailed documentation.
        </p>
      </div>

      {/* Patient identity strip */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{patient.full_name || '—'}</p>
            <p className="text-xs text-gray-400">{patient.gender || '—'} · {patient.phone || '—'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Gov ID</p>
          <p className="text-sm font-mono font-semibold text-gray-700">{govIdMasked}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left: form ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Doctor Quick Entry */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-800">Doctor Quick Entry</h2>
                <p className="text-xs text-gray-400 mt-0.5">3 typed fields + handwritten upload are mandatory</p>
              </div>
              <span className="text-xs bg-teal-50 text-teal-700 ring-1 ring-teal-200 px-2.5 py-1 rounded-full font-medium">
                Doctor required
              </span>
            </div>

            {/* Record Topic + Primary Diagnosis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Record Topic *
                </label>
                <input
                  className={ic('title')}
                  placeholder="e.g., OPD Follow-up / CKD Review"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                />
                {errors.title && <p className="text-xs text-red-500 mt-0.5">{errors.title}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Primary Diagnosis *
                </label>
                <input
                  className={ic('primary_diagnosis')}
                  placeholder="e.g., CKD Stage 2"
                  value={form.primary_diagnosis}
                  onChange={e => set('primary_diagnosis', e.target.value)}
                />
                {errors.primary_diagnosis && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.primary_diagnosis}</p>
                )}
              </div>
            </div>

            {/* Key Clinical Instruction */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Key Clinical Instruction *
              </label>
              <textarea
                rows={4}
                className={ic('key_instruction')}
                placeholder="Main treatment / critical instruction for the nurse..."
                value={form.key_instruction}
                onChange={e => set('key_instruction', e.target.value)}
              />
              {errors.key_instruction && (
                <p className="text-xs text-red-500 mt-0.5">{errors.key_instruction}</p>
              )}
            </div>

            {/* Optional doctor note */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Optional Doctor Note
              </label>
              <textarea
                rows={2}
                className={ic('doctor_note')}
                placeholder="Short optional note..."
                value={form.doctor_note}
                onChange={e => set('doctor_note', e.target.value)}
              />
            </div>

            {/* File upload */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Upload Handwritten Prescription / Note *
              </label>
              <label
                className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${errors.file
                    ? 'border-red-400 bg-red-50'
                    : file
                      ? 'border-teal-400 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/40'}`}
              >
                <span className="text-2xl">{file ? '📄' : '📎'}</span>
                <div className="flex-1 min-w-0">
                  {file ? (
                    <p className="text-sm font-medium text-teal-700 truncate">{file.name}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Click to upload image or PDF</p>
                  )}
                  <p className="text-xs text-gray-400">JPG, PNG, PDF · max 10 MB</p>
                </div>
                {file && (
                  <button
                    onClick={e => { e.preventDefault(); setFile(null); setErrors(er => ({ ...er, file: undefined })) }}
                    className="text-xs text-red-500 hover:text-red-700 shrink-0"
                  >
                    Remove
                  </button>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setFile(f); setErrors(er => ({ ...er, file: undefined })) }
                  }}
                />
              </label>
              {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            disabled={saving}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold
              rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Forwarding to Nurse…</>
              : '🏥 Forward to Nurse Queue'}
          </button>
        </div>

        {/* ── Right: nurse info + flow ─────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Handoff info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🤝</span>
              <h3 className="text-sm font-semibold text-gray-800">Forward to Nurse</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              This record will be forwarded to the hospital-wide nurse queue. No nurse selection needed.
            </p>

            {nurses.length > 0 ? (
              <div className="space-y-2">
                {nurses.map(n => (
                  <div key={n.id} className="flex items-center gap-3 bg-purple-50 rounded-xl px-3 py-2.5">
                    <div className="w-7 h-7 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {n.full_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{n.full_name}</p>
                      <p className="text-xs text-purple-500">Nurse · {n.employee_id}</p>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                      Assigned
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No nurses assigned to this patient yet.</p>
            )}
          </div>

          {/* Workflow steps */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-teal-800 mb-3">📋 What happens next?</h3>
            <ol className="space-y-3">
              {[
                'Record is created and forwarded to nurse queue',
                'Nurse picks it up and completes vitals',
                'You review and finalize the record',
                'Finalized record is stored with SHA-256 hash',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-teal-700">
                  <span className="w-5 h-5 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Cancel */}
          <button
            onClick={() => navigate(`/doctor/patients/${id}`)}
            className="w-full py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← Back to Patient
          </button>
        </div>
      </div>
    </div>
  )
}
