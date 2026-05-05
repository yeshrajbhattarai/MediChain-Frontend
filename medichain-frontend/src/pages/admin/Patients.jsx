// src/pages/admin/Patients.jsx
// APIs:
//   GET  /api/v1/staff/patients/         — list all patients
//   POST /api/v1/staff/patients/         — register new patient
//   GET  /api/v1/staff/patients/<uuid>/  — view patient detail (with masked gov ID)

import { useState, useEffect, useRef } from 'react'
import { getAccessToken } from '../../auth_store/authStore'

const BASE = 'http://127.0.0.1:8000/api/v1'

const api = (url, opts = {}) =>
  fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
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

function Field({ label, value, half }) {
  return (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || <span className="text-gray-400 font-normal">—</span>}</p>
    </div>
  )
}

function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] flex flex-col`}
        style={{ animation: 'modalIn .18s cubic-bezier(.22,1,.36,1)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  )
}

// ─── Add Patient Modal ─────────────────────────────────────────────────────────

function AddPatientModal({ open, onClose, onAdded }) {
  const blank = { gov_id_type: 'aadhar', gov_id_number: '', full_name: '', gender: '', phone: '', email: '', address: '' }
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: undefined })) }

  async function handleSubmit() {
    setLoading(true); setErrors({}); setSuccess('')
    try {
      const res = await api('/staff/patients/', { method: 'POST', body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setErrors(data.errors || { general: 'Something went wrong.' }); return }
      setSuccess(`${data.patient.full_name} registered successfully.`)
      setForm(blank); onAdded(data.patient); setTimeout(onClose, 1500)
    } catch { setErrors({ general: 'Network error. Try again.' }) }
    finally { setLoading(false) }
  }

  const inputCls = key =>
    `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors
     ${errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'}`

  return (
    <Modal open={open} onClose={onClose} title="Register New Patient" width="max-w-xl">
      <div className="space-y-4">
        {errors.general && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">{errors.general}</div>}
        {success && <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg border border-emerald-200">{success}</div>}

        <div className="grid grid-cols-2 gap-3">
          {/* Gov ID type */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">ID Type *</label>
            <select className={inputCls('gov_id_type')} value={form.gov_id_type} onChange={e => set('gov_id_type', e.target.value)}>
              <option value="aadhar">Aadhar Card</option>
              <option value="voter">Voter ID</option>
            </select>
          </div>

          {/* Gov ID number */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">ID Number *</label>
            <input className={inputCls('gov_id_number')} placeholder="XXXX XXXX XXXX"
              value={form.gov_id_number} onChange={e => set('gov_id_number', e.target.value)} />
            {errors.gov_id_number && <p className="text-xs text-red-500 mt-0.5">{errors.gov_id_number}</p>}
          </div>

          {/* Full name */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
            <input className={inputCls('full_name')} placeholder="Patient full name"
              value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            {errors.full_name && <p className="text-xs text-red-500 mt-0.5">{errors.full_name}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Gender</label>
            <select className={inputCls('gender')} value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="">Select…</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
            <input className={inputCls('phone')} placeholder="9876543210" maxLength={10}
              value={form.phone} onChange={e => set('phone', e.target.value)} />
            {errors.phone && <p className="text-xs text-red-500 mt-0.5">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
            <input type="email" className={inputCls('email')} placeholder="patient@email.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
            {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
          </div>

          {/* Address */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Address</label>
            <input className={inputCls('address')} placeholder="Street, City"
              value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium">
            {loading ? 'Registering…' : 'Register Patient'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Patient Detail Modal ──────────────────────────────────────────────────────

function PatientDetailModal({ patient, open, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!open || !patient) return
    if (hasFetched.current) return
    hasFetched.current = true
    setLoading(true)
    api(`/staff/patients/${patient.id}/`).then(r => r.json()).then(setDetail).catch(() => {}).finally(() => setLoading(false))
  }, [open, patient])

  function handleClose() { hasFetched.current = false; setDetail(null); onClose() }

  const d = detail || patient || {}

  const genderColor = { Male: 'bg-blue-50 text-blue-700', Female: 'bg-pink-50 text-pink-700', Other: 'bg-gray-100 text-gray-700' }

  return (
    <Modal open={open} onClose={handleClose} title="Patient Details" width="max-w-xl">
      {loading ? <Spinner /> : (
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
              {d.full_name?.[0] || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{d.full_name}</p>
              <p className="text-sm text-gray-500">
                {d.gov_id_type_display} · <span className="font-mono">{detail?.gov_id_masked || '••••••••'}</span>
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {d.gender && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${genderColor[d.gender] || 'bg-gray-100 text-gray-600'}`}>
                    {d.gender}
                  </span>
                )}
                {d.blood_group && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">{d.blood_group}</span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {d.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Phone"       value={d.phone}       half />
            <Field label="Email"       value={d.email}       half />
            <Field label="Date of Birth" value={d.date_of_birth} half />
            <Field label="Registered By" value={d.registered_by_name} half />
            <Field label="Address"     value={d.address} />
          </div>

          <p className="text-xs text-gray-400">
            Registered {d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </p>

          <div className="pt-1 border-t border-gray-100">
            <button onClick={handleClose}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Patients() {
  const [patients, setPatients]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')  // 'all' | 'active' | 'inactive'
  const [showAdd, setShowAdd]     = useState(false)
  const [selected, setSelected]   = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchPatients()
  }, [])

  async function fetchPatients() {
    setLoading(true)
    try {
      const res = await api('/staff/patients/')
      const data = await res.json()
      setPatients(Array.isArray(data) ? data : [])
    } catch { setPatients([]) }
    finally { setLoading(false) }
  }

  function handleAdded(p) { setPatients(prev => [p, ...prev]) }
  function openDetail(p) { setSelected(p); setShowDetail(true) }

  const visible = patients.filter(p => {
    const matchesFilter = filter === 'all'
      || (filter === 'active' && p.is_active)
      || (filter === 'inactive' && !p.is_active)
    const q = search.toLowerCase()
    const matchesSearch = !q || [p.full_name, p.email, p.phone, p.gov_id_type_display]
      .some(v => v?.toLowerCase().includes(q))
    return matchesFilter && matchesSearch
  })

  const totalActive   = patients.filter(p => p.is_active).length
  const totalInactive = patients.filter(p => !p.is_active).length

  const genderIcon = { Male: '♂️', Female: '♀️', Other: 'O' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-400 mt-0.5">{patients.length} total · {totalActive} active · {totalInactive} inactive</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all">
          <span className="text-lg leading-none">+</span> Register Patient
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            placeholder="Search name, email, phone…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {['all', 'active', 'inactive'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors
                ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <Spinner /> : visible.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-2">🏥</p>
            <p className="font-medium text-gray-600">No patients found</p>
            <p className="text-sm mt-1">{search || filter !== 'all' ? 'Try adjusting your search or filters.' : 'Register your first patient to get started.'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">ID Type</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Gender</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map(patient => (
                <tr key={patient.id} className="hover:bg-green-50/40 transition-colors cursor-pointer group" onClick={() => openDetail(patient)}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {patient.full_name?.[0] || 'P'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{patient.full_name}</p>
                        <p className="text-xs text-gray-400 truncate">{patient.email || patient.phone || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{patient.gov_id_type_display}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 hidden lg:table-cell">{patient.phone || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600 hidden lg:table-cell">
                    {patient.gender ? `${genderIcon[patient.gender] || ''} ${patient.gender}` : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${patient.is_active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${patient.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {patient.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={e => { e.stopPropagation(); openDetail(patient) }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && visible.length > 0 && (
        <p className="text-xs text-gray-400 text-right">Showing {visible.length} of {patients.length} patients</p>
      )}

      <AddPatientModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={handleAdded} />
      <PatientDetailModal
        patient={selected} open={showDetail}
        onClose={() => { setShowDetail(false); setSelected(null) }}
      />
    </div>
  )
}