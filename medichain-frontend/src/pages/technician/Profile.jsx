// src/pages/technician/Profile.jsx
// GET /api/v1/staff/technician/profile/
// PATCH /api/v1/staff/technician/profile/update-personal/
// PATCH /api/v1/staff/technician/profile/update-password/

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
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
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

function EditPersonalModal({ tech, open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    date_of_birth: tech?.date_of_birth || '',
    gender: tech?.gender || '',
    years_experience: tech?.years_experience || '',
    license_number: tech?.license_number || '',
    home_address: tech?.home_address || '',
    bio: tech?.bio || '',
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    setLoading(true); setErr(''); setSuccess('')
    try {
      const res = await api('/v1/staff/technician/profile/update-personal/', {
        method: 'PATCH',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Failed to update.'); return }
      setSuccess('Profile updated successfully!')
      setTimeout(() => { onSuccess(); onClose() }, 1200)
    } catch { setErr('Network error.') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Personal Details">
      <div className="space-y-4">
        {err && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
            {err}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg border border-emerald-200">
            {success}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Date of Birth</label>
          <input
            type="date"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            value={form.date_of_birth}
            onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Gender</label>
          <select
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            value={form.gender}
            onChange={e => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Years of Experience</label>
          <input
            type="number"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            value={form.years_experience}
            onChange={e => setForm({ ...form, years_experience: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">License Number</label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            value={form.license_number}
            onChange={e => setForm({ ...form, license_number: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Home Address</label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors resize-none h-20"
            value={form.home_address}
            onChange={e => setForm({ ...form, home_address: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Bio</label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors resize-none h-20"
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    if (form.new_password !== form.confirm_new_password) {
      setErr('Passwords do not match.')
      return
    }
    setLoading(true); setErr(''); setSuccess('')
    try {
      const res = await api('/v1/staff/technician/profile/update-password/', {
        method: 'PATCH',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Failed to update password.'); return }
      setSuccess('Password updated successfully!')
      setTimeout(() => onClose(), 1200)
    } catch { setErr('Network error.') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Change Password">
      <div className="space-y-4">
        {err && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
            {err}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg border border-emerald-200">
            {success}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Current Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            value={form.current_password}
            onChange={e => setForm({ ...form, current_password: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            value={form.new_password}
            onChange={e => setForm({ ...form, new_password: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Confirm Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            value={form.confirm_new_password}
            onChange={e => setForm({ ...form, confirm_new_password: e.target.value })}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium"
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function TechnicianProfile() {
  const [tech, setTech] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEditPersonal, setShowEditPersonal] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true); setErr('')
    try {
      const res = await api('/v1/staff/technician/profile/')
      const data = await res.json()
      if (res.ok) {
        setTech(data)
      } else {
        setErr('Failed to load profile.')
      }
    } catch {
      setErr('Network error.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner />
  if (err) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{err}</p>
        <button
          onClick={loadProfile}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your personal information and settings.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl font-bold">
            {tech?.full_name?.[0]?.toUpperCase() || 'T'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{tech?.full_name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{tech?.email}</p>
            <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {tech?.status === 'active' ? '✓ Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-1">EMPLOYEE ID</p>
            <p className="text-sm font-medium text-gray-800">{tech?.employee_id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">PHONE</p>
            <p className="text-sm font-medium text-gray-800">{tech?.phone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">ROLE</p>
            <p className="text-sm font-medium text-gray-800 capitalize">{tech?.role}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">HOSPITAL</p>
            <p className="text-sm font-medium text-gray-800">{tech?.hospital?.hospital_name}</p>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Personal Details</h3>
          <button
            onClick={() => setShowEditPersonal(true)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Date of Birth', value: tech?.date_of_birth || '—' },
            { label: 'Gender', value: tech?.gender || '—' },
            { label: 'Years Experience', value: tech?.years_experience || '—' },
            { label: 'License Number', value: tech?.license_number || '—' },
          ].map((field, idx) => (
            <div key={idx}>
              <p className="text-xs text-gray-400 mb-1">{field.label.toUpperCase()}</p>
              <p className="text-sm font-medium text-gray-800">{field.value}</p>
            </div>
          ))}
        </div>

        {tech?.home_address && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">HOME ADDRESS</p>
            <p className="text-sm text-gray-800">{tech.home_address}</p>
          </div>
        )}

        {tech?.bio && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">BIO</p>
            <p className="text-sm text-gray-800">{tech.bio}</p>
          </div>
        )}
      </div>

      {/* Security */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Security</h3>
        <button
          onClick={() => setShowChangePassword(true)}
          className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Change Password
        </button>
      </div>

      {/* Modals */}
      <EditPersonalModal
        tech={tech}
        open={showEditPersonal}
        onClose={() => setShowEditPersonal(false)}
        onSuccess={loadProfile}
      />
      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  )
}