// src/pages/doctor/DoctorPatients.jsx
// Route: /doctor/patients
// Needs: <Route path="/doctor/patients" element={<DoctorPatients />} /> in App.jsx

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchWithAuth } from '../../api/client'

const api  = (url, opts = {}) => fetchWithAuth(`/api/v1${url}`, {
  ...opts,
  headers: { 'Content-Type': 'application/json', ...opts.headers },
})

// ── tiny helpers ──────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Field({ label, value, err, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children || <p className="text-sm text-gray-800">{value || '—'}</p>}
      {err && <p className="text-xs text-red-500 mt-0.5">{err}</p>}
    </div>
  )
}

function inp(err) {
  return `w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all
    ${err ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-300'
           : 'border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-100'}`
}

// ── Register Patient Modal ────────────────────────────────────────────────────

const BLANK = { gov_id_type: 'aadhar', gov_id_number: '', full_name: '', gender: '', phone: '', email: '', address: '' }

function RegisterModal({ open, onClose, onAdded }) {
  const [form, setForm]     = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })) }

  async function submit() {
    setLoading(true); setErrors({})
    try {
      const res  = await api('/staff/doctor/patients/add/', { method: 'POST', body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setErrors(data.errors || { general: 'Registration failed.' }); return }
      onAdded(data.patient)
      setDone(true)
      setTimeout(() => { setForm(BLANK); setDone(false); onClose() }, 1400)
    } catch { setErrors({ general: 'Network error.' }) }
    finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        style={{ animation: 'modalIn .18s cubic-bezier(.22,1,.36,1)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Register New Patient</h2>
            <p className="text-xs text-gray-400 mt-0.5">Patient credentials will be sent to their email</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100">✕</button>
        </div>

        {done ? (
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
            <p className="font-semibold text-gray-800">Patient registered!</p>
            <p className="text-sm text-gray-400 mt-1">Credentials sent to their email.</p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{errors.general}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="ID Type" err={errors.gov_id_type}>
                <select className={inp(errors.gov_id_type)} value={form.gov_id_type} onChange={e => set('gov_id_type', e.target.value)}>
                  <option value="aadhar">Aadhar Card</option>
                  <option value="voter">Voter ID</option>
                </select>
              </Field>
              <Field label="ID Number *" err={errors.gov_id_number}>
                <input className={inp(errors.gov_id_number)} placeholder="XXXX XXXX XXXX"
                  value={form.gov_id_number} onChange={e => set('gov_id_number', e.target.value)} />
              </Field>
              <div className="col-span-2">
                <Field label="Full Name *" err={errors.full_name}>
                  <input className={inp(errors.full_name)} placeholder="Patient's full name"
                    value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                </Field>
              </div>
              <Field label="Gender" err={errors.gender}>
                <select className={inp()} value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Select…</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Phone" err={errors.phone}>
                <input className={inp(errors.phone)} placeholder="9876543210" maxLength={10}
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </Field>
              <div className="col-span-2">
                <Field label="Email" err={errors.email}>
                  <input type="email" className={inp(errors.email)} placeholder="patient@example.com"
                    value={form.email} onChange={e => set('email', e.target.value)} />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Address" err={errors.address}>
                  <input className={inp()} placeholder="Street, City"
                    value={form.address} onChange={e => set('address', e.target.value)} />
                </Field>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={submit} disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-60 font-medium transition-colors">
                {loading ? 'Registering…' : 'Register Patient'}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  )
}

// ── Patient Card ──────────────────────────────────────────────────────────────

const GENDER_ICON = { Male: 'M', Female: 'F', Other: 'O' }

function PatientCard({ patient, onClick }) {
  const initials = patient.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'P'
  const colors   = ['bg-teal-100 text-teal-700', 'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700',
                    'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700']
  const color    = colors[patient.full_name?.charCodeAt(0) % colors.length] || colors[0]

  return (
    <div onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer
        hover:border-teal-300 hover:shadow-md hover:shadow-teal-50 transition-all duration-150 group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0 ${color}`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate group-hover:text-teal-700 transition-colors">
          {patient.full_name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {GENDER_ICON[patient.gender] || ''} {patient.gender || 'Unknown'} · {patient.phone || patient.email || '—'}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full
          ${patient.is_active ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
          {patient.is_active ? 'Active' : 'Inactive'}
        </span>
        <span className="text-xs text-gray-300 group-hover:text-teal-500 transition-colors font-medium">View →</span>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DoctorPatients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [showReg, setShowReg]   = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    api('/staff/doctor/patients/')
      .then(r => r.json())
      .then(d => setPatients(Array.isArray(d) ? d : []))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false))
  }, [])

  const visible = patients.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return [p.full_name, p.email, p.phone].some(v => v?.toLowerCase().includes(q))
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Patients</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${patients.length} patient${patients.length !== 1 ? 's' : ''} under your care`}
          </p>
        </div>
        <button onClick={() => setShowReg(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors active:scale-95">
          <span className="text-lg leading-none">+</span> Register Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none
            focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
          placeholder="Search by name, phone or email…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">✕</button>
        )}
      </div>

      {/* List */}
      {loading ? <Spinner /> : visible.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center">
          <p className="text-4xl mb-3">🏥</p>
          <p className="font-semibold text-gray-700">
            {search ? 'No patients match your search' : 'No patients yet'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {search ? 'Try a different keyword.' : 'Register your first patient to get started.'}
          </p>
          {!search && (
            <button onClick={() => setShowReg(true)}
              className="mt-4 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors">
              + Register Patient
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {visible.map(p => (
            <PatientCard key={p.id} patient={p} onClick={() => navigate(`/doctor/patients/${p.id}`)} />
          ))}
        </div>
      )}

      {!loading && visible.length > 0 && (
        <p className="text-xs text-gray-400">Showing {visible.length} of {patients.length} patients</p>
      )}

      <RegisterModal
        open={showReg}
        onClose={() => setShowReg(false)}
        onAdded={p => setPatients(prev => [p, ...prev])}
      />
    </div>
  )
}
