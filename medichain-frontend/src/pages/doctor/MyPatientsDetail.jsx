// src/pages/doctor/DoctorPatientDetail.jsx
// FIXED VERSION - Corrected field mappings and data structure handling

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchWithAuth } from '../../api/client'

const api  = (url, opts = {}) => fetchWithAuth(`/api/v1${url}`, {
  ...opts,
  headers: { 'Content-Type': 'application/json', ...opts.headers },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [])
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium
      ${type === 'ok' ? 'bg-teal-600 text-white' : 'bg-rose-500 text-white'}`}>
      {type === 'ok' ? '✓' : '✕'} {msg}
    </div>
  )
}

function DataItem({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value || '—'}</span>
    </div>
  )
}

// ── Compact Nurse Assignment Panel ────────────────────────────────────────────

function NurseAssignmentPanel({ detail, onRefresh }) {
  const [selectedNurse, setSelectedNurse] = useState('')
  const [assigning, setAssigning] = useState(false)
  const nurses = detail?.assigned_nurses || []
  const nursesList = detail?.available_nurses || []

  async function assignNurse() {
    if (!selectedNurse) return
    setAssigning(true)
    try {
      await api(`/staff/doctor/patients/${detail.patient.id}/assign-nurse/`, {
        method: 'POST',
        body: JSON.stringify({ nurse_id: selectedNurse }),
      })
      setSelectedNurse('')
      if (onRefresh) onRefresh()
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Care Team</h3>
        {nurses.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No nurses assigned</p>
        ) : (
          <div className="space-y-1.5">
            {nurses.map(n => (
              <div key={n.id} className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                  {n.full_name?.[0]}
                </div>
                <span className="text-gray-700 font-medium">{n.full_name}</span>
                <span className="text-purple-500 text-xs">({n.employee_id})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <select
          value={selectedNurse}
          onChange={(e) => setSelectedNurse(e.target.value)}
          className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
        >
          <option value="">Assign nurse…</option>
          {nursesList.map(n => (
            <option key={n.id} value={n.id}>
              {n.full_name}
            </option>
          ))}
        </select>
        <button
          onClick={assignNurse}
          disabled={assigning || !selectedNurse}
          className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {assigning ? '…' : '+'}
        </button>
      </div>
    </div>
  )
}

// ── TAB 1: Patient Overview ───────────────────────────────────────────────────

function OverviewTab({ detail }) {
  const p  = detail?.patient || {}

  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <DataItem label="Phone"         value={p.phone} />
          <DataItem label="Email"         value={p.email} />
          <DataItem label="Gender"        value={p.gender} />
          <DataItem label="Blood Group"   value={p.blood_group} />
          <div className="col-span-2">
            <DataItem label="Address" value={p.address} />
          </div>
        </div>
      </div>

      {/* Registration + Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Registration</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <DataItem label="Registered By" value={p.registered_by_name} />
          <DataItem label="Government ID" value={detail?.gov_id_masked || '—'} />
          <DataItem label="Status" value={p.is_active ? 'Active' : 'Inactive'} />
        </div>
      </div>
    </div>
  )
}

// ── TAB 2: Send to Lab ────────────────────────────────────────────────────────

const CHEST_TYPES = [
  { label: 'Typical Angina', value: 'typical' },
  { label: 'Atypical Angina', value: 'atypical' },
  { label: 'Non-Anginal Pain', value: 'non_anginal' },
  { label: 'Asymptomatic', value: 'asymptomatic' },
]
const BLANK_LAB   = { chest_pain_type: '', diagnosis: '', treatment_plan: '', notes: '', lab_id: '' }

function SendToLabTab({ patient, detail, toast$ }) {
  const [form, setForm]     = useState(BLANK_LAB)
  const [errors, setErrors] = useState({})
  const [customErrors, setCustomErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(null)
  const [labsList, setLabsList] = useState([])
  const [labSchema, setLabSchema] = useState([])
  const [customValues, setCustomValues] = useState({})

  useEffect(() => {
    if (detail?.available_labs) {
      setLabsList(detail.available_labs)
    }
  }, [detail])

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  useEffect(() => {
    const selected = labsList.find(l => String(l.id) === String(form.lab_id))
    const schema = selected?.custom_field_schema || []
    setLabSchema(schema)
    const initial = {}
    schema.forEach(field => {
      initial[field.key] = customValues[field.key] ?? ''
    })
    setCustomValues(initial)
    setCustomErrors({})
  }, [form.lab_id, labsList])

  function updateCustomField(key, value) {
    setCustomValues(prev => ({ ...prev, [key]: value }))
    setCustomErrors(prev => ({ ...prev, [key]: undefined }))
  }

  async function submit() {
    const errs = {}
    if (!form.chest_pain_type) errs.chest_pain_type = 'Required'
    if (!form.diagnosis.trim()) errs.diagnosis = 'Required'
    if (!form.treatment_plan.trim()) errs.treatment_plan = 'Required'
    if (!form.lab_id.trim()) errs.lab_id = 'Required'
    const fieldErrors = {}
    labSchema.forEach(field => {
      if (field.required && !customValues[field.key]) {
        fieldErrors[field.key] = 'Required'
      }
    })
    if (Object.keys(errs).length || Object.keys(fieldErrors).length) {
      setErrors(errs)
      setCustomErrors(fieldErrors)
      return
    }

    setLoading(true); setErrors({})
    try {
      const res  = await api(`/staff/doctor/patients/${patient.id}/send-to-lab/`, {
        method: 'POST',
        body:   JSON.stringify({
          ...form,
          patient_id: patient.id,
          custom_field_values: labSchema.length ? customValues : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const mapped = {}
        Object.entries(data.errors || data).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v })
        setErrors(mapped); return
      }
      setSent({ ...form, lab_name: labsList.find(l => l.id === form.lab_id)?.name })
      toast$('Lab request sent successfully')
      setForm(BLANK_LAB)
      setCustomValues({})
    } catch { toast$('Network error', 'err') }
    finally { setLoading(false) }
  }

  const i = k => `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all
    ${errors[k] || customErrors[k] ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-200'
                : 'border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-100'}`

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Clinical Assessment</h3>

        {/* Chest pain type */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Chest Pain Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {CHEST_TYPES.map(t => (
              <button key={t.value} onClick={() => set('chest_pain_type', t.value)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all text-left
                  ${form.chest_pain_type === t.value
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
          {errors.chest_pain_type && <p className="text-xs text-red-500 mt-1">{errors.chest_pain_type}</p>}
        </div>

        {/* Diagnosis */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Diagnosis *</label>
          <textarea rows={2} className={i('diagnosis')}
            placeholder="Based on clinical examination…"
            value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} />
          {errors.diagnosis && <p className="text-xs text-red-500 mt-0.5">{errors.diagnosis}</p>}
        </div>

        {/* Treatment plan */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Treatment Plan *</label>
          <textarea rows={2} className={i('treatment_plan')}
            placeholder="Medications, lifestyle, follow-up…"
            value={form.treatment_plan} onChange={e => set('treatment_plan', e.target.value)} />
          {errors.treatment_plan && <p className="text-xs text-red-500 mt-0.5">{errors.treatment_plan}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Notes (optional)</label>
          <textarea rows={2} className={i('notes')}
            placeholder="Extra observations…"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        {/* Lab Selection */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Select Lab *</label>
          <select className={i('lab_id')} value={form.lab_id} onChange={e => set('lab_id', e.target.value)}>
            <option value="">Choose lab…</option>
            {Array.isArray(labsList) && labsList.map(l => (
              <option key={l.id} value={l.id}>
                {l.name ?? l.lab_name ?? '—'} {l.lab_type ? `(${l.lab_type.toUpperCase()})` : ''}
              </option>
            ))}
          </select>
          {errors.lab_id && <p className="text-xs text-red-500 mt-0.5">{errors.lab_id}</p>}
        </div>

        {labSchema.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lab Fields</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {labSchema.map(field => (
                <div key={field.key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                    {field.label} {field.required ? '*' : ''}
                  </label>
                  {field.type === 'boolean' ? (
                    <select
                      className={i(field.key)}
                      value={customValues[field.key] || ''}
                      onChange={e => updateCustomField(field.key, e.target.value)}
                    >
                      <option value="">Select…</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      className={i(field.key)}
                      placeholder={field.unit ? `${field.label} (${field.unit})` : field.label}
                      value={customValues[field.key] || ''}
                      onChange={e => updateCustomField(field.key, e.target.value)}
                    />
                  )}
                  {customErrors[field.key] && (
                    <p className="text-xs text-red-500 mt-0.5">{customErrors[field.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={submit} disabled={loading}
          className="w-full py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? 'Sending…' : '🔬 Send to Lab'}
        </button>
      </div>

      {sent && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-teal-800 mb-2">✓ Request sent!</p>
          <p className="text-xs text-teal-700">
            {sent.lab_name ? `${sent.lab_name} has been notified.` : 'Lab has been notified.'}
          </p>
        </div>
      )}
    </div>
  )
}

// ── TAB 3: Reports with Internal Subtabs ──────────────────────────────────────

function ReportsTab({ patient, detail, navigate }) {
  const [subTab, setSubTab] = useState('medical') // 'medical' | 'lab'
  const [searchMedical, setSearchMedical] = useState('')
  const [searchLab, setSearchLab] = useState('')
  const [medicalRecords, setMedicalRecords] = useState([])
  const [labReports, setLabReports] = useState([])  

  


  useEffect(() => {
      loadMedicalRecords()
      loadLabReports()
    }, [patient.id])

    async function loadMedicalRecords() {
      const r = await api(`/staff/doctor/medical-records/`)
      const d = await r.json()

      const filtered = d.filter(
        x => x.patient?.id === patient.id
      )

      setMedicalRecords(filtered)
    }

    async function loadLabReports() {
      const r = await api(`/staff/doctor/records/?patient_id=${patient.id}`)
      const d = await r.json()

      setLabReports(d.records || [])
    }


  // FIXED: Proper field mapping for medical records
  const filteredMedical = medicalRecords.filter(r => {
    // Only show medical records (have title or primary_diagnosis)
    if (!r.title && !r.primary_diagnosis) return false
    if (!searchMedical) return true
    const q = searchMedical.toLowerCase()
    return [
      r.title,
      r.finalized_record_id,
      r.primary_diagnosis,
      r.record_id
    ].some(v => v?.toLowerCase?.().includes(q))
  })

  // FIXED: Proper field mapping for lab reports
  const filteredLab = labReports.filter(r => {
    // Only show lab reports (have lab_name)
    if (!r.lab_name) return false
    if (!searchLab) return true
    const q = searchLab.toLowerCase()
    return [
      r.lab_name,
      r.record_id,
      r.patient_name
    ].some(v => v?.toLowerCase?.().includes(q))
  })

  return (
    <div className="space-y-4">
      {/* Create new + subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={() => navigate(`/doctor/patients/${patient.id}/create-record`)}
          className="px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors w-fit"
        >
          + Create Medical Record
        </button>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {['medical', 'lab'].map(tab => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-all
                ${subTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              {tab === 'medical' ? '📋 Medical Records' : '🧪 Lab Reports'}
            </button>
          ))}
        </div>
      </div>

      {/* Search bars and grid - Medical Records subtab */}
      {subTab === 'medical' && (
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
              placeholder="Search by title, ID, or diagnosis…"
              value={searchMedical}
              onChange={e => setSearchMedical(e.target.value)}
            />
          </div>

          {filteredMedical.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-200 rounded-xl">
              <p className="text-gray-400 text-sm">No medical records yet.</p>
              <p className="text-xs text-gray-400 mt-1">Create a new doctor workflow record to begin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMedical.map(r => (
                <div
                  key={r.finalized_record_id || r.record_id}
                  onClick={() =>
                  navigate(
                    `/doctor/patients/${patient.id}/reports/medical/${
                      r.record_id || r.finalized_record_id || r.id
                    }`
                  )
                  }
                  className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-teal-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">{r.title || 'Medical Record'}</h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium shrink-0">v{r.version || 1}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{r.primary_diagnosis || '—'}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>📅</span>
                    <span>{r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search bars and grid - Lab Reports subtab */}
      {subTab === 'lab' && (
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
              placeholder="Search by lab, report ID, or patient…"
              value={searchLab}
              onChange={e => setSearchLab(e.target.value)}
            />
          </div>

          {filteredLab.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-200 rounded-xl">
              <p className="text-gray-400 text-sm">No lab reports available.</p>
              <p className="text-xs text-gray-400 mt-1">Send patient to lab first to generate reports.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredLab.map(r => (
                <div
                  key={r.record_id}
                  onClick={() =>
                       navigate(
                    `/doctor/patients/${patient.id}/reports/lab/${r.record_id}`
                )
                    }
                  className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-teal-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">{r.lab_name || 'Lab Report'}</h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium shrink-0">v{r.version || 1}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">ID: <span className="font-mono">{r.record_id?.slice(0, 12)}...</span></p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>📅</span>
                    <span>{r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

const TABS = [
  { label: 'Overview',     icon: '👤' },
  { label: 'Send to Lab',  icon: '🔬' },
  { label: 'Reports',      icon: '📊' },
]

export default function DoctorPatientDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [tab, setTab]     = useState(0)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const toast$ = (msg, type = 'ok') => setToast({ msg, type })

  useEffect(() => {
    api(`/staff/doctor/patients/${id}/`)
      .then(r => r.json())
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />
  if (!detail) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-3">Oops!</p>
      <p className="font-semibold text-gray-700">Patient not found</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-sm text-teal-600 hover:underline">← Go back</button>
    </div>
  )

  const p = detail?.patient || {}
  const initials = p.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'P'

  return (
    <div className="min-h-full bg-gray-50">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <button onClick={() => navigate('/doctor/patients')} className="hover:text-teal-600 transition-colors">My Patients</button>
        <span>/</span>
        <span className="text-gray-700 font-medium">{p.full_name}</span>
      </div>

      {/* Patient hero - compact */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900">{p.full_name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {p.gender} · {p.phone} {p.blood_group ? `· ${p.blood_group}` : ''}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {p.is_active && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">Active</span>
            )}
          </div>
        </div>
      </div>

      {/* Main content grid: tabs on left + side panel on right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* ── Main tabs area (3/4 width on lg) ────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tab buttons */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            {TABS.map((t, i) => (
              <button key={t.label} onClick={() => setTab(i)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-all
                  ${tab === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 0 && <OverviewTab detail={detail} />}
          {tab === 1 && <SendToLabTab patient={p} detail={detail} toast$={toast$} />}
          {tab === 2 && <ReportsTab patient={p} detail={detail} navigate={navigate} />}
        </div>

        {/* ── Side panel (1/4 width on lg) ────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-3">
          <NurseAssignmentPanel detail={detail} />

          {/* Quick info card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Registered</p>
            <p className="text-xs text-gray-600">
              {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
