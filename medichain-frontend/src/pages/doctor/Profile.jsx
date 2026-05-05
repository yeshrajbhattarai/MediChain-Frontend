// src/pages/doctor/Profile.jsx
// APIs:
//   GET   /api/v1/staff/doctor/profile/                    — fetch profile
//   PATCH /api/v1/staff/doctor/profile/update-personal/    — update personal details
//   PATCH /api/v1/staff/doctor/profile/update-password/    — change password

import { useEffect, useState } from 'react'
import {
  User, Mail, Phone, Stethoscope, Award,
  MapPin, FileText, Lock, Pencil, Check,
  X, Eye, EyeOff, AlertCircle, CheckCircle2
} from 'lucide-react'
import { getAccessToken } from '../../auth_store/authStore'

const BASE = 'http://localhost:8000/api/v1'

const api = (url, opts = {}) =>
  fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
      ...opts.headers,
    },
  })

// ─── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium
      ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  )
}

// ─── Reusable sub-components ───────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 font-medium truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

function EditField({ label, name, value, onChange, type = 'text', placeholder = '', as }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {as === 'textarea' ? (
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
            placeholder:text-gray-300 transition-all resize-none" />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
            placeholder:text-gray-300 transition-all" />
      )}
    </div>
  )
}

function Card({ title, subtitle, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DoctorProfile() {
  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState(null)

  // personal edit
  const [editPersonal, setEditPersonal] = useState(false)
  const [form, setForm] = useState({
    date_of_birth: '', gender: '', years_experience: '',
    license_number: '', home_address: '', bio: '',
  })
  const [savingPersonal, setSavingPersonal] = useState(false)

  // password
  const [showPwd, setShowPwd]   = useState(false)
  const [pwd, setPwd] = useState({ current_password: '', new_password: '', confirm_new_password: '' })
  const [savingPwd, setSavingPwd] = useState(false)
  const [showCur, setShowCur]   = useState(false)
  const [showNew, setShowNew]   = useState(false)

  const toast$ = (msg, type = 'ok') => setToast({ msg, type })

  useEffect(() => {
    api('/staff/doctor/profile/')
      .then(r => r.json())
      .then(d => {
        setProfile(d)
        setForm({
          date_of_birth:    d.date_of_birth    || '',
          gender:           d.gender           || '',
          years_experience: d.years_experience || '',
          license_number:   d.license_number   || '',
          home_address:     d.home_address     || '',
          bio:              d.bio              || '',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const savePersonal = async () => {
    setSavingPersonal(true)
    try {
      const r = await api('/staff/doctor/profile/update-personal/', {
        method: 'PATCH',
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (!r.ok) { toast$(d.error || 'Failed to save', 'err'); return }
      setProfile(d.doctor)
      setEditPersonal(false)
      toast$('Profile updated')
    } finally { setSavingPersonal(false) }
  }

  const savePassword = async () => {
    if (pwd.new_password !== pwd.confirm_new_password) {
      toast$('Passwords do not match', 'err'); return
    }
    setSavingPwd(true)
    try {
      const r = await api('/staff/doctor/profile/update-password/', {
        method: 'PATCH',
        body: JSON.stringify(pwd),
      })
      const d = await r.json()
      if (!r.ok) { toast$(d.error || 'Failed', 'err'); return }
      setPwd({ current_password: '', new_password: '', confirm_new_password: '' })
      setShowPwd(false)
      toast$('Password changed')
    } finally { setSavingPwd(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!profile) return <p className="text-red-500 p-4">Failed to load profile.</p>

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Stethoscope size={14} /><span>/</span>
        <span className="text-gray-700 font-medium">Profile</span>
      </div>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold shrink-0">
          {profile.full_name?.[0] || 'D'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 truncate">{profile.full_name}</h1>
          <p className="text-sm text-gray-400">{profile.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
              {profile.status?.toUpperCase() || 'ACTIVE'}
            </span>
            {profile.specialization && (
              <span className="text-xs text-gray-400">{profile.specialization}</span>
            )}
            {profile.hospital_name && (
              <span className="text-xs text-gray-400">{profile.hospital_name}</span>
            )}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 shrink-0 text-center">
          <div>
            <p className="text-xl font-bold text-emerald-600">{profile.years_experience || '—'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Yrs Exp.</p>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div>
            <p className="text-xl font-bold text-gray-800">{profile.employee_id || '—'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Emp ID</p>
          </div>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* LEFT — static info */}
        <div className="flex flex-col gap-5">
          <Card title="Basic Information" subtitle="Managed by hospital admin">
            <InfoRow icon={User}       label="Full Name"      value={profile.full_name} />
            <InfoRow icon={Mail}       label="Email"          value={profile.email} />
            <InfoRow icon={Phone}      label="Phone"          value={profile.phone} />
            <InfoRow icon={Stethoscope}label="Specialization" value={profile.specialization} />
            <InfoRow icon={Award}      label="Employee ID"    value={profile.employee_id} />
          </Card>
        </div>

        {/* RIGHT — editable info */}
        <div className="flex flex-col gap-5">
          <Card
            title="Personal Details"
            subtitle="You can update these anytime"
            action={
              !editPersonal
                ? <button onClick={() => setEditPersonal(true)}
                    className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    <Pencil size={12} /> Edit
                  </button>
                : <div className="flex items-center gap-2">
                    <button onClick={() => setEditPersonal(false)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                      <X size={14} />
                    </button>
                    <button onClick={savePersonal} disabled={savingPersonal}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60">
                      <Check size={12} /> {savingPersonal ? 'Saving…' : 'Save'}
                    </button>
                  </div>
            }
          >
            {!editPersonal ? (
              <>
                <InfoRow icon={User}     label="Gender"          value={profile.gender} />
                <InfoRow icon={FileText} label="Date of Birth"   value={profile.date_of_birth} />
                <InfoRow icon={Award}    label="Experience"      value={profile.years_experience ? `${profile.years_experience} years` : null} />
                <InfoRow icon={Award}    label="License No."     value={profile.license_number} />
                <InfoRow icon={MapPin}   label="Home Address"    value={profile.home_address} />
                {profile.bio && <InfoRow icon={FileText} label="Bio" value={profile.bio} />}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 py-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Gender</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select…</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <EditField label="Date of Birth" name="date_of_birth" type="date"
                  value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} />
                <EditField label="Experience (yrs)" name="years_experience" placeholder="e.g. 5"
                  value={form.years_experience} onChange={e => setForm(f => ({ ...f, years_experience: e.target.value }))} />
                <EditField label="License No." name="license_number" placeholder="MED/2024/XXX"
                  value={form.license_number} onChange={e => setForm(f => ({ ...f, license_number: e.target.value }))} />
                <div className="col-span-2">
                  <EditField label="Home Address" name="home_address" placeholder="123, Street, City"
                    value={form.home_address} onChange={e => setForm(f => ({ ...f, home_address: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <EditField label="Bio" name="bio" as="textarea" placeholder="Tell patients about yourself…"
                    value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                </div>
              </div>
            )}
          </Card>

          {/* Change Password */}
          <Card
            title="Change Password"
            subtitle="Min. 8 characters"
            action={
              !showPwd
                ? <button onClick={() => setShowPwd(true)}
                    className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    <Lock size={12} /> Change
                  </button>
                : <button onClick={() => setShowPwd(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <X size={14} />
                  </button>
            }
          >
            {!showPwd
              ? <p className="text-sm text-gray-400 py-4">Click "Change" to update your password.</p>
              : (
                <div className="flex flex-col gap-3 py-4">
                  {/* Current */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Password</label>
                    <div className="relative">
                      <input type={showCur ? 'text' : 'password'} value={pwd.current_password}
                        onChange={e => setPwd(p => ({ ...p, current_password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                      <button onClick={() => setShowCur(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showCur ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* New */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Password</label>
                    <div className="relative">
                      <input type={showNew ? 'text' : 'password'} value={pwd.new_password}
                        onChange={e => setPwd(p => ({ ...p, new_password: e.target.value }))}
                        placeholder="Min. 8 characters"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                      <button onClick={() => setShowNew(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirm New Password</label>
                    <input type="password" value={pwd.confirm_new_password}
                      onChange={e => setPwd(p => ({ ...p, confirm_new_password: e.target.value }))}
                      placeholder="Repeat new password"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>

                  <button onClick={savePassword} disabled={savingPwd}
                    className="self-start flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors mt-1">
                    <Lock size={13} /> {savingPwd ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              )
            }
          </Card>
        </div>
      </div>
    </div>
  )
}