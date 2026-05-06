// src/pages/doctor/DoctorPatientDetail.jsx
// Route: /doctor/patients/:id
// Needs: <Route path="/doctor/patients/:id" element={<DoctorPatientDetail />} /> in App.jsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAccessToken } from '../../auth_store/authStore'
import { getProfile } from '../../auth_store/profileStore'

const BASE = 'http://localhost:8000/api/v1'
const api  = (url, opts = {}) => fetch(`${BASE}${url}`, {
  ...opts,
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAccessToken()}`, ...opts.headers },
})

// ── KFT reference ranges ──────────────────────────────────────────────────────
const KFT_REFS = [
  { key: 'blood_pressure_systolic',  label: 'BP Systolic',   unit: 'mmHg',  low: 90,  high: 120 },
  { key: 'blood_pressure_diastolic', label: 'BP Diastolic',  unit: 'mmHg',  low: 60,  high: 80  },
  { key: 'cholesterol',              label: 'Cholesterol',   unit: 'mg/dL', low: 0,   high: 200 },
  { key: 'blood_glucose',            label: 'Blood Glucose', unit: 'mg/dL', low: 70,  high: 100 },
  { key: 'heart_rate',               label: 'Heart Rate',    unit: 'bpm',   low: 60,  high: 100 },
]

function getStatus(ref, val) {
  const v = parseFloat(val)
  if (isNaN(v)) return 'unknown'
  if (v < ref.low) return 'low'
  if (v > ref.high) return 'high'
  return 'normal'
}

const S = {
  normal:  { bar: 'bg-teal-500',    badge: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',    label: 'Normal' },
  low:     { bar: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',    label: 'Low'    },
  high:    { bar: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',    label: 'High'   },
  unknown: { bar: 'bg-gray-200',    badge: 'bg-gray-100 text-gray-400',                        label: '—'      },
}

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
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium animate-bounce-in
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

// ── Print helpers ─────────────────────────────────────────────────────────────

function printDiagnosis(patient, form, doctor) {
  const w = window.open('', '_blank')
  w.document.write(`<!DOCTYPE html><html><head><title>Clinical Notes</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;padding:40px;color:#111;font-size:14px}
  h1{font-size:20px;font-weight:bold}h2{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;margin:20px 0 8px;border-bottom:1px solid #eee;padding-bottom:4px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
  .field label{font-size:10px;text-transform:uppercase;color:#888;display:block;margin-bottom:2px}
  .box{background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px;line-height:1.6;white-space:pre-wrap}
  .footer{margin-top:40px;border-top:1px solid #ddd;padding-top:16px;display:flex;justify-content:space-between;font-size:11px;color:#888}
  .sig{text-align:right}.sig p{font-size:13px;font-weight:bold;color:#111}
  @media print{body{padding:20px}}</style></head><body>
  <div style="border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:24px">
    <p style="font-size:11px;color:#888;margin-bottom:4px">MediChain HMS · Clinical Notes</p>
    <h1>Diagnosis &amp; Treatment Plan</h1>
    <p style="font-size:12px;color:#888;margin-top:4px">Generated ${new Date().toLocaleString('en-IN')}</p>
  </div>
  <h2>Patient</h2>
  <div class="grid">
    <div class="field"><label>Full Name</label><p>${patient.full_name||'—'}</p></div>
    <div class="field"><label>Gender</label><p>${patient.gender||'—'}</p></div>
    <div class="field"><label>Phone</label><p>${patient.phone||'—'}</p></div>
    <div class="field"><label>Address</label><p>${patient.address||'—'}</p></div>
  </div>
  <h2>Clinical Details</h2>
  <div class="field" style="margin-bottom:12px"><label>Chest Pain Type</label><p>${form.chest_pain_type||'—'}</p></div>
  <div class="field" style="margin-bottom:12px"><label>Diagnosis</label><div class="box">${form.diagnosis}</div></div>
  <div class="field" style="margin-bottom:12px"><label>Treatment Plan</label><div class="box">${form.treatment_plan}</div></div>
  ${form.notes?`<div class="field"><label>Notes</label><div class="box">${form.notes}</div></div>`:''}
  <div class="footer">
    <p>For medical reference only · MediChain</p>
    <div class="sig"><p>Dr. ${doctor?.full_name||'Attending Physician'}</p>
    <p style="font-weight:normal;color:#888">${doctor?.specialization||''}</p>
    <div style="margin-top:28px;border-top:1px solid #aaa;width:160px;margin-left:auto;padding-top:4px;text-align:center;font-size:10px">Signature</div>
    </div>
  </div></body></html>`)
  w.document.close(); setTimeout(() => w.print(), 400)
}

// ── TAB 1: Patient Overview ───────────────────────────────────────────────────

function OverviewTab({ detail }) {
  const p  = detail?.patient || {}
  const nurses = detail?.assigned_nurses || []
  const techs  = detail?.assigned_technicians || []
  const nursesList = detail?.available_nurses || []
  const [selectedNurse, setSelectedNurse] = useState('')
  const [assigning, setAssigning] = useState(false)

  async function assignNurse() {
  if (!selectedNurse) return alert('Select nurse first')

  setAssigning(true)
  try {
    await api(`/staff/doctor/patients/${detail.patient.id}/assign-nurse/`, {
      method: 'POST',
      body: JSON.stringify({ nurse_id: selectedNurse }),
    })
  } finally {
    setAssigning(false)
  }
}


 

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Assign Nurse */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Assign Nurse
          </h3>

          <div className="flex gap-2">
            <select
              value={selectedNurse}
              onChange={(e) => setSelectedNurse(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"
            >
              <option value="">Select nurse...</option>
              {nursesList.map(n => (
                <option key={n.id} value={n.id}>
                  {n.full_name}
                </option>
              ))}
            </select>

            <button
              onClick={assignNurse}
              disabled={assigning}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm"
            >
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      {/* Basic info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Personal Information</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <DataItem label="Phone"         value={p.phone} />
          <DataItem label="Email"         value={p.email} />
          <DataItem label="Gender"        value={p.gender} />
          <DataItem label="Date of Birth" value={p.date_of_birth} />
          <DataItem label="Blood Group"   value={p.blood_group} />
          <DataItem label="Gov ID Type"   value={p.gov_id_type_display} />
          <div className="col-span-2">
            <DataItem label="Address" value={p.address} />
          </div>
          <div className="col-span-2">
            <DataItem label="Gov ID (masked)" value={detail?.gov_id_masked} />
          </div>
        </div>
      </div>

      {/* Registration + Staff */}
      <div className="flex flex-col gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Registration</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <DataItem label="Registered By" value={p.registered_by_name} />
            <DataItem label="Registered On" value={p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
            <div className="col-span-2 flex items-center gap-2 pt-1">
              <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Status</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full
                ${p.is_active ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
                {p.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned staff */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Assigned Staff</h3>
          {nurses.length === 0 && techs.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No staff assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {nurses.map(n => (
                <div key={n.id} className="flex items-center gap-3 bg-purple-50 rounded-xl px-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold">{n.full_name?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{n.full_name}</p>
                    <p className="text-xs text-purple-500">Nurse · {n.employee_id}</p>
                  </div>
                </div>
              ))}
              {techs.map(t => (
                <div key={t.id} className="flex items-center gap-3 bg-amber-50 rounded-xl px-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold">{t.full_name?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.full_name}</p>
                    <p className="text-xs text-amber-600">Technician · {t.employee_id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── TAB 2: Send to Lab ────────────────────────────────────────────────────────

const CHEST_TYPES = ['Typical Angina', 'Atypical Angina', 'Non-Anginal Pain', 'Asymptomatic']
const BLANK_LAB   = { chest_pain_type: '', diagnosis: '', treatment_plan: '', notes: '', lab_id: '' }

function SendToLabTab({ patient, detail, toast$ }) {
  
  const [form, setForm]     = useState(BLANK_LAB)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(null)
  const [labsList, setLabsList] = useState([])
  const doctor = getProfile()

useEffect(() => {
  if (detail?.available_labs) {
    setLabsList(detail.available_labs)
  } else {
    setLabsList([])
  }
}, [detail])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })) }

  async function submit() {
    const errs = {}
    if (!form.chest_pain_type) errs.chest_pain_type = 'Required'
    if (!form.diagnosis.trim()) errs.diagnosis = 'Required'
    if (!form.treatment_plan.trim()) errs.treatment_plan = 'Required'
    if (!form.lab_id.trim()) errs.lab_id = 'Required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true); setErrors({})
    try {
      const res  = await api(`/staff/doctor/patients/${patient.id}/send-to-lab/`, {
        method: 'POST',
        body:   JSON.stringify({ ...form, patient_id: patient.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        const mapped = {}
        Object.entries(data.errors || data).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v })
        setErrors(mapped); return
      }
      setSent({ ...form })
      toast$('Lab request sent successfully')
      setForm(BLANK_LAB)
    } catch { toast$('Network error', 'err') }
    finally { setLoading(false) }
  }

  const i = k => `w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all
    ${errors[k] ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-200'
                : 'border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-100'}`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-800">Clinical Assessment</h3>
          <p className="text-xs text-gray-400 mt-0.5">Fill in examination findings before sending patient to lab</p>
        </div>

        {/* Chest pain type */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Chest Pain Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {CHEST_TYPES.map(t => (
              <button key={t} onClick={() => set('chest_pain_type', t)}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all text-left
                  ${form.chest_pain_type === t
                    ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-200'
                    : 'border-gray-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50/50'}`}>
                {t}
              </button>
            ))}
          </div>
          {errors.chest_pain_type && <p className="text-xs text-red-500 mt-1">{errors.chest_pain_type}</p>}
        </div>

        {/* Diagnosis */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Diagnosis *</label>
          <textarea rows={3} className={i('diagnosis')}
            placeholder="Based on physical examination and clinical history…"
            value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} />
          {errors.diagnosis && <p className="text-xs text-red-500 mt-0.5">{errors.diagnosis}</p>}
        </div>

        {/* Treatment plan */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Treatment Plan *</label>
          <textarea rows={3} className={i('treatment_plan')}
            placeholder="Medications, lifestyle changes, follow-up…"
            value={form.treatment_plan} onChange={e => set('treatment_plan', e.target.value)} />
          {errors.treatment_plan && <p className="text-xs text-red-500 mt-0.5">{errors.treatment_plan}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Additional Notes</label>
          <textarea rows={2} className={i('notes')}
            placeholder="Extra observations (optional)…"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        {/* Lab Selection */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Select Lab *
          </label>

          <select
            className={i('lab_id')}
            value={form.lab_id}
            onChange={e => set('lab_id', e.target.value)}
          >
            <option value="">Select lab to continue...</option>
            {Array.isArray(labsList) && labsList.map(l => (
              <option key={l.id} value={l.id}>
                {l.name ?? l.lab_name ?? '—'}
              </option>
            ))}
          </select>

          {errors.lab_id && (
            <p className="text-xs text-red-500 mt-0.5">{errors.lab_id}</p>
          )}
        </div>

        <button onClick={submit} disabled={loading}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold
            rounded-xl transition-colors flex items-center justify-center gap-2">
          {loading
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
            : '🔬 Send Patient to Lab'}
        </button>
      </div>

      {/* Right: instructions + last sent */}
      <div className="flex flex-col gap-4">
        {/* Instructions card */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-teal-800 mb-3">📋 What happens next?</h3>
          <ol className="space-y-3">
            {[
              'Submit this form to create a lab request',
              'Tell the patient to visit the Biochemistry Lab',
              'Patient shows their ID at the lab',
              'Technician finds the patient and fills the KFT form',
              'Once complete, patient returns and you can run AI prediction',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-teal-700">
                <span className="w-5 h-5 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Last sent */}
        {sent && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Last Request Sent</p>
              <span className="text-xs bg-teal-50 text-teal-700 ring-1 ring-teal-200 px-2 py-0.5 rounded-full font-medium">Sent ✓</span>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Type: </span><span className="font-medium">{sent.chest_pain_type}</span></div>
              <div><span className="text-gray-400">Diagnosis: </span><span className="font-medium">{sent.diagnosis}</span></div>
            </div>
            <button onClick={() => printDiagnosis(patient, sent, doctor)}
              className="mt-4 w-full py-2.5 border border-teal-300 text-teal-700 text-sm font-medium rounded-xl hover:bg-teal-50 transition-colors">
              📄 Print Clinical Notes
            </button>
          </div>
        )}

        {/* Patient instruction slip */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Patient Details (for lab)</h3>
          <p className="text-xs text-gray-400 mb-3">Share this with the patient to show at the lab</p>
          <div className="bg-gray-50 rounded-xl p-3 font-mono text-xs space-y-1 text-gray-600">
            <p><strong>Name:</strong> {patient?.full_name}</p>
            <p><strong>Phone:</strong> {patient?.phone || '—'}</p>
            <p><strong>DOB:</strong> {patient?.date_of_birth || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── TAB 3: Reports ────────────────────────────────────────────────────────────

function ReportsTab({ patient, detail, toast$ }) {
  const navigate = useNavigate()
  const [record, setRecord]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [predicting, setPredicting] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const doctor = getProfile()

  // use records from detail API if available
  const patientRecords = detail?.records || []

  async function loadRecord() {
    if (!recordId.trim()) return
    setLoading(true); setError(''); setRecord(null); setPrediction(null)
    try {
      const res = await api(`/staff/records/${recordId.trim()}/`)
      if (!res.ok) { setError('Record not found or access denied.'); return }
      setRecord(await res.json())
    } catch { setError('Network error.') }
    finally { setLoading(false) }
  }

  async function predict() {
    if (!record) return
    setPredicting(true)
    try {
      // !TODO: replace with real CKD prediction endpoint once ML module is wired
      await new Promise(r => setTimeout(r, 1500))
      const audit = record.audit || {}
      // naive mock score until API is ready
      const highCount = KFT_REFS.filter(r => getStatus(r, audit[r.key]) === 'high').length
      setPrediction({
        risk: highCount >= 3 ? 'High' : highCount >= 1 ? 'Moderate' : 'Low',
        score: Math.min(95, highCount * 28 + Math.random() * 10),
      })
    } finally { setPredicting(false) }
  }

  return (
    <div className="space-y-5">
            {/* Load record */}
      <button onClick={() => navigate(`/doctor/patients/${patient.id}/create-record`)}
          className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors">
          + Create Medical Record
        </button>
      {/* Existing Patient Records */}
      {patientRecords.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Existing Medical Records
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Records already created for this patient
              </p>
            </div>

            <span className="text-xs bg-teal-50 text-teal-700 ring-1 ring-teal-200 px-2.5 py-1 rounded-full font-medium">
              {patientRecords.length} record{patientRecords.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {patientRecords.map(r => (
              <div
                key={r.record_id}
                className="border border-gray-100 rounded-xl p-4 hover:border-teal-200 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800">
                        {r.lab_name || r.record_type_display || 'Medical Record'}
                      </p>

                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        v{r.version}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Record ID:</span>{' '}
                        <span className="font-mono">{r.record_id}</span>
                      </p>

                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Recorded By:</span>{' '}
                        {r.recorded_by_name || '—'}
                      </p>

                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Created:</span>{' '}
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString('en-IN')
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      setLoading(true)
                      setError('')

                      try {
                        const res = await api(`/staff/records/${r.record_id}/`)
                        if (!res.ok) {
                          setError('Record not found or access denied.')
                          return
                        }

                        setRecord(await res.json())
                      } catch {
                        setError('Network error.')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="shrink-0 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Empty state */}
      {!record && !error && (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
          <p className="text-4xl mb-3">🔬</p>
          <p className="font-semibold text-gray-700">No report loaded</p>
          <p className="text-sm text-gray-400 mt-1">Paste the Record UUID from the technician above to view lab results.</p>
        </div>
      )}

      {/* Record data */}
      {record && (() => {
        const audit      = record.audit || {}
        const labRequest = record.lab_request || {}
        const hasKFT     = KFT_REFS.some(r => audit[r.key] !== undefined)

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* KFT values */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Lab Results</h3>
                  <p className="text-xs text-gray-400">{labRequest.lab_name || 'Biochemistry Lab'} · v{record.version}</p>
                </div>
                <span className="text-xs bg-teal-50 text-teal-700 ring-1 ring-teal-200 px-2 py-0.5 rounded-full font-medium">Verified ✓</span>
              </div>

              <div className="space-y-3">
                {KFT_REFS.map(ref => {
                  const val = audit[ref.key]
                  const st  = getStatus(ref, val)
                  const s   = S[st]
                  const pct = val !== undefined
                    ? Math.min(100, Math.max(0, ((parseFloat(val) - ref.low * 0.7) / (ref.high * 1.3 - ref.low * 0.7)) * 100))
                    : 0

                  return (
                    <div key={ref.key} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium text-gray-800">{ref.label}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900">
                              {val !== undefined ? parseFloat(val).toFixed(ref.key.includes('glucose') ? 1 : 0) : '—'}
                              <span className="text-xs font-normal text-gray-400 ml-1">{ref.unit}</span>
                            </p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full transition-all duration-500 ${s.bar}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-gray-400 shrink-0">{ref.low}–{ref.high}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {audit.ecg_result && (
                  <div className="flex items-center justify-between py-2">
                    <p className="text-sm font-medium text-gray-800">ECG Result</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                      ${audit.ecg_result?.toLowerCase() === 'normal'
                        ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200'
                        : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'}`}>
                      {audit.ecg_result}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Predict + Diagnosis */}
            <div className="flex flex-col gap-4">
              {/* AI Predict card */}
              {hasKFT && (
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-5 text-white">
                  <p className="text-sm font-semibold mb-0.5">🧠 CKD Risk Prediction</p>
                  <p className="text-xs text-violet-200 mb-4">AI model analyses KFT values to estimate Chronic Kidney Disease risk</p>

                  {!prediction ? (
                    <button onClick={predict} disabled={predicting}
                      className="w-full py-3 bg-white/20 hover:bg-white/30 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all backdrop-blur-sm flex items-center justify-center gap-2">
                      {predicting
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analysing…</>
                        : '▶ Run Prediction'}
                    </button>
                  ) : (
                    <div className="bg-white/15 rounded-xl p-4 space-y-3 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-violet-100">CKD Risk Level</p>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full
                          ${prediction.risk === 'High'     ? 'bg-rose-100 text-rose-700'
                          : prediction.risk === 'Moderate' ? 'bg-amber-100 text-amber-700'
                          :                                  'bg-teal-100 text-teal-700'}`}>
                          {prediction.risk}
                        </span>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-violet-200 mb-1.5">
                          <span>Risk Score</span>
                          <span>{prediction.score.toFixed(1)}%</span>
                        </div>
                        <div className="bg-white/20 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all duration-700
                            ${prediction.risk === 'High' ? 'bg-rose-400' : prediction.risk === 'Moderate' ? 'bg-amber-400' : 'bg-teal-400'}`}
                            style={{ width: `${prediction.score}%` }} />
                        </div>
                      </div>
                      <p className="text-xs text-violet-200">
                        {/* !TODO: replace mock with real ML endpoint output */}
                        ⚠️ This is a preview result. Full ML model coming soon.
                      </p>
                      <button onClick={() => setPrediction(null)}
                        className="text-xs text-violet-200 hover:text-white underline">Re-run</button>
                    </div>
                  )}
                </div>
              )}

              {/* Doctor's diagnosis summary */}
              {labRequest.diagnosis && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Your Diagnosis on File</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{labRequest.diagnosis}</p>
                  {labRequest.treatment_plan && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Treatment Plan</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{labRequest.treatment_plan}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Download */}
              <button
                onClick={() => {
                  const w = window.open('', '_blank')
                  w.document.write(`<html><body><h2>${patient?.full_name} · Lab Report</h2><pre>${JSON.stringify(audit, null, 2)}</pre></body></html>`)
                  w.document.close(); setTimeout(() => w.print(), 300)
                }}
                className="w-full py-3 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors">
                📥 Print Lab Report
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ── Main Detail Page ──────────────────────────────────────────────────────────

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
    <div className="flex flex-col gap-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <button onClick={() => navigate('/doctor/patients')} className="hover:text-teal-600 transition-colors">My Patients</button>
        <span>/</span>
        <span className="text-gray-700 font-medium">{p.full_name}</span>
      </div>

      {/* Patient hero */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900">{p.full_name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {p.gov_id_type_display} · <span className="font-mono">{detail?.gov_id_masked || '••••••••'}</span>
              {p.gender ? ` · ${p.gender}` : ''}
              {p.date_of_birth ? ` · DOB: ${p.date_of_birth}` : ''}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full
                ${p.is_active ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
                {p.is_active ? 'Active' : 'Inactive'}
              </span>
              {p.blood_group && (
                <span className="text-xs bg-rose-50 text-rose-700 ring-1 ring-rose-200 px-2.5 py-0.5 rounded-full font-semibold">
                  {p.blood_group}
                </span>
              )}
              <span className="text-xs text-gray-400">
                Registered {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '—'}
              </span>
            </div>
          </div>
          <button onClick={() => navigate('/doctor/patients')}
            className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors px-3 py-2 rounded-xl hover:bg-gray-100">
            ← Back
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {TABS.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all
              ${tab === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 0 && <OverviewTab detail={detail} />}
      {tab === 1 && <SendToLabTab patient={p} detail={detail} toast$={toast$} />}
      {tab === 2 && <ReportsTab patient={p} detail={detail} toast$={toast$} />}
    </div>
  )
}