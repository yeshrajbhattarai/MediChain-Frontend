// src/pages/admin/Technicians.jsx
// APIs:
//   GET  /api/v1/staff/technicians/         — list all technicians
//   POST /api/v1/staff/technicians/         — add new technician
//   GET  /api/v1/staff/technicians/<uuid>/  — view technician detail
//   POST /api/v1/staff/technicians/<uuid>/  — toggle active / inactive

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

function Badge({ status }) {
  const active = status === 'active'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
      ${active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
               : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-400'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

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

function AddTechnicianModal({ open, onClose, onAdded }) {
  const blank = { full_name: '', email: '', phone: '', employee_id: '' }
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: undefined })) }

  async function handleSubmit() {
    setLoading(true); setErrors({}); setSuccess('')
    try {
      const res = await api('/staff/technicians/', { method: 'POST', body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setErrors(data.errors || { general: 'Something went wrong.' }); return }
      setSuccess(`${data.technician.full_name} added successfully.`)
      setForm(blank); onAdded(data.technician); setTimeout(onClose, 1500)
    } catch { setErrors({ general: 'Network error. Try again.' }) }
    finally { setLoading(false) }
  }

  const inputCls = key =>
    `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors
     ${errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'}`

  return (
    <Modal open={open} onClose={onClose} title="Add New Technician">
      <div className="space-y-4">
        {errors.general && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">{errors.general}</div>}
        {success && <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg border border-emerald-200">{success}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
            <input className={inputCls('full_name')} placeholder="Rahul Mehta"
              value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            {errors.full_name && <p className="text-xs text-red-500 mt-0.5">{errors.full_name}</p>}
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
            <input type="email" className={inputCls('email')} placeholder="tech@hospital.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
            {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Phone *</label>
            <input className={inputCls('phone')} placeholder="9876543210" maxLength={10}
              value={form.phone} onChange={e => set('phone', e.target.value)} />
            {errors.phone && <p className="text-xs text-red-500 mt-0.5">{errors.phone}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Employee ID *</label>
            <input className={inputCls('employee_id')} placeholder="TECH-001"
              value={form.employee_id} onChange={e => set('employee_id', e.target.value)} />
            {errors.employee_id && <p className="text-xs text-red-500 mt-0.5">{errors.employee_id}</p>}
          </div>
        </div>

        <p className="text-xs text-gray-400">Login credentials will be sent to the technician's email automatically.</p>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium">
            {loading ? 'Adding…' : 'Add Technician'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function TechnicianDetailModal({ technician, open, onClose, onToggled }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [toggleMsg, setToggleMsg] = useState('')
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!open || !technician) return
    if (hasFetched.current) return
    hasFetched.current = true
    setLoading(true)
    api(`/staff/technicians/${technician.id}/`).then(r => r.json()).then(setDetail).catch(() => {}).finally(() => setLoading(false))
  }, [open, technician])

  function handleClose() { hasFetched.current = false; setDetail(null); setToggleMsg(''); onClose() }

  async function handleToggle() {
    setToggling(true); setToggleMsg('')
    try {
      const res = await api(`/staff/technicians/${technician.id}/`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setToggleMsg(data.message)
        const updated = { ...detail, status: data.status }
        setDetail(updated); onToggled(updated)
      }
    } catch { setToggleMsg('Failed to update. Try again.') }
    finally { setToggling(false) }
  }

  const d = detail || technician || {}

  return (
    <Modal open={open} onClose={handleClose} title="Technician Profile" width="max-w-xl">
      {loading ? <Spinner /> : (
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
              {d.full_name?.[0] || 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{d.full_name}</p>
              <p className="text-sm text-gray-500">Lab Technician · {d.hospital_name}</p>
              <div className="mt-1"><Badge status={d.status} /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Email"         value={d.email}         half />
            <Field label="Phone"         value={d.phone}         half />
            <Field label="Employee ID"   value={d.employee_id}   half />
            <Field label="Gender"        value={d.gender}        half />
            <Field label="Date of Birth" value={d.date_of_birth} half />
            <Field label="Experience"    value={d.years_experience ? `${d.years_experience} yrs` : null} half />
            <Field label="License No."   value={d.license_number} half />
            <Field label="Hospital"      value={d.hospital_name}  half />
            <Field label="Home Address"  value={d.home_address} />
            {d.bio && <Field label="Bio" value={d.bio} />}
          </div>

          <p className="text-xs text-gray-400">
            Joined {d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </p>

          {toggleMsg && <p className="text-sm text-center text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">{toggleMsg}</p>}

          <div className="flex gap-2 pt-1 border-t border-gray-100">
            <button onClick={handleClose} className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Close</button>
            <button onClick={handleToggle} disabled={toggling}
              className={`flex-1 px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-60
                ${d.status === 'active'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}>
              {toggling ? 'Updating…' : d.status === 'active' ? 'Deactivate Technician' : 'Activate Technician'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default function Technicians() {
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')
  const [showAdd, setShowAdd]         = useState(false)
  const [selected, setSelected]       = useState(null)
  const [showDetail, setShowDetail]   = useState(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchTechnicians()
  }, [])

  async function fetchTechnicians() {
    setLoading(true)
    try {
      const res = await api('/staff/technicians/')
      const data = await res.json()
      setTechnicians(Array.isArray(data) ? data : [])
    } catch { setTechnicians([]) }
    finally { setLoading(false) }
  }

  function handleAdded(t) { setTechnicians(prev => [t, ...prev]) }
  function handleToggled(updated) {
    setTechnicians(prev => prev.map(t => t.id === updated.id ? { ...t, status: updated.status } : t))
  }
  function openDetail(t) { setSelected(t); setShowDetail(true) }

  const visible = technicians.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter
    const q = search.toLowerCase()
    const matchesSearch = !q || [t.full_name, t.email, t.employee_id, t.phone].some(v => v?.toLowerCase().includes(q))
    return matchesFilter && matchesSearch
  })

  const totalActive   = technicians.filter(t => t.status === 'active').length
  const totalInactive = technicians.filter(t => t.status === 'inactive').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Technicians</h1>
          <p className="text-sm text-gray-400 mt-0.5">{technicians.length} total · {totalActive} active · {totalInactive} inactive</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all">
          <span className="text-lg leading-none">+</span> Add Technician
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            placeholder="Search name, email, employee ID…"
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
            <p className="text-3xl mb-2">🔬</p>
            <p className="font-medium text-gray-600">No technicians found</p>
            <p className="text-sm mt-1">{search || filter !== 'all' ? 'Try adjusting your search or filters.' : 'Add your first technician to get started.'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Technician</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Employee ID</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map(tech => (
                <tr key={tech.id} className="hover:bg-amber-50/40 transition-colors cursor-pointer group" onClick={() => openDetail(tech)}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {tech.full_name?.[0] || 'T'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{tech.full_name}</p>
                        <p className="text-xs text-gray-400 truncate">{tech.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs hidden lg:table-cell">{tech.employee_id}</td>
                  <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">{tech.phone}</td>
                  <td className="px-5 py-3.5"><Badge status={tech.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={e => { e.stopPropagation(); openDetail(tech) }}
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
        <p className="text-xs text-gray-400 text-right">Showing {visible.length} of {technicians.length} technicians</p>
      )}

      <AddTechnicianModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={handleAdded} />
      <TechnicianDetailModal
        technician={selected} open={showDetail}
        onClose={() => { setShowDetail(false); setSelected(null) }}
        onToggled={handleToggled}
      />
    </div>
  )
}
