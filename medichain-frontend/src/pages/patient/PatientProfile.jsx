// src/pages/patient/Profile.jsx
// GET  /api/v1/patient/profile/
// PATCH /api/v1/patient/profile/
// PATCH /api/v1/patient/profile/update-password/

import { useEffect, useState } from 'react'
import { getAccessToken } from '../../auth_store/authStore'

const BASE = 'http://localhost:8000/api/v1'
const authFetch = (url, opts = {}) =>
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
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function PatientProfile() {
  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState({ type: '', text: '' })
  const [form, setForm]           = useState({})
  const [pwForm, setPwForm]       = useState({ current_password: '', new_password: '', confirm_new_password: '' })
  const [pwMsg, setPwMsg]         = useState({ type: '', text: '' })
  const [pwSaving, setPwSaving]   = useState(false)
  const [tab, setTab]             = useState('info') // 'info' | 'password'

  useEffect(() => {
    authFetch('/patient/profile/')
      .then(r => r.json())
      .then(d => {
        setProfile(d)
        const p = d.patient || {}
        setForm({
          full_name:    p.full_name || '',
          email:        p.email     || '',
          phone:        p.phone     || '',
          address:      p.address   || '',
          gender:       p.gender    || '',
          date_of_birth: p.date_of_birth || '',
          blood_group:  p.blood_group || '',
          gov_id_type:  d.gov_id?.type || '',
          gov_id_number: '',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true); setMsg({ type: '', text: '' })
    try {
      const res  = await authFetch('/patient/profile/', {
        method: 'PATCH',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setMsg({ type: 'success', text: 'Profile updated successfully.' })
        // refresh
        const refresh = await authFetch('/patient/profile/').then(r => r.json())
        setProfile(refresh)
      } else {
        const errs = data.errors || {}
        const first = Object.values(errs)[0]
        setMsg({ type: 'error', text: Array.isArray(first) ? first[0] : first || 'Update failed.' })
      }
    } catch { setMsg({ type: 'error', text: 'Network error.' }) }
    finally { setSaving(false) }
  }

  async function handlePasswordSave() {
    setPwSaving(true); setPwMsg({ type: '', text: '' })
    try {
      const res  = await authFetch('/patient/profile/update-password/', {
        method: 'PATCH',
        body: JSON.stringify(pwForm),
      })
      const data = await res.json()
      if (data.success) {
        setPwMsg({ type: 'success', text: 'Password updated successfully.' })
        setPwForm({ current_password: '', new_password: '', confirm_new_password: '' })
      } else {
        setPwMsg({ type: 'error', text: data.error || 'Failed to update password.' })
      }
    } catch { setPwMsg({ type: 'error', text: 'Network error.' }) }
    finally { setPwSaving(false) }
  }

  if (loading) return <Spinner />

  const patient    = profile?.patient || {}
  const govId      = profile?.gov_id || {}
  const missing    = profile?.missing_fields || []
  const completion = profile?.profile_completion_percent || 0

  const inp = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100 transition-colors'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your personal information and access settings.</p>
      </div>

      {/* Completion bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Profile Completion</p>
          <span className={`text-sm font-bold ${completion === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{completion}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${completion === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${completion}%` }} />
        </div>
        {missing.length > 0 && (
          <p className="text-xs text-amber-600 mt-2">Missing: {missing.join(', ')}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {[['info', '👤 Personal Info'], ['password', '🔒 Password']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
                ${tab === key ? 'text-teal-600 border-teal-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'info' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">

          {msg.text && (
            <div className={`text-sm px-3 py-2 rounded-lg border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {msg.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
              <input className={inp} value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
              <input className={inp} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
              <input className={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Gender</label>
              <select className={inp} value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">Select…</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Date of Birth</label>
              <input className={inp} type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Blood Group</label>
              <select className={inp} value={form.blood_group} onChange={e => setForm(f => ({ ...f, blood_group: e.target.value }))}>
                <option value="">Select…</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Address</label>
            <textarea className={inp + ' resize-none'} rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>

          {/* Gov ID — locked once set */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-3">Government ID {govId.locked && <span className="text-teal-600">(Locked)</span>}</p>
            {govId.locked ? (
              <div className="bg-gray-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 capitalize">{govId.type}:</span>
                <span className="font-mono text-sm text-gray-500">{govId.number_masked}</span>
                <span className="ml-auto text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Verified</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">ID Type</label>
                  <select className={inp} value={form.gov_id_type} onChange={e => setForm(f => ({ ...f, gov_id_type: e.target.value }))}>
                    <option value="">Select…</option>
                    <option value="aadhar">Aadhar</option>
                    <option value="voter">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">ID Number</label>
                  <input className={inp} placeholder="Enter ID number" value={form.gov_id_number} onChange={e => setForm(f => ({ ...f, gov_id_number: e.target.value }))} />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60 font-medium transition-colors">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {tab === 'password' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          {pwMsg.text && (
            <div className={`text-sm px-3 py-2 rounded-lg border ${pwMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {pwMsg.text}
            </div>
          )}
          {['current_password', 'new_password', 'confirm_new_password'].map(key => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-500 mb-1 block capitalize">{key.replace(/_/g, ' ')}</label>
              <input className={inp} type="password" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="flex justify-end">
            <button onClick={handlePasswordSave} disabled={pwSaving}
              className="px-5 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60 font-medium transition-colors">
              {pwSaving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}