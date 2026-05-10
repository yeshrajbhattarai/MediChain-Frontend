// src/pages/doctor/Profile.jsx
// PRODUCTION READY — All 3 APIs integrated
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
import { fetchWithAuth } from '../../api/client'

const api = (url, opts = {}) =>
  fetchWithAuth(`/api/v1${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  })

// ─── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [onDone])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-4
      ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  )
}

// ─── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── Info Row (read-only display) ──────────────────────────────────────────────

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

// ─── Edit Field (form input) ────────────────────────────────────────────────────

function EditField({ label, name, value, onChange, type = 'text', placeholder = '', as, error }) {
  const inputClass = `w-full border ${
    error ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-gray-200 focus:ring-emerald-500'
  } rounded-lg px-3 py-2.5 text-sm text-gray-800
    focus:outline-none focus:ring-2 focus:border-transparent
    placeholder:text-gray-300 transition-all`

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {as === 'textarea' ? (
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={3}
          className={`${inputClass} resize-none`} />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className={inputClass} />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Card (section container) ──────────────────────────────────────────────────

function Card({ title, subtitle, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
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
  // State: profile data
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // State: personal edit form
  const [editPersonal, setEditPersonal] = useState(false)
  const [form, setForm] = useState({
    date_of_birth: '',
    gender: '',
    years_experience: '',
    license_number: '',
    home_address: '',
    bio: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [savingPersonal, setSavingPersonal] = useState(false)

  // State: password form
  const [showPwd, setShowPwd] = useState(false)
  const [pwd, setPwd] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  })
  const [pwdErrors, setPwdErrors] = useState({})
  const [savingPwd, setSavingPwd] = useState(false)
  const [showCur, setShowCur] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const toast$ = (msg, type = 'ok') => setToast({ msg, type })

  // ── Fetch profile on mount ──────────────────────────────────────────────────

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const r = await api('/staff/doctor/profile/')
        const d = await r.json()
        if (!r.ok) {
          toast$('Failed to load profile', 'err')
          return
        }
        setProfile(d)
        setForm({
          date_of_birth: d.date_of_birth || '',
          gender: d.gender || '',
          years_experience: d.years_experience || '',
          license_number: d.license_number || '',
          home_address: d.home_address || '',
          bio: d.bio || '',
        })
      } catch (err) {
        console.error('Profile fetch error:', err)
        toast$('Network error', 'err')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // ── Save personal details ───────────────────────────────────────────────────

  const validatePersonal = () => {
    const errors = {}
    if (form.years_experience && isNaN(parseInt(form.years_experience))) {
      errors.years_experience = 'Must be a number'
    }
    return errors
  }

  const savePersonal = async () => {
    const errors = validatePersonal()
    if (Object.keys(errors).length) {
      setFormErrors(errors)
      return
    }

    setSavingPersonal(true)
    setFormErrors({})
    try {
      const r = await api('/staff/doctor/profile/update-personal/', {
        method: 'PATCH',
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (!r.ok) {
        const errMsg = d.error || d.message || 'Failed to save'
        toast$(errMsg, 'err')
        if (d.errors) setFormErrors(d.errors)
        return
      }
      setProfile(d.doctor || d)
      setEditPersonal(false)
      toast$('Profile updated successfully')
    } catch (err) {
      console.error('Save personal error:', err)
      toast$('Network error', 'err')
    } finally {
      setSavingPersonal(false)
    }
  }

  // ── Save password ───────────────────────────────────────────────────────────

  const validatePassword = () => {
    const errors = {}
    if (!pwd.current_password) errors.current_password = 'Required'
    if (!pwd.new_password) errors.new_password = 'Required'
    if (pwd.new_password.length < 8) errors.new_password = 'Min. 8 characters'
    if (!pwd.confirm_new_password) errors.confirm_new_password = 'Required'
    if (pwd.new_password !== pwd.confirm_new_password) {
      errors.confirm_new_password = 'Passwords do not match'
    }
    return errors
  }

  const savePassword = async () => {
    const errors = validatePassword()
    if (Object.keys(errors).length) {
      setPwdErrors(errors)
      return
    }

    setSavingPwd(true)
    setPwdErrors({})
    try {
      const r = await api('/staff/doctor/profile/update-password/', {
        method: 'PATCH',
        body: JSON.stringify(pwd),
      })
      const d = await r.json()
      if (!r.ok) {
        const errMsg = d.error || d.message || 'Failed to update password'
        toast$(errMsg, 'err')
        if (d.errors) setPwdErrors(d.errors)
        return
      }
      setPwd({ current_password: '', new_password: '', confirm_new_password: '' })
      setShowPwd(false)
      setShowCur(false)
      setShowNew(false)
      toast$('Password updated successfully')
    } catch (err) {
      console.error('Save password error:', err)
      toast$('Network error', 'err')
    } finally {
      setSavingPwd(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <Spinner />
  if (!profile) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-3">⚠️</p>
      <p className="font-semibold text-gray-700">Failed to load profile</p>
      <button onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
        Retry
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Stethoscope size={14} />
        <span>/</span>
        <span className="text-gray-700 font-medium">Profile</span>
      </div>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold shrink-0">
          {profile.full_name?.[0] || 'D'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 truncate">{profile.full_name}</h1>
          <p className="text-sm text-gray-400 truncate">{profile.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              profile.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {profile.status?.toUpperCase() || 'ACTIVE'}
            </span>
            {profile.specialization && (
              <span className="text-xs text-gray-400">{profile.specialization}</span>
            )}
            {profile.hospital_name && (
              <span className="text-xs text-gray-400"> {profile.hospital_name}</span>
            )}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 shrink-0 text-center">
          {profile.years_experience && (
            <>
              <div>
                <p className="text-xl font-bold text-emerald-600">{profile.years_experience}</p>
                <p className="text-xs text-gray-400 mt-0.5">Yrs Exp.</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
            </>
          )}
          <div>
            <p className="text-xl font-bold text-gray-800">{profile.employee_id || '—'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Emp ID</p>
          </div>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* LEFT — Static info (read-only) */}
        <div className="flex flex-col gap-5">
          <Card title="Basic Information" subtitle="Managed by hospital admin">
            <InfoRow icon={User} label="Full Name" value={profile.full_name} />
            <InfoRow icon={Mail} label="Email" value={profile.email} />
            <InfoRow icon={Phone} label="Phone" value={profile.phone} />
            <InfoRow icon={Stethoscope} label="Specialization" value={profile.specialization} />
            <InfoRow icon={Award} label="Employee ID" value={profile.employee_id} />
          </Card>
        </div>

        {/* RIGHT — Editable sections */}
        <div className="flex flex-col gap-5">

          {/* Personal Details Card */}
          <Card
            title="Personal Details"
            subtitle="You can update these anytime"
            action={
              !editPersonal ? (
                <button
                  onClick={() => setEditPersonal(true)}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditPersonal(false)
                      setFormErrors({})
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <button
                    onClick={savePersonal}
                    disabled={savingPersonal}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Check size={12} /> {savingPersonal ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )
            }
          >
            {!editPersonal ? (
              <>
                <InfoRow icon={User} label="Gender" value={profile.gender} />
                <InfoRow icon={FileText} label="Date of Birth" value={profile.date_of_birth} />
                <InfoRow icon={Award} label="Years of Experience" value={profile.years_experience ? `${profile.years_experience} years` : null} />
                <InfoRow icon={Award} label="License Number" value={profile.license_number} />
                <InfoRow icon={MapPin} label="Home Address" value={profile.home_address} />
                {profile.bio && <InfoRow icon={FileText} label="Bio" value={profile.bio} />}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 py-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select…</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <EditField
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                  error={formErrors.date_of_birth}
                />

                <EditField
                  label="Years of Experience"
                  name="years_experience"
                  placeholder="e.g. 5"
                  value={form.years_experience}
                  onChange={e => setForm(f => ({ ...f, years_experience: e.target.value }))}
                  error={formErrors.years_experience}
                />

                <EditField
                  label="License Number"
                  name="license_number"
                  placeholder="e.g. MED/2024/XXX"
                  value={form.license_number}
                  onChange={e => setForm(f => ({ ...f, license_number: e.target.value }))}
                  error={formErrors.license_number}
                />

                <div className="col-span-2">
                  <EditField
                    label="Home Address"
                    name="home_address"
                    placeholder="123, Street, City, State, PIN"
                    value={form.home_address}
                    onChange={e => setForm(f => ({ ...f, home_address: e.target.value }))}
                    error={formErrors.home_address}
                  />
                </div>

                <div className="col-span-2">
                  <EditField
                    label="Bio"
                    name="bio"
                    as="textarea"
                    placeholder="Tell patients about yourself…"
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    error={formErrors.bio}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Change Password Card */}
          <Card
            title="Change Password"
            subtitle="Min. 8 characters"
            action={
              !showPwd ? (
                <button
                  onClick={() => setShowPwd(true)}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  <Lock size={12} /> Change
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowPwd(false)
                    setPwdErrors({})
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={14} />
                </button>
              )
            }
          >
            {!showPwd ? (
              <p className="text-sm text-gray-400 py-4">Click "Change" to update your password.</p>
            ) : (
              <div className="flex flex-col gap-3 py-4">
                {/* Current Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCur ? 'text' : 'password'}
                      value={pwd.current_password}
                      onChange={e => setPwd(p => ({ ...p, current_password: e.target.value }))}
                      placeholder="••••••••"
                      className={`w-full border ${
                        pwdErrors.current_password ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                    />
                    <button
                      onClick={() => setShowCur(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showCur ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {pwdErrors.current_password && (
                    <p className="text-xs text-red-500">{pwdErrors.current_password}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={pwd.new_password}
                      onChange={e => setPwd(p => ({ ...p, new_password: e.target.value }))}
                      placeholder="Min. 8 characters"
                      className={`w-full border ${
                        pwdErrors.new_password ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      } rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                    />
                    <button
                      onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {pwdErrors.new_password && (
                    <p className="text-xs text-red-500">{pwdErrors.new_password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={pwd.confirm_new_password}
                    onChange={e => setPwd(p => ({ ...p, confirm_new_password: e.target.value }))}
                    placeholder="Repeat new password"
                    className={`w-full border ${
                      pwdErrors.confirm_new_password ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    } rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  />
                  {pwdErrors.confirm_new_password && (
                    <p className="text-xs text-red-500">{pwdErrors.confirm_new_password}</p>
                  )}
                </div>

                <button
                  onClick={savePassword}
                  disabled={savingPwd}
                  className="self-start flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors mt-2"
                >
                  <Lock size={13} /> {savingPwd ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
