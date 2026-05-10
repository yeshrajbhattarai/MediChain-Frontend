// src/pages/technician/Patients.jsx
// GET /api/v1/staff/technician/patients/
// Shows all patients assigned to this technician

import { useState, useEffect } from 'react'
import { fetchWithAuth } from '../../api/client'

const api = (url, opts = {}) =>
  fetchWithAuth(`/api${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
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

function PatientDetailModal({ patientId, open, onClose }) {
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!open || !patientId) return
    setPatient(null); setErr('')
    setLoading(true)
    api(`/v1/staff/technician/patients/${patientId}/`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setErr(data.error); return }
        setPatient(data)
      })
      .catch(() => setErr('Failed to load patient details.'))
      .finally(() => setLoading(false))
  }, [open, patientId])

  return (
    <Modal open={open} onClose={onClose} title="Patient Details" width="max-w-xl">
      {loading ? (
        <Spinner />
      ) : err ? (
        <p className="text-sm text-red-500 text-center py-8">{err}</p>
      ) : patient ? (
        <div className="space-y-5">
          <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {patient.patient?.full_name?.[0]?.toUpperCase() || 'P'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-gray-900">{patient.patient?.full_name}</h3>
              <p className="text-sm text-emerald-600 font-medium mt-0.5">
                {patient.patient?.gender || 'Not specified'} · Age {patient.patient?.age || '—'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone" value={patient.patient?.phone} />
              <Field label="Email" value={patient.patient?.email} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Address</h4>
            <Field label="Location" value={patient.patient?.address} />
          </div>

          {patient.assigned_by && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">ASSIGNED BY</p>
              <p className="text-sm font-medium text-gray-800">{patient.assigned_by?.full_name}</p>
              <p className="text-xs text-gray-400">{patient.assigned_by?.role}</p>
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

function PatientCard({ patient, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {patient.patient?.full_name?.[0]?.toUpperCase() || 'P'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{patient.patient?.full_name}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">{patient.patient?.phone}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <p className="text-xs text-gray-400">{patient.patient?.gender || 'Unknown'}</p>
        <p className="text-xs text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View →
        </p>
      </div>
    </div>
  )
}

export default function TechnicianPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients() {
    setLoading(true); setErr('')
    try {
      const res = await api('/v1/staff/technician/patients/')
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setPatients(data)
      } else {
        setErr('Failed to load patients.')
        setPatients([])
      }
    } catch {
      setErr('Network error.')
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    return !q || p.patient?.full_name?.toLowerCase().includes(q) || p.patient?.phone?.includes(q)
  })

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Patients</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Patients assigned to you for lab work and records.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200">
          {patients.length} total
        </div>
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                     focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
          placeholder="Search by name or phone…"
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
            onClick={loadPatients}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🧑‍⚕️</p>
          <p className="font-medium text-gray-600">
            {search ? 'No patients match your search.' : 'No patients assigned yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <PatientCard
              key={p.patient?.id}
              patient={p}
              onClick={() => { setSelectedId(p.patient?.id); setShowDetail(true) }}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {filtered.length} of {patients.length} patients
        </p>
      )}

      <PatientDetailModal
        patientId={selectedId}
        open={showDetail}
        onClose={() => { setShowDetail(false); setSelectedId(null) }}
      />
    </div>
  )
}
